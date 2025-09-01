import { SidenavMode, SidenavPosition, SidenavSize, SidenavState } from "@lib/ui/components/sidenav/sidenav.types";
import { GnxMenuItem } from "@models/navigation/gnxMenutem.interface";

export interface ISidenavState {
  opened: boolean;
  position: SidenavPosition;
  mode: SidenavMode;
  size: SidenavSize;
  menu: GnxMenuItem[]; //Side menu is setup on user authentication
}
