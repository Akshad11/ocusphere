import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  prefixElement,
  suffixElement,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-neutral-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefixElement && (
          <div className="absolute left-3 flex items-center pointer-events-none text-neutral-400">
            {prefixElement}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-neutral-300'
          } ${prefixElement ? 'pl-9' : ''} ${suffixElement ? 'pr-9' : ''} ${className}`}
          {...props}
        />
        {suffixElement && (
          <div className="absolute right-3 flex items-center pointer-events-none text-neutral-400">
            {suffixElement}
          </div>
        )}
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-neutral-500">{helperText}</p>
      ) : null}
    </div>
  );
};
