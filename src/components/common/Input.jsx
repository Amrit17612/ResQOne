import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    name,
    id,
    type = 'text',
    placeholder,
    value,
    defaultValue,
    onChange,
    error,
    helperText,
    required = false,
    disabled = false,
    icon: Icon,
    rightElement,
    className = '',
    inputClassName = '',
    ...rest
  },
  ref
) {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            block w-full rounded-lg text-sm text-slate-900 bg-white
            border transition-colors
            placeholder:text-slate-400
            ${Icon ? 'pl-9' : 'pl-3.5'}
            ${rightElement ? 'pr-10' : 'pr-3.5'}
            py-2.5
            ${error
              ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600'
              : 'border-slate-300 focus:border-red-600 focus:ring-1 focus:ring-red-600'
            }
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            focus:outline-none
            ${inputClassName}
          `}
          {...rest}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;
