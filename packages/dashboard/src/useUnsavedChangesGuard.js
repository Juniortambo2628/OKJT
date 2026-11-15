import { useCallback, useEffect, useId, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmAction } from '@okjt/ui';

const DEFAULT_MESSAGE = 'You have unsaved changes. Leave without saving?';

/*
 * Which forms on the page have unsaved edits. Every guard reports here, so the
 * header chip and any navigation can ask "is anything unsaved?" without the
 * form having to pass it along. A store rather than context, because a form
 * may render outside the shell's tree.
 */
const dirtyForms = new Map(); // key -> message
const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());

function reportUnsaved(key, dirty, message) {
  const had = dirtyForms.has(key);
  if (dirty) dirtyForms.set(key, message);
  else dirtyForms.delete(key);
  if (had !== dirty) notify();
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** True while any form on the page has unsaved edits. */
export function hasUnsavedChanges() {
  return dirtyForms.size > 0;
}

/** The same, as a hook that re-renders when it changes. */
export function useHasUnsavedChanges() {
  return useSyncExternalStore(subscribe, hasUnsavedChanges, () => false);
}

// One answer ("Leave") or one save lets the next navigation through for every
// guard on the page, so a form's own redirect after saving is never questioned.
let bypassUntil = 0;

/** Let the next navigation (within a second) through without asking. Call it after a save. */
export function allowNextNavigation(ms = 1000) {
  bypassUntil = Date.now() + ms;
}

function takeBypass() {
  if (Date.now() <= bypassUntil) {
    bypassUntil = 0;
    return true;
  }
  return false;
}

let asking = null;

/**
 * Ask before leaving, if anything on the page is unsaved. Resolves true when
 * it's fine to go: nothing unsaved, a save just happened, or the person chose
 * Leave. For navigation the guard can't see by itself: `navigate()` calls,
 * another router's visits (an Inertia-style router's "before" event).
 */
export function confirmLeave(message) {
  if (!hasUnsavedChanges() || takeBypass()) return Promise.resolve(true);
  if (asking) return asking; // two navigations at once: one dialog
  const text = message || [...dirtyForms.values()][0] || DEFAULT_MESSAGE;
  asking = confirmAction({ title: 'Leave without saving?', message: text, confirmLabel: 'Leave', tone: 'danger' })
    .then((leave) => {
      if (leave) allowNextNavigation();
      return !!leave;
    })
    .finally(() => { asking = null; });
  return asking;
}

/** useNavigate that asks first when something on the page is unsaved. */
export function useGuardedNavigate() {
  const navigate = useNavigate();
  return useCallback(async (to, options) => {
    if (typeof to === 'number' || await confirmLeave()) navigate(to, options);
  }, [navigate]);
}

/**
 * Warn before leaving a page with unsaved edits: on reload/close (browser
 * prompt) and when following in-app links (styled confirm dialog). While
 * `dirty`, `useHasUnsavedChanges()` is true, so `<UnsavedChangesStatus />`
 * shows its chip without being told.
 *
 * Navigation the guard can't see (a `navigate()` call) asks through
 * `useGuardedNavigate()` or `confirmLeave()`. After saving, call
 * `allowNextNavigation()` before redirecting.
 */
export default function useUnsavedChangesGuard(dirty, message = DEFAULT_MESSAGE) {
  const navigate = useNavigate();
  const key = useId();

  useEffect(() => {
    reportUnsaved(key, !!dirty, message);
    return () => reportUnsaved(key, false);
  }, [key, dirty, message]);

  useEffect(() => {
    if (!dirty) return undefined;

    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    const onClick = async (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = e.target.closest?.('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (takeBypass()) return;
      e.preventDefault();
      e.stopPropagation();
      if (await confirmLeave(message)) {
        takeBypass(); // spent on this visit
        navigate(url.pathname + url.search + url.hash);
      }
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, [dirty, message, navigate]);
}

/**
 * Track edits against the last loaded/saved copy and guard navigation.
 *   const { dirty, markSaved } = useUnsavedChanges(form);
 *   // after loading or saving: markSaved(formValues)
 */
export function useUnsavedChanges(value) {
  const [baseline, setBaseline] = useState(null);
  const dirty = baseline !== null && JSON.stringify(value) !== JSON.stringify(baseline);
  useUnsavedChangesGuard(dirty);
  return { dirty, markSaved: setBaseline, baseline };
}
