/**
 * OcuSphere Typed Centralized API Client
 * Supports configurable API base URL, authentication headers, error handling, and JSON serialization.
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}

export class ApiError extends Error {
  public code: string;
  public status: number;
  public details: any[];

  constructor(message: string, code: string = 'API_ERROR', status: number = 500, details: any[] = []) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3005/api/v1';
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  private getToken(): string | null {
    try {
      return localStorage.getItem('ocusphere_auth_token');
    } catch {
      return null;
    }
  }

  public setToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem('ocusphere_auth_token', token);
      } else {
        localStorage.removeItem('ocusphere_auth_token');
      }
    } catch {
      // ignore
    }
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Support HTTP-only cookies
      });

      const contentType = response.headers.get('content-type');
      let data: any = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorInfo = data?.error || {};
        const message = errorInfo.message || data?.message || `Request failed with status ${response.status}`;
        const code = errorInfo.code || `HTTP_${response.status}`;
        const details = errorInfo.details || [];
        throw new ApiError(message, code, response.status, details);
      }

      // If wrapped in standard NestJS response { success: true, data: ... }
      if (data && typeof data === 'object' && 'data' in data && 'success' in data) {
        if (data.meta && Object.keys(data.meta).length > 0 && Array.isArray(data.data)) {
          return {
            items: data.data,
            ...data.meta,
          } as unknown as T;
        }
        return data.data as T;
      }

      return data as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(err?.message || 'Network request failed. Is the API server running?', 'NETWORK_ERROR', 0);
    }
  }

  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryStr = searchParams.toString();
      if (queryStr) {
        url += (url.includes('?') ? '&' : '?') + queryStr;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  public async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
