import { coerceBooleanProperty } from "@angular/cdk/coercion";
import { ChangeDetectorRef } from "@angular/core";
import { ChangeDetectionStrategy } from "@angular/core";
import { Component, EventEmitter, HostBinding, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { GnxAlertService } from "@lib/services/error-handling/gnx-alert.service";
import { HelperService } from "@lib/services/helper.service";
import { IAppAlert } from "@lib/types";
import { gnxAnimations } from "@lib/ui/animations";
import { filter, Subject, takeUntil } from "rxjs";
import { GnxAlertAppearance, GnxAlertType } from "src/app/lib/types/shared/alert.types";

const shortTimeout: number = 1000;
const mediumTimeout: number = 2000;
const longTimeout: number = 5000;
@Component({
  selector: 'gnx-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'gnxAlert',
  animations: gnxAnimations
})
export class AlertComponent implements OnChanges, OnInit, OnDestroy {
  /**
   *
   */
  @Input() appearance: GnxAlertAppearance = 'soft';
  @Input() dismissed: boolean = false;
  // @Input() canDismiss: boolean = false;
  @Input() name: string = this.helperService.randomId();
  @Input() showIcon: boolean = true;
  @Input() type: GnxAlertType = 'primary';
  @Input() alert!: IAppAlert;
  @Output() readonly dismissedChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  private destroy$: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(private helperService: HelperService,
              private cdr: ChangeDetectorRef,
              private alertService: GnxAlertService) {

    }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Host binding for component classes
   */
  @HostBinding('class') get classList(): any {
    /* eslint-disable @typescript-eslint/naming-convention */
    return {
      // 'gnx-alert-appearance-border': this.appearance === 'border',
      'gnx-alert-appearance-fill': this.alert?.appearance === 'fill',
      'gnx-alert-appearance-outline': this.alert?.appearance === 'outline',
      'gnx-alert-appearance-soft': this.alert?.appearance === 'soft',
      'gnx-alert-dismissed': this.dismissed,
      'gnx-alert-dismissible': this.alert?.canDismiss,
      'gnx-alert-show-icon': this.alert?.showIcon,
      'gnx-alert-type-primary': this.alert?.type === 'primary',
      'gnx-alert-type-accent': this.alert?.type === 'accent',
      'gnx-alert-type-warn': this.alert?.type === 'warn',
      'gnx-alert-type-basic': this.alert?.type === 'basic',
      'gnx-alert-type-info': this.alert?.type === 'info',
      'gnx-alert-type-success': this.alert?.type === 'success',
      'gnx-alert-type-warning': this.alert?.type === 'warning',
      'gnx-alert-type-error': this.alert?.type === 'error'
    };
    /* eslint-enable @typescript-eslint/naming-convention */
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   */
  ngOnInit(): void {
    // Subscribe to the dismiss calls
    this.alertService.onDismiss
      .pipe(
        filter(name => this.name === name),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {

        // Dismiss the alert
        this.dismiss();
      });

    // Subscribe to the show calls
    this.alertService.onShow
      .pipe(
        filter(name => this.name === name),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {

        // Show the alert
        this.show();
      });

    //Autoclose
    if (this.alert.autoClose) {
      let duration = mediumTimeout;
      if (this.alert.duration === 'long') {
        duration = longTimeout;
      } else if (this.alert.duration === 'short') {
        duration = shortTimeout;
      }
      setTimeout(() => {
        this.dismiss();
      }, duration);
    }
  }


  /**
   * On changes
  *
  * @param changes
  */
  ngOnChanges(changes: SimpleChanges): void {
    // Dismissed
    if ('dismissed' in changes) {
      // Coerce the value to a boolean
      this.dismissed = coerceBooleanProperty(changes["dismissed"].currentValue);

      // Dismiss/show the alert
      this.toggleDismiss(this.dismissed);
    }
  }

  ngOnDestroy(): void {

    // Unsubscribe from all subscriptions
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Dismiss the alert
   */
  dismiss(): void {
    // Return if the alert is already dismissed
    if (this.dismissed) {
      return;
    }

    // Dismiss the alert
    this.toggleDismiss(true);
  }

  /**
   * Show the dismissed alert
   */
  show(): void {
    // Return if the alert is already showing
    if (!this.dismissed) {
      return;
    }

    // Show the alert
    this.toggleDismiss(false);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Dismiss/show the alert
   *
   * @param dismissed
   * @private
   */
  private toggleDismiss(dismissed: boolean): void {
    // Return if the alert is not dismissible
    if (!this.alert?.canDismiss) {
      return;
    }

    // Set the dismissed
    this.dismissed = dismissed;

    // Execute the observable
    this.dismissedChanged.next(this.dismissed);

    // Notify the change detector
    this.cdr.markForCheck();
  }

}
