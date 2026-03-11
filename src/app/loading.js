'use client';

import { CardGridSkeleton } from '@/components/SkeletonCard';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-9 bg-slate-200 rounded w-32 mb-2 animate-pulse" />
          <div className="h-5 bg-slate-200 rounded w-48 animate-pulse" />
        </div>
        <CardGridSkeleton count={8} />
      </div>
    </div>
  );
}

