import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { ShipsService } from 'src/app/services/ships.service';

@Component({
  selector: 'app-ships',
  templateUrl: './ships.component.html',
  styleUrls: ['./ships.component.scss']
})
export class ShipsComponent implements OnInit {

  constructor(
    private gameService: GameService,
    private shipsService: ShipsService
  ) { }

  ships = [];

  ngOnInit() {
    // this.ships = this.shipsService.
  }

}
