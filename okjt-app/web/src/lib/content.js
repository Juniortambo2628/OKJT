import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api, { unwrap } from './api';

/**
 * The site's content from the API, cached in the browser for a few minutes:
 * a visitor moving between pages asks the server once, not on every page.
 */
const STALE = 5 * 60 * 1000;

const get = (path, params) => api.get(path, { params }).then((res) => unwrap(res.data));

export function useList(path, params) {
  return useQuery({ queryKey: [path, params ?? null], queryFn: () => get(path, params), staleTime: STALE });
}

export function useItem(path, enabled = true) {
  return useQuery({ queryKey: [path], queryFn: () => get(path), staleTime: STALE, enabled, retry: (count, error) => error?.response?.status !== 404 && count < 1 });
}

/** Only what the CMS marks as live. */
export const live = (items) => (Array.isArray(items) ? items.filter((item) => item.is_active !== false && item.is_published !== false) : []);

export const useServices = () => useList('/services');
export const usePillars = () => useList('/pillars');
export const useProjects = (type) => useList('/projects', type ? { type } : undefined);
export const useInsights = () => useList('/insights');
export const useStats = () => useList('/stats');
export const useTestimonials = () => useList('/testimonials');
export const useClients = () => useList('/clients');
export const useTeam = () => useList('/team-members');
export const useValues = () => useList('/values');

/**
 * Site settings ({ group: [{ key, value }] }) as one lookup:
 * `setting(key, fallback)`, `enabled(key)`, and `json(key, fallback)`.
 */
export function useSettings() {
  const query = useQuery({ queryKey: ['/settings'], queryFn: () => api.get('/settings').then((res) => res.data), staleTime: STALE });
  const map = useMemo(() => {
    const out = {};
    for (const group of Object.values(query.data ?? {})) {
      for (const item of unwrap(group) ?? []) out[item.key] = item.value;
    }
    return out;
  }, [query.data]);
  const setting = useCallback((key, fallback = '') => map[key] || fallback, [map]);
  const enabled = useCallback((key, fallback = false) => {
    const value = String(map[key] ?? (fallback ? '1' : '0')).toLowerCase();
    return value === '1' || value === 'true' || value === 'on';
  }, [map]);
  const json = useCallback((key, fallback) => {
    const value = map[key];
    if (!value) return fallback;
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch { return fallback; }
  }, [map]);
  return { ...query, map, setting, enabled, json };
}

export function useContact() {
  const { setting } = useSettings();
  return {
    email: setting('contact_email', 'hello@okjtech.co.ke'),
    phone: setting('contact_phone', '+254 700 000 000'),
    address: setting('contact_address', 'Nairobi, Kenya'),
    socials: {
      linkedin: setting('social_linkedin'),
      twitter: setting('social_twitter'),
      github: setting('social_github'),
      facebook: setting('social_facebook'),
    },
  };
}

/** Words per minute for "N min read". */
export function readingTime(html = '') {
  const words = String(html).replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * The picture that shows a project's work: the first screen in its gallery,
 * else its hero image, else its card image (often just a logo).
 */
export const screenOf = (project) => (project?.gallery ?? []).find(Boolean) || project?.bg_image || project?.image || null;
