import { Player } from './player.js';

export enum MessageType {
  Registration = 'reg',
}

export interface ClientMessage {
  type: MessageType;
  data: unknown;
}

export interface RegistrationRequest {
  type: MessageType.Registration;
  data: Player;
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
