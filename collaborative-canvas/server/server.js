// server/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { DrawingState } = require('./drawing-state');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Use port 3002 to avoid the "address in use" error
const port = process.env.PORT || 3002;
const drawingState = new DrawingState();

// --- NEW FUNCTION ---
// This function gets the current user count and sends it to ALL clients
function broadcastUserCount() {
  const userCount = io.sockets.adapter.sids.size;
  console.log(`Broadcasting user count: ${userCount}`);
  io.emit('update-user-count', userCount);
}

// Serve the client files
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// Main route
app.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// --- WebSocket Logic ---
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // 1. Send the current history to the new client
  socket.emit('load-history', drawingState.getHistory());

  // 2. --- NEW ---
  // A user connected, so update the count for everyone
  broadcastUserCount();

  // 3. Listen for a new stroke from a client
  socket.on('add-stroke', (stroke) => {
    drawingState.addStroke(stroke);
    io.emit('redraw-canvas', drawingState.getHistory());
  });

  // 4. Listen for an 'undo' request
  socket.on('undo', () => {
    drawingState.undo();
    io.emit('redraw-canvas', drawingState.getHistory());
  });

  // 5. Listen for a 'redo' request
  socket.on('redo', () => {
    drawingState.redo();
    io.emit('redraw-canvas', drawingState.getHistory());
  });
  
  // 6. Listen for a 'clear' request
  socket.on('clear-canvas', () => {
    drawingState.clear();
    io.emit('redraw-canvas', drawingState.getHistory());
  });
  
  // 7. User cursors (Bonus - not implemented)
  socket.on('cursor-move', (data) => {
    socket.broadcast.emit('cursor-update', { ...data, id: socket.id });
  });

  // 8. Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // 9. --- NEW ---
    // A user disconnected, so update the count for everyone
    broadcastUserCount();

    // Notify clients to remove this cursor
    io.emit('cursor-remove', socket.id);
  });
});

server.listen(port, () => {
  // This message will now show the new port number
  console.log(`Server running on http://localhost:${port}`);
});