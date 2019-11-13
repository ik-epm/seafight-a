import { Injectable } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';

import { CellInterface } from '../interfaces/cell.interface';
import { ShipInterface } from '../interfaces/ship.interface';
import { CoordsInterface } from '../interfaces/coords.interface';

import { BattlefieldService } from './battlefield.service';
import { ShipsService } from './ships.service';
import { HttpService } from './http.service';
import { ToolsService } from './tools.service';

import { AppStateInterface } from '../store/state/app.state';
import { PlayerStateInterface } from '../store/state/player.state';
import { ComputerStateInterface } from '../store/state/computer.state';
import { EnemyStateInterface } from '../store/state/enemy.state';
import { GameStateInterface } from '../store/state/game.state';

import { GetAdvices } from '../store/actions/advices.actions';
import { GetConfig } from '../store/actions/config.actions';
import { SetComputer } from '../store/actions/computer.actions';
import { SetPlayer } from '../store/actions/player.actions';
import { SetGame, AddGameMessages } from '../store/actions/game.actions';

import { selectPlayerData } from '../store/selectors/player.selector';
import { selectFieldSize } from '../store/selectors/config.selector';
import { selectComputerData } from '../store/selectors/computer.selector';
import { selectGameData } from '../store/selectors/game.selector';
import { selectEnemyData } from '../store/selectors/enemy.selector';
import { WebSocketService } from './websocket.service';


@Injectable({
  providedIn: 'root'
})

export class GameService {

  private gameState: GameStateInterface;
  private playerState: PlayerStateInterface;
  private computerState: ComputerStateInterface;
  private enemyState: EnemyStateInterface;
  private fieldSize: number;
  private enemyOnFire$: Subscription;
  // добавить типизацию
  public settings = {
    playerShips: [],
    winner: '',
    messages: [],
    readyToPlay: false,
    gameOn: false,
    gameOver: false,
    playerIsShooter: Math.round(Math.random()) ? true : false
  };


  // playerIsShooter - статус игрока (игрок стреляет или противник)
  // winner - username победителя
  // messages - лог игры
  // readyToPlay - статус готовности (расставлены ли все корабли игрока или нет)
  // gameOn - статус игры (началась или нет)
  // gameOver - статус игры (закончилась или нет)
  // enemyCoords - массив координат для обстрела игрока компьютером

  constructor(
    private httpService: HttpService,
    private battlefieldService: BattlefieldService,
    private shipsService: ShipsService,
    private toolsService: ToolsService,
    private wsService: WebSocketService,
    private store: Store<AppStateInterface>
  ) {
    this.store.pipe(select(selectGameData)).subscribe(gameState => this.gameState = gameState);
    this.store.pipe(select(selectPlayerData)).subscribe(playerState => this.playerState = playerState);
    this.store.pipe(select(selectComputerData)).subscribe(computerState => this.computerState = computerState);
    this.store.pipe(select(selectEnemyData)).subscribe(enemyState => this.enemyState = enemyState);

    // качаем настройки
    this.store.dispatch(new GetConfig());
    // качаем советы
    this.store.dispatch(new GetAdvices());

    this.store.pipe(select(selectFieldSize)).subscribe(fieldSize => this.fieldSize = fieldSize);

    // const id = localStorage.getItem('userID');
    // if (id) {
    //   this.store.dispatch(new SetPlayer({
    //     username: localStorage.getItem('username')
    //   }));
    // }
    // this.gameInit();
  }

  private onGameOver = (enemy: ComputerStateInterface) => {
    this.store.dispatch(new SetGame({
      winner: enemy.username,
      gameOver: true
    }));
    this.store.dispatch(new AddGameMessages([
      '** Game over **',
      '-',
      '-',
      this.gameState.winner + ' is winner',
      '-'
    ]));
  }

  passGame() {
    this.wsService.passGame(this.playerState.id);

    if (this.gameState.mode === 'computer') {
      this.onGameOver(this.computerState);
    } else {
      this.onGameOver(this.enemyState);
    }
  }

  gameInit(): void {
    this.settings.playerIsShooter = Math.round(Math.random()) ? true : false;

    if (this.gameState.mode === 'computer') {
      const ships = this.shipsService.generateShips();
      this.shipsService.playerShipsInit();

      this.store.dispatch(new SetPlayer({
        ships: [],
        field: this.battlefieldService.getField([])
      }));
      this.store.dispatch(new SetComputer({
        ships,
        field: this.battlefieldService.getField(ships),
        enemyCoords: this.setEnemyCoords()
      }));
      this.store.dispatch(new SetGame(this.settings));
    } else {
      console.log('online');
      // (???)
      // инжектим сервис для связи с сервером
      // читаем юзера из локалсторэджа, если есть, то записываем его в локальные данные на клиенте и
      // связываемся с сервером, отправляем ему текущего юзверя
      // получаем от сервера либо данные для игры, если у этого юзера есть какая-то незавершенная игра
      // и записываем их в локальные данные на клиенте
      // либо инициализируем новую игру, если юзер на сервере есть, но открытых игр у него нет
      // (???)

      const id = localStorage.getItem('userID');
      console.log(id);

      if (id) {
        this.store.dispatch(new SetPlayer({
          username: localStorage.getItem('username')
        }));
        // this.gameInit();
      }
      // localStorage.clear();
      // console.log('clear localStorage', this.player.id, localStorage);
    }
    if (this.enemyOnFire$) this.enemyOnFire$.unsubscribe();
  }

  private setEnemyCoords(): CoordsInterface[] {
    const coords: CoordsInterface[] = [];

    for (let i = 0; i < this.fieldSize; i++) {
      for (let j = 0; j < this.fieldSize; j++) {
        coords.push({
          coordX: i,
          coordY: j
        });
      }
    }
    return coords;
  }

  private setMissCellStatusAround(coords: CoordsInterface, target: string): void {
    const { coordX, coordY } = coords;
    const changeCellStatus = (target, coordX, coordY) => {
      const targetField = this.definitionData(target).field;
      const isCell: boolean = targetField[coordX] !== undefined && targetField[coordX][coordY] !== undefined;

      if (isCell) {
        const cell: CellInterface = targetField[coordX][coordY];

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

  private definitionData = (type) => {
    if (this.gameState.mode === 'computer' && type === 'enemy') {
      return this.computerState;
    } else if (type === 'enemy') {
      return this.enemyState;
    } else {
      return this.playerState;
    }
  };

  game(): void {
    let shooter: string;

    if (this.gameState.playerIsShooter || this.gameState.mode !== 'computer') {
      shooter = this.gameState.playerIsShooter
        ? this.playerState.username
        : this.enemyState.username;
    } else {
      shooter = 'Computer';
      this.enemyOnFire();
    }

    this.store.dispatch(new AddGameMessages([ `${shooter} shoots first` ]));
  }

  enemyOnFire(): void {
    this.store.dispatch(new AddGameMessages([ '-' ]));

    this.enemyOnFire$ = interval(600).subscribe(() => {
      const enemyCoords: CoordsInterface[] = [ ...this.computerState.enemyCoords ];
      const coordI: number = this.toolsService.getRandom(0, enemyCoords.length - 1);
      const coords: CoordsInterface = enemyCoords.splice(coordI, 1)[0];

      this.store.dispatch(new SetComputer({
        enemyCoords
      }));
      // this.store.dispatch(new AddGameMessages([ '-' ]));

      this.onFire(coords.coordX, coords.coordY, 'player', 'enemy');

      if (this.gameState.playerIsShooter
        || !enemyCoords.length) {
        this.enemyOnFire$.unsubscribe();
      }
    });
  }


  onFire(
    coordX: number,
    coordY: number,
    target: string,
    shooter: string
  ): void {
    const shooterData: ComputerStateInterface = this.definitionData(shooter);
    const targetData: ComputerStateInterface = this.definitionData(target);
    const firedCell: CellInterface = targetData.field[coordX][coordY];
    const { cellStatus, isShip, idShip } = firedCell;
    const missAction = () => {
      firedCell.cellStatus = 'miss';

      this.store.dispatch(new SetGame({
        playerIsShooter: !this.gameState.playerIsShooter
      }));

      this.store.dispatch(new AddGameMessages([
        `${shooterData.username} missed ${targetData.username} on x: ${coordY + 1} y: ${coordX + 1}`
      ]));
    };
    const hitAction = () => {
      let message: string;
      firedCell.cellStatus = 'hit';
      const ship: ShipInterface = targetData.ships.find((ship: ShipInterface) => ship.id === idShip);
      ship.hits++;
      const { hits, size, coords } = ship;

      if (hits === size) {
        coords.forEach((coords: CoordsInterface) => this.setMissCellStatusAround(coords, target));
        ship.isSunk = true;

        message = `${shooterData.username} sank a ${targetData.username}'s ship on x: ${coordY + 1} y: ${coordX + 1}`;
      } else {
        message = `${shooterData.username} shot ${targetData.username} on x: ${coordY + 1} y: ${coordX + 1}`;
      }
      this.store.dispatch(new AddGameMessages([ message ]));
    };

    // start if
    if (!cellStatus && !this.gameState.gameOver) {
      isShip ? hitAction() : missAction();
    }

    // end if
    if (targetData.ships.every((ship: ShipInterface) => ship.isSunk) && !this.gameState.gameOver) {
      this.onGameOver(shooterData);

      // this.store.dispatch(new SetGame({
      //   winner: shooterData.username,
      //   gameOver: true
      // }));
      // this.store.dispatch(new AddGameMessages([
      //   '** Game over **',
      //   '-',
      //   '-',
      //   this.gameState.winner + ' is winner',
      //   '-'
      // ]));
    }
  }
}
