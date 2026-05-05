'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ─── Input ────────────────────────────────────────────────────────────────────
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label-base">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4d7a90] pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input-base',
              !!leftIcon && 'pl-10',
              !!rightIcon && 'pr-10',
              error && 'error',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d7a90]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[#ff3cac] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[#4d7a90]">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ─── FloatingInput ────────────────────────────────────────────────────────────
// Animated floating label input — label starts in the field, floats up on focus/fill
export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, hint, className, id, value, defaultValue, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(() => !!(value || defaultValue));

    const floated = focused || hasValue;

    return (
      <div className="w-full">
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            value={value}
            defaultValue={defaultValue}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => {
              setFocused(false);
              setHasValue(!!(e.target.value));
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setHasValue(!!(e.target.value));
              (props as React.InputHTMLAttributes<HTMLInputElement>).onChange?.(e);
            }}
            placeholder=""
            className={cn(
              'w-full pt-5 pb-2 px-3.5 rounded-xl text-sm text-[#e8f4f8] bg-transparent outline-none transition-all peer',
              'border placeholder:text-transparent',
              error
                ? 'border-[#ff3cac] focus:border-[#ff3cac]'
                : 'border-[rgba(0,229,204,0.15)] focus:border-[#00e5cc]',
              className
            )}
            style={{ background: 'rgba(6,13,16,0.8)', minHeight: '52px' }}
            {...props}
          />
          <label
            htmlFor={inputId}
            className="absolute left-3.5 pointer-events-none select-none transition-all duration-200 origin-left"
            style={{
              top: floated ? '6px' : '50%',
              transform: floated ? 'translateY(0) scale(0.78)' : 'translateY(-50%) scale(1)',
              color: focused ? '#00e5cc' : floated ? '#4d7a90' : '#4d7a90',
              fontSize: '0.875rem',
              lineHeight: 1.2,
            }}
          >
            {label}
          </label>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[#ff3cac] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[#4d7a90]">{hint}</p>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

// ─── Textarea ─────────────────────────────────────────────────────────────────
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, showCount, maxLength, className, id, value, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor={textareaId} className="label-base mb-0">
              {label}
            </label>
            {showCount && maxLength && (
              <span
                className={cn(
                  'text-xs font-mono',
                  charCount > maxLength * 0.9 ? 'text-[#ff3cac]' : 'text-[#4d7a90]'
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          className={cn(
            'input-base resize-none',
            error && 'error',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-[#ff3cac] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[#4d7a90]">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ─── Select ───────────────────────────────────────────────────────────────────
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="label-base">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'input-base appearance-none pr-10 cursor-pointer',
              error && 'error',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#4d7a90]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[#ff3cac] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-xs text-[#4d7a90]">{hint}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
