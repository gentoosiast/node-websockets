import { Game } from '../game.js';
import { Player } from '../player.js';

export class GameStore {
  private index = 0;
  private games: Map<number, Game> = new Map();

  add(player: Player): Game {
    const gameId = this.index;

    const game = new Game(gameId);
    game.addPlayer(player);
    this.games.set(gameId, game);
    this.index++;

    return game;
  }

  get(id: number): Game | null {
    return this.games.get(id) ?? null;
  }

  delete(id: number): boolean {
    return this.games.delete(id);
  }
}
