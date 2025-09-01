import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { MotorPolicyCampanyType } from '@config/motor-quote';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { DialogService } from '@lib/services/dialog.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, IFilterRule } from '@models/common';
import * as moment from 'moment';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { QuoteService } from 'src/app/features/main/health/quote/quote.service';
import { MotorCustomerTypeEnum } from 'src/app/shared/enums/MotorCustomerType.enum';
import { MotorPolicyTypeEnum } from 'src/app/shared/enums/MotorPolicyType.enum';
import { environment } from 'src/environments/environment';
import { HdfcErgoService } from '../hdfc-ergo.service';
import { MasterListService } from '@lib/services/master-list.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HDFCMotorDto, IHdfcCustomerDetail, IHDFCMotorDto, IHdfcPolicyDetail, IHdfcTwoWheelerDetail } from '@models/dtos/motor-insurance/two-wheeler/hdfc';
import { ValidationRegex } from '@config/validationRegex.config';
import { ICityPincodeDto } from '@models/dtos/core';
import { HDFCMotorKYCDto, IHDFCMotorKYCDto } from '@models/dtos/motor-insurance/KYC/HDFC/hdfcmotor-kycdto';
import { HDFCCISDocumentPopupComponent } from '@lib/ui/components/hdfc-cis-document-popup/hdfc-cis-document-popup.component';
import { MotorBusinessTypeEnum } from 'src/app/shared/enums/MotorBusinessType.enum';

@Component({
  selector: 'gnx-hdfc-ergo',
  templateUrl: './hdfc-ergo.component.html',
  styleUrls: ['./hdfc-ergo.component.scss'],
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
export class HdfcErgoComponent {

  //#region decorator
  // input
  @Input() public ViewEdit;

  // output
  @Output() FCode = new EventEmitter<any>();

  //#endregion

  //#region public properties

  public pagetitle: string = 'HDFC Motor - Two Wheeler';
  public icon: string;
  public isKYC: boolean = false;
  public nomineeIsAdult = true;
  public minEngineNo: number = 5;
  public minChassisNo: number = 5;
  public maxChassisNo: number = 17;
  public hdfcProposalForm: FormGroup;
  public maxDate: Date;
  public genderList: any[];
  public nomineeRelationList: any[];
  public insurerList: any[];
  public dropdownMaster: dropdown;
  public financierCode$: Observable<any>;
  public pincodes$: Observable<ICityPincodeDto[]>;
  public correspondence_pincodes$: Observable<ICityPincodeDto[]>;

  //#endregion

  //#region private properties

  private _transactionNo: string;
  private _pANNum: RegExp = ValidationRegex.PANNumValidationReg;
  private _aadharNum: RegExp = ValidationRegex.UIDNumValidationReg;
  private _step1 = new FormControl();
  private _kycFlag: number = 0;
  private _hdfcProposal: IHDFCMotorDto;
  private _vehicleDetails: any;
  private _financierCodeList: any[];
  private _destroy$: Subject<any>;
  private _alerts: Alert[] = [];

  // for HDFC Payment Parameters
  private _paymentTransactionNo: string;
  private _paymentAmount: number;
  private _appID: string;
  private _subscriptionID: string;
  private _successUrl: string;
  private _failureUrl: string;
  private _checksum: string;
  private _proposalNo: string;
  private _isCreatedProposal: boolean = false;
  private _productCode: string;

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
    public _dialog: MatDialog,
    private _hDFCMotorService: HdfcErgoService,
    private _datePipe: DatePipe, //to change the format of date
    private _route: ActivatedRoute,
    private _quoteService: QuoteService,
    private _dialogService: DialogService
  ) {
    this._destroy$ = new Subject();
    this.dropdownMaster = new dropdown();
    this._hdfcProposal = new HDFCMotorDto();
    if (localStorage.getItem('TwoWheeler_motorBuyPolicy')) {
      let motorBuyPolicyDetails = JSON.parse(
        localStorage.getItem('TwoWheeler_motorBuyPolicy')
      );
      this.icon = motorBuyPolicyDetails.IconURL;
      this._transactionNo = motorBuyPolicyDetails.TransactionNo;
    }

    this.maxDate = new Date();

    this._SetTwoWheelerAndPolicyDataFromProposalForm(); // Call the function for bind data in form
  }

  //#endregion

  //#region public-getters
  public get f() {
    return this.hdfcProposalForm.controls;
  }

  public get MotorCustomerType() {
    return MotorCustomerTypeEnum;
  }

  public get MotorPolicyType() {
    return MotorPolicyTypeEnum;
  }

  public get CampanyTypeList() {
    let sortedList = MotorPolicyCampanyType.sort((a, b) => a.CampanyTypeName.localeCompare(b.CampanyTypeName));
    return sortedList
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
    this.hdfcProposalForm = this._buildHdfcProposalForm(this._hdfcProposal);
    // this.HdfcProposalForm.get('CustomerDetail').patchValue({
    //   CustomerType: MotorCustomerTypeEnum.Individual,
    // });
    this._onFormChanges();
    this._changeInNomineeAge();

    // when KYC is done via Redirect URL and kyc_id is obtained than fill the PolicyHolder details from data stored in loacl storage
    // and let user move to next stepper
    let data = this._route.snapshot.queryParams;
    if (data && data['kyc_id']) {
      if (localStorage.getItem('HDFCCustomerDetail')) {
        this.hdfcProposalForm.get('CustomerDetail').patchValue(
          JSON.parse(localStorage.getItem('HDFCCustomerDetail'))
        );
        this.hdfcProposalForm.get('CustomerDetail').patchValue({
          KYCId: data['kyc_id'],
        });
        this._kycFlag = 0;
        this.stepOneError(MatStepper, this._kycFlag);
      }
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }

  //#endregion

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // back Button
  public backClick() {
    this._router.navigate([ROUTING_PATH.MotorTwoWheelerQuote.Plan]);
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
          this.hdfcProposalForm.get('CustomerDetail').patchValue({
            FinancierName: result.Name,
            FinancierCode: result.Code,
          });
        }
      }
    });
  }

  // bind the data of FinancierCode [autoComplete]
  public PatchFinancierCode(event: MatAutocompleteSelectedEvent): void {
    this.hdfcProposalForm.get('CustomerDetail').patchValue(
      {
        FinancierName: event.option.value.Name,
        FinancierCode: event.option.value.Code,
      },
      { emitEvent: false }
    );
  }

  /**
   * Create Proposal
   */
  public CreateProposal() {

    let errorMessage: Alert[] = [];
    errorMessage = this._stepTwoValidation();
    if (errorMessage.length > 0) {
      this._alertservice.raiseErrors(errorMessage);
      return;
    }

    // check duplicate create proposal or not
    if (!this._isCreatedProposal) {

      this.hdfcProposalForm.get('CustomerDetail').patchValue({
        DOB: this._datePipe.transform(this.hdfcProposalForm.get('CustomerDetail').getRawValue().DOB, 'yyyy-MM-dd'),
      });

      this._hDFCMotorService.createProposal(this.hdfcProposalForm.getRawValue()).subscribe((res) => {
        if (res.Success) {
          localStorage.removeItem('HDFCpolicyHolder');
          this._alertservice.raiseSuccessAlert(res.Message);

          this._isCreatedProposal = true;
          this._proposalNo = res.Data.ProposalNumber;
          this._paymentTransactionNo = res.Data.PaymentTransactionNo;
          this._paymentAmount = res.Data.PaymentAmount;
          this._appID = res.Data.AppID;
          this._subscriptionID = res.Data.SubscriptionID;
          this._successUrl = res.Data.SuccessUrl;
          this._failureUrl = res.Data.FailureUrl;
          this._checksum = res.Data.Checksum;
          this._productCode = res.Data.ProductCode;
          this.OpenDocumentConfirmDialog();

        } else {
          if (res.Alerts && res.Alerts.length > 0) {
            this._alertservice.raiseErrors(res.Alerts);
          } else {
            this._alertservice.raiseErrorAlert(res.Message);
          }
        }
      });
    }
    else {
      if (this._isCreatedProposal) {
        this.OpenDocumentConfirmDialog();
      }
    }
  }

  /**
   * Proceed to payment portal
   */
  public ProceedToPay() {

    this._quoteService.openWindowWithPost(environment.hdfcPayment, {
      Trnsno: this._paymentTransactionNo,
      Amt: this._paymentAmount.toFixed(2),
      Appid: this._appID,
      Subid: this._subscriptionID,
      Surl: this._successUrl,
      Furl: this._failureUrl,
      Src: 'POST',
      Chksum: this._checksum,
    })
  }

  public OpenDocumentConfirmDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = "60vw";
    dialogConfig.minHeight = "55vh";
    dialogConfig.maxHeight = "75vh";

    dialogConfig.data = {
      Category: "TwoWheeler",
      type: "CISDocument",
      title: "CIS Document",
      ispopup: true,
      Insurer: "HDFCErgo",
      TransactionNo: this.hdfcProposalForm.get('TransactionNo').value,
      Productcode: this._productCode,
      ProposalNo: this._proposalNo
    };
    const dialogRef = this._dialog.open(HDFCCISDocumentPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.ProceedToPay();
      }
    });
  }

  // step 1 validation
  public stepOneValidation() {
    this._alerts = [];
    if (this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate) {
      if (this.hdfcProposalForm.get('CustomerDetail.CompanyName').invalid) {
        this._alerts.push({
          Message: 'Enter Company Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.hdfcProposalForm.get('CustomerDetail.DOB').invalid) {
        this._alerts.push({
          Message: 'Enter Company Start Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    } else if (this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Individual) {
      if (this.hdfcProposalForm.get('CustomerDetail.Salutation').invalid || this.hdfcProposalForm.get('CustomerDetail.Salutation').value == 0) {
        this._alerts.push({
          Message: 'Select Title',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.hdfcProposalForm.get('CustomerDetail.FirstName').invalid) {
        this._alerts.push({
          Message: 'Enter First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.hdfcProposalForm.get('CustomerDetail.LastName').invalid) {
        this._alerts.push({
          Message: 'Enter Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.hdfcProposalForm.get('CustomerDetail.Gender').invalid) {
        this._alerts.push({
          Message: 'Select Gender',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.hdfcProposalForm.get('CustomerDetail.DOB').invalid) {
        this._alerts.push({
          Message: 'Enter Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.hdfcProposalForm.get('PanNumber').invalid) {
      this._alerts.push({
        Message: 'Enter PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    } else if (
      !this._pANNum.test(this.hdfcProposalForm.get('PanNumber').value)
    ) {
      this._alerts.push({
        Message: 'Enter valid PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (
      this.hdfcProposalForm.get('UID').value != '' &&
      !this._aadharNum.test(this.hdfcProposalForm.get('UID').value)
    ) {
      this._alerts.push({
        Message: 'Enter valid Aadhar',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate &&
      this.hdfcProposalForm.get('CampanyType').value == '') {
      this._alerts.push({
        Message: 'Select Campany Type',
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
  public stepOneError(stepper, num = this._kycFlag) {
    if (this._alerts.length > 0) {
      this._alertservice.raiseErrors(this._alerts);
      return;
    }
    // after step 1 is validated KYC is done
    this._checkKYC(stepper, num);
  }

  // Pincode autocomplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent,openFor: string): void {

    if (openFor == 'Permanent') {
    this.hdfcProposalForm.get('CustomerDetail').patchValue({
      PinCode: event.option.value.PinCode,
    });
  }

    if (openFor == 'Correspondence') {
      this.hdfcProposalForm.get('CustomerDetail').patchValue({
        Correspondence_PinCode: event.option.value.PinCode,
      });
    }
  }

  // pop up for pincode
  public openDiologPincode(type: string, title: string, openFor: string) {
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
        if (openFor == 'Permanent') {
          this.hdfcProposalForm.get('CustomerDetail').patchValue({
            PinCode: result.PinCode,
          });
        }

        if (openFor == 'Correspondence') {
          this.hdfcProposalForm.get('CustomerDetail').patchValue({
            Correspondence_PinCode: result.PinCode,
          });
        }

      }
    });
  }

  // clear pincode
  public clear(name: string): void {
    this.hdfcProposalForm.get(name).setValue('');
  }

  public clearFinancierCode() {
    this.hdfcProposalForm.get('CustomerDetail').patchValue(
      {
        FinancierName: '',
        FinancierCode: '',
      },
      { emitEvent: false }
    );

  }

  //#endregion public-methods

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _stepTwoValidation() {
    let error: Alert[] = [];

    // if (this.hdfcProposalForm.get('TwoWheelerDetail.ChassisNo').value.length > this.maxChassisNo || this.hdfcProposalForm.get('TwoWheelerDetail.ChassisNo').value.length < this.minChassisNo) {
    //   error.push({
    //     Message: 'Chassis No. must be between of ' + this.minChassisNo + ' to ' + this.maxChassisNo + ' characters',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }

    if (this.hdfcProposalForm.get('TwoWheelerDetail.EngineNo').value.length < this.minEngineNo) {
      error.push({
        Message: `Engine number should be greater than or equal to ${this.minEngineNo} digits`,
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.hdfcProposalForm.get('TwoWheelerDetail.ChassisNo').value.length < this.minChassisNo) {
      error.push({
        Message: `Chassis number should be greater than or equal to ${this.minChassisNo} digits`,
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Finance Type
    if (this.hdfcProposalForm.get('CustomerDetail.FinancierName').value != "" && (this.hdfcProposalForm.get('CustomerDetail.FinanceType').value == "" || this.hdfcProposalForm.get('CustomerDetail.FinanceType').value == null)) {
      error.push({
        Message: 'Select Finance Type',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Financier Name
    if (this.hdfcProposalForm.get('CustomerDetail.FinanceType').value != "" && (this.hdfcProposalForm.get('CustomerDetail.FinancierName').value == "" || this.hdfcProposalForm.get('CustomerDetail.FinancierName').value == null)) {
      error.push({
        Message: 'Financier Name is Required',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.f['BusinessType'].value == 'Rollover') {
      // Previous Policy No
      if (!this.hdfcProposalForm.get('PolicyDetail.PreviousPolicyNo').value) {
        error.push({
          Message: 'Enter Previous Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.hdfcProposalForm.get('PolicyDetail.PreviousInsurer').value) {
        error.push({
          Message: 'Enter Previous Insurer',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.f['PolicyType'].value == this.MotorPolicyType['Own Damage']) {
      // Previous Policy No
      if (!this.hdfcProposalForm.get('PolicyDetail.CurrentTPPolicyNo').value) {
        error.push({
          Message: 'Enter Current TP Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.hdfcProposalForm.get('PolicyDetail.CurrentTPName').value) {
        error.push({
          Message: 'Select Current TP Insurer',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if ((this.f['BusinessType'].value == 'Rollover') &&
      (this.f['PolicyType'].value == this.MotorPolicyType['Comprehensive'] || this.f['PolicyType'].value == this.MotorPolicyType['Own Damage'])) {


      if (this.f['TwoWheelerDetail'].value.ZeroDepreciation) {
        if (!this.hdfcProposalForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').value) {
          error.push({
            Message: "You are not eligible to purchase the Zero Depreciation add-on as you didn't purchase this add-on in the previous policy.",
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

      if (this.f['TwoWheelerDetail'].value.InvoiceCover) {
        if (!this.hdfcProposalForm.get('PolicyDetail.PreviousPolicyInvoiceCover').value) {
          error.push({
            Message: "You are not eligible to purchase the Invoice Cover add-on as you didn't purchase this add-on in the previous policy.",
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

    }

    // Address
    if (this.hdfcProposalForm.get('CustomerDetail.Address').invalid) {
      error.push({
        Message: 'Enter Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // PinCode
    if (this.hdfcProposalForm.get('CustomerDetail.PinCode').invalid) {
      error.push({
        Message: 'Enter PIN Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // MobileNo
    if (this.hdfcProposalForm.get('CustomerDetail.MobileNo').invalid) {
      error.push({
        Message: 'Enter Mobile',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Email
    if (this.hdfcProposalForm.get('CustomerDetail.Email').invalid) {
      error.push({
        Message: 'Enter Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeFirstName
    if (this.hdfcProposalForm.get('CustomerDetail.NomineeFirstName').invalid && this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeLastName
    if (this.hdfcProposalForm.get('CustomerDetail.NomineeLastName').invalid && this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeRelation
    if (this.hdfcProposalForm.get('CustomerDetail.NomineeRelation').invalid && this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Select Nominee Relation',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeDOB
    if (this.hdfcProposalForm.get('CustomerDetail.NomineeDOB').invalid && this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Date Of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (!this.nomineeIsAdult && this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      // AppointeeFirstName
      if (this.hdfcProposalForm.get('CustomerDetail.AppointeeFirstName').invalid) {
        error.push({
          Message: 'Enter Appointee First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeLastName
      if (this.hdfcProposalForm.get('CustomerDetail.AppointeeLastName').invalid) {
        error.push({
          Message: 'Enter Appointee Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeRelation
      if (this.hdfcProposalForm.get('CustomerDetail.AppointeeRelation').invalid) {
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

      if (this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate && this.hdfcProposalForm.get('CINnumber').value != "") {
        let KYCData = this._kycData('CIN');
        KYCData.CorporateType = this.hdfcProposalForm.get('CampanyType').value
        KYCData.TransactionNo = this._transactionNo;
        KYCData.Name = this.hdfcProposalForm.get('CustomerDetail.CompanyName').value;

        this._hDFCMotorService.KYC(KYCData).subscribe((res) => {
          this._kycSuccess(res, stepper);
        });
      }

      else if (this.hdfcProposalForm.get('PanNumber').valid) {
        let KYCData = this._kycData('PAN');
        KYCData.TransactionNo = this._transactionNo;
        if (this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Individual) {
          KYCData.CorporateType = ""
          KYCData.FirstName = this.hdfcProposalForm.get(
            'CustomerDetail.FirstName'
          ).value;
          KYCData.LastName = this.hdfcProposalForm.get(
            'CustomerDetail.LastName'
          ).value;
          KYCData.MiddleName = this.hdfcProposalForm.get(
            'CustomerDetail.MiddleName'
          ).value;
          KYCData.Name = this._fullName(
            this.hdfcProposalForm.get('CustomerDetail.FirstName').value,
            this.hdfcProposalForm.get('CustomerDetail.LastName').value,
            this.hdfcProposalForm.get('CustomerDetail.MiddleName').value
          );
          this._hDFCMotorService.KYC(KYCData).subscribe((res) => {
            this._kycSuccess(res, stepper);
          });
        } else if (this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate) {
          KYCData.isCorporate = true;
          KYCData.CorporateType = this.hdfcProposalForm.get('CampanyType').value
          KYCData.Name = this.hdfcProposalForm.get('CustomerDetail.CompanyName').value;
          this._hDFCMotorService.KYC(KYCData).subscribe((res) => {
            this._kycSuccess(res, stepper);
          });
        }
      } else if (this.hdfcProposalForm.get('UID').valid) {
        let KYCData = this._kycData('UID');
        KYCData.TransactionNo = this._transactionNo;
        if (this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Individual) {
          KYCData.CorporateType = ""
          KYCData.FirstName = this.hdfcProposalForm.get(
            'CustomerDetail.FirstName'
          ).value;
          KYCData.LastName = this.hdfcProposalForm.get(
            'CustomerDetail.LastName'
          ).value;
          KYCData.MiddleName = this.hdfcProposalForm.get(
            'CustomerDetail.MiddleName'
          ).value;
          KYCData.Name = this._fullName(
            this.hdfcProposalForm.get('CustomerDetail.FirstName').value,
            this.hdfcProposalForm.get('CustomerDetail.LastName').value,
            this.hdfcProposalForm.get('CustomerDetail.MiddleName').value
          );
          this._hDFCMotorService.KYC(KYCData).subscribe((res) => {
            this._kycSuccess(res, stepper);
          });
        } else if (this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate) {
          KYCData.isCorporate = true;
          KYCData.CorporateType = this.hdfcProposalForm.get('CampanyType').value
          KYCData.Name = this.hdfcProposalForm.get(
            'CustomerDetail.CompanyName'
          ).value;
          this._hDFCMotorService.KYC(KYCData).subscribe((res) => {
            this._kycSuccess(res, stepper);
          });
        }
      }
    } else {
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
  private _kycSuccess(result, stepper) {
    if (result.Success) {
      // If IskycVerified is 1 , move to the next stepper
      if (result.Data.IskycVerified == 1) {
        this.hdfcProposalForm.get('CustomerDetail').patchValue({
          KYCId: result.Data.KycId,
        });
        this.isKYC = true;

        /**
        * After KYC Is succsesful disable this Ower Details Field
        */
        this.hdfcProposalForm.get('CustomerDetail.FirstName').disable({ emitEvent: false });
        this.hdfcProposalForm.get('CustomerDetail.MiddleName').disable({ emitEvent: false });
        this.hdfcProposalForm.get('CustomerDetail.LastName').disable({ emitEvent: false });
        this.hdfcProposalForm.get('CustomerDetail.DOB').disable({ emitEvent: false });
        this.hdfcProposalForm.get('CustomerDetail.CompanyName').disable({ emitEvent: false });
        this.hdfcProposalForm.get('CustomerDetail.Address').disable({ emitEvent: false });
        this.hdfcProposalForm.get('CustomerDetail.Address1').disable({ emitEvent: false });
        this.hdfcProposalForm.get('CustomerDetail.PinCode').disable({ emitEvent: false });


        this._alertservice.raiseSuccessAlert(result.Message);
        this._compareFullNameAndReturnName(result, stepper);
        // this.step1.reset();
        // stepper.next();
      }
      // if IskycVerified is 0 then open the Redirect URL in order to finish KYC
      // Save the data of Policy holder in local storage and once the KYC is done the user will return back to HDFC form
      // and the data of Policy holder will be retrive from the local storage and user will be moved to next stepper
      else {
        localStorage.setItem('HDFCCustomerDetail', JSON.stringify(this.hdfcProposalForm.get('CustomerDetail').value));
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

  /**
   * fill data of KYC as per docType
   * @param docType :identify the type of document(PAN or UID)
   * @returns : KYC Data
   */
  private _kycData(docType) {
    let KYCData: IHDFCMotorKYCDto = new HDFCMotorKYCDto();
    if (docType == 'UID') {
      KYCData.DocTypeCode = docType;
      KYCData.DocNumber = this.hdfcProposalForm.get('UID').value;
      KYCData.DOB = this._datePipe.transform(this.hdfcProposalForm.get('CustomerDetail.DOB').value, 'yyyy-MM-dd');
      KYCData.PanNUMBER = this.hdfcProposalForm.get('PanNumber').value;
    }
    else if (docType == 'PAN') {
      KYCData.DocTypeCode = docType;
      KYCData.DocNumber = this.hdfcProposalForm.get('PanNumber').value;
      KYCData.DOB = this._datePipe.transform(this.hdfcProposalForm.get('CustomerDetail.DOB').value, 'yyyy-MM-dd');
      KYCData.PanNUMBER = '';
    }
    else if (docType == 'CIN') {
      KYCData.isCorporate = true;
      KYCData.DocTypeCode = docType;
      KYCData.DocNumber = this.hdfcProposalForm.get('CINnumber').value;
      KYCData.DOB = this._datePipe.transform(this.hdfcProposalForm.get('CustomerDetail.DOB').value, 'yyyy-MM-dd');
      KYCData.PanNUMBER = "";
    }
    return KYCData;
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
   * campare the name entered by user and the name returned by KYC API . If there are any difference ask user
   * if name is to be replaced by the name returned by KYC API in a dialog box.
   * if user selects yes than replace name and if no than don't chage
   * @param response : response of KYC API
   * @param stepper : MatStepper
   */
  private _compareFullNameAndReturnName(response, stepper?: MatStepper) {
    if (
      this.hdfcProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Individual
    ) {
      let fullName = this._fullName(
        this.hdfcProposalForm.get('CustomerDetail.FirstName').value,
        this.hdfcProposalForm.get('CustomerDetail.LastName').value,
        this.hdfcProposalForm.get('CustomerDetail.MiddleName').value
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
              this.hdfcProposalForm.get('CustomerDetail').patchValue({
                FirstName: Name[0],
                MiddleName: Name.length > 2 ? Name[1] : '',
                LastName: Name.length > 2 ? Name[2] : Name[1],
              });
            }
            this._step1.reset();
            stepper.next();
          });
      } else {
        this._step1.reset();
        stepper.next();
      }
    } else if (this.hdfcProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate) {
      if (response.Data.Name.toUpperCase() != this.hdfcProposalForm.get('CustomerDetail.CompanyName').value.toUpperCase()) {
        this._dialogService
          .confirmDialog({
            title: 'Are You Sure?',
            message: `Replace Company Name with ${response.Data.Name}`,
            confirmText: 'Yes, Replace!',
            cancelText: 'No',
          })
          .subscribe((res) => {
            if (res == true) {
              this.hdfcProposalForm.get('CustomerDetail').patchValue({
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

    let dateString = response.Data.DOB;
    let dateObject = moment(dateString, 'DD/MM/YYYY').toDate();

    this.hdfcProposalForm.get('CustomerDetail').patchValue({
      DOB: this._datePipe.transform(dateObject, 'yyyy-MM-dd'),
      Address: response.Data.PermanentAddress,
      PinCode: response.Data.PermanentPincode
    });
  }

  // change in Pincode
  private _onFormChanges() {
    this.hdfcProposalForm.get('CustomerDetail.PinCode').valueChanges.subscribe(
      (val) => {
        this.pincodes$ = this._masterListService.getFilteredPincodeList(val).pipe(
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

    this.hdfcProposalForm.get('CustomerDetail.Correspondence_PinCode').valueChanges.subscribe(
      (val) => {
        this.correspondence_pincodes$ = this._masterListService
          .getFilteredPincodeList(val)
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

      }
    );

    this.hdfcProposalForm.get('CustomerDetail.FinancierName').valueChanges.subscribe((val) => {
      this.financierCode$ = this._masterListService
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

    this.hdfcProposalForm.get('PanNumber').valueChanges.subscribe((val) => {
      this.isKYC = false;

      /**
       * After KYC Is succsesful Then Change PAn number Enable below field 
       */
      this.hdfcProposalForm.get('CustomerDetail.FirstName').enable({ emitEvent: false });
      this.hdfcProposalForm.get('CustomerDetail.MiddleName').enable({ emitEvent: false });
      this.hdfcProposalForm.get('CustomerDetail.LastName').enable({ emitEvent: false });
      this.hdfcProposalForm.get('CustomerDetail.DOB').enable({ emitEvent: false });
      this.hdfcProposalForm.get('CustomerDetail.CompanyName').enable({ emitEvent: false });
      this.hdfcProposalForm.get('CustomerDetail.Address').enable({ emitEvent: false });
      this.hdfcProposalForm.get('CustomerDetail.Address1').enable({ emitEvent: false });
      this.hdfcProposalForm.get('CustomerDetail.PinCode').enable({ emitEvent: false });
    });

    this.hdfcProposalForm.get('CustomerDetail.SameAsPermanentAddress').valueChanges.subscribe((val) => {

      this.hdfcProposalForm.get('CustomerDetail').patchValue({
        Correspondence_Address1: null,
        Correspondence_Address2: null,
        Correspondence_PinCode: null,
      }, { emitEvent: false });
    });

  }

  /**
 * to identify change in value of NomineeDOB and calculate age of Nominee . If Nominee is not an Adult than Appointee details are required
 */
  private _changeInNomineeAge() {
    this.hdfcProposalForm.get('CustomerDetail.NomineeDOB').valueChanges.subscribe((res) => {
      let ageOfNominee = moment(new Date()).diff(res, 'year');

      if (ageOfNominee < 18) {
        this.nomineeIsAdult = false;
      } else {
        this.nomineeIsAdult = true;
      }
    });
  }

  /**
 * Set Data in proposal create form From the Proposal quotation form & RTO data
 */
  private _SetTwoWheelerAndPolicyDataFromProposalForm() {
    if (localStorage.getItem('TwoWheelerMotorInsurance') && localStorage.getItem('TwoWheelerVehicleDetails') && localStorage.getItem('TwoWheeler_motorBuyPolicy')) {
      // To store Motor Quote Data
      let MotorQuotationData = JSON.parse(
        localStorage.getItem('TwoWheelerMotorInsurance')
      );
      //To store Vehicle details from Quote Page
      this._vehicleDetails = JSON.parse(localStorage.getItem('TwoWheelerVehicleDetails'));

      // to store selected policy detail
      let policyDetails = JSON.parse(localStorage.getItem('TwoWheeler_motorBuyPolicy'));

      //Set Two Wheeler details Data In DTO
      this._hdfcProposal.CustomerDetail = MotorQuotationData.CustomerDetail;
      this._hdfcProposal.TwoWheelerDetail = MotorQuotationData.TwoWheelerDetail;
      this._hdfcProposal.PolicyDetail = MotorQuotationData.PolicyDetail;
      this._hdfcProposal.BusinessType = MotorQuotationData.BusinessType;
      this._hdfcProposal.PolicyType = MotorQuotationData.PolicyType;
      this._hdfcProposal.RTOCode = MotorQuotationData.RTOCode;
      this._hdfcProposal.TransactionNo = this._transactionNo;
      this._hdfcProposal.PolicyStartDate = MotorQuotationData.PolicyStartDate;
      this._hdfcProposal.ProposalDate = MotorQuotationData.ProposalDate;
      this._hdfcProposal.RegistrationDate = MotorQuotationData.RegistrationDate;
      this._hdfcProposal.VehicleSubModelId = MotorQuotationData.VehicleSubModelId;
      this._hdfcProposal.ProductCode = policyDetails.ProductCode;
      this._hdfcProposal.TwoWheelerDetail.EngineNo = this._vehicleDetails.EngineNo;
      this._hdfcProposal.TwoWheelerDetail.ChassisNo = this._vehicleDetails.ChassisNo;
      this._hdfcProposal.TwoWheelerDetail.VehicleIDV = policyDetails.CalIDVAmount;
      this._hdfcProposal.Insurer = policyDetails.Insurer;
      this._hdfcProposal.VehicleCode = policyDetails.VehicleCode;

      // for Get and Set Electrical SumInsure and Non Electrical SumInsure value from "policyDetails.CalcPremium.addonCovers"
      if (policyDetails.CalcPremium.addonCovers.length > 0) {

        let ElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "Electrical_Accessories_Premium" && x.Key == "Accessories");
        let NonElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "NonElectrical_Accessories_Premium" && x.Key == "Accessories");

        if (ElectricalPremium.length > 0) {
          this._hdfcProposal.TwoWheelerDetail.ElectricalAccessories = ElectricalPremium[0].SumInsure;
        }

        if (NonElectricalPremium.length > 0) {
          this._hdfcProposal.TwoWheelerDetail.NonElectricalAccessories = NonElectricalPremium[0].SumInsure;
        }
      }


      let _proposalType = MotorQuotationData.BusinessType;
      if (_proposalType == MotorBusinessTypeEnum['Roll Over']) {
        this.minChassisNo = 5;
      }
      else if (_proposalType == MotorBusinessTypeEnum['New']) {
        this.minChassisNo = 17;
      }

    } else {
      this.backClick();
    }

    if (this._vehicleDetails.Financed && this._vehicleDetails.Financer != '') {

      let Rule: IFilterRule[] = [{
        Field: "InsuranceHelper.Type",
        Operator: "eq",
        Value: "HDFCFinancier"
      }]

      /**
       * This data come fron Vehicle details
       * Bind Data Of Vehicle  Financier Code
       */
      this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.ListHelper.List, 'InsuranceHelper.Name', '', Rule).subscribe(res => {
        let Financer = res.Data.Items.find(Financer => Financer.Name == this._vehicleDetails.Financer)
        if (Financer) {
          this.hdfcProposalForm.get('CustomerDetail').patchValue(
            {
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
    this.genderList = [];
    // fill gender list
    this._masterListService
      .getCompanyWiseList('HDFCErgo', 'gender')
      .subscribe((res) => {
        if (res.Success) {
          this.genderList = res.Data.Items;
        }
      });

    // fill nominee relation list
    this.nomineeRelationList = [];
    this._masterListService
      .getCompanyWiseList('HDFCErgo', 'nomineerelation')
      .subscribe((res) => {
        if (res.Success) {
          this.nomineeRelationList = res.Data.Items;
        }
      });

    this.insurerList = [];
    // fill nominee relation list
    this._masterListService
      .getCompanyWiseList('HDFCErgo', 'hdfcergopreinsurer')
      .subscribe((res) => {
        if (res.Success) {
          this.insurerList = res.Data.Items;
        }
      });

    //fill financier code list
    this._financierCodeList = [];
    this._masterListService
      .getCompanyWiseList('HDFCErgo', 'hdfcfinanciercode')
      .subscribe((res) => {
        if (res.Success) {
          this._financierCodeList = res.Data.Items;
        }
      });
  }

  /**
 * Build Main Proposal Create Form
 * @param data
 * @returns
 */
  private _buildHdfcProposalForm(data: IHDFCMotorDto) {
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
      PanNumber: ['', [Validators.required]],
      UID: ['', [Validators.required]],
      CINnumber: [''],
      CampanyType: [''],
      TwoWheelerDetail: this._hdfcTwoWheelerDetailsForm(data.TwoWheelerDetail),
      PolicyDetail: this._hdfcPolicyDetailForm(data.PolicyDetail),
      CustomerDetail: this._hdfcCustomerDetailForm(data.CustomerDetail),
    });
    if (data) {
      proposalForm.patchValue(data);
    }
    return proposalForm;
  }

  /**
   * Build Two Wheeler Details Form
   * @param TwoWheelerDetailsData
   * @returns  TwoWheelerDetailData Form
   */
  private _hdfcTwoWheelerDetailsForm(TwoWheelerDetailsData: IHdfcTwoWheelerDetail) {
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
  private _hdfcPolicyDetailForm(PolicyDetailData: IHdfcPolicyDetail) {
    let PolicyDetailForm = this._fb.group({
      PreviousPolicyNo: [''],
      VehicleNo: [''],
      PolicyPeriod: [0],
      PreviousPolicyClaim: [],
      PreviousPolicyNCBPercentage: [0],
      PreviousPolicyType: [''],
      PreviousInsurer: [''],
      PreviousPolicyStartDate: [''],
      PreviousPolicyEndDate: [''],
      PreviousPolicyTPStartDate: [''],
      PreviousPolicyTPEndDate: [''],
      CurrentTPPolicyNo: [""],
      CurrentTPName: [""],
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
  private _hdfcCustomerDetailForm(CustomerDetailData: IHdfcCustomerDetail) {
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
      FinancierName: [''],
      FinancierCode: [''],
      FinanceType: [''],
      GSTINNo: [''],
      SameAsPermanentAddress: [true],
      Correspondence_Address1: [],
      Correspondence_Address2: [],
      Correspondence_PinCode: [],
    });

    if (CustomerDetailData) {
      CustomerDetailForm.patchValue(CustomerDetailData);
    }

    return CustomerDetailForm;
  }

  //#endregion Private methods
}
