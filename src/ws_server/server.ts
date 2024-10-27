import { WebSocket, WebSocketServer } from "ws";
import { WsMessage, WsMessageTypes } from "types/types";
import { reg, updateWinners } from "controllers/user";
import { sendMessage } from "utils/helper";
import { addUserToRoom, createRoom, deleteGameRooms, updateRoom } from "controllers/room";
import { addShips, createGame, getTurn, startGame } from "controllers/game";

export const wsServer = (port: number): void => {
  const server = new WebSocketServer({ port });
  const socketArray: WebSocket[] = [];

  server.on("connection", (ws) => {
    console.log("Client connected");
    socketArray.push(ws);

    ws.on("message", (messageData: string) => {
      const index = socketArray.findIndex((socket) => socket === ws);

      const message = JSON.parse(messageData.toString()) as WsMessage;
      console.log(message);

      const { type, data } = message;

      switch (type) {
        case "reg":
          reg(index, data, ws);
          server.clients.forEach((socket) => {
            if (socket.OPEN) {
              sendMessage(
                WsMessageTypes.UpdateRoom,
                updateRoom(),
                socket
              );
              sendMessage(
                WsMessageTypes.UpdateWinners,
                updateWinners(),
                socket
              );
            }
          });
          break;
        case "create_room":
          createRoom(index);
          server.clients.forEach((socket) => {
            if (socket.OPEN) {
              sendMessage(
                WsMessageTypes.UpdateRoom,
                updateRoom(),
                socket
              );
              sendMessage(
                WsMessageTypes.UpdateWinners,
                updateWinners(),
                socket
              );
            }
          });
          break;
        case "add_user_to_room":
          const { roomId, roomUsers } = addUserToRoom(index, JSON.parse(data).indexRoom);
          server.clients.forEach((socket) => {
            if (socket.OPEN) {
              sendMessage(
                WsMessageTypes.UpdateRoom,
                updateRoom(),
                socket
              );
            }
          });
          if (roomUsers.length === 2) {
            roomUsers
              .map((user) => ({
                userId: user.index,
                socket: socketArray[user.index],
              }))
              .filter(({ socket }) => socket.OPEN)
              .forEach(({ userId, socket }) => {
                sendMessage(
                  WsMessageTypes.CreateGame,
                  createGame(userId, roomId),
                  socket
                );
              });
            deleteGameRooms(roomId);
          }
          server.clients.forEach((socket) => {
            if (socket.OPEN) {
              sendMessage(
                WsMessageTypes.UpdateRoom,
                updateRoom(),
                socket
              );
            }
          });
          break;
        case "add_ships":
          const players = addShips(index, data);
          if (players.length === 2) {
            const { gameId } = players[0];
            players
              .map((player) => ({
                playerId: player.indexPlayer,
                socket: socketArray[player.indexPlayer],
              }))
              .filter(({ socket }) => socket.OPEN)
              .forEach(({ playerId, socket }) => {
                sendMessage(
                  WsMessageTypes.StartGame,
                  startGame(playerId),
                  socket
                );
                sendMessage(
                  WsMessageTypes.Turn,
                  getTurn(gameId),
                  socket
                );
              });
          }
          break;
        case "attack":
          break;
        case "randomAttack":
          break;
        case "single_play":
          break;
        default:
          unknownCommandDetected(type);
          break;
      }
    });
    ws.on("error", (err) => {
      const index = socketArray.findIndex((socket) => socket === ws);
      console.log(`socket id ${index} thrown Error: ${err}`);
      ws.close();
    });
  });
  const unknownCommandDetected = (type: string) =>
    console.log(`Unknown command type: ${type}`);

  process.on("exit", (code) => {
    console.log("Process beforeExit event with code: ", code);
    console.log("Closing connections...");
    closeConnections();
  });
  const closeConnections = () =>
    server.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1001, "server closed connection");
        console.log("Connection closed");
      }
    });
};
