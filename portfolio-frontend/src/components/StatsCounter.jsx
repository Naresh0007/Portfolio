import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
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
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [hasAnimated]);

    const animateValue = (start, end, duration, callback) => {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            callback(Math.floor(current));
        }, 16);
    };

    const StatCard = ({ stat, index }) => {
        const [displayValue, setDisplayValue] = useState('0');

        useEffect(() => {
            if (hasAnimated) {
                const numericValue = parseInt(stat.metricValue.replace(/\D/g, ''));
                const suffix = stat.metricValue.replace(/[\d.]/g, '');

                if (!isNaN(numericValue)) {
                    setTimeout(() => {
                        animateValue(0, numericValue, 2000, (val) => {
                            setDisplayValue(val + suffix);
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
        return null;
    }

    return (
        <section ref={sectionRef} className="stats-section">
            <div className="container">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <StatCard key={stat.id} stat={stat} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsCounter;
