import { Action } from '@ngrx/store';

import { PlayerStateInterface } from '../state/player.state';

export enum EnumPlayerActions {
  GetPlayer = '[Player] Get Player',
  GetPlayerSuccess = '[Player] Get Player Success'
}

export class GetPlayer implements Action {
  public readonly type = EnumPlayerActions.GetPlayer;
}

export class GetPlayerSuccess implements Action {
  public readonly type = EnumPlayerActions.GetPlayerSuccess;

  constructor(
    public payload: PlayerStateInterface
  ) { }
}

export type PlayerActions = GetPlayer | GetPlayerSuccess;
