import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({
  size = 'md',
  message,
  fullPage = false,
  className = '',
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  }[size] || 'w-6 h-6';

  const content = (
    <div className={`flex flex-col items-center justify-center p-4 gap-2 text-slate-500 ${className}`}>
      <Loader2 className={`${sizeClasses} animate-spin text-red-600`} />
      {message && <p className="text-xs font-medium text-slate-600">{message}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
