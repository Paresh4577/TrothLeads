import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatStepper } from '@angular/material/stepper';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { Alert } from '@models/common';
import { RfqEngineeringService } from '../rfq-engineering.service';
import { DialogService } from '@lib/services/dialog.service';
import { AuthService } from '@services/auth/auth.service';
import { MasterListService } from '@lib/services/master-list.service';
import { HttpService } from '@lib/services/http/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { ROUTING_PATH } from '@config/routingPath.config';
import { EngineeringDocumentsDto, IEngineeringDocumentsDto, ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos';
import { environment } from 'src/environments/environment';
import { SubCategoryCodeEnum } from 'src/app/shared/enums';

@Component({
  selector: 'gnx-engineering-policy-issue-uw',
  templateUrl: './engineering-policy-issue-uw.component.html',
  styleUrls: ['./engineering-policy-issue-uw.component.scss'],
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
export class EngineeringPolicyIssueUwComponent {
  @ViewChild('stepper') stepper: MatStepper;

  // Variables
  pagetitle: string = '';
  mode: string = '';
  InsuranceCompany: string = '';
  GrossPremium: number = 0;
  isExpand: boolean = false;
  DropdownMaster: dropdown;
  IsPOSPUser: boolean = false;
  DisplayForm: any;

  // FormGroup 
  PolicyIssueForm: FormGroup;

  // Alerts Array
  PolicyIssueDetailsAlert: Alert[] = [];

  //Form Controls
  PolicyIssueDetailsStepCtrl = new FormControl();

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

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
    private _RFQEngineeringService: RfqEngineeringService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
  ) {
    this.DropdownMaster = new dropdown();
  }
  //#endregion constructor

  // #region Getters

  //Get Gross Premium for only Buy=true
  get getGrossPremium() {
    return this.DisplayForm.QNDocuments.find((f) => f.Buy == true)?.GrossPremium
  }

  get canDisplayMachineryDetail(): boolean {
    if (this.DisplayForm.SubCategoryCode == SubCategoryCodeEnum.ERA ||
      this.DisplayForm.SubCategoryCode == SubCategoryCodeEnum.CRA) {
      return false;
    } else {
      return true;
    }
  };

  get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum;
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
    if (this.DisplayForm.QNDocuments.length > 0) {
      this.DisplayForm.QNDocuments.forEach((el) => {
        if (el.Buy == true) {
          this.InsuranceCompany = el.InsuranceCompanyName;
          this.GrossPremium = el.GrossPremium;
        }
      });
    }

    if (this.DisplayForm.LoadingPremium) {
      this.DisplayForm.PaymentDetails = this.DisplayForm.LoadingPaymentDetails
    }
    else {
      this.DisplayForm.PaymentDetails = this.DisplayForm.PaymentDetails
    }

    // build Engineering form
    this.PolicyIssueForm = this._buildForm(this.DisplayForm);

    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == "Agent") {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }

    // On form changes
    this._onFormChange();

    if (this.mode == 'view') {
      this.PolicyIssueForm.disable()
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

    if ((this.DisplayForm.PolicyType == 'Rollover' || this.DisplayForm.PolicyType == 'Renewal-Change Company' || this.DisplayForm.PolicyType == 'Renewal-Same Company') && this.DisplayForm.SubCategoryCode != "CAR" && this.DisplayForm.SubCategoryCode != "EAR") {
      this.stepper.next();
      this.stepper.next();
    }

    if (this.DisplayForm.PolicyType == 'Rollover' || this.DisplayForm.PolicyType == 'Renewal-Change Company' || this.DisplayForm.PolicyType == 'Renewal-Same Company') {
      this.stepper.next();
    }

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
    if (this.PolicyIssueForm.get('SendBackRejectDesc').value == "" || this.PolicyIssueForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.PolicyIssueForm.value.Id;
          SendBackRejectObj.Stage = this.PolicyIssueForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.PolicyIssueForm.value.SendBackRejectDesc;

          this._RFQEngineeringService.Reject(SendBackRejectObj).subscribe((res) => {
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
    if (this.PolicyIssueForm.get('SendBackRejectDesc').value == "" || this.PolicyIssueForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.PolicyIssueForm.value.Id;
          SendBackRejectObj.Stage = this.PolicyIssueForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.PolicyIssueForm.value.SendBackRejectDesc;

          this._RFQEngineeringService.SendBack(SendBackRejectObj).subscribe((res) => {
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
    this._dateFormat()
    if (this.PolicyIssueDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.PolicyIssueDetailsAlert);
      return;
    }

    this._RFQEngineeringService.SubmitPolicyIssue(this.PolicyIssueForm.value).subscribe(res => {
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
            this.PolicyIssueForm.get('PolicyIssueDetail').patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.DisplayForm.Stage,
              DocumentType: 'Policy',
            })
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

  /**
   * View Uploaded Document
  */
  public ViewDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  public PolicyIssueDetailsValidation() {
    this.PolicyIssueDetailsAlert = []

    if (!this.PolicyIssueForm.get('PolicyIssueDate').value) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy Issue Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (this._datePipe.transform(this.PolicyIssueForm.get('PolicyIssueDate').value, 'yyyy-MM-dd') <
        this._datePipe.transform(this.DisplayForm.ProposalSubmissionDate, 'yyyy-MM-dd')) {
        this.PolicyIssueDetailsAlert.push({
          Message: `Policy Issue Date cannot be before Proposal Submission Date.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }
    if (!this.PolicyIssueForm.get('PolicyStartDate').value) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy Start Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (this._datePipe.transform(this.PolicyIssueForm.get('PolicyStartDate').value, 'yyyy-MM-dd') <
        this._datePipe.transform(this.PolicyIssueForm.get('PolicyIssueDate').value, 'yyyy-MM-dd')) {
        this.PolicyIssueDetailsAlert.push({
          Message: `Policy Start Date cannot be before Policy Issue Date.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (!this.PolicyIssueForm.get('PolicyEndDate').value) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy End Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (this.PolicyIssueForm.get('PolicyStartDate').value > this.PolicyIssueForm.get('PolicyEndDate').value) {
        this.PolicyIssueDetailsAlert.push({
          Message: 'Enter valid Policy EndDate.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (!this.PolicyIssueForm.get('PolicyNo').value) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy No is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.PolicyIssueForm.get('PolicyIssueDetail').value.StorageFilePath) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy Document Attachment is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.PolicyIssueDetailsAlert.length > 0) {
      this.PolicyIssueDetailsStepCtrl.setErrors({ required: true });
      return this.PolicyIssueDetailsStepCtrl;
    }
    else {
      this.PolicyIssueDetailsStepCtrl.reset();
      return this.PolicyIssueDetailsStepCtrl;
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
      PolicyNo: [''],
      PolicyIssueDate: [''],
      PolicyStartDate: [''],
      PolicyEndDate: [''],
      PolicyIssueDetail: this._initDocumentsForm(data.PolicyIssueDetail),
      Documents: this._buildDocumentsForm(data.Documents),

      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
      PremiumAmountPaidBy: []
    })

    if (data != null) {
      fg.patchValue(data);
    }

    return fg;
  }

  // Documents Formarray
  private _buildDocumentsForm(items: IEngineeringDocumentsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initDocumentsForm(i));
        });
      }
    }
    return formArray;
  }

  // Document formgroup
  private _initDocumentsForm(item: IEngineeringDocumentsDto): FormGroup {

    let dF = this.fb.group({
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
    })

    if (item != null) {
      if (!item) {
        item = new EngineeringDocumentsDto();
      }
      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }

  private _dateFormat() {
    this.PolicyIssueForm.patchValue({
      PolicyIssueDate: this._datePipe.transform(this.PolicyIssueForm.get('PolicyIssueDate').value, 'yyyy-MM-dd'),
      PolicyStartDate: this._datePipe.transform(this.PolicyIssueForm.get('PolicyStartDate').value, 'yyyy-MM-dd'),
      PolicyEndDate: this._datePipe.transform(this.PolicyIssueForm.get('PolicyEndDate').value, 'yyyy-MM-dd'),
    })
  }

  private _onFormChange() {
    this.PolicyIssueForm.get('PolicyStartDate').valueChanges.subscribe(val => {
      if (val) {
        let StartDate = this._datePipe.transform(this.PolicyIssueForm.get('PolicyStartDate').value, 'yyyy-MM-dd');
        let endDate = new Date(StartDate);
        endDate.setFullYear(endDate.getFullYear() + 1); // add year
        endDate.setDate(endDate.getDate() - 1); // add year
        this.PolicyIssueForm.get('PolicyEndDate').patchValue(endDate);
      }
    })

  }
  //#endregion private-methods

}
