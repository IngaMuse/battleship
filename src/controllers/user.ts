import { WebSocket } from 'ws';
import { RequestRegData, User, Winner, WsMessageTypes } from 'types/types';
import { sendMessage } from 'utils/helper';
export const users: User[] = [];
const winners: Winner[] = [];

export const reg = (index: number, messageData: string, ws: WebSocket ) => {
  const data = JSON.parse(messageData) as RequestRegData;
  const { name } = data;
  const isNameFree = !users.find((user) => user.name === name);
  if (isNameFree) {
    users.push({ name, index });
    const responseRegData = JSON.stringify({ name, index, error: false, errorText: '' });
    sendMessage(WsMessageTypes.Reg, responseRegData, ws);
    console.log(`User ${name} registered`);
  } else {
    return JSON.stringify({
      name,
      index,
      error: true,
      errorText: `User ${name} is already exists`,
    });
  }
}

export const updateWinners = (): string => {
  return JSON.stringify(winners);
}

export const  updateWinnersTable = (index: number): void => {
  const { name } = users[index];
  const winnerId = winners.findIndex((winner) => winner.name === name);
  if (winnerId > -1) {
    winners[winnerId].wins += 1;
  } else {
    winners.push({ name, wins: 1 });
  }
}
