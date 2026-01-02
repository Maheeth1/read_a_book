import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Library = () => {
    const [books, setBooks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        const res = await axios.get('http://localhost:5000/api/books');
        setBooks(res.data);
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        await axios.post('http://localhost:5000/api/upload', formData);
        fetchBooks(); // Refresh list
    };

    return (
        <div className="theme-light" style={{minHeight: '100vh'}}>
            <div style={{padding: '20px', borderBottom: '1px solid #ccc'}}>
                <h1>My Library</h1>
                <input type="file" accept=".pdf" onChange={handleUpload} />
            </div>
            
            <div className="library-grid">
                {books.map(book => (
                    <div key={book._id} className="book-card" onClick={() => navigate(`/read/${book._id}`)}>
                        <h3>{book.title}</h3>
                        <p>{Math.round((book.lastReadIndex / book.totalPages) * 100)}% Read</p>
                        <div className="progress-bar-bg">
                            <div 
                                className="progress-bar-fill" 
                                style={{width: `${(book.lastReadIndex / book.totalPages) * 100}%`}}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Library;