import { Component } from '@angular/core';
import { timer, Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';

import { GameAdviceInterface } from 'src/app/interfaces/gameAdvice.interface';
import { CellInterface } from '../../interfaces/cell.interface';

import { GameService } from 'src/app/services/game.service';

import { AppStateInterface } from '../../store/state/app.state';

import { selectGameAdvices, selectPreGameAdvices } from '../../store/selectors/advices.selector';
import { selectPlayerData } from '../../store/selectors/player.selector';
import { selectGameData } from '../../store/selectors/game.selector';
import { selectComputerField } from '../../store/selectors/computer.selector';
import { selectEnemyField } from '../../store/selectors/enemy.selector';

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
  public playerName$: string;
  public playerField$: CellInterface[][];
  public computerField$: CellInterface[][];
  public enemyField$: CellInterface[][];
  public messages$: string[];
  public gameOn$: boolean;
  public gameOver$: boolean;
  public winner$: string;
  public mode$: string;
  private currentAdviceIndex = 0;

  constructor(
    private gameService: GameService,
    private store: Store<AppStateInterface>
  ) {
    this.store.pipe(select(selectPlayerData)).subscribe(playerState => {
      const { username, field } = playerState;
      this.playerField$ = field;
      this.playerName$ = username;
    });
    this.store.pipe(select(selectGameData)).subscribe(gameState => {
      const { messages, gameOn, gameOver, winner, mode  } = gameState;
      this.messages$ = messages;
      this.gameOn$ = gameOn;
      this.gameOver$ = gameOver;
      this.winner$ = winner;
      this.mode$ = mode;
    });
    this.store.pipe(select(selectComputerField)).subscribe(computerField => this.computerField$ = computerField);
    this.store.pipe(select(selectEnemyField)).subscribe(enemyField => this.enemyField$ = enemyField);
  }

  // таймер, который дает советы каждые 15 секунд, начиная со второй секунды
  advice$: Subscription = timer(2e3, 15e3).subscribe(num => {
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

    if (this.gameOver$) {
      this.advice = null;
    } else {
      this.store.pipe(select(this.gameOn$ && !this.gameOver$
        ? selectGameAdvices
        : selectPreGameAdvices
      )).subscribe(advices => generateAdvice(advices));
    }
  });
}
