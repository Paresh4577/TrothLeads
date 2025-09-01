import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';

@Component({
  selector: 'gnx-transaction-cancel-dialog',
  templateUrl: './transaction-cancel-dialog.component.html',
  styleUrls: ['./transaction-cancel-dialog.component.scss']
})
export class TransactionCancelDialogComponent {

  CancelReasonForm:FormGroup
  TransactionStatus:any

  constructor(
    public dialogRef: MatDialogRef<TransactionCancelDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
        TransactionObj:any
    },
    public alertService: AlertsService,
    private _fb:FormBuilder,
    private _dataservice:HttpService
  ) {
  }

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(){
    //Init form
    this._InitForm()

    this.TransactionStatus = this.data.TransactionObj.Status

    /**
     * Status 2 = indicate a transaction is cancelled
     * so, get Cancel Transaction Reason & display
     */
    if (this.data.TransactionObj.Status == 2){
      this._dataservice.getDataById(this.data.TransactionObj.Id, API_ENDPOINTS.Transaction.Base).subscribe(res=>{
        if (res.Success){
          this.CancelReasonForm.get('StatusDesc').setValue(res.Data?.StatusDesc)
        }
      })
      this.CancelReasonForm.disable()
    }

  }


  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Cancel Transaction With Reason
   * @returns 
   */
 public CancelTransaction() {

   if (!this.CancelReasonForm.get('StatusDesc').value){
    this.alertService.raiseErrorAlert('Reason is required.')
    return;
   }

    this.dialogRef.close(this.CancelReasonForm.value);
  }


  /**
   * Close Dialog Without Any Changes
   */
 public closeDialog() {
    this.dialogRef.close();
  }



  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _InitForm(){
    this.CancelReasonForm = this._fb.group({
      StatusDesc:[""]
    })
  }
}
