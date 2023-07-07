import { Room } from '../room.js';
import { PlayerRegisterDto } from './player.js';

export enum MessageType {
  Registration = 'reg',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  CreateGame = 'create_game',
  UpdateRoom = 'update_room',
}

export interface ClientMessage {
  type: MessageType;
  data: unknown;
}

export interface RegistrationRequest {
  type: MessageType.Registration;
  data: PlayerRegisterDto;
  id: 0;
}

export interface RegistrationFailureResponse {
  type: MessageType.Registration;
  data: {
    error: true;
    errorText: string;
  };
  id: 0;
}

export interface RegistrationSuccessResponse {
  type: MessageType.Registration;
  data: {
    name: string;
    index: number; // player id
    error: false;
  };
  id: 0;
}

export interface CreateRoomRequest {
  type: MessageType.CreateRoom;
  data: '';
  id: 0;
}

export interface AddUserToRoomRequest {
  type: MessageType.AddUserToRoom;
  data: {
    indexRoom: number;
  };
  id: 0;
}

export interface CreateGameResponse {
  type: MessageType.CreateGame;
  data: {
    idGame: number;
    idPlayer: number;
  };
  id: 0;
}

export interface RoomDto {
  roomId: number;
  roomUsers: Omit<PlayerRegisterDto, 'password'>[];
}

export interface UpdateRoomResponse {
  type: MessageType.UpdateRoom;
  data: Room[];
  id: 0;
}
