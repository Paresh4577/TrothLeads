import { DatePipe, Location } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert, IFilterRule } from '@models/common';
import { DocumentsDto, IDocumentsDto, ILoadingPaymentProofDto, IPaymentDetailsDto, LoadingPaymentProofDto, PaymentDetailsDto } from '@models/dtos/config/RFQMotor';
import { MotorPolicyTypeEnum, MotorSubCategoryCodeEnum } from 'src/app/shared/enums/rfq-motor';
import { environment } from 'src/environments/environment';
import { AuthService } from '@services/auth/auth.service';
import { MasterListService } from '@lib/services/master-list.service';
import { IBankDto } from '@models/dtos/core/BankDto';
import { RfqMotorService } from '../rfq-motor.service';
import { RfqService } from '../../rfq.service';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { HealthPolicyDocumentsList } from '@config/rfq';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-motor-loading-payment-proof-sp',
  templateUrl: './motor-loading-payment-proof-sp.component.html',
  styleUrls: ['./motor-loading-payment-proof-sp.component.scss'],
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
export class MotorLoadingPaymentProofSpComponent {

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  //Variables
  pagetitle: string; // Page main header title
  mode: string; // for identify of Raise page is create or edit or view

  IsPOSPUser: boolean = false;
  isExpand: boolean = false;

  //FormGroup 
  LPPSForm !: FormGroup;
  DisplayForm: any;

  // Alert Array List
  BankList: IBankDto[];// Store Bank list

  AttachPaymentProofAlerts: Alert[] = [];
  AttachPaymentProofAlerts2: Alert[] = [];
  AttachPaymentProofStepCtrl = new FormControl();
  DocumentAttachmentAlert: Alert[] = [];
  DocumentAttachmentStepCtrl = new FormControl();
  //Enums
  MotorPolicyTypeEnum = MotorPolicyTypeEnum;
  SubCategoryCodeEnum = MotorSubCategoryCodeEnum;

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

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
    private _dialogService: DialogService,
    private _dialog: MatDialog,
    private _RfqMotorService: RfqMotorService,
    private authService: AuthService,
    private _MasterListService: MasterListService,
    private _RfqService: RfqService,
    private _Location: Location,
  ) {
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

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  //On Init
  ngOnInit(): void {

    //Get Route Params Data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title'];
    this.DisplayForm = data['data'];
    this.mode = data['mode']
    // Init Form
    this.LPPSForm = this._initForm(this.DisplayForm);

    if (this.PaymentDetails.controls.length == 0) {
      this.addPaymentDetails()
    }

    /**
   * If Login user is Agent then Paid By field is not Display Then If 
   * LoadingPremiumAmountPaidBy value is blank then set default value is Customer
   */
    if (this.IsPOSPUser) {
      if (!this.LPPSForm.get('LoadingPremiumAmountPaidBy').value) {
        this.LPPSForm.get('LoadingPremiumAmountPaidBy').patchValue('Customer')
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

    if (this.DisplayForm.PolicyType == MotorPolicyTypeEnum.Rollover || this.DisplayForm.PolicyType == 'Renewal-Change Company' || this.DisplayForm.PolicyType == 'Renewal-Same Company') {
      this.stepper.next();
    }

    this.cdr.detectChanges();

  }

  //#endregion lifecyclehooks

  //#region Getters

  //Documents FormArray
  get Documents() {
    return this.LPPSForm.get('Documents') as FormArray;
  }

  // Document Type List
  get PolicyDocumentList() {
    return HealthPolicyDocumentsList.sort((a, b) => a.SortOrder - b.SortOrder);
  }

  // Payment Details FormArray
  get PaymentDetails() {
    return this.LPPSForm.get('LoadingPaymentDetails') as FormArray;
  }

  //Get Gross Premium for only Buy=true
  get getGrossPremium() {
    return this.DisplayForm.QNDocuments.find((f) => f.Buy == true)?.GrossPremium
  }

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

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

    this._RfqMotorService.SubmitLoadingPaymentProof(this.LPPSForm.value).subscribe(res => {
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


  // Reject Button 
  public RejectButton() {
    if (this.LPPSForm.get('SendBackRejectDesc').value == "" || this.LPPSForm.get('SendBackRejectDesc').value == null) {
      this._alertservice.raiseErrorAlert('Reject Reason is required.');
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
          SendBackRejectObj.Id = this.LPPSForm.value.Id;
          SendBackRejectObj.Stage = this.LPPSForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.LPPSForm.value.SendBackRejectDesc;

          this._RfqService.Reject(SendBackRejectObj).subscribe((res) => {
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
    if (this.LPPSForm.get('SendBackRejectDesc').value == "" || this.LPPSForm.get('SendBackRejectDesc').value == null) {
      this._alertservice.raiseErrorAlert('Send Back Reason is required.');
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
          SendBackRejectObj.Id = this.LPPSForm.value.Id;
          SendBackRejectObj.Stage = this.LPPSForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.LPPSForm.value.SendBackRejectDesc;

          this._RfqService.SendBack(SendBackRejectObj).subscribe((res) => {
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

  // back button
  public backButton() {
    this._Location.back();
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
    const row: IDocumentsDto = new DocumentsDto();
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
    })
      .subscribe((res) => {
        if (res) {
          this.Documents.removeAt(index);
        }
      });
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



  // upload cheque details in attached payment proof
  public uploadChequeDocument(event: any, MainRow: number, CurrentRow: number, DocumentType: string) {

    let file = event.target.files[0]

    if (file) {

      let FileName = file.name.split('.')
      if (FileName && FileName.length >= 2) {

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
              this._alertservice.raiseErrors(res.Alerts);
            }
          });

      } else {
        this._alertservice.raiseErrorAlert("Please select a valid  File")
        return;
      }

      return


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
    const row: IDocumentsDto = new DocumentsDto();
    row.RFQId = this.LPPSForm.get("Id").value;
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
      var row: IPaymentDetailsDto = new PaymentDetailsDto()
      row.RFQId = this.LPPSForm.get("Id").value;
      this.PaymentDetails.push(this._initPaymentDetailsForm(row))
      this.addChequeDocuments(this.PaymentDetails.controls.length - 1);
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

        // if (!el.get('ChequeNo').value) {
        //   this.AttachPaymentProofAlerts.push({
        //     Message: `Cheque No. ${i + 1} is required.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (!el.get('IFSC').value) {
        //   this.AttachPaymentProofAlerts.push({
        //     Message: `IFSC ${i + 1} is required.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (!el.get('ChequeDate').value) {
        //   this.AttachPaymentProofAlerts.push({
        //     Message: `Cheque Date ${i + 1} is required.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (!el.get('ChequeDepositeDate').value){
        //   this.AttachPaymentProofAlerts.push({
        //     Message: `Cheque Deposit Date ${i + 1} is required.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // } else {
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

    if (!this.LPPSForm.get('LoadingPremiumAmountPaidBy').value) {
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

  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }

  // view Quotation (Veiw Uploaded Policy document)
  public ViewQuotation() {
    window.open(environment.apiDomain + "/Attachments/" + this.DisplayForm.QNDocuments.filter((f) => f.Buy == true)[0].StorageFilePath);
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  private _initForm(data: ILoadingPaymentProofDto) {

    let fg = this.fb.group({
      Id: [0],
      LoadingPremiumAmountPaidBy: ['Customer'],
      Documents: this._buildDocumentsForm(data.Documents),
      LoadingPaymentDetails: this._buildPaymentDetailsForm(data.LoadingPaymentDetails),

      Stage: [''],
      SendBackRejectDesc: ['']
    })

    if (data != null) {
      fg.patchValue(data)
    }

    return fg;
  }

  // Documents FormArray
  private _buildDocumentsForm(items: IDocumentsDto[] = []): FormArray {
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
  private _initDocumentForm(data: IDocumentsDto): FormGroup {

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
  private _buildPaymentDetailsForm(items: IPaymentDetailsDto[] = []): FormArray {
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
  private _initPaymentDetailsForm(data: IPaymentDetailsDto): FormGroup {

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

