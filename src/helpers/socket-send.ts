import { stringifyMessage } from './stringify-message.js';
import { WebSocketWithId } from '../types/websocket.js';

export const socketSend = (socket: WebSocketWithId, message: unknown): void => {
  try {
    socket.send(stringifyMessage(message));
  } catch (err) {
    if (err instanceof Error) {
      console.error(`An error happened: ${err.message}`);
    } else {
      console.error(`Unknown error: ${err}`);
    }
  }
};
