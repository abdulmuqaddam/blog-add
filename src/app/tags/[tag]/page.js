import Link from 'next/link';
import Image from 'next/image';
import { getBlogsByTag } from '@/lib/actions/blogActions';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Date formatter function
function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Generate SEO Metadata
export async function generateMetadata({ params }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  return {
    title: `${decodedTag} - Blogify`,
    description: `Browse all blog posts tagged with ${decodedTag}`,
    keywords: decodedTag,
  };
}

export default async function TagPage({ params }) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  
  // Fetch blogs by tag
  const result = await getBlogsByTag(decodedTag);
  const blogs = result.success ? result.blogs : [];

  return (
    <div className="bg-white">
      <Navbar />
      
      {/* Header */}
      <div className="pt-24 pb-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="text-slate-500 hover:text-indigo-600">
              Home
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900">Tags</span>
            <span className="text-slate-400">/</span>
            <span className="text-indigo-600 font-medium">{decodedTag}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            #{decodedTag}
          </h1>
          <p className="text-slate-500 mt-2">
            {blogs.length} {blogs.length === 1 ? 'post' : 'posts'} tagged with "{decodedTag}"
          </p>
        </div>
      </div>

      {/* Blog Grid - 4 Columns */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogs.map((blog) => (
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
            <p className="text-slate-500 text-lg mb-4">No posts found for this tag</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              Back to Home
            </Link>
          </div>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

