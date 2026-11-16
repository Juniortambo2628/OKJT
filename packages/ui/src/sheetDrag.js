/**
 * Swipe down to close, for Modal's bottom sheet on phones (F2). No React, so
 * `node --test` loads it. Lifted from TFE (`resources/js/lib/sheetDrag.js`).
 *
 * A sheet closes when it has been pulled far enough, or flicked fast enough:
 * a short quick flick is as clear as a long slow drag.
 */
export const SHEET_DISTANCE = 120; // px
export const SHEET_VELOCITY = 0.6; // px per ms

/** How far the sheet follows the finger: down only, never up. */
export function sheetOffset(startY, currentY) {
  return Math.max(0, currentY - startY);
}

export function shouldDismissSheet(dy, ms) {
  if (dy <= 0) return false;
  if (dy >= SHEET_DISTANCE) return true;
  return ms > 0 && dy >= 24 && dy / ms >= SHEET_VELOCITY;
}
