import React from 'react';

/**
 * MetricCardSkeleton ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Mimics the 4-card metric grid during stats hydration
 */
export const MetricCardSkeleton = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-5 rounded-2xl bg-panel/40 border border-line/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-mist rounded" />
          <div className="w-8 h-8 rounded-xl bg-mist" />
        </div>
        <div className="h-8 w-16 bg-mist rounded" />
        <div className="h-3 w-32 bg-mist/60 rounded" />
      </div>
    ))}
  </div>
);

/**
 * ProblemTableSkeleton ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Mimics the tabular problem view during fetch
 */
export const ProblemTableSkeleton = () => (
  <div className="rounded-2xl border border-line bg-panel/40 overflow-hidden animate-pulse">
    {/* Table Header */}
    <div className="h-10 bg-paper border-b border-line flex items-center px-4 gap-6">
      <div className="h-3 w-24 bg-mist rounded" />
      <div className="h-3 w-16 bg-mist rounded" />
      <div className="h-3 w-16 bg-mist rounded" />
      <div className="h-3 w-16 bg-mist rounded" />
      <div className="h-3 w-20 bg-mist rounded" />
      <div className="h-3 w-16 bg-mist rounded" />
    </div>

    {/* Rows */}
    <div className="divide-y divide-line">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="py-4 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-1/3">
            <div className="w-14 h-5 rounded bg-mist" />
            <div className="h-4 w-32 bg-mist rounded" />
          </div>
          <div className="w-20 h-5 rounded bg-mist" />
          <div className="w-14 h-5 rounded-full bg-mist" />
          <div className="w-20 h-5 rounded-full bg-mist" />
          <div className="w-16 h-4 bg-mist rounded font-mono" />
          <div className="w-16 h-4 bg-mist rounded" />
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded bg-mist" />
            <div className="w-6 h-6 rounded bg-mist" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * TopicProgressSkeleton ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Mimics the 18-topic curriculum grid
 */
export const TopicProgressSkeleton = () => (
  <div className="p-6 rounded-2xl bg-panel/40 border border-line space-y-6 animate-pulse">
    <div className="flex items-center justify-between pb-4 border-b border-line">
      <div className="space-y-1">
        <div className="h-4 w-48 bg-mist rounded" />
        <div className="h-3 w-64 bg-mist/60 rounded" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="p-3.5 rounded-xl bg-paper border border-line/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-20 bg-mist rounded" />
            <div className="h-3 w-12 bg-mist rounded" />
          </div>
          <div className="h-1.5 w-full bg-mist rounded-full" />
          <div className="h-2.5 w-16 bg-mist/60 rounded" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * AnalyticsSkeleton ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Mimics the Recharts grid
 */
export const AnalyticsSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 p-6 rounded-2xl bg-panel/40 border border-line h-80 flex flex-col justify-between">
        <div className="h-4 w-40 bg-mist rounded" />
        <div className="h-48 w-full bg-mist/40 rounded-xl" />
      </div>
      <div className="p-6 rounded-2xl bg-panel/40 border border-line h-80 flex flex-col justify-between">
        <div className="h-4 w-32 bg-mist rounded" />
        <div className="w-36 h-36 rounded-full bg-mist/40 mx-auto" />
        <div className="h-8 w-full bg-mist/30 rounded" />
      </div>
    </div>
    <div className="p-6 rounded-2xl bg-panel/40 border border-line h-72 flex flex-col justify-between">
      <div className="h-4 w-48 bg-mist rounded" />
      <div className="h-44 w-full bg-mist/40 rounded-xl" />
    </div>
  </div>
);
