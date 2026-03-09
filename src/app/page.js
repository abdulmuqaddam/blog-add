
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { getLatestBlogs, getPublishedBlogs, getAllCategoriesList, getTravelBlogs, getBlogsByCategory } from '@/lib/actions/blogActions';
import { getPublishedVideos } from '@/lib/actions/videoActions';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryPills from '@/components/CategoryPills';
import CategoryRow, { CategoryRowSkeleton } from '@/components/CategoryRow';
import { Play, Calendar } from 'lucide-react';

// Date formatter function
function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Optimized: Fetch all data in parallel using Promise.all
async function fetchAllData() {
  const [
    latestResult,
    blogsData,
    categoriesResult,
    travelResult,
    videosResult
  ] = await Promise.all([
    getLatestBlogs(),
    getPublishedBlogs(20),
    getAllCategoriesList(),
    getTravelBlogs(9),
    getPublishedVideos(8)
  ]);
  
  return {
    featuredBlog: latestResult.success ? latestResult.featuredBlog : null,
    sidebarBlogs: latestResult.success ? latestResult.recentBlogs : [],
    allBlogsForGrid: blogsData.success ? blogsData.blogs : [],
    marqueeBlogs: blogsData.success ? blogsData.blogs : [],
    categories: categoriesResult.success ? categoriesResult.categories : [],
    travelBlogs: travelResult.success ? travelResult.blogs : [],
    videos: videosResult.success ? videosResult.videos : []
  };
}

// Async component for Tech category
async function TechCategory() {
  const result = await getBlogsByCategory('Tech', 6);
  return <CategoryRow title="Tech" blogs={result.blogs} slug="tech" />;
}

// Async component for Health category
async function HealthCategory() {
  const result = await getBlogsByCategory('Health', 6);
  return <CategoryRow title="Health" blogs={result.blogs} slug="health" />;
}

// Async component for Business category
async function BusinessCategory() {
  const result = await getBlogsByCategory('Business', 6);
  return <CategoryRow title="Business" blogs={result.blogs} slug="business" />;
}

// Async component for Travel category
async function TravelCategory() {
  const result = await getBlogsByCategory('Travel', 6);
  return <CategoryRow title="Travel" blogs={result.blogs} slug="travel" />;
}

export default async function HomePage() {
  // Fetch all data in parallel - much faster!
  const data = await fetchAllData();
  
  const featuredBlog = data.featuredBlog;
  const sidebarBlogs = data.sidebarBlogs;
  const allBlogsForGrid = data.allBlogsForGrid.filter(b => b._id !== featuredBlog?._id);
  const marqueeBlogs = data.marqueeBlogs;
  const categories = data.categories;
  const travelBlogs = data.travelBlogs;
  const videos = data.videos;
  
  const travelHero = travelBlogs[0] || null;
  const travelGrid = travelBlogs.slice(1) || [];

  return (
    <div className="bg-white">
      <Navbar />
      
      {/* News Marquee (Breaking News) */}
      {marqueeBlogs.length > 0 && (
        <div className="pt-20 bg-slate-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-4 overflow-hidden">
              <span className="flex-shrink-0 px-3 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full">
                Trending
              </span>
              <div className="marquee-container flex-1 overflow-hidden bg-indigo-600 rounded p-2">
                <div className="marquee-content flex gap-8 animate-marquee">
                  {marqueeBlogs.map((blog) => (
                    <Link
                      key={blog._id}
                      href={`/blog/${blog.slug || blog._id}`}
                      className="text-white whitespace-nowrap text-sm font-medium hover:text-indigo-200 transition-colors"
                    >
                      {blog.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills - Horizontal Scrollable */}
      <section className="bg-slate-50 border-b border-slate-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategoryPills categories={categories} />
        </div>
      </section>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feature - Latest Blog */}
          <div className="lg:col-span-2">
            {featuredBlog ? (
              <Link href={`/blog/${featuredBlog.slug || featuredBlog._id}`} className="group">
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-6">
                  {featuredBlog.featuredImage ? (
                    <Image
                      src={featuredBlog.featuredImage}
                      alt={featuredBlog.featuredImageAlt || featuredBlog.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <span className="text-6xl text-indigo-300">📝</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full mb-3">
                      {featuredBlog.category || 'General'}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-indigo-200 transition-colors">
                      {featuredBlog.title}
                    </h1>
                    {featuredBlog.subHeading && (
                      <p className="text-slate-200 text-lg mb-3 line-clamp-2">
                        {featuredBlog.subHeading}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-slate-300 text-sm">
                      <span>By {featuredBlog.author?.name || 'Editor'}</span>
                      <span>•</span>
                      <span>{formatDate(featuredBlog.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="aspect-[16/9] rounded-2xl bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-500 text-lg mb-4">No blog posts yet</p>
                  <Link
                    href="/dashboard/blog/add"
                    className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                  >
                    Create Your First Blog
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Next 4 Latest Blogs - 2 Columns */}
          <div className="lg:col-span-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sidebarBlogs.length > 0 ? (
                sidebarBlogs.map((blog) => (
                  <Link
                    key={blog._id}
                    href={`/blog/${blog.slug || blog._id}`}
                    className="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-xl hover:scale-105 transition-all duration-300"
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
                        <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                          <span className="text-4xl">📄</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-slate-500 text-xs mt-2">
                        {formatDate(blog.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No recent posts</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tech Category Section with Suspense */}
      <Suspense fallback={<CategoryRowSkeleton />}>
        <TechCategory />
      </Suspense>

      {/* Health Category Section with Suspense */}
      <Suspense fallback={<CategoryRowSkeleton />}>
        <HealthCategory />
      </Suspense>

      {/* Business Category Section with Suspense */}
      <Suspense fallback={<CategoryRowSkeleton />}>
        <BusinessCategory />
      </Suspense>

      {/* Travel Category Section with Suspense */}
      <Suspense fallback={<CategoryRowSkeleton />}>
        <TravelCategory />
      </Suspense>

      {/* Videos Section - BBC Urdu/News Portal Style */}
      {videos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Videos</h2>
              <p className="text-slate-500 text-sm mt-1">Watch our latest videos</p>
            </div>
            <Link
              href="/videos"
              className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
            >
              View All →
            </Link>
          </div>

          {/* Video Grid - Responsive BBC Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <Link
                key={video._id}
                href={`/videos/${video.slug}`}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
              >
                {/* Thumbnail with Play Overlay */}
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
                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 text-indigo-600 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  {/* Duration Badge */}
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
                      {video.duration}
                    </span>
                  )}
                </div>

                {/* Video Info */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {video.title}
                  </h3>
                  {video.titleUrdu && (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1 font-urdu" dir="rtl">
                      {video.titleUrdu}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-slate-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Posts Grid Section (keeping existing section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Recent Posts</h2>
          <Link
            href="/blog/view-all"
            className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
          >
            View All →
          </Link>
        </div>

        {allBlogsForGrid.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBlogsForGrid.slice(0, 3).map((blog) => (
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
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <span className="text-4xl">📝</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded mb-3">
                    {blog.category || 'General'}
                  </span>
                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {blog.title}
                  </h3>
                  <div className="flex items-center justify-between mt-4">
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
            <p className="text-slate-500 text-lg mb-4">No blog posts available yet</p>
            <Link
              href="/dashboard/blog/add"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              Create First Post
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

