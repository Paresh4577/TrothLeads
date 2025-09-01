import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { ChequeDocumentDto, IChequeDocumentDto, IPaymentProofChequeDetailsDto, IPaymentProofDocumentDto, PaymentProofChequeDetailsDto, PaymentProofDocumentDto, PolicyPersonsDto, QnQuotationDocument, iQnQuotationDocument, iRfqHealthQuotation } from '@models/dtos/config/RFQHealth';
import { CategoryCodeEnum, SubCategoryCodeEnum } from 'src/app/shared/enums';
import { HealthProductType } from 'src/app/shared/enums/HealthProductType.enum';
import { PaymentProofService } from './payment-proof.service';
import { ROUTING_PATH } from '@config/routingPath.config';
import { HealthPolicyTenure } from 'src/app/shared/enums/rfq-health/HealthPolicyTenure.enum';
import { Alert, IFilterRule, OrderBySpecs } from '@models/common';
import { MasterListService } from '@lib/services/master-list.service';
import { DisplayedPolicyType } from '@config/transaction-entry/transactionPolicyType.config';
import { PolicyTenureList } from '@config/rfq';
import { DialogService } from '@lib/services/dialog.service';
import { QNDocumentDto } from '@models/dtos/config/RFQHealth/quotation-note';
import { environment } from 'src/environments/environment';
import { AuthService } from '@services/auth/auth.service';
import { DatePipe, Location } from '@angular/common';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { HealthCategoryType, HealthPolicyType } from 'src/app/shared/enums/rfq-health';
import { CategoryTypeList, HealthPolicyDocumentsList } from '@config/rfq';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { dropdown } from '@config/dropdown.config';
import { RFQHealthService } from '../rfq-health/rfqhealth.service';
import { RFQExistingIllnessDetailsComponent } from '../rfqexisting-illness-details/rfqexisting-illness-details.component';
import { MatStepper } from '@angular/material/stepper';
import { forEach } from 'lodash';
import { IBankDto } from '@models/dtos/core/BankDto';
import { QuotationBySalesPersonService } from '../quotation-by-sales-person/quotation-by-sales-person.service';
import { RFQDocumentsDrpList } from '@config/rfq';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }
@Component({
  selector: 'gnx-payment-proof',
  templateUrl: './payment-proof.component.html',
  styleUrls: ['./payment-proof.component.scss'],
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
export class PaymentProofComponent {

  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;
  @ViewChild('stepper') stepper: MatStepper;

  pagetitle: string; // Main header Page title
  mode: string; // for identify of Raise page is create or edit or view
  maxDate // Set MAx date 
  UploadFileAPI: string = API_ENDPOINTS.Attachment.Upload; // upload Doc. API
  DisplayForm: any

  RfqHealthQuotationData: iRfqHealthQuotation; //RFQ Health Data store 
  PaymentProofForm: FormGroup; // Payment Proof Document Form
  RFQQuotationForm: FormGroup; // Quotation Form

  DropdownMaster: dropdown; // Dropdown Master Data
  SelfGender: string; // store gender 
  ProposerName: string;
  myMembers; // store selected member icon path
  allMemberCard; // to store display Member icon in card
  PolicyPersonsArray // store insured person details
  maxBirthDate: Date; // Max birthdate validation
  GrossPremium: number = 0; // for display purpose use this variable

  //List objects
  SubCategoryList = [];
  BankList: IBankDto[];// Store Bank list
  isExpand: boolean = false;
  // Step Control
  AttachPaymentProofStepCtrl = new FormControl(); // Step Validation Control

  AttachPaymentProofAlerts: Alert[] = []; // Step wise Error alert Array

  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  ChequeAlerts: Alert[] = []; // Step Invalid field error message
  detailsFieldsList: any[] // A list of Insured person Questionary

  // Boolean
  IsPOSPUser: boolean = false;

  // #endregion public variables

  /**
   * #region constructor
   * @param _fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   */

  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _paymentProofService: PaymentProofService,
    private _MasterListService: MasterListService,
    private _dialogService: DialogService,
    private authService: AuthService,
    private _datePipe: DatePipe,
    public _dialog: MatDialog,
    private _RFQService: RFQHealthService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
    private _quotationBySalesPersonService: QuotationBySalesPersonService,
  ) {
    this.DropdownMaster = new dropdown();
    this.maxDate = new Date(Date.now());
    // Set max birthdate is before three month of current date
    this.maxBirthDate = new Date(Date.now());
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);
    this.SelfGender = 'Male';
    this._fillMasterList();
    this.allMemberCard = this._RFQService.memberCardArray()

    // Get Inssuerd Person Questionary list
    this.detailsFieldsList = this._quotationBySalesPersonService.getdetailsFieldsList()
  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    //Get Route Data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title']
    this.mode = data['mode']
    this.DisplayForm = data['data'];
    this.RfqHealthQuotationData = data['data']

    this.RFQQuotationForm = this._buildQuotationDetailsForm(this.RfqHealthQuotationData)
    this.RFQQuotationForm.get('PaymentInsurer').disable()

    let FormData = data['data'];
    this.PaymentProofForm = this._buildPaymentProofDetailsForm(FormData)


    var QNData = data['data'];
    if (QNData.QNDocuments.length > 0) {
      QNData.QNDocuments.forEach((el) => {
        if (el.Buy == true) {
          this.GrossPremium = el.GrossPremium;
        }
      });
    }

    this.myMembers = [];

    // Policy Person Form Array
    this.PolicyPersonsArray = this.RFQQuotationForm.get('Members') as FormArray;
    this.memberDispalyDetails(this.RFQQuotationForm.get('Members').value)
    this._genderOfSelfSpouseInArray()

    if (this.mode != 'view' && this.PaymentProofForm.get("PaymentDetails").value.length <= 0) {
      // Add By defualt two documet 
      for (let i = 1; i < 2; i++) {
        this.addPaymentDetails();
      }
    }


    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == "Agent") {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }

    if (this.mode == "view") {
      this.RFQQuotationForm.disable();
      this.PaymentProofForm.disable();
    }

    /**
     * If Login user is Agent then Paid By field is not Display Then If 
     * PremiumAmountPaidBy value is blank then set default value is Customer
     */
    if (this.IsPOSPUser) {
      if (!this.PaymentProofForm.get('PremiumAmountPaidBy').value) {
        this.PaymentProofForm.get('PremiumAmountPaidBy').patchValue('Customer')
      }
    }

    this.ProposerName = this.PolicyPersonsArray?.value[0]?.Name;
  }

  ngAfterViewInit(): void {
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();

    if (this.DisplayForm.PolicyType == HealthPolicyType.Rollover || this.DisplayForm.PolicyType == 'Renewal-Change Company' || this.DisplayForm.PolicyType == 'Renewal-Same Company') {
      this.stepper.next();
    }

    this._cdr.detectChanges();
  }


  //#endregion lifecyclehooks

  //#region public-getters

  get f() {
    return this.PaymentProofForm.controls;
  }

  //get Health Product Type From Config file
  public get HealthProductType() {
    return HealthProductType
  }

  //get Health Policy Type From Config file
  public get HealthPolicyType() {
    return HealthPolicyType
  }

  //get Health Category Type From Config file
  public get HealthCategoryType() {
    return HealthCategoryType
  }

  // Get sum Insured Amount From Config file
  public get HealthPolicyTenure() {
    return HealthPolicyTenure
  }

  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Health))
  }

  // Get Health SubCategory From Config file
  get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum
  }

  // Get Policy Type
  get PolicyTypeList() {
    if (this.DisplayForm?.TransactionId) {
      return DisplayedPolicyType.rfqHealthRenewalPolicyType
    }
    else {
      return DisplayedPolicyType.rfqHealthPolicyType
    }
  }

  // Get Category Type List
  get CategoryTypeList() {
    return CategoryTypeList
  }

  // Get Policy Tenure List
  get PolicyTenureList() {
    return PolicyTenureList
  }

  // Return Selected Quotation
  public get SelectedPlan(): iQnQuotationDocument {
    let SelectedFiterPlan: iQnQuotationDocument[] = this.RfqHealthQuotationData.QNDocuments.filter(ele => ele.Buy == true)

    if (SelectedFiterPlan.length) {
      return SelectedFiterPlan[0]
    } else {
      return new QnQuotationDocument()
    }

  }

  get Documents() {
    return this.PaymentProofForm.get('Documents') as FormArray
  }

  get PolicyDocumentAttachment() {
    return this.Documents.controls;
  }

  get QNDocuments() {
    return this.RFQQuotationForm.get('QNDocuments') as FormArray
  }

  get Payments() {
    return this.PaymentProofForm.get('PaymentDetails') as FormArray
  }

  //#endregion public-getters


  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // Add new row in cheque details array
  public addPaymentDetails() {
    this.ChequeAlerts = [];
    this.Payments.controls.forEach((el, i) => {

      if (el.get('PremiumAmountPaid').value === "" || el.get('PremiumAmountPaid').value === 0) {
        this.ChequeAlerts.push({
          Message: `Premium Amount Paid ${i + 1} is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.RfqHealthQuotationData.PaymentMode != 'Online') {
        if (!el.get('BankId').value) {
          this.ChequeAlerts.push({
            Message: `Issuing Bank Name ${i + 1} is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        // if (el.get('ChequeNo').value === "") {
        //   this.ChequeAlerts.push({
        //     Message: `Cheque No. ${i + 1} is required.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (el.get('IFSC').value === "") {
        //   this.ChequeAlerts.push({
        //     Message: `IFSC ${i + 1} is required.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (el.get('ChequeDate').value === "") {
        //   this.ChequeAlerts.push({
        //     Message: `Cheque Date ${i + 1} is required.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }
        // else {
        //   if (el.get('ChequeDate').value) {
        //     this.ChequeAlerts.push({
        //       Message: `Enter valid Cheque Date ${i + 1}.`,
        //       CanDismiss: false,
        //       AutoClose: false,
        //     })
        //   }
        // }

        // if (el.get('ChequeDepositeDate').value === "") {
        //   this.ChequeAlerts.push({
        //     Message: `Cheque Deposit Date ${i + 1} is required.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }
        // else
        if (el.get('ChequeDepositeDate').value && el.get('ChequeDate').value) {
          if (el.get('ChequeDepositeDate').value < el.get('ChequeDate').value) {
            this.ChequeAlerts.push({
              Message: `Enter valid Cheque Deposit Date ${i + 1}.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }
      }

      (el.get('Documents') as FormArray).controls.forEach((element, j) => {

        if (element.get('StorageFileName').value === "" || element.get('StorageFileName').value === null) {
          this.ChequeAlerts.push({
            Message: `Attach Payment Proof ${j + 1} at row no ${i + 1} is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

      })
    });

    if (this.ChequeAlerts.length > 0) {
      this._alertservice.raiseErrors(this.ChequeAlerts);
      return;
    }
    else {
      var row: PaymentProofChequeDetailsDto = new PaymentProofChequeDetailsDto()
      row.RFQId = this.RFQQuotationForm.get("Id").value;
      this.Payments.push(this._initPaymentDetailsForm(row))
      this.addChequeDocuments(this.Payments.controls.length - 1);
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
          this.Payments.removeAt(rowNo);
        }

      });

  }


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

  // add new row in Document array
  public addDocuments(selectedDocument?: string) {

    const row: IPaymentProofDocumentDto = new PaymentProofDocumentDto();

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

  // file data (policy document that is added)
  public SelectRFQDocument(event, DocIndex: number) {

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

  // click on "Back to List Page" button then redirect last page
  public BackToListPage() {
    this._Location.back();
  }

  // validate the form and submit it
  public SubmitPaymentProof() {
    this._DateFormat();

    if (this.AttachPaymentProofAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachPaymentProofAlerts)
      return;
    }

    this._validateAttachDocField()

    if (this.AttachDocumentAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachDocumentAlerts)
      return;
    }

    this._paymentProofService.SubmitPaymentProof(this.PaymentProofForm.value).subscribe(res => {
      if (res.Success) {
        this._alertservice.raiseSuccessAlert(res.Message, "false")
        // this._router.navigate([ROUTING_PATH.RFQ.ProposalSubPending + this.RfqHealthQuotationData.Id]);
        this._router.navigate([ROUTING_PATH.Basic.Dashboard])
      }
      else {
        if (res.Alerts && res.Alerts?.length > 0) {
          this._alertservice.raiseErrors(res.Alerts)
        } else {
          this._alertservice.raiseErrorAlert(res.Message)
        }
      }
    })
  }

  // Payment Proof Form All date Formate Change
  private _DateFormat() {

    this.Payments.controls.forEach((element, index) => {
      element.patchValue({
        ChequeDate: this._datePipe.transform(element.get('ChequeDate').value, 'yyyy-MM-dd'),
        ChequeDepositeDate: this._datePipe.transform(element.get('ChequeDepositeDate').value, 'yyyy-MM-dd'),
      })
    })

  }

  // Reject Payment Proof Form
  public RejectForm() {


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

          this._paymentProofService.Reject(this.PaymentProofForm.value).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, "false")
              // this._router.navigate([ROUTING_PATH.RFQ.HealthList])
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

  // Send back Payment Proof Form
  public SendBackForm() {

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

          let Id = this.RfqHealthQuotationData.Id;

          this._paymentProofService.SendBack(this.PaymentProofForm.value).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, "false")
              // this._router.navigate([ROUTING_PATH.RFQ.PaymetLinkPending + Id])
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

  // view Quotation (Veiw Uploaded Policy document)
  public ViewQuotation() {
    window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + this.QNDocuments.value[0].StorageFilePath)
  }

  // add cheque details in attached payment proof
  public addChequeDocuments(MainRow: number) {
    const row: IChequeDocumentDto = new ChequeDocumentDto();
    row.RFQId = this.RFQQuotationForm.get("Id").value;
    this.Payments.controls.forEach((element, index) => {
      if (index == MainRow) {
        (element.get('Documents') as FormArray).push(this._initChequeDocumentForm(row))
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

              this.Payments.controls.forEach((element, index) => {
                if (index == MainRow) {
                  (element.get('Documents') as FormArray).controls.forEach((el, i) => {
                    if (i == CurrentRow) {
                      el.patchValue({
                        FileName: res.Data.FileName,
                        StorageFileName: res.Data.StorageFileName,
                        StorageFilePath: res.Data.StorageFilePath,
                        RFQId: this.RfqHealthQuotationData.Id,
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
          this.Payments.controls.forEach((element, index) => {
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

  /**
* Check step Three Invalid Formfield
*/
  public AttachPaymentProofValidation() {
    this.AttachPaymentProofAlerts = [];

    if (this.mode != 'view') {

      this.Payments.controls.forEach((el, i) => {

        if (el.get('PremiumAmountPaid').value === "" || el.get('PremiumAmountPaid').value === 0) {
          this.AttachPaymentProofAlerts.push({
            Message: `Premium Amount Paid ${i + 1} is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.RfqHealthQuotationData.PaymentMode != 'Online') {

          if (!el.get('BankId').value) {
            this.AttachPaymentProofAlerts.push({
              Message: `Issuing Bank Name ${i + 1} is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          // if (el.get('ChequeNo').value === "") {
          //   this.AttachPaymentProofAlerts.push({
          //     Message: `Cheque No. ${i + 1} is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('IFSC').value === "") {
          //   this.AttachPaymentProofAlerts.push({
          //     Message: `IFSC ${i + 1} is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('ChequeDate').value === "") {
          //   this.AttachPaymentProofAlerts.push({
          //     Message: `Cheque Date ${i + 1} is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }
          // else {
          //   if (el.get('ChequeDate').value > this.maxDate) {
          //     this.AttachPaymentProofAlerts.push({
          //       Message: `Enter valid Cheque Date ${i + 1}.`,
          //       CanDismiss: false,
          //       AutoClose: false,
          //     })
          //   }
          // }

          // if (el.get('ChequeDepositeDate').value === "") {
          //   this.AttachPaymentProofAlerts.push({
          //     Message: `Cheque Deposit Date ${i + 1} is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }
          // else {

          if (el.get('ChequeDepositeDate').value && el.get('ChequeDate').value) {
            if (el.get('ChequeDepositeDate').value < el.get('ChequeDate').value) {
              this.AttachPaymentProofAlerts.push({
                Message: `Enter valid Cheque Deposit Date ${i + 1}.`,
                CanDismiss: false,
                AutoClose: false,
              })
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

      if (this.PaymentProofForm.get('PremiumAmountPaidBy').value === "" || this.PaymentProofForm.get('PremiumAmountPaidBy').value == null) {
        this.AttachPaymentProofAlerts.push({
          Message: `Paid By is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    /**
    * Step control Validate
    */
    if (this.AttachPaymentProofAlerts.length > 0) {
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
  public StepThreeValidationError() {
    if (this.AttachPaymentProofAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachPaymentProofAlerts);
    }
  }


  // adding members in myMember array
  public members() {

    this.myMembers = [];
    if (
      this.RFQQuotationForm.get('SelfCoverRequired').value == true &&
      this.RFQQuotationForm.get('SelfGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Self' });
    }
    if (
      this.RFQQuotationForm.get('SelfCoverRequired').value == true &&
      this.RFQQuotationForm.get('SelfGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Self' });
    }
    if (
      this.RFQQuotationForm.get('SpouseCoverRequired').value == true &&
      this.RFQQuotationForm.get('SpouseGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Spouse' });
    }
    if (
      this.RFQQuotationForm.get('SpouseCoverRequired').value == true &&
      this.RFQQuotationForm.get('SpouseGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Spouse' });
    }
    if (
      this.RFQQuotationForm.get('DaughterCoverRequired').value == true &&
      this.RFQQuotationForm.get('noOfDaughter').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter' });
    }
    if (
      this.RFQQuotationForm.get('DaughterCoverRequired').value == true &&
      this.RFQQuotationForm.get('noOfDaughter').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter1' });
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter2' });
    }
    if (
      this.RFQQuotationForm.get('DaughterCoverRequired').value == true &&
      this.RFQQuotationForm.get('noOfDaughter').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter3' });
    }

    if (
      this.RFQQuotationForm.get('SonCoverRequired').value == true &&
      this.RFQQuotationForm.get('noOfSon').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son' });
    }
    if (
      this.RFQQuotationForm.get('SonCoverRequired').value == true &&
      this.RFQQuotationForm.get('noOfSon').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son1' });
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son2' });
    }
    if (
      this.RFQQuotationForm.get('SonCoverRequired').value == true &&
      this.RFQQuotationForm.get('noOfSon').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son3' });
    }
    if (this.RFQQuotationForm.get('MotherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/mother.png', title: 'Mother' });
    }
    if (this.RFQQuotationForm.get('FatherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/father.png', title: 'Father' });
    }

  }

  // insured members data from RFQ health form
  public SetCover(member: string, answer) {
    let Answer = answer
    this.RFQQuotationForm.patchValue({
      [member + 'CoverRequired']: Answer,
    });
    this._countDaughterSon(member)
    this.members()
  }

  // popUp for Illness (cannot be modified. Selected Illness form RFQ health will be viewed.)
  public openDiolog(indexNumber: number, detailkey: string, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      title: title,
      ispopup: true,
      disable: true,
      ExistingIllness: this.PolicyPersonsArray.at(indexNumber).get(detailkey).value,
    };
    const dialogRef = this._dialog.open(
      RFQExistingIllnessDetailsComponent,
      dialogConfig
    );

  }

  // validate decimal point, minus and decimal number 
  public DecimalWithMinus(event, index) {

    if (typeof event.target.selectionStart == "number") {
      if (event.target.selectionStart == 0 && event.target.selectionEnd == event.target.value.length) {
        event.target.value = "";
      }
    }

    if (event.target.value == "" || event.target.value == 0) {
      this.Payments.controls.forEach((el, i) => {
        if (i == index) {
          el.get('PremiumAmountPaid').patchValue(event.target.value);
        }
      });
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

  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }
  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  // update gender of self and spouse in allMemberCard array
  private _genderOfSelfSpouseInArray() {
    let female = '/assets/icons/woman.png'
    let male = '/assets/icons/male.png'
    if (this.RFQQuotationForm.get('SelfGender').value == 'Male') {
      this.allMemberCard[0].member = male
      this.allMemberCard[0].gender = 'Male'
      this.allMemberCard[1].gender = 'Female'
      this.allMemberCard[1].member = female
    }
    else {
      this.allMemberCard[1].member = male
      this.allMemberCard[0].member = female
      this.allMemberCard[1].gender = 'Male'
      this.allMemberCard[0].gender = 'Female'
    }
  }

  // member deatils from RFQ Health form
  private memberDispalyDetails(member) {

    member.forEach((element, index) => {
      this.SetCover(element.Relation, true)
      if (element.Relation == 'Self') {
        this.SelfGender = element.Gender
        this._genderofSelfAndSpouse(element.Gender)
      }
    })
  }

  // counting number of Son and Daughter
  private _countDaughterSon(child) {
    if (child == 'Daughter') {
      this.RFQQuotationForm.patchValue({
        noOfDaughter: this.RFQQuotationForm.get('noOfDaughter').value + 1
      })
    }

    if (child == 'Son') {
      this.RFQQuotationForm.patchValue({
        noOfSon: this.RFQQuotationForm.get('noOfSon').value + 1
      })
    }
  }

  // update gender of Self and spouse in HealthQuateForm
  private _genderofSelfAndSpouse(choice) {
    this.SelfGender = choice;
    this.RFQQuotationForm.patchValue({
      SelfGender: this.SelfGender,
    });

    if (this.RFQQuotationForm.get('SelfGender').value == 'Male') {
      this.RFQQuotationForm.patchValue({
        SpouseGender: 'Female',
      });
    } else {
      this.RFQQuotationForm.patchValue({
        SpouseGender: 'Male',
      });
    }
    this._genderOfSelfSpouseInArray()
    this.members()
  }

  // Quotation Details Form  
  private _buildQuotationDetailsForm(data?): FormGroup {

    let IDF = this.fb.group({
      Id: [0],
      SubCategoryId: [0],
      PolicyType: [''],
      CategoryType: [''],
      PolicyPeriod: [''],
      InsuranceCompany: [''],
      PlanName: [''],
      SumInsuredOrIDV: [0],
      GrossPremium: [0],
      QNDocuments: this._buildQNDocuments(data?.QNDocuments),
      Documents: this._buildQuotationDocumentsForm(data?.Documents),
      Stage: [''],
      SendBackRejectDesc: [''],

      SubCategoryCode: [''],
      SubCategoryName: [''],
      // Product  Category details
      SumInsured: [0],
      OtherSumInsured: [0],
      Deductible: [0],
      PincodeId: [],
      Pincode: [''],
      ProposerMobileNo: [''],
      ProposerEmail: [''],

      // Product  Category details >>> [0.1] >>> Details of Proposed Insured & Family (if applicable)
      Members: this._buildPolicyPersonForm(data.Members),
      SelfCoverRequired: [false],
      SpouseCoverRequired: [false],
      DaughterCoverRequired: [false],
      MotherCoverRequired: [false],
      FatherCoverRequired: [false],
      noOfDaughter: [],
      noOfSon: [],
      SelfGender: ['Male'],
      SpouseGender: ['Female'],
      SonCoverRequired: [false],

      // Share Payment Link
      PaymentLink: [''],
      PaymentInsurer: [false],
      PaymentMode: [],
    })

    if (data) {
      IDF.patchValue(data)
    }
    return IDF
  }

  //Build Policy person  formarray
  private _buildPolicyPersonForm(items = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPolicyPersonForm(i));
        });
      }
    }

    return formArray;
  }

  //Init Policy person  form
  private _initPolicyPersonForm(item, Relation = '', Gender = ''): FormGroup {
    let pPF = this.fb.group({
      Id: [0],
      RFQId: [0],
      Relation: [Relation],
      Name: ['',],
      DOB: ['',],
      Gender: [Gender],
      Remark: ['',],
      SmokerTibco: [null],
      SmokerTibcoDescription: [''],
      ExistingIllness: [null],
      ExistingIllnessDetail: this._buildExistingIllnessDetailForm(),
      SumInsured: [0],
      OtherSumInsured: [0],
      Deductible: [0],
    })
    if (item != null) {
      if (!item) {
        item = new PolicyPersonsDto();
      }

      if (item) {
        pPF.patchValue(item);
      }
    }
    return pPF;
  }

  //policy person Init Existing Illness Detail Form 
  private _buildExistingIllnessDetailForm(data?): FormGroup {
    let existingIllnessForm = this.fb.group({
      Id: [0],
      RFQMemberId: [0],
      Thyroid: [false],
      ThyroidSince: [''],
      ThyroidDescription: [''],
      Asthma: [false],
      AsthmaSince: [''],
      AsthmaDescription: [''],
      CholesterolDisorDr: [false],
      CholesterolDisorDrSince: [''],
      CholesterolDisorDrDescription: [''],
      Heartdisease: [false],
      HeartdiseaseSince: [''],
      HeartdiseaseDescription: [''],
      Hypertension: [false],
      HypertensionSince: [''],
      HypertensionDescription: [''],
      Diabetes: [false],
      DiabetesSince: [''],
      DiabetesDescription: [''],
      Obesity: [false],
      ObesitySince: [''],
      ObesityDescription: [''],
      OtherExistDisease: [false],
      OtherExistDiseaseDescription: [''],
    });

    return existingIllnessForm;
  }

  // Documents FormArray
  private _buildQuotationDocumentsForm(items: IPaymentProofDocumentDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initQuotationDocumentForm(i));
        });
      }
    }
    return formArray;
  }

  private _initQuotationDocumentForm(data: IPaymentProofDocumentDto): FormGroup {
    let DocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [""],
      DocumentNo: [""],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: ["", [Validators.required]],
      Stage: [""],
      Description: [""],
    });

    if (data) {
      if (data.DocumentType != "Other") {
        DocumentForm.patchValue(data)
      }
    }
    return DocumentForm;
  }

  // Build Quotation Note Document Formarray
  private _buildQNDocuments(items: QNDocumentDto[] = []): FormArray {
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
  private _initQNDocuments(item: QNDocumentDto): FormGroup {
    let dFQN = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      InsuranceCompany: [''],
      InsuranceCompanyShortName: [''],
      ProductName: [''],
      ProductCode: [''],
      SumInsured: [0],
      Deductible: [0],
      GrossPremium: [0],
      Buy: [false],
      FileName: [''],
      StorageFileName: [''],
      StorageFilePath: ['']
    })

    if (item != null) {
      if (!item) {
        item = new QNDocumentDto();
      }

      if (item) {
        if (item.Buy == true) {
          dFQN.patchValue(item);
        }
      }
    }
    return dFQN
  }

  // Payment Proof Details Form  
  private _buildPaymentProofDetailsForm(data?): FormGroup {

    let IDF = this.fb.group({
      Id: [0],
      PremiumAmountPaidBy: ['Customer'],
      PaymentDetails: this._buildPaymentDetailsForm(data?.PaymentDetails),
      Documents: this._buildDocumentsForm(data?.Documents),
      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: [''],

    })

    if (data) {
      IDF.patchValue(data)
    }
    return IDF
  }

  // Payment Proof Documents FormArray
  private _buildDocumentsForm(items: IPaymentProofDocumentDto[] = []): FormArray {
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

  private _initDocumentForm(data: IPaymentProofDocumentDto): FormGroup {
    let DocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [""],
      DocumentTypeName: [""],
      DocumentNo: [""],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: ["", [Validators.required]],
      Stage: [""],
      Description: [""],
    });

    if (data) {

      if (data.DocumentType != "Other") {
        DocumentForm.patchValue(data)
      }
    }

    return DocumentForm;
  }

  // Cheque Details FormArray
  private _buildPaymentDetailsForm(items: IPaymentProofChequeDetailsDto[] = []): FormArray {
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
  private _initPaymentDetailsForm(data: IPaymentProofChequeDetailsDto): FormGroup {
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
      Documents: this._buildChequeDocumentsForm(data?.Documents),
      Stage: [''],
    });

    if (data) {
      if (data.Stage == "RFQPaymentProofSP") {
        ChequeForm.patchValue(data)
      }
    }

    return ChequeForm;
  }

  // Payment Proof Cheque Documents FormArray
  private _buildChequeDocumentsForm(items: IChequeDocumentDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initChequeDocumentForm(i));
        });
      }
    }

    return formArray;
  }

  private _initChequeDocumentForm(data: IChequeDocumentDto): FormGroup {
    let ChequeDocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [""],
      DocumentNo: [""],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: ["", [Validators.required]],
      Stage: [""],
      Description: [""],
      RFQPaymentDetailId: [0]
    });

    if (data) {
      ChequeDocumentForm.patchValue(data)
    }

    return ChequeDocumentForm;
  }

  // fill master data
  private _fillMasterList() {

    // fill Product Type
    let SubCategoryRule: IFilterRule[] = [ActiveMasterDataRule,
      {
        Field: "Category.Code",
        Operator: "eq",
        Value: CategoryCodeEnum.Health
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

    let ActiveDataRule: IFilterRule[] = [ActiveMasterDataRule]
    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Bank.List, 'Name', "", ActiveDataRule)
      .subscribe(res => {
        if (res.Success) {
          this.BankList = res.Data.Items
        }

      })

  }

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

  //#endregion private-getters
}
