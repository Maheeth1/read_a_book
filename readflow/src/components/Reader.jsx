import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash'; // Install lodash for throttling: npm install lodash
import { API_URL } from '../config';

const Reader = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [book, setBook] = useState(null);
    const [settings, setSettings] = useState({ fontSize: 18, theme: 'light' });
    const readerRef = useRef(null);
    
    // Fetch Book Data
    useEffect(() => {
        const loadBook = async () => {
            const res = await axios.get(`API_URL/api/books/${id}`);
            setBook(res.data);
            setSettings(prev => ({ ...prev, theme: res.data.themePreference || 'light' }));
            
            // Wait for render then scroll to bookmark
            setTimeout(() => {
                const bookmarkEl = document.getElementById(`para-${res.data.lastReadIndex}`);
                if (bookmarkEl) bookmarkEl.scrollIntoView({ block: 'center' });
            }, 500);
        };
        loadBook();
    }, [id]);

    // Save Progress (Throttled to run once every 1 sec)
    // We send the Index of the paragraph currently at the top of the viewport
    const saveProgress = useCallback(_.throttle(async (index) => {
        await axios.put(`API_URL/api/books/${id}/progress`, {
            index: index,
            theme: settings.theme
        });
    }, 1000), [id, settings.theme]);

    // Handle Scroll & Intersection
    const handleScroll = (e) => {
        // Simple logic: Find the first paragraph closest to the top
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

    if (!book) return <div>Loading...</div>;

    return (
        <div className={`app-container theme-${settings.theme}`}>
            {/* Top Control Bar */}
            <div className="controls">
                <button className="btn" onClick={() => navigate('/')}>← Library</button>
                <span>{book.title}</span>
                <div>
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
                {book.content.map((text, idx) => (
                    <p key={idx} id={`para-${idx}`} className="paragraph">
                        {text}
                    </p>
                ))}
                
                <div style={{height: '50vh'}}></div> {/* Padding at bottom */}
            </div>
        </div>
    );
};

export default Reader;