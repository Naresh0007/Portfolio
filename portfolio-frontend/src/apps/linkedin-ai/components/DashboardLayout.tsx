import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLinkedInAuth } from '../context/AuthContext';
import { liGetNotifications, liMarkAllRead } from '../lib/linkedinApi';

interface Notification {
    id: number;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useLinkedInAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await liGetNotifications();
            setNotifications(res.data);
        } catch {}
    };

    const handleMarkAllRead = async () => {
        await liMarkAllRead();
        setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
    };

    const handleLogout = () => {
        logout();
        navigate('/linkedin-ai/login');
    };

    return (
        <div className="li-app">
            <aside className="li-sidebar">
                <div className="li-sidebar-brand">
                    <span className="li-brand-dot">✦</span>
                    <span>LinkedIn AI</span>
                </div>
                <nav className="li-sidebar-nav">
                    <NavLink to="/linkedin-ai/dashboard" className={({ isActive }) => `li-nav-link ${isActive ? 'active' : ''}`}>
                        <span>⚡</span> Dashboard
                    </NavLink>
                    <NavLink to="/linkedin-ai/posts" className={({ isActive }) => `li-nav-link ${isActive ? 'active' : ''}`}>
                        <span>📋</span> Posts
                    </NavLink>
                    <NavLink to="/linkedin-ai/schedule" className={({ isActive }) => `li-nav-link ${isActive ? 'active' : ''}`}>
                        <span>📅</span> Schedule
                    </NavLink>
                </nav>
                <div className="li-sidebar-footer">
                    <div className="li-user-chip">
                        <div className="li-user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                        <div className="li-user-info">
                            <span className="li-user-name">{user?.name}</span>
                            <span className="li-user-email">{user?.email}</span>
                        </div>
                    </div>
                    <button className="li-btn-logout" onClick={handleLogout}>Sign out</button>
                </div>
            </aside>

            <main className="li-main">
                <header className="li-topbar">
                    <div className="li-topbar-left" />
                    <div className="li-topbar-right">
                        <div className="li-notif-wrapper">
                            <button
                                className="li-notif-btn"
                                onClick={() => setShowNotifs(v => !v)}
                                aria-label="Notifications"
                            >
                                🔔
                                {unreadCount > 0 && (
                                    <span className="li-notif-badge">{unreadCount}</span>
                                )}
                            </button>
                            {showNotifs && (
                                <div className="li-notif-dropdown">
                                    <div className="li-notif-header">
                                        <span>Notifications</span>
                                        {unreadCount > 0 && (
                                            <button className="li-notif-mark-all" onClick={handleMarkAllRead}>
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    {notifications.length === 0 ? (
                                        <p className="li-notif-empty">No notifications yet</p>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n.id} className={`li-notif-item ${!n.isRead ? 'unread' : ''}`}>
                                                <span className="li-notif-dot" />
                                                <div>
                                                    <p>{n.message}</p>
                                                    <small>{new Date(n.createdAt).toLocaleDateString()}</small>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <div className="li-content">{children}</div>
            </main>
        </div>
    );
}
