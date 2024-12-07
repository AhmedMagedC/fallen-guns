const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");
const { Server } = require("socket.io");

const app = express();

// SSL certificates
let keyPath = path.join(__dirname, "key.pem");
let certPath = path.join(__dirname, "cert.pem");

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

// Serve static files
app.use(express.static("./"));

// Create HTTPS server
const server = https.createServer(options, app);

// Attach socket.io to the HTTPS server
const io = new Server(server);

let players = {}; // Store player data by socket ID
let bullet = {}; // bullet fired by client
// Handle socket.io connections
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  // Add new player to the list
  players[socket.id] = {
    x: Math.random() * 800, // Random starting position
    y: Math.random() * -1,
    state: "idle right", // player is currently running or idle
    health: 5,
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
      io.emit("syncPosition", data); // Sync players
    }
  });

  socket.on("updateState", (data) => {
    if (players[socket.id]) {
      players[socket.id].state = data.state;
      io.emit("syncState", data); // Sync players
    }
  });

  socket.on("createBullet", (bullet) => {
    this.bullet = bullet;
    io.emit("syncBullet", bullet);
  });

  socket.on("playerGotHit", (id) => {
    players[id].health--;
    io.emit("playerGotHitSync", id, players[id].health);
  });
});

// Start the server
const PORT = 8080;
server.listen(PORT, "192.168.1.6", () => {
  console.log(`Server is running at https://192.168.1.6:${PORT}`);
});
