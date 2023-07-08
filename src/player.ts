import { PlayerDto } from './types/player.js';
import { WebSocketWithId } from './types/websocket.js';

export class Player {
  constructor(
    public name: string,
    private password: string,
    private id: number,
    private socket: WebSocketWithId,
    private gameId: number | null = null
  ) {}

  getId(): number {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getSocketId(): string {
    return this.socket.id;
  }

  updateSocket(socket: WebSocketWithId): void {
    this.socket = socket;
  }

  getGameId(): number | null {
    return this.gameId;
  }

  setGameId(gameId: number | null): void {
    this.gameId = gameId;
  }

  checkPassword(password: string): boolean {
    return this.password === password;
  }

  send(message: string): void {
    this.socket.send(message);
  }

  toJSON(): PlayerDto {
    return { name: this.getName(), index: this.getId() };
  }
}
