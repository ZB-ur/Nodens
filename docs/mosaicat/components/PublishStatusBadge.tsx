import React from 'react';

export interface PublishStatusBadgeProps {
  status: 'pending' | 'publishing' | 'success' | 'failed' | 'cancelled';
}

const statusConfig: Record<
  PublishStatusBadgeProps['status'],
  { label: string; bg: string; text: string; dot: string; pulse: boolean }
> = {
  pending: {
    label: '待发布',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400',
    pulse: false,
  },
  publishing: {
    label: '发布中',
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    pulse: true,
  },
  success: {
    label: '已发布',
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    pulse: false,
  },
  failed: {
    label: '发布失败',
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
    pulse: false,
  },
  cancelled: {
    label: '已取消',
    bg: 'bg-gray-100',
    text: 'text-gray-500',
    dot: 'bg-gray-400',
    pulse: false,
  },
};

export const PublishStatusBadge: React.FC<PublishStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className="relative inline-flex">
        {config.pulse && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dot}`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.dot}`} />
      </span>
      {config.label}
    </span>
  );
};

export default PublishStatusBadge;