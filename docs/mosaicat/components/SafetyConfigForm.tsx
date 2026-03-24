import React, { useState, useCallback, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────
interface SafetyConfig {
  maxPostsPerDay: number;
  minIntervalMinutes: number;
  randomDelayMin: number;
  randomDelayMax: number;
  isAccountOverride?: boolean;
  updatedAt?: string;
}

interface SafetyConfigInput {
  maxPostsPerDay?: number;
  minIntervalMinutes?: number;
  randomDelayMin?: number;
  randomDelayMax?: number;
}

interface Account {
  id: string;
  nickname: string;
  platform: 'xiaohongshu';
  avatar?: string;
  cookieStatus: 'valid' | 'expiring' | 'expired' | 'unknown';
}

interface SafetyConfigFormProps {
  config: SafetyConfig;
  accounts?: Account[];
  onSave: (config: SafetyConfigInput) => void;
  onAccountOverride?: (accountId: string, config: SafetyConfigInput) => void;
}

// ─── Sub-components (inline, children stubs) ─────────────────
interface NumberRangeInputProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

function NumberRangeInput({
  label,
  description,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: NumberRangeInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-900">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-24 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {unit && <span className="text-sm text-gray-500 w-12">{unit}</span>}
        </div>
      </div>
      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}{unit ? ` ${unit}` : ''}</span>
        <span>{max}{unit ? ` ${unit}` : ''}</span>
      </div>
    </div>
  );
}

function RiskDisclaimerBanner({ level }: { level: 'safe' | 'caution' | 'danger' }) {
  const config = {
    safe: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: '✓',
      iconBg: 'bg-emerald-100 text-emerald-600',
      title: '当前配置安全',
      desc: '发布频率和间隔在安全范围内，被平台风控的概率较低。',
    },
    caution: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: '⚠',
      iconBg: 'bg-amber-100 text-amber-600',
      title: '请注意风控风险',
      desc: '当前配置的发布频率偏高，可能触发平台风控机制。建议降低每日发布数量或增加发布间隔。',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: '✕',
      iconBg: 'bg-red-100 text-red-600',
      title: '高风险配置',
      desc: '当前配置极易触发平台风控，可能导致账号被限流或封禁。强烈建议调整参数至安全范围。',
    },
  };
  const c = config[level];

  return (
    <div className={`${c.bg} ${c.border} border rounded-xl p-4 flex gap-3`}>
      <div className={`${c.iconBg} w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0`}>
        {c.icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{c.title}</p>
        <p className="text-xs text-gray-600 mt-0.5">{c.desc}</p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function SafetyConfigForm({
  config,
  accounts,
  onSave,
  onAccountOverride,
}: SafetyConfigFormProps) {
  const [form, setForm] = useState<SafetyConfigInput>({
    maxPostsPerDay: config.maxPostsPerDay,
    minIntervalMinutes: config.minIntervalMinutes,
    randomDelayMin: config.randomDelayMin,
    randomDelayMax: config.randomDelayMax,
  });

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const updateField = useCallback((field: keyof SafetyConfigInput, value: number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const riskLevel = useMemo<'safe' | 'caution' | 'danger'>(() => {
    const posts = form.maxPostsPerDay ?? 2;
    const interval = form.minIntervalMinutes ?? 120;
    if (posts > 5 || interval < 60) return 'danger';
    if (posts > 3 || interval < 90) return 'caution';
    return 'safe';
  }, [form.maxPostsPerDay, form.minIntervalMinutes]);

  const handleSave = () => {
    if (selectedAccountId && onAccountOverride) {
      onAccountOverride(selectedAccountId, form);
    } else {
      onSave(form);
    }
    setIsDirty(false);
  };

  const handleReset = () => {
    setForm({
      maxPostsPerDay: config.maxPostsPerDay,
      minIntervalMinutes: config.minIntervalMinutes,
      randomDelayMin: config.randomDelayMin,
      randomDelayMax: config.randomDelayMax,
    });
    setIsDirty(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">安全策略配置</h2>
        <p className="text-sm text-gray-600 mt-1">
          配置发布频率与随机延迟参数，降低平台风控风险
        </p>
      </div>

      {/* Account Scope Selector */}
      {accounts && accounts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <label className="text-sm font-medium text-gray-900 block mb-2">
            配置范围
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedAccountId(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedAccountId === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全局配置
            </button>
            {accounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  selectedAccountId === acc.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    acc.cookieStatus === 'valid'
                      ? 'bg-emerald-400'
                      : acc.cookieStatus === 'expiring'
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                  }`}
                />
                {acc.nickname}
              </button>
            ))}
          </div>
          {selectedAccountId && (
            <p className="text-xs text-gray-400 mt-2">
              账号级配置将覆盖全局配置。删除后回退到全局配置。
            </p>
          )}
        </div>
      )}

      {/* Risk Banner */}
      <RiskDisclaimerBanner level={riskLevel} />

      {/* Publish Frequency */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">发布频率</h3>

        <NumberRangeInput
          label="每日发布上限"
          description="建议不超过 3 篇/天，降低风控概率"
          value={form.maxPostsPerDay ?? 2}
          min={1}
          max={10}
          unit="篇"
          onChange={(v) => updateField('maxPostsPerDay', v)}
        />

        <div className="border-t border-gray-100" />

        <NumberRangeInput
          label="最小发布间隔"
          description="同一账号两次发布之间的最小时间间隔"
          value={form.minIntervalMinutes ?? 120}
          min={30}
          max={480}
          step={10}
          unit="分钟"
          onChange={(v) => updateField('minIntervalMinutes', v)}
        />
      </div>

      {/* Random Delay */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">随机延迟</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            模拟人工操作的随机等待时间，避免机械化行为特征
          </p>
        </div>

        <NumberRangeInput
          label="最小延迟"
          value={form.randomDelayMin ?? 200}
          min={100}
          max={5000}
          step={100}
          unit="ms"
          onChange={(v) => updateField('randomDelayMin', v)}
        />

        <div className="border-t border-gray-100" />

        <NumberRangeInput
          label="最大延迟"
          description="最大延迟应大于最小延迟"
          value={form.randomDelayMax ?? 2000}
          min={200}
          max={10000}
          step={100}
          unit="ms"
          onChange={(v) => updateField('randomDelayMax', v)}
        />

        {(form.randomDelayMin ?? 0) >= (form.randomDelayMax ?? 0) && (
          <p className="text-xs text-red-500">
            ⚠ 最大延迟必须大于最小延迟
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {config.updatedAt
            ? `上次更新: ${new Date(config.updatedAt).toLocaleString('zh-CN')}`
            : ''}
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            disabled={!isDirty}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            重置
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {selectedAccountId ? '保存账号配置' : '保存全局配置'}
          </button>
        </div>
      </div>
    </div>
  );
}