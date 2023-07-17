import { Player } from '../player.js';
import { Room } from '../room.js';

export class RoomStore {
  private playerMap: Map<number, number> = new Map(); // playerId, roomId
  private rooms: Map<number, Room> = new Map(); // roomId, Room
  private id = 0;

  add(players: Player[]): void {
    const room = new Room(this.id++, players);
    this.rooms.set(room.getId(), room);
  }

  get(roomId: number): Room | null {
    return this.rooms.get(roomId) ?? null;
  }

  getAll(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoomByPlayerId(playerId: number): Room | null {
    const roomId = this.playerMap.get(playerId);

    return roomId ? this.get(roomId) : null;
  }

  delete(roomId: number): void {
    const room = this.get(roomId);
    if (room) {
      const players = room.getPlayers();
      players.forEach((player) => this.playerMap.delete(player.getId()));
      this.rooms.delete(roomId);
    }
  }
}
