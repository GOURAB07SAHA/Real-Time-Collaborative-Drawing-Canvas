let isReadyForDrawing = false;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    // Initialize loading screen
    initializeLoadingScreen();
    
    // Initialize connection status
    initializeConnectionStatus();
    
    // Initialize user info
    initializeUserInfo();
    
    // Initialize UI elements
    initializeUI();
    
    // Initialize canvas and drawing
    initializeCanvasAndDrawing();
});

function initializeLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.innerHTML = `
        <div class="loading-content">
            <div class="loading-logo">🎨</div>
            <h2>Collaborative Canvas</h2>
            <p>Connecting to the creative space...</p>
            <div class="loading-spinner"></div>
        </div>
    `;
    document.body.appendChild(loadingScreen);
}

function hideLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.remove();
        }, 500);
    }
}

function initializeConnectionStatus() {
    const statusDiv = document.createElement('div');
    statusDiv.className = 'connection-status disconnected';
    statusDiv.innerHTML = `
        <i>●</i>
        <span>Connecting...</span>
    `;
    document.body.appendChild(statusDiv);
    
    // Initialize connection handlers
    window.onConnectHandlers = window.onConnectHandlers || [];
    window.onDisconnectHandlers = window.onDisconnectHandlers || [];
    
    // Add handlers for connection status
    window.onConnectHandlers.push(() => {
        updateConnectionStatus('connected');
    });
    
    window.onDisconnectHandlers.push(() => {
        updateConnectionStatus('disconnected');
    });
}

function requestDrawing() {
    emit('request-drawing');
}

function updateConnectionStatus(status) {
    const statusDiv = document.querySelector('.connection-status');
    if (!statusDiv) return;
    
    statusDiv.className = `connection-status ${status}`;
    const statusText = statusDiv.querySelector('span');
    
    switch(status) {
        case 'connected':
            statusText.textContent = 'Connected';
            break;
        case 'connecting':
            statusText.textContent = 'Connecting...';
            break;
        case 'disconnected':
            statusText.textContent = 'Disconnected';
            break;
    }
}

function initializeUserInfo() {
    const userName = localStorage.getItem('userName') || generateUserName();
    localStorage.setItem('userName', userName);
    
    const userInfo = document.querySelector('.user-info .user-name');
    if (userInfo) {
        userInfo.textContent = userName;
    }
    
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.textContent = userName.charAt(0).toUpperCase();
    }
}

function generateUserName() {
    const adjectives = ['Creative', 'Artistic', 'Brilliant', 'Innovative', 'Visionary'];
    const nouns = ['Artist', 'Designer', 'Creator', 'Painter', 'Sketcher'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective}${noun}${Math.floor(Math.random() * 100)}`;
}

function initializeUI() {
    // Add event listeners for color presets
    const colorPresets = document.querySelectorAll('.color-preset');
    colorPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            const color = preset.dataset.color;
            const colorPicker = document.getElementById('color');
            colorPicker.value = color;
            colorPicker.dispatchEvent(new Event('input'));
            
            // Update active state
            colorPresets.forEach(p => p.classList.remove('active'));
            preset.classList.add('active');
        });
    });
    
    // Initialize brush preview
    updateBrushPreview();
    
    // Add share functionality
    const shareBtn = document.querySelector('.share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareCanvas);
    }
}

function updateBrushPreview() {
    const preview = document.getElementById('brush-preview');
    const colorPicker = document.getElementById('color');
    const strokeWidthPicker = document.getElementById('stroke-width');
    
    if (preview && colorPicker && strokeWidthPicker) {
        preview.innerHTML = '';
        const dot = document.createElement('div');
        dot.className = 'brush-preview-dot';
        dot.style.width = strokeWidthPicker.value + 'px';
        dot.style.height = strokeWidthPicker.value + 'px';
        dot.style.backgroundColor = colorPicker.value;
        dot.style.borderRadius = '50%';
        dot.style.margin = 'auto';
        preview.appendChild(dot);
    }
}

function shareCanvas() {
    const url = window.location.href;
    if (navigator.share) {
        navigator.share({
            title: 'Collaborative Canvas',
            text: 'Join me on this collaborative canvas!',
            url: url
        });
    } else {
        navigator.clipboard.writeText(url).then(() => {
            showNotification('Canvas link copied to clipboard!');
        });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 12px 16px;
        border-radius: var(--radius-lg);
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function initializeCanvasAndDrawing() {
    console.log('Initializing canvas and drawing');
    const canvas = document.getElementById('canvas');
    const colorPicker = document.getElementById('color');
    const strokeWidthPicker = document.getElementById('stroke-width');
    const undoBtn = document.getElementById('undo');
    const redoBtn = document.getElementById('redo');
    const eraserTool = document.getElementById('eraser-tool');
    const brushTool = document.getElementById('brush-tool');
    const sizeValue = document.getElementById('size-value');

    // Check if all required elements exist
    if (!canvas || !colorPicker || !strokeWidthPicker || !undoBtn || !redoBtn) {
        console.error('Required canvas elements not found');
        return;
    }

    let currentColor = '#000000';
    let currentStrokeWidth = 5;
    let isEraser = false;

    // Update size display
    if (sizeValue) {
        sizeValue.textContent = currentStrokeWidth;
    }

    colorPicker.addEventListener('input', (e) => {
        currentColor = e.target.value;
        isEraser = false;
        if (brushTool) brushTool.classList.add('active');
        if (eraserTool) eraserTool.classList.remove('active');
        updateBrushPreview();
    });

    strokeWidthPicker.addEventListener('input', (e) => {
        currentStrokeWidth = parseInt(e.target.value);
        if (sizeValue) {
            sizeValue.textContent = currentStrokeWidth;
        }
        updateBrushPreview();
    });

    if (eraserTool) {
        eraserTool.addEventListener('click', () => {
            isEraser = true;
            eraserTool.classList.add('active');
            if (brushTool) brushTool.classList.remove('active');
        });
    }

    if (brushTool) {
        brushTool.addEventListener('click', () => {
            isEraser = false;
            brushTool.classList.add('active');
            if (eraserTool) eraserTool.classList.remove('active');
        });
    }

    undoBtn.addEventListener('click', () => {
        undo();
    });

    redoBtn.addEventListener('click', () => {
        redo();
    });

    initializeCanvas(canvas, currentColor, currentStrokeWidth, isEraser);

    isReadyForDrawing = true;

    // Connect to the WebSocket server and set up listeners
    connect('main-room', () => {
        console.log('WebSocket connection established, setting up listeners');
        setupWebSocketListeners();
        if (isReadyForDrawing) {
            console.log('Ready for drawing, requesting drawing state');
            requestDrawing();
        }
    });
}

function setupWebSocketListeners() {
    onDrawing((drawing) => {
        if (Array.isArray(drawing)) {
            // Received full drawing state
            clearCanvas();
            drawing.forEach(item => drawLine(item.x0, item.y0, item.x1, item.y1, item.color, item.strokeWidth));
            hideLoadingScreen(); // Hide loading screen after initial drawing is loaded
        } else {
            // Single drawing action
            drawLine(drawing.x0, drawing.y0, drawing.x1, drawing.y1, drawing.color, drawing.strokeWidth);
        }
        redraw();
    });

    onCursor((data) => {
        updateCursor(data.userId, data.x, data.y);
        redraw();
    });

    onUserDisconnected((userId) => {
        removeCursor(userId);
        redraw();
    });
    
    // Update online users count
    updateOnlineUsers();
}

function updateOnlineUsers() {
    const onlineCount = document.querySelector('.online-count');
    if (onlineCount) {
        // This would be updated based on actual user count from server
        onlineCount.textContent = '1 user online';
    }
}