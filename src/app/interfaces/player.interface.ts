import { Cell } from './cell.interface';
import { Ship } from './ship.interface';

export interface Player {
    id: string;
    field: Cell[][];
    ships: Ship[];
    username: string;
}
