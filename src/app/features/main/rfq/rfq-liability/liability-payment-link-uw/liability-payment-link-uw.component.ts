import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ILiabilityPaymentLinkUWDto, ILiabilityPrePolicyDTO, IRFQLiabilityDocumentsDto, LiabilityPrePolicyDTO } from '@models/dtos';
import { environment } from 'src/environments/environment';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { RfqLifeService } from '../../rfq-life/rfq-life.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatStepper } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert } from '@models/common';
import { AuthService } from '@services/auth/auth.service';
import { RfqLiabilityService } from '../rfq-liability.service';


@Component({
  selector: 'gnx-liability-payment-link-uw',
  templateUrl: './liability-payment-link-uw.component.html',
  styleUrls: ['./liability-payment-link-uw.component.scss'],
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
export class LiabilityPaymentLinkUwComponent {

  //#region public properties
  @ViewChild('stepper') public stepper: MatStepper;


  public pagetitle: string; // Page main header title
  public mode: string; // for identify of Raise page is create or edit or view
  public isExpand: boolean = false;
  public isPOSPUser: boolean = false;
  public paymentLinkForm !: FormGroup;
  public displayForm: any;
  public jewellersBlockPoliciesSumInsuredDetails: any;
  public attachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  public documentAttachmentAlert: Alert[] = [];

  //#endregion



  //#region private properties
  private _uploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API
  //#endregion

  //#region constructor

  constructor(
    private _fb: FormBuilder,
    private _alertservice: AlertsService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _cdr: ChangeDetectorRef,
    private _authService: AuthService,
    private _dialogService: DialogService,
    private _rfqLiabilityService: RfqLiabilityService,
    private _Location: Location,
  ) {
  }
  // #endregion constructor


  // #region Getters

  //Get Gross Premium for only Buy=true
  public get getGrossPremium(): number {
    return this.displayForm.QNDocuments.find((f) => f.Buy == true)?.GrossPremium
  }

  // End Region Getters

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    //Get Route Params Data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title']
    this.displayForm = data['data'];
    this.mode = data['mode']

    /**
* When No one PrevPolicyDetail Found Then Add one object in PrevPolicyDetail details TO display Blank field
*/
    if (!this.displayForm.PrevPolicyDetail || this.displayForm.PrevPolicyDetail?.length == 0) {
      let row: ILiabilityPrePolicyDTO = new LiabilityPrePolicyDTO()
      row.RFQId = this.displayForm.Id
      this.displayForm.PrevPolicyDetail.push(row)
    }

    // Init Form
    this.paymentLinkForm = this._initForm(this.displayForm);

    // get User type from user profile
    if (this._authService._userProfile.value?.UserType == "Agent") {
      this.isPOSPUser = true;
    }
    else {
      this.isPOSPUser = false;
    }

    if (this.displayForm.PaymentMode == 'Cheque') {
      this.paymentLinkForm.get('PaymentInsurer').disable();
      // this.PaymentLinkForm.get('PaymentLink').patchValue("NA");
    }

  }

  //After View Init
  ngAfterViewInit(): void {

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


  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public expandCollaps(): void {
    this.isExpand = !this.isExpand
  }

  // Reject Button 
  public rejectButton(): void {
    if (this.paymentLinkForm.get('SendBackRejectDesc').value == "" || this.paymentLinkForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.paymentLinkForm.value.Id;
          SendBackRejectObj.Stage = this.paymentLinkForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.paymentLinkForm.value.SendBackRejectDesc;

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
  public sendBackButton(): void {
    if (this.paymentLinkForm.get('SendBackRejectDesc').value == "" || this.paymentLinkForm.get('SendBackRejectDesc').value == null) {
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
          let Id = this.paymentLinkForm.get('Id').value

          let SendBackRejectObj: ISendBackRejectDTO = new SendBackRejectDTO()
          SendBackRejectObj.Id = this.paymentLinkForm.value.Id;
          SendBackRejectObj.Stage = this.paymentLinkForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.paymentLinkForm.value.SendBackRejectDesc;

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

  public submitFormButton(): void {

    let errorMessage = this._finalValidationSubmit()
    if (errorMessage.length > 0) {
      this._alertservice.raiseErrors(errorMessage);
      return
    }

    if (this.documentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.documentAttachmentAlert);
      return;
    }


    let submitFormValue = JSON.parse(JSON.stringify(this.paymentLinkForm.value))

    if (!submitFormValue.ProposalSubmissionDetail.StorageFilePath) {
      submitFormValue.ProposalSubmissionDetail = null
    }

    this._rfqLiabilityService.submitPaymentLink(submitFormValue).subscribe(res => {
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
  public backButton(): void {
    this._Location.back();
  }

  // file data (policy document that is added)
  public uploadDocument(event): void {
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
            this.paymentLinkForm.get('ProposalSubmissionDetail').patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.displayForm.Stage,
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
  public removeProposalDoc(): void {

    this.paymentLinkForm.get('ProposalSubmissionDetail').patchValue({
      FileName: null,
      StorageFileName: null,
      StorageFilePath: null
    })
  }

  // view attached file 
  public viewQnDocument(fileName: string): void {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  // view Quotation (Veiw Uploaded Policy document)
  public viewQuotation(): void {
    window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + this.displayForm.QNDocuments.find((f) => f.Buy == true)?.StorageFilePath);
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  private _initForm(data: ILiabilityPaymentLinkUWDto): FormGroup {
    let fg = this._fb.group({
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
  private _buildDocumentsForm(items: IRFQLiabilityDocumentsDto[] = []): FormArray {
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

    let DocumentForm = this._fb.group({
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

  // check if Payment Link is added not not (alert message if Payment link is not added) 
  private _finalValidationSubmit() {
    let alert: Alert[] = []
    if (this.paymentLinkForm.get('PaymentInsurer').value == false && this.displayForm?.PaymentMode == 'Online') {
      if (this.paymentLinkForm.get('PaymentLink').value == "" || this.paymentLinkForm.get('PaymentLink').value == null) {
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
