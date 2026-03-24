typescript
import React, { useState, useCallback, useMemo } from 'react';
import StepIndicator from './StepIndicator';
import { PromptTemplateSelector, PromptTemplate } from './PromptTemplateSelector';
import { ContentPreviewCard } from './ContentPreviewCard';
import InlineEditor from './InlineEditor';
import GenerationLoadingSkeleton from './GenerationLoadingSkeleton';

export interface Account {
  id: string;
  platform: 'xiaohongshu';
  nickname: string;
  avatar: string;
  cookieStatus: 'valid' | 'expiring' | 'expired' | 'unknown';
  lastCookieCheck: string;
  topicConfigured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDraftRequest {
  accountId: string;
  title: string;
  body: string;
  hashtags?: string[];
  imageIds?: string[];
}

interface ContentGeneratorWizardProps {
  accounts: Account[];
  templates: PromptTemplate[];
  onSaveDraft: (draft: CreateDraftRequest) => void;
  onSchedule: (draft: CreateDraftRequest) => void;
}

type WizardStep = 'select-account' | 'confirm-params' | 'select-template' | 'generate' | 'preview-edit';

const WIZARD_STEPS = [
  { key: 'select-account' as const, label: '选择账号', description: '指定发布账号' },
  { key: 'confirm-params' as const, label: '确认参数', description: '主题与关键词' },
  { key: 'select-template' as const, label: '选模板', description: 'Prompt 模板' },
  { key: 'generate' as const, label: '生成', description: 'AI 生成文案' },
  { key: 'preview-edit' as const, label: '预览编辑', description: '调整并保存' },
];

const cookieStatusConfig: Record<
  Account['cookieStatus'],
  { dotClass: string; label: string; textClass: string }
> = {
  valid: { dotClass: 'bg-emerald-500', label: '正常', textClass: 'text-emerald-600' },
  expiring: { dotClass: 'bg-amber-500', label: '即将过期', textClass: 'text-amber-600' },
  expired: { dotClass: 'bg-red-500', label: '已过期', textClass: 'text-red-600' },
  unknown: { dotClass: 'bg-gray-400', label: '未知', textClass: 'text-gray-400' },
};

const ContentGeneratorWizard: React.FC<ContentGeneratorWizardProps> = ({
  accounts,
  templates,
  onSaveDraft,
  onSchedule,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [topicOverride, setTopicOverride] = useState<string[]>([]);
  const [keywordsOverride, setKeywordsOverride] = useState<string[]>([]);
  const [styleOverride, setStyleOverride] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);

  const currentStep = WIZARD_STEPS[currentStepIndex].key;
  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  );

  const canGoNext = useMemo(() => {
    switch (currentStep) {
      case 'select-account':
        return selectedAccountId !== null;
      case 'confirm-params':
        return true;
      case 'select-template':
        return selectedTemplateId !== null;
      case 'generate':
        return !isGenerating;
      case 'preview-edit':
        return generatedTitle.trim().length > 0 && generatedBody.trim().length > 0;
      default:
        return false;
    }
  }, [currentStep, selectedAccountId, selectedTemplateId, isGenerating, generatedTitle, generatedBody]);

  const handleNext = useCallback(async () => {
    if (currentStep === 'select-template') {
      // Move to generate step and start generation
      setCurrentStepIndex(3);
      setIsGenerating(true);
      try {
        const response = await fetch('/api/v1/content/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: selectedAccountId,
            topicOverride: topicOverride.length > 0 ? topicOverride : undefined,
            keywordsOverride: keywordsOverride.length > 0 ? keywordsOverride : undefined,
            styleOverride: styleOverride || undefined,
            templateId: selectedTemplateId,
          }),
        });
        const data = await response.json();
        setGeneratedTitle(data.title ?? '');
        setGeneratedBody(data.body ?? '');
        setGeneratedHashtags(data.hashtags ?? []);
        setIsGenerating(false);
        setCurrentStepIndex(4); // Auto-advance to preview
      } catch {
        setIsGenerating(false);
        // Stay on generate step to show error
      }
    } else if (currentStep === 'generate' && !isGenerating) {
      setCurrentStepIndex(4);
    } else if (currentStepIndex < WIZARD_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStep, currentStepIndex, isGenerating, selectedAccountId, selectedTemplateId, topicOverride, keywordsOverride, styleOverride]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      // Skip generate step when going back from preview
      if (currentStep === 'preview-edit') {
        setCurrentStepIndex(2);
      } else {
        setCurrentStepIndex((prev) => prev - 1);
      }
    }
  }, [currentStepIndex, currentStep]);

  const handleSaveDraft = useCallback(() => {
    if (!selectedAccountId) return;
    onSaveDraft({
      accountId: selectedAccountId,
      title: generatedTitle,
      body: generatedBody,
      hashtags: generatedHashtags,
    });
  }, [selectedAccountId, generatedTitle, generatedBody, generatedHashtags, onSaveDraft]);

  const handleSchedule = useCallback(() => {
    if (!selectedAccountId) return;
    onSchedule({
      accountId: selectedAccountId,
      title: generatedTitle,
      body: generatedBody,
      hashtags: generatedHashtags,
    });
  }, [selectedAccountId, generatedTitle, generatedBody, generatedHashtags, onSchedule]);

  const handleRegenerate = useCallback(() => {
    setCurrentStepIndex(3);
    setIsGenerating(true);
    fetch('/api/v1/content/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: selectedAccountId,
        topicOverride: topicOverride.length > 0 ? topicOverride : undefined,
        keywordsOverride: keywordsOverride.length > 0 ? keywordsOverride : undefined,
        styleOverride: styleOverride || undefined,
        templateId: selectedTemplateId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setGeneratedTitle(data.title ?? '');
        setGeneratedBody(data.body ?? '');
        setGeneratedHashtags(data.hashtags ?? []);
        setIsGenerating(false);
        setCurrentStepIndex(4);
      })
      .catch(() => {
        setIsGenerating(false);
      });
  }, [selectedAccountId, selectedTemplateId, topicOverride, keywordsOverride, styleOverride]);

  // ─── Step Renderers ───────────────────────────────────────
  const renderSelectAccount = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">选择发布账号</h3>
        <p className="text-sm text-gray-600 mt-0.5">选择一个账号来生成该账号主题方向的文案</p>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
          <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">暂无可用账号，请先添加账号</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {accounts.map((account) => {
            const isSelected = selectedAccountId === account.id;
            const status = cookieStatusConfig[account.cookieStatus];
            const isDisabled = account.cookieStatus === 'expired';

            return (
              <button
                key={account.id}
                onClick={() => !isDisabled && setSelectedAccountId(account.id)}
                disabled={isDisabled}
                className={`relative text-left border rounded-xl p-4 transition-all ${
                  isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer'
                }`}
              >
                {/* Selection indicator */}
                <div
                  className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>

                <div className="flex items-center gap-3 pr-8">
                  <img
                    src={account.avatar}
                    alt={account.nickname}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{account.nickname}</p>
                    <p className="text-xs text-gray-500 mt-0.5">小红书</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex h-2 w-2 rounded-full ${status.dotClass}`} />
                    <span className={`text-xs font-medium ${status.textClass}`}>{status.label}</span>
                  </div>
                  {account.topicConfigured ? (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">主题已配置</span>
                  ) : (
                    <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">待配置主题</span>
                  )}
                </div>
                {isDisabled && (
                  <p className="text-xs text-red-500 mt-2">Cookie 已过期，请先刷新</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderConfirmParams = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">确认生成参数</h3>
        <p className="text-sm text-gray-600 mt-0.5">
          以下参数来自账号主题配置，你也可以临时覆盖
        </p>
      </div>

      {/* Selected account summary */}
      {selectedAccount && (
        <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
          <img
            src={selectedAccount.avatar}
            alt={selectedAccount.nickname}
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900">{selectedAccount.nickname}</p>
            <p className="text-xs text-gray-500">小红书</p>
          </div>
        </div>
      )}

      {/* Topic Override */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">主题方向（可选覆盖）</label>
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 transition-colors min-h-[44px]">
            {topicOverride.map((topic, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-sm rounded-md">
                {topic}
                <button
                  onClick={() => setTopicOverride((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-blue-400 hover:text-blue-700 transition-colors ml-0.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={topicOverride.length === 0 ? '留空使用账号配置，输入后按 Enter 添加' : '继续添加...'}
              className="flex-1 min-w-[150px] text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent py-0.5"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) {
                    setTopicOverride((prev) => [...prev, val]);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Keywords Override */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">关键词（可选覆盖）</label>
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 transition-colors min-h-[44px]">
            {keywordsOverride.map((kw, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                {kw}
                <button
                  onClick={() => setKeywordsOverride((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-gray-400 hover:text-gray-700 transition-colors ml-0.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={keywordsOverride.length === 0 ? '留空使用账号配置，输入后按 Enter 添加' : '继续添加...'}
              className="flex-1 min-w-[150px] text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent py-0.5"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) {
                    setKeywordsOverride((prev) => [...prev, val]);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Style Override */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">风格描述（可选覆盖）</label>
          <textarea
            value={styleOverride}
            onChange={(e) => setStyleOverride(e.target.value)}
            placeholder="留空使用账号配置的风格，或输入临时风格描述..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors resize-y min-h-[80px]"
          />
          <p className="text-xs text-gray-400 text-right">{styleOverride.length}/500</p>
        </div>
      </div>
    </div>
  );

  const renderSelectTemplate = () => (
    <PromptTemplateSelector
      templates={templates}
      selectedId={selectedTemplateId ?? undefined}
      onChange={(id) => setSelectedTemplateId(id)}
    />
  );

  const renderGenerate = () => (
    <GenerationLoadingSkeleton estimatedTime={15} />
  );

  const renderPreviewEdit = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">预览与编辑</h3>
        <p className="text-sm text-gray-600 mt-0.5">检查生成的内容，可以直接编辑调整</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor side */}
        <div className="space-y-4">
          <InlineEditor
            title={generatedTitle}
            body={generatedBody}
            hashtags={generatedHashtags}
            onTitleChange={setGeneratedTitle}
            onBodyChange={setGeneratedBody}
            onHashtagsChange={setGeneratedHashtags}
          />
          <button
            onClick={handleRegenerate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
            重新生成
          </button>
        </div>

        {/* Preview side */}
        <div>
          <ContentPreviewCard
            title={generatedTitle}
            body={generatedBody}
            hashtags={generatedHashtags}
          />
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select-account':
        return renderSelectAccount();
      case 'confirm-params':
        return renderConfirmParams();
      case 'select-template':
        return renderSelectTemplate();
      case 'generate':
        return renderGenerate();
      case 'preview-edit':
        return renderPreviewEdit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">内容生成向导</h2>
        <p className="text-sm text-gray-600 mt-1">通过 AI 自动生成小红书文案，选账号 → 确认参数 → 选模板 → 生成 → 编辑发布</p>
      </div>

      {/* Step Indicator */}
      <StepIndicator
        steps={WIZARD_STEPS.map((s) => ({ label: s.label, description: s.description }))}
        currentStep={currentStepIndex}
      />

      {/* Step Content */}
      <div className="min-h-[400px]">
        {renderStepContent()}
      </div>

      {/* Navigation Footer */}
      {currentStep !== 'generate' && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              currentStepIndex === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            上一步
          </button>

          <div className="flex items-center gap-3">
            {currentStep === 'preview-edit' ? (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={!canGoNext}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  存为草稿
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!canGoNext}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  去排期
                </button>
              </>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === 'select-template' ? '开始生成' : '下一步'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGeneratorWizard;