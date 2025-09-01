import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { dropdown } from '@config/dropdown.config';
import { BajajFinanceType } from '@config/motor-quote/Bajaj-Finance-Type.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, IFilterRule } from '@models/common';
import { ICityPincodeDto } from '@models/dtos/core';
import { BajajMotorDto, IBajajCustomerDetail, IBajajMotorDto, IBajajPolicyDetail, IBajajTwoWheelerDetail } from '@models/dtos/motor-insurance/two-wheeler/bajaj';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { MotorCustomerTypeEnum } from 'src/app/shared/enums/MotorCustomerType.enum';
import { MotorPolicyTypeEnum } from 'src/app/shared/enums/MotorPolicyType.enum';
import { BajajService } from '../bajaj.service';
import { DatePipe } from '@angular/common';
import { DialogService } from '@lib/services/dialog.service';
import { MotorBusinessTypeEnum } from 'src/app/shared/enums/MotorBusinessType.enum';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MatStepper } from '@angular/material/stepper';
import { BajajMotorKYCDto, IBajajMotorKYCDto } from '@models/dtos/motor-insurance/KYC/Bajaj/bajaj-motor-kyc-dto';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_DATE_FORMATS } from '@config/my-date-formats';

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
  //#region decorator
  //#endregion

  //#region public properties

  public pagetitle: string = 'Bajaj Allianz Motor';
  public icon: string;
  public maxDate: Date;
  public isKYC: boolean = false;
  public nomineeIsAdult = true;
  public rdrPAN: string = "PAN";
  public minChassisNo: number = 10;
  public maxChassisNo: number = 17;
  public genderList: any[];
  public nomineeRelationList: any[];
  public financierCodeList: any[];
  public insurerList: any[];
  public dropdownMaster: dropdown;
  public financierCode$: Observable<any>;
  public pincodes$: Observable<ICityPincodeDto[]>;
  public bajajProposalForm: FormGroup;

  //#endregion

  //#region private properties

  private _pANNum: RegExp = ValidationRegex.PANNumValidationReg;
  private _aadharNum: RegExp = ValidationRegex.UIDNumValidationReg;
  private _step1 = new FormControl();
  private _kycFlag: number = 0;
  private _vehicleDetails: any;
  private _destroy$: Subject<any>;
  private _bajajProposal: IBajajMotorDto;
  private _alerts: Alert[] = [];
  private _transactionNo: string;

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
    private _bajajService: BajajService,
    private _datePipe: DatePipe, //to change the format of date
    private _route: ActivatedRoute,
    private _dialogService: DialogService,
    public _dialog: MatDialog,
  ) {
    this._destroy$ = new Subject();
    this.dropdownMaster = new dropdown();
    this._bajajProposal = new BajajMotorDto();

    if (localStorage.getItem('TwoWheeler_motorBuyPolicy')) {
      let motorBuyPolicyDetails = JSON.parse(localStorage.getItem('TwoWheeler_motorBuyPolicy'));
      this.icon = motorBuyPolicyDetails.IconURL;
      this._transactionNo = motorBuyPolicyDetails.TransactionNo;
    }

    this.maxDate = new Date();

    this._SetTwoWheelerAndPolicyDataFromProposalForm(); // Call the function for bind data in form
  }

  //#endregion

  //#region public-getters

  public get f(): any {
    return this.bajajProposalForm.controls;
  }

  public get MotorCustomerType(): any {
    return MotorCustomerTypeEnum;
  }

  public get BajajFinanceType(): any {
    return BajajFinanceType;
  }

  public get MotorPolicyType(): any {
    return MotorPolicyTypeEnum;
  }

  //#endregion

  //#region life cycle hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  //On Init
  ngOnInit(): void {
    this._fillMasterList();

    // main form init
    this.bajajProposalForm = this._buildBajajProposalForm(this._bajajProposal);

    this._onFormChanges();
    this._changeInNomineeAge();

    // when KYC is done via Redirect URL and kyc_id is obtained than fill the PolicyHolder details from data stored in loacl storage
    // and let user move to next stepper
    let data = this._route.snapshot.queryParams;
    if (data && data['kyc_id']) {
      if (localStorage.getItem('BajajCustomerDetail')) {
        this.bajajProposalForm.get('CustomerDetail').patchValue(
          JSON.parse(localStorage.getItem('BajajCustomerDetail'))
        );
        this.bajajProposalForm.get('CustomerDetail').patchValue({
          KYCId: data['kyc_id'],
        });
        this._kycFlag = 0;
        this.stepOneError(MatStepper, this._kycFlag);
      }
    }

    if (this.f['BusinessType'].value == 'Rollover') {
      this.bajajProposalForm.get('PolicyDetail.PreviousInsurer').patchValue('');
    }
  }

  //#endregion

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
      this.bajajProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Corporate
    ) {
      if (this.bajajProposalForm.get('CustomerDetail.CompanyName').invalid) {
        this._alerts.push({
          Message: 'Enter Company Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.bajajProposalForm.get('CustomerDetail.DOB').invalid) {
        this._alerts.push({
          Message: 'Enter Company Start Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    } else if (this.bajajProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Individual) {
      if (this.bajajProposalForm.get('CustomerDetail.Salutation').invalid || this.bajajProposalForm.get('CustomerDetail.Salutation').value == 0) {
        this._alerts.push({
          Message: 'Select Title',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.bajajProposalForm.get('CustomerDetail.FirstName').invalid) {
        this._alerts.push({
          Message: 'Enter First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.bajajProposalForm.get('CustomerDetail.LastName').invalid) {
        this._alerts.push({
          Message: 'Enter Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.bajajProposalForm.get('CustomerDetail.Gender').invalid) {
        this._alerts.push({
          Message: 'Select Gender',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.bajajProposalForm.get('CustomerDetail.DOB').invalid) {
        this._alerts.push({
          Message: 'Enter Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.bajajProposalForm.get('CustomerDetail.PanNo').invalid) {
      this._alerts.push({
        Message: 'Enter PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    } else if (!this._pANNum.test(this.bajajProposalForm.get('CustomerDetail.PanNo').value)) {
      this._alerts.push({
        Message: 'Enter valid PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.bajajProposalForm.get('CustomerDetail.UID').value != '' && !this._aadharNum.test(this.bajajProposalForm.get('CustomerDetail.UID').value)) {
      this._alerts.push({
        Message: 'Enter valid Aadhar',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this._alerts.length > 0 || !this.isKYC) {
      this._step1.setErrors({ required: true });
      return this._step1;
    } else {
      this._step1.reset();
      return this._step1;
    }
  }

  // step 1 error message
  public stepOneError(stepper, num = this._kycFlag): void {

    if (this._alerts.length > 0) {
      this._alertservice.raiseErrors(this._alerts);
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
  public openDiolog(type: string, title: string, index: number = 0): void {
    let rule: IFilterRule[] = [
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
      filterData: rule,
    };

    const dialogRef = this._dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'FinancierCode') {
          this.bajajProposalForm.get('CustomerDetail').patchValue({
            FinancierName: result.Name,
            FinancierCode: result.Code,
          });
        }
      }
    });
  }

  // bind the data of FinancierCode [autoComplete]
  public PatchFinancierCode(event: MatAutocompleteSelectedEvent): void {
    this.bajajProposalForm.get('CustomerDetail').patchValue(
      {
        FinancierName: event.option.value.Name,
        FinancierCode: event.option.value.Code,
      },
      { emitEvent: false }
    );
  }

  // Pincode autocomplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.bajajProposalForm.get('CustomerDetail').patchValue({
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
          this.bajajProposalForm.get('CustomerDetail').patchValue({
            PinCode: result.PinCode,
          });
        }
      }
    });
  }

  // clear pincode
  public clear(name: string): void {
    this.bajajProposalForm.get(name).setValue('');
  }

  public clearFinancierCode(): void {
    this.bajajProposalForm.get('CustomerDetail').patchValue(
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

    this.bajajProposalForm.get('CustomerDetail').patchValue({
      DOB: this._datePipe.transform(this.bajajProposalForm.get('CustomerDetail').getRawValue().DOB, 'yyyy-MM-dd'),
    });
    this._bajajService
      .createProposal(this.bajajProposalForm.value).subscribe((res) => {
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

  //#endregion

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _stepTwoValidation(): Alert[] {
    let error: Alert[] = [];

    // Finance Type
    if (this.bajajProposalForm.get('CustomerDetail.FinancierName').value != "" && (this.bajajProposalForm.get('CustomerDetail.FinanceType').value == "" || this.bajajProposalForm.get('CustomerDetail.FinanceType').value == null)) {
      error.push({
        Message: 'Select Finance Type',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Financier Name
    if (this.bajajProposalForm.get('CustomerDetail.FinanceType').value != "" && (this.bajajProposalForm.get('CustomerDetail.FinancierName').value == "" || this.bajajProposalForm.get('CustomerDetail.FinancierName').value == null)) {
      error.push({
        Message: 'Financier Name is Required',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // EngineNo
    if (this.bajajProposalForm.get('TwoWheelerDetail.EngineNo').value == "" || this.bajajProposalForm.get('TwoWheelerDetail.EngineNo').value == null) {
      error.push({
        Message: 'Enter Engine No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // ChassisNo
    if (this.bajajProposalForm.get('TwoWheelerDetail.ChassisNo').value == "" || this.bajajProposalForm.get('TwoWheelerDetail.ChassisNo').value == null) {
      error.push({
        Message: 'Enter Chassis No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // To store Motor Quote Data
    let motorQuotationData = JSON.parse(localStorage.getItem('TwoWheelerMotorInsurance'))

    if (motorQuotationData.BusinessType == MotorBusinessTypeEnum['Roll Over']) {
      if (this.bajajProposalForm.get('TwoWheelerDetail.ChassisNo').value.length != this.maxChassisNo && this.bajajProposalForm.get('TwoWheelerDetail.ChassisNo').value.length != this.minChassisNo) {
        error.push({
          Message: 'Chassis No. must be either ' + this.minChassisNo + ' or ' + this.maxChassisNo + ' characters',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
    else {
      if (this.bajajProposalForm.get('TwoWheelerDetail.ChassisNo').value.length != this.maxChassisNo) {
        error.push({
          Message: 'Chassis No. must be of ' + this.maxChassisNo + ' characters',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.f['BusinessType'].value == 'Rollover') {
      // Previous Policy No
      if (!this.bajajProposalForm.get('PolicyDetail.PreviousPolicyNo').value) {
        error.push({
          Message: 'Enter Previous Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.bajajProposalForm.get('PolicyDetail.PreviousInsurer').value) {
        error.push({
          Message: 'Enter Previous Insurer',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.f['PolicyType'].value == this.MotorPolicyType['Own Damage']) {
      // Previous Policy No
      if (!this.bajajProposalForm.get('PolicyDetail.CurrentTPPolicyNo').value) {
        error.push({
          Message: 'Enter Current TP Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.bajajProposalForm.get('PolicyDetail.CurrentTPName').value) {
        error.push({
          Message: 'Select Current TP Insurer',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // Address
    if (this.bajajProposalForm.get('CustomerDetail.Address').invalid) {
      error.push({
        Message: 'Enter Street',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Address 1
    if (this.bajajProposalForm.get('CustomerDetail.Address1').invalid) {
      error.push({
        Message: 'Enter Area',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Address 2
    if (this.bajajProposalForm.get('CustomerDetail.Address2').invalid) {
      error.push({
        Message: 'Enter Location',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // PinCode
    if (this.bajajProposalForm.get('CustomerDetail.PinCode').invalid) {
      error.push({
        Message: 'Enter PIN Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // MobileNo
    if (this.bajajProposalForm.get('CustomerDetail.MobileNo').invalid) {
      error.push({
        Message: 'Enter Mobile',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Email
    if (this.bajajProposalForm.get('CustomerDetail.Email').invalid) {
      error.push({
        Message: 'Enter Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeFirstName
    if (this.bajajProposalForm.get('CustomerDetail.NomineeFirstName').invalid && this.bajajProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeLastName
    if (this.bajajProposalForm.get('CustomerDetail.NomineeLastName').invalid && this.bajajProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeRelation
    if (this.bajajProposalForm.get('CustomerDetail.NomineeRelation').invalid && this.bajajProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Select Nominee Relation',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeDOB
    if (this.bajajProposalForm.get('CustomerDetail.NomineeDOB').invalid && this.bajajProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Date Of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (!this.nomineeIsAdult && this.bajajProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      // AppointeeFirstName
      if (
        this.bajajProposalForm.get('CustomerDetail.AppointeeFirstName').invalid
      ) {
        error.push({
          Message: 'Enter Appointee First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeLastName
      if (
        this.bajajProposalForm.get('CustomerDetail.AppointeeLastName').invalid
      ) {
        error.push({
          Message: 'Enter Appointee Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeRelation
      if (
        this.bajajProposalForm.get('CustomerDetail.AppointeeRelation').invalid
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
  private _checkKYC(stepper: MatStepper, type: number): void {

    if (type == 0) {

      let kYCData: IBajajMotorKYCDto = new BajajMotorKYCDto();
      kYCData.TransactionNo = this._transactionNo;
      kYCData.ProductCode = this.bajajProposalForm.get('ProductCode').value;
      kYCData.DOB = this._datePipe.transform(this.bajajProposalForm.get('CustomerDetail.DOB').value, 'yyyy-MM-dd');

      if (this.bajajProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Individual) {

        kYCData.Gender = this.bajajProposalForm.get('CustomerDetail.Gender').value;
        if (this.bajajProposalForm.get('CustomerDetail.KYCVerify').value == 'UID') {
          if (this.bajajProposalForm.get('CustomerDetail.UID').valid) {

            let fullName = this._fullName(
              this.bajajProposalForm.get('CustomerDetail.FirstName').value,
              this.bajajProposalForm.get('CustomerDetail.LastName').value,
              this.bajajProposalForm.get('CustomerDetail.MiddleName').value,
              'UID'
            );
            kYCData.Name = fullName;
            kYCData.DocTypeCode = 'UID';
            kYCData.DocNumber = this.bajajProposalForm.get('CustomerDetail.UID').value;
          }
        }
        else {
          if (this.bajajProposalForm.get('CustomerDetail.PanNo').valid) {

            let fullName = this._fullName(
              this.bajajProposalForm.get('CustomerDetail.FirstName').value,
              this.bajajProposalForm.get('CustomerDetail.LastName').value,
              this.bajajProposalForm.get('CustomerDetail.MiddleName').value,
              'PAN'
            );

            kYCData.Name = fullName;
            kYCData.DocTypeCode = 'PAN';
            kYCData.DocNumber = this.bajajProposalForm.get('CustomerDetail.PanNo').value;
          }
        }
      }
      else if (this.bajajProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate) {

        kYCData.isCorporate = true;
        kYCData.Name = this.bajajProposalForm.get('CustomerDetail.CompanyName').value;
        kYCData.Gender = "Corporate";

        if (this.bajajProposalForm.get('CustomerDetail.KYCVerify').value == 'GSTIN') {
          if (this.bajajProposalForm.get('CustomerDetail.GSTINNo').valid) {
            kYCData.DocTypeCode = 'GSTIN';
            kYCData.DocNumber = this.bajajProposalForm.get('CustomerDetail.GSTINNo').value;
          }
        }
        else {
          if (this.bajajProposalForm.get('CustomerDetail.PanNo').valid) {
            kYCData.DocTypeCode = 'PAN';
            kYCData.DocNumber = this.bajajProposalForm.get('CustomerDetail.PanNo').value;
          }
        }
      }

      if (kYCData.DocNumber != "" && kYCData.DocNumber != null && kYCData.DocNumber != undefined) {
        this._bajajService.KYC(kYCData).subscribe((res) => {
          this._kycSuccess(res, stepper);
        });
      }
    }
    else {
      this.isKYC = true;
      this._step1.reset();
    }
  }

  /**
   * Response of the api is processed
   * @param result : response of the api
   * @param stepper : MatStepper
   * if response is successfull and IskycVerified is 1 than user is moved to next stepper for further details
   * else user screen opens the Redirect URL in order to finish KYC
   */
  private _kycSuccess(result, stepper): void {
    if (result.Success) {

      // If IskycVerified is 1 , move to the next stepper
      if (result.Data.IskycVerified == 1) {
        this.bajajProposalForm.get('CustomerDetail').patchValue({ KYCId: result.Data.KycId, });
        this.isKYC = true;
        this._alertservice.raiseSuccessAlert(result.Message);
        this._compareFullNameAndReturnName(result, stepper);
        // this.step1.reset();
        // stepper.next();
      }

      // if IskycVerified is 0 then open the Redirect URL in order to finish KYC
      // Save the data of Policy holder in local storage and once the KYC is done the user will return back to Bajaj form
      // and the data of Policy holder will be retrive from the local storage and user will be moved to next stepper
      else {
        localStorage.setItem('BajajCustomerDetail', JSON.stringify(this.bajajProposalForm.get('CustomerDetail').value));
        this.isKYC = false;
        stepper.previous();
        window.open(result.Data.RedirectURL, '_self');
        this._alertservice.raiseErrors(result.Alerts);
      }
    }
    //  raise Alert message and do not let user to move on next stepper
    else {
      stepper.previous();
      this.isKYC = false;
      this._alertservice.raiseErrorAlert(result.Message);
    }
  }

  // full name for KYC
  private _fullName(FName: string, LName: string, MName?: string, DocType?: string): string {
    let name: string;

    if (DocType == 'PAN') {
      let title = this.bajajProposalForm.get('CustomerDetail.Salutation').value
      if (MName) {
        name = title.concat(' ', FName, ' ', MName, ' ', LName);
      } else {
        name = title.concat(' ', FName, ' ', LName);
      }
    }
    else {
      if (MName) {
        name = FName.concat(' ', MName, ' ', LName);
      } else {
        name = FName.concat(' ', LName);
      }
    }

    return name;
  }

  /**
 * campare the name entered by user and the name returned by KYC API . If there are any difference ask user
 * if name is to be replaced by the name returned by KYC API in a dialog box.
 * if user selects yes than replace name and if no than don't chage
 * @param response : response of KYC API
 * @param stepper : MatStepper
 */
  private _compareFullNameAndReturnName(response, stepper?: MatStepper): void {
    if (this.bajajProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Individual) {
      let fullName = this._fullName(
        this.bajajProposalForm.get('CustomerDetail.FirstName').value,
        this.bajajProposalForm.get('CustomerDetail.LastName').value,
        this.bajajProposalForm.get('CustomerDetail.MiddleName').value,

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
            let name = response.Data.Name.split(' ');
            if (res == true) {
              this.bajajProposalForm.get('CustomerDetail').patchValue({
                FirstName: name.length > 1 ? name[1] : '',
                MiddleName: name.length > 2 ? name[2] : '',
                LastName: name.length > 3 ? name[3] : name[1],
              });
            }
            this._step1.reset();
            stepper.next();
          });
      } else {
        this._step1.reset();
        stepper.next();
      }
    } else if (this.bajajProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate) {
      if (response.Data.Name.toUpperCase() != this.bajajProposalForm.get('CustomerDetail.CompanyName').value.toUpperCase()) {
        this._dialogService
          .confirmDialog({
            title: 'Are You Sure?',
            message: `Replace Company Name with ${response.Data.Name}`,
            confirmText: 'Yes, Replace!',
            cancelText: 'No',
          })
          .subscribe((res) => {
            if (res == true) {
              this.bajajProposalForm.get('CustomerDetail').patchValue({
                CompanyName: response.Data.Name,
              });
            }
            this._step1.reset();
            stepper.next();
          });
      } else {
        this._step1.reset();
        stepper.next();
      }
    }
  }

  /**
   * Set Data in proposal create form From the Proposal quotation form & RTO data
   */
  private _SetTwoWheelerAndPolicyDataFromProposalForm(): void {
    if (localStorage.getItem('TwoWheelerMotorInsurance') && localStorage.getItem('TwoWheelerVehicleDetails') && localStorage.getItem('TwoWheeler_motorBuyPolicy')) {
      // To store Motor Quote Data
      let MotorQuotationData = JSON.parse(
        localStorage.getItem('TwoWheelerMotorInsurance')
      );
      //To store Vehicle details from Quote Page
      this._vehicleDetails = JSON.parse(localStorage.getItem('TwoWheelerVehicleDetails'));

      // to store selected policy detail
      let policyDetails = JSON.parse(localStorage.getItem('TwoWheeler_motorBuyPolicy'));

      //Set Two Wheeler Detail Data In DTO
      this._bajajProposal.CustomerDetail = MotorQuotationData.CustomerDetail;
      this._bajajProposal.TwoWheelerDetail = MotorQuotationData.TwoWheelerDetail;
      this._bajajProposal.PolicyDetail = MotorQuotationData.PolicyDetail;
      this._bajajProposal.BusinessType = MotorQuotationData.BusinessType;
      this._bajajProposal.PolicyType = MotorQuotationData.PolicyType;
      this._bajajProposal.RTOCode = MotorQuotationData.RTOCode;
      this._bajajProposal.TransactionNo = this._transactionNo;
      this._bajajProposal.PolicyStartDate = MotorQuotationData.PolicyStartDate;
      this._bajajProposal.ProposalDate = MotorQuotationData.ProposalDate;
      this._bajajProposal.RegistrationDate = MotorQuotationData.RegistrationDate;
      this._bajajProposal.VehicleSubModelId = MotorQuotationData.VehicleSubModelId;
      this._bajajProposal.ProductCode = policyDetails.ProductCode;
      this._bajajProposal.TwoWheelerDetail.EngineNo = this._vehicleDetails.EngineNo;
      this._bajajProposal.TwoWheelerDetail.ChassisNo = this._vehicleDetails.ChassisNo;
      this._bajajProposal.TwoWheelerDetail.VehicleIDV = policyDetails.CalIDVAmount;
      this._bajajProposal.Insurer = policyDetails.Insurer;
      this._bajajProposal.VehicleCode = policyDetails.VehicleCode;
      this._bajajProposal.InsurerResponse = policyDetails.InsurerResponse;

      // for Get and Set Electrical SumInsure and Non Electrical SumInsure value from "policyDetails.CalcPremium.addonCovers"
      if (policyDetails.CalcPremium.addonCovers.length > 0) {

        let ElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "Electrical_Accessories_Premium" && x.Key == "Accessories");
        let NonElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "NonElectrical_Accessories_Premium" && x.Key == "Accessories");

        if (ElectricalPremium.length > 0) {
          this._bajajProposal.TwoWheelerDetail.ElectricalAccessories = ElectricalPremium[0].SumInsure;
        }

        if (NonElectricalPremium.length > 0) {
          this._bajajProposal.TwoWheelerDetail.NonElectricalAccessories = NonElectricalPremium[0].SumInsure;
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
      let Rule: IFilterRule[] = [{ Field: "InsuranceHelper.Type", Operator: "eq", Value: "BajajFinancier" }]

      /**
       * This data come fron Vehicle details
       * Bind Data Of Vehicle  Financier Code
       */
      this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.ListHelper.List, 'InsuranceHelper.Name', '', Rule).subscribe(res => {
        let Financer = res.Data.Items.find(Financer => Financer.Name == this._vehicleDetails.Financer)

        if (Financer) {
          this.bajajProposalForm.get('CustomerDetail').patchValue({
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
    this._masterListService.getCompanyWiseList('BajajAllianz', 'gender').subscribe((res) => {
      if (res.Success) {
        this.genderList = res.Data.Items;
      }
    });

    // fill nominee relation list
    this.nomineeRelationList = [];
    this._masterListService.getCompanyWiseList('BajajAllianz', 'nomineerelation').subscribe((res) => {
      if (res.Success) {
        this.nomineeRelationList = res.Data.Items;
      }
    });

    this.insurerList = [];
    // fill nominee relation list
    this._masterListService.getCompanyWiseList('BajajAllianz', 'bajajallianzpreinsurer').subscribe((res) => {
      if (res.Success) {
        this.insurerList = res.Data.Items;
      }
    });

    //fill financier code list
    this.financierCodeList = [];
    this._masterListService.getCompanyWiseList('BajajAllianz', 'bajajfinanciercode').subscribe((res) => {
      if (res.Success) {
        this.financierCodeList = res.Data.Items;
      }
    });
  }

  /**
   * to identify change in value of NomineeDOB and calculate age of Nominee . If Nominee is not an Adult than Appointee details are required
   */
  private _changeInNomineeAge(): void {
    this.bajajProposalForm.get('CustomerDetail.NomineeDOB').valueChanges.subscribe((res) => {
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
  private _buildBajajProposalForm(data: IBajajMotorDto): FormGroup {
    let proposalForm = this._fb.group({
      InsurerResponse: [''],
      Insurer: [0],
      TransactionNo: [''],
      ProductCode: [''],
      ProposalDate: [''],
      VehicleType: ["TwoWheeler"],
      BusinessType: [0],
      PolicyType: [0],
      VehicleSubModelId: [0],
      VehicleCode: [''],
      RTOCode: [''],
      PolicyStartDate: [''],
      RegistrationDate: [''],
      TwoWheelerDetail: this._bajajTwoWheelerDetailsForm(data.TwoWheelerDetail),
      PolicyDetail: this._bajajPolicyDetailForm(data.PolicyDetail),
      CustomerDetail: this._bajajCustomerDetailForm(data.CustomerDetail),
    });
    if (data) {
      proposalForm.patchValue(data);
    }
    return proposalForm;
  }

  /**
  * Build Two Wheeler Detail Form
  * @param TwoWheelerDetailsData
  * @returns  TwoWheelerDetailData Form
  */
  private _bajajTwoWheelerDetailsForm(TwoWheelerDetailsData: IBajajTwoWheelerDetail): FormGroup {
    let TwoWheelerDetailsForm = this._fb.group({
      EngineNo: [''],
      ChassisNo: ['', [Validators.minLength(17)]],
      YearOfManufacture: [0],
      ZeroDepreciation: [],
      Accessories: [],
      ElectricalAccessories: [0],
      NonElectricalAccessories: [0],
      InvoiceCover: [],
      NCBProtection: [],
      RoadsideAssistance: [],
      EngineProtector: [],
      PersonalAccident: [],
      DateofFirstRegistration: [''],
      VehicleIDV: [0],
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
  private _bajajPolicyDetailForm(PolicyDetailData: IBajajPolicyDetail): FormGroup {
    let PolicyDetailForm = this._fb.group({
      CurrentTPPolicyNo: [''],
      CurrentTPName: [''],
      PreviousPolicyNo: [''],
      PreviousIDV: [''],
      VehicleNo: [''],
      PolicyPeriod: [0],
      PreviousPolicyClaim: [],
      PreviousPolicyNCBPercentage: [0],
      PreviousPolicyType: [''],
      PreviousInsurer: [''],
      PreviousPolicyStartDate: [''],
      PreviousPolicyEndDate: [''],
      PreviousPolicyTPStartDate: [''],
      PreviousPolicyTPEndDate: ['']
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
  private _bajajCustomerDetailForm(CustomerDetailData: IBajajCustomerDetail): FormGroup {
    let CustomerDetailForm = this._fb.group({
      PanNo: ['', [Validators.required]],
      GSTINNo: ['', [Validators.required]],
      UID: ['', [Validators.required]],
      FinanceType: [''],
      FinancierName: [''],
      FinancierCode: [''],
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
      KYCVerify: ['']
    });

    if (CustomerDetailData) {
      CustomerDetailForm.patchValue(CustomerDetailData);
    }

    return CustomerDetailForm;
  }

  // change in Pincode
  private _onFormChanges(): void {
    this.bajajProposalForm.get('CustomerDetail.PinCode').valueChanges.subscribe(
      (val) => {
        this.pincodes$ = this._masterListService.getFilteredPincodeList(val).pipe(takeUntil(this._destroy$), switchMap((res) => {
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

    this.bajajProposalForm.get('CustomerDetail.FinancierName').valueChanges.subscribe((val) => {
      this.financierCode$ = this._masterListService.getFilteredFinancierNameList(val).pipe(takeUntil(this._destroy$), switchMap((res) => {
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


  //#endregion

}
