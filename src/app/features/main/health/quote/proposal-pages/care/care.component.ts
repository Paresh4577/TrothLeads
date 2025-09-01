import { Component, Directive } from '@angular/core';
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
import {
  BuyCareDto,
  IBuyCareDto,
} from '@models/dtos/config/Care/BuyCareDto';
import { CareService } from './care.service';
import { CareKYCDto, ICareKYCDto } from '@models/dtos/config/Kyc/Care/care-dto';
import { ICareHeathQuestionDto } from '@models/dtos/config/Care/CareHealthInsurance';
import { MatStepper } from '@angular/material/stepper';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { environment } from 'src/environments/environment';
import { QuoteService } from '../../quote.service';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';
import { ROUTING_PATH } from '@config/routingPath.config';
import { MemberPEDListDto, PolicyMemberCareDto } from '@models/dtos/config/Care';
import { UnitConversion } from '@config/UnitConversion';
import { ValidationRegex } from '@config/validationRegex.config';
import { PlanNameEnum } from 'src/app/shared/enums/PlanNames.enum';

export const DATE_FORMAT_1 = {
  parse: {
    dateInput: 'MM-YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Directive({
  selector: '[dateFormat1]',
  providers: [{ provide: DATE_FORMAT_1, useValue: DATE_FORMAT_1 }],
})
export class CustomDateFormat1 { }

@Component({
  selector: 'gnx-care',
  templateUrl: './care.component.html',
  styleUrls: ['./care.component.scss'],
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
export class CareComponent {
  // #region public variables

  //String
  pagetitle: string = 'Care Health Form'; // Page Main Header Title
  PolicyType: string; // to store Policy Type
  HealthQuateForm: any; // To store Health Quate Data from get local storage
  logo: string; // to store Policy Icon pathe
  Insurer : string;
  maxBirthDate: Date; // To validate policy person birthdate
  KYC: CareKYCDto; // KYC Dto
  //boolean
  IsKYC: boolean = false; // use a flag for Proposal KYC

  //Number
  InsuredPeople: number;  //count of Insured People
  ReqSumInsured: number; // to store policy sum insured

  //Formgroup & DTO
  Policies: any; // Store Selected Policy From local storage
  ProductName: string; // To store Policy plan name
  BuyCareForm: FormGroup; // FormGroup for Care Policy
  policyDetailsForm: FormGroup; // FormGroup for care Policy  Details
  BuyNow: IBuyCareDto; // To store CARE form Value
  pincodes$: Observable<ICityPincodeDto[]>; // observable pincode list

  ExistingSinceDate = new FormControl(moment());
  maxDate = new Date();

  DropdownMaster: dropdown; // To get data for dropdown
  Conversion: UnitConversion; // to store Height convert in CM

  //Array
  alerts: Alert[] = []; // Display alert message
  GenderList: any[]; // to store Gender Dropdown list
  RelationList: any[]; // to store Relation dropdownlist
  NomineeRelationList: any[]; // to store nominee Relation dropdownlist
  OccupationList: any[]; // to store Occupation dropdownlist
  member: any[]; // To store policy person list like as icon,title
  QuestionList: ICareHeathQuestionDto[]; // to store Illnesslist from Service File (Static)

  destroy$: Subject<any>;
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;//Email Field Validate value by MAthing this pattern
  phoneNum: RegExp = ValidationRegex.phoneNumReg;//Phone no Field Validate value by MAthing this pattern
  PANNum: RegExp = ValidationRegex.PANNumValidationReg;//PAN number Field Validate value by MAthing this pattern
  AadharNum: RegExp = ValidationRegex.UIDNumValidationReg//Aadhar/UID Field Validate value by MAthing this pattern
  AddressReg: RegExp = ValidationRegex.CareAddress //Address validation
  memberDetailsAsArray;

  //FormControl
  step1 = new FormControl(); // Step Control For if any field invalid in this step not open other stepper
  flag = 1 //check if data of buynow , member & health form is not empty
  insurerFlag = 1 //check if name of the insurer is Aditya Birla or not


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
    private _CareService: CareService,
    private _quoteService: QuoteService,
    public dialog: MatDialog,
    private _datePipe: DatePipe,
    private _router: Router,
    private _MasterListService: MasterListService // number of people insured
  ) {
    this.destroy$ = new Subject();

    this.DropdownMaster = new dropdown();
    this.Conversion = new UnitConversion();
    this.maxBirthDate = new Date(Date.now());
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);

    // if any one of HealthQuateForm , buynow , member is not stored in localstorage than return back to Health form
    if(!localStorage.getItem('member') || !localStorage.getItem('buynow') || !localStorage.getItem('HealthQuateForm')){

      if(window.location.href.indexOf('mediclaim') != -1){
        this._router.navigate([ROUTING_PATH.QuoteMediclaim.Health]);
      }
      else {
        this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.TopUp])
      }
  
      this.flag = 0
      return ;
    } else {
      // if name of the insurer in buynow is not Care than return plan list to choose a plan
      let Insurer = JSON.parse(localStorage.getItem('buynow'))
      if (Insurer.Insurer.toLowerCase() != InsuranceCompanyName.Care) {
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

      this.QuestionList = this._CareService.getQuestions(this.ProductName);
    }

  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this.BuyNow = new BuyCareDto();

    this.BuyCareForm = this._buildBuyCareForm(this.BuyNow);
    this.BuyNow.PolicyMemberDetails = new Array<PolicyMemberCareDto>();

    if (this.flag && this.insurerFlag) {

      this._fillMasterList();
      this.memberDetailsAsArray = this.BuyCareForm.get(
        'PolicyMemberDetails'
      ) as FormArray;

      this.HealthQuateForm = JSON.parse(localStorage.getItem('HealthQuateForm'));
      this.setValue();  // Set Health quate Sum insurred
      this.onPolicy();  // Set Selecte Policy Data bind In AdityaBrila Form
      this._addMemberDetails();  // insurred Person data bind  in Aditya birla form
      this._membersDetails();  // if self is in insurred Person then bind their data in policy holder
      this._AddOns ()

      this._onFormChanges();

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
    return this.BuyCareForm.controls;
  }
  get inf() {
    return this.BuyCareForm.get('PolicyMemberDetails') as FormArray;
  }
  get f1() {
    return this.policyDetailsForm.controls;
  }

  // KYC
  public CheckKYC(stepper: MatStepper) {
    let requiredId: boolean = true;
    /*
      check either PanNo or UID is valid
    */
    if (this.BuyCareForm.get('PolicyHolder.PANNo').invalid && this.BuyCareForm.get('PolicyHolder.UID').invalid) {
      this._alertservice.raiseErrorAlert('Enter either Valid Pan or Valid Aadhar');
      requiredId = false;
    }

    /**
     * when PANNo is valid call api to verify the details . If data is verified move to next stepper else check if Aadhar number is valid .
     * If Aadhar number is provided and is valid than call api to verify the Aadhar details . If successfull move to the next stepper
     * else show the error message.
     */
    if (requiredId && this.BuyCareForm.get('PolicyHolder.PANNo').valid) {
      let DocumentKYC: ICareKYCDto = this._KYCData('PAN')

      this._CareService.KYC(DocumentKYC).subscribe((res) => {
        if (res.Success) {
          this._alertservice.raiseSuccessAlert(res.Message);
          // Call Proposal
          this.IsKYC = true;
          this.KYC = res.Data;
          this.BuyCareForm.get('PolicyHolder').patchValue({
          KYCId: res.Data.KYCId,
          });
          this.step1.reset();
          stepper.next();
        }
        else {
          if (this.BuyCareForm.get('PolicyHolder.UID').value == null || this.BuyCareForm.get('PolicyHolder.UID').value == '') {
            this._alertservice.raiseErrorAlert('Cannot validate PAN. Enter Aadhar for KYC.');
          }
          else if (this.BuyCareForm.get('PolicyHolder.UID').value != '' && this.BuyCareForm.get('PolicyHolder.UID').invalid) {
            this._alertservice.raiseErrorAlert('Cannot validate PAN. Enter valid Aadhar  for KYC.');
          }
          else if (this.BuyCareForm.get('PolicyHolder.UID').valid) {
            this._alertservice.raiseErrorAlert('Wait till Aadhar is being verified',true)
            let DocumentKYC: ICareKYCDto = this._KYCData('UID')
            this._CareService.KYC(DocumentKYC).subscribe((resAadhar) => {
              if (resAadhar.Success) {
                  this.IsKYC = true;
                  this.BuyCareForm.get('PolicyHolder').patchValue({
                    KYCId: resAadhar.Data.KYCId,
                  });
                  this._alertservice.raiseSuccessAlert(resAadhar.Message);
                  this.step1.reset();
                  stepper.next();
              }
              else {
                this.IsKYC = false;
                stepper.previous();
                this._alertservice.raiseErrorAlert(resAadhar.Message);
              }
            })
          }
          else {
            this.IsKYC = false;
            stepper.previous();
            this._alertservice.raiseErrorAlert(res.Message);
          }

        }
      });
    }
    /**
     * if PANNo is not given but Aadhar number is provided than call api to validate Addhar details . If the given details are correct
     * than move to next stepper else ask for PANNo details
     */
    else if (requiredId && this.BuyCareForm.get('PolicyHolder.UID').valid) {
      let DocumentKYC: ICareKYCDto = this._KYCData('UID')
      this._CareService.KYC(DocumentKYC).subscribe((resAadhar) => {
        if (resAadhar.Success) {
          this.IsKYC = true;
          this.BuyCareForm.get('PolicyHolder').patchValue({
            KYCId: resAadhar.Data.KYCId,
          });
          this._alertservice.raiseSuccessAlert(resAadhar.Message);
          this.step1.reset();
          stepper.next();
        }
        else {
          stepper.previous();
          this.IsKYC = false;
          if (this.BuyCareForm.get('PolicyHolder.PANNo').value==null || this.BuyCareForm.get('PolicyHolder.PANNo').value=='') {
            this._alertservice.raiseErrorAlert('Cannot validate Aadhar. Enter PAN for KYC.');
          }
          else {
            if(resAadhar.Alerts && resAadhar.Alerts.length > 0){
              this._alertservice.raiseErrors(resAadhar.Alerts);
            }
            else{
              this._alertservice.raiseErrorAlert(resAadhar.Message);
            }
          }
        }
      })
    }
  }

  //  Policy Details
  public onPolicy() {
    if (this.Policies != null) {
      this.policyDetailsForm.patchValue({
        Productcode: this.Policies.ProductCode,
        SumInsured: this.Policies.SumInsured,
        PolicyPeriod: this.Policies.PolicyPeriod,
        ProductName: this.Policies.ProductName,
        PolicyType: this.Policies.PolicyType,
      });
      this.BuyCareForm.patchValue({ TransactionNo: this.Policies.QuoteNo });
    }
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

  // subQuestions Disable
  /**
   *
   * @param index : to identify the member
   * @param Code :
   * @param Answer
   */
  public subQue(index: number, Code: string, Answer: boolean) {
    this.memberDetailsAsArray.controls.forEach((element, index1) => {
      if (index == index1) {
        (element.get('MemberPEDList') as FormArray).controls.forEach(
          (medical, index2) => {
            if (Code == medical.get('BaseQuestionCd').value) {
              if (Answer) {
                medical.get('Response').enable();
              } else {
                medical.get('Response').reset();
              }
              medical.get('Sub').patchValue(Answer)
            }
          }
        );
      }
    });
  }

  /**
  * since we have used span tag instead of label tag , 'for' attribute cannot be used.
  * so in order to change the value of formcontrol in input type radio by clicking on label , this function is used.
  * @param index : to identify the member in member array
  * @param Q : to identify the question in question array
  * @param value : answer of the question.(Is it true or false?)
  * @param type : is it 1 or 0
  * if it is 1 than value will be patched to formcontrol Boolean
  * else value will be patched to formcontrol IsMedicalQuestionOpted
  */
  public radioLabel(index:number,Q:number, value:string , Type?:number, Answer?:boolean) {

    this.memberDetailsAsArray.controls[index].get('MemberPEDList').controls[Q].patchValue({
      Response: value
    })
    if (Type) {
      let questionCode =this.memberDetailsAsArray.controls[index].get('MemberPEDList').controls[Q].get('QuestionCd').value
      this.subQue(index,questionCode,Answer)
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
          this.BuyCareForm.get('PolicyHolder').patchValue({
            PinCode: result.PinCode,
            City: result.CityName,
            StateCode: result.StateCode,
            CountryCode: result.CountryCode,
          });
        }
      }
    });
  }

  // clear pincode , city ,state & country
  public clear(name: string): void {
    this.BuyCareForm.get(name).setValue("");
    if (name == 'PolicyHolder.PinCode') {
      this.BuyCareForm.get('PolicyHolder.City').setValue("");
      this.BuyCareForm.get('PolicyHolder.StateCode').setValue("");
      this.BuyCareForm.get('PolicyHolder.CountryCode').setValue("");

    }
  }

  // pincode autoComplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.BuyCareForm.get('PolicyHolder').patchValue({
      City: event.option.value.CityName,
      PinCode: event.option.value.PinCode,
      StateCode: event.option.value.StateCode,
      CountryCode: event.option.value.CountryCode,
    });
    this.BuyCareForm.get('PolicyHolder.PinCode').patchValue(
      event.option.value.PinCode
    );
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
      let indexNumber=1;
      (this.inf.controls[index].value.MemberPEDList).forEach((Ques,QuesIn)=> {

        if (Ques.Type == 'Question'){
          if (Ques.Response == null && Ques.BaseQuestionCd == null) {
            let IsMandatoryQuestion :boolean = true;

            if (this.ProductName == PlanNameEnum.careFreedom){
              if(Ques.QuestionSetCd == 'CFLEAFFIFTEEN'){
                //If Your response is yes to any of the above mentioned questions, please specify details of the same in the text box.
                IsMandatoryQuestion=false;
                let NoOfYesAnswers: number = 0;
                (this.inf.controls[index].value.MemberPEDList).forEach((SubQue,SubQuesIn)=> {
                    if (SubQue.Response == 'YES'){
                       NoOfYesAnswers++;
                    }
                });

                if(NoOfYesAnswers > 0 && (Ques.Response == null || Ques.Response == '' || Ques.Response == undefined)){
                  IsMandatoryQuestion=true;
                }
              }
            }

            if(IsMandatoryQuestion){
              this.alerts.push({
                Message: `${ele.title} - Enter Answer Of  ${indexNumber} `,
                CanDismiss: false,
                AutoClose: false,
              });
            }
          }
          indexNumber= indexNumber+1
        }

        if (Ques.Response == null && Ques.BaseQuestionCd != null) {

          (this.inf.controls[index].value.MemberPEDList).forEach((SubQue,SubQuesIn)=> {
            if (SubQue.Response == 'YES' && Ques.BaseQuestionCd == SubQue.QuestionCd) {
              this.alerts.push({
                Message: `${ele.title} - Enter Answer Of Sub-Question of Question ${indexNumber-1} `,
                CanDismiss: false,
                AutoClose: false,
              });
            }
          })
        }
      })

    });
  }

  // proceed to payment portol
  public ProceedToPay() {
    this.stepTwoValidate();

    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
      return;
    }
    this.BuyCareForm.get('PolicyHolder').patchValue({
      DOB: this._datePipe.transform(this.BuyCareForm.get('PolicyHolder.DOB').value, 'yyyy-MM-dd')
    });
    this.inf.value.forEach(ele => {
      ele.DOB = this._datePipe.transform(ele.DOB, 'yyyy-MM-dd')

    })
    let careForm = this._pedYesNoInMemberPDEList(this.BuyCareForm)

    this._CareService.CreateProposal(careForm.value).subscribe((res) => {
      if (res.Success) {
        this._alertservice.raiseSuccessAlert(res.Message);
        this._quoteService.openWindowWithPost(environment.carePayment, {
          proposalNum: res.Data.ProposalNumber,
          returnURL: API_ENDPOINTS.Care.Payment + "/" + res.Data.ProposalNumber,
        });
      }
      else {
        if(res.Alerts && res.Alerts.length > 0){
          this._alertservice.raiseErrors(res.Alerts);
        }
        else{
           this._alertservice.raiseErrorAlert(res.Message);
        }
      }

    });
  }

  // check step one invalid Formfield & Store invalid formfield message in alert array
  public StepOneSubmit(stepper): any {
    this.alerts = [];

    if (this.BuyCareForm.get('PolicyHolder.FirstName').invalid) {
      this.alerts.push({
        Message: 'Enter your First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.BuyCareForm.get('PolicyHolder.LastName').invalid) {
      this.alerts.push({
        Message: 'Enter you Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyCareForm.get('PolicyHolder.NomineeFirstName').invalid) {
      this.alerts.push({
        Message: 'Enter your Nominee First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyCareForm.get('PolicyHolder.NomineeLastName').invalid) {
      this.alerts.push({
        Message: 'Enter your Nominee Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyCareForm.get('PolicyHolder.NomineeRelation').value == '') {
      this.alerts.push({
        Message: 'Enter your Nominee Relation',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.BuyCareForm.get('PolicyHolder.Mobile').value == '' ||
      this.BuyCareForm.get('PolicyHolder.Mobile').value == null
    ) {
      this.alerts.push({
        Message: 'Enter Mobile No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.BuyCareForm.get('PolicyHolder.Mobile').value != '' &&
      this.BuyCareForm.get('PolicyHolder.Mobile').value != null
    ) {
      if (
        !this.phoneNum.test(this.BuyCareForm.get('PolicyHolder.Mobile').value)
      ) {
        this.alerts.push({
          Message: 'Mobile Number must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.BuyCareForm.get('PolicyHolder.Email').value == '') {
      this.alerts.push({
        Message: 'Enter your Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyCareForm.get('PolicyHolder.Email').value != '') {
      if (
        !this.emailValidationReg.test(
          this.BuyCareForm.get('PolicyHolder.Email').value
        )
      ) {
        this.alerts.push({
          Message: 'Enter Valid Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
    // gender required
    if (this.BuyCareForm.get('PolicyHolder.Gender').value == '') {
      this.alerts.push({
        Message: 'Select your Gender',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.BuyCareForm.get('PolicyHolder.DOB').value == '' || this.BuyCareForm.get('PolicyHolder.DOB').value == null) {
      this.alerts.push({
        Message: 'Enter Your Date of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyCareForm.get('PolicyHolder.DOB').value != '') {
      if (this.BuyCareForm.get('PolicyHolder.DOB').value > this.maxBirthDate) {
        this.alerts.push({
          Message: 'Enter Valid Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.BuyCareForm.get('PolicyHolder.PinCode').value == '') {
      this.alerts.push({
        Message: 'Enter PIN Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.BuyCareForm.get('PolicyHolder.Address').value == '') {
      this.alerts.push({
        Message: 'Enter Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    // if (this.BuyCareForm.get('PolicyHolder.Address').value != '') {
    //   // if ( !this.AddressReg.test( this.BuyCareForm.get('PolicyHolder.Address').value )) {
    //     this.alerts.push({
    //       Message: 'Enter valid Address. [A-Z,a-z,0-9,.,/-.#,& are allowed]',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
      // }
    // }

    // if (this.BuyCareForm.get('PolicyHolder.Address').value != '') {
    //   if ( !this.AddressReg.test( this.BuyCareForm.get('PolicyHolder.Address').value )) {
    //     this.alerts.push({
    //       Message: 'Enter valid Address. [A-Z,a-z,0-9,.,/-.#,& are allowed]',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //     }
    // }

    if (this.BuyCareForm.get('PolicyHolder.City').value == '') {
      this.alerts.push({
        Message: 'Enter City Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.Policies?.AddOnvalue <=50000) {
      if (this.BuyCareForm.get('PolicyHolder.PANNo').value == '' && this.BuyCareForm.get('PolicyHolder.UID').value == '') {
        this.alerts.push({
          Message: 'Enter either PAN or Aadhar',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
    else {
      if(this.BuyCareForm.get('PolicyHolder.PANNo').value == ''){
        this.alerts.push({
          Message: 'Enter PAN',
          CanDismiss:false,
          AutoClose:false,
        })
      }
    }


    if(this.BuyCareForm.get('PolicyHolder.PANNo').value != ''){
      if(!this.PANNum.test(this.BuyCareForm.get('PolicyHolder.PANNo').value)){
        this.alerts.push({
          Message: 'Enter Valid PAN',
          CanDismiss:false,
          AutoClose:false,
        })
      }
    }

    if(this.BuyCareForm.get('PolicyHolder.UID').value != ''){
      if(!this.AadharNum.test(this.BuyCareForm.get('PolicyHolder.UID').value)){
        this.alerts.push({
          Message: 'Enter Valid Aadhar',
          CanDismiss:false,
          AutoClose:false,
        })
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
  public StepOneError(stepper: MatStepper) {
    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
      return;
    }
    this.CheckKYC(stepper);
  }

  // chosen year
  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.ExistingSinceDate.value;
    ctrlValue.year(normalizedYear.year());
    this.ExistingSinceDate.setValue(ctrlValue);
  }

  // chosen month
  chosenMonthHandler(
    i: number,
    q: number,
    normalizedMonth: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    const ctrlValue = this.ExistingSinceDate.value;
    ctrlValue.month(normalizedMonth.month());
    this.ExistingSinceDate.setValue(ctrlValue);
    this.memberDetailsAsArray.controls.forEach((element, index) => {
      if (index == i) {
        (element.get('MemberPEDList') as FormArray).controls.forEach(
          (medical, index2) => {
            if (q == index2) {
              var DateString = moment(this.ExistingSinceDate.value).format('MM/YYYY');
              medical.patchValue({ Response: DateString });
            }
          }
        );
      }
    });
    datepicker.close();
  }

  // to convert height from feet & inches into cm
  public SetCM(index:number){
    this.inf.controls[index].patchValue({
       HeightCM: this.Conversion.GetCentimeters(this.inf.controls[index].value.HeightInFeet,this.inf.controls[index].value.HeightInInch)
      });
  }

  //#endregion public-methods
  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // posting values in url

  // AddOns details
  /**
   * the value of AddOn that are selected on Addon page will be patched here.
   */
  private _AddOns () {
    let addOn
    if (localStorage.getItem('AddOns')) {
      addOn=JSON.parse(localStorage.getItem('AddOns'))
    }

    this.BuyCareForm.get('PolicyDetail').patchValue({
      CARESHILED1104:addOn.CARESHILED1104,
      COPAYWAIVER1103:addOn.COPAYWAIVER1103,
      CARESHILEDCF1209:addOn.CARESHILEDCF1209,
      AHCS1144:addOn.AHCS1144,
      NCBS1145:addOn.NCBS1145,
      CS1154:addOn.CS1154,
      SSCP1113:addOn.SSCP1113,
      SMARTCA: addOn.SMARTCA,
      RRMCA: addOn.RRMCA,
      AACCA1090: addOn.AACCA1090,
      EXTOFGCEU: addOn.EXTOFGCEU,
      EXTOFGIU: addOn.EXTOFGIU,
      RIPEDCA1092: addOn.RIPEDCA1092,
      HCUPCA1093: addOn.HCUPCA1093,
      CFWHC: addOn.CFWHC,
      SMART: addOn.SMART,
      CAREWITHNCB: addOn.CAREWITHNCB,
      OPDCARE: addOn.OPDCARE,
      OPDCARESI: addOn.OPDCARESI,
      CFHP: addOn.CFHP,
      ISOCP1112: addOn.ISOCP1112,
      MCCP1111: addOn.MCCP1111,
      CAREFREEDOMDEDUCTIBLERIDER25000: addOn.CAREFREEDOMDEDUCTIBLERIDER25000,
      ICS1149: addOn.ICS1149,
      PEDWP1Y1155: addOn.PEDWP1Y1155,
      PEDWP2Y1156: addOn.PEDWP2Y1156,
      PEDWP3Y1157: addOn.PEDWP3Y1157,
      COPD1211: addOn.COPD1211,

    })
  }

  // KYC data
  /**
   * For KYC , either PanNo. or UID (Aadhar card number) is required .
   * if PanNo. is given than details of PAN Crad will be forwarded and if UID is provided than it will be forwarded.
   * In case both are given than PanNo. will be prioritize and its data will be carry forward for KYC .
   */
  private _KYCData(DocType:string) {
    let DocumentKYC: ICareKYCDto = new CareKYCDto();
    DocumentKYC.DOB = this._datePipe.transform(this.BuyCareForm.get('PolicyHolder.DOB').value, "yyyy-MM-dd")
    if (DocType=='PAN'){
      DocumentKYC.DocNumber = this.BuyCareForm.get('PolicyHolder.PANNo').value;
      DocumentKYC.DocTypeCode = 'PAN';
    }
    else if (DocType == 'UID') {
      DocumentKYC.DocNumber = this.BuyCareForm.get('PolicyHolder.UID').value;
      DocumentKYC.DocTypeCode = 'UID';
    }
    DocumentKYC.Gender = this.BuyCareForm.get('PolicyHolder.Gender').value;
    DocumentKYC.Name = this._fullName(this.BuyCareForm.get('PolicyHolder.FirstName').value,this.BuyCareForm.get('PolicyHolder.LastName').value,this.BuyCareForm.get('PolicyHolder.MiddleName').value);
    return DocumentKYC
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

  // set values
  private setValue() {
    if (this.HealthQuateForm) {
      this.ReqSumInsured = Number(this.HealthQuateForm.SumInsured);
    }
  }

  // policy holder details from health form
  private _membersDetails() {
    if (this.HealthQuateForm.SelfCoverRequired == true) {
      const names = this.HealthQuateForm.Name.trim().replace(/ +/g, ' ').split(' ');
      if (names.length > 0)
        this.BuyCareForm.get('PolicyHolder').patchValue({
          FirstName: names[0].trim(),
        });
      if (names.length > 1) {
        if (names.length > 2) {
          this.BuyCareForm.get('PolicyHolder').patchValue({
            MiddleName: names[1].trim(),
            LastName: names[2].trim(),
          });
        } else
          this.BuyCareForm.get('PolicyHolder').patchValue({
            LastName: names[1],
          });
      }

      this.BuyCareForm.get('PolicyHolder').patchValue({
        Gender: this.HealthQuateForm.SelfGender,
        DOB: this.HealthQuateForm.SelfDOB,

      });
    }

    this.BuyCareForm.get('PolicyHolder').patchValue({
      Mobile: this.HealthQuateForm.Mobile,
      Email: this.HealthQuateForm.EmailId,
      PinCode: this.HealthQuateForm.PinCode,
    })

    this._bindPin(this.HealthQuateForm.PinCode);
  }

  // bind pincode , city , state & country
  private _bindPin(selectedPinCode: string) {
    this._MasterListService
      .getFilteredPincodeListWithDetails(selectedPinCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.BuyCareForm.get('PolicyHolder').patchValue({
              City: res.Data.Items[0].CityName,
              StateCode: res.Data.Items[0].StateCode,
              CountryCode: res.Data.Items[0].CountryCode,
            });
          }
        }
      });
  }

  /**
   * to add pedYesNo in MemberPEDList
   * @param formvalue : value of BuyCareForm
   * @returns : formvalue
   */
  private _pedYesNoInMemberPDEList(formvalue) {
    if (this.ProductName != PlanNameEnum.careHeart) {
      (formvalue.get('PolicyMemberDetails') as FormArray).controls.forEach((element,index) => {
        let NoOfYesAnswers: number = 0;
        (element.get('MemberPEDList') as FormArray).controls.forEach((pde,ind) => {
          if (pde.get('Response').value == "YES") {
            NoOfYesAnswers = NoOfYesAnswers + 1
          }
        })
        let memPDELength = (element.get('MemberPEDList') as FormArray).length
        if (NoOfYesAnswers > 0 && (element.get('MemberPEDList') as FormArray).controls[memPDELength-1].get('QuestionSetCd').value != 'yesNoExist') {
          let item: MemberPEDListDto = new MemberPEDListDto();
          item.QuestionSetCd = 'yesNoExist';
          item.QuestionCd = 'pedYesNo';
          item.BaseQuestionCd = null;
          item.Type = 'Question';
          item.Response = "YES";
          (element.get('MemberPEDList') as FormArray).push(this._initMemberPEDListForm(item))

        }
      })
    }
    return formvalue
  }

  // change in pincode
  private _onFormChanges() {
    this.BuyCareForm.get('PolicyHolder.PinCode').valueChanges.subscribe(
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

    this.memberDetailsAsArray.controls.forEach((element, index) => {
      let DateOfBirth = new Date(element.get('DOB').value);
      DateOfBirth.setHours(0,0,0,0);
      (element.get('MemberPEDList') as FormArray).controls.forEach((medical, index2) => {
            medical.get('Response').valueChanges.subscribe((value) => {
              if (value != 'YES' && value !='NO' && value !=null) {
                let Input = value
                let UserInputValue = medical.get('patchResponse').value;
                let DD:string = '01';
                let MM:string = Input.slice(0,2);
                let YYYY:string = Input.slice(3);


                let DateOfDisease

                if (UserInputValue) {
                  DD = this._datePipe.transform(UserInputValue,'dd')
                  DateOfDisease = MM + '/'+ DD + '/' + YYYY
                } else {
                  DateOfDisease = MM + '/'+ DD + '/' + YYYY
                }


                if (DateOfDisease.length==10) {
                  let InputData = new Date(DateOfDisease)
                  let MonthOfInputData = InputData.getMonth()

                  InputData.setHours(0,0,0,0)
                  if (MonthOfInputData >= 0 && MonthOfInputData < 12) {
                    if(InputData <= this.maxDate && InputData>=DateOfBirth){
                      medical.patchValue({
                        patchResponse:moment(DateOfDisease)
                      })
                    } else if (InputData > this.maxDate) {
                      medical.patchValue({
                        patchResponse:moment(this.maxDate),
                        Response:moment(this.maxDate).format('MM/YYYY')
                      })
                    }
                    else if (InputData<DateOfBirth) {
                      medical.patchValue({
                        patchResponse:moment(DateOfBirth),
                        Response:moment(DateOfBirth).format('MM/YYYY')
                      })

                    }
                  }
                  else {

                    DateOfDisease = '01' + '/'+ DD + '/' + YYYY
                    InputData = new Date(DateOfDisease)


                    if(InputData <= this.maxDate && InputData>=DateOfBirth){
                      medical.patchValue({
                        patchResponse:moment(DateOfDisease),
                        Response:moment(DateOfDisease).format('MM/YYYY')
                      })
                    } else if (InputData > this.maxDate) {
                      medical.patchValue({
                        patchResponse:moment(this.maxDate),
                        Response:moment(this.maxDate).format('MM/YYYY')
                      })
                    }
                    else if (InputData<DateOfBirth) {
                      medical.patchValue({
                        patchResponse:moment(DateOfBirth),
                        Response:moment(DateOfBirth).format('MM/YYYY')
                      })

                    }
                  }

                }
              }


            })
          }
      );
  });
  }

  // add number of members and details
  // in helath quote form selected Insured person data fill in Adityabirla policy member details
  private _addMemberDetails() {
    let title: string;
    for (let i = 0; i < this.member.length; i++) {
    var row: PolicyMemberCareDto = new PolicyMemberCareDto();
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

  // member details from health form
  private _SetPolicyMemberDetails(title, row: PolicyMemberCareDto) {
    this.BuyNow = this.BuyCareForm.value;
    let names = this.HealthQuateForm[`${title}Name`].trim().replace(/ +/g, ' ').split(' ');


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
      case 'Child2' :
        row.Gender = 'Female';
        break;
      case  'Child3' :
        row.Gender = 'Female';
        break;
      case  'Child4' :
        row.Gender = 'Male';
        break;
      case  'Child5' :
        row.Gender = 'Male';
        break;
      case  'Child6' :
        row.Gender = 'Male';
        break;
      case  'Father' :
        row.Gender = 'Male';
        break;
      case  'Mother' :
        row.Gender = 'Female';
        break;
    }

    this.BuyNow.PolicyMemberDetails.push(row);
    this.inf.push(this._initPolicyMemberDetailsForm(row));
  }

  // Get Insurance helper dropdown master data
  private _fillMasterList() {
    this.GenderList = [];
    // fill gender list
    this._MasterListService.getCompanyWiseList('Care', 'gender').subscribe((res) => {
      if (res.Success) {
        this.GenderList = res.Data.Items;
      }
    });
    this.RelationList = [];
    this._MasterListService.getCompanyWiseList('Care', 'relation').subscribe((res) => {
      if (res.Success) {
        this.RelationList = res.Data.Items;
      }
    });
    this.NomineeRelationList = [];
    this._MasterListService.getCompanyWiseList('Care', 'NomineeRelation').subscribe((res) => {
      if (res.Success) {
        this.NomineeRelationList = res.Data.Items;
      }
    });

    //Occupation
    this.OccupationList = [];
    this._MasterListService
      .getCompanyWiseList('Care', 'bajajallianzoccupation')
      .subscribe((res) => {
        if (res.Success) {
          this.OccupationList = res.Data.Items;
        }
      });
  }

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length? null : { 'whitespace': true };
  }

  // Build Main Care health policy Form
  private _buildBuyCareForm(data: BuyCareDto) {
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
      SumInsured: [0],
      PolicyStartDate: [''],
      PolicyPeriod: [''],
      SubProductCode: [''],
      ProductName: [''],
      PolicyType: [''],
      SMARTCA: [false],
      CAREADWITHNCB: [false],
      RRMCA: [false],
      AACCA1090: [false],
      COPAYWAIVER1103: [false],
      EXTOFGCEU: [false],
      EXTOFGIU: [false],
      RIPEDCA1092: [false],
      CARESHILED1104: [false],
      HCUPCA1093: [false],
      CARESHILEDCF1209: [false],
      CFWHC: [false],
      SMART: [false],
      CAREWITHNCB: [false],
      OPDCARE: [false],
      OPDCARESI: [],
      CFHP: [false],
      CAREFREEDOMDEDUCTIBLERIDER25000: [false],
      AHCS1144: [false],
      NCBS1145: [false],
      ICS1149: [false],
      CS1154: [false],
      PEDWP1Y1155: [false],
      PEDWP2Y1156: [false],
      PEDWP3Y1157: [false],
      COPD1211: [false],
      SSCP1113: [false],
      ISOCP1112: [false],
      MCCP1111: [false],
    });
    return this.policyDetailsForm;
  }

  //INIT policy holder details form
  private _buildPolicyHolderForm(data): FormGroup {
    let policyHolderForm = this.fb.group({
      FirstName: ['', [Validators.required,this.noWhitespaceValidator]],
      MiddleName: [''],
      LastName: ['', [Validators.required,this.noWhitespaceValidator]],
      Mobile: [
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
      CountryCode: [''],
      StateCode: [''],
      PinCode: ['', [Validators.required]],
      Address: ['', [Validators.required,this.noWhitespaceValidator]],
      Street: ['', []],
      City: ['', [Validators.required]],
      Address1: [''],
      KYCId: [''],
      PANNo: ['',[this.noWhitespaceValidator]],
      UID: ['',[this.noWhitespaceValidator]],
      NomineeFirstName: ['', [Validators.required,this.noWhitespaceValidator]],
      NomineeMiddleName: [''],
      NomineeLastName: ['', [Validators.required,this.noWhitespaceValidator]],
      NomineeRelation: ['', [Validators.required]],
    });
    return policyHolderForm;
  }

  //Build policy member array
  private _buildPolicyMemberDetailsForm(
    items: PolicyMemberCareDto[] = []
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

  //Init policy member details form
  private _initPolicyMemberDetailsForm(item: PolicyMemberCareDto): FormGroup {
    let pDF = this.fb.group({
      FirstName: ['', [Validators.required,this.noWhitespaceValidator,Validators.maxLength(60)]],
      MiddleName: [''],
      LastName: ['', [Validators.required,this.noWhitespaceValidator,Validators.maxLength(60)]],
      Relation: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      Gender: ['0', [Validators.required]],
      HeightCM: [0, [Validators.required, Validators.max(400)]],
      HeightInFeet: [],
      HeightInInch: [],
      WeightKG: [0, [Validators.required, Validators.max(300)]],
      MemberPEDList: this._buildMemberPEDListForm(),
    });
    if (item != null) {
      if (!item) {
        item = new PolicyMemberCareDto();
      }

      if (item) {
        pDF.patchValue(item);
      }
    }
    return pDF;
  }

  //Build policy member PDE List array
  private _buildMemberPEDListForm(): FormArray {
    let formArray: FormArray = new FormArray([]);
    this.QuestionList.forEach((Q) => {
      let item: MemberPEDListDto = new MemberPEDListDto();
      item.QuestionSetCd = Q.SetCode;
      item.QuestionCd = Q.Code;
      item.BaseQuestionCd = Q.BaseQuestionCode;
      item.Type = Q.Type;

      formArray.push(this._initMemberPEDListForm(item));
    });

    return formArray;
  }

  //init policy member PDE List Form
  private _initMemberPEDListForm(item: MemberPEDListDto): FormGroup {
    let mPL = this.fb.group({
      QuestionSetCd: [item.QuestionSetCd],
      QuestionCd: [item.QuestionCd],
      BaseQuestionCd: [item.BaseQuestionCd],
      Response: [item.Response],
      patchResponse: [],
      Sub:[false],
      Type:[item.Type]
    });
    return mPL;
  }
  //#endregion Private methods
}
