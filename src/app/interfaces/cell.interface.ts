import { CoordsInterface } from './coords.interface';

export interface Cell extends CoordsInterface {
    isShip?: boolean,
    cellStatus?: string,
    idShip?: string
}
