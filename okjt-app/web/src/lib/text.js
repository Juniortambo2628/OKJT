/** Plain text from rich text. */
export const strip = (html) => String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

/** The first sentence of a text. */
export const firstSentence = (text) => (strip(text).match(/^.*?[.!?](\s|$)/)?.[0] || strip(text)).trim();

/** A short version of a text, ending at a word. */
export const clip = (text, length = 160) => {
  const plain = strip(text);
  if (plain.length <= length) return plain;
  return `${plain.slice(0, length).replace(/\s+\S*$/, '')}…`;
};

/** Rich text cut at its h2 headings: [{ title, body }]; the part before the first heading has no title. */
export function sectionsOf(html) {
  const parts = String(html ?? '').split(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const out = [];
  if (strip(parts[0])) out.push({ title: null, body: parts[0] });
  for (let i = 1; i < parts.length; i += 2) out.push({ title: strip(parts[i]), body: parts[i + 1] || '' });
  return out;
}

/** List items of rich text, as plain text. */
export const listItems = (html) => [...String(html ?? '').matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => strip(m[1])).filter(Boolean);

export const slugify = (text) => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'section';

/** "okjtech.co.ke/<path>" for a browser frame's bar. */
export const address = (path) => `okjtech.co.ke${path}`;
