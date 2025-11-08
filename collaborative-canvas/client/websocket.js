// WebSocket connection management
let socket;
let roomId;
let userId = Math.random().toString(36).substr(2, 9);

window.onConnectHandlers = [];
window.onDisconnectHandlers = [];

function connect(roomIdParam, callback) {
    roomId = roomIdParam;
    socket = io();
    
    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('join-room', roomId, userId);
        if (callback) {
            callback();
        }
        if (window.onConnectHandlers) {
            window.onConnectHandlers.forEach(handler => handler());
        }
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
        if (window.onDisconnectHandlers) {
            window.onDisconnectHandlers.forEach(handler => handler());
        }
    });
    
    return socket;
}

function sendDrawing(data) {
    if (socket) {
        socket.emit('drawing', data);
    }
}

function onDrawing(callback) {
    if (socket) {
        socket.on('drawing', callback);
    }
}

function sendCursor(data) {
    if (socket) {
        socket.emit('cursor', data);
    }
}

function onCursor(callback) {
    if (socket) {
        socket.on('cursor', callback);
    }
}

function onUserDisconnected(callback) {
    if (socket) {
        socket.on('user-disconnected', callback);
    }
}

function undo() {
    if (socket) {
        socket.emit('undo');
    }
}

function redo() {
    if (socket) {
        socket.emit('redo');
    }
}

function emit(event, ...args) {
    if (socket) {
        socket.emit(event, ...args);
    }
}

window.emit = emit;