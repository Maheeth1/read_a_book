import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Library from './components/Library';
import Reader from './components/Reader';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/read/:id" element={<Reader />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;