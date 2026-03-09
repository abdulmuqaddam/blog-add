import { getVideoBySlug, getLatestVideos, incrementVideoViews } from '@/lib/actions/videoActions';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Play, Calendar, Clock, Eye, ArrowLeft } from 'lucide-react';

// Date formatter function
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Generate SEO Metadata
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const result = await getVideoBySlug(slug);
  
  if (!result.success || !result.video) {
    return {
      title: 'Video Not Found - Blogify',
    };
  }
  
  const video = result.video;
  
  return {
    title: `${video.title} - Blogify Videos`,
    description: video.description || `Watch ${video.title} on Blogify`,
    keywords: ['video', video.title, 'watch online'],
    openGraph: {
      title: video.title,
      description: video.description || '',
      images: video.thumbnail ? [video.thumbnail] : [],
      type: 'video.other',
    },
  };
}

export default async function VideoDetailsPage({ params }) {
  const { slug } = await params;
  
  // Get the video by slug
  const result = await getVideoBySlug(slug);
  
  if (!result.success || !result.video) {
    notFound();
  }
  
  const video = result.video;
  
  // Increment view count
  await incrementVideoViews(video._id);
  
  // Get latest videos for sidebar
  const latestResult = await getLatestVideos(10);
  const latestVideos = latestResult.success 
    ? latestResult.videos.filter(v => v._id !== video._id).slice(0, 8) 
    : [];

  // Build video embed URL
  let embedUrl = '';
  if (video.videoType === 'youtube' && video.embedId) {
    embedUrl = `https://www.youtube.com/embed/${video.embedId}?autoplay=1`;
  } else if (video.videoType === 'vimeo' && video.embedId) {
    embedUrl = `https://player.vimeo.com/video/${video.embedId}?autoplay=1`;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Breadcrumbs */}
      <div className="pt-24 pb-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-500 hover:text-indigo-600">
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <Link href="/videos" className="text-slate-500 hover:text-indigo-600">
              Videos
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 truncate max-w-xs">{video.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content - 70/30 Split Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Video Area - 70% */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="mb-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={video.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Video player not available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {video.title}
              </h1>
              
              {video.titleUrdu && (
                <p className="text-xl text-slate-600 mb-4 font-urdu" dir="rtl">
                  {video.titleUrdu}
                </p>
              )}
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(video.publishedAt || video.createdAt)}</span>
                </div>
                {video.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{video.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{video.views || 0} views</span>
                </div>
              </div>
              
              {/* Description */}
              {video.description && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">Description</h2>
                  <p className="text-slate-600 whitespace-pre-wrap">{video.description}</p>
                </div>
              )}
              
              {/* Back to Videos */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <Link 
                  href="/videos" 
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Videos
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar - 30% - Latest Videos */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-indigo-600" />
                  تازہ ترین ویڈیوز
                  <span className="text-sm font-normal text-slate-500">(Latest Videos)</span>
                </h3>
                
                {latestVideos.length > 0 ? (
                  <div className="space-y-3">
                    {latestVideos.map((latestVideo) => (
                      <Link
                        key={latestVideo._id}
                        href={`/videos/${latestVideo.slug}`}
                        className="group flex gap-3 p-2 rounded-lg hover:bg-white transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0 w-28 h-16 rounded-lg overflow-hidden bg-slate-200">
                          {latestVideo.thumbnail ? (
                            <img
                              src={latestVideo.thumbnail}
                              alt={latestVideo.thumbnailAlt || latestVideo.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                          {/* Play overlay */}
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                              <Play className="w-3 h-3 text-indigo-600 ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                          {/* Duration badge */}
                          {latestVideo.duration && (
                            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                              {latestVideo.duration}
                            </span>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {latestVideo.title}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDate(latestVideo.createdAt)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm text-center py-4">No other videos available</p>
                )}
              </div>
              
              {/* View All Videos Button */}
              <Link
                href="/videos"
                className="mt-4 block w-full text-center py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                View All Videos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

