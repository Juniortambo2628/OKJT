import { useEffect, useId, useRef, useState } from 'react';
import Overlay from './Overlay.js';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { normalizeTabs, resolveActiveTab, resolvePanelContent, tabForKey } from './modalTabs.js';
import { sheetOffset, shouldDismissSheet } from './sheetDrag.js';

const MAX_WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-[calc(100vw-2rem)]',
};

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keyboard focus for an open dialog: moves into it (its autofocus field, else
 * its first control), stays inside it on Tab and Shift+Tab, and goes back to
 * whatever had it when the dialog closes.
 */
function useDialogFocus(ref) {
  useEffect(() => {
    const panel = ref.current;
    if (!panel) return undefined;
    const opener = document.activeElement;
    const focusables = () => [...panel.querySelectorAll(FOCUSABLE)].filter((el) => !el.closest('[inert]'));
    if (!panel.contains(document.activeElement)) {
      (panel.querySelector('[autofocus]') || focusables()[0] || panel).focus({ preventScroll: true });
    }
    const onKeyDown = (e) => {
      if (e.key !== 'Tab') return;
      // A dialog opened on top (a confirmation, say) keeps its own focus.
      const other = document.activeElement?.closest?.('[aria-modal="true"]');
      if (other && !other.contains(panel)) return;
      const list = focusables();
      if (!list.length) { e.preventDefault(); return; }
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [ref]);
}

function CloseButton({ onClose, className }) {
  return (
    <button type="button" aria-label="Close" onClick={onClose} className={className}>
      <X className="w-5 h-5" />
    </button>
  );
}

/** A tab's icon: a component (lucide) or an element. */
function TabIcon({ icon }) {
  if (!icon) return null;
  if (typeof icon === 'function' || (typeof icon === 'object' && icon.$$typeof && !icon.props)) {
    const Icon = icon;
    return <Icon className="h-4 w-4" aria-hidden="true" />;
  }
  return icon;
}

/** The row of tabs under the title (F2). Arrow keys, Home and End move between them. */
function TabList({ tabs, activeId, onSelect, idFor, label }) {
  const refs = useRef({});
  const onKeyDown = (e) => {
    const next = tabForKey(tabs, activeId, e.key);
    if (next == null) return;
    e.preventDefault();
    onSelect(next);
    refs.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex shrink-0 gap-1 overflow-x-auto border-b border-tone-100 px-6">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => { refs.current[tab.id] = el; }}
            type="button"
            role="tab"
            id={idFor(tab.id, 'tab')}
            aria-selected={active}
            aria-controls={idFor(tab.id, 'panel')}
            tabIndex={active ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => onSelect(tab.id)}
            className={`relative -mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              active ? 'border-accent text-body' : 'border-transparent text-soft hover:text-body'
            }`}
          >
            <TabIcon icon={tab.icon} />
            {tab.label}
            {tab.badge != null && tab.badge !== false && (
              <span className="rounded-full bg-tone-100 px-1.5 text-xs text-tone-600">{tab.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Swipe down to close on the phone sheet. Returns the drag offset (px) and the
 * pointer handlers for the part you drag (the handle and the header).
 */
function useSheetDrag(enabled, onClose) {
  const [offset, setOffset] = useState(0);
  const start = useRef(null);
  if (!enabled) return { offset: 0, handlers: {} };
  const handlers = {
    onPointerDown: (e) => {
      if (e.button != null && e.button !== 0) return;
      if (e.target.closest?.('button, a, input, select, textarea')) return;
      start.current = { y: e.clientY, t: Date.now() };
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    onPointerMove: (e) => {
      if (start.current) setOffset(sheetOffset(start.current.y, e.clientY));
    },
    onPointerUp: (e) => {
      if (!start.current) return;
      const dy = sheetOffset(start.current.y, e.clientY);
      const ms = Date.now() - start.current.t;
      start.current = null;
      if (shouldDismissSheet(dy, ms)) onClose?.();
      else setOffset(0);
    },
    onPointerCancel: () => {
      start.current = null;
      setOffset(0);
    },
  };
  return { offset, handlers };
}

/** The open dialog's panel; mounted only while open, so focus moves in and out with it. */
function Panel({
  widthClass, onClose, drawClose, carded, title, titleId, description, footer, className, classNames = {}, children,
  tabs = [], activeTab, defaultTab, onTabChange, fixedHeight = false, sheet = false, closeable = true, label,
}) {
  const ref = useRef(null);
  useDialogFocus(ref);
  const baseId = useId();
  const [ownTab, setOwnTab] = useState(defaultTab);
  const activeId = resolveActiveTab(tabs, activeTab !== undefined ? activeTab : ownTab, defaultTab);
  const selectTab = (id) => {
    if (activeTab === undefined) setOwnTab(id);
    if (id !== activeId) onTabChange?.(id);
  };
  const idFor = (id, part) => `${baseId}-${part}-${id}`;
  const hasTabs = tabs.length > 0;
  const activeTabObj = tabs.find((t) => t.id === activeId);
  const body = resolvePanelContent(activeTabObj, children, activeId);
  const footerNode = typeof footer === 'function' ? footer(activeId) : footer;
  const drag = useSheetDrag(sheet && closeable, onClose);
  const header = (title != null || drawClose) && (
    <div className="flex shrink-0 items-start justify-between gap-4 px-6 pt-6 pb-4">
      <div className="min-w-0">
        {title != null && <h2 id={titleId} className="text-xl font-medium text-body">{title}</h2>}
        {description != null && <p className="mt-1 text-sm text-soft">{description}</p>}
      </div>
      {drawClose && (
        <CloseButton
          onClose={onClose}
          className="-mr-2 -mt-1 shrink-0 rounded-lg p-1.5 text-tone-400 transition-colors hover:bg-tone-100 hover:text-tone-700"
        />
      )}
    </div>
  );

  // Every class below is today's when sheet and fixedHeight are off.
  const panelClass = classNames.panel ?? (sheet
    ? `relative w-full ${widthClass} mt-auto sm:my-auto outline-none`
    : `relative w-full ${widthClass} my-auto outline-none`);
  const cardClass = [
    'flex flex-col overflow-hidden bg-surface shadow-xl',
    sheet ? 'max-h-[92dvh] rounded-t-2xl sm:max-h-[88vh] sm:rounded-2xl' : 'max-h-[88vh] rounded-2xl',
    fixedHeight ? 'h-[min(40rem,88dvh)]' : '',
    className,
  ].filter(Boolean).join(' ');
  const defaultCardClass = `flex max-h-[88vh] flex-col overflow-hidden rounded-2xl bg-surface shadow-xl ${className}`.trim();

  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={panelClass}
    >
      {carded ? (
        <div
          className={sheet || fixedHeight ? cardClass : defaultCardClass}
          style={drag.offset ? { transform: `translateY(${drag.offset}px)`, transition: 'none' } : undefined}
        >
          {sheet && closeable ? (
            <div {...drag.handlers} className="shrink-0 touch-none">
              <div className="flex justify-center pt-2 sm:hidden" aria-hidden="true">
                <span className="h-1 w-10 rounded-full bg-tone-200" />
              </div>
              {header}
            </div>
          ) : header}
          {hasTabs && (
            <TabList tabs={tabs} activeId={activeId} onSelect={selectTab} idFor={idFor} label={typeof title === 'string' ? title : label} />
          )}
          {hasTabs ? (
            <div
              role="tabpanel"
              id={idFor(activeId, 'panel')}
              aria-labelledby={idFor(activeId, 'tab')}
              className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6"
            >
              {body}
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{body}</div>
          )}
          {footerNode != null && (
            <div className={sheet
              ? 'flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-tone-100 px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]'
              : 'flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-tone-100 px-6 py-4'}
            >
              {footerNode}
            </div>
          )}
        </div>
      ) : (
        <>
          {drawClose && (
            <CloseButton
              onClose={onClose}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-surface shadow-lg border border-tone-200 flex items-center justify-center text-tone-500 hover:text-tone-800 hover:bg-tone-50 transition-colors"
            />
          )}
          <div className={classNames.body ?? `max-h-[88vh] overflow-y-auto rounded-2xl ${className}`.trim()}>
            {body}
          </div>
        </>
      )}
    </motion.div>
  );
}

/**
 * Generic, reusable modal dialog.
 *
 * Renders a dimmed <Overlay> with a centered, scrollable panel.
 *
 * Without `title` or `footer` the panel is transparent so the child content
 * (which typically already is a styled card) provides its own chrome, and a
 * floating close button sits at the top-right.
 *
 * With `title` (and optionally `description` and `footer`) the panel is a card:
 * a header with the title and the close button, a body that scrolls, and a
 * footer that stays put.
 *
 * Keyboard focus moves into the dialog, stays there on Tab, and returns to
 * whatever had it when the dialog closes.
 *
 * @param {boolean} open
 * @param {() => void} onClose
 * @param {'sm'|'md'|'lg'|'xl'|'2xl'|'3xl'|'4xl'|'5xl'|'6xl'|'7xl'|'full'} [maxWidth]
 * @param {string} [label]        Accessible name when there is no title.
 * @param {node} [title]          Turns on the card chrome; names the dialog.
 * @param {node} [description]    A line under the title.
 * @param {node} [footer]         Actions, pinned under the body (turns on the card chrome).
 * @param {boolean} [showClose]   Draw the close button (default true). Turn it off
 *                                for content that has its own.
 * @param {boolean} [closeable]   Escape, the backdrop and the close button close it
 *                                (default true). False for a step that must be finished.
 * @param {string} [className]    Extra classes for the panel (its own background, a height).
 *
 * For a project whose dialogs have their own look (it draws its own header,
 * close button and footer as the content, with showClose={false}):
 * @param {string} [overlayClassName]   Replaces how the dialog sits on the page
 *                                      (default: centred, scrolling, p-4).
 * @param {string} [backdropClassName]  Replaces the backdrop (default bg-black/60 backdrop-blur-sm).
 * @param {{ panel?: string, body?: string }} [classNames]
 *   panel replaces the panel's classes, its width included; body replaces the
 *   scrolling area's (without title or footer).
 *
 * Tabs, a footer per tab, a fixed height and a phone sheet (F2, from TFE's
 * TfeModal). All off by default:
 * @param {Array} [tabs]          [{ id, label, icon?, badge?, disabled?, content? }] or
 *                                ['Label', …]. A row of tabs under the title (turns on
 *                                the card chrome). The body is the open tab's `content`,
 *                                else `children(activeId)` when children is a function.
 * @param {string} [activeTab]    The open tab, when the caller controls it.
 * @param {string} [defaultTab]   The tab to open on (else the first enabled one).
 * @param {(id) => void} [onTabChange]
 * @param {node|(id) => node} [footer] A function gets the open tab's id, so the
 *                                actions follow the tab (a Save button for a form that
 *                                is not on screen does nothing).
 * @param {boolean} [fixedHeight] The card keeps one height, min(40rem, 88dvh), whatever
 *                                the open tab holds; only the body scrolls.
 * @param {boolean} [sheet]       On phones (below `sm`) the card is a sheet at the bottom
 *                                of the screen, swiped down to close when closeable.
 */
export default function Modal({
  open,
  onClose,
  children,
  maxWidth = 'lg',
  label,
  title,
  description,
  footer,
  showClose = true,
  closeable = true,
  className = '',
  overlayClassName,
  backdropClassName,
  classNames,
  tabs,
  activeTab,
  defaultTab,
  onTabChange,
  fixedHeight = false,
  sheet = false,
}) {
  const tabList = normalizeTabs(tabs);
  const widthClass = MAX_WIDTHS[maxWidth] || MAX_WIDTHS.lg;
  const titleId = useId();
  const carded = title != null || footer != null || tabList.length > 0;
  const named = carded && title != null;

  return (
    <AnimatePresence>
      {open && (
        <Overlay
          onClose={closeable ? onClose : undefined}
          closeOnBackdrop={closeable}
          zIndex={9998}
          className={overlayClassName ?? (sheet
            ? 'flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto'
            : 'flex items-start sm:items-center justify-center p-4 overflow-y-auto')}
          {...(backdropClassName != null ? { backdropClassName } : {})}
          role="dialog"
          aria-modal="true"
          aria-label={named ? undefined : label}
          aria-labelledby={named ? titleId : undefined}
        >
          <Panel
            widthClass={widthClass}
            onClose={onClose}
            drawClose={showClose && closeable}
            carded={carded}
            title={title}
            titleId={titleId}
            description={description}
            footer={footer}
            className={className}
            classNames={classNames}
            tabs={tabList}
            activeTab={activeTab}
            defaultTab={defaultTab}
            onTabChange={onTabChange}
            fixedHeight={fixedHeight}
            sheet={sheet}
            closeable={closeable}
            label={label}
          >
            {children}
          </Panel>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
