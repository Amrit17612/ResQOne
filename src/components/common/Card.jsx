import React from 'react';

export function Card({
  children,
  className = '',
  hoverable = false,
  onClick,
  ...rest
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white border border-slate-200/80 rounded-xl shadow-resq-card
        ${hoverable ? 'transition-all duration-200 hover:shadow-resq-elevated hover:border-slate-300 cursor-pointer' : ''}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...rest }) {
  return (
    <div className={`p-4 sm:p-5 border-b border-slate-100 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', as: Component = 'h3', ...rest }) {
  return (
    <Component className={`text-base font-semibold text-slate-900 leading-snug ${className}`} {...rest}>
      {children}
    </Component>
  );
}

export function CardDescription({ children, className = '', ...rest }) {
  return (
    <p className={`text-xs text-slate-500 mt-1 ${className}`} {...rest}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...rest }) {
  return (
    <div className={`p-4 sm:p-5 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...rest }) {
  return (
    <div className={`p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 rounded-b-xl ${className}`} {...rest}>
      {children}
    </div>
  );
}

export default Card;
