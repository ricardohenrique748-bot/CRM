import React from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  key?: string | number;
}

export const Card = ({ title, subtitle, children, className, headerAction }: CardProps) => (
  <div className={`bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-sm ${className}`}>
    {(title || subtitle) && (
      <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
        {headerAction}
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);
