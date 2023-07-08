import { stringifyMessage } from './helpers/stringify-message.js';
import { isAddShipsRequest } from './helpers/validators.js';
import { GameStore } from './store/game-store.js';
import { ClientMessage, MessageType, StartGameResponse, TurnResponse } from './types/messages.js';
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

  if (game.isReadyToStart()) {
    const players = game.getPlayers();
    players.forEach((player) => {
      const playerShips = game.getShipsForPlayerId(player.getId());
      player.send(stringifyMessage(createGameStartResponse(player.getId(), playerShips)));
      game.broadcast(stringifyMessage(createTurnResponse(game.getCurrentPlayerId())));
    });
  }
};
