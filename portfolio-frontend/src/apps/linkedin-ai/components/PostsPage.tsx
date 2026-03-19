import { useState, useEffect } from 'react';
import { liGetPosts, liDeletePost } from '../lib/linkedinApi';

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
                                <button className="li-btn-outline" onClick={() => handleCopy(post)}>
                                    {copiedId === post.id ? '✓ Copied!' : '📋 Copy to clipboard'}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
