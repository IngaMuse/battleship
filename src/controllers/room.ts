import { Room, User } from "types/types";
import { users } from "./user";

export let rooms: Room[] = [];

const create = (): Room => {
  let roomId = 0;
  if (rooms.length > 0) {
    roomId = rooms.length;
  }
  rooms[roomId] = { roomId, roomUsers: [] };
  return rooms[roomId];
}

export const createRoom = (index: number) => {
  const { roomId } = create();
  addUserToRoom(index, roomId);
  console.log(`Player ${index} added to new room with id ${roomId}`);
}

export const addUserToRoom = (index: number, indexRoom: number): Room => {
  const currentUser = users.find((user) => user.index === index);
  
  if (currentUser && !isUserAlreadyInRoom(currentUser, rooms[indexRoom])) {
    rooms[indexRoom].roomUsers.push(currentUser);
    console.log(`Player ${index} added to room ${indexRoom}`);
  };
  if (rooms[indexRoom].roomUsers.length === 2) {
  }
  return rooms[indexRoom];
}

export const deleteGameRooms = (indexRoom:number) => {
  rooms = rooms.filter((room) => room.roomId !== indexRoom);
}

export const updateRoom = (): string => {
  return JSON.stringify(rooms);
}

export const isUserAlreadyInRoom =(user: User, room: Room): boolean => {
  return !!room.roomUsers.find((roomUser) => roomUser === user);
}