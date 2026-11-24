import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from 'lucide-react';
import { useDashboard } from './DashboardProvider.js';
import useAdminAction from './useAdminAction.js';
import EmptyState from './EmptyState.js';
import MediaPicker from './MediaPicker.js';

/**
 * AdminPagePhotos: the pictures each place on the site shows, lifted from
 * Naoa's console (Site pictures). Every place the project lists shows its
 * current pictures (the default until someone swaps it); pick others from
 * the media library or the project's built-in photos, put them in order
 * (several cross-fade), save, or go back to the default.
 *
 *   <AdminPagePhotos
 *     places={[{ key: 'homeHero', label: 'Home page, top', hint: 'Wide, 2000 px', defaults: ['couple-1'] }]}
 *     builtIn={{ 'couple-1': '/img/couple-1.webp', 'couple-2': '/img/couple-2.webp' }}
 *   />
 *
 * @param {Array<{ key, label, hint?, defaults?: string[] }>} places
 * @param {Record<string, string>} [builtIn]  Built-in photo key → address
 * @param {number} [max=8]
 * @param {string} [path='/page-photos']            The public read
 * @param {string} [adminPath='/admin/page-photos']
 * @param {string} [mediaPath='/media']
 */
export default function AdminPagePhotos({ places = [], builtIn = {}, max = 8, path = '/page-photos', adminPath = '/admin/page-photos', mediaPath = '/media' }) {
  const { api } = useDashboard();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState(null); // { key, images }
  const [picking, setPicking] = useState(false);
  const [libraryUrls, setLibraryUrls] = useState({});

  const load = useCallback(async () => {
    try {
      const res = await api.get(path);
      setData({ placements: res.data?.data?.placements ?? {}, media: res.data?.data?.media ?? {} });
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [api, path]);
  useEffect(() => { load(); }, [load]);

  const urlOf = (ref) => builtIn[ref] ?? libraryUrls[ref]?.url ?? data?.media?.[ref]?.url ?? null;
  const nameOf = (ref) => libraryUrls[ref]?.name ?? data?.media?.[ref]?.name ?? ref;

  const save = useAdminAction(({ key, images }) => api.put(`${adminPath}/${encodeURIComponent(key)}`, { images }), {
    key: ({ key }) => key,
    success: 'Picture changed. The site shows it now.',
    error: "Couldn't change the picture",
    onSuccess: () => { setEditing(null); load(); },
  });

  const reset = useAdminAction((place) => api.delete(`${adminPath}/${encodeURIComponent(place.key)}`), {
    key: (place) => place.key,
    confirm: (place) => ({ title: `Put "${place.label}" back to its original picture?`, confirmLabel: 'Put back' }),
    success: 'Back to the original picture',
    error: "Couldn't put it back",
    onSuccess: () => { setEditing(null); load(); },
  });

  if (failed) return <EmptyState message="The site's pictures couldn't be loaded." action={{ label: 'Try again', onClick: load, readOnly: true }} />;
  if (data === null) return <EmptyState loading rows={3} />;
  if (!places.length) return <EmptyState message="No places for pictures yet." />;

  const edit = (place) => setEditing({ key: place.key, images: [...(data.placements[place.key] ?? place.defaults ?? [])] });
  const change = (images) => setEditing((e) => ({ ...e, images }));
  const add = (ref) => editing.images.length < max && !editing.images.includes(ref) && change([...editing.images, ref]);
  const move = (i, by) => { const next = [...editing.images]; const [x] = next.splice(i, 1); next.splice(i + by, 0, x); change(next); };
  const icon = 'rounded-lg p-1.5 text-tone-400 hover:bg-tone-100 hover:text-ink disabled:opacity-30';
  const thumb = (ref) => (urlOf(ref)
    ? <img src={urlOf(ref)} alt={nameOf(ref)} className="h-full w-full object-cover" />
    : <span className="grid h-full w-full place-items-center px-1 text-center text-xs text-muted">{ref}</span>);

  return (
    <ul className="space-y-4">
      {places.map((place) => {
        const chosen = data.placements[place.key];
        const shown = chosen ?? place.defaults ?? [];
        const open = editing?.key === place.key;
        return (
          <li key={place.key} className="rounded-2xl border border-tone-100 bg-surface p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">{place.label}</h3>
                <p className="mt-0.5 text-xs text-muted">{chosen ? `${chosen.length} chosen picture${chosen.length === 1 ? '' : 's'}` : 'The original picture'}{place.hint ? ` · ${place.hint}` : ''}</p>
              </div>
              {!open && (
                <div className="flex gap-2">
                  {chosen && <button type="button" onClick={() => reset.run(place)} disabled={reset.isPending(place.key) || !reset.allowed} className="rounded-lg px-3 py-1.5 text-xs text-soft hover:text-ink disabled:opacity-50">Back to the original</button>}
                  <button type="button" onClick={() => edit(place)} disabled={!save.allowed} className="rounded-lg border border-tone-200 px-3 py-1.5 text-xs font-medium text-tone-700 hover:border-accent hover:text-accent disabled:opacity-50">Change</button>
                </div>
              )}
            </div>

            {!open && shown.length > 0 && (
              <ul className="mt-3 flex gap-2 overflow-x-auto" aria-label={`${place.label}: pictures`}>
                {shown.map((ref) => <li key={ref} className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-tone-100 bg-tone-50">{thumb(ref)}</li>)}
              </ul>
            )}

            {open && (
              <div className="mt-4 space-y-4">
                <ol className="space-y-2" aria-label="Chosen pictures, in order">
                  {editing.images.map((ref, i) => (
                    <li key={ref} className="flex items-center gap-3">
                      <span className="w-5 text-right text-xs tabular-nums text-muted">{i + 1}</span>
                      <span className="h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-tone-100 bg-tone-50">{thumb(ref)}</span>
                      <span className="min-w-0 flex-1 truncate text-xs text-soft">{ref}</span>
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move picture ${i + 1} up`} className={icon}><ArrowUp className="h-4 w-4" /></button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === editing.images.length - 1} aria-label={`Move picture ${i + 1} down`} className={icon}><ArrowDown className="h-4 w-4" /></button>
                      <button type="button" onClick={() => change(editing.images.filter((r) => r !== ref))} aria-label={`Remove picture ${i + 1}`} className="rounded-lg p-1.5 text-tone-400 hover:bg-red-500/10 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ol>
                {!editing.images.length && <p className="text-sm text-muted">Choose at least one picture.</p>}

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => setPicking(true)} disabled={editing.images.length >= max} className="inline-flex items-center gap-1.5 rounded-lg border border-tone-200 px-3 py-1.5 text-xs font-medium text-tone-700 hover:border-accent hover:text-accent disabled:opacity-50">
                    <ImagePlus className="h-3.5 w-3.5" /> From the media library
                  </button>
                </div>
                {Object.keys(builtIn).length > 0 && (
                  <fieldset>
                    <legend className="mb-2 text-xs font-medium text-tone-600">Built-in photos</legend>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(builtIn).map(([ref, url]) => (
                        <button key={ref} type="button" onClick={() => add(ref)} disabled={editing.images.includes(ref) || editing.images.length >= max}
                          aria-label={`Add ${ref}`} className="h-14 w-20 overflow-hidden rounded-lg border border-tone-100 disabled:opacity-40">
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}

                <div className="flex justify-end gap-2 border-t border-tone-100 pt-3">
                  <button type="button" onClick={() => setEditing(null)} className="rounded-full px-4 py-2 text-sm text-soft hover:text-ink">Cancel</button>
                  <button type="button" onClick={() => save.run(editing)} disabled={!editing.images.length || save.isPending(place.key)}
                    className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">Save</button>
                </div>
                <MediaPicker open={picking} onClose={() => setPicking(false)} path={mediaPath}
                  onPick={(asset) => { setLibraryUrls((u) => ({ ...u, [`media-${asset.id}`]: { url: asset.url, name: asset.name } })); add(`media-${asset.id}`); }} />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
