import { Player } from '../player.js';
import { PlayerRegisterDto } from './player.js';

export interface Room {
  roomId: number;
  roomUsers: Player[];
}

export interface RoomDto {
  roomId: number;
  roomUsers: Omit<PlayerRegisterDto, 'password'>[];
}
