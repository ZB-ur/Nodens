import React, { useState, useCallback } from 'react';

interface CookieImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (cookie: string, nickname?: string) => void;
  validating?: boolean;
  error?: string;
}

export const CookieImportModal: React.FC<CookieImportModalProps> = ({
  open,
  onClose,
  onImport,
  validating = false,
  error,
}) => {
  const [cookie, setCookie] = useState('');
  const [nickname, setNickname] = useState('');

  const handleSubmit = useCallback(() => {
    if (!cookie.trim()) return;
    onImport(cookie.trim(), nickname.trim() || undefined);
  }, [cookie, nickname, onImport]);

  const handleClose = useCallback(() => {
    if (validating) return;
    setCookie('');
    setNickname('');
    onClose();
  }, [validating, onClose]);

  if (!open) return null;

  const hasCookie = cookie.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">导入 Cookie</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              添加小红书账号到矩阵
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={validating}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Instructions */}
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-1.5">获取 Cookie 方法</h4>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>在浏览器中登录小红书网页版</li>
              <li>
                按 <kbd className="px-1 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[11px]">F12</kbd> 打开开发者工具
              </li>
              <li>切换到 Application → Cookies 标签</li>
              <li>复制所有 Cookie 值并粘贴到下方</li>
            </ol>
          </div>

          {/* Cookie Input */}
          <div>
            <label htmlFor="cookie-input" className="block text-sm font-medium text-gray-900 mb-1.5">
              Cookie 字符串 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="cookie-input"
              value={cookie}
              onChange={(e) => setCookie(e.target.value)}
              disabled={validating}
              placeholder="粘贴完整的 Cookie 字符串…"
              rows={4}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500 font-mono"
            />
          </div>

          {/* Nickname Input */}
          <div>
            <label htmlFor="nickname-input" className="block text-sm font-medium text-gray-900 mb-1.5">
              账号备注名 <span className="text-gray-400 font-normal">（可选）</span>
            </label>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={validating}
              placeholder="例如：美妆号01"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3">
              <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
          <button
            onClick={handleClose}
            disabled={validating}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!hasCookie || validating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {validating && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {validating ? '验证中…' : '导入账号'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieImportModal;