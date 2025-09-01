import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { Alert, IFilterRule, OrderBySpecs } from '@models/common';
import { CategoryCodeEnum, SubCategoryCodeEnum } from 'src/app/shared/enums';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { DisplayedPolicyType } from '@config/transaction-entry/transactionPolicyType.config';
import { CategoryTypeList, HealthPolicyDocumentsList, PolicyTenureList } from '@config/rfq';
import { ICounterOffersDto, IQueries, Queries } from '@models/dtos/config/RFQHealth/counter-offer.dto';
import { environment } from 'src/environments/environment';
import { DialogService } from '@lib/services/dialog.service';
import { CounterOfferInfoService } from './counter-offer-info.service';
import { MatStepper } from '@angular/material/stepper';
import { AuthService } from '@services/auth/auth.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import * as moment from 'moment';
import { IChequeDocumentDto, IPaymentProofChequeDetailsDto, PolicyPersonsDto, QNDocumentDto } from '@models/dtos/config/RFQHealth';
import { HealthCategoryType, HealthPolicyType } from 'src/app/shared/enums/rfq-health';
import { dropdown } from '@config/dropdown.config';
import { RFQHealthService } from '../rfq-health/rfqhealth.service';
import { ProposalInfoDocumentDto } from '@models/dtos/config/RFQHealth/proposal-submission-info-dto';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RFQExistingIllnessDetailsComponent } from '../rfqexisting-illness-details/rfqexisting-illness-details.component';
import { QuotationBySalesPersonService } from '../quotation-by-sales-person/quotation-by-sales-person.service';
import { RFQRejectedByList } from '@config/rfq';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { RfqService } from '../../rfq.service';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-counter-offer-info',
  templateUrl: './counter-offer-info.component.html',
  styleUrls: ['./counter-offer-info.component.scss'],
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
export class CounterOfferInfoComponent {
  @ViewChild('stepper') stepper: MatStepper;

  pagetitle: string // page main header Title
  mode: string; // for identify of Raise page is create or edit or view
  maxDate // Set MAx date 
  UploadFileAPI: string = API_ENDPOINTS.Attachment.Upload; // upload Doc. API
  CounterOffersDto: ICounterOffersDto // Submit Counter Offer Info Form Group Value

  DropdownMaster: dropdown; // Dropdown Master Data
  allMemberCard;
  myMembers;
  selectedDocumentTypes = [];
  SelfGender: string; // store gender 
  ProposerName: string;
  PolicyPersonsArray // store insured person details
  detailsFieldsList;
  maxBirthDate: Date; // Max birthdate validation
  IsPOSPUser: boolean = false;
  displayValuesOfForm // to store for display RFQ Details

  userProfileObj: IMyProfile // To store Logged User Details
  GrossPremium: number = 0;

  DisplayForm: any;
  IsLoggedUserSameasRfqCreatedUser: boolean = false;
  IsAdmin: boolean = false;
  isExpand: boolean = false;
  // Array list object
  SubCategoryList = [];
  InsurerDetails = [];
  CustomersDetails = [];

  currentDate = new Date()

  // Alert Array List
  InsurerQueryAlerts: Alert[] = []; // Insurer Query Details field error message
  CustomerQueryAlerts: Alert[] = []; // Customer Query Details field error message

  QueryDetailsValidationError: Alert[] = []
  QueryDetailsStepCtrl = new FormControl()

  // declare form group
  CounterOfferForm: FormGroup // Display data Form Group

  //#region constructor
  constructor(private _router: Router,
    private _fb: FormBuilder,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _alertService: AlertsService,
    private _datePipe: DatePipe,
    private _dialogService: DialogService,
    private _MasterListService: MasterListService,
    private _CounterOfferInfoService: CounterOfferInfoService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
    private authService: AuthService,
    private _RFQService: RFQHealthService,
    public _dialog: MatDialog,
    private _RFQCommonService: RfqService,
    private _quotationBySalesPersonService: QuotationBySalesPersonService,
  ) {
    this.maxDate = new Date(Date.now());
    this._fillMasterList();


    // Set max birthdate is before three month of current date
    this.maxBirthDate = new Date(Date.now());
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);

    this.SelfGender = 'Male';
    this.DropdownMaster = new dropdown();
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

    this.displayValuesOfForm = data['data']
    this.DisplayForm = data['data']

    this.CounterOfferForm = this._buildCounterOfferDataForm(data['data']);

    var QNData = data['data'];
    if (QNData.QNDocuments.length > 0) {
      QNData.QNDocuments.forEach((el) => {
        if (el.Buy == true) {
          this.GrossPremium = el.GrossPremium;
        }
      });
    }

    this.myMembers = [];

    // Policy Person Form Array
    this.PolicyPersonsArray = this.CounterOfferForm.get('Members') as FormArray;
    this.memberDispalyDetails(this.CounterOfferForm.get('Members').value);

    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == "Agent") {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }
    this.CounterOfferForm.get('PremiumAmountPaidBy').disable();

    // on form changes execute
    this._OnFormChange();

    if (this.mode == "view") {
      this.CounterOfferForm.disable();
    }

    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.userProfileObj = user
        this.IsAdmin = user.IsAdmin

        if (!this.IsAdmin) {
          if (user.Id == this.DisplayForm.CreatedById) {
            this._DisableFieldForCreaterUser()
            this.IsLoggedUserSameasRfqCreatedUser = true;
          } else {
            this._DisableFieldForUWUser()
            this.IsLoggedUserSameasRfqCreatedUser = false;
          }
        }
      }
    });

    this.ProposerName = this.PolicyPersonsArray?.value[0]?.Name;
  }

  ngAfterViewInit(): void {
    this.stepper.next();
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

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

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

  // QN Documents FormArray
  get QNDocuments() {
    return this.CounterOfferForm.get('QNDocuments') as FormArray;
  }

  // Health Category Type 
  get HealthCategoryType() {
    return HealthCategoryType;
  }

  // Get Health SubCategory From Config file
  get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum;
  }

  // Get Payments Form array
  get Payments() {
    return this.CounterOfferForm.get('PaymentDetails') as FormArray;
  }

  // Get Health Policy Type 
  get HealthPolicyType() {
    return HealthPolicyType;
  }

  // Get Customer Queries Form Array
  get CustomerQueries() {
    return this.CounterOfferForm.get('CustomerQueries') as FormArray
  }

  // Get Insurer Queries Form Array
  get InsurerQueries() {
    return this.CounterOfferForm.get('InsurerQueries') as FormArray
  }

  get RFQRejectedByList() {
    return RFQRejectedByList
  }


  // adding members in myMember array
  public members() {

    this.myMembers = [];
    if (
      this.CounterOfferForm.get('SelfCoverRequired').value == true &&
      this.CounterOfferForm.get('SelfGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Self' });
    }
    if (
      this.CounterOfferForm.get('SelfCoverRequired').value == true &&
      this.CounterOfferForm.get('SelfGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Self' });
    }
    if (
      this.CounterOfferForm.get('SpouseCoverRequired').value == true &&
      this.CounterOfferForm.get('SpouseGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Spouse' });
    }
    if (
      this.CounterOfferForm.get('SpouseCoverRequired').value == true &&
      this.CounterOfferForm.get('SpouseGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Spouse' });
    }
    if (
      this.CounterOfferForm.get('DaughterCoverRequired').value == true &&
      this.CounterOfferForm.get('noOfDaughter').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter' });
    }
    if (
      this.CounterOfferForm.get('DaughterCoverRequired').value == true &&
      this.CounterOfferForm.get('noOfDaughter').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter1' });
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter2' });
    }
    if (
      this.CounterOfferForm.get('DaughterCoverRequired').value == true &&
      this.CounterOfferForm.get('noOfDaughter').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter3' });
    }

    if (
      this.CounterOfferForm.get('SonCoverRequired').value == true &&
      this.CounterOfferForm.get('noOfSon').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son' });
    }
    if (
      this.CounterOfferForm.get('SonCoverRequired').value == true &&
      this.CounterOfferForm.get('noOfSon').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son1' });
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son2' });
    }
    if (
      this.CounterOfferForm.get('SonCoverRequired').value == true &&
      this.CounterOfferForm.get('noOfSon').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son3' });
    }
    if (this.CounterOfferForm.get('MotherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/mother.png', title: 'Mother' });
    }
    if (this.CounterOfferForm.get('FatherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/father.png', title: 'Father' });
    }

  }


  // insured members data from RFQ health form
  public SetCover(member: string, answer) {
    let Answer = answer
    this.CounterOfferForm.patchValue({
      [member + 'CoverRequired']: Answer,
    });
    this._countDaughterSon(member)
    this.members()
  }


  // counting number of Son and Daughter
  private _countDaughterSon(child) {
    if (child == 'Daughter') {
      this.CounterOfferForm.patchValue({
        noOfDaughter: this.CounterOfferForm.get('noOfDaughter').value + 1
      })
    }

    if (child == 'Son') {
      this.CounterOfferForm.patchValue({
        noOfSon: this.CounterOfferForm.get('noOfSon').value + 1
      })
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


  // Add new row in Insurer Query details array
  public addQueryDetails(QueryRaiseBy: string) {
    this.InsurerQueryAlerts = [];
    this.CustomerQueryAlerts = [];


    //#region Insurer
    if (QueryRaiseBy == "Insurer") {

      if (this.InsurerQueries.controls.length > 0) {
        this.InsurerQueries.controls.forEach((el, i) => {

          if (el.get('QueryDate').value === "" || el.get('QueryDate').value === null) {
            this.InsurerQueryAlerts.push({
              Message: `${el.value.SrNo}. Query Date is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          } else {
            if (el.get('Id').value <= 0 || el.get('Id').value == null) {
              if (moment(this._datePipe.transform(el.get('QueryDate').value, 'yyyy-MM-dd')).isSame(moment(this._datePipe.transform(this.currentDate, 'yyyy-MM-dd'))) == false) {
                this.InsurerQueryAlerts.push({
                  Message: `${el.get('SrNo').value}.Query Date is not future and past Date(Insurance company).`,
                  CanDismiss: false,
                  AutoClose: false,
                })
              }
            }
          }

          // if (el.get('Stage').value === "" || el.get('Stage').value === null) {
          //   this.InsurerQueryAlerts.push({
          //     Message: `${el.value.SrNo}. Stage is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('QueryDetails').value === "" || el.get('QueryDetails').value === null) {
          //   this.InsurerQueryAlerts.push({
          //     Message: `${el.value.SrNo}. Query Details is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('ModeOfCommunication').value === "" || el.get('ModeOfCommunication').value === null) {
          //   this.InsurerQueryAlerts.push({
          //     Message: `${el.value.SrNo}. Mode of Communication is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('NextFollowUpDate').value === "" || el.get('NextFollowUpDate').value === null) {
          //   this.InsurerQueryAlerts.push({
          //     Message: `${el.value.SrNo}. Next Follow up Date is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('FileName').value === "" || el.get('FileName').value === null) {
          //   this.InsurerQueryAlerts.push({
          //     Message: `${el.value.SrNo}. Attachment is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

        });
      }

      if (this.InsurerQueryAlerts.length > 0) {
        this._alertService.raiseErrors(this.InsurerQueryAlerts);
        return;
      }
      else {
        var row: IQueries = new Queries()
        row.RFQId = this.CounterOfferForm.get("Id").value;
        row.Stage = this.DisplayForm.Stage;
        row.QueryRaiseBy = "Insurer"
        row.SrNo = this.InsurerQueries.controls.length + 1
        // this.InsurerQueries.push(this._initQueriesForm(row));
        this.InsurerQueries.insert(0, this._initQueriesForm(row));

      }
    }
    //#endregion Insurer

    //#region Customer
    if (QueryRaiseBy == "Customer") {


      if (this.CustomerQueries.controls != undefined) {
        this.CustomerQueries.controls.forEach((el, i) => {

          if (el.get('QueryDate').value === "" || el.get('QueryDate').value === null) {
            this.CustomerQueryAlerts.push({
              Message: `${el.value.SrNo}. Query Date is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          } else {
            if (el.get('Id').value <= 0 || el.get('Id').value == null) {
              if (moment(this._datePipe.transform(el.get('QueryDate').value, 'yyyy-MM-dd')).isSame(moment(this._datePipe.transform(this.currentDate, 'yyyy-MM-dd'))) == false) {
                this.InsurerQueryAlerts.push({
                  Message: `${el.get('SrNo').value}.Query Date is not future and past Date(Customer's Response).`,
                  CanDismiss: false,
                  AutoClose: false,
                })
              }
            }
          }

          // if (el.get('Stage').value === "" || el.get('Stage').value === null) {
          //   this.CustomerQueryAlerts.push({
          //     Message: `${el.value.SrNo}. Stage is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('QueryDetails').value === "" || el.get('QueryDetails').value === null) {
          //   this.CustomerQueryAlerts.push({
          //     Message: `${el.value.SrNo}. Query Details is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('ModeOfCommunication').value === "" || el.get('ModeOfCommunication').value === null) {
          //   this.CustomerQueryAlerts.push({
          //     Message: `${el.value.SrNo}. Mode of Communication is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('NextFollowUpDate').value === "" || el.get('NextFollowUpDate').value === null) {
          //   this.CustomerQueryAlerts.push({
          //     Message: `${el.value.SrNo}. Next Follow up Date is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('FileName').value === "" || el.get('FileName').value === null) {
          //   this.CustomerQueryAlerts.push({
          //     Message: `${el.value.SrNo}. Attachment is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

        });
      }

      if (this.CustomerQueryAlerts.length > 0) {
        this._alertService.raiseErrors(this.CustomerQueryAlerts);
        return;
      }
      else {
        var row: IQueries = new Queries()
        row.RFQId = this.CounterOfferForm.get("Id").value;
        row.Stage = this.DisplayForm.Stage;
        row.QueryRaiseBy = "Customer"
        row.SrNo = this.CustomerQueries.controls.length + 1
        this.CustomerQueries.insert(0, this._initQueriesForm(row));
      }
    }
    //#endregion Customer
  }


  public SendBackButton() {
    if (this.CounterOfferForm.get('SendBackRejectDesc').value == "" || this.CounterOfferForm.get('SendBackRejectDesc').value == null) {
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
          let SendBackRejectObj: ISendBackRejectDTO = new SendBackRejectDTO()
          SendBackRejectObj.Id = this.CounterOfferForm.value.Id;
          SendBackRejectObj.Stage = this.CounterOfferForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.CounterOfferForm.value.SendBackRejectDesc;

          this._RFQCommonService.SendBack(SendBackRejectObj).subscribe((res) => {
            if (res.Success) {
              this._alertService.raiseSuccessAlert(res.Message, "false");
              this._router.navigate([ROUTING_PATH.Basic.Dashboard]);
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
      });
  }

  // upload cheque details in attached payment proof
  public uploadQueryDocument(event: any, index: number, QueryRaiseBy: string) {

    let file = event.target.files[0]

    if (file) {
      let FileName = file.name.split('.')
      if (FileName && FileName.length >= 2) {
        this._dataService
          .UploadFile(this.UploadFileAPI, file)
          .subscribe((res) => {
            if (res.Success) {

              if (QueryRaiseBy == 'Insurer') {
                this.InsurerQueries.controls[index].patchValue({
                  FileName: res.Data.FileName,
                  StorageFileName: res.Data.StorageFileName,
                  StorageFilePath: res.Data.StorageFilePath
                })
              }

              if (QueryRaiseBy == 'Customer') {
                this.CustomerQueries.controls[index].patchValue({
                  FileName: res.Data.FileName,
                  StorageFileName: res.Data.StorageFileName,
                  StorageFilePath: res.Data.StorageFilePath
                })
              }



              this._alertService.raiseSuccessAlert(res.Message);
            }
            else {
              this._alertService.raiseErrors(res.Alerts);
            }
          });

      }
      else {
        this._alertService.raiseErrorAlert("Please select a valid  File")
        return;
      }

      return
    }
  }

  // view attached file 
  public ViewAttachedDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  // remove Query details 
  public removeQueryDetails(index: number, QueryRaiseBy: string) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {

          if (QueryRaiseBy == 'Insurer') {
            let SelectedQuery = this.InsurerQueries.controls[index]
            this.InsurerQueries.removeAt(index);

            //After Delete any query Update Srno
            this.InsurerQueries.controls.forEach(q => {
              if (SelectedQuery.value.SrNo < q.get('SrNo').value) {
                q.patchValue({
                  SrNo: q.value.SrNo - 1
                })
              }
            })
          }

          if (QueryRaiseBy == 'Customer') {
            let SelectedQuery = this.CustomerQueries.controls[index]
            this.CustomerQueries.removeAt(index);

            //After Delete any query Update Srno
            this.CustomerQueries.controls.forEach(q => {
              if (SelectedQuery.value.SrNo < q.get('SrNo').value) {
                q.patchValue({
                  SrNo: q.value.SrNo - 1
                })
              }
            })
          }

        }
      });

  }

  public RemoveQueryDetailsDocuments(index: number, QueryRaiseBy: string) {
    if (QueryRaiseBy == 'Insurer') {
      this.InsurerQueries.controls[index].patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      });
    }

    if (QueryRaiseBy == 'Customer') {
      this.CustomerQueries.controls[index].patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      });
    }
  }

  // click on "Back to List Page" button then redirect last page
  public BackToListPage() {
    this._Location.back();
  }

  // Submit Payment Link form
  public submitCounterOfferInfo(IsSubmit: boolean) {
    this.CounterOfferForm.enable({ emitEvent: false })
    // Check if Payment link is added or not (If not added raise Alert message)
    if (this.QueryDetailsValidationError.length > 0) {
      this._alertService.raiseErrors(this.QueryDetailsValidationError)
      return
    }

    // date convert
    this._DateFormat();

    // when form is validated submit form
    this.CounterOffersDto = this.CounterOfferForm.value

    this._CounterOfferInfoService.SubmitCounterOfferInfo(this.CounterOffersDto, IsSubmit).subscribe((res) => {
      if (res.Success) {
        this._alertService.raiseSuccessAlert(res.Message, "false")
        this._router.navigate([ROUTING_PATH.Basic.Dashboard])
      }
      else {
        //If form submission fails then apply disable condition
        if (!this.IsAdmin) {
          if (this.userProfileObj.Id == this.DisplayForm.CreatedById) {
            this._DisableFieldForCreaterUser()
          } else {
            this._DisableFieldForUWUser()
          }
        }

        if (res.Alerts && res.Alerts?.length > 0) {
          this._alertService.raiseErrors(res.Alerts)
        } else {
          this._alertService.raiseErrorAlert(res.Message)
        }
      }

    })
  }

  // check if Payment Link is added not not (alert message if Payment link is not added) 
  public QueryDetailsValidation() {
    this.QueryDetailsValidationError = []

    if ((!this.IsLoggedUserSameasRfqCreatedUser) || this.IsAdmin) {
      if (this.InsurerQueries.controls.length > 0) {
        this.InsurerQueries.controls.forEach((el, i) => {
          if (el.get('QueryDate').value === "" || el.get('QueryDate').value === null) {
            this.QueryDetailsValidationError.push({
              Message: `${el.value.SrNo}. Query Date is required (Insurance company).`,
              CanDismiss: false,
              AutoClose: false,
            })
          } else {
            if (el.get('Id').value <= 0 || el.get('Id').value == null) {
              if (moment(this._datePipe.transform(el.get('QueryDate').value, 'yyyy-MM-dd')).isSame(moment(this._datePipe.transform(this.currentDate, 'yyyy-MM-dd'))) == false) {
                this.InsurerQueryAlerts.push({
                  Message: `${el.get('SrNo').value}.Query Date is not future and past Date(Insurance company).`,
                  CanDismiss: false,
                  AutoClose: false,
                })
              }
            }
          }

          // if (el.get('Stage').value === "" || el.get('Stage').value === null) {
          //   this.QueryDetailsValidationError.push({
          //     Message: `${el.value.SrNo}. Stage is required (Insurance company).`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('QueryDetails').value === "" || el.get('QueryDetails').value === null) {
          //   this.QueryDetailsValidationError.push({
          //     Message: `${el.value.SrNo}. Query Details is required (Insurance company).`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('ModeOfCommunication').value === "" || el.get('ModeOfCommunication').value === null) {
          //   this.QueryDetailsValidationError.push({
          //     Message: `${el.value.SrNo}. Mode of Communication is required (Insurance company).`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          if (el.get('NextFollowUpDate').value === "" || el.get('NextFollowUpDate').value === null) {
            // this.QueryDetailsValidationError.push({
            //   Message: `${el.value.SrNo}. Next Follow up Date is required (Insurance company).`,
            //   CanDismiss: false,
            //   AutoClose: false,
            // })
          } else {
            if (moment(el.get('NextFollowUpDate').value).isBefore(moment(el.get('QueryDate').value))) {
              this.QueryDetailsValidationError.push({
                Message: `${el.value.SrNo}. Next Follow up Date cannot be Before Query Date (Insurance company).`,
                CanDismiss: false,
                AutoClose: false,
              })
            }
          }

          // if (el.get('FileName').value === "" || el.get('FileName').value === null) {
          //   this.QueryDetailsValidationError.push({
          //     Message: `${el.value.SrNo}. Attachment is required (Insurance company).`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

        });
      }
    }

    if (this.IsLoggedUserSameasRfqCreatedUser || this.IsAdmin) {
      if (this.CustomerQueries.controls != undefined) {
        this.CustomerQueries.controls.forEach((el, i) => {
          if (el.get('QueryDate').value === "" || el.get('QueryDate').value === null) {
            this.QueryDetailsValidationError.push({
              Message: `${el.value.SrNo}.Response Date is required (Customer's Response).`,
              CanDismiss: false,
              AutoClose: false,
            })
          } else {
            if (el.get('Id').value <= 0 || el.get('Id').value == null) {
              if (moment(this._datePipe.transform(el.get('QueryDate').value, 'yyyy-MM-dd')).isSame(moment(this._datePipe.transform(this.currentDate, 'yyyy-MM-dd'))) == false) {
                this.InsurerQueryAlerts.push({
                  Message: `${el.get('SrNo').value}.Response Date is not future and past Date(Customer's Response).`,
                  CanDismiss: false,
                  AutoClose: false,
                })
              }
            }
          }

          // if (el.get('Stage').value === "" || el.get('Stage').value === null) {
          //   this.QueryDetailsValidationError.push({
          //     Message: `${el.value.SrNo}. Stage is required (Customer's Response).`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('QueryDetails').value === "" || el.get('QueryDetails').value === null) {
          //   this.QueryDetailsValidationError.push({
          //     Message: `${el.value.SrNo}. Query Details is required (Customer's Response).`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('ModeOfCommunication').value === "" || el.get('ModeOfCommunication').value === null) {
          //   this.QueryDetailsValidationError.push({
          //     Message: `${el.value.SrNo}. Mode of Communication is required (Customer's Response).`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          if (el.get('NextFollowUpDate').value === "" || el.get('NextFollowUpDate').value === null) {
            // this.QueryDetailsValidationError.push({
            //   Message: `${el.value.SrNo}. Next Follow up Date is required (Customer's Response).`,
            //   CanDismiss: false,
            //   AutoClose: false,
            // })
          } else {
            if (moment(el.get('NextFollowUpDate').value).isBefore(moment(el.get('QueryDate').value))) {
              this.QueryDetailsValidationError.push({
                Message: `${el.value.SrNo}. Next Follow up Date cannot be Before Response Date (Customer's Response).`,
                CanDismiss: false,
                AutoClose: false,
              })
            }
          }

          // if (el.get('FileName').value === "" || el.get('FileName').value === null) {
          //   this.QueryDetailsValidationError.push({
          //     Message: `${el.value.SrNo}. Attachment is required (Customer's Response).`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

        });
      }
    }

    //   if ((!this.IsLoggedUserSameasRfqCreatedUser) || this.IsAdmin) {
    //   if (this.CounterOfferForm.get('FinalStatus').value != "Reject" && this.CounterOfferForm.get('FinalStatus').value != "Modify") {
    //     this.QueryDetailsValidationError.push({
    //       Message: 'Select Final Status',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     })
    //   }
    // }

    if (this.CounterOfferForm.get('LoadingPremium').value == 'true' || this.CounterOfferForm.get('LoadingPremium').value == true) {
      if (!this.CounterOfferForm.get('LoadingPremiumAmount').value) {
        this.QueryDetailsValidationError.push({
          Message: 'Enter Loading Premium Amount',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.CounterOfferForm.get('IsReject').value == 'true' || this.CounterOfferForm.get('IsReject').value == true) {
      if (!this.CounterOfferForm.get('Rejectedfrom').value) {
        this.QueryDetailsValidationError.push({
          Message: 'Rejected By is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.CounterOfferForm.get('SendBackRejectDesc').value == "" || this.CounterOfferForm.get('SendBackRejectDesc').value == null) {
        this.QueryDetailsValidationError.push({
          Message: `Reject Reason is required.`,
          CanDismiss: false,
          AutoClose: false,
        })

      }
    }

    if (this.QueryDetailsValidationError.length > 0) {
      this.QueryDetailsStepCtrl.setErrors({ required: true });
      return this.QueryDetailsStepCtrl;
    }
    else {
      this.QueryDetailsStepCtrl.reset();
      return this.QueryDetailsStepCtrl;
    }
  }

  // validate decimal point, minus and decimal number 
  public DecimalWithMinus(event) {

    if (typeof event.target.selectionStart == "number") {
      if (event.target.selectionStart == 0 && event.target.selectionEnd == event.target.value.length) {
        event.target.value = "";
      }
    }

    event.target.value.replace(/[^0-9\.]/g, '')
    var findsDot = new RegExp(/\./g)
    var containsDot = event.target.value.match(findsDot)
    if (containsDot != null && ([46, 110, 190].indexOf(event.which) > -1)) {
      event.preventDefault();
      return false;
    }

    // for 2 decimal point allow only 
    var DotArrValue = event.target.value.split(".");
    if (DotArrValue.length > 1 && [8, 9, 13, 27, 37, 38, 39, 40].indexOf(event.which) == -1) {
      if (DotArrValue[1].length > 1) {
        event.preventDefault();
        return false;
      }
    }

    if (event.which == 64 || event.which == 16) {
      // numbers
      return false;
    } if ([8, 9, 13, 27, 37, 38, 39, 40].indexOf(event.which) > -1) {
      // backspace, tab, enter, escape, arrows
      return true;
    } else if (event.which >= 48 && event.which <= 57) {
      // numbers
      return true;
    } else if (event.which >= 96 && event.which <= 105) {
      // numpad number
      return true;
    } else if ([46, 110, 190].indexOf(event.which) > -1 && event.target.value.length > 1) {
      // dot and numpad dot
      return true;
    } else if ([109, 189].indexOf(event.which) > -1 && event.target.value.length < 1) {
      // "-" and numpad "-"
      return true;
    }
    else {
      event.preventDefault();
      return false;
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


  // update gender of self and spouse in allMemberCard array
  private _genderOfSelfSpouseInArray() {
    let female = '/assets/icons/woman.png'
    let male = '/assets/icons/male.png'
    if (this.CounterOfferForm.get('SelfGender').value == 'Male') {
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

  // date format
  private _DateFormat() {

    this.InsurerQueries.controls.forEach((el) => {
      el.patchValue({
        QueryDate: this._datePipe.transform(el.value.QueryDate, 'yyyy-MM-dd'),
        NextFollowUpDate: this._datePipe.transform(el.value.NextFollowUpDate, 'yyyy-MM-dd')
      });
    });
    this.CustomerQueries.controls.forEach((el) => {
      el.patchValue({
        QueryDate: this._datePipe.transform(el.value.QueryDate, 'yyyy-MM-dd'),
        NextFollowUpDate: this._datePipe.transform(el.value.NextFollowUpDate, 'yyyy-MM-dd')
      });
    });
  }

  // form to display data from RFQ health form
  private _buildCounterOfferDataForm(data): FormGroup {
    let ddF = this._fb.group({
      Id: [0],

      // only display purpose user below fields
      RFQNo: [''],
      RFQDate: [''],
      QNNo: [''],
      QNDate: [''],
      SubCategoryId: [0],
      SubCategoryName: [null],
      SubCategoryCode: [null],
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
      ProposalSubmissionDetail: this._initDocumentsForm(data?.ProposalSubmissionDetail),

      // for post field
      FinalStatus: [null],
      IsReject: [false],
      Rejectedfrom: [''],
      IsModify: [false],
      LoadingPremium: [false],
      ModificationDetails: [null],
      LoadingPremiumAmount: [0],
      Queries: this._buildQueriesForm(data?.Queries),
      InsurerQueries: this._buildQueriesForm(data?.InsurerQueries),
      CustomerQueries: this._buildQueriesForm(data?.CustomerQueries),

      ClaimInPreviousYear: [false],
      PrevPolicyInsurComp: [],
      PrevPolicyInsurCompName: [],
      PrevPolicyInsurCompShortName: [],
      PrevPolicyPeriod: [],
      PrevPolicySumInsured: [],
      PrevPolicyType: [],
      PreviousPolicyPremium: [],
      PreviousInsurer: [''],
      PreviousPolicyType: [''],
      PreviousPolicyStartDate: [''],
      PreviousPolicyEndDate: [''],
    })

    if (data) {
      ddF.patchValue(data)
    }

    return ddF
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

        if (item.DocumentType != "Proposal" || item.Stage == "RFQProposalSubmissionUW") {
          DF.patchValue(item);
        }

        // push Raise selected document type 
        if (!this.selectedDocumentTypes.includes(item.DocumentType)) {
          this.selectedDocumentTypes.push(item.DocumentType);
        }
      }
    }
    return DF
  }



  // Documents FormArray
  private _buildQueriesForm(items: IQueries[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initQueriesForm(i));
        });
      }
    }

    return formArray;
  }

  // Documents FormGroup
  private _initQueriesForm(data: IQueries): FormGroup {

    let QueryForm = this._fb.group({
      Id: [0],
      SrNo: [0],
      RowNo: [0],
      RFQId: [0],

      QueryRaiseBy: [null],
      QueryDate: [null],
      Stage: [null],
      QueryDetails: [null],
      ModeOfCommunication: [null],
      NextFollowUpDate: [null],
      FileName: [null],
      StorageFileName: [null],
      StorageFilePath: [null]
    });

    if (data) {
      QueryForm.patchValue(data)
    }

    return QueryForm;

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

  // on form changes some changes as per below coding
  private _OnFormChange() {
    this.CounterOfferForm.get('LoadingPremium').valueChanges.subscribe((val) => {
      if (val == 'false' || val == false) {
        this.CounterOfferForm.get('LoadingPremiumAmount').setValue("")
      }
    });

    this.CounterOfferForm.get('IsModify').valueChanges.subscribe((val) => {
      if (val == 'false' || val == false) {
        this.CounterOfferForm.get('ModificationDetails').setValue("")
      }
    });

    this.CounterOfferForm.get('IsReject').valueChanges.subscribe((val) => {

      this.CounterOfferForm.patchValue({
        IsModify: false,
        LoadingPremium: false,
        Rejectedfrom: ''

      })

    });

  }


  // update gender of Self and spouse in HealthQuateForm
  private _genderofSelfAndSpouse(choice) {
    this.SelfGender = choice;
    this.CounterOfferForm.patchValue({
      SelfGender: this.SelfGender,
    });

    if (this.CounterOfferForm.get('SelfGender').value == 'Male') {
      this.CounterOfferForm.patchValue({
        SpouseGender: 'Female',
      });
    } else {
      this.CounterOfferForm.patchValue({
        SpouseGender: 'Male',
      });
    }
    this._genderOfSelfSpouseInArray()
    this.members()
  }


  /**
* if Login user is same as rfq created user then,
* can not editable InsurerQueries && FinalStatus
* only add or change CustomerQueries
*/
  private _DisableFieldForCreaterUser() {
    this.CounterOfferForm.get('InsurerQueries').disable({ emitEvent: false })
    this.CounterOfferForm.get('FinalStatus').disable({ emitEvent: false })
    this.CounterOfferForm.get('ModificationDetails').disable({ emitEvent: false })
    this.CounterOfferForm.get('IsReject').disable({ emitEvent: false })
    this.CounterOfferForm.get('Rejectedfrom').disable({ emitEvent: false })
    this.CounterOfferForm.get('IsModify').disable({ emitEvent: false })
    this.CounterOfferForm.get('LoadingPremium').disable({ emitEvent: false })
    this.CounterOfferForm.get('LoadingPremiumAmount').disable({ emitEvent: false })
  }

  /**
   * otherwise
    * if Login user is not a  created user then,
    * can not editable CustomerQueries
    */
  private _DisableFieldForUWUser() {
    this.CounterOfferForm.get('CustomerQueries').disable({ emitEvent: false });
  }
  //#endregion private-getters  
}
