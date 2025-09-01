import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import {
  AdityaBirlaDto,
  IAdityaBirlaDto,
} from '@models/dtos/config/AdityaBirla/aditya-birla-dto';
import { QuoteService } from '../../quote.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { MatStepper } from '@angular/material/stepper';
import { Alert } from '@models/common';
import { MasterListService } from '@lib/services/master-list.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {
  BehaviorSubject,
  Observable,
  Subject,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';
import { ICityPincodeDto } from '@models/dtos/core/CityDto';
import { DatePipe } from '@angular/common';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { AdityaBirlaHealthService } from './aditya-birla-health.service';
import {
  AdityaBirlaKYCDto,
  IAdityaBirlaKYCDto,
} from '@models/dtos/config/Kyc/AdityaBirla/adityaBirla-kyc-dto';
import { environment } from 'src/environments/environment';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';
import { ROUTING_PATH } from '@config/routingPath.config';
import {
  MemberQuestionDetailsDto,
  AdityaMemberPEDListDto,
  AdityaPersonalHabitDetailDto,
  AdityaPolicyMemberDetailsDto,
  IAdityaBirlaIllnessDto,
  IMemberQuestionDetailsDto,
  IAdityaMemberPEDListDto,
  IAdityaPersonalHabitDetailDto,
  IMemberPEDquestionList,
  MemberPEDquestionList,
  IAdityaPolicyMemberDetailsDto,
} from '@models/dtos/config/AdityaBirla';
import { UnitConversion } from '@config/UnitConversion';
import {
  AdityaBirlaKYCStatusDto,
  IAdityaBirlaKYCStatusDto,
} from '@models/dtos/config/Kyc/AdityaBirla';
import { ValidationRegex } from '@config/validationRegex.config';
import { DialogService } from '@lib/services/dialog.service';
import * as moment from 'moment';
import { CommonGeneral } from '@config/CommonGeneral';

@Component({
  selector: 'gnx-aditya-birla-health',
  templateUrl: './aditya-birla-health.component.html',
  styleUrls: ['./aditya-birla-health.component.scss'],
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
export class AdityaBirlaHealthComponent {
  pagetitle: string = 'Aditya Birla Form'; // Page Main Header Title

  Policies: any; // Store Selected Policy From local storage
  BuyAdityaBrilaNowForm: FormGroup; // FormGroup for Aditya Birla Policy
  BuyAdityaBrilaNow: IAdityaBirlaDto; // To store BuyAdityaBrilaNowForm Value

  DropdownMaster: dropdown; // To get data for dropdown
  logo: string; // to store Policy Icon pathe
  IsKYC: boolean = false; // use a flag for Proposal KYC
  maxBirthDate: Date; // To validate policy person birthdate
  member: any[]; // To store policy person list like as icon,title
  InsuredPeople: number; //count of Insured People
  ReqSumInsured: number; // to store policy sum insured
  PolicyType: string; // to store Policy Type
  HealthQuateForm: any; // To store Health Quate Data from get local storage
  ProductName: string; // To store Policy plan name
  SumInsured: string; // to store policy sum insured
  Insurer: string; // to store Insurance campany insurare
  Insurer1: string; // to store Insurance campany insurare
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;

  TitleList = [
    { Code: 1, Name: 'Mr' },
    { Code: 2, Name: 'Mrs' },
    { Code: 3, Name: 'Miss' },
    { Code: 4, Name: 'Ms' },
    { Code: 5, Name: 'Dr' },
    { Code: 6, Name: 'M/s' },
    { Code: 7, Name: 'Others' },
    { Code: 8, Name: 'Mx' },
  ];

  GenderList: any[]; // to store Gender Dropdown list
  RelationList: any[]; // to store Relation dropdownlist
  NomineeRelationList: any[]; // to store nominee Relation dropdownlist
  OccupationList: any[]; // to store Occupation dropdownlist
  MaritalList: any[]; // to store Marital dropdownlist
  IllnessList: IAdityaBirlaIllnessDto[]; // to store Illnesslist from Service File (Static)
  personalHabbitList: AdityaPersonalHabitDetailDto[]; // to store personal Habit from Service File (Static)
  memberDetailsAsArray: IAdityaPolicyMemberDetailsDto[];

  PEDquestionList: IMemberPEDquestionList[] = [];
  FilterSearchData: BehaviorSubject<any>;
  FilterSearchData$!: Observable<any[]>;

  Conversion: UnitConversion; // to store Height convert in CM
  commonGeneral: CommonGeneral; // to salutation wise gender code return

  step1 = new FormControl(); // Step Control For if any field invalid in this step not open other stepper
  alerts: Alert[] = []; // Display alert message
  flag = 1 //check if data of buynow , member & health form is not empty
  insurerFlag = 1 //check if name of the insurer is Aditya Birla or not

  destroy$: Subject<any>;
  pincodes$: Observable<ICityPincodeDto[]>;

  // Member Medical History Drp list Serch control
  searchControl = new FormControl();

  // PolicyStartDate: string

  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    private _QuoteService: QuoteService,
    public dialog: MatDialog,
    private _router: Router,
    private _MasterListService: MasterListService,
    private _AdityaBirlaService: AdityaBirlaHealthService,
    private _route: ActivatedRoute,
    private _datePipe: DatePipe,
    private _dialogService: DialogService // number of people insured
  ) {

    window.scroll(0, 0);
    this.commonGeneral = new CommonGeneral();

    this.FilterSearchData = new BehaviorSubject(null);
    this.FilterSearchData$ = this.FilterSearchData.asObservable();

    this.maxBirthDate = new Date();
    // Set Max Birthdate from  Current date to lat 3 month
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);
    this.destroy$ = new Subject();

    this.DropdownMaster = new dropdown();
    this.Conversion = new UnitConversion();

    // if any one of HealthQuateForm , buynow , member is not stored in localstorage than return back to Health form
    if (
      !localStorage.getItem('member') ||
      !localStorage.getItem('buynow') ||
      !localStorage.getItem('HealthQuateForm')
    ) {
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.Health]);
      // if(window.location.href.indexOf('mediclaim') != -1){
      // }
      // else {
      //   this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.Compare]);
      // }
      this.flag = 0;
      return;
    } else {
      // if name of the insurer in buynow is not Aditya birla than return plan list to choose a plan
      let Insurer = JSON.parse(localStorage.getItem('buynow'));
      if (Insurer.Insurer.toLowerCase() != InsuranceCompanyName.AdityaBirla) {
        if(window.location.href.indexOf('mediclaim') != -1){
          this._router.navigate([ROUTING_PATH.QuoteMediclaim.List]);
        }
        else {
          this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.List]);
        }
    
        this.insurerFlag = 0;
        return;
      }
    }

    if (localStorage.getItem('member')) {
      this.member = JSON.parse(localStorage.getItem('member'));
      this.InsuredPeople = this.member.length;
    }
    // Icon of the comany
    if (localStorage.getItem('buynow')) {
      this.Policies = JSON.parse(localStorage.getItem('buynow'));
      this.logo = this.Policies.IconURL;
      this.Insurer1 = this.Policies.Insurer;
      this.ProductName = this.Policies.ProductName;
      if (this.Policies.PolicyType == 'MultiIndividual')
        this.PolicyType = 'Individual';
      else this.PolicyType = this.Policies.PolicyType;
    }
    this.IllnessList = this._AdityaBirlaService.getIllness();
    this.FilterSearchData.next(this.IllnessList);

    this.PEDquestionList = this._AdityaBirlaService.getMemberPEDquestionList();
    this.personalHabbitList = this._AdityaBirlaService.getpersonalHabit();
  }

  //#region lifecycle hooks
  // -----------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------

  ngOnInit(): void {
    // Set New Class  AdityaBirla
    this.BuyAdityaBrilaNow = new AdityaBirlaDto();

    // init Reactive Form
    this.BuyAdityaBrilaNowForm = this._buildBuyAdityaBrilaNowForm(
      this.BuyAdityaBrilaNow
    );
    this.BuyAdityaBrilaNow.PolicyMemberDetails =
      new Array<AdityaPolicyMemberDetailsDto>();

    if (this.flag && this.insurerFlag) {
      // get Health quate Data From Local storage
      this.HealthQuateForm = JSON.parse(localStorage.getItem('HealthQuateForm'));

      this.setValue(); // Set Health quate Sum insurred
      this.onPolicy(); // Set Selecte Policy Data bind In AdityaBrila Form
      this._membersDetails(); // if self is in insurred Person then bind their data in policy holder
      this._fillMasterList(); // Get Insurance helper master data
      this._onFormChanges(); // Usr for Formfield change detection
      this._onChangeInHoldervalue(); // Usr for Formfield change detection
      this._addMemberDetails(); // insurred Person data bind  in Aditya birla form

      // After KYC complete patch policy holder data
      let data = this._route.snapshot.queryParams;
      // After KYC complate Check KYC status & Set policy Holder data in aditya birla form
      if (localStorage.getItem('policyHolder') && data['transactionId']) {
        if (data['status'] != 'user_cancelled') {
          this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue(
            JSON.parse(localStorage.getItem('policyHolder'))
          );

          let KYCStatusData: IAdityaBirlaKYCStatusDto =
            new AdityaBirlaKYCStatusDto();
          KYCStatusData.TransactionNo = data['transactionId'];
          KYCStatusData.Insurer = this.Policies.Insurer;

          //KYC status API Call for KYCId
          this._AdityaBirlaService.KYCStatus(KYCStatusData).subscribe((res) => {
            if (res.Success) {
              if (res.Data.IsCKYC || res.Data.IsOVD || res.Data.IsDigiLocker) {
                this._alertservice.raiseSuccessAlert(res.Message);
                this.BuyAdityaBrilaNowForm.get('KYCTransactionNo').patchValue(
                  data['transactionId']
                );

                this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
                  KYCId: res.Data.KYCId,
                  IsOVD: res.Data.IsOVD,
                  IsDigiLocker: res.Data.IsDigiLocker,
                  IsCKYC: res.Data.IsCKYC,
                  HomeCity: res.Data.City,
                  HomeAddress: res.Data.Address1,
                  HomeAddress1: res.Data.Address2,
                  HomePinCode: res.Data.Pincode,
                });

                this._dialogService
                  .confirmDialog({
                    title: 'Are You Sure?',
                    message: `Replace Your Address <br/>${res.Data.Address1}, <br/>${res.Data.Address2} <br/>${res.Data.Pincode}  <br/>${res.Data.City}, ${res.Data.State} `,
                    confirmText: 'Yes, Replace!',
                    cancelText: 'No',
                  })
                  .subscribe((result) => {

                    if (result == true) {
                      this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
                        Address: res.Data.Address1,
                        PinCode: res.Data.Pincode,
                        Street: res.Data.Address2,
                        Address1: res.Data.City,
                        City: res.Data.City,
                        sameAsHomeAddress:true
                      });
                    }
                  });


                this.IsKYC = true;
                this._compareFullNameAndReturnName(res);
                // this._compareDOB(res)
              } else {
                this._alertservice.raiseErrorAlert(
                  'Document Verification failed'
                );
              }
            } else {
              this._alertservice.raiseErrorAlert(
                'Document Verification failed'
              );
            }
          });
        } else {
          this._alertservice.raiseErrorAlert('Request Cancel By User');
        }
      }
      if (this.BuyAdityaBrilaNowForm.get('PolicyHolder.KYCId').value) {
        this.IsKYC = true;
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  //#endregion lifecycle hooks

  //#region public form getter

  get f() {
    return this.BuyAdityaBrilaNowForm.controls;
  }
  get inf() {
    return this.BuyAdityaBrilaNowForm.get('PolicyMemberDetails') as FormArray;
  }

  //#endregion public form getter

  // set Health quoate Sum inssured type Number
  setValue() {
    if (this.HealthQuateForm) {
      this.ReqSumInsured = Number(this.HealthQuateForm.SumInsured);
    }
  }

  // #region Public Methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // Policy Details
  public onPolicy() {
    // Set Selecte policy details in Aditya birla form
    if (this.Policies != null) {
      this.BuyAdityaBrilaNowForm.get('PolicyDetail').patchValue({
        ProductName: this.Policies.ProductName,
        Productcode: this.Policies.ProductCode,
        PolicyType: this.Policies.PolicyType,
        SubProductCode: this.Policies.SubProductCode,
        SumInsured: this.Policies.SumInsured,
        PolicyPeriod: this.Policies.PolicyPeriod,
      });
    }
  }

  // PINcode Section pop-up box
  public openDiologPincode(type: string, title: string, MemberIndex: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '44vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";
    dialogConfig.data = {
      type: type,
      title: title,
      MemberIndex: MemberIndex,
      ispopup: true,
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'Pincode') {
          this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
            PinCode: result.PinCode,
            City: result.CityName,
            StateName: result.StateName,
            StateCode: result.StateCode,
            CountryCode: result.CountryCode,
          });
        }
      }
    });
  }

  // Set Selected PINcode from autocomplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
      City: event.option.value.CityName,
      StateName: event.option.value.StateName,
      PinCode: event.option.value.PinCode,
      StateCode: event.option.value.StateCode,
      CountryCode: event.option.value.CountryCode,
    });
    this.BuyAdityaBrilaNowForm.get('PolicyHolder.PinCode').patchValue(
      event.option.value.PinCode
    );
  }

  // back Button
  public backClick() {
    if(window.location.href.indexOf('mediclaim') != -1){
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.AddOns]);
    }
    else {
      this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.AddOns]);
    }

  }

  // When Closed member PED Drplis Reset form serxh control & bind All list data in filterdata
  public CloseMemberPEDdrplist() {
    this.FilterSearchData.next(this.IllnessList);
    this.searchControl.patchValue('');
  }

  // Clear function for Selected pincode
  public clear(name: string): void {
    this.BuyAdityaBrilaNowForm.get(name).setValue('');
    if (name == 'PolicyHolder.PinCode') {
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.City').setValue('');
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.StateName').setValue('');
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.StateCode').setValue('');
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.CountryCode').setValue('');
    }
  }

  //Check Stepone invalid Formfield & Store invalid formfield message in alert array
  public StepOneSubmit(stepper): any {
    this.alerts = [];

    if (
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.Salutation').value == '' ||
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.Salutation').value == '0'
    ) {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.Salutation'),
        Message: 'Select Title',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyAdityaBrilaNowForm.get('PolicyHolder.FirstName').invalid) {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.FirstName'),
        Message: 'Enter First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyAdityaBrilaNowForm.get('PolicyHolder.LastName').invalid) {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.LastName'),
        Message: 'Enter Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // gender required
    if (
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.Gender').value == '' ||
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.Gender').value == '0'
    ) {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.Gender'),
        Message: 'Select Gender',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.DOB').value == '' ||
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.DOB').value == null
    ) {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.DOB'),
        Message: 'Enter Date of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.DOB').value >
      this.maxBirthDate
    ) {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.DOB'),
        Message: 'Enter Valid Date of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyAdityaBrilaNowForm.get('PolicyHolder.Marital').value == '') {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.Marital'),
        Message: 'Select Marital ',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyAdityaBrilaNowForm.get('PolicyHolder.Address').invalid) {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.Address'),
        Message: 'Enter Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyAdityaBrilaNowForm.get('PolicyHolder.PinCode').value == '') {
      this.alerts.push({
        Message: 'Enter PinCode',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyAdityaBrilaNowForm.get('PolicyHolder.City').value == '') {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.City'),
        Message: 'Enter City Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyAdityaBrilaNowForm.get('PolicyHolder.StateName').value == '') {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.StateName'),
        Message: 'Enter State Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyAdityaBrilaNowForm.get('PolicyHolder.Mobile').value == '') {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.Mobile'),
        Message: 'Enter Mobile No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyAdityaBrilaNowForm.get('PolicyHolder.Mobile').value != '') {
      if (
        this.BuyAdityaBrilaNowForm.get('PolicyHolder.Mobile').value.toString()
          .length > 10 ||
        this.BuyAdityaBrilaNowForm.get('PolicyHolder.Mobile').value.toString()
          .length < 10
      ) {
        this.alerts.push({
          FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.Mobile'),
          Message: 'Enter Valid Mobile No.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.BuyAdityaBrilaNowForm.get('PolicyHolder.Email').value == '') {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.Email'),
        Message: 'Enter Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyAdityaBrilaNowForm.get('PolicyHolder.Email').value != '') {
      if (
        !this.emailValidationReg.test(
          this.BuyAdityaBrilaNowForm.get('PolicyHolder.Email').value
        )
      ) {
        this.alerts.push({
          FieldName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.Email'),
          Message: 'Enter Valid Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // Nominee Details
    if (
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.NomineeFirstName').invalid
    ) {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get(
          'PolicyHolder.NomineeFirstName'
        ),
        Message: 'Enter Nominee First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.NomineeMiddleName').invalid
    ) {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get(
          'PolicyHolder.NomineeMiddleName'
        ),
        Message: 'Enter Nominee Middle Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.NomineeLastName').invalid
    ) {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get(
          'PolicyHolder.NomineeLastName'
        ),
        Message: 'Enter Nominee Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.NomineeRelation').value ==
      '' ||
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.NomineeRelation').value ==
      '0'
    ) {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get(
          'PolicyHolder.NomineeRelation'
        ),
        Message: 'Select Nominee Relation',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.NomineeMobileNo').invalid
    ) {
      this.alerts.push({
        FieldName: this.BuyAdityaBrilaNowForm.get(
          'PolicyHolder.NomineeMobileNo'
        ),
        Message: 'Enter Nominee Mobile No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.NomineeMobileNo').value != ''
    ) {
      if (
        this.BuyAdityaBrilaNowForm.get(
          'PolicyHolder.NomineeMobileNo'
        ).value.toString().length > 10 ||
        this.BuyAdityaBrilaNowForm.get(
          'PolicyHolder.NomineeMobileNo'
        ).value.toString().length < 10
      ) {
        this.alerts.push({
          FieldName: this.BuyAdityaBrilaNowForm.get(
            'PolicyHolder.NomineeMobileNo'
          ),
          Message: 'Enter Valid Nominee Mobile No.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.alerts.length > 0 || !this.IsKYC) {
      this.step1.setErrors({ required: true });
      return this.step1;
    } else {
      this.step1.reset();
      return this.step1;
    }
  }

  //Display alert message for step One
  public stepOneError(stepper: MatStepper) {
    if (this.alerts.length > 0) {
      // Focus on First Invalid field
      if (this.alerts[0].FieldName) {
        (<any>this.alerts[0].FieldName).nativeElement.focus();
      }
      this._alertservice.raiseErrors(this.alerts);
      return;
    } else {
      this.checkKYC(stepper);
    }
  }

  //Check Step two invalid Formfield & Store invalid formfield message in alert array
  public StepTwoSubmit() {
    this.alerts = [];
    this.member.forEach((ele, index) => {
      let SelectMember = 0;
      if (ele.title == 'Self' || ele.title == 'Spouse') {
        SelectMember = 1;
      } else {
        SelectMember = 0;
      }

      if (
        this.inf.controls[index].get('Salutation').value == '' ||
        this.inf.controls[index].get('Salutation').value == 0
      ) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('Salutation'),
          Message: `Select ${ele.title} Title`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].get('FirstName').invalid) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('FirstName'),
          Message: `Enter ${ele.title} First Name`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].get('LastName').invalid) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('LastName'),
          Message: `Enter ${ele.title} Last Name`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (
        this.inf.controls[index].value.DOB == '' ||
        this.inf.controls[index].value.DOB == null
      ) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('DOB'),
          Message: `Enter ${ele.title} Date of Birth`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.inf.controls[index].value.DOB >
        this._datePipe.transform(this.maxBirthDate, 'yyyy-mm-dd')
      ) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('DOB'),
          Message: `Enter Valid Date of Birth - ${ele.title}`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.inf.controls[index].value.Gender == '0') {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('Gender'),
          Message: `Enter ${ele.title} Gender`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.HeightInFeet <= 0) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('HeightInFeet'),
          Message: `Enter ${ele.title} Height in Feet`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.inf.controls[index].value.HeightInInch < 0 ||
        this.inf.controls[index].value.HeightInInch == '' ||
        this.inf.controls[index].value.HeightInInch == null
      ) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('HeightInInch'),
          Message: `Enter ${ele.title} Height in Inch`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.WeightKG == 0) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('WeightKG'),
          Message: `Enter ${ele.title} Weight in KG`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.inf.controls[index].value.Marital == '' ||
        this.inf.controls[index].value.Marital == '0'
      ) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('Marital'),
          Message: `Enter ${ele.title} Marital Status`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.inf.controls[index].value.Occupation == '' ||
        (this.inf.controls[index].value.Occupation == '0' && SelectMember == 1)
      ) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('Occupation'),
          Message: `Enter ${ele.title} Occupation`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // if (this.inf.controls[index].get('NomineeFirstName').invalid) {
      //   this.alerts.push({
      //     FieldName: this.inf.controls[index].get('NomineeFirstName'),
      //     Message: `Enter ${ele.title} Nominee First Name`,
      //     CanDismiss: false,
      //     AutoClose: false,
      //   });
      // }

      // if (this.inf.controls[index].get('NomineeLastName').invalid) {
      //   this.alerts.push({
      //     FieldName: this.inf.controls[index].get('NomineeLastName'),
      //     Message: `Enter ${ele.title} Nominee Last Name`,
      //     CanDismiss: false,
      //     AutoClose: false,
      //   });
      // }

      // if (
      //   this.inf.controls[index].value.NomineeRelation == '' ||
      //   this.inf.controls[index].value.NomineeRelation == '0'
      // ) {
      //   this.alerts.push({
      //     FieldName: this.inf.controls[index].get('NomineeRelation'),
      //     Message: `Enter ${ele.title} Nominee Relation`,
      //     CanDismiss: false,
      //     AutoClose: false,
      //   });
      // }
      // if (this.inf.controls[index].value.NomineeMobileNo == '') {
      //   this.alerts.push({
      //     FieldName: this.inf.controls[index].get('NomineeMobileNo'),
      //     Message: `Enter ${ele.title} Nominee Mobile No.`,
      //     CanDismiss: false,
      //     AutoClose: false,
      //   });
      // }

      // if (this.inf.controls[index].value.NomineeMobileNo != '') {
      //   if (this.inf.controls[index].value.NomineeMobileNo.length != 10) {
      //     this.alerts.push({
      //       FieldName: this.inf.controls[index].get('NomineeMobileNo'),
      //       Message: `Enter Valid Nominee Mobile No.`,
      //       CanDismiss: false,
      //       AutoClose: false,
      //     });
      //   }
      // }

      let PersonalHabitDetail = this.inf.controls[index].get(
        'PersonalHabitDetail'
      ) as FormArray; // Member wise PersonalHabitDetail FormArray

      // Check member wised Personal Habit Invalid Field
      PersonalHabitDetail.value.forEach((h, j) => {
        if (h.IsCheck == null) {
          this.alerts.push({
            FieldName: PersonalHabitDetail.controls[j].get('IsCheck'),
            Message: `Selet Personal Habit Of ${h.Type} (${ele.title})`,
            CanDismiss: false,
            AutoClose: false,
          });
          return;
        }
        if (h.IsCheck != null && h.IsCheck == true && h.Count == '') {
          this.alerts.push({
            FieldName: PersonalHabitDetail.controls[j].get('Count'),
            Message: `Enter Count Of ${h.Type} (${ele.title})`,
            CanDismiss: false,
            AutoClose: false,
          });
          return;
        }
      });
    });
  }

  // Check Policy Holder KYC
  // Open new Window for KYC verification
  public checkKYC(stepper: MatStepper) {
    localStorage.setItem(
      'policyHolder',
      JSON.stringify(this.BuyAdityaBrilaNowForm.get('PolicyHolder').value)
    );
    let KYC: IAdityaBirlaKYCDto = new AdityaBirlaKYCDto();
    KYC.TransactionNo = this.Policies.QuoteNo;
    KYC.Insurer = this.Policies.Insurer;
    // KYC.RedirectUrl =  environment.webURL + '/app/insurance/quote/proposal-pages/adityabirla';
    KYC.RedirectUrl = environment.webURL + ROUTING_PATH.QuoteMediclaim.ProposalPage + 'adityabirla';

    this._AdityaBirlaService.KYC(KYC).subscribe((res) => {
      if (res.Success) {
        this._alertservice.raiseSuccessAlert(res.Message);
        window.open(res.Data.KycUrl, '_self');
      } else {
        if (res.Alerts && res.Alerts.length > 0) {
          this._alertservice.raiseErrors(res.Alerts);
        } else {
          this._alertservice.raiseErrorAlert(res.Message);
        }
      }
    });
  }

  // Ater all neccesary Field Fill data Proceed To Pay
  public ProceedToPay() {
    this.BuyAdityaBrilaNowForm.get('PolicyDetail').patchValue({
      ProductName: this.Policies.ProductName,
      Productcode: this.Policies.ProductCode,
      PolicyType: this.Policies.PolicyType,
      SubProductCode: this.Policies.SubProductCode,
      SumInsured: this.Policies.SumInsured,
      PolicyPeriod: this.Policies.PolicyPeriod,
      CollectionAmount: this.Policies.TotalPremium,
      // SourceTxnId: this.Policies.QuoteNo,
    });
    this.BuyAdityaBrilaNowForm.get('TransactionNo').setValue(
      this.Policies.QuoteNo
    );
    this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
      DOB: this._datePipe.transform(
        this.BuyAdityaBrilaNowForm.get('PolicyHolder.DOB').value,
        'yyyy-MM-dd'
      ),
    });
    this.inf.value.forEach((ele) => {
      ele.DOB = this._datePipe.transform(ele.DOB, 'yyyy-MM-dd');
    });

    this.StepTwoSubmit();
    if (this.alerts.length > 0) {
      // Focus on First Invalid field
      if (this.alerts[0].FieldName) {
        (<any>this.alerts[0].FieldName).nativeElement.focus();
      }
      this._alertservice.raiseErrors(this.alerts);
      return;
    }

    // Call this function for Join Remarks Of Member Question Details
    this._joiMemberPedRemarks();

    let InitProposalFOrmData = JSON.stringify(this.BuyAdityaBrilaNowForm.value);
    let ProposalFOrmData = JSON.parse(InitProposalFOrmData);

    // Set Policy Member Details Array on Submit Form
    ProposalFOrmData.PolicyMemberDetails = this.memberDetailsAsArray;

    // commented on 04-04-2024 as per instruction by Samirbhai

    // Set Personal Habbit count As per weekly or yearly
    // this.member.forEach((m, i) => {
    //   ProposalFOrmData.PolicyMemberDetails[i].PersonalHabitDetail.forEach(
    //     (h, j) => {
    //       if (h.IsCheck == true) {
    //         if (h.Type == 'Smoking' || h.Type == 'Tobacco') {
    //           h.Count = h.Count * 7;
    //         }
    //         if (h.Type == 'Alcohol') {
    //           h.Count = (h.Count / 30) * 7;
    //         }
    //       } else {
    //         h.Count = 0;
    //       }
    //     }
    //   );
    // });

    // Filter Out PED Question is Only TRUE
    this.member.forEach((m, i) => {
      let SelectedQuestion: any[];
      let SelectedHabbit: any[];
      // SelectedQuestion = ProposalFOrmData.PolicyMemberDetails[i].MemberPEDList.filter(q => q.IsCheck == true)
      SelectedHabbit = ProposalFOrmData.PolicyMemberDetails[
        i
      ].PersonalHabitDetail.filter((h) => h.IsCheck == true);

      if (ProposalFOrmData.PolicyMemberDetails[i].MemberPEDList == null) {
        ProposalFOrmData.PolicyMemberDetails[i].MemberPEDList = [];
      }
      ProposalFOrmData.PolicyMemberDetails[i].PersonalHabitDetail =
        SelectedHabbit;

      ProposalFOrmData.PolicyMemberDetails[i].NomineeFirstName =
        this.BuyAdityaBrilaNowForm.get('PolicyHolder.NomineeFirstName').value;
      ProposalFOrmData.PolicyMemberDetails[i].NomineeMiddleName =
        this.BuyAdityaBrilaNowForm.get('PolicyHolder.NomineeMiddleName').value;
      ProposalFOrmData.PolicyMemberDetails[i].NomineeLastName =
        this.BuyAdityaBrilaNowForm.get('PolicyHolder.NomineeLastName').value;
      ProposalFOrmData.PolicyMemberDetails[i].NomineeMobileNo =
        this.BuyAdityaBrilaNowForm.get('PolicyHolder.NomineeMobileNo').value;
      ProposalFOrmData.PolicyMemberDetails[i].NomineeRelation =
        this.BuyAdityaBrilaNowForm.get('PolicyHolder.NomineeRelation').value;
    });

    this._AdityaBirlaService
      .CreateProposal(ProposalFOrmData)
      .subscribe((res) => {
        if (res.Success) {
          this._alertservice.raiseSuccessAlert(res.Message);

          /**
           * Doc Upload API Integration 
           * Call API After Create Proposal 
           */
          let DocUploadObj = {
            TransactionNo: this.Policies.QuoteNo
          }
          this._AdityaBirlaService.DocumentUpload(DocUploadObj).subscribe((res) => { })

          // Open Window to PROCEED TO PAY
          this._QuoteService.openWindowWithPost(
            environment.AdityaBirlaPayment,
            {
              SourceCode: environment.AdityaBirlaSourceCode,
              Currency: environment.Currency,
              secSignature: environment.AdityaBirlaSecSignature,
              ReturnURL: API_ENDPOINTS.AdityaBirla.Payment,
              PhoneNo: this.BuyAdityaBrilaNowForm.get('PolicyHolder.Mobile')
                .value,
              Email: this.BuyAdityaBrilaNowForm.get('PolicyHolder.Email').value,
              OrderAmount: res.Data.TotalPremium,
              GrossPremium: res.Data.TotalPremium,
              FinalPremium: res.Data.TotalPremium,
              SourceTxnId: this.Policies.QuoteNo,
              QuoteId: this.Policies.QuoteNo,
              productinfo: this.Policies.QuoteNo,
              SubCode: '',
              paymentMode: '',
            }
          );
        } else {
          if (res.Alerts && res.Alerts.length > 0) {
            this._alertservice.raiseErrors(res.Alerts);
          } else {
            this._alertservice.raiseErrorAlert(res.Message);
          }
        }
      });
  }

  // radio button for Habit
  /**
   * since we have used span tag instead of label tag , 'for' attribute cannot be used.
   * so in order to change the value of formcontrol in input type radio by clicking on label , this function is used.
   * @param index : to identify the member in member array
   * @param H : to identify the habbit from the MemberLifeStyle array
   * @param value : value of habbit (habbit_Name or '')
   */
  public radioLabelHabit(index: number, H: number, value: boolean) {

    this.inf.controls[index].get('PersonalHabitDetail')['controls'][H].patchValue({
      IsCheck: value
    })

  }

  // to convert height from feet & inches into cm
  public SetCM(index: number) {
    this.inf.controls[index].patchValue({
      HeightCM: this.Conversion.GetCentimeters(
        this.inf.controls[index].value.HeightInFeet,
        this.inf.controls[index].value.HeightInInch
      ),
    });
  }

  /**
   * Selected PED question Push on memberwise MemberPEDlist Array
   */
  public PushSiseasesMemberWise(obj: IAdityaBirlaIllnessDto, memberIndex) {
    let PedListArray = this.inf.value[memberIndex].MemberPEDList;

    // Check If Array is null then set Blank array
    if (this.inf.value[memberIndex].MemberPEDList) {
      PedListArray = this.inf.value[memberIndex].MemberPEDList;
    } else {
      PedListArray = [];
    }
    // Add or Delete Ques
    let i = PedListArray.findIndex((f) => f.PedCode === obj.PedCode);
    if (i >= 0) {
      PedListArray.splice(i, 1);
    } else {
      PedListArray.push(obj);
    }

    this.inf.controls[memberIndex]
      .get('MemberPEDList')
      .patchValue(PedListArray);
  }

  public MultiSelectCheckBoxtick(PedCode: string, memberIndex: number) {
    let PedListArray = this.inf.value[memberIndex].MemberPEDList;

    if (this.inf.value[memberIndex].MemberPEDList) {
      PedListArray = this.inf.value[memberIndex].MemberPEDList;
    } else {
      PedListArray = [];
    }

    if (PedListArray.find((ele) => ele.PedCode == PedCode)) {
      return true;
    } else {
      return false;
    }
  }

  /// Select Multiple diseases Boolean Value change Then Reset MemberPED list
  public ExistingPEDChange(index: number) {
    this.inf.controls[index].get('MemberPEDList').setValue(null);
  }

  //disabled function for options in dropdown vehicle category
  public checkValueForDisabled(fetchedValue: string): boolean {
    //find object with value equal to the fetchedValue

    let Gender = this.BuyAdityaBrilaNowForm.get('PolicyHolder.Gender').value
    if (Gender == "Male" && fetchedValue == "Mr") {
      return false;
    }
    else if (Gender == "Female" && (fetchedValue == "Mrs" || fetchedValue == "Miss" || fetchedValue == "Ms" || fetchedValue == "M/s")) {
      return false;
    }
    else if (fetchedValue == "Dr" || fetchedValue == "Others" || fetchedValue == "Mx") {
      return false;
    }
    else {
      return true;
    }
  }

  //#endregion Public Methods

  //#region Private Methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // full name for KYC
  private _fullName(FName: string, LName: string, MName?: string) {
    let Name: string;
    if (MName) {
      Name = FName.concat(' ', MName, ' ', LName);
    } else {
      Name = FName.concat(' ', LName);
    }
    return Name;
  }
  /**
   * to compare the name entered by user and name returned in response
   * if there is any misMatch than dilog box will appear to ask user if he/she wants to chage the name as per response name
   * if selected YES than name will be replaced otherwise name remains same as user entered
   * @param response : response of api
   */
  private _compareFullNameAndReturnName(response) {
    // let fullName = this._fullName(this.BuyAdityaBrilaNowForm.get('PolicyHolder.FirstName').value, this.BuyAdityaBrilaNowForm.get('PolicyHolder.LastName').value, this.BuyAdityaBrilaNowForm.get('PolicyHolder.MiddleName').value)
    if (
      this.BuyAdityaBrilaNowForm.get(
        'PolicyHolder.FirstName'
      ).value.toLowerCase() != response.Data.FirstName.toLowerCase() ||
      this.BuyAdityaBrilaNowForm.get(
        'PolicyHolder.LastName'
      ).value.toLowerCase() != response.Data.LastName.toLowerCase() ||
      this.BuyAdityaBrilaNowForm.get(
        'PolicyHolder.MiddleName'
      ).value.toLowerCase() != response.Data.MiddleName.toLowerCase()
    ) {
      this._dialogService
        .confirmDialog({
          title: 'Are You Sure?',
          message: `Replace Your Name with ${response.Data.FirstName} ${response.Data.MiddleName} ${response.Data.LastName}`,
          confirmText: 'Yes, Replace!',
          cancelText: 'No',
        })
        .subscribe((res) => {
          // let Name = response.Data.Name.split(' ')
          if (res == true) {
            this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
              FirstName: response.Data.FirstName,
              MiddleName: response.Data.MiddleName,
              LastName: response.Data.LastName,
            });
            this._compareDOB(response);
          } else {
            this._compareDOB(response);
          }
        });
    } else {
      this._compareDOB(response);
      // this.step1.reset();
      // stepper.next();
    }
  }
  /**
   * to compare the DOB entered by user and DOB returned in response
   * if there is any misMatch than dilog box will appear to ask user if he/she wants to chage the DOB as per response DOB
   * if selected YES than DOB will be replaced otherwise DOB remains same as user entered
   * @param response :response of api
   */
  private _compareDOB(response) {
    // let fullName = this._fullName(this.BuyAdityaBrilaNowForm.get('PolicyHolder.FirstName').value, this.BuyAdityaBrilaNowForm.get('PolicyHolder.LastName').value, this.BuyAdityaBrilaNowForm.get('PolicyHolder.MiddleName').value)
    let responseDate = moment(response.Data.DOB, 'DD-MM-YYYY', true).format();
    let UserEntered = this._datePipe.transform(
      this.BuyAdityaBrilaNowForm.get('PolicyHolder.DOB').value,
      'yyyy-MM-dd'
    );
    if (UserEntered != this._datePipe.transform(responseDate, 'yyyy-MM-dd')) {
      this._dialogService
        .confirmDialog({
          title: 'Are You Sure?',
          message: `Replace Your DOB with ${response.Data.DOB}`,
          confirmText: 'Yes, Replace!',
          cancelText: 'No',
        })
        .subscribe((res) => {
          if (res == true) {
            this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
              DOB: this._datePipe.transform(responseDate, 'yyyy-MM-dd'),
            });
          }
        });
    } else {
      // this.step1.reset();
      // stepper.next();
    }
  }
  /**
   * to identify change in value of FirstName , MiddleName & LastName
   */
  private _onChangeInHoldervalue() {
    this.BuyAdityaBrilaNowForm.get(
      'PolicyHolder.FirstName'
    ).valueChanges.subscribe((val) => {
      this.inf.controls.forEach((item, index) => {
        if (item.get('Relation').value == 'Self') {
          item.patchValue({
            FirstName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.FirstName')
              .value,
          });
        }
      });
    });
    this.BuyAdityaBrilaNowForm.get(
      'PolicyHolder.MiddleName'
    ).valueChanges.subscribe((val) => {
      this.inf.controls.forEach((item, index) => {
        if (item.get('Relation').value == 'Self') {
          item.patchValue({
            MiddleName: this.BuyAdityaBrilaNowForm.get(
              'PolicyHolder.MiddleName'
            ).value,
          });
        }
      });
    });
    this.BuyAdityaBrilaNowForm.get(
      'PolicyHolder.LastName'
    ).valueChanges.subscribe((val) => {
      this.inf.controls.forEach((item, index) => {
        if (item.get('Relation').value == 'Self') {
          item.patchValue({
            LastName: this.BuyAdityaBrilaNowForm.get('PolicyHolder.LastName')
              .value,
          });
        }
      });
    });
    this.BuyAdityaBrilaNowForm.get('PolicyHolder.DOB').valueChanges.subscribe(
      (val) => {
        this.inf.controls.forEach((item, index) => {
          if (item.get('Relation').value == 'Self') {
            item.patchValue({
              DOB: this.BuyAdityaBrilaNowForm.get('PolicyHolder.DOB').value,
            });
          }
        });
      }
    );
  }

  // change in pincode
  private _onFormChanges() {
    this.BuyAdityaBrilaNowForm.get(
      'PolicyHolder.PinCode'
    ).valueChanges.subscribe((val) => {
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

    // Select Multiple diseases searchcontrol changed
    this.searchControl.valueChanges.subscribe((val) => {
      this.filterMarketMulti();
    });

    // this.BuyAdityaBrilaNowForm.get('PolicyHolder.Salutation').valueChanges.subscribe((val) => {
    //   this.BuyAdityaBrilaNowForm.get('PolicyHolder.Gender').patchValue(this.commonGeneral.GetGenderCode(val));
    // })
  }

  // Get Insurance helper dropdown master data
  private _fillMasterList() {
    this.GenderList = [];
    // fill gender list
    this._MasterListService
      .getCompanyWiseList('AdityaBirla', 'gender')
      .subscribe((res) => {
        if (res.Success) {
          this.GenderList = res.Data.Items;
        } else {
          this._alertservice.raiseErrors(res.Alerts);
        }
      });
    //relation
    this.RelationList = [];
    this._MasterListService
      .getCompanyWiseList('AdityaBirla', 'relation')
      .subscribe((res) => {
        if (res.Success) {
          this.RelationList = res.Data.Items;
        } else {
          this._alertservice.raiseErrors(res.Alerts);
        }
      });
    //nomineerelation
    this.NomineeRelationList = [];
    this._MasterListService
      .getCompanyWiseList('AdityaBirla', 'nomineerelation')
      .subscribe((res) => {
        if (res.Success) {
          this.NomineeRelationList = res.Data.Items;
        } else {
          this._alertservice.raiseErrors(res.Alerts);
        }
      });

    // Marital
    this.MaritalList = [];
    this._MasterListService
      .getCompanyWiseList('AdityaBirla', 'marital')
      .subscribe((res) => {
        if (res.Success) {
          this.MaritalList = res.Data.Items;
        } else {
          this._alertservice.raiseErrors(res.Alerts);
        }
      });
    //Occupation
    this.OccupationList = [];
    this._MasterListService
      .getCompanyWiseList('AdityaBirla', 'adityabirlaoccupation')
      .subscribe((res) => {
        if (res.Success) {
          this.OccupationList = res.Data.Items;
        } else {
          this._alertservice.raiseErrors(res.Alerts);
        }
      });
  }

  // policy holder details
  // If Self Is include in insured person their data bind in policy holder Details
  private _membersDetails() {
    if (this.HealthQuateForm.SelfCoverRequired == true) {
      const names = this.HealthQuateForm.Name.trim()
        .replace(/ +/g, ' ')
        .split(' ');
      if (names.length > 0)
        this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
          FirstName: names[0].trim(),
        });
      if (names.length > 1) {
        if (names.length > 2) {
          this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
            MiddleName: names[1].trim(),
            LastName: names[2].trim(),
          });
        } else
          this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
            LastName: names[1],
          });
      }

      this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
        Gender: this.HealthQuateForm.SelfGender,
        DOB: this.HealthQuateForm.SelfDOB,
      });

      if (this.HealthQuateForm.SelfGender == "Male") {
        this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
          Salutation: "Mr",
        });
      }
      else {
        this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
          Salutation: "Miss",
        });
      }

    }

    this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
      Mobile: this.HealthQuateForm.Mobile,
      Email: this.HealthQuateForm.EmailId,
      PinCode: this.HealthQuateForm.PinCode,
    });

    // Set selected pincode In Health quote form
    this._bindPin(this.HealthQuateForm.PinCode);
  }

  // bind Pincode , state & city
  private _bindPin(selectedPinCode: string) {
    this._MasterListService
      .getFilteredPincodeListWithDetails(selectedPinCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.BuyAdityaBrilaNowForm.get('PolicyHolder').patchValue({
              City: res.Data.Items[0].CityName,
              StateName: res.Data.Items[0].StateName,
              StateCode: res.Data.Items[0].StateCode,
              CountryCode: res.Data.Items[0].CountryCode,
            });
          }
        } else {
          this._alertservice.raiseErrors(res.Alerts);
        }
      });
  }

  // add number of members and details
  // in helath quote form selected Insured person data fill in Adityabirla policy member details
  private _addMemberDetails() {
    let title: string;

    for (let i = 0; i < this.member.length; i++) {
      var row: AdityaPolicyMemberDetailsDto =
        new AdityaPolicyMemberDetailsDto();
      if (this.member[i].title == 'Self') {
        title = 'Self';
      }
      switch (this.member[i].title) {
        case 'Self':
          title = 'Self';
          const Names = this.HealthQuateForm.Name.trim()
            .replace(/ +/g, ' ')
            .split(' ');
          if (Names.length > 0) row.FirstName = Names[0].trim();
          if (Names.length > 1) {
            if (Names.length > 2) {
              row.MiddleName = Names[1].trim();
              row.LastName = Names[2].trim();
            } else row.LastName = Names[1].trim();
          }
          row.DOB = this.HealthQuateForm[`${title}DOB`];
          row.Gender = this.HealthQuateForm[`${title}Gender`];
          row.Relation = 'Self';
          this.BuyAdityaBrilaNow.PolicyMemberDetails.push(row);
          this.inf.push(this._initPolicyMemberDetailsForm(row));
          break;
        case 'Spouse':
          title = 'Spouse';
          row.Relation = 'Spouse';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Daughter':
          title = 'Child1';
          row.Relation = 'Daughter';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Daughter1':
          title = 'Child1';
          row.Relation = 'Daughter';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Daughter2':
          title = 'Child2';
          row.Relation = 'Daughter';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Daughter3':
          title = 'Child3';
          row.Relation = 'Daughter';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Son':
          title = 'Child4';
          row.Relation = 'Son';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Son1':
          title = 'Child4';
          row.Relation = 'Son';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Son2':
          title = 'Child5';
          row.Relation = 'Son';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Son3':
          title = 'Child6';
          row.Relation = 'Son';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Mother':
          title = 'Mother';
          row.Relation = 'Mother';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Father':
          title = 'Father';
          row.Relation = 'Father';
          this._SetPolicyMemberDetails(title, row);
          break;

        default:
          break;
      }
    }
  }
  // add member details
  private _SetPolicyMemberDetails(title, row: AdityaPolicyMemberDetailsDto) {
    this.BuyAdityaBrilaNow = this.BuyAdityaBrilaNowForm.value;
    const names = this.HealthQuateForm[`${title}Name`]
      .trim()
      .replace(/ +/g, ' ')
      .split(' ');
    if (names.length > 0) row.FirstName = names[0].trim();
    if (names.length > 1) {
      if (names.length > 2) {
        row.MiddleName = names[1].trim();
        row.LastName = names[2].trim();
      } else row.LastName = names[1].trim();
    }

    row.DOB = this.HealthQuateForm[`${title}DOB`];
    row.Gender = this.HealthQuateForm[`${title}Gender`];
    switch (title) {
      case 'Child1':
        row.Gender = 'Female';
        break;
      case 'Child2':
        row.Gender = 'Female';
        break;
      case 'Child3':
        row.Gender = 'Female';
        break;
      case 'Child4':
        row.Gender = 'Male';
        break;
      case 'Child5':
        row.Gender = 'Male';
        break;
      case 'Child6':
        row.Gender = 'Male';
        break;
      case 'Father':
        row.Gender = 'Male';
        break;
      case 'Mother':
        row.Gender = 'Female';
        break;
    }

    this.BuyAdityaBrilaNow.PolicyMemberDetails.push(row);
    this.inf.push(this._initPolicyMemberDetailsForm(row));
  }

  // main Form
  // INIT main form
  private _buildBuyAdityaBrilaNowForm(data: AdityaBirlaDto) {
    let Buyform = this.fb.group({
      TransactionNo: [''],
      PolicyDetail: this._buildPolicyDetailForm(data.PolicyDetail),
      PolicyMemberDetails: this._buildPolicyMemberDetailsForm(
        data.PolicyMemberDetails
      ),
      PolicyHolder: this._buildPolicyHolderForm(data.PolicyHolder),
      KYCTransactionNo: [''],
    });
    if (data) {
      Buyform.patchValue(data);
    }
    return Buyform;
  }

  // policy details form
  private _buildPolicyDetailForm(data): FormGroup {
    let policyDetailsForm = this.fb.group({
      ProductName: [''],
      Productcode: [''],
      PolicyType: [''],
      SubProductCode: [''],
      SumInsured: [0],
      PolicyStartDate: [''],
      PolicyPeriod: [''],
      CollectionDate: [],
      CollectionAmount: [0],
      SourceTxnId: [''],
    });
    if (data) {
      policyDetailsForm.patchValue(data);
    }
    return policyDetailsForm;
  }

  // policy holder details form
  private _buildPolicyHolderForm(data): FormGroup {
    let policyHolderForm = this.fb.group({
      FirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      MiddleName: [''],
      LastName: ['', [Validators.required, this.noWhitespaceValidator]],
      Mobile: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(10),
        ],
      ],
      Email: ['', [Validators.email, Validators.maxLength(60)]],
      Gender: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      CountryCode: [[''], [Validators.required]],
      StateCode: [[''], [Validators.required]],
      StateName: [''],
      PinCode: ['', [Validators.required]],
      Address: ['', [Validators.required, this.noWhitespaceValidator]],
      Street: ['', [Validators.required]],
      City: ['', [Validators.required]],
      Address1: [''],
      KYCId: [''],
      Marital: [''],
      IsCKYC: [],
      IsDigiLocker: [],
      IsOVD: [],
      Salutation: ['', [Validators.required]],
      NomineeFirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeMiddleName: [''],
      NomineeLastName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeMobileNo: ['', [Validators.required]],
      NomineeRelation: ['', [Validators.required]],
      HomeCity: [''],
      HomeAddress: [''],
      HomeAddress1: [""],
      HomePinCode: [''],
      sameAsHomeAddress: [false]
    });
    if (data) {
      policyHolderForm.patchValue(data);
    }
    return policyHolderForm;
  }

  //Policy member Details array
  private _buildPolicyMemberDetailsForm(
    items: AdityaPolicyMemberDetailsDto[] = []
  ): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPolicyMemberDetailsForm(i));
        });
      }
    }

    return formArray;
  }

  //Policy member details form
  private _initPolicyMemberDetailsForm(
    item: AdityaPolicyMemberDetailsDto
  ): FormGroup {
    let pDF = this.fb.group({
      FirstName: [
        '',
        [
          Validators.required,
          this.noWhitespaceValidator,
          Validators.maxLength(60),
        ],
      ],
      MiddleName: [''],
      LastName: [
        '',
        [
          Validators.required,
          this.noWhitespaceValidator,
          Validators.maxLength(60),
        ],
      ],
      Relation: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      Gender: ['', [Validators.required]],
      HeightCM: [0, [Validators.required, Validators.max(400)]],
      HeightInFeet: [],
      HeightInInch: [],
      WeightKG: [0, [Validators.required, Validators.max(300)]],
      Marital: ['', [Validators.required]],
      Occupation: ['', [Validators.required]],
      NomineeFirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeMiddleName: [''],
      NomineeLastName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeMobileNo: ['', [Validators.required]],
      NomineeRelation: ['', [Validators.required]],
      MemberPEDList: [],
      HaveAnyPED: [false],
      Salutation: ['', [Validators.required]],
      MemberQuestionDetails: this._buildMemberQuestionDetailsArray(),
      PersonalHabitDetail: this._buildPersonalHabitDetail(
        item.PersonalHabitDetail
      ),
    });
    if (item != null) {
      if (!item) {
        item = new AdityaPolicyMemberDetailsDto();
      }

      if (item) {
        pDF.patchValue(item);
      }
    }

    return pDF;
  }

  //Policy member personal habit array
  private _buildPersonalHabitDetail(
    item: IAdityaPersonalHabitDetailDto[] = []
  ): FormArray {
    let formArray: FormArray = new FormArray([]);

    if (item == null || !item.length) {
      this.personalHabbitList.forEach((Q) => {
        let item: IAdityaPersonalHabitDetailDto =
          new AdityaPersonalHabitDetailDto();
        item.Type = Q.Type;
        item.NumberOfYears = Q.NumberOfYears;
        formArray.push(this._initPersonalHabitDetailForm(item));
      });
    } else {
      item.forEach((i) => {
        formArray.push(this._initPersonalHabitDetailForm(i));
      });
    }

    return formArray;
  }

  //Policy member personal habit form
  private _initPersonalHabitDetailForm(item: IAdityaPersonalHabitDetailDto) {
    let fg = this.fb.group({
      IsCheck: [],
      NumberOfYears: [''],
      Count: [''],
      Type: [''],
    });

    if (item != null) {
      if (!item) {
        item = new AdityaPersonalHabitDetailDto();
      }

      if (item) {
        fg.patchValue(item);
      }
    }
    return fg;
  }

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { whitespace: true };
  }

  // Make Member wise Member PED list data All  Remarks Field data value Join with "|"
  private _joiMemberPedRemarks() {
    //Use Deep copy & shalow copy Concept
    // Deep Copy for not change origin value in formarray
    this.memberDetailsAsArray = JSON.parse(JSON.stringify(this.inf.value));

    this.inf.value.forEach((m, i) => {
      // Member PED List Array
      let MemberQuestionDetailsList: IMemberQuestionDetailsDto[] = [];

      m.MemberQuestionDetails.forEach((q, j) => {
        let MemberQuestionDetails: IMemberQuestionDetailsDto =
          new MemberQuestionDetailsDto();

        // Is Question tick true then Set Aswer Is 1
        if (q.IsCheck) {
          MemberQuestionDetails.Answer = '1';
          MemberQuestionDetails.QuestionCode = q.QCode;

          // Check If Have Sub-question than Exicute Loop
          if (q.SubQuestion) {
            let memberWiseRemarksJoin: string[] = [];
            for (let i in q.SubQuestion) {
              // If have sub question And Their is not null then it is push
              if (q.SubQuestion[i] != null && q.SubQuestion[i] != '') {
                // Formate date field remark
                if (
                  i == 'StartDateHospitalization' ||
                  i == 'EndDateHospitalization' ||
                  i == 'LastConsultationDate' ||
                  i == 'DateOfDiagnosis'
                ) {
                  memberWiseRemarksJoin.push(
                    this._datePipe.transform(q.SubQuestion[i], 'yyyy-MM-dd')
                  );
                } else {
                  memberWiseRemarksJoin.push(q.SubQuestion[i]);
                }

              }

            }
            // Join All sub question input Field with "|"
            MemberQuestionDetails.Remarks = memberWiseRemarksJoin.length > 0 ? memberWiseRemarksJoin.join("|") : "";
          } else {
            // If Have not Sub-question then set only remarks
            MemberQuestionDetails.Remarks = q.Remarks
          }
        } else {
          // If Question not checked Then set Answer is "0"
          MemberQuestionDetails.Answer = '0';
          MemberQuestionDetails.QuestionCode = q.QCode;
          MemberQuestionDetails.Remarks = '';
        }
        MemberQuestionDetailsList.push(MemberQuestionDetails);

        // Set Member wise PED List Data
        this.memberDetailsAsArray[i].MemberQuestionDetails = MemberQuestionDetailsList

      })

    })
  }

  /**
   *Build Member PED Question  FormArray
   * @returns
   */
  // Policy member Pre-existing Dialisis list form array
  private _buildMemberQuestionDetailsArray(): FormArray {
    let formArray: FormArray = new FormArray([]);

    this.PEDquestionList.forEach((Q) => {
      let item: IMemberPEDquestionList = new MemberPEDquestionList();
      item.QCode = Q.QCode;
      item.IsCheck = Q.IsCheck;
      item.HasSubQuestion = Q.HasSubQuestion;
      formArray.push(this._BuildMemberQuestionDetailsForm(item));
    });

    return formArray;
  }

  /**
   * In this Form Remarks Field For Which Que. Have not Sub Que, then User Enter Remarks In this Form Control
   * In this Form SubQuestion Field For Which Que. Have  Sub Que, then User Enter Sub-que. Details In this Form
   * @param item
   * @returns
   */
  //Policy member Pre-existing Dialisis list form
  private _BuildMemberQuestionDetailsForm(item: IMemberPEDquestionList) {
    let fg = this.fb.group({
      IsCheck: [],
      QCode: [],
      Remarks: [],
      SubQuestion: item.HasSubQuestion ? this.BuildChildQuestionForm() : [],
    });

    if (item) {
      fg.patchValue(item);
    }

    return fg;
  }

  /**
   * Membet PED Question of SUb que. Form
   * @returns
   */
  private BuildChildQuestionForm() {
    let chiledQuestionForm = this.fb.group({
      StartDateHospitalization: [''],
      EndDateHospitalization: [''],
      Disability: [''],
      LastConsultationDate: [''],
      OtherInformation: [''],
      DiseaseName: [''],
      DateOfDiagnosis: [''],
      NameOfSurgery: [''],
      DetailsOfTreatment: [''],
    });

    return chiledQuestionForm;
  }

  private filterMarketMulti() {
    if (!this.IllnessList) {
      return;
    }
    // get the search keyword
    let search = this.searchControl.value;
    if (!search) {
      this.FilterSearchData.next(this.IllnessList);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.FilterSearchData.next(
      this.IllnessList.filter(
        (que) => que.PedText.toLowerCase().indexOf(search) > -1
      )
    );
  }

  //#endregion Private methods
}
