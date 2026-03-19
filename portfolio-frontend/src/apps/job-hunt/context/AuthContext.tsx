import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authApi } from '../lib/authApi';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<any>;
    verifyEmail: (data: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('job_hunt_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const data = await authApi.getMe(token);
                    setUser(data.user);
                } catch (err) {
                    console.error("Failed to fetch user", err);
                    logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (data: any) => {
        const res = await authApi.login(data);
        handleAuthSuccess(res);
    };

    const register = async (data: any) => {
        return await authApi.register(data);
    };

    const verifyEmail = async (data: any) => {
        const res = await authApi.verifyEmail(data);
        handleAuthSuccess(res);
    };

    const handleAuthSuccess = (res: AuthResponse) => {
        localStorage.setItem('job_hunt_token', res.token);
        setToken(res.token);
        setUser(res.user);
    };

    const logout = () => {
        localStorage.removeItem('job_hunt_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, verifyEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
