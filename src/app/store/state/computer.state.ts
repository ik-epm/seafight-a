import { CellInterface } from '../../interfaces/cell.interface';
import { ShipInterface } from '../../interfaces/ship.interface';
import { CoordsInterface } from '../../interfaces/coords.interface';

export interface ComputerStateInterface {
  id: string;
  field: CellInterface[][];
  ships?: ShipInterface[];
  username: string;
  playerIsShooter?: boolean;
  enemyCoords?: CoordsInterface[];
}

export const initialComputerState = {
  id: 'computer',
  field: [],
  username: 'computer'
};
