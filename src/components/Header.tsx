import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>
    </header>
  );
};
