import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators} from '@angular/forms';

import { GameService } from 'src/app/services/game.service';
import { WebSocketService } from 'src/app/services/websocket.service';

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
    private wsService: WebSocketService
  ) { }

  login(): void {

    // если логин в форме отличается от текущего юзера, то подключаемся к новой игре
    if (this.myForm.value.username !== this.gameService.player.username) {

      const username = this.myForm.value.username;
      const id = username + Date.now();

      this.gameService.player.username = username;
      this.gameService.player.id = id;

      // записываем в локалсторэдж юзверя
      console.log(this.gameService.player.id, localStorage);
      localStorage.setItem('userID', id);
      localStorage.setItem('username', username);
      console.log(this.gameService.player.id, localStorage);


      if (this.myForm.value.mode === 'computer') {
        // инициализируем новую игру
        this.gameService.gameInit(this.gameService.gameSettings);
        // alert('Играем с ботом');
      } else {
        // открываем сокет
        // alert('Играем онлайн');
        if (this.wsService.socket) {
          this.wsService.socket.close();    //  <- тут отсоединяем текущего юзера (???)
        }
        this.wsService.openSocket(id, username);
        // this.wsService.findGameForUser(id, username)
        // this.gameService.gameInit(this.gameService.gameSettings);
      }
    }
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
      mode: new FormControl('',
        [Validators.required]
      )
    });
  }
}
