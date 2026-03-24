import React, { useCallback, useRef, useState } from 'react';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  uploading?: boolean;
  progress?: number;
}

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp';
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ACCEPT_LABEL_MAP: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WEBP',
};

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${bytes}B`;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  multiple = true,
  uploading = false,
  progress = 0,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes = accept.split(',').map((t) => t.trim());
  const acceptLabel = acceptTypes
    .map((t) => ACCEPT_LABEL_MAP[t] ?? t)
    .join(' / ');

  const validateFiles = useCallback(
    (fileList: FileList | File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errs: string[] = [];
      const files = Array.from(fileList);

      for (const file of files) {
        if (!acceptTypes.includes(file.type)) {
          errs.push(`「${file.name}」格式不支持，仅允许 ${acceptLabel}`);
          continue;
        }
        if (file.size > maxSize) {
          errs.push(`「${file.name}」超过 ${formatSize(maxSize)} 大小限制`);
          continue;
        }
        valid.push(file);
      }
      return { valid, errors: errs };
    },
    [acceptTypes, acceptLabel, maxSize],
  );

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const { valid, errors: errs } = validateFiles(fileList);
      setErrors(errs);
      if (valid.length > 0) {
        onUpload(valid);
      }
    },
    [validateFiles, onUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (uploading) return;
      handleFiles(e.dataTransfer.files);
    },
    [uploading, handleFiles],
  );

  const handleClick = useCallback(() => {
    if (uploading) return;
    inputRef.current?.click();
  }, [uploading]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        e.target.value = '';
      }
    },
    [handleFiles],
  );

  return (
    <div className="w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center gap-3
          rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer
          ${uploading ? 'pointer-events-none opacity-60' : ''}
          ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-slate-50'
          }
        `}
      >
        {/* Upload icon */}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            dragOver ? 'bg-blue-100' : 'bg-gray-100'
          }`}
        >
          <svg
            className={`h-6 w-6 ${dragOver ? 'text-blue-600' : 'text-gray-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
            />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {dragOver ? '松开以上传文件' : '拖拽图片到此处，或'}
            {!dragOver && (
              <span className="text-blue-600 hover:text-blue-700"> 点击选择</span>
            )}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            支持 {acceptLabel}，单张不超过 {formatSize(maxSize)}
            {multiple && '，可多选'}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Progress bar */}
        {uploading && (
          <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-500 tabular-nums">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <div className="mt-3 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="flex items-start gap-1.5 text-xs text-red-500">
              <svg
                className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;