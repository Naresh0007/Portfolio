import { useState, useEffect } from 'react';
import { api } from '../services/api';
import LoadingSpinner from './common/LoadingSpinner';
import './ExperienceTimeline.css';

const ExperienceTimeline = () => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchExperiences = async () => {
            try {
                const data = await api.getExperiences();
                setExperiences(data);
            } catch (error) {
                console.error('Error fetching experiences:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExperiences();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) {
        return (
            <section id="experience" className="experience-section">
                <div className="container">
                    <h2 className="text-center gradient-text mb-5">Experience</h2>
                    <LoadingSpinner message="Fetching Experiences..." />
                </div>
            </section>
        );
    }

    return (
        <section id="experience" className="experience-section">
            <div className="container">
                <h2 className="text-center gradient-text mb-5">Professional Experience</h2>
                <div className="timeline">
                    {experiences.map((exp, index) => (
                        <div
                            key={exp.id}
                            className={`timeline-item fade-in`}
                            style={{ animationDelay: `${index * 0.2}s` }}
                        >
                            <div className="timeline-marker">
                                {exp.isCurrentRole && <div className="pulse-ring"></div>}
                                <div className="timeline-dot"></div>
                            </div>
                            <div
                                className={`timeline-content glass-card ${expandedId === exp.id ? 'expanded' : ''}`}
                                onClick={() => toggleExpand(exp.id)}
                            >
                                <div className="timeline-header">
                                    <div>
                                        <h3>{exp.role}</h3>
                                        <div className="company-name">{exp.company}</div>
                                    </div>
                                    <div className="timeline-meta">
                                        <div className="timeline-date">
                                            {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                        </div>
                                        <div className="timeline-location">{exp.location}</div>
                                    </div>
                                </div>

                                <p className="timeline-description">{exp.description}</p>

                                {expandedId === exp.id && (
                                    <div className="timeline-details">
                                        <h4>Key Responsibilities</h4>
                                        <ul className="responsibilities-list">
                                            {exp.responsibilities.map((resp, idx) => (
                                                <li key={idx}>{resp}</li>
                                            ))}
                                        </ul>

                                        <div className="tech-stack">
                                            <h4>Technologies</h4>
                                            <div className="tech-tags">
                                                {exp.technologies.map((tech, idx) => (
                                                    <span key={idx} className="tech-tag">{tech}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button className="expand-btn">
                                    {expandedId === exp.id ? 'Show Less' : 'Show More'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ExperienceTimeline;
