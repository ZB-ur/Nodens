import React from 'react';
import { PublishStatusBadge } from './PublishStatusBadge';

export type ScheduleStatus = 'pending' | 'publishing' | 'success' | 'failed' | 'cancelled';

export interface Schedule {
  id: string;
  accountId: string;
  accountNickname: string;
  draftId: string | null;
  scheduledAt: string;
  status: ScheduleStatus;
  imageIds: string[];
  publishLogId: string | null;
  createdAt: string;
  updatedAt: string;
  /** Denormalized from draft for display */
  title?: string;
  body?: string;
}

export interface ScheduleCardProps {
  schedule: Schedule;
  onClick?: (scheduleId: string) => void;
  draggable?: boolean;
}

const statusColorMap: Record<ScheduleStatus, string> = {
  pending: 'border-l-blue-500',
  publishing: 'border-l-amber-500',
  success: 'border-l-emerald-500',
  failed: 'border-l-red-500',
  cancelled: 'border-l-gray-400',
};

export const ScheduleCard: React.FC<ScheduleCardProps> = ({
  schedule,
  onClick,
  draggable = false,
}) => {
  const time = new Date(schedule.scheduledAt).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const imageCount = schedule.imageIds.length;

  const handleClick = () => {
    onClick?.(schedule.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(schedule.id);
    }
  };

  return (
    <div
      className={`
        group relative bg-white rounded-lg border border-gray-200 border-l-[3px]
        ${statusColorMap[schedule.status]}
        p-2.5 cursor-pointer transition-all duration-150
        hover:shadow-md hover:border-gray-300
        ${draggable ? 'active:shadow-lg active:scale-[1.02]' : ''}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      draggable={draggable}
      role="button"
      tabIndex={0}
      aria-label={`排期: ${schedule.title || '未关联内容'} - ${time}`}
    >
      {/* Header: time + status */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-900">{time}</span>
        <PublishStatusBadge status={schedule.status} size="sm" />
      </div>

      {/* Title / content summary */}
      <p className="text-sm text-gray-900 font-medium leading-tight truncate mb-1">
        {schedule.title || '未关联内容'}
      </p>

      {/* Meta row: account + image count */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="truncate max-w-[60%]">
          @{schedule.accountNickname}
        </span>
        {imageCount > 0 && (
          <span className="flex items-center gap-0.5 shrink-0">
            <svg
              className="w-3.5 h-3.5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
            {imageCount}
          </span>
        )}
      </div>

      {/* Drag handle indicator (visible on hover when draggable) */}
      {draggable && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-3.5 h-3.5 text-gray-300"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <circle cx="5" cy="3" r="1.2" />
            <circle cx="11" cy="3" r="1.2" />
            <circle cx="5" cy="8" r="1.2" />
            <circle cx="11" cy="8" r="1.2" />
            <circle cx="5" cy="13" r="1.2" />
            <circle cx="11" cy="13" r="1.2" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ScheduleCard;