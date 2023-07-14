import { Winner } from '../types/player.js';

const SCORE_TABLE_ENTRIES = 10;

class ScoreTable {
  private table: Map<string, number> = new Map(); // player name, number of wins

  addWinner(playerName: string): void {
    const playerWins = this.table.get(playerName) ?? 0;

    this.table.set(playerName, playerWins + 1);
  }

  getTopTenPlayers(): Winner[] {
    return Array.from(this.table)
      .map(([name, wins]) => ({ name, wins }))
      .sort((winnerA, winnerB) => winnerB.wins - winnerA.wins)
      .slice(0, SCORE_TABLE_ENTRIES);
  }
}

export const highScores = new ScoreTable(); // singleton
