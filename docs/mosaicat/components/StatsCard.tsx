import React from 'react';

interface StatsCardTrend {
  direction: 'up' | 'down';
  value: string;
}

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: StatsCardTrend;
  variant?: 'default' | 'success' | 'danger' | 'warning';
}

const variantStyles: Record<string, { bg: string; text: string; iconBg: string }> = {
  default: {
    bg: 'bg-white',
    text: 'text-gray-900',
    iconBg: 'bg-blue-50 text-blue-600',
  },
  success: {
    bg: 'bg-white',
    text: 'text-gray-900',
    iconBg: 'bg-emerald-50 text-emerald-500',
  },
  danger: {
    bg: 'bg-white',
    text: 'text-gray-900',
    iconBg: 'bg-red-50 text-red-500',
  },
  warning: {
    bg: 'bg-white',
    text: 'text-gray-900',
    iconBg: 'bg-amber-50 text-amber-500',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  variant = 'default',
}) => {
  const styles = variantStyles[variant] ?? variantStyles.default;

  return (
    <div
      className={`${styles.bg} border border-gray-200 rounded-xl shadow-sm p-6 flex items-start gap-4 transition-shadow hover:shadow-md`}
    >
      {icon && (
        <div
          className={`flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${styles.iconBg}`}
        >
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${styles.text}`}>{value}</span>
          {trend && (
            <span
              className={`inline-flex items-center text-sm font-medium ${
                trend.direction === 'up' ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {trend.direction === 'up' ? (
                <svg
                  className="w-4 h-4 mr-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 mr-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;