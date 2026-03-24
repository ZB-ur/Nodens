import React, { useCallback } from 'react';

export interface PresetTopic {
  id: string;
  name: string;
  icon: string;
}

export interface PresetTopicSelectorProps {
  presets: PresetTopic[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const PresetTopicSelector: React.FC<PresetTopicSelectorProps> = ({
  presets,
  selected,
  onChange,
}) => {
  const handleToggle = useCallback(
    (id: string) => {
      if (selected.includes(id)) {
        onChange(selected.filter((s) => s !== id));
      } else {
        onChange([...selected, id]);
      }
    },
    [selected, onChange],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">预设主题</h3>
        {selected.length > 0 && (
          <span className="text-xs text-gray-400">
            已选 {selected.length} 项
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {presets.map((preset) => {
          const isSelected = selected.includes(preset.id);
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleToggle(preset.id)}
              className={`
                relative flex flex-col items-center justify-center gap-2
                rounded-xl border-2 p-4 transition-all duration-150
                hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              {isSelected && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                  <svg
                    className="h-2.5 w-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
              )}
              <span className="text-2xl leading-none">{preset.icon}</span>
              <span className="text-xs font-medium leading-none">
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PresetTopicSelector;