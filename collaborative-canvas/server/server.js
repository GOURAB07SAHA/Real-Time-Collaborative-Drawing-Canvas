const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, '../client')));

const drawingState = require('./drawing-state');

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);
    });

    socket.on('request-drawing', () => {
        socket.emit('drawing', drawingState.getDrawing());
    });

    socket.on('drawing', (data) => {
        drawingState.addAction(data);
        socket.broadcast.emit('drawing', [data]);
    });

    socket.on('cursor', (data) => {
        socket.broadcast.emit('cursor', { ...data, id: socket.id });
    });

    socket.on('undo', () => {
        if (drawingState.undo()) {
            io.emit('drawing', drawingState.getDrawing());
        }
    });

    socket.on('redo', () => {
        if (drawingState.redo()) {
            io.emit('drawing', drawingState.getDrawing());
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        socket.broadcast.emit('user-disconnected', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});