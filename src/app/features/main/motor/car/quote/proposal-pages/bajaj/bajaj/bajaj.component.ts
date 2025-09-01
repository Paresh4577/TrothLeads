import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MasterListService } from '@lib/services/master-list.service';
import { Alert, IFilterRule } from '@models/common';
import { BajajMotorDto, IBajajCarDetail, IBajajCustomerDetail, IBajajMotorDto, IBajajPolicyDetail } from '@models/dtos/motor-insurance/bajaj';
import { BajajMotorKYCDto, IBajajMotorKYCDto } from '@models/dtos/motor-insurance/KYC/Bajaj/bajaj-motor-kyc-dto';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { MotorCustomerTypeEnum } from 'src/app/shared/enums/MotorCustomerType.enum';
import { BajajService } from '../bajaj.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ICityPincodeDto } from '@models/dtos/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { BajajFinanceType } from '@config/motor-quote/Bajaj-Finance-Type.config';
import * as moment from 'moment';
import { QuoteService } from 'src/app/features/main/health/quote/quote.service';
import { MotorPolicyTypeEnum } from 'src/app/shared/enums/MotorPolicyType.enum';
import { MotorBusinessTypeEnum } from 'src/app/shared/enums/MotorBusinessType.enum';

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
  pagetitle: string = 'Bajaj Allianz Motor';
  Icon: string;
  TransactionNo: string;

  // ReGex
  PANNum: RegExp = ValidationRegex.PANNumValidationReg;
  AadharNum: RegExp = ValidationRegex.UIDNumValidationReg;

  // date
  maxDate: Date;

  //boolean
  IsKYC: boolean = false;
  NomineeIsAdult = true;
  rdrPAN: string = "PAN";

  // formControl
  step1 = new FormControl();

  //Number
  kycFlag: number = 0;

  // chassis number : maximum and minimum length
  MinChassisNo: number = 10;
  MaxChassisNo: number = 17;

  // list
  GenderList: any[];
  NomineeRelationList: any[];
  FinancierCodeList: any[];
  InsurerList: any[];
  VehicleDetails

  DropdownMaster: dropdown;
  destroy$: Subject<any>;
  FinancierCode$: Observable<any>;
  pincodes$: Observable<ICityPincodeDto[]>;

  //Formgroup & DTO
  BajajProposal: IBajajMotorDto;
  BajajProposalForm: FormGroup;

  // alerts
  alerts: Alert[] = [];

  // #endregion public variables

  //#region constructor
  /**
   * #region constructor
   * @param fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   */

  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    private _router: Router,
    private _MasterListService: MasterListService, //dropDown Value as per company name
    private _BajajService: BajajService,
    private _datePipe: DatePipe, //to change the format of date
    private _route: ActivatedRoute,
    private _dialogService: DialogService,
    public _dialog: MatDialog,
    private _quoteService: QuoteService,
  ) {
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();
    this.BajajProposal = new BajajMotorDto();

    if (localStorage.getItem('motorBuyPolicy')) {
      let motorBuyPolicyDetails = JSON.parse(
        localStorage.getItem('motorBuyPolicy')
      );
      this.Icon = motorBuyPolicyDetails.IconURL;
      this.TransactionNo = motorBuyPolicyDetails.TransactionNo;
    }

    this.maxDate = new Date();

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
    this.BajajProposalForm = this._buildBajajProposalForm(this.BajajProposal);

    this._onFormChanges();
    this._changeInNomineeAge();

    // when KYC is done via Redirect URL and kyc_id is obtained than fill the PolicyHolder details from data stored in loacl storage
    // and let user move to next stepper
    let data = this._route.snapshot.queryParams;
    if (data && data['kyc_id']) {
      if (localStorage.getItem('BajajCustomerDetail')) {
        this.BajajProposalForm.get('CustomerDetail').patchValue(
          JSON.parse(localStorage.getItem('BajajCustomerDetail'))
        );
        this.BajajProposalForm.get('CustomerDetail').patchValue({
          KYCId: data['kyc_id'],
        });
        this.kycFlag = 0;
        this.stepOneError(MatStepper, this.kycFlag);
      }
    }

    if (this.f['BusinessType'].value == 'Rollover') {
      this.BajajProposalForm.get('PolicyDetail.PreviousInsurer').patchValue('');
    }
  }


  //#endregion lifecyclehooks


  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  get f() {
    return this.BajajProposalForm.controls;
  }

  get MotorCustomerType() {
    return MotorCustomerTypeEnum;
  }

  get BajajFinanceType() {
    return BajajFinanceType;
  }

  get MotorPolicyType() {
    return MotorPolicyTypeEnum;
  }

  // back Button
  public backClick() {
    this._router.navigate([ROUTING_PATH.MotorCarQuote.Plan]);
  }

  // step 1 validation
  public stepOneValidation() {
    this.alerts = [];
    if (
      this.BajajProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Corporate
    ) {
      if (this.BajajProposalForm.get('CustomerDetail.CompanyName').invalid) {
        this.alerts.push({
          Message: 'Enter Company Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.BajajProposalForm.get('CustomerDetail.DOB').invalid) {
        this.alerts.push({
          Message: 'Enter Company Start Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    } else if (
      this.BajajProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Individual
    ) {
      if (
        this.BajajProposalForm.get('CustomerDetail.Salutation').invalid ||
        this.BajajProposalForm.get('CustomerDetail.Salutation').value == 0
      ) {
        this.alerts.push({
          Message: 'Select Title',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.BajajProposalForm.get('CustomerDetail.FirstName').invalid) {
        this.alerts.push({
          Message: 'Enter First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.BajajProposalForm.get('CustomerDetail.LastName').invalid) {
        this.alerts.push({
          Message: 'Enter Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.BajajProposalForm.get('CustomerDetail.Gender').invalid) {
        this.alerts.push({
          Message: 'Select Gender',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.BajajProposalForm.get('CustomerDetail.DOB').invalid) {
        this.alerts.push({
          Message: 'Enter Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.BajajProposalForm.get('CustomerDetail.PanNo').invalid) {
      this.alerts.push({
        Message: 'Enter PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    } else if (
      !this.PANNum.test(this.BajajProposalForm.get('CustomerDetail.PanNo').value)
    ) {
      this.alerts.push({
        Message: 'Enter valid PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (
      this.BajajProposalForm.get('CustomerDetail.UID').value != '' &&
      !this.AadharNum.test(this.BajajProposalForm.get('CustomerDetail.UID').value)
    ) {
      this.alerts.push({
        Message: 'Enter valid Aadhar',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // if (this.BajajProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate &&
    //   this.BajajProposalForm.get('CustomerDetail.CompanyName').value == '') {
    //   this.alerts.push({
    //     Message: 'Select Company Type',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }

    if (this.alerts.length > 0 || !this.IsKYC) {
      this.step1.setErrors({ required: true });
      return this.step1;
    } else {
      this.step1.reset();
      return this.step1;
    }
  }

  // step 1 error message
  public stepOneError(stepper, num = this.kycFlag) {

    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
      return;
    }

    // after step 1 is validated KYC is done
    this._checkKYC(stepper, num);
  }

  /**
 * Pop Up to select the Insurance Company
 * @param type :to identify api of which list is to be called
 * @param title : title that will be displayed on PopUp
 */
  public openDiolog(type: string, title: string, index: number = 0) {
    let Rule: IFilterRule[] = [
      {
        Field: 'InsuranceHelper.Type',
        Operator: 'eq',
        Value: 'HDFCFinancier',
      },
    ];

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
      filterData: Rule,
    };

    const dialogRef = this._dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'FinancierCode') {
          this.BajajProposalForm.get('CustomerDetail').patchValue({
            FinancierName: result.Name,
            FinancierCode: result.Code,
          });
        }
      }
    });
  }

  // bind the data of FinancierCode [autoComplete]
  public PatchFinancierCode(event: MatAutocompleteSelectedEvent): void {
    this.BajajProposalForm.get('CustomerDetail').patchValue(
      {
        FinancierName: event.option.value.Name,
        FinancierCode: event.option.value.Code,
      },
      { emitEvent: false }
    );
  }

  // Pincode autocomplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.BajajProposalForm.get('CustomerDetail').patchValue({
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

    const dialogRef = this._dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'Pincode') {
          this.BajajProposalForm.get('CustomerDetail').patchValue({
            PinCode: result.PinCode,
          });
        }
      }
    });
  }

  // clear pincode
  public clear(name: string): void {
    this.BajajProposalForm.get(name).setValue('');
  }

  public clearFinancierCode() {
    this.BajajProposalForm.get('CustomerDetail').patchValue(
      {
        FinancierName: '',
        FinancierCode: '',
      },
      { emitEvent: false }
    );

  }

  /**
   * Create Proposal & Proceed to payment portal
   */
  public ProceedToPay() {
    let errorMessage: Alert[] = [];
    errorMessage = this._stepTwoValidation();
    if (errorMessage.length > 0) {
      this._alertservice.raiseErrors(errorMessage);
      return;
    }

    this.BajajProposalForm.get('CustomerDetail').patchValue({
      DOB: this._datePipe.transform(
        this.BajajProposalForm.get('CustomerDetail').getRawValue().DOB,
        'yyyy-MM-dd'
      ),
    });
    this._BajajService
      .createProposal(this.BajajProposalForm.value)
      .subscribe((res) => {
        if (res.Success) {
          localStorage.removeItem('BajajpolicyHolder');
          this._alertservice.raiseSuccessAlert(res.Message);
          if (res.Data.PaymentURL != null && res.Data.PaymentURL != "") {
            location.href = res.Data.PaymentURL;
          }
          this._alertservice.raiseSuccessAlert(res.Message);
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

  //#endregion public-methods


  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _stepTwoValidation() {
    let error: Alert[] = [];

    // Finance Type
    if (this.BajajProposalForm.get('CustomerDetail.FinancierName').value != "" && (this.BajajProposalForm.get('CustomerDetail.FinanceType').value == "" || this.BajajProposalForm.get('CustomerDetail.FinanceType').value == null)) {
      error.push({
        Message: 'Select Finance Type',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Financier Name
    if (this.BajajProposalForm.get('CustomerDetail.FinanceType').value != "" && (this.BajajProposalForm.get('CustomerDetail.FinancierName').value == "" || this.BajajProposalForm.get('CustomerDetail.FinancierName').value == null)) {
      error.push({
        Message: 'Financier Name is Required',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // EngineNo
    if (this.BajajProposalForm.get('CarDetail.EngineNo').value == "" || this.BajajProposalForm.get('CarDetail.EngineNo').value == null) {
      error.push({
        Message: 'Enter Engine No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // ChassisNo
    if (this.BajajProposalForm.get('CarDetail.ChassisNo').value == "" || this.BajajProposalForm.get('CarDetail.ChassisNo').value == null) {
      error.push({
        Message: 'Enter Chassis No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // To store Motor Quote Data
    let MotorQuotationData = JSON.parse(localStorage.getItem('MotorInsurance'))

    if (MotorQuotationData.BusinessType == MotorBusinessTypeEnum['Roll Over']) {
      if (this.BajajProposalForm.get('CarDetail.ChassisNo').value.length != this.MaxChassisNo && this.BajajProposalForm.get('CarDetail.ChassisNo').value.length != this.MinChassisNo) {
        error.push({
          Message: 'Chassis No. must be either ' + this.MinChassisNo + ' or ' + this.MaxChassisNo + ' characters',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
    else {
      if (this.BajajProposalForm.get('CarDetail.ChassisNo').value.length != this.MaxChassisNo) {
        error.push({
          Message: 'Chassis No. must be of ' + this.MaxChassisNo + ' characters',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // if (this.BajajProposalForm.get('CarDetail.ChassisNo').value.length > this.MaxChassisNo || this.BajajProposalForm.get('CarDetail.ChassisNo').value.length < this.MinChassisNo) {
    //   error.push({
    //     Message: 'Chassis No. must be between of ' + this.MinChassisNo + ' to ' + this.MaxChassisNo + ' characters',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }

    if (this.f['BusinessType'].value == 'Rollover') {
      // Previous Policy No
      if (!this.BajajProposalForm.get('PolicyDetail.PreviousPolicyNo').value) {
        error.push({
          Message: 'Enter Previous Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.BajajProposalForm.get('PolicyDetail.PreviousInsurer').value) {
        error.push({
          Message: 'Enter Previous Insurer',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.f['PolicyType'].value == this.MotorPolicyType['Own Damage']) {
      // Previous Policy No
      if (!this.BajajProposalForm.get('PolicyDetail.CurrentTPPolicyNo').value) {
        error.push({
          Message: 'Enter Current TP Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.BajajProposalForm.get('PolicyDetail.CurrentTPName').value) {
        error.push({
          Message: 'Select Current TP Insurer',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // if ((this.f['BusinessType'].value == 'Rollover') &&
    //   (this.f['PolicyType'].value == this.MotorPolicyType['Comprehensive'] || this.f['PolicyType'].value == this.MotorPolicyType['Own Damage'])) {


    //   if (this.f['CarDetail'].value.ZeroDepreciation) {
    //     if (!this.BajajProposalForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').value) {
    //       error.push({
    //         Message: "You are not eligible to purchase the Zero Depreciation add-on as you didn't purchase this add-on in the previous policy.",
    //         CanDismiss: false,
    //         AutoClose: false,
    //       });
    //     }
    //   }

    //   if (this.f['CarDetail'].value.InvoiceCover) {
    //     if (!this.BajajProposalForm.get('PolicyDetail.PreviousPolicyInvoiceCover').value) {
    //       error.push({
    //         Message: "You are not eligible to purchase the Invoice Cover add-on as you didn't purchase this add-on in the previous policy.",
    //         CanDismiss: false,
    //         AutoClose: false,
    //       });
    //     }
    //   }

    // }

    // Address
    if (this.BajajProposalForm.get('CustomerDetail.Address').invalid) {
      error.push({
        Message: 'Enter Street',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Address 1
    if (this.BajajProposalForm.get('CustomerDetail.Address1').invalid) {
      error.push({
        Message: 'Enter Area',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Address 2
    if (this.BajajProposalForm.get('CustomerDetail.Address2').invalid) {
      error.push({
        Message: 'Enter Location',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // PinCode
    if (this.BajajProposalForm.get('CustomerDetail.PinCode').invalid) {
      error.push({
        Message: 'Enter PIN Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // MobileNo
    if (this.BajajProposalForm.get('CustomerDetail.MobileNo').invalid) {
      error.push({
        Message: 'Enter Mobile',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Email
    if (this.BajajProposalForm.get('CustomerDetail.Email').invalid) {
      error.push({
        Message: 'Enter Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeFirstName
    if (this.BajajProposalForm.get('CustomerDetail.NomineeFirstName').invalid && this.BajajProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeLastName
    if (this.BajajProposalForm.get('CustomerDetail.NomineeLastName').invalid && this.BajajProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeRelation
    if (this.BajajProposalForm.get('CustomerDetail.NomineeRelation').invalid && this.BajajProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Select Nominee Relation',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeDOB
    if (this.BajajProposalForm.get('CustomerDetail.NomineeDOB').invalid && this.BajajProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Date Of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (!this.NomineeIsAdult && this.BajajProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      // AppointeeFirstName
      if (
        this.BajajProposalForm.get('CustomerDetail.AppointeeFirstName').invalid
      ) {
        error.push({
          Message: 'Enter Appointee First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeLastName
      if (
        this.BajajProposalForm.get('CustomerDetail.AppointeeLastName').invalid
      ) {
        error.push({
          Message: 'Enter Appointee Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeRelation
      if (
        this.BajajProposalForm.get('CustomerDetail.AppointeeRelation').invalid
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

  // check KYC
  /**
   * if KYC is done by Redirect URL than let the user move to next stepper
   * @param stepper : MatStepper
   * @param type : to identify if KYC is done from Redirect URL or not(if type==0 than KYC will be done by api
   *                                                                   but if type==1 means KYC is done from Redirect URL)
   */
  private _checkKYC(stepper: MatStepper, type: number) {

    if (type == 0) {

      let KYCData: IBajajMotorKYCDto = new BajajMotorKYCDto();
      KYCData.TransactionNo = this.TransactionNo;
      KYCData.ProductCode = this.BajajProposalForm.get('ProductCode').value;
      KYCData.DOB = this._datePipe.transform(this.BajajProposalForm.get('CustomerDetail.DOB').value, 'yyyy-MM-dd');

      if (this.BajajProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Individual) {

        KYCData.Gender = this.BajajProposalForm.get('CustomerDetail.Gender').value;
        if (this.BajajProposalForm.get('CustomerDetail.KYCVerify').value == 'UID') {
          if (this.BajajProposalForm.get('CustomerDetail.UID').valid) {

            let fullName = this._fullName(
              this.BajajProposalForm.get('CustomerDetail.FirstName').value,
              this.BajajProposalForm.get('CustomerDetail.LastName').value,
              this.BajajProposalForm.get('CustomerDetail.MiddleName').value,
              'UID'
            );
            KYCData.Name = fullName;
            KYCData.DocTypeCode = 'UID';
            KYCData.DocNumber = this.BajajProposalForm.get('CustomerDetail.UID').value;
          }
        }
        else {
          if (this.BajajProposalForm.get('CustomerDetail.PanNo').valid) {

            let fullName = this._fullName(
              this.BajajProposalForm.get('CustomerDetail.FirstName').value,
              this.BajajProposalForm.get('CustomerDetail.LastName').value,
              this.BajajProposalForm.get('CustomerDetail.MiddleName').value,
              'PAN'
            );

            KYCData.Name = fullName;
            KYCData.DocTypeCode = 'PAN';
            KYCData.DocNumber = this.BajajProposalForm.get('CustomerDetail.PanNo').value;
          }
        }
      }
      else if (this.BajajProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate) {

        KYCData.isCorporate = true;
        KYCData.Name = this.BajajProposalForm.get('CustomerDetail.CompanyName').value;
        KYCData.Gender = "Corporate";

        if (this.BajajProposalForm.get('CustomerDetail.KYCVerify').value == 'GSTIN') {
          if (this.BajajProposalForm.get('CustomerDetail.GSTINNo').valid) {
            KYCData.DocTypeCode = 'GSTIN';
            KYCData.DocNumber = this.BajajProposalForm.get('CustomerDetail.GSTINNo').value;
          }
        }
        else {
          if (this.BajajProposalForm.get('CustomerDetail.PanNo').valid) {
            KYCData.DocTypeCode = 'PAN';
            KYCData.DocNumber = this.BajajProposalForm.get('CustomerDetail.PanNo').value;
          }
        }
      }

      if (KYCData.DocNumber != "" && KYCData.DocNumber != null && KYCData.DocNumber != undefined) {
        this._BajajService.KYC(KYCData).subscribe((res) => {
          this._kycSuccess(res, stepper);
        });
      }
    }
    else {
      this.IsKYC = true;
      this.step1.reset();
    }
  }

  /**
   * Response of the api is processed
   * @param result : response of the api
   * @param stepper : MatStepper
   * if response is successfull and IskycVerified is 1 than user is moved to next stepper for further details
   * else user screen opens the Redirect URL in order to finish KYC
   */
  private _kycSuccess(result, stepper) {
    if (result.Success) {

      // If IskycVerified is 1 , move to the next stepper
      if (result.Data.IskycVerified == 1) {
        this.BajajProposalForm.get('CustomerDetail').patchValue({ KYCId: result.Data.KycId, });
        this.IsKYC = true;
        this._alertservice.raiseSuccessAlert(result.Message);
        this._compareFullNameAndReturnName(result, stepper);
        // this.step1.reset();
        // stepper.next();
      }

      // if IskycVerified is 0 then open the Redirect URL in order to finish KYC
      // Save the data of Policy holder in local storage and once the KYC is done the user will return back to Bajaj form
      // and the data of Policy holder will be retrive from the local storage and user will be moved to next stepper
      else {
        localStorage.setItem('BajajCustomerDetail', JSON.stringify(this.BajajProposalForm.get('CustomerDetail').value));
        this.IsKYC = false;
        stepper.previous();
        window.open(result.Data.RedirectURL, '_self');
        this._alertservice.raiseErrors(result.Alerts);
      }
    }
    //  raise Alert message and do not let user to move on next stepper
    else {
      stepper.previous();
      this.IsKYC = false;
      this._alertservice.raiseErrorAlert(result.Message);
    }
  }

  // full name for KYC
  private _fullName(FName: string, LName: string, MName?: string, DocType?: string) {
    let Name: string;

    if (DocType == 'PAN') {
      let title = this.BajajProposalForm.get('CustomerDetail.Salutation').value
      if (MName) {
        Name = title.concat(' ', FName, ' ', MName, ' ', LName);
      } else {
        Name = title.concat(' ', FName, ' ', LName);
      }
    }
    else {
      if (MName) {
        Name = FName.concat(' ', MName, ' ', LName);
      } else {
        Name = FName.concat(' ', LName);
      }
    }

    return Name;
  }

  /**
 * campare the name entered by user and the name returned by KYC API . If there are any difference ask user
 * if name is to be replaced by the name returned by KYC API in a dialog box.
 * if user selects yes than replace name and if no than don't chage
 * @param response : response of KYC API
 * @param stepper : MatStepper
 */
  private _compareFullNameAndReturnName(response, stepper?: MatStepper) {
    if (
      this.BajajProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Individual
    ) {
      let fullName = this._fullName(
        this.BajajProposalForm.get('CustomerDetail.FirstName').value,
        this.BajajProposalForm.get('CustomerDetail.LastName').value,
        this.BajajProposalForm.get('CustomerDetail.MiddleName').value,

      );

      if (response.Data.Name.toUpperCase() != fullName.toUpperCase()) {
        this._dialogService
          .confirmDialog({
            title: 'Are You Sure?',
            message: `Replace Your Name with ${response.Data.Name}`,
            confirmText: 'Yes, Replace!',
            cancelText: 'No',
          })
          .subscribe((res) => {
            let Name = response.Data.Name.split(' ');
            if (res == true) {
              this.BajajProposalForm.get('CustomerDetail').patchValue({
                FirstName: Name.length > 1 ? Name[1] : '',
                MiddleName: Name.length > 2 ? Name[2] : '',
                LastName: Name.length > 3 ? Name[3] : Name[1],
              });
            }
            this.step1.reset();
            stepper.next();
          });
      } else {
        this.step1.reset();
        stepper.next();
      }
    } else if (this.BajajProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate) {
      if (response.Data.Name.toUpperCase() != this.BajajProposalForm.get('CustomerDetail.CompanyName').value.toUpperCase()) {
        this._dialogService
          .confirmDialog({
            title: 'Are You Sure?',
            message: `Replace Company Name with ${response.Data.Name}`,
            confirmText: 'Yes, Replace!',
            cancelText: 'No',
          })
          .subscribe((res) => {
            if (res == true) {
              this.BajajProposalForm.get('CustomerDetail').patchValue({
                CompanyName: response.Data.Name,
              });
            }
            this.step1.reset();
            stepper.next();
          });
      } else {
        this.step1.reset();
        stepper.next();
      }
    }
  }

  /**
   * Set Data in proposal create form From the Proposal quotation form & RTO data
   */
  private _SetCarAndPolicyDataFromProposalForm() {
    if (localStorage.getItem('MotorInsurance') && localStorage.getItem('VehicleDetails') && localStorage.getItem('motorBuyPolicy')) {
      // To store Motor Quote Data
      let MotorQuotationData = JSON.parse(
        localStorage.getItem('MotorInsurance')
      );
      //To store Vehicle details from Quote Page
      this.VehicleDetails = JSON.parse(localStorage.getItem('VehicleDetails'));

      // to store selected policy detail
      let policyDetails = JSON.parse(localStorage.getItem('motorBuyPolicy'));

      //Set Car details Data In DTO
      this.BajajProposal.CustomerDetail = MotorQuotationData.CustomerDetail;
      this.BajajProposal.CarDetail = MotorQuotationData.CarDetail;
      this.BajajProposal.PolicyDetail = MotorQuotationData.PolicyDetail;
      this.BajajProposal.BusinessType = MotorQuotationData.BusinessType;
      this.BajajProposal.PolicyType = MotorQuotationData.PolicyType;
      this.BajajProposal.RTOCode = MotorQuotationData.RTOCode;
      this.BajajProposal.TransactionNo = this.TransactionNo;
      this.BajajProposal.PolicyStartDate = MotorQuotationData.PolicyStartDate;
      this.BajajProposal.ProposalDate = MotorQuotationData.ProposalDate;
      this.BajajProposal.RegistrationDate = MotorQuotationData.RegistrationDate;
      this.BajajProposal.VehicleSubModelId = MotorQuotationData.VehicleSubModelId;
      this.BajajProposal.ProductCode = policyDetails.ProductCode;
      this.BajajProposal.CarDetail.EngineNo = this.VehicleDetails.EngineNo;
      this.BajajProposal.CarDetail.ChassisNo = this.VehicleDetails.ChassisNo;
      this.BajajProposal.CarDetail.VehicleIDV = policyDetails.CalIDVAmount;
      this.BajajProposal.Insurer = policyDetails.Insurer;
      this.BajajProposal.VehicleCode = policyDetails.VehicleCode;
      this.BajajProposal.InsurerResponse = policyDetails.InsurerResponse;

      // for Get and Set Electrical SumInsure and Non Electrical SumInsure value from "policyDetails.CalcPremium.addonCovers"
      if (policyDetails.CalcPremium.addonCovers.length > 0) {

        let ElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "Electrical_Accessories_Premium" && x.Key == "Accessories");
        let NonElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "NonElectrical_Accessories_Premium" && x.Key == "Accessories");

        if (ElectricalPremium.length > 0) {
          this.BajajProposal.CarDetail.ElectricalAccessories = ElectricalPremium[0].SumInsure;
        }

        if (NonElectricalPremium.length > 0) {
          this.BajajProposal.CarDetail.NonElectricalAccessories = NonElectricalPremium[0].SumInsure;
        }
      }

      let _proposalType = MotorQuotationData.BusinessType;
      if (_proposalType == MotorBusinessTypeEnum['Roll Over']) {
        this.MinChassisNo = 10;
        this.MaxChassisNo = 17;
      }
      else {
        this.MinChassisNo = 17;
        this.MaxChassisNo = 17;
      }
    } else {
      this.backClick();
    }

    if (this.VehicleDetails.Financed && this.VehicleDetails.Financer != '') {

      let Rule: IFilterRule[] = [{
        Field: "InsuranceHelper.Type",
        Operator: "eq",
        Value: "BajajFinancier"
      }]


      /**
       * This data come fron Vehicle details
       * Bind Data Of Vehicle  Financier Code
       */
      this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.ListHelper.List, 'InsuranceHelper.Name', '', Rule).subscribe(res => {
        let Financer = res.Data.Items.find(Financer => Financer.Name == this.VehicleDetails.Financer)

        if (Financer) {
          this.BajajProposalForm.get('CustomerDetail').patchValue({
            FinancierName: Financer.Name,
            FinancierCode: Financer.Code,
          }, { emitEvent: false }
          );
        }

      })
    }
  }

  // dropdown list
  private _fillMasterList() {
    this.GenderList = [];
    // fill gender list
    this._MasterListService
      .getCompanyWiseList('BajajAllianz', 'gender')
      .subscribe((res) => {
        if (res.Success) {
          this.GenderList = res.Data.Items;
        }
      });

    // fill nominee relation list
    this.NomineeRelationList = [];
    this._MasterListService
      .getCompanyWiseList('BajajAllianz', 'nomineerelation')
      .subscribe((res) => {
        if (res.Success) {
          this.NomineeRelationList = res.Data.Items;
        }
      });

    this.InsurerList = [];
    // fill nominee relation list
    this._MasterListService
      .getCompanyWiseList('BajajAllianz', 'bajajallianzpreinsurer')
      .subscribe((res) => {
        if (res.Success) {
          this.InsurerList = res.Data.Items;
        }
      });

    //fill financier code list
    this.FinancierCodeList = [];
    this._MasterListService
      .getCompanyWiseList('BajajAllianz', 'bajajfinanciercode')
      .subscribe((res) => {
        if (res.Success) {
          this.FinancierCodeList = res.Data.Items;
        }
      });
  }

  /**
   * to identify change in value of NomineeDOB and calculate age of Nominee . If Nominee is not an Adult than Appointee details are required
   */
  private _changeInNomineeAge() {
    this.BajajProposalForm.get(
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

  /**
   * Build Main Proposal Create Form
   * @param data
   * @returns
   */
  private _buildBajajProposalForm(data: IBajajMotorDto) {
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
      InsurerResponse: [''],
      CarDetail: this._bajajCarDetailsForm(data.CarDetail),
      PolicyDetail: this._bajajPolicyDetailForm(data.PolicyDetail),
      CustomerDetail: this._bajajCustomerDetailForm(data.CustomerDetail),
    });
    if (data) {
      proposalForm.patchValue(data);
    }
    return proposalForm;
  }

  /**
  * Build Car Details Form
  * @param CarDetailsData
  * @returns  CarDetailData Form
  */
  private _bajajCarDetailsForm(CarDetailsData: IBajajCarDetail) {
    let carDetailsForm = this.fb.group({
      EngineNo: [''],
      ChassisNo: ['', [Validators.minLength(17)]],
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
   * @param PolicyDetailData
   * @returns  PolicyDetailData Form
   */
  private _bajajPolicyDetailForm(PolicyDetailData: IBajajPolicyDetail) {
    let PolicyDetailForm = this.fb.group({
      PreviousPolicyNo: [''],
      PreviousIDV: [''],
      VehicleNo: [''],
      PolicyPeriod: [0],
      PreviousPolicyClaim: [],
      PreviousPolicyNCBPercentage: [0],
      PreviousPolicyType: [''],
      PreviousInsurer: [''],
      PreviousInsurerAddress: [''],
      PreviousPolicyStartDate: [''],
      PreviousPolicyEndDate: [''],
      PreviousPolicyTPStartDate: [''],
      PreviousPolicyTPEndDate: [''],

      PreviousPolicyBiFuel: [false],
      PreviousPolicyZeroDepreciation: [false],
      PreviousPolicyConsumable: [false],
      PreviousPolicyEngineProtector: [false],
      PreviousPolicyInvoiceCover: [false],
      PreviousPolicyTyreCover: [false],

      CurrentTPPolicyNo: [''],
      CurrentTPName: [''],
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
  private _bajajCustomerDetailForm(CustomerDetailData: IBajajCustomerDetail) {
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

      NomineeFirstName: ['', [Validators.required]],
      NomineeMiddleName: [''],
      NomineeLastName: ['', [Validators.required]],
      NomineeRelation: ['', [Validators.required]],
      NomineeDOB: ['', [Validators.required]],
      AppointeeFirstName: ['', [Validators.required]],
      AppointeeMiddleName: [''],
      AppointeeLastName: ['', [Validators.required]],
      AppointeeRelation: ['', [Validators.required]],
      PanNo: ['', [Validators.required]],
      UID: ['', [Validators.required]],
      GSTINNo: ['', [Validators.required]],
      FinancierName: [''],
      FinancierCode: [''],
      FinanceType: [''],
      KYCId: [''],
      KYCVerify: ['']
    });

    if (CustomerDetailData) {
      CustomerDetailForm.patchValue(CustomerDetailData);
    }

    return CustomerDetailForm;
  }

  // change in Pincode
  private _onFormChanges() {
    this.BajajProposalForm.get('CustomerDetail.PinCode').valueChanges.subscribe(
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

    this.BajajProposalForm.get(
      'CustomerDetail.FinancierName'
    ).valueChanges.subscribe((val) => {
      this.FinancierCode$ = this._MasterListService
        .getFilteredFinancierNameList(val)
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
  }

  //#endregion Private methods
}
