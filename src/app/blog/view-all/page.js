import Link from 'next/link';
import Image from 'next/image';
import { getPublishedBlogs } from '@/lib/actions/blogActions';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function ViewAllPage() {
  const result = await getPublishedBlogs(100);
  const allBlogs = result.success ? result.blogs : [];

  const blogsByCategory = {};
  allBlogs.forEach((blog) => {
    const category = blog.category || 'Uncategorized';
    if (!blogsByCategory[category]) {
      blogsByCategory[category] = [];
    }
    blogsByCategory[category].push(blog);
  });

  const categories = Object.keys(blogsByCategory).sort();

  return (
    <div className="bg-white">
      <Navbar />
      
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">All Blog Posts</h1>
          <p className="text-indigo-100 text-lg max-w-2xl">
            Explore our latest articles across various categories
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {allBlogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg mb-4">No blog posts available yet</p>
            <Link
              href="/dashboard/blog/add"
              className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              Create First Post
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {categories.map((category) => (
              <div key={category} className="mb-12">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{category}</h2>
                  <div className="flex-1 h-px bg-slate-200"></div>
                  <span className="text-slate-500 text-sm">
                    {blogsByCategory[category].length} {blogsByCategory[category].length === 1 ? 'post' : 'posts'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {blogsByCategory[category].map((blog) => (
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
                        <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                          {blog.title}
                        </h3>
                        {blog.subHeading && (
                          <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                            {blog.subHeading}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">
                            {formatDate(blog.createdAt)}
                          </span>
                          <span className="text-indigo-600 font-semibold text-xs group-hover:translate-x-1 transition-transform">
                            Read More →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

