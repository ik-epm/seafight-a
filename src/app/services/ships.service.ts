import { Injectable } from '@angular/core';

import { Cell } from 'src/app/interfaces/cell.interface';
import { Ship } from 'src/app/interfaces/ship.interface';
import { ShipsData } from 'src/app/interfaces/shipsData.interface';


@Injectable({
  providedIn: 'root'
})
export class ShipsService {

  constructor() {
    this.playerShipsInit();
  }


  shipsData: Array<ShipsData>;
  fieldSize: number;
  currentShip: Ship = null;
  allShips: any[][];
  occupiedPlayerCells: boolean[][];

  getRandom(min: number, max: number): number {
    return Math.round (Math.random() * (max - min)) + min;
  }


  playerShipsInit() {
    this.allShips = [];
    this.occupiedPlayerCells = new Array(this.fieldSize).fill(null).map(() => {
      return new Array(this.fieldSize).fill(false);
    });
    if (this.shipsData) {
      this.shipsData.forEach(shipsType => {
        const ships: any[] = new Array(shipsType.number).fill(shipsType);
        this.allShips.push(ships);
      });
    }
  }



  replaceShip(currentShip: Ship, cell: Cell, direction: number): Ship {
    const coords: Array<Cell> = [];
    const directionX: number = direction;                  // 0 = horizontal, 1 = vertical
    const directionY: number = directionX ? 0 : 1;         // 0 = vertical, 1 = horizontal

    const occupiedCells = this.occupiedPlayerCells;
    const size = currentShip.size;

    if ((cell.coordX <= (this.fieldSize - 1) - (currentShip.size - 1) * directionX)
      && (cell.coordY <= (this.fieldSize - 1) - (currentShip.size - 1) * directionY)
      && !this.isOccupied(occupiedCells, size, cell.coordX, cell.coordY, directionX, directionY)) {

      for (let i = 0; i < currentShip.size; i++) {
        coords.push({coordX: cell.coordX + (i * directionX), coordY: cell.coordY + (i * directionY)});
        this.occupyCells(occupiedCells, coords[i]);
      }

      const ship: Ship = {
        id: currentShip.type + '-' + (cell.coordX) + ',' + (cell.coordY),
        coords,
        type: currentShip.type,
        size: currentShip.size,
        direction: directionX,
        hits: 0,
        isSunk: false
      };

      let currentShipIndex: number;
      this.allShips.forEach((typeShips, index) => {
        for (let i = 0; i < typeShips.length; i++) {
          if (this.currentShip && typeShips[i].type === this.currentShip.type) {
            typeShips.splice(i, 1);
            currentShipIndex = index;
            break;
          }
        }
      });

      if (currentShipIndex && this.allShips[currentShipIndex].length) {
        this.currentShip = this.allShips[currentShipIndex][0];
      } else {
        this.currentShip = null;
      }

      return ship;
    }
  }


  private isOccupied = (field: boolean[][], shipSize: number, coordX: number, coordY: number, directionX: number, directionY: number) => {
    for (let i = 0; i < shipSize; i++) {
      if (field[coordX + (i * directionX)][coordY + (i * directionY)]) {
        return true;
      }
    }
    return false;
  }


  occupyCells = (field: boolean[][], coords: Cell, occupingStatus: boolean = true) => {
    for (let i = 0; i < 3; i++) {   // 3 - количество ячеек вокруг исходной ячейки
      try { field[coords.coordX - 1] [coords.coordY - 1 + i] = occupingStatus; } catch {}
      try { field[coords.coordX]     [coords.coordY - 1 + i] = occupingStatus; } catch {}
      try { field[coords.coordX + 1] [coords.coordY - 1 + i] = occupingStatus; } catch {}
    }
  }



  generateShips(): Array<Ship> {
    const occupiedCells = new Array(this.fieldSize).fill(null).map(() => {
      return new Array(this.fieldSize).fill(false);
    });

    const oneTypeShips = (type: string, num: number, size: number) => {
      return new Array(num).fill(type).map((type, index) => {

        const coords: Array<Cell> = [];
        let coordX: number, coordY: number;

        const directionX: number = this.getRandom(0, 1);       // 0 = horizontal, 1 = vertical
        const directionY: number = directionX ? 0 : 1;         // 0 = vertical, 1 = horizontal


        do {
          const maxCoordX = this.fieldSize - 1 - (size - 1) * directionX;
          const maxCoordY = this.fieldSize - 1 - (size - 1) * directionY;
          coordX = this.getRandom(0, maxCoordX);
          coordY = this.getRandom(0, maxCoordY);
        } while (this.isOccupied (occupiedCells, size, coordX, coordY, directionX, directionY));

        for (let i = 0; i < size; i++) {
          coords.push({coordX: coordX + (i * directionX), coordY: coordY + (i * directionY)});
          this.occupyCells(occupiedCells, coords[i]);
        }

        return {
          id: type + '-' + (++index),
          coords,
          type,
          size,
          hits: 0,
          isSunk: false
        };
      });
    };

    let ships: Array<Ship> = [];
    for (const ship in this.shipsData) {
      ships = [
        ...ships,
        ...(oneTypeShips(this.shipsData[ship].type, this.shipsData[ship].number, this.shipsData[ship].size))
      ];
    }

    return ships;
  }
}
