import { Player } from './player.js';
import { isRegistrationRequest } from './helpers/validators.js';
import { PlayerStore } from './store/player-store.js';
import { WebSocketWithId } from './types/websocket.js';
import {
  ClientMessage,
  MessageType,
  RegistrationFailureResponse,
  RegistrationSuccessResponse,
} from './types/messages.js';

const getErrorResponse = (errorText: string): RegistrationFailureResponse => ({
  type: MessageType.Registration,
  data: {
    error: true,
    errorText,
  },
  id: 0,
});

const getSuccessResponse = (player: Player): RegistrationSuccessResponse => ({
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
    return getErrorResponse('Registration request message have invalid format');
  }

  const playerDto = message.data;
  const existingPlayer = playerStore.get(playerDto.name);

  if (!existingPlayer) {
    return getSuccessResponse(playerStore.add(playerDto, socket));
  }

  if (existingPlayer.checkPassword(playerDto.password)) {
    return getSuccessResponse(existingPlayer);
  }

  return getErrorResponse('Invalid password');
};
