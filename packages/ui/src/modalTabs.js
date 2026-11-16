/**
 * The pure half of Modal's tabs (F2): turning what a caller passed as `tabs`
 * into a list the dialog can render, choosing which tab shows, and moving
 * between tabs from the keyboard. No React, so `node --test` loads it.
 *
 * Lifted from TFE (`resources/js/lib/modalTabs.js`), where one dialog with
 * tabs replaced six separate dialog components. What changed on the way:
 * a dialog without `tabs` gets no tab list (TFE's always drew a rail, so it
 * made one up from the title), and a tab's icon is whatever the caller
 * passes (a lucide component or an element), with no default.
 */

/**
 * Normalise `tabs` into `[{ id, label, icon, content, badge, disabled }]`.
 *
 * Accepts full objects, bare strings (`['Overview', 'Details']`), and lists
 * with `false` / `null` holes from `cond && tab`. Nothing, or an empty list,
 * gives `[]`: no tabs.
 */
export function normalizeTabs(tabs) {
  const list = Array.isArray(tabs) ? tabs.filter(Boolean) : [];

  return list.map((tab, i) => {
    if (typeof tab === 'string') {
      return { id: slugifyTabId(tab, i), label: tab, icon: null, content: undefined, badge: null, disabled: false };
    }
    const label = tab.label ?? tab.id ?? `Tab ${i + 1}`;
    return {
      id: String(tab.id ?? slugifyTabId(label, i)),
      label,
      icon: tab.icon ?? null,
      content: tab.content,
      badge: tab.badge ?? null,
      disabled: Boolean(tab.disabled),
    };
  });
}

/** A stable id from a label; the index when the label has no usable characters. */
export function slugifyTabId(label, index) {
  const slug = String(label ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `tab-${index}`;
}

/**
 * Which tab shows: the requested one, else the preferred default, else the
 * first enabled tab. A requested id that is no longer in the list (a form
 * that drops a tab while open) falls back instead of leaving the body empty.
 */
export function resolveActiveTab(list, requested, preferred) {
  if (!Array.isArray(list) || list.length === 0) return null;
  const usable = (id) => id != null && list.some((t) => t.id === id && !t.disabled);
  if (usable(requested)) return requested;
  if (usable(preferred)) return preferred;
  const firstEnabled = list.find((t) => !t.disabled);
  return (firstEnabled || list[0]).id;
}

/**
 * The tab a key moves to: arrows wrap and skip disabled tabs, Home and End
 * go to the ends. Null for any other key, so the event is left alone.
 */
export function tabForKey(list, currentId, key) {
  const enabled = (list || []).filter((t) => !t.disabled);
  if (enabled.length === 0) return null;
  const at = enabled.findIndex((t) => t.id === currentId);
  const step = (delta) => enabled[((((at < 0 ? 0 : at) + delta) % enabled.length) + enabled.length) % enabled.length].id;
  switch (key) {
    case 'ArrowDown':
    case 'ArrowRight':
      return step(1);
    case 'ArrowUp':
    case 'ArrowLeft':
      return step(-1);
    case 'Home':
      return enabled[0].id;
    case 'End':
      return enabled[enabled.length - 1].id;
    default:
      return null;
  }
}

/**
 * The body for the open tab: the tab's own `content`, else `children(activeId)`
 * when children is a function, else the children.
 */
export function resolvePanelContent(tab, children, activeId) {
  if (tab && tab.content !== undefined && tab.content !== null) return tab.content;
  if (typeof children === 'function') return children(activeId);
  return children;
}
