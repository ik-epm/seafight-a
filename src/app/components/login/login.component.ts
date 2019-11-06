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
    if (this.myForm.value.username !== this.gameService.player.username) {

      //  <- тут надо будет отсоединиться текущему юзеру (?)

      const username = this.myForm.value.username;
      const id = username + Date.now();

      this.gameService.player.username = username;
      this.gameService.player.id = id;


      console.log(this.gameService.player.id, localStorage);
      localStorage.setItem('userID', id);
      console.log(this.gameService.player.id, localStorage);

      this.openSocket(id);

      this.gameService.gameInit();
    }
  }

  private openSocket(id: string) {
    const socket = new WebSocket('ws://localhost:3000');

    socket.onopen = () => {
      console.log(`Соединение установлено`);
      console.log(`Отправляем на сервер: \'Ваш id ${id}\'`);
      socket.send(`Ваш id ${id}`);
    };

    socket.onmessage = (message) => {
      console.log(`Данные с сервера получены: ${message.data}`);
    };

    socket.onclose = (event) => {
      if (event.wasClean) {
        alert(`Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
      } else {
        // например, сервер убил процесс или сеть недоступна
        // обычно в этом случае event.code 1006
        alert('Соединение прервано');
      }
    };

    socket.onerror = (error) => {
      alert(`[Error] ${error}`);
    };
  }

  ngOnInit() {
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
