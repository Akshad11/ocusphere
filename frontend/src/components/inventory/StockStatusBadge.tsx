import React from 'react';
import { StatusBadge } from '../common/StatusBadge';

export const StockStatusBadge: React.FC<{
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | string;
  className?: string;
}> = ({ status, className = '' }) => {
  return <StatusBadge status={status} type="stock" className={className} />;
};
