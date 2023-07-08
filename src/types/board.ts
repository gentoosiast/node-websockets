import { AttackStatus } from './messages.js';

export interface Position {
  x: number;
  y: number;
}

export type ShootResult =
  | { status: AttackStatus.Miss; positions: null }
  | { status: AttackStatus.Shot; positions: null }
  | { status: AttackStatus.Killed; positions: Position[] };
