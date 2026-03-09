import Link from 'next/link';
import { getPublishedVideos } from '@/lib/actions/videoActions';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Play, Calendar, Eye } from 'lucide-react';

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const metadata = {
  title: 'Videos - Blogify',
  description: 'Watch our latest videos on Blogify',
  keywords: ['videos', 'watch online', 'video gallery'],
};

export default async function VideosPage() {
  const result = await getPublishedVideos(50);
  const videos = result.success ? result.videos : [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Videos</h1>
          <p className="text-indigo-100">Watch our latest videos</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Link
                key={video._id}
                href={`/videos/${video.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-100"
              >
                <div className="relative aspect-video overflow-hidden">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.thumbnailAlt || video.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <Play className="w-12 h-12 text-indigo-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-indigo-600 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
                      {video.duration}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {video.title}
                  </h3>
                  {video.titleUrdu && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1 font-urdu" dir="rtl">
                      {video.titleUrdu}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3 text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(video.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{video.views || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-xl">
            <Play className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg mb-4">No videos available yet</p>
            <Link
              href="/dashboard/videos/add"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              Add First Video
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

