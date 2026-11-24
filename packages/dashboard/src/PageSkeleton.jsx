import { useEffect, useState } from 'react';
import { DEFAULT_SKELETON_PATTERNS, DEFAULT_SKELETON_VARIANT, skeletonVariantFor } from './skeletonShapes.js';

/** How long a page may take to load before a skeleton is worth showing (TFE's figure). */
export const SKELETON_GRACE_MS = 220;

const BLOCK = 'rounded-xl bg-tone-100 motion-safe:animate-pulse';

function Hero() {
  return (
    <div className="mb-6 space-y-3">
      <div className={`${BLOCK} h-7 w-56 max-w-[60%]`} />
      <div className={`${BLOCK} h-4 w-80 max-w-[80%]`} />
    </div>
  );
}

function Panel({ lines = 4, className = '' }) {
  return (
    <div className={`space-y-3 rounded-2xl border border-tone-100 bg-surface/50 p-5 ${className}`}>
      <div className={`${BLOCK} h-5 w-1/3`} />
      {Array.from({ length: lines }, (_, i) => <div key={i} className={`${BLOCK} h-3.5`} style={{ width: `${90 - (i % 3) * 15}%` }} />)}
    </div>
  );
}

/**
 * A placeholder shaped like a page: `dashboard` (tiles, then two panels),
 * `cards` (a grid), `table` (rows) or `split` (a form beside a preview).
 * Drawn in the theme's tones, and still under reduced motion.
 */
export function PageSkeletonShape({ variant = DEFAULT_SKELETON_VARIANT }) {
  if (variant === 'split') {
    return (
      <>
        <Hero />
        <div className="grid gap-6 lg:grid-cols-3">
          <Panel lines={8} className="lg:col-span-2" />
          <Panel lines={4} />
        </div>
      </>
    );
  }
  if (variant === 'table') {
    return (
      <>
        <Hero />
        <div className="space-y-3 rounded-2xl border border-tone-100 bg-surface/50 p-5">
          {Array.from({ length: 7 }, (_, i) => <div key={i} className={`${BLOCK} h-9`} />)}
        </div>
      </>
    );
  }
  if (variant === 'cards') {
    return (
      <>
        <Hero />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-3 rounded-2xl border border-tone-100 bg-surface/50 p-4">
              <div className={`${BLOCK} aspect-video`} />
              <div className={`${BLOCK} h-4 w-3/5`} />
              <div className={`${BLOCK} h-4 w-2/5`} />
            </div>
          ))}
        </div>
      </>
    );
  }
  return (
    <>
      <Hero />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className={`${BLOCK} h-24`} />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel lines={6} />
        <Panel lines={4} />
      </div>
    </>
  );
}

/**
 * The skeleton DashboardShell shows while a page loads (F9, from TFE's
 * PageTransition + PageSkeleton), used as the page's Suspense fallback when
 * `shell.pageSkeleton` is set. Nothing for the first `grace` ms: a page that
 * arrives quickly shouldn't flash a placeholder. Then the shape for `path`.
 *
 * @param {string} path
 * @param {Array}  [patterns]  [regex, variant] pairs (DEFAULT_SKELETON_PATTERNS)
 * @param {string} [fallback]  the shape when nothing matches ('dashboard')
 * @param {number} [grace]     ms before it appears (220)
 */
export default function PageSkeleton({ path, patterns = DEFAULT_SKELETON_PATTERNS, fallback = DEFAULT_SKELETON_VARIANT, grace = SKELETON_GRACE_MS }) {
  const [shown, setShown] = useState(grace <= 0);
  useEffect(() => {
    if (grace <= 0) return undefined;
    const timer = setTimeout(() => setShown(true), grace);
    return () => clearTimeout(timer);
  }, [grace]);
  if (!shown) return null;
  return (
    <div role="status" aria-busy="true" data-skeleton={skeletonVariantFor(path, patterns, fallback)}>
      <span className="sr-only">Loading…</span>
      <PageSkeletonShape variant={skeletonVariantFor(path, patterns, fallback)} />
    </div>
  );
}
