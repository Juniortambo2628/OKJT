/**
 * Undo instead of "are you sure?" (F7): the deferred commit. No React, so it
 * is in `@okjt/ui/helpers` as well as `@okjt/ui`.
 *
 * Lifted from TFE (`resources/js/lib/undo.js`, with its tests). The item goes
 * at once and the request is only SENT when the undo window closes, so Undo
 * never has to un-delete anything on the server. If the tab is closed inside
 * the window, the action simply never happens: the safe way for it to fail.
 *
 * Only for things that are safe to take back (your own content, an RSVP).
 * Anything that tells someone else, moves money or can't be asked for again
 * keeps its confirmAction().
 */
export const UNDO_WINDOW_MS = 5000;

/**
 * Run `commit` after `delay` ms unless undone first.
 * Returns { undo() → true if it landed in time, flush() → commit now, state }.
 */
export function scheduleUndoable({ commit, delay = UNDO_WINDOW_MS, timers = globalThis }) {
  let state = 'pending';
  const handle = timers.setTimeout(() => {
    if (state !== 'pending') return;
    state = 'committed';
    commit();
  }, delay);

  return {
    undo() {
      if (state !== 'pending') return false;
      state = 'undone';
      timers.clearTimeout(handle);
      return true;
    },
    flush() {
      if (state !== 'pending') return;
      timers.clearTimeout(handle);
      state = 'committed';
      commit();
    },
    get state() { return state; },
  };
}
