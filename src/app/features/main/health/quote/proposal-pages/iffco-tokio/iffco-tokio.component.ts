import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { dropdown } from '@config/dropdown.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert } from '@models/common';
import { IIffcoTokioDto, IffcoTokioDto } from '@models/dtos/config/IffcoTokio/iffco-tokio-dto';
import { IffcoTokioService } from './iffco-tokio.service';
import { QuoteService } from '../../quote.service';
import { environment } from 'src/environments/environment';
import { IIffkoTokioKYCDto, IffkoTokioKYCDto } from '@models/dtos/config/Kyc/IffcoTokio/iffko-tokio-kycdto';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { ICityPincodeDto } from '@models/dtos/core/CityDto';
import * as moment from 'moment';
import { IffcoTokioKycPopUpComponent } from '../iffco-tokio-kyc-pop-up/iffco-tokio-kyc-pop-up.component';
import { Router } from '@angular/router';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';
import { ROUTING_PATH } from '@config/routingPath.config';
import { UnitConversion } from '@config/UnitConversion';
import { IIffcoTokioQuestionDto, IffcoTokioPolicyMemberDetailsDto, MedicalHistoryQuestionsDto } from '@models/dtos/config/IffcoTokio';
import { ValidationRegex } from '@config/validationRegex.config';

@Component({
  selector: 'gnx-iffco-tokio',
  templateUrl: './iffco-tokio.component.html',
  styleUrls: ['./iffco-tokio.component.scss'],
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
export class IFFCOTOKIOComponent {

  // start of Variable declaration

  pagetitle: string = 'IFFCO TOKIO Form'; // Page Main Header Title
  Policies: any; // Store Selected Policy From local storage
  IffcoBuyNowForm: FormGroup;  // FormGroup for 'IFFCO TOKIO Policy 
  IffcoBuyNow: IIffcoTokioDto; // To store IffcoBuyNowForm Value
  DropdownMaster: dropdown; // To get data for dropdown
  Conversion: UnitConversion;  // to store Height convert in CM
  logo: string;  // to store Policy Icon path
  maxBirthDate: Date; // To validate policy person birthdate
  member: any[];  // To store policy person list like as icon,title
  InsuredPeople: number; //count of Insured People
  ReqSumInsured: number; // to store policy sum insured
  PolicyType: string; // to store Policy Type 
  HealthQuateForm: any; // To store Health Quate Data from get local storage 
  ProductName: string; // Store Plan Name For Display
  SumInsured: string; // to store policy sum insured
  Insurer: string; // to store Insurance campany insurare
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;


  memberDetailsAsArray;

  IsKYC: boolean = false
  flag = 1 //check if data of buynow , member & health form is not empty
  insurerFlag = 1  //check if name of the insurer is Aditya Birla or not 
  alerts: Alert[]
  kycFlag = 0

  NomineeRelationList: any[]; // to store nominee Relation dropdownlist
  RelationList: any[];  // to store Relation dropdownlist
  GenderList: any[]; // to store Gender Dropdown list
  IllnessList: IIffcoTokioQuestionDto[]  // to store Illnesslist from Service File (Static)

  pincodes$: Observable<ICityPincodeDto[]>; // Pincode list Observable
  destroy$: Subject<any>;

  step1 = new FormControl() // Step Control

  // end of Variable declaration

  //#region constructor
  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public dialog: MatDialog,
    private _MasterListService: MasterListService,
    private _IffcoTokioService: IffcoTokioService,
    private _quoteService: QuoteService,
    private _datePipe: DatePipe,
    private _router: Router,
  ) // number of people insured
  {
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();
    this.Conversion = new UnitConversion();
    // Set Max Birthdate from  Current date to lat 3 month
    this.maxBirthDate = new Date(Date.now());
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);

    // if any one of HealthQuateForm , buynow , member is not stored in localstorage than return back to Health form
    if (!localStorage.getItem('member') || !localStorage.getItem('buynow') || !localStorage.getItem('HealthQuateForm')) {
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.Health])
      this.flag = 0
      return;
    } else {
      // if name of the insurer in buynow is not iffco tokiyo  than return plan list to choose a plan
      let Insurer = JSON.parse(localStorage.getItem('buynow'))
      if (Insurer.Insurer.toLowerCase() != InsuranceCompanyName.IffcoTokio) {
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
    // Icon of the comany
    if (localStorage.getItem('buynow')) {
      this.Policies = JSON.parse(localStorage.getItem('buynow'));
      this.logo = this.Policies.IconURL;
      this.Insurer = this.Policies.Insurer;

      this.ProductName = this.Policies.ProductName;
      if (this.Policies.PolicyType == 'MultiIndividual')
        this.PolicyType = 'Individual';
      else this.PolicyType = this.Policies.PolicyType;

    }

    // Get Illness Que. List From Service file 
    this.IllnessList = this._IffcoTokioService.getIllness()

  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init
  // Start of ngOnInit
  ngOnInit(): void {
    // Set New Class  IffcoTokioDto
    this.IffcoBuyNow = new IffcoTokioDto();
    this.IffcoBuyNowForm = this._buildBuyNowForm(this.IffcoBuyNow);
    this.IffcoBuyNow.PolicyMemberDetails = new Array<IffcoTokioPolicyMemberDetailsDto>();

    if (this.flag && this.insurerFlag) {
      // get Health quate Data From Local storage 
      this.HealthQuateForm = JSON.parse(localStorage.getItem('HealthQuateForm'));

      this.memberDetailsAsArray = this.IffcoBuyNowForm.get(
        'PolicyMemberDetails'
      ) as FormArray;
      this._fillMasterList(); // Get Insurance helper master data 
      this._onFormChanges(); // Use for Formfield change detection
      this.setValue(); // Set Health quate Sum insurred
      this.onPolicy(); // Set Selecte Policy Data bind In AdityaBrila Form
      this._AddOns();
      this._membersDetails(); // if self is in insurred Person then bind their data in policy holder
      this._addMemberDetails(); // insurred Person data bind  in Aditya birla form
    }

  }
  // End of ngOnInit
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // return a main formgroup controls
  get f() {
    return this.IffcoBuyNowForm.controls;
  }

  // get method for PolicyMember Details
  get inf() {
    return this.IffcoBuyNowForm.get('PolicyMemberDetails') as FormArray;
  }

  // set Health quoate Sum inssured type Number
  public setValue() {
    if (this.HealthQuateForm) {
      this.ReqSumInsured = Number(this.HealthQuateForm.SumInsured);
    }
  }

  // policy details
  public onPolicy() {
    // Set Selecte policy details in IffcoTokioDto form
    if (this.Policies != null) {

      this.IffcoBuyNowForm.get('PolicyDetail').patchValue({
        ProductName: this.Policies.ProductName,
        Productcode: this.Policies.ProductCode,
        PolicyType: this.Policies.PolicyType,
        SumInsured: this.Policies.SumInsured,
        PolicyPeriod: this.Policies.PolicyPeriod,
        PolicyAmount: this.Policies?.AddOnvalue,
      });

      this.IffcoBuyNowForm.get('Insurer').patchValue(this.Insurer);
      this.IffcoBuyNowForm.get('TransactionNo').patchValue(this.Policies.QuoteNo);
    }

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

  // PINcode Section pop-up box
  public openDiologPincode(type: string, title: string, MemberIndex?: number) {
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
          this.IffcoBuyNowForm.get('PolicyHolder').patchValue({
            PinCode: result.PinCode,

          });
        }

        if (type == 'PIN') {
          this.IffcoBuyNowForm.get('PolicyHolder').patchValue({
            NomineePinCode: result.PinCode,

          });
        }

      }
    });
  }

  //Display Autocomplete Selected Pindoce
  public displayFnPinCode = (val: any) => {
    if (val.PinCode) {
      return val.PinCode;
    } else {
      return val;
    }
  };

  // Set Selected PINcode from autocomplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent, name: string): void {
    this.IffcoBuyNowForm.get(name).patchValue(
      event.option.value.PinCode
    );
  }

  // clear pincode
  public clear(name: string): void {
    this.IffcoBuyNowForm.get(name).setValue("")
    if (name == 'PolicyHolder.PinCode') {

    }
  }

  // proceed tp payment portol  
  // Ater all neccesary Field Fill data Proceed To Pay
  public ProceedToPay() {
    this._StepTwoSubmit();

    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
      return;
    }

    this.IffcoBuyNowForm.get('PolicyHolder').patchValue({
      DOB: this._datePipe.transform(this.IffcoBuyNowForm.get('PolicyHolder.DOB').value, 'yyyy-MM-dd')
    })
    this.memberDetailsAsArray.controls.forEach((element, index) => {

      element.get('DOB').patchValue(this._datePipe.transform(element.get('DOB').value, 'yyyy-MM-dd'));
    })

    this._IffcoTokioService.CreateProposal(this.IffcoBuyNowForm.value).subscribe((res) => {
      if (res.Success) {
        this._quoteService.openWindowWithPost(environment.IffcoTokioPayment, {
          ptnrTransactionLogId: res.Data.PtnrTransactionLogId,
          orderNo: res.Data.OrderNo,
          traceNo: res.Data.TraceNo,
        })
      } else {
        if (res.Alerts && res.Alerts.length > 0) {
          this._alertservice.raiseErrors(res.Alerts);
        }
        else {
          this._alertservice.raiseErrorAlert(res.Message);
        }
      }

    })


  }

  // check step one Field & Invalid Field Error message push in alert Array
  public _StepOneSubmit(stepper): any {
    this.alerts = [];

    if (this.IffcoBuyNowForm.get('PolicyHolder.FirstName').invalid) {
      this.alerts.push({
        Message: 'Enter your First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }


    if (this.IffcoBuyNowForm.get('PolicyHolder.LastName').invalid) {
      this.alerts.push({
        Message: 'Enter your Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // gender
    if (this.IffcoBuyNowForm.get('PolicyHolder.Gender').value == '') {
      this.alerts.push({
        Message: 'Select your Gender',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.IffcoBuyNowForm.get('PolicyHolder.DOB').value == '' || this.IffcoBuyNowForm.get('PolicyHolder.DOB').value == null) {
      this.alerts.push({
        Message: 'Enter Your Date of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.IffcoBuyNowForm.get('PolicyHolder.DOB').value != '') {
      if (this.IffcoBuyNowForm.get('PolicyHolder.DOB').value > this.maxBirthDate)
        this.alerts.push({
          Message: 'Enter Valid Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
    }

    if (this.IffcoBuyNowForm.get('PolicyHolder.Address1').invalid) {
      this.alerts.push({
        Message: 'Enter Your Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.IffcoBuyNowForm.get('PolicyHolder.Address2').invalid) {
      this.alerts.push({
        Message: 'Enter Your Address1',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.IffcoBuyNowForm.get('PolicyHolder.PinCode').value == '') {
      this.alerts.push({
        Message: 'Enter PIN Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }


    if (this.IffcoBuyNowForm.get('PolicyHolder.NomineeFirstName').invalid) {
      this.alerts.push({
        Message: 'Enter Nominee First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }


    if (this.IffcoBuyNowForm.get('PolicyHolder.NomineeLastName').invalid) {
      this.alerts.push({
        Message: 'Enter Nominee Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.IffcoBuyNowForm.get('PolicyHolder.NomineeRelation').value == '') {
      this.alerts.push({
        Message: 'Enter Nominee Relation',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.IffcoBuyNowForm.get('PolicyHolder.NomineeAddress1').invalid) {
      this.alerts.push({
        Message: 'Enter Nominee Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.IffcoBuyNowForm.get('PolicyHolder.NomineeAddress2').invalid) {
      this.alerts.push({
        Message: 'Enter Nominee Address1',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.IffcoBuyNowForm.get('PolicyHolder.NomineePinCode').value == '') {
      this.alerts.push({
        Message: 'Enter Nominee PIN Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.IffcoBuyNowForm.get('PolicyHolder.Mobile').value == '') {
      this.alerts.push({
        Message: 'Enter Mobile No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.IffcoBuyNowForm.get('PolicyHolder.Mobile').value != '') {
      if (
        this.IffcoBuyNowForm.get('PolicyHolder.Mobile').value.toString().length >
        10 ||
        this.IffcoBuyNowForm.get('PolicyHolder.Mobile').value.toString().length < 10
      ) {
        this.alerts.push({
          Message: 'Enter Valid Mobile No.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }



    if (this.IffcoBuyNowForm.get('PolicyHolder.Email').value != '') {
      if (!this.emailValidationReg.test(this.IffcoBuyNowForm.get('PolicyHolder.Email').value)) {
        this.alerts.push({
          Message: 'Enter Valid Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }


    if (this.IffcoBuyNowForm.get('PolicyHolder.EmergencyContactName').invalid) {
      this.alerts.push({
        Message: 'Enter Emergency Contact Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }


    if (this.IffcoBuyNowForm.get('PolicyHolder.EmergencyContactMobile').value == '') {
      this.alerts.push({
        Message: 'Enter Emergency Contact Mobile No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.IffcoBuyNowForm.get('PolicyHolder.EmergencyContactMobile').value != '') {
      if (
        this.IffcoBuyNowForm.get('PolicyHolder.EmergencyContactMobile').value.toString().length >
        10 ||
        this.IffcoBuyNowForm.get('PolicyHolder.EmergencyContactMobile').value.toString().length < 10
      ) {
        this.alerts.push({
          Message: 'Enter Valid Emergency Contact Mobile No.',
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

  // alert message if step three is not validated
  public StepThreeError(stepper: MatStepper) {
    // this._openDiologKYC(this.IffcoBuyNowForm.get('PolicyHolder').value)
    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
      return;
    }

    this._CheckKYC(stepper);
  }

  // radio button
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
  public radioLabel(index: number, Q: number, value: boolean) {

    this.memberDetailsAsArray.controls[index].get('MedicalHistoryQuestions').controls[Q].patchValue({
      Answer: value
    })

  }

  // radio button for Habit
  /**
   * since we have used span tag instead of label tag , 'for' attribute cannot be used.
   * so in order to change the value of formcontrol in input type radio by clicking on label , this function is used.
   * @param index : to identify the member in member array
   * @param H : to identify the habbit from the MemberLifeStyle array
   * @param value : value of habbit (habbit_Name or '')
   */
  public radioLabelhabit(index: number, label: string, value: boolean) {

    this.memberDetailsAsArray.controls[index].get(label).patchValue(
      value
    )

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
    
    if (addOn.CriticalIllnessCovered) {
      this.IffcoBuyNowForm.get('PolicyHolder.CriticalIllnessCovered').patchValue(addOn.CriticalIllnessCovered)
    }

    if (addOn.IffcoTokioPolicy) {
      this.IffcoBuyNowForm.get('PolicyHolder.IffcoTokioPolicy').patchValue(addOn.IffcoTokioPolicy)
      this.IffcoBuyNowForm.get('PolicyHolder.IffcoTokioPolicyNo').patchValue(addOn.IffcoTokioPolicyNo)
      this.IffcoBuyNowForm.get('PolicyHolder.LastName').patchValue(addOn.LastName)
      this.IffcoBuyNowForm.get('PolicyHolder.FirstName').patchValue(addOn.FirstName)
    }

    if (addOn.RoomRentWaiver) {
      this.IffcoBuyNowForm.get('PolicyHolder.RoomRentWaiver').patchValue(addOn.RoomRentWaiver)
    }
  }

  // check step two  Field & Invalid Field Error message push in alert Array
  private _StepTwoSubmit() {
    this.alerts = [];
    this.member.forEach((ele, index) => {
      let currentDate = new Date()
      let age = moment(currentDate).diff(this.inf.controls[index].value.DOB, 'year')

      // FirstName
      if (this.inf.controls[index].get('FirstName').invalid) {
        this.alerts.push({
          Message: `${ele.title} - Enter First Name`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // LastName
      if (this.inf.controls[index].get('LastName').invalid) {
        this.alerts.push({
          Message: `${ele.title} - Enter Last Name`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // DOB
      if (this.inf.controls[index].value.DOB == '') {
        this.alerts.push({
          Message: `${ele.title} - Enter DOB`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // Gender
      if (this.inf.controls[index].value.Gender == '') {
        this.alerts.push({
          Message: `${ele.title} - Enter Gender`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // Height
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

      // Weight
      if (this.inf.controls[index].value.WeightKG == 0) {
        this.alerts.push({
          Message: `${ele.title} - Enter Weight in KG`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // Alcohol
      if (this.inf.controls[index].value.Alcohol == null) {
        this.alerts.push({
          Message: `${ele.title} - Select option for Alcohol`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AlcoholConsumptionPerWeek
      if (this.inf.controls[index].value.Alcohol == true) {
        if (this.inf.controls[index].value.AlcoholConsumptionPerWeek == null || this.inf.controls[index].value.AlcoholConsumptionPerWeek == '') {
          this.alerts.push({
            Message: `${ele.title} - Enter Per Week Consumption of Alcohol`,
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

      // Smoke
      if (this.inf.controls[index].value.Smoke == null) {
        this.alerts.push({
          Message: `${ele.title} - Select option for Smoke`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // SmokeCigarettePerDay
      if (this.inf.controls[index].value.Smoke == true) {
        if (this.inf.controls[index].value.SmokeCigarettePerDay == null || this.inf.controls[index].value.SmokeCigarettePerDay == '') {
          this.alerts.push({
            Message: `${ele.title} - Enter Per Week Consumption of Smoking`,
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

      // Tobacco
      if (this.inf.controls[index].value.Tobacco == null) {
        this.alerts.push({
          Message: `${ele.title} - Select option for Tobacco`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // TobaccoConsumptionPerWeek
      if (this.inf.controls[index].value.Tobacco == true) {
        if (this.inf.controls[index].value.TobaccoConsumptionPerWeek == null || this.inf.controls[index].value.TobaccoConsumptionPerWeek == '') {
          this.alerts.push({
            Message: `${ele.title} - Enter Per Week Consumption of Tobacco`,
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

      // MedicalQuestions
      ((this.inf.controls[index].get('MedicalHistoryQuestions')) as FormArray).controls.forEach((element, ind) => {
        if (element.get('Answer').value == null) {
          this.alerts.push({
            Message: `${ele.title} - Select option for Question ${ind + 1} (Medical History)`,
            CanDismiss: false,
            AutoClose: false,
          });
        } else {
          if (element.get('Answer').value && age > 50 && (element.get('Qid').value == 'Q1' || element.get('Qid').value == 'Q2' || element.get('Qid').value == 'Q11')) {
            this.alerts.push({
              Message: `${ele.title} - Max Age allowed is 50 for Question ${ind + 1} (Medical History)`,
              CanDismiss: false,
              AutoClose: false,
            });
          }

          if (element.get('Answer').value && (element.get('Qid').value == 'Q98' || element.get('Qid').value == 'Q99')) {
            this.alerts.push({
              Message: `${ele.title} - We do not sell policy online if customer opts Yes for Question ${ind + 1} (Medical History)`,
              CanDismiss: false,
              AutoClose: false,
            });
          }

        }
      });
    });


    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
    }

  }

  // Get Insurance helper dropdown master data
  private _fillMasterList() {
    this.GenderList = [];
    // fill gender list
    this._MasterListService.getCompanyWiseList('IFFCOTOKIO', 'gender').subscribe((res) => {
      if (res.Success) {
        this.GenderList = res.Data.Items;
      }
    });
    this.RelationList = [];
    this._MasterListService.getCompanyWiseList('IFFCOTOKIO', 'relation').subscribe((res) => {
      if (res.Success) {
        this.RelationList = res.Data.Items;
      }
    });
    this.NomineeRelationList = [];
    this._MasterListService.getCompanyWiseList('IFFCOTOKIO', 'nomineerelation').subscribe((res) => {
      if (res.Success) {
        this.NomineeRelationList = res.Data.Items;
      }
    });

  }

  // Check Policy Holder KYC Verification
  private _CheckKYC(stepper) {
    let requiredId: boolean = true;
    /*
     check either PanNo  is valid    
   */
    if (this.IffcoBuyNowForm.get('PolicyHolder.KYCDocumentNo').invalid) {
      this._alertservice.raiseErrorAlert('Enter Valid PAN');
      requiredId = false;
    }

    /**
   * when PANNo is valid call api to verify the details . If data is verified move to next stepper .
   * else show the error message.
   */
    if (requiredId) {
      let PANKYC: IIffkoTokioKYCDto = new IffkoTokioKYCDto();
      PANKYC.DOB = this._datePipe.transform(this.IffcoBuyNowForm.get('PolicyHolder.DOB').value, "yyyy-MM-dd 00:00:00")
      PANKYC.DocNumber = this.IffcoBuyNowForm.get('PolicyHolder.KYCDocumentNo').value;
      PANKYC.DocTypeCode = 'PAN';
      PANKYC.Gender = this.IffcoBuyNowForm.get('PolicyHolder.Gender').value;
      PANKYC.TransactionNo = this.Policies.QuoteNo;
      PANKYC.Name = this._fullName(this.IffcoBuyNowForm.get('PolicyHolder.FirstName').value, this.IffcoBuyNowForm.get('PolicyHolder.LastName').value, this.IffcoBuyNowForm.get('PolicyHolder.MiddleName').value);
      this._IffcoTokioService.KYC(PANKYC).subscribe((res) => {

        if (res.Success) {
          this.IffcoBuyNowForm.get('PolicyHolder.CKYCId').patchValue(res.Data.KYCId)
          this.IsKYC = true;
          this._alertservice.raiseSuccessAlert(res.Message);
          this.step1.reset();
          stepper.next();
        } else {
          stepper.previous();
          this.IsKYC = false;
          this._openDiologKYC(this.IffcoBuyNowForm.get('PolicyHolder').value)
          this.kycFlag = 1
        }
      });
    } else {
      this.IsKYC = false;
      this._alertservice.raiseErrorAlert('Enter Valid PAN');
    }
  }

  // Pop Up for KYC
  private _openDiologKYC(form) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '35vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      info: form,
      ispopup: true,
    };

    const dialogRef = this.dialog.open(IffcoTokioKycPopUpComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
      }
    });
  }

  // full name for KYC
  private _fullName(FName: string, LName: string, MName?: string) {
    let Name: string
    if (MName) {
      Name = FName.concat(' ', MName, ' ', LName)
    } else {
      Name = FName.concat(' ', LName)
    }


    return Name
  }

  // details from health form
  private _membersDetails() {
    if (this.HealthQuateForm.SelfCoverRequired == true) {
      const names = this.HealthQuateForm.Name.trim().replace(/ +/g, ' ').split(' ');
      if (names.length > 0)
        this.IffcoBuyNowForm.get('PolicyHolder').patchValue({
          FirstName: names[0].trim(),
        });
      if (names.length > 1) {
        if (names.length > 2) {
          this.IffcoBuyNowForm.get('PolicyHolder').patchValue({
            MiddleName: names[1].trim(),
            LastName: names[2].trim(),
          });
        } else
          this.IffcoBuyNowForm.get('PolicyHolder').patchValue({
            LastName: names[1],
          });
      }

      this.IffcoBuyNowForm.get('PolicyHolder').patchValue({
        Gender: this.HealthQuateForm.SelfGender,
        DOB: this.HealthQuateForm.SelfDOB,

      });
    }

    this.IffcoBuyNowForm.get('PolicyHolder').patchValue({
      Mobile: this.HealthQuateForm.Mobile,
      Email: this.HealthQuateForm.EmailId,
      PinCode: this.HealthQuateForm.PinCode,
    })


  }

  // number of members from health form
  private _addMemberDetails() {
    let title: string
    var row: IffcoTokioPolicyMemberDetailsDto = new IffcoTokioPolicyMemberDetailsDto();
    for (let i = 0; i < this.member.length; i++) {
      if (this.member[i].title == 'Self') {
        title = 'Self'
      }
      switch (this.member[i].title) {
        case "Self":
          title = 'Self'
          const Names = this.HealthQuateForm.Name.trim().replace(/ + /g, ' ').split(' ');
          if (Names.length > 0)
            row.FirstName = Names[0].trim()
          if (Names.length > 1) {
            if (Names.length > 2) {
              row.MiddleName = Names[1].trim();
              row.LastName = Names[2].trim();
            }
            else row.LastName = Names[1].trim()
          }
          row.DOB = this.HealthQuateForm[`${title}DOB`]
          row.Gender = this.HealthQuateForm[`${title}Gender`]
          row.Relation = "Self";
          this.IffcoBuyNow.PolicyMemberDetails.push(row);
          this.inf.push(this._initPolicyMemberDetailsForm(row));
          break;
        case "Spouse":
          title = 'Spouse'
          row.Relation = "Spouse";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Daughter":
          title = 'Child1'
          row.Relation = "Daughter";
          this._SetPolicyMemberDetails(title, row)
          break;

        case "Daughter1":
          title = 'Child1'
          row.Relation = "Daughter";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Daughter2":
          title = 'Child2'
          row.Relation = "Daughter";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Daughter3":
          title = 'Child3'
          row.Relation = "Daughter";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Son":
          title = 'Child4'
          row.Relation = "Son";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Son1":
          title = 'Child4'
          row.Relation = "Son";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Son2":
          title = 'Child5'
          row.Relation = "Son";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Son3":
          title = 'Child6'
          row.Relation = "Son";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Mother":
          title = 'Mother'
          row.Relation = "Mother";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Father":
          title = 'Father'
          row.Relation = "Father";
          this._SetPolicyMemberDetails(title, row)
          break;

        default:
          break;
      }

    }
  }

  // member details from health form
  private _SetPolicyMemberDetails(title, row: IffcoTokioPolicyMemberDetailsDto) {
    this.IffcoBuyNow = this.IffcoBuyNowForm.value;
    const names = this.HealthQuateForm[`${title}Name`].trim().replace(/ + /g, ' ').split(' ');
    if (names.length > 0)
      row.FirstName = names[0].trim()
    if (names.length > 1) {
      if (names.length > 2) {
        row.MiddleName = names[1].trim();
        row.LastName = names[2].trim();
      }
      else row.LastName = names[1].trim()
    }

    row.DOB = this.HealthQuateForm[`${title}DOB`]
    row.Gender = this.HealthQuateForm[`${title}Gender`]
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
    this.IffcoBuyNow.PolicyMemberDetails.push(row);
    this.inf.push(this._initPolicyMemberDetailsForm(row));
  }

  // change in pincode
  private _onFormChanges() {
    this.IffcoBuyNowForm.get('PolicyHolder.PinCode').valueChanges.subscribe(
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

    this.IffcoBuyNowForm.get('PolicyHolder.NomineePinCode').valueChanges.subscribe(
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

  // main form
  private _buildBuyNowForm(data: IffcoTokioDto) {
    let Buyform = this.fb.group({
      Insurer: [''],
      TransactionNo: [''],
      PolicyDetail: this._buildPolicyDetailForm(data.PolicyDetail),
      PolicyMemberDetails: this._buildPolicyMemberDetailsForm(
        data.PolicyMemberDetails
      ),
      PolicyHolder: this._buildPolicyHolderForm(data.PolicyHolder),
    });
    return Buyform;
  }

  // policy details form
  private _buildPolicyDetailForm(data): FormGroup {
    let policyDetailsForm = this.fb.group({
      ProductName: [''],
      Productcode: [''],
      PolicyType: [''],
      SumInsured: [],
      PolicyStartDate: [''],
      PolicyPeriod: [''],
      PolicyAmount: [],
    });
    return policyDetailsForm;
  }

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { whitespace: true };
  }

  //Init policy holder details formgroup
  private _buildPolicyHolderForm(data): FormGroup {
    let policyHolderForm = this.fb.group({
      FirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      MiddleName: [''],
      LastName: ['', [Validators.required, this.noWhitespaceValidator]],
      Mobile: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      Email: ['', [Validators.email, Validators.maxLength(60)]],
      Gender: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      PinCode: ['', [Validators.required]],
      Address1: ['', [Validators.required, this.noWhitespaceValidator]],
      Address2: ['', [Validators.required, this.noWhitespaceValidator]],
      CKYCId: ['', [Validators.required]],
      EmergencyContactName: ['', [Validators.required, this.noWhitespaceValidator]],
      EmergencyContactMobile: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      NomineeFirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeMiddleName: [''],
      NomineeLastName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeRelation: ['', [Validators.required]],
      NomineeAddress1: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeAddress2: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineePinCode: ['', [Validators.required]],
      KYCDocument: ['PAN', [Validators.required]],
      KYCDocumentNo: ['', [Validators.required, this.noWhitespaceValidator]],
      CriticalIllnessCovered: [false],
      RoomRentWaiver: [false],
      IffcoTokioPolicy: [false],
      IffcoTokioPolicyNo: [""],
    });
    return policyHolderForm;
  }

  //Build member details Formarray
  private _buildPolicyMemberDetailsForm(
    items: IffcoTokioPolicyMemberDetailsDto[] = []
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

  //Init member details formGroup
  private _initPolicyMemberDetailsForm(item: IffcoTokioPolicyMemberDetailsDto): FormGroup {
    let pDF = this.fb.group({
      FirstName: ['', [Validators.required, this.noWhitespaceValidator, Validators.maxLength(60)]],
      MiddleName: [''],
      LastName: ['', [Validators.required, this.noWhitespaceValidator, Validators.maxLength(60)]],
      Relation: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      Gender: ['', [Validators.required]],
      HeightCM: [0, [Validators.required, Validators.max(400)]],
      HeightInFeet: [],
      HeightInInch: [],
      WeightKG: [0, [Validators.required, Validators.max(300)]],
      Alcohol: [],
      AlcoholConsumptionPerWeek: [''],
      Smoke: [],
      SmokeCigarettePerDay: [''],
      Tobacco: [],
      TobaccoConsumptionPerWeek: [''],
      MedicalHistoryQuestions: this._buildMedicalHistoryQuestionsForm(),
    });
    if (item != null) {
      if (!item) {
        item = new IffcoTokioPolicyMemberDetailsDto();
      }

      if (item) {
        pDF.patchValue(item);
      }
    }
    return pDF;
  }

  //Build medical history question Formarray
  private _buildMedicalHistoryQuestionsForm(): FormArray {
    let formArray: FormArray = new FormArray([]);
    this.IllnessList.forEach((Ques) => {
      let item: MedicalHistoryQuestionsDto = new MedicalHistoryQuestionsDto();
      item.Qid = Ques.Id,
        item.Question = Ques.Description,
        formArray.push(this._initMedicalHistoryQuestionsForm(item));
    })

    return formArray;
  }

  //Init medical history Question form Group
  private _initMedicalHistoryQuestionsForm(item: MedicalHistoryQuestionsDto): FormGroup {
    let mHQ = this.fb.group({
      Qid: [item.Qid],
      Question: [item.Question],
      Answer: [],
    })


    return mHQ
  }

  //#endregion Private methods

}
