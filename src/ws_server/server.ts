import { WebSocket, WebSocketServer } from 'ws';
import { WsMessage, WsMessageTypes } from 'types/types';
import { reg } from 'controllers/user';

export const wsServer = (port: number): void => {
  const server = new WebSocketServer({ port });
  const socketArray: WebSocket[] = [];

  server.on('connection', (ws) => {
    console.log("Client connected");
    socketArray.push(ws);

    ws.on('message', (messageData: string) => {
      const index = socketArray.findIndex((socket) => socket === ws);

      const message = JSON.parse(messageData.toString()) as WsMessage;
      console.log(message);

      const { type, data } = message;

      switch (type) {
        case 'reg':
        reg(index, data, ws);
          break;
        case 'create_room':
          // const responseCreateRoomData = createRoom(index);
          // sendMessage(WsMessageTypes.UpdateRoom, responseCreateRoomData, ws);
          break;
        case 'add_user_to_room':
          // const responseAddUserToRoomData = addUserToRoom(index, data);
          break;
        case 'add_ships':
          break;
        case 'attack':
          break;
        case 'randomAttack':
          break;
          case 'single_play':
          break;
        default:
          unknownCommandDetected(type);
          break;
      }
    });
    ws.on('error', (err) => {
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
    })
};