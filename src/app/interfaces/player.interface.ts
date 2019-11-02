import { Cell } from './cell.interface';
import { Ship } from './ship.interface';

export interface Player {
    id: number,
    field: Cell[][],
    ships: Ship[],
    username: string
}
