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
  const charStats = JSON.parse(socket.handshake.query.charStats);
  charStats.curHealth = charStats.health;
  players[socket.id] = {
    x: Math.random() * 1500, // Random starting position
    y: Math.random() * -1,
    state: "idle right", // initial state of the client is idle
    charStats,
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

  // Update player state (to keep the correct animation)
  socket.on("updateState", (data) => {
    if (players[socket.id]) {
      players[socket.id].state = data.state;
      io.emit("syncState", data); // Sync players
    }
  });

  socket.on("createBullet", (bullet) => {
    io.emit("syncBullet", bullet);
  });

  socket.on("playerGotHit", (id, srcID) => {
    players[id].charStats.curHealth -= players[srcID].charStats.damage;
    io.emit("updateHealthPointsIcons", id, players[id].charStats.curHealth);
    if (players[id].charStats.curHealth <= 0) {
      io.emit("playerDied", id);

      setTimeout(() => {
        // respawn the player after 3 secs of being dead
        players[id].charStats.curHealth = players[id].charStats.health;
        io.emit("respawnPlayer", id, players[id].charStats.health);
      }, 3000);
    }
  });

  socket.on("fallenOutOfBoundries", (id) => {
    io.emit("playerDied", id);

    setTimeout(() => {
      // respawn the player after 3 secs of being dead
      players[id].charStats.curHealth = players[id].charStats.health;
      io.emit("respawnPlayer", id, players[id].charStats.health);
    }, 3000);
  });
});

setInterval(() => {
  // respawn an ammo crate every 5 seconds
  io.emit("createAmmoCrate", Math.random() * 1500); // random X pos
}, 10000);

// Start the server
const PORT = 50315; // Use the forwarded port
const HOST = "0.0.0.0";
server.listen(PORT, HOST, () => {
  console.log(`Server is running at https://${HOST}:${PORT}`);
});
