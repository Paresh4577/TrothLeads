import { Alert } from "@models/common/alert.interface";
import { IAppAlertState } from "./appAlertState.interface";
import { ISidenavState } from "./sidenavState.interface";

export interface IAppUIState
{
  layout: string;
  theme: string;
  appAlertState: IAppAlertState;
  sidenavState: ISidenavState;
  appAlerts?: Alert[];
  toolbarState?: {}; //to be implemented later
  footerState?: {}; //to be implemented later
}
