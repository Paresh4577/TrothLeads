import { Alert } from "@models/common/alert.interface";
import { createAction, props } from "@ngrx/store";

//Sidenav actions
export const sidenavOpen = createAction(
  '[UI State] Open sidenav'
);

export const sidenavClose = createAction(
  '[UI State] Close sidenav'
);

export const sidenavModeOver = createAction(
  '[UI State] Sidenav mode to over'
);

export const sidenavModeSide = createAction(
  '[UI State] Sidenav mode to side'
);


//App Alert actions
export const appAlertDismiss = createAction(
  '[UI State] dismiss appAlert'
);

export const appAlertShow = createAction(
  '[UI State] show appAlert'
);

//Alert actions
export const alertRaise = createAction(
  '[UI State] add alert', props<{alerts: Alert | Alert[]}>()
);

export const alertDismiss = createAction(
  '[UI State] dismiss alert'
);
