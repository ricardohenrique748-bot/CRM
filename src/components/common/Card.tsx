import React from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200/60 overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
      <div>
        <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
        {subtitle && <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);
