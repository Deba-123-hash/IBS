import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-slate-500 py-2">
      <Link to="/" className="hover:text-blue-600 flex items-center gap-1 transition">
        <Home className="h-3.5 w-3.5" />
        <span>Home</span>
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formatted = value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            {isLast ? (
              <span className="font-semibold text-slate-800">{formatted}</span>
            ) : (
              <Link to={to} className="hover:text-blue-600 transition">
                {formatted}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
