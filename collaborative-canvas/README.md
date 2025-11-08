🎨 Real-Time Collaborative Canvas

🚀 LIVE DEMO 🚀--- [text](https://real-time-collaborative-drawing-canvas-5gl7.onrender.com)


(Open the live demo in two separate browser windows to see the real-time collaboration in action!)

📸 Screenshot

A snapshot of the modern, "glassmorphism" UI in action, featuring the animated aurora background and drawing tools.

(See instructions below on how to add your screenshot)

🎥 Project Demo (GIF)

This demo shows multiple users drawing at the same time, along with the live-updating user count and the global undo/redo functionality.

(See instructions below on how to add your video/gif)

🌟 Core Features

This is a multi-user drawing application built from scratch to demonstrate real-time state synchronization using Vanilla JavaScript, Node.js, and WebSockets.

Real-Time Multi-User Collaboration: All drawings, undos, redos, and clears are instantly synced across every connected client.

Live User Count: The header shows the exact number of users currently in the room, which updates in real-time as users join or leave.

Global State Management: The server acts as the "single source of truth."

Global Undo/Redo: When one user clicks "undo," it reverses the last action done by any user for everyone on the canvas.

Global Clear: One click clears the entire canvas for all participants.

Modern Drawing Tools:

Brush Tool

Eraser Tool

Full Color Picker & Quick-Select Presets

Stroke Width Slider with a Live Preview

Modern UI/UX:

Beautiful "Glassmorphism" design on the header and toolbar.

Subtle, animated "Aurora" gradient background.

"Glow" effects on active buttons and hover states.

Shareable Rooms: The "Share Room" button instantly copies the room's URL to the clipboard, making it easy to invite others.

🛠️ Tech Stack

This project was built without any frontend frameworks (like React or Vue) to focus on core JavaScript fundamentals.

Frontend:

HTML5 (Canvas API)

CSS3 (Flexbox, Grid, Custom Properties, Animations)

Vanilla JavaScript (ES6+)

Backend:

Node.js

Express.js

Real-time Communication:

Socket.io (for WebSocket-based event handling)

Deployment:

Render (as a Node.js Web Service)

📁 Project Structure

The project maintains a clean separation between the client-side code and the server-side code.

collaborative-canvas/
│
├── client/
│   ├── index.html         # The main HTML file (UI structure)
│   ├── style.css          # All styling (glassmorphism, aurora, etc.)
│   ├── main.js            # Main client script: handles UI events, connects modules
│   ├── canvas.js          # Handles all Canvas API drawing logic (drawing strokes, resizing)
│   └── websocket.js       # Manages all client-side Socket.io communication
│
├── server/
│   ├── server.js          # Node.js, Express, & Socket.io server logic
│   └── drawing-state.js   # Server-side "brain": manages history, undo/redo stacks
│
├── .gitignore             # Tells Git to ignore the node_modules folder
├── package.json           # Project dependencies (Express, Socket.io) and start scripts
└── README.md              # This file!


🚀 How to Run Locally

Clone the repository:

git clone [https://github.com/GOURAB07SAHA/Real-Time-Collaborative-Drawing-Canvas.git]([text](https://github.com/GOURAB07SAHA/Real-Time-Collaborative-Drawing-Canvas.git))


Navigate to the project directory:

cd collaborative-canvas


Install dependencies:

npm install


Start the server:

npm start


Open your browser and go to http://localhost:3002 (or the port you set in server/server.js).