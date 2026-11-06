import { useEffect } from 'react';

/** A page made from data sets its own title and description once the record has loaded. */
export default function usePageMeta(title, description) {
  useEffect(() => {
    if (!title) return;
    document.title = `${title} | OKJTech`;
    if (description) {
      const text = String(description).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
      document.querySelector('meta[name="description"]')?.setAttribute('content', text);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', text);
    }
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${title} | OKJTech`);
  }, [title, description]);
}
