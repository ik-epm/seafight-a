import { CoordsInterface } from './coords.interface';

export interface Ship {
    id: string,
    coords: CoordsInterface[],
    type: string,
    size: number,
    hits: number,
    isSunk: boolean
}
