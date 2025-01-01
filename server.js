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

let rooms = {}; // for each room there are {started ,players:[],maxKills}
// Handle socket.io connections
io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  // Add new player to the list
  // addPlayer(socket);

  // Notify all clients of the new player list

  socket.on("joinLobby", (data) => {
    const player = {
      id: socket.id,
      playerName: data.name,
      charStats: data.charStats,
    };
    if (!data.roomId) {
      // if initally the player joined without roomId it means he is the owner and the roomId still not generated yet
      if (!rooms[socket.id]) {
        rooms[socket.id] = { started: false, maxKills: 0, players: [] }; // Initialize the room with default values
      }
      rooms[socket.id].maxKills = data.kills; // setting the score for each room
      rooms[socket.id].players.push(player); // push that player into the room
    } else {
      let foundRoom = false;
      Object.keys(rooms).forEach((roomName) => {
        if (data.roomId == roomName) foundRoom = true;
      });
      if (!foundRoom) return;
      socket.join(data.roomId);
      rooms[data.roomId].players.push(player);
    }
    const targetRoom = Array.from(socket.rooms).at(-1);
    io.to(targetRoom).emit("lobbyUpdate", rooms[targetRoom].players);
  });

  // Handle player disconnection
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    let targetRoom = undefined;

    Object.keys(rooms).forEach((roomName) => {
      const room = rooms[roomName];
      // Check if the player exists in the room's players
      const player = room.players.find((player) => player.id == socket.id);
      if (player) targetRoom = roomName; // Assign the matching room to `targetRoom`
    });

    if (!targetRoom) return;

    // remove the player from the room
    const updatedPlayers = rooms[targetRoom].players.filter(
      (player) => player.id != socket.id
    );
    rooms[targetRoom].players = updatedPlayers;

    io.to(targetRoom).emit("lobbyUpdate", updatedPlayers); // if the players are still on the lobby then update the lobby
    io.to(targetRoom).emit("removePlayer", socket.id); // if the players are in game then remove him from the scene

    if (updatedPlayers.length <= 0) delete rooms[targetRoom]; // if no players delete the room
  });

  socket.on("startGame", () => {
    const targetRoom = Array.from(socket.rooms).at(-1);
    io.to(targetRoom).emit("startGame");
  });

  socket.on("inTheScene", () => {
    const targetRoom = Array.from(socket.rooms).at(-1);
    rooms[targetRoom].started = true;
    io.to(targetRoom).emit(
      "playerData",
      rooms[targetRoom].players,
      rooms[targetRoom].maxKills
    );
  });

  // Update player position
  socket.on("updatePosition", (data) => {
    const targetRoom = Array.from(socket.rooms).at(-1);
    io.to(targetRoom).emit("syncPosition", data); // Sync players pos
  });

  // Update player state (to keep the correct animation)
  socket.on("updateState", (data) => {
    const targetRoom = Array.from(socket.rooms).at(-1);
    io.to(targetRoom).emit("syncState", data); // Sync players animation
  });

  // Make all clients see the bullet
  socket.on("createBullet", (bullet) => {
    const targetRoom = Array.from(socket.rooms).at(-1);
    io.to(targetRoom).emit("syncBullet", bullet);
  });

  socket.on("destroyAllAmmoCrates", () => {
    const targetRoom = Array.from(socket.rooms).at(-1);
    io.to(targetRoom).emit("destroyAllAmmoCrates");
  });

  socket.on("playerGotKilled", (id, killerID) => {
    const targetRoom = Array.from(socket.rooms).at(-1);
    io.to(targetRoom).emit("playerGotKilled", id, killerID); // let the server infrom everyone of the player's death
    setTimeout(() => {
      io.to(targetRoom).emit("revivePlayer", id); // revive him after 3 sec of being dead
    }, 3000);
  });

  socket.on("playerWon", (playerName, playerId) => {
    const targetRoom = Array.from(socket.rooms).at(-1);
    io.to(targetRoom).emit("game:playerWon", {
      name: playerName,
      id: playerId,
    });
  });
});

function spawnAmmoCrate() {
  setInterval(() => {
    // respawn an ammo crate every 10 seconds for every started room
    Object.keys(rooms).forEach((roomName) => {
      const room = rooms[roomName];

      if (room.started)
        io.to(roomName).emit("createAmmoCrate", Math.random() * 1500); // random X pos
    });
  }, 10000);
}

spawnAmmoCrate();

// Start the server
const PORT = 50315; // Use the forwarded port
const HOST = "0.0.0.0";
server.listen(PORT, HOST, () => {
  console.log(`Server is running at https://localhost:${PORT}`);
});
