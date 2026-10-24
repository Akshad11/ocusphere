import React from 'react';
import { BookingStatus } from '../../types/booking.types';
import { StatusBadge } from '../common/StatusBadge';

export const BookingStatusBadge: React.FC<{ status: BookingStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  return <StatusBadge status={status} className={className} />;
};
