import { Game } from './game.js';
import { stringifyMessage } from './helpers/stringify-message.js';
import { isAddShipsRequest, isAttackRequest, isRandomAttackRequest } from './helpers/validators.js';
import { GameStore } from './store/game-store.js';
import { Position } from './types/board.js';
import {
  AttackResponse,
  AttackStatus,
  ClientMessage,
  MessageType,
  StartGameResponse,
  TurnResponse,
} from './types/messages.js';
import { Ship } from './types/ship.js';
import { WebSocketWithId } from './types/websocket.js';

export const createGameStartResponse = (playerId: number, playerShips: Ship[]): StartGameResponse => {
  return {
    type: MessageType.StartGame,
    data: {
      ships: playerShips,
      currentPlayerIndex: playerId,
    },
    id: 0,
  };
};

export const createTurnResponse = (playerId: number): TurnResponse => {
  return {
    type: MessageType.Turn,
    data: {
      currentPlayer: playerId,
    },
    id: 0,
  };
};

export const handleAddShips = (message: ClientMessage, ws: WebSocketWithId, gameStore: GameStore): void => {
  if (!isAddShipsRequest(message)) {
    throw new Error('add_ships: Invalid message format');
  }

  const { gameId } = message.data;
  const game = gameStore.get(gameId);

  if (!game) {
    throw new Error(`Game with id ${gameId} not found`);
  }

  const playerId = message.data.indexPlayer;
  const ships = message.data.ships;
  game.placeShipsForPlayerId(playerId, ships);

  if (game.isGameReadyToStart()) {
    const players = game.getPlayers();
    players.forEach((player) => {
      const playerShips = game.getShipsForPlayerId(player.getId());
      player.send(stringifyMessage(createGameStartResponse(player.getId(), playerShips)));
      game.broadcast(stringifyMessage(createTurnResponse(game.getCurrentPlayerId())));
    });
  }
};

export const createAttackResponse = (position: Position, playerId: number, status: AttackStatus): AttackResponse => {
  return {
    type: MessageType.Attack,
    data: {
      position,
      currentPlayer: playerId,
      status,
    },
    id: 0,
  };
};

export const handleRandomAttack = (message: ClientMessage, gameStore: GameStore): void => {
  if (!isRandomAttackRequest(message)) {
    console.error(`Random attack: invalid message format`);
    return;
  }

  const { gameId, indexPlayer: playerId } = message.data;

  const game = gameStore.get(gameId);

  if (!game) {
    console.error(`Random attack: game with id ${gameId} not found`);
    return;
  }

  const shootResult = game.performRandomAttack(playerId);
  game.broadcast(stringifyMessage(createAttackResponse(shootResult.position, playerId, shootResult.status)));
  if (shootResult.status === AttackStatus.Killed) {
    shootResult.adjacent.forEach((position) => {
      game.broadcast(stringifyMessage(createAttackResponse(position, playerId, AttackStatus.Miss)));
    });
  }
  game.broadcast(stringifyMessage(createTurnResponse(game.getCurrentPlayerId())));
};

export const handleAttack = (message: ClientMessage, gameStore: GameStore): void => {
  if (!isAttackRequest(message)) {
    console.error(`Attack: invalid message format`);
    return;
  }

  const { gameId, indexPlayer: playerId, x, y } = message.data;

  const game = gameStore.get(gameId);

  if (!game) {
    console.error(`Attack: game with id ${gameId} not found`);
    return;
  }

  const shootResult = game.attack(playerId, { x, y });
  game.broadcast(stringifyMessage(createAttackResponse(shootResult.position, playerId, shootResult.status)));
  if (shootResult.status === AttackStatus.Killed) {
    shootResult.adjacent.forEach((position) => {
      game.broadcast(stringifyMessage(createAttackResponse(position, playerId, AttackStatus.Miss)));
    });
  }
  game.broadcast(stringifyMessage(createTurnResponse(game.getCurrentPlayerId())));
};
