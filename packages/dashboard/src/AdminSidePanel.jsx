import { useDashboard, useComponentDefaults } from './DashboardProvider.js';
import DashboardIcon, { toIcon } from './DashboardIcon.js';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, Reorder, motion, useDragControls } from 'framer-motion';
import { Check, CheckSquare, ChevronUp, GripVertical, ListChecks, PanelRightClose, PanelRightOpen, X } from 'lucide-react';
import { Button, Overlay, buttonClass, usePermissions, useVisibleActions } from '@okjt/ui';

/**
 * The shared page side panel ("overview" panel) of AdminPageLayout. Pages pass
 * a `panel` config instead of building their own side columns, so every admin
 * page has the same shape: content on the left, panel on the right.
 *
 * The panel can hold a section switcher (only the active section's content is
 * rendered by the page), tools (e.g. the designer's style controls) or a list
 * (e.g. the seating chart's unassigned guests) — or any mix of these.
 *
 *   panel = {
 *     title, icon, subtitle?,
 *     items?: [{ id, label, description?, icon?, badge? (number), dot? (bool),
 *               count? (number: how many things the item holds, e.g. a filter's matches),
 *               group? (string: a heading shown before the first item of each group),
 *               muted? (bool: e.g. a hidden CMS section) }],
 *     activeId?, onChange?(id),
 *     onReorder?(ids)       — the list's items can be dragged (or moved with the
 *                             arrow keys on their handle) into a new order; called
 *                             with every reorderable id in the new order on drop.
 *                             Leave it out while a search narrows the list.
 *     bulkActions?: [{ id, label, icon, variant?, action | onClick(ids) }]
 *                           — adds a "Select" mode: tick items, then run an action
 *                             on all of them. `action` is a useBulkAdminAction
 *                             (run with the ids); selection clears when it succeeds.
 *     Items with `fixed: true` (e.g. an unsaved new item) stay first and can't be
 *     dragged or selected. Reordering and bulk actions are edits: viewers don't
 *     get them. Neither applies to grouped lists or the grid variant.
 *     navVariant?: 'list' (label + description rows) | 'grid' (compact tiles),
 *     content?: ReactNode   — tools/list shown under the switcher,
 *     footer?: ReactNode    — help text at the bottom (desktop only),
 *     sheetLabel?: string   — mobile button label when there's content,
 *     id?: string           — remembers collapsed/expanded per panel,
 *     defaultCollapsed?: bool, mobile?: bool (false: no mobile bar),
 *     rail?: ReactNode      — extra content for the collapsed rail,
 *   }
 *
 * Desktop (lg+): a card in a right-hand column that always fits the viewport:
 * its title stays put and only the links / content inside scroll, so a long
 * list never makes the page longer. It collapses to a slim icon rail
 * (remembered per panel) for more room.
 * Mobile: a bar under the header —
 *   - switcher only: a row of section chips (one tap to switch, always visible)
 *   - with content:  chips/button that open the panel as a bottom sheet, so the
 *     page itself (e.g. the invitation canvas) keeps the whole screen.
 *   - with reorder / bulk actions: a "manage" button beside the chips opens the
 *     full list in the bottom sheet, where items can be dragged and selected.
 */

/**
 * The panel's look: 'plain' (the default) or 'bold' (glass card, centred
 * rows, the count beside the label, tinted chips: for dark dashboards).
 * Set per project: componentDefaults: { SidePanel: { variant: 'bold' } }.
 */
const useLook = () => useComponentDefaults('SidePanel', {}).variant || 'plain';

/** A named icon the project may draw itself (iconFor), else the kit's. */
const Named = ({ name, fallback: Fallback, className }) => <DashboardIcon icon={name} fallback={Fallback} className={className} />;

function Badge({ item }) {
  if (useLook() === 'bold') return <BoldBadge item={item} />;
  if (item.badge > 0) {
    return (
      <span className="ml-auto shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-accent/15 text-accent-dark text-[11px] font-semibold flex items-center justify-center">
        {item.badge > 99 ? '99+' : item.badge}
      </span>
    );
  }
  if (item.dot) {
    return <span className="ml-auto shrink-0 w-2 h-2 rounded-full bg-amber-500" aria-label="Unsaved changes" />;
  }
  if (item.count != null) {
    return <span className="ml-auto shrink-0 text-xs tabular-nums text-tone-400">{item.count}</span>;
  }
  return null;
}

function BoldBadge({ item }) {
  if (item.badge > 0) {
    return (
      <span className="ml-auto flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-accent/15 px-1.5 text-[11px] font-semibold text-accent-dark">
        {item.badge > 99 ? '99+' : item.badge}
      </span>
    );
  }
  if (item.dot) return <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-amber-400" aria-label="Unsaved changes" />;
  if (item.count != null) return <span className="ml-auto shrink-0 text-xs tabular-nums text-tone-400">{item.count}</span>;
  return null;
}

/** The section switcher. */
export function SidePanelNav({ panel, onPicked, selection, manage = {} }) {
  const { iconFor } = useDashboard();
  const look = useLook();
  const { items = [], activeId, onChange, navVariant = 'list' } = panel;
  if (!items.length) return null;

  const pick = (id) => {
    onChange?.(id);
    onPicked?.(id);
  };

  if (navVariant === 'grid') {
    return (
      <div className={`grid gap-1 ${items.length <= 5 ? 'grid-cols-5' : 'grid-cols-4'}`} role="tablist" aria-label={panel.title}>
        {items.map((item) => {
          const Icon = toIcon(item.icon, iconFor);
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => pick(item.id)}
              className={`relative flex flex-col items-center gap-1 py-2 px-0.5 rounded-xl text-[10px] font-semibold uppercase tracking-wide transition-colors border ${
                active
                  ? 'bg-accent/10 border-accent/30 text-accent-dark'
                  : 'border-transparent text-tone-500 hover:bg-tone-50 hover:text-tone-700'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
              {item.label}
              {(item.badge > 0 || item.dot) && <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>
    );
  }

  const listItems = items.map((item, index) => ({
    item,
    groupStart: item.group && item.group !== items[index - 1]?.group ? (index > 0 ? 'later' : 'first') : null,
  }));
  const fixed = listItems.filter(({ item }) => item.fixed);
  const movable = listItems.filter(({ item }) => !item.fixed);
  const selecting = !!selection?.selecting;
  const canReorder = !!manage.canReorder && !selecting && movable.length > 1;

  const row = ({ item, groupStart }, leading) => (
    <>
      {groupStart && (
        <p className={`${look === 'bold' ? 'px-2.5 pb-1 text-xs font-semibold capitalize text-tone-400' : 'px-2 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-tone-400'} ${groupStart === 'later' ? 'pt-3' : ''}`}>{item.group}</p>
      )}
      <ItemRow
        item={item}
        active={item.id === activeId}
        leading={leading}
        selecting={selecting && !item.fixed}
        checked={selecting && selection.isSelected(item.id)}
        onClick={() => (selecting && !item.fixed ? selection.toggle(item.id) : pick(item.id))}
      />
    </>
  );

  return (
    <nav aria-label={panel.title}>
      <ul className="space-y-0.5">
        {/* Fixed rows line up with the draggable ones (which have a handle). */}
        {fixed.map((entry) => <li key={entry.item.id} className={canReorder ? 'pl-6' : ''}>{row(entry)}</li>)}
      </ul>
      {canReorder ? (
        <ReorderableList entries={movable} onReorder={panel.onReorder} renderRow={row} />
      ) : (
        <ul className="space-y-0.5">
          {movable.map((entry) => <li key={entry.item.id}>{row(entry)}</li>)}
        </ul>
      )}
    </nav>
  );
}

/** One row of the list switcher (or a checkbox row in select mode). */
function ItemRow({ item, active, leading, selecting, checked, onClick }) {
  const { iconFor } = useDashboard();
  const look = useLook();
  const Icon = toIcon(item.icon, iconFor);
  if (look === 'bold' && !selecting && !leading) {
    return (
      <button
        type="button"
        aria-current={active ? 'true' : undefined}
        onClick={onClick}
        className={`flex w-full items-center gap-3 rounded-xl border px-2 py-2 text-left text-sm transition ${
          active ? 'border-accent-strong/20 bg-accent/10 text-ink' : 'border-transparent text-contrast/70 hover:bg-contrast/5 hover:text-ink'
        }`}
      >
        {Icon && (
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-contrast/10' : 'bg-tone-50'}`}>
            <Icon className={`text-xs ${active ? 'text-accent-dark' : 'text-contrast/45'}`} aria-hidden="true" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className={`block truncate font-medium ${item.muted && !active ? 'text-tone-400' : ''}`}>{item.label}</span>
          {item.description && <span className="block truncate text-xs text-tone-400">{item.description}</span>}
        </span>
        <Badge item={item} />
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1">
      {leading}
      <button
        type="button"
        onClick={onClick}
        aria-current={!selecting && active ? 'true' : undefined}
        aria-pressed={selecting ? checked : undefined}
        className={`flex-1 min-w-0 text-left flex gap-3 p-2 rounded-xl transition-colors border ${
          selecting && checked
            ? 'bg-accent/[0.07] border-accent/30'
            : !selecting && active
              ? 'bg-accent/[0.07] border-accent/20'
              : 'border-transparent hover:bg-tone-50'
        }`}
      >
        {selecting && (
          <span className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
            checked ? 'bg-accent border-accent text-white' : 'border-tone-300 bg-surface'}`} aria-hidden="true">
            {checked && <Check className="w-3 h-3" strokeWidth={3} />}
          </span>
        )}
        {Icon && (
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-surface shadow-sm' : 'bg-tone-50'}`}>
            <Icon className={`w-4 h-4 ${active ? 'text-accent' : 'text-tone-500'}`} aria-hidden="true" />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className={`text-sm font-medium truncate ${!selecting && active ? 'text-accent-dark' : item.muted ? 'text-tone-400' : 'text-tone-800'}`}>{item.label}</span>
            <Badge item={item} />
          </span>
          {item.description && <span className="block text-xs text-tone-500 leading-snug mt-0.5">{item.description}</span>}
        </span>
      </button>
    </div>
  );
}

/**
 * Drag (by the handle) to reorder; the handle also takes ArrowUp / ArrowDown.
 * Keeps its own order while dragging and reports it once, on drop.
 */
function ReorderableList({ entries, onReorder, renderRow }) {
  const ids = entries.map(({ item }) => item.id);
  const idsKey = ids.join('|');
  const [order, setOrderState] = useState(ids);
  const orderRef = useRef(ids);
  const setOrder = (next) => { orderRef.current = next; setOrderState(next); };
  // Follow outside changes (add, delete, refetch) when not mid-drag.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- idsKey summarises ids
  useEffect(() => setOrder(ids), [idsKey]);

  const commit = (next) => { if (next.join('|') !== idsKey) onReorder(next); };
  const moveBy = (id, step) => {
    const from = orderRef.current.indexOf(id);
    const to = from + step;
    if (from < 0 || to < 0 || to >= orderRef.current.length) return;
    const next = [...orderRef.current];
    next.splice(to, 0, next.splice(from, 1)[0]);
    setOrder(next);
    commit(next);
  };

  const byId = Object.fromEntries(entries.map((entry) => [entry.item.id, entry]));
  return (
    <Reorder.Group as="ul" axis="y" values={order} onReorder={setOrder} className="space-y-0.5">
      {order.filter((id) => byId[id]).map((id) => (
        <DraggableRow key={id} entry={byId[id]} onDrop={() => commit(orderRef.current)} onMove={(step) => moveBy(id, step)} renderRow={renderRow} />
      ))}
    </Reorder.Group>
  );
}

function DraggableRow({ entry, onDrop, onMove, renderRow }) {
  const controls = useDragControls();
  const handle = (
    <button
      type="button"
      aria-label={`Reorder ${entry.item.label}`}
      title="Drag to reorder (or use the arrow keys)"
      onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          onMove(e.key === 'ArrowUp' ? -1 : 1);
        }
      }}
      className="shrink-0 w-5 py-2 flex justify-center rounded-md text-tone-300 hover:text-tone-500 focus-visible:text-accent cursor-grab active:cursor-grabbing touch-none"
    >
      <GripVertical className="w-4 h-4" aria-hidden="true" />
    </button>
  );
  return (
    <Reorder.Item value={entry.item.id} dragListener={false} dragControls={controls} onDragEnd={onDrop}
      className="relative bg-surface rounded-xl" whileDrag={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', zIndex: 1 }}>
      {renderRow(entry, handle)}
    </Reorder.Item>
  );
}

/** What the signed-in collaborator may do with the panel's list. */
function usePanelManage(panel) {
  const { canEdit } = usePermissions();
  const bulkActions = useVisibleActions(panel.bulkActions || []);
  const flatList = panel.items?.length > 0 && panel.navVariant !== 'grid' && !panel.items.some((item) => item.group);
  return {
    canReorder: canEdit && flatList && !!panel.onReorder,
    bulkActions: flatList ? bulkActions : [],
  };
}

/** Select mode for bulk actions. */
function useSelection(panel) {
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState([]);
  const selectable = (panel.items || []).filter((item) => !item.fixed).map((item) => item.id);
  // Items that went away (deleted, filtered out) drop out of the selection.
  const selected = picked.filter((id) => selectable.includes(id));
  const stop = () => { setSelecting(false); setPicked([]); };
  return {
    selecting,
    selected,
    selectable,
    start: () => setSelecting(true),
    stop,
    isSelected: (id) => selected.includes(id),
    toggle: (id) => setPicked((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])),
    toggleAll: () => setPicked(selected.length === selectable.length ? [] : selectable),
  };
}

function SelectToggle({ selection }) {
  if (selection.selecting) return null;
  return (
    <button type="button" onClick={selection.start} title="Select several"
      className="px-2 py-1 -my-1 rounded-lg text-xs font-medium text-tone-500 hover:bg-tone-100 hover:text-accent flex items-center gap-1">
      <CheckSquare className="w-3.5 h-3.5" aria-hidden="true" /> Select
    </button>
  );
}

/** Pinned under the list in select mode: count, select all, the actions, done. */
function BulkBar({ selection, actions }) {
  const { selected, selectable } = selection;
  const run = async (entry) => {
    const result = entry.action ? await entry.action.run(selected) : await entry.onClick?.(selected);
    if (result !== undefined) selection.stop();
  };
  return (
    <div className="shrink-0 p-3 border-t border-tone-100 bg-accent/[0.04] space-y-2" role="region" aria-label="Selected items">
      <div className="flex items-center gap-2 text-xs">
        <span className="font-medium text-tone-700" aria-live="polite">{selected.length} selected</span>
        <button type="button" onClick={selection.toggleAll} className="text-accent-dark hover:underline">
          {selected.length === selectable.length && selectable.length > 0 ? 'Select none' : 'Select all'}
        </button>
        <button type="button" onClick={selection.stop} className="ml-auto px-2 py-1 rounded-lg font-medium text-tone-600 hover:bg-surface">Done</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((entry) => (
          <Button key={entry.id} size="sm" variant={entry.variant || 'primary'} icon={entry.icon}
            disabled={!selected.length || entry.disabled} onClick={() => run(entry)}>
            {entry.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function PanelHeader({ panel, children }) {
  const { iconFor } = useDashboard();
  const Icon = toIcon(panel.icon, iconFor);
  const bold = useLook() === 'bold';
  return (
    <div className="flex items-start gap-2.5">
      {Icon && <Icon className={bold ? 'mt-1 shrink-0 text-accent-dark' : 'w-5 h-5 text-accent mt-0.5 shrink-0'} aria-hidden="true" />}
      <div className="min-w-0 flex-1">
        <h2 className={bold ? 'text-base font-semibold leading-tight text-ink' : 'text-base font-medium text-tone-800 leading-tight'}>{panel.title}</h2>
        {panel.subtitle && <p className={bold ? 'mt-0.5 text-xs text-tone-500' : 'text-xs text-tone-500 mt-0.5'}>{panel.subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const storageKey = (panel) => `admin.sidePanel.${panel.id || panel.title}`;

function readCollapsed(panel) {
  try {
    const saved = localStorage.getItem(storageKey(panel));
    if (saved) return saved === 'collapsed';
  } catch { /* storage unavailable */ }
  return !!panel.defaultCollapsed;
}

/** Desktop, collapsed: a slim rail with the switcher's icons. */
function SidePanelRail({ panel, onExpand }) {
  const { iconFor } = useDashboard();
  const Icon = toIcon(panel.icon, iconFor);
  const bold = useLook() === 'bold';
  return (
    <aside
      aria-label={panel.title}
      data-side-panel="collapsed"
      className={bold
        ? 'hidden lg:flex w-12 shrink-0 flex-col items-center gap-1.5 self-start overflow-y-auto rounded-2xl border border-tone-100 bg-surface py-2 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6.5rem)]'
        : 'hidden lg:flex flex-col items-center gap-1.5 w-12 shrink-0 py-2 lg:sticky lg:top-20 self-start lg:max-h-[calc(100dvh-6.5rem)] overflow-y-auto scrollbar-hide bg-surface rounded-2xl shadow-sm border border-tone-100'}
    >
      <button type="button" onClick={onExpand} aria-label={`Show ${panel.title}`} title={`Show ${panel.title}`}
        className={bold ? 'rounded-lg p-2 text-tone-500 hover:bg-contrast/5 hover:text-ink' : 'p-2 rounded-lg text-tone-500 hover:bg-tone-100 hover:text-accent'}>
        <Named name="panel-expand" fallback={PanelRightOpen} className={bold ? '' : 'w-4 h-4'} />
      </button>
      {Icon && !panel.items?.length && <Icon className={bold ? 'my-1 text-accent-dark' : 'w-4 h-4 text-accent my-1'} aria-hidden="true" />}
      {panel.items?.map((item) => {
        const ItemIcon = toIcon(item.icon, iconFor);
        const active = item.id === panel.activeId;
        return (
          <button key={item.id} type="button" onClick={() => panel.onChange?.(item.id)}
            aria-label={item.label} title={item.label} aria-current={active ? 'true' : undefined}
            className={bold
              ? `relative rounded-lg p-2 text-xs ${active ? 'bg-accent/10 text-accent-dark' : 'text-tone-500 hover:bg-contrast/5'}`
              : `relative p-2 rounded-lg ${active ? 'bg-accent/10 text-accent' : 'text-tone-500 hover:bg-tone-100'}`}>
            {ItemIcon ? <ItemIcon className={bold ? '' : 'w-4 h-4'} /> : item.label.slice(0, 2)}
            {(item.badge > 0 || item.dot) && <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${bold ? 'bg-accent-strong' : 'bg-accent'}`} />}
          </button>
        );
      })}
      {panel.rail}
    </aside>
  );
}

/** Desktop: the right-hand column (or its collapsed rail). */
export function SidePanelAside({ panel }) {
  const look = useLook();
  const [collapsed, setCollapsed] = useState(() => readCollapsed(panel));
  const manage = usePanelManage(panel);
  const selection = useSelection(panel);
  const toggle = (next) => {
    setCollapsed(next);
    try { localStorage.setItem(storageKey(panel), next ? 'collapsed' : 'expanded'); } catch { /* storage unavailable */ }
  };

  const bold = look === 'bold';
  if (collapsed) return <SidePanelRail panel={panel} onExpand={() => toggle(false)} />;
  const hasListNav = panel.items?.length > 0 && panel.navVariant !== 'grid';

  return (
    <aside
      aria-label={panel.title}
      data-side-panel={bold ? 'expanded' : true}
      className={bold
        ? 'hidden lg:flex w-72 2xl:w-80 shrink-0 flex-col self-start overflow-hidden rounded-2xl border border-tone-100 bg-surface lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6.5rem)] fit:max-h-full fit:self-stretch'
        : 'hidden lg:flex flex-col w-80 xl:w-[22rem] shrink-0 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6.5rem)] fit:max-h-full self-start fit:self-stretch bg-surface rounded-2xl shadow-sm border border-tone-100 overflow-hidden'}
    >
      {/* Pinned: title (and a compact tab grid, which is a toolbar, not a list) */}
      <div className={bold ? 'shrink-0 border-b border-tone-100 p-4 pb-3' : 'shrink-0 p-4 pb-3 space-y-3 border-b border-tone-100'}>
        <PanelHeader panel={panel}>
          {manage.bulkActions.length > 0 && <SelectToggle selection={selection} />}
          <button type="button" onClick={() => toggle(true)} aria-label={`Hide ${panel.title}`} title="Collapse panel"
            className={bold ? '-m-1 rounded-lg p-1.5 text-tone-400 hover:bg-contrast/5 hover:text-ink' : 'p-1.5 -m-1 rounded-lg text-tone-400 hover:bg-tone-100 hover:text-tone-600'}>
            <Named name="panel-collapse" fallback={PanelRightClose} className={bold ? '' : 'w-4 h-4'} />
          </button>
        </PanelHeader>
        {panel.navVariant === 'grid' && <SidePanelNav panel={panel} />}
      </div>
      {/* Scrolls: the links and any tools/list */}
      {(hasListNav || panel.content) && (
        <div className={bold ? 'min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-3' : 'flex-1 min-h-0 overflow-y-auto overscroll-contain p-3 space-y-4'}>
          {hasListNav && <SidePanelNav panel={panel} manage={manage} selection={selection} />}
          {panel.content && <div className="px-1">{panel.content}</div>}
        </div>
      )}
      {selection.selecting && <BulkBar selection={selection} actions={manage.bulkActions} />}
      {panel.footer && !selection.selecting && (
        <div className={bold ? 'shrink-0 border-t border-tone-100 p-4 pt-3 text-sm text-tone-500' : 'shrink-0 p-4 pt-3 border-t border-tone-100 bg-accent/[0.03]'}>{panel.footer}</div>
      )}
    </aside>
  );
}

/** Mobile: section chips that keep the active one scrolled into view. */
function ChipRow({ panel, onPicked, className = '-mx-4 px-4' }) {
  const { iconFor } = useDashboard();
  const bold = useLook() === 'bold';
  const rowRef = useRef(null);
  const { items = [], activeId, onChange } = panel;

  useEffect(() => {
    const el = rowRef.current?.querySelector('[aria-current="true"]');
    el?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activeId]);

  return (
    <div ref={rowRef} className={bold ? `flex snap-x gap-2 overflow-x-auto py-0.5 ${className}` : `flex gap-2 overflow-x-auto scrollbar-hide py-0.5 snap-x ${className}`} aria-label={panel.title} role="navigation">
      {items.map((item) => {
        const Icon = toIcon(item.icon, iconFor);
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={active ? 'true' : undefined}
            onClick={() => { onChange?.(item.id); onPicked?.(item.id); }}
            className={bold
              ? `inline-flex shrink-0 snap-start items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                active ? 'border-accent-strong/40 bg-accent/15 text-ink' : 'border-contrast/10 bg-contrast/5 text-contrast/70 hover:text-ink'}`
              : `${buttonClass({ variant: active ? 'secondary' : 'primary', size: 'sm' })} snap-start shrink-0 !rounded-full relative`}
          >
            {Icon && <Icon className={bold ? 'text-xs' : undefined} aria-hidden="true" />}
            <span className={`max-w-[14rem] truncate ${item.muted && !active ? 'opacity-60' : ''}`}>{item.label}</span>
            {item.count != null && <span className={`tabular-nums ${active && !bold ? 'opacity-80' : 'opacity-60'}`}>{item.count}</span>}
            {(item.badge > 0 || item.dot) && (
              <span className={`w-1.5 h-1.5 rounded-full ${bold ? 'bg-accent-strong' : active ? 'bg-white' : 'bg-accent'}`} aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Mobile: the panel as a bottom sheet (drag the handle down or tap outside to
 * close). `manage` shows the full list, where items can be dragged and
 * selected; otherwise the sections are chips above the panel's content.
 */
function BottomSheet({ panel, manage, onClose }) {
  const dragControls = useDragControls();
  const selection = useSelection(panel);
  const bold = useLook() === 'bold';
  return (
    <Overlay onClose={onClose} className="flex items-end justify-center" backdropClassName={bold ? 'bg-black/50' : 'bg-black/25'} zIndex={60}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={panel.title}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        // Dragging starts only from the header, so lists inside still scroll.
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => { if (info.offset.y > 90 || info.velocity.y > 500) onClose(); }}
        className={bold
          ? 'flex max-h-[78dvh] w-full flex-col rounded-t-3xl border-t border-contrast/10 bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl'
          : 'w-full max-h-[78dvh] bg-surface rounded-t-3xl shadow-2xl flex flex-col pb-[env(safe-area-inset-bottom)]'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`shrink-0 pt-2 pb-3 px-4 space-y-3 border-b ${bold ? 'border-tone-100' : 'border-tone-100'} cursor-grab active:cursor-grabbing touch-none`}
          onPointerDown={(e) => dragControls.start(e)}>
          <div className={`mx-auto w-10 h-1.5 rounded-full ${bold ? 'bg-contrast/15' : 'bg-tone-200'}`} aria-hidden="true" />
          <PanelHeader panel={panel}>
            {manage && manage.bulkActions.length > 0 && <SelectToggle selection={selection} />}
            <button type="button" onClick={onClose} aria-label="Close panel" className={bold ? '-m-1 rounded-lg p-1.5 text-tone-600 hover:bg-contrast/5' : 'p-1.5 -m-1 rounded-lg text-tone-500 hover:bg-tone-100'}>
              <Named name="close" fallback={X} className={bold ? '' : 'w-5 h-5'} />
            </button>
          </PanelHeader>
          {!manage && panel.items?.length > 0 && <ChipRow panel={panel} />}
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
          {manage && <SidePanelNav panel={panel} manage={manage} selection={selection} onPicked={onClose} />}
          {panel.content}
        </div>
        {manage && selection.selecting && <BulkBar selection={selection} actions={manage.bulkActions} />}
      </motion.div>
    </Overlay>
  );
}

/** Mobile: the bar under the header (chips, or a button that opens the sheet). */
export function SidePanelMobileBar({ panel }) {
  const { iconFor } = useDashboard();
  const [sheet, setSheet] = useState(null); // null | 'content' | 'manage'
  const manage = usePanelManage(panel);
  const hasContent = !!panel.content;
  const hasItems = panel.items?.length > 0;
  const manageable = manage.canReorder || manage.bulkActions.length > 0;
  const Icon = toIcon(panel.icon, iconFor);
  const bold = useLook() === 'bold';
  // Nothing to switch to and nothing to open: no bar.
  if (!hasContent && !hasItems) return null;

  return (
    <div className={bold
      ? 'sticky top-16 z-20 -mx-4 mb-4 border-b border-contrast/[0.06] bg-paper/95 px-4 py-2 backdrop-blur lg:hidden'
      : 'lg:hidden sticky top-16 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-paper/95 backdrop-blur border-b border-accent/10'}>
      {hasItems && (
        <div className="flex items-center gap-2">
          <ChipRow panel={panel} className={manageable ? 'flex-1 min-w-0 -ml-4 pl-4 pr-1' : '-mx-4 px-4 flex-1 min-w-0'}
            onPicked={hasContent ? () => setSheet('content') : undefined} />
          {manageable && (
            <Button size="icon-sm" icon={ListChecks} aria-label={`Arrange or select ${panel.title.toLowerCase()}`}
              title="Arrange / select" aria-haspopup="dialog" onClick={() => setSheet('manage')} />
          )}
        </div>
      )}
      {hasContent && !hasItems && (
        <button
          type="button"
          onClick={() => setSheet('content')}
          className={bold
            ? 'flex w-full items-center justify-between gap-2 rounded-xl border border-contrast/10 bg-contrast/5 px-3 py-2 text-sm font-medium text-ink'
            : `${buttonClass({ variant: 'primary', size: 'sm', fullWidth: true })} !justify-between`}
          aria-haspopup="dialog"
        >
          <span className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className={bold ? 'text-accent-dark' : undefined} aria-hidden="true" />}
            <span className="truncate">{panel.sheetLabel || panel.title}</span>
          </span>
          <Named name="chevron-up" fallback={ChevronUp} className={bold ? 'text-xs text-tone-500' : undefined} />
        </button>
      )}
      <AnimatePresence>
        {sheet && (hasContent || sheet === 'manage') && (
          <BottomSheet panel={panel} manage={sheet === 'manage' ? manage : null} onClose={() => setSheet(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
