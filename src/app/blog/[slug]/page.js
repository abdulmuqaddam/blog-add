import { getBlogById, getBlogBySlug, getRelatedPosts, getAdjacentPosts } from '@/lib/actions/blogActions';
import Navbar from '@/components/Navbar';
import BlogTags from '@/components/BlogTags';
import ScrollProgress from '@/components/ScrollProgress';
import SocialShare from '@/components/SocialShare';
import ViewCounter from '@/components/ViewCounter';
import Link from 'next/link';
import Image from 'next/image';
import { sanitizeHtml } from '@/lib/sanitize';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ArrowRight, Calendar, Clock, Eye, User } from 'lucide-react';

// Date formatter function
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Calculate reading time (average 200 words per minute)
function calculateReadingTime(content) {
  if (!content) return 1;
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes === 1 ? '1 min read' : `${minutes} min read`;
}

// Check if string is a valid MongoDB ObjectId
function isValidObjectId(str) {
  return /^[0-9a-fA-F]{24}$/.test(str);
}

// Generate SEO Metadata
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  // Try to get by slug first, then by ID (for backward compatibility)
  let result = await getBlogBySlug(slug);
  if (!result.success) {
    result = await getBlogById(slug);
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
  const { slug } = await params;
  
  // Check if accessing via old ID-based URL and redirect to slug URL
  if (isValidObjectId(slug)) {
    // Try to find the blog by ID and get its slug
    const result = await getBlogById(slug);
    if (result.success && result.blog && result.blog.slug) {
      // Permanent redirect to the clean slug URL
      redirect(`/blog/${result.blog.slug}`);
    }
  }
  
  // Try to get by slug first
  let result = await getBlogBySlug(slug);
  if (!result.success) {
    // Fallback to ID lookup for backward compatibility
    result = await getBlogById(slug);
  }
  
  if (!result.success || !result.blog) {
    notFound();
  }
  
  const blog = result.blog;
  
  // Get related blogs using new function with category and tags
  const relatedResult = await getRelatedPosts(blog._id, blog.category, blog.tags || []);
  const relatedBlogs = relatedResult.success ? relatedResult.blogs : [];

  // Get adjacent posts (next and previous)
  const adjacentResult = await getAdjacentPosts(blog._id, blog.category);
  const previousPost = adjacentResult.success ? adjacentResult.previous : null;
  const nextPost = adjacentResult.success ? adjacentResult.next : null;

  // Sanitize HTML content with enhanced blockquote styling
  let sanitizedContent = sanitizeHtml(blog.content || '');
  
  // Add custom blockquote styling
  sanitizedContent = sanitizedContent.replace(
    /<blockquote>/g,
    '<blockquote class="border-l-4 border-indigo-600 bg-slate-50 pl-6 py-4 my-6 italic text-slate-700 relative">'
  );

  return (
    <>
      {/* Scroll Progress Bar */}
      <ScrollProgress />
      
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

        {/* Social Share Bar */}
        <SocialShare title={blog.title} />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Blog Content */}
            <div className="lg:col-span-2 lg:pl-12">

              {/* Blog Info */}
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full mb-4">
                  {blog.category || 'General'}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  {blog.title}
                </h1>

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
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(blog.createdAt)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {calculateReadingTime(blog.content)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <ViewCounter blogId={blog._id} initialViews={blog.views || 0} />
                  </span>
                </div>
              </div>

              {/* Header Image */}
              {blog.featuredImage && (
                <div className="mb-8">
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
                    <Image
                      src={blog.featuredImage}
                      alt={blog.featuredImageAlt || blog.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  {/* Caption Display */}
                  {blog.featuredImageCaption && (
                    <p className="text-center text-sm text-slate-500 mt-2 italic">
                      {blog.featuredImageCaption}
                    </p>
                  )}
                </div>
              )}

              {blog.subHeading && (
                <p className="text-xl text-slate-600 mb-4">
                  {blog.subHeading}
                </p>
              )}

              {/* Blog Content - HTML Rendered */}
              <article 
                className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-indigo-600 prose-img:rounded-xl prose-blockquote:bg-slate-50 prose-blockquote:border-l-4 prose-blockquote:border-indigo-600 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:my-6 prose-blockquote:not-italic prose-blockquote:text-slate-700"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {/* Tags */}
              <BlogTags tags={blog.tags} />
            </div>

            {/* Sidebar - Sticky */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Related Posts - Grid Layout */}
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Related Posts
                  </h3>
                  {relatedBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
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
                                alt={relatedBlog.featuredImageAlt || relatedBlog.title}
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
              </div>
            </div>
          </div>
        </div>

        {/* Read Next Section - Previous & Next Posts */}
        {(previousPost || nextPost) && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">Read Next</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Previous Post */}
              {previousPost && (
                <Link
                  href={`/blog/${previousPost.slug || previousPost._id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all"
                >
                  <div className="flex-shrink-0">
                    {previousPost.featuredImage ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <Image
                          src={previousPost.featuredImage}
                          alt={previousPost.featuredImageAlt || previousPost.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <ArrowLeft className="w-8 h-8 text-indigo-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 mb-1">← Previous Post</p>
                    <h4 className="font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {previousPost.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(previousPost.createdAt)}
                    </p>
                  </div>
                </Link>
              )}

              {/* Next Post */}
              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug || nextPost._id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all md:flex-row-reverse"
                >
                  <div className="flex-shrink-0">
                    {nextPost.featuredImage ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <Image
                          src={nextPost.featuredImage}
                          alt={nextPost.featuredImageAlt || nextPost.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <ArrowRight className="w-8 h-8 text-indigo-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-right md:text-left">
                    <p className="text-xs text-slate-500 mb-1">Next Post →</p>
                    <h4 className="font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {nextPost.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(nextPost.createdAt)}
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </section>
        )}

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
    </>
  );
}

