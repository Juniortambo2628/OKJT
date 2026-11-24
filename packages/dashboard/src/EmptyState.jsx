import { Search } from 'lucide-react';
import { Button, Skeleton } from '@okjt/ui';
import DashboardIcon from './DashboardIcon.js';
import { useComponentDefaults } from './DashboardProvider.js';

/**
 * Loading / empty placeholder for admin lists.
 *
 * @param {LucideIcon|string} [icon] - a component, or a name the project resolves (iconFor)
 * @param {string}     [message]     - Shown when there is nothing yet
 * @param {string}     [searchQuery] - When set, the empty message talks about the search
 * @param {boolean}    [loading]     - Render skeleton rows instead
 * @param {number}     [rows=5]      - Skeleton rows while loading
 * @param {{ label: string, onClick: function, icon?: LucideIcon, readOnly?: boolean }} [action] - Next step button
 *   (an edit unless readOnly, so hidden for viewers)
 *
 * variant="card": a bordered card with a title over the message and a solid
 * action button. It also says what a search or filters narrowed to nothing:
 *
 * @param {string}   [title]        - The heading (card)
 * @param {boolean}  [compact]      - Smaller, without the card's border (card)
 * @param {string}   [search]       - The search that matched nothing (card; or searchQuery)
 * @param {boolean}  [filtered]     - Filters narrowed the list to nothing (card)
 * @param {string}   [noun='item']  - What the list holds: "No expenses match …" (card)
 * @param {function} [onClear]      - Clears the search and filters (card)
 */
export default function EmptyState(ownProps) {
  const { variant = 'plain', ...props } = useComponentDefaults('EmptyState', ownProps);
  if (props.loading) return <Loading rows={props.rows} />;
  return variant === 'card' ? <CardState {...props} /> : <PlainState {...props} />;
}

function Loading({ rows = 5 }) {
  return (
    <div className="p-6 space-y-4" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton variant="circle" width="36px" height="36px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width={`${60 - (i % 3) * 12}%`} />
            <Skeleton variant="text" width="35%" height="10px" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PlainState({ icon, message, searchQuery, action }) {
  return (
    <div className="p-12 text-center text-tone-500">
      <DashboardIcon icon={icon} className="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p>{searchQuery ? `Nothing matches “${searchQuery}”` : message || 'No items yet'}</p>
      {searchQuery && <p className="mt-1 text-sm text-tone-500">Try a different search or clear the filters.</p>}
      {!searchQuery && action && (
        <Button variant="secondary" icon={action.icon} onClick={action.onClick} className="mt-4" edit={!action.readOnly}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

function CardState({ icon, title, message, action, compact = false, search, searchQuery, filtered = false, noun = 'item', onClear }) {
  const query = (search ?? searchQuery ?? '').trim();
  if (query || filtered) {
    icon = 'search';
    title = query ? `No ${noun}s match “${query}”` : `No ${noun}s match these filters`;
    message = query && filtered ? 'Try a different search, or clear the search and filters.' : query ? 'Try a different search.' : 'Try different filters.';
    action = onClear ? { label: query && filtered ? 'Clear search and filters' : query ? 'Clear search' : 'Clear filters', onClick: onClear } : null;
  }

  return (
    <div className={`rounded-2xl border text-center ${compact ? 'border-transparent bg-transparent px-3 py-8' : 'border-contrast/10 bg-ink-deep/50 p-12'}`}>
      <div className={`inline-flex items-center justify-center rounded-full bg-contrast/5 ${compact ? 'mb-3 h-12 w-12' : 'mb-4 h-16 w-16'}`}>
        <DashboardIcon icon={icon} fallback={icon === 'search' ? Search : null} className={`${compact ? 'text-xl' : 'text-2xl'} text-soft`} />
      </div>
      {title && <h3 className="mb-2 text-lg font-semibold text-ink">{title}</h3>}
      {message && <p className="mx-auto mb-6 max-w-md text-sm text-soft">{message}</p>}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="rounded-xl bg-action px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-125"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
