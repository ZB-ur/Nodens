import React from 'react';

export interface Account {
  id: string;
  platform: 'xiaohongshu';
  nickname: string;
  avatar: string;
  cookieStatus: 'valid' | 'expiring' | 'expired' | 'unknown';
  lastCookieCheck: string;
  topicConfigured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AccountGridProps {
  accounts: Account[];
  onAdd: () => void;
  onConfigure: (accountId: string) => void;
  onDelete: (accountId: string) => void;
  maxAccounts?: number;
}

const COOKIE_STATUS_MAP: Record<Account['cookieStatus'], { label: string; color: string; dot: string }> = {
  valid: { label: 'Cookie 有效', color: 'text-emerald-600', dot: 'bg-emerald-500' },
  expiring: { label: '即将过期', color: 'text-amber-600', dot: 'bg-amber-500' },
  expired: { label: 'Cookie 失效', color: 'text-red-600', dot: 'bg-red-500' },
  unknown: { label: '状态未知', color: 'text-gray-400', dot: 'bg-gray-400' },
};

export const AccountGrid: React.FC<AccountGridProps> = ({
  accounts,
  onAdd,
  onConfigure,
  onDelete,
  maxAccounts = 5,
}) => {
  const canAdd = accounts.length < maxAccounts;

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">还没有账号</h3>
        <p className="mb-6 max-w-sm text-sm text-gray-600">
          添加你的小红书账号，开始自动化管理你的自媒体矩阵
        </p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          添加账号
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          矩阵账号
          <span className="ml-2 text-sm font-normal text-gray-400">
            {accounts.length}/{maxAccounts}
          </span>
        </h2>
        {canAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            添加账号
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const status = COOKIE_STATUS_MAP[account.cookieStatus];
          return (
            <div
              key={account.id}
              className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Delete button */}
              <button
                onClick={() => onDelete(account.id)}
                className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                title="删除账号"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>

              {/* Avatar + Info */}
              <div className="flex items-start gap-3">
                <img
                  src={account.avatar}
                  alt={account.nickname}
                  className="h-12 w-12 flex-shrink-0 rounded-full border border-gray-100 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-gray-900">
                    {account.nickname}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${status.dot}`} />
                    <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  小红书
                </span>
                {account.topicConfigured ? (
                  <span className="inline-flex items-center gap-1 text-emerald-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    已配置主题
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-500">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    未配置主题
                  </span>
                )}
              </div>

              {/* Action */}
              <button
                onClick={() => onConfigure(account.id)}
                className="mt-4 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                配置管理
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountGrid;