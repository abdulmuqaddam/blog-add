'use client';

import { useState, useEffect, use } from 'react';
import { getBlogById } from '@/lib/actions/blogActions';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, Tag, Eye } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function BlogDetailsPage(props) {
  const params = use(props.params);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params?.id) {
      fetchBlog(params.id);
    }
  }, [params?.id]);

  const fetchBlog = async (id) => {
    try {
      setLoading(true);
      const result = await getBlogById(id);
      if (result.success) {
        setBlog(result.blog);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch blog');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (blog) => {
    if (blog.status === 'scheduled' && blog.scheduledAt) {
      const scheduledDate = new Date(blog.scheduledAt);
      if (scheduledDate > new Date()) {
        return (
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-amber-100 text-amber-700">
            Scheduled
          </span>
        );
      }
    }
    
    if (blog.status === 'draft') {
      return (
        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-700">
          Draft
        </span>
      );
    }
    
    if (blog.isActive) {
      return (
        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-700">
          Published
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-700">
        Unpublished
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">{error}</p>
        <Link
          href="/dashboard/blog/view"
          className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-lg">Blog not found</p>
        <Link
          href="/dashboard/blog/view"
          className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard/blog/view"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Blogs
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          {getStatusBadge(blog)}
          {blog.category && (
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
              {blog.category}
            </span>
          )}
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{blog.title}</h1>
        
        {blog.subHeading && (
          <p className="text-xl text-slate-600 mb-4">{blog.subHeading}</p>
        )}

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 text-slate-500">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>{blog.author?.name || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {/* <span>Created: {formatDate(blog.createdAt)}</span> */}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{formatDateTime(blog.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            <span>{blog.views || 0} views</span>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="mb-8">
          <img
            src={blog.featuredImage}
            alt={blog.featuredImageAlt || blog.title}
            className="w-full h-[400px] object-cover rounded-xl"
          />
        </div>
      )}

      {/* Tags */}
      {blog.tags && blog.tags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <Tag className="w-5 h-5 text-slate-400" />
          {blog.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="prose max-w-none">
        <div 
          className="text-slate-700 leading-relaxed"
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(blog.content || '') 
          }} 
        />
      </div>

      {/* Edit Button */}
      <div className="mt-8 pt-8 border-t border-slate-200">
        <Link
          href={`/dashboard/blog/edit/${blog._id}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all"
        >
          Edit Blog
        </Link>
      </div>
    </div>
  );
}

