import { Room } from './room.js';

export class Game {
  constructor(private id: number, private room: Room) {}

  getId(): number {
    return this.id;
  }
}
