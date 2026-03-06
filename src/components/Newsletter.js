'use client';

import { useState } from 'react';
import { subscribeUser } from '@/lib/actions/subscriberActions';
import { Mail, ArrowRight, Loader2, Check, AlertCircle, X } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const dismissSuccess = () => {
    setSubscribed(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await subscribeUser(email);
      
      if (result.success) {
        setSubscribed(true);
        setEmail('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-indigo-600">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay in the Loop
          </h2>
          
          {/* Subheading */}
          <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
            Get the latest articles, insights, and updates delivered directly to your inbox. No spam, unsubscribe anytime.
          </p>

          {/* Success State */}
          {subscribed ? (
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 px-6 py-4 rounded-xl">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-medium">
                Thanks for subscribing to our newsletter!
              </span>
              <button
                type="button"
                onClick={dismissSuccess}
                className="ml-2 p-1 hover:bg-green-500/30 rounded-full transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-4 bg-white text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-slate-400"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 px-4 py-2 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-300" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Trust Badge */}
          <p className="mt-6 text-indigo-200 text-sm">
            🔒 We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}

