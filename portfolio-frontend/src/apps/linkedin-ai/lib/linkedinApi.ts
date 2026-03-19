import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5062';
const BASE_URL = apiBase.endsWith('/') ? apiBase : `${apiBase}/`;

export const linkedinApi = axios.create({ baseURL: BASE_URL });

linkedinApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('li_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth
export const liRegister = (data: { name: string; email: string; password: string }) =>
    linkedinApi.post('linkedin-auth/register', data);

export const liLogin = (data: { email: string; password: string }) =>
    linkedinApi.post('linkedin-auth/login', data);

// Posts
export const liGeneratePost = (data: { topic: string; tone: string }) =>
    linkedinApi.post('linkedin-posts/generate', data);

export const liGetPosts = () =>
    linkedinApi.get('linkedin-posts');

export const liDeletePost = (id: number) =>
    linkedinApi.delete(`linkedin-posts/${id}`);

export const liPublishPost = (id: number) =>
    linkedinApi.post(`linkedin-posts/${id}/publish`);

// Schedule
export const liCreateSchedule = (data: object) =>
    linkedinApi.post('linkedin-schedule', data);

export const liGetSchedule = () =>
    linkedinApi.get('linkedin-schedule');

export const liUpdateSchedule = (id: number, data: object) =>
    linkedinApi.put(`linkedin-schedule/${id}`, data);

export const liDeleteSchedule = (id: number) =>
    linkedinApi.delete(`linkedin-schedule/${id}`);

// Notifications
export const liGetNotifications = () =>
    linkedinApi.get('linkedin-notifications');

export const liMarkRead = (id: number) =>
    linkedinApi.patch(`linkedin-notifications/${id}/read`);

export const liMarkAllRead = () =>
    linkedinApi.patch('linkedin-notifications/read-all');

// LinkedIn Integration (OAuth 2.0)
export const liGetLinkedInConnectUrl = () =>
    linkedinApi.get('linkedin/connect');

export const liGetLinkedInProfile = () =>
    linkedinApi.get('linkedin/profile');

export const liDisconnectLinkedIn = () =>
    linkedinApi.post('linkedin/disconnect');
