export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Pillar {
  id: number;
  title: string;
  slug: string;
  overview: string | null;
  content: string | null;
  icon: string | null;
  image: string | null;
  is_active: boolean;
  services?: Service[];
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  pillar_id?: number;
  pillar?: Pillar;
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string | null;
  icon: string | null;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Insight {
  id: number;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  content: string;
  image: string | null;
  user_id: number;
  user?: User;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseStudy {
  id: number;
  title: string;
  slug: string;
  client_name: string;
  category: string | null;
  technologies: string[] | null;
  description: string | null;
  significant_figure: string;
  problem: string;
  methodology: string;
  outcome: string;
  testimonial_quote: string | null;
  testimonial_author: string | null;
  image: string | null;
  gallery: string[] | null;
  website_url: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  source: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Stat {
  id: number;
  label: string;
  value: string;
  icon: string | null;
  order: number;
}

export interface SiteSetting {
  id: number;
  key: string;
  value: string;
  type: string;
  group: string;
}

export interface Innovation {
  id: number;
  title: string;
  slug: string;
  tagline?: string;
  description?: string;
  image?: string | null;
  url?: string | null;
  category: string | null;
  technologies: string[] | null;
  significant_figure: string | null;
  problem: string | null;
  methodology: string | null;
  outcome: string | null;
  testimonial_quote: string | null;
  testimonial_author: string | null;
  gallery: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string | null;
  company: string | null;
  quote: string;
  avatar: string | null;
  rating: number;
  is_featured: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  name: string;
  logo: string | null;
  website: string | null;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  qualifications: string | null;
  linkedin: string | null;
  image: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Value {
  id: number;
  icon: string | null;
  title: string;
  description: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ConsultationRequest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface Rsvp {
  id: number;
  name: string;
  email: string;
  company: string | null;
  job_title: string | null;
  sector: string | null;
  interest: string | null;
  consent: boolean;
  newsletter: boolean;
  type: 'rsvp' | 'early_access';
  attendance: 'accept' | 'decline' | null;
  created_at: string;
  updated_at: string;
}
