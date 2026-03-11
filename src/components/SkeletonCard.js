'use client';

// Bootstrap-style placeholder skeleton component
export function BootstrapSkeleton({ className = '' }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="relative aspect-[4/3] bg-slate-200 rounded-t-xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-5/6" />
      </div>
    </div>
  );
}

// Card skeleton with Bootstrap 5 placeholder style
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="relative aspect-[4/3] bg-slate-200">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-[shimmer_1.5s_infinite]" />
      </div>
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
        <div className="h-3 bg-slate-200 rounded w-full animate-pulse" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
          <div className="h-3 bg-slate-200 rounded w-16 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Grid of card skeletons
export function CardGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// Blog list item skeleton
export function BlogListSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex gap-4 p-4">
        <div className="w-32 h-24 bg-slate-200 rounded-lg flex-shrink-0 animate-pulse" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-5 bg-slate-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse" />
          <div className="h-3 bg-slate-200 rounded w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 bg-slate-200 rounded animate-pulse" style={{ width: `${Math.random() * 40 + 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Hero section skeleton
export function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="aspect-[16/9] bg-slate-200 rounded-2xl animate-pulse" />
        <div className="mt-6 space-y-3">
          <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
          <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="w-20 h-16 bg-slate-200 rounded-lg flex-shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
              <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sidebar card skeleton
export function SidebarCardSkeleton() {
  return (
    <div className="bg-slate-50 rounded-xl p-6">
      <div className="h-5 bg-slate-200 rounded w-32 mb-4 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-16 h-12 bg-slate-200 rounded-lg flex-shrink-0 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-full animate-pulse" />
              <div className="h-2 bg-slate-200 rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Spinner with text (Bootstrap style)
export function SpinnerSkeleton({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-indigo-200 rounded-full" />
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="mt-4 text-slate-600 font-medium">{text}</p>
    </div>
  );
}

// Bootstrap 5 placeholder with animation
export function Placeholder({ width = '100%', height = '1rem', rounded = false, className = '' }) {
  return (
    <div
      className={`bg-slate-200 animate-pulse ${rounded ? 'rounded' : ''} ${className}`}
      style={{ width, height }}
    />
  );
}

// Circular placeholder (avatar)
export function CirclePlaceholder({ size = '3rem', className = '' }) {
  return (
    <div
      className={`bg-slate-200 rounded-full animate-pulse ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

// Category pill skeleton
export function CategoryPillSkeleton() {
  return (
    <div className="px-3 py-1 bg-slate-200 rounded-full animate-pulse">
      <div className="h-4 w-16 bg-slate-300 rounded" />
    </div>
  );
}

// Section header skeleton
export function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
      <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
    </div>
  );
}

// Video card skeleton
export function VideoCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md">
      <div className="relative aspect-video bg-slate-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 bg-slate-300 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-full animate-pulse" />
        <div className="h-3 bg-slate-200 rounded w-2/3 animate-pulse" />
        <div className="h-3 bg-slate-200 rounded w-1/3 animate-pulse" />
      </div>
    </div>
  );
}

// Form skeleton
export function FormSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div className="h-5 bg-slate-200 rounded w-32 mb-6 animate-pulse" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
          <div className="h-10 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      ))}
      <div className="h-10 bg-slate-200 rounded-lg w-32 mt-6 animate-pulse" />
    </div>
  );
}

// Default export with all skeleton components
export default {
  BootstrapSkeleton,
  CardSkeleton,
  CardGridSkeleton,
  BlogListSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  HeroSkeleton,
  SidebarCardSkeleton,
  SpinnerSkeleton,
  Placeholder,
  CirclePlaceholder,
  CategoryPillSkeleton,
  SectionHeaderSkeleton,
  VideoCardSkeleton,
  FormSkeleton,
};

