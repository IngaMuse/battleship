import { WebSocket } from 'ws';
import { WsMessageTypes } from 'types/types';

export const sendMessage = (type: WsMessageTypes, data: string, ws: WebSocket): void => {
  const message = JSON.stringify({ type, data, id: 0 });
  console.log('Response message: ', message);
  ws.send(message);
};