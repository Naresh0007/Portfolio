import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Layout, User as UserIcon, Briefcase, FileText, Settings, Rocket } from 'lucide-react';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/job-hunt/login');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            color: 'white',
            display: 'flex'
        }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(255,255,255,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
                    <div style={{
                        width: '32px', height: '32px', background: '#6366f1',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Briefcase size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>JobHunt</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <NavItem icon={<Layout size={20} />} label="Overview" active />
                    <NavItem icon={<Briefcase size={20} />} label="My Jobs" />
                    <NavItem icon={<FileText size={20} />} label="Documents" />
                    <NavItem icon={<Settings size={20} />} label="Settings" />
                </nav>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px', borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5',
                        border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                >
                    <LogOut size={18} /> Log Out
                </button>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '48px', position: 'relative', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px' }}>Welcome back, {user?.name}!</h1>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>Here's what's happening with your job search today.</p>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '8px 16px', background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '100px'
                    }}>
                        <div style={{
                            width: '32px', height: '32px', background: 'rgba(99, 102, 241, 0.2)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <UserIcon size={16} color="#818cf8" />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{user?.email}</span>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <DashboardCard
                        title="Linked Profile"
                        status="Not Connected"
                        description="Connect your LinkedIn profile to pull job history and experience."
                        cta="Connect Now"
                        icon={<Rocket size={24} color="#6366f1" />}
                    />
                    <DashboardCard
                        title="Resume / CV"
                        status="No CV Found"
                        description="Upload your latest CV to enable auto-fill and AI-tailored cover letters."
                        cta="Upload File"
                        icon={<FileText size={24} color="#6366f1" />}
                    />
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: '12px',
            background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
            color: active ? '#818cf8' : 'rgba(255,255,255,0.5)',
            cursor: 'pointer', transition: 'all 0.2s',
            fontWeight: 600, fontSize: '14px'
        }}>
            {icon} {label}
        </div>
    );
}

function DashboardCard({ title, status, description, cta, icon }: any) {
    return (
        <div style={{
            padding: '32px',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
                <span style={{
                    padding: '4px 12px', background: 'rgba(239, 68, 68, 0.1)',
                    color: '#fca5a5', borderRadius: '100px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase'
                }}>{status}</span>
            </div>
            <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{description}</p>
            </div>
            <button style={{
                width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
            }}>{cta}</button>
        </div>
    );
}
