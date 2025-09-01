import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { dropdown } from '@config/dropdown.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { DialogService } from '@lib/services/dialog.service';
import { Alert, IFilterRule } from '@models/common';
import { ICityPincodeDto } from '@models/dtos/core';
import { GoDigitMotorDto, IGoDigitCarDetail, IGoDigitCustomerDetail, IGoDigitMotorDto, IGoDigitPolicyDetail } from '@models/dtos/motor-insurance/go-digit';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { QuoteService } from 'src/app/features/main/health/quote/quote.service';
import { GoDigitService } from '../go-digit.service';
import { MasterListService } from '@lib/services/master-list.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MotorCustomerTypeEnum } from 'src/app/shared/enums/MotorCustomerType.enum';
import { GoDigitType } from '@config/motor-quote/Go-Digit-Type.config';
import { MotorPolicyTypeEnum } from 'src/app/shared/enums/MotorPolicyType.enum';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { MotorBusinessTypeEnum } from 'src/app/shared/enums/MotorBusinessType.enum';
import * as moment from 'moment';
import { API_ENDPOINTS } from '@config/api-endpoints.config';

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
  pagetitle: string = 'Go-Digit Motor';
  Icon: string;
  TransactionNo: string;


  // ReGex
  PANNum: RegExp = ValidationRegex.PANNumValidationReg;
  AadharNum: RegExp = ValidationRegex.UIDNumValidationReg;

  // date
  maxDate: Date;

  //boolean
  NomineeIsAdult = true;
  rdrPAN: string = "PAN";

  // formControl
  step1 = new FormControl();

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
  GoDigitProposal: IGoDigitMotorDto;
  GoDigitProposalForm: FormGroup;

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
    private _GoDigitService: GoDigitService,
    private _datePipe: DatePipe, //to change the format of date
    private _route: ActivatedRoute,
    private _dialogService: DialogService,
    public _dialog: MatDialog,
    private _quoteService: QuoteService,
  ) {
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();
    this.GoDigitProposal = new GoDigitMotorDto();

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
    this.GoDigitProposalForm = this._buildGoDigitProposalForm(this.GoDigitProposal);

    this._onFormChanges();
    this._changeInNomineeAge();

    // when KYC is done via Redirect URL and kyc_id is obtained than fill the PolicyHolder details from data stored in loacl storage
    // and let user move to next stepper
    let data = this._route.snapshot.queryParams;
    if (data && data['kyc_id']) {
      if (localStorage.getItem('GoDigitCustomerDetail')) {
        this.GoDigitProposalForm.get('CustomerDetail').patchValue(
          JSON.parse(localStorage.getItem('GoDigitCustomerDetail'))
        );
        this.GoDigitProposalForm.get('CustomerDetail').patchValue({
          KYCId: data['kyc_id'],
        });
      }
    }

    if (this.f['BusinessType'].value == 'Rollover') {
      this.GoDigitProposalForm.get('PolicyDetail.PreviousInsurer').patchValue('');
    }
  }

  //#endregion lifecyclehooks


  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  get f() {
    return this.GoDigitProposalForm.controls;
  }

  get MotorCustomerType() {
    return MotorCustomerTypeEnum;
  }

  get GoDigitType() {
    return GoDigitType;
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
      this.GoDigitProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Corporate
    ) {
      if (this.GoDigitProposalForm.get('CustomerDetail.CompanyName').invalid) {
        this.alerts.push({
          Message: 'Enter Company Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.GoDigitProposalForm.get('CustomerDetail.DOB').invalid) {
        this.alerts.push({
          Message: 'Enter Company Start Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    } else if (
      this.GoDigitProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Individual
    ) {
      if (
        this.GoDigitProposalForm.get('CustomerDetail.Salutation').invalid ||
        this.GoDigitProposalForm.get('CustomerDetail.Salutation').value == 0
      ) {
        this.alerts.push({
          Message: 'Select Title',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.GoDigitProposalForm.get('CustomerDetail.FirstName').invalid) {
        this.alerts.push({
          Message: 'Enter First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.GoDigitProposalForm.get('CustomerDetail.LastName').invalid) {
        this.alerts.push({
          Message: 'Enter Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.GoDigitProposalForm.get('CustomerDetail.Gender').invalid) {
        this.alerts.push({
          Message: 'Select Gender',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.GoDigitProposalForm.get('CustomerDetail.DOB').invalid) {
        this.alerts.push({
          Message: 'Enter Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.GoDigitProposalForm.get('CustomerDetail.PanNo').invalid) {
      this.alerts.push({
        Message: 'Enter PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    } else if (
      !this.PANNum.test(this.GoDigitProposalForm.get('CustomerDetail.PanNo').value)
    ) {
      this.alerts.push({
        Message: 'Enter valid PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (
      this.GoDigitProposalForm.get('CustomerDetail.UID').value != '' &&
      !this.AadharNum.test(this.GoDigitProposalForm.get('CustomerDetail.UID').value)
    ) {
      this.alerts.push({
        Message: 'Enter valid Aadhar',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // if (this.GoDigitProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate &&
    //   this.GoDigitProposalForm.get('CustomerDetail.CompanyName').value == '') {
    //   this.alerts.push({
    //     Message: 'Select Company Type',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }

    if (this.alerts.length > 0) {
      this.step1.setErrors({ required: true });
      return this.step1;
    }
    else {
      this.step1.reset();
      return this.step1;
    }
  }

  // step 1 error message
  public stepOneError() {

    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
      return;
    }
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
          this.GoDigitProposalForm.get('CustomerDetail').patchValue({
            FinancierName: result.Name,
            FinancierCode: result.Code,
          });
        }
      }
    });
  }

  // bind the data of FinancierCode [autoComplete]
  public PatchFinancierCode(event: MatAutocompleteSelectedEvent): void {
    this.GoDigitProposalForm.get('CustomerDetail').patchValue(
      {
        FinancierName: event.option.value.Name,
        FinancierCode: event.option.value.Code,
      },
      { emitEvent: false }
    );
  }

  // Pincode autocomplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.GoDigitProposalForm.get('CustomerDetail').patchValue({
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
          this.GoDigitProposalForm.get('CustomerDetail').patchValue({
            PinCode: result.PinCode,
          });
        }
      }
    });
  }

  // clear pincode
  public clear(name: string): void {
    this.GoDigitProposalForm.get(name).setValue('');
  }

  public clearFinancierCode() {
    this.GoDigitProposalForm.get('CustomerDetail').patchValue(
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

    this.GoDigitProposalForm.get('CustomerDetail').patchValue({
      DOB: this._datePipe.transform(
        this.GoDigitProposalForm.get('CustomerDetail').getRawValue().DOB,
        'yyyy-MM-dd'
      ),
    });
    this._GoDigitService
      .createProposal(this.GoDigitProposalForm.value)
      .subscribe((res) => {
        if (res.Success) {
          localStorage.removeItem('GoDigitpolicyHolder');
          this._alertservice.raiseSuccessAlert(res.Message);

          if (res.Data.KYCUrl != null && res.Data.KYCUrl != "") {
            location.href = res.Data.KYCUrl;
          }
          else if (res.Data.PaymentUrl != null && res.Data.PaymentUrl != "") {
            location.href = res.Data.PaymentUrl;
          }
          else {
            this._router.navigate([ROUTING_PATH.SideBar.MotorPoliciesList]);
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
    if (this.GoDigitProposalForm.get('CustomerDetail.FinancierName').value != "" && (this.GoDigitProposalForm.get('CustomerDetail.FinanceType').value == "" || this.GoDigitProposalForm.get('CustomerDetail.FinanceType').value == null)) {
      error.push({
        Message: 'Select Finance Type',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Financier Name
    if (this.GoDigitProposalForm.get('CustomerDetail.FinanceType').value != "" && (this.GoDigitProposalForm.get('CustomerDetail.FinancierName').value == "" || this.GoDigitProposalForm.get('CustomerDetail.FinancierName').value == null)) {
      error.push({
        Message: 'Financier Name is Required',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // EngineNo
    if (this.GoDigitProposalForm.get('CarDetail.EngineNo').value == "" || this.GoDigitProposalForm.get('CarDetail.EngineNo').value == null) {
      error.push({
        Message: 'Enter Engine No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // ChassisNo
    if (this.GoDigitProposalForm.get('CarDetail.ChassisNo').value == "" || this.GoDigitProposalForm.get('CarDetail.ChassisNo').value == null) {
      error.push({
        Message: 'Enter Chassis No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // To store Motor Quote Data
    let MotorQuotationData = JSON.parse(localStorage.getItem('MotorInsurance'))

    if (MotorQuotationData.BusinessType == MotorBusinessTypeEnum['Roll Over']) {
      if (this.GoDigitProposalForm.get('CarDetail.ChassisNo').value.length != this.MaxChassisNo && this.GoDigitProposalForm.get('CarDetail.ChassisNo').value.length != this.MinChassisNo) {
        error.push({
          Message: 'Chassis No. must be either ' + this.MinChassisNo + ' or ' + this.MaxChassisNo + ' characters',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
    else {
      if (this.GoDigitProposalForm.get('CarDetail.ChassisNo').value.length != this.MaxChassisNo) {
        error.push({
          Message: 'Chassis No. must be of ' + this.MaxChassisNo + ' characters',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // if (this.GoDigitProposalForm.get('CarDetail.ChassisNo').value.length > this.MaxChassisNo || this.GoDigitProposalForm.get('CarDetail.ChassisNo').value.length < this.MinChassisNo) {
    //   error.push({
    //     Message: 'Chassis No. must be between of ' + this.MinChassisNo + ' to ' + this.MaxChassisNo + ' characters',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }

    if (this.f['BusinessType'].value == 'Rollover') {
      // Previous Policy No
      if (!this.GoDigitProposalForm.get('PolicyDetail.PreviousPolicyNo').value) {
        error.push({
          Message: 'Enter Previous Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.GoDigitProposalForm.get('PolicyDetail.PreviousInsurer').value) {
        error.push({
          Message: 'Enter Previous Insurer',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.f['PolicyType'].value == this.MotorPolicyType['Own Damage']) {
      // Previous Policy No
      if (!this.GoDigitProposalForm.get('PolicyDetail.CurrentTPPolicyNo').value) {
        error.push({
          Message: 'Enter Current TP Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
        if (!this.GoDigitProposalForm.get('PolicyDetail.CurrentTPInsurer').value) {
      }
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
    //     if (!this.GoDigitProposalForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').value) {
    //       error.push({
    //         Message: "You are not eligible to purchase the Zero Depreciation add-on as you didn't purchase this add-on in the previous policy.",
    //         CanDismiss: false,
    //         AutoClose: false,
    //       });
    //     }
    //   }

    //   if (this.f['CarDetail'].value.InvoiceCover) {
    //     if (!this.GoDigitProposalForm.get('PolicyDetail.PreviousPolicyInvoiceCover').value) {
    //       error.push({
    //         Message: "You are not eligible to purchase the Invoice Cover add-on as you didn't purchase this add-on in the previous policy.",
    //         CanDismiss: false,
    //         AutoClose: false,
    //       });
    //     }
    //   }

    // }

    // Address
    if (this.GoDigitProposalForm.get('CustomerDetail.Address').invalid) {
      error.push({
        Message: 'Enter Street',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Address 1
    if (this.GoDigitProposalForm.get('CustomerDetail.Address1').invalid) {
      error.push({
        Message: 'Enter Area',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Address 2
    if (this.GoDigitProposalForm.get('CustomerDetail.Address2').invalid) {
      error.push({
        Message: 'Enter Location',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // PinCode
    if (this.GoDigitProposalForm.get('CustomerDetail.PinCode').invalid) {
      error.push({
        Message: 'Enter PIN Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // MobileNo
    if (this.GoDigitProposalForm.get('CustomerDetail.MobileNo').invalid) {
      error.push({
        Message: 'Enter Mobile',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Email
    if (this.GoDigitProposalForm.get('CustomerDetail.Email').invalid) {
      error.push({
        Message: 'Enter Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeFirstName
    if (this.GoDigitProposalForm.get('CustomerDetail.NomineeFirstName').invalid && this.GoDigitProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeLastName
    if (this.GoDigitProposalForm.get('CustomerDetail.NomineeLastName').invalid && this.GoDigitProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeRelation
    if (this.GoDigitProposalForm.get('CustomerDetail.NomineeRelation').invalid && this.GoDigitProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Select Nominee Relation',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeDOB
    if (this.GoDigitProposalForm.get('CustomerDetail.NomineeDOB').invalid && this.GoDigitProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Date Of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (!this.NomineeIsAdult && this.GoDigitProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      // AppointeeFirstName
      if (
        this.GoDigitProposalForm.get('CustomerDetail.AppointeeFirstName').invalid
      ) {
        error.push({
          Message: 'Enter Appointee First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeLastName
      if (
        this.GoDigitProposalForm.get('CustomerDetail.AppointeeLastName').invalid
      ) {
        error.push({
          Message: 'Enter Appointee Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeRelation
      if (
        this.GoDigitProposalForm.get('CustomerDetail.AppointeeRelation').invalid
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
      this.GoDigitProposal.CustomerDetail = MotorQuotationData.CustomerDetail;
      this.GoDigitProposal.CarDetail = MotorQuotationData.CarDetail;
      this.GoDigitProposal.PolicyDetail = MotorQuotationData.PolicyDetail;
      this.GoDigitProposal.BusinessType = MotorQuotationData.BusinessType;
      this.GoDigitProposal.PolicyType = MotorQuotationData.PolicyType;
      this.GoDigitProposal.RTOCode = MotorQuotationData.RTOCode;
      this.GoDigitProposal.TransactionNo = this.TransactionNo;
      this.GoDigitProposal.PolicyStartDate = MotorQuotationData.PolicyStartDate;
      this.GoDigitProposal.ProposalDate = MotorQuotationData.ProposalDate;
      this.GoDigitProposal.RegistrationDate = MotorQuotationData.RegistrationDate;
      this.GoDigitProposal.VehicleSubModelId = MotorQuotationData.VehicleSubModelId;
      this.GoDigitProposal.ProductCode = policyDetails.ProductCode;
      this.GoDigitProposal.CarDetail.EngineNo = this.VehicleDetails.EngineNo;
      this.GoDigitProposal.CarDetail.ChassisNo = this.VehicleDetails.ChassisNo;
      this.GoDigitProposal.CarDetail.VehicleIDV = policyDetails.CalIDVAmount;
      this.GoDigitProposal.Insurer = policyDetails.Insurer;
      this.GoDigitProposal.VehicleCode = policyDetails.VehicleCode;

      // for Get and Set Electrical SumInsure and Non Electrical SumInsure value from "policyDetails.CalcPremium.addonCovers"
      if (policyDetails.CalcPremium.addonCovers.length > 0) {

        let ElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "Electrical_Accessories_Premium" && x.Key == "Accessories");
        let NonElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "NonElectrical_Accessories_Premium" && x.Key == "Accessories");

        if (ElectricalPremium.length > 0) {
          this.GoDigitProposal.CarDetail.ElectricalAccessories = ElectricalPremium[0].SumInsure;
        }

        if (NonElectricalPremium.length > 0) {
          this.GoDigitProposal.CarDetail.NonElectricalAccessories = NonElectricalPremium[0].SumInsure;
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
        Value: "GoDigitFinancier"
      }]


      /**
       * This data come fron Vehicle details
       * Bind Data Of Vehicle  Financier Code
       */
      this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.ListHelper.List, 'InsuranceHelper.Name', '', Rule).subscribe(res => {
        let Financer = res.Data.Items.find(Financer => Financer.Name == this.VehicleDetails.Financer)

        if (Financer) {
          this.GoDigitProposalForm.get('CustomerDetail').patchValue({
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
      .getCompanyWiseList('GoDigit', 'gender')
      .subscribe((res) => {
        if (res.Success) {
          this.GenderList = res.Data.Items;
        }
      });

    // fill nominee relation list
    this.NomineeRelationList = [];
    this._MasterListService
      .getCompanyWiseList('GoDigit', 'nomineerelation')
      .subscribe((res) => {
        if (res.Success) {
          this.NomineeRelationList = res.Data.Items;
        }
      });

    this.InsurerList = [];
    // fill nominee relation list
    this._MasterListService
      .getCompanyWiseList('GoDigit', 'godigitpreinsurer')
      .subscribe((res) => {
        if (res.Success) {
          this.InsurerList = res.Data.Items;
        }
      });

    //fill financier code list
    this.FinancierCodeList = [];
    this._MasterListService
      .getCompanyWiseList('GoDigit', 'GoDigitfinanciercode')
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
    this.GoDigitProposalForm.get('CustomerDetail.NomineeDOB').valueChanges.subscribe((res) => {
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
  private _buildGoDigitProposalForm(data: IGoDigitMotorDto) {
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
      CarDetail: this._GoDigitCarDetailsForm(data.CarDetail),
      PolicyDetail: this._GoDigitPolicyDetailForm(data.PolicyDetail),
      CustomerDetail: this._GoDigitCustomerDetailForm(data.CustomerDetail),
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
  private _GoDigitCarDetailsForm(CarDetailsData: IGoDigitCarDetail) {
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
  private _GoDigitPolicyDetailForm(PolicyDetailData: IGoDigitPolicyDetail) {
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

      PreviousPolicyZeroDepreciation: [false],
      PreviousPolicyConsumable: [false],
      PreviousPolicyEngineProtector: [false],
      PreviousPolicyBiFuel: [false],
      PreviousPolicyInvoiceCover: [false],
      PreviousPolicyTyreCover: [false],

      CurrentTPPolicyNo: [''],
      CurrentTPInsurer: [''],
      CurrentTPName: [''],
      CurrentTPTenure: [''],
      CurrentTPPolicyType: [''],
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
  private _GoDigitCustomerDetailForm(CustomerDetailData: IGoDigitCustomerDetail) {
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
      PanNo: ['', [Validators.required]],
      UID: ['', [Validators.required]],
      GSTINNo: ['', [Validators.required]],
      FinancierName: [''],
      FinanceType: [''],
      FinancierCode: ['']
    });

    if (CustomerDetailData) {
      CustomerDetailForm.patchValue(CustomerDetailData);
    }

    return CustomerDetailForm;
  }

  // change in Pincode
  private _onFormChanges() {
    this.GoDigitProposalForm.get('CustomerDetail.PinCode').valueChanges.subscribe(
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

    this.GoDigitProposalForm.get('CustomerDetail.FinancierName').valueChanges.subscribe((val) => {
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
