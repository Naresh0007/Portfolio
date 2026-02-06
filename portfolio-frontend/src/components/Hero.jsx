import { useState, useEffect } from 'react';
import './Hero.css';

const Hero = () => {
    const [displayText, setDisplayText] = useState('');
    const roles = ['Software Engineer', '.NET Developer', 'Full-Stack Developer', 'Test Automation Expert'];
    const [roleIndex, setRoleIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentRole = roles[roleIndex];
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (charIndex < currentRole.length) {
                    setDisplayText(currentRole.substring(0, charIndex + 1));
                    setCharIndex(charIndex + 1);
                } else {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                if (charIndex > 0) {
                    setDisplayText(currentRole.substring(0, charIndex - 1));
                    setCharIndex(charIndex - 1);
                } else {
                    setIsDeleting(false);
                    setRoleIndex((roleIndex + 1) % roles.length);
                }
            }
        }, isDeleting ? 50 : 100);

        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, roleIndex]);

    const scrollToSection = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="hero">
            <div className="hero-content fade-in">
                <div className="hero-greeting-container">
                    {"Hello there".split("").map((char, i) => (
                        <span key={i} className="hero-greeting-char" style={{ animationDelay: `${i * 0.05}s` }}>
                            {char === " " ? "\u00A0" : char}
                        </span>
                    ))}
                    <span className="hero-greeting-comma">,</span>
                    <span className="hero-greeting-subtext"> I'm</span>
                </div>
                <h1 className="hero-name gradient-text">Naresh Shrestha</h1>
                <div className="hero-role">
                    <span className="role-text">{displayText}</span>
                    <span className="cursor">|</span>
                </div>
                <p className="hero-description">
                    Passionate software engineer specializing in .NET backend development,
                    EDI systems, and test automation. Building robust, scalable solutions
                    for enterprise applications.
                </p>
                <div className="hero-buttons">
                    <button className="btn btn-primary" onClick={() => scrollToSection('experience')}>
                        View My Work
                    </button>
                    <button className="btn btn-outline" onClick={() => scrollToSection('contact')}>
                        Get In Touch
                    </button>
                </div>
            </div>
            <div className="hero-particles">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="particle" style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${5 + Math.random() * 10}s`
                    }} />
                ))}
            </div>
        </section>
    );
};

export default Hero;
