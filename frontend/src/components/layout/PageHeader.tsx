import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[]; className?: string }> = ({
  items,
  className = '',
}) => {
  return (
    <nav className={`flex items-center text-xs text-neutral-500 overflow-x-auto ${className}`} aria-label="Breadcrumb">
      <Link to="/admin" className="hover:text-neutral-900 transition-colors flex items-center gap-1 shrink-0">
        <Home className="w-3.5 h-3.5" />
        <span>Admin</span>
      </Link>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-neutral-400 shrink-0" />
          {item.path ? (
            <Link to={item.path} className="hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-neutral-900 whitespace-nowrap shrink-0">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}> = ({ title, subtitle, badge, actions, breadcrumbs, className = '' }) => {
  return (
    <div className={`mb-6 pb-4 border-b border-neutral-200 ${className}`}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-3" />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-neutral-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2.5 flex-wrap shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
