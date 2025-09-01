import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { ChangeDetectorRef } from "@angular/core";
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil } from "rxjs";
import { ProgressBarService } from "src/app/lib/services/progressBar/progress-bar.service";

@Component({
  selector: 'gnx-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgressBarComponent implements OnInit, OnChanges, OnDestroy {

  @Input()
  autoMode: boolean = true
  mode: 'determinate' | 'indeterminate';
  show: boolean = false;
  progress: number = 0;

  private _destroy$: Subject<any> = new Subject<any>();

  /**
       * Constructor
       */
  constructor(private _pbService: ProgressBarService, private _cdr: ChangeDetectorRef) {

  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On changes
   *
  */
  ngOnChanges(changes: SimpleChanges): void {
    //Automode
    if ('automode' in changes) {
      this._pbService.setAutoMode(coerceBooleanProperty(changes['autoMode'].currentValue));
    }
  }

  /**
   * On init
   */
  ngOnInit(): void {
    //Subscribe to the progress bar service observables
    this._pbService.mode$
      .pipe(takeUntil(this._destroy$))
      .subscribe(val => {
        this.mode = val;
      });

    this._pbService.progress$
      .pipe(takeUntil(this._destroy$))
      .subscribe(val => {
        this.progress = val;
      });

    this._pbService.show$
      .pipe(takeUntil(this._destroy$))
      .subscribe(val => {
        this.show = val;
        this._cdr.detectChanges();
      });
  }
  /**
   * On destroy
   */
  ngOnDestroy(): void {
    //Unsubscribe from all obervables
    this._destroy$.next(null);
    this._destroy$.complete();
  }
}
