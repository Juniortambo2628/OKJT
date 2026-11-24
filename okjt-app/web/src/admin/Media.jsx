import { useRef, useState } from 'react';
import { Copy, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { AdminListPanel, AdminPageHero, AdminPageLayout, AdminSummaryCards, EmptyState, QueryError, useAdminAction, useFilteredItems, useSearch } from '@okjt/dashboard';
import { notifyError, notifySuccess } from '@okjt/ui';
import api, { errorMessage } from '../lib/api';
import { mediaUrl } from '../lib/media';
import { uploadFile, useMedia } from './fields';

/** Everything uploaded: pictures and clips, to copy into any field or delete. */
export default function Media() {
  const query = useMedia();
  const { searchQuery } = useSearch();
  const files = useFilteredItems(query.data ?? [], searchQuery, (f, q) => f.filename.toLowerCase().includes(q));
  const input = useRef(null);
  const [uploading, setUploading] = useState(0);

  const remove = useAdminAction((path) => api.delete('/upload', { data: { path } }), {
    confirm: { title: 'Delete this file?', message: 'Pages that use it will show an empty space until another is chosen.', confirmLabel: 'Delete' },
    success: 'File deleted',
    invalidate: [['/media']],
  });

  const upload = async (list) => {
    const chosen = [...(list ?? [])];
    setUploading(chosen.length);
    for (const file of chosen) {
      try { await uploadFile(file); } catch (err) { notifyError(errorMessage(err, `${file.name} didn’t upload.`)); }
      setUploading((n) => n - 1);
    }
    query.refetch();
  };

  const copy = async (path) => {
    try { await navigator.clipboard.writeText(`/storage/${path}`); notifySuccess('Address copied'); } catch { notifyError('Copy didn’t work; select the address instead.'); }
  };

  const total = (query.data ?? []).reduce((sum, f) => sum + (f.size || 0), 0);
  return (
    <AdminPageLayout
      fill
      hero={<AdminPageHero title="Media library" breadcrumb="Media library" description="Uploaded pictures are resized and converted to WebP, so pages stay light." />}
      summary={<AdminSummaryCards columns={3} cards={[
        { label: 'Files', value: query.data?.length ?? '—', icon: ImageIcon },
        { label: 'Pictures', value: (query.data ?? []).filter((f) => f.type === 'image').length, icon: ImageIcon },
        { label: 'Space used', value: `${(total / 1024 / 1024).toFixed(1)} MB`, icon: Upload },
      ]} />}
      search="Search files"
      actions={[{ id: 'upload', label: uploading ? `Uploading ${uploading}…` : 'Upload', icon: Upload, onClick: () => input.current?.click(), variant: 'primary', disabled: uploading > 0 }]}
    >
      <input ref={input} type="file" multiple hidden accept="image/*,video/mp4" onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
      {query.isError ? <QueryError what="the media library" onRetry={query.refetch} error={query.error} /> : (
        <AdminListPanel plain>
          {query.isLoading || !files.length ? (
            <EmptyState loading={query.isLoading} icon={ImageIcon} searchQuery={searchQuery} message="Nothing uploaded yet." action={{ label: 'Upload', onClick: () => input.current?.click(), icon: Upload }} />
          ) : (
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
              {files.map((f) => (
                <li key={f.path} className="group overflow-hidden rounded-xl border border-tone-100 bg-surface">
                  <div className="relative aspect-square bg-tone-50">
                    {f.type === 'video'
                      ? <video src={mediaUrl(f.url)} className="h-full w-full object-cover" muted preload="metadata" />
                      : <img src={mediaUrl(f.url)} alt="" loading="lazy" className="h-full w-full object-cover" />}
                    <div className="absolute inset-x-2 bottom-2 flex justify-end gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                      <button type="button" onClick={() => copy(f.path)} aria-label={`Copy the address of ${f.filename}`} className="rounded-lg bg-black/70 p-2 text-white hover:text-accent"><Copy className="h-4 w-4" /></button>
                      <button type="button" onClick={() => remove.run(f.path)} aria-label={`Delete ${f.filename}`} className="rounded-lg bg-black/70 p-2 text-white hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <div className="truncate text-xs text-tone-700" title={f.filename}>{f.filename}</div>
                    <div className="text-[11px] text-tone-400">{f.size_formatted}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminListPanel>
      )}
    </AdminPageLayout>
  );
}
