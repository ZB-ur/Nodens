import React, { useState, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────
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
  startedAt: string | null;
  completedAt: string | null;
  durationMs: number | null;
  error: PublishLogError | null;
  retryCount: number;
  createdAt: string;
}

export interface PublishLogTableProps {
  logs: PublishLog[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onFilter: (filters: Record<string, any>) => void;
  onRetry: (scheduleId: string) => void;
}

// ─── Sub-components ──────────────────────────────────────────

const statusConfig: Record<PublishLog['status'], { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: '待发布', bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-400' },
  publishing: { label: '发布中', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  success: { label: '成功', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  failed: { label: '失败', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

function PublishStatusBadge({ status }: { status: PublishLog['status'] }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

const errorCodeLabels: Record<string, string> = {
  cookie_expired: 'Cookie 已过期',
  selector_not_found: '选择器未找到',
  page_timeout: '页面超时',
  anti_risk_triggered: '触发风控',
  unknown: '未知错误',
};

function FailureDetailPanel({ error, onClose }: { error: PublishLogError; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">失败详情</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">错误类型</p>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
              {errorCodeLabels[error.code] ?? error.code}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">错误信息</p>
            <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{error.message}</p>
          </div>
          {error.screenshotPath && (
            <div>
              <p className="text-sm text-gray-500 mb-1">失败截图</p>
              <img src={`/api/v1/publish/screenshots/${error.screenshotPath}`} alt="failure screenshot" className="rounded-lg border border-gray-200 w-full" />
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Bar ──────────────────────────────────────────────

interface FilterState {
  status: string;
  accountId: string;
  startDate: string;
  endDate: string;
}

function FilterBar({ onFilter }: { onFilter: (filters: Record<string, any>) => void }) {
  const [filters, setFilters] = useState<FilterState>({ status: '', accountId: '', startDate: '', endDate: '' });

  const handleChange = useCallback((key: keyof FilterState, value: string) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    const active: Record<string, any> = {};
    if (next.status) active.status = next.status;
    if (next.accountId) active.accountId = next.accountId;
    if (next.startDate) active.startDate = next.startDate;
    if (next.endDate) active.endDate = next.endDate;
    onFilter(active);
  }, [filters, onFilter]);

  const inputClass = 'h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select value={filters.status} onChange={(e) => handleChange('status', e.target.value)} className={inputClass}>
        <option value="">全部状态</option>
        <option value="pending">待发布</option>
        <option value="publishing">发布中</option>
        <option value="success">成功</option>
        <option value="failed">失败</option>
      </select>
      <input type="text" placeholder="账号 ID" value={filters.accountId} onChange={(e) => handleChange('accountId', e.target.value)} className={`${inputClass} w-40`} />
      <input type="date" value={filters.startDate} onChange={(e) => handleChange('startDate', e.target.value)} className={inputClass} />
      <span className="text-gray-400 text-sm">至</span>
      <input type="date" value={filters.endDate} onChange={(e) => handleChange('endDate', e.target.value)} className={inputClass} />
    </div>
  );
}

// ─── Pagination ──────────────────────────────────────────────

function Pagination({ page, pageSize, total, onPageChange }: { page: number; pageSize: number; total: number; onPageChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages: (number | '...')[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btnBase = 'flex items-center justify-center w-9 h-9 text-sm rounded-lg transition-colors';

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">共 {total} 条记录</p>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)} className={`${btnBase} text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-gray-400">…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p as number)} className={`${btnBase} ${p === page ? 'bg-blue-600 text-white font-medium shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
              {p}
            </button>
          )
        )}
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className={`${btnBase} text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function PublishLogTable({ logs, total, page, pageSize, onPageChange, onFilter, onRetry }: PublishLogTableProps) {
  const [selectedError, setSelectedError] = useState<PublishLogError | null>(null);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header & Filters */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">发布记录</h2>
          <span className="text-sm text-gray-500">{total} 条记录</span>
        </div>
        <FilterBar onFilter={onFilter} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80">
              {['笔记标题', '账号', '状态', '开始时间', '耗时', '重试', '操作'].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-sm text-gray-400">暂无发布记录</td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium max-w-[200px] truncate">{log.title}</td>
                <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{log.accountNickname}</td>
                <td className="px-6 py-4"><PublishStatusBadge status={log.status} /></td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatTime(log.startedAt)}</td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDuration(log.durationMs)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.retryCount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {log.status === 'failed' && (
                      <>
                        <button
                          onClick={() => setSelectedError(log.error)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          查看详情
                        </button>
                        <button
                          onClick={() => onRetry(log.scheduleId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          重试
                        </button>
                      </>
                    )}
                    {log.status === 'publishing' && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        执行中
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100">
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
      </div>

      {/* Failure Detail Modal */}
      {selectedError && <FailureDetailPanel error={selectedError} onClose={() => setSelectedError(null)} />}
    </div>
  );
}