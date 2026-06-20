import React from 'react';

export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const CardSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 animate-pulse space-y-4">
      {/* Image box */}
      <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-xl" />
      {/* Category tag */}
      <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
      {/* Name line 1 */}
      <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
      {/* Name line 2 */}
      <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded-md" />
      {/* Rating stars */}
      <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-md" />
      {/* Footer price & button */}
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
        <div className="h-8 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-md" />
      </div>
    </div>
  );

  const DetailsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10 animate-pulse">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>
      {/* Info column */}
      <div className="space-y-6">
        <div className="h-4 w-1/6 bg-slate-200 dark:bg-slate-700 rounded-md" />
        <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
        <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-md" />
        <div className="h-6 w-1/5 bg-slate-200 dark:bg-slate-700 rounded-md" />
        <hr className="border-slate-100 dark:border-slate-700" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-md" />
        </div>
        <div className="h-12 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  );

  const TableSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
      <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
      <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
      <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
      <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-md" />
    </div>
  );

  return (
    <>
      {type === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {[...Array(count)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}
      {type === 'details' && <DetailsSkeleton />}
      {type === 'table' && <TableSkeleton />}
    </>
  );
};
