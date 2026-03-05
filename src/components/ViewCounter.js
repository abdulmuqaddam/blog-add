'use client';

import { useEffect, useState, useRef } from 'react';
import CountUp from 'react-countup';
import { incrementViews } from '@/lib/actions/blogActions';

export default function ViewCounter({ blogId, initialViews }) {
  const [views, setViews] = useState(initialViews || 0);
  const [hasStarted, setHasStarted] = useState(false);
  const hasIncremented = useRef(false);

  useEffect(() => {
    // Prevent double increment in Strict Mode (development)
    if (hasIncremented.current) return;
    
    // Increment views on mount
    const updateViews = async () => {
      hasIncremented.current = true;
      const result = await incrementViews(blogId);
      if (result.success) {
        setViews(result.views);
      }
      setHasStarted(true);
    };

    updateViews();
  }, [blogId]);

  return (
    <span className="flex items-center gap-1">
      <CountUp 
        start={hasStarted ? 0 : views} 
        end={views} 
        duration={1.5}
        separator=","
        enableScrollSpy={false}
        useEasing={true}
      />
      {views === 1 ? ' view' : ' views'}
    </span>
  );
}

