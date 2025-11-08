// client/main.js

// --- State variables ---
let currentStroke = null;
let drawingProps = {
    color: '#000000',
    width: 5,
    isEraser: false,
    tool: 'brush' // Track the active tool
};
let socketAPI = null;

// --- Helper function to update the brush preview ---
function updateBrushPreview() {
    const preview = document.getElementById('brush-preview');
    // Find the dot, or create it if it's the first time
    const dot = preview.querySelector('.brush-preview-dot') || document.createElement('div');
    dot.className = 'brush-preview-dot'; // Ensure it has the class

    const width = drawingProps.width;
    
    // Use min/max to keep the preview dot visible but bounded
    const previewSize = Math.max(2, Math.min(width, 56)); // 56px is (60px - 2px border * 2)

    dot.style.width = `${previewSize}px`;
    dot.style.height = `${previewSize}px`;
    
    // Set color or show a white dot for the eraser
    dot.style.background = drawingProps.isEraser ? '#ffffff' : drawingProps.color;
    
    if (!preview.querySelector('.brush-preview-dot')) {
        preview.appendChild(dot);
    }
}

// --- Main App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. THE FIX: Hide Loading Screen ---
    const loadingScreen = document.getElementById('loading-screen');
    
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 500); // 500ms delay

    
    // --- 2. Get All NEW Element IDs from index.html ---
    const canvas = document.getElementById('canvas');
    const colorPicker = document.getElementById('color');
    const widthSlider = document.getElementById('stroke-width');
    const sizeValue = document.getElementById('size-value');
    const brushBtn = document.getElementById('brush-tool');
    const eraserBtn = document.getElementById('eraser-tool');
    const undoBtn = document.getElementById('undo');
    const redoBtn = document.getElementById('redo');
    const clearBtn = document.getElementById('clear-canvas');
    const colorPresets = document.querySelectorAll('.color-preset');
    const shareBtn = document.getElementById('share-room');
    
    // --- NEW ---
    const onlineCountEl = document.querySelector('.online-count');

    // --- 3. Initialize Canvas & WebSocket ---
    const canvasDimensionsEl = document.getElementById('canvas-dimensions');
    const canvasAPI = createCanvas('canvas', canvasDimensionsEl); 
    
    // --- NEW HELPER FUNCTION ---
    function setOnlineCount(count) {
        if (onlineCountEl) {
            // This updates the text (e.g., "1 user online" or "3 users online")
            onlineCountEl.textContent = `${count} ${count === 1 ? 'user online' : 'users online'}`;
        }
    }

    // --- MODIFIED ---
    // Pass the new function to the websocket module
    socketAPI = initWebSocket(canvasAPI, setOnlineCount);     

    // --- 4. Wire up ALL UI Event Listeners ---

    // Tool selection
    function setActiveTool(tool) {
        drawingProps.tool = tool;
        drawingProps.isEraser = (tool === 'eraser');
        
        brushBtn.classList.toggle('active', tool === 'brush');
        eraserBtn.classList.toggle('active', tool === 'eraser');
        
        canvasAPI.setDrawingProps(drawingProps);
        updateBrushPreview();
    }

    brushBtn.addEventListener('click', () => setActiveTool('brush'));
    eraserBtn.addEventListener('click', () => setActiveTool('eraser'));

    // Color Picker
    colorPicker.addEventListener('change', (e) => {
        drawingProps.color = e.target.value;
        setActiveTool('brush'); 
        updateBrushPreview();
    });

    // Color Presets
    colorPresets.forEach(preset => {
        preset.addEventListener('click', () => {
            const color = preset.dataset.color;
            drawingProps.color = color;
            colorPicker.value = color; 
            setActiveTool('brush');
            updateBrushPreview();
        });
    });

    // Width Slider
    widthSlider.addEventListener('input', (e) => {
        const width = parseInt(e.target.value, 10);
        drawingProps.width = width;
        sizeValue.textContent = width; 
        canvasAPI.setDrawingProps(drawingProps);
        updateBrushPreview();
    });

    // Action Buttons
    undoBtn.addEventListener('click', () => socketAPI && socketAPI.undo());
    redoBtn.addEventListener('click', () => socketAPI && socketAPI.redo());
    
    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the entire canvas?')) {
            socketAPI && socketAPI.clear(); 
        }
    });

    // Share Room Button
    shareBtn.addEventListener('click', () => {
        const roomURL = window.location.href;
        
        navigator.clipboard.writeText(roomURL).then(() => {
            shareBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            shareBtn.disabled = true; 

            setTimeout(() => {
                shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Share Room';
                shareBtn.disabled = false;
            }, 2000);
            
        }).catch(err => {
            console.error('Failed to copy URL: ', err);
            alert('Could not copy URL. Please copy it from the address bar.');
        });
    });

    // --- 5. Canvas Mouse Events ---
    canvas.addEventListener('mousedown', (e) => {
        currentStroke = {
            ...drawingProps,
            points: [{ x: e.offsetX, y: e.offsetY }]
        };
    });

    canvas.addEventListener('mousemove', (e) => {
        if (currentStroke) {
            currentStroke.points.push({ x: e.offsetX, y: e.offsetY });
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (currentStroke && currentStroke.points.length > 1) {
            socketAPI && socketAPI.addStroke(currentStroke);
        }
        currentStroke = null;
    });

    canvas.addEventListener('mouseleave', () => {
        if (currentStroke && currentStroke.points.length > 1) {
            socketAPI && socketAPI.addStroke(currentStroke);
        }
        currentStroke = null;
    });
    
    // --- 6. Initial State Setup ---
    sizeValue.textContent = drawingProps.width;
    updateBrushPreview();
    setActiveTool('brush'); 
});