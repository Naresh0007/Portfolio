import axios from 'axios';
import { AuthResponse } from '../types';

const API_BASE_URL = '/api/auth';

export const authApi = {
    register: async (data: any) => {
        const response = await axios.post<AuthResponse>(`${API_BASE_URL}/register`, data);
        return response.data;
    },
    login: async (data: any) => {
        const response = await axios.post<AuthResponse>(`${API_BASE_URL}/login`, data);
        return response.data;
    },
    verifyEmail: async (data: { email: string; token: string }) => {
        const response = await axios.post<AuthResponse>(`${API_BASE_URL}/verify-email`, data);
        return response.data;
    },
    getMe: async (token: string) => {
        const response = await axios.get(`${API_BASE_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};
