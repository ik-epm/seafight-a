import { Component } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';

import { AppStateInterface } from '../../store/state/app.state';
import { selectGameAdvices, selectPreGameAdvices } from '../../store/selectors/advices.selector';

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
    private gameService: GameService,
    private store: Store<AppStateInterface>
  ) { }

  // таймер, который дает советы каждые 15 секунд, начиная со второй секунды
  advice$: Subscription = timer(2e3, 15e3).subscribe(num => {
    const { gameOn, gameOver } = this.gameService;
    const generateAdvice = (advices: GameAdviceInterface[]): void => {
      // генерируем рандомный номер подсказки
      const getIndex = (): number => Math.round(Math.random() * ((num % advices.length) || 1));
      let index: number = getIndex();

      // условие для того, чтобы не показывать подряд одинаковые подсказки
      let whileCounter = 0;
      while (index === this.currentAdviceIndex && whileCounter++ < 100) {
        index = getIndex();
      }

      this.currentAdviceIndex = index;
      this.advice = advices[index];
    };

    if (gameOver) {
      this.advice = null;
    } else {
      this.store.pipe(gameOn && !gameOver
        ? select(selectGameAdvices)
        : select(selectPreGameAdvices)
      ).subscribe(advices => generateAdvice(advices));
    }
  });
}
