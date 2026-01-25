import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { ApiResponse, PortfolioProject, PortfolioMedia, ContactSubmission, Comment, SearchResultItem, BackupInfo, AdminHeroSlide, AnalyticsEvent, DashboardStats, Notification, ActivityLog, ActivityLogStats, PaginatedResponse, TrustedClient, SiteSettings } from '../types';

// Create axios instance - using token-based auth (no withCredentials needed)
// Create axios instance - using token-based auth (no withCredentials needed)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      // Only redirect if we're in an admin route
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Portfolio API
export const portfolioApi = {
  getAll: async (params?: { category?: string; featured?: boolean }): Promise<PortfolioProject[]> => {
    const response = await apiClient.get<ApiResponse<PortfolioProject[]>>('/portfolio', { params });
    return response.data.data || [];
  },
  
  getById: async (id: number): Promise<PortfolioProject | null> => {
    const response = await apiClient.get<ApiResponse<PortfolioProject>>(`/portfolio/${id}`);
    return response.data.data || null;
  },
  
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/portfolio/categories');
    return response.data.data || [];
  },
  
  getFeatured: async (limit?: number): Promise<PortfolioProject[]> => {
    const response = await apiClient.get<ApiResponse<PortfolioProject[]>>('/portfolio/featured', { params: { limit } });
    return response.data.data || [];
  },

  // Admin CRUD operations
  create: async (data: Partial<PortfolioProject> | FormData): Promise<PortfolioProject> => {
    const response = await apiClient.post<ApiResponse<PortfolioProject>>('/admin/portfolio', data);
    return response.data.data!;
  },

  update: async (id: number, data: Partial<PortfolioProject> | FormData): Promise<PortfolioProject> => {
    const response = await apiClient.put<ApiResponse<PortfolioProject>>(`/admin/portfolio/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/portfolio/${id}`);
  },

  toggleFeatured: async (id: number): Promise<PortfolioProject> => {
    const response = await apiClient.patch<ApiResponse<PortfolioProject>>(`/admin/portfolio/${id}/toggle-featured`);
    return response.data.data!;
  },

  reorder: async (ids: number[]): Promise<void> => {
    await apiClient.post('/admin/portfolio/reorder', { ids });
  },

  getAllTags: async (): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/admin/portfolio/tags/all');
    return response.data.data || [];
  },

  // Media (Image Gallery)
  getMedia: async (id: number): Promise<PortfolioMedia[]> => {
    const response = await apiClient.get<ApiResponse<PortfolioMedia[]>>(`/admin/portfolio/${id}/media`);
    return response.data.data || [];
  },

  uploadMedia: async (id: number, file: File): Promise<PortfolioMedia> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<ApiResponse<PortfolioMedia>>(
      `/admin/portfolio/${id}/media`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data!;
  },

  deleteMedia: async (id: number, mediaId: number): Promise<void> => {
    await apiClient.delete(`/admin/portfolio/${id}/media/${mediaId}`);
  },

  setPrimaryImage: async (id: number, mediaId: number): Promise<void> => {
    await apiClient.post(`/admin/portfolio/${id}/media/${mediaId}/primary`);
  },
};

// Export API
export const exportApi = {
  exportPortfolioExcel: async (params?: { category?: string; status?: string; featured?: boolean }): Promise<Blob> => {
    const response = await apiClient.get('/admin/export/portfolio/excel', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  exportPortfolioCsv: async (params?: { category?: string; status?: string }): Promise<Blob> => {
    const response = await apiClient.get('/admin/export/portfolio/csv', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  exportSubmissionsExcel: async (params?: { status?: string; date_from?: string; date_to?: string }): Promise<Blob> => {
    const response = await apiClient.get('/admin/export/submissions/excel', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  exportSubmissionsCsv: async (params?: { status?: string }): Promise<Blob> => {
    const response = await apiClient.get('/admin/export/submissions/csv', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};

// Contact API
export const contactApi = {
  submit: async (data: ContactSubmission): Promise<ApiResponse<{ id: number }>> => {
    const response = await apiClient.post<ApiResponse<{ id: number }>>('/contact', data);
    return response.data;
  },
  
  getAvailableTimes: async (date: string): Promise<string[]> => {
    const response = await apiClient.get<ApiResponse<string[]>>('/contact/available-times', { params: { date } });
    return response.data.data || [];
  },
};

// Submissions API (Admin)
export const submissionsApi = {
  getAll: async (params?: { status?: string }): Promise<ContactSubmission[]> => {
    const response = await apiClient.get('/admin/submissions', { params });
    // Handle paginated Laravel response
    if (response.data.data && response.data.data.data) {
      return response.data.data.data;
    }
    // Handle direct array response
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  getById: async (id: number): Promise<ContactSubmission | null> => {
    const response = await apiClient.get<ApiResponse<ContactSubmission>>(`/admin/submissions/${id}`);
    return response.data.data || null;
  },

  updateStatus: async (id: number, status: string): Promise<ContactSubmission> => {
    const response = await apiClient.patch<ApiResponse<ContactSubmission>>(`/admin/submissions/${id}/status`, { status });
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/submissions/${id}`);
  },

  getRecent: async (limit?: number): Promise<ContactSubmission[]> => {
    const response = await apiClient.get<ApiResponse<ContactSubmission[]>>('/admin/submissions/recent', { params: { limit } });
    return response.data.data || [];
  },

  getUpcoming: async (days?: number): Promise<ContactSubmission[]> => {
    const response = await apiClient.get<ApiResponse<ContactSubmission[]>>('/admin/submissions/upcoming', { params: { days } });
    return response.data.data || [];
  },
};

// Comments API (for submissions)
export const commentsApi = {
  getForSubmission: async (submissionId: number): Promise<Comment[]> => {
    const response = await apiClient.get<ApiResponse<Comment[]>>(`/admin/submissions/${submissionId}/comments`);
    return response.data.data || [];
  },

  addToSubmission: async (submissionId: number, body: string): Promise<Comment> => {
    const response = await apiClient.post<ApiResponse<Comment>>(`/admin/submissions/${submissionId}/comments`, { body });
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/comments/${id}`);
  },
};

// Advanced Search API
export const searchApi = {
  search: async (q: string, type: 'all' | 'portfolio' | 'submissions' = 'all'): Promise<SearchResultItem[]> => {
    const response = await apiClient.get<ApiResponse<SearchResultItem[]>>('/admin/search', {
      params: { q, type },
    });
    return response.data.data || [];
  },
};

// Backup API
export const backupApi = {
  run: async (): Promise<string> => {
    const response = await apiClient.post<ApiResponse<{ output: string }>>('/admin/backups/run');
    return response.data.data?.output || '';
  },

  latest: async (): Promise<BackupInfo[]> => {
    const response = await apiClient.get<ApiResponse<BackupInfo[]>>('/admin/backups/latest');
    return response.data.data || [];
  },
};

// Hero Slides API
export const heroSlidesApi = {
  // Public
  getPublic: async (): Promise<AdminHeroSlide[]> => {
    const response = await apiClient.get<ApiResponse<AdminHeroSlide[]>>('/hero-slides');
    return response.data.data || [];
  },

  // Admin
  getAll: async (): Promise<AdminHeroSlide[]> => {
    const response = await apiClient.get<ApiResponse<AdminHeroSlide[]>>('/admin/hero-slides');
    return response.data.data || [];
  },

  create: async (data: Partial<AdminHeroSlide>): Promise<AdminHeroSlide> => {
    const response = await apiClient.post<ApiResponse<AdminHeroSlide>>('/admin/hero-slides', data);
    return response.data.data!;
  },

  update: async (id: number, data: Partial<AdminHeroSlide>): Promise<AdminHeroSlide> => {
    const response = await apiClient.put<ApiResponse<AdminHeroSlide>>(`/admin/hero-slides/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/hero-slides/${id}`);
  },

  uploadBackground: async (id: number, file: File): Promise<AdminHeroSlide> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<ApiResponse<AdminHeroSlide>>(
      `/admin/hero-slides/${id}/background`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data!;
  },
};

// Analytics API
export const analyticsApi = {
  trackPageVisit: async (page: string): Promise<void> => {
    try {
      await apiClient.post('/analytics/page-visit', { page });
    } catch {
      // Silently fail analytics
    }
  },
  
  trackClick: async (event: Partial<AnalyticsEvent>): Promise<void> => {
    try {
      await apiClient.post('/analytics/click', event);
    } catch {
      // Silently fail analytics
    }
  },
  
  trackFormSubmission: async (formType: string, success: boolean): Promise<void> => {
    try {
      await apiClient.post('/analytics/form-submission', { form_type: formType, success });
    } catch {
      // Silently fail analytics
    }
  },

  // Admin analytics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/admin/analytics/dashboard');
    return response.data.data!;
  },

  getPageViews: async (period?: string): Promise<{ date: string; views: number }[]> => {
    const response = await apiClient.get<ApiResponse<{ date: string; views: number }[]>>('/admin/analytics/page-views', { params: { period } });
    return response.data.data || [];
  },

  getPopularPages: async (limit?: number): Promise<{ page: string; views: number }[]> => {
    const response = await apiClient.get<ApiResponse<{ page: string; views: number }[]>>('/admin/analytics/popular-pages', { params: { limit } });
    return response.data.data || [];
  },

  getVisitorStats: async (period?: string): Promise<{ date: string; visitors: number; unique: number }[]> => {
    const response = await apiClient.get<ApiResponse<{ date: string; visitors: number; unique: number }[]>>('/admin/analytics/visitors', { params: { period } });
    return response.data.data || [];
  },
};

// Notifications API (Admin)
export const notificationsApi = {
  getAll: async (): Promise<Notification[]> => {
    const response = await apiClient.get<ApiResponse<Notification[]>>('/admin/notifications');
    return response.data.data || [];
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.patch(`/admin/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/admin/notifications/mark-all-read');
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/notifications/${id}`);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/admin/notifications/unread-count');
    return response.data.data?.count || 0;
  },
};

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string }>> => {
    const response = await apiClient.post<ApiResponse<{ token: string }>>('/auth/login', { email, password });
    if (response.data.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
    }
  },
  
  getUser: async (): Promise<ApiResponse<{ user: { id: number; name: string; email: string } }>> => {
    const response = await apiClient.get('/auth/user');
    return response.data;
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};

// Activity Log API
export const activityLogApi = {
  getAll: async (params?: { 
    subject_type?: string; 
    causer_id?: number; 
    event?: string; 
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse<ActivityLog>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<ActivityLog>>>('/admin/activity-log', { params });
    return response.data.data || { data: [], current_page: 1, last_page: 1, per_page: 20, total: 0 };
  },

  getById: async (id: number): Promise<ActivityLog> => {
    const response = await apiClient.get<ApiResponse<ActivityLog>>(`/admin/activity-log/${id}`);
    return response.data.data!;
  },

  getStats: async (): Promise<ActivityLogStats> => {
    const response = await apiClient.get<ApiResponse<ActivityLogStats>>('/admin/activity-log/stats');
    return response.data.data!;
  },
};

// Site Settings API
export const siteSettingsApi = {
  // Public
  getPublic: async (): Promise<SiteSettings> => {
    const response = await apiClient.get<ApiResponse<SiteSettings>>('/site-settings');
    return response.data.data || {};
  },

  // Admin
  getAll: async (): Promise<SiteSettings> => {
    const response = await apiClient.get<ApiResponse<SiteSettings>>('/admin/site-settings');
    return response.data.data || {};
  },

  update: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    const response = await apiClient.put<ApiResponse<SiteSettings>>('/admin/site-settings', data);
    return response.data.data || {};
  },

  uploadPortfolio: async (file: File): Promise<{ portfolio_file_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<{ portfolio_file_url: string }>>(
      '/admin/site-settings/portfolio',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data!;
  },

  deletePortfolio: async (): Promise<void> => {
    await apiClient.delete('/admin/site-settings/portfolio');
  },

  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post<ApiResponse<{ avatar_url: string }>>(
      '/admin/site-settings/avatar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data!;
  },
};

// Trusted Clients API
export const trustedClientsApi = {
  // Public
  getPublic: async (): Promise<TrustedClient[]> => {
    const response = await apiClient.get<ApiResponse<TrustedClient[]>>('/trusted-clients');
    return response.data.data || [];
  },

  // Admin
  getAll: async (): Promise<TrustedClient[]> => {
    const response = await apiClient.get<ApiResponse<TrustedClient[]>>('/admin/trusted-clients');
    return response.data.data || [];
  },

  create: async (data: Partial<TrustedClient>): Promise<TrustedClient> => {
    const response = await apiClient.post<ApiResponse<TrustedClient>>('/admin/trusted-clients', data);
    return response.data.data!;
  },

  update: async (id: number, data: Partial<TrustedClient>): Promise<TrustedClient> => {
    const response = await apiClient.put<ApiResponse<TrustedClient>>(`/admin/trusted-clients/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/trusted-clients/${id}`);
  },

  uploadLogo: async (id: number, file: File): Promise<TrustedClient> => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await apiClient.post<ApiResponse<TrustedClient>>(
      `/admin/trusted-clients/${id}/logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data!;
  },

  reorder: async (ids: number[]): Promise<void> => {
    await apiClient.post('/admin/trusted-clients/reorder', { ids });
  },
};

export default apiClient;


