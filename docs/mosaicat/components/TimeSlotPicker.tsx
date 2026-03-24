import React, { useCallback, useMemo } from 'react';

interface RecommendedSlot {
  time: string;
  label: string;
  priority: 'high' | 'medium' | 'low';
}

interface TimeSlotPickerProps {
  selectedSlots: string[];
  onChange: (slots: string[]) => void;
  recommendedSlots?: RecommendedSlot[];
}

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

const PRIORITY_STYLES: Record<string, { ring: string; badge: string; badgeText: string; label: string }> = {
  high: {
    ring: 'ring-2 ring-amber-400',
    badge: 'bg-amber-100 text-amber-700',
    badgeText: '🔥 高峰',
    label: 'text-amber-600',
  },
  medium: {
    ring: 'ring-2 ring-blue-300',
    badge: 'bg-blue-100 text-blue-700',
    badgeText: '📈 推荐',
    label: 'text-blue-600',
  },
  low: {
    ring: 'ring-1 ring-gray-300',
    badge: 'bg-gray-100 text-gray-600',
    badgeText: '一般',
    label: 'text-gray-500',
  },
};

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedSlots,
  onChange,
  recommendedSlots = [],
}) => {
  const recommendedMap = useMemo(() => {
    const map = new Map<string, RecommendedSlot>();
    for (const slot of recommendedSlots) {
      map.set(slot.time, slot);
    }
    return map;
  }, [recommendedSlots]);

  const toggleSlot = useCallback(
    (time: string) => {
      if (selectedSlots.includes(time)) {
        onChange(selectedSlots.filter((t) => t !== time));
      } else {
        onChange([...selectedSlots, time].sort());
      }
    },
    [selectedSlots, onChange],
  );

  const selectedCount = selectedSlots.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">选择发布时段</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            已选 <span className="font-medium text-blue-600">{selectedCount}</span> 个时段
            {recommendedSlots.length > 0 && ' · 高亮为推荐流量高峰'}
          </p>
        </div>
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            清除全部
          </button>
        )}
      </div>

      {/* Legend */}
      {recommendedSlots.length > 0 && (
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-amber-100 ring-1 ring-amber-400" />
            <span className="text-gray-500">高峰时段</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-blue-100 ring-1 ring-blue-300" />
            <span className="text-gray-500">推荐时段</span>
          </span>
        </div>
      )}

      {/* Time Slot Grid */}
      <div className="grid grid-cols-6 gap-2">
        {TIME_SLOTS.map((time) => {
          const isSelected = selectedSlots.includes(time);
          const rec = recommendedMap.get(time);
          const priority = rec ? PRIORITY_STYLES[rec.priority] : null;

          return (
            <button
              key={time}
              type="button"
              onClick={() => toggleSlot(time)}
              className={[
                'relative flex flex-col items-center justify-center py-2.5 px-1 rounded-lg border text-sm transition-all duration-150',
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : priority
                    ? `bg-white border-gray-200 ${priority.ring} hover:bg-gray-50`
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
              ].join(' ')}
            >
              <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                {time}
              </span>
              {rec && !isSelected && (
                <span className={`text-[10px] mt-0.5 ${priority!.label}`}>
                  {rec.label}
                </span>
              )}
              {rec && isSelected && (
                <span className="text-[10px] mt-0.5 text-blue-200">
                  {rec.label}
                </span>
              )}
              {/* Priority badge dot */}
              {rec && rec.priority === 'high' && !isSelected && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Summary */}
      {selectedCount > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedSlots.map((time) => {
            const rec = recommendedMap.get(time);
            return (
              <span
                key={time}
                className={[
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium',
                  rec ? PRIORITY_STYLES[rec.priority].badge : 'bg-blue-50 text-blue-700',
                ].join(' ')}
              >
                {time}
                {rec && <span className="opacity-70">· {rec.label}</span>}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSlot(time);
                  }}
                  className="ml-0.5 hover:opacity-70"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;