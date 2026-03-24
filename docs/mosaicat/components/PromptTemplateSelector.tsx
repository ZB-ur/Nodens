import React, { useState, useMemo } from 'react';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  isBuiltin: boolean;
  createdAt: string;
}

interface PromptTemplateSelectorProps {
  templates: PromptTemplate[];
  selectedId?: string;
  onChange: (templateId: string) => void;
  onCreateCustom?: () => void;
  onEditCustom?: (templateId: string) => void;
  onDeleteCustom?: (templateId: string) => void;
}

export const PromptTemplateSelector: React.FC<PromptTemplateSelectorProps> = ({
  templates,
  selectedId,
  onChange,
  onCreateCustom,
  onEditCustom,
  onDeleteCustom,
}) => {
  const [filter, setFilter] = useState<'all' | 'builtin' | 'custom'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    if (filter === 'builtin') return templates.filter((t) => t.isBuiltin);
    if (filter === 'custom') return templates.filter((t) => !t.isBuiltin);
    return templates;
  }, [templates, filter]);

  const builtinCount = templates.filter((t) => t.isBuiltin).length;
  const customCount = templates.filter((t) => !t.isBuiltin).length;

  const handleDelete = (templateId: string) => {
    if (deleteConfirmId === templateId) {
      onDeleteCustom?.(templateId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(templateId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Prompt 模板</h3>
          <p className="text-sm text-gray-600 mt-0.5">
            选择一个模板来生成文案，或创建自定义模板
          </p>
        </div>
        {onCreateCustom && (
          <button
            onClick={onCreateCustom}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新建模板
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {[
          { key: 'all' as const, label: '全部', count: templates.length },
          { key: 'builtin' as const, label: '内置', count: builtinCount },
          { key: 'custom' as const, label: '自定义', count: customCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${filter === tab.key ? 'text-gray-500' : 'text-gray-400'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Template Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
          <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p className="mt-2 text-sm text-gray-500">
            {filter === 'custom' ? '暂无自定义模板' : '暂无模板'}
          </p>
          {filter === 'custom' && onCreateCustom && (
            <button
              onClick={onCreateCustom}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              创建第一个自定义模板
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTemplates.map((tpl) => {
            const isSelected = selectedId === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => onChange(tpl.id)}
                className={`relative group cursor-pointer border rounded-xl p-4 transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* Selection indicator */}
                <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                }`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </div>

                {/* Template info */}
                <div className="pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{tpl.name}</h4>
                    {tpl.isBuiltin ? (
                      <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded">
                        内置
                      </span>
                    ) : (
                      <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 rounded">
                        自定义
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{tpl.description}</p>
                  <div className="text-xs text-gray-400 font-mono bg-gray-50 rounded-md px-2 py-1.5 line-clamp-2 border border-gray-100">
                    {tpl.template}
                  </div>
                </div>

                {/* Custom template actions */}
                {!tpl.isBuiltin && (onEditCustom || onDeleteCustom) && (
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                    {onEditCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditCustom(tpl.id);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                        编辑
                      </button>
                    )}
                    {onDeleteCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(tpl.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                          deleteConfirmId === tpl.id
                            ? 'text-white bg-red-500 hover:bg-red-600'
                            : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        {deleteConfirmId === tpl.id ? '确认删除' : '删除'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PromptTemplateSelector;