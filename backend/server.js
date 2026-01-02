const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse'); // Now working correctly!
const connectDB = require('./db');
const Book = require('./models/Book');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// --- ROUTES ---

// 1. Upload Route (The one that was failing)
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        console.log("1. Parsing PDF...");
        const data = await pdf(req.file.buffer);
        
        console.log("2. Text Extracted. Length:", data.text.length);
        
        // Split text into paragraphs
        const paragraphs = data.text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

        const newBook = new Book({
            title: req.file.originalname.replace('.pdf', ''),
            content: paragraphs,
            totalPages: paragraphs.length
        });

        console.log("3. Saving to DB...");
        await newBook.save();
        
        console.log("4. Success!");
        res.json(newBook); // <--- This is crucial. It stops the "Pending" status.

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Failed to process PDF" });
    }
});

// 2. Get All Books
app.get('/api/books', async (req, res) => {
    try {
        const books = await Book.find({}, 'title lastReadIndex totalPages uploadedAt');
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get Single Book
app.get('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        res.json(book);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Update Progress
app.put('/api/books/:id/progress', async (req, res) => {
    try {
        const { index, theme } = req.body;
        await Book.findByIdAndUpdate(req.params.id, { 
            lastReadIndex: index,
            themePreference: theme
        });
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));