import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = 'https://kickguild.zeninhost.xyz/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = globalThis.localStorage?.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setToken = (token: string | null) => {
  if (token) {
    globalThis.localStorage?.setItem('token', token);
  } else {
    globalThis.localStorage?.removeItem('token');
  }
};

export const getToken = () => globalThis.localStorage?.getItem('token');

export const clearToken = () => {
  globalThis.localStorage?.removeItem('token');
  globalThis.localStorage?.removeItem('user');
};

export const getUser = () => {
  const userStr = globalThis.localStorage?.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const setUser = (user: any) => {
  globalThis.localStorage?.setItem('user', JSON.stringify(user));
};

export default api;

// Auth API
export const authApi = {
  login: (login: string, password: string) => api.post('/auth/login', { login, password }),
  register: (name: string, username: string, email: string, password: string, password_confirmation: string) => 
    api.post('/auth/register', { name, username, email, password, password_confirmation }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Posts API
export const postsApi = {
  list: (following?: boolean) => api.get('/posts', { params: { following } }),
  get: (uuid: string) => api.get(`/posts/${uuid}`),
  create: (content: string, media?: File[]) => {
    const formData = new FormData();
    formData.append('content', content);
    if (media) {
      media.forEach((file) => formData.append('media[]', file));
    }
    return api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  like: (uuid: string) => api.post(`/posts/${uuid}/like`),
  reply: (uuid: string, content: string) => api.post(`/posts/${uuid}/reply`, { content }),
  delete: (uuid: string) => api.delete(`/posts/${uuid}`),
};

// Profile API
export const profileApi = {
  get: (username: string) => api.get(`/profile/${username}`),
  update: (data: any) => api.put('/profile', data),
  follow: (userId: number) => api.post('/profile/follow', { user_id: userId }),
  unfollow: (userId: number) => api.delete('/profile/unfollow', { data: { user_id: userId } }),
  followers: (username: string) => api.get(`/profile/${username}/followers`),
  following: (username: string) => api.get(`/profile/${username}/following`),
  discover: () => api.get('/profile/discover'),
};

// Guilds API
export const guildsApi = {
  list: (search?: string) => api.get('/guilds', { params: { search } }),
  get: (slug: string) => api.get(`/guilds/${slug}`),
  create: (name: string, description?: string, is_private?: boolean) => 
    api.post('/guilds', { name, description, is_private }),
  join: (slug: string) => api.post(`/guilds/${slug}/join`),
  leave: (slug: string) => api.post(`/guilds/${slug}/leave`),
  channels: (slug: string) => api.get(`/guilds/${slug}/channels`),
  channelPosts: (slug: string, channel: number) => api.get(`/guilds/${slug}/channels/${channel}/posts`),
  channelPost: (slug: string, channel: number, content: string) => 
    api.post(`/guilds/${slug}/channels/${channel}/posts`, { content }),
};

// Chat API
export const chatApi = {
  conversations: () => api.get('/conversations'),
  messages: (id: number) => api.get(`/conversations/${id}`),
  sendMessage: (id: number, content: string) => api.post(`/conversations/${id}/messages`, { content }),
  createDm: (userId: number) => api.post('/conversations/dm/{userId}', { user_id: userId }),
  createGroup: (name: string, participants: number[]) => 
    api.post('/conversations/group', { name, participants }),
};

// Notifications API
export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id: number) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

// Bot API
export const botApi = {
  post: (token: string, content: string, guild_id?: number, channel_id?: number) =>
    api.post('/bot/post', { token, content, guild_id, channel_id }),
  message: (token: string, conversation_id: number, content: string) =>
    api.post('/bot/message', { token, conversation_id, content }),
};