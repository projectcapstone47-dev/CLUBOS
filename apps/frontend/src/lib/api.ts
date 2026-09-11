import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Organizations API
export const organizationsApi = {
  create: async (data: {
    name: string;
    slug: string;
    description?: string;
  }) => {
    const response = await api.post('/organizations', data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/organizations');
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
  },
};

// Memberships API
export const membershipsApi = {
  join: async (organizationId: string) => {
    const response = await api.post(`/memberships/organizations/${organizationId}/join`);
    return response.data;
  },

  leave: async (organizationId: string) => {
    const response = await api.delete(`/memberships/organizations/${organizationId}/leave`);
    return response.data;
  },

  getMembers: async (organizationId: string) => {
    const response = await api.get(`/memberships/organizations/${organizationId}/members`);
    return response.data;
  },

  getMyMemberships: async () => {
    const response = await api.get('/memberships/my-memberships');
    return response.data;
  },
};

// Events API
export const eventsApi = {
  create: async (data: {
    title: string;
    description?: string;
    organizationId: string;
    startDate: string;
    endDate?: string;
    venue?: string;
    eventType?: string;
    maxAttendees?: number;
    isPublic?: boolean;
  }) => {
    const response = await api.post('/events', data);
    return response.data;
  },

  getAll: async (organizationId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (organizationId) params.append('organizationId', organizationId);
    if (status) params.append('status', status);
    
    const response = await api.get(`/events?${params.toString()}`);
    return response.data;
  },

  getByOrganization: async (organizationId: string, upcoming: boolean = false) => {
    const response = await api.get(
      `/events/organization/${organizationId}?upcoming=${upcoming}`
    );
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  publish: async (id: string) => {
    const response = await api.post(`/events/${id}/publish`);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await api.post(`/events/${id}/cancel`);
    return response.data;
  },
};

