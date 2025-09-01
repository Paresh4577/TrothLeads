import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { DisplayedTravellNomineeRelation, TravelCategoryType } from '@config/rfq';
import { ROUTING_PATH } from '@config/routingPath.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert } from '@models/common';
import { CategoryCodeEnum } from 'src/app/shared/enums';
import { RfqTravelService } from '../rfq-travel-service';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { TravelDocumentsDto, ITravelDocumentsDto, ITravelMemberDTO, ITravelNomineeDetailsDto, ITravelQNDocumentsDto, TravelMemberDTO, TravelNomineeDetailsDto } from '@models/dtos';
import { dropdown } from '@config/dropdown.config';
import { environment } from 'src/environments/environment';
import { ValidationRegex } from '@config/validationRegex.config';
import { RFQDocumentsDrpList } from '@config/rfq';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { RfqService } from '../../rfq.service';

@Component({
  selector: 'gnx-travel-qn-selection-sp',
  templateUrl: './travel-qn-selection-sp.component.html',
  styleUrls: ['./travel-qn-selection-sp.component.scss'],
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
export class TravelQnSelectionSPComponent {

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  // Variables
  pagetitle: string = '';
  mode: string = '';
  isExpand: boolean = false;
  setmaxBirthDate: Date = new Date(); //Max DOB
  ProposerName: string;

  PANNumValidationReg: RegExp = ValidationRegex.PANNumValidationReg; // PAN number Validation regex
  UIDNumValidationReg: RegExp = ValidationRegex.UIDNumValidationReg; //Aadhar/UID number Validation regex

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  DisplayForm: any;

  // FormGroup 
  TravelQNUWForm: FormGroup;

  DropdownMaster: dropdown;



  // Alert Array List
  QuotationSelectionAerts: Alert[] = []; // Step Invalid field error message
  ProductCategoryDetailsAlert: Alert[] = [];
  ProductCategoryNomineeDetailsAlert: Alert[] = [];
  KYCDetailsAlerts: Alert[] = [];
  PaymentModeDetailsAlerts: Alert[] = [];
  DocumentAttachmentAlert: Alert[] = [];

  ProductCategoryDetailsStepCtrl = new FormControl();
  QuotationSelectionStepctrl = new FormControl()
  KYCDetailsStepCtrl = new FormControl()
  PaymentModeDetailsStepCtrl = new FormControl()
  DocumentAttachmentStepCtrl = new FormControl()


  //#region Constructor
  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public dialog: MatDialog,
    public _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _datePipe: DatePipe,
    private _dialogService: DialogService,
    private _RFQTravelService: RfqTravelService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
    private _RfqService: RfqService,
  ) {

    this.DropdownMaster = new dropdown();
  }
  //#endregion constructor

  // #region Getters

  // get travel category type
  get TravelCategoryType() {
    return TravelCategoryType;
  }

  // get travel policy type
  get DisplayedLifeMoninneRelation() {
    return DisplayedTravellNomineeRelation;
  }

  // QNDocuments Form array
  get QNselection() {
    return this.TravelQNUWForm.get('QNDocuments') as FormArray;
  }

  // Documents Form array
  get Documents() {
    return this.TravelQNUWForm.get('Documents') as FormArray;
  }

  // Members Form array
  get Members() {
    return this.TravelQNUWForm.get('Members') as FormArray;
  }

  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Travel))
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

    // build travel form
    this.TravelQNUWForm = this._buildForm(this.DisplayForm);

    this._OnformChange()

    this.Members.controls.forEach((m, i) => {
      if (m.value.NomineeDetails?.length == 0) {
        this.AddNomeneeDetails(i)
      }
    })
    this.ProposerName = this.DisplayForm?.Members[0]?.Name;
  }

  // After View Init
  ngAfterViewInit(): void {
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
    if (this.TravelQNUWForm.get('SendBackRejectDesc').value == "" || this.TravelQNUWForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.TravelQNUWForm.value.Id;
          SendBackRejectObj.Stage = this.TravelQNUWForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.TravelQNUWForm.value.SendBackRejectDesc;
          this._RFQTravelService.Reject(SendBackRejectObj).subscribe((res) => {
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
    if (this.TravelQNUWForm.get('SendBackRejectDesc').value == "" || this.TravelQNUWForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.TravelQNUWForm.value.Id;
          SendBackRejectObj.Stage = this.TravelQNUWForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.TravelQNUWForm.value.SendBackRejectDesc;

          this._RFQTravelService.SendBack(SendBackRejectObj).subscribe((res) => {
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


    if (this.QuotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAerts);
      return;
    }

    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
      return;
    }

    if (this.ProductCategoryNomineeDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryNomineeDetailsAlert);
      return;
    }


    if (this.KYCDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.KYCDetailsAlerts);
      return;
    }

    if (this.PaymentModeDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PaymentModeDetailsAlerts);
      return;
    }

    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }

    let SubmitFormValue = JSON.parse(JSON.stringify(this.TravelQNUWForm.value))

    // if pan not attach then Field value is set null
    if (!SubmitFormValue.PANDetails?.StorageFilePath) {
      SubmitFormValue.PANDetails = null
    }
    // if Aadhar not attach then Field value is set null
    if (!SubmitFormValue.AadharDetails?.StorageFilePath) {
      SubmitFormValue.AadharDetails = null
    }
    // if PassportDetails not attach then Field value is set null
    if (!SubmitFormValue.PassportDetails?.StorageFilePath) {
      SubmitFormValue.PassportDetails = null
    }
    // if TicketDetails not attach then Field value is set null
    if (!SubmitFormValue.TicketDetails?.StorageFilePath) {
      SubmitFormValue.TicketDetails = null
    }

    this._RFQTravelService.SubmitQNSelectionSP(SubmitFormValue).subscribe((res) => {
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

  /**
 * Set true Selected quotation
 * @param index "Selected Quotation index"
 */
  public SelectBuy(index: number) {

    if (this.QNselection.controls[index].get('Buy').value) {
      this._alertservice.raiseErrorAlert('Quotation is already Selected.');
      return;
    }

    this.QNselection.controls.forEach((qn, i) => {
      if (i == index) {
        qn.get('Buy').setValue(true)
        if (this.TravelQNUWForm.get('PaymentMode').value == 'Cheque') {
          this.TravelQNUWForm.get('PaymentAccountName').patchValue(qn.value.InsuranceCompanyName)
        }
      } else {
        qn.get('Buy').setValue(false)
      }
    })
  }

  /**
 * Download attch QN Documents
 * @returns 
*/
  public DonloadQNdocument() {
    if (this.QuotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAerts);
      return;
    }

    //Find Selected QN Doc
    let SelectedQuotation = this.QNselection.value.find(qn => qn.Buy == true)

    if (SelectedQuotation) {
      this._RFQTravelService.DownloadQnDocument(SelectedQuotation.Id).subscribe(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = SelectedQuotation.FileName;
        a.click();
        URL.revokeObjectURL(objectUrl);
      })
    }
  }

  /**
* Check step two Invalid Formfield
*/
  public QuotationSelectionValidationControl() {
    this.QuotationSelectionAerts = [];

    if (this.mode != "view") {
      if (!this.QNselection.value.some(ele => ele.Buy == true)) {
        this.QuotationSelectionAerts.push({
          Message: `Quotation Selection is Required`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    /**
    *  Step control Validate
    */
    if (this.QuotationSelectionAerts.length > 0) {
      this.QuotationSelectionStepctrl.setErrors({ required: true });
      return this.QuotationSelectionStepctrl;
    } else {
      this.QuotationSelectionStepctrl.reset();
      return this.QuotationSelectionStepctrl;
    }
  }

  /**
    * Display Error message 
    */
  public QuotationSelectionValidationError() {
    if (this.QuotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAerts);
    }
  }


  public ProductCategoryDetailsValidations() {
    this.ProductCategoryDetailsAlert = [];

    this.Members.controls.forEach((m, i) => {


      let NominneDetailsFormArray = m.get('NomineeDetails') as FormArray

      /**
       * Total of nominee percentage 
       */

      let nomineePerSum = 0;

      if (NominneDetailsFormArray.controls.length > 0) {
        NominneDetailsFormArray.controls.forEach(n => {
          if (n.get("NomineePer")?.value) {
            nomineePerSum += parseFloat(n.get("NomineePer")?.value)
          }
        })
      }

      if (nomineePerSum != 100) {
        this.ProductCategoryDetailsAlert.push({
          Message: `Traveller ${i + 1} (${m.value.Name}) - Sum of Nominee % Should be 100.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }


      /**
       * Nominee details validation
       */
      NominneDetailsFormArray.controls.forEach((nominee, n) => {

        if (!nominee.get('Name').value) {
          this.ProductCategoryDetailsAlert.push({
            Message: `Traveller ${i + 1} (${m.value.Name} ) - Nominee Name is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (!nominee.get('DOB').value) {
          this.ProductCategoryDetailsAlert.push({
            Message: `Traveller ${i + 1} (${m.value.Name}) - Nominee Date of birth is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        } else {
          if (this._datePipe.transform(nominee.get('DOB').value, 'yyyy-MM-dd') > this._datePipe.transform(this.setmaxBirthDate, 'yyyy-MM-dd')) {
            this.ProductCategoryDetailsAlert.push({
              Message: `Traveller ${i + 1} (${m.value.Name}) - Nominee Enter Valid Date of birth.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }

        if (!nominee.get('Relation').value) {
          this.ProductCategoryDetailsAlert.push({
            Message: `Traveller ${i + 1} (${m.value.Name}) - Nominee Relation with Life Assured is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (!nominee.get('NomineePer').value) {
          this.ProductCategoryDetailsAlert.push({
            Message: `Traveller ${i + 1} (${m.value.Name}) - Nominee % is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

      })

    });



    if (this.ProductCategoryDetailsAlert.length > 0) {
      this.ProductCategoryDetailsStepCtrl.setErrors({ required: true });
      return this.ProductCategoryDetailsStepCtrl;
    }
    else {
      this.ProductCategoryDetailsStepCtrl.reset();
      return this.ProductCategoryDetailsStepCtrl;
    }

  }


  public ProductCategoryDetailsrror() {
    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
      return;
    }
  }

  /**
* Check step four Invalid Formfield
*/
  public KYCDetailsValidationControl() {
    this.KYCDetailsAlerts = [];

    if (this.mode != "view") {

      if (!this.TravelQNUWForm.get('AadharNo').value) {
        // this.KYCDetailsAlerts.push({
        //   Message: 'Enter  Aadhar',
        //   CanDismiss: false,
        //   AutoClose: false,
        // });
      } else if (!this.UIDNumValidationReg.test(this.TravelQNUWForm.get('AadharNo').value)) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter valid Aadhar',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (!this.TravelQNUWForm.get('AadharDetails.FileName').value) {
        this.KYCDetailsAlerts.push({
          Message: 'Aadhar Card Attchment is required.',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (!this.TravelQNUWForm.get('PANNo').value) {
        // this.KYCDetailsAlerts.push({
        //   Message: 'Enter  PAN',
        //   CanDismiss: false,
        //   AutoClose: false,
        // });
      } else if (!this.PANNumValidationReg.test(this.TravelQNUWForm.get('PANNo').value)) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter valid PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (!this.TravelQNUWForm.get('PANDetails.FileName').value) {
        this.KYCDetailsAlerts.push({
          Message: 'PAN Card Attchment is required.',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (!this.TravelQNUWForm.get('PassportDetails.FileName').value) {
        this.KYCDetailsAlerts.push({
          Message: 'Passport Attchment is required.',
          CanDismiss: false,
          AutoClose: false,
        });
      }

    }

    /**
    * Step control Validate
    */
    if (this.KYCDetailsAlerts.length > 0) {
      this.KYCDetailsStepCtrl.setErrors({ required: true });
      return this.KYCDetailsStepCtrl;
    } else {
      this.KYCDetailsStepCtrl.reset();
      return this.KYCDetailsStepCtrl;
    }
  }

  /**
   * Display Error message 
   */
  public KYCDetailsValidationError() {
    if (this.KYCDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.KYCDetailsAlerts);
    }
  }

  public PaymentModeDetailValidationControl() {
    this.PaymentModeDetailsAlerts = [];

    if (this.mode != "view") {
      if (!this.TravelQNUWForm.get("PaymentMode").value) {
        this.PaymentModeDetailsAlerts.push({
          Message: "Select any one PaymentMode",
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TravelQNUWForm.get("PaymentMode").value == 'Cheque') {
        if (!this.TravelQNUWForm.get("PaymentAccountName").value) {
          this.PaymentModeDetailsAlerts.push({
            Message: "Insurance Company - Full Name is required",
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }
    }
    /**
    * Step control Validate
    */
    if (this.PaymentModeDetailsAlerts.length > 0) {
      this.PaymentModeDetailsStepCtrl.setErrors({ required: true });
      return this.PaymentModeDetailsStepCtrl;
    } else {
      this.PaymentModeDetailsStepCtrl.reset();
      return this.PaymentModeDetailsStepCtrl;
    }
  }

  /**
    * Display Error message 
    */
  public PaymentModeDetailsValidationError() {
    if (this.PaymentModeDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PaymentModeDetailsAlerts);
    }
  }

  // Select KYC Documents
  public SelectKycDoc(event, DocumentType: string) {
    let file = event.target.files[0]

    if (file) {
      this._dataService.UploadFile(this.UploadFileAPI, file).subscribe((res) => {
        if (res.Success) {
          if (DocumentType == 'UID') {
            this.TravelQNUWForm.get('AadharDetails').patchValue({
              RFQId: this.TravelQNUWForm.value.Id,
              DocumentType: "UID",
              DocumentTypeName: "Aadhar Card",
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.TravelQNUWForm.value.Stage
            })
          }
          else if (DocumentType == 'PAN') {
            this.TravelQNUWForm.get('PANDetails').patchValue({
              RFQId: this.TravelQNUWForm.value.Id,
              DocumentType: "PAN",
              DocumentTypeName: "PAN Card",
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.TravelQNUWForm.value.Stage
            })
          }
          else if (DocumentType == 'Passport') {
            this.TravelQNUWForm.get('PassportDetails').patchValue({
              RFQId: this.TravelQNUWForm.value.Id,
              DocumentType: "Passport",
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.TravelQNUWForm.value.Stage
            })
          }
          else if (DocumentType == 'Ticket') {
            this.TravelQNUWForm.get('TicketDetails').patchValue({
              RFQId: this.TravelQNUWForm.value.Id,
              DocumentType: "Ticket",
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.TravelQNUWForm.value.Stage
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

  // Remove KYC Documents
  public removeKycDoc(DocumentType: string) {
    if (DocumentType == 'UID') {
      this.TravelQNUWForm.get('AadharDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
    }
    else if (DocumentType == 'PAN') {
      this.TravelQNUWForm.get('PANDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
    }
    else if (DocumentType == 'Ticket') {
      this.TravelQNUWForm.get('TicketDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
    }
    else if (DocumentType == 'Passport') {
      this.TravelQNUWForm.get('PassportDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
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
  * Add new row in Document array
 */
  public addDocuments(selectedDocument?: string) {
    const row: ITravelDocumentsDto = new TravelDocumentsDto();
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


  public AddNomeneeDetails(MemberIndex: number) {

    this.ProductCategoryNomineeDetailsAlert = []

    let NominneDetailsFormArray = this.Members.controls[MemberIndex].get('NomineeDetails') as FormArray


    /**
     * Nominee details validation
     */
    NominneDetailsFormArray.controls.forEach((nominee, n) => {

      if (!nominee.get('Name').value) {
        this.ProductCategoryNomineeDetailsAlert.push({
          Message: `${n + 1} - Nominee Name is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (!nominee.get('DOB').value) {
        this.ProductCategoryNomineeDetailsAlert.push({
          Message: `${n + 1} - Nominee Date of birth is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      } else {
        if (this._datePipe.transform(nominee.get('DOB').value, 'yyyy-MM-dd') > this._datePipe.transform(this.setmaxBirthDate, 'yyyy-MM-dd')) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${n + 1} - Nominee Enter Valid Date of birth.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }

      if (!nominee.get('Relation').value) {
        this.ProductCategoryNomineeDetailsAlert.push({
          Message: `${n + 1} - Nominee Relation with Life Assured is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (!nominee.get('NomineePer').value) {
        this.ProductCategoryNomineeDetailsAlert.push({
          Message: `${n + 1} - Nominee % is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

    })


    if (this.ProductCategoryNomineeDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryNomineeDetailsAlert);
      return;
    }



    let Nominee: TravelNomineeDetailsDto = new TravelNomineeDetailsDto()
    let NomineeDetailsFormArray = this.Members.controls[MemberIndex].get('NomineeDetails') as FormArray
    NomineeDetailsFormArray.push(this._initExistingPolicyDetailsForm(Nominee))
  }

  public RemoveNomeneeDetails(MemberIndex: number, nomineeIndex: number) {
    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          let NomineeDetailsFormArray = this.Members.controls[MemberIndex].get('NomineeDetails') as FormArray
          NomineeDetailsFormArray.removeAt(nomineeIndex)
        }
      });
  }

  // PopUp to share policy details
  public openDiologShare() {

    if (this.QuotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAerts);
      return;
    }

    let selectedQuotation = this.QNselection.controls.find(quotation => quotation.get('Buy').value == true)
    if (selectedQuotation && selectedQuotation.value) {
      this._RfqService.rfqShareDialog(selectedQuotation.value);
    } else {
      this._alertservice.raiseErrorAlert('Quotation not found.')
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
      PaymentMode: [''],
      PaymentAccountName: [''],
      Documents: this._buildDocumentsForm(data.Documents),
      AadharNo: [''],
      AadharDetails: this._initDocumentForm(data.AadharDetails),
      PANNo: [''],
      PANDetails: this._initDocumentForm(data.PANDetails),
      TicketNo: [''],
      TicketDetails: this._initDocumentForm(data.TicketDetails),
      PassportNo: [''],
      PassportDetails: this._initDocumentForm(data.PassportDetails),
      QNDocuments: this._buildQNDocuments(data.QNDocuments),
      Members: this._buildPolicyPersonForm(data.Members),
      Remark: [''],

      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
    })

    if (data != null) {
      fg.patchValue(data);
    }

    return fg;
  }


  //Build  policy Person Formarray
  private _buildPolicyPersonForm(items: ITravelMemberDTO[] = []): FormArray {
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

  //Init policy Person Formgroup
  private _initPolicyPersonForm(item: TravelMemberDTO): FormGroup {
    let pPF = this.fb.group({
      Id: [0],
      RFQId: [0],
      Name: [],
      NomineeDetails: this._buildNomineeDetailsDetailsFormArray(item.NomineeDetails),
    })

    if (item) {
      pPF.patchValue(item);
    }
    // }
    return pPF;
  }

  // Build Nominee Details Formarray
  private _buildNomineeDetailsDetailsFormArray(items: ITravelNomineeDetailsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initExistingPolicyDetailsForm(i));
        });
      }
    }

    return formArray;
  }

  // Init Nominee Details Formgroup
  private _initExistingPolicyDetailsForm(item: ITravelNomineeDetailsDto): FormGroup {

    let NomineeDetails = this.fb.group({
      Id: [0],
      RFQMemberId: [0],
      Name: [''],
      DOB: [''],
      Relation: [''],
      NomineePer: [0],
      AppointeeName: [''],
      AppointeeDOB: [''],
      AppointeeRelation: ['']
    })

    if (item) {
      NomineeDetails.patchValue(item)
    }

    return NomineeDetails
  }


  // Documents FormArray
  private _buildDocumentsForm(items: ITravelDocumentsDto[] = []): FormArray {
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
  private _initDocumentForm(data: ITravelDocumentsDto): FormGroup {

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

  // Build Quotation Note Document Formarray
  private _buildQNDocuments(items: ITravelQNDocumentsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);

    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          // if (i.Buy == true) {
          formArray.push(this._initQNDocuments(i));
          // }
        });
      }
    }

    return formArray;
  }

  // Init Quotation Note Document Form
  private _initQNDocuments(item: ITravelQNDocumentsDto): FormGroup {
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
    }
    return dFQN
  }


  private _OnformChange() {

    this.TravelQNUWForm.get('PaymentMode').valueChanges.subscribe(val => {
      if (val == 'Cheque') {
        let selectedQn = this.QNselection.value.find(qn => qn.Buy == true)
        if (selectedQn) {
          this.TravelQNUWForm.get('PaymentAccountName').patchValue(selectedQn.InsuranceCompanyName)
        }
      } else {
        this.TravelQNUWForm.get('PaymentAccountName').patchValue(null)
      }
    })

  }

  //#endregion private-methods

}
