'use client';

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-[4/3] bg-slate-200">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer" />
      </div>
      
      {/* Content Skeleton */}
      <div className="p-5">
        {/* Category Badge */}
        <div className="w-20 h-6 bg-slate-200 rounded mb-3" />
        
        {/* Title */}
        <div className="space-y-2 mb-3">
          <div className="h-5 bg-slate-200 rounded w-full" />
          <div className="h-5 bg-slate-200 rounded w-3/4" />
        </div>
        
        {/* Description */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-200 rounded-full" />
            <div className="w-20 h-3 bg-slate-200 rounded" />
          </div>
          <div className="w-24 h-3 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-slate-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer" />
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="w-24 h-5 bg-slate-200 rounded-full mb-3" />
        <div className="space-y-2 mb-4">
          <div className="h-6 bg-slate-200 rounded w-full" />
          <div className="h-6 bg-slate-200 rounded w-4/5" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-200 rounded-full" />
            <div className="w-16 h-3 bg-slate-200 rounded" />
          </div>
          <div className="w-20 h-3 bg-slate-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedBlogSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative aspect-[16/9] bg-slate-200 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="w-24 h-6 bg-slate-300/50 rounded-full mb-3" />
          <div className="space-y-2 mb-2">
            <div className="h-8 bg-slate-300/50 rounded w-4/5" />
            <div className="h-8 bg-slate-300/50 rounded w-3/5" />
          </div>
          <div className="h-4 bg-slate-300/50 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function SidebarBlogSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-20 h-16 bg-slate-200 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
    </div>
  );
}

