import React from 'react';
import { Card } from '../ui/Card.jsx';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ActionCard = ({ title, description, icon: Icon, to, badgeText }) => {
  return (
    <Link to={to} className="block group">
      <Card className="p-5 hover:border-emerald-300 shadow-xs">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white">
            {Icon && <Icon className="h-5 w-5" />}
          </div>
          {badgeText && (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {badgeText}
            </span>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <h3 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 flex items-center gap-1.5">
            {title}
            <ArrowRight className="h-3.5 w-3.5 text-emerald-600" />
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2">{description}</p>
        </div>
      </Card>
    </Link>
  );
};

export default ActionCard;
