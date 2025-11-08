# Architecture

## Overview

The application is divided into two main parts: a Node.js backend server and a vanilla JavaScript frontend client.

## Backend

The backend is built with Node.js and Express. It serves the static client files and handles WebSocket connections using Socket.io.

*   `server.js`: The main server file. It sets up the Express server, initializes Socket.io, and handles all the WebSocket events.
*   `drawing-state.js`: This module manages the drawing history, including undo and redo functionality.
*   `rooms.js`: This module is not used in the current version of the application, but it could be used to implement rooms or separate drawing sessions.

## Frontend

The frontend is built with vanilla JavaScript, HTML, and CSS.

*   `index.html`: The main HTML file. It contains the canvas and the UI for the drawing tools.
*   `style.css`: This file contains the CSS for the application.
*   `canvas.js`: This module handles all the drawing logic on the canvas.
*   `websocket.js`: This module handles the WebSocket connection to the server.
*   `main.js`: This is the main client-side script. It initializes the application and handles user interactions.