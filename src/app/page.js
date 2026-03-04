import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { getLatestBlogs, getPublishedBlogs } from '@/lib/actions/blogActions';

// Date formatter function
function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function HomePage() {
  // Fetch latest blogs data
  const result = await getLatestBlogs();
  const blogsData = await getPublishedBlogs(20);
  
  const featuredBlog = result.success ? result.featuredBlog : null;
  const sidebarBlogs = result.success ? result.recentBlogs : [];
  // Combine sidebar blogs and remaining blogs for the grid (exclude the featured one)
  const allBlogsForGrid = blogsData.success ? blogsData.blogs.filter(b => b._id !== featuredBlog?._id) : [];
  const marqueeBlogs = blogsData.success ? blogsData.blogs : [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* News Marquee (Breaking News) */}
      {marqueeBlogs.length > 0 && (
        <div className="pt-20 bg-slate-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-4 overflow-hidden">
              <span className="flex-shrink-0 px-3 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full">
                Trending
              </span>
              <div className="marquee-container flex-1 overflow-hidden">
                <div className="marquee-content flex gap-8 animate-marquee">
                  {marqueeBlogs.map((blog) => (
                    <Link
                      key={blog._id}
                      href={`/blog/${blog.slug || blog._id}`}
                      className="text-slate-600 hover:text-indigo-600 whitespace-nowrap text-sm font-medium"
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
                      alt={featuredBlog.title}
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
            <h2 className="text-xl font-bold text-slate-900 mb-4">Latest Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sidebarBlogs.length > 0 ? (
                sidebarBlogs.map((blog) => (
                  <Link
                    key={blog._id}
                    href={`/blog/${blog.slug || blog._id}`}
                    className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-slate-100"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {blog.featuredImage ? (
                        <Image
                          src={blog.featuredImage}
                          alt={blog.title}
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

      {/* Recent Posts Grid Section - 2 Columns */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Recent Posts</h2>
          <Link
            href="/categories"
            className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
          >
            View All →
          </Link>
        </div>

        {allBlogsForGrid.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allBlogsForGrid.slice(0, 12).map((blog) => (
              <Link
                key={blog._id}
                href={`/blog/${blog.slug || blog._id}`}
                className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {blog.featuredImage ? (
                    <Image
                      src={blog.featuredImage}
                      alt={blog.title}
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
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">B</span>
                </div>
                <span className="font-bold text-xl">Blogify</span>
              </div>
              <p className="text-slate-400">
                Your source for the latest insights, stories, and expertise.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/" className="hover:text-indigo-400">Home</Link></li>
                <li><Link href="/categories" className="hover:text-indigo-400">Categories</Link></li>
                <li><Link href="/about" className="hover:text-indigo-400">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/login" className="hover:text-indigo-400">Login</Link></li>
                <li><Link href="/dashboard" className="hover:text-indigo-400">Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>© {new Date().getFullYear()} Blogify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

