import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { History, Share2 } from 'lucide-react';
import { Button } from '@okjt/ui';
import { CollaboratorAvatar } from './CollaboratorAvatars.js';
import { useCollaboration } from './CollaborationContext.js';
import { useDashboard } from './DashboardProvider.js';

const ACTION_WORDS = { created: 'added', updated: 'edited', deleted: 'deleted', restored: 'restored' };

export default function ActivityPanel() {
  const { module, othersHere, openHistory, setShareOpen } = useCollaboration();
  const { api, anonymousName } = useDashboard();
  const { data: recent = [], isLoading } = useQuery({
    queryKey: ['revisions', module, 'recent'],
    queryFn: async () => (await api.get('/revisions', { params: { module, per_page: 5 } })).data?.data || [],
    enabled: !!module,
    staleTime: 15000,
  });

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-tone-500">On this page</h3>
        {othersHere.length ? (
          <ul className="space-y-1.5">
            {othersHere.map((person) => (
              <li key={person.id} className="flex items-center gap-2 text-sm text-tone-700">
                <CollaboratorAvatar person={person} size="xs" /> {person.name}
              </li>
            ))}
            <li className="text-xs text-amber-700">Save often — the last save wins if you edit the same thing.</li>
          </ul>
        ) : (
          <p className="text-xs text-tone-500">Only you right now.</p>
        )}
      </section>

      <section className="space-y-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-tone-500">Recent changes</h3>
        {isLoading ? (
          <p className="text-xs text-tone-400">Loading…</p>
        ) : recent.length ? (
          <ul className="space-y-2">
            {recent.map((r) => (
              <li key={r.id} className="text-xs text-tone-600 leading-snug">
                <span className="font-medium text-tone-800">{r.user?.name || anonymousName}</span>{' '}
                {ACTION_WORDS[r.action] || r.action} <span className="font-medium text-tone-800">{r.subject_label}</span>
                <span className="block text-[11px] text-tone-400">
                  {formatDistanceToNow(new Date(r.updated_at || r.created_at), { addSuffix: true })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-tone-500">No changes recorded here yet.</p>
        )}
        <Button size="sm" icon={History} fullWidth onClick={openHistory}>Version history</Button>
      </section>

      <Button size="sm" icon={Share2} fullWidth onClick={() => setShareOpen(true)}>Invite collaborators</Button>
    </div>
  );
}

