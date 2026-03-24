import React, { useState } from 'react';

export interface SelectorVersion {
  id: string;
  version: string;
  comment: string;
  diff: string;
  createdAt: string;
}

export interface SelectorVersionHistoryProps {
  versions: SelectorVersion[];
  onRollback: (versionId: string) => void;
}

export const SelectorVersionHistory: React.FC<SelectorVersionHistoryProps> = ({
  versions,
  onRollback,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rollbackConfirm, setRollbackConfirm] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleRollback = (versionId: string) => {
    if (rollbackConfirm === versionId) {
      onRollback(versionId);
      setRollbackConfirm(null);
    } else {
      setRollbackConfirm(versionId);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderDiff = (diff: string) => {
    return diff.split('\n').map((line, i) => {
      let className = 'px-3 py-0.5 text-sm font-mono whitespace-pre';
      if (line.startsWith('+')) {
        className += ' bg-emerald-50 text-emerald-700';
      } else if (line.startsWith('-')) {
        className += ' bg-red-50 text-red-700';
      } else if (line.startsWith('@@')) {
        className += ' bg-blue-50 text-blue-600';
      } else {
        className += ' text-gray-500';
      }
      return (
        <div key={i} className={className}>
          {line}
        </div>
      );
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">选择器版本历史</h2>
            <p className="text-sm text-gray-600 mt-0.5">
              共 {versions.length} 个版本，点击查看 diff 详情
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {versions.length} 版本
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {versions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-gray-500 text-sm">暂无版本历史</p>
          </div>
        ) : (
          versions.map((version, index) => {
            const isCurrent = index === 0;
            const isExpanded = expandedId === version.id;
            const isConfirming = rollbackConfirm === version.id;

            return (
              <div key={version.id} className="group">
                <div
                  className="px-6 py-4 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleExpand(version.id)}
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300 bg-white'
                      }`}
                    />
                    {index < versions.length - 1 && (
                      <div className="w-px h-full bg-gray-200 mt-1 min-h-[20px]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        v{version.version}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          当前版本
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{version.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(version.createdAt)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {!isCurrent && (
                      <button
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          isConfirming
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => handleRollback(version.id)}
                        onBlur={() => setRollbackConfirm(null)}
                      >
                        {isConfirming ? '确认回滚' : '回滚'}
                      </button>
                    )}
                    <button
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      onClick={() => toggleExpand(version.id)}
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Diff panel */}
                {isExpanded && version.diff && (
                  <div className="mx-6 mb-4 border border-gray-200 rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <span className="text-xs font-medium text-gray-600">变更差异</span>
                    </div>
                    <div className="overflow-x-auto text-xs leading-relaxed">
                      {renderDiff(version.diff)}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SelectorVersionHistory;