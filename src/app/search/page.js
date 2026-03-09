import Link from 'next/link';
import Image from 'next/image';
import { searchBlogs } from '@/lib/actions/blogActions';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, Calendar, ArrowRight } from 'lucide-react';

function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const metadata = {
  title: 'Search Results - Blogify',
  description: 'Search results for blog posts',
};

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || '';
  
  const result = query ? await searchBlogs(query) : { success: true, blogs: [], query: '' };
  const blogs = result.success ? result.blogs : [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header */}
      <div className="pt-24 pb-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Search className="w-8 h-8" />
            Search Results
          </h1>
          <p className="text-indigo-100">
            {query ? `Showing results for "${query}"` : 'Enter a search term to find posts'}
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!query ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl">
            <Search className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">Please enter a search term</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl">
            <Search className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg mb-2">No results found for "{query}"</p>
            <p className="text-slate-400 text-sm">Try different keywords or check spelling</p>
          </div>
        ) : (
          <>
            <p className="text-slate-500 mb-6">{blogs.length} result{blogs.length !== 1 ? 's' : ''} found</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link
                  key={blog._id}
                  href={`/blog/${blog.slug || blog._id}`}
                  className="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
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
                    {blog.subHeading && (
                      <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                        {blog.subHeading}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(blog.createdAt)}</span>
                      </div>
                      <span className="text-indigo-600 font-semibold text-sm group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Read <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}

