import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  FormControl,
  FormControlName,
} from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert } from '@models/common';
import {
  IBajajBuyNowDto,
  BajajBuyNowDto,
} from '@models/dtos/config/Bajaj/buynow-dto';
import { MasterListService } from '@lib/services/master-list.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ICityPincodeDto } from '@models/dtos/core/CityDto';
import { Observable } from 'rxjs/internal/Observable';
import { Subject, of, switchMap, takeUntil } from 'rxjs';
import { IBajajIllnessDto, IKYCDto, KYCDto } from '@models/dtos/config';
import { BajajService } from './bajaj.service';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { DatePipe } from '@angular/common';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { Router } from '@angular/router';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';
import { ROUTING_PATH } from '@config/routingPath.config';
import { BajajPolicyMemberDetailsDto } from '@models/dtos/config/Bajaj';
import { UnitConversion } from '@config/UnitConversion';
import { Genders } from '@config/Gender.config';
import { ValidationRegex } from '@config/validationRegex.config';



@Component({
  selector: 'gnx-bajaj',
  templateUrl: './bajaj.component.html',
  styleUrls: ['./bajaj.component.scss'],
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
export class BajajComponent {
  // #region public variables

  //String
  pagetitle: string = 'Bajaj Allianz Health';
  imgsrc = '/assets//images/avatars/upload.png';
  PolicyType: string;
  HealthQuateForm: any;
  logo: string;
  Insurer : string;
  NonMedicalExpenseYes: string;
  NonMedicalExpenseNo: string;
  maxBirthDate: Date;

  //boolean
  IsKYC: boolean = false;
  True: boolean;
  False: boolean;

  //Number
  InsuredPeople: number;
  ReqSumInsured: number;
  SelectedMemberIndex: number;

  //Formgroup & DTO
  Policies: any;
  ProductName: string;
  // SubProductName:string;

  BuyNowForm: FormGroup;
  policyDetailsForm: FormGroup;
  BuyNow: IBajajBuyNowDto;
  pincodes$: Observable<ICityPincodeDto[]>;
  IllnessList: IBajajIllnessDto[];
  KYC: IKYCDto;
  Conversion: UnitConversion;
  genders:Genders;
  DropdownMaster: dropdown;
  cityAPI = API_ENDPOINTS.City.Base;
  age;
  showAge;
  //Array
  error: Alert[] = []
  alerts: Alert[] = [];
  alerts12: Alert[] = [];
  GenderList: any[];
  RelationList: any[];
  NomineeRelationList: any[];
  OccupationList: any[];
  member: any[];
  flag = 1 //check if data of buynow , member & health form is not empty
  insurerFlag = 1 //check if name of the insurer is bajaj or not
  addOnFlag = 0

  destroy$: Subject<any>;
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  PANNum: RegExp = ValidationRegex.PANNumValidationReg;
  AadharNum: RegExp = ValidationRegex.UIDNumValidationReg;
  phoneNum: RegExp = ValidationRegex.phoneNumReg;
  memberDetailsAsArray;

  //FormControl
  step1 = new FormControl();

  // #endregion public variables

  /**
   * #region constructor
   * @param fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   */

  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    private _BajajService: BajajService,
    public dialog: MatDialog,
    private _MasterListService: MasterListService, // number of people insured,
    private _datePipe: DatePipe,
    private _router:Router
  ) {
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();
    this.Conversion = new UnitConversion();
    this.genders = new Genders();
    this.maxBirthDate = new Date(Date.now());
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);
    this.SelectedMemberIndex = 0;
    this.True = true;
    this.False = false;
    this.NonMedicalExpenseYes = "1";
    this.NonMedicalExpenseNo = "0";

    // if any one of HealthQuateForm , buynow , member is not stored in localstorage than return back to Health form
    if(!localStorage.getItem('member') || !localStorage.getItem('buynow') || !localStorage.getItem('HealthQuateForm')){
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.Health]);
      // if(window.location.href.indexOf('mediclaim') != -1){
      // }
      // else {
      //   this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.Compare]);
      // }
      this.flag=0
      return ;
    } else {
      // if name of the insurer in buynow is not bajaj than return plan list to choose a plan
      let Insurer = JSON.parse(localStorage.getItem('buynow'))
      if (Insurer.Insurer.toLowerCase() != InsuranceCompanyName.BajajAllianz) {
        if(window.location.href.indexOf('mediclaim') != -1){
          this._router.navigate([ROUTING_PATH.QuoteMediclaim.List]);
        }
        else {
          this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.List]);
        }
        this.insurerFlag = 0
        return
      }
    }

    if (localStorage.getItem('member')) {
      this.member = JSON.parse(localStorage.getItem('member'));
      this.InsuredPeople = this.member.length;
    }
    // Icon of the comany and poilcy details
    if (localStorage.getItem('buynow')) {
      this.Policies = JSON.parse(localStorage.getItem('buynow'));
      this.logo = this.Policies.IconURL;
      this.Insurer = this.Policies.Insurer;
      if (this.Policies.PolicyType == 'MultiIndividual') {
        this.PolicyType = 'Individual';
      } else if (this.Policies.PolicyType == 'FamilyFloater') {
        this.PolicyType = 'Family Floater';
      } else {
        this.PolicyType = this.Policies.PolicyType;
      }
      this.ProductName = this.Policies.ProductName;

      this.IllnessList = this._BajajService.getIllness();
    }
    this.addOnFlag = 0
  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this.BuyNow = new BajajBuyNowDto();

    this.BuyNowForm = this._buildBuyNowForm(this.BuyNow);
    this.BuyNow.PolicyMemberDetails = new Array<BajajPolicyMemberDetailsDto>();

    if (this.flag && this.insurerFlag) {

      this._fillMasterList();
      this._onFormChanges();
      this.memberDetailsAsArray = this.BuyNowForm.get(
        'PolicyMemberDetails'
      ) as FormArray;

      this.HealthQuateForm = JSON.parse(localStorage.getItem('HealthQuateForm'));
      this.setValue();
      this.onPolicy();

      this._addMemberDetails();
      this._membersDetails();
      this._AddOns();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  //#endregion lifecyclehooks
  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  get f() {
    return this.BuyNowForm.controls;
  }
  get inf() {
    return this.BuyNowForm.get('PolicyMemberDetails') as FormArray;
  }

  //  Policy Details 
  /**
   * patching values of Policy details from this.Policies
   */
  public onPolicy() {
    if (this.Policies != null) {
      this.policyDetailsForm.patchValue({
        ProductName: this.Policies.ProductName,
        SubProductName: this.Policies.SubProductName,
        Productcode: this.Policies.ProductCode,
        SubProductCode: this.Policies.SubProductCode,
        SumInsured: this.Policies.SumInsured,
        PolicyPeriod: this.Policies.PolicyPeriod,
      });
      this.BuyNowForm.patchValue({ TransactionNo: this.Policies.QuoteNo });
    }
  }

  // pop up for pincode
  public openDiologPincode(type: string, title: string, MemberIndex: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";
    this.SelectedMemberIndex = MemberIndex;
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
          this.BuyNowForm.get('PolicyHolder').patchValue({
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

  // pincode autocomplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.BuyNowForm.get('PolicyHolder').patchValue({
      City: event.option.value.CityName,
      StateName: event.option.value.StateName,
      PinCode: event.option.value.PinCode,
    });
    this.BuyNowForm.get('PolicyHolder.PinCode').patchValue(
      event.option.value.PinCode
    );
  }

  // change in Existing Illness
  /**
   * when the main question is selected false than Description of that questions will also be reset.
   */
  public onChange() {
    this.memberDetailsAsArray.controls.forEach((element, index) => {
      if (
        this.memberDetailsAsArray.at(index).get('PreExistDisease').value ==
        false
      ) {
        this.memberDetailsAsArray
          .at(index)
          .controls['PreExistDisease_CholesterolDisorder'].setValue(false);
        this.memberDetailsAsArray
          .at(index)
          .controls['PreExistDisease_Hypertension'].setValue(false);
        this.memberDetailsAsArray
          .at(index)
          .controls['PreExistDisease_Diabetes'].setValue(false);
        this.memberDetailsAsArray
          .at(index)
          .controls['PreExistDisease_Obesity'].setValue(false);
        this.memberDetailsAsArray
          .at(index)
          .controls['PreExistDisease_CardiovascularDiseases'].setValue(false);
        this.memberDetailsAsArray
          .at(index)
          .controls['PreExistDisease_Others'].setValue(false);
        this.memberDetailsAsArray
          .at(index)
          .controls['PreExistDisease_OthersDescription'].reset();
      }
      if (this.memberDetailsAsArray.at(index).get('Asthma').value == false) {
        this.memberDetailsAsArray
          .at(index)
          .controls['AsthmaDescription'].reset();
      }
      if (
        this.memberDetailsAsArray.at(index).get('SmokerTibco').value == false
      ) {
        this.memberDetailsAsArray
          .at(index)
          .controls['SmokerTibcoDescription'].reset();
      }
      if (
        this.memberDetailsAsArray.at(index).get('CholesterolDisorDr').value == false
      ) {
        this.memberDetailsAsArray
          .at(index)
          .controls['CholesterolDisorDrDescription'].reset();
      }
      if (
        this.memberDetailsAsArray.at(index).get('HeartDisease').value == false
      ) {
        this.memberDetailsAsArray
          .at(index)
          .controls['HeartDiseaseDescription'].reset();
      }
      if (
        this.memberDetailsAsArray.at(index).get('Hypertension').value == false
      ) {
        this.memberDetailsAsArray
          .at(index)
          .controls['HypertensionDescription'].reset();
      }
      if (this.memberDetailsAsArray.at(index).get('Obesity').value == false) {
        this.memberDetailsAsArray
          .at(index)
          .controls['ObesityDescription'].reset();
      }
    });
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

  // clear pincode & city details
  public clear(name: string): void {
    this.BuyNowForm.get(name).setValue('');
    if (name == 'PolicyHolder.PinCode') {
      this.BuyNowForm.get('PolicyHolder.City').setValue('');
      this.BuyNowForm.get('PolicyHolder.StateName').setValue('');
    }
  }

  // check step two
  public stepTwoValidate() {
    this.memberDetailsAsArray.controls.forEach((element, index) => {
      if (
        this.memberDetailsAsArray
          .at(index)
          .get('PreExistDisease_OthersDescription').value != '' &&
        this.memberDetailsAsArray.at(index).get('PreExistDisease_Diabetes')
          .value == true
      ) {
        element.patchValue({
          PreExistDisease_DiabetesDescription: this.memberDetailsAsArray
            .at(index)
            .get('PreExistDisease_OthersDescription').value,
        });
      }
      if (
        this.memberDetailsAsArray
          .at(index)
          .get('PreExistDisease_OthersDescription').value != '' &&
        this.memberDetailsAsArray.at(index).get('PreExistDisease_Hypertension')
          .value == true
      ) {
        element.patchValue({
          PreExistDisease_HypertensionDescription: this.memberDetailsAsArray
            .at(index)
            .get('PreExistDisease_OthersDescription').value,
        });
      }
      if (
        this.memberDetailsAsArray
          .at(index)
          .get('PreExistDisease_OthersDescription').value != '' &&
        this.memberDetailsAsArray
          .at(index)
          .get('PreExistDisease_CholesterolDisorder').value == true
      ) {
        element.patchValue({
          PreExistDisease_CholesterolDisorderDescription:
            this.memberDetailsAsArray
              .at(index)
              .get('PreExistDisease_OthersDescription').value,
        });
      }
      if (
        this.memberDetailsAsArray
          .at(index)
          .get('PreExistDisease_OthersDescription').value != '' &&
        this.memberDetailsAsArray.at(index).get('PreExistDisease_Obesity')
          .value == true
      ) {
        element.patchValue({
          PreExistDisease_ObesityDescription: this.memberDetailsAsArray
            .at(index)
            .get('PreExistDisease_OthersDescription').value,
        });
      }
      if (
        this.memberDetailsAsArray
          .at(index)
          .get('PreExistDisease_OthersDescription').value != '' &&
        this.memberDetailsAsArray
          .at(index)
          .get('PreExistDisease_CardiovascularDiseases').value == true
      ) {
        element.patchValue({
          PreExistDisease_CardiovascularDiseasesDescription:
            this.memberDetailsAsArray
              .at(index)
              .get('PreExistDisease_OthersDescription').value,
        });
      }
    });

    this.alerts = [];
    this.member.forEach((ele, index) => {

      let SelectMember = 0
      if(ele.title == 'Self' || ele.title == 'Spouse'){
        SelectMember = 1
      }
      else{
        SelectMember = 0
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

      if (this.inf.controls[index].value.DOB == '' || this.inf.controls[index].value.DOB == null) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('DOB'),
          Message: `Enter ${ele.title} Date of Birth`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.DOB != '') {
        if (this.inf.controls[index].value.DOB > this.maxBirthDate) {
          this.alerts.push({
            FieldName: this.inf.controls[index].get('DOB'),
            Message: `Enter valid ${ele.title} Date of Birth`,
            CanDismiss: false,
            AutoClose: false,
          });
        }

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
          Message: `Enter ${ele.title} Height in Feet`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.inf.controls[index].value.HeightInInch < 0 || this.inf.controls[index].value.HeightInInch ==null || this.inf.controls[index].value.HeightInInch =='') {
        this.alerts.push({
          Message: `Enter ${ele.title} Height in Inch`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.inf.controls[index].value.WeightKG == 0) {
        this.alerts.push({
          Message: `Enter ${ele.title} Weight in KG`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.Occupation == '' && SelectMember == 1) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('Occupation'),
          Message: `Enter ${ele.title} Occupation`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.GrossMonthlyIncome == 0 && SelectMember == 1) {

        if(this.inf.controls[index].value.Occupation != 'H' && SelectMember == 1){
        this.alerts.push({
          FieldName: this.inf.controls[index].get('GrossMonthlyIncome'),
          Message: `Enter ${ele.title} Gross Monthly Income`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      }

      if (this.inf.controls[index].value.HeightInFeet <= 0) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('HeightInFeet'),
          Message: `Enter ${ele.title} Height in Feet`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.inf.controls[index].value.HeightInInch < 0) {
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

      if (this.inf.controls[index].get('NomineeFirstName').invalid) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('NomineeFirstName'),
          Message: `Enter ${ele.title} Nominee First Name`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].get('NomineeMiddleName').invalid) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('NomineeMiddleName'),
          Message: `Enter ${ele.title} Nominee Middle Name`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].get('NomineeLastName').invalid) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('NomineeLastName'),
          Message: `Enter ${ele.title} Nominee Last Name`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.inf.controls[index].value.NomineeRelation == '0') {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('NomineeRelation'),
          Message: `Enter ${ele.title} Nominee Relation`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.inf.controls[index].value.NomineeAge == 0) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('NomineeAge'),
          Message: `Enter ${ele.title} Nominee Age`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.NomineeAge < 0) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('NomineeAge'),
          Message: `Enter valid ${ele.title} Nominee Age`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.NomineeAge < 18) {

        if (this.inf.controls[index].get('AppointeeFirstName').invalid) {
          this.alerts.push({
            FieldName: this.inf.controls[index].get('AppointeeFirstName'),
            Message: `Enter ${ele.title} Appointee First Name`,
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (this.inf.controls[index].get('AppointeeMiddleName').invalid) {
          this.alerts.push({
            FieldName: this.inf.controls[index].get('AppointeeMiddleName'),
            Message: `Enter ${ele.title} Appointee Middle Name`,
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (this.inf.controls[index].get('AppointeeLastName').invalid) {
          this.alerts.push({
            FieldName: this.inf.controls[index].get('AppointeeLastName'),
            Message: `Enter ${ele.title} Appointee Last Name`,
            CanDismiss: false,
            AutoClose: false,
          });
        }
        if (this.inf.controls[index].value.AppointeeRelation == '0') {
          this.alerts.push({
            FieldName: this.inf.controls[index].get('AppointeeRelation'),
            Message: `Enter ${ele.title} Appointee Relation`,
            CanDismiss: false,
            AutoClose: false,
          });
        }

      }

      if (this.inf.controls[index].value.PreExistDisease == null) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('PreExistDisease'),
          Message: `Enter Answer Of Question-1 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.inf.controls[index].value.PreExistDisease == true &&
        this.inf.controls[index].value.PreExistDisease_OthersDescription == ''
      ) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('PreExistDisease_OthersDescription'),
          Message: `Enter  Description for question-1 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.Asthma == null) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('Asthma'),
          Message: `Enter Answer Of Question-2 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.inf.controls[index].value.Asthma == true &&
        this.inf.controls[index].value.AsthmaDescription == ''
      ) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('AsthmaDescription'),
          Message: `Enter Description for question-2 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.SmokerTibco == null) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('SmokerTibco'),
          Message: `Enter Answer Of Question-3 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.inf.controls[index].value.SmokerTibco == true &&
        this.inf.controls[index].value.SmokerTibcoDescription == ''
      ) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('SmokerTibcoDescription'),
          Message: `Enter Description for question-3 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.CholesterolDisorDr == null) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('CholesterolDisorDr'),
          Message: `Enter Answer Of Question-4 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.inf.controls[index].value.CholesterolDisorDr == true &&
        this.inf.controls[index].value.CholesterolDisorDrDescription == ''
      ) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('CholesterolDisorDrDescription'),
          Message: `Enter Description for question-4 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.HeartDisease == null) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('HeartDisease'),
          Message: `Enter Answer Of Question-5 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.inf.controls[index].value.HeartDisease == true &&
        this.inf.controls[index].value.HeartDiseaseDescription == ''
      ) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('HeartDiseaseDescription'),
          Message: `Enter Description for question-5 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.Hypertension == null) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('Hypertension'),
          Message: `Enter Answer Of Question-6 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.inf.controls[index].value.Hypertension == true &&
        this.inf.controls[index].value.HypertensionDescription == ''
      ) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('HypertensionDescription'),
          Message: `Enter Description for question-6 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.Obesity == null) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('Obesity'),
          Message: `Enter Answer Of Question-7 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.inf.controls[index].value.Obesity == true &&
        this.inf.controls[index].value.ObesityDescription == ''
      ) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('ObesityDescription'),
          Message: `Enter Description for question-7 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
    });
  }

  // to convert foot and inches into cm
  public SetCM(index:number){
    this.inf.controls[index].patchValue({
      HeightCM: this.Conversion.GetCentimeters(this.inf.controls[index].value.HeightInFeet,this.inf.controls[index].value.HeightInInch)
    });
  }
  // proceed to payment portol
  /**
   * firstly if the form data is invalid raise an error addressing invalid form field
   * 
   * when form data is valid proceed forward to create a proposal 
   */
  public ProceedToPay() {
    this.stepTwoValidate();
    if (this.alerts.length > 0) {

      // Focus on First Invalid field
      if(this.alerts[0].FieldName){
        (<any>this.alerts[0].FieldName).nativeElement.focus();
      }

      this._alertservice.raiseErrors(this.alerts);
      return;
    }
    this._healthConditions();
    if (this.error.length > 0) {

      this._alertservice.raiseErrors(this.error);
      return;
    }

    this.BuyNowForm.get('PolicyHolder').patchValue({
      DOB: this._datePipe.transform(this.BuyNowForm.get('PolicyHolder.DOB').value, 'yyyy-MM-dd')
    });
    this.inf.value.forEach(ele => {
      ele.DOB = this._datePipe.transform(ele.DOB, 'yyyy-MM-dd')

    })
    this._BajajService
      .CreateProposal(this.BuyNowForm.value)
      .subscribe((res) => {
        if (res.Success) {
          this._alertservice.raiseSuccessAlert(res.Message);
          window.open(res.Data.PaymentURL, '_self');
        }
        else{
          if(res.Alerts && res.Alerts.length > 0){
          this._alertservice.raiseErrors(res.Alerts);
          }
          else{
            this._alertservice.raiseErrorAlert(res.Message);
          }
        }
      });
  }

  // check KYC
  /**
   * if either PanNo. or UID is valid proceed forward to validate it 
   * if PanNo. and UID both are valid than firstly verify PanNo. . If PanNo. is verifed than no need to verify UID.
   * But in case PanNo. is not verified than verify UID and if not verified raise alert message. 
   * If UID is not provided that rasie a message to enter UID number .
   * 
   * if only UID is provided that verify it and if it is not verified than raise alert message.
   */
  public CheckKYC(stepper: MatStepper) {
    let requiredId: boolean = true;
    if (this.BuyNowForm.get('PolicyHolder.PanNo').invalid && this.BuyNowForm.get('PolicyHolder.UID').invalid) {
      this._alertservice.raiseErrorAlert('Enter either Valid PAN or Valid Aadhar');
      requiredId = false;
    }
    if (requiredId && this.BuyNowForm.get('PolicyHolder.PanNo').valid) {
      let KYCdata = this._KYCData('PAN')
      this._BajajService.KYC(KYCdata).subscribe((resPAN) => {

        if (resPAN.Success) {
          if (resPAN.Data.KycStatus == 'KYC_SUCCESS') {
            this.IsKYC = true;
            this._alertservice.raiseSuccessAlert(resPAN.Message);
            this.step1.reset();
            stepper.next();
          }
        }
        else {
          if (this.BuyNowForm.get('PolicyHolder.UID').value == null || this.BuyNowForm.get('PolicyHolder.UID').value == '') {
            this._alertservice.raiseErrorAlert('Cannot validate PAN. Enter Aadhar for KYC.');
          }
          if (this.BuyNowForm.get('PolicyHolder.UID').value != '' && this.BuyNowForm.get('PolicyHolder.UID').invalid) {
            this._alertservice.raiseErrorAlert('Cannot validate PAN. Enter valid Aadhar for KYC.');
          }
          if (this.BuyNowForm.get('PolicyHolder.UID').valid) {
            this._alertservice.raiseErrorAlert('Wait till Aadhar is being verified',true)
            let KYCdata = this._KYCData('UID')
            this._BajajService.KYC(KYCdata).subscribe((resAadhar) => {
              if (resAadhar.Success) {
                if (resAadhar.Data.KycStatus == 'KYC_SUCCESS') {
                  this.IsKYC = true;
                  this._alertservice.raiseSuccessAlert(resAadhar.Message);
                  this.step1.reset();
                  stepper.next();
                }
              }
              else {
                stepper.previous();
                if(resAadhar.Alerts && resAadhar.Alerts.length > 0){
                  this._alertservice.raiseErrors(resAadhar.Alerts);
                }
                else{
                  this._alertservice.raiseErrorAlert(resAadhar.Message);
                }
              }
            })
          }
        }

      });
    }
    else if (requiredId && this.BuyNowForm.get('PolicyHolder.UID').valid) {
      let KYCdata = this._KYCData('UID')
      this._BajajService.KYC(KYCdata).subscribe((res) => {
        if (res.Success) {
          if (res.Data.KycStatus == 'KYC_SUCCESS') {
            this.IsKYC = true;
            this._alertservice.raiseSuccessAlert(res.Message);
            this.step1.reset();
            stepper.next();
          }
        }
        else {
          stepper.previous();
          if (this.BuyNowForm.get('PolicyHolder.PanNo').value==null || this.BuyNowForm.get('PolicyHolder.PanNo').value=='') {
            this._alertservice.raiseErrorAlert('Cannot validate Aadhar. Enter PAN for KYC.');
          }
          else {
            if(res.Alerts && res.Alerts.length > 0){
              this._alertservice.raiseErrors(res.Alerts);
            }
            else{
              this._alertservice.raiseErrorAlert(res.Message);
            }
          }
        }
      })
    }
    else {
      this._alertservice.raiseErrorAlert('Enter Valid PAN');
    }
  }

  // check step one
  public StepOneSubmit(stepper): any {
    this.alerts = [];

    if (this.BuyNowForm.get('PolicyHolder.FirstName').invalid) {
      this.alerts.push({
        FieldName: this.BuyNowForm.get('PolicyHolder.FirstName'),
        Message: 'Enter your First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.BuyNowForm.get('PolicyHolder.LastName').invalid ||
      this.BuyNowForm.get('PolicyHolder.LastName').value == undefined
    ) {
      this.alerts.push({
        FieldName: this.BuyNowForm.get('PolicyHolder.LastName'),
        Message: 'Enter you Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // gender required
    if (this.BuyNowForm.get('PolicyHolder.Gender').value == '') {
      this.alerts.push({
        FieldName: this.BuyNowForm.get('PolicyHolder.Gender'),
        Message: 'Select your Gender',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.BuyNowForm.get('PolicyHolder.DOB').value == '' || this.BuyNowForm.get('PolicyHolder.DOB').value == null) {
      this.alerts.push({
        FieldName: this.BuyNowForm.get('PolicyHolder.DOB'),
        Message: 'Enter Your Date of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyNowForm.get('PolicyHolder.DOB').value != '') {
      if (this.BuyNowForm.get('PolicyHolder.DOB').value > this.maxBirthDate) {
        this.alerts.push({
          FieldName: this.BuyNowForm.get('PolicyHolder.DOB'),
          Message: 'Enter Valid Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }

    }

    if (this.BuyNowForm.get('PolicyHolder.Address').value == '') {
      this.alerts.push({
        FieldName: this.BuyNowForm.get('PolicyHolder.Address'),
        Message: 'Enter Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyNowForm.get('PolicyHolder.PinCode').value == '') {
      this.alerts.push({
        Message: 'Enter PinCode',
        CanDismiss: false,
        AutoClose: false,
      });
    }


    if (this.BuyNowForm.get('PolicyHolder.City').value == '') {
      this.alerts.push({
        FieldName: this.BuyNowForm.get('PolicyHolder.City'),
        Message: 'Enter City Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }


    if (
      this.BuyNowForm.get('PolicyHolder.Mobile').value == '' ||
      this.BuyNowForm.get('PolicyHolder.Mobile').value == null
    ) {
      this.alerts.push({
        FieldName: this.BuyNowForm.get('PolicyHolder.Mobile'),
        Message: 'Enter Mobile No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }



    if (
      this.BuyNowForm.get('PolicyHolder.Mobile').value != '' &&
      this.BuyNowForm.get('PolicyHolder.Mobile').value != null
    ) {
      if (
        !this.phoneNum.test(this.BuyNowForm.get('PolicyHolder.Mobile').value)
      ) {
        this.alerts.push({
          FieldName: this.BuyNowForm.get('PolicyHolder.Mobile'),
          Message: 'Mobile Number must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (
      this.BuyNowForm.get('PolicyHolder.TelephoneNo').value == '' ||
      this.BuyNowForm.get('PolicyHolder.TelephoneNo').value == null
    ) {
      this.alerts.push({
        FieldName: this.BuyNowForm.get('PolicyHolder.TelephoneNo'),
        Message: 'Enter Emergency Contact No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.BuyNowForm.get('PolicyHolder.TelephoneNo').value != '' &&
      this.BuyNowForm.get('PolicyHolder.TelephoneNo').value != null
    ) {
      if (
        !this.phoneNum.test(
          this.BuyNowForm.get('PolicyHolder.TelephoneNo').value
        )
      ) {
        this.alerts.push({
          FieldName: this.BuyNowForm.get('PolicyHolder.TelephoneNo'),
          Message: 'Emergency Contact Number must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.BuyNowForm.get('PolicyHolder.Email').invalid) {
      this.alerts.push({
        FieldName: this.BuyNowForm.get('PolicyHolder.Email'),
        Message: 'Enter your Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyNowForm.get('PolicyHolder.Email').value != '') {
      if (
        !this.emailValidationReg.test(
          this.BuyNowForm.get('PolicyHolder.Email').value
        )
      ) {
        this.alerts.push({
          FieldName: this.BuyNowForm.get('PolicyHolder.Email'),
          Message: 'Enter Valid Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }



    if ((this.BuyNowForm.get('PolicyHolder.PanNo').value == null || this.BuyNowForm.get('PolicyHolder.PanNo').value == '') && (this.BuyNowForm.get('PolicyHolder.UID').invalid)) {
      this.alerts.push({
        FieldName: this.BuyNowForm.get('PolicyHolder.PanNo'),
        Message: 'Enter either Your PAN or Aadhar',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyNowForm.get('PolicyHolder.PanNo').value != '') {
      if(!this.PANNum.test(this.BuyNowForm.get('PolicyHolder.PanNo').value)){
        this.alerts.push({
          FieldName: this.BuyNowForm.get('PolicyHolder.PanNo'),
          Message: 'Enter Valid PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.BuyNowForm.get('PolicyHolder.UID').value != '') {
      if(!this.AadharNum.test(this.BuyNowForm.get('PolicyHolder.UID').value)){
        this.alerts.push({
          FieldName: this.BuyNowForm.get('PolicyHolder.UID'),
          Message: 'Enter Valid Aadhar',
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

  // alert message for step one
  StepOneError(stepper: MatStepper) {
    if (this.alerts.length > 0) {

      // Focus on First Invalid field
      if(this.alerts[0].FieldName){
        (<any>this.alerts[0].FieldName).nativeElement.focus();
      }
      this._alertservice.raiseErrors(this.alerts);
      return;
    }
    this.CheckKYC(stepper);
  }

  // radio button
  /**
   * since we have used span for label instead of label tag in radio button by clicking on label, we have to use this function.
   * it will patch the value of the label to the corresponding radio button
   * 
   * @param index : to identify the member
   * @param label : is a formControlName
   * @param value : true/false
   */
  public radioLabel(index:number,label:string, value:boolean) {

    this.memberDetailsAsArray.controls[index].get(label).patchValue(
      value
    )

  }


  //#endregion public-methods
  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // AddOns details
  /**
   * the value of AddOn that are selected on Addon page will be patched here. 
   */
  private _AddOns () {
    let addOn
    if (localStorage.getItem('AddOns')) {
      addOn=JSON.parse(localStorage.getItem('AddOns'))
    }

    this.BuyNowForm.get('PolicyDetail').patchValue({
      Polcov46:addOn.Polcov46,
      Polcovvolntrycp:addOn.Polcovvolntrycp?addOn.CoPay:'',

    })
    this.memberDetailsAsArray.controls.forEach((data,index) => {
      data.get('Addonnme').patchValue(addOn.Addonnme)
    })

    if (this.BuyNowForm.get('PolicyDetail.Polcov46').value || this.memberDetailsAsArray.controls.at(0).get('Addonnme').value) {
      this.addOnFlag = 1
    }
  }

  // KYC data
  /**
   * depending on the DocType , data is send for KYC verification.
   * For docType = 'PAN' , DocTypeCode ='PAN' & DocNumber = PanNo. is sent along with other data like name & DOB for KYC verification
   * Similarly for docType = 'UID' , DocTypeCode ='UID' & DocNumber = UID is sent along with other data like name & DOB for KYC verification
   * 
   * @param DocType : document type (PAN or UID)
   */
  private _KYCData(DocType:string) {
    let PANKYC: KYCDto = new KYCDto();
    PANKYC.DOB = this._datePipe.transform(this.BuyNowForm.get('PolicyHolder.DOB').value, "yyyy-MM-dd")
    if (DocType=='PAN'){
      PANKYC.DocNumber = this.BuyNowForm.get('PolicyHolder.PanNo').value;
      PANKYC.DocTypeCode = 'PAN';
    }
    else if (DocType == 'UID') {
      PANKYC.DocNumber = this.BuyNowForm.get('PolicyHolder.UID').value;
      PANKYC.DocTypeCode = 'UID';
    }
    PANKYC.Gender = this.BuyNowForm.get('PolicyHolder.Gender').value;
    PANKYC.ProductCode = this.Policies.ProductCode;
    PANKYC.TransactionNo = this.Policies.QuoteNo;
    PANKYC.PassportFileNumber = '';
    PANKYC.Name = this._fullName(this.BuyNowForm.get('PolicyHolder.FirstName').value,this.BuyNowForm.get('PolicyHolder.LastName').value,this.BuyNowForm.get('PolicyHolder.MiddleName').value);
    return PANKYC
  }

  // health conditions for policy (first 5 questions in medical history must be false to proceed forward)
  private _healthConditions() {
    this.error = []
    this.member.forEach((ele, index) => {
      if (this.inf.controls[index].value.PreExistDisease == true) {

        this.error.push({
          Message: `Select 'No' for Question-1 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.inf.controls[index].value.Asthma == true) {
        this.error.push({
          Message: `Select 'No' for Question-2 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.SmokerTibco == true) {
        this.error.push({
          Message: `Select 'No' for Question-3 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.CholesterolDisorDr == true) {
        this.error.push({
          Message: `Select 'No' for Question-4 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.HeartDisease == true) {
        this.error.push({
          Message: `Select 'No' for Question-5 (${ele.title})`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
    })

  }

  //check WhiteSpace Validation
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  // set values from Health form
  private setValue() {
    if (this.HealthQuateForm) {
      this.ReqSumInsured = Number(this.HealthQuateForm.SumInsured);
    }
  }

  // details from health form
  /**
   * Data for policy holder details are fecthed from the health form (data that is availabe). 
   */
  private _membersDetails() {
    if (this.HealthQuateForm.SelfCoverRequired == true) {
      const names = this.HealthQuateForm.Name.trim().replace(/ +/g, ' ').split(' ');
      if (names.length > 0)
        this.BuyNowForm.get('PolicyHolder').patchValue({
          FirstName: names[0].trim(),
        });
      if (names.length > 1) {
        if (names.length > 2) {
          this.BuyNowForm.get('PolicyHolder').patchValue({
            MiddleName: names[1].trim(),
            LastName: names[2].trim(),
          });
        } else
          this.BuyNowForm.get('PolicyHolder').patchValue({
            LastName: names[1],
          });
      }

      this.BuyNowForm.get('PolicyHolder').patchValue({
        Gender: this.HealthQuateForm.SelfGender,
        DOB: this.HealthQuateForm.SelfDOB,

      });


    }

    this.BuyNowForm.get('PolicyHolder').patchValue({
      Mobile: this.HealthQuateForm.Mobile,
      TelephoneNo: this.HealthQuateForm.Mobile,
      Email: this.HealthQuateForm.EmailId,
      PinCode: this.HealthQuateForm.PinCode,
    })


    this._bindPin(this.HealthQuateForm.PinCode);
  }

  // full name for KYC
  private _fullName(FName:string,LName:string,MName?:string) {
    let Name : string
    if (MName){
      Name = FName.concat(' ' , MName , ' ' , LName)
    } else {
      Name = FName.concat(' ',LName)
    }
    return Name
  }

  // bind pincode , city & state
  private _bindPin(selectedPinCode: string) {
    this._MasterListService
      .getFilteredPincodeListWithDetails(selectedPinCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.BuyNowForm.get('PolicyHolder').patchValue({
              City: res.Data.Items[0].CityName,
              StateName: res.Data.Items[0].StateName,
              StateCode: res.Data.Items[0].StateCode,
              CountryCode: res.Data.Items[0].CountryCode,
            });
          }
        }
      });
  }

  // change in Pincode
  private _onFormChanges() {
    this.BuyNowForm.get('PolicyHolder.PinCode').valueChanges.subscribe(
      (val) => {
        this.pincodes$ = this._MasterListService
          .getFilteredPincodeList(val)
          .pipe(
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
      }
    );
  }

  // number of member from health form
  /**
   * Adding number of members and data from the health form.
   * number of members are determined by myMember array and so is the relation
   * while data like name , DOB etc are fetched from health form
   */
  private _addMemberDetails() {
    let title: string;
    var row: BajajPolicyMemberDetailsDto = new BajajPolicyMemberDetailsDto();
    for (let i = 0; i < this.member.length; i++) {
      if (this.member[i].title == 'Self') {
        title = 'Self';
      }
      switch (this.member[i].title) {
        case 'Self':
          title = 'Self';
          const Names = this.HealthQuateForm.Name.trim().replace(/ +/g, ' ').split(' ');
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
          this.BuyNow.PolicyMemberDetails.push(row);
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

  // member details form health form
  /**
   * data of all the members other than self are patched here.
   * data like relation , gender , first name etc are fetched from the health form
   * @param title : title of the member 
   * @param row : BajajPolicyMemberDetailsDto
   */
  private _SetPolicyMemberDetails(title, row: BajajPolicyMemberDetailsDto) {
    this.BuyNow = this.BuyNowForm.value;
    const names = this.HealthQuateForm[`${title}Name`].trim().replace(/ +/g, ' ').split(' ');
    if (names.length > 0) row.FirstName = names[0].trim();
    if (names.length > 1) {
      if (names.length > 2) {
        row.MiddleName = names[1].trim();
        row.LastName = names[2].trim();
      } else row.LastName = names[1].trim();
    }

    row.DOB = this.HealthQuateForm[`${title}DOB`];
    row.Gender = this.HealthQuateForm[`${title}Gender`];
    // gender check
    let SelectedGender = this.genders.GetGenderOfTitle(title);
    if(SelectedGender != '')
    {
      row.Gender = SelectedGender;
    }

    this.BuyNow.PolicyMemberDetails.push(row);
    this.inf.push(this._initPolicyMemberDetailsForm(row));
  }

  // doropdown lists
  private _fillMasterList() {
    this.GenderList = [];
    // fill gender list
    this._MasterListService.getCompanyWiseList('BajajAllianz', 'gender').subscribe((res) => {
      if (res.Success) {
        this.GenderList = res.Data.Items;
      }
      else{
        this._alertservice.raiseErrors(res.Alerts);
      }
    });

    this.RelationList = [];
    this._MasterListService.getCompanyWiseList('BajajAllianz', 'relation').subscribe((res) => {
      if (res.Success) {
        this.RelationList = res.Data.Items;
      }
      else{
        this._alertservice.raiseErrors(res.Alerts);
      }
    });
    this.NomineeRelationList = [];
    this._MasterListService.getCompanyWiseList('BajajAllianz', 'NomineeRelation').subscribe((res) => {
      if (res.Success) {
        this.NomineeRelationList = res.Data.Items;
      }
      else{
        this._alertservice.raiseErrors(res.Alerts);
      }
    });

    //Occupation
    this.OccupationList = [];
    this._MasterListService
      .getCompanyWiseList('BajajAllianz', 'bajajallianzoccupation')
      .subscribe((res) => {
        if (res.Success) {
          this.OccupationList = res.Data.Items;
        }
        else{
          this._alertservice.raiseErrors(res.Alerts);
        }
      });
  }

  // main from
  private _buildBuyNowForm(data: BajajBuyNowDto) {
    let Buyform = this.fb.group({
      TransactionNo: [''],
      PolicyDetail: this._buildPolicyDetailForm(data.PolicyDetail),
      PolicyMemberDetails: this._buildPolicyMemberDetailsForm(
        data.PolicyMemberDetails
      ),
      PolicyHolder: this._buildPolicyHolderForm(data.PolicyHolder),
    });
    if (data) {
      Buyform.patchValue(data);
    }
    return Buyform;
  }

  // policy details form
  private _buildPolicyDetailForm(data): FormGroup {
    this.policyDetailsForm = this.fb.group({
      Productcode: [''],
      ProductName: [''],
      SubProductName: [''],
      SubProductCode: [''],
      SumInsured: [0],
      PolicyStartDate: [''],
      PolicyPeriod: [''],
      PaymentMode: ['Online'],
      Polcov46: [''],
      Polcovvolntrycp: ['', [Validators.maxLength(3), Validators.min(0), Validators.max(100)]],
    });
    return this.policyDetailsForm;
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
      TelephoneNo: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(10),
        ],
      ],
      Email: ['', [Validators.email,Validators.maxLength(60)]],
      Gender: [0, [Validators.required]],
      DOB: ['', [Validators.required]],
      CountryCode: [0],
      StateCode: [1],
      StateName: [''],
      PinCode: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      Street: ['', [Validators.required]],
      City: ['', [Validators.required]],
      Address1: [''],
      PanNo: ['', [Validators.required, this.noWhitespaceValidator]],
      UID: ['', [Validators.required, this.noWhitespaceValidator]]
    });
    return policyHolderForm;
  }

  // member array
  private _buildPolicyMemberDetailsForm(
    items: BajajPolicyMemberDetailsDto[] = []
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

  // member details form
  private _initPolicyMemberDetailsForm(
    item: BajajPolicyMemberDetailsDto
  ): FormGroup {
    let pDF = this.fb.group({
      FirstName: ['', [Validators.required, this.noWhitespaceValidator,Validators.maxLength(60)]],
      MiddleName: [''],
      LastName: ['', [Validators.required, this.noWhitespaceValidator,Validators.maxLength(60)]],
      Relation: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      Gender: ['0', [Validators.required]],
      HeightCM: [0, [Validators.required, Validators.max(400)]],
      HeightInFeet: [],
      HeightInInch: [],
      WeightKG: [0, [Validators.required, Validators.max(300)]],
      Occupation: ['', [Validators.required]],
      GrossMonthlyIncome: [0, [Validators.required, Validators.max(10000000)]],
      NomineeFirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeMiddleName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeLastName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeRelation: ['0', [Validators.required]],
      NomineeAge: [0, [Validators.required]],
      AppointeeFirstName: ['',[Validators.required,this.noWhitespaceValidator]],
      AppointeeMiddleName: ['', [Validators.required, this.noWhitespaceValidator]],
      AppointeeLastName: ['', [Validators.required, this.noWhitespaceValidator]],
      AppointeeRelation: ['0'],
      PreExistDisease: [],
      PreExistDisease_Diabetes: [false],
      PreExistDisease_DiabetesDescription: [''],
      PreExistDisease_Hypertension: [false],
      PreExistDisease_HypertensionDescription: [''],
      PreExistDisease_CholesterolDisorder: [false],
      PreExistDisease_CholesterolDisorderDescription: [''],
      PreExistDisease_Obesity: [false],
      PreExistDisease_ObesityDescription: [''],
      PreExistDisease_CardiovascularDiseases: [false],
      PreExistDisease_CardiovascularDiseasesDescription: [''],
      PreExistDisease_Others: [false],
      PreExistDisease_OthersDescription: [''],
      Asthma: [],
      AsthmaDescription: [''],
      SmokerTibco: [],
      SmokerTibcoDescription: [''],
      CholesterolDisorDr: [],
      CholesterolDisorDrDescription: [''],
      HeartDisease: [],
      HeartDiseaseDescription: [''],
      Hypertension: [],
      HypertensionDescription: [''],
      Diabetes: [false],
      DiabetesDescription: [''],
      Obesity: [],
      ObesityDescription: [''],
      Addonnme: ['']
    });
    if (item != null) {
      if (!item) {
        item = new BajajPolicyMemberDetailsDto();
      }

      if (item) {
        pDF.patchValue(item);
      }
    }
    return pDF;
  }

  //#endregion Private methods
}
