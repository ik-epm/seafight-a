import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';

import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.scss',
    './login.animation.scss'
  ]
})

export class LoginComponent implements OnInit {

  public myForm: FormGroup;

  constructor(
    private gameService: GameService
  ) { }

  login(): void {

    // если логин в форме отличается от текущего юзера, то подключаемся к новой игре
    if (this.myForm.value.username !== this.gameService.player.username) {

      //  <- тут надо будет отсоединиться текущему юзеру (???)

      const username = this.myForm.value.username;
      const id = username + Date.now();

      this.gameService.player.username = username;
      this.gameService.player.id = id;

      console.log(this.gameService.player.id, localStorage);
      localStorage.setItem('userID', id);
      console.log(this.gameService.player.id, localStorage);

      // открываем сокет
      this.openSocket(id);

      // инициализируем новую игру
      this.gameService.gameInit();
    }
  }


  // потом перенесем этот метод в отдельный сервис
  private openSocket(id: string) {
    // подключаемся к 'http://localhost:3000'
    const socket = new WebSocket('ws://localhost:3000');

    // если подключились успешно
    socket.onopen = () => {
      console.log(`Соединение установлено`);
      console.log(`Отправляем на сервер: \'Ваш id ${id}\'`);
      // отправляем данные
      socket.send(`Ваш id ${id}`);
    };

    // событие, которое срабатывает, когда получаем данные
    socket.onmessage = (message) => {
      console.log(`Данные с сервера получены: ${message.data}`);
    };

    // событие, которое срабатывает, когда соединение закрывается
    socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
      } else {
        // например, сервер убил процесс или сеть недоступна
        // обычно в этом случае event.code 1006
        console.log('Соединение прервано');
      }
    };

    // событие при ошибке
    socket.onerror = (error) => {
      console.log(`[Error] ${error}`);
    };
  }

  ngOnInit() {
    // данные формы логина
    this.myForm = new FormGroup({
      username: new FormControl(
        this.gameService.player.username,
        [
          Validators.required,
          Validators.pattern('[a-zA-Z]+')
        ]
      ),
      mode: new FormControl(
        {value: 'computer', disabled: true},
        [Validators.required]
      )
    });
  }
}
