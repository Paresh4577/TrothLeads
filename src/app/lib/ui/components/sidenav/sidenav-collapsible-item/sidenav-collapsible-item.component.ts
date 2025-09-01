import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { gnxAnimations } from "@lib/ui/animations";
import { GnxMenuItem } from "@models/navigation/gnxMenutem.interface";
import { Subject } from "rxjs";
import { SidenavComponent } from "../sidenav.component";

@Component({
  selector: 'gnx-sidenav-collapsible-item',
  templateUrl: './sidenav-collapsible-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: gnxAnimations
})
export class SidenavCollapsibleItemComponent implements OnInit, OnDestroy {
  @Input() item: GnxMenuItem;
  @Input() autoCollapse: boolean = true;

  isCollapsed: boolean = true;
  isExpanded: boolean = false;

  private _sidenavComponent: SidenavComponent;
  private destroy$: Subject<any>;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router
  ) {
    this.destroy$ = new Subject();
  }

  @HostBinding('class') get classList(): any {
    return {
      'gnx-menu-item-collapsed': this.isCollapsed,
      'gnx-menu-item-expanded': this.isExpanded
    };
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void { }


  /**
 * On destroy
 */
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Collapse
   */
  collapse(): void {
    // Return if the item is disabled
    if (this.item.disabled) {
      return;
    }

    // Return if the item is already collapsed
    if (this.isCollapsed) {
      return;
    }

    // Collapse it
    this.isCollapsed = true;
    this.isExpanded = !this.isCollapsed;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Execute the observable
    // this._sidenavComponent.onCollapsibleItemCollapsed.next(this.item); //TBD
  }

  /**
   * Expand
   */
  expand(): void {
    // Return if the item is disabled
    if (this.item.disabled) {
      return;
    }

    // Return if the item is already expanded
    if (!this.isCollapsed) {
      return;
    }

    // Expand it
    this.isCollapsed = false;
    this.isExpanded = !this.isCollapsed;

    // Mark for check
    this._changeDetectorRef.markForCheck();

    // Execute the observable
    // this._sidenavComponent.onCollapsibleItemCollapsed.next(this.item); //TBD
  }

  /**
   * Toggle collapsible
   */
  toggleCollapssible(): void {
    // Toggle collapse/expand
    if (this.isCollapsed) {
      this.expand();
    }
    else {
      this.collapse();
    }
  }

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
