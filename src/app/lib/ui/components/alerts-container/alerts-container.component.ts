import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { uiStateSelector } from "@lib/ui/store/uiState/uiState.selector";
import { Alert } from "@models/common/alert.interface";
import { AlertLevel } from "@models/common/alert.types";
import { Store, select } from "@ngrx/store";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: 'gnx-alerts-container',
  templateUrl: './alerts-container.component.html',
  styleUrls: ['./alerts-container.component.scss']
})
export class AlertsContainerComponent implements OnInit, OnDestroy {

  alerts: Alert[] = [];
  
  private _destroy$: Subject<any> = new Subject();
  /**
   * constructor
   */
  constructor(private _store: Store) {
    
  }

  @Input() targetLevel?: AlertLevel

  ngOnInit(): void {
    if (!this.targetLevel) {
      this.targetLevel = 'page';
    }
    
    this._store
      .pipe(select(uiStateSelector)).pipe(takeUntil(this._destroy$))
      .subscribe((state) => {
        this.alerts = state.appAlerts.filter(a => a.level === this.targetLevel);
      });      
  }

  ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }
}
