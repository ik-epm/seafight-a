import { EnumConfigActions, ConfigActions } from '../actions/config.actions';
import { ConfigStateInterface, initialConfigState } from '../state/config.state';

export const configReducers = (
  state = initialConfigState,
  action: ConfigActions
): ConfigStateInterface => {
  const { GetConfigSuccess } = EnumConfigActions;
  switch (action.type) {
    case GetConfigSuccess: {
      return action.payload;
    }
    default:
      return state;
  }
};
