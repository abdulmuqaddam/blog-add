'use client';

import { useState, useEffect } from 'react';
import { getAllBlogsForAdmin, deleteBlog, toggleBlogStatus } from '@/lib/actions/blogActions';
import Link from 'next/link';
import { Edit, Trash2, Eye, Calendar, Clock } from 'lucide-react';

export default function ViewBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const result = await getAllBlogsForAdmin();
      if (result.success) {
        setBlogs(result.blogs);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const result = await deleteBlog(blogId);
      if (result.success) {
        alert('Blog deleted successfully');
        fetchBlogs();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert('Failed to delete blog');
    }
  };

  const handleToggleStatus = async (blogId) => {
    try {
      const result = await toggleBlogStatus(blogId);
      if (result.success) {
        alert(result.message);
        fetchBlogs();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert('Failed to update blog status');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (blog) => {
    // Check if scheduled
    if (blog.status === 'scheduled' && blog.scheduledAt) {
      const scheduledDate = new Date(blog.scheduledAt);
      if (scheduledDate > new Date()) {
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
            Scheduled
          </span>
        );
      }
    }
    
    // Check draft status
    if (blog.status === 'draft') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
          Draft
        </span>
      );
    }
    
    // Check published status with active state
    if (blog.isActive) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
          Published
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
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
        <button
          onClick={fetchBlogs}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All Blogs</h1>
          <p className="text-slate-500 mt-2">Manage your blog posts</p>
        </div>
        <Link
          href="/dashboard/blog/add"
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all"
        >
          Add New Blog
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <p className="text-slate-500 text-lg">No blogs found. Create your first blog!</p>
          <Link
            href="/dashboard/blog/add"
            className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create Blog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Thumbnail - Clickable */}
              <Link href={`/dashboard/blog/${blog._id}`} className="block">
                <div className="relative h-48 bg-slate-100">
                  {blog.featuredImage ? (
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Eye className="w-12 h-12" />
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(blog)}
                  </div>
                </div>
              </Link>

              {/* Content - Clickable */}
              <Link href={`/dashboard/blog/${blog._id}`} className="block p-4">
                <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {blog.title}
                </h3>
                {blog.subHeading && (
                  <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                    {blog.subHeading}
                  </p>
                )}
                <div className="flex items-center gap-4 text-slate-400 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(blog.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDateTime(blog.createdAt)}</span>
                  </div>
                </div>
                {blog.category && (
                  <div className="mt-2">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                      {blog.category}
                    </span>
                  </div>
                )}
              </Link>

              {/* Footer with Controls */}
              <div className="px-4 pb-4 border-t border-slate-100 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Toggle Switch */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleToggleStatus(blog._id);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      blog.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        blog.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-xs text-slate-500">
                    {blog.isActive ? 'Published' : 'Pending'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Edit Button */}
                  <Link
                    href={`/dashboard/blog/edit/${blog._id}`}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(blog._id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

