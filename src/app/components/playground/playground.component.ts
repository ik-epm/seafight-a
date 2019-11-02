import { Component } from '@angular/core';
import { timer } from 'rxjs';

import { AdviceInterface } from 'src/app/interfaces/advice.interface';

import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: [
    './playground.component.scss',
    './playground.animation.scss',
    './playground.adaptive.scss'
  ]
})

export class PlaygroundComponent {

  public advice: AdviceInterface;
  private currentAdviceIndex = 0;

  constructor(
    private gameService: GameService
  ) { }

  advice$ = timer(1e3, 15e3).subscribe(num => {
    // if (num % 2) {
      const generateAdvice = (adviceType: string): void => {
        const getIndex = (): number => Math.round(Math.random() * ((num % this.gameService.advices[adviceType].length) || 1));
        let index = getIndex();

        let whileCounter = 0;
        while (index === this.currentAdviceIndex && whileCounter++ < 100) {
          index = getIndex();
        }

        this.currentAdviceIndex = index;
        this.advice = this.gameService.advices[adviceType][index];
      };
      if (this.gameService.gameOn && !this.gameService.gameOver) {
        generateAdvice('gameAdvices');
      } else if (this.gameService.gameOver) {
        this.advice = null;
      } else {
        generateAdvice('preGameAdvices');
      }
    // } else {
    //   this.advice = null
    // }
  });
}
