import { Injectable } from '@angular/core';
import { Cell } from 'src/app/interfaces/cell.interface';
import { Ship } from 'src/app/interfaces/ship.interface';

@Injectable({
  providedIn: 'root'
})
export class BattlefieldService {

  constructor() { }

  fieldSize: number;

  getField(ships: Array<Ship>): Array<Array<Cell>> {
    const field: Array<Array<Cell>> = [];

    for (let coordX = 0; coordX < this.fieldSize; coordX++) {
      const rows: Array<Cell> = [];
      for (let coordY = 0; coordY < this.fieldSize; coordY++) {
        const isShip = false;
        const idShip = '';
        rows.push({coordX, coordY, isShip, idShip});
      }
      field.push(rows);
    }

    ships.forEach((ship: Ship) => {
      ship.coords.forEach((shipCell: Cell) => {
        const fieldCell = field[shipCell.coordX][shipCell.coordY];
        if (shipCell.coordX === fieldCell.coordX && shipCell.coordY === fieldCell.coordY) {
          fieldCell.isShip = true;
          fieldCell.idShip = ship.id;
        }
      });
    });

    return field;
  }
}
