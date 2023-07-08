import { AttackStatus } from './messages.js';

export interface Position {
  x: number;
  y: number;
}

export type ShootResult =
  | { status: AttackStatus.Miss; position: Position; adjacent: null }
  | { status: AttackStatus.Shot; position: Position; adjacent: null }
  | { status: AttackStatus.Killed; position: Position; adjacent: Position[] };
