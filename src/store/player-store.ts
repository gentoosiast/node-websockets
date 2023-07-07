import { Player, PlayerDto } from '../types/player.js';

export class PlayerStore {
  private players: Map<string, Player> = new Map();
  private id = 0;

  add(playerDto: PlayerDto): Player {
    const player: Player = { ...playerDto, index: this.id++ };
    this.players.set(playerDto.name, player);

    return player;
  }

  get(name: string): Player | null {
    return this.players.get(name) ?? null;
  }

  getAll(): Player[] {
    return [...this.players.values()];
  }
}
