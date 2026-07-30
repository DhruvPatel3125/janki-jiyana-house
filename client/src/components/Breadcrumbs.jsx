import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumbs = ({ paths }) => {
  return (
    <nav className="flex text-[11px] sm:text-xs font-semibold text-slate-500 mb-4 overflow-x-auto whitespace-nowrap scrollbar-none" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 sm:space-x-2">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center hover:text-brand-600 transition-colors">
            <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
            Home
          </Link>
        </li>
        {paths.map((path, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 mx-1" />
              {path.link ? (
                <Link to={path.link} className="hover:text-brand-600 transition-colors">
                  {path.name}
                </Link>
              ) : (
                <span className="text-slate-800 font-bold">{path.name}</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};
