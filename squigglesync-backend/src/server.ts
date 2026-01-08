import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import apiRouter from './api';
import { RoomStateService } from './services/room-state.service';
import { WebSocketRoomsService } from './services/websocket-rooms.service';
import { WebSocketHandler } from './handlers/websocket.handler';

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

// create HTTP server
const server = createServer(app);
// create WebSocket server
const wss = new WebSocketServer({ server });

// create room state service
const roomStateService = new RoomStateService();
const websocketRoomsService = new WebSocketRoomsService();
const websocketHandler = new WebSocketHandler(roomStateService, websocketRoomsService);

// handle WebSocket connections
wss.on('connection', (socket) => {
    websocketHandler.handleConnection(socket);
});

server.listen(PORT, () => {
    console.log(`🚀 HTTP server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server running on ws://localhost:${PORT}`);
    console.log(`📋 API endpoints: http://localhost:${PORT}/api`);
});