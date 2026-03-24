import React, { useMemo } from 'react';

interface SuccessRateChartProps {
  rate: number;
  total: number;
  success: number;
  failed: number;
}

const SuccessRateChart: React.FC<SuccessRateChartProps> = ({
  rate,
  total,
  success,
  failed,
}) => {
  const percentage = useMemo(() => Math.round(rate * 100), [rate]);

  // SVG donut chart calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const successOffset = circumference * (1 - rate);
  const failedRate = total > 0 ? failed / total : 0;
  const failedOffset = circumference * (1 - failedRate);

  const rateColor = useMemo(() => {
    if (percentage >= 80) return { stroke: '#10b981', text: 'text-emerald-500', bg: 'bg-emerald-50' };
    if (percentage >= 50) return { stroke: '#f59e0b', text: 'text-amber-500', bg: 'bg-amber-50' };
    return { stroke: '#ef4444', text: 'text-red-500', bg: 'bg-red-50' };
  }, [percentage]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">发布成功率</h3>

      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg
            className="w-full h-full -rotate-90"
            viewBox="0 0 120 120"
          >
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="10"
            />
            {/* Failed arc */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#ef4444"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={failedOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
            {/* Success arc */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={rateColor.stroke}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={successOffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${rateColor.text}`}>
              {percentage}%
            </span>
            <span className="text-xs text-gray-400">成功率</span>
          </div>
        </div>

        {/* Stats breakdown */}
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              <span className="text-sm text-gray-600">总发布</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{total}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-sm text-gray-600">成功</span>
            </div>
            <span className="text-sm font-semibold text-emerald-600">{success}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">失败</span>
            </div>
            <span className="text-sm font-semibold text-red-500">{failed}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessRateChart;