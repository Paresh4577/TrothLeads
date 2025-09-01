import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { PolicyPersonsDto } from '@models/dtos/config/RFQHealth';
import { QNDocumentDto } from '@models/dtos/config/RFQHealth/quotation-note';
import { Alert, IFilterRule, OrderBySpecs } from '@models/common';
import { dropdown } from '@config/dropdown.config';
import { DisplayedPolicyType } from '@config/transaction-entry/transactionPolicyType.config';
import { CategoryTypeList, HealthPolicyDocumentsList, PolicyTenureList } from '@config/rfq';
import { CategoryCodeEnum, SubCategoryCodeEnum } from 'src/app/shared/enums';
import { MasterListService } from '@lib/services/master-list.service';
import { RFQHealthService } from '../rfq-health/rfqhealth.service';
import { environment } from 'src/environments/environment';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RFQExistingIllnessDetailsComponent } from '../rfqexisting-illness-details/rfqexisting-illness-details.component';
import { HealthCategoryType, HealthPolicyType } from 'src/app/shared/enums/rfq-health';
import { DialogService } from '@lib/services/dialog.service';
import { LoadingPaymentLinkService } from './loading-payment-link.service';
import { ILoadingPaymentLinkDocumentsDto, LoadingPaymentLinkDocumentsDto } from '@models/dtos/config/RFQHealth/loading-payment-link.dto';
import { MatStepper } from '@angular/material/stepper';
import { QuotationBySalesPersonService } from '../quotation-by-sales-person/quotation-by-sales-person.service';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-loading-payment-link',
  templateUrl: './loading-payment-link.component.html',
  styleUrls: ['./loading-payment-link.component.scss'],
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

export class LoadingPaymentLinkComponent {
  @ViewChild('stepper') stepper: MatStepper;

  pagetitle: string // page main header Title
  mode: string; // for identify of Raise page is create or edit or view
  SubCategoryList = []; // Store Product sub category list
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload; // upload document API
  DropdownMaster: dropdown; // Dropdown Master Data
  SelfGender: string; // store gender 
  ProposerName: string;
  myMembers; // store selected member icon path
  allMemberCard; // to store display Member icon in card
  PolicyPersonsArray // store insured person details
  maxBirthDate: Date; // Max birthdate validation
  isExpand: boolean = false;
  DisplayForm: any;
  detailsFieldsList: any[] // A list of Insured person Questionary

  LoadingPaymentLinkForm: FormGroup // Display data Form Group

  maxDate // Set MAx date 

  //#region constructor
  constructor(private _router: Router,
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _alertservice: AlertsService,
    private _datePipe: DatePipe,
    private _MasterListService: MasterListService,
    private _RFQService: RFQHealthService,
    public _dialog: MatDialog,
    private _dialogService: DialogService,
    private _loadingPaymentLinkService: LoadingPaymentLinkService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
    private _quotationBySalesPersonService: QuotationBySalesPersonService,
  ) {
    this.maxDate = new Date(Date.now());

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

    let data = this._route.snapshot.data
    this.pagetitle = data['title']
    this.mode = data['mode']
    this.DisplayForm = data['data'];
    this.LoadingPaymentLinkForm = this._buildLoadingPaymentLinkForm(data['data'])

    // patch filename and filepath for Attached Proposal Form from Documents array
    var RFQData = data['data'];
    if (RFQData.Documents.length > 0) {
      RFQData.Documents.forEach(element => {
        if (element.Stage == 'RFQLoadingPaymentLinkUW' && element.DocumentType == 'Proposal') {
          this.LoadingPaymentLinkForm.patchValue({
            ProposalFormFileName: element.FileName,
            ProposalFormFilePath: element.StorageFilePath
          });
        }
      });
    }

    if (this.LoadingPaymentLinkForm.get('PaymentMode').value == 'Cheque') {
      this.LoadingPaymentLinkForm.get('LoadingPaymentInsurer').disable();
      // this.LoadingPaymentLinkForm.get('LoadingPaymentLink').patchValue("NA");
    }

    this.myMembers = [];
    // Policy Person Form Array
    this.PolicyPersonsArray = this.LoadingPaymentLinkForm.get('Members') as FormArray;
    this.memberDispalyDetails(this.LoadingPaymentLinkForm.get('Members').value)
    this._genderOfSelfSpouseInArray()
    this._OnFormChange();

    if (this.mode == "view") {
      this.LoadingPaymentLinkForm.disable();
    }

    this.ProposerName = this.PolicyPersonsArray?.value[0]?.Name;
  }

  ngAfterViewInit(): void {
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();

    if (this.DisplayForm.PolicyType == HealthPolicyType.Rollover || this.DisplayForm.PolicyType == 'Renewal-Change Company' || this.DisplayForm.PolicyType == 'Renewal-Same Company') {
      this.stepper.next();
    }

    this._cdr.detectChanges();
  }

  //#endregion lifecyclehooks

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  //get Health Category Type From Config file
  public get HealthCategoryType() {
    return HealthCategoryType
  }


  //get Health Policy Type From Config file
  get HealthPolicyType() {
    return HealthPolicyType
  }

  // Get Health SubCategory From Config file
  get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum
  }

  // Get Policy Type
  get PolicyTypeList() {
    if (this.DisplayForm?.TransactionId) {
      return DisplayedPolicyType.rfqHealthRenewalPolicyType
    }
    else {
      return DisplayedPolicyType.rfqHealthPolicyType
    }
  }

  // Get Category Type List
  get CategoryTypeList() {
    return CategoryTypeList
  }

  // Get Policy Tenure List
  get PolicyTenureList() {
    return PolicyTenureList
  }

  get PolicyDocumentList() {
    let sortedList = HealthPolicyDocumentsList.sort((a, b) =>
      a.SortOrder - b.SortOrder);
    return sortedList
  }

  get QNDocuments() {
    return this.LoadingPaymentLinkForm.get('QNDocuments') as FormArray
  }


  get SelectedQNDoc() {
    let SelectedQuotation = this.QNDocuments.controls.find(qn => qn.get('Buy').value == true)

    if (SelectedQuotation) {
      return SelectedQuotation
    } else {
      return null;
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

              this.LoadingPaymentLinkForm.get('ProposalSubmissionDetail').patchValue({
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


  public removeProposalDoc() {

    this.LoadingPaymentLinkForm.get('ProposalSubmissionDetail').patchValue({
      FileName: null,
      StorageFileName: null,
      StorageFilePath: null
    })
  }


  // view Quotation (Veiw Uploaded Policy document)
  public ViewQuotation() {
    window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + this.QNDocuments.value[0].StorageFilePath)
  }

  // view attached file 
  public ViewQnDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
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
      this.LoadingPaymentLinkForm.get('SelfCoverRequired').value == true &&
      this.LoadingPaymentLinkForm.get('SelfGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Self' });
    }
    if (
      this.LoadingPaymentLinkForm.get('SelfCoverRequired').value == true &&
      this.LoadingPaymentLinkForm.get('SelfGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Self' });
    }
    if (
      this.LoadingPaymentLinkForm.get('SpouseCoverRequired').value == true &&
      this.LoadingPaymentLinkForm.get('SpouseGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Spouse' });
    }
    if (
      this.LoadingPaymentLinkForm.get('SpouseCoverRequired').value == true &&
      this.LoadingPaymentLinkForm.get('SpouseGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Spouse' });
    }
    if (
      this.LoadingPaymentLinkForm.get('DaughterCoverRequired').value == true &&
      this.LoadingPaymentLinkForm.get('noOfDaughter').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter' });
    }
    if (
      this.LoadingPaymentLinkForm.get('DaughterCoverRequired').value == true &&
      this.LoadingPaymentLinkForm.get('noOfDaughter').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter1' });
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter2' });
    }
    if (
      this.LoadingPaymentLinkForm.get('DaughterCoverRequired').value == true &&
      this.LoadingPaymentLinkForm.get('noOfDaughter').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter3' });
    }

    if (
      this.LoadingPaymentLinkForm.get('SonCoverRequired').value == true &&
      this.LoadingPaymentLinkForm.get('noOfSon').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son' });
    }
    if (
      this.LoadingPaymentLinkForm.get('SonCoverRequired').value == true &&
      this.LoadingPaymentLinkForm.get('noOfSon').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son1' });
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son2' });
    }
    if (
      this.LoadingPaymentLinkForm.get('SonCoverRequired').value == true &&
      this.LoadingPaymentLinkForm.get('noOfSon').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son3' });
    }
    if (this.LoadingPaymentLinkForm.get('MotherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/mother.png', title: 'Mother' });
    }
    if (this.LoadingPaymentLinkForm.get('FatherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/father.png', title: 'Father' });
    }

  }

  // insured members data from RFQ health form
  public SetCover(member: string, answer) {
    let Answer = answer
    this.LoadingPaymentLinkForm.patchValue({
      [member + 'CoverRequired']: Answer,
    });
    this._countDaughterSon(member)
    this.members()
  }

 

  // click on "Back to List Page" button then redirect last page
  public BackToListPage() {
    this._Location.back();
  }

  // validate the form and submit it
  public SubmitLoadingPaymentProof() {

    let submitFormValue = JSON.parse(JSON.stringify(this.LoadingPaymentLinkForm.value))

    if (!submitFormValue.ProposalSubmissionDetail.StorageFilePath) {
      submitFormValue.ProposalSubmissionDetail = null
    }

    this._loadingPaymentLinkService.SubmitLoadingPaymentLink(submitFormValue).subscribe(res => {
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

    if (this.LoadingPaymentLinkForm.get('SendBackRejectDesc').value == "" || this.LoadingPaymentLinkForm.get('SendBackRejectDesc').value == null) {
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

          this._loadingPaymentLinkService.Reject(this.LoadingPaymentLinkForm.value).subscribe((res) => {
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

    if (this.LoadingPaymentLinkForm.get('SendBackRejectDesc').value == "" || this.LoadingPaymentLinkForm.get('SendBackRejectDesc').value == null) {
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
          this._loadingPaymentLinkService.SendBack(this.LoadingPaymentLinkForm.value).subscribe((res) => {
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

  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }

  //#endregion public-methods


  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  // update gender of self and spouse in allMemberCard array
  private _genderOfSelfSpouseInArray() {
    let female = '/assets/icons/woman.png'
    let male = '/assets/icons/male.png'
    if (this.LoadingPaymentLinkForm.get('SelfGender').value == 'Male') {
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
      this.LoadingPaymentLinkForm.patchValue({
        noOfDaughter: this.LoadingPaymentLinkForm.get('noOfDaughter').value + 1
      })
    }

    if (child == 'Son') {
      this.LoadingPaymentLinkForm.patchValue({
        noOfSon: this.LoadingPaymentLinkForm.get('noOfSon').value + 1
      })
    }
  }

  // update gender of Self and spouse in HealthQuateForm
  private _genderofSelfAndSpouse(choice) {
    this.SelfGender = choice;
    this.LoadingPaymentLinkForm.patchValue({
      SelfGender: this.SelfGender,
    });

    if (this.LoadingPaymentLinkForm.get('SelfGender').value == 'Male') {
      this.LoadingPaymentLinkForm.patchValue({
        SpouseGender: 'Female',
      });
    } else {
      this.LoadingPaymentLinkForm.patchValue({
        SpouseGender: 'Male',
      });
    }
    this._genderOfSelfSpouseInArray()
    this.members()
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

  // change form
  private _OnFormChange() {
    this.LoadingPaymentLinkForm.get('LoadingPaymentInsurer').valueChanges.subscribe((val) => {
      if (val == false && this.LoadingPaymentLinkForm.get('PaymentMode').value == 'Online') {
        this.LoadingPaymentLinkForm.get('LoadingPaymentLink').setValue("")
      }

      // if (this.LoadingPaymentLinkForm.get('PaymentMode').value != 'Online') {
      //   this.LoadingPaymentLinkForm.get('LoadingPaymentLink').patchValue("NA");
      // }
    });

  }


  // form to display data from Loading Payment Link form
  private _buildLoadingPaymentLinkForm(data): FormGroup {
    let ddF = this._fb.group({
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

      ProposalFormFileName: [''],
      ProposalFormFilePath: [''],
      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: [''],

      LoadingPremiumAmount: [0],
      PaymentMode: [null],

      // payload keys
      LoadingPaymentInsurer: [false],
      LoadingPaymentLink: [''],
      ProposalSubmissionDetail: this._initDocumentForm(data?.ProposalSubmissionDetail),
    })

    if (data) {
      ddF.patchValue(data)
    }
    return ddF
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
    let dFQN = this._fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      InsuranceCompany: [''],
      InsuranceCompanyName: [''],
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
      if (!item) {
        item = new QNDocumentDto();
      }

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
    let pPF = this._fb.group({
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
    let existingIllnessForm = this._fb.group({
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

  // Payment Proof Documents FormArray
  private _buildDocumentsForm(items: ILoadingPaymentLinkDocumentsDto[] = []): FormArray {
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

  private _initDocumentForm(data: ILoadingPaymentLinkDocumentsDto): FormGroup {
    let DocumentForm = this._fb.group({
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

  //#endregion private-getters  
}
