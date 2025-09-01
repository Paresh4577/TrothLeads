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
import { Alert, IFilterRule } from '@models/common';
import { PADocumentsDto, IPADocumentsDto, IPANomineeDetailDto, IPAPaymentDetailsDto, PANomineeDetailDto, PAPaymentDetailsDto } from '@models/dtos';
import { IBankDto } from '@models/dtos/core/BankDto';
import { AuthService } from '@services/auth/auth.service';
import { environment } from 'src/environments/environment';
import { RfqPaService } from '../rfq-pa.service';
import { RfqService } from '../../rfq.service';
import { RFQDocumentsDrpList } from '@config/rfq';
import { CategoryCodeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { ROUTING_PATH } from '@config/routingPath.config';


const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-pa-payment-proof-sp',
  templateUrl: './pa-payment-proof-sp.component.html',
  styleUrls: ['./pa-payment-proof-sp.component.scss'],
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
export class PaPaymentProofSpComponent {

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  // Variables
  pagetitle: string = '';
  mode: string = '';
  isExpand: boolean = false;
  IsPOSorReamRefPUser: boolean = false;
  DisplayForm: any;
  SelectedQN: any
  BankList: IBankDto[];// Store Bank list
  // FormGroup 
  PaymentProofForm: FormGroup;
  ProposerName: string;

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  // ChequeAlerts: Alert[] = [];
  AttachPaymentProofAlerts: Alert[] = [];
  AttachPaymentProofArrayAlerts: Alert[] = [];
  DocumentAttachmentAlert: Alert[] = [];

  // Step Control
  AttachPaymentProofStepCtrl = new FormControl(); // Step Validation Control
  DocumentAttachmentStepCtrl = new FormControl()


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
    private _RFQPAService: RfqPaService,
    private _RFQService: RfqService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
  ) {
  }
  //#endregion constructor

  // #region Getters

  get Documents() {
    return this.PaymentProofForm.get('Documents') as FormArray;
  }


  get PaymentDetails() {
    return this.PaymentProofForm.get('PaymentDetails') as FormArray
  }

  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.PA))
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

    /**
 * When No one Nominne Found Then Add one object in nominee details TO display Blank field
 */
    if (!this.DisplayForm.NomineeDetails || this.DisplayForm.NomineeDetails?.length == 0) {
      let Nominee: IPANomineeDetailDto = new PANomineeDetailDto()
      Nominee.RFQId = this.DisplayForm.Id
      this.DisplayForm.NomineeDetails.push(Nominee)
    }

    this._fillMasterList();

    if (this.DisplayForm.QNDocuments.length > 0) {
      this.DisplayForm.QNDocuments.forEach((el) => {
        if (el.Buy == true) {
          this.SelectedQN = el;
        }
      });
    }

    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == UserTypeEnum.Agent || this.authService._userProfile.value?.UserType == UserTypeEnum.TeamReference) {
      this.IsPOSorReamRefPUser = true;
    }
    else {
      this.IsPOSorReamRefPUser = false;
    }

    // build travel form
    this.PaymentProofForm = this._buildForm(this.DisplayForm);

    if (this.PaymentDetails.controls?.length == 0) {
      this.addPaymentDetails();
    }

    /**
 * If Login user is Agent then Paid By field is not Display Then If 
 * PremiumAmountPaidBy value is blank then set default value is Customer
 */
    if (this.IsPOSorReamRefPUser) {
      if (!this.PaymentProofForm.get('PremiumAmountPaidBy').value) {
        this.PaymentProofForm.get('PremiumAmountPaidBy').patchValue('Customer')
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
    if (this.PaymentProofForm.get('SendBackRejectDesc').value == "" || this.PaymentProofForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.PaymentProofForm.value.Id;
          SendBackRejectObj.Stage = this.PaymentProofForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.PaymentProofForm.value.SendBackRejectDesc;

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
    if (this.PaymentProofForm.get('SendBackRejectDesc').value == "" || this.PaymentProofForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.PaymentProofForm.value.Id;
          SendBackRejectObj.Stage = this.PaymentProofForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.PaymentProofForm.value.SendBackRejectDesc;

          this._RFQService.SendBack(SendBackRejectObj).subscribe((res) => {
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

  public SubmitForm() {

    if (this.AttachPaymentProofArrayAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachPaymentProofArrayAlerts);
      return;
    }

    if (this.AttachPaymentProofAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachPaymentProofAlerts);
      return;
    }

    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }

    this._RFQPAService.SubmitPaymentProof(this.PaymentProofForm.value).subscribe(res => {
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



  // file data (policy document that is added)
  public UploadDocument(event, DocType) {
    let file = event.target.files[0]
    let reader = new FileReader();
    reader.onload = () => { };
    reader.readAsDataURL(file);

    if (file) {
      this._dataService
        .UploadFile(this.UploadFileAPI, file)
        .subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message);

            let DocIndex = this.Documents.controls.findIndex((doc) => doc.get('DocumentType').value === DocType)

            if (DocIndex > 0) {
              this.Documents.controls[DocIndex].patchValue({
                StorageFileName: res.Data.StorageFileName,
                StorageFilePath: res.Data.StorageFilePath,
                DocumentType: DocType,
                FileName: res.Data.FileName,
                RFQId: this.PaymentProofForm.get('Id').value
              })
            }
            else {
              const row: IPADocumentsDto = new PADocumentsDto();
              row.FileName = res.Data.FileName;
              row.DocumentType = DocType;
              row.StorageFileName = res.Data.StorageFileName;
              row.StorageFilePath = res.Data.StorageFilePath;
              row.RFQId = this.PaymentProofForm.get('Id').value
              this.Documents.push(this._initDocumentForm(row));
            }
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

  // upload cheque details in attached payment proof
  public uploadChequeDocument(event: any, MainRow: number, CurrentRow: number, DocumentType: string) {

    let file = event.target.files[0]

    if (file) {
      this._dataService
        .UploadFile(this.UploadFileAPI, file)
        .subscribe((res) => {
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
  public addChequeDocuments(MainRow: number) {
    const row: IPADocumentsDto = new PADocumentsDto();
    row.RFQId = this.PaymentProofForm.get("Id").value;
    this.PaymentDetails.controls.forEach((element, index) => {
      if (index == MainRow) {
        (element.get('Documents') as FormArray)?.push(this._initDocumentForm(row))
      }
    });
  }

  // Add new row in cheque details array
  public addPaymentDetails() {

    if (this.AttachPaymentProofArrayAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachPaymentProofArrayAlerts);
      return;
    }
    else {
      var row: IPAPaymentDetailsDto = new PAPaymentDetailsDto()
      row.RFQId = this.PaymentProofForm.get("Id").value;
      this.PaymentDetails.push(this._initPaymentDetailsForm(row))
      this.addChequeDocuments(this.PaymentDetails.controls.length - 1);
    }

  }

  // remove cheque details 
  public removeChequeDetails(rowNo: number) {

    this._dialogService
      .confirmDialog({
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

  // delete a row in document array With User Confirmation
  public RemoveDocuments(index: number) {

    this._dialogService
      .confirmDialog({
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

  // add new row in Document array
  public addDocuments(selectedDocument?: string) {

    const row: IPADocumentsDto = new PADocumentsDto();

    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.PolicyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.PolicyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.PolicyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = "RFQPaymentProofSP";
        this.Documents.push(this._initDocumentForm(row));
      }
    }
  }



  public AttachPaymentProofValidationControl() {
    this.AttachPaymentProofAlerts = [];
    this.AttachPaymentProofArrayAlerts = [];


    if (this.PaymentProofForm.get('PremiumAmountPaidBy').value === "" || this.PaymentProofForm.get('PremiumAmountPaidBy').value == null) {
      this.AttachPaymentProofAlerts.push({
        Message: `Paid By is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    this.PaymentDetails.controls.forEach((el, i) => {

      if (el.get('PremiumAmountPaid').value === "" || el.get('PremiumAmountPaid').value === 0) {
        this.AttachPaymentProofArrayAlerts.push({
          Message: `Premium Amount Paid ${i + 1} is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.DisplayForm.PaymentMode == 'Cheque') {

        if (!el.get('BankId').value) {
          this.AttachPaymentProofArrayAlerts.push({
            Message: `Issuing Bank Name ${i + 1} is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }


        if (el.get('ChequeDepositeDate').value && el.get('ChequeDate').value) {
          if (el.get('ChequeDepositeDate').value < el.get('ChequeDate').value) {
            this.AttachPaymentProofArrayAlerts.push({
              Message: `Enter valid Cheque Deposit Date ${i + 1}.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }
      }

      (el.get('Documents') as FormArray).controls.forEach((element, j) => {

        if (element.get('StorageFileName').value === "" || element.get('StorageFileName').value === null) {
          this.AttachPaymentProofArrayAlerts.push({
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
    if (this.AttachPaymentProofAlerts.length > 0 || this.AttachPaymentProofArrayAlerts.length > 0) {
      this.AttachPaymentProofStepCtrl.setErrors({ required: true });
      return this.AttachPaymentProofStepCtrl;
    } else {
      this.AttachPaymentProofStepCtrl.reset();
      return this.AttachPaymentProofStepCtrl;
    }
  }

  /**
  * Display Error message 
  */
  public AttachPaymentProofValidationError() {
    if (this.AttachPaymentProofArrayAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachPaymentProofArrayAlerts);
    }

    if (this.AttachPaymentProofAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachPaymentProofAlerts);
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
   * View Quotation document
   * @param item 
   */
  public ViewDocument(StorageFilePath: string) {
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
  private _buildForm(data: any) {

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
  private _buildDocumentsForm(items: IPADocumentsDto[] = []): FormArray {
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
  private _initDocumentForm(data: IPADocumentsDto): FormGroup {

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
  private _buildPaymentDetailsForm(items: IPAPaymentDetailsDto[] = []): FormArray {
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
  private _initPaymentDetailsForm(data: IPAPaymentDetailsDto): FormGroup {
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
      ChequeForm.patchValue(data)
    }

    return ChequeForm;
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
