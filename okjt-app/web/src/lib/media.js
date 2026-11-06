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
