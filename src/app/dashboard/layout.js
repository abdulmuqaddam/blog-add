// Dashboard Layout - Common Navbar, Sidebar, Footer
import Link from 'next/link';
import { getCurrentUser, logout } from '@/lib/actions/authActions';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Dashboard',
  description: 'Admin & User Dashboard',
};

export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser();

  const handleLogout = async () => {
    'use server';
    await logout();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Blog Dashboard</h1>
          <div className="flex gap-4 items-center">
            <Link href="/dashboard/home" className="hover:text-gray-300">
              Home
            </Link>
            {user ? (
              <>
                <span className="text-gray-300">Welcome, {user.name}</span>
                <form action={handleLogout}>
                  <button type="submit" className="hover:text-red-300 text-red-400 cursor-pointer transition-colors">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/dashboard/login" className="hover:text-gray-300">
                  Login
                </Link>
                <Link href="/dashboard/signup" className="hover:text-gray-300">
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar - Client Component */}
        <Sidebar user={user} handleLogout={handleLogout} />

        {/* Main Content */}
        <main className="flex-1 p-6 bg-white">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4 text-center">
        <p>&copy; {new Date().getFullYear()} Blog Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
}

