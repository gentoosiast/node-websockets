import { Game } from '../game.js';

export class GameStore {
  private index = 0;
  private games: Map<number, Game> = new Map(); // gameId, Game

  create(): Game {
    const gameId = this.index;
    const game = new Game(gameId);
    this.games.set(gameId, game);
    this.index++;

    return game;
  }

  get(gameId: number): Game | null {
    return this.games.get(gameId) ?? null;
  }

  delete(gameId: number): boolean {
    return this.games.delete(gameId);
  }
}
