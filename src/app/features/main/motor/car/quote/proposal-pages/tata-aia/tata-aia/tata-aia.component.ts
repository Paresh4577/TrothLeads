import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { dropdown } from '@config/dropdown.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert } from '@models/common';
import { ICityPincodeDto } from '@models/dtos/core';
import * as moment from 'moment';
import { Observable, Subject, takeUntil, switchMap, of } from 'rxjs';
import { QuoteService } from 'src/app/features/main/health/quote/quote.service';
import { MotorCustomerTypeEnum } from 'src/app/shared/enums/MotorCustomerType.enum';
import { ITataAIACarDetailDto, ITataAIAMotor, ITataAIAMotorCustomerDetaildto, ITataAIAMotorPolicyDetailDto, TataAIAMotor } from '@models/dtos/motor-insurance/TataAIA';
import { TataAiaService } from '../tata-aia.service';
import { ITataAIAkycdto, TataAIAkycdto } from '@models/dtos/motor-insurance/TataAIA/TataAIAkycdto';
import { KYCPopUpComponent } from '../kycpop-up/kycpop-up.component';
import { MotorBusinessTypeEnum } from 'src/app/shared/enums/MotorBusinessType.enum';

@Component({
  selector: 'gnx-tata-aia',
  templateUrl: './tata-aia.component.html',
  styleUrls: ['./tata-aia.component.scss'],
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
export class TataAiaComponent {
 // #region public variables

  //String
  pagetitle: string = 'Tata AIA Motor';
  Icon: string;
  TransactionNo: string;

  //Formgroup & DTO
  TataAIAProposal: ITataAIAMotor;
  TataAIAProposalForm: FormGroup;

  // formControl
  step1 = new FormControl();

  //boolean
  NomineeIsAdult = true;

  // date
  maxDate: Date;

  // chassis number : maximum and minimum length
  MinChassisNo: number = 10;
  MaxChassisNo: number = 17;

  // alerts
  alerts: Alert[] = [];

  // list
  VehicleDetails;
  GenderList: any[];
  NomineeRelationList: any[];
  AppointeeRelationList: any[];
  InsurerList: any[];
  MaritalList: any[];
  OccupationList: any[];
  FinancierNameList: any[];

  DropdownMaster: dropdown;

  pincodes$: Observable<ICityPincodeDto[]>;
  destroy$: Subject<any>;

  PANNum: RegExp = ValidationRegex.PANNumValidationReg;

  //#region constructor

  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    private _router: Router,
    private _MasterListService: MasterListService, //dropDown Value as per company name
    public dialog: MatDialog,
    private _datePipe: DatePipe, //to change the format of date
    private _quoteService: QuoteService,
    private _tataAIAMotorService: TataAiaService
  ) {
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();

    this.TataAIAProposal = new TataAIAMotor();

    this.maxDate = new Date();

    if (localStorage.getItem('motorBuyPolicy')) {
      let motorBuyPolicyDetails = JSON.parse(
        localStorage.getItem('motorBuyPolicy')
      );
      this.Icon = motorBuyPolicyDetails.IconURL;
      this.TransactionNo = motorBuyPolicyDetails.TransactionNo;
      this.TataAIAProposal.InsurerRequest =
        motorBuyPolicyDetails.InsurerRequest;
    }
    this._SetCarAndPolicyDataFromProposalForm(); // Call the function for bind data in form
  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this._fillMasterList();

    // main form init
    this.TataAIAProposalForm = this._buildTataAIAMotorProposalForm(
      this.TataAIAProposal
    );

    // this.TataAIAProposalForm.get('CustomerDetail').patchValue({
    //   CustomerType: MotorCustomerTypeEnum.Individual,
    // });

    if (this.VehicleDetails.Financed && this.VehicleDetails.Financer != '') {
      /**
       * This data come fron Vehicle details
       * Bind Data Of Vehicle  Financier Code
       */

      let Financer = this.FinancierNameList.find(
        (Financer) => Financer.Name == this.VehicleDetails.Financer
      );

      if (Financer) {
        this.TataAIAProposalForm.get('CustomerDetail').patchValue(
          {
            FinancierName: Financer.Name,
            FinancierCode: Financer.Code,
          },
          { emitEvent: false }
        );
      }
    }

    this._onFormChanges();
    this._changeInNomineeAge();
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
    return this.TataAIAProposalForm.controls;
  }

  get MotorCustomerType() {
    return MotorCustomerTypeEnum;
  }

  public createProposal() {

    this._dateFormat()

    let errorMessage: Alert[] = [];
    errorMessage = this._stepTwoValidation();
    if (errorMessage.length > 0) {
      this._alertservice.raiseErrors(errorMessage);
      return;
    }


    this._tataAIAMotorService
      .createProposal(this.TataAIAProposalForm.value)
      .subscribe((res) => {
        if (res.Success) {
          this._alertservice.raiseSuccessAlert(res.Message);
          // KYC Popup
          this.KYCPopUp(res.Data.TransactionNo);
        } else {
          if (res.Alerts && res.Alerts?.length > 0) {
            this._alertservice.raiseErrors(res.Alerts)
          } else {
            this._alertservice.raiseErrorAlert(res.Message)
          }

          // for Break-In Policy
          if(res.ResCode == 1730){
            this._router.navigate([ROUTING_PATH.SideBar.MotorPoliciesList]);
          }
        }
      });
  }

  public KYCPopUp(TransactionNo: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '20vw';
    dialogConfig.minWidth = '20vw';
    dialogConfig.minHeight = 'fit-content';
    dialogConfig.maxHeight = '45vh';
    
    dialogConfig.data = {
      title: 'KYC',
      kycdetails: this._kycData(TransactionNo),
      ispopup: true,
    };

    const dialogRef = this.dialog.open(KYCPopUpComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        // Payment
        this._tataAIAMotorService.Payment(TransactionNo).subscribe((res) => {
          if (res.Success) {
            this._quoteService.openWindowWithPost(res.Data.PaymentURL, null);
          } else {
            this._alertservice.raiseErrorAlert(res.Message);
          }
        });
      }
    });
  }

  // step 1 validation
  public stepOneValidation() {
    this.alerts = [];
    if (
      this.TataAIAProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Corporate
    ) {
      if (this.TataAIAProposalForm.get('CustomerDetail.CompanyName').invalid) {
        this.alerts.push({
          Message: 'Enter Company Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.TataAIAProposalForm.get('CustomerDetail.DOB').invalid) {
        this.alerts.push({
          Message: 'Enter Company Start Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }

    } else if (
      this.TataAIAProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Individual
    ) {
      if (
        this.TataAIAProposalForm.get('CustomerDetail.Salutation').invalid ||
        this.TataAIAProposalForm.get('CustomerDetail.Salutation').value == 0
      ) {
        this.alerts.push({
          Message: 'Select Title',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.TataAIAProposalForm.get('CustomerDetail.FirstName').invalid) {
        this.alerts.push({
          Message: 'Enter First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.TataAIAProposalForm.get('CustomerDetail.LastName').invalid) {
        this.alerts.push({
          Message: 'Enter Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.TataAIAProposalForm.get('CustomerDetail.Gender').invalid) {
        this.alerts.push({
          Message: 'Select Gender',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.TataAIAProposalForm.get('CustomerDetail.DOB').invalid) {
        this.alerts.push({
          Message: 'Enter Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (
        this.TataAIAProposalForm.get('CustomerDetail.Occupation').value == '' ||
        this.TataAIAProposalForm.get('CustomerDetail.Occupation').value == '0'
      ) {
        this.alerts.push({
          Message: 'Select Occupation',
          CanDismiss: false,
          AutoClose: false,
        });
      } else {
        if (
          this.TataAIAProposalForm.get('CustomerDetail.Occupation').value ==
          'OTHER' &&
          this.TataAIAProposalForm.get('CustomerDetail.OtherOccupation')
            .value == ''
        ) {
          this.alerts.push({
            Message: 'Enter Other Occupation',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
    }

    if (this.TataAIAProposalForm.get('CustomerDetail.PanNo').value != '') {
      if (!this.PANNum.test(this.TataAIAProposalForm.get('CustomerDetail.PanNo').value)) {
        this.alerts.push({
          Message: 'Enter Valid PAN',
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

  // step 1 error message
  public stepOneError(stepper) {
    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
      return;
    } else {
      stepper.next();
    }
    // // after step 1 is validated KYC is done
    // this._checkKYC(stepper)
  }

  // Pincode autocomplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.TataAIAProposalForm.get('CustomerDetail').patchValue({
      PinCode: event.option.value.PinCode,
    });
  }

  // pop up for pincode
  public openDiologPincode(type: string, title: string) {
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
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'Pincode') {
          this.TataAIAProposalForm.get('CustomerDetail').patchValue({
            PinCode: result.PinCode,
          });
        }
      }
    });
  }

  // clear pincode
  public clear(name: string): void {
    this.TataAIAProposalForm.get(name).setValue('');
  }

  //   /**
  //  * According to the change in value of mat-slide-toggle , value of CustomerType is updated
  //  * @param event : to identify change in the value of mat-slide-toggle
  //  */
  //   public changeInCustomerType(event) {
  //     if (event.checked) {
  //       this.TataAIAProposalForm.get('CustomerDetail').patchValue({
  //         CustomerType: MotorCustomerTypeEnum.Corporate,
  //       });
  //     } else {
  //       this.TataAIAProposalForm.get('CustomerDetail').patchValue({
  //         CustomerType: MotorCustomerTypeEnum.Individual,
  //       });
  //     }
  //   }

  // back Button
  public backClick() {
    this._router.navigate([ROUTING_PATH.MotorCarQuote.Plan]);
  }

  //#endregion public-methods
  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _kycData(TransactionNo: string) {

    let KYCdata: ITataAIAkycdto = new TataAIAkycdto();
    if (
      this.TataAIAProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Individual
    ) {
      KYCdata.Name = this._fullName(
        this.TataAIAProposalForm.get('CustomerDetail.FirstName').value,
        this.TataAIAProposalForm.get('CustomerDetail.LastName').value,
        this.TataAIAProposalForm.get('CustomerDetail.MiddleName').value
      );
      KYCdata.FirstName = this.TataAIAProposalForm.get(
        'CustomerDetail.FirstName'
      ).value;
      KYCdata.LastName = this.TataAIAProposalForm.get(
        'CustomerDetail.LastName'
      ).value;
      KYCdata.MiddleName = this.TataAIAProposalForm.get(
        'CustomerDetail.MiddleName'
      ).value;
      KYCdata.isCorporate = false;
    } else if (
      this.TataAIAProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Corporate
    ) {
      KYCdata.Name = this.TataAIAProposalForm.get(
        'CustomerDetail.CompanyName'
      ).value;
      KYCdata.isCorporate = true;
    }
    KYCdata.PanNUMBER = this.TataAIAProposalForm.get('CustomerDetail.PanNo').value;
    KYCdata.TransactionNo = TransactionNo;
    KYCdata.DOB = this._datePipe.transform(
      this.TataAIAProposalForm.get('CustomerDetail.DOB').value,
      'yyyy-MM-dd'
    );

    return KYCdata;
  }

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
   * Set Data in proposal create form From the Proposal quotation form & RTO data
   */
  private _SetCarAndPolicyDataFromProposalForm() {
    // To store Motor Quote Data
    let MotorQuotationData = JSON.parse(localStorage.getItem('MotorInsurance'));
    //To store Vehicle details from Quote Page
    this.VehicleDetails = JSON.parse(localStorage.getItem('VehicleDetails'));

    // to store selected policy detail
    let policyDetails = JSON.parse(localStorage.getItem('motorBuyPolicy'));
    
    //Set Car details Data In DTO
    this.TataAIAProposal.CustomerDetail = MotorQuotationData.CustomerDetail;
    this.TataAIAProposal.CarDetail = MotorQuotationData.CarDetail;
    this.TataAIAProposal.PolicyDetail = MotorQuotationData.PolicyDetail;
    this.TataAIAProposal.BusinessType = MotorQuotationData.BusinessType;
    this.TataAIAProposal.PolicyType = MotorQuotationData.PolicyType;
    this.TataAIAProposal.RTOCode = MotorQuotationData.RTOCode;
    this.TataAIAProposal.TransactionNo = this.TransactionNo;
    this.TataAIAProposal.PolicyStartDate = MotorQuotationData.PolicyStartDate;
    this.TataAIAProposal.ProposalDate = MotorQuotationData.ProposalDate;
    this.TataAIAProposal.RegistrationDate = MotorQuotationData.RegistrationDate;
    this.TataAIAProposal.VehicleSubModelId =
      MotorQuotationData.VehicleSubModelId;
    this.TataAIAProposal.ProductCode = policyDetails.ProductCode;
    this.TataAIAProposal.CarDetail.EngineNo = this.VehicleDetails.EngineNo;
    this.TataAIAProposal.CarDetail.ChassisNo = this.VehicleDetails.ChassisNo;
    this.TataAIAProposal.CarDetail.VehicleIDV = policyDetails.CalIDVAmount;
    this.TataAIAProposal.Insurer = policyDetails.Insurer;
    this.TataAIAProposal.VehicleCode = policyDetails.VehicleCode;

    	
    // for Get and Set Electrical SumInsure and Non Electrical SumInsure value from "policyDetails.CalcPremium.addonCovers"
    if (policyDetails.CalcPremium.addonCovers.length > 0) {

      let ElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "Electrical_Accessories_Premium" && x.Key == "Accessories");
      let NonElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "NonElectrical_Accessories_Premium" && x.Key == "Accessories");

      if(ElectricalPremium.length > 0){
        this.TataAIAProposal.CarDetail.ElectricalAccessories = ElectricalPremium[0].SumInsure;
      }

      if(NonElectricalPremium.length > 0){
        this.TataAIAProposal.CarDetail.NonElectricalAccessories = NonElectricalPremium[0].SumInsure;
      }   
  }


    // let _proposalType = MotorQuotationData.BusinessType;

    // if (_proposalType == MotorBusinessTypeEnum['Roll Over']) {
    //   this.MinChassisNo = 10;
    //   this.MaxChassisNo = 17;
    // }
    // else {
    //   this.MinChassisNo = 10;
    //   this.MaxChassisNo = 10;
    // }
  }

  /**
   * step two validation
   * @returns : returns error
   */
  private _stepTwoValidation() {
    let error: Alert[] = [];

    // To store Motor Quote Data
    let MotorQuotationData = JSON.parse(localStorage.getItem('MotorInsurance'));

    // Finance Type
    if (this.TataAIAProposalForm.get('CustomerDetail.FinancierName').value != "" 
    && (this.TataAIAProposalForm.get('CustomerDetail.FinanceType').value == "" || this.TataAIAProposalForm.get('CustomerDetail.FinanceType').value == null)) {
      error.push({
        Message: 'Select Finance Type',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // FinancierName
    if (this.TataAIAProposalForm.get('CustomerDetail.FinanceType').value != "" 
    && (this.TataAIAProposalForm.get('CustomerDetail.FinancierName').value == "" || this.TataAIAProposalForm.get('CustomerDetail.FinancierName').value == null)) {
      error.push({
        Message: 'Select Financier Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // if (MotorQuotationData.BusinessType == MotorBusinessTypeEnum['Roll Over']) {
    //   if (this.TataAIAProposalForm.get('CarDetail.ChassisNo').value.length != this.MaxChassisNo && this.TataAIAProposalForm.get('CarDetail.ChassisNo').value.length != this.MinChassisNo) {
    //     error.push({
    //       Message: 'Chassis No. must be either ' + this.MinChassisNo + ' or ' + this.MaxChassisNo + ' characters',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }
    // else{
    //   if (this.TataAIAProposalForm.get('CarDetail.ChassisNo').value.length != this.MaxChassisNo) {
    //     error.push({
    //       Message: 'Chassis No. must be of ' + this.MaxChassisNo + ' characters',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }

    if (this.TataAIAProposalForm.get('CarDetail.ChassisNo').value.length > this.MaxChassisNo || this.TataAIAProposalForm.get('CarDetail.ChassisNo').value.length < this.MinChassisNo) {
      error.push({
        Message: 'Chassis No. must be between of ' + this.MinChassisNo + ' to ' + this.MaxChassisNo + ' characters',
        CanDismiss: false,
        AutoClose: false,
      });
    }  

    if (this.f['BusinessType'].value == 'Rollover') {
      // Previous Policy No
      if (!this.TataAIAProposalForm.get('PolicyDetail.PreviousPolicyNo').value) {
        error.push({
          Message: 'Enter Previous Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.TataAIAProposalForm.get('PolicyDetail.PreviousInsurer').value) {
        error.push({
          Message: 'Enter Previous Insurer',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.TataAIAProposalForm.get('PolicyDetail.PreviousInsurerAddress').value) {
        error.push({
          Message: 'Enter Previous Insurer Address',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // Address
    if (this.TataAIAProposalForm.get('CustomerDetail.Address').invalid) {
      error.push({
        Message: 'Enter Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // PinCode
    if (this.TataAIAProposalForm.get('CustomerDetail.PinCode').invalid) {
      error.push({
        Message: 'Enter PIN Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // MobileNo
    if (this.TataAIAProposalForm.get('CustomerDetail.MobileNo').invalid) {
      error.push({
        Message: 'Enter Mobile',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Email
    if (this.TataAIAProposalForm.get('CustomerDetail.Email').invalid) {
      error.push({
        Message: 'Enter Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.TataAIAProposalForm.get('CustomerDetail.CustomerType').value != MotorCustomerTypeEnum.Corporate) {

      // NomineeFirstName
      if (
        this.TataAIAProposalForm.get('CustomerDetail.NomineeFirstName').invalid
      ) {
        error.push({
          Message: 'Enter Nominee First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // NomineeLastName
      if (
        this.TataAIAProposalForm.get('CustomerDetail.NomineeLastName').invalid
      ) {
        error.push({
          Message: 'Enter Nominee Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // NomineeRelation
      if (
        this.TataAIAProposalForm.get('CustomerDetail.NomineeRelation').invalid
      ) {
        error.push({
          Message: 'Select Nominee Relation',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // NomineeDOB
      if (this.TataAIAProposalForm.get('CustomerDetail.NomineeDOB').invalid) {
        error.push({
          Message: 'Enter Nominee Date Of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (!this.NomineeIsAdult) {
      // AppointeeFirstName
      if (
        this.TataAIAProposalForm.get('CustomerDetail.AppointeeFirstName').invalid
      ) {
        error.push({
          Message: 'Enter Appointee First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeLastName
      if (
        this.TataAIAProposalForm.get('CustomerDetail.AppointeeLastName').invalid
      ) {
        error.push({
          Message: 'Enter Appointee Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeRelation
      if (
        this.TataAIAProposalForm.get('CustomerDetail.AppointeeRelation').invalid
      ) {
        error.push({
          Message: 'Select Appointee Relation',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
    return error;
  }

  /**
   * to identify change in value of NomineeDOB and calculate age of Nominee . If Nominee is not an Adult than Appointee details are required
   */
  private _changeInNomineeAge() {
    this.TataAIAProposalForm.get(
      'CustomerDetail.NomineeDOB'
    ).valueChanges.subscribe((res) => {
      let ageOfNominee = moment(new Date()).diff(res, 'year');

      if (ageOfNominee < 18) {
        this.NomineeIsAdult = false;
      } else {
        this.NomineeIsAdult = true;
      }
    });
  }

  // change in Pincode
  private _onFormChanges() {
    this.TataAIAProposalForm.get(
      'CustomerDetail.PinCode'
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
  }

  // dropdown list
  private _fillMasterList() {
    this.GenderList = [];
    // fill gender list
    this._MasterListService
      .getCompanyWiseList('TataAIA', 'gender')
      .subscribe((res) => {
        if (res.Success) {
          this.GenderList = res.Data.Items;
        }
      });

    this.NomineeRelationList = [];
    // fill nominee relation list
    this._MasterListService
      .getCompanyWiseList('TataAIA', 'nomineerelation')
      .subscribe((res) => {
        if (res.Success) {
          this.NomineeRelationList = res.Data.Items;
        }
      });

    this.AppointeeRelationList = [];
       // fill appointee relation list
    this._MasterListService
    .getCompanyWiseList('TataAIA', 'appointeerelation')
    .subscribe((res) => {
      if (res.Success) {
        this.AppointeeRelationList = res.Data.Items;
      }
    });

    this.InsurerList = [];
    // fill nominee relation list
    this._MasterListService
      .getCompanyWiseList('TataAIA', 'TataAIAPreInsurer')
      .subscribe((res) => {
        if (res.Success) {
          this.InsurerList = res.Data.Items;
        }
      });

    this.MaritalList = [];
    // fill marital list
    this._MasterListService
      .getCompanyWiseList('TataAIA', 'marital')
      .subscribe((res) => {
        if (res.Success) {
          this.MaritalList = res.Data.Items;
        }
      });

    this.OccupationList = [];
    // fill Occupation list
    this._MasterListService
      .getCompanyWiseList('TataAIA', 'tataaiaoccupation')
      .subscribe((res) => {
        if (res.Success) {
          this.OccupationList = res.Data.Items;
        }
      });

    this.FinancierNameList = [];
    this._MasterListService
      .getCompanyWiseList('TataAIA', 'TataAIAFinancier')
      .subscribe((res) => {
        if (res.Success) {
          this.FinancierNameList = res.Data.Items;
        }
      });
  }

  /**
   * Build Main Proposal Create Form
   * @param data
   * @returns
   */
  private _buildTataAIAMotorProposalForm(data: ITataAIAMotor) {
    let proposalForm = this.fb.group({
      Insurer: [0],
      TransactionNo: [''],
      ProductCode: [''],
      ProposalDate: [''],
      BusinessType: [0],
      PolicyType: [0],
      VehicleSubModelId: [0],
      VehicleCode: [''],
      RTOCode: [''],
      PolicyStartDate: [''],
      RegistrationDate: [''],
      InsurerRequest: [''],
      PanNumber: ['', [Validators.required]],
      UID: ['', [Validators.required]],
      CarDetail: this._buildTataAIAMotorCarDetailsForm(data.CarDetail),
      PolicyDetail: this._buildTataAIAMotorPolicyDetailForm(data.PolicyDetail),
      CustomerDetail: this._buildTataAIAMotorCustomerDetailForm(
        data.CustomerDetail
      ),
    });
    if (data) {
      proposalForm.patchValue(data);
    }
    return proposalForm;
  }

  /**
   * Build Car Details Form
   * @param CustomerDetailData
   * @returns  CarDetailData Form
   */
  private _buildTataAIAMotorCarDetailsForm(
    CarDetailsData: ITataAIACarDetailDto
  ) {
    let carDetailsForm = this.fb.group({
      EngineNo: [''],
      ChassisNo: [''],
      DateofFirstRegistration: [''],
      VehicleIDV: [0],
      YearOfManufacture: [0],
      BiFuelType: [0],
      BiFuelKitValue: [0],
      PersonalAccident: [],
      ZeroDepreciation: [],
      InvoiceCover: [],
      RoadsideAssistance: [],
      EngineProtector: [],
      NCBProtection: [],
      Consumable: [],
      KeyandLockReplacement: [],
      PersonAccident: [],
      NoOfPerson: [0],
      PersonSumInsured: [0],
      RepairofGlass: [],
      TyreSecure: [],
      DriverCover: [],
      DriverCoverSumInsured: [0],
      PassengerCover: [],
      PassengerCoverSumInsured: [0],
      Accessories: [],
      ElectricalAccessories: [0],
      NonElectricalAccessories: [0],

    });

    if (CarDetailsData) {
      carDetailsForm.patchValue(CarDetailsData);
    }

    return carDetailsForm;
  }

  /**
   * Build Policy Details Form
   * @param CustomerDetailData
   * @returns  PolicyDetailData Form
   */
  private _buildTataAIAMotorPolicyDetailForm(
    PolicyDetailData: ITataAIAMotorPolicyDetailDto
  ) {
    let PolicyDetailForm = this.fb.group({
      PreviousPolicyNo: [''],
      PreviousIDV: [0],
      VehicleNo: [''],
      PolicyPeriod: [0],
      PreviousPolicyClaim: [],
      PreviousPolicyNCBPercentage: [0],
      PreviousPolicyType: [''],
      PreviousInsurer: [''],
      PreviousInsurerAddress: [''],
      // PreviousPolicyODEndDate: [''],
      PreviousPolicyStartDate: [''],
      PreviousPolicyEndDate: [''],
      PreviousPolicyTPStartDate: [''],
      PreviousPolicyTPEndDate: [''],

      CurrentTPPolicyNo: [''],
      CurrentTPName: [''],
      CurrentTPTenure: [''],
      CurrentTPPolicyType: [''],

      PreviousPolicyBiFuel: [false],
      PreviousPolicyZeroDepreciation: [false],
      PreviousPolicyConsumable: [false],
      PreviousPolicyEngineProtector: [false],
      PreviousPolicyInvoiceCover: [false],
      PreviousPolicyTyreCover: [false],
    });

    if (PolicyDetailData) {
      PolicyDetailForm.patchValue(PolicyDetailData);
    }

    return PolicyDetailForm;
  }

  /**
   * Build Customer Details Form
   * @param CustomerDetailData
   * @returns  CustomerDetailData Form
   */
  private _buildTataAIAMotorCustomerDetailForm(
    CustomerDetailData: ITataAIAMotorCustomerDetaildto
  ) {
    let CustomerDetailForm = this.fb.group({
      CustomerType: [''],
      CompanyName: ['', [Validators.required]],
      Salutation: [0, [Validators.required]],
      FirstName: ['', [Validators.required]],
      MiddleName: [''],
      LastName: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      Email: ['', [Validators.required]],
      MobileNo: ['', [Validators.required]],
      Gender: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      Address1: ['', [Validators.required]],
      Address2: ['', [Validators.required]],
      PinCode: ['', [Validators.required]],
      KYCId: [''],
      NomineeFirstName: ['', [Validators.required]],
      NomineeMiddleName: [''],
      NomineeLastName: ['', [Validators.required]],
      NomineeRelation: ['', [Validators.required]],
      NomineeDOB: ['', [Validators.required]],
      AppointeeFirstName: ['', [Validators.required]],
      AppointeeMiddleName: [''],
      AppointeeLastName: ['', [Validators.required]],
      AppointeeRelation: ['', [Validators.required]],
      KYCReqNo: [''],
      Marital: [''],
      Occupation: [''],
      OtherOccupation: [''],
      FinanceType: ['', [Validators.required]],
      FinancierName: ['', [Validators.required]],
      PanNo: ['', [Validators.required, Validators.maxLength(15), this.noWhitespaceValidator]],
      GSTINNo: [''],
    });

    if (CustomerDetailData) {
      CustomerDetailForm.patchValue(CustomerDetailData);
    }

    return CustomerDetailForm;
  }

  // details from health form
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  private _dateFormat() {
    this.TataAIAProposalForm.get('CustomerDetail').patchValue({
      DOB: this._datePipe.transform(this.TataAIAProposalForm.get('CustomerDetail.DOB').value, 'yyyy-MM-dd'),
      NomineeDOB: this._datePipe.transform(this.TataAIAProposalForm.get('CustomerDetail.NomineeDOB').value, 'yyyy-MM-dd'),
    })

  }

  //#endregion Private methods
}
