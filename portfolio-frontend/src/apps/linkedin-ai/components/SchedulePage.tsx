import { useState, useEffect } from 'react';
import { liGetSchedule, liCreateSchedule, liUpdateSchedule, liDeleteSchedule } from '../lib/linkedinApi';

const TONES = ['Professional', 'Casual', 'Storytelling', 'Viral/Engaging'];
const FREQUENCIES = ['Daily', 'Weekly', 'Custom'];

interface Schedule {
    id: number;
    topic: string;
    tone: string;
    frequency: string;
    customPerWeek: number | null;
    isActive: boolean;
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
    });

    useEffect(() => {
        fetchSchedules();
    }, []);

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

            {success && <div className="li-success-box">{success}</div>}

            {activeSchedule && (
                <div className="li-card li-active-schedule">
                    <div className="li-active-header">
                        <div>
                            <div className="li-active-badge">🟢 Active Schedule</div>
                            <h3>{activeSchedule.topic}</h3>
                            <p>{activeSchedule.tone} · {activeSchedule.frequency}{activeSchedule.customPerWeek ? ` (${activeSchedule.customPerWeek}x/week)` : ''}</p>
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
