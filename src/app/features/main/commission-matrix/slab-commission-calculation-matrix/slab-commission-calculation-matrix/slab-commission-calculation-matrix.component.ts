import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { MasterListService } from '@lib/services/master-list.service';
import { Alert, IFilterRule, OrderBySpecs, ResponseMessage } from '@models/common';
import { CommissionMatrixService } from '../../commission-matrix.service';
import { ICategoryDto } from '@models/dtos/core/CategoryDto';
import { CategoryCodeEnum } from 'src/app/shared/enums';

const ActiveMasterDataRule: IFilterRule = {
  Field: 'Status',
  Operator: 'eq',
  Value: 1
}

@Component({
  selector: 'gnx-slab-commission-calculation-matrix',
  templateUrl: './slab-commission-calculation-matrix.component.html',
  styleUrls: ['./slab-commission-calculation-matrix.component.scss'],
    providers: [
      DatePipe,
      {
        provide: DateAdapter,
        useClass: MomentDateAdapter,
        deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
      },
      { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    ],
})
export class SlabCommissionCalculationMatrixComponent {

  //#region public properties
  public title: string = '';
  public categoryList: ICategoryDto[] = [];
  public isVerifyDocument: Boolean = false;
  public slabCommissionMatrixForm: FormGroup;
//#endregion

//#region private properties
private _slabCommissionMatrixFormAlert: Alert[] = [];
//#endregion


  /**
   * 
   * #region constructor
   * @param _fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   * @param _commissionMatrixService 
   * @param _alertservice 
   * @param _helperservice 
   * @param _masterListService 
   * @param _datePipe 
   */
  constructor(
    private _fb: FormBuilder,
    private _commissionMatrixService: CommissionMatrixService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _alertservice: AlertsService,
    public _helperservice: HelperService,
    private _masterListService: MasterListService,
    private _datePipe: DatePipe,
  ) {
    this._fillMasterList()
  }
  // #endregion constructor


  //#region lifecycle-hooks

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  //on init
  ngOnInit(): void {
    let data = this._route.snapshot.data;
    this.title = data['title']
    this.slabCommissionMatrixForm = this._initSlabCommissionMatrixForm();

    this._onFormChange()
  }

  //#endregion

  //#region public methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // submit or save action
  public submitform():void {
 
    this._slabCommissionMatrixFormValidations()
    if (this._slabCommissionMatrixFormAlert.length > 0) {
      this._alertservice.raiseErrors(this._slabCommissionMatrixFormAlert);
      return;
    }

    let formdata = new FormData()
    formdata.append('Id', this.slabCommissionMatrixForm.value.Id)
    formdata.append('CategoryId', this.slabCommissionMatrixForm.value.CategoryId)
    formdata.append('CategoryName', this.slabCommissionMatrixForm.value.CategoryName)
    formdata.append('CategoryCode', this.slabCommissionMatrixForm.value.CategoryCode)
    formdata.append('EffectiveDate', this._datePipe.transform(this.slabCommissionMatrixForm.value.EffectiveDate, 'yyyy-MM-dd'))
    formdata.append('FileAttachment', this.slabCommissionMatrixForm.value.FileAttachment)
    formdata.append('FileName', this.slabCommissionMatrixForm.value.FileName)
    formdata.append('Description', this.slabCommissionMatrixForm.value.Description)

    this._commissionMatrixService
      .CreateSlabCommissionCalMatrix(this.slabCommissionMatrixForm.value.CategoryCode, formdata)
      .subscribe((res) => {
        if (res.Success) {
          // handle success message here
          this._alertservice.raiseSuccessAlert(res.Message, 'true')
          this.backClicked()
        } else {
          if(res.Data){
            this._downloadExcel(res.Data, this.slabCommissionMatrixForm.value.FileName)
          }
          if (res.Alerts && res.Alerts.length > 0) {
            this._alertservice.raiseErrors(res.Alerts);
          } else {
            this._alertservice.raiseErrorAlert(res.Message);
          }
        }
      });

  }


  // previous page navigation button
  public backClicked(): void {
    this._router.navigate([ROUTING_PATH.SlabCommissionMatrix.CommissionCalculationMatrixModuleList])
  }

  /**
   * Download Commission matrix excel file category wise
   */
  public downLoadSampleCommissionMatrix(): void {

    if (this.slabCommissionMatrixForm.get('CategoryId').value == 0 || this.slabCommissionMatrixForm.get('CategoryId').value == null) {
      this._alertservice.raiseErrorAlert('Category is required.')
      return;
    }

    this._commissionMatrixService.downloadSlabCommissionMatrixSampleFile(this.slabCommissionMatrixForm.value.CategoryId)
      .subscribe((blob) => {
        if (blob.type == 'application/json') {

          const reader = new FileReader();

          reader.onload = (event: any) => {
            const res: ResponseMessage = JSON.parse(event.target.result);

            if (res.Success) {
              // handle success message here
              this._alertservice.raiseSuccessAlert(res.Message)
            } else {
              // handle failure message here
              if (res.Alerts && res.Alerts.length > 0) {
                this._alertservice.raiseErrors(res.Alerts);
              } else {
                this._alertservice.raiseErrorAlert(res.Message);
              }
            }
          }

          reader.readAsText(blob);

        } else {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = this.slabCommissionMatrixForm.value.CategoryName + '_CommissionMatrix_Sample';
        a.click();
        URL.revokeObjectURL(objectUrl);
        }
      })

  }

  /**
   * verify Data in uploaded Sheet
   */
  public verifySlabCommissionMatrix(): void {

    this._slabCommissionMatrixFormValidations()
    if (this._slabCommissionMatrixFormAlert.length > 0) {
      this._alertservice.raiseErrors(this._slabCommissionMatrixFormAlert);
      return;
    }

    let formdata = new FormData()
    formdata.append('Id', this.slabCommissionMatrixForm.value.Id)
    formdata.append('CategoryId', this.slabCommissionMatrixForm.value.CategoryId)
    formdata.append('CategoryName', this.slabCommissionMatrixForm.value.CategoryName)
    formdata.append('CategoryCode', this.slabCommissionMatrixForm.value.CategoryCode)
    formdata.append('EffectiveDate', this._datePipe.transform(this.slabCommissionMatrixForm.value.EffectiveDate, 'yyyy-MM-dd'))
    formdata.append('FileAttachment', this.slabCommissionMatrixForm.value.FileAttachment)
    formdata.append('FileName', this.slabCommissionMatrixForm.value.FileName)
    formdata.append('Description', this.slabCommissionMatrixForm.value.Description)

    this._commissionMatrixService
      .VerifySlabCommissionCalMatrix(this.slabCommissionMatrixForm.value.CategoryCode, formdata)
      .subscribe((res) => {
        if (res.Data) {
          this._downloadExcel(res.Data, this.slabCommissionMatrixForm.value.FileName)
        }
        if (res.Success) {
          // handle success message here
          this._alertservice.raiseSuccessAlert(res.Message, 'true')
          this.isVerifyDocument = true;
        } else {
          if (res.Alerts && res.Alerts.length > 0) {
            this._alertservice.raiseErrors(res.Alerts);
          } else {
            this._alertservice.raiseErrorAlert(res.Message);
          }
        }
      });
  }


  /**
   * File selection change event
   * @param event 
   */
  public SelectExcelFile(event): void {
    let file = event.target.files[0]

    if (file) {
      this.slabCommissionMatrixForm.patchValue({
        FileAttachment: file,
        FileName: file.name,
      })
    }else{
      this.slabCommissionMatrixForm.patchValue({
        FileAttachment: null,
        FileName: null,
      })
    }
  }

  // #endregion public methods

  //#region private-methods

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  //inin form
  private _initSlabCommissionMatrixForm(): FormGroup {
    let fg = this._fb.group({
      Id: [0],
      CategoryId: [0],
      CategoryName: [''],
      CategoryCode: [''],
      EffectiveDate: [''],
      FileAttachment: [],
      FileName: [''],
      Description: [],
    });

    return fg;
  }


  // Get MAster data for drplist
  private _fillMasterList(): void {

    // fill Product Type
    let SubCategoryRule: IFilterRule[] = [ActiveMasterDataRule,
      {
         Field: 'Code',
         Operator: 'ne',
         Value: CategoryCodeEnum.Life
       }
    ]

    let OrderBySpecs: OrderBySpecs[] = [
      {
        field: "SrNo",
        direction: "asc"
      }
    ]

    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Category.List, 'Name', '', SubCategoryRule, [], OrderBySpecs)
      .subscribe(res => {
        if (res.Success) {
          this.categoryList = res.Data.Items
        }
      })


  }


  // form changes 
  private _onFormChange(): void {

    // changes product type
    this.slabCommissionMatrixForm.get('CategoryId').valueChanges.subscribe(val => {

      let SelectedCategory = this.categoryList.find(x => x.Id == val)
      if (SelectedCategory) {
        this.slabCommissionMatrixForm.patchValue({
          CategoryName: SelectedCategory.Name,
          CategoryCode: SelectedCategory.Code
        })
      }
      else {
        this.slabCommissionMatrixForm.patchValue({
          CategoryName: "",
          CategoryCode: ""
        })
      }
      this.isVerifyDocument = false;


    })


    this.slabCommissionMatrixForm.get('FileAttachment').valueChanges.subscribe(val => {
      this.isVerifyDocument = false;
    })
    
    this.slabCommissionMatrixForm.get('EffectiveDate').valueChanges.subscribe(val => {
      this.isVerifyDocument = false;
    })
  }

  // Form Validation
  private _slabCommissionMatrixFormValidations(): void {
    this._slabCommissionMatrixFormAlert = []

    if (this.slabCommissionMatrixForm.get('CategoryId').value == 0 || this.slabCommissionMatrixForm.get('CategoryId').value == null) {
      this._slabCommissionMatrixFormAlert.push({
        Message: 'Category is required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.slabCommissionMatrixForm.get('EffectiveDate').value) {
      this._slabCommissionMatrixFormAlert.push({
        Message: 'Effective Date is required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.slabCommissionMatrixForm.get('FileAttachment').value) {
      this._slabCommissionMatrixFormAlert.push({
        Message: 'Upload excel file',
        CanDismiss: false,
        AutoClose: false,
      })
    }


  }

  /**
   * Download Excel file From Base64 string
   * @param base64String 
   * @param fileName 
   */

  private _downloadExcel(base64String: string, fileName: string): void {
    // Convert Base64 string to a byte array
    const byteCharacters = atob(base64String);
    const byteNumbers = new Uint8Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    // Create a Blob from the byte array
    const blob = new Blob([byteNumbers], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Create a link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;

    // Append to the body (necessary for Firefox)
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Clean up and remove the link
    document.body.removeChild(link);
  }

  // #endregion private methods
}