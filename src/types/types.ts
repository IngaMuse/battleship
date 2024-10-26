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