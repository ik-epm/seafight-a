import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { WebSocketService } from 'src/app/services/websocket.service';

import { GameService } from 'src/app/services/game.service';

import { AppStateInterface } from '../../store/state/app.state';

import { SetPlayerName } from '../../store/actions/player.actions';
import { SetGame } from '../../store/actions/game.actions';

import { selectPlayerName } from '../../store/selectors/player.selector';
import {selectGameMode} from '../../store/selectors/game.selector';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [
    './login.component.scss',
    './login.animation.scss'
  ]
})

export class LoginComponent implements OnInit, OnDestroy {

  public myForm: FormGroup;
  private playerName: string;
  private mode: string;
  private destroy: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(
    private gameService: GameService,
    private wsService: WebSocketService,
    private store: Store<AppStateInterface>
  ) { }

  login(): void {

    // если логин в форме отличается от текущего юзера, то подключаемся к новой игре
    const username = this.myForm.value.username;
    const mode = this.myForm.controls.mode.value;
    console.log('mode', mode)

    if (this.playerName !== username || this.mode !== mode) {

      const id = username + Date.now();

      this.setDataState({ id, username, mode });
      this.definitionModeGame(mode, id, username);
    }
  }

  private setDataState({ username, id, mode }): void {
    this.store.dispatch(new SetPlayerName({
      username,
      id
    }));
    this.store.dispatch(new SetGame({
      mode
    }));
    // записываем в localStorage user
    localStorage.setItem('userID', id);
    localStorage.setItem('username', username);
    console.log('--- Log --- localStorage id player', localStorage);
  }

  private definitionModeGame(mode, id, username): void {
    if (mode === 'computer') {
      /*alert('Играем с ботом');*/
    } else if (mode === 'online') { // открываем сокет
      alert('Играем онлайн');
      if (this.wsService.socket) {
        this.wsService.socket.close();    //  <- тут отсоединяем текущего юзера (???)
      }
      this.wsService.openSocket(id, username);
      // this.wsService.findGameForUser(id, username)
      // this.gameService.gameInit();
    } else {
      console.log(`-- Log -- error - mode ${mode}`);
    }
    // инициализируем новую игру
    this.gameService.gameInit();
  }

  ngOnInit() {
    this.store.pipe(select(selectPlayerName), takeUntil(this.destroy)).subscribe(playerName => {
      this.playerName = playerName;
    });
    this.store.pipe(select(selectGameMode), takeUntil(this.destroy)).subscribe(mode => {
      this.mode = mode;
    });

    // данные формы логина
    this.myForm = new FormGroup({
      username: new FormControl(
        this.playerName,
        [
          Validators.required,
          Validators.pattern('[a-zA-Z]+')
        ]
      ),
      mode: new FormControl(
        this.mode,
        [Validators.required]
      )
    });
  }

  ngOnDestroy() {
    this.destroy.next(null);
    this.destroy.complete();
  }
}
