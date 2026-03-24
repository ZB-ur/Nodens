import React from 'react';

export interface Alert {
  id: string;
  type: 'cookie_expired' | 'cookie_expiring' | 'publish_failed' | 'anti_risk_warning';
  severity: 'info' | 'warning' | 'error';
  accountId: string | null;
  message: string;
  actionUrl: string;
  createdAt: string;
  dismissedAt: string | null;
}

export interface TopBarProps {
  alerts: Alert[];
  onDismissAlert: (alertId: string) => void;
  onAlertAction: (alertId: string) => void;
}

const severityConfig = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'ℹ️',
    dot: 'bg-blue-500',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: '⚠️',
    dot: 'bg-amber-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '🔴',
    dot: 'bg-red-500',
  },
};

export const TopBar: React.FC<TopBarProps> = ({
  alerts,
  onDismissAlert,
  onAlertAction,
}) => {
  const activeAlerts = alerts.filter((a) => !a.dismissedAt);

  return (
    <header className="sticky top-0 z-30 w-full">
      {/* Alert Banners */}
      {activeAlerts.length > 0 && (
        <div className="space-y-0">
          {activeAlerts.map((alert) => {
            const config = severityConfig[alert.severity];
            return (
              <div
                key={alert.id}
                className={`${config.bg} ${config.border} border-b px-4 py-2.5 flex items-center justify-between gap-3`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm flex-shrink-0">{config.icon}</span>
                  <p className={`text-sm font-medium ${config.text} truncate`}>
                    {alert.message}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onAlertAction(alert.id)}
                    className={`text-xs font-semibold ${config.text} hover:underline`}
                  >
                    处理
                  </button>
                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className={`${config.text} opacity-60 hover:opacity-100 transition-opacity p-0.5`}
                    aria-label="关闭告警"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Mosaicat</h1>
        </div>

        {/* Center: Alert summary badge (when alerts exist) */}
        {activeAlerts.length > 0 && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg">
            {activeAlerts.some((a) => a.severity === 'error') && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {activeAlerts.filter((a) => a.severity === 'error').length} 错误
              </span>
            )}
            {activeAlerts.some((a) => a.severity === 'warning') && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 ml-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {activeAlerts.filter((a) => a.severity === 'warning').length} 警告
              </span>
            )}
          </div>
        )}

        {/* Right: User info */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-slate-50 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {activeAlerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200" />

          {/* User avatar & name */}
          <div className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 rounded-lg px-2 py-1.5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">运</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 leading-tight">运营小助手</p>
              <p className="text-xs text-gray-400 leading-tight">管理员</p>
            </div>
            <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;