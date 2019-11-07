import { CellInterface } from './cell.interface';
import { ShipInterface } from './ship.interface';

export interface PlayerInterface {
    id: string,
    field: CellInterface[][],
    ships: ShipInterface[],
    username: string
}
