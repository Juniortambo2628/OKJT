import { useCallback, useEffect, useState } from 'react';
import { useDashboard } from './DashboardProvider.js';
import useAdminAction from './useAdminAction.js';
import EmptyState from './EmptyState.js';
import { AdminInput, AdminSelect } from './AdminInput.js';

/**
 * AdminMpesaSettings: connecting M-Pesa from the admin (naoa-dt's "Connect
 * M-Pesa", Tena-host's M-Pesa settings), on laravel-kit's
 * MpesaSettingsController. Daraja's keys, the paybill or till and its
 * passkey; secrets are typed to replace them and never shown ("Saved" or
 * not); whether M-Pesa is switched on and fully set up; the callback address
 * to give Safaricom.
 *
 *   <AdminMpesaSettings />
 *
 * @param {string} [path='/admin/mpesa']
 */
const EMPTY = { env: 'sandbox', consumer_key: '', consumer_secret: '', shortcode: '', type: 'paybill', till_number: '', passkey: '' };

export default function AdminMpesaSettings({ path = '/admin/mpesa' }) {
  const { api } = useDashboard();
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [failed, setFailed] = useState(false);

  const fill = (data) => {
    setSettings(data);
    setForm({ ...EMPTY, env: data.env, consumer_key: data.consumer_key ?? '', shortcode: data.shortcode ?? '', type: data.type, till_number: data.till_number ?? '' });
  };
  const load = useCallback(async () => {
    try {
      const res = await api.get(path);
      fill(res.data?.data ?? {});
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [api, path]);
  useEffect(() => { load(); }, [load]);

  const save = useAdminAction((values) => api.put(path, values), {
    key: () => 'save',
    confirm: (values) => (values.env === 'production' && settings?.env !== 'production'
      ? { title: 'Use live M-Pesa?', message: 'Prompts will ask for real money from now on.', confirmLabel: 'Use live M-Pesa' }
      : null),
    success: 'M-Pesa settings saved',
    error: "The settings couldn't be saved",
    onSuccess: (res) => fill(res?.data?.data ?? settings),
  });

  if (failed) return <EmptyState message="The M-Pesa settings couldn't be loaded." action={{ label: 'Try again', onClick: load, readOnly: true }} />;
  if (!settings) return <EmptyState loading rows={4} />;

  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    save.run(Object.fromEntries(Object.entries(form).filter(([key, v]) => v !== '' || !['consumer_secret', 'passkey'].includes(key))));
  };
  const status = !settings.on ? 'Switched off' : settings.configured ? 'Switched on and set up' : 'Switched on, but not fully set up';

  return (
    <form onSubmit={submit} className="space-y-6">
      <div role="status" className="rounded-2xl border border-tone-100 bg-surface px-4 py-3 text-sm text-body">
        <span className="font-semibold text-ink">{status}.</span>{' '}
        {settings.on ? 'Prompts can be sent once everything below is filled in.' : 'Nothing is sent until M-Pesa is switched on (Switches).'}
      </div>

      <fieldset className="space-y-3 rounded-2xl border border-tone-100 bg-surface p-4">
        <legend className="px-1 text-sm font-semibold text-ink">Daraja app</legend>
        <AdminSelect label="Environment" value={form.env} onChange={set('env')}>
          <option value="sandbox">Sandbox (testing)</option>
          <option value="production">Live</option>
        </AdminSelect>
        <AdminInput label="Consumer key" value={form.consumer_key} onChange={set('consumer_key')} autoComplete="off" maxLength={255} />
        <AdminInput label="Consumer secret" type="password" value={form.consumer_secret} onChange={set('consumer_secret')} autoComplete="new-password"
          placeholder={settings.consumer_secret_set ? 'Saved; type a new one to replace it' : ''} maxLength={255} />
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-tone-100 bg-surface p-4">
        <legend className="px-1 text-sm font-semibold text-ink">Where the money goes</legend>
        <AdminSelect label="Type" value={form.type} onChange={set('type')}>
          <option value="paybill">Paybill</option>
          <option value="till">Till (Buy Goods)</option>
        </AdminSelect>
        <div className={form.type === 'till' ? 'grid gap-3 sm:grid-cols-2' : ''}>
          <AdminInput label={form.type === 'till' ? 'Store number' : 'Paybill number'} inputMode="numeric" value={form.shortcode} onChange={set('shortcode')} maxLength={7} />
          {form.type === 'till' && <AdminInput label="Till number" inputMode="numeric" value={form.till_number} onChange={set('till_number')} maxLength={8} required />}
        </div>
        <AdminInput label="Passkey" type="password" value={form.passkey} onChange={set('passkey')} autoComplete="new-password"
          placeholder={settings.passkey_set ? 'Saved; type a new one to replace it' : ''} maxLength={255} />
      </fieldset>

      <div className="rounded-2xl border border-tone-100 bg-surface p-4 text-sm">
        <p className="font-semibold text-ink">Callback address</p>
        <p className="mt-1 text-soft">Each payment gets its own address under this one; nothing to set at Safaricom.</p>
        <p className="mt-2 break-all font-mono text-xs text-body">{settings.callback_url}</p>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={save.pending || !save.allowed} className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {save.pending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
