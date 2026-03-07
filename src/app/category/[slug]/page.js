import Link from 'next/link';
import Image from 'next/image';
import { getBlogsByCategory, getAllCategoriesList } from '@/lib/actions/blogActions';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryPills from '@/components/CategoryPills';

// Date formatter function
function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Category display names mapping
const categoryDisplayNames = {
  tech: 'Tech',
  health: 'Health',
  business: 'Business',
};

// Generate static params for known categories
export async function generateStaticParams() {
  return [
    { slug: 'tech' },
    { slug: 'health' },
    { slug: 'business' },
  ];
}

export const metadata = {
  title: 'Category | Blog',
  description: 'Browse blog posts by category',
};

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  // Convert slug to category name (capitalize first letter)
  const categoryName = categoryDisplayNames[slug.toLowerCase()] || 
    slug.charAt(0).toUpperCase() + slug.slice(1);
  
  // Fetch blogs by category
  const result = await getBlogsByCategory(categoryName, 50);
  const categoriesResult = await getAllCategoriesList();
  
  const blogs = result.success ? result.blogs : [];
  const categories = categoriesResult.success ? categoriesResult.categories : [];

  return (
    <div className="bg-white">
      <Navbar />
      
      {/* Category Pills */}
      <section className="pt-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <CategoryPills categories={categories} />
        </div>
      </section>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-2 text-sm mb-4">
          <Link href="/" className="text-slate-500 hover:text-indigo-600">
            Home
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 font-medium">{categoryName}</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          {categoryName} Blogs
        </h1>
        <p className="text-slate-500 mt-2">
          {blogs.length} {blogs.length === 1 ? 'post' : 'posts'} found in {categoryName}
        </p>
      </div>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
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
                    {blog.category || categoryName}
                  </span>
                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                      {blog.excerpt}
                    </p>
                  )}
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
            <p className="text-slate-500 text-lg mb-4">
              No posts found in this category
            </p>
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

