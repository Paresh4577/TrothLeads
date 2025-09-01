import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { Alert } from '@models/common';
import { AuthService } from '@services/auth/auth.service';
import { RfqService } from '../../rfq.service';
import { RfqFireService } from '../rfq-fire.service';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { ROUTING_PATH } from '@config/routingPath.config';
import { environment } from 'src/environments/environment';
import { IFireDocumentsDto, IFirePaymentLinkUWDto } from '@models/dtos';
import { DisplayedPolicyPreriod } from '@config/rfq';

@Component({
  selector: 'gnx-fire-payment-link-uw',
  templateUrl: './fire-payment-link-uw.component.html',
  styleUrls: ['./fire-payment-link-uw.component.scss'],
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
export class FirePaymentLinkUwComponent {

  @ViewChild('stepper') stepper: MatStepper;

  //Variables
  pagetitle: string; // Page main header title
  mode: string; // for identify of Raise page is create or edit or view
  isExpand: boolean = false;
  IsPOSPUser: boolean = false;
  ProposalFormFileName: string = 'Attach Proposal Form';
  ProposalFormFilePath: string = '';

  //FormGroup 
  PaymentLinkForm !: FormGroup;
  DisplayForm: any;
  AdditionalDetailFireAndFirePackage: any;
  FirePackageSumInsuredDetails: any;

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
    private authService: AuthService,
    private _dialogService: DialogService,
    private _RfqFireService: RfqFireService,
    private _RFQService: RfqService,
    private _Location: Location,
  ) {
    this.FirePackageSumInsuredDetails = this._RfqFireService.DisplaySumInsuredDetailsFirePackage()

  }
  // #endregion constructor


  // #region Getters

  //Get Gross Premium for only Buy=true
  get getGrossPremium() {
    return this.DisplayForm.QNDocuments.find((f) => f.Buy == true)?.GrossPremium
  }

  get Documents() {
    return this.PaymentLinkForm.get('Documents') as FormArray;
  }



  get SelectedQNDoc() {
    let SelectedQuotation = this.DisplayForm.QNDocuments.find(qn => qn.Buy == true)

    if (SelectedQuotation) {
      return SelectedQuotation
    } else {
      return null;
    }

  }

  get CanDisplayJwelleryDetails() {

    if (this.DisplayForm.Type == 'Home'
      && this.DisplayForm?.SumInsuredDetail.ValuableContents
      && this.DisplayForm?.SumInsuredDetail.ValuableContentsSumInsured <= 200000) {
      return true;
    } else {
      return false;
    }

  }

  get CanDisplayContentDetail() {

    if (this.DisplayForm.Type == 'Fire' && this.DisplayForm?.SumInsuredDetail.MachineryBreakdown) {
      return true;
    } else if (this.DisplayForm.Type == 'Fire Package' &&
      (this.DisplayForm?.SumInsuredDetail.ElectricleOrElectronic ||
        this.DisplayForm?.SumInsuredDetail.PortableEquipmentCover)) {
      return true;
    }
    else {
      return false;
    }

  }

  // get Fire Policy period
  get DisplayedPolicyPreriod() {
    return DisplayedPolicyPreriod
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
    this.DisplayForm = data['data'];
    this.mode = data['mode']

    // Init Form
    this.PaymentLinkForm = this._initForm(this.DisplayForm);

    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == "Agent") {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }

    this.AdditionalDetailFireAndFirePackage = this._RfqFireService.AdditionalDetailFireAndFirePackage()
    if (this.DisplayForm.PaymentMode == 'Cheque') {
      this.PaymentLinkForm.get('PaymentInsurer').disable();
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
      this.stepper.next();
    }

    this.cdr.detectChanges();
  }

  //#endregion lifecyclehooks


  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }


  // Reject Button 
  public RejectButton() {
    if (this.PaymentLinkForm.get('SendBackRejectDesc').value == "" || this.PaymentLinkForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.PaymentLinkForm.value.Id;
          SendBackRejectObj.Stage = this.PaymentLinkForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.PaymentLinkForm.value.SendBackRejectDesc;

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
    if (this.PaymentLinkForm.get('SendBackRejectDesc').value == "" || this.PaymentLinkForm.get('SendBackRejectDesc').value == null) {
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
          let Id = this.PaymentLinkForm.get('Id').value

          let SendBackRejectObj: ISendBackRejectDTO = new SendBackRejectDTO()
          SendBackRejectObj.Id = this.PaymentLinkForm.value.Id;
          SendBackRejectObj.Stage = this.PaymentLinkForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.PaymentLinkForm.value.SendBackRejectDesc;

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
    let errorMessage = this._finalValidationSubmit()
    if (errorMessage.length > 0) {
      this._alertservice.raiseErrors(errorMessage);
      return
    }


    let submitFormValue = JSON.parse(JSON.stringify(this.PaymentLinkForm.value))

    if (!submitFormValue.ProposalSubmissionDetail.StorageFilePath) {
      submitFormValue.ProposalSubmissionDetail = null
    }

    this._RfqFireService.SubmitPaymentLink(submitFormValue).subscribe(res => {
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
            this.PaymentLinkForm.get('ProposalSubmissionDetail').patchValue({
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

    this.PaymentLinkForm.get('ProposalSubmissionDetail').patchValue({
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

  public FilterDisplaySumInsuredDetails() {

    let TypeWiseDisplaySumInsuredDetails = this._RfqFireService.DisplaySumInsuredDetailsHomeAndFire()
      .filter(item => item.DisplayFor.includes(this.DisplayForm.Type))

    return TypeWiseDisplaySumInsuredDetails
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  private _initForm(data: IFirePaymentLinkUWDto) {
    let fg = this.fb.group({
      Id: [0],
      Discount: [0],
      PaymentLink: [''],
      PaymentInsurer: [true],
      ProposalSubmissionDetail: this._initDocumentForm(data.ProposalSubmissionDetail),
      Documents: this._buildDocumentsForm(data.Documents),

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
  private _buildDocumentsForm(items: IFireDocumentsDto[] = []): FormArray {
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
  private _initDocumentForm(data: IFireDocumentsDto): FormGroup {

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


  // check if Payment Link is added not not (alert message if Payment link is not added) 
  private _finalValidationSubmit() {
    let alert: Alert[] = []
    if (this.PaymentLinkForm.get('PaymentInsurer').value == false && this.DisplayForm?.PaymentMode == 'Online') {
      if (this.PaymentLinkForm.get('PaymentLink').value == "" || this.PaymentLinkForm.get('PaymentLink').value == null) {
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
