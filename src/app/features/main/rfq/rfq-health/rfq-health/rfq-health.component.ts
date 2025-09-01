import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { dropdown } from '@config/dropdown.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, IFilterRule, OrderBySpecs, QuerySpecs } from '@models/common';
import { ICityPincodeDto } from '@models/dtos/core';
import { Observable, Subject, takeUntil, switchMap, of, map } from 'rxjs';
import { DocumentsDto, ExistingIllnessDetailDto, IDocumentsDto, IRFQHealthDto, PolicyPersonsDto, RFQHealthDto } from '@models/dtos/config/RFQHealth/rfqhealth-dto';
import { RFQExistingIllnessDetailsComponent } from '../rfqexisting-illness-details/rfqexisting-illness-details.component';
import { RFQHealthService } from './rfqhealth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '@lib/services/http/http.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { AuthService } from '@services/auth/auth.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { IUserDto } from '@models/dtos/core/userDto';
import { SumInsuredEnum } from 'src/app/shared/enums/SumInsured.enum';
import { ROUTING_PATH } from '@config/routingPath.config';
import { DialogService } from '@lib/services/dialog.service';
import { HealthPolicyTenure } from 'src/app/shared/enums/rfq-health/HealthPolicyTenure.enum';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { CategoryCodeEnum } from 'src/app/shared/enums/transaction-entry/category-code.enum';
import { SubCategoryCodeEnum } from 'src/app/shared/enums/transaction-entry/subCategory-code.enum';
import { DisplayedPolicyType } from '@config/transaction-entry/transactionPolicyType.config';
import { IAdditionalFilterObject } from '@models/dtos/shared/querySpecs.model';
import { environment } from 'src/environments/environment';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { PolicyTenureList, CategoryTypeList, HealthPrevPolicyCliamStatus } from '@config/rfq';
import { HealthCategoryType, HealthPolicyType } from 'src/app/shared/enums/rfq-health';
import { IFinancialYearDto } from '@models/dtos/core/FinancialYearDto';
import { SalesPersonTypeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { RFQDocumentsDrpList } from '@config/rfq';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-rfq-health',
  templateUrl: './rfq-health.component.html',
  styleUrls: ['./rfq-health.component.scss'],
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
export class RfqHealthComponent implements OnInit {

  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  // #region public variables

  pagetitle: string = 'RFQ (Request For Quotation) - Health'; // Page main header Title
  mode: string; // for identify of Raise page is create or edit or view
  myMembers; // store selected member icon path
  allMemberCard; // to store display Member icon in card
  PolicyPersonsArray // store insured person details
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API
  UserType: string = "" // for login user type 
  ProposerName: string; //
  isExpand: boolean = false;
  userProfileObj: IMyProfile // To store Logged User Details

  //List objects
  Branchs: IBranchDto[] = [];
  SubCategoryList = [];

  // Observable List
  TeamRefUser$: Observable<IUserDto[]>;
  InsuranceCompany$: Observable<IInsuranceCompanyDto[]>;
  FinancialYearList: IFinancialYearDto[] = []

  currentvalue: boolean = false;

  DropdownMaster: dropdown; // Dropdown Master Data
  RFQHealthForm: FormGroup; // RFQHealthForm FormGroup
  RFQHealth: IRFQHealthDto;  // RFQHealthForm value
  UserProfileObj: IMyProfile;

  DocumentAttachmentStepCtrl = new FormControl(); // Step 5 Control
  TeamDetailsStepCtrl = new FormControl(); // Step 4 Control
  PreviousPolicyDetailsStepCtrl = new FormControl(); // Step 3 Control
  ProductCategoryDetailsStepCtrl = new FormControl(); // Step 2 Control
  BasicDetailsStepCtrl = new FormControl(); // Step 1 Control

  ProductCategoryDetailsAlerts: Alert[] = []; // Step-3 Invalid field error message
  PrevPolicyDetailAlerts: Alert[] = []; // Step-2 Invalid field error message
  TeamDetailsAlerts: Alert[] = []; // Step-4 Invalid field error message
  AttachmentDetailsAlerts: Alert[] = []; // Step-5 Invalid field error message
  BasicDetailsAlerts: Alert[] = [];// Step-1 Invalid field error message

  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message

  pincodes$: Observable<ICityPincodeDto[]>; // observable of pincode list
  salesPersonName$: Observable<IUserDto[]> // Observable of user list
  BDOlist$: Observable<IUserDto[]>;
  BDMlist$: Observable<IUserDto[]>;
  destroy$: Subject<any>;


  maxBirthDate: Date; // Max birthdate validation
  minBirthDate: Date; // Min birthdate validation
  maxDate: Date; // Max date validation
  SelfGender: string;// store gender 
  isAdmin: boolean //Store Current User is Admin or not

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
    public dialog: MatDialog,
    private _RFQService: RFQHealthService,
    private _MasterListService: MasterListService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private authService: AuthService,
    private _datePipe: DatePipe,
    private _dialogService: DialogService,
    private _Location: Location,
  ) {
    this.DropdownMaster = new dropdown();

    this.maxBirthDate = new Date(Date.now());
    this.minBirthDate = new Date(Date.now());
    // Set max date  current date
    this.maxDate = new Date(Date.now());
    // Set max birthdate is before three month of current date
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);

    // Set min birthdate is before 99 year of current date
    this.minBirthDate.setFullYear(this.minBirthDate.getFullYear() - 99);
    this.SelfGender = 'Male';
    this.destroy$ = new Subject();
    this.allMemberCard = this._RFQService.memberCardArray()
  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    this.myMembers = [];
    this.RFQHealth = new RFQHealthDto();

    // Route params data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title'];
    this.mode = data['mode'];

    if (this.mode == "edit" || this.mode == "view" || this.mode == "RenewalRFQ") {
      this.RFQHealth = data['data'];
    }

    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.UserProfileObj = user
      }
    })

    this.RFQHealthForm = this._buildRFQHealthForm(this.RFQHealth);

    if (this.mode == "create") {
      this.RFQHealth.Members = new Array<PolicyPersonsDto>()
      this.RFQHealth.Documents = new Array<DocumentsDto>()
    }
    // RFQ Health policy person Form array
    this.PolicyPersonsArray = this.RFQHealthForm.get('Members') as FormArray;

    // Add By defualt two documet
    for (let i = 1; i < 3; i++) {
      this.addDocuments()
    }

    if (this.mode == "edit" || this.mode == "view" || this.mode == "RenewalRFQ") {
      this.memberDispalyDetails(this.RFQHealthForm.get('Members').value)
    }

    this._fillMasterList();
    this._valChange();
    this._onFormChange();

    // in case of view mode then all form value is disabled mode
    if (this.mode == "view") {
      this.RFQHealthForm.disable()
      this.RFQHealthForm.get("Members").disable()
      this.isExpand = true;
      this.fillCustomerName();
    }


  }


  //#endregion lifecyclehooks
  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  get f() {
    return this.RFQHealthForm.controls;
  }

  get inf() {
    return this.RFQHealthForm.controls["Members"] as FormArray;
  }

  get infdelete() {
    return this.RFQHealthForm.controls["Documents"] as FormArray;
  }

  // Get Health SubCategory From Config file
  get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum
  }

  get PrevPolicyCliamStatus() {
    return HealthPrevPolicyCliamStatus
  }

  // Get Proposal Type
  get PolicyTypeList() {
    if (this.RFQHealth?.TransactionId) {
      return DisplayedPolicyType.rfqHealthRenewalPolicyType
    }
    else {
      return DisplayedPolicyType.rfqHealthPolicyType
    }
  }

  // Get Health Proposal From Config file
  public get HealthPolicyType() {
    return HealthPolicyType
  }

  // Get Health Policy From Config file
  public get HealthCategoryType() {
    return HealthCategoryType
  }

  // Get sum Insured Amount From Config file
  public get SumInsured() {
    return SumInsuredEnum
  }

  public get HealthPolicyTenure() {
    return HealthPolicyTenure
  }

  get CategoryTypeList() {
    return CategoryTypeList
  }

  get PolicyTenureList() {
    return PolicyTenureList
  }

  get document() {
    return this.RFQHealthForm.controls["Documents"] as FormArray;
  }


  get PreviousPolicyDoc() {
    let Index = this.document.value.findIndex(ele => ele.DocumentType == 'PrevPolicy')
    if (Index != -1) {
      return this.document.controls[Index].value;
    } else {
      return "";
    }
  }


  get CanDisableMemberSelection() {
    if (this.RFQHealthForm.get('CategoryType').value == HealthCategoryType.Individual) {
      if (this.inf.controls.length > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  get PolicyDocumentAttachment() {
    return this.document.controls.filter(doc => doc.get('DocumentType').value != 'PrevPolicy')
  }

  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Health))
  }

  /**
 * Only editable in login user is standard user & Sales person type is POSP
 */
  get canEditableSalesPerson() {
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser) {
      if (this.RFQHealthForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
 * Only editable in login user is standard user & Sales person type is Direct
 */
  get canEditableBdoBdm() {
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser) {
      if (this.RFQHealthForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Branch ANd sales person is editable only in login user is Standard User
   */
  get CanEditableSalespersonTypeAndBranch() {
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser) {
      return true;
    } else {
      return false;
    }
  }

  // selecting gender of self and Spouse
  public SetSelfGender(event, choice) {
    this.SelfGender = choice;
    this.RFQHealthForm.patchValue({
      SelfGender: this.SelfGender,
    });

    if (this.RFQHealthForm.get('SelfGender').value == 'Male') {
      this.RFQHealthForm.patchValue({
        SpouseGender: 'Female',
      });
    } else {
      this.RFQHealthForm.patchValue({
        SpouseGender: 'Male',
      });
    }
    this.members()
    this._genderOfSelfSpouse()
  }

  // select members that are to be insured 
  public SetCover(member: string) {

    if (this.RFQHealthForm.get('CategoryType').value == HealthCategoryType.Individual) {
      if (this.inf.controls.length > 0 && !this.RFQHealthForm.get(member + 'CoverRequired').value) {
        this._alertservice.raiseErrorAlert("Category type Is Individual , so can't Add multiple member.")
        return;
      }
    }

    this.currentvalue = this.RFQHealthForm.get(
      member + 'CoverRequired'
    ).value;
    this.currentvalue = !this.currentvalue;
    this.RFQHealthForm.patchValue({
      [member + 'CoverRequired']: this.currentvalue,
    });
    // if member is removed than remove it from Policy person Array
    if (this.RFQHealthForm.get(member + 'CoverRequired').value == false) {
      this.removeMemberFromPolicyPersons(member)
      this._clearFunction(member)
    }
    // if member is selected tham add it in Policy person array 
    else {
      this.addMemberInPolicyPersons()
    }
    this.members()
  }

  // clear values of city & pincode
  public clear(name: string): void {
    this.f[name].setValue('');
    if (name == 'Pincode') {
      // this.f['CityName'].setValue('');
      // this.f['CityId'].setValue('');
      this.f['PincodeId'].setValue('');
    }
  }

  // add new member in Policy person array
  public addMemberInPolicyPersons(numberOfTimes = 1) {
    for (let i = 0; i < numberOfTimes; i++) {
      var row: PolicyPersonsDto = new PolicyPersonsDto()
      this.RFQHealth.Members.push(row)
      this.PolicyPersonsArray.push(this._initPolicyPersonForm(row))
    }
    this._RealtionGender()
  }

  // remove member form policy person array based on relation 
  public removeMemberFromPolicyPersons(relation, choice = 1, loop = 1) {
    // removes all the rows that has Realtion equals to relation
    if (choice == 1) {
      for (let j = this.RFQHealthForm.get('Members').value.length - 1; j >= 0; j--) {
        if (this.PolicyPersonsArray.controls[j].get('Relation').value == relation) {
          this.inf.removeAt(j);
        }

      }
    }

    // removes loop number of rows from the array that has Realtion equals to relation
    if (choice == 2) {
      for (let i = 0; i < loop; i++) {
        let selectedIndex
        this.PolicyPersonsArray.controls.forEach((element, index) => {
          if (element.get('Relation').value == relation) {
            selectedIndex = index
          }
        })
        this.inf.removeAt(selectedIndex)
      }

    }
    this._RealtionGender()
  }

  // number of children selected
  public onChildSelection(type: string, noOfChild: number) {
    if (type == 'Son') {
      if (this.RFQHealthForm.get('noOfSon').value > noOfChild) {
        let difference = this.RFQHealthForm.get('noOfSon').value - noOfChild
        this.removeMemberFromPolicyPersons(type, 2, difference)
      }
      else {
        let difference = noOfChild - this.RFQHealthForm.get('noOfSon').value
        this.RFQHealthForm.get('noOfSon').patchValue(noOfChild);
        this.addMemberInPolicyPersons(difference)
      }
      this.RFQHealthForm.get('noOfSon').patchValue(noOfChild);
    }

    if (type == 'Daughter') {
      if (this.RFQHealthForm.get('noOfDaughter').value > noOfChild) {
        let difference = this.RFQHealthForm.get('noOfDaughter').value - noOfChild
        this.removeMemberFromPolicyPersons(type, 2, difference)
      }
      else {
        let difference = noOfChild - this.RFQHealthForm.get('noOfDaughter').value
        this.RFQHealthForm.get('noOfDaughter').patchValue(noOfChild);
        this.addMemberInPolicyPersons(difference)
      }
      this.RFQHealthForm.get('noOfDaughter').patchValue(noOfChild);
    }

  }


  // click on "Back to List Page" button then redirect last page
  public BackToListPage() {
    this._Location.back();
  }

  // Insured Person Icon Array
  public members() {

    this.myMembers = [];
    if (
      this.RFQHealthForm.get('SelfCoverRequired').value == true &&
      this.RFQHealthForm.get('SelfGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Self', Gender: this.RFQHealthForm.get('SelfGender').value, Relation: 'Self' });
    }
    if (
      this.RFQHealthForm.get('SelfCoverRequired').value == true &&
      this.RFQHealthForm.get('SelfGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Self', Gender: this.RFQHealthForm.get('SelfGender').value, Relation: 'Self' });
    }
    if (
      this.RFQHealthForm.get('SpouseCoverRequired').value == true &&
      this.RFQHealthForm.get('SpouseGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Spouse', Gender: this.RFQHealthForm.get('SpouseGender').value, Relation: 'Spouse' });
    }
    if (
      this.RFQHealthForm.get('SpouseCoverRequired').value == true &&
      this.RFQHealthForm.get('SpouseGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Spouse', Gender: this.RFQHealthForm.get('SpouseGender').value, Relation: 'Spouse' });
    }
    if (
      this.RFQHealthForm.get('DaughterCoverRequired').value == true &&
      this.RFQHealthForm.get('noOfDaughter').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter', Gender: 'Female', Relation: 'Daughter' });
    }
    if (
      this.RFQHealthForm.get('DaughterCoverRequired').value == true &&
      this.RFQHealthForm.get('noOfDaughter').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter1', Gender: 'Female', Relation: 'Daughter' });
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter2', Gender: 'Female', Relation: 'Daughter' });
    }
    if (
      this.RFQHealthForm.get('DaughterCoverRequired').value == true &&
      this.RFQHealthForm.get('noOfDaughter').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter3', Gender: 'Female', Relation: 'Daughter' });
    }

    if (
      this.RFQHealthForm.get('SonCoverRequired').value == true &&
      this.RFQHealthForm.get('noOfSon').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son', Gender: 'Male', Relation: 'Son' });
    }
    if (
      this.RFQHealthForm.get('SonCoverRequired').value == true &&
      this.RFQHealthForm.get('noOfSon').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son1', Gender: 'Male', Relation: 'Son' });
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son2', Gender: 'Male', Relation: 'Son' });
    }
    if (
      this.RFQHealthForm.get('SonCoverRequired').value == true &&
      this.RFQHealthForm.get('noOfSon').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son3', Gender: 'Male', Relation: 'Son' });
    }
    if (this.RFQHealthForm.get('MotherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/mother.png', title: 'Mother', Gender: 'Female', Relation: 'Mother' });
    }
    if (this.RFQHealthForm.get('FatherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/father.png', title: 'Father', Gender: 'Male', Relation: 'Father' });
    }

  }

  public selectionChange(event: StepperSelectionEvent) {
    if (event.selectedIndex == 1 || event.selectedIndex == 2) {
      this.members();
    }
  }

  // check step one Field & Invalid Field Error message push in alert Array
  public BasicDetailsValidations(): any {
    //validate member
    this.BasicDetailsAlerts = [];
    if (this.RFQHealthForm.get('SubCategoryId').value == 0 || this.RFQHealthForm.get('SubCategoryId').value == null) {
      this.BasicDetailsAlerts.push({
        Message: 'Select Product Sub Category',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQHealthForm.get('PolicyType').value == "" || this.RFQHealthForm.get('PolicyType').value == null) {
      this.BasicDetailsAlerts.push({
        Message: 'Select Policy Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQHealthForm.get('CategoryType').value == "" || this.RFQHealthForm.get('CategoryType').value == null) {
      this.BasicDetailsAlerts.push({
        Message: 'Select Category Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQHealthForm.get('PolicyPeriod').value == "" || this.RFQHealthForm.get('PolicyPeriod').value == null) {
      this.BasicDetailsAlerts.push({
        Message: 'Select Policy Period',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.BasicDetailsAlerts.length > 0) {
      this.BasicDetailsStepCtrl.setErrors({ required: true });
      return this.BasicDetailsStepCtrl;
    } else {
      this.BasicDetailsStepCtrl.reset();
      return this.BasicDetailsStepCtrl;
    }
  }

  // alert message if step one is not validated
  public BasicDetailsError() {
    if (this.BasicDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.BasicDetailsAlerts)
    }
  }

  // check step two  Field & Invalid Field Error message push in alert Array
  public ProductCategoryDetailsValidations() {
    this.ProductCategoryDetailsAlerts = [];

    if (this.RFQHealthForm.get('CategoryType').value == HealthCategoryType.Individual) {
      if (this.inf.controls.length > 1) {
        this.ProductCategoryDetailsAlerts.push({
          Message: "Category type Is Individual , so can't Add multiple member.",
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    // in case of policy type  is 'Multi Individual' then Sum Insured is non mandatory as per document requirement 
    if (this.RFQHealthForm.get('CategoryType').value != HealthCategoryType.MultiIndividual) {

      let SumInsuredMsg = "Select Sum Insured";
      if (this.RFQHealthForm.get('SubCategoryCode').value == SubCategoryCodeEnum.MediclaimTopUpPlan) {
        SumInsuredMsg = "Select Sum Insured(Mediclaim)";
      }

      if (this.RFQHealthForm.get('SumInsured').invalid || this.RFQHealthForm.get('SumInsured').value == 0) {
        this.ProductCategoryDetailsAlerts.push({
          Message: SumInsuredMsg,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.RFQHealthForm.get('SubCategoryCode').value == SubCategoryCodeEnum.MediclaimTopUpPlan) {
        if (this.RFQHealthForm.get('OtherSumInsured').invalid || this.RFQHealthForm.get('OtherSumInsured').value == 0) {
          this.ProductCategoryDetailsAlerts.push({
            Message: 'Select Sum Insured(Top-Up)',
            CanDismiss: false,
            AutoClose: false,
          })
        }
        else {
          // Deductible amount not greater than Other sum insured amount validation check 
          if ((parseFloat(this.RFQHealthForm.get('Deductible').value)!) > (parseFloat(this.RFQHealthForm.get('OtherSumInsured').value)!)) {
            this.ProductCategoryDetailsAlerts.push({
              Message: 'Deductible amount should be either zero or less than Sum Insured(Top-Up).',
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }
      }
    }



    // if ((this.RFQHealthForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TopUpPlan || this.RFQHealthForm.get('SubCategoryCode').value == SubCategoryCodeEnum.MediclaimTopUpPlan) && this.RFQHealthForm.get('Deductible').invalid) {
    //   this.stepThreealerts.push({
    //     Message: 'Enter Deductible Amount',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   })
    // }

    if (this.RFQHealthForm.get('Pincode').invalid) {
      this.ProductCategoryDetailsAlerts.push({
        Message: 'Select PIN Code',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQHealthForm.get('ProposerMobileNo').invalid) {
      this.ProductCategoryDetailsAlerts.push({
        Message: 'Enter Proposer Mobile No',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQHealthForm.get('ProposerEmail').invalid) {
      this.ProductCategoryDetailsAlerts.push({
        Message: 'Enter Email ID',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQHealthForm.get('SelfCoverRequired').value == false &&
      this.RFQHealthForm.get('SpouseCoverRequired').value == false &&
      this.RFQHealthForm.get('DaughterCoverRequired').value == false &&
      this.RFQHealthForm.get('SonCoverRequired').value == false &&
      this.RFQHealthForm.get('MotherCoverRequired').value == false &&
      this.RFQHealthForm.get('FatherCoverRequired').value == false) {
      this.ProductCategoryDetailsAlerts.push({
        Message: 'Select Who would you like to insure?',
        CanDismiss: false,
        AutoClose: false,
      })
    }


    // Validation For policy member  Single select Family FLoter Policy Type
    if (this.RFQHealthForm.get('CategoryType').value == this.HealthCategoryType['Family Floater'] &&
      this.PolicyPersonsArray.value?.length == 1) {
      this.ProductCategoryDetailsAlerts.push({
        Message: "Single Person Don't Allow Family Floater Policy Type",
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.myMembers.length > 0) {
      this.PolicyPersonsArray.controls.forEach((element, index) => {
        if (element.get('Name').invalid) {
          this.ProductCategoryDetailsAlerts.push({
            Message: `${this.myMembers[index].title} - Enter Name`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
        if (element.get('DOB').invalid) {
          this.ProductCategoryDetailsAlerts.push({
            Message: `${this.myMembers[index].title} - Enter Date Of Birth`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
        if (element.get('SmokerTibco').value == null) {
          this.ProductCategoryDetailsAlerts.push({
            Message: `${this.myMembers[index].title} - Select Habit of Smoking/Tobacco?`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
        if (element.get('ExistingIllness').value == null) {
          this.ProductCategoryDetailsAlerts.push({
            Message: `${this.myMembers[index].title} - Select Any Existing Illness?`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (element.get('ExistingIllness').value == true) {
          let temp = this._countIllness(index)
          if (temp == 0) {
            this.ProductCategoryDetailsAlerts.push({
              Message: `${this.myMembers[index].title} - Select at least 1 Illness`,
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }

        // in case of Policy type is 'Multi Individual' then sum insures and sum insured(Top-Up) is mandatory other wise not display and non mandatory
        if (this.RFQHealthForm.get('CategoryType').value == HealthCategoryType.MultiIndividual) {

          let SumInsuredMsg = "Select Sum Insured";
          if (this.RFQHealthForm.get('SubCategoryCode').value == SubCategoryCodeEnum.MediclaimTopUpPlan) {
            SumInsuredMsg = "Select Sum Insured(Mediclaim)";
          }


          if (element.get('SumInsured').invalid || element.get('SumInsured').value == "" || element.get('SumInsured').value == 0) {
            this.ProductCategoryDetailsAlerts.push({
              Message: `${this.myMembers[index].title} - ` + SumInsuredMsg,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (this.RFQHealthForm.get('SubCategoryCode').value == SubCategoryCodeEnum.MediclaimTopUpPlan) {
            if (element.get('OtherSumInsured').invalid || element.get('OtherSumInsured').value == "" || element.get('OtherSumInsured').value == 0) {
              this.ProductCategoryDetailsAlerts.push({
                Message: `${this.myMembers[index].title} - Select Sum Insured(Top-Up)`,
                CanDismiss: false,
                AutoClose: false,
              })
            }
          }

        }

        // in case of ExistingIllness "Other" is true then Remarks field is mandatory other wise non mandatory
        if (element.get('ExistingIllnessDetail.OtherExistDisease').value == true) {
          if (element.get('Remark').invalid) {
            this.ProductCategoryDetailsAlerts.push({
              Message: `${this.myMembers[index].title} - Enter Remark`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }

      })
    }

    if (this.ProductCategoryDetailsAlerts.length > 0) {
      this.ProductCategoryDetailsStepCtrl.setErrors({ required: true });
      return this.ProductCategoryDetailsStepCtrl;
    } else {
      this.ProductCategoryDetailsStepCtrl.reset();
      return this.ProductCategoryDetailsStepCtrl;
    }
  }

  // alert message if step two is not validated
  public ProductCategoryDetailsError() {
    if (this.ProductCategoryDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlerts);
    }
  }

  // check step three  Field & Invalid Field Error message push in alert Array
  public PreviousPolicyDetailsValidations() {
    this.PrevPolicyDetailAlerts = []

    if (this.RFQHealthForm.get('PolicyType').value == HealthPolicyType.Rollover || this.RFQHealthForm.get('PolicyType').value == 'Renewal-Change Company' || this.RFQHealthForm.get('PolicyType').value == 'Renewal-Same Company') {

      if (this.RFQHealthForm.get('PrevPolicyInsurComp').invalid) {
        this.PrevPolicyDetailAlerts.push({
          Message: 'Select Insurance Company',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.RFQHealthForm.get('PrevPolicyType').invalid) {
        this.PrevPolicyDetailAlerts.push({
          Message: 'Select Policy Type',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.RFQHealthForm.get('PreviousPolicyStartDate').invalid) {
        this.PrevPolicyDetailAlerts.push({
          Message: 'Enter Policy Start Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.RFQHealthForm.get('PreviousPolicyEndDate').invalid && !this.RFQHealthForm.get('PreviousPolicyEndDate').value) {
        this.PrevPolicyDetailAlerts.push({
          Message: 'Enter Policy End Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.RFQHealthForm.get('PreviousPolicyEndDate').value && this.RFQHealthForm.get('PreviousPolicyEndDate').value < this.RFQHealthForm.get('PreviousPolicyStartDate').value) {
        this.PrevPolicyDetailAlerts.push({
          Message: 'Enter Valid Policy End Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      // if (this.RFQHealthForm.get('ClaimInPreviousYear').value == null) {
      //   this.PrevPolicyDetailAlerts.push({
      //     Message: 'Did you claim in previous year ?',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   })
      // }

      if (this.RFQHealthForm.get('PrevPolicySumInsured').invalid || this.RFQHealthForm.get('PrevPolicySumInsured').value == 0) {
        this.PrevPolicyDetailAlerts.push({
          Message: 'Enter Sum Insured',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      // if (this.RFQHealthForm.get('PreviousPolicyPremium').invalid || this.RFQHealthForm.get('PreviousPolicyPremium').value == 0) {
      //   this.PrevPolicyDetailAlerts.push({
      //     Message: 'Enter Premium Amount',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   })
      // }

      if (this.RFQHealthForm.get('AnyClaiminLast3Year').value == null) {
        this.PrevPolicyDetailAlerts.push({
          Message: 'Have you taken any claims in the last 3 years Is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }

    if (this.PrevPolicyDetailAlerts.length > 0) {
      this.PreviousPolicyDetailsStepCtrl.setErrors({ required: true });
      return this.PreviousPolicyDetailsStepCtrl;
    } else {
      this.PreviousPolicyDetailsStepCtrl.reset();
      return this.PreviousPolicyDetailsStepCtrl;
    }
  }

  // alert message if step three is not validated
  public PreviousPolicyDetailsError() {
    if (this.PrevPolicyDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PrevPolicyDetailAlerts);
      return;
    }
  }

  // check step four
  public TeamDetailsValidations() {
    this.TeamDetailsAlerts = [];

    if (this.RFQHealthForm.get('BranchId').invalid || this.RFQHealthForm.get('BranchId').value == 0) {
      this.TeamDetailsAlerts.push({
        Message: 'Select Branch',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQHealthForm.get('SalesPersonType').invalid || this.RFQHealthForm.get('SalesPersonType').value == "") {
      this.TeamDetailsAlerts.push({
        Message: 'Select Sales Person Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQHealthForm.get('SalesPersonType').value != 'Team Reference') {
      if (this.RFQHealthForm.get('SalesPersonName').invalid || this.RFQHealthForm.get('SalesPersonName').value == "") {
        this.TeamDetailsAlerts.push({
          Message: 'Select Sales Person',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.RFQHealthForm.get('SalesPersonType').value == 'Team Reference') {
      if (this.RFQHealthForm.get('TeamReferenceName').invalid || this.RFQHealthForm.get('TeamReferenceName').value == "") {
        this.TeamDetailsAlerts.push({
          Message: 'Select Team Reference Name',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }


    if (this.TeamDetailsAlerts.length > 0) {
      this.TeamDetailsStepCtrl.setErrors({ required: true });
      return this.TeamDetailsStepCtrl;
    } else {
      this.TeamDetailsStepCtrl.reset();
      return this.TeamDetailsStepCtrl;
    }
  }

  // alert message if step four is not validated
  public TeamDetailsError() {
    if (this.TeamDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.TeamDetailsAlerts);
    }
  }


  // check step four
  public AttachmentDetailsValidations() {
    this.AttachmentDetailsAlerts = [];

    this.document.controls.forEach((item, index) => {

      if (item.get('DocumentType').value == "PrevPolicy") {
        if (item.get('FileName').hasError('required') || item.get('StorageFilePath').hasError('required')) {
          this.AttachmentDetailsAlerts.push({
            Message: `Previous Policy Attachment is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }
      else if (item.get('DocumentType').value != "PrevPolicy") {

        if (item.get('FileName').hasError('required') || item.get('StorageFilePath').hasError('required')) {
          this.AttachmentDetailsAlerts.push({
            Message: `${item.value.DocumentType} Attachment is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }

    })

    if (this.AttachmentDetailsAlerts.length > 0) {
      this.DocumentAttachmentStepCtrl.setErrors({ required: true });
      return this.DocumentAttachmentStepCtrl;
    } else {
      this.DocumentAttachmentStepCtrl.reset();
      return this.DocumentAttachmentStepCtrl;
    }
  }

  // submit form
  public Submit() {

    // validate the form
    if (this.BasicDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.BasicDetailsAlerts);
      return
    }

    // validate the form
    if (this.ProductCategoryDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlerts);
      return
    }

    // validate the form
    if (this.PrevPolicyDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PrevPolicyDetailAlerts);
      return
    }

    // validate the form
    if (this.TeamDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.TeamDetailsAlerts);
      return
    }

    // validate the form
    if (this.AttachmentDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachmentDetailsAlerts);
      return
    }

    // this._OtherSumInsuredAmount()
    this._DateFormat()

    // sum of sum insured in case of policy type  is "multi individual" then all members sum insured is sum
    if (this.RFQHealthForm.get('CategoryType').value == HealthCategoryType.MultiIndividual) {
      this.sumOfSumInsured();
    }

    // submit form
    switch (this.mode) {
      case "create": case "RenewalRFQ":
        this._RFQService.CreateProposal(this.RFQHealthForm.value).subscribe((res) => {
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
        break;

      case "edit":
        this._RFQService.UpdateProposal(this.RFQHealthForm.value).subscribe((res) => {
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
        break;
    }


  }

  // disable radio button when number of child is 3
  public isDisabled(type: number, number: number) {

    // in case of view mode then all are radio button is disabled other wise execute "ELSE" condition
    if (this.mode == "view") {
      return true;
    }
    else {
      // if noOfSon is more than 3 then radio button for Daughter will be disabled 
      if (
        type == 0 &&
        parseInt(this.RFQHealthForm.get('noOfSon').value) + number > 3
      ) {
        return true;
      }
      // if noOfDaughter is more than 3 then radio button for Son will be disabled 
      else if (
        type == 1 &&
        parseInt(this.RFQHealthForm.get('noOfDaughter').value) + number > 3
      ) {
        return true;
      } else {
        return null;
      }
    }

  }

  // autocomplete for PinCode and also binding value of cityName & cityId
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.RFQHealthForm.patchValue({
      Pincode: event.option.value.PinCode,
      PincodeId: event.option.value.Id,
      CityId: event.option.value.CityId,
      CityName: event.option.value.CityName,
    });
  }

  // binding data of sales person using autoComplete
  public SalesPersonSelected(event: MatAutocompleteSelectedEvent): void {
    this.RFQHealthForm.patchValue({
      SalesPersonId: event.option.value.Id,
      SalesPersonName: event.option.value.FullName,
      SalesPersonContactNo: event.option.value.MobileNo,
      BDMName: event.option.value.BDMName,
      BDMId: event.option.value.BDMId,
      BDOName: event.option.value.BDOName,
      BDOId: event.option.value.BDOId,
    })
  }

  // patching value of SmokerTibco for corresponding member
  public SelectSmokingOrTobacco(indexNumber: number, option: boolean) {
    this.PolicyPersonsArray.at(indexNumber).get('SmokerTibco').patchValue(option);
  }

  // when Existing Illness value is changed for corresponding member
  public SelectExistingIllness(indexNumber: number, detailkey: string, option: boolean, title: string) {
    this.PolicyPersonsArray.at(indexNumber).get('ExistingIllness').patchValue(option);
    // If Existing Illness value is true then open the popUp for Illness
    if (option == true) {
      this.openDiolog(indexNumber, detailkey, title);
      // if Existing Illness value is false then all the Illness details will be false
    } else {
      let IllnessArray = ['OtherExistDisease', 'Obesity', 'Diabetes', 'Hypertension', 'Heartdisease', 'CholesterolDisorDr', 'Asthma', 'Thyroid']

      IllnessArray.forEach((element) => {
        this.PolicyPersonsArray.at(indexNumber).get('ExistingIllnessDetail').get(element).patchValue(false);
      })
    }
  }


  // Insured Person Illness Dialogbox
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
      ExistingIllness: this.PolicyPersonsArray.at(indexNumber).get(detailkey).value,
    };
    const dialogRef = this.dialog.open(
      RFQExistingIllnessDetailsComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._bindExistingIllnessDetail(indexNumber, result);
      }
    });
  }

  // /* Pop Up for Name of the Insurance Company
  //  * @param type:to identify api of which list is to be called
  //   * @param title: title that will be displayed on PopUp
  //   * /
  public openDiologForMasterData(type: string, title: string, openFor: string) {
    let specs = new QuerySpecs()

    switch (openFor) {

      case "Sales":
        specs = this._salesPersonListAPIfilter();
        break;

      case "TeamRef":
        specs = this._teamReferenceListAPIfilter();
        break;

      case "BDOName":
        specs = this._bdoListAPIfilter();
        break;

      case "BDMName":
        specs = this._bdmListAPIfilter();
        break;

      default:
        break;
    }



    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      type: type,
      title: title,
      ispopup: true,
      filterData: specs.FilterConditions.Rules,
      addFilterData: specs.AdditionalFilters
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        switch (openFor) {

          case "Sales":
            this.RFQHealthForm.patchValue({
              SalesPersonId: result.Id,
              SalesPersonName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "TeamRef":
            this.RFQHealthForm.patchValue({
              TeamReferenceId: result.Id,
              TeamReferenceName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "BDMName":
            this.RFQHealthForm.patchValue({
              BDMName: result.FullName,
              BDMId: result.Id,
            });
            break;

          case "BDOName":
            this.RFQHealthForm.patchValue({
              BDOName: result.FullName,
              BDOId: result.Id,
            });
            break;

          default:
            break;
        }
      }

    })
  }

  // PopUp for Pincode Selection
  public openDiologPincode(type: string, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '44vw';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      type: type,
      title: title,
      ispopup: true,
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'Pincode') {
          this.RFQHealthForm.patchValue({
            Pincode: result.PinCode,
            PincodeId: result.Id,
            CityId: result.CityId,
            CityName: result.CityName,
          });
        }
      }
    });
  }

  public AutocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, SelectedFor: string): void {

    switch (SelectedFor) {

      case "TeamRef":
        this.RFQHealthForm.patchValue({
          TeamReferenceId: event.option.value.Id,
          TeamReferenceName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        });
        break;

      case "PINcode":
        this.RFQHealthForm.patchValue({
          PincodeId: event.option.value.Id,
          Pincode: event.option.value.PinCode,
          CityId: event.option.value.CityId,
          CityName: event.option.value.CityName
        });
        break;

      case "Sales":
        this.RFQHealthForm.patchValue({
          SalesPersonId: event.option.value.Id,
          SalesPersonName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        })
        break;

      case "BDMName":
        this.RFQHealthForm.patchValue({
          BDMName: event.option.value.FullName,
          BDMId: event.option.value.Id,
        });
        break;

      case "BDOName":
        this.RFQHealthForm.patchValue({
          BDOName: event.option.value.FullName,
          BDOId: event.option.value.Id,
        });
        break;

      default:
        break;
    }
  }

  public clearControl(name: string, id: string): void {
    this.f[name].setValue("")
    this.f[id].setValue(null)
  }

  // file data (policy document that is added)
  public SelectRFQDocument(event, DocIndex: number) {


    let file = event.target.files[0]

    if (file) {
      this._dataService.UploadFile(this.UploadFileAPI, file).subscribe((res) => {
        if (res.Success) {
          if (DocIndex >= 0) {
            this.document.controls[DocIndex].patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: "RFQRaised"
            })
          }
          this._alertservice.raiseSuccessAlert(res.Message);
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

  public ViewQnDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }


  public onDocumentSelectionChange(selectedValue): void {
    this._validateAttachDocField()

    if (this.AttachDocumentAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachDocumentAlerts)
      this.DocumentDropdown.nativeElement.value = ""
      return;
    }

    let selectedDocument = selectedValue.target.value;
    this.addDocuments(selectedDocument);
    this.DocumentDropdown.nativeElement.value = ""
  }

  // add new row in Document array
  public addDocuments(selectedDocument?: string) {

    const row: IDocumentsDto = new DocumentsDto();

    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.PolicyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.PolicyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.PolicyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = "RFQRaised";
        this.document.push(this._initDocumentsForm(row));
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
          this.document.removeAt(index)
        }

      });


  }

  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }

  public fillCustomerName() {
    this.ProposerName = this.inf.controls[0]?.value?.Name;
  }

  /**
 * When Convert Transaction TO RFQ All Attachments are get
 * Display documents As Per category wise 
 */
  public canDisplayDocuments(DocumentType: string): boolean {
    if (this.mode == 'RenewalRFQ' && this.RFQHealth && this.RFQHealth?.TransactionId) {
      let CategoryWiseDocument = this.PolicyDocumentList.map(doc => doc.DocumentType)
      if (CategoryWiseDocument.includes(DocumentType)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  //#endregion public-methods
  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // RFQ Health Form All date Formate Change
  private _DateFormat() {
    this.RFQHealthForm.patchValue({
      PreviousPolicyStartDate: this._datePipe.transform(this.RFQHealthForm.get('PreviousPolicyStartDate').value, 'yyyy-MM-dd'),
      PreviousPolicyEndDate: this._datePipe.transform(this.RFQHealthForm.get('PreviousPolicyEndDate').value, 'yyyy-MM-dd'),
    })
    this.PolicyPersonsArray.controls.forEach((element, index) => {
      element.patchValue({
        DOB: this._datePipe.transform(element.get('DOB').value, 'yyyy-MM-dd')
      })
    })
  }

  // gender and relation in Persons Array
  private _RealtionGender() {
    this.PolicyPersonsArray.controls.forEach((element, index) => {
      element.patchValue({
        Gender: this.myMembers.at(index).Gender,
        Relation: this.myMembers.at(index).Relation,
      })
    })
  }

  // update gender of Self and Spouse in array
  private _genderOfSelfSpouse() {
    let female = '/assets/icons/woman.png'
    let male = '/assets/icons/male.png'
    if (this.RFQHealthForm.get('SelfGender').value == 'Male') {
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
    // updating gender and relation in person Array
    this._RealtionGender()
  }

  // clear data of member daughter & son
  private _clearFunction(member: string) {
    if (member == 'Daughter') {
      this.RFQHealthForm.get('noOfDaughter').patchValue(0)

    }
    if (member == 'Son') {
      this.RFQHealthForm.get('noOfSon').patchValue(0)

    }
  }

  // Build RFQ Health Main Form
  private _buildRFQHealthForm(data: RFQHealthDto) {
    let form = this.fb.group({
      Id: [0],
      TransactionId: [0],
      RFQDate: [],
      RFQNo: [],

      // [1] Basic details
      SubCategoryId: [0, [Validators.required,]],
      SubCategoryName: [''],
      SubCategoryCode: [''],
      PolicyType: ['', [Validators.required,]],
      CategoryType: ['', [Validators.required,]],
      PolicyPeriod: [0, [Validators.required,]], // chetan add new field

      // [2] Product  Category details
      SumInsured: [0, [Validators.required]],
      OtherSumInsured: [0, [Validators.required]],
      Deductible: [0, [Validators.required, Validators.min(1)]],
      PincodeId: [],
      Pincode: ['', [Validators.required]],
      ProposerMobileNo: ['', [Validators.required]], // chetan add new field
      ProposerEmail: ['', [Validators.required]], // chetan add new field

      // [2] Product  Category details >>> [2.1] >>> Details of Proposed Insured & Family (if applicable)
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

      // [3] Previous Policy Details (Only for Rollover)
      PrevPolicyInsurComp: ['', [Validators.required, this.noWhitespaceValidator]],
      PrevPolicyType: ['', [Validators.required, this.noWhitespaceValidator]],
      PreviousPolicyStartDate: ['', [Validators.required]],
      PreviousPolicyEndDate: ['', [Validators.required]],
      ClaimInPreviousYear: [false, [Validators.required]],
      PrevPolicySumInsured: [0, [Validators.required]],
      PreviousPolicyPremium: [0, [Validators.required]],
      AnyClaiminLast3Year: [false],

      // [4] Team Details
      BranchId: [0, [Validators.required]],
      BranchName: ['', [Validators.required]],
      SalesPersonType: [''],
      BDOName: [],
      BDOId: [],
      BDMId: [],
      BDMName: [],
      SalesPersonId: [],
      SalesPersonName: ['', [Validators.required]],
      TeamReferenceId: [null],
      TeamReferenceName: ['', [Validators.required]],

      // 5. Attachment Details
      Documents: this._buildDocumentsForm(data.Documents),
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
    });

    if (data) {
      form.patchValue(data);
    }

    return form;
  }

  //Build  policy Person Formarray
  private _buildPolicyPersonForm(items: PolicyPersonsDto[] = []): FormArray {
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

  //Init policy Person Formgroup
  private _initPolicyPersonForm(item: PolicyPersonsDto): FormGroup {
    let pPF = this.fb.group({
      Id: [0],
      RFQId: [0],
      Relation: [],
      Name: ['', [Validators.required, this.noWhitespaceValidator]],
      DOB: ['', [Validators.required]],
      Gender: [],
      Remark: ['', [Validators.required, this.noWhitespaceValidator]],
      SmokerTibco: [null],
      SmokerTibcoDescription: [''],
      ExistingIllness: [null],
      ExistingIllnessDetail: this._buildExistingIllnessDetailForm(),
      SumInsured: [0, [Validators.required]],
      OtherSumInsured: [0, [Validators.required]],
      Deductible: [0, [Validators.required]],
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



  //RFQ-health document Formarray
  private _buildDocumentsForm(items: DocumentsDto[] = []): FormArray {
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

  //Init document formgroup
  private _initDocumentsForm(item: DocumentsDto): FormGroup {
    let dF = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      DocumentTypeName: [''],
      FileName: ['', [Validators.required, this.noWhitespaceValidator]],
      StorageFileName: [''],
      StorageFilePath: ['', [Validators.required, this.noWhitespaceValidator]],
      Description: [''], // remarks
      Stage: ['']
    })
    if (item != null) {
      if (!item) {
        item = new DocumentsDto();
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

  //Policy person Illness Details form
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

  // binding Illness from popUp to corresponding person ExistingIllnessDetail
  private _bindExistingIllnessDetail(indexNumber: number, result: ExistingIllnessDetailDto) {
    this.PolicyPersonsArray.at(indexNumber).get('ExistingIllnessDetail').patchValue({
      OtherExistDisease: result.OtherExistDisease,
      Thyroid: result.Thyroid,
      Asthma: result.Asthma,
      CholesterolDisorDr: result.CholesterolDisorDr,
      Heartdisease: result.Heartdisease,
      Hypertension: result.Hypertension,
      Diabetes: result.Diabetes,
      Obesity: result.Obesity,
    });
  }

  // change in form values
  private _valChange() {
    this.RFQHealthForm.get('SelfCoverRequired').valueChanges.subscribe((value) => {
      this.members()
    })

    this.RFQHealthForm.get('SpouseCoverRequired').valueChanges.subscribe((value) => {
      this.members()
    })

    this.RFQHealthForm.get('MotherCoverRequired').valueChanges.subscribe((value) => {
      this.members()
    })

    this.RFQHealthForm.get('FatherCoverRequired').valueChanges.subscribe((value) => {
      this.members()
    })

    this.RFQHealthForm.get('DaughterCoverRequired').valueChanges.subscribe(
      (value) => {
        if (value == true) {
          this.RFQHealthForm.get('noOfDaughter').patchValue(1);
        } else {
          this.RFQHealthForm.get('noOfDaughter').patchValue(0);
        }
        this.members()
      }
    );

    this.RFQHealthForm.get('SonCoverRequired').valueChanges.subscribe(
      (value) => {
        if (value == true) {
          this.RFQHealthForm.get('noOfSon').patchValue(1);
        } else {
          this.RFQHealthForm.get('noOfSon').patchValue(0);
        }
        this.members()
      }
    );

    this.RFQHealthForm.get('noOfSon').valueChanges.subscribe((value) => {
      if (
        parseInt(value) +
        parseInt(this.RFQHealthForm.get('noOfDaughter').value) >
        3
      ) {
        this.RFQHealthForm.get('noOfDaughter').patchValue(
          3 - parseInt(value)
        );
        this.removeMemberFromPolicyPersons('Daughter', 2)
      }
      this.members()
    });

    this.RFQHealthForm.get('noOfDaughter').valueChanges.subscribe((value) => {
      if (
        parseInt(value) + parseInt(this.RFQHealthForm.get('noOfSon').value) >
        3
      ) {
        this.RFQHealthForm.get('noOfSon').patchValue(3 - parseInt(value));
        this.removeMemberFromPolicyPersons('Son', 2)
      }
      this.members()
    });


  }

  // count total number of Illness
  private _countIllness(index: number) {
    let count: number = 0
    let Illness = ['OtherExistDisease', 'Thyroid', 'Obesity', 'Hypertension', 'Heartdisease', 'Diabetes', 'CholesterolDisorDr', 'Asthma']
    Illness.forEach((element) => {
      if (this.inf.controls[index].get('ExistingIllnessDetail').get(element).value == true) {
        count = count + 1
      }
    })
    return count
  }

  // form changes 
  private _onFormChange() {

    // changes product type
    this.RFQHealthForm.get('SubCategoryId').valueChanges.subscribe(val => {

      let SelectedSubCategory = this.SubCategoryList.find(x => x.Id == val)
      if (SelectedSubCategory) {
        this.RFQHealthForm.patchValue({
          SubCategoryName: SelectedSubCategory.Name,
          SubCategoryCode: SelectedSubCategory.Code
        })
      }
      else {
        this.RFQHealthForm.patchValue({
          SubCategoryName: "",
          SubCategoryCode: ""
        })
      }
    })

    // change pincode
    this.RFQHealthForm.get('Pincode').valueChanges.subscribe((val) => {
      this.pincodes$ = this._MasterListService.getFilteredPincodeList(val).pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              let result = Array.from(
                res.Data.Items.reduce(
                  (m, t) => m.set(t.PinCode, t),
                  new Map()
                ).values()
              );
              result = result.filter((el) => {
                if (el.PinCode) {
                  return el;
                }
              });
              return of(result);
            } else {
              return of([]);
            }
          } else {
            return of([]);
          }
        })
      );
    });


    // change sales person
    this.RFQHealthForm.get('SalesPersonName').valueChanges.subscribe((val) => {

      let salesPersonListSpecs = this._salesPersonListAPIfilter();
      salesPersonListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })


      this.salesPersonName$ = this._MasterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", salesPersonListSpecs.FilterConditions.Rules,salesPersonListSpecs.AdditionalFilters)
        .pipe(
          takeUntil(this.destroy$),
          switchMap((res) => {
            if (res.Success) {
              if (res.Data.Items.length) {
                return of(res.Data.Items);
              } else {
                return of([]);
              }
            } else {
              return of([]);
            }
          })
        );
    });

    this.RFQHealthForm.get('TeamReferenceId').valueChanges.subscribe(
      (val) => {
        if (!val && this.UserProfileObj.UserType == UserTypeEnum.StandardUser && this.RFQHealthForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {
          this.RFQHealthForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );


    this.RFQHealthForm.get('SalesPersonId').valueChanges.subscribe(
      (val) => {
        if (!val && this.UserProfileObj.UserType == UserTypeEnum.StandardUser && this.RFQHealthForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
          this.RFQHealthForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );

    this.RFQHealthForm.get('BranchId').valueChanges.subscribe((val) => {
      this._TeamDetailsForStandardUser()
    })

    this.RFQHealthForm.get('SalesPersonType').valueChanges.subscribe((val) => {
      this._TeamDetailsForStandardUser()
    })

    // change Team Referance
    this.RFQHealthForm.get('TeamReferenceName').valueChanges.subscribe(
      (val) => {

        let teamReferenceListSpecs = this._teamReferenceListAPIfilter();
        teamReferenceListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })

        this.TeamRefUser$ = this._MasterListService
          .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", teamReferenceListSpecs.FilterConditions.Rules,teamReferenceListSpecs.AdditionalFilters)
          .pipe(
            takeUntil(this.destroy$),
            switchMap((res) => {
              if (res.Success) {
                if (res.Data.Items) {
                  return of(res.Data.Items);
                } else {
                  return of([]);
                }
              } else {
                return of([]);
              }
            })
          );
      }
    );

    // change Proposal Type
    this.RFQHealthForm.get('PolicyType').valueChanges.subscribe((val) => {

      if (val == HealthPolicyType.New) {
        this.RFQHealthForm.patchValue({
          PrevPolicyInsurComp: null,
          PrevPolicyType: null,
          PreviousPolicyStartDate: "",
          PreviousPolicyEndDate: "",
          ClaimInPreviousYear: false,
          PrevPolicySumInsured: 0,
          PreviousPolicyPremium: 0,
          AnyClaiminLast3Year: false
        });

        // clear error alert
        this.PrevPolicyDetailAlerts = []
      }
    });

    // change Policy Type
    this.RFQHealthForm.get('CategoryType').valueChanges.subscribe((val) => {

      // In case of PolicyType is equal to "Multi Individual" then Sum Insured, Sum Insured Top-Up and Deductible is null
      if (val == HealthCategoryType.MultiIndividual) {

        this.RFQHealthForm.patchValue({
          SumInsured: 0,
          OtherSumInsured: 0,
          Deductible: 0,
        });

      }
      else {
        // In case of PolicyType is not equal to "Multi Individual" then Members individual Sum Insured, Sum Insured Top-Up and Deductible is null
        for (let j = this.RFQHealthForm.get('Members').value.length - 1; j >= 0; j--) {
          this.PolicyPersonsArray.controls[j].get('SumInsured').patchValue(0);
          this.PolicyPersonsArray.controls[j].get('OtherSumInsured').patchValue(0);
          this.PolicyPersonsArray.controls[j].get('Deductible').patchValue(0);
        }
      }

    });

    this.RFQHealthForm.get('BDOName').valueChanges.subscribe((val) => {
      let bdoListSpecs = this._bdoListAPIfilter()
      bdoListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })


      this.BDOlist$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', bdoListSpecs.FilterConditions.Rules,bdoListSpecs.AdditionalFilters).pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              return of(res.Data.Items);
            } else {
              return of([]);
            }
          } else {
            return of([]);
          }
        })
      );
    });

    this.RFQHealthForm.get('BDMName').valueChanges.subscribe((val) => {
      let bdmListSpecs = this._bdmListAPIfilter()
      bdmListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })

      this.BDMlist$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', bdmListSpecs.FilterConditions.Rules,bdmListSpecs.AdditionalFilters).pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              return of(res.Data.Items);
            } else {
              return of([]);
            }
          } else {
            return of([]);
          }
        })
      );
    });

  }

  // fill master data
  private _fillMasterList() {

    let ActiveDataRule: IFilterRule[] = [ActiveMasterDataRule]

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

          if (this.mode == "view") {
            let SelectedSubCategory = this.SubCategoryList.find(x => x.Id == this.RFQHealthForm.get("SubCategoryId").value)
            if (SelectedSubCategory) {
              this.RFQHealthForm.patchValue({
                SubCategoryName: SelectedSubCategory.Name,
                SubCategoryCode: SelectedSubCategory.Code
              })
            }
          }
        }
      })

    // fill Branch
    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List + "/true", 'Name', "", ActiveDataRule)
      .subscribe(res => {
        if (res.Success) {
          this.Branchs = res.Data.Items
          /**
           * After Get Branch list Fill Team details 
           */
          if (this.mode == 'create') {
            this._TeamDetailsInfo()
          }
        }
      });

    // Fill Insurance Company
    let InsuranceCompanyRule: IFilterRule[] = [
      {
        Field: 'Status',
        Operator: 'eq',
        Value: 1,
      }
    ];

    let InsuranceCompanyAdditionalFilters: IAdditionalFilterObject[] = [
      { key: "CatagoryCode", filterValues: [CategoryCodeEnum.Health] }
    ]

    this.InsuranceCompany$ = this._MasterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.InsuranceCompany.list, 'Name', "", InsuranceCompanyRule, InsuranceCompanyAdditionalFilters)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              return of(res.Data.Items);
            } else {
              return of([]);
            }
          } else {
            return of([]);
          }
        })
      );


    // Fill Insurance Company
    let FinancialYearRule: IFilterRule[] = [ActiveMasterDataRule];


    this._MasterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.FinancialYear.List, 'FYCode', "", FinancialYearRule)
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.FinancialYearList = res.Data.Items
          } else {
            this.FinancialYearList = [];
          }
        } else {
          this.FinancialYearList = []
        }
      })


  }

  private _validateAttachDocField() {

    this.AttachDocumentAlerts = []

    this.document.controls.forEach((element, index) => {
      if (element.get('StorageFilePath').hasError('required')) {

        this.AttachDocumentAlerts.push({
          Message: `${element.value.DocumentType} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });

  }

  // sum of sum insured in case of policy type  is "multi individual" then all members sum insured is sum
  private sumOfSumInsured() {
    let SumInsured = 0;
    let OtherSumInsured = 0;
    let Deductible = 0;

    if (this.RFQHealthForm.get('CategoryType').value == HealthCategoryType.MultiIndividual) {

      for (let j = this.RFQHealthForm.get('Members').value.length - 1; j >= 0; j--) {
        SumInsured += parseFloat(this.PolicyPersonsArray.controls[j].get('SumInsured').value);
        OtherSumInsured += parseFloat(this.PolicyPersonsArray.controls[j].get('OtherSumInsured').value);
        Deductible += parseFloat(this.PolicyPersonsArray.controls[j].get('Deductible').value);
      }

      this.RFQHealthForm.patchValue({
        SumInsured: SumInsured,
        OtherSumInsured: OtherSumInsured,
        Deductible: Deductible,
      });

    }

  }

  // member deatils from RFQ Health form
  private memberDispalyDetails(member) {

    member.forEach((element, index) => {
      this.SetCoverEdit(element.Relation, true)
      if (element.Relation == 'Self') {
        this.SelfGender = element.Gender
        this._genderofSelfAndSpouse(element.Gender)
      }
    })
  }

  // update gender of Self and spouse in HealthQuateForm
  private _genderofSelfAndSpouse(choice) {
    this.SelfGender = choice;
    this.RFQHealthForm.patchValue({
      SelfGender: this.SelfGender,
    });

    if (this.RFQHealthForm.get('SelfGender').value == 'Male') {
      this.RFQHealthForm.patchValue({
        SpouseGender: 'Female',
      });
    } else {
      this.RFQHealthForm.patchValue({
        SpouseGender: 'Male',
      });
    }
    this._genderOfSelfSpouseInArray()
    this.members()
  }

  // update gender of self and spouse in allMemberCard array
  private _genderOfSelfSpouseInArray() {
    let female = '/assets/icons/woman.png'
    let male = '/assets/icons/male.png'
    if (this.RFQHealthForm.get('SelfGender').value == 'Male') {
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

  // insured members data from RFQ health form
  public SetCoverEdit(member: string, answer) {
    let Answer = answer
    this.RFQHealthForm.patchValue({
      [member + 'CoverRequired']: Answer,
    });
    this._countDaughterSon(member)
    this.members()
  }

  // counting number of Son and Daughter
  private _countDaughterSon(child) {
    if (child == 'Daughter') {
      this.RFQHealthForm.patchValue({
        noOfDaughter: this.RFQHealthForm.get('noOfDaughter').value + 1
      })
    }

    if (child == 'Son') {
      this.RFQHealthForm.patchValue({
        noOfSon: this.RFQHealthForm.get('noOfSon').value + 1
      })
    }
  }


  // Team details from MyProfile
  private _TeamDetailsInfo() {
    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.UserProfileObj = user
        // set Branch details
        this.RFQHealthForm.patchValue({
          BranchId: user.BranchId,
          BranchName: user.BranchName,
        });

        // ************* set required field from user profile data ************* \\
        // set User type from user profile
        if (user.UserType == UserTypeEnum.Agent) {

          this.RFQHealthForm.patchValue({
            SalesPersonId: user.Id,
            SalesPersonName: user.FullName,
            SalesPersonType: 'POSP',
            BDMId: user.BDMId,
            BDMName: user.BDMName,
            BDOId: user.BDOId,
            BDOName: user.BDOName,
          }, { emitEvent: false });

        }
        else if (user.UserType == UserTypeEnum.TeamReference) {
          // in case of login user type is "team reference" then auto bind data in team reference id and team reference name from user profile api
          this.RFQHealthForm.patchValue({
            TeamReferenceId: user.Id,
            TeamReferenceName: user.FullName,
            SalesPersonType: 'Team Reference',
            BDMId: user.BDMId,
            BDMName: user.BDMName,
            BDOId: user.BDOId,
            BDOName: user.BDOName,
          }, { emitEvent: false });


          if (this.RFQHealthForm.value?.BranchId) {

            let LoginUserBranch = this.Branchs.find(b => b.Id == this.RFQHealthForm.value?.BranchId)
            if (LoginUserBranch) {
              this.RFQHealthForm.patchValue({
                SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
                SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
              }, { emitEvent: false });
            }

          }


        }
      }
    })

  }


  /**
   * When Login use is Standard user then 
   * change branch or Sales person type then call function
   */

  private _TeamDetailsForStandardUser() {
    if (this.UserProfileObj.UserType == UserTypeEnum.StandardUser) {

      /**
       * SalesPersonType Direct sales person is Selected branch bqp
       * Other Field is null
       */
      if (this.RFQHealthForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {


        let LoginUserBranch = this.Branchs.find(b => b.Id == this.RFQHealthForm.get('BranchId').value)


        if (LoginUserBranch) {
          this.RFQHealthForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.RFQHealthForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.RFQHealthForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });

      } else if (this.RFQHealthForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {

        this.RFQHealthForm.patchValue({
          SalesPersonId: null,
          SalesPersonName: null,
          TeamReferenceId: null,
          TeamReferenceName: null,
        });


        /**
         * SalesPersonType TeamReference sales person is Selected branch bqp
         * Other Field is null
         */
      } else if (this.RFQHealthForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {

        let LoginUserBranch = this.Branchs.find(b => b.Id == this.RFQHealthForm.value?.BranchId)
        if (LoginUserBranch) {
          this.RFQHealthForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.RFQHealthForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.RFQHealthForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });
      }


      this.RFQHealthForm.patchValue({
        BDMId: null,
        BDMName: null,
        BDOId: null,
        BDOName: null,
      });

    }
  }

  /**
* Sales person list data List API query spec
* @returns 
*/
  private _salesPersonListAPIfilter(): QuerySpecs {
    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    /**
     * Sales person Type - "POSP"
     * Login BDO/BDM- POSP need to display under Sales person
     */
    if (this.RFQHealthForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQHealthForm.get('BranchId').value, }
      ]
    }

    if (this.RFQHealthForm.get('SalesPersonType').value == "POSP") {
      specs.FilterConditions.Rules = [
        ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQHealthForm.get('BranchId').value, }
      ];
    }


    if (this.RFQHealthForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.RFQHealthForm.get('SalesPersonType').value == "POSP") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['Agent'] })
      specs.AdditionalFilters.push({ key: 'RFQSalesPersonOnly', filterValues: ['true'] })
    }

    return specs;
  }

  /**
  * Team ref. list data List API query spec
  * @returns 
  */
  private _teamReferenceListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    /**
         * Sales Person Type -"Team Reference"
         * Login BDO/BDM- Team Reference need to display under Team Reference
         */
    if (this.RFQHealthForm.get('SalesPersonType').value == "Team Reference") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQHealthForm.get('BranchId').value, }
      ];
    }

    if (this.RFQHealthForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.RFQHealthForm.get('SalesPersonType').value == "Team Reference") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['TeamReference'] })
      specs.AdditionalFilters.push({ key: 'RFQSalesPersonOnly', filterValues: ['true'] })
    }

    return specs;
  }

  /**
  * BDO list data List API query spec
  * @returns 
  */
  private _bdoListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    if (this.RFQHealthForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule];
    }

    if (this.RFQHealthForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDOOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.RFQHealthForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.RFQHealthForm.get('BranchId').value?.toString()] })
      }
    }


    return specs;
  }

  /**
    *BDM list data List API query spec
    * @returns 
    */
  private _bdmListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    if (this.RFQHealthForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule];
    }

    if (this.RFQHealthForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDMOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.RFQHealthForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.RFQHealthForm.get('BranchId').value?.toString()] })
      }
    }

    return specs;
  }
  //#endregion Private methods
}
