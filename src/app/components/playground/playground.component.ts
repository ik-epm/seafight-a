import { Component } from '@angular/core';
import { timer, Subscription } from 'rxjs';

import { GameAdviceInterface } from 'src/app/interfaces/gameAdvice.interface';

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

  public advice: GameAdviceInterface;
  private currentAdviceIndex = 0;

  constructor(
    private gameService: GameService
  ) { }

  // таймер, который дает советы каждые 15 секунд, начиная со второй секунды
  advice$: Subscription = timer(2e3, 15e3).subscribe(num => {
    const { gameOn, gameOver, advices } = this.gameService;
    const generateAdvice = (adviceType: string): void => {
      // генерируем рандомный номер подсказки
      const getIndex = (): number => Math.round(Math.random() * ((num % advices[adviceType].length) || 1));
      let index: number = getIndex();

      // условие для того, чтобы не показывать подряд одинаковые подсказки
      let whileCounter = 0;
      while (index === this.currentAdviceIndex && whileCounter++ < 100) {
        index = getIndex();
      }

      this.currentAdviceIndex = index;
      this.advice = advices[adviceType][index];
    };

    if (gameOn && !gameOver) {
      generateAdvice('gameAdvices');
    } else if (gameOver) {
      this.advice = null;
    } else {
      generateAdvice('preGameAdvices');
    }
  });
}
