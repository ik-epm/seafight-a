import { Action } from '@ngrx/store';

import { EnemyStateInterface } from '../state/enemy.state';

export enum EnumEnemyActions {
  GetEnemy = '[Enemy] Get Enemy',
  GetEnemySuccess = '[Enemy] Get Enemy Success'
}

export class GetEnemy implements Action {
  public readonly type = EnumEnemyActions.GetEnemy;
}

export class GetEnemySuccess implements Action {
  public readonly type = EnumEnemyActions.GetEnemySuccess;

  constructor(
    public payload: EnemyStateInterface
  ) { }
}

export type EnemyActions = GetEnemy | GetEnemySuccess;
