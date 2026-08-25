import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200/70 overflow-hidden animate-pulse p-4">
      <div className="aspect-square w-full bg-zinc-200 rounded-xl mb-4" />
      <div className="h-3 bg-zinc-200 rounded w-1/3 mb-2" />
      <div className="h-4 bg-zinc-200 rounded w-4/5 mb-3" />
      <div className="h-3 bg-zinc-200 rounded w-1/4 mb-4" />
      <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
        <div className="h-5 bg-zinc-200 rounded w-1/3" />
        <div className="h-8 bg-zinc-200 rounded-xl w-20" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-14 bg-zinc-100 rounded-xl w-full flex items-center px-4 gap-4">
          <div className="w-10 h-10 bg-zinc-200 rounded-lg shrink-0" />
          <div className="h-4 bg-zinc-200 rounded w-1/4" />
          <div className="h-4 bg-zinc-200 rounded w-1/6" />
          <div className="h-4 bg-zinc-200 rounded w-1/8" />
          <div className="h-4 bg-zinc-200 rounded w-1/5 ml-auto" />
        </div>
      ))}
    </div>
  );
};
