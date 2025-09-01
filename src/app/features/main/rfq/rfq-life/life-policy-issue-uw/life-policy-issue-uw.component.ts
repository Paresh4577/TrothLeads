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
import { LifeDocumentsDto, ILifeDocumentsDto, ILifePolicyIssueDto } from '@models/dtos';
import { environment } from 'src/environments/environment';
import { Alert } from '@models/common';
import { SubCategoryCodeEnum } from 'src/app/shared/enums';
import { DisplayedLifePremiumInstallmentType } from '@config/rfq';
import * as moment from 'moment';

@Component({
  selector: 'gnx-life-policy-issue-uw',
  templateUrl: './life-policy-issue-uw.component.html',
  styleUrls: ['./life-policy-issue-uw.component.scss'],
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
export class LifePolicyIssueUwComponent {

  @ViewChild('stepper') stepper: MatStepper;

  // Variables
  pagetitle: string = '';
  isExpand: boolean = false;
  mode: string = '';
  InsuranceCompany: string = '';
  IsPOSPUser: boolean = false;
  ProposerName: string;

  DisplayForm: any;

  //Form Group 
  LifePIUWForm: FormGroup;

  // Alerts Array
  PolicyIssueDetailsAlert: Alert[] = [];
  detailsFieldsList: any[] // A list of Insured person Questionary

  //Form Controls
  PolicyIssueDetailsStepCtrl = new FormControl();

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  //Enums
  SubCategoryCodeEnum = SubCategoryCodeEnum;


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
    private _datePipe: DatePipe,
    private authService: AuthService,
    private _dialogService: DialogService,
    private _MasterListService: MasterListService,
    private _rfqLifeService: RfqLifeService,
    private _Location: Location,
  ) {
    // Get Inssuerd Person Questionary list
    this.detailsFieldsList = this._rfqLifeService.getdetailsFieldsList()

    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == "Agent") {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }
  }
  // #endregion constructor

  // #region Getters

  // Get Documents Formarray
  get Documents() {
    return this.LifePIUWForm.controls["Documents"] as FormArray;
  }

  get PolicyDoc() {
    let Index = this.Documents.value.findIndex(ele => ele.DocumentType == 'Policy')
    if (Index != -1) {
      return this.Documents.controls[Index].value;
    } else {
      return "";
    }
  }

  get DisplayedLifePremiumInstallmentType() {
    return DisplayedLifePremiumInstallmentType;
  }

  //Get Gross Premium for only Buy=true
  get getGrossPremium() {
    return this.DisplayForm.QNDocuments.find((f) => f.Buy == true)?.GrossPremium
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

    if (this.DisplayForm.QNDocuments.length > 0) {
      this.DisplayForm.QNDocuments.forEach((el) => {
        if (el.Buy == true) {
          this.InsuranceCompany = el.InsuranceCompanyName;
        }
      });
    }


    // Init Form
    this.LifePIUWForm = this._initForm(this.DisplayForm);

    // On form changes
    this._onFormChange();
    if (this.mode == 'view') {
      this.LifePIUWForm.disable()
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
    if (this.LifePIUWForm.get('SendBackRejectDesc').value == "" || this.LifePIUWForm.get('SendBackRejectDesc').value == null) {
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
          this._rfqLifeService.Reject(this.LifePIUWForm.value).subscribe((res) => {
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
    if (this.LifePIUWForm.get('SendBackRejectDesc').value == "" || this.LifePIUWForm.get('SendBackRejectDesc').value == null) {
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
          this._rfqLifeService.SendBack(this.LifePIUWForm.value).subscribe((res) => {
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

    this._dateFormat()
    if (this.PolicyIssueDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.PolicyIssueDetailsAlert);
      return;
    }

    this._rfqLifeService.SubmitPolicyIssue(this.LifePIUWForm.value).subscribe(res => {
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
            this.LifePIUWForm.get('PolicyIssueDetail').patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.DisplayForm.Stage,
              DocumentType: 'Policy',
            })
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

  public PolicyIssueDetailsValidation() {
    this.PolicyIssueDetailsAlert = []

    if (!this.LifePIUWForm.get('PolicyIssueDate').value) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy Issue Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (this._datePipe.transform(this.LifePIUWForm.get('PolicyIssueDate').value, 'yyyy-MM-dd') <
        this._datePipe.transform(this.DisplayForm.ProposalSubmissionDate, 'yyyy-MM-dd')) {
        this.PolicyIssueDetailsAlert.push({
          Message: `Policy Issue Date cannot be before Proposal Submission Date.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }
    if (!this.LifePIUWForm.get('PolicyStartDate').value) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy Start Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (this._datePipe.transform(this.LifePIUWForm.get('PolicyStartDate').value, 'yyyy-MM-dd') <
        this._datePipe.transform(this.LifePIUWForm.get('PolicyIssueDate').value, 'yyyy-MM-dd')) {
        this.PolicyIssueDetailsAlert.push({
          Message: `Policy Start Date cannot be before Policy Issue Date.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }


    if (!this.LifePIUWForm.get('PolicyEndDate').value) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy End Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (this.LifePIUWForm.get('PolicyStartDate').value > this.LifePIUWForm.get('PolicyEndDate').value) {
        this.PolicyIssueDetailsAlert.push({
          Message: 'Enter valid Policy EndDate.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }



    if (!this.LifePIUWForm.get('PolicyNo').value) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy No is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }
    if (!this.LifePIUWForm.get('PolicyIssueDetail').value.StorageFilePath) {
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
  private _initForm(data: ILifePolicyIssueDto) {
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

    if (data) {
      fg.patchValue(data);
    }

    return fg;
  }

  // Documents Formarray
  private _buildDocumentsForm(items: ILifeDocumentsDto[] = []): FormArray {
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
  private _initDocumentsForm(item: ILifeDocumentsDto): FormGroup {

    let dF = this.fb.group({
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
    })

    if (item != null) {
      if (!item) {
        item = new LifeDocumentsDto();
      }
      if (item) {
        dF.patchValue(item);
      }
    }

    return dF
  }

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }


  private _dateFormat() {
    this.LifePIUWForm.patchValue({
      PolicyIssueDate: this._datePipe.transform(this.LifePIUWForm.get('PolicyIssueDate').value, 'yyyy-MM-dd'),
      PolicyStartDate: this._datePipe.transform(this.LifePIUWForm.get('PolicyStartDate').value, 'yyyy-MM-dd'),
      PolicyEndDate: this._datePipe.transform(this.LifePIUWForm.get('PolicyEndDate').value, 'yyyy-MM-dd'),

    })
  }

  private _onFormChange() {

    this.LifePIUWForm.get('PolicyStartDate').valueChanges.subscribe(val => {

      if (val) {
        let StartDate = this._datePipe.transform(this.LifePIUWForm.get('PolicyStartDate').value, 'yyyy-MM-dd');
        let endDate = new Date(StartDate);
        endDate.setFullYear(endDate.getFullYear() + 1); // add year
        endDate.setDate(endDate.getDate() - 1);  // one day les
        this.LifePIUWForm.get('PolicyEndDate').patchValue(endDate);
      }

    })

  }


  //#endregion private-methods

}
