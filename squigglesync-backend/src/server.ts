import express from 'express';
import dotenv from 'dotenv';
import apiRouter from './api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Non-API routes (health, status, etc.)
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

// API routes
app.use('/api', apiRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket API is running on http://localhost:${PORT}/api`);
});