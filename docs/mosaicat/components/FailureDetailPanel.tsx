import React, { useState } from 'react';

export interface PublishLogError {
  code: 'cookie_expired' | 'selector_not_found' | 'page_timeout' | 'anti_risk_triggered' | 'unknown';
  message: string;
  screenshotPath?: string | null;
}

export interface PublishLog {
  id: string;
  scheduleId: string;
  accountId: string;
  accountNickname: string;
  status: 'pending' | 'publishing' | 'success' | 'failed';
  title: string;
  startedAt?: string | null;
  completedAt?: string | null;
  durationMs?: number | null;
  error?: PublishLogError | null;
  retryCount: number;
  createdAt: string;
}

interface FailureDetailPanelProps {
  log: PublishLog;
  onRetry: (scheduleId: string) => void;
}

const ERROR_CODE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  cookie_expired: { label: 'Cookie 已过期', color: 'text-red-600 bg-red-50 border-red-200', icon: '🔑' },
  selector_not_found: { label: '页面元素未找到', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: '🔍' },
  page_timeout: { label: '页面加载超时', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '⏱' },
  anti_risk_triggered: { label: '触发风控', color: 'text-red-700 bg-red-50 border-red-300', icon: '🛡' },
  unknown: { label: '未知错误', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: '❓' },
};

const ERROR_CODE_SUGGESTIONS: Record<string, string> = {
  cookie_expired: '请前往账号管理页面重新导入 Cookie 或扫码登录。',
  selector_not_found: '小红书页面结构可能已更新，请前往设置页面检查并更新选择器配置。',
  page_timeout: '可能是网络不稳定或小红书服务繁忙，建议稍后重试。',
  anti_risk_triggered: '建议增大发布间隔、减少每日发布次数，并暂停该账号 24 小时后再试。',
  unknown: '请查看截图和错误详情，如果问题持续请联系技术支持。',
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export const FailureDetailPanel: React.FC<FailureDetailPanelProps> = ({ log, onRetry }) => {
  const [retrying, setRetrying] = useState(false);

  const errorInfo = log.error
    ? ERROR_CODE_LABELS[log.error.code] || ERROR_CODE_LABELS.unknown
    : ERROR_CODE_LABELS.unknown;

  const suggestion = log.error
    ? ERROR_CODE_SUGGESTIONS[log.error.code] || ERROR_CODE_SUGGESTIONS.unknown
    : ERROR_CODE_SUGGESTIONS.unknown;

  const handleRetry = () => {
    setRetrying(true);
    onRetry(log.scheduleId);
  };

  const screenshotUrl = log.error?.screenshotPath
    ? `/api/v1/publish/screenshots/${log.error.screenshotPath}`
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">发布失败详情</h3>
            <p className="text-sm text-gray-500">
              {log.title} · {log.accountNickname}
            </p>
          </div>
        </div>
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {retrying ? '重试中...' : '重试发布'}
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Error Type Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${errorInfo.color}`}>
          <span>{errorInfo.icon}</span>
          <span>{errorInfo.label}</span>
        </div>

        {/* Error Message */}
        {log.error?.message && (
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">错误信息</p>
            <p className="text-sm text-gray-700 font-mono leading-relaxed">{log.error.message}</p>
          </div>
        )}

        {/* Timeline Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">开始时间</p>
            <p className="text-sm text-gray-700">{log.startedAt ? formatDateTime(log.startedAt) : '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">结束时间</p>
            <p className="text-sm text-gray-700">{log.completedAt ? formatDateTime(log.completedAt) : '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">耗时</p>
            <p className="text-sm text-gray-700">{log.durationMs ? formatDuration(log.durationMs) : '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">重试次数</p>
            <p className="text-sm text-gray-700">{log.retryCount} 次</p>
          </div>
        </div>

        {/* Suggestion */}
        <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800 mb-0.5">建议操作</p>
            <p className="text-sm text-blue-700">{suggestion}</p>
          </div>
        </div>

        {/* Screenshot Viewer (child component placeholder) */}
        {screenshotUrl && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">失败截图</p>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
              {/* ScreenshotViewer child component would be rendered here */}
              <img
                src={screenshotUrl}
                alt="发布失败截图"
                className="w-full max-h-96 object-contain"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FailureDetailPanel;