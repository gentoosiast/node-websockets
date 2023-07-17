import { Board } from './board.js';
import { Player } from './player.js';
import { BotPlayer } from './bot-player.js';
import { ShipPlacementGenerator } from './ship-placement-generator.js';
import { Position, ShootResult, Turn } from './types/board.js';
import { GameMode } from './types/game.js';
import { AttackStatus } from './types/messages.js';
import { Ship } from './types/ship.js';
import { BOT_PLAYER_ID } from './constants/index.js';

interface PlayerData {
  player: Player;
  ships: Ship[];
  board: Board;
}
type PlayerMap = Map<number, PlayerData>; // player id, player data

export class Game {
  private playerMap: PlayerMap = new Map();
  private boardsWithShips = 0;
  private currentPlayerId = -1;
  private isGameOverStatus = false;

  constructor(private id: number, private gameMode = GameMode.TwoPlayers) {
    if (this.gameMode === GameMode.SinglePlay) {
      const bot = new BotPlayer(this.getId());
      this.addPlayer(bot);
      this.placeShipsForPlayerId(bot.getId(), new ShipPlacementGenerator().createShipsArrangement());
    }
  }

  getId(): number {
    return this.id;
  }

  getGameMode(): GameMode {
    return this.gameMode;
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
    if (this.playerMap.size === 2) {
      console.error(`Game with id ${this.getId()} already has 2 players`);
      return;
    }

    const playerId = player.getId();

    if (this.currentPlayerId === -1 && player.getId() !== BOT_PLAYER_ID) {
      // host is first
      this.currentPlayerId = playerId;
    }
    player.setGameId(this.getId());
    this.playerMap.set(playerId, { player, board: new Board(), ships: [] });
  }

  placeShipsForPlayerId(playerId: number, ships: Ship[]): void {
    const playerData = this.playerMap.get(playerId);

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
    const playerData = this.playerMap.get(playerId);

    if (!playerData) {
      console.error(`Can't get ships: player with ${playerId} not found in game with id ${this.getId()}`);
      return [];
    }

    return playerData.ships;
  }

  performRandomAttack(playerId: number): ShootResult {
    const playerData = this.playerMap.get(playerId);

    if (!playerData) {
      console.error(
        `Can't perform random attack: player with id ${playerId} not found in game with id ${this.getId()}`
      );
      return { status: AttackStatus.Miss, position: { x: -1, y: -1 }, adjacent: null, turn: Turn.SamePlayer };
    }

    if (!this.isCurrentPlayer(playerId)) {
      console.error(`Can't perform random attack: player with id ${playerId} is not the current player`);
      return { status: AttackStatus.Miss, position: { x: -1, y: -1 }, adjacent: null, turn: Turn.SamePlayer };
    }

    const opponentId = this.getOpponentId();
    const opponentData = this.playerMap.get(opponentId);

    if (!opponentData) {
      console.error(
        `Can't perform random attack: opponent with id ${opponentId} not found in game with id ${this.getId()}`
      );
      return { status: AttackStatus.Miss, position: { x: -1, y: -1 }, adjacent: null, turn: Turn.SamePlayer };
    }

    const shootResult = opponentData.board.shootAtRandomPosition();

    if (opponentData.board.getNumberOfRemainingShips() === 0) {
      this.isGameOverStatus = true;
    }

    if (shootResult.status === AttackStatus.Miss && shootResult.turn === Turn.SwitchPlayer) {
      this.switchCurrentPlayer();
    }

    return shootResult;
  }

  attack(playerId: number, position: Position): ShootResult {
    const playerData = this.playerMap.get(playerId);

    if (!playerData) {
      console.error(`Can't perform attack: player with id ${playerId} not found in game with id ${this.getId()}`);
      return { status: AttackStatus.Miss, position: { x: -1, y: -1 }, adjacent: null, turn: Turn.SamePlayer };
    }

    const opponentId = this.getOpponentId();
    const opponentData = this.playerMap.get(opponentId);

    if (!opponentData) {
      console.error(`Can't perform attack: opponent with id ${opponentId} not found in game with id ${this.getId()}`);
      return { status: AttackStatus.Miss, position: { x: -1, y: -1 }, adjacent: null, turn: Turn.SamePlayer };
    }

    const shootResult = opponentData.board.shoot(position);

    if (opponentData.board.getNumberOfRemainingShips() === 0) {
      this.isGameOverStatus = true;
    }

    if (shootResult.status === AttackStatus.Miss && shootResult.turn === Turn.SwitchPlayer) {
      this.switchCurrentPlayer();
    }

    return shootResult;
  }

  getPlayers(): Player[] {
    return Array.from(this.playerMap.values()).map((playerData) => playerData.player);
  }

  broadcast(message: unknown): void {
    this.playerMap.forEach(({ player }) => player.send(message));
  }

  isCurrentPlayer(playerId: number): boolean {
    return playerId === this.currentPlayerId;
  }

  private getOpponentId(): number {
    const playerIds = Array.from(this.playerMap.keys());

    return playerIds[(playerIds.indexOf(this.currentPlayerId) + 1) % playerIds.length];
  }

  private switchCurrentPlayer(): void {
    this.currentPlayerId = this.getOpponentId();
  }
}
