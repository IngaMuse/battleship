import { Game, Player, RequestAddShipsData, Ship } from "types/types";

const games: Game[] = [];
const players: Player[] = [];

export const createGame = (idPlayer: number, idGame: number): string => {
  const existedGame = games.find((game) => game.idGame === idGame);
    const game = existedGame || { idGame, idPlayer };
  if (!existedGame) games.push(game);
  const responseCreateGameData = { idGame, idPlayer };
  return JSON.stringify(responseCreateGameData);
}

const addPlayer = (indexPlayer: number, ships: Ship[], gameId: number): Player[] => {
  players.push({indexPlayer, ships, gameId});
  return players;
}

  export const  addShips = (index: number, messageData: string): Player[] => {
  const { gameId, ships } = JSON.parse(messageData) as RequestAddShipsData;
  const game = games.find((game) => game.idGame === gameId);
  return game ? addPlayer(index, ships, gameId) : [];
}

export const startGame = (gameId: number, playerId: number): string => {
  return JSON.stringify({
    currentPlayerIndex: playerId,
    ships: players.find((player) => player.indexPlayer === playerId),
  });
}



