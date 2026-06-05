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
  enableTwoFactor: (code: string) => api.post('/auth/2fa/enable', { code }),
  disableTwoFactor: () => api.post('/auth/2fa/disable'),
};

// Posts
export const postsApi = {
  list: (following?: boolean) => api.get('/posts', { params: { following } }),
  get: (uuid: string) => api.get(`/posts/${uuid}`),
  create: (content: string) => api.post('/posts', { content }),
  update: (uuid: string, content: string) => api.put(`/posts/${uuid}`, { content }),
  delete: (uuid: string) => api.delete(`/posts/${uuid}`),
  like: (uuid: string) => api.post(`/posts/${uuid}/like`),
  react: (uuid: string, reaction: string) => api.post(`/posts/${uuid}/react`, { reaction }),
  reply: (uuid: string, content: string) => api.post(`/posts/${uuid}/reply`, { content }),
};

// Feed
export const feedApi = {
  global: () => api.get('/feed/global'),
  trending: () => api.get('/feed/trending'),
  hashtag: (tag: string) => api.get(`/feed/hashtag/${tag}`),
  personalized: () => api.get('/feed/personalized'),
  forYou: () => api.get('/feed/for-you'),
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

// Search
export const searchApi = {
  all: (q: string) => api.get('/search', { params: { q } }),
  advanced: (params: any) => api.get('/search/advanced', { params }),
};

// Guilds
export const guildsApi = {
  list: (search?: string) => api.get('/guilds', { params: { search } }),
  get: (slug: string) => api.get(`/guilds/${slug}`),
  create: (name: string, description?: string, is_private?: boolean) => api.post('/guilds', { name, description, is_private }),
  update: (slug: string, data: any) => api.put(`/guilds/${slug}`, data),
  delete: (slug: string) => api.delete(`/guilds/${slug}`),
  join: (slug: string) => api.post(`/guilds/${slug}/join`),
  leave: (slug: string) => api.post(`/guilds/${slug}/leave`),
  channels: (slug: string) => api.get(`/guilds/${slug}/channels`),
  createChannel: (slug: string, name: string) => api.post(`/guilds/${slug}/channels`, { name }),
  updateChannel: (slug: string, channelId: number, name: string) => api.put(`/guilds/${slug}/channels/${channelId}`, { name }),
  deleteChannel: (slug: string, channelId: number) => api.delete(`/guilds/${slug}/channels/${channelId}`),
  channelPosts: (slug: string, channel: number) => api.get(`/guilds/${slug}/channels/${channel}/posts`),
  channelPost: (slug: string, channel: number, content: string) =>
    api.post(`/guilds/${slug}/channels/${channel}/posts`, { content }),
  invite: (slug: string) => api.post(`/guilds/${slug}/invites`),
};

// Chat
export const chatApi = {
  conversations: () => api.get('/conversations'),
  messages: (id: number) => api.get(`/conversations/${id}`),
  sendMessage: (id: number, content: string) => api.post(`/conversations/${id}/messages`, { content }),
  createDm: (userId: number) => api.post('/conversations/dm/{userId}', { user_id: userId }),
  createGroup: (name: string, participants: number[]) => api.post('/conversations/group', { name, participants }),
  typing: (id: number) => api.post(`/conversations/${id}/typing`),
  addMember: (id: number, userId: number) => api.post(`/conversations/${id}/members`, { user_id: userId }),
  removeMember: (id: number, userId: number) => api.delete(`/conversations/${id}/members/${userId}`),
};

// Notifications
export const notificationsApi = {
  list: () => api.get('/notifications'),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id: number) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

// Bookmarks
export const bookmarksApi = {
  list: () => api.get('/bookmarks'),
  add: (postId: number) => api.post('/bookmarks', { post_id: postId }),
  remove: (postId: number) => api.delete(`/bookmarks/${postId}`),
};

// Favorites
export const favoritesApi = {
  list: () => api.get('/favorites'),
  toggle: (postId: number) => api.post('/favorites/toggle', { post_id: postId }),
};

// Blocks
export const blockApi = {
  block: (userId: number) => api.post(`/block/${userId}`),
  unblock: (userId: number) => api.delete(`/block/${userId}`),
  blocked: () => api.get('/blocked'),
};

// Mute
export const muteApi = {
  mute: (userId: number) => api.post(`/mute/${userId}`),
  unmute: (userId: number) => api.delete(`/mute/${userId}`),
};

// Polls
export const pollsApi = {
  create: (question: string, options: string[]) => api.post('/polls', { question, options }),
  vote: (pollId: number, optionId: number) => api.post(`/polls/${pollId}/vote`, { option_id: optionId }),
};

// Stories
export const storiesApi = {
  feed: () => api.get('/stories'),
  create: (content: string) => api.post('/stories', { content }),
  view: (storyId: number) => api.post(`/stories/${storyId}/view`),
};

// Levels
export const levelsApi = {
  profile: () => api.get('/level'),
  leaderboard: () => api.get('/leaderboard'),
};

// Invites
export const invitesApi = {
  join: (code: string) => api.get(`/invite/${code}`),
};

// Reports
export const reportsApi = {
  create: (data: any) => api.post('/reports', data),
};

// Settings
export const settingsApi = {
  updatePassword: (current_password: string, new_password: string, new_password_confirmation: string) =>
    api.put('/settings/password', { current_password, new_password, new_password_confirmation }),
  updatePrivacy: (data: any) => api.put('/settings/privacy', data),
  confirmTwoFactor: (code: string) => api.post('/settings/2fa/confirm', { code }),
};

// Push Notifications
export const pushApi = {
  register: (token: string, platform?: string) => api.post('/push/register', { token, platform }),
  unregister: (token: string) => api.post('/push/unregister', { token }),
  vapidKey: () => api.get('/push/vapid-public-key'),
};

// Bot
export const botApi = {
  post: (token: string, content: string, guild_id?: number, channel_id?: number) =>
    api.post('/bot/post', { token, content, guild_id, channel_id }),
  message: (token: string, conversation_id: number, content: string) =>
    api.post('/bot/message', { token, conversation_id, content }),
};