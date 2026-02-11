import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { FaGithub, FaLinkedin, FaEnvelope, FaRobot, FaTimes, FaCommentDots } from 'react-icons/fa';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', content: "Hello there! I'm Naresh's virtual assistant. 👋" }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            if (messages.length === 1 && !isTyping && !showOptions) {
                setTimeout(() => {
                    setIsTyping(true);
                    setTimeout(() => {
                        setMessages(prev => {
                            if (prev.length === 1) { // Prevent duplicate greeting if toggled fast
                                return [...prev, { type: 'bot', content: "I'm here to help you connect with Naresh. Would you like to know more about his work or get in touch directly?" }];
                            }
                            return prev;
                        });
                        setIsTyping(false);
                        setShowOptions(true);
                    }, 1500);
                }, 1000);
            }
        }
    }, [isOpen, messages, isTyping, showOptions]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleOptionClick = (option) => {
        setShowOptions(false);
        setMessages(prev => [...prev, { type: 'user', content: option }]);

        setIsTyping(true);
        setTimeout(() => {
            let response;
            if (option === "Get in touch") {
                response = (
                    <div>
                        Great! Here are the best ways to reach Naresh:
                        <div className="social-links-chat">
                            <a href="https://github.com/Naresh0007?tab=repositories" target="_blank" rel="noopener noreferrer" className="social-icon"><FaGithub /></a>
                            <a href="https://www.linkedin.com/in/naresh-shrestha/" target="_blank" rel="noopener noreferrer" className="social-icon"><FaLinkedin /></a>
                            <a href="mailto:nareshh.shresthaa@gmail.com" className="social-icon"><FaEnvelope /></a>
                        </div>
                    </div>
                );
            } else {
                response = "Naresh specializes in building scalable .NET applications and modern web experiences. Check out the Projects section above!";
            }

            setMessages(prev => [...prev, { type: 'bot', content: response }]);
            setIsTyping(false);

            if (option === "Tell me more about work") {
                setTimeout(() => {
                    setIsTyping(true);
                    setTimeout(() => {
                        setMessages(prev => [...prev, { type: 'bot', content: "If you'd like to collaborate, feel free to connect!" }]);
                        setIsTyping(false);
                        setMessages(prev => [...prev, {
                            type: 'bot', content: (
                                <div>
                                    You can find Naresh here:
                                    <div className="social-links-chat">
                                        <a href="https://github.com/Naresh0007?tab=repositories" target="_blank" rel="noopener noreferrer" className="social-icon"><FaGithub /></a>
                                        <a href="https://www.linkedin.com/in/naresh-shrestha/" target="_blank" rel="noopener noreferrer" className="social-icon"><FaLinkedin /></a>
                                        <a href="mailto:nareshh.shresthaa@gmail.com" className="social-icon"><FaEnvelope /></a>
                                    </div>
                                </div>
                            )
                        }]);
                    }, 1500);
                }, 2000);
            }

        }, 1000);
    };

    return (
        <div className="chatbot-wrapper">
            {isOpen && (
                <div className="chatbot-container">
                    <div className="chatbot-header">
                        <div className="header-left">
                            <div className="bot-avatar">
                                <FaRobot />
                            </div>
                            <div className="bot-info">
                                <h4>AI Assistant</h4>
                                <span className="bot-status">Online</span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={toggleChat}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.type}`}>
                                {msg.content}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        )}

                        {showOptions && (
                            <div className="chat-options">
                                <button className="option-btn" onClick={() => handleOptionClick("Tell me more about work")}>Tell me more about work</button>
                                <button className="option-btn" onClick={() => handleOptionClick("Get in touch")}>Get in touch</button>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}


            <button className={`chatbot-toggle-btn ${isOpen ? 'open' : ''}`} onClick={toggleChat}>
                {isOpen ? <FaTimes /> : (
                    <div className="chatbot-character">
                        <svg viewBox="0 0 100 100" width="75" height="75" className="character-svg">
                            {/* Legs */}
                            <path d="M 40 85 L 36 98" stroke="#333" strokeWidth="7" strokeLinecap="round" />
                            <path d="M 60 85 L 64 98" stroke="#333" strokeWidth="7" strokeLinecap="round" />

                            {/* Shoes (with laces) */}
                            <ellipse cx="34" cy="98" rx="7" ry="3.5" fill="#333" />
                            <path d="M 32 96 L 36 96" stroke="#fff" strokeWidth="1" />
                            <ellipse cx="66" cy="98" rx="7" ry="3.5" fill="#333" />
                            <path d="M 64 96 L 68 96" stroke="#fff" strokeWidth="1" />

                            {/* Hoodie Body */}
                            <rect x="30" y="55" width="40" height="32" rx="10" fill="#667eea" />
                            {/* Hoodie Pocket */}
                            <path d="M 40 80 Q 50 85 60 80 L 60 87 L 40 87 Z" fill="rgba(0,0,0,0.1)" />
                            {/* Hoodie Graphic (Atom/React-like) */}
                            <circle cx="50" cy="68" r="2" fill="rgba(255,255,255,0.8)" />
                            <ellipse cx="50" cy="68" rx="6" ry="2" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" fill="none" transform="rotate(45 50 68)" />
                            <ellipse cx="50" cy="68" rx="6" ry="2" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" fill="none" transform="rotate(-45 50 68)" />

                            {/* Hoodie Strings */}
                            <path d="M 42 55 L 42 70" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="42" cy="72" r="1.5" fill="#fff" />
                            <path d="M 58 55 L 58 70" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="58" cy="72" r="1.5" fill="#fff" />

                            {/* Right Arm (Holding Tablet) */}
                            <path d="M 70 60 Q 80 65 75 75" stroke="#333" strokeWidth="7" strokeLinecap="round" fill="none" />
                            {/* Tablet */}
                            <rect x="70" y="65" width="16" height="20" rx="2" fill="#333" transform="rotate(-15 78 75)" />
                            <rect x="72" y="67" width="12" height="14" rx="1" fill="#4ade80" transform="rotate(-15 78 75)" />
                            {/* Tablet Screen Content */}
                            <path d="M 74 70 L 82 70 M 74 73 L 80 73 M 74 76 L 78 76" stroke="rgba(0,0,0,0.5)" strokeWidth="1" transform="rotate(-15 78 75)" />
                            <circle cx="75" cy="75" r="5" fill="#FFD700" stroke="#E6C200" strokeWidth="1" /> {/* Hand holding it */}

                            {/* Left Arm (Waving) */}
                            <g className="waving-hand-icon">
                                <path d="M 30 62 Q 15 65 15 48" stroke="#333" strokeWidth="7" strokeLinecap="round" fill="none" />
                                {/* Hand with Fingers */}
                                <circle cx="15" cy="48" r="6" fill="#FFD700" stroke="#E6C200" strokeWidth="1" />
                                <path d="M 12 44 L 10 40" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M 15 42 L 15 38" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M 18 44 L 20 40" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round" />
                            </g>

                            {/* Head */}
                            <circle cx="50" cy="40" r="22" fill="#FFD700" stroke="#E6C200" strokeWidth="2" />

                            {/* Hair (Integrated Hairstyle) */}
                            {/* Masking the top of the head or drawing over it */}
                            <path d="M 28 40 C 28 30 35 15 50 15 C 65 15 72 30 72 40 C 72 42 70 42 70 40 C 70 30 65 20 50 20 C 35 20 30 30 30 40 C 30 42 28 42 28 40 Z" fill="#333" />
                            {/* Spikes on top */}
                            <path d="M 35 22 L 40 12 L 45 20 L 50 10 L 55 20 L 60 12 L 65 22" fill="none" stroke="#333" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Headphones Band */}
                            <path d="M 26 40 C 26 25 74 25 74 40" stroke="#333" strokeWidth="4" fill="none" />
                            {/* Headphone Cups (Detailed) */}
                            <rect x="22" y="32" width="6" height="16" rx="2" fill="#333" />
                            <path d="M 24 34 L 24 46" stroke="#444" strokeWidth="1" />
                            <rect x="72" y="32" width="6" height="16" rx="2" fill="#333" />
                            <path d="M 74 34 L 74 46" stroke="#444" strokeWidth="1" />

                            {/* Glasses */}
                            <circle cx="43" cy="38" r="6" stroke="#333" strokeWidth="2" fill="rgba(255,255,255,0.4)" />
                            <circle cx="57" cy="38" r="6" stroke="#333" strokeWidth="2" fill="rgba(255,255,255,0.4)" />
                            <line x1="49" y1="38" x2="51" y2="38" stroke="#333" strokeWidth="2" />

                            {/* Eyes (in glasses) */}
                            <circle cx="43" cy="38" r="2" fill="#333" />
                            <circle cx="57" cy="38" r="2" fill="#333" />

                            {/* Blush */}
                            <circle cx="36" cy="48" r="2.5" fill="#ffaaa5" opacity="0.6" />
                            <circle cx="64" cy="48" r="2.5" fill="#ffaaa5" opacity="0.6" />

                            {/* Nose */}
                            <path d="M 50 42 L 48 44 L 50 44" fill="none" stroke="#E6C200" strokeWidth="1.5" strokeLinecap="round" />

                            {/* Smile */}
                            <path d="M 45 50 Q 50 54 55 50" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
                        </svg>
                    </div>
                )}
            </button>
        </div>
    );
};

export default Chatbot;
