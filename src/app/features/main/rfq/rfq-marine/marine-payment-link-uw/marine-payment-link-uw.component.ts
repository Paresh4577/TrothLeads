import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert } from '@models/common';
import { AuthService } from '@services/auth/auth.service';
import { RFQMarineService } from '../rfq-marine.service';
import { ROUTING_PATH } from '@config/routingPath.config';
import { IMarineDocumentsDto } from '@models/dtos';
import { environment } from 'src/environments/environment';
import { IMarinePaymentLinkUWDto } from '@models/dtos';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';

@Component({
  selector: 'gnx-marine-payment-link-uw',
  templateUrl: './marine-payment-link-uw.component.html',
  styleUrls: ['./marine-payment-link-uw.component.scss'],
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
export class MarinePaymentLinkUwComponent {
  @ViewChild('stepper') stepper: MatStepper;

  //Variables
  pagetitle: string; // Page main header title
  mode: string; // for identify of Raise page is create or edit or view
  isExpand: boolean = false;
  IsPOSPUser: boolean = false;
  ProposalFormFileName: string = 'Attach Proposal Form';
  ProposalFormFilePath: string = '';

  //FormGroup 
  MarinePLWNForm !: FormGroup;
  DisplayForm: any;

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // Alert Array List
  detailsFieldsList: any[] // A list of Insured person Questionary
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  selectedDocumentTypes: string[] = [];
  DocumentAttachmentAlert: Alert[] = [];

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
    private _rfqMarineService: RFQMarineService,
    private _Location: Location,
  ) {
    // Get Inssuerd Person Questionary list
    // this.detailsFieldsList = this._rfqMarineService.getdetailsFieldsList()
  }
  // #endregion constructor

  // #region Getters

  //Get Gross Premium for only Buy=true
  get getGrossPremium() {
    return this.DisplayForm.QNDocuments.find((f) => f.Buy == true)?.GrossPremium
  }

  get Documents() {
    return this.MarinePLWNForm.get('Documents') as FormArray;
  }

  // End Region Getters

  //#region Marinecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Marinecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    //Get Route Params Data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title']
    this.DisplayForm = data['data'];
    this.mode = data['mode']

    // Init Form
    this.MarinePLWNForm = this._initForm(this.DisplayForm);

    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == "Agent") {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }

    if (this.DisplayForm.PaymentMode == 'Cheque') {
      this.MarinePLWNForm.get('PaymentInsurer').disable();
      // this.PaymentLinkForm.get('PaymentLink').patchValue("NA");
    }
  }

  ngAfterViewInit(): void {

    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();

    if (this.DisplayForm.PolicyType == 'Rollover' || this.DisplayForm.PolicyType == 'Renewal-Change Company' || this.DisplayForm.PolicyType == 'Renewal-Same Company') {
      this.stepper.next();
    }

    this.cdr.detectChanges();
  }

  //#endregion Marinecyclehooks


  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }



  // Reject Button 
  public RejectButton() {
    if (this.MarinePLWNForm.get('SendBackRejectDesc').value == "" || this.MarinePLWNForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.MarinePLWNForm.value.Id;
          SendBackRejectObj.Stage = this.MarinePLWNForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.MarinePLWNForm.value.SendBackRejectDesc;

          this._rfqMarineService.Reject(SendBackRejectObj).subscribe((res) => {
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
    if (this.MarinePLWNForm.get('SendBackRejectDesc').value == "" || this.MarinePLWNForm.get('SendBackRejectDesc').value == null) {
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
          let Id = this.MarinePLWNForm.get('Id').value

          let SendBackRejectObj: ISendBackRejectDTO = new SendBackRejectDTO()
          SendBackRejectObj.Id = this.MarinePLWNForm.value.Id;
          SendBackRejectObj.Stage = this.MarinePLWNForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.MarinePLWNForm.value.SendBackRejectDesc;

          this._rfqMarineService.SendBack(SendBackRejectObj).subscribe((res) => {
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

  public SubmitFormButton() {
    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }

    let submitFormValue = JSON.parse(JSON.stringify(this.MarinePLWNForm.value))

    if (!submitFormValue.ProposalSubmissionDetail.StorageFilePath) {
      submitFormValue.ProposalSubmissionDetail = null
    }

    this._rfqMarineService.SubmitPaymentLink(submitFormValue).subscribe(res => {
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

  // back button
  public backButton() {
    this._Location.back();
  }

  // file data (policy document that is added)
  public UploadDocument(event) {
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
            this.MarinePLWNForm.get('ProposalSubmissionDetail').patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.DisplayForm.Stage,
              DocumentType: 'Proposal',
            })
          }
          else {
            this._alertservice.raiseErrors(res.Alerts);
          }
        });
    }
  }

  // Remove Proposal Document
  public removeProposalDoc() {
    this.MarinePLWNForm.get('ProposalSubmissionDetail').patchValue({
      FileName: null,
      StorageFileName: null,
      StorageFilePath: null
    })
  }

  // view attached file 
  public ViewQnDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  // view Quotation (Veiw Uploaded Policy document)
  public ViewQuotation() {
    window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + this.DisplayForm.QNDocuments.find((f) => f.Buy == true)?.StorageFilePath);
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  private _initForm(data: IMarinePaymentLinkUWDto) {
    let fg = this.fb.group({
      Id: [0],
      Discount: [0],
      PaymentLink: [''],
      PaymentInsurer: [true],
      ProposalSubmissionDetail: this._initDocumentForm(data.ProposalSubmissionDetail),
      Documents: this._buildDocumentsForm(data.Documents),

      // PremiumInstallmentType: [''],
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
  private _buildDocumentsForm(items: IMarineDocumentsDto[] = []): FormArray {
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
  private _initDocumentForm(data: IMarineDocumentsDto): FormGroup {

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

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  //#endregion private-methods
}
