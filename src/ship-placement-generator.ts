import { getRandomNumber } from './helpers/random.js';
import { Position } from './types/board.js';
import { Ship, ShipDirection, ShipSize } from './types/ship.js';
import { BOARD_SIZE } from './constants/index.js';

enum PositionType {
  Empty = 1,
  Occupied,
}

export class ShipPlacementGenerator {
  private board: number[][] = [];

  createShipsArrangement(): Ship[] {
    this.board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(PositionType.Empty));
    const placedShips: Ship[] = [];
    const SHIP_SIZES = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

    SHIP_SIZES.forEach((shipSize) => {
      let shipDirection: keyof typeof ShipDirection = 'Horizontal';
      let possiblePosition = { x: 0, y: 0 };

      do {
        shipDirection = this.getRandomShipDirection();
        possiblePosition = this.getRandomStartingPosition(shipSize, shipDirection);
      } while (!this.tryToPlaceShip(shipSize, shipDirection, possiblePosition));

      placedShips.push({
        position: possiblePosition,
        direction: ShipDirection[shipDirection],
        length: shipSize,
        type: this.getShipType(shipSize),
      });
    });

    return placedShips;
  }

  private getShipType(shipSize: number): ShipSize {
    switch (shipSize) {
      case 1:
        return ShipSize.Small;
      case 2:
        return ShipSize.Medium;
      case 3:
        return ShipSize.Large;
      case 4:
        return ShipSize.Huge;
      default:
        return ShipSize.Small;
    }
  }

  private getRandomShipDirection(): keyof typeof ShipDirection {
    return getRandomNumber(0, 1) ? 'Vertical' : 'Horizontal';
  }

  private getRandomStartingPosition(shipSize: number, shipDirection: keyof typeof ShipDirection): Position {
    const xPos =
      shipDirection === 'Horizontal' ? getRandomNumber(0, BOARD_SIZE - shipSize) : getRandomNumber(0, BOARD_SIZE - 1);
    const yPos =
      shipDirection === 'Horizontal' ? getRandomNumber(0, BOARD_SIZE - 1) : getRandomNumber(0, BOARD_SIZE - shipSize);

    return { x: xPos, y: yPos };
  }

  private checkIfShipCanBePlaced(
    shipSize: number,
    shipDirection: keyof typeof ShipDirection,
    position: Position
  ): boolean {
    const startX = position.x > 0 ? position.x - 1 : position.x;
    const startY = position.y > 0 ? position.y - 1 : position.y;
    let endX = -1;
    let endY = -1;

    if (shipDirection === 'Horizontal') {
      endX = position.x + shipSize < BOARD_SIZE ? position.x + shipSize : position.x + shipSize - 1;
      endY = position.y < BOARD_SIZE - 1 ? position.y + 1 : position.y;
    } else {
      endX = position.x < BOARD_SIZE - 1 ? position.x + 1 : position.x;
      endY = position.y + shipSize < BOARD_SIZE ? position.y + shipSize : position.y + shipSize - 1;
    }

    for (let y = startY; y <= endY; y += 1) {
      for (let x = startX; x <= endX; x += 1) {
        if (this.board[y][x] === PositionType.Occupied) {
          return false;
        }
      }
    }

    return true;
  }

  private checkIfStartingTileIsValid(
    shipSize: number,
    shipDirection: keyof typeof ShipDirection,
    position: Position
  ): boolean {
    if (shipDirection === 'Horizontal') {
      if (position.x < 0 || position.x > BOARD_SIZE - shipSize || position.y < 0 || position.y >= BOARD_SIZE) {
        return false;
      }
    } else {
      if (position.x < 0 || position.x >= BOARD_SIZE || position.y < 0 || position.y > BOARD_SIZE - shipSize) {
        return false;
      }
    }

    return true;
  }

  private tryToPlaceShip(shipSize: number, shipDirection: keyof typeof ShipDirection, position: Position): boolean {
    const isPlacementAllowed =
      this.checkIfStartingTileIsValid(shipSize, shipDirection, position) &&
      this.checkIfShipCanBePlaced(shipSize, shipDirection, position);

    if (isPlacementAllowed) {
      if (shipDirection === 'Horizontal') {
        for (let x = position.x; x < position.x + shipSize; x += 1) {
          this.board[position.y][x] = PositionType.Occupied;
        }
      } else {
        for (let y = position.y; y < position.y + shipSize; y += 1) {
          this.board[y][position.x] = PositionType.Occupied;
        }
      }
    }

    return isPlacementAllowed;
  }
}
