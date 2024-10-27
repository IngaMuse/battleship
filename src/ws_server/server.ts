import { WebSocket, WebSocketServer } from "ws";
import { RequestAttackData, WsMessage, WsMessageTypes } from "types/types";
import { reg, updateWinners, updateWinnersTable } from "controllers/user";
import { sendMessage } from "utils/helper";
import { addUserToRoom, createRoom, deleteGameRooms, updateRoom } from "controllers/room";
import { addShips, attack, createGame, finish, getCurrentPlayer, getTurnInfo, isFinish, randomAttack, startGame } from "controllers/game";

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
                  getTurnInfo(),
                  socket
                );
              });
          }
          break;
        case "attack":
          const { gameId } = JSON.parse(data) as RequestAttackData;
          if (getCurrentPlayer() === index) {
            const attackFeedback = attack(data);
            if (attackFeedback) {
              attackFeedback.players
                .map((player) => socketArray[player.indexPlayer])
                .filter((socket) => socket.OPEN)
                .forEach((socket) => {
                  attackFeedback.dataArray.forEach((data) => {
                    sendMessage(WsMessageTypes.Attack, data, socket);
                    sendMessage(WsMessageTypes.Turn, attackFeedback.turn, socket);
                  });
                });
            }
          }
          if (isFinish(index)) {
            updateWinnersTable(index);
            const { players, data } = finish(index, gameId);
            players
              .map((player) => socketArray[player.indexPlayer])
              .filter((socket) => socket.OPEN)
              .forEach((socket) => {
                sendMessage(WsMessageTypes.Finish, data, socket);
                sendMessage(
                  WsMessageTypes.UpdateWinners,
                  updateWinners(),
                  socket
                );
              });
          }
          break;
        case "randomAttack":
          const randomAttackData = JSON.parse(data) as RequestAttackData;
          const attackFeedback = randomAttack(index, data);
          if (attackFeedback) {
            attackFeedback.players
              .map((player) => socketArray[player.indexPlayer])
              .filter((socket) => socket.OPEN)
              .forEach((socket) => {
                attackFeedback.dataArray.forEach((data) => {
                  sendMessage(WsMessageTypes.Attack, data, socket);
                  sendMessage(WsMessageTypes.Turn, attackFeedback.turn, socket);
                });
              });
          }
          if (isFinish(index)) {
            updateWinnersTable(index);
            const { players, data } = finish(
              index,
              randomAttackData.gameId
            );
            players
              .map((player) => socketArray[player.indexPlayer])
              .filter((socket) => socket.OPEN)
              .forEach((socket) => {
                sendMessage(WsMessageTypes.Finish, data, socket);
                sendMessage(
                  WsMessageTypes.UpdateRoom,
                  updateWinners(),
                  socket
                );
              });
          }
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
