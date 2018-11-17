import express from "express";
import IO = require("socket.io");

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
};
const app = express();
const Socket = IO(app);
const rooms: { [roomName: string]: Room } = {};

function generateID() {
  const newRoom = Math.round(Math.random() * 1000000000);
  if (!rooms[newRoom]) {
    return newRoom;
  } else {
    return generateID();
  }
}

function randomChallenge() {
  const challenges = ["Dick Butt", "Jumping up and down", "This app works"];
  const randomIndex = Math.floor(Math.random() * challenges.length);
  return challenges[randomIndex];
}

Socket.sockets.on("connection", connection => {
  connection.on("room:create", () => {
    const roomCreated = generateID();
    rooms[roomCreated] = {
      players: [connection.id],
      creator: connection.id,
      sent: {},
      challenges: {
        [connection.id]: [
          { type: "image", payload: randomChallenge(), id: connection.id }
        ]
      }
    };

    connection.emit("room:created", roomCreated);
    connection.on("disconnected", () => {
      rooms[roomCreated] = undefined;
    });
  });

  connection.on("room:join", room => {
    if (rooms[room]) {
      rooms[room].players.push(connection.id);
      Object.assign(rooms[room].challenges, {
        [connection.id]: [
          { type: "image", payload: randomChallenge(), id: connection.id }
        ]
      });
      connection.join(room);
    }
  });

  function getNextPlayerIndex(room, fromPlayer): number {
    const thisPlayerIndex = rooms[room].players.indexOf(fromPlayer);
    if (thisPlayerIndex < 0) {
      throw new Error("Player not in room");
    }
    return;
    thisPlayerIndex < rooms[room].players.length - 1 ? thisPlayerIndex + 1 : 0;
  }

  function sendToNextPlayer(room, fromPlayer: string, challenge: Challenge) {
    const nextPlayerIndex = getNextPlayerIndex(room, fromPlayer);
    const nextPlayer = rooms[room].players[nextPlayerIndex];
    const newChallenge = {
      type: challenge.type === "image" ? "phrase" : "image",
      payload: challenge.payload,
      id: challenge.id
    };
    rooms[room].challenges[nextPlayer].push(challenge);
  }

  connection.on("room:start", roomName => {
    if (rooms[roomName]) {
      Socket.sockets.in(roomName).clients((client: IO.Socket) => {
        client.on("guess", (guess: Challenge) => {
          if (guess.id === client.id) {
            // it's either our first one, or we're back around
            if (!rooms[roomName].sent[client.id]) {
              // our first send
              sendToNextPlayer(roomName, client.id, guess);
            } else {
              // we're done
              const revealStack = Object.values(
                rooms[roomName].challenges
              ).reduce((agg, playerChallenges) => {
                agg = agg.concat(
                  playerChallenges.filter(c => c.id == client.id)
                );
                return agg;
              }, []);
              client.emit("reveal", revealStack);
            }
          } else {
            // we're not back around, so send it along
            sendToNextPlayer(roomName, client.id, guess);
          }
        });
      });
    }
  });
});

app.listen(3000);
