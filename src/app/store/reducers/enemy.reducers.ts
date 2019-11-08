import { EnumEnemyActions, EnemyActions } from '../actions/enemy.actions';
import { EnemyStateInterface, initialEnemyState } from '../state/enemy.state';

export const enemyReducers = (
  state = initialEnemyState,
  action: EnemyActions
): EnemyStateInterface => {
  const { GetEnemySuccess } = EnumEnemyActions;
  switch (action.type) {
    case GetEnemySuccess: {
      return action.payload;
    }
    default:
      return state;
  }
};
