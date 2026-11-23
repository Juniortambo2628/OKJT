import { useEffect, useState } from 'react';
import { Modal } from '@okjt/ui';
import { useDashboard } from './DashboardProvider.js';
import EmptyState from './EmptyState.js';

/**
 * MediaPicker: "choose from the library", lifted from TFE's MediaPicker. Lists
 * the media library (laravel-kit's MediaController) and hands back the chosen
 * asset, so an image field can reuse a photo already uploaded instead of
 * asking for it again.
 *
 *   <MediaPicker open={open} onClose={close} onPick={(asset) => setUrl(asset.url)} />
 *
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {(asset: { id, url, name, kind, width, height }) => void} onPick
 * @param {'image'|'video'|null} [kind='image']  null shows everything
 * @param {string} [path='/media']
 * @param {string} [title='Media library']
 */
export default function MediaPicker({ open, onClose, onPick, kind = 'image', path = '/media', title = 'Media library' }) {
  const { api } = useDashboard();
  const [assets, setAssets] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setAssets(null);
    setFailed(false);
    api.get(path, { params: kind ? { kind } : {} })
      .then((res) => { if (!cancelled) setAssets(res.data?.data?.assets ?? []); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [open, kind, path, api]);

  const choose = (asset) => {
    onPick(asset);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="3xl">
      {failed && <EmptyState message="The media library couldn't be loaded." />}
      {!failed && assets === null && <EmptyState loading rows={2} />}
      {!failed && assets?.length === 0 && <EmptyState message="The library is empty. Upload photos to it first, then pick them here." />}
      {!failed && assets?.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {assets.map((asset) => (
            <li key={asset.id}>
              <button
                type="button"
                onClick={() => choose(asset)}
                className="group block w-full overflow-hidden rounded-xl border border-tone-100 bg-tone-50 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <span className="block aspect-square overflow-hidden">
                  {asset.kind === 'video'
                    ? <video src={asset.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    : <img src={asset.url} alt={asset.name} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                </span>
                <span className="block truncate px-2 py-1.5 text-xs text-soft">{asset.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
