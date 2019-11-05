import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';

import { Cell } from 'src/app/interfaces/cell.interface';
import { Ship } from 'src/app/interfaces/ship.interface';
import { ShipsData } from 'src/app/interfaces/shipsData.interface';
import { Player } from 'src/app/interfaces/player.interface';
import { AdvicesInterface } from 'src/app/interfaces/advices.interface';
import { CoordsInterface } from '../interfaces/coords.interface';

import { BattlefieldService } from './battlefield.service';
import { ShipsService } from './ships.service';
import { HttpService } from './http.service';
import { ToolsService } from './tools.service';

@Injectable({
  providedIn: 'root'
})

export class GameService {

  public playerIsShooter: boolean;
  public winner: string;
  public messages: string[];
  public readyToPlay = false;
  public gameOn = false;
  public gameOver = false;
  private enemyCoords: CoordsInterface[] = [];
  public advices: AdvicesInterface = {
    preGameAdvices: [],
    gameAdvices: []
  };
  public player: Player = {
    field: [],
    ships: [],
    username: '',
    id: Number(new Date())
  };
  public enemy: Player = {
    field: [],
    ships: [],
    username: 'computer',
    id: 0
  };

  constructor(
    private httpService: HttpService,
    private battlefieldService: BattlefieldService,
    private shipsService: ShipsService,
    private toolsService: ToolsService
  ) {
    this.httpService.getShipsData().subscribe((data: {fieldSize: number, shipsData: ShipsData[] }) => {
      const { fieldSize, shipsData } = data;
      this.shipsService.fieldSize = fieldSize;
      this.shipsService.shipsData = shipsData;
      this.battlefieldService.fieldSize = fieldSize;
      this.gameInit();
    });
    this.httpService.getAdvicesData().subscribe((data: AdvicesInterface) => {
      this.advices = data;
    });
  }

  gameInit() {
    this.winner = '';
    this.messages = [];
    this.readyToPlay = false;
    this.gameOn = false;
    this.gameOver = false;
    this.player.ships = [];
    this.player.field = this.battlefieldService.getField(this.player.ships);
    this.enemy.ships = this.shipsService.generateShips();
    this.enemy.field = this.battlefieldService.getField(this.enemy.ships);
    this.playerIsShooter = Math.round(Math.random()) ? true : false;

    this.setEnemyCoords();
  }

  private setEnemyCoords(): void {
    for (let i = 0; i < this.battlefieldService.fieldSize; i++) {
      for (let j = 0; j < this.battlefieldService.fieldSize; j++) {
        this.enemyCoords.push({
          coordX: i,
          coordY: j
        });
      }
    }
  }

  private setMissCellStatusAround(
    coords: CoordsInterface,
    target: string
  ): void {
    const changeCellStatus = (target, coordX, coordY) => {
      const isCell: boolean = this[target].field[coordX]
        && this[target].field[coordX][coordY];

      if (isCell) {
        const cell: Cell = this[target].field[coordX][coordY];

        if (!cell.isShip) { cell.cellStatus = 'miss'; }
      }
    };
    const { coordX, coordY } = coords;

    for (let i = 0; i < 3; i++) {
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
      // let whileCounter = 0;
      // while (!this.playerIsShooter && whileCounter++ < 10 && this.enemyCoords.length) {
        const coordI: number = this.toolsService.getRandom(0, this.enemyCoords.length - 1);
        const coords: CoordsInterface = this.enemyCoords.splice(coordI, 1)[0];
        this.onFire(coords.coordX, coords.coordY, 'player', 'enemy');
      // }

        if (this.playerIsShooter) {
        enemyOnFire$.unsubscribe();
        // console.log('unsubscribe');
      }

        if (!this.enemyCoords.length) {
        enemyOnFire$.unsubscribe();
        // console.log('unsubscribe');
      }

      // if (whileCounter > 10) {
      //   this.message.unshift(`ошибочка вышла, твоя очередь стрелять`)
      //   this.playerIsShooter = true
      // }
    });
  }


  onFire(
    coordX: number,
    coordY: number,
    target: string,
    shooter: string
  ): void {
    const firedCell: Cell = this[target].field[coordX][coordY];
    const { cellStatus, isShip, idShip } = firedCell;
    let message: string;

    // start if
    if (!cellStatus && !this.gameOver) {
      if (isShip) {
        firedCell.cellStatus = 'hit';
        const ship: Ship = this[target].ships.find((ship: Ship) => ship.id === idShip);
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

    if (this[target].ships.every((ship: Ship) => ship.isSunk) && !this.gameOver) {
      this.winner = this[shooter].username;
      this.messages.unshift('** Game over **', '-', '-', this.winner + ' is winner', '-');
      this.gameOver = true;
    }
  }
}
