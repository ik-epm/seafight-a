import { Component, Input, OnChanges } from '@angular/core';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

import { ShipsService } from 'src/app/services/ships.service';

@Component({
  selector: 'app-ships',
  templateUrl: './ships.component.html',
  styleUrls: ['./ships.component.scss']
})
export class ShipsComponent implements OnChanges {

  constructor(
    private shipsService: ShipsService
  ) { }

  @Input() shipsData;


  ngOnChanges() {
      this.shipsService.playerShipsInit();
  }

  selectShip(ship) {
    this.shipsService.currentShip = ship;
  }

  drop(event: CdkDragDrop<string[]>) {
    console.log(event);
    // if (event.previousContainer === event.container) {
    //   moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    // } else {
    //   transferArrayItem(event.previousContainer.data,
    //                     event.container.data,
    //                     event.previousIndex,
    //                     event.currentIndex);
    // }
  }

}
