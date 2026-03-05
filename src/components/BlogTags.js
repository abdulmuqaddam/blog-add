'use client';

import Link from 'next/link';

export default function BlogTags({ tags }) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tags.map((tag, index) => (
        <Link
          key={index}
          href={`/tags/${encodeURIComponent(tag)}`}
          className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full hover:bg-indigo-200 hover:text-indigo-800 transition-colors duration-200"
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}

