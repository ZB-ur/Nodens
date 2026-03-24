import React, { useState, useRef, useCallback, useEffect } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  suggestions = [],
  placeholder = '输入标签后按回车添加',
  maxTags = 20,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(s) &&
      inputValue.trim().length > 0
  );

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (!trimmed) return;
      if (tags.includes(trimmed)) return;
      if (tags.length >= maxTags) return;
      onChange([...tags, trimmed]);
      setInputValue('');
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    },
    [tags, onChange, maxTags]
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        addTag(filteredSuggestions[highlightedIndex]);
      } else {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
    setHighlightedIndex(-1);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAtLimit = tags.length >= maxTags;

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`flex flex-wrap items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 ${
          isAtLimit ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-blue-400 transition-colors hover:bg-blue-200 hover:text-blue-600"
              aria-label={`删除标签 ${tag}`}
            >
              <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l6 6M9 3l-6 6" />
              </svg>
            </button>
          </span>
        ))}

        {!isAtLimit && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.trim() && setShowSuggestions(true)}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="min-w-[120px] flex-1 border-none bg-transparent py-1 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        )}
      </div>

      {/* Tag count hint */}
      <div className="mt-1.5 flex items-center justify-between px-1">
        <span className={`text-xs ${isAtLimit ? 'text-amber-500' : 'text-gray-400'}`}>
          {tags.length}/{maxTags} 个标签
        </span>
        {!isAtLimit && tags.length === 0 && (
          <span className="text-xs text-gray-400">按 Enter 添加</span>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-md">
          <div className="px-3 py-1.5 text-xs font-medium text-gray-400">建议标签</div>
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors ${
                index === highlightedIndex
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="mr-2 h-3.5 w-3.5 text-gray-400" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 1v12M1 7h12" />
              </svg>
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;