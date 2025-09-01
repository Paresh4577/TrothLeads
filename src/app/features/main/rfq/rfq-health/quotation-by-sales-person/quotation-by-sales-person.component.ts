import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert, IFilterRule, OrderBySpecs } from '@models/common';
import { IKYCDocuments, IPrevPolicyDetail, IQuotationNomineeDetails, PrevPolicyDetail, RfqHealthQuotation, iQnQuotationDocument, iQuotationDocument, iQuotationPerson, iRfqHealthQuotation } from '@models/dtos/config/RFQHealth';
import { Subject } from 'rxjs';
import { CategoryCodeEnum, HealthPolicyKYCDocumentType, SubCategoryCodeEnum } from 'src/app/shared/enums';
import { environment } from 'src/environments/environment';
import { QuotationBySalesPersonService } from './quotation-by-sales-person.service';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { HealthPolicyTenure } from 'src/app/shared/enums/rfq-health/HealthPolicyTenure.enum';
import { PolicyTenureList, CategoryTypeList, HealthPrevPolicyCliamStatus } from '@config/rfq';
import { MasterListService } from '@lib/services/master-list.service';
import { DisplayedPolicyType } from '@config/transaction-entry/transactionPolicyType.config';
import { IRaiseDocumentsDto, RaiseDocumentsDto } from '@models/dtos/config/RFQHealth/quotation-note';
import { DialogService } from '@lib/services/dialog.service';
import { HealthCategoryType, HealthPolicyType } from 'src/app/shared/enums/rfq-health';
import { MatStepper } from '@angular/material/stepper';
import { RFQHealthService } from '../rfq-health/rfqhealth.service';
import { RFQExistingIllnessDetailsComponent } from '../rfqexisting-illness-details/rfqexisting-illness-details.component';
import * as moment from 'moment';
import { IFinancialYearDto } from '@models/dtos/core/FinancialYearDto';
import { RFQDocumentsDrpList } from '@config/rfq';
import { RfqService } from '../../rfq.service';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-quotation-by-sales-person',
  templateUrl: './quotation-by-sales-person.component.html',
  styleUrls: ['./quotation-by-sales-person.component.scss'],
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
export class QuotationBySalesPersonComponent {
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;
  @ViewChild('stepper') stepper: MatStepper;
  pagetitle: string; // Page main header title
  mode: string; // for identify of Raise page is create or edit or view
  SelfGender: string; // store gender 
  ProposerName: string;
  myMembers; // store selected member icon path
  allMemberCard; // to store display Member icon in card
  PolicyPersonsArray // store insured person details

  UploadFileAPI: string = API_ENDPOINTS.Attachment.Upload; // Upload document API

  PANNumValidationReg: RegExp = ValidationRegex.PANNumValidationReg; // PAN number Validation regex
  UIDNumValidationReg: RegExp = ValidationRegex.UIDNumValidationReg; //Aadhar/UID number Validation regex
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg; // Email Validation regex
  detailsFieldsList: any[] // A list of Insured person Questionary
  DropdownMaster: dropdown; // Dropdown master data
  QuotationSelectionForm: FormGroup; // Quotation selection Form group
  QuotationSelection: iRfqHealthQuotation; // Quotation selection Form group Value
  displayValuesOfForm // to store for display RFQ Details
  SubCategoryList = [];

  isExpand: boolean = false;

  // Step Control
  QuotationSelectionStepCtrl = new FormControl(); // Step Validation Control
  ProductCategoryDetailsStepCtrl = new FormControl(); // Step Validation Control
  KYCDetailsStepCtrl = new FormControl(); // Step Validation Control
  PaymentModeDetailsStepCtrl = new FormControl(); // Step Validation Control

  QuotationSelectionAlerts: Alert[] = []; // Step wise Error alert Array
  ProductCategoryDetailsAlert: Alert[] = []; // Step wise Error alert Array
  KYCDetailsAlerts: Alert[] = []; // Step wise Error alert Array
  PaymentModeDetailsAlert: Alert[] = []; // Step wise Error alert Array
  PrevPolicyClaimsDetailAlerts: Alert[] = [];
  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  FinancialYearList: IFinancialYearDto[] = []
  destroy$: Subject<any>;
  isLinear: boolean; // Flag For Stepper linear open
  maxBirthDate: Date; // Set insured People Max Birth date Validator

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
    public _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _quotationBySalesPersonService: QuotationBySalesPersonService,
    private _MasterListService: MasterListService,
    private _dialogService: DialogService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
    private _datePipe: DatePipe,
    private _RFQHealthService: RFQHealthService,
    private _RfqService: RfqService,
  ) {
    this.DropdownMaster = new dropdown();
    //Set max birthdate As last Three month before
    this.maxBirthDate = new Date(Date.now());
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);
    this.destroy$ = new Subject();
    this.isLinear = true; // Set Stepper linear true
    this._fillMasterList()
    this.SelfGender = 'Male';
    this.allMemberCard = this._RFQHealthService.memberCardArray()
  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {


    //Get Route Params Data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title']
    this.QuotationSelection = data['data']
    this.displayValuesOfForm = data['data']
    this.mode = data['mode']

    // If Only One Quotation is Avalable then Selected 
    if (this.QuotationSelection.QNDocuments.length == 1) {
      this.QuotationSelection.QNDocuments[0].Buy = true
    }

    // initialize Main Form & bind Value
    this.QuotationSelectionForm = this._buildForm(this.QuotationSelection);

    // Get Inssuerd Person Questionary list
    this.detailsFieldsList = this._quotationBySalesPersonService.getdetailsFieldsList()
    // Disable Form Field
    this._FormFieldDisable()
    this._OnformChange()

    this.myMembers = [];
    // Policy Person Form Array
    this.PolicyPersonsArray = this.QuotationSelectionForm.get('Members') as FormArray;
    this.memberDispalyDetails(this.QuotationSelectionForm.get('Members').value)
    this._genderOfSelfSpouseInArray()

    if (this.displayValuesOfForm.AnyClaiminLast3Year && this.PrevPolicyDetail.controls?.length == 0) {
      this.AddExistingPolicyDetails()
    }

    if (this.mode == "view") {
      this.QuotationSelectionForm.disable();
    }

    this.ProposerName = this.PolicyPersonsArray?.value[0]?.Name;
  }

  ngAfterViewInit(): void {
    this.stepper.next();
    this.stepper.next();
    this._cdr.detectChanges();
  }


  //#endregion lifecyclehooks

  //#region public-getters

  get f() {
    return this.QuotationSelectionForm.controls;
  }
  get inf() {
    return this.QuotationSelectionForm.get('Members') as FormArray;
  }

  public nominees(ind: any) {
    return (this.inf.controls[ind] as FormArray).controls['NomineeDetails'] as FormArray;
  }

  get QNselection() {
    return this.QuotationSelectionForm.get('QNDocuments') as FormArray;
  }

  get HealthTopUpQNDocuments() {
    return this.QuotationSelectionForm.get('HealthTopUpQNDocuments') as FormArray;
  }

  get RaiseDocuments() {
    return this.QuotationSelectionForm.get('Documents') as FormArray
  }

  get TotalGrossPremium() {

    let TotalGrossPremium = 0
    let Quotation = this.QNselection.value.find(ele => ele.Buy == true)
    let RFQHealthTopUpPlanQuotation = this.HealthTopUpQNDocuments.value.find(ele => ele.Buy == true)

    if (Quotation) {
      TotalGrossPremium += Quotation.GrossPremium
    }

    if (RFQHealthTopUpPlanQuotation) {
      TotalGrossPremium += RFQHealthTopUpPlanQuotation.GrossPremium
    }

    return TotalGrossPremium
  }

  get displayQNLabel() {

    if (this.QuotationSelectionForm.get('SubCategoryCode').value == SubCategoryCodeEnum.MediclaimTopUpPlan) {
      return 'Mediclaim'
    } else {
      return this.QuotationSelectionForm.get('SubCategoryName').value
    }

  }

  get canDisplayTopUpPaymentAccountName() {
    if (this.HealthTopUpQNDocuments.value.some(ele => ele.Buy == true)) {
      return true;
    } else {
      return false
    }
  }

  get canDisplayPaymentAccountName() {
    if (this.QNselection.value.some(ele => ele.Buy == true)) {
      return true;
    } else {
      return false
    }
  }


  get PolicyDocumentAttachment() {
    return this.RaiseDocuments.controls;
  }

  // Get Health Policy KYC Document Type From Config file
  public get HealthPolicyKYCDocumentTypeEnum() {
    return HealthPolicyKYCDocumentType
  }

  // Get sum Insured Amount From Config file
  public get HealthPolicyTenure() {
    return HealthPolicyTenure
  }

  // Get Health Policy From Config file
  public get HealthPolicyType() {
    return HealthPolicyType
  }

  // Get Health Category From Config file
  get CategoryTypeList() {
    return CategoryTypeList
  }
  // Get Health Policy Tenure From Config file
  get PolicyTenureList() {
    return PolicyTenureList
  }

  // Get Policy Type
  get PolicyTypeList() {
    if (this.displayValuesOfForm?.TransactionId) {
      return DisplayedPolicyType.rfqHealthRenewalPolicyType
    }
    else {
      return DisplayedPolicyType.rfqHealthPolicyType
    }
  }

  // Get Health Policy From Config file
  public get HealthCategoryType() {
    return HealthCategoryType
  }

  // Get Health SubCategory From Config file
  get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum
  }

  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Health))
  }

  get PrevPolicyDetail() {
    return this.QuotationSelectionForm.controls["PrevPolicyDetail"] as FormArray;
  }


  get PrevPolicyCliamStatus() {
    return HealthPrevPolicyCliamStatus
  }


  //#endregion public-getters


  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

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
    const dialogRef = this.dialog.open(
      RFQExistingIllnessDetailsComponent,
      dialogConfig
    );

  }

  // adding members in myMember array
  public members() {

    this.myMembers = [];
    if (
      this.QuotationSelectionForm.get('SelfCoverRequired').value == true &&
      this.QuotationSelectionForm.get('SelfGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Self' });
    }
    if (
      this.QuotationSelectionForm.get('SelfCoverRequired').value == true &&
      this.QuotationSelectionForm.get('SelfGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Self' });
    }
    if (
      this.QuotationSelectionForm.get('SpouseCoverRequired').value == true &&
      this.QuotationSelectionForm.get('SpouseGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Spouse' });
    }
    if (
      this.QuotationSelectionForm.get('SpouseCoverRequired').value == true &&
      this.QuotationSelectionForm.get('SpouseGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Spouse' });
    }
    if (
      this.QuotationSelectionForm.get('DaughterCoverRequired').value == true &&
      this.QuotationSelectionForm.get('noOfDaughter').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter' });
    }
    if (
      this.QuotationSelectionForm.get('DaughterCoverRequired').value == true &&
      this.QuotationSelectionForm.get('noOfDaughter').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter1' });
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter2' });
    }
    if (
      this.QuotationSelectionForm.get('DaughterCoverRequired').value == true &&
      this.QuotationSelectionForm.get('noOfDaughter').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter3' });
    }

    if (
      this.QuotationSelectionForm.get('SonCoverRequired').value == true &&
      this.QuotationSelectionForm.get('noOfSon').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son' });
    }
    if (
      this.QuotationSelectionForm.get('SonCoverRequired').value == true &&
      this.QuotationSelectionForm.get('noOfSon').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son1' });
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son2' });
    }
    if (
      this.QuotationSelectionForm.get('SonCoverRequired').value == true &&
      this.QuotationSelectionForm.get('noOfSon').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son3' });
    }
    if (this.QuotationSelectionForm.get('MotherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/mother.png', title: 'Mother' });
    }
    if (this.QuotationSelectionForm.get('FatherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/father.png', title: 'Father' });
    }

  }

  // insured members data from RFQ health form
  public SetCover(member: string, answer) {
    let Answer = answer
    this.QuotationSelectionForm.patchValue({
      [member + 'CoverRequired']: Answer,
    });
    this._countDaughterSon(member)
    this.members()
  }

  /**
    * Check step two Invalid Formfield
    */
  public QuotationSelectionValidation() {
    this.QuotationSelectionAlerts = [];

    if (this.mode != "view") {
      if ((this.QNselection.value?.length && !this.QNselection.value.some(ele => ele.Buy == true)) &&
        (!this.HealthTopUpQNDocuments.value.some(ele => ele.Buy == true))
      ) {
        this.QuotationSelectionAlerts.push({
          Message: `Quotation Selection is Required`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      //   if (this.HealthTopUpQNDocuments.controls.length > 0) {
      //     if (!this.HealthTopUpQNDocuments.value.some(ele => ele.Buy == true)) {
      //     this.QuotationSelectionAlerts.push({
      //       Message: `Quatation - Top Up/Mediclaim + Top up Selection is Required`,
      //       CanDismiss: false,
      //       AutoClose: false,
      //     })
      //   }
      // }
    }

    /**
    *  Step control Validate
    */
    if (this.QuotationSelectionAlerts.length > 0) {
      this.QuotationSelectionStepCtrl.setErrors({ required: true });
      return this.QuotationSelectionStepCtrl;
    } else {
      this.QuotationSelectionStepCtrl.reset();
      return this.QuotationSelectionStepCtrl;
    }
  }

  /**
    * Display Error message 
    */
  public QuotationSelectionError() {
    if (this.QuotationSelectionAlerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAlerts);
    }
  }

  /**
  * Check step Three Invalid Formfield
  */
  public ProductCategoryDetailsValidation() {
    this.ProductCategoryDetailsAlert = [];

    if (this.mode != "view") {
      this.inf.controls.forEach((person, i) => {

        if (person.get("Name").hasError("required")) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Enter Name`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (person.get("SmokerTibco").hasError("required")) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Select Smoke/Drink/Chew Tobacco`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (person.get("TakingMedicine").value == 'true' || person.get("TakingMedicine").value == true) {
          if (!person.get("MedicineRunningYears").value) {
            this.ProductCategoryDetailsAlert.push({
              Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Enter Medicine name`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }

        if (person.get("RunningMedicineName").value) {
          if (!person.get("MedicineRunningYears").value) {
            this.ProductCategoryDetailsAlert.push({
              Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Enter No. of years for which medicine is taken`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }

        if (person.get("ExistingIllnessDetail.Anysurgery").hasError("required")) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Select Undergone any surgery (or) any treatment taken till date?`,
            CanDismiss: false,
            AutoClose: false,
          })
        }


        if (person.get("ExistingIllnessDetail.Anysurgery").value == 'true') {
          if (!person.get("ExistingIllnessDetail.SurgeryDescription").value) {
            this.ProductCategoryDetailsAlert.push({
              Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - provide details of treatment taken`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }


        if (person.get("HeightFeetInch").hasError("required") && person.get("HeightCM").hasError("required")) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Enter Height  Eigther  Feet/Inch or CM`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        // if (person.get("HeightCM").hasError("required")) {
        //   this.ProductCategoryDetailsAlert.push({
        //     Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Enter Height (CM)`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }
        if (person.get("Weight").hasError("required")) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Enter Weight`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
        if (person.get("Marital").hasError("required")) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Select Marital Status`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
        if (person.get("Occupation").hasError("required")) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Enter Occupation`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (person.get("NomineeDetails").value.length > 0) {
          person.get("NomineeDetails").value.forEach((nominee) => {

            // Nominee Name
            if (nominee.Name == "" || nominee.Name == null || nominee.Name == undefined) {
              this.ProductCategoryDetailsAlert.push({
                Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Enter Nominee Name`,
                CanDismiss: false,
                AutoClose: false,
              })
            }

            // Nominee DOB
            if (nominee.DOB == "" || nominee.DOB == null || nominee.DOB == undefined) {
              this.ProductCategoryDetailsAlert.push({
                Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Enter DOB of Nominee`,
                CanDismiss: false,
                AutoClose: false,
              })
            }
            else {

              let NomineeAge = moment.duration(moment().diff(nominee.DOB));

              if (NomineeAge.years() < 18) {
                this.ProductCategoryDetailsAlert.push({
                  Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Nominee person should be atleast 18 years of age.`,
                  CanDismiss: false,
                  AutoClose: false,
                });
              }
            }

            // Nominee Name
            if (nominee.Relation == "" || nominee.Relation == null || nominee.Relation == undefined) {
              this.ProductCategoryDetailsAlert.push({
                Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Select Relation of Nominee with Proposer`,
                CanDismiss: false,
                AutoClose: false,
              })
            }

          });
        }

        // if (person.get("PrevPolicy").hasError("required")) {
        //   this.Step3alerts.push({
        //     Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Select Was Health insurance taken in Previous year`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (person.get("PrevPolicy").value == 'true') {
        //   if (!person.get("PrevPolicy1yearDescription").value) {
        //     this.Step3alerts.push({
        //       Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Enter Last 3 Years Policy Details`,
        //       CanDismiss: false,
        //       AutoClose: false,
        //     })
        //   }
        // }

        // if (person.get("ClaimMade").hasError("required")) {
        //   this.Step3alerts.push({
        //     Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Select Any Health Insurance Claim Made?`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (person.get("ClaimMade").value == 'true') {
        //   if (!person.get("ClaimMadeDescription").value) {
        //     this.Step3alerts.push({
        //       Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Enter Claim Deatils`,
        //       CanDismiss: false,
        //       AutoClose: false,
        //     })
        //   }
        // }

        if (person.get("ExistingIllnessDetail.AffectedByCorona").hasError("required")) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Select Affected by Corona anytime`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (person.get("ExistingIllnessDetail.AffectedByCorona").value == 'true') {
          if (!person.get("ExistingIllnessDetail.AffectedByCoronaDesc").value) {
            this.ProductCategoryDetailsAlert.push({
              Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Enter year in which affected`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

        }


        if (person.get("HospitalisedBefore").hasError("required")) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Have you ever been hospitalized before is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (person.get("HospitalisedBefore").value == 'true') {

          if (!person.get("HospitalisedYear").value) {
            this.ProductCategoryDetailsAlert.push({
              Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Date or Year of hospitalized is Required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (!person.get("TakenTreatment").value) {
            this.ProductCategoryDetailsAlert.push({
              Message: `${person.value.Relation == "Self" ? "Proposer" : "Member " + (i + 1)} - Treatment taken during hospitalization is Required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

        }

      })
    }


    this.PrevPolicyClaimsDetailAlerts = []

    if (this.displayValuesOfForm.PolicyType == HealthPolicyType.Rollover || this.displayValuesOfForm.PolicyType == 'Renewal-Change Company' || this.displayValuesOfForm.PolicyType == 'Renewal-Same Company') {

      if (this.displayValuesOfForm.AnyClaiminLast3Year) {

        this.PrevPolicyDetail.controls.forEach((pd, i) => {

          if (!pd.get('FinancialYearId').value) {
            this.PrevPolicyClaimsDetailAlerts.push({
              Message: `${i + 1} - Financial Year Is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (!pd.get('MemberName').value) {
            this.PrevPolicyClaimsDetailAlerts.push({
              Message: `${i + 1} - Member Name Is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (!pd.get('ReasonOfClaim').value) {
            this.PrevPolicyClaimsDetailAlerts.push({
              Message: `${i + 1} - Reason Of Claim Is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (!pd.get('Status').value) {
            this.PrevPolicyClaimsDetailAlerts.push({
              Message: `${i + 1} - Status Is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (!pd.get('ClaimApprovalAmount').value) {
            this.PrevPolicyClaimsDetailAlerts.push({
              Message: `${i + 1} - Claim Approved Amount Is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          // if (!pd.get('Premium').value) {
          //   this.PrevPolicyClaimsDetailAlerts.push({
          //     Message: `${i + 1} - Premium Amount Is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

        })


      }

    }
    /**
    * Step control Validate
    */
    if (this.ProductCategoryDetailsAlert.length > 0 || this.PrevPolicyClaimsDetailAlerts.length > 0) {
      this.ProductCategoryDetailsStepCtrl.setErrors({ required: true });
      return this.ProductCategoryDetailsStepCtrl;
    } else {
      this.ProductCategoryDetailsStepCtrl.reset();
      return this.ProductCategoryDetailsStepCtrl;
    }
  }

  /**
    * Display Error message 
    */
  public ProductCategoryDetailsError() {
    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
    }
    if (this.PrevPolicyClaimsDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PrevPolicyClaimsDetailAlerts);
    }
  }

  /**
  * Check step four Invalid Formfield
  */
  public KYCDetailsValidation() {
    this.KYCDetailsAlerts = [];

    if (this.mode != "view") {

      if (!this.QuotationSelectionForm.get('AadharNo').value) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter  Aadhar',
          CanDismiss: false,
          AutoClose: false,
        });
      } else if (!this.UIDNumValidationReg.test(this.QuotationSelectionForm.get('AadharNo').value)) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter valid Aadhar',
          CanDismiss: false,
          AutoClose: false,
        });
      }



      if (!this.QuotationSelectionForm.get('PANNo').value) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter  PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      } else if (!this.PANNumValidationReg.test(this.QuotationSelectionForm.get('PANNo').value)) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter valid PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      }

    }

    /**
    * Step control Validate
    */
    if (this.KYCDetailsAlerts.length > 0) {
      this.KYCDetailsStepCtrl.setErrors({ required: true });
      return this.KYCDetailsStepCtrl;
    } else {
      this.KYCDetailsStepCtrl.reset();
      return this.KYCDetailsStepCtrl;
    }
  }

  /**
    * Display Error message 
    */
  public KYCDetailsError() {
    if (this.KYCDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.KYCDetailsAlerts);
    }
  }

  /**
* Check step five Invalid Formfield
*/
  public PaymentModeDetailsValidation() {
    this.PaymentModeDetailsAlert = [];

    if (this.mode != "view") {
      if (this.QuotationSelectionForm.get("PaymentMode").hasError("required")) {
        this.PaymentModeDetailsAlert.push({
          Message: "Select any one PaymentMode",
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.QuotationSelectionForm.get("PaymentMode").value == 'Cheque') {
        if (!this.QuotationSelectionForm.get("PaymentAccountName").value) {
          this.PaymentModeDetailsAlert.push({
            Message: "Insurance Company - Full Name is required",
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }
    }
    /**
    * Step control Validate
    */
    if (this.PaymentModeDetailsAlert.length > 0) {
      this.PaymentModeDetailsStepCtrl.setErrors({ required: true });
      return this.PaymentModeDetailsStepCtrl;
    } else {
      this.PaymentModeDetailsStepCtrl.reset();
      return this.PaymentModeDetailsStepCtrl;
    }
  }

  /**
    * Display Error message 
    */
  public PaymentModeDetailsError() {
    if (this.PaymentModeDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.PaymentModeDetailsAlert);
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

    const row: IRaiseDocumentsDto = new RaiseDocumentsDto();

    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.PolicyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.PolicyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.PolicyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = "RFQQNSelectionSP";
        this.RaiseDocuments.push(this._initdQuotationDocumentForm(row));
      }
    }
  }

  // file data (policy document that is added)
  public SelectRFQDocument(event, DocIndex: number) {

    let file = event.target.files[0]

    if (file) {
      this._dataService.UploadFile(this.UploadFileAPI, file).subscribe((res) => {
        if (res.Success) {
          if (DocIndex >= 0) {
            this.RaiseDocuments.controls[DocIndex].patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.displayValuesOfForm.Stage
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

  public SelectKycDoc(event, DocumentType: string) {
    let file = event.target.files[0]

    if (file) {

      let FileName = file.name.split('.')
      if (FileName && FileName.length >= 2) {
        let fileExtention = FileName[FileName.length - 1]

        if (fileExtention.toLowerCase() == 'pdf') {

          this._dataService
            .UploadFile(this.UploadFileAPI, file)
            .subscribe((res) => {
              if (res.Success) {
                if (DocumentType == 'UID') {
                  this.QuotationSelectionForm.get('AadharDetails').patchValue({
                    FileName: res.Data.FileName,
                    StorageFileName: res.Data.StorageFileName,
                    StorageFilePath: res.Data.StorageFilePath,
                    Stage: this.QuotationSelectionForm.value.Stage,
                    DocumentType: DocumentType,
                  })
                }
                else if (DocumentType == 'PAN') {
                  this.QuotationSelectionForm.get('PANDetails').patchValue({
                    FileName: res.Data.FileName,
                    StorageFileName: res.Data.StorageFileName,
                    StorageFilePath: res.Data.StorageFilePath,
                    Stage: this.QuotationSelectionForm.value.Stage,
                    DocumentType: DocumentType,
                  })
                }

                this._alertservice.raiseSuccessAlert(res.Message);


              }
              else {
                this._alertservice.raiseErrors(res.Alerts);
              }
            });


        } else {
          this._alertservice.raiseErrorAlert("Please select a valid PDF File")
          return;
        }

      }
    }
  }

  public removeKycDoc(DocumentType: string) {
    if (DocumentType == 'UID') {
      this.QuotationSelectionForm.get('AadharDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
    }
    else if (DocumentType == 'PAN') {
      this.QuotationSelectionForm.get('PANDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
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
          this.RaiseDocuments.removeAt(index)
        }

      });


  }


  /**
   * Set true Selected quotation
   * @param index "Selected Quotation index"
   */
  public SelectBuy(index: number) {

    if (this.QNselection.controls[index].get('Buy').value) {
      this._alertservice.raiseErrorAlert('Quotation is already Selected.');
      return;
    }

    this.QNselection.controls.forEach((qn, i) => {
      if (i == index) {
        qn.get('Buy').setValue(true)
        if (this.QuotationSelectionForm.get('PaymentMode').value == 'Cheque') {
          this.QuotationSelectionForm.get('PaymentAccountName').patchValue(qn.value.InsuranceCompanyName)
        }
      } else {
        qn.get('Buy').setValue(false)
      }
    })
  }

  /**
   * Set true Selected quotation
   * @param index "Selected Quotation index"
   */
  public SelectHealthTopUpQNDocumentsBuy(index: number) {

    if (this.HealthTopUpQNDocuments.controls[index].get('Buy').value) {
      this._alertservice.raiseErrorAlert('Quotation is already Selected.');
      return;
    }

    this.HealthTopUpQNDocuments.controls.forEach((qn, i) => {
      if (i == index) {
        qn.get('Buy').setValue(true)

        if (this.QuotationSelectionForm.get('PaymentMode').value == 'Cheque') {
          this.QuotationSelectionForm.get('TopUpPaymentAccountName').patchValue(qn.value.InsuranceCompanyName)
        }
      } else {
        qn.get('Buy').setValue(false)
      }
    })
  }

  /**
   * View Quotation document
   * @param item 
   */
  public ViewDocument(StorageFilePath: string) {
    if (StorageFilePath) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + StorageFilePath)
    }
  }


  // Reject QN Form
  public RejectQNForm() {

    if (this.QuotationSelectionForm.get('SendBackRejectDesc').value == "" || this.QuotationSelectionForm.get('SendBackRejectDesc').value == null) {
      this._alertservice.raiseErrorAlert('Reject Reason is required.');
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

          let RejectObj = {
            Id: this.QuotationSelectionForm.get('Id').value,
            Stage: this.QuotationSelectionForm.get('Stage').value,
            SendBackRejectDesc: this.QuotationSelectionForm.get('SendBackRejectDesc').value
          }

          this._quotationBySalesPersonService.QNReject(RejectObj).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message)
              // this._router.navigate([ROUTING_PATH.RFQ.QNByUWPending + SendBackObj.Id])
              this._router.navigate([ROUTING_PATH.Basic.Dashboard])
            }
            else {
              this._alertservice.raiseErrors(res.Alerts, false);
            }
          });

        }
      });

  }

  // Send back QN Form
  public SendBackQNForm() {

    if (this.QuotationSelectionForm.get('SendBackRejectDesc').value == "" || this.QuotationSelectionForm.get('SendBackRejectDesc').value == null) {
      this._alertservice.raiseErrorAlert('Send Back Reason is required.');
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

          let SendBackObj = {
            Id: this.QuotationSelectionForm.get('Id').value,
            Stage: this.QuotationSelectionForm.get('Stage').value,
            SendBackRejectDesc: this.QuotationSelectionForm.get('SendBackRejectDesc').value
          }


          this._quotationBySalesPersonService.QNSendBack(SendBackObj).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message)
              // this._router.navigate([ROUTING_PATH.RFQ.QNByUWPending + SendBackObj.Id])
              this._router.navigate([ROUTING_PATH.Basic.Dashboard])
            }
            else {
              this._alertservice.raiseErrors(res.Alerts, false);
            }
          });
        }
      });

  }

  // PopUp to share policy details
  public openDiologShare(openFor:string) {

    let selectedQuotation

    if (openFor == 'common') {
      selectedQuotation = this.QNselection.controls.find(quotation => quotation.get('Buy').value == true)
    }
    else if (openFor == 'HealthTopUp') {
      selectedQuotation = this.HealthTopUpQNDocuments.controls.find(quotation => quotation.get('Buy').value == true)
    }


    if (selectedQuotation && selectedQuotation.value) {
      this._RfqService.rfqShareDialog(selectedQuotation.value);
    } else {
      this._alertservice.raiseErrorAlert('Quotation selection is required.')
    }
  }

  // click on "Back to List Page" button then redirect last page
  public BackToListPage() {
    this._Location.back();
  }

  /**
   * Download attch QN Documents
   * @returns 
   */
  public DonloadQNdocument() {

    if (!this.QNselection.value.some(ele => ele.Buy == true)) {
      this._alertservice.raiseErrorAlert('Quotation Selection is Required');
      return;
    }

    //Find Selected QN Doc
    let SelectedQuotation = this.QNselection.value.find(qn => qn.Buy == true)

    if (SelectedQuotation) {
      this._quotationBySalesPersonService.DownloadQnDocument(SelectedQuotation.Id).subscribe(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = SelectedQuotation.FileName;
        a.click();
        URL.revokeObjectURL(objectUrl);
      })
    }


  }

  /**
   * Download attch QN Documents
   * @returns 
   */
  public DonloadTopUpPlanQNdocument() {

    if (!this.HealthTopUpQNDocuments.value.some(ele => ele.Buy == true)) {
      this._alertservice.raiseErrorAlert('Quotation Selection is Required');
      return;
    }

    //Find Selected QN Doc
    let SelectedQuotation = this.HealthTopUpQNDocuments.value.find(qn => qn.Buy == true)

    if (SelectedQuotation) {
      this._quotationBySalesPersonService.DownloadQnDocument(SelectedQuotation.Id).subscribe(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = SelectedQuotation.FileName;
        a.click();
        URL.revokeObjectURL(objectUrl);
      })
    }


  }


  /**
 * Add Previous policy Details
 */
  public AddExistingPolicyDetails() {
    if (this.PrevPolicyClaimsDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PrevPolicyClaimsDetailAlerts);
      return;
    }
    let ExistingPolicyDetails: IPrevPolicyDetail = new PrevPolicyDetail()
    ExistingPolicyDetails.RFQId = this.QuotationSelectionForm.value.Id
    this.PrevPolicyDetail.push(this._initExistingPolicyDetailsForm(ExistingPolicyDetails))
  }

  // remove Previous policy Details
  public removePreviouspolicyDetails(rowNo: number) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.PrevPolicyDetail.removeAt(rowNo);
        }
      });

  }



  /**
   * Submit A Selected Quotatiion Details
   */

  public QuotationSelectionSubmit() {

    if (this.QuotationSelectionAlerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAlerts)
      return;
    }

    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert)
      return;
    }
    if (this.PrevPolicyClaimsDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PrevPolicyClaimsDetailAlerts)
      return;
    }

    if (this.KYCDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.KYCDetailsAlerts)
      return;
    }

    if (this.PaymentModeDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.PaymentModeDetailsAlert)
      return;
    }

    //AttachmentDoc Validation
    this._validateAttachDocField()

    if (this.AttachDocumentAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachDocumentAlerts)
      return;
    }

    // patch Nominee details array in "RFQMemberId" filed update from members array
    // DOB date formate change as per require from API(yyyy-MM-dd)
    if (this.QuotationSelectionForm.get("Members").value.length > 0) {
      this.QuotationSelectionForm.get("Members").value.forEach((el, i) => {
        el.HospitalisedYear = this._datePipe.transform(el.HospitalisedYear, 'yyyy-MM-dd');
        if (el.NomineeDetails.length > 0) {
          el.NomineeDetails.forEach((Nominee) => {
            Nominee.RFQMemberId = el.Id;
            Nominee.DOB = this._datePipe.transform(Nominee.DOB, 'yyyy-MM-dd');
          });
        }
      });
    }

    // patch Existing Illness details array in "RFQMemberId" filed update from members array
    if (this.QuotationSelectionForm.get("Members").value.length > 0) {
      this.QuotationSelectionForm.get("Members").value.forEach((el, i) => {
        if (el.ExistingIllnessDetail.length > 0) {
          el.ExistingIllnessDetail[i].RFQMemberId = el.Id;
        }
      });
    }


    let SubmitFormValue = JSON.parse(JSON.stringify(this.QuotationSelectionForm.value))
    // if pan not attach then Field value is set null
    if (!SubmitFormValue.PANDetails.StorageFilePath) {
      SubmitFormValue.PANDetails = null
    }
    // if Aadhar not attach then Field value is set null
    if (!SubmitFormValue.AadharDetails.StorageFilePath) {
      SubmitFormValue.AadharDetails = null
    }

    this._quotationBySalesPersonService.SubmitOfflineQNPlanSelect(SubmitFormValue).subscribe(res => {
      if (res.Success) {
        this._alertservice.raiseSuccessAlert(res.Message, "false")
        // this._router.navigate([ROUTING_PATH.RFQ.PaymetLinkPending + this.QuotationSelection.Id])
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
    if (this.QuotationSelectionForm.get('SelfGender').value == 'Male') {
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
      this.QuotationSelectionForm.patchValue({
        noOfDaughter: this.QuotationSelectionForm.get('noOfDaughter').value + 1
      })
    }

    if (child == 'Son') {
      this.QuotationSelectionForm.patchValue({
        noOfSon: this.QuotationSelectionForm.get('noOfSon').value + 1
      })
    }
  }

  // update gender of Self and spouse in HealthQuateForm
  private _genderofSelfAndSpouse(choice) {
    this.SelfGender = choice;
    this.QuotationSelectionForm.patchValue({
      SelfGender: this.SelfGender,
    });

    if (this.QuotationSelectionForm.get('SelfGender').value == 'Male') {
      this.QuotationSelectionForm.patchValue({
        SpouseGender: 'Female',
      });
    } else {
      this.QuotationSelectionForm.patchValue({
        SpouseGender: 'Male',
      });
    }
    this._genderOfSelfSpouseInArray()
    this.members()
  }


  // Build Main form
  private _buildForm(data: RfqHealthQuotation) {
    let form = this.fb.group({
      Id: [0],
      RFQNo: [''],
      RFQDate: [''],
      // [1] Basic details
      PaymentMode: ["", [Validators.required]],
      PaymentAccountName: [""],
      TopUpPaymentAccountName: [""],
      SubCategoryId: [0],
      SubCategoryName: [''],
      SubCategoryCode: [''],
      PolicyType: [''],
      CategoryType: [''],
      PolicyPeriod: [0],
      Deductible: [0],
      SumInsured: [0, [Validators.required]],
      OtherSumInsured: [],
      Pincode: [''],
      PreviousInsurer: [''],
      PreviousPolicyType: [''],
      PreviousPolicyStartDate: [''],
      PreviousPolicyEndDate: [''],
      ClaimInPreviousYear: [false],
      PolicyStatus: [''],
      Members: this._buildpersonsDetailForm(data.Members),
      Documents: this._buildQuotationDocumentForm(data.Documents),
      ProposerMobileNo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      ProposerEmail: ['', [Validators.required, Validators.email, Validators.maxLength(60)]],
      QNNo: [''],
      QNDate: [''],
      Description: [],
      PaymentLink: [''],
      ProposalSubmissionDate: [''],
      PolicySubmissionDate: [''],
      QNDocuments: this._buildQnQuotationDocumentForm(data.QNDocuments),
      HealthTopUpQNDocuments: this._buildQnQuotationDocumentForm(data.HealthTopUpQNDocuments),
      ProductTypeName: [''],
      ProposalTypeName: [''],
      PolicyTypeName: [''],
      PreviousPolicyTypeName: [''],
      PolicyStatusName: [''],
      SalesPersonName: [''],
      SalesPersonType: [],
      BranchName: [],
      TeamReferenceName: [],
      BDOName: [],
      BDMName: [],
      Transaction: [],

      PrevPolicyInsurComp: [],
      PrevPolicyInsurCompName: [],
      PrevPolicyInsurCompShortName: [],
      PrevPolicyPeriod: [],
      PrevPolicySumInsured: [],
      PrevPolicyType: [],
      PreviousPolicyPremium: [],
      SendBackRejectDesc: [''],
      Stage: [],
      StageName: [],
      PANNo: [],
      AadharNo: [],
      AadharDetails: this._initKYCDocumentForm(data.AadharDetails),
      PANDetails: this._initKYCDocumentForm(data.PANDetails),

      // Product  Category details
      PincodeId: [],

      // Product  Category details >>> [0.1] >>> Details of Proposed Insured & Family (if applicable)
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
      Additionalinformation: [''],
      PrevPolicyDetail: this._buildExistingPolicyDetailsFormArray(data.PrevPolicyDetail),
    });

    if (data) {
      form.patchValue(data);
    }

    return form;
  }

  // Build Policy Person details array
  private _buildpersonsDetailForm(items: iQuotationPerson[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initpersonsDetailForm(i));
        });
      }
    }

    return formArray;
  }

  // Build Policy Person details Form Group
  private _initpersonsDetailForm(data): FormGroup {
    let personForm = this.fb.group({
      TakingMedicine: [false],
      RunningMedicineName: [],
      MedicineRunningYears: [],
      Height: [0, [Validators.required]],
      Weight: [0, [Validators.required]],
      HeightFeetInch: [0, [Validators.required]],
      HeightCM: [0, [Validators.required]],
      Marital: ['', [Validators.required]],
      Occupation: [, [Validators.required]],
      // NomineeName: ['', [Validators.required]],
      // NomineeDOB: ['', [Validators.required]],
      // NomineeRelation: ['', [Validators.required]],
      ClaimPreviousYears: [, [Validators.required]],
      ClaimDescription: [, [Validators.maxLength(512)]],
      ClaimMade: [, [Validators.required]],
      ClaimMadeDescription: [],
      RelationName: [''],
      // NomineeRelationName: ['', [Validators.required]],
      Id: [0],
      PolicyId: [0],
      Relation: [''],
      Name: ['', [Validators.required]],
      DOB: [''],
      Gender: [''],
      Remark: [''],
      SmokerTibco: [, [Validators.required]],
      SmokerTibcoDescription: [''],
      ExistingIllness: [],
      ExistingIllnessDetail: this._buildExistingIllnessDetailForm(),
      SumInsured: [],
      RFQId: [],
      Deductible: [],
      OtherSumInsured: [],
      PrevPolicy: [, [Validators.required]],
      PrevPolicy1yearDescription: [],
      PrevPolicy2yearDescription: [],
      PrevPolicy3yearDescription: [],
      HospitalisedBefore: [, [Validators.required]],
      HospitalisedYear: [],
      TakenTreatment: [],
      NomineeDetails: this._buildNomineeDetailsForm(data?.NomineeDetails),
    });

    if (data) {

      data.NomineeDetails[0]

      personForm.patchValue(data);
    }

    return personForm;
  }

  // Build Quotation Nominee details
  private _buildNomineeDetailsForm(items: IQuotationNomineeDetails[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {

        // for in case of item array is null then create empty object of Nominee and push in form array
        var NomineeData: IQuotationNomineeDetails[];
        formArray.push(this._initNomineeDetailForm(NomineeData));

        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initNomineeDetailForm(i));
        });
      }
    }

    return formArray;
  }

  // Build Quotation doc. Form Group
  private _initNomineeDetailForm(data): FormGroup {
    let NomineeForm = this.fb.group({
      Id: [0],
      RFQMemberId: [0],
      Name: [''],
      DOB: [''],
      Relation: [''],
      NomineePer: [''],
      AppointeeName: [''],
      AppointeeDOB: [''],
      AppointeeRelation: []
    });

    if (data) {
      NomineeForm.patchValue(data);
    }

    return NomineeForm;
  }

  //Build previous policy Formarray
  private _buildExistingPolicyDetailsFormArray(items: IPrevPolicyDetail[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initExistingPolicyDetailsForm(i));
        });
      }
    }

    return formArray;
  }

  private _initExistingPolicyDetailsForm(item: IPrevPolicyDetail): FormGroup {

    let ExistingPolicyDetailsForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      FinancialYearId: [],
      FinancialYear: [""],
      MemberName: [""],
      ReasonOfClaim: [""],
      Status: [""],
      ClaimApprovalAmount: [0],
      Premium: [0],
    })

    if (item) {
      ExistingPolicyDetailsForm.patchValue(item)
    }

    return ExistingPolicyDetailsForm
  }

  // Build Quotation doc. array
  private _buildQuotationDocumentForm(items: iQuotationDocument[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initdQuotationDocumentForm(i));
        });
      }
    }

    return formArray;
  }

  // Build Quotation doc. Form Group
  private _initdQuotationDocumentForm(data): FormGroup {
    let QuotationDocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      DocumentTypeName: [''],
      DocumentNo: [''],
      FileName: ['', [Validators.required, this.noWhitespaceValidator]],
      StorageFileName: [''],
      StorageFilePath: ['', [Validators.required, this.noWhitespaceValidator]],
      Description: [''], // remarks
      Stage: []
    });

    if (data) {
      QuotationDocumentForm.patchValue(data)
    }

    return QuotationDocumentForm;
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
      Anysurgery: [, [Validators.required]],
      SurgeryDescription: [],
      AffectedByCorona: [, [Validators.required]],
      AffectedByCoronaDesc: [],
    });

    return existingIllnessForm;
  }

  // Build Quotation Note doc. array
  private _buildQnQuotationDocumentForm(items: iQnQuotationDocument[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initQnQuotationDocumentForm(i));
        });
      }
    }

    return formArray;
  }

  // Build Quotation NOte doc. Form Group
  private _initQnQuotationDocumentForm(data): FormGroup {
    let QnQuotationDocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      InsuranceCompany: [""],
      InsuranceCompanyName: [""],
      InsuranceCompanyShortName: [""],
      ProductName: [''],
      ProductCode: [''],
      SumInsured: [0],
      GrossPremium: [0],
      Deductible: [0],
      Buy: [],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: [""]
    });

    if (data) {
      QnQuotationDocumentForm.patchValue(data)
    }

    return QnQuotationDocumentForm;
  }


  // Build KYC doc. FormGroup
  private _initKYCDocumentForm(data: IKYCDocuments): FormGroup {
    let KYCDocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      DocumentNo: [''],
      Stage: [''],
      Description: [''],
      FileName: [''],
      StorageFileName: [''],
      StorageFilePath: [''],
      DocumentTypeName: [''],
      ImageUploadName: [''],
      ImageUploadPath: [''],
    });

    if (data) {
      KYCDocumentForm.patchValue(data)
    }

    return KYCDocumentForm;
  }

  // No white Space validator
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
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

    this.RaiseDocuments.controls.forEach((element, index) => {
      if (element.get('StorageFilePath').hasError('required')) {

        this.AttachDocumentAlerts.push({
          Message: `${element.value.DocumentType} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });

  }

  private _OnformChange() {
    this.inf.controls.forEach((element, index) => {


      element.get('ExistingIllnessDetail.Anysurgery').valueChanges.subscribe((val) => {
        element.get('ExistingIllnessDetail.SurgeryDescription').setValue("")
      });

      element.get('PrevPolicy').valueChanges.subscribe((val) => {
        element.patchValue({
          PrevPolicy1yearDescription: "",
          PrevPolicy2yearDescription: "",
          PrevPolicy3yearDescription: ""
        })
      });

      element.get('TakingMedicine').valueChanges.subscribe((val) => {
        element.patchValue({
          RunningMedicineName: null,
          MedicineRunningYears: null,
        })
      });

      element.get('ClaimMade').valueChanges.subscribe((val) => {
        element.get('ClaimMadeDescription').setValue("")
      });

      element.get('ExistingIllnessDetail.AffectedByCorona').valueChanges.subscribe((val) => {
        element.get('ExistingIllnessDetail.AffectedByCoronaDesc').setValue("")
      });

      element.get('HospitalisedBefore').valueChanges.subscribe((val) => {
        element.get('HospitalisedYear').setValue(null)
        element.get('TakenTreatment').setValue(null)
      });
    });

    this.QuotationSelectionForm.get('PaymentMode').valueChanges.subscribe(val => {
      if (val == 'Cheque') {
        let selectedQn = this.QNselection.value.find(qn => qn.Buy == true)
        if (selectedQn) {
          this.QuotationSelectionForm.get('PaymentAccountName').patchValue(selectedQn.InsuranceCompanyName)
        }

        let selectedTopUpQn = this.HealthTopUpQNDocuments.value.find(qn => qn.Buy == true)
        if (selectedTopUpQn) {
          this.QuotationSelectionForm.get('TopUpPaymentAccountName').patchValue(selectedTopUpQn.InsuranceCompanyName)
        }
      } else {
        this.QuotationSelectionForm.get('PaymentAccountName').patchValue(null)
        this.QuotationSelectionForm.get('TopUpPaymentAccountName').patchValue(null)
      }
    })

  }

  // Disable formfield As view purpose only
  private _FormFieldDisable() {
    this.QuotationSelectionForm.get('PreviousPolicyType').disable()
  }

  //#endregion private-getters

}
