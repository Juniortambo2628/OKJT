/**
 * Where a stored image or video lives. Uploads are served by the web server
 * straight from /storage (no PHP); old absolute links to the API's
 * /api/storage/… (on any host) are pointed there too. Paths under /assets
 * and /logos are files of this app.
 */
export function mediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;
  if (/^https?:\/\//.test(path)) {
    const stored = path.match(/^https?:\/\/[^/]+(?:\/api)?\/storage\/(.+)$/);
    return stored ? `/storage/${stored[1]}` : path;
  }
  const clean = path.replace(/^\/+/, '');
  if (clean.startsWith('assets/') || clean.startsWith('logos/') || clean.startsWith('brand/')) return `/${clean}`;
  if (clean.startsWith('api/storage/')) return `/${clean.slice(4)}`;
  if (clean.startsWith('storage/')) return `/${clean}`;
  return `/storage/${clean}`;
}

export const isVideo = (path) => /\.(mp4|webm|mov)(\?.*)?$/i.test(path || '');

/**
 * Lighter copies of the large stock clips that ship with the app, in
 * public/assets/videos/okjt-bg-videos: a 1080p encode (a fraction of the 4K
 * file, and no visible difference at hero size) and its first frame as a
 * poster, shown at once while the clip loads. Matched by the stock clip's
 * number, so an upload of the same file under /storage is lightened too.
 */
const CLIPS = '/assets/videos/okjt-bg-videos/';
const LIGHTER = new Set(['3129671', '3129977']);

/** A clip's address to play and its poster: { src, poster }. */
export function clipFor(path) {
  const id = String(path || '').split('/').pop().match(/^(\d+)-uhd_/)?.[1];
  if (id && LIGHTER.has(id)) return { src: `${CLIPS}${id}-1080p.mp4`, poster: `${CLIPS}${id}-poster.webp` };
  return { src: mediaUrl(path), poster: null };
}
