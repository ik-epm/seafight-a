import { Injectable } from '@angular/core';

import { Cell } from 'src/app/interfaces/cell.interface';
import { Ship } from 'src/app/interfaces/ship.interface';
import { CoordsInterface } from '../interfaces/coords.interface';

@Injectable({
  providedIn: 'root'
})

export class BattlefieldService {

  public fieldSize: number;

  getField(ships: Ship[]): Cell[][] {
    const field: Cell[][] = [];

    for (let coordX = 0; coordX < this.fieldSize; coordX++) {
      const rows: Cell[] = [];

      for (let coordY = 0; coordY < this.fieldSize; coordY++) {
        const isShip = false;
        const idShip = '';

        rows.push({
          coordX,
          coordY,
          isShip,
          idShip
        });
      }
      field.push(rows);
    }

    ships.forEach((ship: Ship) => {
      const { id, coords } = ship;
      coords.forEach((coordsCell: CoordsInterface) => {
        const { coordX, coordY } = coordsCell;
        const fieldCell: Cell = field[coordX][coordY];

        if (coordX === fieldCell.coordX && coordY === fieldCell.coordY) {
          fieldCell.isShip = true;
          fieldCell.idShip = id;
        }
      });
    });

    return field;
  }
}
