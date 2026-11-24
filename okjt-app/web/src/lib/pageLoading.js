import { lazy, useSyncExternalStore } from 'react';

/**
 * Which pages' code is downloading. A page change keeps the old page on
 * screen until the new one's code arrives (React Router runs it as a
 * transition), so the top bar (RouteProgress) is what tells the visitor
 * something is happening.
 */
let pending = 0;
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());

/** React.lazy, counting the download while it runs. */
export function lazyPage(load) {
  return lazy(() => {
    pending += 1;
    emit();
    return load().finally(() => {
      pending -= 1;
      emit();
    });
  });
}

export function usePageLoading() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    () => pending > 0,
    () => false,
  );
}
