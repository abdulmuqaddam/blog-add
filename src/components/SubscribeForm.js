'use client';

import { useState } from 'react';
import { subscribeUser } from '@/lib/actions/subscriberActions';
import { Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage(null);
    setMessageType(null);

    try {
      const result = await subscribeUser(email);
      
      if (result.success) {
        setMessage(result.message);
        setMessageType('success');
        setEmail('');
      } else {
        setMessage(result.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-4">
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Stay in the Loop
          </h3>
          <p className="text-indigo-100 text-sm">
            Get the latest articles and updates delivered directly to your inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-5 py-4 pl-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
              disabled={loading}
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-200" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Subscribe'
            )}
          </button>
        </form>

        {/* Success Message with fade-in animation */}
        {message && messageType === 'success' && (
          <div 
            className="mt-4 p-4 bg-green-500/20 border border-green-400/30 rounded-xl animate-fade-in"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-100 text-sm">{message}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {message && messageType === 'error' && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-100 text-sm">{message}</p>
            </div>
          </div>
        )}

        <p className="text-center text-indigo-200 text-xs mt-4">
          No spam, unsubscribe at any time.
        </p>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

