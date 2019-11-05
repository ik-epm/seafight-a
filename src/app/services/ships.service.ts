import { Injectable } from '@angular/core';

import { Cell } from 'src/app/interfaces/cell.interface';
import { Ship } from 'src/app/interfaces/ship.interface';
import { ShipsData } from 'src/app/interfaces/shipsData.interface';
import { CoordsInterface } from 'src/app/interfaces/coords.interface';

import { ToolsService } from './tools.service';


@Injectable({
  providedIn: 'root'
})

export class ShipsService {

  public shipsData: ShipsData[];
  public fieldSize: number;

  constructor(
    private toolsService: ToolsService
  ) { }

  generateShips(): Ship[] {
    const occupiedCells = this.toolsService.createArray(
      this.fieldSize,
      null,
      () => this.toolsService.createArray(this.fieldSize, false, null)
    );

    const occupingCells = (coords: CoordsInterface) => {
      const checkOccupingCells = (coordX, coordY) => {
        const isCell: boolean = occupiedCells[coordX] !== undefined;
        if (isCell) occupiedCells[coordX][coordY] = true;
      };
      const { coordX, coordY } = coords;

      for (let i = 0; i < 3; i++) {
        const countCoordY: number = coordY - 1 + i;

        checkOccupingCells(coordX - 1, countCoordY);
        checkOccupingCells(coordX, countCoordY);
        checkOccupingCells(coordX + 1, countCoordY);
      }
    };

    const isOccupied = (
      coordX: number,
      coordY: number,
      directionX: number,
      directionY: number,
      size: number
    ) => {
      for (let i = 0; i < size; i++) {
        const countCoordX = coordX + (i * directionX);
        const countCoordY = coordY + (i * directionY);
        if (occupiedCells[countCoordX][countCoordY]) return true;
      }
      return false;
    };
    const oneTypeShips = (type: string, num: number, size: number) => {
      const callback = (type, index) => {
        const coords: Cell[] = [];
        let coordX: number;
        let coordY: number;

        const directionX: number = this.toolsService.getRandom(0, 1);       // 0 = horizontal, 1 = vertical
        const directionY: number = directionX ? 0 : 1;                      // 0 = vertical, 1 = horizontal

        do {
          const maxCoordX = this.fieldSize - 1 - (size - 1 ) * directionX;
          const maxCoordY = this.fieldSize - 1 - (size - 1 ) * directionY;
          coordX = this.toolsService.getRandom(0, maxCoordX);
          coordY = this.toolsService.getRandom(0, maxCoordY);
        } while (isOccupied(coordX, coordY, directionX, directionY, size));

        for (let i = 0; i < size; i++) {
          coords.push({
            coordX: coordX + (i * directionX),
            coordY: coordY + (i * directionY)
          });
          occupingCells(coords[i]);
        }

        return {
          id: type + '-' + (++index),
          coords,
          type,
          size,
          hits: 0,
          isSunk: false
        };
      };

      return this.toolsService.createArray(num, type, callback);
    };
    const ships: Ship[] = [];

    Object.keys(this.shipsData).forEach((ship) => {
      ships.push(...oneTypeShips(
        this.shipsData[ship].type,
        this.shipsData[ship].number,
        this.shipsData[ship].size
      ));
    });

    return ships;
  }
}
