import { Board } from './board.js';
import { Player } from './player.js';
import { Position, ShootResult } from './types/board.js';
import { AttackStatus } from './types/messages.js';
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
  private isGameOverStatus = false;

  constructor(private id: number, private players: PlayerMap = new Map()) {}

  getId(): number {
    return this.id;
  }

  isGameReadyToStart(): boolean {
    return this.boardsWithShips === 2;
  }

  isGameOver(): boolean {
    return this.isGameOverStatus;
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

  performRandomAttack(playerId: number): ShootResult {
    const playerData = this.players.get(playerId);

    if (!playerData) {
      console.error(
        `Can't perform random attack: player with id ${playerId} not found in game with id ${this.getId()}`
      );
      return { status: AttackStatus.Miss, position: { x: -1, y: -1 }, adjacent: null };
    }

    if (!this.isCurrentPlayer(playerId)) {
      console.error(`Can't perform random attack: player with id ${playerId} is not the current player`);
      return { status: AttackStatus.Miss, position: { x: -1, y: -1 }, adjacent: null };
    }

    const opponentId = this.getOpponentId();
    const opponentData = this.players.get(opponentId);

    if (!opponentData) {
      console.error(
        `Can't perform random attack: opponent with id ${opponentId} not found in game with id ${this.getId()}`
      );
      return { status: AttackStatus.Miss, position: { x: -1, y: -1 }, adjacent: null };
    }

    const shootResult = opponentData.board.shootAtRandomPosition();

    if (opponentData.board.getNumberOfRemainingShips() === 0) {
      this.isGameOverStatus = true;
    }

    if (shootResult.status === AttackStatus.Miss) {
      this.switchCurrentPlayer();
    }

    return shootResult;
  }

  attack(playerId: number, position: Position): ShootResult {
    const playerData = this.players.get(playerId);

    if (!playerData) {
      console.error(`Can't perform attack: player with id ${playerId} not found in game with id ${this.getId()}`);
      return { status: AttackStatus.Miss, position: { x: -1, y: -1 }, adjacent: null };
    }

    if (!this.isCurrentPlayer(playerId)) {
      console.error(`Can't perform attack: player with id ${playerId} is not the current player`);
      return { status: AttackStatus.Miss, position: { x: -1, y: -1 }, adjacent: null };
    }

    const opponentId = this.getOpponentId();
    const opponentData = this.players.get(opponentId);

    if (!opponentData) {
      console.error(`Can't perform attack: opponent with id ${opponentId} not found in game with id ${this.getId()}`);
      return { status: AttackStatus.Miss, position: { x: -1, y: -1 }, adjacent: null };
    }

    const shootResult = opponentData.board.shoot(position);

    if (opponentData.board.getNumberOfRemainingShips() === 0) {
      this.isGameOverStatus = true;
    }

    if (shootResult.status === AttackStatus.Miss) {
      this.switchCurrentPlayer();
    }

    return shootResult;
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values()).map((playerData) => playerData.player);
  }

  broadcast(message: unknown): void {
    this.players.forEach(({ player }) => player.send(message));
  }

  sendToPlayerId(playerId: number, message: string): void {
    const playerData = this.players.get(playerId);

    if (!playerData) {
      console.error(
        `Can't send message to player with id ${playerId}: player with id ${playerId} not found in game with id ${this.getId()}`
      );
      return;
    }

    playerData.player.send(message);
  }

  private isCurrentPlayer(playerId: number): boolean {
    return playerId === this.currentPlayerId;
  }

  private getOpponentId(): number {
    const playerIds = Array.from(this.players.keys());

    return playerIds[(playerIds.indexOf(this.currentPlayerId) + 1) % playerIds.length];
  }

  private switchCurrentPlayer(): void {
    this.currentPlayerId = this.getOpponentId();
  }
}
