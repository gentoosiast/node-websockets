import { isRegistrationRequest } from './helpers/validators.js';
import { PlayerStore } from './store/player-store.js';
import {
  ClientMessage,
  MessageType,
  RegistrationFailureResponse,
  RegistrationSuccessResponse,
} from './types/messages.js';
import { Player } from './types/player.js';

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
    name: player.name,
    index: player.index,
    error: false,
  },
  id: 0,
});

export const handleRegistration = (
  message: ClientMessage,
  playerStore: PlayerStore
): RegistrationFailureResponse | RegistrationSuccessResponse => {
  if (!isRegistrationRequest(message)) {
    return getErrorResponse('Registration request message have invalid format');
  }

  const playerDto = message.data;
  const existingPlayer = playerStore.get(playerDto.name);

  if (!existingPlayer) {
    return getSuccessResponse(playerStore.add(playerDto));
  }

  if (existingPlayer.password === playerDto.password) {
    return getSuccessResponse(existingPlayer);
  }

  return getErrorResponse('Invalid password');
};
