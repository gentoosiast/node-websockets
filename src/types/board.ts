import { AttackStatus } from './messages.js';

export interface Position {
  x: number;
  y: number;
}

export enum Turn {
  SamePlayer,
  SwitchPlayer,
}

export type ShootResult =
  | { status: AttackStatus.Miss; position: Position; adjacent: null; turn: Turn }
  | { status: AttackStatus.Shot; position: Position; adjacent: null }
  | { status: AttackStatus.Killed; position: Position; shipPositions: Position[]; adjacent: Position[] };
