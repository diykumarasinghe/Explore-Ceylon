import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  centered?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  badge,
  centered = false
}) => {
  return (
    <div className={`mb-10 ${centered ? 'text-center max-w-2xl mx-auto' : ''}`}>
      {badge && (
        <span className="inline-block bg-sky-100 text-primary-blue text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3.5">
          {badge}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl font-black text-deep-navy tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-base text-text-gray font-medium leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
