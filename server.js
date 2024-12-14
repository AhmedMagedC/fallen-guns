const express = require("express");
const { Server } = require("socket.io");
const http = require("http"); // Use HTTP instead of HTTPS for deployment

const app = express();

// Serve static files
app.use(express.static("./"));

// Create HTTP server
const server = http.createServer(app);

// Attach socket.io to the HTTP server
const io = new Server(server);

let players = {}; // Store player data by socket ID

// Handle socket.io connections
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  // Add new player to the list
  players[socket.id] = {
    x: Math.random() * 800, // Random starting position
    y: Math.random() * -1,
    state: "idle right", // Initial state of the client is idle
    health: 10,
    playerName: socket.handshake.query.playerName, // The character the client chose
    fireCoolDown: socket.handshake.query.fireCoolDown, // fireCoolDown for that particular character
    Damage: socket.handshake.query.Damage,
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

  socket.on("playerGotHit", (id, srcID) => {
    players[id].health -= players[srcID].Damage;
    io.emit("playerGotHitSync", id, players[id].health);
  });
});

// Use environment variables for dynamic port
const PORT = process.env.PORT || 8080; // Default to 8080 for local testing
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
