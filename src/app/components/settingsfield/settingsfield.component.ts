import { Component } from '@angular/core';

import { Ship } from 'src/app/interfaces/ship.interface';

import { ShipsService } from 'src/app/services/ships.service';
import { GameService } from 'src/app/services/game.service';
import { BattlefieldService } from 'src/app/services/battlefield.service';

@Component({
  selector: 'app-settingsfield',
  templateUrl: './settingsfield.component.html',
  styleUrls: [
    './settingsfield.component.scss',
    './buttons.animation.scss'
  ]
})

export class SettingsfieldComponent {

  private ships: Ship[];

  constructor(
    private shipsService: ShipsService,
    private battlefieldService: BattlefieldService,
    private gameService: GameService
  ) { }

  onAuto(): void {
    this.ships = this.shipsService.generateShips();
    this.gameService.player.ships = this.ships;
    this.gameService.player.field = this.battlefieldService.getField(this.gameService.player.ships);
    this.gameService.readyToPlay = true;
  }

  onPlay(): void {
    this.gameService.gameOn = true;
    this.gameService.game();
  }
}
