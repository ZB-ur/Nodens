import React from 'react';

export interface Image {
  id: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

export interface ContentPreviewCardProps {
  title: string;
  body: string;
  hashtags: string[];
  images?: Image[];
}

export const ContentPreviewCard: React.FC<ContentPreviewCardProps> = ({
  title,
  body,
  hashtags,
  images = [],
}) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Phone-style frame */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header bar — mimics XHS note top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">小</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">内容预览</p>
              <p className="text-xs text-gray-400">小红书笔记</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">预览模式</span>
        </div>

        {/* Image carousel area */}
        {images.length > 0 ? (
          <div className="relative aspect-[3/4] bg-gray-50">
            <img
              src={images[currentImageIndex]?.url || images[currentImageIndex]?.thumbnailUrl}
              alt={`图片 ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                  aria-label="上一张"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                  aria-label="下一张"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center text-gray-300">
            <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">暂无配图</span>
          </div>
        )}

        {/* Content area */}
        <div className="px-4 py-4 space-y-3">
          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">
            {title}
          </h3>

          {/* Body text */}
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap line-clamp-6">
            {body}
          </p>

          {/* Hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom interaction bar */}
        <div className="flex items-center justify-around px-4 py-3 border-t border-gray-100">
          <button className="flex items-center gap-1 text-gray-400 hover:text-rose-500 transition-colors" disabled>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className="text-xs">赞</span>
          </button>
          <button className="flex items-center gap-1 text-gray-400 hover:text-amber-500 transition-colors" disabled>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span className="text-xs">收藏</span>
          </button>
          <button className="flex items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors" disabled>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
            </svg>
            <span className="text-xs">评论</span>
          </button>
          <button className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors" disabled>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            <span className="text-xs">分享</span>
          </button>
        </div>
      </div>

      {/* Character count info */}
      <div className="flex justify-between mt-3 px-1">
        <span className={`text-xs ${title.length > 20 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          标题 {title.length}/20
        </span>
        <span className={`text-xs ${body.length > 1000 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          正文 {body.length}/1000
        </span>
      </div>
    </div>
  );
};

export default ContentPreviewCard;