import React from 'react';

export interface BadgeProps {
  count?: number;
  text?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-blue-100 text-blue-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  success: 'bg-emerald-100 text-emerald-700',
};

export const Badge: React.FC<BadgeProps> = ({
  count,
  text,
  variant = 'default',
}) => {
  const display = text ?? (count !== undefined ? (count > 99 ? '99+' : String(count)) : null);

  if (!display) return null;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold leading-none ${variantStyles[variant]}`}
    >
      {display}
    </span>
  );
};

export default Badge;