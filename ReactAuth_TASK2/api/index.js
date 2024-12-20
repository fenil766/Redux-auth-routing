import dotenv from 'dotenv';
dotenv.config();

console.log('MONGO URI:', process.env.MONGO); // Debug log
console.log('JWT SECRET:', process.env.JWT_SECRET); // Debug log

import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import path from 'path';

const MONGO_URI = process.env.MONGO || "mongodb://localhost:27017/MERNauth";
const PORT = process.env.PORT || 4000;

if (!MONGO_URI) {
  console.error('Error: MONGO URI is not set in .env');
  process.exit(1);
}

// MongoDB Connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

const app = express();
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/user', userRoutes);
app.use('/api/auth', authRoutes);

// Serve static files and fallback route
app.use(express.static(path.join(path.resolve(), '/client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'client', 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, message, statusCode });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
