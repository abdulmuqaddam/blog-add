'use client';

import Link from 'next/link';
import { Calendar } from 'lucide-react';

export default function RelatedPosts({ posts }) {
  if (!posts || posts.length === 0) {
    return null;
  }

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-200">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Related Posts</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug || post._id}`}
            className="group bg-white rounded-lg overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300"
          >
            {/* Thumbnail */}
            <div className="relative h-32 bg-slate-100 overflow-hidden">
              {post.featuredImage ? (
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </div>
              )}
            </div>
            
            {/* Content */}
            <div className="p-3">
              <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {post.title}
              </h4>
              <div className="flex items-center gap-1 mt-2 text-slate-400 text-xs">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

