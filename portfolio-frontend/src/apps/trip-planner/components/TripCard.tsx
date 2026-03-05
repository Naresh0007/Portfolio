import { useState } from 'react';
import { TripOption } from '../types';
import Timeline from './Timeline.tsx';
import { ChevronDown, ChevronUp, ArrowRight, Clock, Footprints } from 'lucide-react';

interface Props {
    trip: TripOption;
}

export default function TripCard({ trip }: Props) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedLegIndex, setExpandedLegIndex] = useState<number | null>(null);

    const formatTime = (timeStr: string) => {
        try { return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
        catch { return '–'; }
    };

    const isDirect = trip.transfers <= 0;

    return (
        <div style={{
            background: 'rgba(21,26,53,0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99,102,241,0.15)',
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
        }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.35)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.15)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
        >
            {/* Summary row */}
            <div style={{ padding: '18px 20px' }} onClick={() => setIsExpanded(!isExpanded)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    {/* Times */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
                            {formatTime(trip.departureTime)}
                        </span>
                        <ArrowRight size={16} style={{ color: 'rgba(165,180,252,0.4)' }} />
                        <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
                            {formatTime(trip.arrivalTime)}
                        </span>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            color: 'rgba(165,180,252,0.6)', fontSize: '12px', fontWeight: 600, marginLeft: '4px'
                        }}>
                            <Clock size={12} />{trip.totalDuration} min
                        </div>
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                            fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em',
                            textTransform: 'uppercase', padding: '4px 10px', borderRadius: '100px',
                            background: isDirect ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                            color: isDirect ? '#34d399' : '#fbbf24',
                            border: isDirect ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(251,191,36,0.25)'
                        }}>
                            {isDirect ? 'Direct' : `${trip.transfers} transfer${trip.transfers > 1 ? 's' : ''}`}
                        </span>
                        {isExpanded
                            ? <ChevronUp size={16} style={{ color: 'rgba(165,180,252,0.5)' }} />
                            : <ChevronDown size={16} style={{ color: 'rgba(165,180,252,0.5)' }} />
                        }
                    </div>
                </div>

                {/* Transport pills */}
                <div style={{ marginTop: '12px' }}>
                    <Timeline legs={trip.legs} />
                </div>
            </div>

            {/* Expanded leg detail */}
            {isExpanded && (
                <div style={{
                    borderTop: '1px solid rgba(99,102,241,0.12)',
                    background: 'rgba(10,14,39,0.4)',
                    padding: '16px 20px'
                }}>
                    {trip.legs.map((leg, i) => (
                        <div key={i}>
                            {/* Boarding */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, marginTop: '3px' }}>
                                    <div style={{
                                        width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                                        background: leg.mode === 'Walk' ? 'rgba(165,180,252,0.3)' : '#6366f1',
                                        border: `2px solid ${leg.mode === 'Walk' ? 'rgba(165,180,252,0.3)' : '#6366f1'}`
                                    }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700, margin: 0 }}>{leg.origin}</p>
                                        <p style={{ color: 'rgba(165,180,252,0.5)', fontSize: '10px', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Board</p>
                                    </div>
                                    <span style={{
                                        fontSize: '12px', fontWeight: 800, color: '#a5b4fc',
                                        background: 'rgba(99,102,241,0.12)', padding: '3px 9px',
                                        borderRadius: '8px', flexShrink: 0, marginLeft: '12px'
                                    }}>{formatTime(leg.departureTime)}</span>
                                </div>
                            </div>

                            {/* Journey line */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                <div style={{
                                    width: '1px', minHeight: '36px', marginLeft: '4px',
                                    background: leg.mode === 'Walk'
                                        ? 'repeating-linear-gradient(180deg, rgba(165,180,252,0.2) 0, rgba(165,180,252,0.2) 4px, transparent 4px, transparent 8px)'
                                        : 'rgba(99,102,241,0.3)',
                                    flexShrink: 0,
                                }} />
                                <div style={{ flex: 1, padding: '4px 0 8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        {leg.mode === 'Walk' ? (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: '5px',
                                                background: 'rgba(255,255,255,0.05)', color: 'rgba(165,180,252,0.6)',
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700
                                            }}>
                                                <Footprints size={11} /> Walk · {leg.duration} min
                                            </div>
                                        ) : (
                                            <>
                                                <span style={{
                                                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                                    color: '#fff', fontSize: '11px', fontWeight: 800,
                                                    padding: '4px 12px', borderRadius: '20px',
                                                    boxShadow: '0 2px 8px rgba(99,102,241,0.4)'
                                                }}>{leg.line || leg.mode}</span>
                                                <span style={{ color: 'rgba(165,180,252,0.5)', fontSize: '11px', fontWeight: 600 }}>
                                                    {leg.duration} min · {leg.stops?.length || 0} stops
                                                </span>
                                            </>
                                        )}
                                        {leg.stops && leg.stops.length > 0 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setExpandedLegIndex(expandedLegIndex === i ? null : i); }}
                                                style={{
                                                    marginLeft: 'auto', background: 'none', border: 'none',
                                                    color: '#818cf8', fontSize: '10px', fontWeight: 700,
                                                    letterSpacing: '0.08em', textTransform: 'uppercase',
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px'
                                                }}
                                            >
                                                {expandedLegIndex === i ? 'Hide' : 'Stops'} {expandedLegIndex === i ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                            </button>
                                        )}
                                    </div>

                                    {expandedLegIndex === i && leg.stops && (
                                        <div style={{ marginTop: '8px', paddingLeft: '8px', borderLeft: '2px dashed rgba(99,102,241,0.2)' }}>
                                            {leg.stops.map((stop, si) => (
                                                <div key={si} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '5px 0', fontSize: '11px'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'rgba(165,180,252,0.7)' }}>
                                                        <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(165,180,252,0.4)', flexShrink: 0 }} />
                                                        {stop.name}
                                                    </div>
                                                    <span style={{ color: 'rgba(165,180,252,0.5)', fontWeight: 600 }}>{formatTime(stop.time)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Alighting / Transfer */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0' }}>
                                <div style={{
                                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, marginTop: '3px',
                                    background: i < trip.legs.length - 1 ? '#fbbf24' : '#6366f1',
                                    border: `2px solid ${i < trip.legs.length - 1 ? '#fbbf24' : '#6366f1'}`
                                }} />
                                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700, margin: 0 }}>{leg.destination}</p>
                                        <p style={{
                                            fontSize: '10px', margin: '2px 0 0', textTransform: 'uppercase',
                                            letterSpacing: '0.08em', fontWeight: 700,
                                            color: i < trip.legs.length - 1 ? '#fbbf24' : 'rgba(165,180,252,0.5)'
                                        }}>
                                            {i < trip.legs.length - 1 ? 'Transfer' : 'Arrive'}
                                        </p>
                                    </div>
                                    <span style={{
                                        fontSize: '12px', fontWeight: 800, color: '#a5b4fc',
                                        background: 'rgba(99,102,241,0.12)', padding: '3px 9px',
                                        borderRadius: '8px', flexShrink: 0, marginLeft: '12px'
                                    }}>{formatTime(leg.arrivalTime)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
