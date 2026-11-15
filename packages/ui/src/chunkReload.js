/**
 * Reload once after a deploy.
 *
 * A deploy replaces every hashed asset, so a tab opened before it still asks
 * for the old build's files, which are gone from the server. Opening a page
 * that loads lazily then fails with "Failed to fetch dynamically imported
 * module". Reloading picks up the new build. A time window stops a reload loop
 * when a file is genuinely missing.
 *
 * Lifted from naoa-dt (utils/chunkReload.js), with Naoa's vite:preloadError
 * handler folded in.
 */
const DEFAULT_KEY = 'okjt:chunk-reload-at';
const DEFAULT_WINDOW_MS = 60_000;

/** Whether to reload now, recording the time if so. False within `windowMs` of the last reload. */
export function shouldReloadForChunks({ now = Date.now(), storage, key = DEFAULT_KEY, windowMs = DEFAULT_WINDOW_MS } = {}) {
  try {
    const store = storage ?? window.sessionStorage;
    const last = Number(store.getItem(key)) || 0;
    if (now - last < windowMs) return false;
    store.setItem(key, String(now));
    return true;
  } catch {
    return false;
  }
}

/** A failed lazy import, as each browser words it. */
export function isChunkLoadError(error) {
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i
    .test(String(error?.message || error || ''));
}

let uninstall = null;

/**
 * Listen for failed lazy imports and reload once into the new build. Call it
 * once, before rendering (calling it again does nothing). Returns a function
 * that stops listening.
 *
 * @param {{ key?: string, windowMs?: number, reload?: () => void }} [options]
 */
export function installChunkReload({ key = DEFAULT_KEY, windowMs = DEFAULT_WINDOW_MS, reload } = {}) {
  if (typeof window === 'undefined') return () => {};
  if (uninstall) return uninstall;

  const doReload = reload ?? (() => window.location.reload());
  const reloadOnce = (event) => {
    if (!shouldReloadForChunks({ key, windowMs })) return;
    event?.preventDefault?.();
    doReload();
  };
  // Vite's own signal when a lazy page or its styles fail to load.
  const onPreload = (event) => reloadOnce(event);
  // A lazy page that throws while rendering reaches the window as an error.
  const onError = (event) => { if (isChunkLoadError(event.error || event.message)) reloadOnce(event); };
  const onRejection = (event) => { if (isChunkLoadError(event.reason)) reloadOnce(event); };

  window.addEventListener('vite:preloadError', onPreload);
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onRejection);

  uninstall = () => {
    window.removeEventListener('vite:preloadError', onPreload);
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onRejection);
    uninstall = null;
  };
  return uninstall;
}
