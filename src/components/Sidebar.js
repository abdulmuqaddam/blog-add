'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Plus, Eye, LogOut, User, Users, Mail, Video } from 'lucide-react';

export default function Sidebar({ user, handleLogout }) {
  const [blogDropdownOpen, setBlogDropdownOpen] = useState(false);
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);

  return (
    <aside className="w-64 bg-gray-100 p-4 hidden md:block">
      <ul className="space-y-2">
        <li>
          <Link 
            href="/dashboard" 
            className="block p-2 hover:bg-gray-200 rounded flex items-center gap-2 transition-all duration-200 hover:translate-x-1 hover:shadow-sm cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
        </li>
        
        {/* Blog Dropdown - Clickable */}
        <li>
          <button 
            onClick={() => setBlogDropdownOpen(!blogDropdownOpen)}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-200 rounded text-left font-medium transition-all duration-200"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Blog
            </span>
            {blogDropdownOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {/* Dropdown Menu */}
          {blogDropdownOpen && (
            <ul className="ml-4 mt-1 space-y-1 border-l-2 border-indigo-300 pl-2">
              <li>
                <Link 
                  href="/dashboard/blog/add" 
                  className="block px-4 py-2 hover:bg-indigo-50 text-slate-700 rounded flex items-center gap-2 transition-all duration-200 hover:translate-x-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard/blog/view" 
                  className="block px-4 py-2 hover:bg-indigo-50 text-slate-700 rounded flex items-center gap-2 transition-all duration-200 hover:translate-x-1 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  View Blogs
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Videos Link */}
        <li>
          <Link 
            href="/dashboard/videos" 
            className="block p-2 hover:bg-gray-200 rounded flex items-center gap-2 transition-all duration-200 hover:translate-x-1 hover:shadow-sm cursor-pointer"
          >
            <Video className="w-5 h-5" />
            Videos
          </Link>
        </li>

        {/* Users Dropdown - Clickable */}
        <li>
          <button 
            onClick={() => setUsersDropdownOpen(!usersDropdownOpen)}
            className="w-full flex items-center justify-between p-2 hover:bg-gray-200 rounded text-left font-medium transition-all duration-200"
          >
            <span className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users
            </span>
            {usersDropdownOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {/* Dropdown Menu */}
          {usersDropdownOpen && (
            <ul className="ml-4 mt-1 space-y-1 border-l-2 border-emerald-300 pl-2">
              <li>
                <Link 
                  href="/dashboard/users" 
                  className="block px-4 py-2 hover:bg-emerald-50 text-slate-700 rounded flex items-center gap-2 transition-all duration-200 hover:translate-x-1 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  All Users
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Subscribers Link */}
        <li>
          <Link 
            href="/dashboard/subscribers" 
            className="block p-2 hover:bg-gray-200 rounded flex items-center gap-2 transition-all duration-200 hover:translate-x-1 cursor-pointer"
          >
            <Mail className="w-5 h-5" />
            Subscribers
          </Link>
        </li>
        
        {user ? (
          <>
            <li className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 p-2 text-gray-600">
                <User className="w-5 h-5" />
                <span className="font-semibold">{user.name}</span>
              </div>
            </li>
            <li>
              <form action={handleLogout}>
                <button 
                  type="submit" 
                  className="w-full block p-2 hover:bg-red-50 text-red-600 rounded flex items-center gap-2 transition-all duration-200 hover:translate-x-1 cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </form>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link 
                href="/dashboard/login" 
                className="block p-2 hover:bg-gray-200 rounded flex items-center gap-2 transition-all duration-200 hover:translate-x-1 cursor-pointer"
              >
                Login
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/signup" 
                className="block p-2 hover:bg-gray-200 rounded flex items-center gap-2 transition-all duration-200 hover:translate-x-1 cursor-pointer"
              >
                Signup
              </Link>
            </li>
          </>
        )}
      </ul>
    </aside>
  );
}
