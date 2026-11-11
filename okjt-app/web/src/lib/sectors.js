import { screenOf } from './content';
/**
 * The sectors the work is grouped by. A project's `category` (free text in
 * the dashboard, e.g. "HealthTech / Clinic Operations") is matched against
 * each sector's words, its first part first, so the same sector written
 * different ways lands in one place. Start a category with a sector's name
 * to place a project for certain.
 */
export const SECTORS = [
  { id: 'health', label: 'Health', words: ['health', 'clinic', 'hospital', 'medical', 'pharma'], line: 'Clinical systems for the doctors, nurses and staff who use them every day.' },
  { id: 'legal', label: 'Legal & policy', words: ['legal', 'law', 'advocate', 'justice', 'policy', 'govtech', 'trade'], line: 'Portals for law firms, policy hubs and access-to-justice work.' },
  { id: 'construction', label: 'Construction & engineering', words: ['construct', 'engineer', 'infrastructure', 'proptech', 'property'], line: 'Project records, portfolios and collaboration for builders and engineers.' },
  { id: 'events', label: 'Events & hospitality', words: ['event', 'wedding', 'hospitality', 'guest', 'travel', 'sport', 'tourism'], line: 'Ticketing, guest lists, invitations and the day itself.' },
  { id: 'commerce', label: 'Commerce & retail', words: ['commerce', 'retail', 'shop', 'food', 'beverage', 'marketplace', 'agri', 'delivery'], line: 'Online stores, ordering and delivery, from farms to fan shops.' },
  { id: 'finance', label: 'Finance', words: ['fintech', 'finance', 'payment', 'saas onboarding', 'capital'], line: 'Onboarding, payments and financial workflows people trust.' },
  { id: 'nonprofit', label: 'Nonprofits & education', words: ['ngo', 'non-profit', 'nonprofit', 'philanthrop', 'social', 'youth', 'edtech', 'education', 'alumni', 'coaching', 'community'], line: 'Engagement, giving and learning platforms for organisations with a mission.' },
  { id: 'automotive', label: 'Automotive & logistics', words: ['automotive', 'garage', 'workshop', 'logistic', 'transport', 'fleet'], line: 'Workshop, fleet and customer systems that keep things moving.' },
  { id: 'services', label: 'Professional & creative services', words: ['consult', 'marketing', 'brand', 'creative', 'agency', 'studio', 'portfolio', 'hr', 'advisory', 'market intelligence', 'communications'], line: 'Workspaces, portfolios and client tools for firms and agencies.' },
];

const OTHER = { id: 'other', label: 'Other sectors', words: [], line: 'Platforms for every other kind of organisation.' };

const matches = (text, sector) => sector.words.some((word) => new RegExp(`\\b${word}`, 'i').test(text));

/** The sector a project belongs to. */
export function sectorOf(project) {
  const category = String(project?.category || '');
  const first = category.split(/[,/&]| and /i)[0];
  return SECTORS.find((s) => matches(first, s)) || SECTORS.find((s) => matches(category, s)) || OTHER;
}

/** Projects grouped by sector, in the order of SECTORS; projects keep the list's order. */
export function bySector(projects) {
  const groups = new Map();
  for (const project of projects) {
    const sector = sectorOf(project);
    if (!groups.has(sector.id)) groups.set(sector.id, { ...sector, projects: [] });
    groups.get(sector.id).projects.push(project);
  }
  return [...SECTORS, OTHER].map((s) => groups.get(s.id)).filter(Boolean);
}

/** The picture for a group: its featured project's, else the first with one. */
export const sectorPhoto = (group) => {
  const withPhoto = group.projects.filter((p) => screenOf(p));
  // A project with real screens beats one with only a logo.
  const withScreens = withPhoto.filter((p) => (p.gallery ?? []).some(Boolean));
  const pool = withScreens.length ? withScreens : withPhoto;
  const pick = pool.find((p) => p.is_featured) || pool[0];
  return pick ? screenOf(pick) : null;
};
