import React from 'react';

interface CookieAlert {
  accountId: string;
  nickname: string;
  status: string;
  message: string;
}

interface CookieStatusBannerProps {
  alerts: CookieAlert[];
  onAction: (accountId: string) => void;
  onDismiss: (alertId: string) => void;
}

const CookieStatusBanner: React.FC<CookieStatusBannerProps> = ({
  alerts,
  onAction,
  onDismiss,
}) => {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.accountId}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-red-800 truncate">
                  {alert.nickname}
                  <span className="ml-1.5 text-xs font-normal text-red-600">
                    {alert.message}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onAction(alert.accountId)}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
              >
                重新登录
              </button>
              <button
                onClick={() => onDismiss(alert.accountId)}
                className="rounded-lg p-1 text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                aria-label="关闭"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CookieStatusBanner;