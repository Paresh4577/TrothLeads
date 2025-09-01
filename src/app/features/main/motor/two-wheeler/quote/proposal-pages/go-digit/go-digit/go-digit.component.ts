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
import { GoDigitMotorDto, IGoDigitCustomerDetail, IGoDigitMotorDto, IGoDigitPolicyDetail, IGoDigitTwoWheelerDetail } from '@models/dtos/motor-insurance/two-wheeler/go-digit';
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

  //#region decorator

  //#endregion

  //#region public properties
  public pagetitle: string = 'Go-Digit Motor - Two Wheeler';
  public Icon: string;
  public maxDate: Date;
  public nomineeIsAdult = true;
  public rdrPAN: string = "PAN";
  public genderList: any[];
  public nomineeRelationList: any[];
  public financierCodeList: any[];
  public insurerList: any[];
  public minChassisNo: number = 10;
  public maxChassisNo: number = 17;
  public dropdownMaster: dropdown;
  public goDigitProposalForm: FormGroup;
  public pincodes$: Observable<ICityPincodeDto[]>;
  //#endregion

  //#region private properties

  private _pANNum: RegExp = ValidationRegex.PANNumValidationReg;
  private _aadharNum: RegExp = ValidationRegex.UIDNumValidationReg;
  private _step1 = new FormControl();
  private _vehicleDetails: any;
  private _destroy$: Subject<any>;
  private _financierCode$: Observable<any>;
  private _goDigitProposal: IGoDigitMotorDto;
  private _alerts: Alert[] = [];
  public _transactionNo: string;

  //#endregion

  //#region constructor
  /**
   * #region constructor
   * @param _fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   */

  constructor(
    private _fb: FormBuilder,
    private _alertservice: AlertsService,
    private _router: Router,
    private _masterListService: MasterListService, //dropDown Value as per company name
    private _goDigitService: GoDigitService,
    private _datePipe: DatePipe, //to change the format of date
    private _route: ActivatedRoute,
    private _dialogService: DialogService,
    public _dialog: MatDialog,
    private _quoteService: QuoteService,
  ) {
    this._destroy$ = new Subject();
    this.dropdownMaster = new dropdown();
    this._goDigitProposal = new GoDigitMotorDto();

    if (localStorage.getItem('TwoWheeler_motorBuyPolicy')) {
      let motorBuyPolicyDetails = JSON.parse(
        localStorage.getItem('TwoWheeler_motorBuyPolicy')
      );
      this.Icon = motorBuyPolicyDetails.IconURL;
      this._transactionNo = motorBuyPolicyDetails.TransactionNo;
    }

    this.maxDate = new Date();

    this._SetCarAndPolicyDataFromProposalForm(); // Call the function for bind data in form
  }

  // #endregion constructor

  //#region public-getters

  public get f() {
    return this.goDigitProposalForm.controls;
  }

  public get MotorCustomerType(): any {
    return MotorCustomerTypeEnum;
  }

  public get GoDigitType(): any {
    return GoDigitType;
  }

  public get MotorPolicyType(): any {
    return MotorPolicyTypeEnum;
  }

  //#endregion

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this._fillMasterList();

    // main form init
    this.goDigitProposalForm = this._buildGoDigitProposalForm(this._goDigitProposal);

    this._onFormChanges();
    this._changeInNomineeAge();

    // when KYC is done via Redirect URL and kyc_id is obtained than fill the PolicyHolder details from data stored in loacl storage
    // and let user move to next stepper
    let data = this._route.snapshot.queryParams;
    if (data && data['kyc_id']) {
      if (localStorage.getItem('GoDigitCustomerDetail')) {
        this.goDigitProposalForm.get('CustomerDetail').patchValue(
          JSON.parse(localStorage.getItem('GoDigitCustomerDetail'))
        );
        this.goDigitProposalForm.get('CustomerDetail').patchValue({
          KYCId: data['kyc_id'],
        });
      }
    }

    if (this.f['BusinessType'].value == 'Rollover') {
      this.goDigitProposalForm.get('PolicyDetail.PreviousInsurer').patchValue('');
    }
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // back Button
  public backClick(): void {
    this._router.navigate([ROUTING_PATH.MotorTwoWheelerQuote.Plan]);
  }

  // step 1 validation
  public stepOneValidation(): FormControl {
    this._alerts = [];
    if (
      this.goDigitProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Corporate
    ) {
      if (this.goDigitProposalForm.get('CustomerDetail.CompanyName').invalid) {
        this._alerts.push({
          Message: 'Enter Company Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.goDigitProposalForm.get('CustomerDetail.DOB').invalid) {
        this._alerts.push({
          Message: 'Enter Company Start Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    } else if (
      this.goDigitProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Individual
    ) {
      if (
        this.goDigitProposalForm.get('CustomerDetail.Salutation').invalid ||
        this.goDigitProposalForm.get('CustomerDetail.Salutation').value == 0
      ) {
        this._alerts.push({
          Message: 'Select Title',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.goDigitProposalForm.get('CustomerDetail.FirstName').invalid) {
        this._alerts.push({
          Message: 'Enter First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.goDigitProposalForm.get('CustomerDetail.LastName').invalid) {
        this._alerts.push({
          Message: 'Enter Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.goDigitProposalForm.get('CustomerDetail.Gender').invalid) {
        this._alerts.push({
          Message: 'Select Gender',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.goDigitProposalForm.get('CustomerDetail.DOB').invalid) {
        this._alerts.push({
          Message: 'Enter Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.goDigitProposalForm.get('CustomerDetail.PanNo').invalid) {
      this._alerts.push({
        Message: 'Enter PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    } else if (
      !this._pANNum.test(this.goDigitProposalForm.get('CustomerDetail.PanNo').value)
    ) {
      this._alerts.push({
        Message: 'Enter valid PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (
      this.goDigitProposalForm.get('CustomerDetail.UID').value != '' &&
      !this._aadharNum.test(this.goDigitProposalForm.get('CustomerDetail.UID').value)
    ) {
      this._alerts.push({
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

    if (this._alerts.length > 0) {
      this._step1.setErrors({ required: true });
      return this._step1;
    }
    else {
      this._step1.reset();
      return this._step1;
    }
  }

  // step 1 error message
  public stepOneError(): any {

    if (this._alerts.length > 0) {
      this._alertservice.raiseErrors(this._alerts);
      return;
    }
  }

  /**
* Pop Up to select the Insurance Company
* @param type :to identify api of which list is to be called
* @param title : title that will be displayed on PopUp
*/
  public openDiolog(type: string, title: string, index: number = 0): void {
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
          this.goDigitProposalForm.get('CustomerDetail').patchValue({
            FinancierName: result.Name,
            FinancierCode: result.Code,
          });
        }
      }
    });
  }

  // bind the data of FinancierCode [autoComplete]
  public PatchFinancierCode(event: MatAutocompleteSelectedEvent): void {
    this.goDigitProposalForm.get('CustomerDetail').patchValue(
      {
        FinancierName: event.option.value.Name,
        FinancierCode: event.option.value.Code,
      },
      { emitEvent: false }
    );
  }

  // Pincode autocomplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.goDigitProposalForm.get('CustomerDetail').patchValue({
      PinCode: event.option.value.PinCode,
    });
  }

  // pop up for pincode
  public openDiologPincode(type: string, title: string): void {
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
          this.goDigitProposalForm.get('CustomerDetail').patchValue({
            PinCode: result.PinCode,
          });
        }
      }
    });
  }

  // clear pincode
  public clear(name: string): void {
    this.goDigitProposalForm.get(name).setValue('');
  }

  public clearFinancierCode(): void {
    this.goDigitProposalForm.get('CustomerDetail').patchValue(
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
  public ProceedToPay(): void {
    let errorMessage: Alert[] = [];
    errorMessage = this._stepTwoValidation();
    if (errorMessage.length > 0) {
      this._alertservice.raiseErrors(errorMessage);
      return;
    }

    this.goDigitProposalForm.get('CustomerDetail').patchValue({
      DOB: this._datePipe.transform(
        this.goDigitProposalForm.get('CustomerDetail').getRawValue().DOB,
        'yyyy-MM-dd'
      ),
    });
    this._goDigitService
      .createProposal(this.goDigitProposalForm.value)
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

  private _stepTwoValidation(): Alert[] {
    let error: Alert[] = [];

    // Finance Type
    if (this.goDigitProposalForm.get('CustomerDetail.FinancierName').value != "" && (this.goDigitProposalForm.get('CustomerDetail.FinanceType').value == "" || this.goDigitProposalForm.get('CustomerDetail.FinanceType').value == null)) {
      error.push({
        Message: 'Select Finance Type',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Financier Name
    if (this.goDigitProposalForm.get('CustomerDetail.FinanceType').value != "" && (this.goDigitProposalForm.get('CustomerDetail.FinancierName').value == "" || this.goDigitProposalForm.get('CustomerDetail.FinancierName').value == null)) {
      error.push({
        Message: 'Financier Name is Required',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // EngineNo
    if (this.goDigitProposalForm.get('TwoWheelerDetail.EngineNo').value == "" || this.goDigitProposalForm.get('TwoWheelerDetail.EngineNo').value == null) {
      error.push({
        Message: 'Enter Engine No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // ChassisNo
    if (this.goDigitProposalForm.get('TwoWheelerDetail.ChassisNo').value == "" || this.goDigitProposalForm.get('TwoWheelerDetail.ChassisNo').value == null) {
      error.push({
        Message: 'Enter Chassis No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // To store Motor Quote Data
    let MotorQuotationData = JSON.parse(localStorage.getItem('TwoWheelerMotorInsurance'))

    if (MotorQuotationData.BusinessType == MotorBusinessTypeEnum['Roll Over']) {
      if (this.goDigitProposalForm.get('TwoWheelerDetail.ChassisNo').value.length != this.maxChassisNo && this.goDigitProposalForm.get('TwoWheelerDetail.ChassisNo').value.length != this.minChassisNo) {
        error.push({
          Message: 'Chassis No. must be either ' + this.minChassisNo + ' or ' + this.maxChassisNo + ' characters',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
    else {
      if (this.goDigitProposalForm.get('TwoWheelerDetail.ChassisNo').value.length != this.maxChassisNo) {
        error.push({
          Message: 'Chassis No. must be of ' + this.maxChassisNo + ' characters',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // if (this.GoDigitProposalForm.get('TwoWheelerDetail.ChassisNo').value.length > this.MaxChassisNo || this.GoDigitProposalForm.get('TwoWheelerDetail.ChassisNo').value.length < this.MinChassisNo) {
    //   error.push({
    //     Message: 'Chassis No. must be between of ' + this.MinChassisNo + ' to ' + this.MaxChassisNo + ' characters',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }

    if (this.f['BusinessType'].value == 'Rollover') {
      // Previous Policy No
      if (!this.goDigitProposalForm.get('PolicyDetail.PreviousPolicyNo').value) {
        error.push({
          Message: 'Enter Previous Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.goDigitProposalForm.get('PolicyDetail.PreviousInsurer').value) {
        error.push({
          Message: 'Enter Previous Insurer',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.f['PolicyType'].value == this.MotorPolicyType['Own Damage']) {
      // Previous Policy No
      if (!this.goDigitProposalForm.get('PolicyDetail.CurrentTPPolicyNo').value) {
        error.push({
          Message: 'Enter Current TP Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.goDigitProposalForm.get('PolicyDetail.CurrentTPName').value) {
        error.push({
          Message: 'Select Current TP Insurer',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // if ((this.f['BusinessType'].value == 'Rollover') &&
    //   (this.f['PolicyType'].value == this.MotorPolicyType['Comprehensive'] || this.f['PolicyType'].value == this.MotorPolicyType['Own Damage'])) {


    //   if (this.f['TwoWheelerDetail'].value.ZeroDepreciation) {
    //     if (!this.GoDigitProposalForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').value) {
    //       error.push({
    //         Message: "You are not eligible to purchase the Zero Depreciation add-on as you didn't purchase this add-on in the previous policy.",
    //         CanDismiss: false,
    //         AutoClose: false,
    //       });
    //     }
    //   }

    //   if (this.f['TwoWheelerDetail'].value.InvoiceCover) {
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
    if (this.goDigitProposalForm.get('CustomerDetail.Address').invalid) {
      error.push({
        Message: 'Enter Street',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Address 1
    if (this.goDigitProposalForm.get('CustomerDetail.Address1').invalid) {
      error.push({
        Message: 'Enter Area',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Address 2
    if (this.goDigitProposalForm.get('CustomerDetail.Address2').invalid) {
      error.push({
        Message: 'Enter Location',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // PinCode
    if (this.goDigitProposalForm.get('CustomerDetail.PinCode').invalid) {
      error.push({
        Message: 'Enter PIN Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // MobileNo
    if (this.goDigitProposalForm.get('CustomerDetail.MobileNo').invalid) {
      error.push({
        Message: 'Enter Mobile',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Email
    if (this.goDigitProposalForm.get('CustomerDetail.Email').invalid) {
      error.push({
        Message: 'Enter Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeFirstName
    if (this.goDigitProposalForm.get('CustomerDetail.NomineeFirstName').invalid && this.goDigitProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeLastName
    if (this.goDigitProposalForm.get('CustomerDetail.NomineeLastName').invalid && this.goDigitProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeRelation
    if (this.goDigitProposalForm.get('CustomerDetail.NomineeRelation').invalid && this.goDigitProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Select Nominee Relation',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeDOB
    if (this.goDigitProposalForm.get('CustomerDetail.NomineeDOB').invalid && this.goDigitProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Date Of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (!this.nomineeIsAdult && this.goDigitProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      // AppointeeFirstName
      if (
        this.goDigitProposalForm.get('CustomerDetail.AppointeeFirstName').invalid
      ) {
        error.push({
          Message: 'Enter Appointee First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeLastName
      if (
        this.goDigitProposalForm.get('CustomerDetail.AppointeeLastName').invalid
      ) {
        error.push({
          Message: 'Enter Appointee Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeRelation
      if (
        this.goDigitProposalForm.get('CustomerDetail.AppointeeRelation').invalid
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
  private _SetCarAndPolicyDataFromProposalForm(): void {
    if (localStorage.getItem('TwoWheelerMotorInsurance') && localStorage.getItem('TwoWheelerVehicleDetails') && localStorage.getItem('TwoWheeler_motorBuyPolicy')) {
      // To store Motor Quote Data
      let MotorQuotationData = JSON.parse(
        localStorage.getItem('TwoWheelerMotorInsurance')
      );
      //To store Vehicle details from Quote Page
      this._vehicleDetails = JSON.parse(localStorage.getItem('TwoWheelerVehicleDetails'));

      // to store selected policy detail
      let policyDetails = JSON.parse(localStorage.getItem('TwoWheeler_motorBuyPolicy'));

      //Set Car details Data In DTO
      this._goDigitProposal.CustomerDetail = MotorQuotationData.CustomerDetail;
      this._goDigitProposal.TwoWheelerDetail = MotorQuotationData.TwoWheelerDetail;
      this._goDigitProposal.PolicyDetail = MotorQuotationData.PolicyDetail;
      this._goDigitProposal.BusinessType = MotorQuotationData.BusinessType;
      this._goDigitProposal.PolicyType = MotorQuotationData.PolicyType;
      this._goDigitProposal.RTOCode = MotorQuotationData.RTOCode;
      this._goDigitProposal.TransactionNo = this._transactionNo;
      this._goDigitProposal.PolicyStartDate = MotorQuotationData.PolicyStartDate;
      this._goDigitProposal.ProposalDate = MotorQuotationData.ProposalDate;
      this._goDigitProposal.RegistrationDate = MotorQuotationData.RegistrationDate;
      this._goDigitProposal.VehicleSubModelId = MotorQuotationData.VehicleSubModelId;
      this._goDigitProposal.ProductCode = policyDetails.ProductCode;
      this._goDigitProposal.TwoWheelerDetail.EngineNo = this._vehicleDetails.EngineNo;
      this._goDigitProposal.TwoWheelerDetail.ChassisNo = this._vehicleDetails.ChassisNo;
      this._goDigitProposal.TwoWheelerDetail.VehicleIDV = policyDetails.CalIDVAmount;
      this._goDigitProposal.Insurer = policyDetails.Insurer;
      this._goDigitProposal.VehicleCode = policyDetails.VehicleCode;

      // for Get and Set Electrical SumInsure and Non Electrical SumInsure value from "policyDetails.CalcPremium.addonCovers"
      if (policyDetails.CalcPremium.addonCovers.length > 0) {

        let ElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "Electrical_Accessories_Premium" && x.Key == "Accessories");
        let NonElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "NonElectrical_Accessories_Premium" && x.Key == "Accessories");

        if (ElectricalPremium.length > 0) {
          this._goDigitProposal.TwoWheelerDetail.ElectricalAccessories = ElectricalPremium[0].SumInsure;
        }

        if (NonElectricalPremium.length > 0) {
          this._goDigitProposal.TwoWheelerDetail.NonElectricalAccessories = NonElectricalPremium[0].SumInsure;
        }
      }

      let _proposalType = MotorQuotationData.BusinessType;
      if (_proposalType == MotorBusinessTypeEnum['Roll Over']) {
        this.minChassisNo = 10;
        this.maxChassisNo = 17;
      }
      else {
        this.minChassisNo = 17;
        this.maxChassisNo = 17;
      }
    } else {
      this.backClick();
    }

    if (this._vehicleDetails.Financed && this._vehicleDetails.Financer != '') {

      let Rule: IFilterRule[] = [{
        Field: "InsuranceHelper.Type",
        Operator: "eq",
        Value: "GoDigitFinancier"
      }]


      /**
       * This data come fron Vehicle details
       * Bind Data Of Vehicle  Financier Code
       */
      this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.ListHelper.List, 'InsuranceHelper.Name', '', Rule).subscribe(res => {
        let Financer = res.Data.Items.find(Financer => Financer.Name == this._vehicleDetails.Financer)

        if (Financer) {
          this.goDigitProposalForm.get('CustomerDetail').patchValue({
            FinancierName: Financer.Name,
            FinancierCode: Financer.Code,
          }, { emitEvent: false }
          );
        }

      })
    }
  }

  // dropdown list
  private _fillMasterList(): void {
    this.genderList = [];
    // fill gender list
    this._masterListService
      .getCompanyWiseList('GoDigit', 'gender')
      .subscribe((res) => {
        if (res.Success) {
          this.genderList = res.Data.Items;
        }
      });

    // fill nominee relation list
    this.nomineeRelationList = [];
    this._masterListService
      .getCompanyWiseList('GoDigit', 'nomineerelation')
      .subscribe((res) => {
        if (res.Success) {
          this.nomineeRelationList = res.Data.Items;
        }
      });

    this.insurerList = [];
    // fill nominee relation list
    this._masterListService
      .getCompanyWiseList('GoDigit', 'GoDigitpreinsurer')
      .subscribe((res) => {
        if (res.Success) {
          this.insurerList = res.Data.Items;
        }
      });

    //fill financier code list
    this.financierCodeList = [];
    this._masterListService
      .getCompanyWiseList('GoDigit', 'GoDigitfinanciercode')
      .subscribe((res) => {
        if (res.Success) {
          this.financierCodeList = res.Data.Items;
        }
      });
  }

  /**
   * to identify change in value of NomineeDOB and calculate age of Nominee . If Nominee is not an Adult than Appointee details are required
   */
  private _changeInNomineeAge(): void {
    this.goDigitProposalForm.get('CustomerDetail.NomineeDOB').valueChanges.subscribe((res) => {
      let ageOfNominee = moment(new Date()).diff(res, 'year');

      if (ageOfNominee < 18) {
        this.nomineeIsAdult = false;
      } else {
        this.nomineeIsAdult = true;
      }
    });
  }

  /**
  * Build Main Proposal Create Form
  * @param data
  * @returns
  */
  private _buildGoDigitProposalForm(data: IGoDigitMotorDto): FormGroup {
    let proposalForm = this._fb.group({
      VehicleType: ["TwoWheeler"],
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
      TwoWheelerDetail: this._GoDigitTwoWheelerDetailsForm(data.TwoWheelerDetail),
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
  * @param TwoWheelerDetailsData
  * @returns  TwoWheelerDetailData Form
  */
  private _GoDigitTwoWheelerDetailsForm(TwoWheelerDetailsData: IGoDigitTwoWheelerDetail): FormGroup {
    let TwoWheelerDetailsForm = this._fb.group({
      EngineNo: [''],
      ChassisNo: ['', [Validators.minLength(17)]],
      YearOfManufacture: [0],
      DriverCover: [],
      ZeroDepreciation: [],
      Accessories: [],
      ElectricalAccessories: [0],
      NonElectricalAccessories: [0],
      NCBProtection: [],
      InvoiceCover: [],
      RoadsideAssistance: [],
      EngineProtector: [],
      DateofFirstRegistration: [''],
      VehicleIDV: [0],
      PersonalAccident: [],
    });

    if (TwoWheelerDetailsData) {
      TwoWheelerDetailsForm.patchValue(TwoWheelerDetailsData);
    }

    return TwoWheelerDetailsForm;
  }

  /**
   * Build Policy Details Form
   * @param PolicyDetailData
   * @returns  PolicyDetailData Form
   */
  private _GoDigitPolicyDetailForm(PolicyDetailData: IGoDigitPolicyDetail): FormGroup {
    let PolicyDetailForm = this._fb.group({
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
  private _GoDigitCustomerDetailForm(CustomerDetailData: IGoDigitCustomerDetail): FormGroup {
    let CustomerDetailForm = this._fb.group({
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
  private _onFormChanges(): void {
    this.goDigitProposalForm.get('CustomerDetail.PinCode').valueChanges.subscribe(
      (val) => {
        this.pincodes$ = this._masterListService
          .getFilteredPincodeList(val)
          .pipe(
            takeUntil(this._destroy$),
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

    this.goDigitProposalForm.get('CustomerDetail.FinancierName').valueChanges.subscribe((val) => {
      this._financierCode$ = this._masterListService
        .getFilteredFinancierNameList(val)
        .pipe(
          takeUntil(this._destroy$),
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
