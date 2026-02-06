import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import './StatsCounter.css';

const StatsCounter = () => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasAnimated, setHasAnimated] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getStats();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        // Only attach observer when not loading
        if (loading || !sectionRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(sectionRef.current);

        return () => observer.disconnect();
    }, [loading, hasAnimated]); // Re-attach when loading state changes

    const animateValue = (start, end, duration, callback) => {
        const startTime = performance.now();
        const range = end - start;

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quad
            const easeProgress = progress * (2 - progress);
            const current = start + range * easeProgress;

            callback(current);

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    };

    const StatCard = ({ stat, index }) => {
        const [displayValue, setDisplayValue] = useState('0');

        useEffect(() => {
            if (hasAnimated && stat.metricValue) {
                // Handle decimals correctly (e.g., "2.5+")
                const numericString = stat.metricValue.match(/[\d.]+/)?.[0] || "0";
                const targetValue = parseFloat(numericString);
                const suffix = stat.metricValue.split(numericString)[1] || "";
                const isDecimal = numericString.includes('.');

                if (!isNaN(targetValue)) {
                    setTimeout(() => {
                        animateValue(0, targetValue, 2000, (val) => {
                            const formatted = isDecimal ? val.toFixed(1) : Math.floor(val);
                            setDisplayValue(formatted + suffix);
                        });
                    }, index * 100);
                } else {
                    setDisplayValue(stat.metricValue);
                }
            }
        }, [hasAnimated, stat, index]);

        return (
            <div
                className="stat-card glass-card fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
            >
                <div className="stat-value gradient-text">{displayValue}</div>
                <div className="stat-label">{stat.metricName}</div>
            </div>
        );
    };

    if (loading) {
        return (
            <section className="stats-section">
                <div className="container">
                    <LoadingSpinner message="Fetching Stats..." />
                </div>
            </section>
        );
    }

    return (
        <section ref={sectionRef} className="stats-section">
            <div className="container">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <StatCard key={stat.id || index} stat={stat} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsCounter;
