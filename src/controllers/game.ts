import { Game } from "types/types";

const games: Game[] = [];

export const createGame = (idPlayer: number, idGame: number): string => {
  const existedGame = games.find((game) => game.idGame === idGame);
    const game = existedGame || { idGame, idPlayer };
  if (!existedGame) games.push(game);
  const responseCreateGameData = { idGame, idPlayer };
  return JSON.stringify(responseCreateGameData);
}