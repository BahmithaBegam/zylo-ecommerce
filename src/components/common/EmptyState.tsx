import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onActionClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-md mx-auto my-12 bg-white rounded-3xl border border-zinc-200 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 shadow-inner">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-zinc-900 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 mb-6 leading-relaxed">{description}</p>

      {actionText && actionHref && (
        <Link
          to={actionHref}
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-2xl transition-all shadow-md active:scale-95"
        >
          {actionText} <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {actionText && onActionClick && !actionHref && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-indigo-600 text-white text-sm font-bold rounded-2xl transition-all shadow-md active:scale-95"
        >
          {actionText} <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
