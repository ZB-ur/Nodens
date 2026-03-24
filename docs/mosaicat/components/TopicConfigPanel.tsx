import React, { useState, useCallback, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────
export interface TopicConfig {
  accountId: string;
  topics: string[];
  keywords: string[];
  styleDescription: string;
  updatedAt: string;
}

export interface TopicConfigInput {
  topics: string[];
  keywords: string[];
  styleDescription: string;
}

export interface PresetTopic {
  id: string;
  name: string;
  icon: string;
  suggestedKeywords: string[];
}

export interface TopicConfigPanelProps {
  accountId: string;
  config?: TopicConfig;
  onSave: (config: TopicConfigInput) => void;
}

// ─── Sub-components (inline until children are built) ────────

interface PresetTopicSelectorProps {
  selected: string[];
  onToggle: (topic: string) => void;
}

const PresetTopicSelector: React.FC<PresetTopicSelectorProps> = ({ selected, onToggle }) => {
  const [presets, setPresets] = useState<PresetTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/topics/presets')
      .then((res) => res.json())
      .then((json) => setPresets(json.data ?? []))
      .catch(() => setPresets([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        加载预设主题…
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => {
        const isSelected = selected.includes(preset.name);
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onToggle(preset.name)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              isSelected
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span>{preset.icon}</span>
            <span>{preset.name}</span>
            {isSelected && (
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
};

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder = '输入后按 Enter 添加', maxTags = 20 }) => {
  const [input, setInput] = useState('');

  const addTag = useCallback(() => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < maxTags) {
      onChange([...tags, trimmed]);
      setInput('');
    }
  }, [input, tags, onChange, maxTags]);

  const removeTag = useCallback(
    (tag: string) => {
      onChange(tags.filter((t) => t !== tag));
    },
    [tags, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag();
      } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
        removeTag(tags[tags.length - 1]);
      }
    },
    [addTag, removeTag, input, tags],
  );

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-shadow min-h-[42px]">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-sm rounded-md"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-blue-400 hover:text-blue-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent"
        disabled={tags.length >= maxTags}
      />
      {tags.length > 0 && (
        <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">
          {tags.length}/{maxTags}
        </span>
      )}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────

const TopicConfigPanel: React.FC<TopicConfigPanelProps> = ({ accountId, config, onSave }) => {
  const [topics, setTopics] = useState<string[]>(config?.topics ?? []);
  const [keywords, setKeywords] = useState<string[]>(config?.keywords ?? []);
  const [styleDescription, setStyleDescription] = useState(config?.styleDescription ?? '');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Reset form when config prop changes
  useEffect(() => {
    setTopics(config?.topics ?? []);
    setKeywords(config?.keywords ?? []);
    setStyleDescription(config?.styleDescription ?? '');
    setDirty(false);
  }, [config]);

  const markDirty = useCallback(() => setDirty(true), []);

  const handleTopicToggle = useCallback(
    (topic: string) => {
      setTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
      markDirty();
    },
    [markDirty],
  );

  const handleKeywordsChange = useCallback(
    (newKeywords: string[]) => {
      setKeywords(newKeywords);
      markDirty();
    },
    [markDirty],
  );

  const handleStyleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= 500) {
        setStyleDescription(value);
        markDirty();
      }
    },
    [markDirty],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave({ topics, keywords, styleDescription });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }, [topics, keywords, styleDescription, onSave]);

  const isValid = topics.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">主题配置</h2>
          <p className="text-sm text-gray-500 mt-0.5">设置账号的内容方向，用于 AI 生成文案时的参考</p>
        </div>
        {config?.updatedAt && (
          <span className="text-xs text-gray-400">
            上次更新：{new Date(config.updatedAt).toLocaleDateString('zh-CN')}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Section 1: Preset Topics */}
        <section>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            主题标签 <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-3">选择与账号内容方向相关的主题，至少选择 1 个</p>
          <PresetTopicSelector selected={topics} onToggle={handleTopicToggle} />
          {topics.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-md"
                >
                  {t}
                  <button type="button" onClick={() => handleTopicToggle(t)} className="opacity-70 hover:opacity-100">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Keywords */}
        <section>
          <label className="block text-sm font-medium text-gray-900 mb-2">自定义关键词</label>
          <p className="text-xs text-gray-500 mb-3">添加你希望在生成内容中出现的关键词</p>
          <TagInput tags={keywords} onChange={handleKeywordsChange} placeholder="输入关键词后按 Enter 添加" maxTags={20} />
        </section>

        {/* Section 3: Style Description */}
        <section>
          <label className="block text-sm font-medium text-gray-900 mb-2">风格描述</label>
          <p className="text-xs text-gray-500 mb-3">描述内容风格偏好，例如"轻松活泼的种草文风"</p>
          <div className="relative">
            <textarea
              value={styleDescription}
              onChange={handleStyleChange}
              rows={4}
              maxLength={500}
              placeholder="例如：清新自然的种草文风，多用 emoji 表情，适合 20-30 岁女性阅读…"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-shadow"
            />
            <span className="absolute bottom-2 right-3 text-xs text-gray-400">{styleDescription.length}/500</span>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-slate-50 rounded-b-xl">
        {dirty && <span className="text-xs text-amber-600 mr-auto">● 有未保存的修改</span>}
        <button
          type="button"
          onClick={handleSave}
          disabled={!isValid || saving || !dirty}
          className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            isValid && dirty && !saving
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {saving && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          保存配置
        </button>
      </div>
    </div>
  );
};

export default TopicConfigPanel;