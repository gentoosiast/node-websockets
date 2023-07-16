import { Position } from '../types/board.js';
import {
  RegistrationRequest,
  MessageType,
  ClientMessage,
  CreateRoomRequest,
  AddUserToRoomRequest,
  AddShipsRequest,
  AttackRequest,
  RandomAttackRequest,
  SinglePlayRequest,
} from '../types/messages.js';
import { PlayerRegisterDto } from '../types/player.js';
import { Ship, ShipSize } from '../types/ship.js';

export const isMemberOfStringEnum = <T>(enumObj: { [key: string]: T }, value: unknown): value is T => {
  if (typeof value === 'string' && Object.values(enumObj).includes(value as T)) {
    return true;
  }

  return false;
};

export const isPlayerDto = (value: unknown): value is PlayerRegisterDto => {
  if (
    value &&
    typeof value === 'object' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'password' in value &&
    typeof value.password === 'string'
  ) {
    return true;
  }

  return false;
};

export const isClientMessage = (value: unknown): value is ClientMessage => {
  if (
    value &&
    typeof value === 'object' &&
    'type' in value &&
    isMemberOfStringEnum(MessageType, value.type) &&
    'data' in value
  ) {
    return true;
  }

  return false;
};

export const isRegistrationRequest = (value: unknown): value is RegistrationRequest => {
  if (
    value &&
    typeof value === 'object' &&
    'type' in value &&
    value.type === MessageType.Registration &&
    'data' in value &&
    isPlayerDto(value.data) &&
    'id' in value &&
    value.id === 0
  ) {
    return true;
  }

  return false;
};

export const isCreateRoomRequest = (value: unknown): value is CreateRoomRequest => {
  if (
    value &&
    typeof value === 'object' &&
    'type' in value &&
    value.type === MessageType.CreateRoom &&
    'data' in value &&
    value.data === '' &&
    'id' in value &&
    value.id === 0
  ) {
    return true;
  }

  return false;
};

export const isAddUserToRoomRequest = (value: unknown): value is AddUserToRoomRequest => {
  if (
    value &&
    typeof value === 'object' &&
    'type' in value &&
    value.type === MessageType.AddUserToRoom &&
    'data' in value &&
    value.data &&
    typeof value.data === 'object' &&
    'indexRoom' in value.data &&
    typeof value.data.indexRoom === 'number' &&
    'id' in value &&
    value.id === 0
  ) {
    return true;
  }

  return false;
};

export const isPosition = (value: unknown): value is Position => {
  if (
    value &&
    typeof value === 'object' &&
    'x' in value &&
    typeof value.x === 'number' &&
    'y' in value &&
    typeof value.y === 'number'
  ) {
    return true;
  }

  return false;
};

export const isShip = (value: unknown): value is Ship => {
  if (
    value &&
    typeof value === 'object' &&
    'position' in value &&
    isPosition(value.position) &&
    'direction' in value &&
    typeof value.direction === 'boolean' &&
    'length' in value &&
    typeof value.length === 'number' &&
    'type' in value &&
    isMemberOfStringEnum(ShipSize, value.type)
  ) {
    return true;
  }

  return false;
};

export const isAddShipsRequest = (value: unknown): value is AddShipsRequest => {
  if (
    value &&
    typeof value === 'object' &&
    'type' in value &&
    value.type === MessageType.AddShips &&
    'data' in value &&
    value.data &&
    typeof value.data === 'object' &&
    'gameId' in value.data &&
    typeof value.data.gameId === 'number' &&
    'ships' in value.data &&
    Array.isArray(value.data.ships) &&
    value.data.ships.every((ship) => isShip(ship)) &&
    'indexPlayer' in value.data &&
    typeof value.data.indexPlayer === 'number' &&
    'id' in value &&
    value.id === 0
  ) {
    return true;
  }

  return false;
};

export const isAttackRequest = (value: unknown): value is AttackRequest => {
  if (
    value &&
    typeof value === 'object' &&
    'type' in value &&
    value.type === MessageType.Attack &&
    'data' in value &&
    value.data &&
    typeof value.data === 'object' &&
    'gameId' in value.data &&
    typeof value.data.gameId === 'number' &&
    'x' in value.data &&
    typeof value.data.x === 'number' &&
    'y' in value.data &&
    typeof value.data.y === 'number' &&
    'indexPlayer' in value.data &&
    typeof value.data.indexPlayer === 'number' &&
    'id' in value &&
    value.id === 0
  ) {
    return true;
  }

  return false;
};

export const isRandomAttackRequest = (value: unknown): value is RandomAttackRequest => {
  if (
    value &&
    typeof value === 'object' &&
    'type' in value &&
    value.type === MessageType.RandomAttack &&
    'data' in value &&
    value.data &&
    typeof value.data === 'object' &&
    'gameId' in value.data &&
    typeof value.data.gameId === 'number' &&
    'indexPlayer' in value.data &&
    typeof value.data.indexPlayer === 'number' &&
    'id' in value &&
    value.id === 0
  ) {
    return true;
  }

  return false;
};

export const isSinglePlayRequest = (value: unknown): value is SinglePlayRequest => {
  if (
    value &&
    typeof value === 'object' &&
    'type' in value &&
    value.type === MessageType.SinglePlay &&
    'data' in value &&
    value.data === '' &&
    'id' in value &&
    value.id === 0
  ) {
    return true;
  }

  return false;
};
