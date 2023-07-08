import { Player } from './player.js';
import { RoomDto } from './types/room.js';

export class Room {
  constructor(public id: number, public players: Player[]) {}

  addPlayer(player: Player): void {
    this.players.push(player);
  }

  removePlayer(id: number): void {
    this.players = this.players.filter((player) => player.getId() !== id);
  }

  getId(): number {
    return this.id;
  }

  getPlayers(): Player[] {
    return this.players;
  }

  toJSON(): RoomDto {
    return { roomId: this.id, roomUsers: this.players };
  }
}
