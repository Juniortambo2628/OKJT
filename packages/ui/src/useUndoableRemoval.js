import { useCallback, useEffect, useRef, useState } from 'react';
import { undoable } from './feedback.js';

/**
 * Remove-with-Undo for a list (F7, from TFE's useUndoableRemoval):
 *
 *   const { isHidden, remove } = useUndoableRemoval();
 *   remove(goal.id, { message: 'Goal deleted', commit: () => api.delete(`/goals/${goal.id}`) });
 *   goals.filter((g) => !isHidden(g.id))
 *
 * The row goes at once; `commit` runs when the Undo window closes; Undo puts
 * the row back and nothing is sent. If `commit` fails, the row comes back and
 * the error is shown. Leaving the page commits what is pending rather than
 * dropping it: the person already saw it go. After a successful commit, refresh
 * your list as you normally would (the row stays hidden meanwhile).
 *
 * Changed from TFE: `commit` is any function (TFE's made an Inertia visit to
 * `url`), so it works with any router or API client.
 */
export default function useUndoableRemoval() {
  const [hidden, setHidden] = useState(() => new Set());
  const pending = useRef(new Map());

  const unhide = useCallback((id) => {
    setHidden((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }, []);

  useEffect(() => () => { pending.current.forEach((job) => job.flush()); }, []);

  const remove = useCallback((id, { message, commit, errorMessage, delay } = {}) => {
    setHidden((prev) => new Set(prev).add(id));
    const job = undoable(message, async () => {
      pending.current.delete(id);
      await commit();
    }, {
      delay,
      errorMessage,
      onUndo: () => { pending.current.delete(id); unhide(id); },
      onError: () => unhide(id),
    });
    pending.current.set(id, job);
    return job;
  }, [unhide]);

  const isHidden = useCallback((id) => hidden.has(id), [hidden]);
  return { isHidden, remove };
}
