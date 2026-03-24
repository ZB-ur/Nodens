import React from 'react';

interface Conflict {
  accountId: string;
  time1: string;
  time2: string;
  intervalMinutes: number;
  suggestion: string;
}

interface ConflictWarningProps {
  conflicts: Conflict[];
  onAutoFix?: () => void;
}

const ConflictWarning: React.FC<ConflictWarningProps> = ({
  conflicts,
  onAutoFix,
}) => {
  if (conflicts.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 mt-0.5">
          <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-amber-800">
            检测到 {conflicts.length} 个排期冲突
          </h4>
          <ul className="mt-2 space-y-2">
            {conflicts.map((conflict, idx) => (
              <li key={idx} className="text-sm text-amber-700">
                <p>
                  <span className="font-medium">账号 {conflict.accountId}</span>
                  {' '}的 {conflict.time1} 与 {conflict.time2} 间隔仅{' '}
                  <span className="font-medium">{conflict.intervalMinutes} 分钟</span>
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  建议：{conflict.suggestion}
                </p>
              </li>
            ))}
          </ul>
          {onAutoFix && (
            <button
              onClick={onAutoFix}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              自动调整排期
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConflictWarning;