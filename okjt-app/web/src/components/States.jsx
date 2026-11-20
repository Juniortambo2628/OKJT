import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton, Spinner } from '@okjt/ui';

/** Cards loading: the grid's shape, so nothing jumps when they arrive. */
export function CardGridSkeleton({ count = 6, className = 'sm:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={`grid gap-5 ${className}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-80 rounded-[1.75rem] !bg-surface" />)}
    </div>
  );
}

/** Nothing to show yet. */
export function Empty({ children }) {
  return <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center text-muted">{children}</div>;
}

/** A failed load, with a way back. */
export function LoadError({ what = 'this page' }) {
  return (
    <div className="rounded-3xl glass px-6 py-16 text-center">
      <p className="text-ink">We couldn’t load {what}.</p>
      <p className="mt-2 text-sm text-muted">Check your connection and refresh, or <Link to="/" className="text-accent underline">go to the home page</Link>.</p>
    </div>
  );
}

/** Seconds since `running` became true (0 while it is false), for "12 s" next to a long wait. */
export function useElapsed(running) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) { setSeconds(0); return undefined; }
    const started = Date.now();
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [running]);
  return seconds;
}

/** The spinner and words inside a button while it works: the button keeps its size and colour. */
export function Busy({ children }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <Spinner size="sm" className="!text-current motion-reduce:animate-none" />
      {children}
    </span>
  );
}

/**
 * A page loading: the page's background, and a spinner that only appears if
 * the wait passes 400 ms, so a quick load shows no flash.
 */
export function PageLoading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper" role="status" aria-label="Loading">
      <div className="okjt-appear-late flex flex-col items-center gap-3 text-sm text-soft">
        <Spinner size="lg" className="motion-reduce:animate-none" />
        Loading…
      </div>
    </div>
  );
}
