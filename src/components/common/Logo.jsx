import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Logo({ variant = 'dark', size = 'md', to = '/', showSubtitle = false }) {
  const isLight = variant === 'light'; // Light background -> dark text
  
  const sizeClasses = {
    sm: {
      iconBox: 'w-7 h-7 p-1',
      icon: 'w-4 h-4',
      text: 'text-base',
      subtitle: 'text-[10px]',
    },
    md: {
      iconBox: 'w-8 h-8 p-1.5',
      icon: 'w-5 h-5',
      text: 'text-lg',
      subtitle: 'text-xs',
    },
    lg: {
      iconBox: 'w-10 h-10 p-2',
      icon: 'w-6 h-6',
      text: 'text-xl',
      subtitle: 'text-xs',
    },
  }[size];

  const content = (
    <div className="flex items-center space-x-2.5 group">
      <div className={`${sizeClasses.iconBox} bg-red-600 rounded-lg text-white flex items-center justify-center shadow-sm flex-shrink-0 transition-transform group-hover:scale-105`}>
        <ShieldAlert className={sizeClasses.icon} />
      </div>
      <div className="flex flex-col">
        <div className={`font-bold tracking-tight ${sizeClasses.text} ${isLight ? 'text-slate-900' : 'text-white'} leading-none`}>
          <span>ResQ</span>
          <span className="text-red-600">One</span>
        </div>
        {showSubtitle && (
          <span className={`leading-tight mt-0.5 ${sizeClasses.subtitle} ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Emergency Management
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md">
        {content}
      </Link>
    );
  }

  return content;
}
