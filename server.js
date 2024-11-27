const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Server } = require("socket.io");

const app = express();

// SSL certificates (replace with your actual paths)
let keyPath = path.join(__dirname, "key.pem");
let certPath = path.join(__dirname, "cert.pem");

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

// Serve static files
app.use(express.static("./public")); // 'public' is the folder containing your HTML/JS files

// Create HTTPS server
const server = https.createServer(options, app);

// Attach socket.io to the HTTPS server
const io = new Server(server);

let players = {}; // Store player data by socket ID

// Handle socket.io connections
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  // Add new player to the list
  players[socket.id] = {
    x: Math.random() * 800, // Random starting position
    y: 800,
  };

  // Notify all clients of the new player list
  io.emit("playerData", players);

  // Handle player disconnection
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id];
    io.emit("removePlayer", players); // Update clients
  });

  // Update player position
  socket.on("updatePosition", (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      io.emit("syncAll", data); // Sync players
    }
  });
});

// Start the server
const PORT = 8080;
server.listen(PORT, "192.168.1.6", () => {
  console.log(`Server is running at https://192.168.1.6:${PORT}`);
});
