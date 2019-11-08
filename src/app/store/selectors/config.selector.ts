import { createSelector } from '@ngrx/store';

import { AppStateInterface } from '../state/app.state';
import { ConfigStateInterface } from '../state/config.state';

import { ShipsDataInterface } from '../../interfaces/shipsData.interface';

const configState = (state: AppStateInterface) => state.config;

export const selectConfig = createSelector(
  configState,
  (config: ConfigStateInterface) => config
);

export const selectFieldSize = createSelector(
  selectConfig,
  (config: ConfigStateInterface): number => config.fieldSize
);

export const selectShipsData = createSelector(
  selectConfig,
  (config: ConfigStateInterface): ShipsDataInterface[] => config.shipsData
);
