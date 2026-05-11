const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Initialize the Express app
const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse incoming JSON data
app.use(express.static(path.join(__dirname, '../client'))); // Serve frontend static files

// --- ROUTE CONFIGURATIONS ---
const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/songs');
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);


// Database Connection`
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// A simple test route to ensure the server is running
app.get('/api/status', (req, res) => {
  res.json({ message: 'ChordBook API is running smoothly!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});