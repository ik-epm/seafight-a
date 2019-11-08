import { CellInterface } from '../../interfaces/cell.interface';
import { ShipInterface } from '../../interfaces/ship.interface';

export interface PlayerStateInterface {
  id?: string;
  field: CellInterface[][];
  ships: ShipInterface[];
  username: string;
  playerIsShooter?: boolean;
}

export const initialPlayerState = {
  field: [],
  ships: [],
  username: ''
};
