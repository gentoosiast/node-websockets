import { WebSocketServer } from 'ws';
import {
  handleRegistration,
  broadcastUpdateRooms,
  handleAddPlayerToRoom,
  handleCreateRoom,
  handleAddShips,
  handleAttack,
  handleRandomAttack,
} from './handlers.js';
import { GameStore } from './store/game-store.js';
import { PlayerStore } from './store/player-store.js';
import { RoomStore } from './store/room-store.js';
import { generateUUID } from './helpers/uuid.js';
import { parseMessage } from './helpers/parse-message.js';
import { stringifyMessage } from './helpers/stringify-message.js';
import { ClientMessage, MessageType } from './types/messages.js';
import { WebSocketWithId } from './types/websocket.js';
import { WS_HOSTNAME, WS_HTTP_PORT } from './constants/index.js';

export const wss = new WebSocketServer({
  host: WS_HOSTNAME,
  port: WS_HTTP_PORT,
});

const playerStore = new PlayerStore();
const roomStore = new RoomStore(); // rooms with only 1 player
const gameStore = new GameStore();

const processMessage = (message: ClientMessage, ws: WebSocketWithId): void => {
  switch (message.type) {
    case MessageType.Registration: {
      handleRegistration(message, ws, playerStore, roomStore);
      break;
    }

    case MessageType.CreateRoom: {
      handleCreateRoom(ws, roomStore, playerStore);
      broadcastUpdateRooms(playerStore, roomStore);
      break;
    }

    case MessageType.AddUserToRoom: {
      handleAddPlayerToRoom(message, ws, playerStore, roomStore, gameStore);
      break;
    }

    case MessageType.AddShips: {
      handleAddShips(message, ws, gameStore);
      break;
    }

    case MessageType.Attack: {
      handleAttack(message, gameStore, playerStore);
      break;
    }

    case MessageType.RandomAttack: {
      handleRandomAttack(message, gameStore, playerStore);
      break;
    }

    default: {
      throw new Error('Unknown message type');
    }
  }
};

const handleLostConnection = (ws: WebSocketWithId): void => {
  console.log(`Lost connection with client ${ws.id}`);
};

wss.on('listening', () => {
  console.log(`Starting websocket server on ws://${WS_HOSTNAME}:${WS_HTTP_PORT}`);
});

wss.on('connection', (ws: WebSocketWithId) => {
  ws.id = generateUUID();
  ws.on('error', console.error);
  ws.on('close', () => handleLostConnection(ws));

  console.log(`Client ${ws.id} connected`);
  ws.on('message', async (data) => {
    const unparsedMessage = data.toString();
    console.log(`Got message from client: ${unparsedMessage}`);
    try {
      const message = await parseMessage(unparsedMessage);
      processMessage(message, ws);
    } catch (error) {
      console.error(error);
    }
  });
});
