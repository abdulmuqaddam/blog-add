'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryPills({ categories = [] }) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  // Default categories if none provided
  const displayCategories = categories.length > 0 ? categories : [
    { name: 'Technology', slug: 'technology' },
    { name: 'Business', slug: 'business' },
    { name: 'Lifestyle', slug: 'lifestyle' },
    { name: 'Health', slug: 'health' },
    { name: 'Travel', slug: 'travel' },
    { name: 'Food', slug: 'food' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'Science', slug: 'science' },
  ];

  return (
    <div className="relative w-full">
      {/* Scroll Left Button */}
      {scrollPosition > 0 && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
      )}

      {/* Scrollable Pills Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-8 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* All Categories Pill */}
        <Link
          href="/categories"
          className="flex-shrink-0 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-full text-sm hover:bg-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          All
        </Link>

        {displayCategories.map((category, index) => (
          <Link
            key={index}
            href={`/categories?cat=${encodeURIComponent(category.slug || category.name?.toLowerCase())}`}
            className="flex-shrink-0 px-5 py-2.5 bg-white text-slate-700 font-medium rounded-full text-sm border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {category.name}
          </Link>
        ))}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-slate-600" />
      </button>
    </div>
  );
}

