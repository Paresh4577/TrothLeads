import { IAppUIState } from "./appUiState.interface";

export interface IAppAlertState {
  state: "opened" | "closed",
  alert?: IAppUIState //TODO: this may be an array, in case multiple messages are to be handled
}
