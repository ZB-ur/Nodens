import React, { useState, useMemo, useCallback, useRef } from 'react';

// ─── Types ───────────────────────────────────────────────────
export interface Schedule {
  id: string;
  accountId: string;
  accountNickname: string;
  draftId: string | null;
  scheduledAt: string;
  status: 'pending' | 'publishing' | 'success' | 'failed' | 'cancelled';
  imageIds: string[];
  publishLogId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleCalendarProps {
  schedules: Schedule[];
  onDateChange: (startDate: string, endDate: string) => void;
  onScheduleUpdate: (scheduleId: string, scheduledAt: string) => void;
  onScheduleClick: (scheduleId: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 – 22:00
const DAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatShortDate(d: Date): string {
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const STATUS_STYLES: Record<Schedule['status'], { bg: string; dot: string; text: string }> = {
  pending: { bg: 'bg-blue-50 border-blue-200 hover:border-blue-400', dot: 'bg-blue-500', text: 'text-blue-700' },
  publishing: { bg: 'bg-amber-50 border-amber-200 hover:border-amber-400', dot: 'bg-amber-500', text: 'text-amber-700' },
  success: { bg: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  failed: { bg: 'bg-red-50 border-red-200 hover:border-red-400', dot: 'bg-red-500', text: 'text-red-700' },
  cancelled: { bg: 'bg-gray-50 border-gray-200 hover:border-gray-400', dot: 'bg-gray-400', text: 'text-gray-500' },
};

const STATUS_LABELS: Record<Schedule['status'], string> = {
  pending: '待发布',
  publishing: '发布中',
  success: '已发布',
  failed: '失败',
  cancelled: '已取消',
};

// ─── ScheduleCard (inline child) ─────────────────────────────
interface ScheduleCardProps {
  schedule: Schedule;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ schedule, onClick, onDragStart }) => {
  const styles = STATUS_STYLES[schedule.status];
  const time = new Date(schedule.scheduledAt);
  const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
  const isDraggable = schedule.status === 'pending';

  return (
    <div
      draggable={isDraggable}
      onDragStart={(e) => isDraggable && onDragStart(e, schedule.id)}
      onClick={onClick}
      className={`group relative px-2 py-1.5 rounded-lg border text-xs cursor-pointer transition-all ${styles.bg} ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />
        <span className={`font-medium truncate ${styles.text}`}>{timeStr}</span>
        <span className={`ml-auto text-[10px] ${styles.text} opacity-70`}>{STATUS_LABELS[schedule.status]}</span>
      </div>
      <p className="text-gray-700 truncate text-[11px] leading-tight">{schedule.accountNickname}</p>
      {schedule.imageIds.length > 0 && (
        <div className="flex items-center gap-0.5 mt-1">
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[10px] text-gray-400">{schedule.imageIds.length}</span>
        </div>
      )}
    </div>
  );
};

// ─── ConflictWarning (inline child) ──────────────────────────
interface ConflictWarningProps {
  count: number;
}

const ConflictWarning: React.FC<ConflictWarningProps> = ({ count }) => {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
      <svg className="w-4 h-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>当前视图有 <strong>{count}</strong> 个时间冲突（同一账号间隔 &lt; 2h）</span>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────
export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  schedules,
  onDateChange,
  onScheduleUpdate,
  onScheduleClick,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const weekStart = useMemo(() => startOfWeek(currentDate), [currentDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const dragIdRef = useRef<string | null>(null);

  // Navigate weeks
  const goWeek = useCallback((delta: number) => {
    setCurrentDate((prev) => {
      const next = addDays(prev, delta * 7);
      const ws = startOfWeek(next);
      const we = addDays(ws, 6);
      onDateChange(formatDate(ws), formatDate(we));
      return next;
    });
  }, [onDateChange]);

  const goToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    const ws = startOfWeek(today);
    const we = addDays(ws, 6);
    onDateChange(formatDate(ws), formatDate(we));
  }, [onDateChange]);

  // Group schedules by day index
  const schedulesByDay = useMemo(() => {
    const map: Record<number, Schedule[]> = {};
    for (let i = 0; i < 7; i++) map[i] = [];
    schedules.forEach((s) => {
      const d = new Date(s.scheduledAt);
      for (let i = 0; i < 7; i++) {
        if (isSameDay(d, weekDays[i])) {
          map[i].push(s);
          break;
        }
      }
    });
    // Sort each day by time
    Object.values(map).forEach((arr) => arr.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()));
    return map;
  }, [schedules, weekDays]);

  // Conflict detection: same account within 2h
  const conflictCount = useMemo(() => {
    let count = 0;
    const byAccount: Record<string, Date[]> = {};
    schedules.forEach((s) => {
      if (!byAccount[s.accountId]) byAccount[s.accountId] = [];
      byAccount[s.accountId].push(new Date(s.scheduledAt));
    });
    Object.values(byAccount).forEach((times) => {
      times.sort((a, b) => a.getTime() - b.getTime());
      for (let i = 1; i < times.length; i++) {
        if (times[i].getTime() - times[i - 1].getTime() < 2 * 60 * 60 * 1000) count++;
      }
    });
    return count;
  }, [schedules]);

  // Drag & Drop
  const handleDragStart = useCallback((_e: React.DragEvent, id: string) => {
    dragIdRef.current = id;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dayIndex: number, hour: number) => {
    e.preventDefault();
    if (!dragIdRef.current) return;
    const target = new Date(weekDays[dayIndex]);
    target.setHours(hour, 0, 0, 0);
    onScheduleUpdate(dragIdRef.current, target.toISOString());
    dragIdRef.current = null;
  }, [weekDays, onScheduleUpdate]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const today = new Date();

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">排期日历</h2>
          <span className="text-sm text-gray-500">
            {formatDate(weekDays[0])} — {formatDate(weekDays[6])}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            今天
          </button>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => goWeek(-1)}
              className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="上一周"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-px h-5 bg-gray-200" />
            <button
              onClick={() => goWeek(1)}
              className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="下一周"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Conflict warning */}
      <ConflictWarning count={conflictCount} />

      {/* Calendar grid */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-200">
          <div className="p-2" />
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={i}
                className={`py-3 px-2 text-center border-l border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}
              >
                <div className={`text-xs ${isToday ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  {DAY_LABELS[i]}
                </div>
                <div className={`text-sm mt-0.5 ${isToday ? 'text-blue-700 font-bold' : 'text-gray-900 font-medium'}`}>
                  {formatShortDate(day)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-gray-100 last:border-b-0">
              <div className="p-2 text-right pr-3">
                <span className="text-[11px] text-gray-400 font-mono">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
              {weekDays.map((_, dayIdx) => {
                const daySchedules = schedulesByDay[dayIdx].filter((s) => {
                  const h = new Date(s.scheduledAt).getHours();
                  return h === hour;
                });
                return (
                  <div
                    key={dayIdx}
                    className="min-h-[56px] p-1 border-l border-gray-100 transition-colors hover:bg-slate-50"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dayIdx, hour)}
                  >
                    <div className="flex flex-col gap-1">
                      {daySchedules.map((s) => (
                        <ScheduleCard
                          key={s.id}
                          schedule={s}
                          onClick={() => onScheduleClick(s.id)}
                          onDragStart={handleDragStart}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-gray-500">
        {(['pending', 'publishing', 'success', 'failed', 'cancelled'] as const).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${STATUS_STYLES[status].dot}`} />
            <span>{STATUS_LABELS[status]}</span>
          </div>
        ))}
        <span className="ml-auto text-gray-400">拖拽待发布卡片可调整时间</span>
      </div>
    </div>
  );
};

export default ScheduleCalendar;