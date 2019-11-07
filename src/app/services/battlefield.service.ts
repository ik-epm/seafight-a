import { Injectable } from '@angular/core';

import { CellInterface } from 'src/app/interfaces/cell.interface';
import { ShipInterface } from 'src/app/interfaces/ship.interface';
import { CoordsInterface } from '../interfaces/coords.interface';

@Injectable({
  providedIn: 'root'
})

export class BattlefieldService {

  public fieldSize: number;

  getField(ships: ShipInterface[]): CellInterface[][] {
    const field: CellInterface[][] = [];

    for (let coordX = 0; coordX < this.fieldSize; coordX++) {
      const rows: CellInterface[] = [];
      for (let coordY = 0; coordY < this.fieldSize; coordY++) {
        rows.push({
          coordX,
          coordY,
          isShip: false
        });
      }
      field.push(rows);
    }

    ships.forEach((ship: ShipInterface) => {
      const { id, coords } = ship;
      coords.forEach((coordsCell: CoordsInterface) => {
        const { coordX, coordY } = coordsCell;
        const fieldCell: CellInterface = field[coordX][coordY];

        if (coordX === fieldCell.coordX && coordY === fieldCell.coordY) {
          fieldCell.isShip = true;
          fieldCell.idShip = id;
        }
      });
    });

    return field;
  }
}
