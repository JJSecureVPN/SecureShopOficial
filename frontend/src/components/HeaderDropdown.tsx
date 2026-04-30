import React, { ReactNode } from 'react';

interface HeaderDropdownProps {
  children: React.ReactNode;
  isOpen: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  title?: string;
  icon?: ReactNode;
  onClose?: () => void;
}

export const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ 
  children, 
  isOpen, 
  width = 'w-80',
  align = 'center',
  title,
  icon,
  onClose
}) => {
  if (!isOpen) return null;

  const alignmentClasses = {
    left: 'fixed md:absolute left-0 md:left-0',
    center: 'fixed md:absolute left-1/2 -translate-x-1/2',
    right: 'fixed md:absolute right-0 md:right-0 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0'
  };

  const mobileTopClasses = {
    left: 'top-16 md:top-full',
    center: 'top-16 md:top-full',
    right: 'top-16 md:top-full'
  };

  const arrowAlignmentClasses = {
    left: 'left-4',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-4'
  };

  return (
    <div className={`${alignmentClasses[align]} ${mobileTopClasses[align]} mt-3 z-50`}>
      <div 
        className="relative"
        style={{ 
          animation: 'slideDown 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          transformOrigin: 'top'
        }}
      >
        {/* Flecha curva estilo Josh Comeau - solo visible en desktop */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="32" 
          height="12" 
          fill="none" 
          viewBox="0 0 32 12"
          className={`absolute ${arrowAlignmentClasses[align]} -top-[11px] text-zinc-800 z-10 hidden md:block`}
        >
          <path 
            d="M 0 12 C 8 12 9.6 0 16 0 C 22.4 0 24 12 32 12 Z"
            fill="currentColor"
          />
        </svg>
        
        <div className={`${width} rounded-xl py-3 shadow-2xl bg-zinc-800 backdrop-blur-xl overflow-hidden`}>
          {(title || icon) && (
            <div className="flex items-center justify-between px-4 pb-2 border-b border-zinc-700/50">
              <div className="flex items-center gap-2">
                {icon && <span className="text-orange-400">{icon}</span>}
                {title && <h3 className="text-sm font-semibold text-white">{title}</h3>}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
