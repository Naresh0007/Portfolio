import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { liRegister } from '../lib/linkedinApi';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await liRegister(form);
            setSuccess('Account created! You can now log in.');
            setTimeout(() => navigate('/linkedin-ai/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed.');
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
                    <p>Start creating viral LinkedIn content</p>
                </div>
                <form onSubmit={handleSubmit} className="li-auth-form">
                    <h2>Create your account</h2>
                    {error && <div className="li-error-box">{error}</div>}
                    {success && <div className="li-success-box">{success}</div>}
                    <div className="li-form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            required
                        />
                    </div>
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
                            placeholder="Min 6 characters"
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            minLength={6}
                            required
                        />
                    </div>
                    <button type="submit" className="li-btn-primary" disabled={loading}>
                        {loading ? <><span className="li-spinner-sm" /> Creating account...</> : 'Get Started'}
                    </button>
                    <p className="li-auth-footer">
                        Already have an account? <Link to="/linkedin-ai/login">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
