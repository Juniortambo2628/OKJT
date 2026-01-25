import { useEffect } from 'react';
import { Hero } from '../components/hero';
import { analyticsApi } from '../api/client';

export default function HomePage() {
  useEffect(() => {
    analyticsApi.trackPageVisit('/');
  }, []);

  return (
    <div className="min-h-screen">
      <Hero />
    </div>
  );
}

