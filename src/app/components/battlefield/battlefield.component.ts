import { Component, Input } from '@angular/core';

import { CellInterface } from 'src/app/interfaces/cell.interface';
import { ShipInterface } from 'src/app/interfaces/ship.interface';

import { GameService } from 'src/app/services/game.service';
import { ShipsService } from 'src/app/services/ships.service';
import { BattlefieldService } from 'src/app/services/battlefield.service';
import { ToolsService } from 'src/app/services/tools.service';


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
  @Input() field: CellInterface[][];

  constructor(
    private gameService: GameService,
    private shipsService: ShipsService,
    private battlefieldService: BattlefieldService,
    private toolsService: ToolsService
  ) { }

  onCellClick(cell: CellInterface): void {
    const { coordX, coordY } = cell;

    // условие для выстрела по противнику
    // стреляем, если поле противника и игрок - стрелок
    if (this.isEnemyField && this.gameService.playerIsShooter) {
      this.gameService.onFire(coordX, coordY, 'enemy', 'player');

      // если игрок промахнулся, то стреляет компьютер
      if (!this.gameService.playerIsShooter) {
        this.gameService.enemyOnFire();
      }
    }

    // условие для ручной установки корабля на поле
    // пробуем разместить корабль
    // если поле игрока,      игра еще не началась,       выбран какой-то корабль      и в текущей ячейке нет корабля
    if (!this.isEnemyField && !this.gameService.gameOn && this.shipsService.currentShip && !cell.isShip) {
      const shipDirection: number = this.toolsService.getRandom(0, 1);
      const {currentShip, occupiedPlayerCells: occupiedCells, allShips} = this.shipsService;

      // генерируем корабль
      let ship: ShipInterface = this.shipsService.placeShip(currentShip, cell, shipDirection);

      // если не получилось, то пробуем в другом направлении
      if (!ship) {
        ship = this.shipsService.placeShip(currentShip, cell, shipDirection ? 0 : 1);
      }

      // если корабль сгенерировался, то меняем статус у клеток корабля и вокруг на занятые
      if (ship) {
        ship.coords.forEach((coords) => {
          this.shipsService.occupyCells(occupiedCells, coords);
        });

        // добавляем корабль игроку
        this.gameService.player.ships.push(ship);

        // обновляем поле
        this.gameService.player.field = this.battlefieldService.getField(this.gameService.player.ships);

        // если все корабли установлены, то готовы к игре
        if (allShips.every(ships => !ships.length)) {
          this.gameService.readyToPlay = true;
        }
      }
    }

    // условие для смены направления корабля
    // если поле игрока,      игра еще не началась   и в текущей ячейке корабль
    if (!this.isEnemyField && !this.gameService.gameOn && cell.isShip) {
      // находим наш корабль среди кораблей игрока и вырезаем
      const shipIndex: number = this.gameService.player.ships.findIndex((ship: ShipInterface) => ship.id === cell.idShip);
      const ship: ShipInterface = this.gameService.player.ships.splice(shipIndex, 1)[0];

      // меняем статус клеток корабля и вокруг на незанятые
      ship.coords.forEach((coords) => {
        this.shipsService.occupyCells(this.shipsService.occupiedPlayerCells, coords, false);
      });

      // для остальных кораблей обновляем статус занятых клеток, если где-то было пересечение с предыдущим кораблем
      this.gameService.player.ships.forEach(ship => {
        ship.coords.forEach((coords) => {
          this.shipsService.occupyCells(this.shipsService.occupiedPlayerCells, coords);
        });
      });

      // отменяем выбор текущего корабля из стока для размещения на поле
      // чтобы работать с кораблем на поле, а не в стоке
      this.shipsService.currentShip = null;

      // генерируем новый корабль с другим направлением
      const newShip: ShipInterface = this.shipsService.placeShip(ship, ship.coords[0], ship.direction ? 0 : 1);

      // если получилось, то обновляем корабли и поле, иначе - возвращаем корабль на место
      if (newShip) {
        this.gameService.player.ships.push(newShip);
        this.gameService.player.field = this.battlefieldService.getField(this.gameService.player.ships);
      } else {
        this.shipsService.placeShip(ship, ship.coords[0], ship.direction);
        this.gameService.player.ships.push(ship);
      }
    }
  }
}
