import React from 'react';
import { Card } from '../ui/Card.jsx';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActionCard = ({ title, description, icon: Icon, to, badgeText }) => {
  return (
    <Link to={to} className="block group">
      <Card className="p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            {Icon && <Icon className="h-5 w-5" />}
          </div>
          {badgeText && (
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {badgeText}
            </span>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
            {title}
            <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2">{description}</p>
        </div>
      </Card>
    </Link>
  );
};

export default ActionCard;
