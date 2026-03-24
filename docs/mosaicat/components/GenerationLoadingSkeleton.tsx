import React, { useEffect, useState } from 'react';

interface GenerationLoadingSkeletonProps {
  estimatedTime?: number; // seconds
}

const GenerationLoadingSkeleton: React.FC<GenerationLoadingSkeletonProps> = ({
  estimatedTime = 15,
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const remaining = Math.max(0, estimatedTime - elapsed);
  const progress = Math.min((elapsed / estimatedTime) * 100, 95);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* AI Working Indicator */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500" />
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          AI 正在创作中…
        </h3>
        <p className="text-sm text-gray-600">
          {remaining > 0
            ? `预计还需 ${remaining} 秒`
            : '即将完成，请稍候…'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Skeleton Preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Body skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Hashtags skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-7 w-16 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-7 w-14 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Tip */}
      <p className="text-xs text-gray-400 text-center mt-4">
        生成过程中请勿关闭页面
      </p>
    </div>
  );
};

export default GenerationLoadingSkeleton;