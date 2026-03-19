import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function VerifyEmail() {
    const [token, setToken] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { verifyEmail } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            setError("Email missing. Please register again.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            await verifyEmail({ email, token });
            navigate('/job-hunt/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
                    <p>Session expired. Please register again.</p>
                    <button onClick={() => navigate('/job-hunt/register')} style={{ marginTop: '16px', color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer' }}>Go to Register</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: 'var(--bg-primary)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '24px',
                padding: '40px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '56px', height: '56px', margin: '0 auto 16px',
                        background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Mail style={{ color: '#10b981' }} size={28} />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>Verify Your Email</h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', lineHeight: 1.6 }}>
                        We've sent a verification token to <span style={{ color: '#10b981', fontWeight: 600 }}>{email || 'your email'}</span>.
                        Please paste it below to activate your account.
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <AlertCircle size={18} style={{ color: '#ef4444' }} />
                        <span style={{ color: '#fca5a5', fontSize: '14px' }}>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Verification Token</label>
                        <textarea
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Paste your verification token from email here..."
                            required
                            rows={4}
                            style={{
                                width: '100%', padding: '14px 16px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: 'white', outline: 'none',
                                fontSize: '14px', fontWeight: 500, resize: 'none',
                                fontFamily: 'monospace'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !token}
                        style={{
                            width: '100%', padding: '14px', marginTop: '8px',
                            background: '#10b981', color: 'white', border: 'none',
                            borderRadius: '12px', fontSize: '15px', fontWeight: 700,
                            cursor: 'pointer', transition: 'background 0.2s',
                            opacity: (loading || !token) ? 0.5 : 1
                        }}
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : 'Verify & Continue'}
                    </button>
                </form>

                <button
                    onClick={() => navigate('/job-hunt/register')}
                    style={{
                        marginTop: '24px', width: '100%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)',
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px'
                    }}
                >
                    <ArrowLeft size={16} /> Back to Register
                </button>
            </div>
        </div>
    );
}
