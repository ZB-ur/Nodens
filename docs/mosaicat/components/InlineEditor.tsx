import React, { useCallback, useMemo, useState, KeyboardEvent } from 'react';

interface InlineEditorProps {
  title: string;
  body: string;
  hashtags: string[];
  onTitleChange: (title: string) => void;
  onBodyChange: (body: string) => void;
  onHashtagsChange: (hashtags: string[]) => void;
  titleMaxLength?: number;
  bodyMaxLength?: number;
}

const InlineEditor: React.FC<InlineEditorProps> = ({
  title,
  body,
  hashtags,
  onTitleChange,
  onBodyChange,
  onHashtagsChange,
  titleMaxLength = 20,
  bodyMaxLength = 1000,
}) => {
  const [hashtagInput, setHashtagInput] = useState('');

  const titleCount = title.length;
  const bodyCount = body.length;
  const titleOver = titleCount > titleMaxLength;
  const bodyOver = bodyCount > bodyMaxLength;

  const titlePercent = useMemo(
    () => Math.min((titleCount / titleMaxLength) * 100, 100),
    [titleCount, titleMaxLength]
  );
  const bodyPercent = useMemo(
    () => Math.min((bodyCount / bodyMaxLength) * 100, 100),
    [bodyCount, bodyMaxLength]
  );

  const getBarColor = (percent: number, isOver: boolean) => {
    if (isOver) return 'bg-red-500';
    if (percent >= 80) return 'bg-amber-500';
    return 'bg-blue-600';
  };

  const getCountColor = (isOver: boolean, percent: number) => {
    if (isOver) return 'text-red-500 font-semibold';
    if (percent >= 80) return 'text-amber-500';
    return 'text-gray-400';
  };

  const handleHashtagKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const tag = hashtagInput.trim().replace(/^#/, '');
        if (tag && !hashtags.includes(tag)) {
          onHashtagsChange([...hashtags, tag]);
        }
        setHashtagInput('');
      }
      if (e.key === 'Backspace' && hashtagInput === '' && hashtags.length > 0) {
        onHashtagsChange(hashtags.slice(0, -1));
      }
    },
    [hashtagInput, hashtags, onHashtagsChange]
  );

  const removeHashtag = useCallback(
    (index: number) => {
      onHashtagsChange(hashtags.filter((_, i) => i !== index));
    },
    [hashtags, onHashtagsChange]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      {/* Title Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900">标题</label>
          <span className={`text-xs tabular-nums ${getCountColor(titleOver, titlePercent)}`}>
            {titleCount}/{titleMaxLength}
          </span>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="输入笔记标题..."
          className={`w-full px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 border rounded-lg outline-none transition-colors ${
            titleOver
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
          }`}
        />
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getBarColor(titlePercent, titleOver)}`}
            style={{ width: `${titleOver ? 100 : titlePercent}%` }}
          />
        </div>
        {titleOver && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            标题超出限制 {titleCount - titleMaxLength} 字，请精简
          </p>
        )}
      </div>

      {/* Body Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-900">正文</label>
          <span className={`text-xs tabular-nums ${getCountColor(bodyOver, bodyPercent)}`}>
            {bodyCount}/{bodyMaxLength}
          </span>
        </div>
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder="输入笔记正文内容..."
          rows={8}
          className={`w-full px-4 py-3 text-base text-gray-900 placeholder-gray-400 border rounded-lg outline-none transition-colors resize-y min-h-[120px] ${
            bodyOver
              ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
          }`}
        />
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getBarColor(bodyPercent, bodyOver)}`}
            style={{ width: `${bodyOver ? 100 : bodyPercent}%` }}
          />
        </div>
        {bodyOver && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            正文超出限制 {bodyCount - bodyMaxLength} 字，请精简
          </p>
        )}
      </div>

      {/* Hashtags Field */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900">话题标签</label>
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 transition-colors min-h-[44px]">
          {hashtags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-sm rounded-md"
            >
              #{tag}
              <button
                type="button"
                onClick={() => removeHashtag(index)}
                className="text-blue-400 hover:text-blue-700 transition-colors ml-0.5"
                aria-label={`移除标签 ${tag}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <input
            type="text"
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            onKeyDown={handleHashtagKeyDown}
            placeholder={hashtags.length === 0 ? '输入标签后按 Enter 添加...' : '继续添加...'}
            className="flex-1 min-w-[120px] text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent py-0.5"
          />
        </div>
        <p className="text-xs text-gray-400">按 Enter 或逗号添加标签，Backspace 删除最后一个</p>
      </div>
    </div>
  );
};

export default InlineEditor;