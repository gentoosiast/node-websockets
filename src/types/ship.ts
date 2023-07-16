import { Position } from './board.js';

export enum ShipSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Huge = 'huge',
}

export const ShipDirection = {
  Horizontal: false,
  Vertical: true,
};

export interface Ship {
  position: Position;
  direction: typeof ShipDirection.Horizontal | typeof ShipDirection.Vertical;
  length: number;
  type: ShipSize;
}
