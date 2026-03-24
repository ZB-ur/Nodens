import React, { useEffect, useCallback } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

const typeConfig: Record<
  ToastProps['type'],
  { bg: string; border: string; text: string; icon: string }
> = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: '✕',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: 'ℹ',
  },
};

const iconBgMap: Record<ToastProps['type'], string> = {
  success: 'bg-emerald-500',
  error: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  duration = 3000,
  onClose,
}) => {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  const config = typeConfig[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-md animate-in slide-in-from-right ${config.bg} ${config.border}`}
      role="alert"
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-xs ${iconBgMap[type]}`}
      >
        {config.icon}
      </span>
      <p className={`text-sm font-medium ${config.text}`}>{message}</p>
      <button
        onClick={handleClose}
        className={`ml-2 shrink-0 text-sm opacity-60 hover:opacity-100 ${config.text}`}
        aria-label="关闭"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;