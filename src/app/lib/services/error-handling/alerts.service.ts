// import { Injectable, OnDestroy } from '@angular/core';
// import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";
// // import { ALERTS_CONFIG } from "@config/alerts.config";
// // import { Alert } from "@models/common";
// import { BehaviorSubject, Observable, Subject } from "rxjs";

// @Injectable({
//   providedIn: 'root'
// })
// export class AlertsService implements OnDestroy {

// //  private _config = ALERTS_CONFIG;
//   // private _headerAlerts: BehaviorSubject<Alert[]>;
//   // private _destroy$: Subject<any>;
//   private _action: string = "Dismiss";
//   private _sbConfig: MatSnackBarConfig = {
//     verticalPosition: this._config.verticalPosition,
//     horizontalPosition: this._config.horizontalPosition,
//     panelClass: ['snackbar-default'],
//     duration: this._config.duration
//   }

//   // headerAlerts$: Observable<Alert[]>;

//   // constructor(private _sb: MatSnackBar) {
//   //  // this._headerAlerts = new BehaviorSubject([]);
//   //  // this.headerAlerts$ = this._headerAlerts.asObservable();
//   //   this._destroy$ = new Subject();
//   //  }

//   ngOnDestroy(): void {
//    // this._destroy$.next(null);
//     //this._destroy$.complete();
//   }

//   //Page Alerts
//   public raiseAlert(alert: Alert): void {
//     if (!alert.CanDismiss) {
//       this._action = "";
//     }

//     let sbConfig = this._sbConfig;

//     switch(alert.Type){
//       case 'error': sbConfig.panelClass = ['snackbar-error']
//       break;
//       case 'warning': sbConfig.panelClass = ['snackbar-warn']
//       break;
//       case 'info': sbConfig.panelClass = ['snackbar-info']
//       break;
//     }
//   //  this._sb.open(alert.Message, this._action, sbConfig)
//   }

//   public raiseErrorAlert(message: string, autoClose: boolean = false): void {
//     if (autoClose) {
//      // this._sbConfig.duration = this._config.duration * 2;
//     } else {
//       this._sbConfig.duration = 0;
//     }
//     this._sbConfig.panelClass = ['snackbar-error'];
//    // this._sb.open(message, this._action, this._sbConfig);
//   }

//   public raiseErrors(alerts: Alert[], autoClose: boolean = false): void {
//     if (autoClose) {
//      // this._sbConfig.duration = this._config.duration * 2;
//     } else {
//       this._sbConfig.duration = 0;
//     }
//     // switch(alerts[0].Type){
//     //   case 'error': this._sbConfig.panelClass = ['snackbar-error']
//     //   break;
//     //   case 'warning': this._sbConfig.panelClass = ['snackbar-warn']
//     //   break;
//     //   case 'info': this._sbConfig.panelClass = ['snackbar-info']
//     //   break;
//     //   default:
//     //     this._sbConfig.panelClass = ['snackbar-default']
//     //     break;
//     // }
//     let message:string='';
//     if(alerts && alerts.length >0){
//       alerts.forEach((a)=>{
//         if(message != ''){message += '\n' + ' ';}
//         message += a.Message;
//       });
//       this._sbConfig.panelClass = ['snackbar-error'];
//     //  this._sb.open(message.trim(), this._action, this._sbConfig);
//     }
//   }

//   public raiseSuccessAlert(message: string, autoClose = "true") : void {
//     if (autoClose) {
//    //   this._sbConfig.duration = this._config.duration;
//     } else {
//       this._sbConfig.duration = 0;
//     }
//     // let sbConfig = this._sbConfig;
//     this._sbConfig.panelClass = ['snackbar-success'];
//   //  this._sb.open(message, this._action, this._sbConfig);
//   }

//   //Header alerts
//   public raiseHeaderAlert(alert: Alert): void {
//     if (alert && alert.Level === 'header') {
//      // let alerts = this._headerAlerts.value;
//       //alerts.push(alert);
//       //this._headerAlerts.next(alerts);
//     }
//   }s

//   public dismissHeaderAlert(): void {
//     //Removes the top level alert
//     //let alerts = this._headerAlerts.value;
//     //if (alerts && alerts.length > 0) {
//      // alerts.splice(0, 1);
//       //this._headerAlerts.next(alerts);
//     }
//   }

// //}
