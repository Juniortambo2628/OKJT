const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getSettings() {
  return fetchApi<Record<string, any[]>>('/settings');
}

export async function getServices() {
  return fetchApi<any[]>('/services');
}

export async function getInsights() {
  return fetchApi<any[]>('/insights');
}

export async function getProjects(type?: string) {
  const query = type ? `?type=${type}` : '';
  return fetchApi<any[]>(`/projects${query}`);
}

export async function getStats() {
  return fetchApi<any[]>('/stats');
}

export async function getPillars() {
  return fetchApi<any[]>('/pillars');
}

export async function getTestimonials() {
  return fetchApi<any[]>('/testimonials');
}

export async function getClients() {
  return fetchApi<any[]>('/clients');
}

export async function getValues() {
  return fetchApi<any[]>('/values');
}

export async function getTeamMembers() {
  return fetchApi<any[]>('/team-members');
}

export async function getServiceBySlug(slug: string) {
  return fetchApi<any>(`/services/${slug}`);
}

export async function getInsightBySlug(slug: string) {
  return fetchApi<any>(`/insights/${slug}`);
}

export async function getProjectBySlug(slug: string) {
  return fetchApi<any>(`/projects/${slug}`);
}

export async function getPillarBySlug(slug: string) {
  return fetchApi<any>(`/pillars/${slug}`);
}
