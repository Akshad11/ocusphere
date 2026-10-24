import React from 'react';

export interface StatusBadgeProps {
  status: string;
  type?: 'booking' | 'stock' | 'sale' | 'general' | 'po';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const norm = status.toLowerCase().replace(/_/g, ' ');

  // Semantic color accents (60-30-10 rule: quiet text with distinct semantic color)
  let dotColor = 'bg-neutral-400';
  let textColor = 'text-neutral-700';

  if (['completed', 'received', 'published', 'active', 'collected', 'delivered', 'in stock'].includes(norm)) {
    dotColor = 'bg-emerald-600';
    textColor = 'text-emerald-800';
  } else if (['ready for pickup', 'confirmed', 'sent', 'approved'].includes(norm)) {
    dotColor = 'bg-blue-600';
    textColor = 'text-blue-800';
  } else if (['pending', 'preparing', 'submitted', 'partially received', 'low stock', 'in progress', 'queued'].includes(norm)) {
    dotColor = 'bg-amber-600';
    textColor = 'text-amber-800';
  } else if (['cancelled', 'expired', 'rejected', 'out of stock', 'failed', 'refunded'].includes(norm)) {
    dotColor = 'bg-rose-600';
    textColor = 'text-rose-800';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
      <span className="capitalize">{status}</span>
    </span>
  );
};
