import { useState } from 'react';
import TripForm from './components/TripForm.tsx';
import TripCard from './components/TripCard.tsx';
import { TripRequest, TripOption } from './types';
import { fetchTrips } from './lib/api';
import { AlertCircle, Train, ChevronLeft, Loader2, Plus, Zap, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LoadingState() {
    return (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
                width: '60px', height: '60px', margin: '0 auto 16px',
                borderRadius: '50%', background: 'rgba(99,102,241,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'pulse 2s ease infinite'
            }}>
                <Train size={28} style={{ color: '#6366f1' }} />
            </div>
            <p style={{ color: '#a5b4fc', fontSize: '14px', fontWeight: 600, margin: 0 }}>Finding the best routes for you...</p>
            <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.7;transform:scale(0.95)} }`}</style>
        </div>
    );
}

export default function TripPlannerApp() {
    const [trips, setTrips] = useState<TripOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [lastParams, setLastParams] = useState<TripRequest | null>(null);
    const [activeCount, setActiveCount] = useState(5);

    const navigate = useNavigate();

    const handleSearch = async (params: TripRequest, isMore = false) => {
        if (isMore) setLoadingMore(true);
        else { setLoading(true); setHasSearched(true); setActiveCount(5); }
        setError(null);
        const requestParams = { ...params, calcNumberOfTrips: isMore ? activeCount + 5 : 5 };
        try {
            const data = await fetchTrips(requestParams);
            setTrips(data);
            setLastParams(params);
            if (isMore) setActiveCount(activeCount + 5);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Something went wrong. Check your inputs and try again.');
            if (!isMore) setTrips([]);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            paddingBottom: '60px',
            position: 'relative',
        }}>
            {/* Decorative gradient blobs */}
            <div style={{
                position: 'fixed', top: '-100px', right: '-100px', width: '500px', height: '500px',
                background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none', zIndex: 0
            }} />
            <div style={{
                position: 'fixed', bottom: '-60px', left: '-80px', width: '400px', height: '400px',
                background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none', zIndex: 0
            }} />

            <div style={{ maxWidth: '780px', margin: '0 auto', padding: '0 16px', position: 'relative', zIndex: 1 }}>

                {/* Back nav */}
                <div style={{ paddingTop: '32px', marginBottom: '40px' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'rgba(165,180,252,0.6)', fontSize: '11px', fontWeight: 700,
                            letterSpacing: '0.15em', textTransform: 'uppercase',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#a5b4fc')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(165,180,252,0.6)')}
                    >
                        <ChevronLeft size={15} /> Back to Portfolio
                    </button>
                </div>

                {/* Hero */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: '100px', padding: '5px 14px', marginBottom: '18px'
                    }}>
                        <Zap size={11} style={{ color: '#818cf8' }} />
                        <span style={{ fontSize: '10px', fontWeight: 800, color: '#818cf8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                            NSW Transport Official Data
                        </span>
                    </div>
                    <h1 style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 900, lineHeight: 1.15, margin: '0 0 12px',
                        background: 'linear-gradient(135deg, #fff 40%, #a5b4fc)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Trip Planner
                    </h1>
                    <p style={{ color: 'rgba(165,180,252,0.6)', fontSize: '14px', fontWeight: 500, margin: 0 }}>
                        Real-time routes across trains, buses, ferries & more
                    </p>
                </div>

                {/* Search Form */}
                <div style={{ marginBottom: '32px' }}>
                    <TripForm onSearch={(p) => handleSearch(p)} loading={loading} />
                </div>

                {/* Results */}
                <div>
                    {loading && <LoadingState />}

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                            borderRadius: '14px', padding: '16px 20px',
                            display: 'flex', alignItems: 'flex-start', gap: '12px'
                        }}>
                            <AlertCircle size={18} style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
                            <div>
                                <p style={{ color: '#fca5a5', fontWeight: 700, fontSize: '13px', margin: '0 0 3px' }}>No results found</p>
                                <p style={{ color: 'rgba(252,165,165,0.7)', fontSize: '12px', margin: 0 }}>{error}</p>
                            </div>
                        </div>
                    )}

                    {!loading && !error && hasSearched && trips.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '56px 0' }}>
                            <div style={{
                                width: '64px', height: '64px', margin: '0 auto 14px',
                                background: 'rgba(99,102,241,0.08)', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Map size={28} style={{ color: 'rgba(165,180,252,0.3)' }} />
                            </div>
                            <p style={{ color: 'rgba(165,180,252,0.5)', fontWeight: 700, fontSize: '14px', margin: '0 0 5px' }}>No services found</p>
                            <p style={{ color: 'rgba(165,180,252,0.35)', fontSize: '12px', margin: 0 }}>Try adjusting your time or route</p>
                        </div>
                    )}

                    {!loading && !error && trips.length > 0 && (
                        <div style={{ animation: 'fadeInUp 0.4s ease' }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                marginBottom: '14px', padding: '0 2px'
                            }}>
                                <span style={{
                                    fontSize: '10px', fontWeight: 800, color: 'rgba(165,180,252,0.5)',
                                    textTransform: 'uppercase', letterSpacing: '0.15em'
                                }}>
                                    {trips.length} routes found
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {trips.map((trip) => (
                                    <TripCard key={trip.id} trip={trip} />
                                ))}
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '28px' }}>
                                <button
                                    onClick={() => lastParams && handleSearch(lastParams, true)}
                                    disabled={loadingMore}
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                                        padding: '11px 24px',
                                        background: 'rgba(99,102,241,0.1)',
                                        border: '1px solid rgba(99,102,241,0.25)',
                                        borderRadius: '12px', color: '#a5b4fc',
                                        fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em',
                                        textTransform: 'uppercase', cursor: 'pointer',
                                        opacity: loadingMore ? 0.6 : 1, transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => !loadingMore && ((e.currentTarget.style.background = 'rgba(99,102,241,0.2)'))}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}
                                >
                                    {loadingMore
                                        ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</>
                                        : <><Plus size={13} /> Load More</>}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer style={{ marginTop: '60px', textAlign: 'center' }}>
                    <p style={{
                        fontSize: '10px', fontWeight: 700, color: 'rgba(165,180,252,0.25)',
                        letterSpacing: '0.2em', textTransform: 'uppercase'
                    }}>
                        Powered by Transport for NSW
                    </p>
                </footer>
            </div>

            <style>{`
                @keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
            `}</style>
        </div>
    );
}
