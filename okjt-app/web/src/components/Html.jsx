/**
 * Rich text written in the dashboard's editor. It comes from the site's own
 * admins, so it is shown as written; script tags and inline handlers are
 * dropped all the same.
 */
const clean = (html) => String(html ?? '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/\son\w+="[^"]*"/gi, '')
  .replace(/\son\w+='[^']*'/gi, '')
  .replace(/javascript:/gi, '');

export default function Html({ html, className = '' }) {
  if (!html) return null;
  const isMarkup = /<\/?[a-z][\s\S]*>/i.test(html);
  if (!isMarkup) {
    return <div className={`prose-okjt ${className}`}>{String(html).split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>;
  }
  return <div className={`prose-okjt ${className}`} dangerouslySetInnerHTML={{ __html: clean(html) }} />;
}
