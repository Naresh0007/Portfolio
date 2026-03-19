import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { token, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading...</div>;
    }

    if (!token) {
        return <Navigate to="/job-hunt/login" state={{ from: location }} replace />;
    }

    return children;
}
