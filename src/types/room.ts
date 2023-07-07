import { Player } from './player.js';

export interface Room {
  roomId: number;
  roomUsers: Player[];
}
