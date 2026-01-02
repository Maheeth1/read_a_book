import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config'; // Ensure you have this
import _ from 'lodash'; 

const Reader = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [book, setBook] = useState(null);
    const [settings, setSettings] = useState({ fontSize: 18, theme: 'light' });
    const [showControls, setShowControls] = useState(true); // <--- NEW STATE
    
    const readerRef = useRef(null);
    const lastScrollY = useRef(0); // <--- To track scroll direction

    // Fetch Book Data
    useEffect(() => {
        const loadBook = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/books/${id}`);
                setBook(res.data);
                setSettings(prev => ({ ...prev, theme: res.data.themePreference || 'light' }));
                
                // Scroll to bookmark
                setTimeout(() => {
                    const bookmarkEl = document.getElementById(`para-${res.data.lastReadIndex}`);
                    if (bookmarkEl) bookmarkEl.scrollIntoView({ block: 'center' });
                }, 500);
            } catch (err) {
                console.error("Error loading book:", err);
            }
        };
        loadBook();
    }, [id]);

    const saveProgress = useCallback(_.throttle(async (index) => {
        await axios.put(`${API_URL}/api/books/${id}/progress`, {
            index: index,
            theme: settings.theme
        });
    }, 1000), [id, settings.theme]);

    // --- NEW SCROLL HANDLER ---
    const handleScroll = () => {
        const container = readerRef.current;
        if (!container) return;

        const currentScrollY = container.scrollTop;

        // 1. Logic to Hide/Show Menu
        // If scrolling DOWN and we moved more than 10px -> Hide
        if (currentScrollY > lastScrollY.current + 10) {
            setShowControls(false);
        } 
        // If scrolling UP -> Show
        else if (currentScrollY < lastScrollY.current - 10) {
            setShowControls(true);
        }
        
        lastScrollY.current = currentScrollY; // Update position

        // 2. Logic to Save Progress (Existing logic)
        const paragraphs = document.querySelectorAll('.paragraph');
        let currentIdx = 0;
        for (let i = 0; i < paragraphs.length; i++) {
            const rect = paragraphs[i].getBoundingClientRect();
            if (rect.top >= 0 && rect.top < window.innerHeight / 2) {
                currentIdx = i;
                break;
            }
        }
        saveProgress(currentIdx);
    };

    if (!book) return <div style={{padding:'20px'}}>Loading...</div>;

    return (
        <div className={`app-container theme-${settings.theme}`}>
            {/* Controls Bar with Dynamic Class */}
            <div className={`controls ${showControls ? 'visible' : 'hidden'}`}>
                <button className="btn" onClick={() => navigate('/')}>←</button>
                
                {/* Title Truncated for Mobile */}
                <span className="book-title">{book.title}</span>
                
                <div style={{display:'flex', gap:'5px'}}>
                    <button className="btn" onClick={() => setSettings({...settings, fontSize: settings.fontSize - 2})}>A-</button>
                    <button className="btn" onClick={() => setSettings({...settings, fontSize: settings.fontSize + 2})}>A+</button>
                    <select className="btn" onChange={(e) => setSettings({...settings, theme: e.target.value})} value={settings.theme}>
                        <option value="light">Light</option>
                        <option value="sepia">Sepia</option>
                        <option value="dark">Dark</option>
                    </select>
                </div>
            </div>

            {/* Reading Area */}
            <div 
                className="reader-container" 
                ref={readerRef}
                onScroll={handleScroll}
                style={{ fontSize: `${settings.fontSize}px` }}
            >
                {/* Spacer to prevent text from hiding behind header on load */}
                <div style={{height: '60px'}}></div> 

                {book.content.map((text, idx) => (
                    <p key={idx} id={`para-${idx}`} className="paragraph">
                        {text}
                    </p>
                ))}
                
                <div style={{height: '50vh'}}></div>
            </div>
        </div>
    );
};

export default Reader;