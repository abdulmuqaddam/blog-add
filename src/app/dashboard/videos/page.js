'use client';

import { useState, useEffect } from 'react';
import { getAllVideos, deleteVideo, toggleVideoStatus } from '@/lib/actions/videoActions';
import Link from 'next/link';
import { Plus, Trash2, Calendar, Clock, Play, Eye, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import { CardGridSkeleton } from '@/components/SkeletonCard';

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const result = await getAllVideos();
      if (result.success) {
        setVideos(result.videos);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;

    try {
      const result = await deleteVideo(videoId);
      if (result.success) {
        alert('Video deleted successfully');
        fetchVideos();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert('Failed to delete video');
    }
  };

  const handleToggleStatus = async (videoId) => {
    try {
      const result = await toggleVideoStatus(videoId);
      if (result.success) {
        alert(result.message);
        fetchVideos();
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (err) {
      alert('Failed to update video status');
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

  const getStatusBadge = (video) => {
    if (video.status === 'draft') {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
          Draft
        </span>
      );
    }
    
    if (video.isActive) {
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <div className="h-9 bg-slate-200 rounded w-24 mb-2 animate-pulse" />
            <div className="h-5 bg-slate-200 rounded w-48 animate-pulse" />
          </div>
          <div className="h-12 bg-slate-200 rounded-xl w-40 animate-pulse" />
        </div>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Thumbnail</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 hidden md:table-cell">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 hidden lg:table-cell">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="relative w-32 h-20 bg-slate-200 rounded-lg animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-48 animate-pulse" />
                        <div className="h-3 bg-slate-200 rounded w-32 animate-pulse" />
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-24 animate-pulse" />
                        <div className="h-2 bg-slate-200 rounded w-20 animate-pulse" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-6 bg-slate-200 rounded-full w-20 animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse" />
                        <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse" />
                        <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={fetchVideos}
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
          <h1 className="text-3xl font-bold text-slate-900">Videos</h1>
          <p className="text-slate-500 mt-2">Manage your video content</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/videos/add"
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Video
          </Link>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow">
          <Play className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg mb-4">No videos found. Add your first video!</p>
          <Link
            href="/dashboard/videos/add"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add Video
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {/* Table - Responsive */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Thumbnail</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 hidden md:table-cell">Duration</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 hidden lg:table-cell">Date & Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {videos.map((video) => (
                  <tr key={video._id} className="hover:bg-slate-50 transition-colors">
                    {/* Thumbnail */}
                    <td className="px-6 py-4">
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-slate-100">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.thumbnailAlt || video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                        {video.duration && (
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                            {video.duration}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Title */}
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="font-semibold text-slate-900 line-clamp-2">{video.title}</h3>
                        {video.titleUrdu && (
                          <p className="text-sm text-slate-500 mt-1 font-urdu" dir="rtl">{video.titleUrdu}</p>
                        )}
                      </div>
                    </td>
                    
                    {/* Duration */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-slate-600">{video.duration || 'N/A'}</span>
                    </td>
                    
                    {/* Date & Time */}
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(video.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(video.createdAt)}</span>
                      </div>
                    </td>
                    
                    {/* Status */}
                    <td className="px-6 py-4">
                      {getStatusBadge(video)}
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(video._id)}
                          className={`p-2 rounded-lg transition-colors ${
                            video.isActive 
                              ? 'text-emerald-600 hover:bg-emerald-50' 
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title={video.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {video.isActive ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        
                        {/* View Button */}
                        {video.slug && (
                          <Link
                            href={`/videos/${video.slug}`}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View"
                            target="_blank"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        )}
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(video._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

