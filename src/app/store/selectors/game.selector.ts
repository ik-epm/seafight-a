import { createSelector } from '@ngrx/store';

import { AppStateInterface } from '../state/app.state';
import { GameStateInterface } from '../state/game.state';

const gameState = (state: AppStateInterface) => state.game;

export const selectGameData = createSelector(
  gameState,
  (gameData: GameStateInterface): GameStateInterface => gameData
);

export const selectGameMode = createSelector(
  gameState,
  (gameData: GameStateInterface): string => gameData.mode
);

export const selectPlayerIsShooter = createSelector(
  gameState,
  (gameData: GameStateInterface): boolean => gameData.playerIsShooter
);

export const selectGameOver = createSelector(
  gameState,
  (gameData: GameStateInterface): boolean => gameData.gameOver
);

export const selectGameOn = createSelector(
  gameState,
  (gameData: GameStateInterface): boolean => gameData.gameOn
);

export const selectGameReadyToPlay = createSelector(
  gameState,
  (gameData: GameStateInterface): boolean => gameData.readyToPlay
);
