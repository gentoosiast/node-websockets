import { Board } from './board.js';
import { Player } from './player.js';
import { Ship } from './types/ship.js';

interface PlayerData {
  player: Player;
  ships: Ship[];
  board: Board;
}
type PlayerMap = Map<number, PlayerData>; // player id, player data

export class Game {
  private boardsWithShips = 0;
  private currentPlayerId = -1;

  constructor(private id: number, private players: PlayerMap = new Map()) {}

  getId(): number {
    return this.id;
  }

  isReadyToStart(): boolean {
    return this.boardsWithShips === 2;
  }

  getCurrentPlayerId(): number {
    return this.currentPlayerId;
  }

  addPlayer(player: Player): void {
    if (this.players.size === 2) {
      console.error(`Game with id ${this.getId()} already has 2 players`);
      return;
    }

    const playerId = player.getId();

    if (this.currentPlayerId === -1) {
      // host is first
      this.currentPlayerId = playerId;
    }
    this.players.set(playerId, { player, board: new Board(), ships: [] });
  }

  placeShipsForPlayerId(playerId: number, ships: Ship[]): void {
    const playerData = this.players.get(playerId);

    if (!playerData) {
      console.error(`Can't place ships: player with ${playerId} not found in game with id ${this.getId()}`);
      return;
    }

    playerData.ships = ships;
    playerData.board.placeShips(ships);
    this.boardsWithShips += 1;
    console.log(`${playerData.board}`);
  }

  getShipsForPlayerId(playerId: number): Ship[] {
    const playerData = this.players.get(playerId);

    if (!playerData) {
      console.error(`Can't get ships: player with ${playerId} not found in game with id ${this.getId()}`);
      return [];
    }

    return playerData.ships;
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values()).map((playerData) => playerData.player);
  }

  broadcast(message: string): void {
    this.players.forEach(({ player }) => player.send(message));
  }
}
