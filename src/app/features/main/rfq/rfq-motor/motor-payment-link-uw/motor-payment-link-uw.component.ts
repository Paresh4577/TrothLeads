import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { DocumentsDto, IDocumentsDto, IPaymentLinkDto, PaymentLinkDto } from '@models/dtos/config/RFQMotor';
import { MotorPolicyTypeEnum, MotorSubCategoryCodeEnum } from 'src/app/shared/enums/rfq-motor';
import { environment } from 'src/environments/environment';
import { DialogService } from '@lib/services/dialog.service';
import { Alert } from '@models/common';
import { AuthService } from '@services/auth/auth.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { DatePipe, Location } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { RfqMotorService } from '../rfq-motor.service';
import { RfqService } from '../../rfq.service';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';

@Component({
  selector: 'gnx-motor-payment-link-uw',
  templateUrl: './motor-payment-link-uw.component.html',
  styleUrls: ['./motor-payment-link-uw.component.scss'],
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
export class MotorPaymentLinkUwComponent {

  @ViewChild('stepper') stepper: MatStepper;

  //Variables
  pagetitle: string; // Page main header title
  IsPOSPUser: boolean = false;

  //FormGroup 
  PLUWForm !: FormGroup;
  DisplayForm: any;
  isExpand: boolean = false;

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload; // upload document API

  //ENUMs
  MotorPolicyTypeEnum = MotorPolicyTypeEnum;
  SubCategoryCodeEnum = MotorSubCategoryCodeEnum;

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
    private _RfqMotorService: RfqMotorService,
    private _authService: AuthService,
    private _RfqService: RfqService,
    private _Location: Location,
  ) {

    // get User type from user profile
    if (this._authService._userProfile.value?.UserType == "Agent") {
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

    // Init Form
    this.PLUWForm = this._initForm(this.DisplayForm);
  }

  // After View Init
  ngAfterViewInit(): void {

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

  // #region Getters

  //Get Gross Premium for only Buy=true
  get getGrossPremium() {
    return this.DisplayForm.QNDocuments.find((f) => f.Buy == true)?.GrossPremium
  }

  get Documents(): FormArray {
    return this.PLUWForm.get('Documents') as FormArray;
  }

  // #endregion Getters

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public stepOneValidation() {

  }

  // Submit Form button
  public SubmitForm() {
    // Check if Payment link is added or not (If not added raise Alert message)
    let errorMessage = this._finalValidationSubmit()
    if (errorMessage.length > 0) {
      this._alertservice.raiseErrors(errorMessage);
      return
    }

    // When Form is Validated, Submit Form.
    let Id = this.PLUWForm.get('Id').value

    let submitFormValue = JSON.parse(JSON.stringify(this.PLUWForm.value))

    if (!submitFormValue.ProposalSubmissionDetail.StorageFilePath) {
      submitFormValue.ProposalSubmissionDetail = null
    }


    this._RfqMotorService.SubmitPaymentLink(submitFormValue).subscribe((res) => {
      if (res.Success) {
        this._alertservice.raiseSuccessAlert(res.Message, "false")
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
    })
  }

  // Back button
  public backButton() {
    this._Location.back();
  }

  // Reject Button
  public Reject() {
    if (this.PLUWForm.get('SendBackRejectDesc').value == "" || this.PLUWForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.PLUWForm.value.Id;
          SendBackRejectObj.Stage = this.PLUWForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.PLUWForm.value.SendBackRejectDesc;

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


  // SendBack Button
  public SendBack() {
    if (this.PLUWForm.get('SendBackRejectDesc').value == "" || this.PLUWForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.PLUWForm.value.Id;
          SendBackRejectObj.Stage = this.PLUWForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.PLUWForm.value.SendBackRejectDesc;

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



            this.PLUWForm.get('ProposalSubmissionDetail').patchValue({
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              FileName: res.Data.FileName,
              DocumentType: 'Proposal',
              RFQId: this.PLUWForm.get('Id').value
            })
          }
          else {
            this._alertservice.raiseErrors(res.Alerts);
          }
        });
    }
  }

  public removeProposalDoc() {

    this.PLUWForm.get('ProposalSubmissionDetail').patchValue({
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


  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  private _initForm(data: IPaymentLinkDto) {

    let fg = this.fb.group({
      Id: [0],
      Discount: [0],
      PaymentLink: [''],
      PaymentInsurer: [false],
      Documents: this._buildDocumentsForm(data.Documents),
      ProposalSubmissionDetail: this._initDocumentForm(data.ProposalSubmissionDetail),
      Additionalinformation: [''],
      SendBackRejectDesc: [''],
      Stage: ['']
    })

    if (data != null) {
      fg.patchValue(data);
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
      DocumentType: [],
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

  // check if Payment Link is added not not (alert message if Payment link is not added) 
  private _finalValidationSubmit() {
    let alert: Alert[] = []
    if (this.PLUWForm.get('PaymentInsurer').value == false && this.DisplayForm?.PaymentMode == 'Online') {
      if (this.PLUWForm.get('PaymentLink').value == "" || this.PLUWForm.get('PaymentLink').value == null) {
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
