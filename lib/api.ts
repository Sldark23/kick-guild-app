import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { storage } from './storage';

const API_URL = 'https://kickguild.zeninhost.xyz/api';

let _token: string | null = null;

export const setApiToken = (token: string | null) => {
  _token = token;
};

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_token && config.headers) {
    config.headers.Authorization = `Bearer ${_token}`;
  }
  return config;
});

export default api;

// Auth
export const authApi = {
  login: (login: string, password: string) => api.post('/auth/login', { login, password }),
  register: (name: string, username: string, email: string, password: string, password_confirmation: string) =>
    api.post('/auth/register', { name, username, email, password, password_confirmation }),
  verifyTwoFactor: (user_id: number, code: string) => api.post('/auth/2fa/verify', { user_id, code }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Posts
export const postsApi = {
  list: (following?: boolean) => api.get('/posts', { params: { following } }),
  get: (uuid: string) => api.get(`/posts/${uuid}`),
  create: (content: string) => api.post('/posts', { content }),
  like: (uuid: string) => api.post(`/posts/${uuid}/like`),
  reply: (uuid: string, content: string) => api.post(`/posts/${uuid}/reply`, { content }),
  delete: (uuid: string) => api.delete(`/posts/${uuid}`),
};

// Profile
export const profileApi = {
  get: (username: string) => api.get(`/profile/${username}`),
  update: (data: any) => api.put('/profile', data),
  follow: (userId: number) => api.post('/profile/follow', { user_id: userId }),
  unfollow: (userId: number) => api.delete('/profile/unfollow', { data: { user_id: userId } }),
  followers: (username: string) => api.get(`/profile/${username}/followers`),
  following: (username: string) => api.get(`/profile/${username}/following`),
  discover: () => api.get('/profile/discover'),
};

// Guilds
export const guildsApi = {
  list: (search?: string) => api.get('/guilds', { params: { search } }),
  get: (slug: string) => api.get(`/guilds/${slug}`),
  create: (name: string, description?: string, is_private?: boolean) => api.post('/guilds', { name, description, is_private }),
  join: (slug: string) => api.post(`/guilds/${slug}/join`),
  leave: (slug: string) => api.post(`/guilds/${slug}/leave`),
  channels: (slug: string) => api.get(`/guilds/${slug}/channels`),
  channelPosts: (slug: string, channel: number) => api.get(`/guilds/${slug}/channels/${channel}/posts`),
  channelPost: (slug: string, channel: number, content: string) =>
    api.post(`/guilds/${slug}/channels/${channel}/posts`, { content }),
};

// Chat
export const chatApi = {
  conversations: () => api.get('/conversations'),
  messages: (id: number) => api.get(`/conversations/${id}`),
  sendMessage: (id: number, content: string) => api.post(`/conversations/${id}/messages`, { content }),
  createDm: (userId: number) => api.post('/conversations/dm/{userId}', { user_id: userId }),
  createGroup: (name: string, participants: number[]) => api.post('/conversations/group', { name, participants }),
};

// Notifications
export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id: number) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

// Bot
export const botApi = {
  post: (token: string, content: string, guild_id?: number, channel_id?: number) =>
    api.post('/bot/post', { token, content, guild_id, channel_id }),
  message: (token: string, conversation_id: number, content: string) =>
    api.post('/bot/message', { token, conversation_id, content }),
};