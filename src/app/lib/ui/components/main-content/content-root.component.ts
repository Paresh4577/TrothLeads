import { Component, HostBinding, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { IAppUIState } from "@lib/ui/store/models/appUiState.interface";
import { uiStateSelector } from "@lib/ui/store/uiState/uiState.selector";
import { select, Store } from "@ngrx/store";
import { Observable, Subject, takeUntil } from "rxjs";

@Component({
  selector: 'gnx-content-root',
  templateUrl: './content-root.component.html',
  styleUrls: ['./content-root.component.scss'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'gnxContentRoot'
})
export class ContentRootComponent implements OnInit, OnDestroy {

  private uiState$: Observable<IAppUIState>;
  private destroy$: Subject<any>;
  private sidenavOpened: boolean;
  constructor(private store: Store) {
    this.uiState$ = this.store.pipe(select(uiStateSelector));
    this.destroy$ = new Subject();
  }

  @HostBinding('class') get classList(): any {
    return {
      'gnx-sidenav-opened': this.sidenavOpened,
      'gnx-sidenav-closed': !this.sidenavOpened,
      'gnx-animations-enabled': true
    }
  }

  ngOnInit(): void {
    this.uiState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.sidenavOpened = state.sidenavState.opened;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
