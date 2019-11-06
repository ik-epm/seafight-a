import { Cell } from './cell.interface';

export interface Ship {
    id: string;
    coords: Cell[];
    type: string;
    size: number;
    direction?: number;
    hits: number;
    isSunk: boolean;
}
