import { Action } from '@ngrx/store';

import { ComputerStateInterface } from '../state/computer.state';

export enum EnumComputerActions {
  GetComputer = '[Computer] Get Computer',
  GetComputerSuccess = '[Computer] Get Computer Success'
}

export class GetComputer implements Action {
  public readonly type = EnumComputerActions.GetComputer;
}

export class GetComputerSuccess implements Action {
  public readonly type = EnumComputerActions.GetComputerSuccess;

  constructor(
    public payload: ComputerStateInterface
  ) { }
}

export type ComputerActions = GetComputer | GetComputerSuccess;
