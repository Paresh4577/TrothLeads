import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MatStepper } from '@angular/material/stepper';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { dropdown } from '@config/dropdown.config';
import { Alert } from '@models/common';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { IBuyICICIHeathDto, BuyCICIHeathDto } from '@models/dtos/config/Icici/icicihealthDto';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { ICityPincodeDto } from '@models/dtos/core';
import { IciciService } from './icici.service';
import { MasterListService } from '@lib/services/master-list.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {
  IiciciKYCDto,
  iciciKYCDetailsDto,
  iciciKYCDto,
} from '@models/dtos/config/Kyc/Icici';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';
import { ROUTING_PATH } from '@config/routingPath.config';
import { UnitConversion } from '@config/UnitConversion';
import { IIllnessCodeDto, IPolicyMemberIciciDto, PolicyHolderICICIDto, PolicyIciciDto, PolicyMemberIciciDto } from '@models/dtos/config/Icici';
import { ValidationRegex } from '@config/validationRegex.config';

@Component({
  selector: 'gnx-icicihealth',
  templateUrl: './icicihealth.component.html',
  styleUrls: ['./icicihealth.component.scss'],
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
export class ICICIHealthComponent {
  pagetitle: string = 'ICICI Health Form';  // Page Main Header Title
  Policies: any; // Store Selected Policy From local storage
  OccupationList: any[]; // to store Occupation dropdownlist
  alerts: Alert[] = [];  // Display alert message 
  ProposerDetailsForm = new FormControl();
  step1 = new FormControl(); // Step Control For if any field invalid in this step not open other stepper
  Conversion: UnitConversion; // to store Height convert in CM

  pincodes$: Observable<ICityPincodeDto[]>; // pincode list observable
  destroy$: Subject<any>;

  KYC: iciciKYCDetailsDto; // KYC Dto
  buyICICIHeathDto: IBuyICICIHeathDto; // To store buyICICIHeathForm Value
  buyICICIHeathForm: FormGroup; // FormGroup for ICICI Heath Policy 

  DropdownMaster: dropdown;  // To get data for dropdown
  notAdult: boolean = false // Boolean for Check policy person is Adult or not

  IsKYC: boolean = false // use a flag for Proposal KYC 
  logo: string; // to store Policy Icon pathe
  maxBirthDate: Date;  // To validate policy person birthdate
  member: any[]; // To store policy person list like as icon,title
  InsuredPeople: number;  //count of Insured People
  ReqSumInsured: number; // to store policy sum insured
  PolicyType: string;  // to store Policy Type 
  PolicyPeriod: string;  // to store Policy Period like as 1,2,3, year 
  ProductName: string; // To store Policy plan name
  SumInsured: string; // to store policy sum insured
  Insurer: string; // to store Insurance campany insurare
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg; //Email Field Validate value by MAthing this pattern
  phoneNum: RegExp = ValidationRegex.phoneNumReg; //Mobile Number Field Validate value by MAthing this pattern
  AadharNum: RegExp = ValidationRegex.UIDNumValidationReg; //Aadhar/UID Field Validate value by MAthing this pattern
  PANNum: RegExp = ValidationRegex.PANNumValidationReg; //PAN number Field Validate value by MAthing this pattern
  memberDetailsAsArray;
  GenderList: any[];  // to store Gender Dropdown list
  RelationList: any[]; // to store Relation dropdownlist
  NomineeRelationList: any[]; // to store nominee Relation dropdownlist
  TotalPremium: number;

  IllnessCodes: IIllnessCodeDto[]; // to store Illnesslist from Service File (Static)

  True: boolean; // bolean for radio button value
  False: boolean; // bolean for radio button value
  flag = 0
  firstFlag =1 //check if data of buynow , member & health form is not empty
  insurerFlag = 1 //check if name of the insurer is icici or not

  //#region constructor

  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    private _IciciService: IciciService,
    public dialog: MatDialog,
    private _datePipe: DatePipe,
    private _router: Router,
    private _MasterListService: MasterListService, // number of people insured
  ) {
    this.destroy$ = new Subject();
    this.buyICICIHeathDto = new BuyCICIHeathDto();
    this.DropdownMaster = new dropdown();
    this.Conversion = new UnitConversion();
    this.True = true;
    this.False = false;
    // Set Max Birthdate from  Current date to lat 3 month
    this.maxBirthDate = new Date(Date.now());
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);

    // if any one of HealthQuateForm , buynow , member is not stored in localstorage than return back to Health form
    if(!localStorage.getItem('member') || !localStorage.getItem('buynow') || !localStorage.getItem('HealthQuateForm')) {
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.Health])
      this.firstFlag=0
      return ;
    } else {
      // if name of the insurer in buynow is not icici than return plan list to choose a plan
      let Insurer = JSON.parse(localStorage.getItem('buynow'))
      if (Insurer.Insurer.toLowerCase() != InsuranceCompanyName.ICICI) {
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
      this.ProductName = this.Policies.ProductName;
      this.SumInsured = this.Policies.SumInsured;
      this.PolicyPeriod = this.Policies.PolicyPeriodName;
      this.Insurer = this.Policies.InsurerName;
      this.TotalPremium = this.Policies.AddOnvalue;
      this.pagetitle = this.Policies.InsurerName;
    }


  }

  // #endregion constructor

   //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init
  
  ngOnInit(): void {
    // Set New Class  ICICI Object 
    this.buyICICIHeathDto.PolicyMemberDetails = new Array<IPolicyMemberIciciDto>();

    this.buyICICIHeathDto.PolicyHolder = new PolicyHolderICICIDto();
    this.buyICICIHeathForm = this._buildBuyNowForm(this.buyICICIHeathDto);



    if (this.firstFlag && this.insurerFlag) {

      this._fillMasterList();

      if (localStorage.getItem('HealthQuateForm')) {
        this.flag = 0
        this._fillDetails();
        this.buyICICIHeathForm = this._buildBuyNowForm(this.buyICICIHeathDto);
        this._bindData();
        this._onFormChanges();
      }

      this._nomineeDOBChange();
      this._AddOns ()

    }
  }

  get f() {
    return this.buyICICIHeathForm.controls;
  }

  get PolicyHolder() {
    return this.buyICICIHeathForm.get('PolicyHolder') as FormGroup;
  }

  get inf() {
    return this.buyICICIHeathForm.get('PolicyMemberDetails') as FormArray;
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

  // clear pincode ,city & state 
  public clear(name: string): void {
    this.buyICICIHeathForm.get(name).setValue("")
    if (name == 'PolicyHolder.PinCode') {
      this.buyICICIHeathForm.get('PolicyHolder.City').setValue("");
      this.buyICICIHeathForm.get('PolicyHolder.StateName').setValue("");
    }
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
    if (this.buyICICIHeathForm.get('PolicyHolder.PANNo').invalid && this.buyICICIHeathForm.get('PolicyHolder.UID').invalid) {
      this._alertservice.raiseErrorAlert('Enter either Valid PAN or Valid Aadhar');
      requiredId = false;
    }

    if (requiredId && this.buyICICIHeathForm.get('PolicyHolder.PANNo').valid) {
      let KYCdata = this._KYCData('PAN')
      this.KYC = new iciciKYCDetailsDto();

      // PAN KYC
      this._IciciService.KYC(KYCdata).subscribe((res) => {
        if (res.Success) {
          this._alertservice.raiseSuccessAlert(res.Message);
          if (res.Data.KycStatus == 'Success') {
            // Call Proposal
            this.IsKYC = true;
            this.KYC = res.Data;
            this.buyICICIHeathForm.get('PolicyHolder').patchValue({
              CKYCId: res.Data.KYCId,
              CorrelationId: res.Data.CorrelationId,
            });
            this.ProposerDetailsForm.reset();
            this._updateSelfData();
            stepper.next();
          }
        }
        else {
          if (this.buyICICIHeathForm.get('PolicyHolder.UID').value == null || this.buyICICIHeathForm.get('PolicyHolder.UID').value == '') {
            this._alertservice.raiseErrorAlert('Cannot validate PAN. Enter Aadhar for KYC.')
          }
          if (this.buyICICIHeathForm.get('PolicyHolder.UID').invalid && this.buyICICIHeathForm.get('PolicyHolder.UID').value != '') {
            this._alertservice.raiseErrorAlert('Cannot validate PAN. Enter Valid Aadhar for KYC.')
          }
          if (this.buyICICIHeathForm.get('PolicyHolder.UID').valid) {
            this._alertservice.raiseErrorAlert('Wait till Aadhar is being verified',true)
            let KYCdata = this._KYCData('UID')
            this._IciciService.KYC(KYCdata).subscribe((res) => {
              if (res.Success) {
                this._alertservice.raiseSuccessAlert(res.Message);
                if (res.Data.KycStatus == 'Success') {
                  // Call Proposal
                  this.IsKYC = true;
                  this.KYC = res.Data;
                  this.buyICICIHeathForm.get('PolicyHolder').patchValue({
                    CKYCId: res.Data.KYCId,
                    CorrelationId: res.Data.CorrelationId,
                  });
                  this.ProposerDetailsForm.reset();
                  this._updateSelfData();
                  stepper.next();
                }
              }
              else{
                stepper.previous();
                this._alertservice.raiseErrorAlert(res.Message);
              }
            })
          }
        }
      });
    }
    else if (requiredId && this.buyICICIHeathForm.get('PolicyHolder.UID').valid) {
      let KYCdata = this._KYCData('UID')
      this.KYC = new iciciKYCDetailsDto();
      this._IciciService.KYC(KYCdata).subscribe((res) => {
        if (res.Success) {
          this._alertservice.raiseSuccessAlert(res.Message);
          if (res.Data.KycStatus == 'Success') {
            // Call Proposal
            this.IsKYC = true;
            this.KYC = res.Data;
            this.buyICICIHeathForm.get('PolicyHolder').patchValue({
              CKYCId: res.Data.KYCId,
              CorrelationId: res.Data.CorrelationId,
            });
            this.ProposerDetailsForm.reset();
            this._updateSelfData();
            stepper.next();
          }
        }
        else {
          stepper.previous();
          if (this.buyICICIHeathForm.get('PolicyHolder.PANNo').value==null || this.buyICICIHeathForm.get('PolicyHolder.PANNo').value=='') {
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

  // back Button
  public backClick() {
    if(window.location.href.indexOf('mediclaim') != -1){
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.AddOns]);
    }
    else {
      this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.AddOns]);
    }
  }

  // Open Dialog box for PIN code Selection
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
          this.buyICICIHeathForm.get('PolicyHolder').patchValue({
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

  // Selected pincode value bind in form from auto complete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.buyICICIHeathForm.get('PolicyHolder').patchValue({
      City: event.option.value.CityName,
      StateName: event.option.value.StateName,
      PinCode: event.option.value.PinCode,
    });
    this.buyICICIHeathForm
      .get('PolicyHolder.PinCode')
      .patchValue(event.option.value.PinCode);
  }

  // proceed to payment Portol
  public ProceedtoPay() {
    this.ValidateInsuredMemberDetails();
    if (this.alerts.length > 0) {
      // Focus on First Invalid field
      if (this.alerts[0].FieldName) {
        (<any>this.alerts[0].FieldName).nativeElement.focus();
      }
      this._alertservice.raiseErrors(this.alerts);
      return;
    }

    if (this.KYC == undefined || this.KYC.KycStatus != 'Success') {
      this._alertservice.raiseErrorAlert('Please verify PAN');
      return;
    }

    this.buyICICIHeathForm.get('PolicyHolder').patchValue({
      DOB: this._datePipe.transform(this.buyICICIHeathForm.get('PolicyHolder.DOB').value, 'yyyy-MM-dd'),
      NomineeDOB: this._datePipe.transform(this.buyICICIHeathForm.get('PolicyHolder.NomineeDOB').value, 'yyyy-MM-dd')
    });
    this.inf.value.forEach(ele => {
      ele.DOB = this._datePipe.transform(ele.DOB, 'yyyy-MM-dd')

    })

    this._IciciService
      .CreateProposal(this.buyICICIHeathForm.value)
      .subscribe((res) => {
        if (res.Success) {
          this._alertservice.raiseSuccessAlert(res.Message)
          window.open(res.Data.PaymentURL, '_self');
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

  // validating step two invalid Formfield & Store invalid formfield message in alert array
  public ValidateInsuredMemberDetails() {
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

      if (this.inf.controls[index].value.Gender == '0') {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('Gender'),
          Message: `Enter ${ele.title} Gender`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.DOB == '' || this.inf.controls[index].value.DOB == null) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('DOB'),
          Message: `Enter ${ele.title} Date Of Birth`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.DOB != '') {
        if (this.inf.controls[index].value.DOB > this.maxBirthDate) {
          this.alerts.push({
            FieldName: this.inf.controls[index].get('DOB'),
            Message: `Enter valid ${ele.title} Date Of Birth`,
            CanDismiss: false,
            AutoClose: false,
          });
        }

      }

      if (this.inf.controls[index].value.Occupation == '' && SelectMember == 1) {
        this.alerts.push({
          FieldName: this.inf.controls[index].get('Occupation'),
          Message: `Enter ${ele.title} Occupation`,
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
      
      if (this.inf.controls[index].value.HeightInInch < 0 || this.inf.controls[index].value.HeightInInch =='') {
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

      // Validate Question Answer
      let MemberName = this.inf.controls[index].value.FirstName;
      if (MemberName == '') ele.title;
      this.IllnessCodes.forEach((ill, IllnessCodesIndex) => {
        if (this.inf.controls[index].get(ill.Code).value == null) {
          this.alerts.push({
            FieldName: this.inf.controls[index].get(ill.Code),
            Message: `${MemberName} - Enter Answer Of  ${IllnessCodesIndex + 1} `,
            CanDismiss: false,
            AutoClose: false,
          });
        }
      });
      // Validate Question Answer
    });
    if (this.alerts.length > 0 || !this.IsKYC) {
      this.step1.setErrors({ required: true });
      return this.step1;
    } else {
      this.step1.reset();
      return this.step1;
    }
  }

  // check step one invalid Formfield & Store invalid formfield message in alert array
  public StepOneSubmit(stepper): any {
    this.alerts = [];

    if (this.buyICICIHeathForm.get('PolicyHolder.FirstName').invalid) {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.FirstName'),
        Message: 'Enter your First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.buyICICIHeathForm.get('PolicyHolder.LastName').invalid) {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.LastName'),
        Message: 'Enter your Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // gender required
    if (this.buyICICIHeathForm.get('PolicyHolder.Gender').value == '') {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.Gender'),
        Message: 'Select your Gender',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.buyICICIHeathForm.get('PolicyHolder.DOB').value == '' || this.buyICICIHeathForm.get('PolicyHolder.DOB').value == null) {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.DOB'),
        Message: 'Enter Your Date of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.buyICICIHeathForm.get('PolicyHolder.DOB').value != '') {
      if (this.buyICICIHeathForm.get('PolicyHolder.DOB').value > this.maxBirthDate) {
        this.alerts.push({
          FieldName: this.buyICICIHeathForm.get('PolicyHolder.DOB'),
          Message: 'Enter Valid Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }

    }

    //Nominee Details

    if (
      this.buyICICIHeathForm.get('PolicyHolder.NomineeFirstName').invalid) {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.NomineeFirstName'),
        Message: 'Enter Nominee First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.buyICICIHeathForm.get('PolicyHolder.NomineeLastName').invalid) {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.NomineeLastName'),
        Message: 'Enter Nominee Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (
      this.buyICICIHeathForm.get('PolicyHolder.NomineeRelation').value == '') {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.NomineeRelation'),
        Message: 'Enter Relationship With Nominee',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.buyICICIHeathForm.get('PolicyHolder.NomineeDOB').value == '' || this.buyICICIHeathForm.get('PolicyHolder.NomineeDOB').value == null) {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.NomineeDOB'),
        Message: 'Enter Nominee Date of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.buyICICIHeathForm.get('PolicyHolder.NomineeDOB').value != '') {
      if (this.buyICICIHeathForm.get('PolicyHolder.NomineeDOB').value > this.maxBirthDate) {
        this.alerts.push({
          FieldName: this.buyICICIHeathForm.get('PolicyHolder.NomineeDOB'),
          Message: 'Enter Valid Nominee Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }

    }

    //Appointee Details

    if (this.notAdult == true) {
      if (
        this.buyICICIHeathForm.get('PolicyHolder.AppointeeFirstName').invalid) {
        this.alerts.push({
          FieldName: this.buyICICIHeathForm.get('PolicyHolder.AppointeeFirstName'),
          Message: 'Enter Appointee First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (
        this.buyICICIHeathForm.get('PolicyHolder.AppointeeLastName').invalid) {
        this.alerts.push({
          FieldName: this.buyICICIHeathForm.get('PolicyHolder.AppointeeLastName'),
          Message: 'Enter Appointee Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (
        this.buyICICIHeathForm.get('PolicyHolder.AppointeeRelation').value == ''
      ) {
        this.alerts.push({
          FieldName: this.buyICICIHeathForm.get('PolicyHolder.AppointeeRelation'),
          Message: 'Enter Relationship With Appointee',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.buyICICIHeathForm.get('PolicyHolder.AppointeeDOB').value == '' || this.buyICICIHeathForm.get('PolicyHolder.AppointeeDOB').value == null) {
        this.alerts.push({
          FieldName: this.buyICICIHeathForm.get('PolicyHolder.AppointeeDOB'),
          Message: 'Enter Appointee Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }


      if (this.buyICICIHeathForm.get('PolicyHolder.AppointeeDOB').value != '') {
        if (this.buyICICIHeathForm.get('PolicyHolder.AppointeeDOB').value > this.maxBirthDate) {
          this.alerts.push({
            FieldName: this.buyICICIHeathForm.get('PolicyHolder.AppointeeDOB'),
            Message: 'Enter valid Appointee Date of Birth',
            CanDismiss: false,
            AutoClose: false,
          });
        }

      }
    }

    //Address
    if (this.buyICICIHeathForm.get('PolicyHolder.Address').invalid) {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.Address'),
        Message: 'Enter Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.buyICICIHeathForm.get('PolicyHolder.PinCode').value == '') {
      this.alerts.push({
        Message: 'Enter PIN Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.buyICICIHeathForm.get('PolicyHolder.City').value == '') {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.City'),
        Message: 'Enter City Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.buyICICIHeathForm.get('PolicyHolder.StateName').value == '') {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.StateName'),
        Message: 'Enter State Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    //Address

    // Contact Details

    if (this.buyICICIHeathForm.get('PolicyHolder.Mobile').value == '' || this.buyICICIHeathForm.get('PolicyHolder.Mobile').value == null) {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.Mobile'),
        Message: 'Enter Your Mobile Number',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.buyICICIHeathForm.get('PolicyHolder.Mobile').value != '' && this.buyICICIHeathForm.get('PolicyHolder.Mobile').value != null) {
      if (!this.phoneNum.test(this.buyICICIHeathForm.get('PolicyHolder.Mobile').value)) {
        this.alerts.push({
          FieldName: this.buyICICIHeathForm.get('PolicyHolder.Mobile'),
          Message: 'Mobile Number must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }


    if (this.buyICICIHeathForm.get('PolicyHolder.Email').value == '' || this.buyICICIHeathForm.get('PolicyHolder.Email').value == null) {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.Email'),
        Message: 'Enter Your Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.buyICICIHeathForm.get('PolicyHolder.Email').value != '') {
      if (
        !this.emailValidationReg.test(
          this.buyICICIHeathForm.get('PolicyHolder.Email').value
        )
      ) {
        this.alerts.push({
          FieldName: this.buyICICIHeathForm.get('PolicyHolder.Email'),
          Message: 'Enter Valid Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
    // Contact Details

    //Income
    if (
      this.buyICICIHeathForm.get('PolicyHolder.GrossMonthlyIncome').invalid) {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.GrossMonthlyIncome'),
        Message: 'Enter Gross Monthly Income',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    // KYC

    if (this.buyICICIHeathForm.get('PolicyHolder.PANNo').invalid && this.buyICICIHeathForm.get('PolicyHolder.UID').invalid) {
      this.alerts.push({
        FieldName: this.buyICICIHeathForm.get('PolicyHolder.PANNo'),
        Message: 'Enter either Your PAN Or Aadhar',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if(this.buyICICIHeathForm.get('PolicyHolder.PANNo').value != ''){
      if(!this.PANNum.test(this.buyICICIHeathForm.get('PolicyHolder.PANNo').value)){
        this.alerts.push({
          FieldName: this.buyICICIHeathForm.get('PolicyHolder.PANNo'),
          Message: 'Enter Valid PAN',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if(this.buyICICIHeathForm.get('PolicyHolder.UID').value != ''){
      if(!this.AadharNum.test(this.buyICICIHeathForm.get('PolicyHolder.UID').value)){
        this.alerts.push({
          FieldName: this.buyICICIHeathForm.get('PolicyHolder.UID'),
          Message: 'Enter Valid Aadhar',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    // KYC

    if (this.alerts.length > 0 || !this.KYC?.KYCId) {
      this.ProposerDetailsForm.setErrors({ required: true });
      return this.ProposerDetailsForm;
    } else {
      this.ProposerDetailsForm.reset();
      return this.ProposerDetailsForm;
    }
  }

  //Display alert message for step One
  public submitStep(stepper: MatStepper) {
    if (this.alerts.length > 0) {
      
      // Focus on First Invalid field
      if (this.alerts[0].FieldName) {
        (<any>this.alerts[0].FieldName).nativeElement.focus();
      }
      this._alertservice.raiseErrors(this.alerts);
      return;
    }

    this.CheckKYC(stepper);
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
  public radioLabel(index:number,label:string, value:boolean) {

    this.inf.controls[index].get(label).patchValue(
      value
    )

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

  // AddOns details
  /**
   * the value of AddOn that are selected on Addon page will be patched here. 
   */
  private _AddOns () {
    let addOn
    if (localStorage.getItem('AddOns')) {
      addOn=JSON.parse(localStorage.getItem('AddOns'))
    }

    this.inf.controls.forEach((data,index) => {
      data.patchValue({
        AddOn1:addOn.AddOn1,        
        AddOn13:addOn.AddOn13,
        AddOn12: addOn.AddOn12,        
        AddOn2: addOn.AddOn2,
        AddOn85: addOn.AddOn85,
        AddOn86: addOn.AddOn86,
        AddOn89: addOn.AddOn89,
      })
      if (data.get('Relation').value == 'Spouse') {
        data.patchValue({
          AddOn3:addOn.AddOn3,
          AddOn4: addOn.AddOn4,
          AddOn5: addOn.AddOn5,
        })
      }
      if (data.get('Relation').value == 'Son' || data.get('Relation').value == 'Daughter') {
        data.patchValue({
          AddOn8: addOn.AddOn8
        })
      }
    })
  }


  // KYC data
  /**
   * For KYC , either PanNo. or UID (Aadhar card number) is required .
   * if PanNo. is given than details of PAN Crad will be forwarded and if UID is provided than it will be forwarded.
   * In case both are given than PanNo. will be prioritize and its data will be carry forward for KYC .
   */
  private _KYCData(DocType:string) {
    let DocumentKYC: IiciciKYCDto = new iciciKYCDto();
    DocumentKYC.DOB = this._datePipe.transform(this.buyICICIHeathForm.get('PolicyHolder.DOB').value,'yyyy-MM-dd');
    if (DocType == 'PAN') {
      DocumentKYC.DocNumber = this.buyICICIHeathForm.get('PolicyHolder.PANNo').value.trim();
      DocumentKYC.DocTypeCode = 'PAN';
    }
    else if (DocType == 'UID') {
      DocumentKYC.DocNumber = this.buyICICIHeathForm.get('PolicyHolder.UID').value.trim();
      DocumentKYC.DocTypeCode = 'UID';
    }
    DocumentKYC.Gender = this.buyICICIHeathForm.get('PolicyHolder.Gender').value;
    DocumentKYC.ProductCode = this.buyICICIHeathDto.PolicyDetail.Productcode;
    DocumentKYC.TransactionNo = this.Policies.QuoteNo;
    DocumentKYC.PassportFileNumber = '';
    DocumentKYC.Name = this.buyICICIHeathForm.get('PolicyHolder.FirstName').value.trim() + ' ' + this.buyICICIHeathForm.get('PolicyHolder.LastName').value.trim();

    return DocumentKYC

  }

  // change in Nominee DOB
  private _nomineeDOBChange() {
    this.buyICICIHeathForm.get('PolicyHolder.NomineeDOB').valueChanges.subscribe(() => {
      this._ageOfNominee();
    })
  }

  //  age of Nominee
  /**
   * Set value in adult  Nominee is  Adult or not
   */
  private _ageOfNominee() {
    let day = new Date();

    let difference = moment(day).diff(this.buyICICIHeathForm.get('PolicyHolder.NomineeDOB').value, 'year')
    if (difference < 18) {
      this.notAdult = true
    }
    else {
      this.notAdult = false
    }

  }

  // change in pincode
  private _onFormChanges() {
    this.buyICICIHeathForm
      .get('PolicyHolder.PinCode')
      .valueChanges.subscribe((val) => {
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
      });
  }

  // bind data base on pincode
  private _bindData() {
    // bind data base on pincode
    this._MasterListService
      .getFilteredPincodeListWithDetails(
        this.buyICICIHeathDto.PolicyHolder.PinCode
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.buyICICIHeathForm.get('PolicyHolder').patchValue({
              PinCode: res.Data.Items[0].PinCode,
              City: res.Data.Items[0].CityName,
              StateName: res.Data.Items[0].StateName,
              StateCode: res.Data.Items[0].StateCode,
              CountryCode: res.Data.Items[0].CountryCode,
            });

            this.buyICICIHeathDto.PolicyHolder.City =
              res.Data.Items[0].CityName;
            this.buyICICIHeathDto.PolicyHolder.StateCode =
              res.Data.Items[0].StateCode;
            this.buyICICIHeathDto.PolicyHolder.StateName =
              res.Data.Items[0].StateName;
            this.buyICICIHeathDto.PolicyHolder.CountryCode =
              res.Data.Items[0].CountryCode;
          }
        }
      });
  }

  // update data of self
  /**
   * Self is includ in insured person then this data bimd in Policy holder Details
   */
  private _updateSelfData() {
    for (let j = 0; j < this.member.length; j++) {
      switch (this.member[j].title) {
        case 'Self':
          let i = this.buyICICIHeathDto.PolicyMemberDetails.findIndex(
            (f) => f.Relation === "Self"
          );

          if (i >= 0) {
            this.buyICICIHeathDto.PolicyMemberDetails[i].FirstName = this.buyICICIHeathForm.get("PolicyHolder.FirstName").getRawValue();
            this.inf.controls[i].get("FirstName").patchValue(this.buyICICIHeathForm.get("PolicyHolder.FirstName").getRawValue());

            this.buyICICIHeathDto.PolicyMemberDetails[i].MiddleName = this.buyICICIHeathForm.get("PolicyHolder.MiddleName").getRawValue();
            this.inf.controls[i].get("MiddleName").patchValue(this.buyICICIHeathForm.get("PolicyHolder.MiddleName").getRawValue());

            this.buyICICIHeathDto.PolicyMemberDetails[i].LastName = this.buyICICIHeathForm.get("PolicyHolder.LastName").getRawValue();
            this.inf.controls[i].get("LastName").patchValue(this.buyICICIHeathForm.get("PolicyHolder.LastName").getRawValue());
          }
          break;
      }
    }
  }

  /**
   * Policy member data fill from Health Quate Form
   */
  // fill details from health form
  private _fillDetails() {
    let Data = JSON.parse(localStorage.getItem('HealthQuateForm'));
    if (Data) {
      this.ReqSumInsured = Number(Data.SumInsured);
      //PolicyHolder
      if (Data.SelfCoverRequired == true) {
        let FullName: string[] = Data.Name.trim().replace(/ +/g, ' ').split(' ');
        if (FullName.length > 0)
          this.buyICICIHeathDto.PolicyHolder.FirstName = FullName[0].trim();
        if (FullName.length > 1) {
          if (FullName.length > 2) {
            this.buyICICIHeathDto.PolicyHolder.MiddleName = FullName[1].trim();
            this.buyICICIHeathDto.PolicyHolder.LastName = FullName[2].trim();
          } else this.buyICICIHeathDto.PolicyHolder.LastName = FullName[1].trim();
        }
        this.buyICICIHeathDto.PolicyHolder.Gender = Data.SelfGender;
        this.buyICICIHeathDto.PolicyHolder.DOB = Data.SelfDOB;
        this.flag = 1
      }

      this.buyICICIHeathDto.TransactionNo = this.Policies.QuoteNo;
      this.buyICICIHeathDto.PolicyHolder.Mobile = Data.Mobile;
      this.buyICICIHeathDto.PolicyHolder.Email = Data.EmailId;
      this.buyICICIHeathDto.PolicyHolder.PinCode = Data.PinCode;


      //fill member details

      for (let j = 0; j < this.member.length; j++) {
        let PolicyMember: PolicyMemberIciciDto = new PolicyMemberIciciDto();
        switch (this.member[j].title) {
          case 'Self':
            const Names = Data.Name.trim().replace(/ +/g, ' ').split(' ');
            if (Names.length > 0) PolicyMember.FirstName = Names[0].trim();
            if (Names.length > 1) {
              if (Names.length > 2) {
                PolicyMember.MiddleName = Names[1];
                PolicyMember.LastName = Names[2].trim();
              } else PolicyMember.LastName = Names[1].trim();
            }
            PolicyMember.Occupation = '';
            PolicyMember.Relation = 'Self';
            PolicyMember.DOB = Data.SelfDOB;
            PolicyMember.Gender = Data.SelfGender;
            break;
          case 'Spouse':
            const Spousename = Data.SpouseName.trim().replace(/ +/g, ' ').split(' ');
            if (Spousename.length > 0)
              PolicyMember.FirstName = Spousename[0].trim();
            if (Spousename.length > 1) {
              if (Spousename.length > 2) {
                PolicyMember.LastName = Spousename[2].trim();
              } else PolicyMember.LastName = Spousename[1].trim();
            }
            PolicyMember.Occupation = '';
            PolicyMember.Relation = 'Spouse';
            PolicyMember.DOB = Data.SpouseDOB;
            PolicyMember.Gender = Data.SpouseGender;

            break;
          case 'Daughter':
          case 'Daughter1':
            const Child1name = Data.Child1Name.trim().replace(/ +/g, ' ').split(' ');
            if (Child1name.length > 0)
              PolicyMember.FirstName = Child1name[0].trim();
            if (Child1name.length > 1) {
              if (Child1name.length > 2) {
                PolicyMember.LastName = Child1name[2].trim();
              } else PolicyMember.LastName = Child1name[1].trim();
            }
            PolicyMember.Occupation = '';
            PolicyMember.Relation = 'Daughter';
            PolicyMember.DOB = Data.Child1DOB;
            PolicyMember.Gender = 'Female';
            break;
          case 'Daughter2':
            const Child2name = Data.Child2Name.trim().replace(/ +/g, ' ').split(' ');
            if (Child2name.length > 0)
              PolicyMember.FirstName = Child2name[0].trim();
            if (Child2name.length > 1) {
              if (Child2name.length > 2) {
                PolicyMember.LastName = Child2name[2].trim();
              } else PolicyMember.LastName = Child2name[1].trim();
            }
            PolicyMember.Occupation = '';
            PolicyMember.Relation = 'Daughter';
            PolicyMember.DOB = Data.Child2DOB;
            PolicyMember.Gender = 'Female';
            break;
          case 'Daughter3':
            const Child3name = Data.Child3Name.trim().replace(/ +/g, ' ').split(' ');
            if (Child3name.length > 0)
              PolicyMember.FirstName = Child3name[0].trim();
            if (Child3name.length > 1) {
              if (Child3name.length > 2) {
                PolicyMember.LastName = Child3name[2].trim();
              } else PolicyMember.LastName = Child3name[1].trim();
            }
            PolicyMember.Occupation = '';
            PolicyMember.Relation = 'Daughter';
            PolicyMember.DOB = Data.Child3DOB;
            PolicyMember.Gender = 'Female';
            break;

          case 'Son':
          case 'Son1':
            const Child4name = Data.Child4Name.trim().replace(/ +/g, ' ').split(' ');
            if (Child4name.length > 0)
              PolicyMember.FirstName = Child4name[0].trim();
            if (Child4name.length > 1) {
              if (Child4name.length > 2) {
                PolicyMember.LastName = Child4name[2].trim();
              } else PolicyMember.LastName = Child4name[1].trim();
            }
            PolicyMember.Occupation = '';
            PolicyMember.Relation = 'Son';
            PolicyMember.DOB = Data.Child4DOB;
            PolicyMember.Gender = 'Male';
            break;
          case 'Son2':
            const Child5name = Data.Child5Name.trim().replace(/ +/g, ' ').split(' ');
            if (Child5name.length > 0)
              PolicyMember.FirstName = Child5name[0].trim();
            if (Child5name.length > 1) {
              if (Child5name.length > 2) {
                PolicyMember.LastName = Child5name[2].trim();
              } else PolicyMember.LastName = Child5name[1].trim();
            }
            PolicyMember.Occupation = '';
            PolicyMember.Relation = 'Son';
            PolicyMember.DOB = Data.Child5DOB;
            PolicyMember.Gender = 'Male';
            break;
          case 'Son3':
            const Child6name = Data.Child6Name.trim().replace(/ +/g, ' ').split(' ');
            if (Child6name.length > 0)
              PolicyMember.FirstName = Child6name[0].trim();
            if (Child6name.length > 1) {
              if (Child6name.length > 2) {
                PolicyMember.LastName = Child6name[2].trim();
              } else PolicyMember.LastName = Child6name[1].trim();
            }
            PolicyMember.Occupation = '';
            PolicyMember.Relation = 'Son';
            PolicyMember.DOB = Data.Child6DOB;
            PolicyMember.Gender = 'Male';
            break;
          case 'Mother':
            const Mothername = Data.MotherName.trim().replace(/ +/g, ' ').split(' ');
            if (Mothername.length > 0)
              PolicyMember.FirstName = Mothername[0].trim();
            if (Mothername.length > 1) {
              if (Mothername.length > 2) {
                PolicyMember.LastName = Mothername[2].trim();
              } else PolicyMember.LastName = Mothername[1].trim();
            }
            PolicyMember.Occupation = '';
            PolicyMember.Relation = 'Mother';
            PolicyMember.DOB = Data.MotherDOB;
            PolicyMember.Gender = 'Female';
            break;
          case 'Father':
            const Fathername = Data.FatherName.trim().replace(/ +/g, ' ').split(' ');
            if (Fathername.length > 0)
              PolicyMember.FirstName = Fathername[0].trim();
            if (Fathername.length > 1) {
              if (Fathername.length > 2) {
                PolicyMember.LastName = Fathername[2].trim();
              } else PolicyMember.LastName = Fathername[1].trim();
            }
            PolicyMember.Occupation = '';
            PolicyMember.Relation = 'Father';
            PolicyMember.DOB = Data.FatherDOB;
            PolicyMember.Gender = 'Male';
            break;

          default:
            break;
        }

        this.buyICICIHeathDto.PolicyMemberDetails.push(PolicyMember);
      }

      // policy details
      this.buyICICIHeathDto.PolicyDetail = new PolicyIciciDto();
      this.buyICICIHeathDto.PolicyDetail.Productcode =
        this.Policies.ProductCode;
      this.buyICICIHeathDto.PolicyDetail.ProductName =
        this.Policies.ProductName;
      this.buyICICIHeathDto.PolicyDetail.SubProductName =
        this.Policies.SubProductName;
      this.buyICICIHeathDto.PolicyDetail.SubProductCode =
        this.Policies.SubProductCode;
      this.buyICICIHeathDto.PolicyDetail.SumInsured = this.Policies.SumInsured;
      this.buyICICIHeathDto.PolicyDetail.PolicyPeriod =
        this.Policies.PolicyPeriod;
      this.buyICICIHeathDto.PolicyDetail.PolicyAmount =
        this.Policies.AddOnvalue;
      this.buyICICIHeathDto.PolicyDetail.PaymentMode = 'Online';
      this.buyICICIHeathDto.PolicyDetail.CoPay = this.Policies.CoPay;

      if (Data.PolicyType == 'MultiIndividual'){
        this.PolicyType = 'Individual';
      }
      else if (Data.PolicyType == 'FamilyFloater'){
        this.PolicyType = 'Family Floater';
      }
      else this.PolicyType = Data.PolicyType;
    }
  }

  // dropdown list
  // Get Insurance helper dropdown master data
  private _fillMasterList() {
    this.GenderList = [];
    // fill gender list
    this._MasterListService.getCompanyWiseList('ICICI', 'gender').subscribe((res) => {
      if (res.Success) {
        this.GenderList = res.Data.Items;
      }
    });
    // RelationList
    this.RelationList = [];
    this._MasterListService.getCompanyWiseList('ICICI', 'relation').subscribe((res) => {
      if (res.Success) {
        this.RelationList = res.Data.Items;
      }
    });
    // NomineeRelationList
    this.NomineeRelationList = [];
    this._MasterListService.getCompanyWiseList('ICICI', 'NomineeRelation').subscribe((res) => {
      if (res.Success) {
        this.NomineeRelationList = res.Data.Items;
      }
    });

    this.IllnessCodes = this._IciciService.getIIllnessCodes();

    //Occupation
    this.OccupationList = [];
    this._MasterListService.getCompanyWiseList('ICICI', 'icicioccupation').subscribe((res) => {
      if (res.Success) {
        this.OccupationList = res.Data.Items;
      }
    });
  }

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  // INIT main form
  private _buildBuyNowForm(data: IBuyICICIHeathDto) {
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

  //init policy details form
  private _buildPolicyDetailForm(data): FormGroup {
    let policyDetailsForm = this.fb.group({
      Productcode: [''],
      ProductName: [''],
      SubProductCode: [''],
      SubProductName: [''],
      SumInsured: [0],
      PolicyStartDate: [''],
      PolicyPeriod: [''],
      PaymentMode: [''],
      PolicyAmount: [''],
      CoPay:[0],
    });
    if (data) {
      policyDetailsForm.patchValue(data);
    }
    return policyDetailsForm;
  }

  //init policy holder form
  private _buildPolicyHolderForm(data): FormGroup {
    let policyHolderForm = this.fb.group({
      Mobile: ['',[Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      Email: ['', [Validators.email,Validators.maxLength(60)]],
      FirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      MiddleName: [''],
      LastName: ['', [Validators.required, this.noWhitespaceValidator]],
      DOB: ['', [Validators.required]],
      NomineeFirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeMiddleName: [''],
      NomineeLastName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeRelation: [''],
      NomineeDOB: [''],
      AppointeeFirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      AppointeeMiddleName: [''],
      AppointeeLastName: ['', [Validators.required, this.noWhitespaceValidator]],
      AppointeeRelation: [''],
      AppointeeDOB: [''],
      GrossMonthlyIncome: [0, [Validators.required, Validators.min(1)]],
      Gender: [0, [Validators.required]],
      Address: ['', [Validators.required, this.noWhitespaceValidator]],
      Address1: [''],
      CountryCode: [0],
      StateCode: [1],
      StateName: [''],
      PinCode: ['', [Validators.required]],
      City: ['', [Validators.required]],
      CKYCId: [''],
      EKYCId: [''],
      PANNo: ['', [Validators.required, this.noWhitespaceValidator]],
      UID: ['', [this.noWhitespaceValidator]],
      CorrelationId: [''],
    });
    return policyHolderForm;
  }

  //Build policy  member Details array
  private _buildPolicyMemberDetailsForm(
    items: IPolicyMemberIciciDto[] = []
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

  //Init policy  member Details form
  private _initPolicyMemberDetailsForm(item: IPolicyMemberIciciDto): FormGroup {
    let pDF = this.fb.group({
      FirstName: ['', [Validators.required, this.noWhitespaceValidator,Validators.maxLength(60)]],
      MiddleName: [''],
      LastName: ['', [Validators.required, this.noWhitespaceValidator,Validators.maxLength(60)]],
      Relation: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      Gender: ['', [Validators.required]],
      HeightCM: [0, [Validators.required, Validators.min(0), Validators.max(400)]],
      HeightInFeet: [0],
      HeightInInch: [0],
      WeightKG: [0, [Validators.required, Validators.min(0), Validators.max(300)]],
      Occupation: [''],
      IllnessCode13: [null],
      IllnessCode14: [null],
      IllnessCode15: [null],
      IllnessCode16: [null],
      IllnessCode17: [null],
      IllnessCode18: [null],
      IllnessCode19: [null],
      IllnessCode20: [null],
      IllnessCode21: [null],
      IllnessCode22: [null],
      IllnessCode23: [null],
      IllnessCode24: [null],
      IllnessCode25: [null],
      IllnessCode26: [null],
      IllnessCode27: [null],
      IllnessCode28: [null],
      IllnessCode29: [null],
      IllnessCode30: [null],
      IllnessCode31: [null],
      IllnessCode32: [null],
      IllnessCode33: [null],
      AddOn1: [false],
      AddOn3: [false],
      AddOn9: [false],
      AddOn10: [false],
      AddOn11: [false],
      AddOn12: [false],
      AddOn5: [false],
      AddOn6: [false],
      AddOn7: [false],
      AddOn8: [false],
      AddOn4: [false],
      AddOn2: [false],
      AddOn13: [false],
      AddOn1SI: [0],
      AddOn2SI: [0],
      AddOn3SI: [0],
      AddOn4SI: [0],
      AddOn5SI: [0],
      AddOn6SI: [0],
      AddOn7SI: [0],
      AddOn8SI: [0],
      AddOn9SI: [0],
      AddOn10SI: [0],
      AddOn11SI: [0],
      AddOn12SI: [0],
      AddOn13SI: [0],
      AddOn85: [false],
      AddOn86: [false],
      AddOn89: [false],
    });
    if (item != null) {
      if (!item) {
        item = new PolicyMemberIciciDto();
      }

      if (item) {
        pDF.patchValue(item);
      }
    }
    return pDF;
  }
   //#endregion Private methods
}
