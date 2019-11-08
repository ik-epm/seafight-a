import { Action } from '@ngrx/store';

import { GameStateInterface } from '../state/game.state';

export enum EnumGameActions {
  GetGame = '[Game] Get Game',
  GetGameSuccess = '[Game] Get Game Success'
}

export class GetGame implements Action {
  public readonly type = EnumGameActions.GetGame;
}

export class GetGameSuccess implements Action {
  public readonly type = EnumGameActions.GetGameSuccess;

  constructor(
    public payload: GameStateInterface
  ) { }
}

export type GameActions = GetGame | GetGameSuccess;
