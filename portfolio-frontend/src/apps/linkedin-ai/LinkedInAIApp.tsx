import { Routes, Route, Navigate } from 'react-router-dom';
import { LinkedInAuthProvider } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import GeneratePanel from './components/GeneratePanel';
import PostsPage from './components/PostsPage';
import SchedulePage from './components/SchedulePage';
import RequireAuth from './components/RequireAuth';

export default function LinkedInAIApp() {
    return (
        <LinkedInAuthProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={
                    <RequireAuth>
                        <DashboardLayout>
                            <GeneratePanel />
                        </DashboardLayout>
                    </RequireAuth>
                } />
                <Route path="/posts" element={
                    <RequireAuth>
                        <DashboardLayout>
                            <PostsPage />
                        </DashboardLayout>
                    </RequireAuth>
                } />
                <Route path="/schedule" element={
                    <RequireAuth>
                        <DashboardLayout>
                            <SchedulePage />
                        </DashboardLayout>
                    </RequireAuth>
                } />
                <Route path="/" element={<Navigate to="/linkedin-ai/login" replace />} />
                <Route path="*" element={<Navigate to="/linkedin-ai/login" replace />} />
            </Routes>
        </LinkedInAuthProvider>
    );
}
