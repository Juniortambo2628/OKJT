import { useEffect } from 'react';
import JourneyPage from '../components/Journey';
import { useContact, useSettings } from '../lib/content';
import { DEFAULT_HERO } from '../lib/defaults';
import { clip, sectionsOf, slugify } from '../lib/text';

const DOCUMENTS = [
  { to: '/privacy', key: 'privacy_policy', title: 'Privacy policy', text: 'What the site collects, why, and the choices you have.' },
  { to: '/terms', key: 'terms_of_service', title: 'Terms of service', text: 'The terms for using the site and its services.' },
  { to: '/cookies', key: 'cookie_policy', title: 'Cookie policy', text: 'What is kept in your browser, and how to change your choice.' },
];

/** Section headings may carry their own numbers ("1.", "5.2"); the chapters number themselves. */
const unnumber = (title) => String(title).replace(/^\d+(\.\d+)*\.?\s+/, '');

/** Rich text cut at h2, or at h3 when it has no h2s. */
function sections(html) {
  if (/<h2[\s>]/i.test(html)) return sectionsOf(html);
  return sectionsOf(String(html).replace(/<(\/?)h3/gi, '<$1h2'));
}

/**
 * A legal document written in the dashboard (Site settings → Legal
 * documents), as a journey: each heading a chapter, the other documents
 * as the toolkit.
 */
export default function Legal({ title, settingKey }) {
  const { setting, isLoading } = useSettings();
  const contact = useContact();
  const html = setting(settingKey);
  const updated = setting('legal_last_updated', '2026-03-01');
  const parts = html ? sections(html) : [];
  const words = String(html).replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const ownTitle = DOCUMENTS.find((d) => d.key === settingKey);

  useEffect(() => { document.querySelector('meta[name="robots"]')?.setAttribute('content', 'index, follow'); }, []);

  const chapters = html ? parts.map((part, i) => ({
    id: part.title ? slugify(unnumber(part.title)) : 'introduction',
    navLabel: part.title ? unnumber(part.title) : 'Introduction',
    when: i === 0 ? title : undefined,
    title: part.title ? unnumber(part.title) : 'Introduction',
    body: part.body,
  })) : [{
    id: 'updating',
    when: title,
    title: 'This document is being updated',
    intro: `Please check back shortly. Questions in the meantime: ${contact.email}.`,
  }];

  return (
    <JourneyPage
      loading={isLoading}
      hero={{
        media: setting('hero_legal_media') || DEFAULT_HERO,
        eyebrow: 'Legal',
        title,
        text: ownTitle?.text,
        breadcrumbs: [{ to: '/', label: 'Home' }, { label: title }],
      }}
      glance={[
        [new Date(`${updated}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), 'last updated'],
        [String(parts.filter((p) => p.title).length || 1), 'sections'],
        [`${Math.max(1, Math.round(words / 220))} min`, 'to read'],
        [contact.email, 'questions'],
      ]}
      label="Contents"
      chapters={chapters}
      toolkit={{
        eyebrow: 'Legal',
        navLabel: 'Other documents',
        title: 'The other documents',
        cards: DOCUMENTS.filter((d) => d.key !== settingKey).map((d) => ({ to: d.to, tags: ['Legal'], title: d.title, text: clip(d.text, 140) })),
      }}
      faqs={false}
    />
  );
}
