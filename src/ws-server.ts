import { WebSocketServer } from 'ws';
import { handleRegistration } from './registration.js';
import { PlayerStore } from './store/player-store.js';
import { parseMessage } from './helpers/parse-message.js';
import { MessageType } from './types/messages.js';
import { WS_HOSTNAME, WS_HTTP_PORT } from './constants/index.js';
import { stringifyMessage } from './helpers/stringify-message.js';

export const wss = new WebSocketServer({
  host: WS_HOSTNAME,
  port: WS_HTTP_PORT,
});

const playerStore = new PlayerStore();

wss.on('listening', () => {
  console.log(`Starting websocket server on ws://${WS_HOSTNAME}:${WS_HTTP_PORT}`);
});

wss.on('connection', (ws) => {
  ws.on('error', console.error);

  ws.on('message', async (data) => {
    const unparsedMessage = data.toString();
    console.log(`Got message from client: ${unparsedMessage}`);
    try {
      const message = await parseMessage(unparsedMessage);

      switch (message.type) {
        case MessageType.Registration: {
          const response = handleRegistration(message, playerStore);
          ws.send(stringifyMessage(response));
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
});
