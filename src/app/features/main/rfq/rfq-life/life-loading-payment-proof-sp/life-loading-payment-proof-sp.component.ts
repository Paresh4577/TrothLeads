import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { AuthService } from '@services/auth/auth.service';
import { RfqLifeService } from '../rfq-life.service';
import { ROUTING_PATH } from '@config/routingPath.config';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MatStepper } from '@angular/material/stepper';
import { LifeDocumentsDto, ILifeDocumentsDto, ILifeLoadingPaymentProofDto, ILifePaymentDetailsDto, LifePaymentDetailsDto } from '@models/dtos';
import { DisplayedLifePremiumInstallmentType } from '@config/rfq';
import { IBankDto } from '@models/dtos/core/BankDto';
import { Alert, IFilterRule } from '@models/common';
import { environment } from 'src/environments/environment';
import { LifePolicyTypeEnum } from 'src/app/shared/enums/rfq-life';
import { CategoryCodeEnum, SubCategoryCodeEnum } from 'src/app/shared/enums';
import * as moment from 'moment';
import { RFQDocumentsDrpList } from '@config/rfq';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-life-loading-payment-proof-sp',
  templateUrl: './life-loading-payment-proof-sp.component.html',
  styleUrls: ['./life-loading-payment-proof-sp.component.scss'],
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
export class LifeLoadingPaymentProofSpComponent {

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  // Variables
  pagetitle: string = '';
  isExpand: boolean = false;
  IsPOSPUser: boolean = false;
  mode: string = '';
  ProposerName: string;

  DisplayForm: any;

  //Form Group 
  LifeLPPSForm: FormGroup;

  // Alert Array List
  detailsFieldsList: any[] // A list of Insured person Questionary
  BankList: IBankDto[];// Store Bank list

  AttachPaymentProofAlerts: Alert[] = [];
  AttachPaymentProofAlerts2: Alert[] = [];
  AttachPaymentProofStepCtrl = new FormControl();

  DocumentAttachmentAlert: Alert[] = [];
  DocumentAttachmentStepCtrl = new FormControl();

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  //Enums
  LifePolicyTypeEnum = LifePolicyTypeEnum;
  SubCategoryCodeEnum = SubCategoryCodeEnum;

  /**
   * #region constructor
   * @param _fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
  */
  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public dialog: MatDialog,
    public _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private _dialogService: DialogService,
    private _MasterListService: MasterListService,
    private _rfqLifeService: RfqLifeService,
    private _Location: Location,
  ) {
    // Get Inssuerd Person Questionary list
    this.detailsFieldsList = this._rfqLifeService.getdetailsFieldsList()

    this._fillMasterList();

    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == "Agent") {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }
  }
  // #endregion constructor

  // #region Getters

  //Documents FormArray
  get Documents() {
    return this.LifeLPPSForm.get('Documents') as FormArray;
  }

  // Document Type List
  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Life))
  }

  // Payment Details FormArray
  get PaymentDetails() {
    return this.LifeLPPSForm.get('LoadingPaymentDetails') as FormArray;
  }

  //Get Gross Premium for only Buy=true
  get getGrossPremium() {
    return this.DisplayForm.QNDocuments.find((f) => f.Buy == true)?.GrossPremium
  }

  get DisplayedLifePremiumInstallmentType() {
    return DisplayedLifePremiumInstallmentType;
  }

  // #endRegion Getters


  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  // On Init
  ngOnInit(): void {

    //Get Route Params Data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title']
    this.mode = data['mode']
    this.DisplayForm = data['data'];

    // Init Form
    this.LifeLPPSForm = this._initForm(this.DisplayForm);

    if (this.PaymentDetails.controls.length == 0) {
      this.addPaymentDetails()
    }

    /**
   * If Login user is Agent then Paid By field is not Display Then If 
   * LoadingPremiumAmountPaidBy value is blank then set default value is Customer
   */
    if (this.IsPOSPUser) {
      if (!this.LifeLPPSForm.get('LoadingPremiumAmountPaidBy').value) {
        this.LifeLPPSForm.get('LoadingPremiumAmountPaidBy').patchValue('Customer')
      }
    }

    this.ProposerName = this.DisplayForm?.Members[0]?.Name;
  }

  // After View Init
  ngAfterViewInit(): void {
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();

    this.cdr.detectChanges();
  }

  //#endregion lifecyclehooks


  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // Back Button
  public backButton() {
    this._Location.back();
  }

  // Expand Collapse Button
  public ExpandCollaps() {
    this.isExpand = !this.isExpand;
  }



  // Reject Button
  public RejectButton() {
    if (this.LifeLPPSForm.get('SendBackRejectDesc').value == "" || this.LifeLPPSForm.get('SendBackRejectDesc').value == null) {
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
          this._rfqLifeService.Reject(this.LifeLPPSForm.value).subscribe((res) => {
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

  // SendBack Button
  public SendBackButton() {
    if (this.LifeLPPSForm.get('SendBackRejectDesc').value == "" || this.LifeLPPSForm.get('SendBackRejectDesc').value == null) {
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
          this._rfqLifeService.SendBack(this.LifeLPPSForm.value).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, "false");
              this._router.navigate([ROUTING_PATH.Basic.Dashboard]);
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

  // Submit Form Button
  public SubmitFormButton() {

    if (this.AttachPaymentProofAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachPaymentProofAlerts)
      return;
    }

    if (this.AttachPaymentProofAlerts2.length > 0) {
      this._alertservice.raiseErrors(this.AttachPaymentProofAlerts2)
      return;
    }

    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert)
      return;
    }


    this._rfqLifeService.SubmitLoadingPaymentProof(this.LifeLPPSForm.value).subscribe(res => {
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

  /**
   * Document Selection Change
  */
  public onDocumentSelectionChange(selectedValue): void {

    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert)
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
    const row: ILifeDocumentsDto = new LifeDocumentsDto();
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
    }).subscribe((res) => {
      if (res) {
        this.Documents.removeAt(index)
      }
    });
  }

  // remove cheque details 
  public removeChequeDetails(rowNo: number) {
    this._dialogService.confirmDialog({
      title: 'Are You Sure?',
      message: "You won't be able to revert this",
      confirmText: 'Yes, Delete!',
      cancelText: 'No',
    })
      .subscribe((res) => {
        if (res) {
          this.PaymentDetails.removeAt(rowNo);
        }
      });
  }

  // upload cheque details in attached payment proof
  public uploadChequeDocument(event: any, MainRow: number, CurrentRow: number, DocumentType: string) {

    let file = event.target.files[0]

    if (file) {
      this._dataService.UploadFile(this.UploadFileAPI, file).subscribe((res) => {
        if (res.Success) {
          this.PaymentDetails.controls.forEach((element, index) => {
            if (index == MainRow) {
              (element.get('Documents') as FormArray).controls.forEach((el, i) => {
                if (i == CurrentRow) {
                  el.patchValue({
                    FileName: res.Data.FileName,
                    StorageFileName: res.Data.StorageFileName,
                    StorageFilePath: res.Data.StorageFilePath,
                    RFQId: this.DisplayForm.Id,
                    DocumentType: DocumentType,
                  });
                }
              });
            }
          });
          this._alertservice.raiseSuccessAlert(res.Message);
        }
        else {
          this._alertservice.raiseErrors(res.Alerts);
        }
      });
    }
  }

  // remove cheque details in attached payment proof
  public removeChequeDocuments(MainRow: number, CurrentRow: number, docObj) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.PaymentDetails.controls.forEach((element, index) => {
            if (index == MainRow) {
              (element.get('Documents') as FormArray).removeAt(CurrentRow)
            }
          });
        }

      });

  }

  // view attached file 
  public ViewQnDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  // view Quotation (Veiw Uploaded Policy document)
  public ViewQuotation() {
    window.open(environment.apiDomain + "/Attachments/" + this.DisplayForm.QNDocuments.filter((f) => f.Buy == true)[0].StorageFilePath);
  }

  // validate decimal point, minus and decimal number 
  public DecimalWithMinus(event) {

    if (typeof event.target.selectionStart == "number") {
      if (event.target.selectionStart == 0 && event.target.selectionEnd == event.target.value.length) {
        event.target.value = "";
      }
    }

    event.target.value.replace(/[^0-9\.]/g, '')
    var findsDot = new RegExp(/\./g)
    var containsDot = event.target.value.match(findsDot)
    if (containsDot != null && ([46, 110, 190].indexOf(event.which) > -1)) {
      event.preventDefault();
      return false;
    }

    // for 2 decimal point allow only 
    var DotArrValue = event.target.value.split(".");
    if (DotArrValue.length > 1 && [8, 9, 13, 27, 37, 38, 39, 40].indexOf(event.which) == -1) {
      if (DotArrValue[1].length > 1) {
        event.preventDefault();
        return false;
      }
    }

    if (event.which == 64 || event.which == 16) {
      // numbers
      return false;
    } if ([8, 9, 13, 27, 37, 38, 39, 40].indexOf(event.which) > -1) {
      // backspace, tab, enter, escape, arrows
      return true;
    } else if (event.which >= 48 && event.which <= 57) {
      // numbers
      return true;
    } else if (event.which >= 96 && event.which <= 105) {
      // numpad number
      return true;
    } else if ([46, 110, 190].indexOf(event.which) > -1 && event.target.value.length > 1) {
      // dot and numpad dot
      return true;
    } else if ([109, 189].indexOf(event.which) > -1 && event.target.value.length < 1) {
      // "-" and numpad "-"
      return true;
    }
    else {
      event.preventDefault();
      return false;
    }

  }


  // add cheque details in attached payment proof
  public addChequeDocuments(MainRow: number) {
    const row: ILifeDocumentsDto = new LifeDocumentsDto();
    row.RFQId = this.LifeLPPSForm.get("Id").value;
    this.PaymentDetails.controls.forEach((element, index) => {
      if (index == MainRow) {
        (element.get('Documents') as FormArray).push(this._initDocumentForm(row))
      }
    });
  }


  // Add new row in cheque details array
  public addPaymentDetails() {

    if (this.AttachPaymentProofAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachPaymentProofAlerts);
      return;
    }
    else {
      var row: ILifePaymentDetailsDto = new LifePaymentDetailsDto()
      row.RFQId = this.LifeLPPSForm.get("Id").value;
      this.PaymentDetails.push(this._initPaymentDetailsForm(row))
      this.addChequeDocuments(this.PaymentDetails.controls.length - 1);
    }
  }

  public NomineeAge(nomineeDOB) {
    if (nomineeDOB) {
      let NomineeAge = moment.duration(moment().diff(nomineeDOB));
      return NomineeAge.years()
    } else {
      return 0;
    }
  }


  public AttachPaymentProofValidations() {
    this.AttachPaymentProofAlerts = []
    this.AttachPaymentProofAlerts2 = []

    this.PaymentDetails.controls.forEach((el, i) => {

      if (el.get('PremiumAmountPaid').value === "" || el.get('PremiumAmountPaid').value === 0) {
        this.AttachPaymentProofAlerts.push({
          Message: `Premium Amount Paid ${i + 1} is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.DisplayForm?.PaymentMode == 'Cheque') {
        if (!el.get('BankId').value) {
          this.AttachPaymentProofAlerts.push({
            Message: `Issuing Bank Name ${i + 1} is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (el.get('ChequeDepositeDate').value && el.get('ChequeDate').value) {
          if (el.get('ChequeDate').value > el.get('ChequeDepositeDate').value) {
            this.AttachPaymentProofAlerts.push({
              Message: `Enter valid  Cheque Deposit Date ${i + 1}.`,
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
      }

      (el.get('Documents') as FormArray).controls.forEach((element, j) => {

        if (element.get('StorageFileName').value === "" || element.get('StorageFileName').value === null) {
          this.AttachPaymentProofAlerts.push({
            Message: `Attach Payment Proof ${j + 1} at row no ${i + 1} is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

      })
    });

    if (!this.LifeLPPSForm.get('LoadingPremiumAmountPaidBy').value) {
      this.AttachPaymentProofAlerts2.push({
        Message: `Paid By is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.AttachPaymentProofAlerts.length > 0 || this.AttachPaymentProofAlerts2.length > 0) {
      this.AttachPaymentProofStepCtrl.setErrors({ required: true });
      return this.AttachPaymentProofStepCtrl;
    }
    else {
      this.AttachPaymentProofStepCtrl.reset();
      return this.AttachPaymentProofStepCtrl;
    }

  }


  public AttachPaymentProofError() {
    if (this.AttachPaymentProofAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachPaymentProofAlerts);
      return;
    }

    if (this.AttachPaymentProofAlerts2.length > 0) {
      this._alertservice.raiseErrors(this.AttachPaymentProofAlerts2);
      return;
    }
  }

  public DocumentAttachmentValidation() {
    this.DocumentAttachmentAlert = []


    this.Documents.controls.forEach((item, index) => {
      if (item.get('FileName').hasError('required') || item.get('StorageFilePath').hasError('required')) {
        this.DocumentAttachmentAlert.push({
          Message: `${item.value.DocumentType} Attachment is required.`,
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


  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  // Init Form
  private _initForm(data: ILifeLoadingPaymentProofDto) {
    let fg = this.fb.group({
      Id: [0],
      LoadingPremiumAmountPaidBy: [''],
      Documents: this._buildDocumentsForm(data.Documents),
      LoadingPaymentDetails: this._buildPaymentDetailsForm(data.LoadingPaymentDetails),

      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
    })

    if (data) {
      fg.patchValue(data);
    }

    return fg;
  }

  // Documents FormArray
  private _buildDocumentsForm(items: ILifeDocumentsDto[] = []): FormArray {
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
  private _initDocumentForm(data: ILifeDocumentsDto): FormGroup {

    let DocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      DocumentTypeName: [''],
      DocumentNo: [''],
      FileName: ['', [Validators.required, this.noWhitespaceValidator]],
      StorageFileName: [''],
      StorageFilePath: ['', [Validators.required, this.noWhitespaceValidator]],
      ImageUploadName: [''],
      ImageUploadPath: ['', [Validators.required, this.noWhitespaceValidator]],
      Description: [''],
      Stage: [''],
    });

    if (data != null) {
      DocumentForm.patchValue(data);
    }

    return DocumentForm;
  }

  // Documents FormArray
  private _buildPaymentDetailsForm(items: ILifePaymentDetailsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPaymentDetailsForm(i));
        });
      }
    }

    return formArray;
  }

  // Documents FormGroup
  private _initPaymentDetailsForm(data: ILifePaymentDetailsDto): FormGroup {

    let PaymentDetailsForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      PremiumAmountPaid: [0],
      BankId: [],
      IssuingBankName: [''],
      ChequeNo: [''],
      IFSC: [''],
      ChequeDate: [''],
      ChequeDepositeDate: [''],
      Stage: [''],
      Documents: this._buildDocumentsForm(data.Documents)
    });

    if (data != null) {
      PaymentDetailsForm.patchValue(data);
    }

    return PaymentDetailsForm;
  }

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }


  // fill master data
  private _fillMasterList() {

    let ActiveDataRule: IFilterRule[] = [ActiveMasterDataRule]
    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Bank.List, 'Name', "", ActiveDataRule)
      .subscribe(res => {
        if (res.Success) {
          this.BankList = res.Data.Items
        }

      })
  }

  //#endregion private-methods
}
