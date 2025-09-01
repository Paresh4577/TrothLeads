import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatStepper } from '@angular/material/stepper';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ValidationRegex } from '@config/validationRegex.config';
import { Alert } from '@models/common';
import { RfqWcService } from '../rfq-wc.service';
import { RfqService } from '../../rfq.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '@lib/services/http/http.service';
import { DialogService } from '@lib/services/dialog.service';
import { RFQDocumentsDrpList } from '@config/rfq';
import { CategoryCodeEnum } from 'src/app/shared/enums';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { environment } from 'src/environments/environment';
import { WCDocumentsDto, IWCDocumentsDto, IWCQNDocumentsDto } from '@models/dtos';
import { DisplayedWCPolicyPreriod } from '@config/rfq';

@Component({
  selector: 'gnx-wc-qn-selection-sp',
  templateUrl: './wc-qn-selection-sp.component.html',
  styleUrls: ['./wc-qn-selection-sp.component.scss'],
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
export class WcQnSelectionSpComponent {

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  // Variables
  pagetitle: string = '';
  mode: string = '';
  isExpand: boolean = false;

  PANNumValidationReg: RegExp = ValidationRegex.PANNumValidationReg; // PAN number Validation regex
  UIDNumValidationReg: RegExp = ValidationRegex.UIDNumValidationReg; //Aadhar/UID number Validation regex

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  DisplayForm: any;

  // FormGroup 
  QNselectionForm: FormGroup;

  // Alert Array List
  QuotationSelectionAerts: Alert[] = []; // Step Invalid field error message
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
    private _dialogService: DialogService,
    private _RFQWCService: RfqWcService,
    private _RFQService: RfqService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
  ) {

  }
  //#endregion constructor

  // #region Getters


  // QNDocuments Form array
  get QNselection() {
    return this.QNselectionForm.get('QNDocuments') as FormArray;
  }

  // Documents Form array
  get Documents() {
    return this.QNselectionForm.get('Documents') as FormArray;
  }


  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.WorkmenComp))
  }

  get DisplayedPolicyPreriod() {
    return DisplayedWCPolicyPreriod
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
    this.QNselectionForm = this._buildForm(this.DisplayForm);

    this._OnformChange()
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
    if (this.QNselectionForm.get('SendBackRejectDesc').value == "" || this.QNselectionForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.QNselectionForm.value.Id;
          SendBackRejectObj.Stage = this.QNselectionForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.QNselectionForm.value.SendBackRejectDesc;
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

  // SendBack Button
  public SendBackButton() {
    if (this.QNselectionForm.get('SendBackRejectDesc').value == "" || this.QNselectionForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.QNselectionForm.value.Id;
          SendBackRejectObj.Stage = this.QNselectionForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.QNselectionForm.value.SendBackRejectDesc;

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


    if (this.QuotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAerts);
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

    let SubmitFormValue = JSON.parse(JSON.stringify(this.QNselectionForm.value))

    // if pan not attach then Field value is set null
    if (!SubmitFormValue.PANDetails?.StorageFilePath) {
      SubmitFormValue.PANDetails = null
    }
    // if Aadhar not attach then Field value is set null
    if (!SubmitFormValue.AadharDetails?.StorageFilePath) {
      SubmitFormValue.AadharDetails = null
    }
    // if Aadhar not attach then Field value is set null
    if (!SubmitFormValue.GSTDetails?.StorageFilePath) {
      SubmitFormValue.GSTDetails = null
    }

    this._RFQWCService.SubmitQNSelectionSP(SubmitFormValue).subscribe((res) => {
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
        if (this.QNselectionForm.get('PaymentMode').value == 'Cheque') {
          this.QNselectionForm.get('PaymentAccountName').patchValue(qn.value.InsuranceCompanyName)
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
      this._RFQWCService.DownloadQnDocument(SelectedQuotation.Id).subscribe(blob => {
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

  /**
* Check step four Invalid Formfield
*/
  public KYCDetailsValidationControl() {
    this.KYCDetailsAlerts = [];

    if (this.mode != "view") {

      if (!this.QNselectionForm.get('AadharNo').value) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter  Aadhar',
          CanDismiss: false,
          AutoClose: false,
        });
      } else if (!this.UIDNumValidationReg.test(this.QNselectionForm.get('AadharNo').value)) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter valid Aadhar',
          CanDismiss: false,
          AutoClose: false,
        });
      }


      if (!this.QNselectionForm.get('PANNo').value) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter  PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      } else if (!this.PANNumValidationReg.test(this.QNselectionForm.get('PANNo').value)) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter valid PAN',
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
      if (!this.QNselectionForm.get("PaymentMode").value) {
        this.PaymentModeDetailsAlerts.push({
          Message: "Select any one PaymentMode",
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.QNselectionForm.get("PaymentMode").value == 'Cheque') {
        if (!this.QNselectionForm.get("PaymentAccountName").value) {
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
            this.QNselectionForm.get('AadharDetails').patchValue({
              RFQId: this.QNselectionForm.value.Id,
              DocumentType: "UID",
              DocumentTypeName: "Aadhar Card",
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.QNselectionForm.value.Stage
            })
          }
          else if (DocumentType == 'PAN') {
            this.QNselectionForm.get('PANDetails').patchValue({
              RFQId: this.QNselectionForm.value.Id,
              DocumentType: "PAN",
              DocumentTypeName: "PAN Card",
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.QNselectionForm.value.Stage
            })
          } else if (DocumentType == 'GST') {
            this.QNselectionForm.get('GSTDetails').patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.DisplayForm.Stage,
              DocumentType: 'OtherGSTDocument', // DOc Type Given By Backend Team
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
      this.QNselectionForm.get('AadharDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
    }
    else if (DocumentType == 'PAN') {
      this.QNselectionForm.get('PANDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
    } else if (DocumentType == 'GST') {
      this.QNselectionForm.get('GSTDetails').patchValue({
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
    const row: IWCDocumentsDto = new WCDocumentsDto();
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

  // PopUp to share policy details
  public openDiologShare() {

    if (this.QuotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAerts);
      return;
    }

    let selectedQuotation = this.QNselection.controls.find(quotation => quotation.get('Buy').value == true)
    if (selectedQuotation && selectedQuotation.value) {
      this._RFQService.rfqShareDialog(selectedQuotation.value);
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
      TransactionId: [0],
      PaymentMode: [''],
      PaymentAccountName: [''],
      Documents: this._buildDocumentsForm(data.Documents),
      AadharNo: [''],
      AadharDetails: this._initDocumentForm(data.AadharDetails),
      PANNo: [''],
      PANDetails: this._initDocumentForm(data.PANDetails),
      GSTNo: [''],
      GSTDetails: this._initDocumentForm(data.GSTDetails),
      QNDocuments: this._buildQNDocuments(data.QNDocuments),


      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: [''],

    })

    if (data != null) {
      fg.patchValue(data);
    }

    return fg;
  }


  // Documents FormArray
  private _buildDocumentsForm(items: IWCDocumentsDto[] = []): FormArray {
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
  private _initDocumentForm(data: IWCDocumentsDto): FormGroup {

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
  private _buildQNDocuments(items: IWCQNDocumentsDto[] = []): FormArray {
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
  private _initQNDocuments(item: IWCQNDocumentsDto): FormGroup {
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

    this.QNselectionForm.get('PaymentMode').valueChanges.subscribe(val => {
      if (val == 'Cheque') {
        let selectedQn = this.QNselection.value.find(qn => qn.Buy == true)
        if (selectedQn) {
          this.QNselectionForm.get('PaymentAccountName').patchValue(selectedQn.InsuranceCompanyName)
        }
      } else {
        this.QNselectionForm.get('PaymentAccountName').patchValue(null)
      }
    })

  }

  //#endregion private-methods

}
