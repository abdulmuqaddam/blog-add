'use client';

import Link from 'next/link';
import Image from 'next/image';

// Date formatter function
function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Category icons mapping
const categoryIcons = {
  Tech: '💻',
  Health: '🏥',
  Business: '💼',
  Travel: '✈️',
  General: '📝',
  Food: '🍽️',
  Lifestyle: '🌿',
  Finance: '💰',
  Education: '📚',
  Entertainment: '🎬',
};

// Category color schemes
const categoryColors = {
  Tech: 'from-blue-500 to-indigo-600',
  Health: 'from-green-500 to-emerald-600',
  Business: 'from-orange-500 to-amber-600',
  Travel: 'from-emerald-500 to-teal-600',
  General: 'from-indigo-500 to-purple-600',
  Food: 'from-red-500 to-pink-600',
  Lifestyle: 'from-purple-500 to-pink-600',
  Finance: 'from-yellow-500 to-orange-600',
  Education: 'from-cyan-500 to-blue-600',
  Entertainment: 'from-pink-500 to-rose-600',
};

export default function CategoryRow({ title, blogs, slug }) {
  const icon = categoryIcons[title] || '📝';
  const colorClass = categoryColors[title] || 'from-indigo-500 to-purple-600';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center shadow-lg`}>
            <span className="text-white text-2xl">{icon}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="text-slate-500 text-sm">Latest {title} articles</p>
          </div>
        </div>
        <Link
          href={`/category/${slug}`}
          className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-md"
        >
          More {title} →
        </Link>
      </div>

      {/* Blog Grid - 6 posts (2 rows of 3) */}
      {blogs && blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog._id}
              href={`/blog/${blog.slug || blog._id}`}
              className="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {blog.featuredImage ? (
                  <Image
                    src={blog.featuredImage}
                    alt={blog.featuredImageAlt || blog.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <span className={`inline-block px-2 py-1 bg-gradient-to-r ${colorClass} text-white text-xs font-semibold rounded mb-3`}>
                  {blog.category || title}
                </span>
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {blog.title}
                </h3>
                {blog.excerpt && (
                  <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                    {blog.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <span className="text-slate-500 text-sm">
                    {formatDate(blog.createdAt)}
                  </span>
                  <span className="text-indigo-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                    Read More →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-xl">
          <div className="text-4xl mb-4">{icon}</div>
          <p className="text-slate-500 text-lg mb-2">No {title} posts available yet</p>
          <Link
            href={`/category/${slug}`}
            className="inline-block mt-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
          >
            Browse all {title} posts →
          </Link>
        </div>
      )}
    </section>
  );
}

// Skeleton component for loading state
export function CategoryRowSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse" />
          <div>
            <div className="h-6 w-24 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-lg animate-pulse" />
      </div>

      {/* Blog Grid Skeleton - 6 posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl overflow-hidden border border-slate-100 animate-pulse"
          >
            {/* Image Skeleton */}
            <div className="relative aspect-[4/3] bg-slate-200">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer" />
            </div>
            
            {/* Content Skeleton */}
            <div className="p-5">
              <div className="w-20 h-6 bg-slate-200 rounded mb-3" />
              <div className="space-y-2 mb-3">
                <div className="h-5 bg-slate-200 rounded w-full" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-4 bg-slate-200 rounded w-5/6" />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="w-24 h-3 bg-slate-200 rounded" />
                <div className="w-20 h-3 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

