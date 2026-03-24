import React, { useEffect, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────
interface AccountOverview {
  id: string;
  nickname: string;
  platform: string;
  cookieStatus: 'valid' | 'expiring' | 'expired' | 'unknown';
  isPublishing: boolean;
}

interface TodayStats {
  total: number;
  success: number;
  failed: number;
  pending: number;
  publishing: number;
}

interface Schedule {
  id: string;
  accountId: string;
  accountNickname: string;
  draftId: string | null;
  scheduledAt: string;
  status: 'pending' | 'publishing' | 'success' | 'failed' | 'cancelled';
  imageIds: string[];
  publishLogId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DashboardOverviewData {
  accounts: AccountOverview[];
  todayStats: TodayStats;
  successRate: number;
  upcomingSchedules: Schedule[];
}

interface PublishStatsByAccount {
  accountId: string;
  nickname: string;
  published: number;
  success: number;
  failed: number;
}

interface DailyBreakdown {
  date: string;
  success: number;
  failed: number;
}

interface PublishStats {
  period: 'today' | 'week' | 'month';
  totalPublished: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  byAccount: PublishStatsByAccount[];
  dailyBreakdown: DailyBreakdown[];
}

interface DashboardOverviewProps {
  overview: DashboardOverviewData;
  stats: PublishStats;
  onAccountAction: (accountId: string, action: string) => void;
}

// ─── Sub-components ──────────────────────────────────────────

const cookieStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  valid: { label: '正常', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  expiring: { label: '即将过期', color: 'text-amber-700', bg: 'bg-amber-50' },
  expired: { label: '已过期', color: 'text-red-700', bg: 'bg-red-50' },
  unknown: { label: '未知', color: 'text-gray-500', bg: 'bg-gray-50' },
};

function AccountCard({
  account,
  onAction,
}: {
  account: AccountOverview;
  onAction: (accountId: string, action: string) => void;
}) {
  const status = cookieStatusConfig[account.cookieStatus] ?? cookieStatusConfig.unknown;

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-lg">
          📕
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{account.nickname}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${status.bg} ${status.color}`}>
              {status.label}
            </span>
            {account.isPublishing && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                发布中
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        {account.cookieStatus === 'expired' && (
          <button
            onClick={() => onAction(account.id, 'refresh-cookie')}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            更新 Cookie
          </button>
        )}
        <button
          onClick={() => onAction(account.id, 'view')}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          详情
        </button>
      </div>
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${color}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

function SuccessRateChart({ rate }: { rate: number }) {
  const pct = Math.round(rate * 100);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (rate * circumference);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">发布成功率</h3>
      <div className="flex items-center justify-center">
        <div className="relative h-32 w-32">
          <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">{pct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublishProgressCard({ schedules }: { schedules: Schedule[] }) {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const statusMap: Record<string, { dot: string; label: string }> = {
    pending: { dot: 'bg-gray-400', label: '待发布' },
    publishing: { dot: 'bg-blue-500', label: '发布中' },
    success: { dot: 'bg-emerald-500', label: '成功' },
    failed: { dot: 'bg-red-500', label: '失败' },
    cancelled: { dot: 'bg-gray-300', label: '已取消' },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">即将发布</h3>
      {schedules.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">暂无排期</p>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => {
            const st = statusMap[s.status] ?? statusMap.pending;
            return (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${st.dot}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.accountNickname}</p>
                    <p className="text-xs text-gray-500">{formatTime(s.scheduledAt)}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{st.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PublishLogTable({ stats }: { stats: PublishStats }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">账号发布统计</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-3">账号</th>
              <th className="px-6 py-3 text-right">已发布</th>
              <th className="px-6 py-3 text-right">成功</th>
              <th className="px-6 py-3 text-right">失败</th>
              <th className="px-6 py-3 text-right">成功率</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.byAccount.map((a) => {
              const rate = a.published > 0 ? Math.round((a.success / a.published) * 100) : 0;
              return (
                <tr key={a.accountId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900">{a.nickname}</td>
                  <td className="px-6 py-3 text-right text-gray-600">{a.published}</td>
                  <td className="px-6 py-3 text-right text-emerald-600">{a.success}</td>
                  <td className="px-6 py-3 text-right text-red-500">{a.failed}</td>
                  <td className="px-6 py-3 text-right">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        rate >= 80
                          ? 'bg-emerald-50 text-emerald-700'
                          : rate >= 50
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {rate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function DashboardOverview({ overview, stats, onAccountAction }: DashboardOverviewProps) {
  const { accounts, todayStats, successRate, upcomingSchedules } = overview;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">监控发布状态，查看今日统计和账号健康度</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard label="今日总计" value={todayStats.total} icon="📊" color="bg-blue-50" />
        <StatsCard label="发布成功" value={todayStats.success} icon="✅" color="bg-emerald-50" />
        <StatsCard label="发布失败" value={todayStats.failed} icon="❌" color="bg-red-50" />
        <StatsCard label="等待中" value={todayStats.pending + todayStats.publishing} icon="⏳" color="bg-amber-50" />
      </div>

      {/* Middle Row: Success Rate + Upcoming */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SuccessRateChart rate={successRate} />
        <div className="lg:col-span-2">
          <PublishProgressCard schedules={upcomingSchedules} />
        </div>
      </div>

      {/* Accounts */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">账号状态</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <AccountCard key={a.id} account={a} onAction={onAccountAction} />
          ))}
        </div>
      </div>

      {/* Publish Log Table */}
      <PublishLogTable stats={stats} />
    </div>
  );
}