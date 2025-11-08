// client/canvas.js

function createCanvas(id, dimensionsEl) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext('2d');
  
  let currentProps = {}; // Will be set by setDrawingProps
  let historyOnResize = []; // Store history for redrawing on resize

  // --- Drawing Functions ---

  // Draws a single, complete stroke object
  function drawStroke(stroke) {
    const { color, width, isEraser, points } = stroke;
    if (!points || points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }
    
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  // Clears the entire canvas
  function clearCanvas() {
    // Reset composite operation before clearing
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // --- Resizing ---

  // Resize canvas to fit its container and redraw
  function resizeCanvas() {
    const container = canvas.parentElement;
    if (!container) return; // Exit if container not found yet

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Check if size is changing to avoid flicker
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;

      // Update dimensions display
      if (dimensionsEl) {
        dimensionsEl.textContent = `${width} × ${height}`;
      }
      
      // Redraw the canvas with the current history
      canvasAPI.redrawFromHistory(historyOnResize);
    }
  }

  // Attach resize listener
  window.addEventListener('resize', resizeCanvas);

  // --- Public API ---

  const canvasAPI = {
    // Called by main.js when controls change
    setDrawingProps(props) {
      currentProps = { ...currentProps, ...props };
    },

    // Redraws the canvas from the entire history
    redrawFromHistory(history) {
      historyOnResize = history; // Save for resizing
      clearCanvas();
      
      // Ensure default composite op before redrawing
      ctx.globalCompositeOperation = 'source-over'; 
      
      history.forEach(stroke => {
        drawStroke(stroke);
      });
    }
  };

  // Set initial canvas size
  // Use a small delay to ensure parentElement is ready
  setTimeout(resizeCanvas, 0);

  return canvasAPI;
}