import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { BattlefieldService } from './battlefield.service';
import { ShipsService } from './ships.service';

import { AppStateInterface } from '../store/state/app.state';

import { SetGame, AddGameMessages } from '../store/actions/game.actions';
import { SetPlayer } from '../store/actions/player.actions';
import { SetEnemy } from '../store/actions/enemy.actions';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  public socket: WebSocket;

  constructor(
    private shipsService: ShipsService,
    private battlefieldService: BattlefieldService,
    private store: Store<AppStateInterface>
  ) { }

  private onMessageFromServer(data) {
    console.log(`Metod: ${data.state}, data:`, data);
    switch (data.state) {
      case 'FIND_GAME':
        // если пришли данные с настройками игры (data.state = 'FIND_GAME'),
        // инициализируем игру с пришедшими с сервера данными, например:
        this.setDataStateBeginingGame(data);
        break;

      case 'START_GAME':
        // если пришли данные о готовности/неготовности игроков к игре,
        // то записываем эти данные куда нам надо, например:
        this.setDataStateStartingGame(data);
        break;

      case 'FIRE':
        // если пришли данные с обновленными настройками игры (поля игроков, простреленные клетки, статус игры и тд),
        // то обновляем аналогичные данные в клиенте, например:
        this.setDataStateFire(data);
        break;

      case 'PASS':
        this.setDataStatePassGame(data);
        break;
      case 'TIMEOUT':
        this.setDataStateTimeoutGame(data);
        break;

      case 'CLOSE':
        this.setDataStateCloseGame(data);
        break;

      default:
        console.log(`== Log Error state property from the server response: ${data}`);
    }
  }

  private setDataStateBeginingGame(data) {
    this.store.dispatch(new SetPlayer({
      ships: data.player.ships,
      field: data.player.field || this.battlefieldService.getField([]),
      username: localStorage.getItem('username')
    }));
    this.store.dispatch(new SetEnemy({
      field: data.enemy.field || this.battlefieldService.getField([]),
      username: data.enemy.username
    }));
    this.store.dispatch(new SetGame({
      gameOver: data.gameOver,
      gameOn: data.gameOn,
      messages: data.messages,
      winner: data.winner,
      playerIsShooter: data.playerIsShooter,
      mode: 'online'
    }));
    if (!data.gameOn) this.shipsService.playerShipsInit();
  }

  private setDataStateStartingGame(data) {
    const { playerIsShooter } = data;
    this.store.dispatch(new SetGame({
      playerIsShooter,
      gameOn: true,
      searchEnemy: false
    }));
    //  ->  ДОРАБОТАТЬ  <-  //
  }

  private setDataStateFire(data) {
    this.store.dispatch(new SetGame({
      gameOver: data.gameOver,
      gameOn: data.gameOn,
      messages: data.messages,
      winner: data.winner,
      playerIsShooter: data.playerIsShooter,
      mode: 'online'
    }));
    this.store.dispatch(new SetPlayer({
      ships: data.player.ships,
      field: data.player.field,
      username: localStorage.getItem('username')
    }));
    this.store.dispatch(new SetEnemy({
      field: data.enemy.field,
      username: data.enemy.username
    }));
  }

  private setDataStatePassGame(data) {
    this.store.dispatch(new SetGame({
      gameOver: data.gameOver,
      winner: data.winner
    }));
    this.store.dispatch(new AddGameMessages(data.messages));

    //  ->  ДОРАБОТАТЬ (???) <-  //
  }

  private setDataStateTimeoutGame(data) {
    this.store.dispatch(new SetGame({
      gameOver: data.gameOver,
      winner: data.winner
    }));
    this.store.dispatch(new AddGameMessages(data.messages));
  }

  private setDataStateCloseGame(data) {
    this.store.dispatch(new AddGameMessages(data.messages));
  }

  openSocket(userID, username): void {
    // подключаемся к 'http://localhost:3000'
    this.socket = new WebSocket('ws://localhost:3000');

    // если подключились успешно - находим игру игроку
    this.socket.onopen = () => {
      console.log(`Connection is done`);
      this.findGameForUser(userID, username);
    };

    // вешаем событие, которое срабатывает, когда получаем данные
    this.socket.onmessage = (message) => {
      // принимаем данные с настройками игры
      console.log(message);
      const data = JSON.parse(message.data);
      console.log(`onmessage - Данные с сервера получены: ${message.data}`);
      this.onMessageFromServer(data);
    };

    // событие, которое срабатывает, когда соединение закрывается
    this.socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`Connection closed, code: ${event.code} reason: ${event.reason}`);
      } else {
        // например, сервер убил процесс или сеть недоступна
        // обычно в этом случае event.code 1006
        console.log('Connection is broken');
      }
    };

    // событие при ошибке
    this.socket.onerror = (error) => {
      console.log(`== Log Error unknown socket: ${error}`);
    };
  }

  passGame(userID) {
    if (this.socket) {
      console.log(`Send to the user's server`);

      // отправляем данные
      this.socket.send(JSON.stringify({ userID, state: 'PASS' }));
    } else {
      console.log(`== Log Error socket connection while surrender game: ${this.socket}`);
    }
  }

  findGameForUser(userID, username) {
    if (this.socket) {
      console.log(`Отправляем на сервер юзера`);

      // отправляем данные
      this.socket.send(JSON.stringify({ userID, username, state: 'FIND_GAME' }));
    } else {
      console.log(`== Log Error socket connection in the search game: ${this.socket}`);
    }
  }

  startGame(settingsForGame) {
    if (this.socket) {

      // отправляем данные
      this.socket.send(JSON.stringify({ ...settingsForGame, state: 'START_GAME' }));
    } else {
      console.log(`== Log Error socket connection at game start: ${this.socket}`);
    }
  }

  sendFiredCell(cell, userID) {
    if (this.socket) {

      // отправляем данные
      this.socket.send(JSON.stringify({ cell, userID, state: 'FIRE' }));
    } else {
      console.log(`== Log Error socket connection when sending shots: ${this.socket}`);
    }
  }
}
