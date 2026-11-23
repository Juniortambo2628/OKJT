import { useCallback, useEffect, useRef, useState } from 'react';
import { MEDIA_ACCEPT } from '@okjt/ui';
import { useDashboard } from './DashboardProvider.js';
import useAdminAction from './useAdminAction.js';
import EmptyState from './EmptyState.js';

/**
 * AdminMediaLibrary: the library screen, lifted from TFE's Admin → Media.
 * Upload several photos or videos at once (scaled down and recorded by
 * laravel-kit's MediaController), see them newest first with their size, and
 * delete one (asks first). Pair it with MediaPicker on image fields.
 *
 *   <AdminMediaLibrary />                 // GET/POST /media, DELETE /media/{id}
 *
 * @param {string} [path='/media']
 */
const sizeLabel = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export default function AdminMediaLibrary({ path = '/media' }) {
  const { api } = useDashboard();
  const input = useRef(null);
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(path);
      setData(res.data?.data ?? { assets: [], stats: {} });
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [api, path]);

  useEffect(() => { load(); }, [load]);

  const upload = useAdminAction((files) => {
    const form = new FormData();
    [...files].forEach((file) => form.append('files[]', file));
    return api.post(path, form);
  }, {
    key: () => 'upload',
    success: (res) => res?.data?.message,
    error: "Couldn't upload those files",
    onSuccess: () => load(),
  });

  const remove = useAdminAction((asset) => api.delete(`${path}/${asset.id}`), {
    key: (asset) => asset.id,
    confirm: (asset) => ({ title: `Delete "${asset.name}"?`, message: 'Pages that use it will lose the picture.', confirmLabel: 'Delete', tone: 'danger' }),
    success: 'Deleted',
    error: "Couldn't delete it",
    onSuccess: () => load(),
  });

  const pick = () => input.current?.click();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-soft">
          {data ? `${data.stats?.total ?? data.assets.length} files${data.stats?.bytes ? `, ${sizeLabel(data.stats.bytes)}` : ''}` : ' '}
        </p>
        <button
          type="button"
          onClick={pick}
          disabled={upload.pending || !upload.allowed}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {upload.pending ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={input}
          type="file"
          multiple
          accept={MEDIA_ACCEPT.media}
          className="sr-only"
          aria-label="Upload photos or videos"
          onChange={(e) => { if (e.target.files?.length) upload.run(e.target.files); e.target.value = ''; }}
        />
      </div>

      {failed && <EmptyState message="The media library couldn't be loaded." action={{ label: 'Try again', onClick: load, readOnly: true }} />}
      {!failed && data === null && <EmptyState loading rows={3} />}
      {!failed && data?.assets.length === 0 && <EmptyState message="No photos or videos yet." action={{ label: 'Upload', onClick: pick }} />}
      {!failed && data?.assets.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {data.assets.map((asset) => (
            <li key={asset.id} className="overflow-hidden rounded-xl border border-tone-100 bg-surface">
              <div className="aspect-square overflow-hidden bg-tone-50">
                {asset.kind === 'video'
                  ? <video src={asset.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  : <img src={asset.url} alt={asset.name} loading="lazy" className="h-full w-full object-cover" />}
              </div>
              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-body">{asset.name}</span>
                  <span className="block text-xs text-muted">{sizeLabel(asset.size)}{asset.width ? ` · ${asset.width}×${asset.height}` : ''}</span>
                </span>
                <button
                  type="button"
                  aria-label={`Delete ${asset.name}`}
                  disabled={remove.isPending(asset.id) || !remove.allowed}
                  onClick={() => remove.run(asset)}
                  className="shrink-0 rounded-lg px-2 py-1 text-xs text-soft hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
