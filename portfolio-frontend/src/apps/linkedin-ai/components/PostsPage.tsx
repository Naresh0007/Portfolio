import { useState, useEffect } from 'react';
import { liGetPosts, liDeletePost, liPublishPost } from '../lib/linkedinApi';

interface Post {
    id: number;
    topic: string;
    content: string;
    status: string;
    createdAt: string;
}

export default function PostsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [publishingId, setPublishingId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await liGetPosts();
            setPosts(res.data);
        } catch {}
        finally { setLoading(false); }
    };

    const handlePublish = async (id: number) => {
        if (!confirm('Publish this post directly to your LinkedIn profile?')) return;
        setPublishingId(id);
        try {
            await liPublishPost(id);
            setPosts(ps => ps.map(p => p.id === id ? { ...p, status: 'Posted' } : p));
            alert('Successfully published to LinkedIn!');
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to publish.');
        } finally {
            setPublishingId(null);
        }
    };

    const handleCopy = (post: Post) => {
        navigator.clipboard.writeText(post.content);
        setCopiedId(post.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this post?')) return;
        await liDeletePost(id);
        setPosts(ps => ps.filter(p => p.id !== id));
    };

    const statusColor = (s: string) => {
        if (s === 'Draft') return 'li-badge-draft';
        if (s === 'Scheduled') return 'li-badge-scheduled';
        if (s === 'Posted') return 'li-badge-posted';
        return 'li-badge-posted';
    };

    return (
        <div className="li-page">
            <div className="li-page-header">
                <h2>Your Posts</h2>
                <p>All AI-generated LinkedIn posts — copy and publish manually</p>
            </div>

            {loading && (
                <div className="li-preview-loading"><div className="li-spinner-lg" /></div>
            )}

            {!loading && posts.length === 0 && (
                <div className="li-empty-state">
                    <div className="li-preview-empty-icon">📋</div>
                    <h3>No posts yet</h3>
                    <p>Go to Dashboard and generate your first LinkedIn post!</p>
                </div>
            )}

            <div className="li-posts-list">
                {posts.map(post => (
                    <div key={post.id} className="li-card li-post-item">
                        <div className="li-post-item-header">
                            <div className="li-post-item-meta">
                                <span className={`li-badge ${statusColor(post.status)}`}>{post.status}</span>
                                <span className="li-post-topic-label">
                                    {post.topic}
                                </span>
                                <span className="li-post-date">
                                    {new Date(post.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="li-post-item-actions">
                                <button
                                    className="li-icon-btn"
                                    onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                                    title="View"
                                >
                                    {expandedId === post.id ? '▲' : '▼'}
                                </button>
                                <button
                                    className="li-icon-btn li-copy-icon"
                                    onClick={() => handleCopy(post)}
                                    title="Copy to clipboard"
                                >
                                    {copiedId === post.id ? '✓' : '📋'}
                                </button>
                                <button
                                    className="li-icon-btn li-delete-icon"
                                    onClick={() => handleDelete(post.id)}
                                    title="Delete"
                                >
                                    🗑
                                </button>
                            </div>
                        </div>

                        {expandedId === post.id && (
                            <div className="li-post-item-body">
                                {post.content.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                    <button className="li-btn-primary" 
                                            onClick={() => handlePublish(post.id)} 
                                            disabled={post.status !== 'Draft' || publishingId === post.id}
                                            style={{ width: 'auto' }}>
                                        {publishingId === post.id ? 'Publishing...' : post.status === 'Posted' ? '✓ Published' : '🚀 Publish to LinkedIn'}
                                    </button>
                                    <button className="li-btn-outline" onClick={() => handleCopy(post)} style={{ width: 'auto' }}>
                                        {copiedId === post.id ? '✓ Copied!' : '📋 Copy Text'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
