import { EnumPlayerActions, PlayerActions } from '../actions/player.actions';
import { PlayerStateInterface, initialPlayerState } from '../state/player.state';

export const playerReducers = (
  state = initialPlayerState,
  action: PlayerActions
): PlayerStateInterface => {
  const { GetPlayerSuccess } = EnumPlayerActions;
  switch (action.type) {
    case GetPlayerSuccess: {
      return action.payload;
    }
    default:
      return state;
  }
};
