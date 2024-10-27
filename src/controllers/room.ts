import { Room, User } from "types/types";
import { users } from "./user";


const rooms: Room[] = [];

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
  // rooms.forEach((room) => {
  //   room.roomUsers = room.roomUsers.filter(
  //     (user) => user.index !== currentUser?.index,
  //   );
  // });
  
  if (currentUser && !isUserAlreadyInRoom(currentUser, rooms[indexRoom])) {
    rooms[indexRoom].roomUsers.push(currentUser);
    console.log(`Player ${index} added to room ${indexRoom}`);
  };
  return rooms[indexRoom];
}

export const updateRoom = (): string => {
  return JSON.stringify(rooms);
}

export const isUserAlreadyInRoom =(user: User, room: Room): boolean => {
  return !!room.roomUsers.find((roomUser) => roomUser === user);
}