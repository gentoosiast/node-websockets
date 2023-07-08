import { EOL } from 'node:os';
import { getRandomNumber } from './helpers/random.js';
import { Position, ShootResult } from './types/board.js';
import { AttackStatus } from './types/messages.js';
import { Ship, ShipDirection } from './types/ship.js';
import { BOARD_SIZE } from './constants/index.js';

enum PositionType {
  Empty = -1,
  Shot = -2,
}

export class Board {
  private board: number[][] = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(PositionType.Empty));
  private adjacentPositions: Map<number, Position[]> = new Map(); // ship index, array of its adjacent positions
  private shipsHealth: Map<number, number> = new Map(); // ship index, number of hits to sink

  placeShips(ships: Ship[]): void {
    ships.forEach((ship, idx) => {
      this.adjacentPositions.set(idx, this.getPositionsAdjacentToShip(ship));
      this.shipsHealth.set(idx, ship.length);
      this.placeShip(ship, idx);
    });
  }

  placeShip(ship: Ship, shipIdx: number): void {
    this.getShipPositions(ship).forEach((position) => {
      this.setPosition(position, shipIdx);
    });
  }

  shoot(position: Position): ShootResult {
    const positionValue = this.getPosition(position);
    this.setPosition(position, PositionType.Shot);

    if (positionValue === PositionType.Empty) {
      return { status: AttackStatus.Miss, position, adjacent: null };
    }

    if (positionValue >= 0) {
      const shipHealth = this.shipsHealth.get(positionValue);

      if (!shipHealth) {
        console.error(`Can't get ship health, ship with index ${positionValue} not found`);
        return { status: AttackStatus.Miss, position, adjacent: null };
      }

      if (shipHealth === 1) {
        // killed
        this.shipsHealth.delete(positionValue);
        const adjacentToShipPositions = this.adjacentPositions.get(positionValue);

        if (!adjacentToShipPositions) {
          console.error(`Can't get adjacent positions, ship with index ${positionValue} not found`);
          return { status: AttackStatus.Miss, position, adjacent: null };
        }

        return { status: AttackStatus.Killed, position, adjacent: adjacentToShipPositions };
      } else {
        this.shipsHealth.set(positionValue, shipHealth - 1);
        return { status: AttackStatus.Shot, position, adjacent: null };
      }
    }

    return { status: AttackStatus.Shot, position, adjacent: null }; // shooting on position which already has been shot
  }

  shootAtRandomPosition(): ShootResult {
    let x = -1;
    let y = -1;

    do {
      x = getRandomNumber(0, BOARD_SIZE - 1);
      y = getRandomNumber(0, BOARD_SIZE - 1);
    } while (this.getPosition({ x, y }) === PositionType.Shot);

    return this.shoot({ x, y });
  }

  getNumberOfRemainingShips(): number {
    return this.shipsHealth.size;
  }

  private isInsideBounds(position: Position): boolean {
    return position.x >= 0 && position.x < BOARD_SIZE && position.y >= 0 && position.y < BOARD_SIZE;
  }

  private getEmptyAdjacentPositions(position: Position): Position[] {
    const emptyPositions: Position[] = [];

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) {
          continue;
        }

        if (
          position.x + i >= 0 &&
          position.x + i < BOARD_SIZE &&
          position.y + j >= 0 &&
          position.y + j < BOARD_SIZE &&
          this.board[position.y + j][position.x + i] === PositionType.Empty
        ) {
          emptyPositions.push({ x: position.x + i, y: position.y + j });
        }
      }
    }

    return emptyPositions;
  }

  private getShipPositions(ship: Ship): Position[] {
    const shipPositions: Position[] = [];

    if (ship.direction === ShipDirection.Horizontal) {
      for (let i = 0; i < ship.length; i++) {
        shipPositions.push({ x: ship.position.x + i, y: ship.position.y });
      }
    } else if (ship.direction === ShipDirection.Vertical) {
      for (let i = 0; i < ship.length; i++) {
        shipPositions.push({ x: ship.position.x, y: ship.position.y + i });
      }
    }

    return shipPositions;
  }

  private getPositionAdjacentToHorizontalShip(ship: Ship): Position[] {
    const adjacentPositions = [];

    const middleLeft = { x: ship.position.x - 1, y: ship.position.y };
    const middleRight = { x: ship.position.x + ship.length, y: ship.position.y };

    if (this.isInsideBounds(middleLeft)) {
      adjacentPositions.push(middleLeft);
    }

    if (this.isInsideBounds(middleRight)) {
      adjacentPositions.push(middleRight);
    }

    for (let i = -1; i <= ship.length; i++) {
      const top = { x: ship.position.x + i, y: ship.position.y - 1 };
      const bottom = { x: ship.position.x + i, y: ship.position.y + 1 };

      if (this.isInsideBounds(top)) {
        adjacentPositions.push(top);
      }
      if (this.isInsideBounds(bottom)) {
        adjacentPositions.push(bottom);
      }
    }

    return adjacentPositions;
  }

  private getPositionAdjacentToVerticalShip(ship: Ship): Position[] {
    const adjacentPositions = [];

    const middleTop = { x: ship.position.x, y: ship.position.y - 1 };
    const middleBottom = { x: ship.position.x, y: ship.position.y + ship.length };

    if (this.isInsideBounds(middleTop)) {
      adjacentPositions.push(middleTop);
    }

    if (this.isInsideBounds(middleBottom)) {
      adjacentPositions.push(middleBottom);
    }

    for (let i = -1; i <= ship.length; i++) {
      const left = { x: ship.position.x - 1, y: ship.position.y + i };
      const right = { x: ship.position.x + 1, y: ship.position.y + i };

      if (this.isInsideBounds(left)) {
        adjacentPositions.push(left);
      }
      if (this.isInsideBounds(right)) {
        adjacentPositions.push(right);
      }
    }

    return adjacentPositions;
  }

  private getPositionsAdjacentToShip(ship: Ship): Position[] {
    if (ship.direction === ShipDirection.Horizontal) {
      return this.getPositionAdjacentToHorizontalShip(ship);
    }

    return this.getPositionAdjacentToVerticalShip(ship);
  }

  private getPosition(position: Position): number {
    return this.board[position.y][position.x];
  }

  private setPosition(position: Position, value: number): void {
    this.board[position.y][position.x] = value;
  }

  toString(): string {
    return this.board
      .map((row) => row.map((positionValue) => positionValue.toString().padStart(2, ' ')).join(' '))
      .join(EOL);
  }
}
