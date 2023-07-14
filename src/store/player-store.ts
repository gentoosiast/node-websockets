import { Player } from '../player.js';
import { PlayerRegisterDto } from '../types/player.js';
import { WebSocketWithId } from '../types/websocket.js';

export class PlayerStore {
  private players: Map<string, Player> = new Map(); // name, Player
  private id = 0;

  add(playerDto: PlayerRegisterDto, socket: WebSocketWithId): Player {
    const player = new Player(playerDto.name, playerDto.password, this.id++, socket);
    this.players.set(playerDto.name, player);

    return player;
  }

  get(name: string): Player | null {
    return this.players.get(name) ?? null;
  }

  delete(name: string): boolean {
    return this.players.delete(name);
  }

  deleteBySocketId(socketId: string): boolean {
    const player = this.getBySocketId(socketId);

    if (!player) {
      return false;
    }

    return this.delete(player.getName());
  }

  getBySocketId(socketId: string): Player | null {
    for (const player of this.players.values()) {
      if (player.getSocketId() === socketId) {
        return player;
      }
    }

    return null;
  }

  getAll(): Player[] {
    return [...this.players.values()];
  }

  broadcast(message: string): void {
    this.getAll().forEach((player) => player.send(message));
  }
}
