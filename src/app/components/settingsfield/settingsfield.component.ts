import { Component } from '@angular/core';

import { ShipInterface } from 'src/app/interfaces/ship.interface';

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

  constructor(
    private shipsService: ShipsService,
    private battlefieldService: BattlefieldService,
    private gameService: GameService
  ) { }

  onAuto(): void {
    // убираем все корабли для ручной расстановки и сбрасываем статус клеток на поле игрока
    this.shipsService.allShips = new Array(this.shipsService.shipsData.length).fill([]);
    this.shipsService.occupiedPlayerCells = new Array(this.shipsService.fieldSize).fill(null).map(() => {
      return new Array(this.shipsService.fieldSize).fill(false);
    });

    // генерируем автоматически корабли
    const ships: ShipInterface[] = this.shipsService.generateShips();
    this.gameService.player.ships = ships;
    this.gameService.player.field = this.battlefieldService.getField(this.gameService.player.ships);

    // все корабли поставлены - готовы к игре
    this.gameService.readyToPlay = true;
  }

  onPlay(): void {
    // запускаем игру
    this.gameService.gameOn = true;
    this.gameService.game();
  }

  onManual(): void {
    // возвращаем все корабли в сток для их ручной расстановки
    this.shipsService.playerShipsInit();
    const ships = [];
    this.gameService.player.ships = ships;
    this.gameService.player.field = this.battlefieldService.getField(ships);
    this.gameService.readyToPlay = false;
  }
}
