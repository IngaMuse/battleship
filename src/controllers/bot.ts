import {
  WsMessage,
  WsMessageTypes,
  Position,
  RequestAttackData,
  ResponseAttackData,
  ResponseCreateGameData,
  ResponseTurnData,
  Ship,
} from 'types/types.js';
import { sendMessage } from 'utils/helper';
import WebSocket from 'ws';

const attackCells: Position[] = [];

export const initBot = (gameIdBot: number) => {
  const socket = new WebSocket('ws://localhost:3000');
  const botName: string = `bot_${gameIdBot}`;
  let botId: number;
  socket.on('open', () => {
    console.log('Bot here');
      socket.send(
        JSON.stringify({
          type: WsMessageTypes.Reg,
          data: JSON.stringify({ name: botName, password: 'password' }),
          id: 0,
        })
      );
      socket.send(
        JSON.stringify({
          type: WsMessageTypes.AddUserToRoom,
          data: JSON.stringify({ indexRoom: gameIdBot }),
          id: 0,
        })
      );
    });
    socket.on('message', (messageData) => {
      const { type, data } = JSON.parse(messageData.toString()) as WsMessage;
      switch (type) {
        case 'create_game':
          const { idGame: gameId, idPlayer: indexPlayer } = JSON.parse(
            data
          ) as ResponseCreateGameData;
          botId = indexPlayer;
          const ships = createShipsPosition();
          const shipsDataString = JSON.stringify({
            gameId,
            ships,
            indexPlayer,
          });
          sendMessage(WsMessageTypes.AddShips, shipsDataString, socket);
          break;
        case 'turn':
          const { currentPlayer } = JSON.parse(data) as ResponseTurnData;
          if (currentPlayer === botId) {
            const { x, y } = getRandomAttackPosition();
            const attackData: RequestAttackData = {
              gameId: gameIdBot,
              x,
              y,
              indexPlayer: currentPlayer,
            };
            const attackDataString = JSON.stringify(attackData);
            setTimeout(() => {
              sendMessage(WsMessageTypes.Attack, attackDataString, socket);
            }, 500);
          }
          break;
        case 'attack':
          const attackData = JSON.parse(data) as ResponseAttackData;
          if (
            'status' in attackData &&
            attackData.currentPlayer === botId
          ) {
            const { x, y } = attackData.position;
            const isAttackExists = attackCells?.find(
              (position) => position.x === x && position.y === y
            );
            if (!isAttackExists) attackCells?.push({ x, y });
          }
          break;
        default:
          break;
      }
    });
  }

  const createShipsPosition = (): Ship[] => {
    return [
      { position: { x: 8, y: 2 }, direction: true, type: 'huge', length: 4 },
      { position: { x: 6, y: 3 }, direction: true, type: 'large', length: 3 },
      { position: { x: 0, y: 3 }, direction: false, type: 'large', length: 3 },
      { position: { x: 5, y: 0 }, direction: true, type: 'medium', length: 2 },
      { position: { x: 4, y: 6 }, direction: true, type: 'medium', length: 2 },
      { position: { x: 0, y: 1 }, direction: false, type: 'medium', length: 2 },
      { position: { x: 3, y: 0 }, direction: false, type: 'small', length: 1 },
      { position: { x: 8, y: 0 }, direction: true, type: 'small', length: 1 },
      { position: { x: 8, y: 8 }, direction: true, type: 'small', length: 1 },
      { position: { x: 1, y: 8 }, direction: false, type: 'small', length: 1 },
    ];
  }

  const getRandomAttackPosition = (): Position => {
    const x = Math.floor(Math.random() * 10);
    const y = Math.floor(Math.random() * 10);
    const isExist = attackCells?.find(
      (position) => position.x === x && position.y === y
    );
    return isExist ? getRandomAttackPosition() : { x, y };
  }
