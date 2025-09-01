import { Component } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormArray,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert } from '@models/common';
import { MasterListService } from '@lib/services/master-list.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ICityPincodeDto } from '@models/dtos/core/CityDto';
import { Observable } from 'rxjs/internal/Observable';
import { Subject, of, switchMap, takeUntil } from 'rxjs';
import { GodigitService } from './godigit.service';
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
import { IGoDigitQuestion } from '@models/dtos/config';
import { environment } from 'src/environments/environment';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';
import { ROUTING_PATH } from '@config/routingPath.config';
import { BuyGoDigitDto, GoDigitStatusDto, IBuyGoDigitDto, IGoDigitDomainDto, IGoDigitMedicalQuestion, IGoDigitStatusDto, MedicalQuestionsDto, PolicyMemberGoDigitDto, SubQuestionsDto } from '@models/dtos/config/GoDigit';
import { UnitConversion } from '@config/UnitConversion';
import { ValidationRegex } from '@config/validationRegex.config';

@Component({
  selector: 'gnx-go-digit',
  templateUrl: './go-digit.component.html',
  styleUrls: ['./go-digit.component.scss'],
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
export class GoDigitComponent {
  // #region public variables

  //String
  pagetitle: string = 'Go Digit Health Form';
  imgsrc = '/assets//images/avatars/upload.png';
  PolicyType: string;
  HealthQuateForm: any;
  logo: string;
  Insurer: string;
  maxBirthDate: Date;

  PANNum = /[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  AadharNum = /^([0-9]{4}[0-9]{4}[0-9]{4}$)|([0-9]{4}\s[0-9]{4}\s[0-9]{4}$)|([0-9]{4}-[0-9]{4}-[0-9]{4}$)/;

  //boolean
  IsKYC: boolean = false;

  //Number
  InsuredPeople: number;
  ReqSumInsured: number;
  SelectedMemberIndex: number;

  //Formgroup & DTO
  Policies: any;
  KYCStatus: IGoDigitStatusDto;
  BuyGoDigitForm: FormGroup;
  policyDetailsForm: FormGroup;
  BuyNow: IBuyGoDigitDto;
  memberDetailPinCodes$: Observable<ICityPincodeDto[]>;
  pinCodes$: Observable<ICityPincodeDto[]>
  MedicalQuestionsList: IGoDigitMedicalQuestion[];
  DomainList: IGoDigitDomainDto[];

  True: boolean;
  False: boolean;

  DropdownMaster: dropdown;
  cityAPI = API_ENDPOINTS.City.Base;

  //Array
  alerts: Alert[] = [];
  GenderList: any[];
  RelationList: any[];
  NomineeRelationList: any[];
  OccupationList: any[];
  MaritalList: any[];
  member: any[];
  subQuestionsDomain: any[];

  ID
  Conversion: UnitConversion;

  destroy$: Subject<any>;
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  phoneNum: RegExp = ValidationRegex.phoneNumReg;
  memberDetailsAsArray;



  //FormControl
  step1 = new FormControl();
  flag = 1 //check if data of buynow , member & health form is not empty
  insurerFlag = 1 //check if name of the insurer is godigit or not

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
    private _GodigitService: GodigitService,
    private _router: Router,
    public dialog: MatDialog,
    private _MasterListService: MasterListService // number of people insured
  ) {
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();
    this.maxBirthDate = new Date(Date.now());
    this.Conversion = new UnitConversion();
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);
    this.SelectedMemberIndex = 0;
    this.True = true;
    this.False = false;
    this.KYCStatus = new GoDigitStatusDto()

    // if any one of HealthQuateForm , buynow , member is not stored in localstorage than return back to Health form
    if (!localStorage.getItem('member') || !localStorage.getItem('buynow') || !localStorage.getItem('HealthQuateForm')) {
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.Health])
      // if(window.location.href.indexOf('mediclaim') != -1){
      //   this._router.navigate([ROUTING_PATH.QuoteMediclaim.List]);
      // }
      // else {
      //   this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.List]);
      // }
      this.flag = 0
      return;
    } else {
      // if name of the insurer in buynow is not godigit than return plan list to choose a plan
      let Insurer = JSON.parse(localStorage.getItem('buynow'))
      if (Insurer.Insurer.toLowerCase() != InsuranceCompanyName.GoDigit) {
        if (window.location.href.indexOf('mediclaim') != -1) {
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

      this.MedicalQuestionsList = this._GodigitService.getMedicalQuestion();
      this._GodigitService.Domain().subscribe((domain) => {
        if (domain) {
          this.DomainList = domain.Data;
          this.MedicalQuestionsList.forEach(que => {
            if (que.ChildQuestion) {
              que.ChildQuestion.forEach(childQ => {
                if (childQ && childQ.AnswerType == "DOMAIN") {
                  childQ.DomainList = this.DomainList.filter((q => q.Object == childQ.QuestionCode));
                }
              });
            }
          });
        }
      });
    }



  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this.BuyNow = new BuyGoDigitDto();
    this.BuyGoDigitForm = this._buildBuyGoDigitForm(this.BuyNow);
    this.BuyNow.PolicyMemberDetails = new Array<PolicyMemberGoDigitDto>();

    if (this.flag && this.insurerFlag) {

      this._fillMasterList();

      this.memberDetailsAsArray = this.BuyGoDigitForm.get(
        'PolicyMemberDetails'
      ) as FormArray;

      this.HealthQuateForm = JSON.parse(localStorage.getItem('HealthQuateForm'));
      this.setValue();
      this.onPolicy();
      this._addMemberDetails();
      this._membersDetails();
      this._bindData();
      this._onFormChanges();
      this._HolderonFormChanges();
      this._changeValue()
      this._AddOns()


      this.BuyGoDigitForm.get('KYC.DOB').patchValue(this.BuyGoDigitForm.get('PolicyHolder.DOB').value)
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
    return this.BuyGoDigitForm.controls;
  }
  get inf() {
    return this.BuyGoDigitForm.get('PolicyMemberDetails') as FormArray;
  }

  get f1() {
    return this.policyDetailsForm.controls;
  }

  //  Policy Details
  /**
   * patching values of Policy details from this.Policies
   */
  public onPolicy() {
    if (this.Policies != null) {
      this.BuyGoDigitForm.get('PolicyDetail').patchValue({
        SumInsured: this.Policies.SumInsured,
        Productcode: this.Policies.ProductCode,
        PolicyPeriod: this.Policies.PolicyPeriod,
        PolicyType: this.Policies.PolicyType,
        ProductName: this.Policies.ProductName,
        SubProductCode: this.Policies.SubProductCode,
        SubProductName: this.Policies.SubProductName,
      });
      this.BuyGoDigitForm.patchValue({ TransactionNo: this.Policies.QuoteNo });
      this.BuyGoDigitForm.get('KYC').patchValue({
        SuccessReturnURL: this.BuyGoDigitForm.get('KYC.SuccessReturnURL').value + this.BuyGoDigitForm.get('TransactionNo').value
      })
    }
  }

  // pop up for pincode
  public openDiologPincode(type: string, title: string, MemberIndex?: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '44vw';
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
          (
            this.BuyGoDigitForm.get('PolicyMemberDetails') as FormArray
          ).controls.forEach((element, index) => {
            if (index == this.SelectedMemberIndex) {
              element.patchValue({
                PinCode: result.PinCode,
                City: result.CityName,
                StateCode: result.StateCode,
                StateName: result.StateName,
                CountryCode: result.CountryCode,
                CountryName: result.CountryName,
              });
            }
          });
        }

        if (type == 'PIN') {

          this.BuyGoDigitForm.get('PolicyHolder').patchValue({
            PinCode: result.PinCode,
            City: result.CityName,
            StateCode: result.StateCode,
            StateName: result.StateName,

          });
        }
      }
    });
  }

  // pincode autocomplete for step one
  public HolderPinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.BuyGoDigitForm.get('PolicyHolder').patchValue({
      City: event.option.value.CityName,
      StateName: event.option.value.StateName,
      StateCode: event.option.value.StateCode,
      PinCode: event.option.value.PinCode,
    });
    this.BuyGoDigitForm.get('PolicyHolder.PinCode').patchValue(event.option.value.PinCode);
  }

  // pincode autocomplete for step two
  public PinCodeSelected(
    event: MatAutocompleteSelectedEvent,
    SelectedIndex: number
  ): void {
    (
      this.BuyGoDigitForm.get('PolicyMemberDetails') as FormArray
    ).controls.forEach((element, index) => {
      if (index == SelectedIndex) {
        element.patchValue({
          City: event.option.value.CityName,
          StateCode: event.option.value.StateCode,
          StateName: event.option.value.StateName,
          CountryCode: event.option.value.CountryCode,
          CountryName: event.option.value.CountryName,
          PinCode: event.option.value.PinCode,
        });
        element.patchValue(event.option.value.PinCode);
      }
    });
  }

  // clear sub answer when main answer is false 
  /**
   * when answer of main question is false than this function clears the data of the sub-Questions 
   * Answer of DetailAnswer formControl in main question is also patched here . If the IsApplicable is true than DetailAnswer will be 'TRUE'
   * and 'FALSE' if answer is false.
   */
  public clearSubAnswers() {
    this.memberDetailsAsArray.controls.forEach((element, index) => {
      (element.get('Medical.MedicalQuestions') as FormArray).controls.forEach((subelement, index1) => {
        let tempDetail: string = String(subelement.get('IsApplicable').value).toUpperCase()
        subelement.get('DetailAnswer').patchValue(tempDetail)

        if (subelement.get('IsApplicable').value == false) {
          (subelement.get('SubQuestions') as FormArray).controls.forEach((subQuestion, index2) => {
            subQuestion.get('IsApplicable').reset(false)
            subQuestion.get('DetailAnswer').reset('')
          })
        }
      })
    })
  }

  // back Button 
  public backClick() {
    if (window.location.href.indexOf('mediclaim') != -1) {
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.AddOns]);
    }
    else {
      this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.AddOns]);
    }
  }

  // clear city , state and country when pincode is removed
  public clear(name: string): void {
    this.BuyGoDigitForm.get(name).setValue("")
    if (name == 'PolicyHolder.PinCode') {
      this.BuyGoDigitForm.get('PolicyHolder.City').setValue("");
      this.BuyGoDigitForm.get('PolicyHolder.StateName').setValue("")
      this.BuyGoDigitForm.get('PolicyHolder.StateCode').setValue("")
    }
  }

  // submit button
  public ProceedToPay() {

    this.stepTwoValidate();
    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
      return;
    }
    // fill false
    this.memberDetailsAsArray.controls.forEach((element, index) => {

      (element.get('Medical.MedicalQuestions') as FormArray).controls.forEach((subelement, index1) => {

        if (subelement.get('IsApplicable').value == true) {
          (subelement.get('SubQuestions') as FormArray).controls.forEach((subQuestion, index2) => {
            if (subQuestion.get('AnswerType').value == "BOOLEAN") {
              if ((subQuestion.get('IsApplicable').value == true || subQuestion.get('IsApplicable').value == false) && !subQuestion.get('DetailAnswer').value) {
                subQuestion.get('DetailAnswer').patchValue(String(subQuestion.get('IsApplicable').value).toUpperCase())
              }
            }

          })
        }
      })
    })


    this._GodigitService
      .CreateProposal(this.BuyGoDigitForm.value)
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.PaymentURL != "" && res.Data.PaymentURL != null) {
            this._alertservice.raiseSuccessAlert(res.Message);
            window.open(res.Data.PaymentURL, '_self');
          }
        }
        else {
          if (res.Alerts && res.Alerts.length > 0) {
            this._alertservice.raiseErrors(res.Alerts);
          }
          else {
            this._alertservice.raiseErrorAlert(res.Message);
          }
        }
      });
  }

  // check step one
  public StepOneSubmit(stepper): any {
    this.alerts = [];

    // First Name
    if (
      this.BuyGoDigitForm.get('PolicyHolder.FirstName').invalid) {
      this.alerts.push({
        Message: 'Enter Your First Name.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // LastName
    if (
      this.BuyGoDigitForm.get('PolicyHolder.LastName').invalid) {
      this.alerts.push({
        Message: 'Enter Your Last Name.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // gender
    if (
      this.BuyGoDigitForm.get('PolicyHolder.Gender').value == '0'
    ) {
      this.alerts.push({
        Message: 'Enter Your Gender.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Marital
    if (
      this.BuyGoDigitForm.get('PolicyHolder.Marital').value == '0' ||
      this.BuyGoDigitForm.get('PolicyHolder.Marital').value == ''
    ) {
      this.alerts.push({
        Message: 'Enter Your Marital status',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // DOB
    if (
      this.BuyGoDigitForm.get('PolicyHolder.DOB').value == '' ||
      this.BuyGoDigitForm.get('PolicyHolder.DOB').value == null
    ) {
      this.alerts.push({
        Message: 'Enter Your Date Of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.BuyGoDigitForm.get('PolicyHolder.DOB').value != '' ||
      this.BuyGoDigitForm.get('PolicyHolder.DOB').value != null
    ) {
      if (this.BuyGoDigitForm.get('PolicyHolder.DOB').value > this.maxBirthDate) {
        this.alerts.push({
          Message: 'Enter Valid Date Of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // Address
    if (
      this.BuyGoDigitForm.get('PolicyHolder.Address').invalid) {
      this.alerts.push({
        Message: 'Enter Your Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // PinCode
    if (
      this.BuyGoDigitForm.get('PolicyHolder.PinCode').value == ''
    ) {
      this.alerts.push({
        Message: 'Enter Your Pin Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // City
    if (
      this.BuyGoDigitForm.get('PolicyHolder.City').value == ''
    ) {
      this.alerts.push({
        Message: 'Enter City Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // State Name
    if (
      this.BuyGoDigitForm.get('PolicyHolder.StateName').value == ''
    ) {
      this.alerts.push({
        Message: 'Enter State Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Mobile No. validations
    if (
      this.BuyGoDigitForm.get('PolicyHolder.Mobile').value == '' ||
      this.BuyGoDigitForm.get('PolicyHolder.Mobile').value == null
    ) {
      this.alerts.push({
        Message: 'Enter Your Mobile Number',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.BuyGoDigitForm.get('PolicyHolder.Mobile').value != '' &&
      this.BuyGoDigitForm.get('PolicyHolder.Mobile').value != null
    ) {
      if (
        !this.phoneNum.test(
          this.BuyGoDigitForm.get('PolicyHolder.Mobile').value
        )
      ) {
        this.alerts.push({
          Message: 'Mobile Number must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.BuyGoDigitForm.get('PolicyHolder.Email').value == '') {
      this.alerts.push({
        Message: 'Enter Your Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyGoDigitForm.get('PolicyHolder.Email').value != '') {
      if (
        !this.emailValidationReg.test(
          this.BuyGoDigitForm.get('PolicyHolder.Email').value
        )
      ) {
        this.alerts.push({
          Message: 'Enter Valid Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.BuyGoDigitForm.get('PolicyHolder.PanNo').invalid && this.BuyGoDigitForm.get('PolicyHolder.UID').invalid) {
      this.alerts.push({
        Message: 'Enter either PAN or Aadhar',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyGoDigitForm.get('PolicyHolder.PanNo').value != '') {
      if (!this.PANNum.test(this.BuyGoDigitForm.get('PolicyHolder.PanNo').value)) {
        this.alerts.push({
          Message: 'Enter Valid PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.BuyGoDigitForm.get('PolicyHolder.UID').value != '') {
      if (!this.AadharNum.test(this.BuyGoDigitForm.get('PolicyHolder.UID').value)) {
        this.alerts.push({
          Message: 'Enter Valid Aadhar',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }


    if (this.alerts.length > 0) {
      this.step1.setErrors({ required: true });
      return this.step1;
    } else {
      this.step1.reset();
      return this.step1;
    }
  }

  // check step two
  public stepTwoValidate() {
    this.alerts = [];

    this.member.forEach((ele, index) => {
      if (this.inf.controls[index].get('FirstName').invalid) {
        this.alerts.push({
          Message: `Enter ${ele.title} First Name`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].get('LastName').invalid) {
        this.alerts.push({
          Message: `Enter ${ele.title} Last Name`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.DOB == '' || this.inf.controls[index].value.DOB == null) {
        this.alerts.push({
          Message: `Enter ${ele.title} DOB`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.DOB != '') {
        if (this.inf.controls[index].value.DOB > this.maxBirthDate) {
          this.alerts.push({
            Message: `Enter valid ${ele.title} DOB`,
            CanDismiss: false,
            AutoClose: false,
          });
        }

      }


      if (this.inf.controls[index].value.Gender == '0') {
        this.alerts.push({
          Message: `Enter ${ele.title} Gender`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.Marital == '') {
        this.alerts.push({
          Message: `Enter ${ele.title} Marital`,
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
      if (this.inf.controls[index].value.HeightInInch < 0 || this.inf.controls[index].value.HeightInInch == '' || this.inf.controls[index].value.HeightInInch == null) {
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
      if (this.inf.controls[index].value.Street == '') {
        this.alerts.push({
          Message: `Enter ${ele.title} Street`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.City == '') {
        this.alerts.push({
          Message: `Enter ${ele.title} City`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.CountryCode == '') {
        this.alerts.push({
          Message: `Enter ${ele.title} Country `,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.StateCode == '') {
        this.alerts.push({
          Message: `Enter ${ele.title} State`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.PinCode == '') {
        this.alerts.push({
          Message: `Enter ${ele.title} PIN Code`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].get('NomineeFirstName').invalid) {
        this.alerts.push({
          Message: `Enter ${ele.title} Nominee First Name`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].get('NomineeLastName').invalid) {
        this.alerts.push({
          Message: `Enter ${ele.title} Nominee Last Name`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.NomineeDOB == '' || this.inf.controls[index].value.NomineeDOB == null) {
        this.alerts.push({
          Message: `Enter ${ele.title} Nominee DOB`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.NomineeDOB != '') {
        if (this.inf.controls[index].value.NomineeDOB > this.maxBirthDate) {
          this.alerts.push({
            Message: `Enter valid ${ele.title} Nominee DOB`,
            CanDismiss: false,
            AutoClose: false,
          });
        }

      }

      if (this.inf.controls[index].value.NomineeGender == '') {
        this.alerts.push({
          Message: `Enter ${ele.title} Nominee Gender`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.NomineeRelation == '0') {
        this.alerts.push({
          Message: `Enter ${ele.title} Nominee Relation`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      ((this.inf.controls[index].get('Medical.MedicalQuestions')) as FormArray).controls.forEach((element, ind) => {
        if (element.get('IsApplicable').value == null) {
          this.alerts.push({
            Message: `${ele.title} - Enter  Question ${ind + 1}`,
            CanDismiss: false,
            AutoClose: false,
          });
        }
        if (element.get('IsApplicable').value == true) {
          (element.get('SubQuestions') as FormArray).controls.forEach((subQuestion, index2) => {
            if (subQuestion.get('AnswerType').value == 'BOOLEAN' && subQuestion.get('IsApplicable').value == null) {
              this.alerts.push({
                Message: `${ele.title} - Enter  Question ${ind + 1} (SubQuestion ${index2 + 1})`,
                CanDismiss: false,
                AutoClose: false,
              });
            }
            if (subQuestion.get('AnswerType').value == 'DATE' || subQuestion.get('AnswerType').value == 'TEXT_DESCRIPTION' || subQuestion.get('AnswerType').value == 'DOMAIN') {
              if (subQuestion.get('DetailAnswer').value == null || subQuestion.get('DetailAnswer').value == '') {
                this.alerts.push({
                  Message: `${ele.title} - Enter  Question ${ind + 1} (SubQuestion ${index2 + 1})`,
                  CanDismiss: false,
                  AutoClose: false,
                });
              }
            }


          })
        }
      })


    });
  }

  // alert message for step one 
  public StepThreeError() {
    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
    }
    this._KYCData()

  }

  // radio button
  /**
   * since we have used span tag instead of label tag , 'for' attribute cannot be used.
   * so in order to change the value of formcontrol in input type radio by clicking on label , this function is used.
   * @param index : to identify the member in member array
   * @param Q : to identify the question in main question array
   * @param value : answer of the main question.(Is it true or false?)
   */
  public radioLabel(index: number, Q: number, value: boolean) {

    this.memberDetailsAsArray.controls[index].get('Medical.MedicalQuestions').controls[Q].patchValue({
      IsApplicable: value
    })
    this.clearSubAnswers()
  }

  // radio button for Sub-Questions
  /**
   * since we have used span tag instead of label tag , 'for' attribute cannot be used.
   * so in order to change the value of formcontrol in input type radio , this function is used.
   * @param index : to identify the member in member array
   * @param Q : to identify the question in main question array
   * @param SQ : to identify the sub question in sub question array of corresponding main question
   * @param value : answer of the sub question with answer type boolean.(Is it true or false?)
   */
  public radioLabelSub(index: number, Q: number, SQ: number, value: boolean) {

    this.memberDetailsAsArray.controls[index].get('Medical.MedicalQuestions').controls[Q].get('SubQuestions').controls[SQ].patchValue({
      IsApplicable: value
    })

  }

  // to convert height from feet & inches into cm
  public SetCM(index: number) {
    this.inf.controls[index].patchValue({
      HeightCM: this.Conversion.GetCentimeters(this.inf.controls[index].value.HeightInFeet, this.inf.controls[index].value.HeightInInch)
    });
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
  private _AddOns() {
    let addOn
    if (localStorage.getItem('AddOns')) {
      addOn = JSON.parse(localStorage.getItem('AddOns'))
    }

    this.memberDetailsAsArray.controls.forEach((data, index) => {
      data.patchValue({
        RHPNE: addOn.RHPNE,
        RHPDW: addOn.RHPDW,
        RHPDWValue: addOn.RHPDW ? addOn.RHPDWValue : 2,
        RHNHC: addOn.RHNHC,
        RHIWP: addOn.RHIWP,
        RHIWPValue: addOn.RHIWP ? addOn.RHIWPValue : 0,
      })
    })

  }

  // KYC data
  /**
   * For KYC , either PanNo. or UID (Aadhar card number) is required .
   * if PanNo. is given than details of PAN Crad will be forwarded and if UID is provided than it will be forwarded.
   * In case both are given than PanNo. will be prioritize and its data will be carry forward for KYC .
   */
  private _KYCData() {
    if (this.BuyGoDigitForm.get('PolicyHolder.PanNo').valid) {
      this.BuyGoDigitForm.get('KYC').patchValue({
        DocTypeCode: 'PAN',
        DocNumber: this.BuyGoDigitForm.get('PolicyHolder.PanNo').value
      })
    }
    else if (this.BuyGoDigitForm.get('PolicyHolder.UID').valid) {
      this.BuyGoDigitForm.get('KYC').patchValue({
        DocTypeCode: 'UID',
        DocNumber: this.BuyGoDigitForm.get('PolicyHolder.UID').value
      })
    }
  }

  // change in holder details
  /**
   * to detect change in value of policy holder DOB , Marital and address , so the corresponding update can be made in the value that depends on it
   */
  private _changeValue() {
    this.BuyGoDigitForm.get('PolicyHolder.DOB').valueChanges.subscribe((res) => {
      this.BuyGoDigitForm.get('KYC.DOB').patchValue(res)
    })
    this.BuyGoDigitForm.get('PolicyHolder.Marital').valueChanges.subscribe(() => {
      this._changeInMaritalAndAddress()
    })
    this.BuyGoDigitForm.get('PolicyHolder.Address').valueChanges.subscribe(() => {
      this._changeInMaritalAndAddress()
    })

  }

  // change in marital and address
  /**
   * when Marital & address is changed in PolicyHolder details (stepper 1)
   * value of Marital & adress is also updated in self & spouse details (stepper 2)
   */
  private _changeInMaritalAndAddress() {
    this.member.forEach((ele, index) => {
      if (ele.title == 'Self') {
        let i = index
        this.inf.controls[i].patchValue({
          Marital: this.BuyGoDigitForm.get('PolicyHolder.Marital').value,
          Street: this.BuyGoDigitForm.get('PolicyHolder.Address').value
        })
      }

      if (ele.title == 'Spouse') {
        let i = index
        this.inf.controls[i].patchValue({
          Marital: this.BuyGoDigitForm.get('PolicyHolder.Marital').value,
          Street: this.BuyGoDigitForm.get('PolicyHolder.Address').value
        })
      }

    })
  }

  // set values
  private setValue() {
    if (this.HealthQuateForm) {
      this.ReqSumInsured = Number(this.HealthQuateForm.SumInsured);
    }
  }

  // change in pincode in step one
  private _HolderonFormChanges() {
    this.BuyGoDigitForm
      .get('PolicyHolder.PinCode')
      .valueChanges.subscribe((val) => {
        this.pinCodes$ = this._MasterListService
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
      });
  }

  // bind data of city , country & state based on the value pincode that is obtained from the health form
  private _bindPin(selectedPinCode: string) {

    this._MasterListService
      .getFilteredPincodeListWithDetails(selectedPinCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.BuyGoDigitForm.get("PolicyHolder").patchValue(
              {
                City: res.Data.Items[0].CityName,
                StateName: res.Data.Items[0].StateName,
                StateCode: res.Data.Items[0].StateCode,
              }
            )
          }
        }
      });
  }

  // change in pincode in step two
  private _onFormChanges() {
    (
      this.BuyGoDigitForm.get('PolicyMemberDetails') as FormArray
    ).controls.forEach((element, index) => {
      element.get('PinCode').valueChanges.subscribe((val) => {
        this.memberDetailPinCodes$ = this._MasterListService
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
      });
    });
  }

  // bind data of city , state & country based on pincode
  private _bindData() {
    // bind data base on pincode
    let selectedPinCode: string = this.HealthQuateForm.PinCode;

    (this.BuyGoDigitForm.get('PolicyMemberDetails') as FormArray).controls.forEach((element, index) => {
      this._MasterListService
        .getFilteredPincodeListWithDetails(selectedPinCode)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              element.patchValue({
                PinCode: res.Data.Items[0].PinCode,
                City: res.Data.Items[0].CityName,
                StateName: res.Data.Items[0].StateName,
                StateCode: res.Data.Items[0].StateCode,
                CountryCode: res.Data.Items[0].CountryCode,
                CountryName: res.Data.Items[0].CountryName,
              });
            }
          }
        });
    });
  }

  // PoilcyHolder details from health form
  /**
   * details like name , dob , gender etc is fetched from health form and are auto filled in policy Holder details.
   */
  private _membersDetails() {
    if (this.HealthQuateForm.SelfCoverRequired == true) {
      const names = this.HealthQuateForm.Name.trim().replace(/ +/g, ' ').split(' ');
      if (names.length > 0)
        this.BuyGoDigitForm.get('PolicyHolder').patchValue({
          FirstName: names[0].trim(),
        });
      if (names.length > 1) {
        if (names.length > 2) {
          this.BuyGoDigitForm.get('PolicyHolder').patchValue({
            MiddleName: names[1].trim(),
            LastName: names[2].trim(),
          });
        } else
          this.BuyGoDigitForm.get('PolicyHolder').patchValue({
            LastName: names[1],
          });
      }

      this.BuyGoDigitForm.get('PolicyHolder').patchValue({
        Gender: this.HealthQuateForm.SelfGender,
        DOB: this.HealthQuateForm.SelfDOB,

      });
    }

    this.BuyGoDigitForm.get('PolicyHolder').patchValue({
      Mobile: this.HealthQuateForm.Mobile,
      Email: this.HealthQuateForm.EmailId,
      PinCode: this.HealthQuateForm.PinCode,
    })

    this._bindPin(this.HealthQuateForm.PinCode)
  }

  // start region to Auto Fill member details from Health form
  /**
   * Adding number of members and data from the health form.
   * number of members are determined by myMember array and so is the relation
   * while data like name , DOB etc are fetched from health form
   */
  private _addMemberDetails() {
    let title: string;
    for (let i = 0; i < this.member.length; i++) {
      var row: PolicyMemberGoDigitDto = new PolicyMemberGoDigitDto();
      if (this.member[i].title == 'Self') {
        title = 'Self';
      }
      switch (this.member[i].title) {
        case 'Self':
          title = 'Self';
          const Names = this.HealthQuateForm.Name.trim().replace(/ + /g, ' ').split(' ');
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
          row.PinCode = this.HealthQuateForm[`PinCode`];
          this.BuyNow.PolicyMemberDetails.push(row);
          this.inf.push(this._initPolicyMemberDetailsForm(row));
          break;
        case 'Spouse':
          title = 'Spouse';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Daughter':
          title = 'Child1';
          this._SetPolicyMemberDetails(title, row);
          break;

        case 'Daughter1':
          title = 'Child1';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Daughter2':
          title = 'Child2';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Daughter3':
          title = 'Child3';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Son':
          title = 'Child4';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Son1':
          title = 'Child4';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Son2':
          title = 'Child5';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Son3':
          title = 'Child6';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Mother':
          title = 'Mother';
          this._SetPolicyMemberDetails(title, row);
          break;
        case 'Father':
          title = 'Father';
          this._SetPolicyMemberDetails(title, row);
          break;

        default:
          break;
      }
    }
  }

  // member details from health form 
  /**
   * data of all the members other than self are patched here.
   * data like relation , gender , first name etc are fetched from the health form
   * @param title : title of the member
   * @param row : PolicyMemberGoDigitDto
   */
  private _SetPolicyMemberDetails(title, row: PolicyMemberGoDigitDto) {
    this.BuyNow = this.BuyGoDigitForm.value;
    const names = this.HealthQuateForm[`${title}Name`].trim().replace(/ + /g, ' ').split(' ');
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
      case 'Spouse':
        row.Relation = 'Spouse';
        break;
      case 'Child1':
        row.Gender = 'Female';
        row.Relation = 'Daughter';
        break;
      case title == 'Child2':
        row.Gender = 'Female';
        row.Relation = 'Daughter';
        break;
      case title == 'Child3':
        row.Gender = 'Female';
        row.Relation = 'Daughter';
        break;
      case 'Child4':
        row.Gender = 'Male';
        row.Relation = 'Son';
        break;
      case title == 'Child5':
        row.Gender = 'Male';
        row.Relation = 'Son';
        break;
      case 'Child6':
        row.Gender = 'Male';
        row.Relation = 'Son';
        break;
      case 'Father':
        row.Gender = 'Male';
        row.Relation = 'Father';
        break;
      case 'Mother':
        row.Gender = 'Female';
        row.Relation = 'Mother';
        break;
    }

    this.BuyNow.PolicyMemberDetails.push(row);
    this.inf.push(this._initPolicyMemberDetailsForm(row));
  }

  // dropdown list
  private _fillMasterList() {
    this.GenderList = [];
    // fill gender list
    this._MasterListService.getCompanyWiseList('GoDigit', 'gender').subscribe((res) => {
      if (res.Success) {
        this.GenderList = res.Data.Items;
      }
      else {
        this._alertservice.raiseErrors(res.Alerts);
      }
    });
    // RelationList
    this.RelationList = [];
    this._MasterListService.getCompanyWiseList('GoDigit', 'relation').subscribe((res) => {
      if (res.Success) {
        this.RelationList = res.Data.Items;
      }
      else {
        this._alertservice.raiseErrors(res.Alerts);
      }
    });
    // NomineeRelationList
    this.NomineeRelationList = [];
    this._MasterListService.getCompanyWiseList('GoDigit', 'NomineeRelation').subscribe((res) => {
      if (res.Success) {
        this.NomineeRelationList = res.Data.Items;
      }
      else {
        this._alertservice.raiseErrors(res.Alerts);
      }
    });
    this.MaritalList = [];
    this._MasterListService.getCompanyWiseList('GoDigit', 'marital').subscribe((res) => {
      if (res.Success) {
        this.MaritalList = res.Data.Items;
      }
      else {
        this._alertservice.raiseErrors(res.Alerts);
      }
    });
    //Occupation
    this.OccupationList = [];
    this._MasterListService
      .getCompanyWiseList('GoDigit', 'bajajallianzoccupation')
      .subscribe((res) => {
        if (res.Success) {
          this.OccupationList = res.Data.Items;
        }
        else {
          this._alertservice.raiseErrors(res.Alerts);
        }
      });

  }

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  // main form
  private _buildBuyGoDigitForm(data: BuyGoDigitDto) {
    let Buyform = this.fb.group({
      TransactionNo: [''],
      PolicyDetail: this._buildPolicyDetailForm(data.PolicyDetail),
      PolicyMemberDetails: this._buildPolicyMemberDetailsForm(
        data.PolicyMemberDetails
      ),
      PolicyHolder: this._buildPolicyHolderForm(data.PolicyHolder),
      KYC: this._buildKYCForm(data.KYC),
    });
    if (data) {
      Buyform.patchValue(data);
    }
    return Buyform;
  }

  // startRegion Policy Details Form
  private _buildPolicyDetailForm(data): FormGroup {
    this.policyDetailsForm = this.fb.group({
      Productcode: [''],
      SumInsured: [0],
      PolicyStartDate: [''],
      PolicyPeriod: [''],
      PolicyType: [],
      PaymentMode: ['Online'],
      PaymentDate: [''],
      ProductName: [''],
      SubProductCode: [''],
      SubProductName: [''],
    });
    return this.policyDetailsForm;
  }

  // startRegion KYC Form
  private _buildKYCForm(data): FormGroup {
    let KYCForm = this.fb.group({
      IsKYCDone: [true],
      DocTypeCode: ['', [Validators.required]],
      DocNumber: ['', [Validators.required, this.noWhitespaceValidator]],
      DOB: ['', [Validators.required]],
      Photo: [''],
      SuccessReturnURL: [environment.webURL + '/app/health/policy/?TRN='],
      FailureReturnURL: [environment.webURL + '/app/health/policy'],
    });
    if (data) {
      KYCForm.patchValue(data);
    }
    return KYCForm;
  }

  // policy Holder details form
  private _buildPolicyHolderForm(data): FormGroup {
    let policyHolderForm = this.fb.group({
      Mobile: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      Email: ['', [Validators.email, Validators.maxLength(60)]],
      DOB: ['', [Validators.required]],
      FirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      MiddleName: [''],
      LastName: ['', [Validators.required, this.noWhitespaceValidator]],
      Address: ['', [Validators.required, this.noWhitespaceValidator]],
      City: ['', [Validators.required]],
      StateCode: ['', [Validators.required]],
      PinCode: ['', [Validators.required]],
      Marital: ['', [Validators.required]],
      Gender: ['', [Validators.required]],
      StateName: [''],
      PanNo: ['', [Validators.required]],
      UID: ['', [Validators.required]]
    });
    return policyHolderForm;
  }

  // member array
  private _buildPolicyMemberDetailsForm(
    items: PolicyMemberGoDigitDto[] = []
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
    item: PolicyMemberGoDigitDto
  ): FormGroup {
    let pDF = this.fb.group({
      FirstName: ['', [Validators.required, this.noWhitespaceValidator, Validators.maxLength(60)]],
      MiddleName: [''],
      LastName: ['', [Validators.required, this.noWhitespaceValidator, Validators.maxLength(60)]],
      Relation: ['0'],
      DOB: ['', [Validators.required]],
      Gender: ['0', [Validators.required]],
      HeightCM: [0, [Validators.required, Validators.max(400)]],
      HeightInFeet: [],
      HeightInInch: [],
      WeightKG: [0, [Validators.required, Validators.max(300)]],
      Marital: ['', [Validators.required]],
      Street: ['', [Validators.required]],
      City: ['', [Validators.required]],
      CountryCode: ['', [Validators.required]],
      StateCode: ['', [Validators.required]],
      PinCode: ['', [Validators.required]],
      NomineeFirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeMiddleName: [''],
      NomineeLastName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeDOB: ['', [Validators.required]],
      NomineeGender: ['', [Validators.required]],
      NomineeRelation: ['0', [Validators.required]],
      Medical: this._buildMedical(item.Medical),
      RHPNE: [false],
      RHPDW: [false],
      RHPDWValue: [0],
      RHNHC: [false],
      RHIWP: [false],
      RHIWPValue: [0],
      StateName: [''],
      CountryName: [''],
    });
    if (item != null) {
      if (!item) {
        item = new PolicyMemberGoDigitDto();
      }

      if (item) {
        pDF.patchValue(item);
      }
    }
    return pDF;
  }

  // mediacl question form
  private _buildMedical(data): FormGroup {
    let medicalForm = this.fb.group({
      MedicalQuestions: this._buildMedicalQuestionsFormArray(),
    });

    if (data) {
      medicalForm.patchValue(data);
    }
    return medicalForm;
  }

  // medical detail array
  private _buildMedicalQuestionsFormArray(): FormArray {
    let formArray: FormArray = new FormArray([]);
    this.MedicalQuestionsList.forEach((Q) => {
      let item: MedicalQuestionsDto = new MedicalQuestionsDto();
      item.QuestionCode = Q.Questions.QuestionCode;
      item.AnswerType = Q.Questions.AnswerType;
      item.SubQuestions = Q.ChildQuestion;
      formArray.push(this._initMedicalForm(item));
    });
    return formArray;
  }

  // mediacl detail form
  private _initMedicalForm(item: MedicalQuestionsDto): FormGroup {
    let fg = this.fb.group({
      QuestionCode: [item.QuestionCode],
      AnswerType: [item.AnswerType],
      IsApplicable: [],
      DetailAnswer: [''],
      SubQuestions: this._buildMedicalSubQuestionsFormArray(item.SubQuestions),
    });
    return fg;
  }

  // sub Questions array
  private _buildMedicalSubQuestionsFormArray(SubQuestions: IGoDigitQuestion[]): FormArray {
    let formArray: FormArray = new FormArray([]);
    SubQuestions.forEach((Q) => {
      let item: SubQuestionsDto = new SubQuestionsDto();
      item.QuestionCode = Q.QuestionCode;
      item.AnswerType = Q.AnswerType;
      formArray.push(this._initSubQuetionForm(item));
    });

    return formArray;
  }

  // sub Question Form
  private _initSubQuetionForm(item: SubQuestionsDto): FormGroup {
    let sQ = this.fb.group({
      QuestionCode: [item.QuestionCode],
      AnswerType: [item.AnswerType],
      IsApplicable: [false],
      DetailAnswer: [''],
    });
    return sQ;
  }
  //#endregion Private methods
}
