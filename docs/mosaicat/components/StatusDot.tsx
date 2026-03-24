import React from 'react';

export interface StatusDotProps {
  status: 'online' | 'warning' | 'offline' | 'active';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

const statusColorMap: Record<StatusDotProps['status'], string> = {
  online: 'bg-emerald-500',
  warning: 'bg-amber-500',
  offline: 'bg-red-500',
  active: 'bg-blue-500',
};

const sizeMap: Record<NonNullable<StatusDotProps['size']>, string> = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

const pulseColorMap: Record<StatusDotProps['status'], string> = {
  online: 'bg-emerald-400',
  warning: 'bg-amber-400',
  offline: 'bg-red-400',
  active: 'bg-blue-400',
};

export const StatusDot: React.FC<StatusDotProps> = ({
  status,
  size = 'md',
  pulse,
}) => {
  const shouldPulse = pulse ?? status === 'active';

  return (
    <span className="relative inline-flex">
      {shouldPulse && (
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${pulseColorMap[status]}`}
        />
      )}
      <span
        className={`relative inline-flex rounded-full ${sizeMap[size]} ${statusColorMap[status]}`}
      />
    </span>
  );
};

export default StatusDot;