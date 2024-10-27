export enum WsMessageTypes {
  Reg = "reg",
  CreateRoom = "create_room",
  AddUserToRoom = "add_user_to_room",
  StartGame = "start_game",
  UpdateWinners = "update_winners",
  UpdateRoom = "update_room",
  CreateGame = "create_game",
  Turn = "turn",
  AddShips = "add_ships",
  Attack = "attack",
  RandomAttack = "randomAttack",
  Finish = "finish",
  SinglePlay = "single_play"
}

export type WsMessage = {
  type: WsMessageTypes;
  data: string;
  id: 0;
};

export type RequestRegData = {
  name: string;
  password: string;
};

export type User = {
  name: string;
  index: number;
}

export type Room = {
  roomId: number;
  roomUsers: User[];
};

export type Winner = {
  name: string;
  wins: number;
};

export type RequestAddUserToRoomData = {
  indexRoom: number;
};

export type Game = {
  idGame: number;
  idPlayer: number;
};

export type ResponseCreateGameData = {
  idGame: number;
  idPlayer: number;
};

export type Position = {
  x: number;
  y: number;
};

export type Ship = {
  position: Position;
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
};

export type Player = {
  gameId: number;
  indexPlayer: number;
  ships: Ship[];
};

export type RequestAddShipsData = {
  gameId: number;
  ships: Ship[];
  indexPlayer: number;
};
