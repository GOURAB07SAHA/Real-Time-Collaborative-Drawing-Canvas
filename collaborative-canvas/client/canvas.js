let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentColor = '#000000';
let currentStrokeWidth = 2;
let isEraser = false;
let canvas;
let ctx;
let cursors = {};

function initializeCanvas(canvasElement, color, strokeWidth, eraser) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    currentColor = color;
    currentStrokeWidth = strokeWidth;
    isEraser = eraser;
    
    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;
    
    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    setupEventListeners();
}

function setupEventListeners() {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch support for mobile
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
    
    window.addEventListener('resize', resizeCanvas);
}

function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.offsetX;
    lastY = e.offsetY;
    
    // Add visual feedback
    canvas.style.cursor = 'crosshair';
    canvas.style.transform = 'scale(1.001)';
    setTimeout(() => {
        canvas.style.transform = 'scale(1)';
    }, 100);
}

function handleMouseMove(e) {
    if (isDrawing) {
        draw(e.offsetX, e.offsetY);
    } else {
        // Send cursor position with throttling
        throttleCursor(e.offsetX, e.offsetY);
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    startDrawing({ offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top });
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    draw(touch.clientX - rect.left, touch.clientY - rect.top);
}

function stopDrawing() {
    isDrawing = false;
    canvas.style.cursor = 'crosshair';
}

function draw(toX, toY) {
    const color = isEraser ? '#ffffff' : currentColor;
    const strokeWidth = currentStrokeWidth;
    
    smoothDraw(lastX, lastY, toX, toY, color, strokeWidth);
    
    const data = {
        x0: lastX,
        y0: lastY,
        x1: toX,
        y1: toY,
        color: color,
        strokeWidth: strokeWidth
    };
    
    sendDrawing(data);
    
    lastX = toX;
    lastY = toY;
}

function smoothDraw(fromX, fromY, toX, toY, color, strokeWidth) {
    const distance = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
    const steps = Math.max(1, Math.floor(distance / 2));
    
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = fromX + (toX - fromX) * t;
        const y = fromY + (toY - fromY) * t;
        
        ctx.beginPath();
        ctx.arc(x, y, strokeWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        if (i > 0) {
            ctx.beginPath();
            ctx.moveTo(fromX + (toX - fromX) * (i - 1) / steps, fromY + (toY - fromY) * (i - 1) / steps);
            ctx.lineTo(x, y);
            ctx.strokeStyle = color;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }
    }
}

function changeColor(color) {
    currentColor = color;
    ctx.strokeStyle = color;
}

function changeStrokeWidth(width) {
    currentStrokeWidth = width;
    ctx.lineWidth = width;
}

function setEraser(enabled) {
    isEraser = enabled;
}

function getCanvas() {
    return canvas;
}

function getContext() {
    return ctx;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    canvas.width = Math.max(800, window.innerWidth * 0.8);
    canvas.height = Math.max(600, window.innerHeight * 0.8);
    
    ctx.putImageData(imageData, 0, 0);
}

function drawLine(x0, y0, x1, y1, color, strokeWidth) {
    smoothDraw(x0, y0, x1, y1, color, strokeWidth);
}

function updateCursor(userId, x, y) {
    if (!cursors[userId]) {
        cursors[userId] = {
            x: x,
            y: y,
            element: createCursorElement(userId)
        };
        document.body.appendChild(cursors[userId].element);
    } else {
        cursors[userId].x = x;
        cursors[userId].y = y;
    }
}

function createCursorElement(userId) {
    const cursor = document.createElement('div');
    cursor.className = 'user-cursor';
    cursor.innerHTML = `
        <div class="user-cursor-dot"></div>
        <div class="user-cursor-label">User ${userId}</div>
    `;
    
    // Assign a random color to the cursor
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    cursor.querySelector('.user-cursor-dot').style.backgroundColor = color;
    
    return cursor;
}

function removeCursor(userId) {
    if (cursors[userId]) {
        cursors[userId].element.remove();
        delete cursors[userId];
    }
}

function drawCursors() {
    Object.values(cursors).forEach(cursor => {
        const canvasRect = canvas.getBoundingClientRect();
        cursor.element.style.left = (canvasRect.left + cursor.x) + 'px';
        cursor.element.style.top = (canvasRect.top + cursor.y) + 'px';
    });
}

function redraw() {
    clearCanvas();
    // Here you would redraw the entire drawing history
    drawCursors();
}

// Throttle cursor updates to reduce network traffic
let cursorTimeout;
function throttleCursor(x, y) {
    if (cursorTimeout) return;
    
    sendCursor(x, y);
    cursorTimeout = setTimeout(() => {
        cursorTimeout = null;
    }, 50); // Throttle to 20 updates per second
}