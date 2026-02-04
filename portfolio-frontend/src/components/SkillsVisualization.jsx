import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './SkillsVisualization.css';

const SkillsVisualization = () => {
    const [skillsData, setSkillsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const data = await api.getSkills();
                setSkillsData(data);
            } catch (error) {
                console.error('Error fetching skills:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSkills();
    }, []);

    if (loading) {
        return (
            <section id="skills" className="skills-section">
                <div className="container">
                    <h2 className="text-center gradient-text mb-5">Skills</h2>
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="skills" className="skills-section">
            <div className="container">
                <h2 className="text-center gradient-text mb-5">Technical Skills</h2>

                <div className="skills-grid">
                    {skillsData.map((category, catIndex) => (
                        <div
                            key={catIndex}
                            className="skill-category glass-card fade-in"
                            style={{ animationDelay: `${catIndex * 0.1}s` }}
                        >
                            <h3 className="category-title">{category.category}</h3>
                            <div className="skills-list">
                                {category.skills.map((skill, skillIndex) => (
                                    <div key={skill.id} className="skill-item">
                                        <div className="skill-header">
                                            <span className="skill-name">{skill.name}</span>
                                            <span className="skill-level">{skill.proficiencyLevel}%</span>
                                        </div>
                                        <div className="skill-bar-container">
                                            <div
                                                className="skill-bar"
                                                style={{
                                                    width: `${skill.proficiencyLevel}%`,
                                                    animationDelay: `${(catIndex * 0.1) + (skillIndex * 0.05)}s`
                                                }}
                                            ></div>
                                        </div>
                                        <div className="skill-experience">
                                            {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'} experience
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SkillsVisualization;
