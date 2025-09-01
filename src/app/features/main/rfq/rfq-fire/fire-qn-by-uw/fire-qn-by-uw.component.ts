import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { Alert, IFilterRule, OrderBySpecs } from '@models/common';
import { AuthService } from '@services/auth/auth.service';
import { CategoryCodeEnum } from 'src/app/shared/enums';
import { RfqFireService } from '../rfq-fire.service';
import { RFQDocumentsDrpList } from '@config/rfq';
import { RfqService } from '../../rfq.service';
import { ROUTING_PATH } from '@config/routingPath.config';
import { environment } from 'src/environments/environment';
import { ContentDetailsDTO, FireDocumentsDto, IContentDetailsDTO, IFireDocumentsDto, IFireQNbyUWDTO, IJwelleryDetailsDTO, IOtherDetailDTO, IPrevPolicyDetailDTO, IFireQNDocumentsDto, JwelleryDetailsDTO, PrevPolicyDetailDTO, FireQNDocumentsDto } from '@models/dtos';
import { ClaimDetailsStatus, DisplayedPolicyPreriod, FireCategoryType } from '@config/rfq';
import { IFinancialYearDto } from '@models/dtos/core/FinancialYearDto';
import { Moment } from 'moment';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';


const ActiveMasterDataRule: IFilterRule = {
  Field: 'Status',
  Operator: 'eq',
  Value: 1
}

@Component({
  selector: 'gnx-fire-qn-by-uw',
  templateUrl: './fire-qn-by-uw.component.html',
  styleUrls: ['./fire-qn-by-uw.component.scss'],
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
export class FireQnByUwComponent {

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  // Variables
  pagetitle: string = '';
  mode: string = '';
  isExpand: boolean = false;
  maxManufacturingYear: Date;


  SubCategoryList: any[] = [];
  FinancialYearList: IFinancialYearDto[] = []

  DisplayForm: any;
  FirePackageSumInsuredDetails: any;
  AdditionalDetailFireAndFirePackage: any;

  // FormGroup 
  RFQQNUWForm: FormGroup;

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  QNDocAlerts: Alert[] = []; // Step Invalid field error message
  DocumentAttachmentAlert: Alert[] = [];
  QnDocumentAlert: Alert[] = [];
  ClaimsDetailAlerts: Alert[] = [];
  ProductCategoryDetailsAlert: Alert[] = [];
  BasicDetailAlert: Alert[] = [];

  //Form Controls
  QnDocumentStepCtrl = new FormControl();
  DocumentAttachmentStepCtrl = new FormControl();
  ClaimsDetailStepCtrl = new FormControl(); // Step 3 Control
  ProductCategoryDetailsStepCtrl = new FormControl(); // Step 3 Control
  BasicDetailStepCtrl = new FormControl(); // Step 3 Control

  //#region Constructor
  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public dialog: MatDialog,
    public _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _MasterListService: MasterListService,
    private _datePipe: DatePipe,
    private authService: AuthService,
    private _dialogService: DialogService,
    private _RfqFireService: RfqFireService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
    private _RFQService: RfqService,
  ) {
    this.maxManufacturingYear = new Date()
    this.FirePackageSumInsuredDetails = this._RfqFireService.DisplaySumInsuredDetailsFirePackage()



  }

  //#endregion constructor

  // #region Getters


  // get QNDocuments Form array
  get QNDocuments() {
    return this.RFQQNUWForm.get('QNDocuments') as FormArray;
  }

  // get Documents Form Array 
  get Documents() {
    return this.RFQQNUWForm.get('Documents') as FormArray;
  }

  // get JwelleryDetails Form Array
  get JwelleryDetails() {
    return this.RFQQNUWForm.get('JwelleryDetails') as FormArray;
  }

  // get ContentDetails Form Array
  get ContentDetails() {
    return this.RFQQNUWForm.get('ContentDetails') as FormArray;
  }

  // get PrevPolicyDetails Form Array
  get PrevPolicyDetails() {
    return this.RFQQNUWForm.get('PrevPolicyDetail') as FormArray;
  }

  get OtherDetailForm() {
    return this.RFQQNUWForm.controls['OtherDetail'] as FormGroup
  }

  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Fire))
  }

  // get Fire Policy period
  get DisplayedPolicyPreriod() {
    return DisplayedPolicyPreriod
  }

  // get Fire FireCategoryType period
  get FireCategoryType() {
    return FireCategoryType
  }

  // get Fire ClaimDetailsStatus period
  get ClaimDetailsStatus() {
    return ClaimDetailsStatus
  }

  get CanDisplayJwelleryDetails() {

    if (this.DisplayForm.Type == 'Home'
      && this.DisplayForm?.SumInsuredDetail.ValuableContents
      && this.DisplayForm?.SumInsuredDetail.ValuableContentsSumInsured <= 200000) {
      return true;
    } else {
      return false;
    }

  }

  get CanDisplayContentDetail() {

    if (this.DisplayForm.Type == 'Fire' && this.DisplayForm?.SumInsuredDetail.MachineryBreakdown) {
      return true;
    } else if (this.DisplayForm.Type == 'Fire Package' &&
      (this.DisplayForm?.SumInsuredDetail.ElectricleOrElectronic ||
        this.DisplayForm?.SumInsuredDetail.PortableEquipmentCover)) {
      return true;
    }
    else {
      return false;
    }

  }

  // #end-region Getters

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  //On Init
  ngOnInit(): void {

    this._fillMasterList();

    // Route params data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title'];
    this.mode = data['mode'];

    this.DisplayForm = data['data'];



    // build travel form
    this.RFQQNUWForm = this._buildForm(this.DisplayForm);

    //Remove All Existing QN Documents
    while (this.QNDocuments.controls.length !== 0) {
      this.QNDocuments.removeAt(0)
    }

    this.AdditionalDetailFireAndFirePackage = this._RfqFireService.AdditionalDetailFireAndFirePackage()
      .filter(item => item.DisplayFor.includes(this.DisplayForm.Type))

    /**
     * IF previous policy details null & Anycliamlast3year true
     * then add default one data
     */
    if (this.PrevPolicyDetails.controls.length <= 0 && this.DisplayForm.AnyClaiminLast3Year) {
      this.addPrevPolicyDetails();
    }

    this.addQNDocuments();
    this._onFormChange()

  }

  // After View Init
  ngAfterViewInit(): void {
    this.stepper.next();

    this._cdr.detectChanges();
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // back button
  public backButton() {
    this._Location.back();
  }

  // Reject Button 
  public RejectButton() {
    if (this.RFQQNUWForm.get('SendBackRejectDesc').value == "" || this.RFQQNUWForm.get('SendBackRejectDesc').value == null) {
      this._alertservice.raiseErrors([{
        Message: `Reject Reason is required.`,
        CanDismiss: false,
        AutoClose: false,
      }]);
      return;
    }

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You want to reject request",
        confirmText: 'Yes, reject it!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {

          let SendBackRejectObj: ISendBackRejectDTO = new SendBackRejectDTO()
          SendBackRejectObj.Id = this.RFQQNUWForm.value.Id;
          SendBackRejectObj.Stage = this.RFQQNUWForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.RFQQNUWForm.value.SendBackRejectDesc;

          this._RFQService.Reject(SendBackRejectObj).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, "false")
              this._router.navigate([ROUTING_PATH.Basic.Dashboard])
            }
            else {
              if (res.Alerts && res.Alerts?.length > 0) {
                this._alertservice.raiseErrors(res.Alerts)
              }
              else {
                this._alertservice.raiseErrorAlert(res.Message)
              }
            }
          });
        }
      });
  }

  // Send Back Button 
  public SendBackButton() {

    if (this.RFQQNUWForm.get('SendBackRejectDesc').value == "" || this.RFQQNUWForm.get('SendBackRejectDesc').value == null) {
      this._alertservice.raiseErrors([{
        Message: `Send Back Reason is required.`,
        CanDismiss: false,
        AutoClose: false,
      }]);
      return;
    }

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You want to send back request",
        confirmText: 'Yes, send it back!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {

          let SendBackRejectObj: ISendBackRejectDTO = new SendBackRejectDTO()
          SendBackRejectObj.Id = this.RFQQNUWForm.value.Id;
          SendBackRejectObj.Stage = this.RFQQNUWForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.RFQQNUWForm.value.SendBackRejectDesc;

          this._RFQService.SendBack(SendBackRejectObj).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, "false")
              this._router.navigate([ROUTING_PATH.Basic.Dashboard])
            }
            else {
              if (res.Alerts && res.Alerts?.length > 0) {
                this._alertservice.raiseErrors(res.Alerts)
              } else {
                this._alertservice.raiseErrorAlert(res.Message)
              }
            }
          });
        }
      });
  }

  public SubmitForm() {

    if (this.BasicDetailAlert.length > 0) {
      this._alertservice.raiseErrors(this.BasicDetailAlert);
      return;
    }
    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
      return;
    }
    if (this.QnDocumentAlert.length > 0) {
      this._alertservice.raiseErrors(this.QnDocumentAlert);
      return;
    }

    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }

    let SubmitFormValue = JSON.parse(JSON.stringify(this.RFQQNUWForm.value))

    this.AdditionalDetailFireAndFirePackage.forEach(element => {
      if (SubmitFormValue?.OtherDetail[element.answerKey] && SubmitFormValue?.OtherDetail[element.answerKey] == null) {
        SubmitFormValue.OtherDetail[element.answerKey] = false
      }
    });

    this._RfqFireService.SubmitQuotation(SubmitFormValue).subscribe(res => {
      if (res.Success) {
        this._alertservice.raiseSuccessAlert(res.Message, "false")
        this._router.navigate([ROUTING_PATH.Basic.Dashboard])
      }
      else {
        if (res.Alerts && res.Alerts?.length > 0) {
          this._alertservice.raiseErrors(res.Alerts)
        }
        else {
          this._alertservice.raiseErrorAlert(res.Message)
        }
      }
    })
  }

  public ExpandCollaps() {
    this.isExpand = !this.isExpand;
  }

  public FilterDisplaySumInsuredDetails() {

    let TypeWiseDisplaySumInsuredDetails = this._RfqFireService.DisplaySumInsuredDetailsHomeAndFire()
      .filter(item => item.DisplayFor.includes(this.DisplayForm.Type))

    return TypeWiseDisplaySumInsuredDetails
  }


  // remove Query details 
  public removePrevPolicyDetails(index: number) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.PrevPolicyDetails.removeAt(index);
        }
      });

  }

  public addPrevPolicyDetails() {

    if (this.ClaimsDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.ClaimsDetailAlerts);
      return;
    }
    else {
      var row: IPrevPolicyDetailDTO = new PrevPolicyDetailDTO()
      row.RFQId = this.RFQQNUWForm.get("Id").value;
      this.PrevPolicyDetails.push(this._initPrevPolicyDetailForm(row));
    }
  }
  // remove Query details 
  public removeJwelleryDetails(index: number) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.JwelleryDetails.removeAt(index);
        }
      });

  }

  public addJwelleryDetails() {
    var row: IJwelleryDetailsDTO = new JwelleryDetailsDTO()
    row.RFQId = this.RFQQNUWForm.get("Id").value;
    this.JwelleryDetails.push(this._initIJwelleryDetailsDTOForm(row));
  }

  // remove Query details 
  public removeContentDetails(index: number) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.ContentDetails.removeAt(index);
        }
      });

  }

  public addJContentDetails() {
    var row: IContentDetailsDTO = new ContentDetailsDTO()
    row.RFQId = this.RFQQNUWForm.get("Id").value;
    this.ContentDetails.push(this._initContentDetailsForm(row));
  }


  // delete row from the document array based on index number
  public deleteDocument(index: number) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.QNDocuments.removeAt(index)
        }
      });

  }


  // file data (QN document that is added)
  public UploadQNPDF(event, index) {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = () => { };
    reader.readAsDataURL(file);

    if (file) {

      this._dataService
        .UploadFile(this.UploadFileAPI, file)
        .subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message);
            this.QNDocuments.controls[index].patchValue({
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              DocumentType: 'Other',
              FileName: event.target.files[0].name,
              RFQId: this.RFQQNUWForm.get('Id').value
            })
          }
          else {
            if (res.Alerts && res.Alerts?.length > 0) {
              this._alertservice.raiseErrors(res.Alerts)
            }
            else {
              this._alertservice.raiseErrorAlert(res.Message)
            }
          }
        });
    }
  }

  /**
   * View Uploaded Document
  */
  public ViewDocuments(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  // Add new row in document array
  public addQNDocuments() {
    this.QNDocAlerts = [];
    this.QNDocuments.controls.forEach((el, i) => {
      if (el.get('FileName').value === "") {
        this.QNDocAlerts.push({
          Message: `Attach QN PDF ${i + 1} is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });

    if (this.QNDocAlerts.length > 0) {
      this._alertservice.raiseErrors(this.QNDocAlerts);
      return;
    }
    else {
      var row: IFireQNDocumentsDto = new FireQNDocumentsDto()
      this.QNDocuments.push(this._initQNDocuments(row))
    }
  }

  /**
   * Document Selection Change
  */
  public onDocumentSelectionChange(selectedValue): void {
    this._validateAttachDocField()

    if (this.AttachDocumentAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachDocumentAlerts)
      this.DocumentDropdown.nativeElement.value = ""
      return;
    }

    let selectedDocument = selectedValue.target.value;
    this.addDocuments(selectedDocument);
    this.DocumentDropdown.nativeElement.value = ""
  }

  /**
   * Add new row in Document array
  */
  public addDocuments(selectedDocument?: string) {
    const row: IFireDocumentsDto = new FireDocumentsDto();
    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.PolicyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.PolicyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.PolicyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = this.DisplayForm.Stage;
        this.Documents.push(this._initDocumentForm(row));
      }
    }
  }

  /**
   * Delete document With User Confirmation
   */
  public RemoveDocuments(index: number) {
    this._dialogService.confirmDialog({
      title: 'Are You Sure?',
      message: "You won't be able to revert this",
      confirmText: 'Yes, Delete!',
      cancelText: 'No',
    })
      .subscribe((res) => {
        if (res) {
          this.Documents.removeAt(index)
        }
      });
  }

  /**
   * File Data (policy document that is added)
  */
  public SelectDocuments(event, DocIndex: number) {

    let file = event.target.files[0]

    if (file) {
      this._dataService.UploadFile(this.UploadFileAPI, file).subscribe((res) => {
        if (res.Success) {
          if (DocIndex >= 0) {
            this.Documents.controls[DocIndex].patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.DisplayForm.Stage
            })
          }
          this._alertservice.raiseSuccessAlert(res.Message);
        }
        else {
          if (res.Alerts && res.Alerts?.length > 0) {
            this._alertservice.raiseErrors(res.Alerts)
          }
          else {
            this._alertservice.raiseErrorAlert(res.Message)
          }
        }
      });
    }
  }



  /**
 * Validation part 
 */

  public BasicDetailsValidations() {
    this.BasicDetailAlert = []

    if (this.RFQQNUWForm.get('SubCategoryId').value == 0 || this.RFQQNUWForm.get('SubCategoryId').value == null) {
      this.BasicDetailAlert.push({
        Message: 'Select Poduct Sub Category',
        CanDismiss: false,
        AutoClose: false,
      })
    }


    if (!this.RFQQNUWForm.get('CategoryType').value) {
      this.BasicDetailAlert.push({
        Message: 'Select Category Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.BasicDetailAlert.length > 0) {
      this.BasicDetailStepCtrl.setErrors({ required: true });
      return this.BasicDetailStepCtrl;
    }
    else {
      this.BasicDetailStepCtrl.reset();
      return this.BasicDetailStepCtrl;
    }

  }

  public BasicDetailsError() {
    if (this.BasicDetailAlert.length > 0) {
      this._alertservice.raiseErrors(this.BasicDetailAlert);
      return;
    }
  }

  public DocumentAttachmentValidation() {
    this.DocumentAttachmentAlert = []


    this.Documents.controls.forEach((item, index) => {
      if (item.get('FileName').hasError('required') || item.get('StorageFilePath').hasError('required')) {
        this.DocumentAttachmentAlert.push({
          Message: `${item.value.DocumentTypeName} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

    })

    if (this.DocumentAttachmentAlert.length > 0) {
      this.DocumentAttachmentStepCtrl.setErrors({ required: true });
      return this.DocumentAttachmentStepCtrl;
    }
    else {
      this.DocumentAttachmentStepCtrl.reset();
      return this.DocumentAttachmentStepCtrl;
    }
  }

  public ProductCategoryDetailsValidations() {

    this.ProductCategoryDetailsAlert = []


    if (this.DisplayForm.Type == 'Home') {

      if (this.RFQQNUWForm.get('OtherDetail.Distance').value == null ||
        this.RFQQNUWForm.get('OtherDetail.Distance').value.toString() == "" ||
        parseInt(this.RFQQNUWForm.get('OtherDetail.Distance').value) < 0) {
        this.ProductCategoryDetailsAlert.push({
          Message: `Waterbody Distance (Km) is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.RFQQNUWForm.get('OtherDetail.CostOfConstruction').value <= 0 ||
        this.RFQQNUWForm.get('OtherDetail.CostOfConstruction').value == null ||
        this.RFQQNUWForm.get('OtherDetail.CostOfConstruction').value == "") {
        this.ProductCategoryDetailsAlert.push({
          Message: `Constr. Cost(Per Sq Ft) is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }


    }

    if (this.DisplayForm.Type == 'Fire' || this.DisplayForm.Type == 'Fire Package') {

      if (this.AdditionalDetailFireAndFirePackage && this.AdditionalDetailFireAndFirePackage?.length > 0) {
        this.AdditionalDetailFireAndFirePackage?.forEach((que, i) => {

          if (this.OtherDetailForm.get(que.answerKey).value == null) {
            this.ProductCategoryDetailsAlert.push({
              Message: `Please provide answer of additional detail question No. ${i + 1}`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

        })
      }

    }


    if (this.ProductCategoryDetailsAlert.length > 0) {
      this.ProductCategoryDetailsStepCtrl.setErrors({ required: true });
      return this.ProductCategoryDetailsStepCtrl;
    }
    else {
      this.ProductCategoryDetailsStepCtrl.reset();
      return this.ProductCategoryDetailsStepCtrl;
    }
  }

  public ProductCategoryDetailsError() {
    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
      return;
    }
  }



  public QnDocumentValidation() {
    this.QnDocumentAlert = []

    if (this.QNDocuments.controls.length <= 0) {
      this.QnDocumentAlert.push({
        Message: `At least one Qn Document is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }


    this.QNDocuments.controls.forEach((el, i) => {
      if (el.get('FileName').value === "") {
        this.QnDocumentAlert.push({
          Message: `Attach QN PDF ${i + 1} is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });

    if (this.QnDocumentAlert.length > 0) {
      this.QnDocumentStepCtrl.setErrors({ required: true });
      return this.QnDocumentStepCtrl;
    }
    else {
      this.QnDocumentStepCtrl.reset();
      return this.QnDocumentStepCtrl;
    }

  }

  public QnDocumentError() {
    if (this.QnDocumentAlert.length > 0) {
      this._alertservice.raiseErrors(this.QnDocumentAlert);
      return;
    }
  }


  public PreviousPolicyDetailsValidations() {
    this.ClaimsDetailAlerts = []

    if (this.DisplayForm.PolicyType == 'Rollover' || this.DisplayForm.PolicyType == 'Renewal-Change Company' || this.DisplayForm.PolicyType == 'Renewal-Same Company') {

      if (this.DisplayForm.AnyClaiminLast3Year == true) {

        this.PrevPolicyDetails.controls.forEach((el, i) => {

          if (!el.get("FinancialYearId").value || el.get("FinancialYearId").value == 0) {
            this.ClaimsDetailAlerts.push({
              Message: `${i + 1}. Financial Year is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }


          if (el.get("ReasonOfClaim").value == "" || el.get("ReasonOfClaim").value == null) {
            this.ClaimsDetailAlerts.push({
              Message: `${i + 1}. Reason of Claim is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }


          if (el.get("ClaimApprovalAmount").value == 0 || el.get("ClaimApprovalAmount").value == "" || el.get("ClaimApprovalAmount").value == null) {
            this.ClaimsDetailAlerts.push({
              Message: `${i + 1}. Enter Claim Amount.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (el.get("Status").value == "" || el.get("Status").value == null) {
            this.ClaimsDetailAlerts.push({
              Message: `${i + 1}. Select Status.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

        });


      }

    }

    if (this.ClaimsDetailAlerts.length > 0) {
      this.ClaimsDetailStepCtrl.setErrors({ required: true });
      return this.ClaimsDetailStepCtrl;
    } else {
      this.ClaimsDetailStepCtrl.reset();
      return this.ClaimsDetailStepCtrl;
    }
  }


  // alert message if step three is not validated
  public PreviousPolicyDetailsError() {
    if (this.ClaimsDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.ClaimsDetailAlerts);
      return;
    }
  }


  public chosenYearHandler(mfgYear: Moment, picker, index: number) {
    this.ContentDetails.controls[index].patchValue({
      ManufacturingYear: mfgYear.year()
    });
    picker.close();
  }


  public rfqUWassign(type: 'assign' | 'unassign' | 'reassign') {
    this._RFQService.rfqUWassign(this.DisplayForm, type)
    this._RFQService.assignUnassignRes.subscribe(res => {
      if (res) {
        this.backButton()
        this._RFQService.assignUnassignRes.unsubscribe()
      }
    })
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build Main Form
  private _buildForm(data: IFireQNbyUWDTO) {

    let fg = this.fb.group({
      Id: [0],
      Deductible: [0],
      QNDocuments: this._buildQNDocuments(data.QNDocuments),
      Documents: this._buildDocumentsForm(data.Documents),


      SubCategoryId: [0],
      SubCategoryName: [""],
      CategoryType: [""],
      JwelleryDetails: this._buildIJwelleryDetailsDTOForm(data.JwelleryDetails),
      ContentDetails: this._buildContentDetailsForm(data.ContentDetails),
      PrevPolicyDetail: this._buildPrevPolicyDetailForm(data.PrevPolicyDetail),
      OtherDetail: this._initOtherDetailForm(data.OtherDetail),

      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
    })

    if (data != null) {
      fg.patchValue(data);
    }

    return fg;
  }

  // Build Quotation Note Document Formarray
  private _buildQNDocuments(items: IFireQNDocumentsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);

    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initQNDocuments(i));
        });
      }
    }

    return formArray;
  }

  // Init Quotation Note Document Form
  private _initQNDocuments(item: IFireQNDocumentsDto): FormGroup {
    let dFQN = this.fb.group({
      Id: [0],
      RFQId: [0],
      InsuranceCompany: [''],
      InsuranceCompanyName: [''],
      InsuranceCompanyShortName: [''],
      ProductName: [''],
      ProductCode: [''],
      SumInsured: [0],
      GrossPremium: [0],
      Buy: [false],
      FileName: [''],
      StorageFileName: [''],
      StorageFilePath: ['']
    })

    if (item != null) {
      if (item) {
        dFQN.patchValue(item);
      }
      else {
        item = new FireQNDocumentsDto();
      }
    }
    return dFQN
  }


  // Documents FormArray
  private _buildDocumentsForm(items: IFireDocumentsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initDocumentForm(i));
        });
      }
    }

    return formArray;
  }

  // Documents FormGroup
  private _initDocumentForm(data: IFireDocumentsDto): FormGroup {

    let DocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      DocumentTypeName: [''],
      DocumentNo: [''],
      FileName: ['', [Validators.required]],
      StorageFileName: [''],
      StorageFilePath: ['', [Validators.required]],
      ImageUploadName: [''],
      ImageUploadPath: ['', [Validators.required]],
      Description: [''],
      Stage: [''],
    });

    if (data) {
      DocumentForm.patchValue(data)
    }

    return DocumentForm;

  }

  // Documents FormArray
  private _buildIJwelleryDetailsDTOForm(items: IJwelleryDetailsDTO[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initIJwelleryDetailsDTOForm(i));
        });
      }
    }

    return formArray;
  }

  // Documents FormGroup
  private _initIJwelleryDetailsDTOForm(data: IJwelleryDetailsDTO): FormGroup {

    let DocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      OrnamentName: [''],
      TotalWeight: [0],
      NoOfQuantity: [0],
      SumInsured: [0],
    });

    if (data) {
      DocumentForm.patchValue(data)
    }

    return DocumentForm;

  }

  // Documents FormArray
  private _buildContentDetailsForm(items: IContentDetailsDTO[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initContentDetailsForm(i));
        });
      }
    }

    return formArray;
  }

  // Documents FormGroup
  private _initContentDetailsForm(data: IContentDetailsDTO): FormGroup {

    let DocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      ItemDesc: [""],
      Make: [""],
      SerialNo: [""],
      ModelNo: [""],
      ManufacturingYear: [""],
      SumInsured: [0],
      Quantity: [0],
      Remarks: [""],
    });

    if (data) {
      DocumentForm.patchValue(data)
    }

    return DocumentForm;

  }

  // Documents FormArray
  private _buildPrevPolicyDetailForm(items: IPrevPolicyDetailDTO[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPrevPolicyDetailForm(i));
        });
      }
    }

    return formArray;
  }

  // Documents FormGroup
  private _initPrevPolicyDetailForm(data: IPrevPolicyDetailDTO): FormGroup {

    let DocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      FinancialYearId: [0],
      FinancialYear: [''],
      MemberName: [''],
      ClaimType: [''],
      ReasonOfClaim: [''],
      Status: [''],
      ClaimApprovalAmount: [0],
      _Premium: [0],
      Premium: [0],
      FileName: [''],
      StorageFileName: [''],
      StorageFilePath: [''],
      ImageUploadName: [''],
      ImageUploadPath: [''],
    });

    if (data) {
      DocumentForm.patchValue(data)
    }

    return DocumentForm;

  }

  // Documents FormGroup
  private _initOtherDetailForm(data: IOtherDetailDTO): FormGroup {

    let DocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      BuildingAge: [""],
      CostOfConstruction: [0],
      Distance: [0],
      OtherDetailRemark: [""],
      OtherDetailRemark1: [""],
      BasementUsedForAnyOperation: [2],
      BasementUsedForAnyOperationDesc: [""],
      BasementUsedForAnyStorage: [2],
      BasementUsedForAnyStorageDesc: [""],
      AnyMachineInstalledInBasement: [2],
      AnyMachineInstalledInBasementDesc: [""],
      DeWateringMachineAvailableInBasement: [2],
      DeWateringMachineAvailableInBasementDesc: [""],
      SecurityMeasuresInBuilding: [2],
      SecurityMeasuresInBuildingDesc: [""],
      CCTVAvailableInBuilding: [2],
      NoOfCCTV: [0],
      FireExtingusherInBuilding: [2],
      NoOfFireExtingusher: [0],
      LocatedNearWaterBody: [2],
      WaterBodyDistanceName: [""],
      NearToFireBrigade: [2],
      FireBrigadeDistance: [0],
      AnyDetectorPresent: [2],
      NoOfDetectors: [],
      LeastPlinthLevelPresent: [2],
      LeastPlinthLevelPresentDesc: [""],
      EquipmentAndInstallationwellMaintained: [2],
      ProvisionForUnderWaterDrainegeSystem: [2],
      FloterCoverage: [2],
      TerrorismCoverage: [2],
    });

    if (data) {
      DocumentForm.patchValue(data)
    }
    return DocumentForm;
  }



  /**
   * Validate the Attached Document
  */
  private _validateAttachDocField() {
    this.AttachDocumentAlerts = []
    this.Documents.controls.forEach((element, index) => {
      if (element.get('StorageFilePath').hasError('required')) {
        this.AttachDocumentAlerts.push({
          Message: `${element.value.DocumentType} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });
  }


  private _fillMasterList() {
    // fill Product Type
    let SubCategoryRule: IFilterRule[] = [
      ActiveMasterDataRule,
      {
        Field: "Category.Code",
        Operator: "eq",
        Value: CategoryCodeEnum.Fire
      }
    ]

    let OrderBySpecs: OrderBySpecs[] = [
      {
        field: "SrNo",
        direction: "asc"
      }
    ]

    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.SubCategory.List, 'Name', '', SubCategoryRule, [], OrderBySpecs)
      .subscribe(res => {
        if (res.Success) {
          this.SubCategoryList = res.Data.Items
        }
      });


    // Fill Insurance Company
    let FinancialYearRule: IFilterRule[] = [ActiveMasterDataRule];


    this._MasterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.FinancialYear.List, 'FYCode', "", FinancialYearRule)
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.FinancialYearList = res.Data.Items
          } else {
            this.FinancialYearList = [];
          }
        } else {
          this.FinancialYearList = []
        }
      })
  }


  private _onFormChange() {

    this.AdditionalDetailFireAndFirePackage.forEach(que => {

      if (que.answerKey) {
        this.OtherDetailForm.get(que.answerKey).valueChanges.subscribe(val => {

          if (que.descriptionKey && que.descriptionType == 'text') {
            this.OtherDetailForm.get(que.descriptionKey).patchValue('')
          }

          if (que.descriptionKey && (que.descriptionType == 'number' || que.descriptionType == 'decimal')) {
            this.OtherDetailForm.get(que.descriptionKey).patchValue(0)
          }

        })
      }

    })
  }

  //#endregion private-methods

}
