'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Search, Loader2 } from 'lucide-react';
import { getAllCategoriesList } from '@/lib/actions/blogActions';

export default function Navbar() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
    setCurrentPath(window.location.pathname);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await getAllCategoriesList();
      if (result.success && result.categories.length > 0) {
        // Get top 5 categories
        setCategories(result.categories.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleMobileSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      setIsMobileMenuOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Static links for fallback if no categories
  const defaultLinks = [
    { name: 'Home', href: '/' },
    { name: 'Tech', href: '/category/tech' },
    { name: 'Health', href: '/category/health' },
    { name: 'Business', href: '/category/business' },
    { name: 'Travel', href: '/category/travel' },
  ];

  const navLinks = categories.length > 0 
    ? categories.map(cat => ({ name: cat.name, href: `/category/${cat.slug || cat.name.toLowerCase()}` }))
    : defaultLinks;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-md py-3'
          : 'bg-white shadow-sm py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-slate-900 font-bold text-xl hidden sm:block">
              Blogify
            </span>
          </Link>

          {/* Desktop Navigation - Category Links */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {loadingCategories ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : (
              navLinks.map((link) => {
                const isActive = currentPath === link.href || currentPath.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-{
                      isActive
                        ? 'text-indigo-200 $600 bg-indigo-50'
                        : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })
            )}
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-shrink-0">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-64 lg:w-72 pl-4 pr-12 py-2.5 bg-slate-100 border-2 border-transparent rounded-full text-sm focus:outline-none focus:border-indigo-300 focus:bg-white transition-all placeholder:text-slate-400"
                aria-label="Search posts"
              />
              <button
                type="submit"
                disabled={isSearching || searchQuery.trim().length < 2}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </form>
            {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
              <p className="text-xs text-red-500 mt-1 absolute">Minimum 2 characters required</p>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleMobileSearch} className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-4 pr-12 py-3 bg-slate-100 border-2 border-transparent rounded-xl text-base focus:outline-none focus:border-indigo-300 focus:bg-white transition-all placeholder:text-slate-400"
                aria-label="Search posts"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col gap-1">
              {loadingCategories ? (
                <div className="flex items-center gap-2 text-slate-400 p-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading categories...</span>
                </div>
              ) : (
                navLinks.map((link) => {
                  const isActive = currentPath === link.href || currentPath.startsWith(link.href + '/');
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`px-4 py-3 text-base font-medium rounded-lg transition-all ${
                        isActive
                          ? 'text-indigo-600 bg-indigo-50'
                          : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

