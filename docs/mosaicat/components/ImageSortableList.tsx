import React, { useState, useRef, useCallback } from 'react';

export interface Image {
  id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  size: number;
  width: number;
  height: number;
  accountId?: string | null;
  category?: string | null;
  tags: string[];
  createdAt: string;
}

interface ImageSortableListProps {
  images: Image[];
  onReorder: (imageIds: string[]) => void;
  onRemove: (imageId: string) => void;
  maxCount?: number;
}

const ImageSortableList: React.FC<ImageSortableListProps> = ({
  images,
  onReorder,
  onRemove,
  maxCount = 9,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNode = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      dragNode.current = e.currentTarget;
      setDragIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      // Make the drag image slightly transparent
      requestAnimationFrame(() => {
        if (dragNode.current) {
          dragNode.current.style.opacity = '0.4';
        }
      });
    },
    []
  );

  const handleDragEnter = useCallback(
    (index: number) => {
      if (dragIndex === null || dragIndex === index) return;
      setOverIndex(index);
    },
    [dragIndex]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === dropIndex) return;

      const reordered = [...images];
      const [moved] = reordered.splice(dragIndex, 1);
      reordered.splice(dropIndex, 0, moved);
      onReorder(reordered.map((img) => img.id));
    },
    [dragIndex, images, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    if (dragNode.current) {
      dragNode.current.style.opacity = '1';
    }
    setDragIndex(null);
    setOverIndex(null);
    dragNode.current = null;
  }, []);

  const handleRemove = useCallback(
    (e: React.MouseEvent, imageId: string) => {
      e.stopPropagation();
      onRemove(imageId);
    },
    [onRemove]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-900">
          已选图片
        </span>
        <span className="text-xs text-gray-600">
          {images.length}/{maxCount} 张
        </span>
      </div>

      {/* Empty State */}
      {images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-white">
          <svg
            className="w-10 h-10 text-gray-300 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
            />
          </svg>
          <p className="text-sm text-gray-400">暂无已选图片</p>
          <p className="text-xs text-gray-400 mt-1">从素材库中选择图片</p>
        </div>
      )}

      {/* Sortable List */}
      <div className="space-y-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              group flex items-center gap-3 p-2 bg-white border rounded-xl
              cursor-grab active:cursor-grabbing transition-all duration-150
              ${
                overIndex === index && dragIndex !== index
                  ? 'border-blue-400 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }
              ${dragIndex === index ? 'opacity-40' : 'opacity-100'}
            `}
          >
            {/* Drag Handle + Order Number */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <svg
                className="w-4 h-4 text-gray-300 group-hover:text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" />
              </svg>
              <span className="w-5 h-5 flex items-center justify-center rounded-md bg-blue-600 text-white text-xs font-bold">
                {index + 1}
              </span>
            </div>

            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <img
                src={image.thumbnailUrl || image.url}
                alt={image.filename}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {image.filename}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {image.width}×{image.height} · {formatFileSize(image.size)}
              </p>
              {image.category && (
                <span className="inline-block mt-1 px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                  {image.category}
                </span>
              )}
            </div>

            {/* Cover Badge (first image) */}
            {index === 0 && (
              <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg">
                封面
              </span>
            )}

            {/* Remove Button */}
            <button
              onClick={(e) => handleRemove(e, image.id)}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
                text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="移除图片"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Hint */}
      {images.length > 1 && (
        <p className="text-xs text-gray-400 mt-2 text-center">
          拖拽调整顺序，第一张为封面图
        </p>
      )}
    </div>
  );
};

export default ImageSortableList;