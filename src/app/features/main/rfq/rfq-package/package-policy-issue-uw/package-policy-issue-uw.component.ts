import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { IPackagePrePolicyDTO, IPackageSuminnsuredQuestionDTO, IRFQPackageNomineeDetailDto, PackagePrePolicyDTO, RFQPackageDocumentsDto, RFQPackageNomineeDetailDto } from '@models/dtos';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { SubCategoryCodeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { RfqPackageService } from '../rfq-package.service';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert } from '@models/common';
import { AuthService } from '@services/auth/auth.service';


@Component({
  selector: 'gnx-package-policy-issue-uw',
  templateUrl: './package-policy-issue-uw.component.html',
  styleUrls: ['./package-policy-issue-uw.component.scss'],
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
export class PackagePolicyIssueUwComponent {


  //#region public properties
  @ViewChild('stepper') public stepper: MatStepper;

  // Variables
  public pagetitle: string = '';
  public mode: string = '';
  public insuranceCompany: string = '';
  public grossPremium: number = 0;
  public isExpand: boolean = false;
  public isPOSPUser: boolean = false;
  public displayForm: any;
  public jewellersBlockPoliciesSumInsuredDetails: any;
  public policyIssueForm: FormGroup;


  //#endregion



  //#region private properties
  private _policyIssueDetailsAlert: Alert[] = [];
  private _policyIssueDetailsStepCtrl = new FormControl();
  private _uploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API
  //#endregion


  //#region Constructor
  constructor(
    private _fb: FormBuilder,
    private _alertservice: AlertsService,
    private _dialog: MatDialog,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _datePipe: DatePipe,
    private _authService: AuthService,
    private _dialogService: DialogService,
    private _rfqPackageService: RfqPackageService,
    private _cdr: ChangeDetectorRef,
    private _location: Location,
  ) {
    this.jewellersBlockPoliciesSumInsuredDetails = this._rfqPackageService.DisplaySumInsuredDetailsJewellersBlockPolicies()
  }
  //#endregion constructor

  // #region Getters

  //Get Gross Premium for only Buy=true
  public get getGrossPremium(): number {
    return this.displayForm.QNDocuments.find((f) => f.Buy == true)?.GrossPremium
  }

  public get subCategoryCodeEnum(): any {
    return SubCategoryCodeEnum
  }

  public get CanDisplayContentDetail(): boolean {

    if (this.displayForm.SubCategoryCode == SubCategoryCodeEnum.HouseHolder &&
      (this.displayForm?.SumInsuredDetail.BreakdownDomesticAppliances || this.displayForm?.SumInsuredDetail.ElectricleOrElectronic)) {
      return true;
    }

    else if (this.displayForm.SubCategoryCode == SubCategoryCodeEnum.JewellersBlockPolicies &&
      (this.displayForm?.SumInsuredDetail.MachineryBreakdown ||
        this.displayForm?.SumInsuredDetail.ElectricleOrElectronic ||
        this.displayForm?.SumInsuredDetail.PortableEquipmentCover)) {
      return true;
    }

    else if (this.displayForm.SubCategoryCode == SubCategoryCodeEnum.OfficePack &&
      (this.displayForm?.SumInsuredDetail.MachineryBreakdown ||
        this.displayForm?.SumInsuredDetail.ElectricleOrElectronic ||
        this.displayForm?.SumInsuredDetail.PortableEquipmentCover)) {
      return true;
    }

    else if (this.displayForm.SubCategoryCode == SubCategoryCodeEnum.Shopkeepers &&
      (this.displayForm?.SumInsuredDetail.MachineryBreakdown ||
        this.displayForm?.SumInsuredDetail.ElectricleOrElectronic)) {
      return true;
    }

    else {
      return false;
    }
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

    this.displayForm = data['data'];

    /**
* When No one PrevPolicyDetail Found Then Add one object in PrevPolicyDetail details TO display Blank field
*/
    if (!this.displayForm.PrevPolicyDetail || this.displayForm.PrevPolicyDetail?.length == 0) {
      let row: IPackagePrePolicyDTO = new PackagePrePolicyDTO()
      row.RFQId = this.displayForm.Id
      this.displayForm.PrevPolicyDetail.push(row)
    }


    /**
* When No one Nominne Found Then Add one object in nominee details TO display Blank field
*/
    if (!this.displayForm.NomineeDetails || this.displayForm.NomineeDetails?.length == 0) {
      let Nominee: IRFQPackageNomineeDetailDto = new RFQPackageNomineeDetailDto()
      Nominee.RFQId = this.displayForm.Id
      this.displayForm.NomineeDetails.push(Nominee)
    }


    if (this.displayForm.QNDocuments.length > 0) {
      this.displayForm.QNDocuments.forEach((el) => {
        if (el.Buy == true) {
          this.insuranceCompany = el.InsuranceCompanyName;
          this.grossPremium = el.GrossPremium;
        }
      });
    }

    if (this.displayForm.LoadingPremium) {
      this.displayForm.PaymentDetails = this.displayForm.LoadingPaymentDetails
    }
    else {
      this.displayForm.PaymentDetails = this.displayForm.PaymentDetails
    }

    // build Engineering form
    this.policyIssueForm = this._buildForm(this.displayForm);



    // get User type from user profile
    if (this._authService._userProfile.value?.UserType == UserTypeEnum.Agent || this._authService._userProfile.value?.UserType == UserTypeEnum.TeamReference) {
      this.isPOSPUser = true;
    }
    else {
      this.isPOSPUser = false;
    }

    // On form changes
    this._onFormChange();

    if (this.mode == 'view') {
      this.policyIssueForm.disable()
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

    if (this.displayForm.PolicyType == 'Rollover' || this.displayForm.PolicyType == 'Renewal-Change Company' || this.displayForm.PolicyType == 'Renewal-Same Company') {
      this.stepper.next();
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
  public backButton(): void {
    this._location.back();
  }

  // Reject Button
  public rejectButton(): void {
    if (this.policyIssueForm.get('SendBackRejectDesc').value == "" || this.policyIssueForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.policyIssueForm.value.Id;
          SendBackRejectObj.Stage = this.policyIssueForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.policyIssueForm.value.SendBackRejectDesc;

          this._rfqPackageService.reject(SendBackRejectObj).subscribe((res) => {
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
  public sendBackButton(): void {
    if (this.policyIssueForm.get('SendBackRejectDesc').value == "" || this.policyIssueForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.policyIssueForm.value.Id;
          SendBackRejectObj.Stage = this.policyIssueForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.policyIssueForm.value.SendBackRejectDesc;

          this._rfqPackageService.sendBack(SendBackRejectObj).subscribe((res) => {
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

  public submitForm(): void {
    this._dateFormat()
    if (this._policyIssueDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this._policyIssueDetailsAlert);
      return;
    }

    this._rfqPackageService.submitPolicyIssue(this.policyIssueForm.value).subscribe(res => {
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

  public expandCollaps(): void {
    this.isExpand = !this.isExpand;
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
            this.policyIssueForm.get('PolicyIssueDetail').patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.displayForm.Stage,
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
  public viewDocument(fileName: string): void {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  public policyIssueDetailsValidation(): FormControl {
    this._policyIssueDetailsAlert = []

    if (!this.policyIssueForm.get('PolicyIssueDate').value) {
      this._policyIssueDetailsAlert.push({
        Message: `Policy Issue Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (this._datePipe.transform(this.policyIssueForm.get('PolicyIssueDate').value, 'yyyy-MM-dd') <
        this._datePipe.transform(this.displayForm.ProposalSubmissionDate, 'yyyy-MM-dd')) {
        this._policyIssueDetailsAlert.push({
          Message: `Policy Issue Date cannot be before Proposal Submission Date.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }
    if (!this.policyIssueForm.get('PolicyStartDate').value) {
      this._policyIssueDetailsAlert.push({
        Message: `Policy Start Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (this._datePipe.transform(this.policyIssueForm.get('PolicyStartDate').value, 'yyyy-MM-dd') <
        this._datePipe.transform(this.policyIssueForm.get('PolicyIssueDate').value, 'yyyy-MM-dd')) {
        this._policyIssueDetailsAlert.push({
          Message: `Policy Start Date cannot be before Policy Issue Date.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (!this.policyIssueForm.get('PolicyEndDate').value) {
      this._policyIssueDetailsAlert.push({
        Message: `Policy End Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (this.policyIssueForm.get('PolicyStartDate').value > this.policyIssueForm.get('PolicyEndDate').value) {
        this._policyIssueDetailsAlert.push({
          Message: 'Enter valid Policy EndDate.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (!this.policyIssueForm.get('PolicyNo').value) {
      this._policyIssueDetailsAlert.push({
        Message: `Policy No is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.policyIssueForm.get('PolicyIssueDetail').value.StorageFilePath) {
      this._policyIssueDetailsAlert.push({
        Message: `Policy Document Attachment is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this._policyIssueDetailsAlert.length > 0) {
      this._policyIssueDetailsStepCtrl.setErrors({ required: true });
      return this._policyIssueDetailsStepCtrl;
    }
    else {
      this._policyIssueDetailsStepCtrl.reset();
      return this._policyIssueDetailsStepCtrl;
    }

  }

  public filterDisplaySumInsuredDetails(): IPackageSuminnsuredQuestionDTO[] {
    let SubCategoryWiseDisplaySumInsuredDetails = this._rfqPackageService.DisplaySumInsuredDetailsForSingleColumn(this.displayForm.SubCategoryCode)
    return SubCategoryWiseDisplaySumInsuredDetails
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build Main Form
  private _buildForm(data: any): FormGroup {

    let fg = this._fb.group({
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
  private _buildDocumentsForm(items: RFQPackageDocumentsDto[] = []): FormArray {
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
  private _initDocumentsForm(item: RFQPackageDocumentsDto): FormGroup {

    let dF = this._fb.group({
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
        item = new RFQPackageDocumentsDto();
      }
      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }

  private _dateFormat(): void {
    this.policyIssueForm.patchValue({
      PolicyIssueDate: this._datePipe.transform(this.policyIssueForm.get('PolicyIssueDate').value, 'yyyy-MM-dd'),
      PolicyStartDate: this._datePipe.transform(this.policyIssueForm.get('PolicyStartDate').value, 'yyyy-MM-dd'),
      PolicyEndDate: this._datePipe.transform(this.policyIssueForm.get('PolicyEndDate').value, 'yyyy-MM-dd'),
    })
  }

  private _onFormChange(): void {
    this.policyIssueForm.get('PolicyStartDate').valueChanges.subscribe(val => {
      if (val) {
        let StartDate = this._datePipe.transform(this.policyIssueForm.get('PolicyStartDate').value, 'yyyy-MM-dd');
        let endDate = new Date(StartDate);
        endDate.setFullYear(endDate.getFullYear() + 1); // add year
        endDate.setDate(endDate.getDate() - 1); // add year
        this.policyIssueForm.get('PolicyEndDate').patchValue(endDate);
      }
    })

  }
  //#endregion private-methods

}
