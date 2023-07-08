import { Player } from '../player.js';
import { Room } from '../room.js';

export class RoomStore {
  private rooms: Room[] = [];
  private id = 0;

  add(players: Player[]): void {
    this.rooms.push(new Room(this.id++, players));
  }

  get(roomId: number): Room | null {
    return this.rooms.find((room) => room.id === roomId) ?? null;
  }

  getAll(): Room[] {
    return this.rooms;
  }

  findRoomByPlayerId(playerId: number): Room | null {
    return this.rooms.find((room) => room.getPlayers().some((player) => player.getId() === playerId)) ?? null;
  }

  delete(roomId: number): void {
    this.rooms = this.rooms.filter((room) => room.id !== roomId);
  }
}
