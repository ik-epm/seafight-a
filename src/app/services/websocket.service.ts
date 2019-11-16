import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { GameService } from './game.service';

import { AppStateInterface } from '../store/state/app.state';

import { SetGame, AddGameMessages } from '../store/actions/game.actions';
import { SetPlayer } from '../store/actions/player.actions';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  public socket: WebSocket;

  constructor(
    // private gameService: GameService,
    private store: Store<AppStateInterface>
  ) { }

  private onMessageFromServer(data) {
    switch (data.state) {
      case 'FIND_GAME':
        // если пришли данные с настройками игры (data.state = 'FIND_GAME'),
        // инициализируем игру с пришедшими с сервера данными, например:
        // Доработать метод, если игрок отвалился и ему надо вернуться в игру и тогда игровые настройки изменяются
        /*this.gameService.gameInit({ data });*/
        console.log(`Метод: 'FIND_GAME', Данные с сервера получены: ${data}`);

        //  ->  ДОРАБОТАТЬ  <-  //

        break;
      case 'START_GAME':
        // если пришли данные о готовности/неготовности игроков к игре,
        // то записываем эти данные куда нам надо, например:
        this.store.dispatch(new SetGame({
          playerIsShooter: data.playerIsShooter
        }));

        //  ->  ДОРАБОТАТЬ  <-  //

        break;
      case 'FIRE':
        // если пришли данные с обновленными настройками игры (поля игроков, простреленные клетки, статус игры и тд),
        // то обновляем аналогичные данные в клиенте, например:
        this.store.dispatch(new SetPlayer({
          field: data.player.field
        }));

        //  ->  ДОРАБОТАТЬ  <-  //

        break;
        case 'PASS':
          alert('сдался');
          this.store.dispatch(new SetGame({
            // gameOn: data.gameOn,
            gameOver: data.gameOver,
            winner: data.winner
          }));
          this.store.dispatch(new AddGameMessages(data.messages));

          //  ->  ДОРАБОТАТЬ  <-  //

          break;
        case 'TIMEOUT':
          // событие, когда вышло время
          alert('время вышло');
          this.store.dispatch(new SetGame({
            // gameOn: data.gameOn,
            gameOver: data.gameOver,
            winner: data.winner
          }));
          this.store.dispatch(new AddGameMessages(data.messages));
          break;
      default:
        break;
    }
  }

  openSocket(userID, username) {
    // подключаемся к 'http://localhost:3000'
    this.socket = new WebSocket('ws://localhost:3000');

    // если подключились успешно - находим игру игроку
    this.socket.onopen = () => {
      console.log(`Соединение установлено`);
      this.findGameForUser(userID, username);
    };

    // вешаем событие, которое срабатывает, когда получаем данные
    this.socket.onmessage = (message) => {
      // принимаем данные с настройками игры
      const data = JSON.parse(message.data);
      console.log(`Данные с сервера получены: ${message.data}`);
      this.onMessageFromServer(data);
    };

    // событие, которое срабатывает, когда соединение закрывается
    this.socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
      } else {
        // например, сервер убил процесс или сеть недоступна
        // обычно в этом случае event.code 1006
        console.log('Соединение прервано');
      }
    };

    // событие при ошибке
    this.socket.onerror = (error) => {
      console.log(`[Error] ${error}`);
    };
  }

  passGame(userID) {
    if (this.socket) {
      console.log(`Отправляем на сервер юзера`);

      // отправляем данные
      this.socket.send(JSON.stringify({ userID, state: 'PASS' }));
    } else {
      console.log('Что-то пошло не так');
    }
  }

  findGameForUser(userID, username) {
    if (this.socket) {
      console.log(`Отправляем на сервер юзера`);

      // отправляем данные
      this.socket.send(JSON.stringify({ userID, username, state: 'FIND_GAME' }));
    } else {
      console.log('Что-то пошло не так');
    }
  }

  startGame(settingsForGame) {
    if (this.socket) {

      // отправляем данные
      this.socket.send(JSON.stringify({ ...settingsForGame, state: 'START_GAME' }));
    } else {
      console.log('Что-то пошло не так');
    }
  }

  sendFiredCell(cell, userID) {
    if (this.socket) {

      // отправляем данные
      this.socket.send(JSON.stringify({ cell, userID, state: 'FIRE' }));
    } else {
      console.log('Что-то пошло не так');
    }
  }
}
