/**
 * API Service for Scent Australia Lead Generation Backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Types
export interface Lead {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  industry: string | null;
  location: string | null;
  address: string | null;
  company_size: string | null;
  annual_revenue: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'high' | 'medium' | 'low';
  source: string;
  score: number;
  ai_analysis: AIAnalysis | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  last_contacted: string | null;
  source_url: string | null;
  estimated_value: number;
}

export interface AIAnalysis {
  score: number;
  priority: string;
  fit_assessment: string;
  reasoning: string;
  industry_relevance: number;
  potential_value: string;
  recommended_products: string[];
  talking_points: string[];
  next_steps: string[];
  risk_factors: string[];
  confidence_level: number;
}

export interface LeadStats {
  total_leads: number;
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  total_estimated_value: number;
  average_score: number;
  top_industries: Record<string, number>;
  new_this_month: number;
  high_priority_count: number;
}

export interface ScrapingJob {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  started_at: string;
  completed_at: string | null;
  total_leads: number;
  processed_leads: number;
  errors: string[];
  parameters: {
    keywords: string[];
    locations: string[];
    max_leads: number;
    sources: string[];
    analyze_with_ai: boolean;
  };
}

export interface ScraperConfig {
  target_industries: string[];
  target_locations: string[];
  max_leads_per_run: number;
  scraping_delay: number;
  available_sources: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// API Error class
class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(response.status, data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error. Please check if the backend is running.');
  }
}

// =========================
// Lead API
// =========================

export const leadsApi = {
  // Get all leads with optional filters
  getLeads: async (params?: {
    status?: string;
    priority?: string;
    industry?: string;
    location?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<{ leads: Lead[]; total: number; page: number; per_page: number; total_pages: number }>> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return fetchApi(`/leads${queryString ? `?${queryString}` : ''}`);
  },

  // Get single lead by ID
  getLead: async (id: string): Promise<ApiResponse<Lead>> => {
    return fetchApi(`/leads/${id}`);
  },

  // Create new lead
  createLead: async (lead: Partial<Lead>): Promise<ApiResponse<Lead>> => {
    return fetchApi('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    });
  },

  // Update lead
  updateLead: async (id: string, data: Partial<Lead>): Promise<ApiResponse<Lead>> => {
    return fetchApi(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete lead
  deleteLead: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return fetchApi(`/leads/${id}`, {
      method: 'DELETE',
    });
  },

  // AI analyze a lead
  analyzeLead: async (id: string): Promise<ApiResponse<{ lead_id: string; analysis: AIAnalysis }>> => {
    return fetchApi(`/leads/${id}/analyze`, {
      method: 'POST',
    });
  },

  // Bulk AI analysis
  bulkAnalyze: async (leadIds: string[]): Promise<ApiResponse<{ results: any[]; total_processed: number }>> => {
    return fetchApi('/leads/bulk-analyze', {
      method: 'POST',
      body: JSON.stringify({ lead_ids: leadIds }),
    });
  },

  // Get lead statistics
  getStats: async (): Promise<ApiResponse<LeadStats>> => {
    return fetchApi('/leads/stats');
  },
};

// =========================
// Scraper API
// =========================

export const scraperApi = {
  // Start scraping job
  startScraping: async (params: {
    keywords?: string[];
    locations?: string[];
    max_leads?: number;
    sources?: string[];
    analyze_with_ai?: boolean;
  }): Promise<ApiResponse<{ job_id: string; status: string; message: string }>> => {
    return fetchApi('/scraper/start', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Get job status
  getJobStatus: async (jobId: string): Promise<ApiResponse<ScrapingJob>> => {
    return fetchApi(`/scraper/status/${jobId}`);
  },

  // List all jobs
  listJobs: async (): Promise<ApiResponse<{ jobs: ScrapingJob[]; total: number }>> => {
    return fetchApi('/scraper/jobs');
  },

  // Stop a job
  stopJob: async (jobId: string): Promise<ApiResponse<{ message: string }>> => {
    return fetchApi(`/scraper/stop/${jobId}`, {
      method: 'POST',
    });
  },

  // Preview scraping
  previewScraping: async (params: {
    keywords?: string[];
    locations?: string[];
    max_leads?: number;
  }): Promise<ApiResponse<{ preview_leads: any[]; total_found: number; message: string }>> => {
    return fetchApi('/scraper/preview', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Get scraper config
  getConfig: async (): Promise<ApiResponse<ScraperConfig>> => {
    return fetchApi('/scraper/config');
  },
};

// =========================
// Export API
// =========================

export const exportApi = {
  // Export to Excel
  exportToExcel: async (params?: {
    lead_ids?: string[];
    status?: string;
    priority?: string;
  }): Promise<ApiResponse<{ filename: string; filepath: string; total_exported: number; download_url: string }>> => {
    return fetchApi('/export/excel', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    });
  },

  // Export to CSV
  exportToCsv: async (params?: {
    lead_ids?: string[];
    status?: string;
    priority?: string;
  }): Promise<ApiResponse<{ filename: string; filepath: string; total_exported: number; download_url: string }>> => {
    return fetchApi('/export/csv', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    });
  },

  // Download file
  getDownloadUrl: (filename: string): string => {
    return `${API_BASE_URL}/export/download/${filename}`;
  },

  // List exported files
  listFiles: async (): Promise<ApiResponse<{ files: any[]; total: number }>> => {
    return fetchApi('/export/files');
  },

  // Delete file
  deleteFile: async (filename: string): Promise<ApiResponse<{ message: string }>> => {
    return fetchApi(`/export/delete/${filename}`, {
      method: 'DELETE',
    });
  },
};

// =========================
// Health API
// =========================

export const healthApi = {
  check: async (): Promise<ApiResponse<{ status: string; service: string; timestamp: string; version: string }>> => {
    return fetchApi('/health');
  },
};

export default {
  leads: leadsApi,
  scraper: scraperApi,
  export: exportApi,
  health: healthApi,
};

