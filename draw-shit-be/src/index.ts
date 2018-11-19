import express from "express";
import IO = require("socket.io");
import * as http from "http";
import cors from "cors";
import { Challenges } from "challenges";

type Challenge = {
  id: string;
  type: "phrase" | "image";
  payload: string;
};
type Room = {
  creator: string;
  players: string[];
  challenges: { [player: string]: Challenge[] };
  sent: { [player: string]: boolean };
  started: boolean;
};
const app = express();
app.use(cors());
const server = http.createServer(app);
const Socket = IO(server);
const rooms: { [roomName: string]: Room } = {};

function generateID() {
  const newRoom = Math.round(Math.random() * 10000);
  if (!rooms[newRoom]) {
    return newRoom;
  } else {
    return generateID();
  }
}

function randomChallenge() {
  const randomIndex = Math.floor(Math.random() * Challenges.length);
  return Challenges[randomIndex];
}

Socket.sockets.on("connection", connection => {
  console.log("connection", connection.id);
  connection.on("room:create", () => {
    const roomCreated = generateID();
    rooms[roomCreated] = {
      players: [],
      creator: connection.id,
      sent: {},
      challenges: {},
      started: false
    };

    console.log("room:created", roomCreated);
    connection.emit("room:created", roomCreated);

    connection.on("disconnected", () => {
      console.log("room:destroyed");
      Socket.sockets.in(roomCreated).emit("room:destroyed", roomCreated);
      rooms[roomCreated] = undefined;
    });
  });

  connection.on("room:subscribe", room => {
    // listen without receiving challenge
    connection.join(room);
  });

  connection.on("room:join", room => {
    console.log("room:join", room, connection.id);
    const currentRoom = rooms[room];
    if (currentRoom && !currentRoom.players.includes(connection.id)) {
      connection.join(room);
      currentRoom.players.push(connection.id);

      const newChallenge = {
        type: "image",
        payload: randomChallenge(),
        id: connection.id
      };

      Object.assign(currentRoom.challenges, {
        [connection.id]: [newChallenge]
      });

      console.log(
        "room:joined",
        room,
        connection.id,
        "playercount:",
        currentRoom.players.length
      );
      Socket.sockets.in(room).emit("room:joined", connection.id);
      connection.emit("challenge", newChallenge);

      connection.on("submission", (submission?: Challenge) => {
        if (currentRoom.started && submission) {
          if (submission.id === connection.id) {
            console.log("room:init-submission", connection.id, room);
            // it's either our first one, or we're back around
            if (!currentRoom.sent[connection.id]) {
              // our first send
              currentRoom.sent[connection.id] = true;
              const newChallenge = createNextPlayerChallenge(
                room,
                connection.id,
                submission
              );
              console.log("challenge", newChallenge.nextPlayer);
              connection
                .to(newChallenge.nextPlayer)
                .emit("challenge", newChallenge.challenge);
            } else {
              // we're done
              const revealStack = Object.values(currentRoom.challenges).reduce(
                (agg, playerChallenges) => {
                  agg = agg.concat(
                    playerChallenges.filter(c => c.id == connection.id)
                  );
                  return agg;
                },
                []
              );
              connection.emit("reveal", revealStack);
            }
          } else {
            // we're not back around, so send it along
            const newChallenge = createNextPlayerChallenge(
              room,
              connection.id,
              submission
            );
            console.log("challenge", newChallenge.nextPlayer);
            connection
              .to(newChallenge.nextPlayer)
              .emit("challenge", newChallenge.challenge);
          }
        }
      });
    }
  });

  function getNextPlayerIndex(room, fromPlayer): number {
    const thisPlayerIndex = rooms[room].players.indexOf(fromPlayer);
    if (thisPlayerIndex < 0) {
      throw new Error("Player not in room");
    }
    let nextPlayerIndex = thisPlayerIndex + 1;
    if (nextPlayerIndex === rooms[room].players.length) {
      return 0;
    } else {
      return nextPlayerIndex;
    }
  }

  function createNextPlayerChallenge(
    room,
    fromPlayer: string,
    submission: Challenge
  ) {
    const nextPlayerIndex = getNextPlayerIndex(room, fromPlayer);
    const nextPlayer = rooms[room].players[nextPlayerIndex];
    const challenge = {
      type:
        submission.type === "image"
          ? ("phrase" as "phrase")
          : ("image" as "image"),
      payload: submission.payload,
      id: submission.id
    };
    console.log(
      fromPlayer,
      "Pushing challenge to",
      nextPlayer,
      "in room",
      room
    );
    rooms[room].challenges[nextPlayer].push(challenge);
    return { nextPlayer, challenge };
  }

  connection.on("room:start", roomName => {
    roomName = roomName.toString();
    if (rooms[roomName]) {
      console.log("room:start", roomName);
      rooms[roomName].started = true;
    }
  });
});

server.listen(3001);
