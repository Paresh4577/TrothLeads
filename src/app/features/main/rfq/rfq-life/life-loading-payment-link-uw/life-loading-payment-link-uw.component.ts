import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
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
import { LifeDocumentsDto, ILifeDocumentsDto, ILifeLoadingPaymentLinkDto } from '@models/dtos';
import { environment } from 'src/environments/environment';
import { Alert } from '@models/common';
import { SubCategoryCodeEnum } from 'src/app/shared/enums';
import { DisplayedLifePremiumInstallmentType } from '@config/rfq';
import * as moment from 'moment';

@Component({
  selector: 'gnx-life-loading-payment-link-uw',
  templateUrl: './life-loading-payment-link-uw.component.html',
  styleUrls: ['./life-loading-payment-link-uw.component.scss'],
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
export class LifeLoadingPaymentLinkUwComponent {

  @ViewChild('stepper') stepper: MatStepper;

  // Variables
  pagetitle: string = '';
  isExpand: boolean = false;
  mode: string = '';
  IsSalesPerson: boolean = false;
  IsPOSPUser: boolean = false;
  ProposerName: string;

  DisplayForm: any;

  //Form Group 
  LifeLPLUForm: FormGroup;

  // Enums
  SubCategoryCodeEnum = SubCategoryCodeEnum;

  detailsFieldsList: any[] // A list of Insured person Questionary

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
    private _authService: AuthService,
    private _dialogService: DialogService,
    private _MasterListService: MasterListService,
    private _rfqLifeService: RfqLifeService,
    private _Location: Location,
  ) {

    // Get Inssuerd Person Questionary list
    this.detailsFieldsList = this._rfqLifeService.getdetailsFieldsList()

    // get User type from user profile
    if (this._authService._userProfile.value?.UserType == "Agent") {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }
  }
  // #endregion constructor

  // #region Getters

  // Documents FormArray
  get Documents() {
    return this.LifeLPLUForm.get('Documents') as FormArray;
  }

  // Gross Premium from Previous form
  get getGrossPremium() {
    return this.DisplayForm.QNDocuments.find((f) => f.Buy == true)?.GrossPremium;
  }

  // Displayed Life Premium Installment Type Options
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
    this.DisplayForm = data['data'];
    this.mode = data['mode']

    // Init Form
    this.LifeLPLUForm = this._initForm(this.DisplayForm);

    // get User type from user profile
    if (this._authService._userProfile.value?.UserType == "Agent") {
      this.IsSalesPerson = true;
    }
    else {
      this.IsSalesPerson = false;
    }

    if (this.DisplayForm.PaymentMode == 'Cheque') {
      this.LifeLPLUForm.get('LoadingPaymentInsurer').disable();
      // this.PaymentLinkForm.get('PaymentLink').patchValue("NA");
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
    if (this.LifeLPLUForm.get('SendBackRejectDesc').value == "" || this.LifeLPLUForm.get('SendBackRejectDesc').value == null) {
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
          this._rfqLifeService.Reject(this.LifeLPLUForm.value).subscribe((res) => {
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
    if (this.LifeLPLUForm.get('SendBackRejectDesc').value == "" || this.LifeLPLUForm.get('SendBackRejectDesc').value == null) {
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
          this._rfqLifeService.SendBack(this.LifeLPLUForm.value).subscribe((res) => {
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

    // Check if Payment link is added or not (If not added raise Alert message)
    let errorMessage = this._finalValidationSubmit()
    if (errorMessage.length > 0) {
      this._alertservice.raiseErrors(errorMessage);
      return
    }

    let submitFormValue = JSON.parse(JSON.stringify(this.LifeLPLUForm.value))

    if (!submitFormValue.ProposalSubmissionDetail.StorageFilePath) {
      submitFormValue.ProposalSubmissionDetail = null
    }

    this._rfqLifeService.SubmitLoadingPaymentLink(submitFormValue).subscribe(res => {
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

  // view Quotation (Veiw Uploaded Policy document)
  public ViewQuotation() {
    window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + this.DisplayForm.QNDocuments.find((f) => f.Buy == true)?.StorageFilePath);
  }

  // view attached file 
  public ViewQnDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  // file data (policy document that is added)
  public UploadDocument(event) {
    if (event.target.files.length > 0) {

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
              this.LifeLPLUForm.get('ProposalSubmissionDetail').patchValue({
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
  }

  // Remove Proposal Document
  public removeProposalDoc() {

    this.LifeLPLUForm.get('ProposalSubmissionDetail').patchValue({
      FileName: null,
      StorageFileName: null,
      StorageFilePath: null
    })
  }

  public NomineeAge(nomineeDOB) {
    if (nomineeDOB) {
      let NomineeAge = moment.duration(moment().diff(nomineeDOB));
      return NomineeAge.years()
    } else {
      return 0;
    }
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  // Init Form
  private _initForm(data: ILifeLoadingPaymentLinkDto) {
    let fg = this.fb.group({
      Id: [0],
      Discount: [0],
      LoadingPaymentLink: [''],
      LoadingPaymentInsurer: [true],
      Documents: this._buildDocumentsForm(data.Documents),
      ProposalSubmissionDetail: this._initDocumentForm(data.ProposalSubmissionDetail),

      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: ['']
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
      if (!data) {
        data = new LifeDocumentsDto();
      }
      if (data) {
        DocumentForm.patchValue(data);
      }
    }

    return DocumentForm;
  }

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  // check if Payment Link is added not not (alert message if Payment link is not added) 
  private _finalValidationSubmit() {
    let alert: Alert[] = []
    if (this.LifeLPLUForm.get('LoadingPaymentInsurer').value == false && this.DisplayForm?.PaymentMode == 'Online') {
      if (this.LifeLPLUForm.get('LoadingPaymentLink').value == "" || this.LifeLPLUForm.get('LoadingPaymentLink').value == null) {
        alert.push({
          Message: 'Enter Payment Link',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    return alert
  }
  //#endregion private-methods

}
