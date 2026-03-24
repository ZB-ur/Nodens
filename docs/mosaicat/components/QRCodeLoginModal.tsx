import React, { useState, useEffect, useCallback, useRef } from 'react';

interface Account {
  id: string;
  platform: string;
  nickname: string;
  avatar: string;
  cookieStatus: string;
  createdAt: string;
}

interface QRLoginSession {
  sessionId: string;
  qrCodeUrl: string;
  expiresAt: string;
}

type QRLoginStatusType = 'waiting' | 'scanned' | 'confirmed' | 'expired' | 'failed';

interface QRLoginStatus {
  sessionId: string;
  status: QRLoginStatusType;
  account?: Account;
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <svg
      className={`animate-spin text-blue-600 ${sizeClasses[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

interface QRCodeLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (account: Account) => void;
}

const API_BASE = '/api/v1';
const POLL_INTERVAL = 2000;

const QRCodeLoginModal: React.FC<QRCodeLoginModalProps> = ({ open, onClose, onSuccess }) => {
  const [session, setSession] = useState<QRLoginSession | null>(null);
  const [status, setStatus] = useState<QRLoginStatusType>('waiting');
  const [countdown, setCountdown] = useState(120);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    pollRef.current = null;
    countdownRef.current = null;
  }, []);

  const initiateLogin = useCallback(async () => {
    cleanup();
    setError(null);
    setStatus('waiting');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/accounts/qr-login/initiate`, { method: 'POST' });
      if (!res.ok) throw new Error('无法获取二维码，请稍后重试');
      const data: QRLoginSession = await res.json();
      setSession(data);

      const expiresAt = new Date(data.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setCountdown(remaining);

      // Countdown timer
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setStatus('expired');
            cleanup();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Poll status
      pollRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`${API_BASE}/accounts/qr-login/${data.sessionId}/status`);
          if (!pollRes.ok) return;
          const pollData: QRLoginStatus = await pollRes.json();
          setStatus(pollData.status);

          if (pollData.status === 'confirmed' && pollData.account) {
            cleanup();
            onSuccess(pollData.account);
          } else if (pollData.status === 'expired' || pollData.status === 'failed') {
            cleanup();
          }
        } catch {
          // Silently retry on network error
        }
      }, POLL_INTERVAL);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  }, [cleanup, onSuccess]);

  useEffect(() => {
    if (open) {
      initiateLogin();
    } else {
      cleanup();
      setSession(null);
      setStatus('waiting');
      setCountdown(120);
      setError(null);
    }
    return cleanup;
  }, [open, initiateLogin, cleanup]);

  if (!open) return null;

  const formatCountdown = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const statusConfig: Record<QRLoginStatusType, { label: string; color: string; icon: string }> = {
    waiting: { label: '等待扫码', color: 'text-gray-600', icon: '📱' },
    scanned: { label: '已扫码，请在手机上确认', color: 'text-blue-600', icon: '✅' },
    confirmed: { label: '登录成功！', color: 'text-emerald-500', icon: '🎉' },
    expired: { label: '二维码已过期', color: 'text-red-500', icon: '⏰' },
    failed: { label: '登录失败，请重试', color: 'text-red-500', icon: '❌' },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold text-gray-900">扫码登录</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 flex flex-col items-center">
          <p className="text-sm text-gray-600 mb-4">打开小红书 App 扫描下方二维码</p>

          {/* QR Code Area */}
          <div className="relative w-52 h-52 rounded-xl border-2 border-gray-200 bg-slate-50 flex items-center justify-center mb-4">
            {loading ? (
              <LoadingSpinner size="lg" />
            ) : error ? (
              <div className="text-center px-4">
                <span className="text-3xl mb-2 block">⚠️</span>
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : session ? (
              <>
                <img
                  src={session.qrCodeUrl}
                  alt="登录二维码"
                  className={`w-44 h-44 ${status === 'expired' || status === 'failed' ? 'opacity-20 blur-sm' : ''}`}
                />
                {/* Overlay for expired/failed */}
                {(status === 'expired' || status === 'failed') && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl">
                    <span className="text-3xl mb-2">{currentStatus.icon}</span>
                    <p className={`text-sm font-medium ${currentStatus.color} mb-3`}>{currentStatus.label}</p>
                    <button
                      onClick={initiateLogin}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      刷新二维码
                    </button>
                  </div>
                )}
                {/* Overlay for scanned */}
                {status === 'scanned' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-xl">
                    <LoadingSpinner size="lg" className="mb-3" />
                    <p className="text-sm font-medium text-blue-600">已扫码</p>
                    <p className="text-xs text-gray-500 mt-1">请在手机上确认登录</p>
                  </div>
                )}
                {/* Overlay for confirmed */}
                {status === 'confirmed' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-emerald-500">登录成功</p>
                  </div>
                )}
              </>
            ) : null}
          </div>

          {/* Status & Countdown */}
          {status === 'waiting' && !loading && !error && (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm">{currentStatus.icon}</span>
                <span className={`text-sm font-medium ${currentStatus.color}`}>{currentStatus.label}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {countdown > 0 ? `${formatCountdown(countdown)} 后过期` : '已过期'}
                </span>
              </div>
              {/* Countdown progress bar */}
              <div className="w-40 h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 120) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Divider & help text */}
          <div className="w-full border-t border-gray-100 mt-5 pt-4">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              首次登录将自动创建账号。扫码即表示同意使用 Cookie 进行自动化操作。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeLoginModal;