/**
 * One way to write numbers, dates and status words everywhere (F11). No
 * React, so they are in `@okjt/ui/helpers` as well as `@okjt/ui`.
 *
 * Lifted from TFE (`resources/js/lib/utils.js`, with its tests), where 46
 * bare `toLocaleString()` calls meant "1.234" and "1,234" could sit on the
 * same screen, depending on the visitor's machine. The locale is pinned
 * (en-US unless you pass one), so the same value reads the same for everyone
 * and in tests. The TIME ZONE stays the viewer's: a deadline or a start time
 * should be read in their own.
 *
 * Changed on the way: each takes an optional `locale` (TFE pinned en-US with
 * no way to change it). TFE's `formatMoney` stays in TFE: its USD default is
 * TFE's own.
 */

export const DEFAULT_FORMAT_LOCALE = 'en-US';

/**
 * A count (people, items, kilometres): `1234567` → "1,234,567". Junk (null,
 * '', 'abc') reads as "0" rather than "NaN".
 */
export function formatNumber(value, maximumFractionDigits = 0, locale = DEFAULT_FORMAT_LOCALE) {
  const n = Number(value);
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(Number.isFinite(n) ? n : 0);
}

/**
 * A date and time: "Jun 14, 2027, 7:00 PM". `options` are Intl's, merged over
 * that default (`{ hour: undefined, minute: undefined }` for a date alone).
 * '' for a missing or invalid date, so a template can print it unguarded.
 */
export function formatDateTime(value, options = {}, locale = DEFAULT_FORMAT_LOCALE) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', ...options,
  }).format(d);
}

/**
 * A status as a badge shows it: sentence case, underscores as spaces
 * ("pending_payment" → "Pending payment", "APPROVED" → "Approved"). One
 * casing for every badge; the badge itself never text-transforms.
 */
export function statusLabel(value) {
  if (value === null || value === undefined || value === '') return '';
  const s = String(value).replace(/_/g, ' ').trim().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Sentence-case a raw slug for display: `school_community` → "School
 * community". Only the first letter changes, so a label that is already
 * written ("Running a club") stays as written, which `text-transform:
 * capitalize` would not ("Running A Club"). Anything but a filled string
 * passes through.
 */
export function titleCase(value) {
  if (typeof value !== 'string' || value === '') return value;
  const words = value.replace(/[_-]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
