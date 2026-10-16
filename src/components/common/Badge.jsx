import React from 'react';

export default function Badge({
  children,
  status, // 'in-progress' | 'resolved' | 'reported' | 'verified' | 'assigned' | 'critical'
  variant = 'neutral',
  size = 'md',
  showDot = false,
  className = '',
}) {
  // Normalize status string if passed (e.g. "In Progress" -> "in-progress")
  const normalizedStatus = status
    ? status.toLowerCase().replace(/\s+/g, '-')
    : variant;

  const statusStyles = {
    'in-progress': {
      container: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    'resolved': {
      container: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    'reported': {
      container: 'bg-sky-50 text-sky-700 border-sky-200',
      dot: 'bg-sky-500',
    },
    'verified': {
      container: 'bg-violet-50 text-violet-700 border-violet-200',
      dot: 'bg-violet-500',
    },
    'assigned': {
      container: 'bg-teal-50 text-teal-700 border-teal-200',
      dot: 'bg-teal-500',
    },
    'critical': {
      container: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500',
    },
    'neutral': {
      container: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
  }[normalizedStatus] || {
    container: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`
        inline-flex items-center font-medium border rounded-full
        ${statusStyles.container}
        ${sizeStyles}
        ${className}
      `}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />}
      <span>{children || status}</span>
    </span>
  );
}
