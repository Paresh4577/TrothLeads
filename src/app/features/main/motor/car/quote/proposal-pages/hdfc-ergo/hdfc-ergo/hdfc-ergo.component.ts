import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { dropdown } from '@config/dropdown.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { ICityPincodeDto } from '@models/dtos/core/CityDto';
import {
  HDFCMotorDto,
  IHDFCMotorDto,
  IHdfcCarDetail,
  IHdfcCustomerDetail,
  IHdfcPolicyDetail,
} from '@models/dtos/motor-insurance';
import {
  HDFCMotorKYCDto,
  IHDFCMotorKYCDto,
} from '@models/dtos/motor-insurance/KYC/HDFC/hdfcmotor-kycdto';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { MotorCustomerTypeEnum } from 'src/app/shared/enums/MotorCustomerType.enum';
import { HdfcErgoService } from '../hdfc-ergo.service';
import { MatStepper } from '@angular/material/stepper';
import { Alert, IFilterRule } from '@models/common';
import { ValidationRegex } from '@config/validationRegex.config';
import { environment } from 'src/environments/environment';
import { QuoteService } from 'src/app/features/main/health/quote/quote.service';
import { DialogService } from '@lib/services/dialog.service';
import * as moment from 'moment';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MotorPolicyCampanyType } from '@config/motor-quote';
import { MotorPolicyTypeEnum } from 'src/app/shared/enums/MotorPolicyType.enum';
import { MotorBusinessTypeEnum } from 'src/app/shared/enums/MotorBusinessType.enum';
import { HDFCCISDocumentPopupComponent } from '@lib/ui/components/hdfc-cis-document-popup/hdfc-cis-document-popup.component';

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
  // #region public variables
  @Input() public ViewEdit;

  @Output() FCode = new EventEmitter<any>();

  //String
  pagetitle: string = 'HDFC Motor';
  Icon: string;
  TransactionNo: string;

  PANNum: RegExp = ValidationRegex.PANNumValidationReg;
  AadharNum: RegExp = ValidationRegex.UIDNumValidationReg;

  // formControl
  step1 = new FormControl();

  //boolean
  IsKYC: boolean = false;
  NomineeIsAdult = true;

  //Number
  kycFlag: number = 0;

  // chassis number : maximum and minimum length
  MinChassisNo: number = 10;
  MinEngineNo: number = 5;
  // MaxChassisNo: number = 17;

  //Formgroup & DTO
  HdfcProposal: IHDFCMotorDto;
  HdfcProposalForm: FormGroup;

  // date
  maxDate: Date;

  // list
  VehicleDetails
  GenderList: any[];
  NomineeRelationList: any[];
  FinancierCodeList: any[];
  InsurerList: any[];

  DropdownMaster: dropdown;

  FinancierCode$: Observable<any>;
  pincodes$: Observable<ICityPincodeDto[]>;
  correspondence_pincodes$: Observable<ICityPincodeDto[]>;
  destroy$: Subject<any>;

  // alerts
  alerts: Alert[] = [];
  // #endregion public variables

  //#region private properties

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
  //#endregion private properties

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
    public dialog: MatDialog,
    private _HDFCMotorService: HdfcErgoService,
    private _datePipe: DatePipe, //to change the format of date
    private _route: ActivatedRoute,
    private _quoteService: QuoteService,
    private _dialogService: DialogService,
    public _dialog: MatDialog,
  ) {
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();
    this.HdfcProposal = new HDFCMotorDto();
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
    this.HdfcProposalForm = this._buildHdfcProposalForm(this.HdfcProposal);
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
        this.HdfcProposalForm.get('CustomerDetail').patchValue(
          JSON.parse(localStorage.getItem('HDFCCustomerDetail'))
        );
        this.HdfcProposalForm.get('CustomerDetail').patchValue({
          KYCId: data['kyc_id'],
        });
        this.kycFlag = 0;
        this.stepOneError(MatStepper, this.kycFlag);
      }
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
    return this.HdfcProposalForm.controls;
  }

  get MotorCustomerType() {
    return MotorCustomerTypeEnum;
  }

  get MotorPolicyType() {
    return MotorPolicyTypeEnum;
  }


  get CampanyTypeList() {
    let sortedList = MotorPolicyCampanyType.sort((a, b) =>
      a.CampanyTypeName.localeCompare(b.CampanyTypeName));
    return sortedList
  }

  // back Button
  public backClick() {
    this._router.navigate([ROUTING_PATH.MotorCarQuote.Plan]);
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

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'FinancierCode') {
          this.HdfcProposalForm.get('CustomerDetail').patchValue({
            FinancierName: result.Name,
            FinancierCode: result.Code,
          });
        }
      }
    });
  }

  // bind the data of FinancierCode [autoComplete]
  public PatchFinancierCode(event: MatAutocompleteSelectedEvent): void {
    this.HdfcProposalForm.get('CustomerDetail').patchValue(
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

      this.HdfcProposalForm.get('CustomerDetail').patchValue({
        DOB: this._datePipe.transform(this.HdfcProposalForm.get('CustomerDetail').getRawValue().DOB, 'yyyy-MM-dd'),
      });

      this._HDFCMotorService
        .createProposal(this.HdfcProposalForm.getRawValue())
        .subscribe((res) => {
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

    this._quoteService.openWindowWithPost(environment.MotorhdfcPayment, {
      Trnsno: this._paymentTransactionNo,
      Amt: this._paymentAmount.toFixed(2),
      Appid: this._appID,
      Subid: this._subscriptionID,
      Surl: this._successUrl,
      Furl: this._failureUrl,
      Src: 'POST',
      Chksum: this._checksum,
    });

  }

  /**
   * 
   */
  public OpenDocumentConfirmDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = "60vw";
    dialogConfig.minHeight = "55vh";
    dialogConfig.maxHeight = "75vh";

    dialogConfig.data = {
      Category: "PrivateCar",
      type: "CISDocument",
      title: "CIS Document",
      ispopup: true,
      Insurer: "HDFCErgo",
      TransactionNo: this.HdfcProposalForm.get('TransactionNo').value,
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

  //   /**
  //  * According to the change in value of mat-slide-toggle , value of CustomerType is updated
  //  * @param event : to identify change in the value of mat-slide-toggle
  //  */
  //   public changeInCustomerType(event) {
  //     if (event.checked) {
  //       this.HdfcProposalForm.get('CustomerDetail').patchValue({
  //         CustomerType: MotorCustomerTypeEnum.Corporate,
  //       });
  //     } else {
  //       this.HdfcProposalForm.get('CustomerDetail').patchValue({
  //         CustomerType: MotorCustomerTypeEnum.Individual,
  //       });
  //     }
  //   }

  // step 1 validation
  public stepOneValidation() {
    this.alerts = [];
    if (
      this.HdfcProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Corporate
    ) {
      if (this.HdfcProposalForm.get('CustomerDetail.CompanyName').invalid) {
        this.alerts.push({
          Message: 'Enter Company Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.HdfcProposalForm.get('CustomerDetail.DOB').invalid) {
        this.alerts.push({
          Message: 'Enter Company Start Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    } else if (
      this.HdfcProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Individual
    ) {
      if (
        this.HdfcProposalForm.get('CustomerDetail.Salutation').invalid ||
        this.HdfcProposalForm.get('CustomerDetail.Salutation').value == 0
      ) {
        this.alerts.push({
          Message: 'Select Title',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.HdfcProposalForm.get('CustomerDetail.FirstName').invalid) {
        this.alerts.push({
          Message: 'Enter First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.HdfcProposalForm.get('CustomerDetail.LastName').invalid) {
        this.alerts.push({
          Message: 'Enter Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.HdfcProposalForm.get('CustomerDetail.Gender').invalid) {
        this.alerts.push({
          Message: 'Select Gender',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.HdfcProposalForm.get('CustomerDetail.DOB').invalid) {
        this.alerts.push({
          Message: 'Enter Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.HdfcProposalForm.get('PanNumber').invalid) {
      this.alerts.push({
        Message: 'Enter PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    } else if (
      !this.PANNum.test(this.HdfcProposalForm.get('PanNumber').value)
    ) {
      this.alerts.push({
        Message: 'Enter valid PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (
      this.HdfcProposalForm.get('UID').value != '' &&
      !this.AadharNum.test(this.HdfcProposalForm.get('UID').value)
    ) {
      this.alerts.push({
        Message: 'Enter valid Aadhar',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.HdfcProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate &&
      this.HdfcProposalForm.get('CampanyType').value == '') {
      this.alerts.push({
        Message: 'Select Campany Type',
        CanDismiss: false,
        AutoClose: false,
      });
    }

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

  // Pincode autocomplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent,openFor:string): void {
    if (openFor == 'Permanent'){
    this.HdfcProposalForm.get('CustomerDetail').patchValue({
      PinCode: event.option.value.PinCode,
    });
  }
    
    if (openFor == 'Correspondence'){
    this.HdfcProposalForm.get('CustomerDetail').patchValue({
      Correspondence_PinCode: event.option.value.PinCode,
    });
  }
  }

  // pop up for pincode
  public openDiologPincode(type: string, title: string,openFor:string) {
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
        if (openFor == 'Permanent') {
          this.HdfcProposalForm.get('CustomerDetail').patchValue({
            PinCode: result.PinCode,
          });
        }
        if (openFor == 'Correspondence') {
          this.HdfcProposalForm.get('CustomerDetail').patchValue({
            Correspondence_PinCode: result.PinCode,
          });
        }
      }
    });
  }

  // clear pincode
  public clear(name: string): void {
    this.HdfcProposalForm.get(name).setValue('');
  }

  public clearFinancierCode() {
    this.HdfcProposalForm.get('CustomerDetail').patchValue(
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

    
    // To store Motor Quote Data
    // let MotorQuotationData = JSON.parse(localStorage.getItem('MotorInsurance'))
    if (this.HdfcProposalForm.get('CarDetail.EngineNo').value.length < this.MinEngineNo) {
            error.push({
              Message: `Engine number should be greater than or equal to ${this.MinEngineNo} digits`,
              CanDismiss: false,
              AutoClose: false,
            });
          }
        
          if (this.HdfcProposalForm.get('CarDetail.ChassisNo').value.length < this.MinChassisNo) {
            error.push({
              Message: `Chassis number should be greater than or equal to ${this.MinChassisNo} digits`,
              CanDismiss: false,
              AutoClose: false,
            });
          }
    
    // if (MotorQuotationData.BusinessType == MotorBusinessTypeEnum['Roll Over']) {
    //   if (this.HdfcProposalForm.get('CarDetail.ChassisNo').value.length != this.MaxChassisNo && this.HdfcProposalForm.get('CarDetail.ChassisNo').value.length != this.MinChassisNo) {
    //     error.push({
    //       Message: 'Chassis No. must be either ' + this.MinChassisNo + ' or ' + this.MaxChassisNo + ' characters',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }
    // else{
    //   if (this.HdfcProposalForm.get('CarDetail.ChassisNo').value.length != this.MaxChassisNo) {
    //     error.push({
    //       Message: 'Chassis No. must be of ' + this.MaxChassisNo + ' characters',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }

    // if (this.HdfcProposalForm.get('CarDetail.ChassisNo').value.length > this.MaxChassisNo || this.HdfcProposalForm.get('CarDetail.ChassisNo').value.length < this.MinChassisNo) {
    //   error.push({
    //     Message: 'Chassis No. must be between of ' + this.MinChassisNo + ' to ' + this.MaxChassisNo + ' characters',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }

    // Finance Type
    if (this.HdfcProposalForm.get('CustomerDetail.FinancierName').value != "" && (this.HdfcProposalForm.get('CustomerDetail.FinanceType').value == "" || this.HdfcProposalForm.get('CustomerDetail.FinanceType').value == null)) {
      error.push({
        Message: 'Select Finance Type',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Financier Name
    if (this.HdfcProposalForm.get('CustomerDetail.FinanceType').value != "" && (this.HdfcProposalForm.get('CustomerDetail.FinancierName').value == "" || this.HdfcProposalForm.get('CustomerDetail.FinancierName').value == null)) {
      error.push({
        Message: 'Financier Name is Required',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.f['BusinessType'].value == 'Rollover') {
      // Previous Policy No
      if (!this.HdfcProposalForm.get('PolicyDetail.PreviousPolicyNo').value) {
        error.push({
          Message: 'Enter Previous Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.HdfcProposalForm.get('PolicyDetail.PreviousInsurer').value) {
        error.push({
          Message: 'Enter Previous Insurer',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.f['PolicyType'].value == this.MotorPolicyType['Own Damage']) {
      // Previous Policy No
      if (!this.HdfcProposalForm.get('PolicyDetail.CurrentTPPolicyNo').value) {
        error.push({
          Message: 'Enter Current TP Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.HdfcProposalForm.get('PolicyDetail.CurrentTPName').value) {
        error.push({
          Message: 'Select Current TP Insurer',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if ((this.f['BusinessType'].value == 'Rollover') &&
      (this.f['PolicyType'].value == this.MotorPolicyType['Comprehensive'] || this.f['PolicyType'].value == this.MotorPolicyType['Own Damage'])) {


      if (this.f['CarDetail'].value.ZeroDepreciation) {
        if (!this.HdfcProposalForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').value) {
          error.push({
            Message: "You are not eligible to purchase the Zero Depreciation add-on as you didn't purchase this add-on in the previous policy.",
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

      if (this.f['CarDetail'].value.InvoiceCover) {
        if (!this.HdfcProposalForm.get('PolicyDetail.PreviousPolicyInvoiceCover').value) {
          error.push({
            Message: "You are not eligible to purchase the Invoice Cover add-on as you didn't purchase this add-on in the previous policy.",
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

    }

    // Address
    if (this.HdfcProposalForm.get('CustomerDetail.Address').invalid) {
      error.push({
        Message: 'Enter Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // PinCode
    if (this.HdfcProposalForm.get('CustomerDetail.PinCode').invalid) {
      error.push({
        Message: 'Enter PIN Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // MobileNo
    if (this.HdfcProposalForm.get('CustomerDetail.MobileNo').invalid) {
      error.push({
        Message: 'Enter Mobile',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Email
    if (this.HdfcProposalForm.get('CustomerDetail.Email').invalid) {
      error.push({
        Message: 'Enter Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeFirstName
    if (this.HdfcProposalForm.get('CustomerDetail.NomineeFirstName').invalid && this.HdfcProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeLastName
    if (this.HdfcProposalForm.get('CustomerDetail.NomineeLastName').invalid && this.HdfcProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeRelation
    if (this.HdfcProposalForm.get('CustomerDetail.NomineeRelation').invalid && this.HdfcProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Select Nominee Relation',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // NomineeDOB
    if (this.HdfcProposalForm.get('CustomerDetail.NomineeDOB').invalid && this.HdfcProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Date Of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (!this.NomineeIsAdult && this.HdfcProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      // AppointeeFirstName
      if (
        this.HdfcProposalForm.get('CustomerDetail.AppointeeFirstName').invalid
      ) {
        error.push({
          Message: 'Enter Appointee First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeLastName
      if (
        this.HdfcProposalForm.get('CustomerDetail.AppointeeLastName').invalid
      ) {
        error.push({
          Message: 'Enter Appointee Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // AppointeeRelation
      if (
        this.HdfcProposalForm.get('CustomerDetail.AppointeeRelation').invalid
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

      if (this.HdfcProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate
        && this.HdfcProposalForm.get('CINnumber').value != "") {
        let KYCData = this._kycData('CIN');
        KYCData.CorporateType = this.HdfcProposalForm.get('CampanyType').value
        KYCData.TransactionNo = this.TransactionNo;
        KYCData.Name = this.HdfcProposalForm.get('CustomerDetail.CompanyName').value;

        this._HDFCMotorService.KYC(KYCData).subscribe((res) => {
          this._kycSuccess(res, stepper);
        });
      }

      else if (this.HdfcProposalForm.get('PanNumber').valid) {
        let KYCData = this._kycData('PAN');
        KYCData.TransactionNo = this.TransactionNo;
        if (
          this.HdfcProposalForm.get('CustomerDetail.CustomerType').value ==
          MotorCustomerTypeEnum.Individual
        ) {
          KYCData.CorporateType = ""
          KYCData.FirstName = this.HdfcProposalForm.get(
            'CustomerDetail.FirstName'
          ).value;
          KYCData.LastName = this.HdfcProposalForm.get(
            'CustomerDetail.LastName'
          ).value;
          KYCData.MiddleName = this.HdfcProposalForm.get(
            'CustomerDetail.MiddleName'
          ).value;
          KYCData.Name = this._fullName(
            this.HdfcProposalForm.get('CustomerDetail.FirstName').value,
            this.HdfcProposalForm.get('CustomerDetail.LastName').value,
            this.HdfcProposalForm.get('CustomerDetail.MiddleName').value
          );
          this._HDFCMotorService.KYC(KYCData).subscribe((res) => {
            this._kycSuccess(res, stepper);
          });
        } else if (
          this.HdfcProposalForm.get('CustomerDetail.CustomerType').value ==
          MotorCustomerTypeEnum.Corporate
        ) {
          KYCData.isCorporate = true;
          KYCData.CorporateType = this.HdfcProposalForm.get('CampanyType').value
          KYCData.Name = this.HdfcProposalForm.get(
            'CustomerDetail.CompanyName'
          ).value;
          this._HDFCMotorService.KYC(KYCData).subscribe((res) => {
            this._kycSuccess(res, stepper);
          });
        }
      } else if (this.HdfcProposalForm.get('UID').valid) {
        let KYCData = this._kycData('UID');
        KYCData.TransactionNo = this.TransactionNo;
        if (
          this.HdfcProposalForm.get('CustomerDetail.CustomerType').value ==
          MotorCustomerTypeEnum.Individual
        ) {
          KYCData.CorporateType = ""
          KYCData.FirstName = this.HdfcProposalForm.get(
            'CustomerDetail.FirstName'
          ).value;
          KYCData.LastName = this.HdfcProposalForm.get(
            'CustomerDetail.LastName'
          ).value;
          KYCData.MiddleName = this.HdfcProposalForm.get(
            'CustomerDetail.MiddleName'
          ).value;
          KYCData.Name = this._fullName(
            this.HdfcProposalForm.get('CustomerDetail.FirstName').value,
            this.HdfcProposalForm.get('CustomerDetail.LastName').value,
            this.HdfcProposalForm.get('CustomerDetail.MiddleName').value
          );
          this._HDFCMotorService.KYC(KYCData).subscribe((res) => {
            this._kycSuccess(res, stepper);
          });
        } else if (
          this.HdfcProposalForm.get('CustomerDetail.CustomerType').value ==
          MotorCustomerTypeEnum.Corporate
        ) {
          KYCData.isCorporate = true;
          KYCData.CorporateType = this.HdfcProposalForm.get('CampanyType').value
          KYCData.Name = this.HdfcProposalForm.get(
            'CustomerDetail.CompanyName'
          ).value;
          this._HDFCMotorService.KYC(KYCData).subscribe((res) => {
            this._kycSuccess(res, stepper);
          });
        }
      }
    } else {
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
        this.HdfcProposalForm.get('CustomerDetail').patchValue({
          KYCId: result.Data.KycId,
        });
        this.IsKYC = true;

        /**
         * After KYC Is succsesful disable this Ower Details Field
         */
        this.HdfcProposalForm.get('CustomerDetail.FirstName').disable({ emitEvent: false });
        this.HdfcProposalForm.get('CustomerDetail.MiddleName').disable({ emitEvent: false });
        this.HdfcProposalForm.get('CustomerDetail.LastName').disable({ emitEvent: false });
        this.HdfcProposalForm.get('CustomerDetail.DOB').disable({ emitEvent: false });
        this.HdfcProposalForm.get('CustomerDetail.CompanyName').disable({ emitEvent: false });
        this.HdfcProposalForm.get('CustomerDetail.Address').disable({ emitEvent: false });
        this.HdfcProposalForm.get('CustomerDetail.Address1').disable({ emitEvent: false });
        this.HdfcProposalForm.get('CustomerDetail.PinCode').disable({ emitEvent: false });

        this._alertservice.raiseSuccessAlert(result.Message);
        this._compareFullNameAndReturnName(result, stepper);
        // this.step1.reset();
        // stepper.next();
      }
      // if IskycVerified is 0 then open the Redirect URL in order to finish KYC
      // Save the data of Policy holder in local storage and once the KYC is done the user will return back to HDFC form
      // and the data of Policy holder will be retrive from the local storage and user will be moved to next stepper
      else {
        localStorage.setItem(
          'HDFCCustomerDetail',
          JSON.stringify(this.HdfcProposalForm.get('CustomerDetail').value)
        );
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

  /**
   * fill data of KYC as per docType
   * @param docType :identify the type of document(PAN or UID)
   * @returns : KYC Data
   */
  private _kycData(docType) {
    let KYCData: IHDFCMotorKYCDto = new HDFCMotorKYCDto();
    if (docType == 'UID') {
      KYCData.DocTypeCode = docType;
      KYCData.DocNumber = this.HdfcProposalForm.get('UID').value;
      KYCData.DOB = this._datePipe.transform(
        this.HdfcProposalForm.get('CustomerDetail.DOB').value,
        'yyyy-MM-dd'
      );
      KYCData.PanNUMBER = this.HdfcProposalForm.get('PanNumber').value;
    } else if (docType == 'PAN') {
      KYCData.DocTypeCode = docType;
      KYCData.DocNumber = this.HdfcProposalForm.get('PanNumber').value;
      KYCData.DOB = this._datePipe.transform(
        this.HdfcProposalForm.get('CustomerDetail.DOB').value,
        'yyyy-MM-dd'
      );

      KYCData.PanNUMBER = '';
    }
    else if (docType == 'CIN') {
      KYCData.isCorporate = true;
      KYCData.DocTypeCode = docType;
      KYCData.DocNumber = this.HdfcProposalForm.get('CINnumber').value;
      KYCData.DOB = this._datePipe.transform(
        this.HdfcProposalForm.get('CustomerDetail.DOB').value,
        'yyyy-MM-dd'
      );

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
      this.HdfcProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Individual
    ) {
      let fullName = this._fullName(
        this.HdfcProposalForm.get('CustomerDetail.FirstName').value,
        this.HdfcProposalForm.get('CustomerDetail.LastName').value,
        this.HdfcProposalForm.get('CustomerDetail.MiddleName').value
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
              this.HdfcProposalForm.get('CustomerDetail').patchValue({
                FirstName: Name[0],
                MiddleName: Name.length > 2 ? Name[1] : '',
                LastName: Name.length > 2 ? Name[2] : Name[1],
              });
            }
            this.step1.reset();
            stepper.next();
          });
      } else {
        this.step1.reset();
        stepper.next();
      }
    } else if (
      this.HdfcProposalForm.get('CustomerDetail.CustomerType').value ==
      MotorCustomerTypeEnum.Corporate
    ) {
      if (
        response.Data.Name.toUpperCase() !=
        this.HdfcProposalForm.get(
          'CustomerDetail.CompanyName'
        ).value.toUpperCase()
      ) {
        this._dialogService
          .confirmDialog({
            title: 'Are You Sure?',
            message: `Replace Company Name with ${response.Data.Name}`,
            confirmText: 'Yes, Replace!',
            cancelText: 'No',
          })
          .subscribe((res) => {
            if (res == true) {
              this.HdfcProposalForm.get('CustomerDetail').patchValue({
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


    let dateString = response.Data.DOB;
    let dateObject = moment(dateString, 'DD/MM/YYYY').toDate(); 

    this.HdfcProposalForm.get('CustomerDetail').patchValue({
      DOB: this._datePipe.transform(dateObject, 'yyyy-MM-dd'),
      Address: response.Data.PermanentAddress,
      PinCode: response.Data.PermanentPincode
    });
  }

  // change in Pincode
  private _onFormChanges() {
    this.HdfcProposalForm.get('CustomerDetail.PinCode').valueChanges.subscribe(
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
   
    this.HdfcProposalForm.get('CustomerDetail.Correspondence_PinCode').valueChanges.subscribe(
      (val) => {
        this.correspondence_pincodes$ = this._MasterListService
          .getFilteredPincodeList(val)
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

      }
    );

    this.HdfcProposalForm.get(
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

    this.HdfcProposalForm.get('PanNumber').valueChanges.subscribe((val) => {
      this.IsKYC = false;

      /**
         * After KYC Is succsesful Then Change PAn number Enable below field 
         */
      this.HdfcProposalForm.get('CustomerDetail.FirstName').enable({ emitEvent: false });
      this.HdfcProposalForm.get('CustomerDetail.MiddleName').enable({ emitEvent: false });
      this.HdfcProposalForm.get('CustomerDetail.LastName').enable({ emitEvent: false });
      this.HdfcProposalForm.get('CustomerDetail.DOB').enable({ emitEvent: false });
      this.HdfcProposalForm.get('CustomerDetail.CompanyName').enable({ emitEvent: false });
      this.HdfcProposalForm.get('CustomerDetail.Address').enable({ emitEvent: false });
      this.HdfcProposalForm.get('CustomerDetail.Address1').enable({ emitEvent: false });
      this.HdfcProposalForm.get('CustomerDetail.PinCode').enable({ emitEvent: false });
    });
    
    this.HdfcProposalForm.get('CustomerDetail.SameAsPermanentAddress').valueChanges.subscribe((val) => {

      this.HdfcProposalForm.get('CustomerDetail').patchValue({
        Correspondence_Address1:null,
        Correspondence_Address2: null,
        Correspondence_PinCode: null,
      },{emitEvent:false});
    });
  }

  /**
   * to identify change in value of NomineeDOB and calculate age of Nominee . If Nominee is not an Adult than Appointee details are required
   */
  private _changeInNomineeAge() {
    this.HdfcProposalForm.get(
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


  // clear the data



  /**
   * Set Data in proposal create form From the Proposal quotation form & RTO data
   */
  private _SetCarAndPolicyDataFromProposalForm() {
    if (
      localStorage.getItem('MotorInsurance') &&
      localStorage.getItem('VehicleDetails') &&
      localStorage.getItem('motorBuyPolicy')
    ) {
      // To store Motor Quote Data
      let MotorQuotationData = JSON.parse(
        localStorage.getItem('MotorInsurance')
      );
      //To store Vehicle details from Quote Page
      this.VehicleDetails = JSON.parse(localStorage.getItem('VehicleDetails'));

      // to store selected policy detail
      let policyDetails = JSON.parse(localStorage.getItem('motorBuyPolicy'));

      //Set Car details Data In DTO
      this.HdfcProposal.CustomerDetail = MotorQuotationData.CustomerDetail;
      this.HdfcProposal.CarDetail = MotorQuotationData.CarDetail;
      this.HdfcProposal.PolicyDetail = MotorQuotationData.PolicyDetail;
      this.HdfcProposal.BusinessType = MotorQuotationData.BusinessType;
      this.HdfcProposal.PolicyType = MotorQuotationData.PolicyType;
      this.HdfcProposal.RTOCode = MotorQuotationData.RTOCode;
      this.HdfcProposal.TransactionNo = this.TransactionNo;
      this.HdfcProposal.PolicyStartDate = MotorQuotationData.PolicyStartDate;
      this.HdfcProposal.ProposalDate = MotorQuotationData.ProposalDate;
      this.HdfcProposal.RegistrationDate = MotorQuotationData.RegistrationDate;
      this.HdfcProposal.VehicleSubModelId = MotorQuotationData.VehicleSubModelId;
      this.HdfcProposal.ProductCode = policyDetails.ProductCode;
      this.HdfcProposal.CarDetail.EngineNo = this.VehicleDetails.EngineNo;
      this.HdfcProposal.CarDetail.ChassisNo = this.VehicleDetails.ChassisNo;
      this.HdfcProposal.CarDetail.VehicleIDV = policyDetails.CalIDVAmount;
      this.HdfcProposal.Insurer = policyDetails.Insurer;
      this.HdfcProposal.VehicleCode = policyDetails.VehicleCode;

      // for Get and Set Electrical SumInsure and Non Electrical SumInsure value from "policyDetails.CalcPremium.addonCovers"
      if (policyDetails.CalcPremium.addonCovers.length > 0) {

        let ElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "Electrical_Accessories_Premium" && x.Key == "Accessories");
        let NonElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "NonElectrical_Accessories_Premium" && x.Key == "Accessories");

        if (ElectricalPremium.length > 0) {
          this.HdfcProposal.CarDetail.ElectricalAccessories = ElectricalPremium[0].SumInsure;
        }

        if (NonElectricalPremium.length > 0) {
          this.HdfcProposal.CarDetail.NonElectricalAccessories = NonElectricalPremium[0].SumInsure;
        }
      }

      let _proposalType = MotorQuotationData.BusinessType;
      if (_proposalType == MotorBusinessTypeEnum['Roll Over']) {
        this.MinChassisNo = 5;
      }
      else if (_proposalType == MotorBusinessTypeEnum['New']){
        this.MinChassisNo = 17;
      }
    } else {
      this.backClick();
    }

    if (this.VehicleDetails.Financed && this.VehicleDetails.Financer != '') {

      let Rule: IFilterRule[] = [{
        Field: "InsuranceHelper.Type",
        Operator: "eq",
        Value: "HDFCFinancier"
      }]


      /**
       * This data come fron Vehicle details
       * Bind Data Of Vehicle  Financier Code
       */
      this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.ListHelper.List, 'InsuranceHelper.Name', '', Rule).subscribe(res => {
        let Financer = res.Data.Items.find(Financer => Financer.Name == this.VehicleDetails.Financer)

        if (Financer) {
          this.HdfcProposalForm.get('CustomerDetail').patchValue(
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
    this.GenderList = [];
    // fill gender list
    this._MasterListService
      .getCompanyWiseList('HDFCErgo', 'gender')
      .subscribe((res) => {
        if (res.Success) {
          this.GenderList = res.Data.Items;
        }
      });

    // fill nominee relation list
    this.NomineeRelationList = [];
    this._MasterListService
      .getCompanyWiseList('HDFCErgo', 'nomineerelation')
      .subscribe((res) => {
        if (res.Success) {
          this.NomineeRelationList = res.Data.Items;
        }
      });

    this.InsurerList = [];
    // fill nominee relation list
    this._MasterListService
      .getCompanyWiseList('HDFCErgo', 'hdfcergopreinsurer')
      .subscribe((res) => {
        if (res.Success) {
          this.InsurerList = res.Data.Items;
        }
      });

    //fill financier code list
    this.FinancierCodeList = [];
    this._MasterListService
      .getCompanyWiseList('HDFCErgo', 'hdfcfinanciercode')
      .subscribe((res) => {
        if (res.Success) {
          this.FinancierCodeList = res.Data.Items;
        }
      });
  }

  /**
   * Build Main Proposal Create Form
   * @param data
   * @returns
   */
  private _buildHdfcProposalForm(data: IHDFCMotorDto) {
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
      PanNumber: ['', [Validators.required]],
      UID: ['', [Validators.required]],
      CINnumber: [''],
      CampanyType: [''],
      CarDetail: this._hdfcCarDetailsForm(data.CarDetail),
      PolicyDetail: this._hdfcPolicyDetailForm(data.PolicyDetail),
      CustomerDetail: this._hdfcCustomerDetailForm(data.CustomerDetail),
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
  private _hdfcCarDetailsForm(CarDetailsData: IHdfcCarDetail) {
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
  private _hdfcPolicyDetailForm(PolicyDetailData: IHdfcPolicyDetail) {
    let PolicyDetailForm = this.fb.group({
      PreviousPolicyNo: [''],
      VehicleNo: [''],
      PolicyPeriod: [0],
      PreviousPolicyClaim: [],
      PreviousPolicyNCBPercentage: [0],
      PreviousPolicyType: [''],
      PreviousInsurer: [''],
      // PreviousPolicyODEndDate: [''],
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
