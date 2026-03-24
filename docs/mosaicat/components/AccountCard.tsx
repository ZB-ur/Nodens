import React, { useState } from 'react';

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

export interface AccountCardProps {
  account: Account;
  onConfigure: (accountId: string) => void;
  onRefreshCookie: (accountId: string) => void;
  onDelete: (accountId: string) => void;
}

const platformLabels: Record<string, string> = {
  xiaohongshu: '小红书',
};

const platformIcons: Record<string, string> = {
  xiaohongshu: '📕',
};

const cookieStatusConfig: Record<
  Account['cookieStatus'],
  { color: string; dotClass: string; label: string }
> = {
  valid: { color: 'text-emerald-600', dotClass: 'bg-emerald-500', label: '正常' },
  expiring: { color: 'text-amber-600', dotClass: 'bg-amber-500', label: '即将过期' },
  expired: { color: 'text-red-600', dotClass: 'bg-red-500', label: '已过期' },
  unknown: { color: 'text-gray-400', dotClass: 'bg-gray-400', label: '未知' },
};

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onConfigure,
  onRefreshCookie,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = cookieStatusConfig[account.cookieStatus];

  const handleAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4">
      {/* Header: Avatar + Info */}
      <div className="flex items-center gap-3">
        <img
          src={account.avatar}
          alt={account.nickname}
          className="w-12 h-12 rounded-full object-cover border border-gray-200"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {account.nickname}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm">{platformIcons[account.platform]}</span>
            <span className="text-sm text-gray-600">
              {platformLabels[account.platform] ?? account.platform}
            </span>
          </div>
        </div>

        {/* More menu */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="更多操作"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-4 top-14 z-10 bg-white border border-gray-200 rounded-lg shadow-md py-1 w-36">
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => handleAction(() => onConfigure(account.id))}
            >
              配置主题
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => handleAction(() => onRefreshCookie(account.id))}
            >
              刷新 Cookie
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
              onClick={() => handleAction(() => onDelete(account.id))}
            >
              删除账号
            </button>
          </div>
        )}
      </div>

      {/* Cookie Status */}
      <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
        <div className="flex items-center gap-2">
          {/* StatusDot */}
          <span className="relative flex h-2.5 w-2.5">
            {account.cookieStatus === 'valid' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status.dotClass}`} />
          </span>
          <span className={`text-sm font-medium ${status.color}`}>
            Cookie {status.label}
          </span>
        </div>
        {account.lastCookieCheck && (
          <span className="text-xs text-gray-400">
            {new Date(account.lastCookieCheck).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      {/* Footer: Topic badge */}
      <div className="flex items-center gap-2">
        {account.topicConfigured ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            主题已配置
          </span>
        ) : (
          <button
            onClick={() => onConfigure(account.id)}
            className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9" />
            </svg>
            待配置主题
          </button>
        )}
      </div>
    </div>
  );
};

export default AccountCard;