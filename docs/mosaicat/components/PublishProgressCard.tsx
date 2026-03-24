import React from 'react';

export type PublishTaskStatus = 'queued' | 'publishing' | 'success' | 'failed' | 'pending';

export interface PublishTask {
  scheduleId: string;
  status: PublishTaskStatus;
  message: string;
  title?: string;
  progress?: number; // 0-100
  startedAt?: string;
  durationMs?: number;
  error?: {
    code: 'cookie_expired' | 'selector_not_found' | 'page_timeout' | 'anti_risk_triggered' | 'unknown';
    message: string;
    screenshotPath?: string | null;
  } | null;
  retryCount?: number;
}

export interface PublishStatusBadgeProps {
  status: PublishTaskStatus;
}

export function PublishStatusBadge({ status }: PublishStatusBadgeProps) {
  const config: Record<PublishTaskStatus, { label: string; bg: string; text: string; dot: string }> = {
    queued: { label: '排队中', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    pending: { label: '等待中', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
    publishing: { label: '发布中', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
    success: { label: '已成功', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    failed: { label: '失败', bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  };

  const c = config[status] ?? config.queued;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'publishing' ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
}

export interface PublishProgressCardProps {
  task: PublishTask;
  accountNickname: string;
  title: string;
}

export function PublishProgressCard({ task, accountNickname, title }: PublishProgressCardProps) {
  const isActive = task.status === 'publishing';
  const isFailed = task.status === 'failed';
  const isSuccess = task.status === 'success';
  const progress = task.progress ?? (isSuccess ? 100 : isActive ? 45 : 0);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const errorCodeLabels: Record<string, string> = {
    cookie_expired: 'Cookie 已过期',
    selector_not_found: '页面元素未找到',
    page_timeout: '页面加载超时',
    anti_risk_triggered: '触发风控',
    unknown: '未知错误',
  };

  return (
    <div className={`bg-white border rounded-xl p-6 shadow-sm transition-all ${
      isActive ? 'border-amber-300 ring-1 ring-amber-100' :
      isFailed ? 'border-red-200' :
      isSuccess ? 'border-emerald-200' :
      'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {accountNickname}
            </span>
          </p>
        </div>
        <PublishStatusBadge status={task.status} />
      </div>

      {/* Progress bar */}
      {(isActive || isSuccess) && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>发布进度</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isSuccess ? 'bg-emerald-500' : 'bg-blue-500'
              } ${isActive ? 'animate-pulse' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps indicator for active publishing */}
      {isActive && (
        <div className="mb-4 space-y-2">
          {[
            { label: '打开发布页面', done: progress > 15 },
            { label: '上传图片素材', done: progress > 35 },
            { label: '填写标题与正文', done: progress > 55 },
            { label: '添加话题标签', done: progress > 75 },
            { label: '确认发布', done: progress > 90 },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {step.done ? (
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : progress > (i * 20) ? (
                <svg className="w-4 h-4 text-amber-500 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />
              )}
              <span className={step.done ? 'text-gray-500' : 'text-gray-700'}>{step.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Error block */}
      {isFailed && task.error && (
        <div className="mb-4 bg-red-50 border border-red-100 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-700">
                {errorCodeLabels[task.error.code] ?? task.error.code}
              </p>
              <p className="text-xs text-red-600 mt-0.5">{task.error.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer meta */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {task.startedAt && (
            <span>开始: {new Date(task.startedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
          )}
          {task.durationMs != null && (
            <span>耗时: {formatDuration(task.durationMs)}</span>
          )}
          {(task.retryCount ?? 0) > 0 && (
            <span>重试: {task.retryCount}次</span>
          )}
        </div>

        {isFailed && (
          <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
            重试发布
          </button>
        )}
        {isSuccess && (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            发布完成
          </span>
        )}
      </div>
    </div>
  );
}

export default PublishProgressCard;