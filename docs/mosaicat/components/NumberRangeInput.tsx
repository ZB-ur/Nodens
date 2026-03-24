import React, { useCallback } from 'react';

interface NumberRangeInputProps {
  label: string;
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  unit?: string;
}

const NumberRangeInput: React.FC<NumberRangeInputProps> = ({
  label,
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  unit,
}) => {
  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      if (v >= min && v <= valueMax) {
        onChange(v, valueMax);
      }
    },
    [min, valueMax, onChange],
  );

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      if (v <= max && v >= valueMin) {
        onChange(valueMin, v);
      }
    },
    [max, valueMin, onChange],
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="number"
            value={valueMin}
            min={min}
            max={valueMax}
            onChange={handleMinChange}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            placeholder="最小值"
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {unit}
            </span>
          )}
        </div>
        <span className="text-sm text-gray-400 shrink-0">—</span>
        <div className="relative flex-1">
          <input
            type="number"
            value={valueMax}
            min={valueMin}
            max={max}
            onChange={handleMaxChange}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
            placeholder="最大值"
          />
          {unit && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {unit}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-400">
        范围：{min} ~ {max} {unit ?? ''}
      </p>
    </div>
  );
};

export default NumberRangeInput;