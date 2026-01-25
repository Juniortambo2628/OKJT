// Portfolio Project
export interface PortfolioProject {
  id: number;
  title: string;
  description: string;
  category: string;
  client_name: string | null;
  client_logo: string | null;
  image_url: string;
  project_url: string | null;
  status: 'completed' | 'in_progress' | 'pending';
  featured: boolean;
  sort_order: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface PortfolioMedia {
  id: number;
  file_name: string;
  url: string;
  thumb_url: string;
  is_primary: boolean;
  size: number;
  created_at: string;
}

// Contact Submission
export interface ContactSubmission {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  country_code?: string;
  phone_number?: string;
  contact_method: 'email' | 'whatsapp';
  online_consultation?: boolean;
  consultation_date?: string;
  consultation_time?: string;
  message: string;
  consent: boolean;
  status?: 'pending' | 'accepted' | 'postponed' | 'cancelled' | 'completed';
  created_at?: string;
  updated_at?: string;
}

// Hero Slide
export interface HeroSlide {
  text: string;
  image: string;
  label: string;
  subtitle?: string;
  testimonial_text?: string;
  testimonial_author?: string;
  testimonial_company?: string;
}

export interface AdminHeroSlide {
  id: number;
  label: string;
  text: string;
  subtitle?: string | null;
  testimonial_text?: string | null;
  testimonial_author?: string | null;
  testimonial_company?: string | null;
  overlay_opacity: number;
  sort_order: number;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

// Trusted Client (for carousel)
export interface TrustedClient {
  id: number;
  name: string;
  logo_url?: string | null;
  website_url?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Site Settings
export interface SiteSettings {
  site_name?: string;
  site_description?: string;
  contact_email?: string;
  contact_phone?: string;
  social_twitter?: string | null;
  social_linkedin?: string | null;
  social_github?: string | null;
  linkedin_url?: string | null; // Keep for backward compatibility if needed
  portfolio_file_url?: string | null;
  avatar_url?: string | null;
}

// Social Links
export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
  email?: string;
}

// Navigation Item
export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Analytics
export interface AnalyticsEvent {
  type: 'page_visit' | 'click' | 'form_submission';
  page: string;
  element_id?: string;
  element_type?: string;
  session_id: string;
}

// Notification
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

// User/Admin
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

// Dashboard Stats
export interface DashboardStats {
  total_projects: number;
  total_submissions: number;
  pending_submissions: number;
  page_visits: number;
  unique_visitors: number;
}

// Form State
export interface FormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string | null;
}

// Activity Log
export interface ActivityLog {
  id: number;
  log_name: string;
  description: string;
  subject_type: string;
  subject_id: number;
  event: string;
  causer_type: string | null;
  causer_id: number | null;
  properties: Record<string, any>;
  created_at: string;
  causer?: User | null;
  subject?: any;
}

export interface ActivityLogStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  by_event: Array<{ event: string; count: number }>;
  by_subject: Array<{ subject_type: string; count: number }>;
}

// Paginated Response
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Comment (for submissions)
export interface Comment {
  id: number;
  body: string;
  author_name?: string | null;
  author_email?: string | null;
  created_by?: number | null;
  created_at: string;
}

export interface SearchResultItem {
  type: 'portfolio' | 'submission';
  id: number;
  title: string;
  subtitle?: string | null;
  status?: string | null;
  category?: string | null;
  featured?: boolean;
  contact_method?: string | null;
}

export interface BackupInfo {
  file: string;
  size: number;
  last_modified: number;
}

