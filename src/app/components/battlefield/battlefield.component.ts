import { Component, Input, } from '@angular/core';

import { Cell } from 'src/app/interfaces/cell.interface';
import { Ship } from 'src/app/interfaces/ship.interface';

import { GameService } from 'src/app/services/game.service';
import { ShipsService } from 'src/app/services/ships.service';
import { BattlefieldService } from 'src/app/services/battlefield.service';


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
    private gameService: GameService,
    private shipsService: ShipsService,
    private battlefieldService: BattlefieldService
  ) { }

  onCellClick(cell: Cell): void {
    const { coordX, coordY } = { ...cell };
    if (this.isEnemyField && this.gameService.playerIsShooter) {
      this.gameService.onFire(coordX, coordY, 'enemy', 'player');
      if (!this.gameService.playerIsShooter) { this.gameService.enemyOnFire(); }
    }


    if (!this.isEnemyField && !this.gameService.gameOn && this.shipsService.currentShip && !cell.isShip) {
      const directionShip = this.shipsService.getRandom(0, 1);

      let ship = this.shipsService.replaceShip(this.shipsService.currentShip, cell, directionShip);
      if (!ship) {
        ship = this.shipsService.replaceShip(this.shipsService.currentShip, cell, directionShip ? 0 : 1);
      }
      if (ship) {
        ship.coords.forEach((coords) => {
          this.shipsService.occupyCells(this.shipsService.occupiedPlayerCells, coords, true);
        });
        this.gameService.player.ships.push(ship);
        this.gameService.player.field = this.battlefieldService.getField(this.gameService.player.ships);
        if (this.shipsService.allShips.every(ships => ships.length === 0)) {
          this.gameService.readyToPlay = true;
        }
      }
    }

    if (!this.isEnemyField && !this.gameService.gameOn && cell.isShip) {
      const shipIndex = this.gameService.player.ships.findIndex((ship: Ship) => ship.id === cell.idShip);
      const ship = this.gameService.player.ships.splice(shipIndex, 1)[0];

      ship.coords.forEach((coords) => {
        this.shipsService.occupyCells(this.shipsService.occupiedPlayerCells, coords, false);
      });
      this.gameService.player.ships.forEach(ship => {
        ship.coords.forEach((coords) => {
          this.shipsService.occupyCells(this.shipsService.occupiedPlayerCells, coords);
        });
      });

      this.shipsService.currentShip = null;
      const newShip = this.shipsService.replaceShip(ship, ship.coords[0], ship.direction ? 0 : 1);

      if (newShip) {
        this.gameService.player.ships.push(newShip);
        this.gameService.player.field = this.battlefieldService.getField(this.gameService.player.ships);
      } else {
        this.shipsService.replaceShip(ship, ship.coords[0], ship.direction);
        this.gameService.player.ships.push(ship);
        this.gameService.player.field = this.battlefieldService.getField(this.gameService.player.ships);
      }
    }
  }
}
