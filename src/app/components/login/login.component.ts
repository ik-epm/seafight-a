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
      this.gameService.player.username = this.myForm.value.username;
      this.gameService.gameInit();
    }
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
