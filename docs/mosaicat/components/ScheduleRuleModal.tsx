import React, { useState, useCallback, useMemo } from 'react';

// ─── Types ───────────────────────────────────────────────────
interface Account {
  id: string;
  platform: 'xiaohongshu';
  nickname: string;
  avatar: string;
  cookieStatus: 'valid' | 'expiring' | 'expired' | 'unknown';
}

interface GenerateScheduleRequest {
  accountIds: string[];
  startDate: string;
  endDate: string;
  postsPerDay: number;
  timeSlots: string[];
}

interface ScheduleRuleModalProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  onGenerate: (config: GenerateScheduleRequest) => void;
}

// ─── Recommended Time Slots ──────────────────────────────────
const RECOMMENDED_SLOTS = [
  { time: '08:00', label: '早间通勤', priority: 'medium' as const },
  { time: '10:00', label: '早间高峰', priority: 'high' as const },
  { time: '12:00', label: '午间休息', priority: 'high' as const },
  { time: '15:00', label: '下午茶歇', priority: 'medium' as const },
  { time: '18:00', label: '晚间通勤', priority: 'high' as const },
  { time: '20:00', label: '晚间高峰', priority: 'high' as const },
  { time: '22:00', label: '睡前浏览', priority: 'medium' as const },
];

const priorityColors: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-gray-50 text-gray-600 border-gray-200',
};

// ─── Component ───────────────────────────────────────────────
export default function ScheduleRuleModal({
  open,
  onClose,
  accounts,
  onGenerate,
}: ScheduleRuleModalProps) {
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [postsPerDay, setPostsPerDay] = useState(2);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(['10:00', '20:00']);
  const [customSlot, setCustomSlot] = useState('');

  const validAccounts = useMemo(
    () => accounts.filter((a) => a.cookieStatus !== 'expired'),
    [accounts],
  );

  const toggleAccount = useCallback((id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const selectAllAccounts = useCallback(() => {
    setSelectedAccountIds((prev) =>
      prev.length === validAccounts.length ? [] : validAccounts.map((a) => a.id),
    );
  }, [validAccounts]);

  const toggleSlot = useCallback((time: string) => {
    setSelectedSlots((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time].sort(),
    );
  }, []);

  const addCustomSlot = useCallback(() => {
    if (customSlot && /^\d{2}:\d{2}$/.test(customSlot) && !selectedSlots.includes(customSlot)) {
      setSelectedSlots((prev) => [...prev, customSlot].sort());
      setCustomSlot('');
    }
  }, [customSlot, selectedSlots]);

  const canGenerate = useMemo(
    () =>
      selectedAccountIds.length > 0 &&
      startDate &&
      endDate &&
      startDate <= endDate &&
      selectedSlots.length > 0,
    [selectedAccountIds, startDate, endDate, selectedSlots],
  );

  const handleGenerate = useCallback(() => {
    if (!canGenerate) return;
    onGenerate({
      accountIds: selectedAccountIds,
      startDate,
      endDate,
      postsPerDay,
      timeSlots: selectedSlots,
    });
  }, [canGenerate, selectedAccountIds, startDate, endDate, postsPerDay, selectedSlots, onGenerate]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl mx-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">自动排期规则</h2>
            <p className="mt-0.5 text-sm text-gray-500">配置排期规则后自动生成发布计划</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* ── Section 1: Account Selection ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">选择账号</h3>
              <button
                onClick={selectAllAccounts}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectedAccountIds.length === validAccounts.length ? '取消全选' : '全选'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {accounts.map((account) => {
                const isExpired = account.cookieStatus === 'expired';
                const isSelected = selectedAccountIds.includes(account.id);
                return (
                  <button
                    key={account.id}
                    disabled={isExpired}
                    onClick={() => toggleAccount(account.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      isExpired
                        ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                        : isSelected
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <img
                      src={account.avatar}
                      alt={account.nickname}
                      className="w-9 h-9 rounded-full object-cover bg-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{account.nickname}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${
                            account.cookieStatus === 'valid'
                              ? 'bg-emerald-500'
                              : account.cookieStatus === 'expiring'
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                          }`}
                        />
                        <span className="text-xs text-gray-500">
                          {account.cookieStatus === 'valid'
                            ? 'Cookie 有效'
                            : account.cookieStatus === 'expiring'
                              ? 'Cookie 即将过期'
                              : 'Cookie 已失效'}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedAccountIds.length === 0 && (
              <p className="mt-2 text-xs text-gray-400">请至少选择一个账号</p>
            )}
          </section>

          {/* ── Section 2: Date Range ── */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">排期日期范围</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">开始日期</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <span className="text-gray-400 mt-5">至</span>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">结束日期</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* ── Section 3: Posts Per Day ── */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">每日发布篇数</h3>
            <div className="flex items-center gap-3">
              {[1, 2].map((n) => (
                <button
                  key={n}
                  onClick={() => setPostsPerDay(n)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-all ${
                    postsPerDay === n
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {n} 篇/天
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">
              安全策略限制：每日最多 2 篇，间隔 ≥ 120 分钟
            </p>
          </section>

          {/* ── Section 4: Time Slots ── */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">发布时段</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {RECOMMENDED_SLOTS.map((slot) => {
                const isActive = selectedSlots.includes(slot.time);
                return (
                  <button
                    key={slot.time}
                    onClick={() => toggleSlot(slot.time)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium">{slot.time}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border ${priorityColors[slot.priority]}`}
                    >
                      {slot.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom slot input */}
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={customSlot}
                onChange={(e) => setCustomSlot(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="自定义时段"
              />
              <button
                onClick={addCustomSlot}
                disabled={!customSlot}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + 添加
              </button>
            </div>

            {selectedSlots.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span>已选时段：</span>
                {selectedSlots.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md"
                  >
                    {t}
                    <button onClick={() => toggleSlot(t)} className="hover:text-blue-900">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* ── Summary ── */}
          {canGenerate && (
            <div className="p-4 bg-slate-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-700">
                将为{' '}
                <span className="font-semibold text-gray-900">{selectedAccountIds.length}</span>{' '}
                个账号生成{' '}
                <span className="font-semibold text-gray-900">
                  {startDate} ~ {endDate}
                </span>{' '}
                期间的排期，每天{' '}
                <span className="font-semibold text-gray-900">{postsPerDay}</span> 篇，时段：
                {selectedSlots.join('、')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 bg-white border-t border-gray-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            生成排期预览
          </button>
        </div>
      </div>
    </div>
  );
}