import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  colorClass?: string; // e.g. text-primary-blue, text-success-green
  bgColorClass?: string; // e.g. bg-sky-100, bg-emerald-100
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  colorClass = 'text-primary-blue',
  bgColorClass = 'bg-sky-50'
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-center space-x-5 hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-xl ${bgColorClass} shrink-0`}>
        <Icon className={`h-6 w-6 ${colorClass}`} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-deep-navy mt-1 leading-none">{value}</h3>
        {description && (
          <p className="text-xs text-text-gray mt-1 font-medium">{description}</p>
        )}
      </div>
    </div>
  );
};
