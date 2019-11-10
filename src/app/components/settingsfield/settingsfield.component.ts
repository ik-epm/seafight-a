import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';

import { ShipInterface } from 'src/app/interfaces/ship.interface';
import { ShipsDataInterface } from '../../interfaces/shipsData.interface';

import { ShipsService } from 'src/app/services/ships.service';
import { GameService } from 'src/app/services/game.service';
import { BattlefieldService } from 'src/app/services/battlefield.service';

import { AppStateInterface } from '../../store/state/app.state';
import { SetPlayer } from '../../store/actions/player.actions';
import { SetGame } from '../../store/actions/game.actions';
import { selectConfigData } from '../../store/selectors/config.selector';
import { selectGameData } from '../../store/selectors/game.selector';

@Component({
  selector: 'app-settingsfield',
  templateUrl: './settingsfield.component.html',
  styleUrls: [
    './settingsfield.component.scss',
    './buttons.animation.scss'
  ]
})
export class SettingsfieldComponent {

  public shipsData$: ShipsDataInterface[];
  public gameOn$: boolean;
  public readyToPlay$: boolean;
  private fieldSize$: number;

  constructor(
    private shipsService: ShipsService,
    private battlefieldService: BattlefieldService,
    private gameService: GameService,
    private store: Store<AppStateInterface>
  ) {
    this.store.pipe(select(selectGameData)).subscribe(gameState => {
      const { gameOn, readyToPlay } = gameState;
      this.gameOn$ = gameOn;
      this.readyToPlay$ = readyToPlay;
    });
    this.store.pipe(select(selectConfigData)).subscribe(configState => {
      const { fieldSize, shipsData } = configState;
      this.shipsData$ = shipsData;
      this.fieldSize$ = fieldSize;
    });
  }

  onAuto(): void {
    // убираем все корабли для ручной расстановки и сбрасываем статус клеток на поле игрока
    this.shipsService.allShips = new Array(this.shipsData$.length).fill([]);
    this.shipsService.occupiedPlayerCells = new Array(this.fieldSize$).fill(null).map(() => {
      return new Array(this.fieldSize$).fill(false);
    });

    // генерируем автоматически корабли
    const ships = this.shipsService.generateShips();
    this.store.dispatch(new SetPlayer({
      ships,
      field: this.battlefieldService.getField(ships)
    }));

    // все корабли поставлены - готовы к игре
    this.store.dispatch(new SetGame({
      readyToPlay: true
    }));
  }

  onPlay(): void {
    // запускаем игру
    this.store.dispatch(new SetGame({
      gameOn: true
    }));
    this.gameService.game();
  }

  onManual(): void {
    // возвращаем все корабли в сток для их ручной расстановки
    this.shipsService.playerShipsInit();
    const ships = [];
    this.store.dispatch(new SetPlayer({
      ships,
      field: this.battlefieldService.getField(ships)
    }));
    this.store.dispatch(new SetGame({
      readyToPlay: false
    }));
  }
}
