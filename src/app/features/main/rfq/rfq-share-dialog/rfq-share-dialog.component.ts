import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RfqService } from '../rfq.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { FormControl } from '@angular/forms';
import { ValidationRegex } from '@config/validationRegex.config';

@Component({
  selector: 'gnx-rfq-share-dialog',
  templateUrl: './rfq-share-dialog.component.html',
  styleUrls: ['./rfq-share-dialog.component.scss']
})
export class RfqShareDialogComponent {
  //#region public properties
  //String
  public title: string;
  public emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  public phoneNum: RegExp = ValidationRegex.phoneNumReg;
  //Number
  //FormGroup 
  //Boolean
  //Observable List
  //List & objects
  //formControl
  public emailId = new FormControl();
  public whatsAppNo = new FormControl();
  //Date
  //Other
  //#endregion


  //#region private properties


  //#endregion


  //#region  constructor

  constructor(
    private _rfqService: RfqService,
    private _alertService: AlertsService,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string,
      quotation: any
    },
  ) { }
  //#endregion constructor


  //#region public-getters


  //#endregion


  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this.title = this.data.title;
  }


  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  //Cancel Button
  public Cancel() {
    this.dialogRef.close()
  }

  public shareData(shareTye: string) {
    console.log(this.data.quotation);
    
    let sharValue = ''
    
    if(shareTye == 'email'){
      sharValue = this.emailId.value
      if (!this.emailId.value) {
        this._alertService.raiseErrorAlert('Enter your Email ID');
        return;
      }else{
        if (!this.emailValidationReg.test(this.emailId.value)) {
          this._alertService.raiseErrorAlert('Enter Valid Email ID');
          return;
        }
      }
    }
    else if (shareTye == 'whatsapp'){
      sharValue = this.whatsAppNo.value
      if (!this.whatsAppNo.value) {
        this._alertService.raiseErrorAlert('Enter your Whatsapp No.');
        return;
      } else {
        if (!this.phoneNum.test(this.whatsAppNo.value)) {
          this._alertService.raiseErrorAlert('Enter Valid Whatsapp No.');
          return;
        }
      }
    }
    

    this._rfqService.shareQuotation(this.data.quotation.Id, shareTye, sharValue).subscribe(res => {
      if (res.Success) {
        this._alertService.raiseSuccessAlert(res.Message);
        this.dialogRef.close();
      } else {
        // handle failure message here
        if (res.Alerts && res.Alerts.length > 0) {
          this._alertService.raiseErrors(res.Alerts);
        } else {
          this._alertService.raiseErrorAlert(res.Message);
        }
      }
    })
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------


  //#endregion private-methods
}
