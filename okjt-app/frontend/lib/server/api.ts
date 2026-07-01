import { API_BASE_URL } from '@/lib/config'
import type { Service, Insight, Project, Pillar, Stat, Testimonial, Client, TeamMember, Value, SiteSetting } from '@/types/api'

async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      next: { tags: ['okjt-content'] },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data !== undefined ? json.data : json;
  } catch {
    return null;
  }
}

async function fetchCollection<T>(endpoint: string): Promise<T[]> {
  return (await fetchApi<T[]>(endpoint)) ?? [];
}

async function fetchBySlug<T>(endpoint: string, slug: string): Promise<T | null> {
  return fetchApi<T>(`${endpoint}/${slug}`);
}

export async function getSettings() {
  return fetchApi<Record<string, SiteSetting[]>>('/settings');
}

export async function getServices() {
  return fetchCollection<Service[]>('/services');
}

export async function getInsights() {
  return fetchCollection<Insight[]>('/insights');
}

export async function getProjects(type?: string) {
  const query = type ? `?type=${type}` : '';
  return fetchCollection<Project[]>(`/projects${query}`);
}

export async function getStats() {
  return fetchCollection<Stat[]>('/stats');
}

export async function getPillars() {
  return fetchCollection<Pillar[]>('/pillars');
}

export async function getTestimonials() {
  return fetchCollection<Testimonial[]>('/testimonials');
}

export async function getClients() {
  return fetchCollection<Client[]>('/clients');
}

export async function getValues() {
  return fetchCollection<Value[]>('/values');
}

export async function getTeamMembers() {
  return fetchCollection<TeamMember[]>('/team-members');
}

export async function getServiceBySlug(slug: string) {
  return fetchBySlug<Service>('/services', slug);
}

export async function getInsightBySlug(slug: string) {
  return fetchBySlug<Insight>('/insights', slug);
}

export async function getProjectBySlug(slug: string) {
  return fetchBySlug<Project>('/projects', slug);
}

export async function getPillarBySlug(slug: string) {
  return fetchBySlug<Pillar>('/pillars', slug);
}
