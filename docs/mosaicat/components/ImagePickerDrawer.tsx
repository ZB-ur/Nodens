import React, { useState, useCallback, useMemo } from 'react';

interface ImageItem {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  category: string | null;
  width: number;
  height: number;
}

interface ImagePickerDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedImageIds: string[];
  onConfirm: (imageIds: string[]) => void;
  maxCount?: number;
}

const ImagePickerDrawer: React.FC<ImagePickerDrawerProps> = ({
  open,
  onClose,
  selectedImageIds,
  onConfirm,
  maxCount = 9,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string[]>(selectedImageIds);
  const [activeTab, setActiveTab] = useState<'library' | 'selected'>('library');
  const [category, setCategory] = useState<string>('all');
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [dragItem, setDragItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 20;

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (category !== 'all') params.set('category', category);
      const res = await fetch(`/api/v1/images?${params}`);
      const json = await res.json();
      setImages(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [page, category]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/images/categories');
      const json = await res.json();
      setCategories(json.data ?? []);
    } catch {
      // handle error
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      setSelected(selectedImageIds);
      fetchImages();
      fetchCategories();
    }
  }, [open, selectedImageIds, fetchImages, fetchCategories]);

  React.useEffect(() => {
    if (open) fetchImages();
  }, [page, category, open, fetchImages]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= maxCount) return prev;
      return [...prev, id];
    });
  };

  const removeSelected = (id: string) => {
    setSelected((prev) => prev.filter((i) => i !== id));
  };

  const selectedImages = useMemo(
    () => selected.map((id) => images.find((img) => img.id === id)).filter(Boolean) as ImageItem[],
    [selected, images]
  );

  const handleDragStart = (index: number) => setDragItem(index);
  const handleDragEnter = (index: number) => setDragOverItem(index);
  const handleDragEnd = () => {
    if (dragItem === null || dragOverItem === null || dragItem === dragOverItem) {
      setDragItem(null);
      setDragOverItem(null);
      return;
    }
    const newSelected = [...selected];
    const [removed] = newSelected.splice(dragItem, 1);
    newSelected.splice(dragOverItem, 0, removed);
    setSelected(newSelected);
    setDragItem(null);
    setDragOverItem(null);
  };

  const handleConfirm = () => onConfirm(selected);

  const totalPages = Math.ceil(total / pageSize);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-50 shadow-xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">选择图片</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-6">
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'library'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('library')}
          >
            素材库
          </button>
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'selected'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('selected')}
          >
            已选 ({selected.length}/{maxCount})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'library' ? (
            <div className="p-4">
              {/* Category Filter */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                <button
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    category === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => { setCategory('all'); setPage(1); }}
                >
                  全部
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      category === cat.name
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    onClick={() => { setCategory(cat.name); setPage(1); }}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>

              {/* Image Grid */}
              {loading ? (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="text-sm">暂无图片素材</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img) => {
                      const isSelected = selected.includes(img.id);
                      const selectIndex = selected.indexOf(img.id);
                      const isDisabled = !isSelected && selected.length >= maxCount;
                      return (
                        <button
                          key={img.id}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                            isSelected
                              ? 'border-blue-600 ring-2 ring-blue-600/20'
                              : isDisabled
                              ? 'border-gray-200 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-blue-400'
                          }`}
                          onClick={() => !isDisabled && toggleSelect(img.id)}
                          disabled={isDisabled}
                        >
                          <img
                            src={img.thumbnailUrl || img.url}
                            alt={img.filename}
                            className="w-full h-full object-cover"
                          />
                          {/* Selection indicator */}
                          <div
                            className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/80 border border-gray-300 text-transparent group-hover:border-blue-400'
                            }`}
                          >
                            {isSelected ? selectIndex + 1 : ''}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <button
                        className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        上一页
                      </button>
                      <span className="text-sm text-gray-500">
                        {page} / {totalPages}
                      </span>
                      <button
                        className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        下一页
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* Selected tab - sortable list */
            <div className="p-4">
              {selected.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                  <p className="text-sm">尚未选择图片</p>
                  <p className="text-xs text-gray-300 mt-1">从素材库中点击图片添加</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 mb-3">拖拽调整顺序，第一张为封面图</p>
                  {selected.map((id, index) => {
                    const img = images.find((i) => i.id === id);
                    return (
                      <div
                        key={id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                          dragOverItem === index
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        {/* Drag handle */}
                        <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>

                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {img && (
                            <img
                              src={img.thumbnailUrl || img.url}
                              alt={img.filename}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {img?.filename ?? id}
                          </p>
                          <p className="text-xs text-gray-400">
                            {index === 0 ? '封面图' : `第 ${index + 1} 张`}
                          </p>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeSelected(id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
          <p className="text-sm text-gray-500">
            已选 <span className="font-semibold text-gray-900">{selected.length}</span> / {maxCount} 张
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              确认选择
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ImagePickerDrawer;