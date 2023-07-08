import { Player } from './player.js';
import { stringifyMessage } from './helpers/stringify-message.js';
import {
  isRegistrationRequest,
  isAddShipsRequest,
  isAttackRequest,
  isRandomAttackRequest,
  isAddUserToRoomRequest,
} from './helpers/validators.js';
import { PlayerStore } from './store/player-store.js';
import { GameStore } from './store/game-store.js';
import { RoomStore } from './store/room-store.js';
import { highScores } from './store/score-table.js';
import { Position } from './types/board.js';
import {
  AttackResponse,
  AttackStatus,
  ClientMessage,
  MessageType,
  StartGameResponse,
  TurnResponse,
  RegistrationFailureResponse,
  RegistrationSuccessResponse,
  UpdateRoomResponse,
  CreateGameResponse,
  UpdateWinnersResponse,
  FinishGameResponse,
} from './types/messages.js';
import { Ship } from './types/ship.js';
import { WebSocketWithId } from './types/websocket.js';
import { Game } from './game.js';
import { Winner } from './types/player.js';

const getRegistrationErrorResponse = (errorText: string): RegistrationFailureResponse => ({
  type: MessageType.Registration,
  data: {
    error: true,
    errorText,
  },
  id: 0,
});

const getRegistrationSuccessResponse = (player: Player): RegistrationSuccessResponse => ({
  type: MessageType.Registration,
  data: {
    name: player.getName(),
    index: player.getId(),
    error: false,
  },
  id: 0,
});

export const handleRegistration = (
  message: ClientMessage,
  socket: WebSocketWithId,
  playerStore: PlayerStore
): RegistrationFailureResponse | RegistrationSuccessResponse => {
  if (!isRegistrationRequest(message)) {
    return getRegistrationErrorResponse('Registration request message have invalid format');
  }

  const playerDto = message.data;
  const existingPlayer = playerStore.get(playerDto.name);

  if (!existingPlayer) {
    const player = playerStore.add(playerDto, socket);
    console.log(
      `Registration.successful. name: ${player.name}, id: ${player.getId()}, socketId: ${player.getSocketId()}`
    );
    return getRegistrationSuccessResponse(player);
  }

  if (existingPlayer.checkPassword(playerDto.password)) {
    return getRegistrationSuccessResponse(existingPlayer);
  }

  return getRegistrationErrorResponse('Invalid password');
};

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

export const broadcastUpdateRooms = (playerStore: PlayerStore, roomStore: RoomStore): void => {
  const message: UpdateRoomResponse = {
    type: MessageType.UpdateRoom,
    data: roomStore.getAll(),
    id: 0,
  };

  console.log(`broadcast message: ${JSON.stringify(message)}`);
  playerStore.broadcast(stringifyMessage(message));
};

export const sendCreateGame = (player: Player, gameId: number, otherPlayedId: number): void => {
  const message: CreateGameResponse = {
    type: MessageType.CreateGame,
    data: {
      idGame: gameId,
      idPlayer: otherPlayedId,
    },
    id: 0,
  };

  player.send(stringifyMessage(message));
};

export const handleCreateRoom = (socket: WebSocketWithId, roomStore: RoomStore, playerStore: PlayerStore): void => {
  const player = playerStore.getBySocket(socket);

  if (!player) {
    throw new Error('Player not found');
  }

  roomStore.add([player]);
};

export const handleAddPlayerToRoom = (
  message: ClientMessage,
  ws: WebSocketWithId,
  playerStore: PlayerStore,
  roomStore: RoomStore,
  gameStore: GameStore
): Game => {
  if (!isAddUserToRoomRequest(message)) {
    throw new Error('Message have invalid format');
  }

  const roomId = message.data.indexRoom;
  const player = playerStore.getBySocket(ws);

  if (!player) {
    throw new Error('Player not found');
  }

  const room = roomStore.get(roomId);

  if (!room) {
    throw new Error('Room not found');
  }

  const otherPlayer = room.getPlayers()[0];

  const game = gameStore.add(otherPlayer);
  const gameId = game.getId();
  otherPlayer.setGameId(gameId);
  player.setGameId(gameId);
  game.addPlayer(player);
  roomStore.delete(roomId);

  sendCreateGame(player, game.getId(), otherPlayer.getId());
  sendCreateGame(otherPlayer, game.getId(), player.getId());
  broadcastUpdateRooms(playerStore, roomStore);

  return game;
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

const createUpdateWinnersResponse = (winners: Winner[]): UpdateWinnersResponse => {
  return {
    type: MessageType.UpdateWinners,
    data: winners,
    id: 0,
  };
};

const createFinishGameResponse = (winnerId: number): FinishGameResponse => {
  return {
    type: MessageType.FinishGame,
    data: {
      winPlayer: winnerId,
    },
    id: 0,
  };
};

const attack = (
  gameStore: GameStore,
  gameId: number,
  playerStore: PlayerStore,
  playerId: number,
  position: Position | null
): void => {
  const game = gameStore.get(gameId);

  if (!game) {
    console.error(`Attack: game with id ${gameId} not found`);
    return;
  }

  const shootResult = position ? game.attack(playerId, position) : game.performRandomAttack(playerId);
  game.broadcast(stringifyMessage(createAttackResponse(shootResult.position, playerId, shootResult.status)));
  if (shootResult.status === AttackStatus.Killed) {
    shootResult.adjacent.forEach((position) => {
      game.broadcast(stringifyMessage(createAttackResponse(position, playerId, AttackStatus.Miss)));
    });

    if (game.isGameOver()) {
      game.getPlayers().forEach((player) => {
        if (playerId === player.getId()) {
          highScores.addWinner(player.getName());
          playerStore.broadcast(stringifyMessage(createUpdateWinnersResponse(highScores.getTopTenPlayers())));
        }
        player.setGameId(null);
      });
      gameStore.delete(gameId);
      game.broadcast(stringifyMessage(createFinishGameResponse(playerId)));
      return;
    }
  }
  game.broadcast(stringifyMessage(createTurnResponse(game.getCurrentPlayerId())));
};

export const handleRandomAttack = (message: ClientMessage, gameStore: GameStore, playerStore: PlayerStore): void => {
  if (!isRandomAttackRequest(message)) {
    console.error(`Random attack: invalid message format`);
    return;
  }

  const { gameId, indexPlayer: playerId } = message.data;

  attack(gameStore, gameId, playerStore, playerId, null);
};

export const handleAttack = (message: ClientMessage, gameStore: GameStore, playerStore: PlayerStore): void => {
  if (!isAttackRequest(message)) {
    console.error(`Attack: invalid message format`);
    return;
  }

  const { gameId, indexPlayer: playerId, x, y } = message.data;
  attack(gameStore, gameId, playerStore, playerId, { x, y });
};
