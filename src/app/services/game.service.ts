import { Injectable } from '@angular/core';
import {interval, Observable, Subscription} from 'rxjs';
import { Store } from '@ngrx/store';

import { AppStateInterface } from '../store/state/app.state';
import { GetAdvices } from '../store/actions/advices.actions';
import { GetConfig } from '../store/actions/config.actions';

import { CellInterface } from '../interfaces/cell.interface';
import { ShipInterface } from '../interfaces/ship.interface';
import { ShipsDataInterface } from '../interfaces/shipsData.interface';
import { PlayerStateInterface } from '../store/state/player.state';
import { CoordsInterface } from '../interfaces/coords.interface';

import { BattlefieldService } from './battlefield.service';
import { ShipsService } from './ships.service';
import { HttpService } from './http.service';
import { ToolsService } from './tools.service';
import { ConfigStateInterface } from '../store/state/config.state';


@Injectable({
  providedIn: 'root'
})

export class GameService {

  public playerIsShooter: boolean;                // статус игрока (игрок стреляет или противник)
  public winner: string;
  public messages: string[];                      // лог игры
  public readyToPlay = false;                     // статус готовности (расставлены ли все корабли игрока или нет)
  public gameOn = false;                          // статус игры (началась или нет)
  public gameOver = false;                        // статус игры (закончилась или нет)
  private enemyCoords: CoordsInterface[] = [];    // массив координат для обстрела игрока компьютером
  /*public advices: AdvicesInterface = {
    preGameAdvices: [],
    gameAdvices: []
  };*/
  public player: PlayerStateInterface = {
    field: [],
    ships: [],
    username: '',
    id: ''
  };
  public enemy: PlayerStateInterface = {
    field: [],
    ships: [],
    username: 'computer',
    id: 'computer'
  };

  constructor(
    private httpService: HttpService,
    private battlefieldService: BattlefieldService,
    private shipsService: ShipsService,
    private toolsService: ToolsService,
    private store: Store<AppStateInterface>
  ) {
    // качаем настройки
    this.store.dispatch(new GetConfig());
    // качаем советы
    this.store.dispatch(new GetAdvices());
  }

  gameInit(): void {
    // обновляем настройки новой игры
    this.winner = '';
    this.messages = [];
    this.readyToPlay = false;
    this.gameOn = false;
    this.gameOver = false;
    this.shipsService.playerShipsInit();
    this.player.ships = [];
    this.player.field = this.battlefieldService.getField(this.player.ships);
    this.enemy.ships = this.shipsService.generateShips();
    this.enemy.field = this.battlefieldService.getField(this.enemy.ships);
    this.playerIsShooter = Math.round(Math.random()) ? true : false;

    // создаем массив изо всех координат поля для обстрела игрока компьютером
    this.enemyCoords = this.setEnemyCoords();
  }

  private setEnemyCoords(): CoordsInterface[] {
    const coords: CoordsInterface[] = [];
    for (let i = 0; i < this.battlefieldService.fieldSize; i++) {
      for (let j = 0; j < this.battlefieldService.fieldSize; j++) {
        coords.push({coordX: i, coordY: j});
      }
    }
    return coords;
  }

  private setMissCellStatusAround(coords: CoordsInterface, target: string): void {
    const { coordX, coordY } = coords;
    const changeCellStatus = (target, coordX, coordY) => {
      const isCell: boolean = this[target].field[coordX]
        && this[target].field[coordX][coordY];

      if (isCell) {
        const cell: CellInterface = this[target].field[coordX][coordY];

        if (!cell.isShip) { cell.cellStatus = 'miss'; }
      }
    };

    for (let i = 0; i < 3; i++) {   // 3 - количество ячеек вокруг исходной ячейки
      const countCoordY: number = coordY - 1 + i;

      changeCellStatus(target, coordX - 1, countCoordY);
      changeCellStatus(target, coordX, countCoordY);
      changeCellStatus(target, coordX + 1, countCoordY);
    }
  }

  game(): void {
    let shooter: string;

    if (this.playerIsShooter) {
      shooter = 'Player';
    } else {
      shooter = 'Computer';
      this.enemyOnFire();
    }
    this.messages.unshift(`${shooter} shoots first`);
  }

  enemyOnFire(): void {
    this.messages.unshift('-');

    const enemyOnFire$: Subscription = interval(600).subscribe(() => {
        const coordI: number = this.toolsService.getRandom(0, this.enemyCoords.length - 1);
        const coords: CoordsInterface = this.enemyCoords.splice(coordI, 1)[0];
        this.onFire(coords.coordX, coords.coordY, 'player', 'enemy');

        if (this.playerIsShooter) {
          enemyOnFire$.unsubscribe();
        }

        if (!this.enemyCoords.length) {
          enemyOnFire$.unsubscribe();
        }
    });
  }


  onFire(coordX: number, coordY: number, target: string, shooter: string): void {
    const firedCell: CellInterface = this[target].field[coordX][coordY];
    const { cellStatus, isShip, idShip } = firedCell;
    let message: string;

    // start if
    if (!cellStatus && !this.gameOver) {
      if (isShip) {
        firedCell.cellStatus = 'hit';
        const ship: ShipInterface = this[target].ships.find((ship: ShipInterface) => ship.id === idShip);
        ship.hits++;
        const { hits, size, coords } = ship;

        if (hits === size) {
          ship.isSunk = true;
          message = `${this[shooter].username} sank a ${this[target].username}'s ship on x: ${coordY + 1} y: ${coordX + 1}`;
          coords.forEach((coords: CoordsInterface) => this.setMissCellStatusAround(coords, target));
        } else {
          message = `${this[shooter].username} shot ${this[target].username} on x: ${coordY + 1} y: ${coordX + 1}`;
        }
      } else {
        firedCell.cellStatus = 'miss';
        message = `${this[shooter].username} missed ${this[target].username} on x: ${coordY + 1} y: ${coordX + 1}`;
        this.playerIsShooter = !this.playerIsShooter;
      }
      this.messages.unshift(message);
    }
    // end if

    if (this[target].ships.every((ship: ShipInterface) => ship.isSunk) && !this.gameOver) {
      this.winner = this[shooter].username;
      this.messages.unshift('** Game over **', '-', '-', this.winner + ' is winner', '-');
      this.gameOver = true;
    }
  }
}
