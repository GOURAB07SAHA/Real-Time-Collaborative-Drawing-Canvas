// server/drawing-state.js

class DrawingState {
  constructor() {
    this.history = []; // Array of stroke objects
    this.redoStack = []; // Array of undone stroke objects
  }

  addStroke(stroke) {
    this.history.push(stroke);
    // Adding a new stroke clears the redo stack
    this.redoStack = []; 
  }

  undo() {
    if (this.history.length > 0) {
      const undoneStroke = this.history.pop();
      this.redoStack.push(undoneStroke);
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const redoneStroke = this.redoStack.pop();
      this.history.push(redoneStroke);
    }
  }

  clear() {
    this.history = [];
    this.redoStack = [];
  }

  getHistory() {
    // This is the line that was fixed (removed extra dot)
    return this.history;
  }
}

module.exports = { DrawingState };