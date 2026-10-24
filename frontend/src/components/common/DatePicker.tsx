import React from 'react';
import { Calendar } from 'lucide-react';

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ label, error, className = '', id, ...props }) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="date"
          className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-neutral-900 transition-colors focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 ${
            error ? 'border-red-500' : 'border-neutral-300'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export const CurrencyDisplay: React.FC<{
  amount: number;
  showDecimals?: boolean;
  className?: string;
}> = ({ amount, showDecimals = false, className = '' }) => {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount || 0);

  return <span className={`font-mono tabular-nums font-medium ${className}`}>{formatted}</span>;
};
