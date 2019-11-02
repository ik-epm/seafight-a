import { Component, Input, } from '@angular/core';

import { Cell } from 'src/app/interfaces/cell.interface';

import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-battlefield',
  templateUrl: './battlefield.component.html',
  styleUrls: [
    './battlefield.component.scss',
    './battlefield.animation.scss'
  ]
})

export class BattlefieldComponent {

  @Input() isEnemyField: boolean;
  @Input() field: Cell[][];

  constructor(
    private gameService: GameService
  ) { }

  onCellClick(cell: Cell): void {
    const { coordX, coordY } = { ...cell };
    if (this.isEnemyField && this.gameService.playerIsShooter) {
      this.gameService.onFire(coordX, coordY, 'enemy', 'player');
      if (!this.gameService.playerIsShooter) this.gameService.enemyOnFire();
    }
  }
}
