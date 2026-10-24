import React from 'react';
import { BookingStatus, BookingTimelineEvent } from '../../types/booking.types';
import { StatusBadge } from '../common/StatusBadge';
import { formatDateTime } from '../../utils/dates';

export const BookingStatusBadge: React.FC<{ status: BookingStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  return <StatusBadge status={status} className={className} />;
};

export const BookingTimeline: React.FC<{ timeline: BookingTimelineEvent[]; className?: string }> = ({
  timeline,
  className = '',
}) => {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
        {timeline.map((event, idx) => (
          <div key={idx} className="relative mb-4 last:mb-0">
            <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-neutral-900 ring-4 ring-white" />
            <div className="flex items-center gap-2">
              <BookingStatusBadge status={event.status} />
              <span className="text-[11px] text-neutral-400 font-mono tabular-nums">
                {formatDateTime(event.timestamp)}
              </span>
            </div>
            {event.note && <p className="text-xs text-neutral-700 mt-1">{event.note}</p>}
            <p className="text-[11px] text-neutral-400 mt-0.5">By: {event.actor}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
