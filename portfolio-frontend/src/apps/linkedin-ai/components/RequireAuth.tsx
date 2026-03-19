import { Navigate } from 'react-router-dom';
import { useLinkedInAuth } from '../context/AuthContext';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useLinkedInAuth();
    if (isLoading) return <div className="li-loading-screen"><div className="li-spinner" /></div>;
    if (!user) return <Navigate to="/linkedin-ai/login" replace />;
    return <>{children}</>;
}
