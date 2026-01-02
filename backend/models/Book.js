const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: String,
    content: [String], // Array of paragraphs
    totalPages: Number, // Total paragraphs/blocks
    lastReadIndex: { type: Number, default: 0 }, // The bookmark
    themePreference: { type: String, default: 'light' }, // User's last theme
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', BookSchema);