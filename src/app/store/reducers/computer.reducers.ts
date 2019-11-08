import { EnumComputerActions, ComputerActions } from '../actions/computer.actions';
import { ComputerStateInterface, initialComputerState } from '../state/computer.state';

export const computerReducers = (
  state = initialComputerState,
  action: ComputerActions
): ComputerStateInterface => {
  const { GetComputerSuccess } = EnumComputerActions;
  switch (action.type) {
    case GetComputerSuccess: {
      return action.payload;
    }
    default:
      return state;
  }
};
