import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { Alert, IFilterRule } from '@models/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { RfqMiscellaneousService } from '../rfq-miscellaneous.service';
import { MatStepper } from '@angular/material/stepper';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IFinancialYearDto } from '@models/dtos/core/FinancialYearDto';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { AuthService } from '@services/auth/auth.service';
import { DialogService } from '@lib/services/dialog.service';
import { RFQDocumentsDrpList } from '@config/rfq';
import { CategoryCodeEnum } from 'src/app/shared/enums';
import { ROUTING_PATH } from '@config/routingPath.config';
import { MiscellaneousDocumentsDto, IMiscellaneousDocumentsDto, IMiscellaneousPrePolicyDTO, IMiscellaneousQNDocumentsDto, MiscellaneousPrePolicyDTO, MiscellaneousQNDocumentsDto } from '@models/dtos';
import { environment } from 'src/environments/environment';
import { IMiscellaneousQNbyUWDTO } from '@models/dtos';
import { MiscellaneousPrevPolicyCliamStatus } from '@config/rfq';
import { RfqService } from '../../rfq.service';


const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-miscellaneous-qn-by-uw',
  templateUrl: './miscellaneous-qn-by-uw.component.html',
  styleUrls: ['./miscellaneous-qn-by-uw.component.scss'],
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
export class MiscellaneousQnByUwComponent {
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  // Variables
  pagetitle: string = '';
  mode: string = '';
  isExpand: boolean = false;
  maxManufacturingYear

  // any array list
  DisplayForm: any;

  // FormGroup 
  QNForm: FormGroup;

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  QNDocAlerts: Alert[] = []; // Step Invalid field error message
  DocumentAttachmentAlert: Alert[] = [];
  QnDocumentAlert: Alert[] = [];
  ClaimsDetailAlerts: Alert[] = [];
  MachineryDetailsProductCategoryDetailsAlert: Alert[] = [];
  FinancialYearList: IFinancialYearDto[] = []

  //Form Controls
  QnDocumentStepCtrl = new FormControl();
  DocumentAttachmentStepCtrl = new FormControl();
  ClaimsDetailStepCtrl = new FormControl();

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
    private _RfqMiscellaneousService: RfqMiscellaneousService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
    private _RFQService: RfqService,
  ) {
  }

  //#endregion constructor

  // #region Getters

  // get QNDocuments Form array
  get QNDocuments() {
    return this.QNForm.get('QNDocuments') as FormArray;
  }

  // get Documents Form Array 
  get Documents() {
    return this.QNForm.get('Documents') as FormArray;
  }

  get RFQLifeDocumentsList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Miscellaneous))
  }

  // get PrevPolicyDetail list
  get PrevPolicyDetails() {
    return this.QNForm.get('PrevPolicyDetail') as FormArray;
  }

  get PrevPolicyCliamStatus() {
    return MiscellaneousPrevPolicyCliamStatus
  }


  // #end-region Getters

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  //On Init
  ngOnInit(): void {

    // Route params data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title'];
    this.mode = data['mode'];

    this.DisplayForm = data['data'];

    // build Engineering form
    this.QNForm = this._buildForm(this.DisplayForm);

    //Remove All Existing QN Documents
    while (this.QNDocuments.controls.length !== 0) {
      this.QNDocuments.removeAt(0)
    }

    this.addQNDocuments();

    // if (this.MachineryDetail.controls.length <= 0) {
    //   this.AddMachineryRow();
    // }

    if (this.PrevPolicyDetails.controls.length <= 0 && this.DisplayForm.AnyClaiminLast3Year) {
      this.addPrevPolicyDetails();
    }

    this._fillMasterList();

  }

  // After View Init
  ngAfterViewInit(): void {

    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();

    if (!this.DisplayForm.AnyClaiminLast3Year) {
      this.stepper.next();
      this.stepper.next();
    }

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
    if (this.QNForm.get('SendBackRejectDesc').value == "" || this.QNForm.get('SendBackRejectDesc').value == null) {
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
          this._RfqMiscellaneousService.Reject(this.QNForm.value).subscribe((res) => {
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

    if (this.QNForm.get('SendBackRejectDesc').value == "" || this.QNForm.get('SendBackRejectDesc').value == null) {
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
          this._RfqMiscellaneousService.SendBack(this.QNForm.value).subscribe((res) => {
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

    if (this.ClaimsDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.ClaimsDetailAlerts);
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

    this._RfqMiscellaneousService.SubmitEngineeringQuotation(this.QNForm.value).subscribe(res => {
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
      var row: IMiscellaneousQNDocumentsDto = new MiscellaneousQNDocumentsDto()
      this.QNDocuments.push(this._initQNDocuments(row))
    }
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

  /**
  * Document Selection Change
 */
  public onDocumentSelectionChange(selectedValue): void {
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
    const row: IMiscellaneousDocumentsDto = new MiscellaneousDocumentsDto();
    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.RFQLifeDocumentsList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.RFQLifeDocumentsList[RowIndex].DocumentType;
        row.DocumentTypeName = this.RFQLifeDocumentsList[RowIndex].DocumentTypeName;
        row.Stage = this.DisplayForm.Stage;
        this.Documents.push(this._initDocumentForm(row));
      }
    }
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
          this._alertservice.raiseErrors(res.Alerts);
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
              RFQId: this.QNForm.get('Id').value
            })
          }
          else {
            this._alertservice.raiseErrors(res.Alerts);
          }
        });
    }
  }

  public addPrevPolicyDetails() {

    if (this.PrevPolicyDetails.controls.length > 0) {
      this.PreviousPolicyDetailsValidations();
    }

    if (this.ClaimsDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.ClaimsDetailAlerts);
      return;
    }
    else {
      var row: IMiscellaneousPrePolicyDTO = new MiscellaneousPrePolicyDTO()
      row.RFQId = this.QNForm.get("Id").value;
      this.PrevPolicyDetails.push(this._initPrevPoliciesForm(row));
    }
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

  // alert message if step three is not validated
  public PreviousPolicyDetailsError() {
    if (this.ClaimsDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.ClaimsDetailAlerts);
      return;
    }
  }

  // Previous Policy Details validation
  public PreviousPolicyDetailsValidations() {
    this.ClaimsDetailAlerts = [];

    if ((this.DisplayForm.PolicyType == 'Rollover' || this.DisplayForm.PolicyType == 'Renewal-Change Company' || this.DisplayForm.PolicyType == 'Renewal-Same Company') && this.DisplayForm.SubCategoryCode != 'CRA' && this.DisplayForm.SubCategoryCode != 'ERA') {

      this.PrevPolicyDetails.controls.forEach((el, i) => {

        // if (!el.get("FinancialYearId").value || el.get("FinancialYearId").value == 0) {
        //   this.ClaimsDetailAlerts.push({
        //     Message: `${i + 1}. Select Financial Year.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (el.get("ClaimType").value == "" || el.get("ClaimType").value == null) {
        //   this.ClaimsDetailAlerts.push({
        //     Message: `${i + 1}. Enter Claim Type.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (el.get("ReasonOfClaim").value == "" || el.get("ReasonOfClaim").value == null) {
        //   this.ClaimsDetailAlerts.push({
        //     Message: `${i + 1}. Enter Reason of Claim.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (el.get("Status").value == "" || el.get("Status").value == null) {
        //   this.ClaimsDetailAlerts.push({
        //     Message: `${i + 1}. Select Status.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (el.get("ClaimApprovalAmount").value == 0 || el.get("ClaimApprovalAmount").value == "" || el.get("ClaimApprovalAmount").value == null) {
        //   this.ClaimsDetailAlerts.push({
        //     Message: `${i + 1}. Enter Claim Amount.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

      });
    }

    if (this.ClaimsDetailAlerts.length > 0) {
      this.ClaimsDetailStepCtrl.setErrors({ required: true });
      return this.ClaimsDetailStepCtrl;
    } else {
      this.ClaimsDetailStepCtrl.reset();
      return this.ClaimsDetailStepCtrl;
    }
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
  private _buildForm(data: IMiscellaneousQNbyUWDTO) {

    let fg = this.fb.group({
      Id: [0],
      Deductible: [0],
      QNDocuments: this._buildQNDocuments(data.QNDocuments),
      Documents: this._buildDocumentsForm(data.Documents),
      PrevPolicyDetail: this._buildPrevPoliciesForm(data.PrevPolicyDetail),
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
  private _buildQNDocuments(items: IMiscellaneousQNDocumentsDto[] = []): FormArray {
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
  private _initQNDocuments(item: IMiscellaneousQNDocumentsDto): FormGroup {
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
        item = new MiscellaneousQNDocumentsDto();
      }
    }
    return dFQN
  }

  // Documents FormArray
  private _buildDocumentsForm(items: IMiscellaneousDocumentsDto[] = []): FormArray {
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
  private _initDocumentForm(data: IMiscellaneousDocumentsDto): FormGroup {

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


  //RFQ-Engineering PrevPolicyDetail Formarray
  private _buildPrevPoliciesForm(items: MiscellaneousPrePolicyDTO[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPrevPoliciesForm(i));
        });
      }
    }

    return formArray;
  }

  //Init PrevPolicy formgroup
  private _initPrevPoliciesForm(item: MiscellaneousPrePolicyDTO): FormGroup {
    let dF = this.fb.group({
      Id: [0],
      RFQId: [0],
      FinancialYearId: [],
      FinancialYear: [""],
      MemberName: [""],
      ClaimType: [""],
      ReasonOfClaim: [""],
      Status: [""],
      ClaimApprovalAmount: [0],
      _Premium: [0],
      Premium: [0],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: [""],
      ImageUploadName: [""],
      ImageUploadPath: [""],
    })

    if (item) {
      dF.patchValue(item);
    }

    return dF
  }

  private _fillMasterList() {
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

}