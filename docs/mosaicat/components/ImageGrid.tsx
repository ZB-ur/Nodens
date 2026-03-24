import React, { useState, useMemo, useCallback } from 'react';

export interface Image {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  size: number;
  width: number;
  height: number;
  accountId: string | null;
  category: string | null;
  tags: string[];
  createdAt: string;
}

interface CategoryCount {
  name: string;
  count: number;
}

interface ImageGridProps {
  images: Image[];
  selectable?: boolean;
  selectedIds?: string[];
  onSelect?: (ids: string[]) => void;
  onDelete?: (id: string) => void;
  onPreview?: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  selectable = false,
  selectedIds = [],
  onSelect,
  onDelete,
  onPreview,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo<CategoryCount[]>(() => {
    const map = new Map<string, number>();
    for (const img of images) {
      const cat = img.category ?? '未分类';
      map.set(cat, (map.get(cat) ?? 0) + 1);
    }
    return Array.from(map, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count,
    );
  }, [images]);

  const filtered = useMemo(
    () =>
      activeCategory
        ? images.filter(
            (img) =>
              (img.category ?? '未分类') === activeCategory,
          )
        : images,
    [images, activeCategory],
  );

  const toggleSelect = useCallback(
    (id: string) => {
      if (!onSelect) return;
      const next = selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id];
      onSelect(next);
    },
    [selectedIds, onSelect],
  );

  const selectAll = useCallback(() => {
    if (!onSelect) return;
    const allFilteredIds = filtered.map((img) => img.id);
    const allSelected = allFilteredIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      onSelect(selectedIds.filter((id) => !allFilteredIds.includes(id)));
    } else {
      const merged = new Set([...selectedIds, ...allFilteredIds]);
      onSelect(Array.from(merged));
    }
  }, [filtered, selectedIds, onSelect]);

  const allFilteredSelected =
    filtered.length > 0 &&
    filtered.every((img) => selectedIds.includes(img.id));

  return (
    <div className="space-y-4">
      {/* Category Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          全部
          <span className="ml-1 opacity-70">{images.length}</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() =>
              setActiveCategory(cat.name === activeCategory ? null : cat.name)
            }
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeCategory === cat.name
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.name}
            <span className="ml-1 opacity-70">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Selection Toolbar */}
      {selectable && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allFilteredSelected}
              onChange={selectAll}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            全选
          </label>
          {selectedIds.length > 0 && (
            <span className="text-sm text-blue-600 font-medium">
              已选 {selectedIds.length} 张
            </span>
          )}
        </div>
      )}

      {/* Image Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg
            className="w-12 h-12 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
            />
          </svg>
          <p className="text-sm">暂无图片</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((img) => {
            const isSelected = selectedIds.includes(img.id);
            return (
              <div
                key={img.id}
                className={`group relative bg-white border rounded-xl overflow-hidden transition-all ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* Thumbnail */}
                <div
                  className="relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
                  onClick={() =>
                    selectable ? toggleSelect(img.id) : onPreview?.(img.id)
                  }
                >
                  <img
                    src={img.thumbnailUrl}
                    alt={img.filename}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Selection Checkbox */}
                  {selectable && (
                    <div
                      className={`absolute top-2 left-2 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white/80 border-gray-300 group-hover:border-blue-400'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    {onPreview && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(img.id);
                        }}
                        className="w-8 h-8 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center text-gray-700 shadow-sm"
                        title="预览"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(img.id);
                        }}
                        className="w-8 h-8 rounded-lg bg-white/90 hover:bg-red-50 flex items-center justify-center text-red-500 shadow-sm"
                        title="删除"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Image Info */}
                <div className="px-2.5 py-2">
                  <p className="text-xs text-gray-900 font-medium truncate">
                    {img.filename}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {img.width}×{img.height} · {formatFileSize(img.size)}
                  </p>
                  {img.category && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-600 rounded">
                      {img.category}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ImageGrid;