import { useState, useRef, useEffect, useCallback } from 'react';
import { TripRequest } from '../types';
import { fetchStops, StopSuggestion } from '../lib/api';
import { MapPin, Clock, Calendar, ArrowDownUp, Search, ArrowRight, Train, Loader2 } from 'lucide-react';

interface Props {
    onSearch: (params: TripRequest) => void;
    loading: boolean;
}

function StopInput({
    id, label, placeholder, icon, value, onChange
}: {
    id: string; label: string; placeholder: string;
    icon: React.ReactNode; value: string;
    onChange: (name: string) => void;
}) {
    const [suggestions, setSuggestions] = useState<StopSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
                setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleInput = useCallback((text: string) => {
        onChange(text);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (text.length < 2) { setSuggestions([]); setIsOpen(false); return; }
        setIsFetching(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await fetchStops(text);
                setSuggestions(results.slice(0, 7));
                setIsOpen(results.length > 0);
            } catch { setSuggestions([]); }
            finally { setIsFetching(false); }
        }, 300);
    }, [onChange]);

    return (
        <div className="relative" ref={wrapperRef}>
            <label htmlFor={id} style={{
                display: 'block', fontSize: '10px', fontWeight: 700,
                color: 'rgba(165,180,252,0.7)', letterSpacing: '0.15em',
                textTransform: 'uppercase', marginBottom: '6px'
            }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <span style={{
                    position: 'absolute', left: '14px', top: '50%',
                    transform: 'translateY(-50%)', color: 'rgba(165,180,252,0.5)',
                    display: 'flex', alignItems: 'center', pointerEvents: 'none'
                }}>{icon}</span>
                <input
                    id={id}
                    type="text"
                    autoComplete="off"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => handleInput(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setIsOpen(true)}
                    required
                    style={{
                        width: '100%',
                        paddingLeft: '44px',
                        paddingRight: isFetching ? '44px' : '14px',
                        paddingTop: '14px',
                        paddingBottom: '14px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '15px',
                        fontWeight: 600,
                        outline: 'none',
                        transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onFocusCapture={e => {
                        (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.6)';
                        (e.target as HTMLInputElement).style.background = 'rgba(99,102,241,0.08)';
                        if (suggestions.length > 0) setIsOpen(true);
                    }}
                    onBlurCapture={e => {
                        (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.2)';
                        (e.target as HTMLInputElement).style.background = 'rgba(255,255,255,0.05)';
                    }}
                />
                {isFetching && (
                    <span style={{
                        position: 'absolute', right: '14px', top: '50%',
                        transform: 'translateY(-50%)', color: '#6366f1',
                        display: 'flex', animation: 'spin 1s linear infinite'
                    }}>
                        <Loader2 size={16} />
                    </span>
                )}
            </div>

            {isOpen && suggestions.length > 0 && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    background: '#1e2340', borderRadius: '12px',
                    border: '1px solid rgba(99,102,241,0.3)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    zIndex: 9999, overflow: 'hidden'
                }}>
                    {suggestions.map((stop) => (
                        <button
                            key={stop.id}
                            type="button"
                            onMouseDown={() => { onChange(stop.name); setSuggestions([]); setIsOpen(false); }}
                            style={{
                                width: '100%', display: 'flex', alignItems: 'center',
                                gap: '10px', padding: '11px 14px', textAlign: 'left',
                                background: 'transparent', border: 'none', cursor: 'pointer',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.15)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                            <Train size={14} style={{ color: '#6366f1', flexShrink: 0 }} />
                            <div>
                                <p style={{ color: '#fff', fontSize: '13px', fontWeight: 600, margin: 0 }}>{stop.name}</p>
                                <p style={{ color: 'rgba(165,180,252,0.5)', fontSize: '10px', margin: 0, fontWeight: 500 }}>Stop #{stop.id}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 14px 14px 44px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '12px', color: '#fff',
    fontSize: '14px', fontWeight: 600, outline: 'none',
};

const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '10px', fontWeight: 700,
    color: 'rgba(165,180,252,0.7)', letterSpacing: '0.15em',
    textTransform: 'uppercase', marginBottom: '6px'
};

const iconWrap: React.CSSProperties = {
    position: 'absolute', left: '14px', top: '50%',
    transform: 'translateY(-50%)', color: 'rgba(165,180,252,0.5)',
    display: 'flex', alignItems: 'center', pointerEvents: 'none'
};

export default function TripForm({ onSearch, loading }: Props) {
    const [params, setParams] = useState<TripRequest>({
        origin: '',
        destination: '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        mode: 'departure',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (params.origin && params.destination) onSearch(params);
    };

    const swapLocations = () => setParams({ ...params, origin: params.destination, destination: params.origin });

    return (
        <form onSubmit={handleSubmit} style={{
            background: 'rgba(21,26,53,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
            {/* Origin / Destination */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'end', marginBottom: '16px' }}>
                <StopInput id="origin" label="From" placeholder="Station or stop..."
                    icon={<MapPin size={16} />} value={params.origin}
                    onChange={(v) => setParams({ ...params, origin: v })} />

                <button type="button" onClick={swapLocations} title="Swap" style={{
                    width: '40px', height: '40px', borderRadius: '50%', marginBottom: '2px',
                    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                    color: '#a5b4fc', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.2s'
                }}
                    onMouseEnter={e => { (e.currentTarget.style.background = 'rgba(99,102,241,0.3)'); }}
                    onMouseLeave={e => { (e.currentTarget.style.background = 'rgba(99,102,241,0.15)'); }}
                >
                    <ArrowDownUp size={16} />
                </button>

                <StopInput id="destination" label="To" placeholder="Where to?"
                    icon={<Search size={16} />} value={params.destination}
                    onChange={(v) => setParams({ ...params, destination: v })} />
            </div>

            {/* Date / Time / Mode */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                    <label style={labelStyle}>Date</label>
                    <div style={{ position: 'relative' }}>
                        <span style={iconWrap}><Calendar size={15} /></span>
                        <input type="date" value={params.date}
                            onChange={(e) => setParams({ ...params, date: e.target.value })}
                            required style={inputStyle} />
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Time</label>
                    <div style={{ position: 'relative' }}>
                        <span style={iconWrap}><Clock size={15} /></span>
                        <input type="time" value={params.time}
                            onChange={(e) => setParams({ ...params, time: e.target.value })}
                            required style={inputStyle} />
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Type</label>
                    <select value={params.mode}
                        onChange={(e) => setParams({ ...params, mode: e.target.value as any })}
                        style={{ ...inputStyle, paddingLeft: '14px', cursor: 'pointer' }}>
                        <option value="departure">Depart at</option>
                        <option value="arrival">Arrive by</option>
                    </select>
                </div>
            </div>

            <button type="submit" disabled={loading || !params.origin || !params.destination} style={{
                width: '100%', padding: '15px',
                background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none', borderRadius: '12px', color: '#fff',
                fontSize: '13px', fontWeight: 800, letterSpacing: '0.12em',
                textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 8px 25px rgba(99,102,241,0.4)'
            }}>
                {loading ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Finding routes...</>
                ) : (
                    <>Search Journeys <ArrowRight size={16} /></>
                )}
            </button>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                input[type="date"]::-webkit-calendar-picker-indicator,
                input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
                select option { background: #1e2340; color: #fff; }
            `}</style>
        </form>
    );
}
