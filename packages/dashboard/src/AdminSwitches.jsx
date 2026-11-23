import { useCallback, useEffect, useState } from 'react';
import { useDashboard } from './DashboardProvider.js';
import useAdminAction from './useAdminAction.js';
import EmptyState from './EmptyState.js';

/**
 * AdminSwitches: the admin's on/off switches (laravel-kit's SwitchController,
 * superadmins only). Each declared switch is a row with its label, what it
 * does, and a switch; flipping one asks first, then saves straight away.
 *
 *   <AdminSwitches />                       // GET /switches, PUT /switches/{key}
 *   <AdminSwitches path="/console/switches" />
 *
 * @param {string}   [path='/switches']  Where the API serves the switches
 * @param {(text: string) => string} [translate]  Applied to labels and descriptions
 * @param {(switch, on: boolean) => string|object|null} [confirm]  What to ask before a flip
 *   (confirmAction input); return null to flip without asking. Default: asks.
 */
const identity = (text) => text;
const defaultConfirm = (s, on) => ({
  title: on ? `Turn on "${s.label}"?` : `Turn off "${s.label}"?`,
  message: on
    ? 'People will see it straight away. You can turn it off again here.'
    : 'It disappears for everyone straight away. You can turn it back on here.',
  confirmLabel: on ? 'Turn on' : 'Turn off',
  tone: on ? 'default' : 'danger',
});

export default function AdminSwitches({ path = '/switches', translate = identity, confirm = defaultConfirm }) {
  const { api } = useDashboard();
  const [switches, setSwitches] = useState(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(path);
      setSwitches(Array.isArray(res.data?.data) ? res.data.data : []);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [api, path]);

  useEffect(() => { load(); }, [load]);

  const flip = useAdminAction((s, on) => api.put(`${path}/${encodeURIComponent(s.key)}`, { on }), {
    key: (s) => s.key,
    confirm: (s, on) => confirm(s, on),
    success: (res) => res?.data?.message,
    error: "Couldn't change that switch",
    onSuccess: (res, s) => {
      const updated = res?.data?.data;
      setSwitches((list) => list.map((item) => (item.key === s.key ? { ...item, ...(updated ?? { on: !item.on, flipped: true }) } : item)));
    },
  });

  if (failed) {
    return <EmptyState message="The switches couldn't be loaded." action={{ label: 'Try again', onClick: load, readOnly: true }} />;
  }
  if (switches === null) return <EmptyState loading rows={3} />;
  if (switches.length === 0) return <EmptyState message="No switches yet. A project declares them in okjt.switches." />;

  return (
    <ul className="divide-y divide-tone-100 rounded-2xl border border-tone-100 bg-surface">
      {switches.map((s) => {
        const labelId = `okjt-switch-${s.key}`;
        const pending = flip.isPending(s.key);
        return (
          <li key={s.key} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              <p id={labelId} className="text-sm font-semibold text-ink">{translate(s.label)}</p>
              {s.description && <p className="mt-1 text-sm text-soft">{translate(s.description)}</p>}
              {s.flipped && s.on !== s.default && (
                <p className="mt-1 text-xs text-muted">Changed here; the default is {s.default ? 'on' : 'off'}.</p>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={s.on}
              aria-labelledby={labelId}
              disabled={pending || !flip.allowed}
              onClick={() => flip.run(s, !s.on)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60 ${s.on ? 'bg-accent' : 'bg-tone-300'}`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${s.on ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
