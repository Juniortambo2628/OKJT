import { useMemo } from 'react';
import { LegalPage, SiteLayout, Container } from '@okjt/site';
import Html from '../components/Html';
import { useSettings } from '../lib/content';

const slug = (text, i) => `${String(text).toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'section'}-${i + 1}`;

/**
 * A legal document written in the dashboard (Settings → Legal) as HTML,
 * cut at its headings into the kit's numbered sections.
 */
function split(html) {
  const parts = String(html).split(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/i);
  const intro = parts[0];
  const sections = [];
  for (let i = 1; i < parts.length; i += 2) {
    const title = parts[i].replace(/<[^>]+>/g, '').trim();
    sections.push({ id: slug(title, sections.length), title, body: <Html html={parts[i + 1]} /> });
  }
  return { intro, sections };
}

export default function Legal({ title, settingKey }) {
  const { setting, isLoading } = useSettings();
  const html = setting(settingKey);
  const doc = useMemo(() => split(html), [html]);
  if (isLoading) return <SiteLayout cta={false}><Container className="py-32"><div className="h-64 animate-pulse rounded-[2rem] bg-surface" /></Container></SiteLayout>;
  if (!html) {
    return <LegalPage title={title} intro={<p>This document is being updated. Please check back shortly, or contact us with any questions.</p>} sections={[]} />;
  }
  return <LegalPage title={title} intro={<Html html={doc.intro} />} sections={doc.sections} />;
}
