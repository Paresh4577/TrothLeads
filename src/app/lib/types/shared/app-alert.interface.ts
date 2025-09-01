import { GnxAlertAppearance, GnxAlertAutoCloseDuration, GnxAlertLevel, GnxAlertType } from "./alert.types";

export interface IAppAlert {
  message: string;
  title?: string;
  type: GnxAlertType;
  canDismiss?: boolean;
  dismissed?: boolean;
  autoClose?: boolean;
  duration?: GnxAlertAutoCloseDuration;
  appearance?: GnxAlertAppearance;
  showIcon?: boolean;
  level?: GnxAlertLevel
}

// export class AppAlert {

// }
