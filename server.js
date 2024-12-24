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
// Handle socket.io connections
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  // Add new player to the list
  addPlayer(socket);

  // Notify all clients of the new player list
  io.emit("playerData", players);

  // Handle player disconnection
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id];
    io.emit("removePlayer", players); // remove the player from all clients
  });

  // Update player position
  socket.on("updatePosition", (data) => {
    socket.broadcast.emit("syncPosition", data); // Sync players pos
  });

  // Update player state (to keep the correct animation)
  socket.on("updateState", (data) => {
    socket.broadcast.emit("syncState", data); // Sync players animation
  });

  // Make all clients see the bullet
  socket.on("createBullet", (bullet) => {
    io.emit("syncBullet", bullet);
  });

  socket.on("destroyAllAmmoCrates", () => {
    io.emit("destroyAllAmmoCrates");
  });
});

setInterval(() => {
  // respawn an ammo crate every 10 seconds
  io.emit("createAmmoCrate", Math.random() * 1500); // random X pos
}, 10000);

function addPlayer(socket) {
  const charStats = JSON.parse(socket.handshake.query.charStats);
  players[socket.id] = {
    charStats,
  };
}
// Start the server
const PORT = 50315; // Use the forwarded port
const HOST = "0.0.0.0";
server.listen(PORT, HOST, () => {
  console.log(`Server is running at https://${HOST}:${PORT}`);
});
