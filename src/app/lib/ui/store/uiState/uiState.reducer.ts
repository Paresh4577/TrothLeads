import { createReducer, on } from "@ngrx/store";
import { IAppAlertState } from "../models/appAlertState.interface";
import { IAppUIState } from "../models/appUiState.interface";
import { ISidenavState } from "../models/sidenavState.interface";
import { alertDismiss, alertRaise, sidenavClose, sidenavModeOver, sidenavModeSide, sidenavOpen } from "./ui.actions";
import { defaultMenu } from "src/app/shared/config/menu";
//Define initial states - these may come from config file

const initialSidenavState: Readonly<ISidenavState> = {
  opened: true,
  mode: "side",
  position: "left",
  size: "normal",
  menu: defaultMenu //This will be fetched from api after user is authenticated - currently getting from config
}

const initialAppAlertState: Readonly<IAppAlertState> = {
  state: "closed",
  alert: null
}

export const initialState: Readonly<IAppUIState> = {
  layout: "default-layout",
  theme: "default-theme",
  appAlertState: initialAppAlertState,
  sidenavState: initialSidenavState,
  appAlerts: []
}

export const uiStateReducer = createReducer(
  initialState,
  on(sidenavOpen, (state) => {
    //Change the sidenav state to "opened" and keep everything else same
    return { ...state, sidenavState: { ...state.sidenavState, opened: true } };
  }),
  on(sidenavClose, (state) => {
    //Change the sidenav state to "closed" and keep everything else same
    return { ...state, sidenavState: { ...state.sidenavState, opened: false } };
  }),
  on(sidenavModeOver, (state) => {
    //Change the sidenav mode to "over" and keep everything else same
    return { ...state, sidenavState: { ...state.sidenavState, mode: 'over', opened: false } }; //Close open sidenav on mode change
  }),
  on(sidenavModeSide, (state) => {
    //Change the sidenav mode to "side" and keep everything else same
    return { ...state, sidenavState: { ...state.sidenavState, mode: 'side', opened: true } }; //sidenav set to opened
  }),
  on(alertRaise, (state, action) => {
    //Add alerts to the array
    if (Array.isArray(action.alerts)) {
      return { ...state, appAlerts: [...state.appAlerts, ...action.alerts] };
    } else {
      return { ...state, appAlerts: [...state.appAlerts, action.alerts] };
    }
  }),
);


