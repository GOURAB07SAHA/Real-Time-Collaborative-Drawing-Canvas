// client/websocket.js

// --- MODIFIED ---
// It now accepts a new argument: onUserCountUpdate
function initWebSocket(canvasAPI, onUserCountUpdate) {
  const socket = io(); // Connect to the server
  const connectionStatus = document.getElementById('connection-status');

  // --- Socket Event Listeners ---
  
  socket.on('connect', () => {
    console.log('Connected to server');
    connectionStatus.innerHTML = '<i class="fas fa-circle"></i> Connected';
    connectionStatus.classList.add('connected');
    connectionStatus.classList.remove('disconnected');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
    connectionStatus.innerHTML = '<i class="fas fa-circle"></i> Disconnected';
    connectionStatus.classList.add('disconnected');
    connectionStatus.classList.remove('connected');
  });

  // --- Event Listeners (Receiving from server) ---

  // 1. On connect, server sends the full history
  socket.on('load-history', (history) => {
    console.log('Loading history...');
    canvasAPI.redrawFromHistory(history);
  });

  // 2. Server broadcasts new history after any change
  socket.on('redraw-canvas', (history) => {
    console.log('Redrawing canvas from server data');
    canvasAPI.redrawFromHistory(history);
  });

  // 3. --- NEW LISTENER ---
  // Listen for the user count update from the server
  socket.on('update-user-count', (count) => {
    console.log('User count updated:', count);
    if (onUserCountUpdate) {
      // Call the function from main.js to update the HTML
      onUserCountUpdate(count);
    }
  });


  // --- Emitters (Sending to server) ---
  
  const socketAPI = {
    addStroke(stroke) {
      socket.emit('add-stroke', stroke);
    },
    
    undo() {
      socket.emit('undo');
    },
    
    redo() {
      socket.emit('redo');
    },

    clear() {
      socket.emit('clear-canvas');
    }
  };
  
  return socketAPI;
}