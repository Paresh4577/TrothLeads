import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Alert, IFilterRule } from '@models/common';
import { DatePipe, Location } from '@angular/common'; import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ILiabilityPrePolicyDTO, IRFQLiabilityDocumentsDto, IRFQLiabilityPaymentDetailsDto, LiabilityPrePolicyDTO, RFQLiabilityDocumentsDto, RFQLiabilityPaymentDetailsDto } from '@models/dtos';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ROUTING_PATH } from '@config/routingPath.config';
import { IRfqDoclistDTO, ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { CategoryCodeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { RFQDocumentsDrpList } from '@config/rfq';
import { RfqLiabilityService } from '../rfq-liability.service';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { IBankDto } from '@models/dtos/core/BankDto';
import { AuthService } from '@services/auth/auth.service';
;


const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }
@Component({
  selector: 'gnx-liability-payment-proof-sp',
  templateUrl: './liability-payment-proof-sp.component.html',
  styleUrls: ['./liability-payment-proof-sp.component.scss'],
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
export class LiabilityPaymentProofSpComponent {

  //#region public properties
  @ViewChild('stepper') public stepper: MatStepper;
  @ViewChild('DocumentDropdown') public documentDropdown: ElementRef;

  // Variables
  public pagetitle: string = '';
  public mode: string = '';
  public isExpand: boolean = false;
  public isPOSPUser: boolean = false;
  public displayForm: any;
  public selectedQN: any
  public bankList: IBankDto[];// Store Bank list
  public isPOSorReamRefPUser: boolean = false;

  // FormGroup 
  public paymentProofForm: FormGroup;

  //#endregion


  //#region private properties

  //APIs
  private _uploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // Alert Array List
  private _attachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  private _attachPaymentProofAlerts: Alert[] = [];
  private _attachPaymentProofArrayAlerts: Alert[] = [];
  private _documentAttachmentAlert: Alert[] = [];

  // Step Control
  private _attachPaymentProofStepCtrl = new FormControl(); // Step Validation Control
  private _documentAttachmentStepCtrl = new FormControl()


  //#endregion



  //#region Constructor
  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    private _dialog: MatDialog,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _MasterListService: MasterListService,
    private _datePipe: DatePipe,
    private authService: AuthService,
    private _dialogService: DialogService,
    private _rfqLiabilityService: RfqLiabilityService,
    private _cdr: ChangeDetectorRef,
    private _location: Location,
  ) {
  }
  //#endregion constructor

  // #region Getters
  public get documents(): FormArray {
    return this.paymentProofForm.get('Documents') as FormArray;
  }


  public get paymentDetails(): FormArray {
    return this.paymentProofForm.get('PaymentDetails') as FormArray
  }

  public get policyDocumentList(): IRfqDoclistDTO[] {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Liability))
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

    this.displayForm = data['data'];

    /**
* When No one PrevPolicyDetail Found Then Add one object in PrevPolicyDetail details TO display Blank field
*/
    if (!this.displayForm.PrevPolicyDetail || this.displayForm.PrevPolicyDetail?.length == 0) {
      let row: ILiabilityPrePolicyDTO = new LiabilityPrePolicyDTO()
      row.RFQId = this.displayForm.Id
      this.displayForm.PrevPolicyDetail.push(row)
    }


    this._fillMasterList();

    if (this.displayForm.QNDocuments.length > 0) {
      this.displayForm.QNDocuments.forEach((el) => {
        if (el.Buy == true) {
          this.selectedQN = el;
        }
      });
    }

    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == UserTypeEnum.Agent || this.authService._userProfile.value?.UserType == UserTypeEnum.TeamReference) {
      this.isPOSorReamRefPUser = true;
    }
    else {
      this.isPOSorReamRefPUser = false;
    }

    // build Engineering form
    this.paymentProofForm = this._buildForm(this.displayForm);

    if (this.paymentDetails.controls?.length == 0) {
      this.addPaymentDetails();
    }

    /**
 * If Login user is Agent then Paid By field is not Display Then If 
 * PremiumAmountPaidBy value is blank then set default value is Customer
 */
    if (this.isPOSPUser) {
      if (!this.paymentProofForm.get('PremiumAmountPaidBy').value) {
        this.paymentProofForm.get('PremiumAmountPaidBy').patchValue('Customer')
      }
    }
  }

  // After View Init
  ngAfterViewInit(): void {
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();

    if (this.displayForm.PolicyType == 'Rollover' || this.displayForm.PolicyType == 'Renewal-Change Company' || this.displayForm.PolicyType == 'Renewal-Same Company') {
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
  public backButton(): void {
    this._location.back();
  }

  // Reject Button 
  public rejectButton(): void {
    if (this.paymentProofForm.get('SendBackRejectDesc').value == "" || this.paymentProofForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.paymentProofForm.value.Id;
          SendBackRejectObj.Stage = this.paymentProofForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.paymentProofForm.value.SendBackRejectDesc;

          this._rfqLiabilityService.reject(SendBackRejectObj).subscribe((res) => {
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
  public SendBackButton(): void {
    if (this.paymentProofForm.get('SendBackRejectDesc').value == "" || this.paymentProofForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.paymentProofForm.value.Id;
          SendBackRejectObj.Stage = this.paymentProofForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.paymentProofForm.value.SendBackRejectDesc;

          this._rfqLiabilityService.sendBack(SendBackRejectObj).subscribe((res) => {
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

  public submitForm(): void {

    if (this._attachPaymentProofArrayAlerts.length > 0) {
      this._alertservice.raiseErrors(this._attachPaymentProofArrayAlerts);
      return;
    }

    if (this._attachPaymentProofAlerts.length > 0) {
      this._alertservice.raiseErrors(this._attachPaymentProofAlerts);
      return;
    }

    if (this._documentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this._documentAttachmentAlert);
      return;
    }

    this._rfqLiabilityService.submitPaymentProof(this.paymentProofForm.value).subscribe(res => {
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

  public expandCollaps(): void {
    this.isExpand = !this.isExpand;
  }

  // validate decimal point, minus and decimal number 
  public decimalWithMinus(event): boolean {

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

  /**
   * File Data (policy document that is added)
  */
  public selectDocuments(event, DocIndex: number): void {
    let file = event.target.files[0]

    if (file) {

      this._dataService.UploadFile(this._uploadFileAPI, file).subscribe((res) => {
        if (res.Success) {

          if (DocIndex >= 0) {
            this.documents.controls[DocIndex].patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.displayForm.Stage
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

  // file data (policy document that is added)
  public uploadDocument(event, DocType): void {
    let file = event.target.files[0]
    let reader = new FileReader();
    reader.onload = () => { };
    reader.readAsDataURL(file);

    if (file) {
      this._dataService
        .UploadFile(this._uploadFileAPI, file)
        .subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message);

            let DocIndex = this.documents.controls.findIndex((doc) => doc.get('DocumentType').value === DocType)

            if (DocIndex > 0) {
              this.documents.controls[DocIndex].patchValue({
                StorageFileName: res.Data.StorageFileName,
                StorageFilePath: res.Data.StorageFilePath,
                DocumentType: DocType,
                FileName: res.Data.FileName,
                RFQId: this.paymentProofForm.get('Id').value
              })
            }
            else {
              const row: RFQLiabilityDocumentsDto = new RFQLiabilityDocumentsDto();
              row.FileName = res.Data.FileName;
              row.DocumentType = DocType;
              row.StorageFileName = res.Data.StorageFileName;
              row.StorageFilePath = res.Data.StorageFilePath;
              row.RFQId = this.paymentProofForm.get('Id').value
              this.documents.push(this._initDocumentForm(row));
            }
          }
          else {
            this._alertservice.raiseErrors(res.Alerts);
          }
        });
    }
  }

  // remove cheque details in attached payment proof
  public removeChequeDocuments(MainRow: number, CurrentRow: number, docObj): void {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.paymentDetails.controls.forEach((element, index) => {
            if (index == MainRow) {
              (element.get('Documents') as FormArray).removeAt(CurrentRow)
            }
          });
        }

      });

  }

  // upload cheque details in attached payment proof
  public uploadChequeDocument(event: any, MainRow: number, CurrentRow: number, DocumentType: string): void {

    let file = event.target.files[0]

    if (file) {
      this._dataService
        .UploadFile(this._uploadFileAPI, file)
        .subscribe((res) => {
          if (res.Success) {

            this.paymentDetails.controls.forEach((element, index) => {
              if (index == MainRow) {
                (element.get('Documents') as FormArray).controls.forEach((el, i) => {
                  if (i == CurrentRow) {
                    el.patchValue({
                      FileName: res.Data.FileName,
                      StorageFileName: res.Data.StorageFileName,
                      StorageFilePath: res.Data.StorageFilePath,
                      RFQId: this.displayForm.Id,
                      DocumentType: DocumentType,
                    });
                  }
                });
              }
            });
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

  // add cheque details in attached payment proof
  public addChequeDocuments(MainRow: number): void {
    const row: RFQLiabilityDocumentsDto = new RFQLiabilityDocumentsDto();
    row.RFQId = this.paymentProofForm.get("Id").value;
    this.paymentDetails.controls.forEach((element, index) => {
      if (index == MainRow) {
        (element.get('Documents') as FormArray)?.push(this._initDocumentForm(row))
      }
    });
  }

  // Add new row in cheque details array
  public addPaymentDetails(): void {

    if (this._attachPaymentProofAlerts.length > 0) {
      this._alertservice.raiseErrors(this._attachPaymentProofAlerts);
      return;
    }
    else {
      var row: IRFQLiabilityPaymentDetailsDto = new RFQLiabilityPaymentDetailsDto()
      row.RFQId = this.paymentProofForm.get("Id").value;
      this.paymentDetails.push(this._initPaymentDetailsForm(row))
      this.addChequeDocuments(this.paymentDetails.controls.length - 1);
    }

  }

  // remove cheque details 
  public removeChequeDetails(rowNo: number): void {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.paymentDetails.removeAt(rowNo);
        }

      });

  }

  // delete a row in document array With User Confirmation
  public removeDocuments(index: number): void {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.documents.removeAt(index)
        }

      });


  }

  public onDocumentSelectionChange(selectedValue): void {

    if (this._attachDocumentAlerts.length > 0) {
      this._alertservice.raiseErrors(this._attachDocumentAlerts)
      this.documentDropdown.nativeElement.value = ""
      return;
    }

    let selectedDocument = selectedValue.target.value;
    this.addDocuments(selectedDocument);
    this.documentDropdown.nativeElement.value = ""
  }

  // add new row in Document array
  public addDocuments(selectedDocument?: string): void {

    const row: RFQLiabilityDocumentsDto = new RFQLiabilityDocumentsDto();

    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.policyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.policyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.policyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = "RFQPaymentProofSP";
        this.documents.push(this._initDocumentForm(row));
      }
    }
  }

  public attachPaymentProofValidationControl(): FormControl {
    this._attachPaymentProofAlerts = [];
    this._attachPaymentProofArrayAlerts = [];


    if (this.paymentProofForm.get('PremiumAmountPaidBy').value === "" || this.paymentProofForm.get('PremiumAmountPaidBy').value == null) {
      this._attachPaymentProofAlerts.push({
        Message: `Paid By is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    this.paymentDetails.controls.forEach((el, i) => {

      if (el.get('PremiumAmountPaid').value === "" || el.get('PremiumAmountPaid').value === 0) {
        this._attachPaymentProofArrayAlerts.push({
          Message: `Premium Amount Paid ${i + 1} is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.displayForm.PaymentMode == 'Cheque') {

        if (!el.get('BankId').value) {
          this._attachPaymentProofArrayAlerts.push({
            Message: `Issuing Bank Name ${i + 1} is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (el.get('ChequeDepositeDate').value && el.get('ChequeDate').value) {
          if (el.get('ChequeDepositeDate').value < el.get('ChequeDate').value) {
            this._attachPaymentProofArrayAlerts.push({
              Message: `Enter valid Cheque Deposit Date ${i + 1}.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }
      }

      (el.get('Documents') as FormArray).controls.forEach((element, j) => {

        if (element.get('StorageFileName').value === "" || element.get('StorageFileName').value === null) {
          this._attachPaymentProofArrayAlerts.push({
            Message: `Attach Payment Proof ${j + 1} at row no ${i + 1} is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

      })
    });


    /**
    * Step control Validate
    */
    if (this._attachPaymentProofAlerts.length > 0 || this._attachPaymentProofArrayAlerts.length > 0) {
      this._attachPaymentProofStepCtrl.setErrors({ required: true });
      return this._attachPaymentProofStepCtrl;
    } else {
      this._attachPaymentProofStepCtrl.reset();
      return this._attachPaymentProofStepCtrl;
    }
  }

  /**
  * Display Error message 
  */
  public attachPaymentProofValidationError(): void {
    if (this._attachPaymentProofArrayAlerts.length > 0) {
      this._alertservice.raiseErrors(this._attachPaymentProofArrayAlerts);
    }

    if (this._attachPaymentProofAlerts.length > 0) {
      this._alertservice.raiseErrors(this._attachPaymentProofAlerts);
    }
  }

  public documentAttachmentValidation(): FormControl {
    this._documentAttachmentAlert = []

    this.documents.controls.forEach((item, index) => {
      if (item.get('FileName').hasError('required') || item.get('StorageFilePath').hasError('required')) {
        this._documentAttachmentAlert.push({
          Message: `${item.value.DocumentTypeName} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

    })

    if (this._documentAttachmentAlert.length > 0) {
      this._documentAttachmentStepCtrl.setErrors({ required: true });
      return this._documentAttachmentStepCtrl;
    }
    else {
      this._documentAttachmentStepCtrl.reset();
      return this._documentAttachmentStepCtrl;
    }

  }

  /**
 * View Quotation document
 * @param item 
 */
  public viewDocument(StorageFilePath: string): void {
    if (StorageFilePath) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + StorageFilePath)
    }
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build Main Form
  private _buildForm(data: any): FormGroup {

    let fg = this.fb.group({
      Id: [0],
      PremiumAmountPaidBy: [''],
      Documents: this._buildDocumentsForm(data.Documents),
      PaymentDetails: this._buildPaymentDetailsForm(data.PaymentDetails),
      Additionalinformation: [''],
      SendBackRejectDesc: [''],
      Stage: ['']
    })

    if (data) {
      fg.patchValue(data);
    }

    return fg;
  }

  // Documents FormArray
  private _buildDocumentsForm(items: RFQLiabilityDocumentsDto[] = []): FormArray {
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
  private _initDocumentForm(data: IRFQLiabilityDocumentsDto): FormGroup {

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

    if (data != null) {
      DocumentForm.patchValue(data);
    }


    return DocumentForm;
  }

  // Cheque Details FormArray
  private _buildPaymentDetailsForm(items: IRFQLiabilityPaymentDetailsDto[] = []): FormArray {
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

  // Cheque Details Init Details Form
  private _initPaymentDetailsForm(data: IRFQLiabilityPaymentDetailsDto): FormGroup {
    let ChequeForm = this.fb.group({
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
      Documents: this._buildDocumentsForm(data?.Documents),
    });

    if (data) {
      if (data.Stage == "RFQPaymentProofSP") {
        ChequeForm.patchValue(data)
      }
    }

    return ChequeForm;
  }

  // fill master data
  private _fillMasterList(): void {

    let ActiveDataRule: IFilterRule[] = [ActiveMasterDataRule]
    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Bank.List, 'Name', "", ActiveDataRule)
      .subscribe(res => {
        if (res.Success) {
          this.bankList = res.Data.Items
        }
      })
  }

  //#endregion private-methods

}
