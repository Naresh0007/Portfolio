import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLinkedInAuth } from '../context/AuthContext';
import { liLogin } from '../lib/linkedinApi';

export default function LoginPage() {
    const { login } = useLinkedInAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await liLogin(form);
            login(res.data.token, res.data.user);
            navigate('/linkedin-ai/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="li-auth-wrapper">
            <div className="li-auth-card">
                <div className="li-auth-brand">
                    <div className="li-brand-icon">✦</div>
                    <h1>LinkedIn AI</h1>
                    <p>Generate powerful LinkedIn content with AI</p>
                </div>
                <form onSubmit={handleSubmit} className="li-auth-form">
                    <h2>Welcome back</h2>
                    {error && <div className="li-error-box">{error}</div>}
                    <div className="li-form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="li-form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            required
                        />
                    </div>
                    <button type="submit" className="li-btn-primary" disabled={loading}>
                        {loading ? <><span className="li-spinner-sm" /> Signing in...</> : 'Sign In'}
                    </button>
                    <p className="li-auth-footer">
                        Don't have an account?{' '}
                        <Link to="/linkedin-ai/register">Create one</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
