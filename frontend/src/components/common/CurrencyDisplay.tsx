import React from 'react';
import { formatINR } from '../../utils/currency';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showDecimals?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  className = '',
  showDecimals = false,
}) => {
  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {formatINR(amount, showDecimals)}
    </span>
  );
};
