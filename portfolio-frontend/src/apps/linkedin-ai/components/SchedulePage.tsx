import { useState, useEffect } from 'react';
import { liGetSchedule, liCreateSchedule, liUpdateSchedule, liDeleteSchedule, liGetLinkedInConnectUrl, liGetLinkedInProfile, liDisconnectLinkedIn } from '../lib/linkedinApi';

const TONES = ['Professional', 'Casual', 'Storytelling', 'Viral/Engaging'];
const FREQUENCIES = ['Daily', 'Weekly', 'Custom'];

interface Schedule {
    id: number;
    topic: string;
    tone: string;
    frequency: string;
    customPerWeek: number | null;
    isActive: boolean;
    autoPublish: boolean;
    createdAt: string;
}

export default function SchedulePage() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({
        topic: '',
        tone: 'Professional',
        frequency: 'Daily',
        customPerWeek: 3,
        autoPublish: false,
    });

    const [connection, setConnection] = useState({
        isConnected: false,
        profileName: '',
        profilePicture: '',
        headline: '',
        expiresInHours: 0
    });

    useEffect(() => {
        fetchSchedules();
        fetchConnectionStatus();
    }, []);

    const fetchConnectionStatus = async () => {
        try {
            const res = await liGetLinkedInProfile();
            setConnection({
                isConnected: true,
                profileName: res.data.name,
                profilePicture: res.data.profilePicture,
                headline: res.data.headline,
                expiresInHours: res.data.expiresInHours
            });
        } catch {
            setConnection(c => ({ ...c, isConnected: false }));
        }
    };

    const handleConnect = async () => {
        try {
            const res = await liGetLinkedInConnectUrl();
            window.location.href = res.data.url;
        } catch (err) {
            setError('Failed to initiate LinkedIn connection.');
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Disconnect LinkedIn account? All temporarily stored profile data will be removed.')) return;
        try {
            await liDisconnectLinkedIn();
            setConnection({ isConnected: false, profileName: '', profilePicture: '', headline: '', expiresInHours: 0 });
            setSuccess('Disconnected successfully.');
        } catch {
            setError('Failed to disconnect.');
        }
    };

    const fetchSchedules = async () => {
        try {
            const res = await liGetSchedule();
            setSchedules(res.data);
        } catch {}
        finally { setLoading(false); }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...form,
                customPerWeek: form.frequency === 'Custom' ? form.customPerWeek : null,
            };
            await liCreateSchedule(payload);
            setSuccess('Schedule activated! Hangfire will generate posts automatically.');
            setShowForm(false);
            fetchSchedules();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create schedule.');
        } finally {
            setSaving(false);
        }
    };

    const toggleActive = async (schedule: Schedule) => {
        await liUpdateSchedule(schedule.id, { isActive: !schedule.isActive });
        setSchedules(ss => ss.map(s => s.id === schedule.id ? { ...s, isActive: !s.isActive } : s));
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this schedule?')) return;
        await liDeleteSchedule(id);
        setSchedules(ss => ss.filter(s => s.id !== id));
    };

    const activeSchedule = schedules.find(s => s.isActive);

    return (
        <div className="li-page">
            <div className="li-page-header">
                <h2>Auto Schedule</h2>
                <p>Let AI generate LinkedIn posts automatically based on your settings</p>
            </div>

            <div className="li-card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {connection.isConnected ? (
                        <>
                            <div className="li-user-avatar" style={{ width: '60px', height: '60px', position: 'relative' }}>
                                {connection.profilePicture ? (
                                    <img src={connection.profilePicture} alt="" style={{ borderRadius: '50%', width: '100%', border: '2px solid var(--li-primary)' }} />
                                ) : (
                                    <div className="li-user-avatar" style={{ width: '100%', height: '100%' }}>{connection.profileName[0]}</div>
                                )}
                                <div style={{ position: 'absolute', bottom: '-5px', right: '-5px', background: 'var(--li-success)', borderRadius: '50%', width: '15px', height: '15px', border: '2px solid white' }} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h3 style={{ margin: 0 }}>{connection.profileName}</h3>
                                    <span className="li-active-badge" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>Connected</span>
                                </div>
                                {connection.headline && <p style={{ margin: '2px 0', fontSize: '0.85rem', color: 'var(--li-text-muted)' }}>{connection.headline}</p>}
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
                                    Session expires in: {connection.expiresInHours.toFixed(1)}h (24h limit)
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="li-user-avatar" style={{ background: '#f1f5f9', color: '#94a3b8', width: '60px', height: '60px' }}>?</div>
                            <div>
                                <h3 style={{ margin: 0 }}>LinkedIn Account</h3>
                                <p style={{ margin: 2, fontSize: '0.85rem', color: 'var(--li-text-muted)' }}>Connect to enable automated post history and AI personalization</p>
                            </div>
                        </>
                    )}
                </div>
                {connection.isConnected ? (
                    <button className="li-btn-outline" onClick={handleDisconnect}>Disconnect Account</button>
                ) : (
                    <button className="li-btn-primary" onClick={handleConnect} style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>
                        🔗 Connect with LinkedIn
                    </button>
                )}
            </div>

            {success && <div className="li-success-box">{success}</div>}

            {activeSchedule && (
                <div className="li-card li-active-schedule">
                    <div className="li-active-header">
                        <div>
                            <div className="li-active-badge">🟢 Active Schedule</div>
                            <h3>{activeSchedule.topic}</h3>
                            <p>{activeSchedule.tone} · {activeSchedule.frequency}{activeSchedule.customPerWeek ? ` (${activeSchedule.customPerWeek}x/week)` : ''}</p>
                            <div style={{ marginTop: '0.5rem' }}>
                                {activeSchedule.autoPublish ? (
                                    <span className="li-badge li-badge-posted" style={{ fontSize: '0.75rem' }}>⚡ Auto-Publish Enabled</span>
                                ) : (
                                    <span className="li-badge li-badge-draft" style={{ fontSize: '0.75rem' }}>📋 Manual Review Mode</span>
                                )}
                            </div>
                        </div>
                        <div className="li-active-actions">
                            <button className="li-btn-outline" onClick={() => toggleActive(activeSchedule)}>
                                Pause
                            </button>
                            <button className="li-btn-danger-sm" onClick={() => handleDelete(activeSchedule.id)}>
                                Delete
                            </button>
                        </div>
                    </div>
                    <div className="li-schedule-info">
                        <span>📌 Posts are generated automatically and saved as Drafts</span>
                        <span>🔔 You'll receive an in-app notification when a post is ready</span>
                    </div>
                </div>
            )}

            {!activeSchedule && !showForm && (
                <div className="li-empty-state">
                    <div className="li-preview-empty-icon">📅</div>
                    <h3>No active schedule</h3>
                    <p>Enable auto scheduling to generate LinkedIn posts on autopilot</p>
                    <button className="li-btn-primary" onClick={() => setShowForm(true)}>
                        ⚡ Enable Auto Schedule
                    </button>
                </div>
            )}

            {showForm && (
                <div className="li-card">
                    <h3>Create Schedule</h3>
                    {error && <div className="li-error-box">{error}</div>}
                    <form onSubmit={handleCreate}>
                        <div className="li-form-group">
                            <label>Topic / Niche</label>
                            <input
                                className="li-input"
                                placeholder="e.g. Software Engineering Career Tips"
                                value={form.topic}
                                onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="li-form-group">
                            <label>Tone</label>
                            <div className="li-tone-grid">
                                {TONES.map(t => (
                                    <button
                                        type="button"
                                        key={t}
                                        className={`li-tone-btn ${form.tone === t ? 'selected' : ''}`}
                                        onClick={() => setForm(f => ({ ...f, tone: t }))}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="li-form-group">
                            <label>Frequency</label>
                            <div className="li-freq-row">
                                {FREQUENCIES.map(f => (
                                    <button
                                        type="button"
                                        key={f}
                                        className={`li-tone-btn ${form.frequency === f ? 'selected' : ''}`}
                                        onClick={() => setForm(fr => ({ ...fr, frequency: f }))}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                            {form.frequency === 'Custom' && (
                                <div className="li-form-group" style={{ marginTop: '0.75rem' }}>
                                    <label>Posts per week</label>
                                    <input
                                        type="number"
                                        className="li-input"
                                        min={1}
                                        max={7}
                                        value={form.customPerWeek}
                                        onChange={e => setForm(f => ({ ...f, customPerWeek: parseInt(e.target.value) }))}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="li-form-group" style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', margin: 0 }}>
                                <input
                                    type="checkbox"
                                    checked={form.autoPublish}
                                    onChange={e => setForm(f => ({ ...f, autoPublish: e.target.checked }))}
                                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                                <div>
                                    <span style={{ fontWeight: 600, color: '#1e293b' }}>🚀 Auto-Publish to LinkedIn</span>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b', fontWeight: 400 }}>
                                        Posts will be shared automatically to your profile without review.
                                    </p>
                                </div>
                            </label>
                        </div>

                        <div className="li-form-actions">
                            <button type="button" className="li-btn-outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="li-btn-primary" disabled={saving}>
                                {saving ? <><span className="li-spinner-sm" /> Activating...</> : '⚡ Activate Schedule'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {schedules.filter(s => !s.isActive).length > 0 && (
                <div className="li-card" style={{ marginTop: '1.5rem' }}>
                    <h3>Paused Schedules</h3>
                    {schedules.filter(s => !s.isActive).map(schedule => (
                        <div key={schedule.id} className="li-schedule-row">
                            <div>
                                <strong>{schedule.topic}</strong>
                                <span> · {schedule.tone} · {schedule.frequency}</span>
                            </div>
                            <div className="li-active-actions">
                                <button className="li-btn-outline" onClick={() => toggleActive(schedule)}>Resume</button>
                                <button className="li-btn-danger-sm" onClick={() => handleDelete(schedule.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
