import { EnumGameActions, GameActions } from '../actions/game.actions';
import { GameStateInterface, initialGameState } from '../state/game.state';

export const gameReducers = (
  state = initialGameState,
  action: GameActions
): GameStateInterface => {
  const { GetGameSuccess } = EnumGameActions;
  switch (action.type) {
    case GetGameSuccess: {
      return action.payload;
    }
    default:
      return state;
  }
};
