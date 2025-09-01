import { Component, Input } from '@angular/core';
import { GnxMenuItem } from "@models/navigation/gnxMenutem.interface";

@Component({
  selector: 'gnx-sidenav-basic-item',
  templateUrl: './sidenav-basic-item.component.html'
})
export class SidenavBasicItemComponent {

  @Input() item: GnxMenuItem;
}
