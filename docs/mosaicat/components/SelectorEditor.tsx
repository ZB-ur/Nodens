import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

interface SelectorSelectors {
  login: {
    qrCode: string;
    scanConfirm: string;
  };
  publish: {
    uploadButton: string;
    titleInput: string;
    bodyInput: string;
    hashtagInput: string;
    submitButton: string;
    confirmButton: string;
  };
  validation: {
    successIndicator: string;
    errorIndicator: string;
  };
}

interface SelectorConfig {
  version: string;
  platform: 'xiaohongshu';
  selectors: SelectorSelectors;
  updatedAt: string;
}

interface SelectorConfigInput {
  selectors: Record<string, unknown>;
  comment?: string;
}

interface SelectorEditorProps {
  config: SelectorConfig;
  onSave: (config: SelectorConfigInput) => void;
  error?: string;
}

type TokenType = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation';

interface Token {
  type: TokenType;
  value: string;
}

function tokenizeJSON(json: string): Token[] {
  const tokens: Token[] = [];
  const regex =
    /("(?:\\.|[^"\\])*")\s*:/g |
    /"(?:\\.|[^"\\])*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}\[\]:,]/g;

  // Simple line-by-line tokenizer
  const tokenRegex = /"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}\[\]:,\s]+/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(json)) !== null) {
    const value = match[0];
    if (/^\s+$/.test(value)) {
      tokens.push({ type: 'punctuation', value });
    } else if (/^".*"$/.test(value) && json[match.index + value.length] === ':' ||
               json.substring(match.index + value.length).match(/^\s*:/)) {
      if (/^".*"$/.test(value)) {
        tokens.push({ type: 'key', value });
      } else {
        tokens.push({ type: 'punctuation', value });
      }
    } else if (/^".*"$/.test(value)) {
      tokens.push({ type: 'string', value });
    } else if (value === 'true' || value === 'false') {
      tokens.push({ type: 'boolean', value });
    } else if (value === 'null') {
      tokens.push({ type: 'null', value });
    } else if (/^-?\d/.test(value)) {
      tokens.push({ type: 'number', value });
    } else {
      tokens.push({ type: 'punctuation', value });
    }
  }
  return tokens;
}

function validateJSON(text: string): { valid: boolean; error?: string; parsed?: unknown } {
  try {
    const parsed = JSON.parse(text);
    return { valid: true, parsed };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON';
    return { valid: false, error: msg };
  }
}

function validateSelectorStructure(obj: unknown): string[] {
  const warnings: string[] = [];
  if (typeof obj !== 'object' || obj === null) {
    return ['Root must be an object'];
  }

  const record = obj as Record<string, unknown>;
  const expectedGroups = ['login', 'publish', 'validation'];
  for (const group of expectedGroups) {
    if (!(group in record)) {
      warnings.push(`Missing selector group: "${group}"`);
    } else if (typeof record[group] !== 'object' || record[group] === null) {
      warnings.push(`"${group}" must be an object`);
    }
  }

  if (record.publish && typeof record.publish === 'object') {
    const pub = record.publish as Record<string, unknown>;
    const requiredKeys = ['uploadButton', 'titleInput', 'bodyInput', 'submitButton'];
    for (const key of requiredKeys) {
      if (!(key in pub) || typeof pub[key] !== 'string' || (pub[key] as string).trim() === '') {
        warnings.push(`publish.${key} is required and must be a non-empty string`);
      }
    }
  }

  return warnings;
}

const SelectorEditor: React.FC<SelectorEditorProps> = ({ config, onSave, error }) => {
  const initialJSON = useMemo(
    () => JSON.stringify(config.selectors, null, 2),
    [config.selectors]
  );
  const [editorText, setEditorText] = useState(initialJSON);
  const [comment, setComment] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showVersionInfo, setShowVersionInfo] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const result = validateJSON(editorText);
    if (!result.valid) {
      setJsonError(result.error ?? 'Invalid JSON');
      setWarnings([]);
    } else {
      setJsonError(null);
      setWarnings(validateSelectorStructure(result.parsed));
    }
    setIsDirty(editorText !== initialJSON);
  }, [editorText, initialJSON]);

  const handleSave = useCallback(() => {
    const result = validateJSON(editorText);
    if (!result.valid) return;
    onSave({
      selectors: result.parsed as Record<string, unknown>,
      comment: comment.trim() || undefined,
    });
    setComment('');
  }, [editorText, comment, onSave]);

  const handleReset = useCallback(() => {
    setEditorText(initialJSON);
    setComment('');
  }, [initialJSON]);

  const handleFormat = useCallback(() => {
    const result = validateJSON(editorText);
    if (result.valid) {
      setEditorText(JSON.stringify(result.parsed, null, 2));
    }
  }, [editorText]);

  const handleMinify = useCallback(() => {
    const result = validateJSON(editorText);
    if (result.valid) {
      setEditorText(JSON.stringify(result.parsed));
    }
  }, [editorText]);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const lineCount = editorText.split('\n').length;

  const highlightedHTML = useMemo(() => {
    return editorText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(
        /("(?:\\.|[^"\\])*")(\s*:)/g,
        '<span class="text-purple-600">$1</span>$2'
      )
      .replace(
        /:(\s*)("(?:\\.|[^"\\])*")/g,
        ':$1<span class="text-emerald-600">$2</span>'
      )
      .replace(
        /\b(true|false)\b/g,
        '<span class="text-blue-600">$1</span>'
      )
      .replace(
        /\b(null)\b/g,
        '<span class="text-gray-400">$1</span>'
      )
      .replace(
        /\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g,
        '<span class="text-amber-600">$1</span>'
      );
  }, [editorText]);

  const canSave = !jsonError && isDirty && warnings.length === 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">选择器配置</h2>
            <p className="text-sm text-gray-500">编辑小红书页面元素选择器 JSON</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 rounded-full">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              未保存
            </span>
          )}
          {!jsonError && warnings.length === 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              有效
            </span>
          )}
        </div>
      </div>

      {/* Version info bar */}
      {showVersionInfo && (
        <div className="px-6 py-3 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              版本 <span className="font-mono font-medium text-gray-900">{config.version}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span>
              平台 <span className="font-medium text-gray-900">{config.platform}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span>
              更新于 <span className="font-medium text-gray-900">
                {new Date(config.updatedAt).toLocaleString('zh-CN')}
              </span>
            </span>
          </div>
          <button
            onClick={() => setShowVersionInfo(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-2">
        <button
          onClick={handleFormat}
          disabled={!!jsonError}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          格式化
        </button>
        <button
          onClick={handleMinify}
          disabled={!!jsonError}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          压缩
        </button>
        <button
          onClick={handleReset}
          disabled={!isDirty}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          重置
        </button>
        <div className="flex-1" />
        <span className="text-xs text-gray-400">{lineCount} 行</span>
      </div>

      {/* Editor area */}
      <div className="relative font-mono text-sm leading-6">
        {/* Line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r border-gray-100 select-none overflow-hidden">
          <div className="px-2 py-4 text-right text-gray-400">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1} className="leading-6">{i + 1}</div>
            ))}
          </div>
        </div>

        {/* Syntax highlight layer */}
        <div
          ref={highlightRef}
          className="absolute left-12 right-0 top-0 bottom-0 p-4 overflow-hidden whitespace-pre-wrap break-all pointer-events-none"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlightedHTML }}
        />

        {/* Editable textarea */}
        <textarea
          ref={textareaRef}
          value={editorText}
          onChange={(e) => setEditorText(e.target.value)}
          onScroll={syncScroll}
          spellCheck={false}
          className="relative w-full min-h-[360px] pl-16 pr-4 py-4 bg-transparent text-transparent caret-gray-900 resize-y outline-none focus:ring-2 focus:ring-blue-500/20 border-0"
          style={{ caretColor: '#111827' }}
        />
      </div>

      {/* Error / Warning messages */}
      {(jsonError || error || warnings.length > 0) && (
        <div className="px-6 py-3 space-y-2 border-t border-gray-100">
          {jsonError && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-xs">{jsonError}</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Comment + Save */}
      <div className="px-6 py-4 border-t border-gray-200 bg-slate-50 flex items-center gap-3">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="版本备注（可选）"
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 placeholder:text-gray-400"
        />
        <button
          onClick={handleReset}
          disabled={!isDirty}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          保存配置
        </button>
      </div>
    </div>
  );
};

export default SelectorEditor;