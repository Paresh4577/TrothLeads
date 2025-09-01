import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { IPolicyIssueDocumentDto, PolicyIssueDocumentDto, PolicyPersonsDto } from '@models/dtos/config/RFQHealth';
import { HealthProductType } from 'src/app/shared/enums/HealthProductType.enum';
import { PolicyIssueInfoService } from './policy-issue-info.service';
import { Alert, IFilterRule, OrderBySpecs } from '@models/common';
import { ROUTING_PATH } from '@config/routingPath.config';
import { HealthCategoryType, HealthPolicyType } from 'src/app/shared/enums/rfq-health';
import { DisplayedPolicyType } from '@config/transaction-entry/transactionPolicyType.config';
import { CategoryTypeList, PolicyTenureList } from '@config/rfq';
import { QNDocumentDto } from '@models/dtos/config/RFQHealth/quotation-note';
import { CategoryCodeEnum, SubCategoryCodeEnum } from 'src/app/shared/enums';
import { MasterListService } from '@lib/services/master-list.service';
import { dropdown } from '@config/dropdown.config';
import { RFQHealthService } from '../rfq-health/rfqhealth.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RFQExistingIllnessDetailsComponent } from '../rfqexisting-illness-details/rfqexisting-illness-details.component';
import { DialogService } from '@lib/services/dialog.service';
import { AuthService } from '@services/auth/auth.service';
import { ILoadingPaymentDetailsDto, ILoadingPaymentDocumentDto } from '@models/dtos/config/RFQHealth/loading-payment-proof.dto';
import { environment } from 'src/environments/environment';
import { MatStepper } from '@angular/material/stepper';
import { DatePipe, Location } from '@angular/common';
import { QuotationBySalesPersonService } from '../quotation-by-sales-person/quotation-by-sales-person.service';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-policy-issue-info',
  templateUrl: './policy-issue-info.component.html',
  styleUrls: ['./policy-issue-info.component.scss'],
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
export class PolicyIssueInfoComponent {
  @ViewChild('stepper') stepper: MatStepper;

  pagetitle: string;
  mode: string; // for identify of Raise page is create or edit or view
  UploadFileAPI: string = API_ENDPOINTS.Attachment.Upload;
  DropdownMaster: dropdown; // Dropdown Master Data
  SelfGender: string; // store gender 
  ProposerName: string;
  myMembers; // store selected member icon path
  allMemberCard; // to store display Member icon in card
  PolicyPersonsArray // store insured person details
  maxBirthDate: Date; // Max birthdate validation
  SubCategoryList = []; // Store Product sub category list
  GrossPremium: number = 0; // for display purpose use this variable
  InsuranceCompany: string = ""; // for display purpose use this variable
  isExpand: boolean = false;
  DisplayForm: any;
  detailsFieldsList: any[] // A list of Insured person Questionary
  

  // Boolean
  IsPOSPUser: boolean = false;

  PolicyIssueForm: FormGroup; // Policy Issue Form

  // #endregion public variables

  /**
   * #region constructor
   * @param _fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   */

  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _PolicyIssueInfoService: PolicyIssueInfoService,
    private _MasterListService: MasterListService,
    private _RFQService: RFQHealthService,
    public _dialog: MatDialog,
    private _dialogService: DialogService,
    private _authService: AuthService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
    private _datePipe: DatePipe,
    private _quotationBySalesPersonService: QuotationBySalesPersonService,
  ) {

    this.DropdownMaster = new dropdown();
    // Set max birthdate is before three month of current date
    this.maxBirthDate = new Date(Date.now());
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);
    this.SelfGender = 'Male';
    this._fillMasterList();
    this.allMemberCard = this._RFQService.memberCardArray()

    // Get Inssuerd Person Questionary list
    this.detailsFieldsList = this._quotationBySalesPersonService.getdetailsFieldsList()
  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    //Route Data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title']
    this.mode = data['mode']
    this.DisplayForm = data['data'];
    data['data'].QNDocuments = data['data'].QNDocuments.filter((el) => el.Buy == true)

    let FormData = data['data'];


    if (FormData.LoadingPremium) {
      FormData.PaymentDetails = FormData.LoadingPaymentDetails
    }
    else {
      FormData.PaymentDetails = FormData.PaymentDetails
    }

    // Init Form Group
    this.PolicyIssueForm = this._initForm(FormData)

    var QNData = data['data'];
    if (QNData.QNDocuments.length > 0) {
      QNData.QNDocuments.forEach((el) => {
        if (el.Buy == true) {
          this.GrossPremium = el.GrossPremium;
          this.InsuranceCompany = el.InsuranceCompanyShortName;
        }
      });
    }

    this._onFormChange();

    // get User type from user profile
    if (this._authService._userProfile.value?.UserType == "Agent") {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }

    this.myMembers = [];
    // Policy Person Form Array
    this.PolicyPersonsArray = this.PolicyIssueForm.get('Members') as FormArray;
    this.memberDispalyDetails(this.PolicyIssueForm.get('Members').value)
    this._genderOfSelfSpouseInArray()
    this.PolicyIssueForm.get('LoadingPremiumAmountPaidBy').disable();

    if (this.mode == 'view') {
      this.PolicyIssueForm.disable();
    }
    this.ProposerName = this.PolicyPersonsArray?.value[0]?.Name;

  }

  ngAfterViewInit(): void {
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();

    if (this.DisplayForm.PolicyType == HealthPolicyType.Rollover || this.DisplayForm.PolicyType == 'Renewal-Change Company' || this.DisplayForm.PolicyType == 'Renewal-Same Company') {
      this.stepper.next();
    }

    // if (this.PolicyIssueForm.get('LoadingPremium').value == true) {
    this.stepper.next();
    // }
    this.stepper.next();
    this._cdr.detectChanges();
  }

  //#endregion lifecyclehooks

  //#region public-getters

  get f() {
    return this.PolicyIssueForm.controls;
  }

  // Get Policy Type From Config file
  get PolicyTypeList() {
    if (this.DisplayForm?.TransactionId) {
      return DisplayedPolicyType.rfqHealthRenewalPolicyType
    }
    else {
      return DisplayedPolicyType.rfqHealthPolicyType
    }
  }

  // Get Category Type List From Config file
  get CategoryTypeList() {
    return CategoryTypeList
  }

  // Get Policy Tenure List From Config file
  get PolicyTenureList() {
    return PolicyTenureList
  }

  // Get Health SubCategory From Config file
  get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum
  }

  // Get Health Product Type From Config file
  public get HealthProductTypeEnum() {
    return HealthProductType
  }

  // Get Health Policy Type From Config file
  public get HealthPolicyType() {
    return HealthPolicyType
  }

  // Get Health Category Type From Config file
  public get HealthCategoryType() {
    return HealthCategoryType
  }

  // Get Quotation Document From Policy 
  get QNDocuments() {
    return this.PolicyIssueForm.get('QNDocuments') as FormArray
  }

  // Get Documents Document From Policy 
  get inf() {
    return this.PolicyIssueForm.get('Documents') as FormArray;
  }

  // get payment details from Policy Form
  get Payments() {
    return this.PolicyIssueForm.get('PaymentDetails') as FormArray
  }


  //#endregion public-getters

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Policy Issue Document Upload
   * @param event 
   */

  public documentUpload(event) {
    if (event.target.files[0]) {
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

              if (!this.inf.value.length) {
                var newPolicyFormDoc: IPolicyIssueDocumentDto = new PolicyIssueDocumentDto()

                newPolicyFormDoc.Id = this.PolicyIssueForm.get("Id").value;
                newPolicyFormDoc.DocumentType = res.Data.DocumentType;
                newPolicyFormDoc.StorageFileName = res.Data.StorageFileName;
                newPolicyFormDoc.StorageFilePath = res.Data.StorageFilePath;
                newPolicyFormDoc.Stage = "RFQPolicyIssueUW";

                this.inf.push(this._initDocumentForm(newPolicyFormDoc))

              } else {
                this.inf.controls[0].patchValue({
                  PolicyId: this.PolicyIssueForm.get("Id").value,
                  DocumentType: res.Data.DocumentType,
                  FileName: res.Data.FileName,
                  StorageFileName: res.Data.StorageFileName,
                  StorageFilePath: res.Data.StorageFilePath,
                  Stage: "RFQPolicyIssueUW",
                })

              }

            }
            else {
              this._alertservice.raiseErrors(res.Alerts);
            }
          });
      }
    }
  }

  /**
   * 
   * Submit Policy Inssue
   */
  public SubmitPolicyIssue() {

    let Error: Alert[] = this._FinalStep()
    if (Error.length > 0) {
      this._alertservice.raiseErrors(Error)
      return
    }

    this._dateFormat()
    this._PolicyIssueInfoService.SubmitPolicyIssue(this.PolicyIssueForm.value).subscribe(res => {
      if (res.Success) {
        // this._router.navigate([ROUTING_PATH.RFQ.TransactionEntryPending + this.RfqHealthQuotationData.Id])
        this._router.navigate([ROUTING_PATH.Basic.Dashboard])
      } else {
        if (res.Alerts && res.Alerts?.length > 0) {
          this._alertservice.raiseErrors(res.Alerts)
        } else {
          this._alertservice.raiseErrorAlert(res.Message)
        }
      }
    })

  }

  // popUp for Illness (cannot be modified. Selected Illness form RFQ health will be viewed.)
  public openDiolog(indexNumber: number, detailkey: string, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      title: title,
      ispopup: true,
      disable: true,
      ExistingIllness: this.PolicyPersonsArray.at(indexNumber).get(detailkey).value,
    };
    const dialogRef = this._dialog.open(
      RFQExistingIllnessDetailsComponent,
      dialogConfig
    );

  }

  // adding members in myMember array
  public members() {

    this.myMembers = [];
    if (
      this.PolicyIssueForm.get('SelfCoverRequired').value == true &&
      this.PolicyIssueForm.get('SelfGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Self' });
    }
    if (
      this.PolicyIssueForm.get('SelfCoverRequired').value == true &&
      this.PolicyIssueForm.get('SelfGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Self' });
    }
    if (
      this.PolicyIssueForm.get('SpouseCoverRequired').value == true &&
      this.PolicyIssueForm.get('SpouseGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Spouse' });
    }
    if (
      this.PolicyIssueForm.get('SpouseCoverRequired').value == true &&
      this.PolicyIssueForm.get('SpouseGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Spouse' });
    }
    if (
      this.PolicyIssueForm.get('DaughterCoverRequired').value == true &&
      this.PolicyIssueForm.get('noOfDaughter').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter' });
    }
    if (
      this.PolicyIssueForm.get('DaughterCoverRequired').value == true &&
      this.PolicyIssueForm.get('noOfDaughter').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter1' });
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter2' });
    }
    if (
      this.PolicyIssueForm.get('DaughterCoverRequired').value == true &&
      this.PolicyIssueForm.get('noOfDaughter').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter3' });
    }

    if (
      this.PolicyIssueForm.get('SonCoverRequired').value == true &&
      this.PolicyIssueForm.get('noOfSon').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son' });
    }
    if (
      this.PolicyIssueForm.get('SonCoverRequired').value == true &&
      this.PolicyIssueForm.get('noOfSon').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son1' });
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son2' });
    }
    if (
      this.PolicyIssueForm.get('SonCoverRequired').value == true &&
      this.PolicyIssueForm.get('noOfSon').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son3' });
    }
    if (this.PolicyIssueForm.get('MotherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/mother.png', title: 'Mother' });
    }
    if (this.PolicyIssueForm.get('FatherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/father.png', title: 'Father' });
    }

  }

  // insured members data from RFQ health form
  public SetCover(member: string, answer) {
    let Answer = answer
    this.PolicyIssueForm.patchValue({
      [member + 'CoverRequired']: Answer,
    });
    this._countDaughterSon(member)
    this.members()
  }


  // view attached file 
  public ViewQnDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  // click on "Back to List Page" button then redirect last page
  public BackToListPage() {
    this._Location.back();
  }


  // validate the form and submit it
  public SubmitPaymentProof() {
    this._DateFormat();

    this._PolicyIssueInfoService.SubmitPolicyIssue(this.PolicyIssueForm.value).subscribe(res => {
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
    })
  }

  // Reject Payment Proof Form
  public RejectForm() {

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

          this._PolicyIssueInfoService.Reject(this.PolicyIssueForm.value).subscribe((res) => {
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

  // Send back Payment Proof Form
  public SendBackForm() {

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

          this._PolicyIssueInfoService.SendBack(this.PolicyIssueForm.value).subscribe((res) => {
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
  }


  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }


  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  // Payment Proof Form All date Formate Change
  private _DateFormat() {

    // ChequeDate: this._datePipe.transform(element.get('ChequeDate').value, 'yyyy-MM-dd'),

  }

  // update gender of self and spouse in allMemberCard array
  private _genderOfSelfSpouseInArray() {
    let female = '/assets/icons/woman.png'
    let male = '/assets/icons/male.png'
    if (this.PolicyIssueForm.get('SelfGender').value == 'Male') {
      this.allMemberCard[0].member = male
      this.allMemberCard[0].gender = 'Male'
      this.allMemberCard[1].gender = 'Female'
      this.allMemberCard[1].member = female
    }
    else {
      this.allMemberCard[1].member = male
      this.allMemberCard[0].member = female
      this.allMemberCard[1].gender = 'Male'
      this.allMemberCard[0].gender = 'Female'
    }
  }

  // member deatils from RFQ Health form
  private memberDispalyDetails(member) {

    member.forEach((element, index) => {
      this.SetCover(element.Relation, true)
      if (element.Relation == 'Self') {
        this.SelfGender = element.Gender
        this._genderofSelfAndSpouse(element.Gender)
      }
    })
  }

  // counting number of Son and Daughter
  private _countDaughterSon(child) {
    if (child == 'Daughter') {
      this.PolicyIssueForm.patchValue({
        noOfDaughter: this.PolicyIssueForm.get('noOfDaughter').value + 1
      })
    }

    if (child == 'Son') {
      this.PolicyIssueForm.patchValue({
        noOfSon: this.PolicyIssueForm.get('noOfSon').value + 1
      })
    }
  }

  // update gender of Self and spouse in HealthQuateForm
  private _genderofSelfAndSpouse(choice) {
    this.SelfGender = choice;
    this.PolicyIssueForm.patchValue({
      SelfGender: this.SelfGender,
    });

    if (this.PolicyIssueForm.get('SelfGender').value == 'Male') {
      this.PolicyIssueForm.patchValue({
        SpouseGender: 'Female',
      });
    } else {
      this.PolicyIssueForm.patchValue({
        SpouseGender: 'Male',
      });
    }
    this._genderOfSelfSpouseInArray()
    this.members()
  }

  // check validation for the last step
  private _FinalStep() {
    let alerts: Alert[] = []

    if (this.PolicyIssueForm.get('PolicyIssueDate').invalid) {
      if (this.PolicyIssueForm.get('PolicyIssueDate').value) {
        alerts.push({
          Message: 'Enter valid Policy Issue Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        alerts.push({
          Message: 'Enter Policy Issue Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.PolicyIssueForm.get('PolicyStartDate').invalid) {
      if (this.PolicyIssueForm.get('PolicyStartDate').value) {
        alerts.push({
          Message: 'Enter valid Policy Start Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        alerts.push({
          Message: 'Enter Policy Start Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.PolicyIssueForm.get('PolicyEndDate').invalid) {
      if (this.PolicyIssueForm.get('PolicyEndDate').value) {
        alerts.push({
          Message: 'Enter valid Policy End Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        alerts.push({
          Message: 'Enter Policy End Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.PolicyIssueForm.get('PolicyStartDate').value != "" && this.PolicyIssueForm.get('PolicyStartDate').value != null && this.PolicyIssueForm.get('PolicyEndDate').value != "" && this.PolicyIssueForm.get('PolicyEndDate').value != null) {

      var startDate = this.PolicyIssueForm.get('PolicyStartDate').value;
      var endDate = this.PolicyIssueForm.get('PolicyEndDate').value;

      if ((Date.parse(endDate) <= Date.parse(startDate))) {
        alerts.push({
          Message: 'Policy End Date should be greater than Policy Start Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.PolicyIssueForm.get('PolicyNo').value == "" || this.PolicyIssueForm.get('PolicyNo').value == null) {
      alerts.push({
        Message: 'Enter Policy No',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.PolicyIssueForm.value.PolicyIssueDetail.StorageFilePath == "" || this.PolicyIssueForm.value.PolicyIssueDetail.StorageFilePath == null) {
      alerts.push({
        Message: 'Attach Policy Document',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    return alerts
  }

  // fill master data
  private _fillMasterList() {

    // fill Product Type
    let SubCategoryRule: IFilterRule[] = [ActiveMasterDataRule,
      {
        Field: "Category.Code",
        Operator: "eq",
        Value: CategoryCodeEnum.Health
      }
    ]

    let OrderBySpecs: OrderBySpecs[] = [
      {
        field: "SrNo",
        direction: "asc"
      }
    ]

    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.SubCategory.List, 'Name', '', SubCategoryRule, [], OrderBySpecs)
      .subscribe(res => {
        if (res.Success) {
          this.SubCategoryList = res.Data.Items
        }
      });

  }

  private _onFormChange() {
    this.PolicyIssueForm.get('PolicyStartDate').valueChanges.subscribe(val => {

      if (val != "" && val != null) {
        let startDate = this._datePipe.transform(val, 'yyyy-MM-dd');
        let PolicyEndDate = new Date(startDate);

        PolicyEndDate.setFullYear(PolicyEndDate.getFullYear() + this.PolicyIssueForm.get('PolicyPeriod').value) // set year
        PolicyEndDate.setDate(PolicyEndDate.getDate() - 1);  // one day les

        this.PolicyIssueForm.get('PolicyEndDate').patchValue(PolicyEndDate);
      }
    });
  }

  // Policy Issue Form
  private _initForm(data): FormGroup {

    let PolicyIssueForm = this.fb.group({
      // RFQ details
      Id: [0],
      QNNo: [],
      QNDate: [],
      RFQNo: [],
      RFQDate: [],

      // [2] Basic details
      SubCategoryId: [0],
      SubCategoryName: [''],
      SubCategoryCode: [''],
      PolicyType: [''],
      CategoryType: [''],
      PolicyPeriod: [0],
      QNDocuments: this._buildQNDocuments(data?.QNDocuments),


      // Product  Category details
      SumInsured: [0],
      OtherSumInsured: [0],
      Deductible: [0],
      PincodeId: [],
      Pincode: [''],
      ProposerMobileNo: [''],
      ProposerEmail: [''],

      // Product  Category details >>> [0.1] >>> Details of Proposed Insured & Family (if applicable)
      Members: this._buildPolicyPersonForm(data.Members),
      SelfCoverRequired: [false],
      SpouseCoverRequired: [false],
      DaughterCoverRequired: [false],
      MotherCoverRequired: [false],
      FatherCoverRequired: [false],
      noOfDaughter: [],
      noOfSon: [],
      SelfGender: ['Male'],
      SpouseGender: ['Female'],
      SonCoverRequired: [false],

      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
      LoadingPremium: [null],
      LoadingPremiumAmount: [0],
      LoadingPremiumAmountPaidBy: [''],
      PaymentMode: [],

      // payload keys
      PolicyNo: ['', [Validators.required]],
      PolicyIssueDate: ['', [Validators.required]],
      PolicyStartDate: ['', [Validators.required]],
      PolicyEndDate: ["", [Validators.required]],
      PolicyIssueDetail: this._initDocumentForm(data.PolicyIssueDetail),
      ProposalSubmissionDate:[],
      PaymentDetails: this._buildPaymentDetailsForm(data?.PaymentDetails),
    });

    if (data) {
      PolicyIssueForm.patchValue(data)
    }

    return PolicyIssueForm;
  }



  // document form
  private _initDocumentForm(data: IPolicyIssueDocumentDto): FormGroup {
    let DocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [""],
      DocumentNo: [""],
      FileName: ["", [Validators.required]],
      StorageFileName: ["", [Validators.required]],
      StorageFilePath: ["", [Validators.required]],
      Stage: ["", [Validators.required]],
      Description: [""],
    });

    if (data) {
      DocumentForm.patchValue(data)
    }

    return DocumentForm;
  }

  // Build Quotation Note Document Formarray
  private _buildQNDocuments(items: QNDocumentDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initQNDocuments(i));
        });
      }
    }

    return formArray;
  }

  // Init Quotation Note Document Form
  private _initQNDocuments(item: QNDocumentDto): FormGroup {
    let dFQN = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      InsuranceCompany: [''],
      InsuranceCompanyShortName: [''],
      ProductName: [''],
      ProductCode: [''],
      SumInsured: [0],
      Deductible: [0],
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

  //Build Policy person  formarray
  private _buildPolicyPersonForm(items = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPolicyPersonForm(i));
        });
      }
    }

    return formArray;
  }

  //Init Policy person  form
  private _initPolicyPersonForm(item, Relation = '', Gender = ''): FormGroup {
    let pPF = this.fb.group({
      Id: [0],
      RFQId: [0],
      Relation: [Relation],
      Name: ['',],
      DOB: ['',],
      Gender: [Gender],
      Remark: ['',],
      SmokerTibco: [null],
      SmokerTibcoDescription: [''],
      ExistingIllness: [null],
      ExistingIllnessDetail: this._buildExistingIllnessDetailForm(),
      SumInsured: [0],
      OtherSumInsured: [0],
      Deductible: [0],
    })
    if (item != null) {
      if (!item) {
        item = new PolicyPersonsDto();
      }

      if (item) {
        pPF.patchValue(item);
      }
    }
    return pPF;
  }

  //policy person Init Existing Illness Detail Form 
  private _buildExistingIllnessDetailForm(data?): FormGroup {
    let existingIllnessForm = this.fb.group({
      Id: [0],
      RFQMemberId: [0],
      Thyroid: [false],
      ThyroidSince: [''],
      ThyroidDescription: [''],
      Asthma: [false],
      AsthmaSince: [''],
      AsthmaDescription: [''],
      CholesterolDisorDr: [false],
      CholesterolDisorDrSince: [''],
      CholesterolDisorDrDescription: [''],
      Heartdisease: [false],
      HeartdiseaseSince: [''],
      HeartdiseaseDescription: [''],
      Hypertension: [false],
      HypertensionSince: [''],
      HypertensionDescription: [''],
      Diabetes: [false],
      DiabetesSince: [''],
      DiabetesDescription: [''],
      Obesity: [false],
      ObesitySince: [''],
      ObesityDescription: [''],
      OtherExistDisease: [false],
      OtherExistDiseaseDescription: [''],
    });

    return existingIllnessForm;
  }

  // Payment Proof Form in Payment Details FormArray
  private _buildPaymentDetailsForm(items: ILoadingPaymentDetailsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPaymentDetailsForm(i));
        });
      }
    }

    return formArray;
  }

  // Payment Proof Form in Payment Details Form
  private _initPaymentDetailsForm(data: ILoadingPaymentDetailsDto): FormGroup {
    let PaymentDetailsForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      PremiumAmountPaid: [0],
      IssuingBankName: [""],
      ChequeNo: [""],
      IFSC: [""],
      ChequeDate: ["", [Validators.required]],
      ChequeDepositeDate: [""],
      Stage: [""],
      Documents: this._buildPaymentDetailsDocumentsForm(data?.Documents)
    });

    if (data) {
      PaymentDetailsForm.patchValue(data)
    }
    return PaymentDetailsForm;
  }

  // Payment Proof Form in Payment Details in Documents FormArray
  private _buildPaymentDetailsDocumentsForm(items: ILoadingPaymentDocumentDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPaymentDetailsDocumentForm(i));
        });
      }
    }

    return formArray;
  }

  // init Payment Proof Form in Payment Details in Documents Form
  private _initPaymentDetailsDocumentForm(data: ILoadingPaymentDocumentDto): FormGroup {
    let DocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [""],
      DocumentNo: [""],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: ["", [Validators.required]],
      Stage: [""],
      Description: [""],
    });

    if (data) {
      DocumentForm.patchValue(data)
    }

    return DocumentForm;
  }


  private _dateFormat() {
    this.PolicyIssueForm.patchValue({
      PolicyIssueDate: this._datePipe.transform(this.PolicyIssueForm.get('PolicyIssueDate').value, 'yyyy-MM-dd'),
      PolicyStartDate: this._datePipe.transform(this.PolicyIssueForm.get('PolicyStartDate').value, 'yyyy-MM-dd'),
      PolicyEndDate: this._datePipe.transform(this.PolicyIssueForm.get('PolicyEndDate').value, 'yyyy-MM-dd'),

    })
  }
  //#endregion private-getters
}