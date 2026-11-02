import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bookmark, ChevronDown, ChevronUp, MoreHorizontal, Search, SlidersHorizontal, X } from 'lucide-react';
import { promptAction, useDismiss } from '@okjt/ui';
import DashboardIcon from './DashboardIcon.js';
import useSavedViews from './useSavedViews.js';

/**
 * AdminFloatingToolbar's 'bold' look (for dark dashboards): one glass bar
 * with the page's search, filters (with saved views), a view switch, the
 * actions and, while rows are selected, the selection and its actions.
 *
 * @param {object} [search]    { value, onChange, placeholder } — "/" focuses it
 * @param {Array}  [filters]   [{ name, label, title?, value, onChange, options: [{ value, label }], defaultValue? }]
 * @param {object} [view]      { modes: [{ value, icon, label? }], current, onChange }
 * @param {Array}  [actions]   [{ id, label, icon, onClick | href, download?, variant: primary|secondary|danger, disabled? }]
 *                             — the first two (four without search/filters) show; the rest go under More
 * @param {object} [selection] { count, total, onSelectAll, onDeselectAll, actions } — while count > 0
 *                             the bar shows the selection and its actions instead
 * @param {ReactNode} [children] Custom controls, before the actions
 * @param {string} [savedViewsKey] Where saved views are kept (default: per page)
 */

export function countActiveFilterLists(filters = []) {
  return filters.filter((f) => f.value !== (f.defaultValue ?? f.options?.[0]?.value)).length;
}

const actionClass = {
  primary: 'bg-gradient-to-r from-action to-accent text-white hover:shadow-lg hover:shadow-action/25',
  secondary: 'border border-contrast/10 bg-contrast/5 text-body hover:bg-contrast/10 hover:text-ink',
  danger: 'border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200',
};

const Named = ({ name, fallback, className }) => <DashboardIcon icon={name} fallback={fallback} className={className} />;

/** An action's link: the app's, or a plain one for a file to download. */
function ActionLink({ action, ...props }) {
  return action.download ? <a href={action.href} download {...props} /> : <Link to={action.href} {...props} />;
}

function Action({ action, compact }) {
  const className = `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${actionClass[action.variant || 'secondary']}`;
  const content = (
    <>
      <DashboardIcon icon={action.icon} />
      <span className={compact ? 'sr-only' : 'hidden sm:inline'}>{action.label}</span>
    </>
  );
  return action.href ? (
    <ActionLink action={action} className={className} title={action.label} aria-label={action.label}>{content}</ActionLink>
  ) : (
    <button type="button" onClick={action.onClick} disabled={action.disabled} className={className} title={action.label} aria-label={action.label}>
      {content}
    </button>
  );
}

/** The page's filters (and search) as a saved view stores them. */
const snapshot = (filters, search) => ({
  filters: Object.fromEntries(filters.map((f) => [f.name, f.value])),
  search: search?.value ?? '',
});

function SavedViews({ filters, search, storageKey, onApplied }) {
  const { views, saveView, deleteView } = useSavedViews(storageKey);

  const apply = (view) => {
    filters.forEach((f) => {
      const value = view.state.filters?.[f.name];
      if (value !== undefined && f.options.some((o) => String(o.value) === String(value))) f.onChange(value);
    });
    if (search && typeof view.state.search === 'string') search.onChange(view.state.search);
    onApplied();
  };

  const save = async () => {
    const name = await promptAction({ title: 'Save this view', label: 'Name', placeholder: 'e.g. Pending receipts', confirmLabel: 'Save view' });
    if (name) saveView(name, snapshot(filters, search));
  };

  return (
    <div className="space-y-1.5 border-t border-contrast/10 pt-3">
      <span className="block text-xs font-semibold capitalize text-soft">Saved views</span>
      {views.length > 0 && (
        <ul className="space-y-1">
          {views.map((view) => (
            <li key={view.id} className="flex items-center gap-1">
              <button type="button" onClick={() => apply(view)} className="min-w-0 flex-1 truncate rounded-lg px-2 py-1 text-left text-sm text-body hover:bg-contrast/5 hover:text-ink">
                {view.name}
              </button>
              <button type="button" onClick={() => deleteView(view.id)} aria-label={`Delete view ${view.name}`} className="rounded-lg p-1 text-faint hover:bg-contrast/5 hover:text-accent-dark">
                <Named name="close" fallback={X} className="text-xs" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={save} className="text-xs font-semibold text-body transition hover:text-ink">
        <Named name="bookmark" fallback={Bookmark} className="mr-1.5" />
        Save current view…
      </button>
    </div>
  );
}

const popover = { initial: { opacity: 0, y: 8, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 8, scale: 0.97 }, transition: { duration: 0.15 } };

function FiltersMenu({ filters, search, storageKey }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(ref, open, () => setOpen(false));
  const active = countActiveFilterLists(filters);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition border ${active ? 'border-accent/40 bg-action/15 text-ink' : 'border-contrast/10 bg-contrast/5 text-body hover:bg-contrast/10'}`}
      >
        <Named name="filters" fallback={SlidersHorizontal} />
        <span className="hidden sm:inline">Filters</span>
        {active > 0 && <span className="min-w-[1.25rem] h-5 px-1 rounded-full bg-accent text-[11px] leading-5 text-white text-center">{active}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div {...popover} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-tone-100 bg-surface p-4 shadow-2xl space-y-3">
            {filters.map((filter) => (
              <label key={filter.name} className="block">
                <span className="mb-1 block text-xs font-semibold capitalize text-soft">{filter.title || filter.label}</span>
                <select value={filter.value} onChange={(e) => filter.onChange(e.target.value)} className="w-full py-2">
                  {filter.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
            ))}
            {active > 0 && (
              <button
                type="button"
                onClick={() => filters.forEach((f) => f.onChange(f.defaultValue ?? f.options?.[0]?.value))}
                className="text-xs font-semibold text-accent-dark hover:text-ink transition"
              >
                Reset filters
              </button>
            )}
            <SavedViews filters={filters} search={search} storageKey={storageKey} onApplied={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MoreMenu({ actions }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(ref, open, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="More actions"
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold border border-contrast/10 bg-contrast/5 text-body hover:bg-contrast/10 transition"
      >
        <Named name="more" fallback={MoreHorizontal} />
        <span className="hidden sm:inline">More</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div {...popover} className="absolute bottom-full right-0 mb-3 min-w-[12rem] rounded-xl border border-tone-100 bg-surface py-2 shadow-2xl">
            {actions.map((action) => {
              const className = `flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-contrast/[0.06] ${action.variant === 'danger' ? 'text-red-300' : 'text-body'}`;
              const content = (
                <>
                  <DashboardIcon icon={action.icon} className="w-4 text-center" />
                  {action.label}
                </>
              );
              return action.href ? (
                <ActionLink key={action.id} action={action} className={className} onClick={() => setOpen(false)}>{content}</ActionLink>
              ) : (
                <button key={action.id} type="button" disabled={action.disabled} className={className} onClick={() => { setOpen(false); action.onClick?.(); }}>
                  {content}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Divider = () => <div aria-hidden="true" className="hidden sm:block w-px h-6 bg-contrast/10 mx-0.5" />;

export default function BoldToolbar({ search, filters = [], view, actions = [], selection, children, savedViewsKey }) {
  const [visible, setVisible] = useState(true);
  const searchRef = useRef(null);
  const selecting = selection && selection.count > 0;
  const storageKey = savedViewsKey || `okjt.views.${typeof window === 'undefined' ? '' : window.location.pathname}`;

  // "/" focuses the page's search, unless typing somewhere already.
  useEffect(() => {
    if (!search) return undefined;
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return;
      e.preventDefault();
      setVisible(true);
      requestAnimationFrame(() => searchRef.current?.focus());
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [search]);

  const hasLeading = !!search || filters.length > 0 || !!view;
  const max = hasLeading ? 2 : 4;
  const primary = actions.slice(0, max);
  const overflow = actions.slice(max);
  const narrowed = !!search?.value || countActiveFilterLists(filters) > 0;

  // Centred over the content beside the sidebar; above the page's sticky
  // headers (z-10), below the header (z-30) and the phone sidebar.
  const position = 'fixed z-[25] bottom-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6 left-1/2 lg:left-[calc(50%_+_var(--okjt-sidebar-w,16rem)_/_2)] transition-[left] duration-300';
  // Centred with framer-motion's x: its inline transform would wipe out a translate class.
  const centre = { x: '-50%' };

  if (typeof document === 'undefined') return null;
  if (!hasLeading && !actions.length && !selection && !children) return null;

  return createPortal(
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          key="toolbar"
          role="toolbar"
          aria-label="Page tools"
          initial={{ ...centre, opacity: 0, y: 24 }}
          animate={{ ...centre, opacity: 1, y: 0 }}
          exit={{ ...centre, opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className={`${position} w-max max-w-[calc(100vw-1rem)] lg:max-w-[calc(100vw_-_var(--okjt-sidebar-w,16rem)_-_2rem)]`}
        >
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border border-tone-100 bg-paper-warm/90 p-1.5 sm:p-2 shadow-[0_16px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            {selecting ? (
              <>
                <span className="px-2 text-sm font-semibold text-ink whitespace-nowrap">{selection.count} selected</span>
                {selection.onSelectAll && (
                  <button
                    type="button"
                    onClick={selection.count === selection.total ? selection.onDeselectAll : selection.onSelectAll}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-body hover:bg-contrast/[0.06] hover:text-ink transition"
                  >
                    {selection.count === selection.total ? 'Deselect all' : `Select all ${selection.total}`}
                  </button>
                )}
                <Divider />
                {(selection.actions || []).map((action) => <Action key={action.id} action={action} />)}
                <button
                  type="button"
                  onClick={selection.onDeselectAll}
                  aria-label="Clear selection"
                  title="Clear selection"
                  className="rounded-xl p-2 text-soft hover:bg-contrast/[0.06] hover:text-ink transition"
                >
                  <Named name="close" fallback={X} />
                </button>
              </>
            ) : (
              <>
                {search && (
                  <div className="relative">
                    <Named name="search" fallback={Search} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-soft" />
                    <input
                      ref={searchRef}
                      type="search"
                      value={search.value}
                      onChange={(e) => search.onChange(e.target.value)}
                      placeholder={search.placeholder || 'Search…'}
                      aria-label={search.placeholder || 'Search this page'}
                      className="w-40 sm:w-56 sm:focus:w-72 rounded-xl border border-contrast/10 bg-contrast/5 py-2 pl-9 pr-9 text-sm transition-all"
                    />
                    <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:block rounded border border-contrast/15 px-1.5 text-[10px] text-soft">/</kbd>
                  </div>
                )}
                {filters.length > 0 && <FiltersMenu filters={filters} search={search} storageKey={storageKey} />}
                {view && view.modes?.length > 1 && (
                  <div className="flex gap-1 rounded-xl border border-contrast/10 bg-ink-deep/30 p-1">
                    {view.modes.map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => view.onChange(mode.value)}
                        aria-label={mode.label || `${mode.value} view`}
                        aria-pressed={view.current === mode.value}
                        title={mode.label || `${mode.value} view`}
                        className={`rounded-lg px-2.5 py-1 text-sm transition-colors ${view.current === mode.value ? 'bg-action text-white' : 'text-soft hover:text-ink'}`}
                      >
                        <DashboardIcon icon={mode.icon} />
                      </button>
                    ))}
                  </div>
                )}
                {hasLeading && (children || actions.length > 0) && <Divider />}
                {children}
                {primary.map((action) => <Action key={action.id} action={action} />)}
                {overflow.length > 0 && <MoreMenu actions={overflow} />}
              </>
            )}
            <button
              type="button"
              onClick={() => setVisible(false)}
              aria-label="Hide toolbar"
              title="Hide toolbar"
              className="rounded-xl p-2 text-faint hover:bg-contrast/[0.06] hover:text-ink transition"
            >
              <Named name="hide-toolbar" fallback={ChevronDown} />
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.button
          key="toolbar-show"
          type="button"
          initial={{ ...centre, opacity: 0, y: 16 }}
          animate={{ ...centre, opacity: 1, y: 0 }}
          exit={{ ...centre, opacity: 0, y: 16 }}
          onClick={() => setVisible(true)}
          aria-label={narrowed || selecting ? 'Show toolbar (search, filters or selection active)' : 'Show toolbar'}
          title={narrowed || selecting ? 'Show toolbar (search, filters or selection active)' : 'Show toolbar'}
          className={`${position} rounded-full border border-contrast/10 bg-paper-warm/90 p-3 text-body shadow-xl backdrop-blur-xl hover:text-ink`}
        >
          <Named name="chevron-up" fallback={ChevronUp} />
          {(narrowed || selecting) && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-accent" />}
        </motion.button>
      )}
    </AnimatePresence>,
    document.body,
  );
}
