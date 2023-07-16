import { WebSocketServer } from 'ws';
import { httpServer } from './http_server/index.js';
import {
  handleRegistration,
  handleAddPlayerToRoom,
  handleCreateRoom,
  handleAddShips,
  handleAttack,
  handleRandomAttack,
  handlePlayerDisconnect,
  handleSinglePlay,
} from './handlers.js';
import { GameStore } from './store/game-store.js';
import { PlayerStore } from './store/player-store.js';
import { RoomStore } from './store/room-store.js';
import { generateUUID } from './helpers/uuid.js';
import { parseMessage } from './helpers/parse-message.js';
import { ClientMessage, MessageType } from './types/messages.js';
import { WebSocketWithId } from './types/websocket.js';
import { FRONTEND_HTTP_PORT, WS_HOSTNAME, WS_HTTP_PORT } from './constants/index.js';

console.log(`Starting static HTTP server on the ${FRONTEND_HTTP_PORT} port`);
httpServer.listen(FRONTEND_HTTP_PORT);

const wss = new WebSocketServer({
  host: WS_HOSTNAME,
  port: WS_HTTP_PORT,
});

const playerStore = new PlayerStore();
const roomStore = new RoomStore(); // rooms with only 1 player
const gameStore = new GameStore();

const processMessage = (message: ClientMessage, ws: WebSocketWithId): void => {
  const handlers: { [key: string]: () => void } = {
    [MessageType.Registration]: () => handleRegistration(message, ws, playerStore, roomStore),
    [MessageType.CreateRoom]: () => handleCreateRoom(ws.id, roomStore, playerStore),
    [MessageType.AddUserToRoom]: () => handleAddPlayerToRoom(message, ws.id, playerStore, roomStore, gameStore),
    [MessageType.AddShips]: () => handleAddShips(message, gameStore),
    [MessageType.Attack]: () => handleAttack(message, gameStore, playerStore),
    [MessageType.RandomAttack]: () => handleRandomAttack(message, gameStore, playerStore),
    [MessageType.SinglePlay]: () => handleSinglePlay(ws.id, gameStore, playerStore),
  };

  if (!(message.type in handlers)) {
    console.error(`Unsupported message type: ${message.type}`);
  } else {
    handlers[message.type]();
  }
};

wss.on('listening', () => {
  console.log(`Starting websocket server on ws://${WS_HOSTNAME}:${WS_HTTP_PORT}`);
});

wss.on('connection', (ws: WebSocketWithId) => {
  ws.id = generateUUID();
  ws.on('error', console.error);
  ws.on('close', () => handlePlayerDisconnect(ws.id, roomStore, playerStore, gameStore));

  console.log(`Client ${ws.id} connected`);
  ws.on('message', async (data) => {
    const unparsedMessage = data.toString();
    console.log(`Got message from client ${ws.id}: ${unparsedMessage}`);
    try {
      const message = await parseMessage(unparsedMessage);
      processMessage(message, ws);
    } catch (error) {
      console.error(error);
    }
  });
});
