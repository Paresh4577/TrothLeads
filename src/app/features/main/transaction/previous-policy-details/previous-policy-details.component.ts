import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert } from '@models/common';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { DocumentsDto, IDocumentsDto } from '@models/dtos/transaction-entry/PrivateCar';
import { Observable } from 'rxjs';
import { CategoryCodeEnum, HealthPolicyDocumentType, SubCategoryCodeEnum } from 'src/app/shared/enums';

@Component({
  selector: 'gnx-previous-policy-details',
  templateUrl: './previous-policy-details.component.html',
  styleUrls: ['./previous-policy-details.component.scss']
})
export class PreviousPolicyDetailsComponent {

  PreviousPolicyDetailsForm: FormGroup;
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload; // upload document API
  

  // #region constructor

  constructor(
    private _fb: FormBuilder,
    private _alertservice: AlertsService,
    public dialogRef: MatDialogRef<PreviousPolicyDetailsComponent>,
    private _dataService: HttpService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      formGroupData: any;
      InsuranceCompany: Observable<IInsuranceCompanyDto[]>;
      SubCategoryWisePolicyType: any;
      PreviousPolicyDoc:any 
    }
  ) {

  }

  // #endregion constructor

  //#region lifecycle hooks
  // -----------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------


  ngOnInit() {    
    this.PreviousPolicyDetailsForm = this._InitForm(this.data.formGroupData)
  }

  public get CategoryCodeEnum() {
    return CategoryCodeEnum
  }

  public get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum
  }




  /**
* #region public methods
*/

  public SubmitData() {
    let error: Alert[] = []

    if (this.PreviousPolicyDetailsForm.get('PrevPolicyInsurComp').value == "" ||
      this.PreviousPolicyDetailsForm.get('PrevPolicyInsurComp').value == null) {
      error.push({
        Message: 'Select Previous Insurance Company',
        CanDismiss: false,
        AutoClose: false,
      })
    }
    if (this.PreviousPolicyDetailsForm.get('PrevPolicySumInsured').value == 0 ||
      this.PreviousPolicyDetailsForm.get('PrevPolicySumInsured').value == null) {
      error.push({
        Message: 'Enter Previous Insurance Sum Inssured',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if ((this.data.formGroupData.CategoryCode == CategoryCodeEnum.Motor) && (this.PreviousPolicyDetailsForm.get('PrevPolicyType').value == "" ||
      this.PreviousPolicyDetailsForm.get('PrevPolicyType').value == null)) {
      error.push({
        Message: 'Select Previous Policy Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }
    if (error.length > 0) {
      this._alertservice.raiseErrors(error);
      return;
    }

    this.dialogRef.close(this.PreviousPolicyDetailsForm.value)
  }


  close() {
    this.dialogRef.close()
  }

  public selectedPrevPolicyDocument(event) {
    let file = event.target.files[0]
    if (file) {
      this._dataService
        .UploadFile(this.UploadFileAPI, file)
        .subscribe((res) => {
          if (res.Success) {
            this.PreviousPolicyDetailsForm.get('PrevPolicyDoc').patchValue({
              FileName: res.Data.FileName,
              ImageUploadName: res.Data.StorageFileName,
              ImageUploadPath: res.Data.StorageFilePath,
              DocumentType: HealthPolicyDocumentType.PreviousPolicy,
              DocumentTypeName: HealthPolicyDocumentType.PreviousPolicy
            })

            this._alertservice.raiseSuccessAlert(res.Message);


          }
          else {
            this._alertservice.raiseErrors(res.Alerts);
          }
        });
    }

  }

  public removeDocument() {
    this.PreviousPolicyDetailsForm.get('PrevPolicyDoc').patchValue({
      ImageUploadName: "",
      ImageUploadPath: "",
      FileName: "",
      DocumentType: "",
      DocumentTypeName: ""
    })
  }




  /**
* #region Private methods
*/
  private _InitForm(data) {

    let fg = this._fb.group({
      InsuranceCompanyCode: [],
      PrevPolicyInsurComp: [""],
      PrevPolicySumInsured: [0],
      PrevPolicyType: [""],
      PrevPolicyPeriod: [0],
      PrevPolicyDoc: this._buildPrevPolicyDocumentsForm(this.data.PreviousPolicyDoc),
    })
    if (data) {
      fg.patchValue(data)
    }

    return fg;

  }

  private _buildPrevPolicyDocumentsForm(item: IDocumentsDto = new DocumentsDto()): FormGroup {
    let dF = this._fb.group({
      Id: [0],
      TransactionId: [0],
      Remark: [],
      FileName: ["", [Validators.required]],
      DocumentType: [''],
      DocumentTypeName: [''],
      ImageUploadName: [''],
      ImageUploadPath: ['', [Validators.required]],
    })
    if (item != null) {
      if (!item) {
        item = new DocumentsDto();
      }

      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }
}
