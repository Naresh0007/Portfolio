import { useState } from 'react';
import { liGeneratePost } from '../lib/linkedinApi';

const TONES = ['Professional', 'Casual', 'Storytelling', 'Viral/Engaging'];
const FREQUENCIES = ['Daily', 'Weekly', 'Custom'];

interface GeneratedPost {
    id: number;
    topic: string;
    content: string;
    status: string;
    createdAt: string;
}

export default function GeneratePanel() {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('Professional');
    const [loading, setLoading] = useState(false);
    const [generatedPost, setGeneratedPost] = useState<GeneratedPost | null>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setError('');
        setGeneratedPost(null);
        try {
            const res = await liGeneratePost({ topic, tone });
            setGeneratedPost(res.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate post. Check your OpenAI key.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (generatedPost) {
            navigator.clipboard.writeText(generatedPost.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="li-page">
            <div className="li-page-header">
                <h2>Generate Post</h2>
                <p>Create engaging LinkedIn content powered by AI</p>
            </div>

            <div className="li-generate-grid">
                <div className="li-card">
                    <h3>Post Settings</h3>

                    <div className="li-form-group">
                        <label>Topic</label>
                        <input
                            type="text"
                            className="li-input"
                            placeholder="e.g. AI trends in software development"
                            value={topic}
                            onChange={e => setTopic(e.target.value)}
                        />
                    </div>

                    <div className="li-form-group">
                        <label>Tone</label>
                        <div className="li-tone-grid">
                            {TONES.map(t => (
                                <button
                                    key={t}
                                    className={`li-tone-btn ${tone === t ? 'selected' : ''}`}
                                    onClick={() => setTone(t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <div className="li-error-box">{error}</div>}

                    <button
                        className="li-btn-primary li-btn-generate"
                        onClick={handleGenerate}
                        disabled={loading || !topic.trim()}
                    >
                        {loading ? (
                            <><span className="li-spinner-sm" /> Generating with AI...</>
                        ) : (
                            '⚡ Generate Post'
                        )}
                    </button>
                </div>

                <div className="li-card li-post-preview">
                    <div className="li-preview-header">
                        <h3>Generated Post</h3>
                        {generatedPost && (
                            <button className="li-copy-btn" onClick={handleCopy}>
                                {copied ? '✓ Copied!' : '📋 Copy'}
                            </button>
                        )}
                    </div>

                    {loading && (
                        <div className="li-preview-loading">
                            <div className="li-spinner-lg" />
                            <p>AI is crafting your post...</p>
                        </div>
                    )}

                    {!loading && !generatedPost && (
                        <div className="li-preview-empty">
                            <div className="li-preview-empty-icon">✦</div>
                            <p>Your generated post will appear here</p>
                        </div>
                    )}

                    {generatedPost && !loading && (
                        <>
                            <div className="li-post-card">
                                <div className="li-post-meta">
                                    <span className="li-badge li-badge-draft">Draft</span>
                                    <span className="li-post-topic">#{generatedPost.topic}</span>
                                </div>
                                <div className="li-post-content">
                                    {generatedPost.content.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </div>
                            <div className="li-post-notice">
                                <span>📌</span>
                                <span>Saved as Draft. Go to Posts to view, copy, and manually publish on LinkedIn.</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
