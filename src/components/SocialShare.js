'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MessageCircle, 
  Twitter, 
  Link as LinkIcon, 
  Check,
  Facebook,
  Linkedin
} from 'lucide-react';

export default function SocialShare({ title, url }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : url || '';
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title || 'Check out this blog post');

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
      <div className="flex flex-col gap-2 bg-white rounded-xl shadow-lg p-3 border border-slate-100">
        {/* WhatsApp */}
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </a>

        {/* Twitter */}
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors"
          title="Share on Twitter"
        >
          <Twitter className="w-5 h-5" />
        </a>

        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          title="Share on Facebook"
        >
          <Facebook className="w-5 h-5" />
        </a>

        {/* LinkedIn */}
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800 transition-colors"
          title="Share on LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </a>

        {/* Copy Link */}
        <button
          onClick={copyToClipboard}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-600 text-white hover:bg-slate-700 transition-colors relative"
          title="Copy Link"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-400" />
          ) : (
            <LinkIcon className="w-5 h-5" />
          )}
          
          {/* Tooltip */}
          {copied && (
            <span className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

