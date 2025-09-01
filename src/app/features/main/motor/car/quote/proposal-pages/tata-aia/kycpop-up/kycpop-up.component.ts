import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import {
  ITataAIAkycdto,
  TataAIAkycdto,
} from '@models/dtos/motor-insurance/TataAIA';
import { ValidationRegex } from '@config/validationRegex.config';
import { Alert } from '@models/common';
import { TataAiaService } from '../tata-aia.service';

@Component({
  selector: 'gnx-kycpop-up',
  templateUrl: './kycpop-up.component.html',
  styleUrls: ['./kycpop-up.component.scss'],
})
export class KYCPopUpComponent {
  //   // #start region public variables
  pagetitle: string;
  KYCDetailsForm: FormGroup;
  KYCdata: ITataAIAkycdto = new TataAIAkycdto();
  ispopup: boolean = false;
  APIendPoint: any;
  alerts: Alert[] = [];

  PANNum: RegExp = ValidationRegex.PANNumValidationReg;
  AadharNum: RegExp = ValidationRegex.UIDNumValidationReg;

  // boolean
  isReKYC: boolean = false

  //   // #end region public variables

  //   /**
  //    * #region constructor
  //    * @param _route : used for getting dynamic route or id
  //    */

  constructor(
    private _fb: FormBuilder,
    private _alertservice: AlertsService,
    private _dataService: HttpService,
    private _tataAIAMotorService: TataAiaService,
    public dialogRef: MatDialogRef<KYCPopUpComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      type: string;
      title: string;
      data?: any;
    }
  ) {
    this.pagetitle = this.data.title;
    this.KYCdata = this.data['kycdetails'];
    if (this.data.type == 'Transaction') {
      this.APIendPoint = API_ENDPOINTS.Transaction.List;
    }
  }

  // #endregion constructor

  ngOnInit(): void {
    this.KYCDetailsForm = this._InitForm(this.KYCdata);
  }

  // #region public methods
  close() {
    this.dialogRef.close()
  }

  public SubmitKYCData(type:string) {
    
    this.alerts = [];
    if(type != "ReKYC")
    {
      if (this.KYCDetailsForm.get('PanNumber').invalid) {
        this.alerts.push({
          Message: 'Enter PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      } else if (!this.PANNum.test(this.KYCDetailsForm.get('PanNumber').value)) {
        this.alerts.push({
          Message: 'Enter valid PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
    else if (type == "ReKYC")
    {
      if (this.KYCDetailsForm.get('CIN').value == "" || this.KYCDetailsForm.get('CIN').value == null ) {
        this.alerts.push({
          Message: 'Enter CIN',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      else if (this.KYCDetailsForm.get('CIN').value.length != 21 && this.KYCDetailsForm.get('CIN').value != "NA")
      {
        this.alerts.push({
          Message: 'Enter Valid CIN',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
    
    // if (
    //   this.KYCDetailsForm.get('UID').value != '' &&
    //   !this.AadharNum.test(this.KYCDetailsForm.get('UID').value)
    // ) {
    //   this.alerts.push({
    //     Message: 'Enter valid Aadhar',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }

    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
      return;
    } else {
      this._checkKYC(type);
    }
  }

  // #endregion public methods

  // #region private methods

  private _checkKYC(type:string) {
    
    let requiredId: boolean = true;
    if (requiredId) {
      
      if (type != "ReKYC") {
        if (this.KYCDetailsForm.get('PanNumber').value != '') {
          this.KYCdata.DocTypeCode = 'PAN';
          this.KYCdata.DocNumber = this.KYCDetailsForm.get('PanNumber').value;
        }
  
        if (this.KYCDetailsForm.get('UID').value != '') {
          this.KYCdata.DocTypeCode = 'UID';
          this.KYCdata.DocNumber = this.KYCDetailsForm.get('UID').value;
        }
      }
      else if (type == "ReKYC")
      {
        if (this.KYCDetailsForm.get('CIN').value != '') {
          this.KYCdata.DocTypeCode = 'CIN';
          this.KYCdata.DocNumber = this.KYCDetailsForm.get('CIN').value;
        }
      }

      this._tataAIAMotorService.KYC(this.KYCdata).subscribe((res) => {
         if (res.Success) {

          if(res.ResCode == 1729) // for re-kyc in TATA AI policy and re-kyc with CIN No.
          {
            this.isReKYC = true;
            this.KYCdata.RequestNo = res.Data.RequestNo;
          }
          else
          {
            this.isReKYC = false;
            this._alertservice.raiseSuccessAlert(res.Message);
            this.dialogRef.close(res);
          }
         
        } else {
          this._alertservice.raiseErrorAlert(res.Message);
        }
      });
    }
  }

  private _InitForm(data:any) {
    let fg = this._fb.group({
      PanNumber: [],
      UID: [''],
      CIN: ['NA'],
    });

    if (data) {
      fg.patchValue({
        PanNumber : data.PanNUMBER
      });
    }
    return fg;
  }

  // #endregion private methods
}
