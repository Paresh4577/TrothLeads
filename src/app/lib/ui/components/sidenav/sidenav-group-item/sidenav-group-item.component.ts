import { Component, Input } from '@angular/core';
import { GnxMenuItem } from "@models/navigation/gnxMenutem.interface";

@Component({
  selector: 'gnx-sidenav-group-item',
  templateUrl: './sidenav-group-item.component.html'
})
export class SidenavGroupItemComponent {
  @Input() item: GnxMenuItem;
  @Input() autoCollapse: boolean = true;

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

}
