import { Game } from '../game.js';
import { GameMode } from '../types/game.js';

export class GameStore {
  private index = 0;
  private games: Map<number, Game> = new Map(); // gameId, Game

  create(gameMode?: GameMode): Game {
    const gameId = this.index;
    const game = new Game(gameId, gameMode);
    this.games.set(gameId, game);
    this.index++;

    return game;
  }

  get(gameId: number): Game | null {
    return this.games.get(gameId) ?? null;
  }

  delete(gameId: number): boolean {
    const game = this.games.get(gameId);

    if (game) {
      game.getPlayers().forEach((player) => player.setGameId(null));
    }
    return this.games.delete(gameId);
  }
}
