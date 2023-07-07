import {
  RegistrationRequest,
  MessageType,
  ClientMessage,
  CreateRoomRequest,
  AddUserToRoomRequest,
} from '../types/messages.js';
import { PlayerRegisterDto } from '../types/player.js';

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
