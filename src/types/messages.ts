import { Room } from '../room.js';
import { Position } from './board.js';
import { PlayerRegisterDto, Winner } from './player.js';
import { Ship } from './ship.js';

export enum MessageType {
  Registration = 'reg',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  CreateGame = 'create_game',
  UpdateRoom = 'update_room',
  AddShips = 'add_ships',
  StartGame = 'start_game',
  Attack = 'attack',
  Turn = 'turn',
  RandomAttack = 'randomAttack',
  UpdateWinners = 'update_winners',
  FinishGame = 'finish',
  SinglePlay = 'single_play',
}

export interface ClientMessage {
  type: MessageType;
  data: unknown;
}

export interface RegistrationRequest {
  type: MessageType.Registration;
  data: PlayerRegisterDto;
  id: 0;
}

export interface RegistrationFailureResponse {
  type: MessageType.Registration;
  data: {
    error: true;
    errorText: string;
  };
  id: 0;
}

export interface RegistrationSuccessResponse {
  type: MessageType.Registration;
  data: {
    name: string;
    index: number; // player id
    error: false;
  };
  id: 0;
}

export interface CreateRoomRequest {
  type: MessageType.CreateRoom;
  data: '';
  id: 0;
}

export interface AddUserToRoomRequest {
  type: MessageType.AddUserToRoom;
  data: {
    indexRoom: number;
  };
  id: 0;
}

export interface CreateGameResponse {
  type: MessageType.CreateGame;
  data: {
    idGame: number;
    idPlayer: number;
  };
  id: 0;
}

export interface UpdateRoomResponse {
  type: MessageType.UpdateRoom;
  data: Room[];
  id: 0;
}

export interface AddShipsRequest {
  type: MessageType.AddShips;
  data: {
    gameId: number;
    ships: Ship[];
    indexPlayer: number;
  };
  id: 0;
}

export interface StartGameResponse {
  type: MessageType.StartGame;
  data: {
    ships: Ship[];
    currentPlayerIndex: number;
  };
  id: 0;
}

export interface AttackRequest {
  type: MessageType.Attack;
  data: {
    gameId: number;
    x: number;
    y: number;
    indexPlayer: number;
  };
  id: 0;
}

export enum AttackStatus {
  Miss = 'miss',
  Killed = 'killed',
  Shot = 'shot',
}

export interface AttackResponse {
  type: MessageType.Attack;
  data: {
    position: Position;
    currentPlayer: number;
    status: AttackStatus;
  };
  id: 0;
}

export interface TurnResponse {
  type: MessageType.Turn;
  data: {
    currentPlayer: number;
  };
  id: 0;
}

export interface RandomAttackRequest {
  type: MessageType.RandomAttack;
  data: {
    gameId: number;
    indexPlayer: number;
  };
  id: 0;
}

export interface UpdateWinnersResponse {
  type: MessageType.UpdateWinners;
  data: Winner[];
  id: 0;
}

export interface FinishGameResponse {
  type: MessageType.FinishGame;
  data: {
    winPlayer: number;
  };
  id: 0;
}

export interface SinglePlayRequest {
  type: MessageType.SinglePlay;
  data: '';
  id: 0;
}
