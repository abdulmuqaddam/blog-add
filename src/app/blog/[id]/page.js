import { getBlogById, getBlogBySlug, getRelatedPosts } from '@/lib/actions/blogActions';
import Navbar from '@/components/Navbar';
import RelatedPosts from '@/components/RelatedPosts';
import Link from 'next/link';
import Image from 'next/image';
import { sanitizeHtml } from '@/lib/sanitize';
import { notFound } from 'next/navigation';

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
  const { id } = await params;
  
  // Try to get by ID first, then by slug
  let result = await getBlogById(id);
  if (!result.success) {
    result = await getBlogBySlug(id);
  }
  
  if (!result.success || !result.blog) {
    return {
      title: 'Blog Not Found - Blogify',
    };
  }
  
  const blog = result.blog;
  
  return {
    title: `${blog.title} - Blogify`,
    description: blog.subHeading || blog.content?.substring(0, 160) || 'Read this blog post on Blogify',
    keywords: blog.tags?.join(', ') || blog.category || '',
    openGraph: {
      title: blog.title,
      description: blog.subHeading || blog.content?.substring(0, 160) || '',
      images: blog.featuredImage ? [blog.featuredImage] : [],
      type: 'article',
      publishedTime: blog.createdAt,
      authors: [blog.author?.name || 'Blogify'],
    },
  };
}

export default async function BlogDetailsPage({ params }) {
  const { id } = await params;
  
  // Try to get by ID first, then by slug
  let result = await getBlogById(id);
  if (!result.success) {
    result = await getBlogBySlug(id);
  }
  
  if (!result.success || !result.blog) {
    notFound();
  }
  
  const blog = result.blog;
  
  // Get related blogs using new function with category and tags
  const relatedResult = await getRelatedPosts(blog._id, blog.category, blog.tags || []);
  const relatedBlogs = relatedResult.success ? relatedResult.blogs : [];

  // Sanitize HTML content
  const sanitizedContent = sanitizeHtml(blog.content || '');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Breadcrumbs */}
      <div className="pt-24 pb-6 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-slate-500 hover:text-indigo-600">
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <Link href={`/categories?cat=${blog.category}`} className="text-slate-500 hover:text-indigo-600">
              {blog.category || 'General'}
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 truncate max-w-xs">{blog.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Blog Content */}
          <div className="lg:col-span-2">
            {/* Header Image */}
            {blog.featuredImage && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8">
                <Image
                  src={blog.featuredImage}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Blog Info */}
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full mb-4">
                {blog.category || 'General'}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {blog.title}
              </h1>
              {blog.subHeading && (
                <p className="text-xl text-slate-600 mb-4">
                  {blog.subHeading}
                </p>
              )}
              <div className="flex items-center gap-4 text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {blog.author?.name?.charAt(0) || 'E'}
                    </span>
                  </div>
                  <span className="font-medium text-slate-700">
                    {blog.author?.name || 'Editor'}
                  </span>
                </div>
                <span>•</span>
                <span>{formatDate(blog.createdAt)}</span>
                <span>•</span>
                <span>{blog.views || 0} views</span>
              </div>
            </div>

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-slate-200">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Blog Content - HTML Rendered */}
            <article 
              className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-indigo-600 prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Related Posts - Grid Layout */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Related Posts
                </h3>
                {relatedBlogs.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {relatedBlogs.map((relatedBlog) => (
                      <Link
                        key={relatedBlog._id}
                        href={`/blog/${relatedBlog.slug || relatedBlog._id}`}
                        className="group"
                      >
                        <div className="relative h-24 rounded-lg overflow-hidden mb-2">
                          {relatedBlog.featuredImage ? (
                            <Image
                              src={relatedBlog.featuredImage}
                              alt={relatedBlog.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-2xl">📄</span>
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-slate-900 text-xs line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {relatedBlog.title}
                        </h4>
                        <p className="text-slate-500 text-xs mt-1">
                          {formatDate(relatedBlog.createdAt)}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No related posts found</p>
                )}
              </div>

              {/* Categories */}
              <div className="bg-slate-50 rounded-xl p-6 mt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/categories?cat=${blog.category}`}
                    className="px-3 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg"
                  >
                    {blog.category || 'General'}
                  </Link>
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-indigo-600 rounded-xl p-6 mt-6 text-white">
                <h3 className="text-lg font-bold mb-2">
                  Stay Updated
                </h3>
                <p className="text-indigo-200 text-sm mb-4">
                  Subscribe to get the latest posts
                </p>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-lg text-slate-900 mb-2"
                />
                <button className="w-full py-2 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
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

