import { Player } from './player.js';
import { socketSend } from './helpers/socket-send.js';
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
import { Winner } from './types/player.js';
import { Ship } from './types/ship.js';
import { WebSocketWithId } from './types/websocket.js';

export const handlePlayerDisconnect = (
  socketId: string,
  roomStore: RoomStore,
  playerStore: PlayerStore,
  gameStore: GameStore
): void => {
  console.log(`Lost connection with client ${socketId}`);
  const player = playerStore.getBySocketId(socketId);
  if (!player) {
    return;
  }
  player.updateSocket(null);

  const room = roomStore.getRoomByPlayerId(player.getId());
  if (room) {
    roomStore.delete(room.getId());
    broadcastUpdateRooms(playerStore, roomStore);
  }

  const gameId = player.getGameId();
  if (gameId === null) {
    return;
  }

  const game = gameStore.get(gameId);
  if (!game) {
    return;
  }

  const opponent = game.getPlayers().find((p) => p.getId() !== player.getId());
  gameStore.delete(gameId);
  if (opponent) {
    highScores.addWinner(opponent.getName());
    playerStore.broadcast(createUpdateWinnersResponse(highScores.getTopWinners()));
    opponent.send(createFinishGameResponse(opponent.getId()));
  }
};

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
  playerStore: PlayerStore,
  roomStore: RoomStore
): void => {
  if (!isRegistrationRequest(message)) {
    socketSend(socket, getRegistrationErrorResponse('reg: Registration request message have invalid format'));
    return;
  }

  const playerDto = message.data;
  const existingPlayer = playerStore.get(playerDto.name);

  if (existingPlayer && !existingPlayer.checkPassword(playerDto.password)) {
    socketSend(
      socket,
      getRegistrationErrorResponse(`reg: User ${playerDto.name} already exists and provided password is incorrect`)
    );
    return;
  }

  if (existingPlayer) {
    existingPlayer.updateSocket(socket);
    existingPlayer.send(getRegistrationSuccessResponse(existingPlayer));
  } else {
    const player = playerStore.add(playerDto, socket);
    console.log(`reg: Player ${playerDto.name} is successfully registered`);
    player.send(getRegistrationSuccessResponse(player));
  }

  socketSend(socket, createUpdateRoomsResponse(roomStore));
  socketSend(socket, createUpdateWinnersResponse(highScores.getTopWinners()));
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

const createUpdateRoomsResponse = (roomStore: RoomStore): UpdateRoomResponse => {
  return {
    type: MessageType.UpdateRoom,
    data: roomStore.getAll(),
    id: 0,
  };
};

const broadcastUpdateRooms = (playerStore: PlayerStore, roomStore: RoomStore): void => {
  playerStore.broadcast(createUpdateRoomsResponse(roomStore));
};

export const sendCreateGameResponse = (player: Player, gameId: number): void => {
  const message: CreateGameResponse = {
    type: MessageType.CreateGame,
    data: {
      idGame: gameId,
      idPlayer: player.getId(),
    },
    id: 0,
  };

  player.send(message);
};

export const handleCreateRoom = (socketId: string, roomStore: RoomStore, playerStore: PlayerStore): void => {
  const player = playerStore.getBySocketId(socketId);

  if (!player) {
    console.error(`create_room: Player not found, socketId: ${socketId}`);
    return;
  }

  roomStore.add([player]);
  console.log(`create_room: room for player ${player.getName()} is successfully created`);
  broadcastUpdateRooms(playerStore, roomStore);
};

export const handleAddPlayerToRoom = (
  message: ClientMessage,
  socketId: string,
  playerStore: PlayerStore,
  roomStore: RoomStore,
  gameStore: GameStore
): void => {
  if (!isAddUserToRoomRequest(message)) {
    console.error('add_user_to_room: Message have invalid format');
    return;
  }

  const player = playerStore.getBySocketId(socketId);
  if (!player) {
    console.error(`add_user_to_room: Player not found; socketId: ${socketId}`);
    return;
  }

  const roomId = message.data.indexRoom;
  const room = roomStore.get(roomId);
  if (!room) {
    console.error(`add_user_to_room: Room with ID ${roomId} not found`);
    return;
  }

  const otherPlayer = room.getPlayers()[0];
  if (otherPlayer.getSocketId() === socketId) {
    console.error(`add_user_to_room: Player ${player.getName()} is already in room`);
    return;
  }
  const game = gameStore.create();
  const gameId = game.getId();

  game.addPlayer(otherPlayer);
  game.addPlayer(player);
  roomStore.delete(roomId);
  broadcastUpdateRooms(playerStore, roomStore);
  sendCreateGameResponse(player, gameId);
  sendCreateGameResponse(otherPlayer, gameId);
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

export const handleAddShips = (message: ClientMessage, gameStore: GameStore): void => {
  if (!isAddShipsRequest(message)) {
    console.error('add_ships: Invalid message format');
    return;
  }

  const { gameId, ships, indexPlayer: playerId } = message.data;
  const game = gameStore.get(gameId);

  if (!game) {
    console.error(`add_ships: Game with id ${gameId} not found`);
    return;
  }

  game.placeShipsForPlayerId(playerId, ships);

  if (game.isGameReadyToStart()) {
    const players = game.getPlayers();
    players.forEach((player) => {
      const playerShips = game.getShipsForPlayerId(player.getId());
      player.send(createGameStartResponse(player.getId(), playerShips));
    });
    game.broadcast(createTurnResponse(game.getCurrentPlayerId()));
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
  game.broadcast(createAttackResponse(shootResult.position, playerId, shootResult.status));
  if (shootResult.status === AttackStatus.Killed) {
    shootResult.adjacent.forEach((position) => {
      game.broadcast(createAttackResponse(position, playerId, AttackStatus.Miss));
    });

    if (game.isGameOver()) {
      game.getPlayers().forEach((player) => {
        if (playerId === player.getId()) {
          highScores.addWinner(player.getName());
          playerStore.broadcast(createUpdateWinnersResponse(highScores.getTopWinners()));
        }
        player.setGameId(null);
      });
      gameStore.delete(gameId);
      game.broadcast(createFinishGameResponse(playerId));
      return;
    }
  }
  game.broadcast(createTurnResponse(game.getCurrentPlayerId()));
};

export const handleRandomAttack = (message: ClientMessage, gameStore: GameStore, playerStore: PlayerStore): void => {
  if (!isRandomAttackRequest(message)) {
    console.error(`randomAttack: Invalid message format`);
    return;
  }

  const { gameId, indexPlayer: playerId } = message.data;
  attack(gameStore, gameId, playerStore, playerId, null);
};

export const handleAttack = (message: ClientMessage, gameStore: GameStore, playerStore: PlayerStore): void => {
  if (!isAttackRequest(message)) {
    console.error(`attack: Invalid message format`);
    return;
  }

  const { gameId, indexPlayer: playerId, x, y } = message.data;
  attack(gameStore, gameId, playerStore, playerId, { x, y });
};
