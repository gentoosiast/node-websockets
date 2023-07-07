import { Game } from './game.js';
import { Player } from './player.js';
import { stringifyMessage } from './helpers/stringify-message.js';
import { isAddUserToRoomRequest } from './helpers/validators.js';
import { GameStore } from './store/game-store.js';
import { PlayerStore } from './store/player-store.js';
import { RoomStore } from './store/room-store.js';
import { ClientMessage, CreateGameResponse, MessageType, RoomDto, UpdateRoomResponse } from './types/messages.js';
import { WebSocketWithId } from './types/websocket.js';

export class Room {
  constructor(public id: number, public players: Player[]) {}

  addPlayer(player: Player): void {
    this.players.push(player);
  }

  removePlayer(id: number): void {
    this.players = this.players.filter((player) => player.getId() !== id);
  }

  getId(): number {
    return this.id;
  }

  getPlayers(): Player[] {
    return this.players;
  }

  toJSON(): RoomDto {
    return { roomId: this.id, roomUsers: this.players };
  }
}

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
  room.addPlayer(player);

  const game = gameStore.add(room);
  roomStore.delete(roomId);
  sendCreateGame(player, game.getId(), otherPlayer.getId());
  sendCreateGame(otherPlayer, game.getId(), player.getId());
  broadcastUpdateRooms(playerStore, roomStore);

  return game;
};
