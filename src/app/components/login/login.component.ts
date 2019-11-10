import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { Store, select } from '@ngrx/store';

import { GameService } from 'src/app/services/game.service';

import { AppStateInterface } from '../../store/state/app.state';

import { SetPlayerName } from '../../store/actions/player.actions';
import { SetGame } from '../../store/actions/game.actions';

import { selectPlayerName } from '../../store/selectors/player.selector';

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
    private gameService: GameService,
    private store: Store<AppStateInterface>
  ) { }

  login(): void {

    // если логин в форме отличается от текущего юзера, то подключаемся к новой игре
    const username = this.myForm.value.username;
    const mode = this.myForm.controls.mode.value;
    let isUsername: boolean;

    this.store.pipe(select(selectPlayerName)).subscribe(playerName => isUsername = username !== playerName);

    if (isUsername) {

      //  <- тут надо будет отсоединиться текущему юзеру (???)

      const id = username + Date.now();

      this.store.dispatch(new SetPlayerName({
        username,
        id
      }));
      this.store.dispatch(new SetGame({
        mode
      }));
      localStorage.setItem('userID', id);

      console.log('--- Log --- localStorage id player', localStorage);

      if (mode === 'computer') { // инициализируем новую игру
        /*alert('Играем с ботом');*/
      } else { // открываем сокет
        alert('Играем онлайн');
        this.openSocket(id);
      }
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
    this.store.pipe(select(selectPlayerName)).subscribe(playerName => {
      this.myForm = new FormGroup({
        username: new FormControl(
          playerName,
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
    });
  }
}
