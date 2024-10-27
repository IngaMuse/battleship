import { Cell, Game, Player, Position, RequestAddShipsData, RequestAttackData, ResponseAttack, ResponseAttackData, Ship } from "types/types";

const games: Game[] = [];
const players: Player[] = [];
let currentPlayer: number;

export const createGame = (idPlayer: number, idGame: number): string => {
  const existedGame = games.find((game) => game.idGame === idGame);
    const game = existedGame || { idGame, idPlayer };
  if (!existedGame) games.push(game);
  const responseCreateGameData = { idGame, idPlayer };
  return JSON.stringify(responseCreateGameData);
}

const addPlayer = (indexPlayer: number, ships: Ship[], gameId: number): Player[] => {
  const field = createField(ships);
  players.push({ indexPlayer, ships, field, gameId, remained: 20 });
  currentPlayer = players[0].indexPlayer;
  return players;
}

  export const  addShips = (index: number, messageData: string): Player[] => {
  const { gameId, ships } = JSON.parse(messageData) as RequestAddShipsData;
  const game = games.find((game) => game.idGame === gameId);
  return game ? addPlayer(index, ships, gameId) : [];
}

export const startGame = (playerId: number): string => {
  return JSON.stringify({
    currentPlayerIndex: playerId,
    ships: players.find((player) => player.indexPlayer === playerId),
  });
}

export const getTurnInfo = (): string => {
  return JSON.stringify({ currentPlayer: currentPlayer });
}

const changeCurrentPlayer =() => {
  currentPlayer = players.find(
    (player) => player.indexPlayer !== currentPlayer)?.indexPlayer as number;
}

export const getCurrentPlayer = (): number => {
  return currentPlayer;
}

export const attack = (messageData: string): ResponseAttack | undefined => {
  const { x, y, indexPlayer } = JSON.parse(messageData) as RequestAttackData;
  const res = attackOnCells(indexPlayer, { x, y }) as ResponseAttackData[];
  const isHit = res.find(
    (data) => data.status === 'shot' || data.status === 'killed'
  );
  if (res.length > 0) {
    if (!isHit) changeCurrentPlayer();
    const turn = { currentPlayer: currentPlayer } ;
    return {
      players,
      turn: JSON.stringify(turn),
      dataArray: res?.map((data) => JSON.stringify(data)),
    };
  }
}

const attackOnCells = (playerId: number, position: Position): ResponseAttackData[] => {
  const res: ResponseAttackData[] = [];
  const enemyId = players.findIndex(
    (player) => player.indexPlayer !== playerId
  );
  const cellId = players[enemyId].field.findIndex(
    (cell) => cell.position.x === position.x && cell.position.y === position.y
  );
  const enemy = players.find(
    (player) => player.indexPlayer !== playerId
  );
  const cell = enemy?.field.find(
    (cell) => cell.position.x === position.x && cell.position.y === position.y
  );
  if (cellId > -1) {
    if (!players[enemyId].field[cellId].isOpen) {
      if (!players[enemyId].field[cellId].isEmpty) {
        players[enemyId].field[cellId].isOpen = true;
        players[enemyId].remained -= 1;
        const isKilled = !players[enemyId].field[cellId].linked.find(
          (pos) =>
            !players[enemyId].field.find(
              (cell) => cell.position.x === pos.x && cell.position.y === pos.y
            )?.isOpen
        );
        if (isKilled) {
          res.push({
            position,
            currentPlayer: playerId,
            status: 'killed',
          });
          const shipCellPositions = getShipCellPositions(
            players[enemyId].field[cellId]
          );
          shipCellPositions.forEach((position) => {
            res.push({
              position,
              currentPlayer: playerId,
              status: 'killed',
            });
          });
          const cellAroundShipPosition =
            getCellAroundShipPosition(shipCellPositions);
          cellAroundShipPosition.forEach((position) => {
            res.push({
              position,
              currentPlayer: playerId,
              status: 'miss',
            });
          });
        } else {
          res.push({
            position,
            currentPlayer: playerId,
            status: 'shot',
          });
        }
      } else {
        res.push({
          position,
          currentPlayer: playerId,
          status: 'miss',
        });
      }
    }
  } else {
    players[enemyId].field.push({
      position,
      linked: [],
      isEmpty: true,
      isOpen: true,
    });
    res.push({
      position,
      currentPlayer: playerId,
      status: 'miss',
    });
  }
  return res;
}

const createField = (ships: Ship[]): Cell[] => {
  const field: Cell[] = [];
  ships.forEach((ship) => {
    const {
      position: { x, y },
      direction,
      length,
    } = ship;
    Array.from({ length })
      .map((_, index) => ({
        position: {
          x: direction ? x : x + index,
          y: direction ? y + index : y,
        },
        isEmpty: false,
        isOpen: false,
      }))
      .map((cell, _, arr) => ({
        ...cell,
        linked: arr
          .map((cell) => cell.position)
          .filter(
            (pos) => pos.x !== cell.position.x || pos.y !== cell.position.y
          ),
      }))
      .forEach((cell) => field.push(cell));
  });
  return field;
}

const getShipCellPositions = (cell: Cell): Position[] => {
  const result: Position[] = [];
  result.push(cell.position);
  cell.linked.forEach((position) => result.push(position));
  return result;
}

const getCellAroundShipPosition = (positions: Position[]): Position[] => {
  const result: Position[] = [];
  positions.forEach(({ x, y }) => {
    const startX = x - 1;
    const endX = x + 1;
    const startY = y - 1;
    const endY = y + 1;

    for (let posX = startX; posX <= endX; posX++) {
      for (let posY = startY; posY <= endY; posY++) {
        if (
          posX >= 0 &&
          posY >= 0 &&
          (posX !== x || posY !== y) &&
          !result.find((pos) => pos.x === posX && pos.y === posY) &&
          !positions.find((pos) => pos.x === posX && pos.y === posY)
        ) {
          result.push({ x: posX, y: posY });
        }
      }
    }
  });
  return result;
}

export const randomAttack = ( index: number, messageData: string): ResponseAttack | undefined => {
  const { indexPlayer } = JSON.parse( messageData) as RequestAttackData;
  const position = getRandomPosition(indexPlayer) as Position;
  const res = attackOnCells(indexPlayer, position) as ResponseAttackData[];
  const isHit = res.find(
    (data) => data.status === 'shot' || data.status === 'killed'
  );
  if (res.length > 0) {
    if (!isHit) changeCurrentPlayer();
    const turn = { currentPlayer: currentPlayer };
    return {
      players,
      turn: JSON.stringify(turn),
      dataArray: res?.map((data) => JSON.stringify(data)),
    };
  }
}

const getRandomPosition = (playerId: number): Position => {
  const enemyId = players.findIndex(
    (player) => player.indexPlayer !== playerId
  );
  const x = Math.floor(Math.random() * 10);
  const y = Math.floor(Math.random() * 10);
  const isExist = players[enemyId].field
    .filter((cell) => cell.isOpen)
    .find((cell) => cell.position.x === x && cell.position.y === y);
  return isExist ? getRandomPosition(playerId) : { x, y };
}