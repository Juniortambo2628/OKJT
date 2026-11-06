import { Link } from 'react-router-dom';
import { Skeleton } from '@okjt/ui';

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
