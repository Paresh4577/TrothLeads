import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { MatStepper } from '@angular/material/stepper';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Alert } from '@models/common';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '@lib/services/http/http.service';
import { AuthService } from '@services/auth/auth.service';
import { DialogService } from '@lib/services/dialog.service';
import { RfqWcService } from '../../rfq-wc/rfq-wc.service';
import { RfqService } from '../../rfq.service';
import { RfqFireService } from '../rfq-fire.service';
import { DisplayedPolicyPreriod } from '@config/rfq';
import { UserTypeEnum } from 'src/app/shared/enums';
import { ROUTING_PATH } from '@config/routingPath.config';
import { environment } from 'src/environments/environment';
import { IFireDocumentsDto, IFirePolicyIssueDto } from '@models/dtos';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';


@Component({
  selector: 'gnx-fire-policy-issue-uw',
  templateUrl: './fire-policy-issue-uw.component.html',
  styleUrls: ['./fire-policy-issue-uw.component.scss'],
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
export class FirePolicyIssueUwComponent {

  @ViewChild('stepper') stepper: MatStepper;

  // Variables
  pagetitle: string = '';
  isExpand: boolean = false;
  IsPOSorReamRefPUser: boolean = false;
  mode: string = '';
  InsuranceCompany: string = '';

  DisplayForm: any;
  AdditionalDetailFireAndFirePackage: any;
  FirePackageSumInsuredDetails: any;
  minPolicyStartDate = new Date()

  //Form Group 
  PolicyIssueForm: FormGroup;

  // Alerts Array
  PolicyIssueDetailsAlert: Alert[] = [];

  //Form Controls
  PolicyIssueDetailsStepCtrl = new FormControl();

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
    private _datePipe: DatePipe,
    private authService: AuthService,
    private _dialogService: DialogService,
    private _RfqFireService: RfqFireService,
    private _rfqService: RfqService,
    private _Location: Location,
  ) {
    this.FirePackageSumInsuredDetails = this._RfqFireService.DisplaySumInsuredDetailsFirePackage()
  }
  // #endregion constructor

  // #region Getters

  // Get Documents Formarray
  get Documents() {
    return this.PolicyIssueForm.controls["Documents"] as FormArray;
  }


  //Get Gross Premium for only Buy=true
  get getGrossPremium() {
    return this.DisplayForm.QNDocuments.find((f) => f.Buy == true)?.GrossPremium
  }

  get DisplayedPolicyPreriod() {
    return DisplayedPolicyPreriod
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

    this.minPolicyStartDate = this.DisplayForm.ProposalSubmissionDate

    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == UserTypeEnum.Agent || this.authService._userProfile.value?.UserType == UserTypeEnum.TeamReference) {
      this.IsPOSorReamRefPUser = true;
    }
    else {
      this.IsPOSorReamRefPUser = false;
    }

    if (this.DisplayForm.QNDocuments.length > 0) {
      this.DisplayForm.QNDocuments.forEach((el) => {
        if (el.Buy == true) {
          this.InsuranceCompany = el.InsuranceCompanyShortName;
        }
      });
    }

    // Init Form
    this.PolicyIssueForm = this._initForm(this.DisplayForm);

    // On form changes
    this._onFormChange();

    this.AdditionalDetailFireAndFirePackage = this._RfqFireService.AdditionalDetailFireAndFirePackage()

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

          this._rfqService.Reject(SendBackRejectObj).subscribe((res) => {
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

          this._rfqService.SendBack(SendBackRejectObj).subscribe((res) => {
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

    this._RfqFireService.SubmitPolicyIssue(this.PolicyIssueForm.value).subscribe(res => {
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
            this.PolicyIssueForm.get('PolicyIssueDetail').patchValue({
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

  // Init Form
  private _initForm(data: IFirePolicyIssueDto) {
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
  private _buildDocumentsForm(items: IFireDocumentsDto[] = []): FormArray {
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
  private _initDocumentsForm(item: IFireDocumentsDto): FormGroup {

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


    if (item) {
      dF.patchValue(item);
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
        endDate.setDate(endDate.getDate() - 1);  // one day les
        this.PolicyIssueForm.get('PolicyEndDate').patchValue(endDate);
      }

    })

  }


  //#endregion private-methods

}
