import { Injectable } from '@angular/core';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  constructor(
    private gameService: GameService
  ) { }

  socket: WebSocket;

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


  private onMessageFromServer(data) {
    switch (data.state) {
      case 'FIND_GAME':
        // если пришли данные с настройками игры (data.state = 'FIND_GAME'),
        // инициализируем игру с пришедшими с сервера данными, например:
        this.gameService.gameInit(data);

        //  ->  ДОРАБОТАТЬ  <-  //

        break;
      case 'START_GAME':
        // если пришли данные о готовности/неготовности игроков к игре,
        // то записываем эти данные куда нам надо, например:
        this.gameService.playerIsShooter = data.playerIsShooter;

        //  ->  ДОРАБОТАТЬ  <-  //

        break;
      case 'FIRE':
        // если пришли данные с обновленными настройками игры (поля игроков, простреленные клетки, статус игры и тд),
        // то обновляем аналогичные данные в клиенте, например:
        this.gameService.player.field = data.player.field;

        //  ->  ДОРАБОТАТЬ  <-  //

        break;
      default:
        break;
    }
  }


  findGameForUser(userID, username) {
    if (this.socket) {
      console.log(`Отправляем на сервер юзера`);

      // отправляем данные
      this.socket.send(JSON.stringify({userID, username, state: 'FIND_GAME'}));
    } else {
      console.log('Что-то пошло не так');
    }
  }

  startGame(settingsForGame) {
    if (this.socket) {

      // отправляем данные
      this.socket.send(JSON.stringify({...settingsForGame, state: 'START_GAME'}));
    } else {
      console.log('Что-то пошло не так');
    }
  }

  sendFiredCell(cell, userID) {
    if (this.socket) {

      // отправляем данные
      this.socket.send(JSON.stringify({cell, userID, state: 'FIRE'}));
    } else {
      console.log('Что-то пошло не так');
    }
  }
}
