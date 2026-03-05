// Subscribers Dashboard Page
import { getAllSubscribers, getSubscriberCount } from '@/lib/actions/subscriberActions';
import { getCurrentUser } from '@/lib/actions/authActions';
import SubscribersTable from '@/components/SubscribersTable';
import { Mail, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// Generate Metadata
export const metadata = {
  title: 'Subscribers - Blog Dashboard',
  description: 'Manage newsletter subscribers',
};

export default async function SubscribersPage() {
  const user = await getCurrentUser();

  // Check if user is authenticated
  if (!user) {
    redirect('/dashboard/login');
  }

  // Fetch subscribers data
  const [subscribersResult, countResult] = await Promise.all([
    getAllSubscribers(),
    getSubscriberCount()
  ]);

  const subscribers = subscribersResult.success ? subscribersResult.subscribers : [];
  const activeCount = countResult.success ? countResult.count : 0;

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
            <p className="text-gray-500 mt-1">Manage your email subscribers</p>
          </div>
          <Link 
            href="/dashboard"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center sm:text-left"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">Total Subscribers</p>
              <p className="text-3xl font-bold mt-1">{subscribers.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Subscribers</p>
              <p className="text-3xl font-bold mt-1">{activeCount}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Unsubscribed</p>
              <p className="text-3xl font-bold mt-1">
                {subscribers.filter(s => s.status === 'unsubscribed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers Table with Export Buttons */}
      <SubscribersTable initialSubscribers={subscribers} />
    </div>
  );
}

