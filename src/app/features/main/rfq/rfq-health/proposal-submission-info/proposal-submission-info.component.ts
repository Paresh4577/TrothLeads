import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { IProposalInfoDocumentDto, IProposalSubmissionInfoDto, ProposalInfoDocumentDto, ProposalSubmissionInfoDto, QNDocumentDto } from '@models/dtos/config/RFQHealth/proposal-submission-info-dto';
import { ProposalSubmissionInfoService } from './proposal-submission-info.service';
import { HttpService } from '@lib/services/http/http.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { Alert, IFilterRule, OrderBySpecs } from '@models/common';
import { ROUTING_PATH } from '@config/routingPath.config';
import { HealthPolicyTenure } from 'src/app/shared/enums/rfq-health/HealthPolicyTenure.enum';
import { MasterListService } from '@lib/services/master-list.service';
import { DialogService } from '@lib/services/dialog.service';
import { CategoryCodeEnum, SubCategoryCodeEnum } from 'src/app/shared/enums';
import { DisplayedPolicyType } from '@config/transaction-entry/transactionPolicyType.config';
import { CategoryTypeList, HealthPolicyDocumentsList, PolicyTenureList } from '@config/rfq';
import { environment } from 'src/environments/environment';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { dropdown } from '@config/dropdown.config';
import { RFQHealthService } from '../rfq-health/rfqhealth.service';
import { HealthCategoryType, HealthPolicyType } from 'src/app/shared/enums/rfq-health';
import { RFQExistingIllnessDetailsComponent } from '../rfqexisting-illness-details/rfqexisting-illness-details.component';
import { IChequeDocumentDto, IPaymentProofChequeDetailsDto, PolicyPersonsDto } from '@models/dtos/config/RFQHealth';
import { AuthService } from '@services/auth/auth.service';
import { MatStepper } from '@angular/material/stepper';
import { QuotationBySalesPersonService } from '../quotation-by-sales-person/quotation-by-sales-person.service';
import { RFQDocumentsDrpList } from '@config/rfq';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-proposal-submission-info',
  templateUrl: './proposal-submission-info.component.html',
  styleUrls: ['./proposal-submission-info.component.scss'],
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

export class ProposalSubmissionInfoComponent {

  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;
  @ViewChild('stepper') stepper: MatStepper;

  pagetitle: string // page main header Title
  mode: string; // for identify of Raise page is create or edit or view

  // Boolean
  IsPOSPUser: boolean = false;

  isExpand: boolean = false;

  ProposalInfoForm: FormGroup // Proposal Information Form
  ProposalInfo: IProposalSubmissionInfoDto  // Proposal Information Form Value

  UploadFileAPI = API_ENDPOINTS.Attachment.Upload; // Document Upload API

  maxDate // Set MAx date 

  // List objects
  SubCategoryList = [];
  detailsFieldsList: any[] // A list of Insured person Questionary

  // Step Control
  ProposalSubmissionInformationStepCtrl = new FormControl(); // Step Validation Control

  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  ProposalSubmissionInformationAlerts: Alert[] = []

  DocumentAttachmentAlert: Alert[] = [];

  // Step Control
  DocumentAttachmentStepCtrl = new FormControl()

  DropdownMaster: dropdown; // Dropdown Master Data
  SelfGender: string; // store gender 
  ProposerName: string;
  myMembers; // store selected member icon path
  allMemberCard; // to store display Member icon in card
  PolicyPersonsArray // store insured person details
  maxBirthDate: Date; // Max birthdate validation
  DisplayForm: any;

  //#region constructor
  constructor(private _router: Router,
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _proposalService: ProposalSubmissionInfoService,
    private _dataService: HttpService,
    private _alertService: AlertsService,
    private _datePipe: DatePipe,
    private _MasterListService: MasterListService,
    private _dialogService: DialogService,
    public _dialog: MatDialog,
    private _RFQService: RFQHealthService,
    private _authService: AuthService,
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
    this.allMemberCard = this._RFQService.memberCardArray()
    this._fillMasterList();

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
    this.ProposalInfo = new ProposalSubmissionInfoDto()
    this.ProposalInfoForm = this._buildProposalSubmissionInfoForm(data['data'])


    this.myMembers = [];

    // Policy Person Form Array
    this.PolicyPersonsArray = this.ProposalInfoForm.get('Members') as FormArray;
    this.memberDispalyDetails(this.ProposalInfoForm.get('Members').value)
    this._genderOfSelfSpouseInArray()

    // get User type from user profile
    if (this._authService._userProfile.value?.UserType == "Agent") {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }
    this.ProposalInfoForm.get('PremiumAmountPaidBy').disable();

    if (this.mode == 'view') {
      this.ProposalInfoForm.disable();
    }

    this.ProposerName = this.PolicyPersonsArray?.value[0]?.Name;
  }

  ngAfterViewInit(): void {
    this.stepper.next();
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

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  //get Health Policy Type From Config file
  get HealthPolicyType() {
    return HealthPolicyType
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

  // Get sum Insured Amount From Config file
  public get HealthPolicyTenure() {
    return HealthPolicyTenure
  }

  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Health))
  }

  //get Health Category Type From Config file
  public get HealthCategoryType() {
    return HealthCategoryType
  }

  // Get Health SubCategory From Config file
  get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum
  }

  // get Quotation buy now documents array list
  get QNDocuments() {
    return this.ProposalInfoForm.get('QNDocuments') as FormArray
  }

  get Documents() {
    return this.ProposalInfoForm.get('Documents') as FormArray
  }

  get PolicyDocumentAttachment() {
    return this.Documents.controls;
  }

  get Payments() {
    return this.ProposalInfoForm.get('PaymentDetails') as FormArray
  }

  // Proposal attachment (uploading the file on this.UploadFileAPI and patching the name & path in form)
  public attachProposalForm(event) {

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
              this._alertService.raiseSuccessAlert(res.Message);
              this.ProposalInfoForm.get('ProposalSubmissionDetail').patchValue({
                FileName: res.Data.FileName,
                StorageFileName: res.Data.StorageFileName,
                StorageFilePath: res.Data.StorageFilePath,
                Stage: this.DisplayForm.Stage,
                DocumentType: 'Proposal',
              })

            }
            else {
              this._alertService.raiseErrors(res.Alerts);
            }
          });
      }
    }
  }


  public removeProposalDoc() {

    this.ProposalInfoForm.get('ProposalSubmissionDetail').patchValue({
      FileName: null,
      StorageFileName: null,
      StorageFilePath: null
    })
  }

  // click on "Back to List Page" button then redirect last page
  public BackToListPage() {
    this._Location.back();
  }

  // Proposal Info submit
  public SubmitProposalInfo() {
    // Validate form (If not return altert message .)
    if (this.ProposalSubmissionInformationAlerts.length > 0) {
      this._alertService.raiseErrors(this.ProposalSubmissionInformationAlerts)
      return
    }

    this._validateAttachDocField()

    if (this.AttachDocumentAlerts.length > 0) {
      this._alertService.raiseErrors(this.AttachDocumentAlerts)
      return;
    }

    this._DateFormat()
    // When form is validated submit form value 
    let Id: number = this.ProposalInfoForm.get('Id').value

    let submitFormValue = JSON.parse(JSON.stringify(this.ProposalInfoForm.value))

    if (!submitFormValue.ProposalSubmissionDetail.StorageFilePath) {
      submitFormValue.ProposalSubmissionDetail = null
    }

    this._proposalService.SubmitProposalSubmission(submitFormValue).subscribe((res) => {
      if (res.Success) {
        this._alertService.raiseSuccessAlert(res.Message, "false")
        // this._router.navigate([ROUTING_PATH.RFQ.CounterOfferPending + Id])
        this._router.navigate([ROUTING_PATH.Basic.Dashboard])
      }
      else {
        if (res.Alerts && res.Alerts?.length > 0) {
          this._alertService.raiseErrors(res.Alerts)
        } else {
          this._alertService.raiseErrorAlert(res.Message)
        }
      }
    })
  }

  // Send back QN Form
  public SendBackForm() {

    if (this.ProposalInfoForm.get('SendBackRejectDesc').value == "" || this.ProposalInfoForm.get('SendBackRejectDesc').value == null) {
      this._alertService.raiseErrors([{
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

          let Id = this.ProposalInfoForm.get('Id').value
          this._proposalService.SendBack(this.ProposalInfoForm.value).subscribe((res) => {
            if (res.Success) {
              this._alertService.raiseSuccessAlert(res.Message, "false")
              // this._router.navigate([ROUTING_PATH.RFQ.PaymentProofPending + Id])
              this._router.navigate([ROUTING_PATH.Basic.Dashboard])
            }
            else {
              if (res.Alerts && res.Alerts?.length > 0) {
                this._alertService.raiseErrors(res.Alerts)
              } else {
                this._alertService.raiseErrorAlert(res.Message)
              }
            }
          });
        }
      });

  }

  public DocumentAttachmentValidation() {
    this.DocumentAttachmentAlert = []


    this.Documents.controls.forEach((item, index) => {
      if (item.get('FileName').hasError('required') || item.get('StorageFilePath').hasError('required')) {
        this.DocumentAttachmentAlert.push({
          Message: `${item.value.DocumentTypeName} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

    })

    if (this.DocumentAttachmentAlert.length > 0) {
      this.DocumentAttachmentStepCtrl.setErrors({ required: true });
      return this.DocumentAttachmentStepCtrl;
    }
    else {
      this.DocumentAttachmentStepCtrl.reset();
      return this.DocumentAttachmentStepCtrl;
    }

  }

  // Reject Form
  public RejectForm() {

    if (this.ProposalInfoForm.get('SendBackRejectDesc').value == "" || this.ProposalInfoForm.get('SendBackRejectDesc').value == null) {
      this._alertService.raiseErrors([{
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

          this.ProposalInfo = this.ProposalInfoForm.value
          this._proposalService.Reject(this.ProposalInfo).subscribe((res) => {
            if (res.Success) {
              this._alertService.raiseSuccessAlert(res.Message, "false")
              // this._router.navigate([ROUTING_PATH.RFQ.QNSelectionSPPending + Id])]
              this._router.navigate([ROUTING_PATH.Basic.Dashboard])
            }
            else {
              if (res.Alerts && res.Alerts?.length > 0) {
                this._alertService.raiseErrors(res.Alerts)
              } else {
                this._alertService.raiseErrorAlert(res.Message)
              }
            }
          });
        }
      });

  }

  // view Quotation (Veiw Uploaded Policy document)
  public ViewQuotation() {
    window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + this.QNDocuments.value[0].StorageFilePath)
  }

  // third step validation
  public ProposalSubmissionInformationValidation() {
    this.ProposalSubmissionInformationAlerts = []

    if (this.mode != 'view') {
      if (this.ProposalInfoForm.get('ProposalSubmissionDate').invalid) {
        if (this.ProposalInfoForm.get('ProposalSubmissionDate').value) {
          this.ProposalSubmissionInformationAlerts.push({
            Message: 'Enter Valid Proposal Submission Date',
            CanDismiss: false,
            AutoClose: false,
          })
        }
        else {
          this.ProposalSubmissionInformationAlerts.push({
            Message: 'Enter Proposal Submission Date',
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }

      // if (this.ProposalInfoForm.get('ProposalFormFileName').value == "" || this.ProposalInfoForm.get('ProposalFormFileName').value == null) {
      //   this.alerts.push({
      //     Message: 'Attach Proposal Form',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   })
      // }
    }

    /**
    * Step control Validate
    */
    if (this.ProposalSubmissionInformationAlerts.length > 0) {
      this.ProposalSubmissionInformationStepCtrl.setErrors({ required: true });
      return this.ProposalSubmissionInformationStepCtrl;
    } else {
      this.ProposalSubmissionInformationStepCtrl.reset();
      return this.ProposalSubmissionInformationStepCtrl;
    }
  }

  /**
* Display Error message 
*/
  public StepThreeValidationError() {
    if (this.ProposalSubmissionInformationAlerts.length > 0) {
      this._alertService.raiseErrors(this.ProposalSubmissionInformationAlerts);
    }
  }


  public onDocumentSelectionChange(selectedValue): void {
    this._validateAttachDocField()

    if (this.AttachDocumentAlerts.length > 0) {
      this._alertService.raiseErrors(this.AttachDocumentAlerts)
      this.DocumentDropdown.nativeElement.value = ""
      return;
    }

    let selectedDocument = selectedValue.target.value;
    this.addDocuments(selectedDocument);
    this.DocumentDropdown.nativeElement.value = ""
  }

  // add new row in Document array
  public addDocuments(selectedDocument?: string) {

    const row: IProposalInfoDocumentDto = new ProposalInfoDocumentDto();

    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.PolicyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.PolicyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.PolicyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = "RFQProposalSubmissionUW";
        this.Documents.push(this._initDocumentsForm(row));
      }
    }
  }

  // delete a row in document array With User Confirmation
  public RemoveDocuments(index: number) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.Documents.removeAt(index)
        }

      });


  }

  // file data (policy document that is added)
  public SelectRFQDocument(event, DocIndex: number) {


    let file = event.target.files[0]
    if (file) {
      this._dataService.UploadFile(this.UploadFileAPI, file).subscribe((res) => {
        if (res.Success) {
          if (DocIndex >= 0) {
            this.Documents.controls[DocIndex].patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.DisplayForm.Stage
            })
          }
          this._alertService.raiseSuccessAlert(res.Message);
        }
        else {
          if (res.Alerts && res.Alerts?.length > 0) {
            this._alertService.raiseErrors(res.Alerts)
          }
          else {
            this._alertService.raiseErrorAlert(res.Message)
          }
        }
      });
    }

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
      this.ProposalInfoForm.get('SelfCoverRequired').value == true &&
      this.ProposalInfoForm.get('SelfGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Self' });
    }
    if (
      this.ProposalInfoForm.get('SelfCoverRequired').value == true &&
      this.ProposalInfoForm.get('SelfGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Self' });
    }
    if (
      this.ProposalInfoForm.get('SpouseCoverRequired').value == true &&
      this.ProposalInfoForm.get('SpouseGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Spouse' });
    }
    if (
      this.ProposalInfoForm.get('SpouseCoverRequired').value == true &&
      this.ProposalInfoForm.get('SpouseGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Spouse' });
    }
    if (
      this.ProposalInfoForm.get('DaughterCoverRequired').value == true &&
      this.ProposalInfoForm.get('noOfDaughter').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter' });
    }
    if (
      this.ProposalInfoForm.get('DaughterCoverRequired').value == true &&
      this.ProposalInfoForm.get('noOfDaughter').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter1' });
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter2' });
    }
    if (
      this.ProposalInfoForm.get('DaughterCoverRequired').value == true &&
      this.ProposalInfoForm.get('noOfDaughter').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter3' });
    }

    if (
      this.ProposalInfoForm.get('SonCoverRequired').value == true &&
      this.ProposalInfoForm.get('noOfSon').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son' });
    }
    if (
      this.ProposalInfoForm.get('SonCoverRequired').value == true &&
      this.ProposalInfoForm.get('noOfSon').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son1' });
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son2' });
    }
    if (
      this.ProposalInfoForm.get('SonCoverRequired').value == true &&
      this.ProposalInfoForm.get('noOfSon').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son3' });
    }
    if (this.ProposalInfoForm.get('MotherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/mother.png', title: 'Mother' });
    }
    if (this.ProposalInfoForm.get('FatherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/father.png', title: 'Father' });
    }

  }

  // insured members data from RFQ health form
  public SetCover(member: string, answer) {
    let Answer = answer
    this.ProposalInfoForm.patchValue({
      [member + 'CoverRequired']: Answer,
    });
    this._countDaughterSon(member)
    this.members()
  }


  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }

  //#endregion public-methods


  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // update gender of self and spouse in allMemberCard array
  private _genderOfSelfSpouseInArray() {
    let female = '/assets/icons/woman.png'
    let male = '/assets/icons/male.png'
    if (this.ProposalInfoForm.get('SelfGender').value == 'Male') {
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
      this.ProposalInfoForm.patchValue({
        noOfDaughter: this.ProposalInfoForm.get('noOfDaughter').value + 1
      })
    }

    if (child == 'Son') {
      this.ProposalInfoForm.patchValue({
        noOfSon: this.ProposalInfoForm.get('noOfSon').value + 1
      })
    }
  }

  // update gender of Self and spouse in HealthQuateForm
  private _genderofSelfAndSpouse(choice) {
    this.SelfGender = choice;
    this.ProposalInfoForm.patchValue({
      SelfGender: this.SelfGender,
    });

    if (this.ProposalInfoForm.get('SelfGender').value == 'Male') {
      this.ProposalInfoForm.patchValue({
        SpouseGender: 'Female',
      });
    } else {
      this.ProposalInfoForm.patchValue({
        SpouseGender: 'Male',
      });
    }
    this._genderOfSelfSpouseInArray()
    this.members()
  }

  // date format
  private _DateFormat() {
    this.ProposalInfoForm.patchValue({
      ProposalSubmissionDate: this._datePipe.transform(this.ProposalInfoForm.get('ProposalSubmissionDate').value, 'yyyy-MM-dd')
    })
  }

  // Proposal Submission Information form
  private _buildProposalSubmissionInfoForm(data: ProposalSubmissionInfoDto): FormGroup {
    let pSIF = this._fb.group({
      Id: [0],
      // only display purpose user below fields
      RFQNo: [''],
      RFQDate: [''],
      QNNo: [''],
      QNDate: [''],
      SubCategoryId: [0],
      PolicyType: [''],
      CategoryType: [''],
      PolicyPeriod: [0],
      QNDocuments: this._buildQNDocuments(data?.QNDocuments),

      // Form submit fields are below
      ProposalSubmissionDate: ['', [Validators.required]],
      Documents: this._buildDocumentsForm(data.Documents),
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
      Stage: [''],

      // Product  Category details
      SubCategoryCode: [''],
      SubCategoryName: [''],
      SumInsured: [0],
      OtherSumInsured: [0],
      Deductible: [0],
      PincodeId: [],
      Pincode: [''],
      ProposerMobileNo: [''],
      ProposerEmail: [''],

      // Product  Category details >>> [0.1] >>> Details of Proposed Insured & Family (if applicable)
      Members: this._buildPolicyPersonForm(data?.Members),
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

      PaymentMode: [],
      PremiumAmountPaidBy: [''],
      PaymentDetails: this._buildPaymentDetailsForm(data?.PaymentDetails),
      ProposalSubmissionDetail: this._initDocumentsForm(data?.ProposalSubmissionDetail)
    })

    if (data) {
      pSIF.patchValue(data)
    }

    return pSIF
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

  // Cheque Details FormArray
  private _buildPaymentDetailsForm(items: IPaymentProofChequeDetailsDto[] = []): FormArray {
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

  // Cheque Details Init Details Form
  private _initPaymentDetailsForm(data: IPaymentProofChequeDetailsDto): FormGroup {
    let ChequeForm = this._fb.group({
      Id: [0],
      RFQId: [0],
      PremiumAmountPaid: [0],
      IssuingBankName: [''],
      ChequeNo: [''],
      IFSC: [''],
      ChequeDate: [''],
      ChequeDepositeDate: [''],
      Documents: this._buildChequeDocumentsForm(data?.Documents),
    });

    if (data) {
      ChequeForm.patchValue(data)
    }

    return ChequeForm;
  }

  // Payment Proof Cheque Documents FormArray
  private _buildChequeDocumentsForm(items: IChequeDocumentDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initChequeDocumentForm(i));
        });
      }
    }

    return formArray;
  }

  // Payment Proof Cheque Documents init details form
  private _initChequeDocumentForm(data: IChequeDocumentDto): FormGroup {
    let ChequeDocumentForm = this._fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [""],
      DocumentNo: [""],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: ["", [Validators.required]],
      Stage: [""],
      Description: [""],
      RFQPaymentDetailId: [0]
    });

    if (data) {
      ChequeDocumentForm.patchValue(data)
    }

    return ChequeDocumentForm;
  }

  // document array
  private _buildDocumentsForm(items: ProposalInfoDocumentDto[] = []): FormArray {
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

  // document form
  private _initDocumentsForm(item: ProposalInfoDocumentDto): FormGroup {
    let DF = this._fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      DocumentTypeName: [''],
      FileName: [''],
      StorageFilePath: [''],
      StorageFileName: ['', [Validators.required]],
      Stage: [''],
    })

    if (item != null) {
      if (!item) {
        item = new ProposalInfoDocumentDto();
      }

      if (item) {

        if (item) {
          DF.patchValue(item);
        }
      }
    }
    return DF
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
        if (item.Buy == true) {
          dFQN.patchValue(item);
        }
      }
    }
    return dFQN
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

  private _validateAttachDocField() {

    this.AttachDocumentAlerts = []

    this.Documents.controls.forEach((element, index) => {
      if (element.get('StorageFilePath').hasError('required')) {

        this.AttachDocumentAlerts.push({
          Message: `${element.value.DocumentType} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });

  }

  // #endregion Private methods


}
