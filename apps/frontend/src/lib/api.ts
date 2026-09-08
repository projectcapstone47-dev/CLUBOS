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
