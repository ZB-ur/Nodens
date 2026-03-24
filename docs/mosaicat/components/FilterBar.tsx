import React, { useState, useRef, useEffect } from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDefinition {
  key: string;
  label: string;
  type: 'select' | 'tag' | 'search';
  options?: FilterOption[];
}

interface FilterBarProps {
  filters: FilterDefinition[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, values, onChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {filters.map((filter) => {
        switch (filter.type) {
          case 'select':
            return (
              <SelectFilter
                key={filter.key}
                filter={filter}
                value={values[filter.key] ?? ''}
                onChange={(val) => onChange(filter.key, val)}
              />
            );
          case 'tag':
            return (
              <TagFilter
                key={filter.key}
                filter={filter}
                value={values[filter.key] ?? []}
                onChange={(val) => onChange(filter.key, val)}
              />
            );
          case 'search':
            return (
              <SearchFilter
                key={filter.key}
                filter={filter}
                value={values[filter.key] ?? ''}
                onChange={(val) => onChange(filter.key, val)}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

/* ── Select Filter ── */
interface SelectFilterProps {
  filter: FilterDefinition;
  value: string;
  onChange: (value: string) => void;
}

const SelectFilter: React.FC<SelectFilterProps> = ({ filter, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedLabel = filter.options?.find((o) => o.value === value)?.label;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-sm text-gray-900 transition hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
      >
        <span className="text-gray-600">{filter.label}:</span>
        <span className="font-medium">{selectedLabel || '全部'}</span>
        <svg className={`h-4 w-4 text-gray-400 transition ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 z-10 mt-1 min-w-[160px] rounded-lg border border-gray-200 bg-white py-1 shadow-md">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`block w-full px-3 py-1.5 text-left text-sm transition hover:bg-slate-50 ${value === '' ? 'font-medium text-blue-600' : 'text-gray-600'}`}
          >
            全部
          </button>
          {filter.options?.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`block w-full px-3 py-1.5 text-left text-sm transition hover:bg-slate-50 ${value === opt.value ? 'font-medium text-blue-600' : 'text-gray-600'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Tag Filter ── */
interface TagFilterProps {
  filter: FilterDefinition;
  value: string[];
  onChange: (value: string[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ filter, value, onChange }) => {
  const toggle = (tagValue: string) => {
    if (value.includes(tagValue)) {
      onChange(value.filter((v) => v !== tagValue));
    } else {
      onChange([...value, tagValue]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{filter.label}:</span>
      <div className="flex flex-wrap gap-1.5">
        {filter.options?.map((opt) => {
          const active = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ── Search Filter ── */
interface SearchFilterProps {
  filter: FilterDefinition;
  value: string;
  onChange: (value: string) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ filter, value, onChange }) => {
  return (
    <div className="relative ml-auto">
      <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={filter.label}
        className="w-56 rounded-lg border border-gray-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default FilterBar;