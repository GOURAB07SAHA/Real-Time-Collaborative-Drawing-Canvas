const history = [];
let historyIndex = -1;

function addAction(action) {
    // If we have undone some actions, we need to remove the undone actions from the history
    if (historyIndex < history.length - 1) {
        history.splice(historyIndex + 1);
    }
    history.push(action);
    historyIndex++;
}

function undo() {
    if (historyIndex >= 0) {
        historyIndex--;
        return true;
    }
    return false;
}

function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        return true;
    }
    return false;
}

function getDrawing() {
    return history.slice(0, historyIndex + 1);
}

module.exports = {
    addAction,
    undo,
    redo,
    getDrawing
};