import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, } from '@angular/forms';
import { IVehicleDetailsDto, VehicleDetailsDto, } from '@models/dtos/config/Vehicle/vehicle-details-dto';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { Alert, IAdditionalFilterObject, IFilterRule, OrderBySpecs } from '@models/common';
import { Router } from '@angular/router';
import { ROUTING_PATH } from '@config/routingPath.config';
import { IMotorQuickQuoteDto, MotorQuickQuoteDto, } from '@models/dtos/config/vehicle-policy/Motor QuickQuote/motor-quickquote.Dto';
import { dropdown } from '@config/dropdown.config';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { MotorBusinessTypeEnum } from 'src/app/shared/enums/MotorBusinessType.enum';
import * as moment from 'moment';
import { FuelTypeEnum } from 'src/app/shared/enums/fuel-type-enum';
import { MotorBiFuelTypeEnum } from 'src/app/shared/enums/MotorBiFuelType.enum';
import { MotorVehicleTypeEnum } from 'src/app/shared/enums/MotorVehicleType.enum';
import { MatDatepicker } from '@angular/material/datepicker';
import { Moment } from 'moment';
import { MotorInsurancePlanService } from './motor-insurance-plan.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { ValidationRegex } from '@config/validationRegex.config';
import { MotorPolicyTypeEnum } from 'src/app/shared/enums/MotorPolicyType.enum';
import { MasterListService } from '@lib/services/master-list.service';
import { MotorCustomerTypeEnum } from 'src/app/shared/enums/MotorCustomerType.enum';
import { MatStepper } from '@angular/material/stepper';
import { DialogService } from '@lib/services/dialog.service';
import { IRtoDto } from '@models/dtos/core/RtoDto';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { IVehicleModelDto } from '@models/dtos/core/VehicleModelDto';
import { IVehicleSubModelDto } from '@models/dtos/core/VehicleSubModel';

@Component({
  selector: 'gnx-motor-insurance-plan',
  templateUrl: './motor-insurance-plan.component.html',
  styleUrls: ['./motor-insurance-plan.component.scss'],
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
export class MotorInsurancePlanComponent {

  //#region decorator

  // Dropdown Search Input Element Access
  @ViewChild('BrandSearchCtrl') private _brandSearch: ElementRef;
  @ViewChild('ModelSearchCtrl') private _modelSearch: ElementRef;
  @ViewChild('SubModelSearchCtrl') private _subModelSearch: ElementRef;
  @ViewChild('RTOSearchCtrl') private _rTOSearch: ElementRef;

  //#endregion

  //#region public properties

  // declare string variable
  public title: string;
  public manufacturingDate = new FormControl(moment());
  public vehicleNo = new FormControl('', [Validators.required]);

  // declare number variable
  public minChassisNo: number = 10;
  public maxChassisNo: number = 17;

  // declare boolean variable
  chkPersonalAccident: boolean = false;
  public chkZeroDepreciation: boolean = false;
  public chkNCBProtection: boolean = false;
  public chkInvoiceCover: boolean = false;
  public chkRoadAssistance: boolean = false;
  public chkEngineProtector: boolean = false;
  public chkAccessories: boolean = false;
  public chkDriverCover: boolean = false;
  public showFreshQuotebutton: boolean = false

  // declare Form Group
  public vehicleForm: FormGroup;
  public motorQuickQuoteForm: FormGroup;

  // declare dropdown
  public dropdownMaster: dropdown;

  // declare array list
  public policyTypeList = [];
  public previousPolicyTypeList = [];

  // declare date
  public currentDate: Date; // current date
  public minPolicyStartDate: Date; //minimum policy start date(for Business Type 'New' minPolicy start date can be 10 days back than current date)
  public maxPolicyStartDate: Date;
  public minRegDate: Date; //minimum Registration Date

  // declare list for Two Wheeler details
  public brandList: IBranchDto[];
  public modelList: IVehicleModelDto[];
  public subList: IVehicleSubModelDto[];
  public rTOList: IRtoDto[];

  public ncbPercentageList = [
    { Name: '-- Select --', Value: null },
    { Name: '0%', Value: 0 },
    { Name: '20%', Value: 20 },
    { Name: '25%', Value: 25 },
    { Name: '35%', Value: 35 },
    { Name: '45%', Value: 45 },
    { Name: '50%', Value: 50 },
  ];

  //#endregion

  //#region private properties

  // declare DTO
  private _vehicleDetails: IVehicleDetailsDto;
  private _motorQuickQuote: IMotorQuickQuoteDto;

  // declare error list
  private _alert: Alert[] = [];
  private _stepTwoAlert: Alert[] = [];

  // declare form control
  private _step1 = new FormControl();
  private _step2 = new FormControl();

  // declare list for Two Wheeler details
  private _brandArray: IBranchDto[];
  private _modelArray: IVehicleModelDto[];
  private _subArray: IVehicleSubModelDto[];
  private _rTOArray: IRtoDto[];

  // declare Reg variable
  private _vehicleReg: RegExp = ValidationRegex.VehicleNumReg;
  private _bHRTONopattern: RegExp = ValidationRegex.BHRTONopattern;

  private _pagefilters = {
    currentPage: 1,
  };

  //#endregion

  //#region constructor
  constructor(
    private _fb: FormBuilder,
    private _alertservice: AlertsService,
    private _router: Router,
    private _datePipe: DatePipe,
    private _motorInsuranceService: MotorInsurancePlanService,
    private _column: ColumnSearchService,
    private _masterListService: MasterListService,
    private _dialogService: DialogService,
  ) {
    this.title = 'Motor - Two Wheeler'; //title
    this.dropdownMaster = new dropdown();

    this.currentDate = new Date(); //current Date
    this.minPolicyStartDate = new Date(); // minimum Proposal Date
    this.maxPolicyStartDate = new Date(); // minimum Proposal Date

    this._vehicleDetails = new VehicleDetailsDto();

    this._column.FilterConditions.Rules = [
      { Field: 'Status', Operator: 'eq', Value: '1' },
    ];

    let AdditionalFilters: IAdditionalFilterObject[] = [
      { key: 'VehicleType', filterValues: ['Two Wheeler'] },
    ];

    let rules: IFilterRule[] = [
      { Field: 'Status', Operator: 'eq', Value: '1' },
    ];

    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.VehicleBrand.List, 'Name', '', rules, AdditionalFilters).subscribe((res) => {
      this.brandList = res.Data.Items;
      this._brandArray = this.brandList;
    });

    // this.brandList = this._motorInsuranceService._loadListsWithResponse(
    //   API_ENDPOINTS.VehicleBrand.Base
    // );

    this.rTOList = this._motorInsuranceService._loadListsWithResponse(
      API_ENDPOINTS.RTO.Base
    );

    // this._brandArray = this.brandList;
    this._rTOArray = this.rTOList;

    this._motorQuickQuote = new MotorQuickQuoteDto();
    this.motorQuickQuoteForm = this._initMotorQuickQuoteForm(
      this._motorQuickQuote
    );

    this.vehicleForm = this._buildTwoWheelerDetails();

    if (
      localStorage.getItem('TwoWheelerMotorInsurance') &&
      localStorage.getItem('TwoWheelerVehicleDetails')
    ) {
      this.showFreshQuotebutton = true
      this.motorQuickQuoteForm.patchValue(
        JSON.parse(localStorage.getItem('TwoWheelerMotorInsurance'))
      );
      this.vehicleForm.patchValue(
        JSON.parse(localStorage.getItem('TwoWheelerVehicleDetails'))
      );
      this._dataFromLocalStorage();
    }
  }
  // #endregion constructor

  //#region public-getters

  public get f() {
    return this.motorQuickQuoteForm.controls;
  }

  public get MotorBusinessType(): any {
    return MotorBusinessTypeEnum;
  }

  public get MotorBiFuleType(): any {
    return MotorBiFuelTypeEnum;
  }

  public get FuelType(): any {
    return FuelTypeEnum;
  }

  public get VehicleType(): any {
    return MotorVehicleTypeEnum;
  }

  public get MotorCustomerType(): any {
    return MotorCustomerTypeEnum;
  }

  //#endregion

  //#region life cycle hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this._changeInData();
    this._changeInRtoData();
  }

  //#endregion

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // back to motor page
  public back(): void {
    this._router.navigate([ROUTING_PATH.Basic.Motor]);
  }

  /**
   * blur event for Registration No..
   * When Vehicle Type is Old blur event is triggered for Registration No.
   * Firstly VehicleNo is validated and checked if value is in correct format
   * than RTO Api is called to get Two Wheeler Details
   */
  public rtoDetailsAPI(event): void {
    if (event.target.value) {

      // remove before set new data
      localStorage.removeItem('TwoWheelerMotorInsurance');
      this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
        YearOfManufacture: '',
        DriverCover: false,
        ZeroDepreciation: false,
        Accessories: false,
        ElectricalAccessories: null,
        NonElectricalAccessories: null,
        NCBProtection: false,
        InvoiceCover: false,
        RoadsideAssistance: false,
        EngineProtector: false,
        DateofFirstRegistration: '',
        VehicleIDV: 0,

        // API in not required columns
        PersonalAccident: false,
        // TyreSecure: false,
        // DriverCoverSumInsured: 0,
        // BiFuelType: '',
        // BiFuelKitValue: '',
      }, { emitEvent: false });

      this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
        VehicleNo: '',
        PreviousPolicyNo: '',
        PreviousPolicyClaim: false,
        PolicyPeriod: 1,
        PreviousPolicyType: '',
        PreviousInsurer: '',
        PreviousInsurerAddress: '',
        PreviousPolicyStartDate: '',
        PreviousPolicyEndDate: '',
        PreviousPolicyTPStartDate: '',
        PreviousPolicyTPEndDate: '',
        PreviousPolicyBiFuel: false,
      }, { emitEvent: false })

      this.motorQuickQuoteForm.patchValue({
        VehicleType: "TwoWheeler",
        Insurer: 0,
        PolicyStartDate: new Date(),
        ProposalDate: '',
        RegistrationDate: '',
        RTOCode: '',
        VehicleSubModelId: [],
      }, { emitEvent: false });

      if (event.target.value?.toLowerCase() == 'new') {
      } else {
        let VehicleData: IVehicleDetailsDto = new VehicleDetailsDto();
        let error: Alert[] = this._checkvehicleNo();
        if (error.length > 0) {
          this._alertservice.raiseErrors(error);
          return;
        }
        VehicleData.VehicleNo = this._vehicleNumFormat();
        VehicleData.VehicleType = "Two Wheeler";
        this._motorInsuranceService
          .vehicleDetails(VehicleData)
          .subscribe((res) => {
            if (res.Success) {
              this._TwoWheelerDetails(res);
            } else {
              this._alertservice.raiseErrorAlert(res.Message);
            }
          });
      }
    }
  }

  /**
   * to have value of Registration No. in upper case and append ' - '
   */
  public vehicleNoFormating(event): void {
    // this.vehicleNo.patchValue(event.target.value.toUpperCase())
    let No: string = event.target.value.trim().toUpperCase();
    if (No.length == 2 || No.length == 5) No += '-'; // Alpha in RTO No may be single or double
    this.vehicleNo.patchValue(No);
  }

  /**
   * check for stepper 2 validation
   * if all the fields are valid than move forward
   * Firstly change the format of the PolicyStartDate & ProposalDate to yyyy-MM-dd format and than store the data in local storage
   */
  public getQuickQuote(): void {
    let stepThreeError: Alert[] = this._stepThreeValidation();
    if (stepThreeError.length > 0) {
      this._alertservice.raiseErrors(stepThreeError);
      return;
    }
    this._dateFormat();
    this.setPolicyDetailsFormValue();
    this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
      PreviousPolicyBiFuel: this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyBiFuel').value == "true" || this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyBiFuel').value == true ? true : false,
      // PreviousPolicyZeroDepreciation : this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').value || this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').value == true ? true : false,
      // PreviousPolicyInvoiceCover : this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyInvoiceCover').value == "true" || this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyInvoiceCover').value == true ? true : false, 
      // PreviousPolicyEngineProtector : this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEngineProtector').value == "true" || this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEngineProtector').value == true ? true : false,
      // PreviousPolicyConsumable : this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyConsumable').value == "true" || this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyConsumable').value == true ? true : false,
    })

    // if (this.motorQuickQuoteForm.get('BusinessType').value != MotorBusinessTypeEnum['Roll Over']) {
    //   this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
    //     PreviousPolicyBiFuel: false,
    //     PreviousPolicyZeroDepreciation: false,
    //     PreviousPolicyInvoiceCover: false,
    //     PreviousPolicyTyreCover: false,
    //     PreviousPolicyEngineProtector: false,
    //     PreviousPolicyConsumable: false,
    //   });
    // }

    localStorage.setItem('TwoWheelerMotorInsurance', JSON.stringify(this.motorQuickQuoteForm.value));
    localStorage.setItem('TwoWheelerVehicleDetails', JSON.stringify(this.vehicleForm.value));
    this._router.navigate([ROUTING_PATH.MotorTwoWheelerQuote.Plan]);
  }

  /**
   * When Close Mat-select Search drplist Bind Origin data In list
   * && Clear SearchCtrl Value
   * @param closeFor
   */
  public CloseDropdownEven(closeFor: string): void {
    if (closeFor == 'Brand') {
      this._brandSearch.nativeElement.value = '';
      this.brandList = this.filterDropDownList('', closeFor);
    }
    if (closeFor == 'Model') {
      this._modelSearch.nativeElement.value = '';
      this.modelList = this.filterDropDownList('', closeFor);
    }
    if (closeFor == 'Sub') {
      this._subModelSearch.nativeElement.value = '';
      this.subList = this.filterDropDownList('', closeFor);
    }
    if (closeFor == 'RTO') {
      this._rTOSearch.nativeElement.value = '';
      this.rTOList = this.filterDropDownList('', closeFor);
    }
  }

  // search in dropDown
  /**
   * to filter from the list
   * @param event : change in the value
   * @param name : dropdown in which search is being done
   */
  public searchInDropDown(event, name): void {
    let value = event.target.value;

    if (name == 'Brand') {
      this.brandList = this.filterDropDownList(value, name);
    }
    if (name == 'Model') {
      this.modelList = this.filterDropDownList(value, name);
    }
    if (name == 'Sub') {
      this.subList = this.filterDropDownList(value, name);
    }
    if (name == 'RTO') {
      this.rTOList = this.filterDropDownList(value, name);
    }
  }

  // filter lists as per data
  public filterDropDownList(value: string, name): any {
    let filter = value?.toLowerCase();

    if (name == 'Brand') {
      if (this._brandArray && this._brandArray.length > 0) {
        return this._brandArray.filter((option) =>
          option.Name?.toLowerCase().includes(filter)
        );
      } else {
        return [];
      }
    }

    if (name == 'Model') {
      let Brand = this.vehicleForm.get('Brand').value?.toLowerCase();
      if (this._modelArray && this._modelArray.length > 0) {
        return this._modelArray.filter(
          (option) =>
            option.Name?.toLowerCase().includes(filter) &&
            option.BrandName?.toLowerCase().includes(Brand)
        );
      } else {
        return [];
      }
    }

    if (name == 'Sub') {
      let Model = this.vehicleForm.get('Model')?.value.toLowerCase();
      if (this._subArray && this._subArray.length > 0) {
        return this._subArray.filter(
          (option) =>
            option.Name?.toLowerCase().includes(filter) &&
            option.ModelName?.toLowerCase().includes(Model) &&
            option.FuelType?.toLowerCase().includes(
              this.vehicleForm?.get('FuelType').value.toLowerCase()
            )
        );
      } else {
        return [];
      }
    }

    if (name == 'RTO') {
      if (this._rTOArray && this._rTOArray.length > 0) {
        return this._rTOArray.filter((option) =>
          option.Code?.toLowerCase().includes(filter)
        );
      } else {
        return [];
      }
    } else {
      return name;
    }
  }

  // chosen year
  public chosenYearHandler(normalizedYear: Moment): void {
    const ctrlValue = this.manufacturingDate.value;
    ctrlValue.year(normalizedYear.year());
    this.manufacturingDate.setValue(ctrlValue);
  }

  // chosen month
  public chosenMonthHandler(
    normalizedMonth: Moment,
    datepicker: MatDatepicker<Moment>
  ): void {
    const ctrlValue = this.manufacturingDate.value;
    ctrlValue.month(normalizedMonth.month());
    this.manufacturingDate.setValue(ctrlValue);
    var DateString = moment(this.manufacturingDate.value).format('MM/YYYY');
    this.vehicleForm.patchValue({ ManufacturingDate: DateString });
    datepicker.close();
  }

  // public isNCBApplicable() {

  //   if (this.motorQuickQuoteForm.get('BusinessType').value == this.MotorBusinessType['Roll Over']) {

  //     let PolicyStartDate = new Date(
  //       this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyStartDate').value, 'yyyy-MM-dd')
  //     );

  //     let PreviousPolicyTPEndDate = new Date(this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyTPEndDate').value, 'yyyy-MM-dd'));

  //     let startDate = moment(this._datePipe.transform(PolicyStartDate, 'yyyy-MM-dd'));
  //     startDate = startDate.add(-1, 'day');

  //     PolicyStartDate = new Date(this._datePipe.transform(startDate.toDate(), 'yyyy-MM-dd'));

  //     // Greater than check
  //     if (PolicyStartDate > PreviousPolicyTPEndDate) {
  //       return false;
  //     }

  //     let PreviousPolicyEndDate = new Date(this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value, 'yyyy-MM-dd'));
  //     if (PolicyStartDate > PreviousPolicyEndDate) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  // check stepper 1 for error
  public stepOneValidation(): FormControl {
    this._alert = [];

    // BusinessType
    if (this.motorQuickQuoteForm.get('BusinessType').invalid) {
      this._alert.push({
        Message: 'Select Proposal Type',
        CanDismiss: false,
        AutoClose: false,
      });
    } else {
      /**
       * Business Type 'New' can only be selected when difference between current date and registration date is less than or equals to 6
       */
      let RegDate = moment(
        this._datePipe.transform(
          this.motorQuickQuoteForm.getRawValue().RegistrationDate,
          'yyyy-MM-dd'
        )
      );
      let CuDate = moment(
        this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')
      );
      let diffBtwRegistrationCurrentDate = CuDate.diff(RegDate, 'month');
      if (
        this.motorQuickQuoteForm.get('BusinessType').value ==
        MotorBusinessTypeEnum.New &&
        diffBtwRegistrationCurrentDate > 6
      ) {
        this._alert.push({
          Message:
            'In case of New Proposal Type , Registration or Delivery Date must be within past 6 months period.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // PolicyType
    if (this.motorQuickQuoteForm.get('PolicyType').invalid) {
      this._alert.push({
        Message: 'Select Policy Type',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Registration No.
    if (this.vehicleNo.invalid) {
      this._alert.push({
        Message: 'Enter Registration No.',
        CanDismiss: false,
        AutoClose: false,
      });
    } else if (this.vehicleNo.value.toLocaleLowerCase() != 'new') {
      let isValidNo: Boolean = false;
      if (
        this._vehicleReg.test(this.vehicleNo.value) ||
        this._bHRTONopattern.test(this.vehicleNo.value)
      ) {
        isValidNo = true;
      }
      if (isValidNo == false) {
        this._alert.push({
          Message: 'Enter Registration No. with Valid Format.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // Brand
    if (this.vehicleForm.get('Brand').invalid) {
      this._alert.push({
        Message: 'Select Brand',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Model
    if (this.vehicleForm.get('Model').invalid) {
      this._alert.push({
        Message: 'Select Model',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Fuel
    if (this.vehicleForm.get('Fuel').invalid) {
      this._alert.push({
        Message: 'Select Fuel',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // SubModel
    if (this.vehicleForm.get('SubModel').invalid) {
      this._alert.push({
        Message: 'Select Sub-Model',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // RTOCode
    if (this.vehicleForm.get('RTOCode').invalid) {
      this._alert.push({
        Message: 'Select RTO Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // ManufacturingDate
    if (this.vehicleForm.get('ManufacturingDate').value == '') {
      this._alert.push({
        Message: 'Enter Month & Year Of Mfg',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // RegistrationDate
    if (this.vehicleForm.get('RegistrationDate').invalid) {
      if (this.vehicleForm.get('RegistrationDate').value != '') {
        this._alert.push({
          Message: 'Enter Valid Registration or Delivery Date',
          CanDismiss: false,
          AutoClose: false,
        });
      } else {
        this._alert.push({
          Message: 'Enter Registration or Delivery Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this._alert.length > 0) {
      this._step1.setErrors({ required: true });
      return this._step1;
    } else {
      this._step1.reset();
      return this._step1;
    }
  }

  // error in stepper 1
  public stepOneError(): any {
    if (this._alert.length > 0) {
      this._alertservice.raiseErrors(this._alert);
      return;
    }
  }

  // check stepper 2 for error
  public stepTwoValidation(): FormControl {
    this._stepTwoAlert = [];

    // ProposalDate
    if (this.motorQuickQuoteForm.get('ProposalDate').invalid) {
      if (this.motorQuickQuoteForm.get('ProposalDate').value) {
        this._stepTwoAlert.push({
          Message: 'Enter Valid Proposal Date',
          CanDismiss: false,
          AutoClose: false,
        });
      } else {
        this._stepTwoAlert.push({
          Message: 'Enter Proposal Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // PolicyStartDate
    if (this.motorQuickQuoteForm.get('PolicyStartDate').value == "" || this.motorQuickQuoteForm.get('PolicyStartDate').value == null) {
      this._stepTwoAlert.push({
        Message: 'Enter Policy Start Date',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    // if (this.motorQuickQuoteForm.get('PolicyStartDate').invalid) {

    //   if (this.motorQuickQuoteForm.get('PolicyStartDate').value) {
    //     this._stepTwoAlert.push({
    //       Message: 'Enter Valid Policy Start Date',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   } else {

    //   }
    // }
    else {
      // check PolicyStartDate is today in case of new business type
      //|| this.motorQuickQuoteForm.get('BusinessType').value == 'Rollover'
      if (this.motorQuickQuoteForm.get('BusinessType').value == 'New') {
        let PolicyStartDate = new Date(
          this._datePipe.transform(
            this.motorQuickQuoteForm.getRawValue().PolicyStartDate,
            'yyyy-MM-dd'
          )
        );

        let TodayDate = new Date(
          this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')
        );

        if (!moment(PolicyStartDate).isSame(moment(TodayDate, 'yyy-MM-dd'))) {
          this._stepTwoAlert.push({
            Message: 'Policy Start Date must be today in case of new Policy',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
      else {
        //this.maxPolicyStartDate
        let PolicyStartDate = new Date(
          this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyStartDate').value, 'yyyy-MM-dd')
        );
        // Greater than check
        if (PolicyStartDate > this.maxPolicyStartDate) {

          this._stepTwoAlert.push({
            Message: 'Policy Start Date must not greater then ' + this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyStartDate').value, 'dd/MM/yyyy').toString(),
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
    }

    // DateofFirstRegistration
    if (
      this.motorQuickQuoteForm.get('TwoWheelerDetail.DateofFirstRegistration').invalid
    ) {
      this._stepTwoAlert.push({
        Message: 'Enter Date of First Registration',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.vehicleForm.get('FuelType').value == this.FuelType.Petrol) {
      // IsBiFuel
      // if (this.motorQuickQuoteForm.get('TwoWheelerDetail.IsBiFuel').value) {
      //   // BiFuelType
      //   if (this.motorQuickQuoteForm.get('TwoWheelerDetail.BiFuelType').invalid) {
      //     this._stepTwoAlert.push({
      //       Message: 'Select BiFuel Type',
      //       CanDismiss: false,
      //       AutoClose: false,
      //     });
      //   }

      //   // BiFuelKitValue
      //   if (this.motorQuickQuoteForm.get('TwoWheelerDetail.BiFuelKitValue').invalid) {
      //     if (
      //       this.motorQuickQuoteForm.get('TwoWheelerDetail.BiFuelKitValue').value > 0
      //     ) {
      //       this._stepTwoAlert.push({
      //         Message: 'BiFuel Kit Value cannot be more than 40000',
      //         CanDismiss: false,
      //         AutoClose: false,
      //       });
      //     } else {
      //       if (
      //         this.motorQuickQuoteForm.get('TwoWheelerDetail.BiFuelKitValue').value !=
      //         ''
      //       ) {
      //         this._stepTwoAlert.push({
      //           Message: 'Enter valid BiFuel Kit Value',
      //           CanDismiss: false,
      //           AutoClose: false,
      //         });
      //       } else {
      //         this._stepTwoAlert.push({
      //           Message: 'Enter BiFuel Kit Value',
      //           CanDismiss: false,
      //           AutoClose: false,
      //         });
      //       }
      //     }
      //   }

      //   // // BiFuelType
      //   // if (this.motorQuickQuoteForm.get('TwoWheelerDetail.IsBiFuel').value == true) {
      //   //   if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyBiFuel').value == null) {
      //   //     this._stepTwoAlert.push({
      //   //       Message: 'Select Is Previous Policy BiFuel Taken?',
      //   //       CanDismiss: false,
      //   //       AutoClose: false,
      //   //     });
      //   //   }
      //   // }
      // }
      // else {
      //   this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyBiFuel').patchValue(false);
      // }
      this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyBiFuel').patchValue(false);
    }
    else {
      this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyBiFuel').patchValue(false);
    }

    if (this.motorQuickQuoteForm.get('BusinessType').value == this.MotorBusinessType['Roll Over']) {
      // PreviousPolicyType
      if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyType').invalid) {
        this._stepTwoAlert.push({
          Message: 'Enter Previous Policy Type',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // PreviousPolicyStartDate
      if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyStartDate').value == "" || this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyStartDate').value == null) {
        this._stepTwoAlert.push({
          Message: 'Enter Previous Policy Start Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // PreviousPolicyEndDate
      if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value == "" || this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value == null) {
        this._stepTwoAlert.push({
          Message: 'Enter Previous Policy End Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyStartDate').value != "" && this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyStartDate').value != null && this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value != "" && this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value != null) {

        var startDate = this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyStartDate').value;
        var endDate = this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value;

        if ((Date.parse(endDate) <= Date.parse(startDate))) {
          this._stepTwoAlert.push({
            Message: 'Previous Policy End Date should be greater than Previous Policy Start Date',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

      // // PreviousPolicyODEndDate
      // if (this.motorQuickQuoteForm.get('PolicyType').value != 'ThirdPartyOnly') {
      //   if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyODEndDate').invalid) {
      //     this._stepTwoAlert.push({
      //       Message: 'Enter On Damage End Date',
      //       CanDismiss: false,
      //       AutoClose: false,
      //     });
      //   }
      // }

      if (this.motorQuickQuoteForm.get('PolicyType').value == MotorPolicyTypeEnum['Own Damage']) {

        // PreviousPolicyTPStartDate
        if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyTPStartDate').invalid) {
          this._stepTwoAlert.push({
            Message: 'Enter Third Party Start Date',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        // PreviousPolicyTPEndDate
        if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyTPEndDate').invalid) {
          this._stepTwoAlert.push({
            Message: 'Enter Third Party End Date',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

      // PreviousPolicyClaim
      if (
        this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyClaim')
          .value == null
      ) {
        this._stepTwoAlert.push({
          Message: 'Select Claim In Previous Year',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // EngineNo
    if (this.vehicleForm.get('EngineNo').invalid) {
      this._stepTwoAlert.push({
        Message: 'Enter Engine No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // ChassisNo
    if (!this.vehicleForm.get('ChassisNo').value) {
      this._stepTwoAlert.push({
        Message: 'Enter Chassis No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    else {

      // if (this.motorQuickQuoteForm.get('BusinessType').value == this.MotorBusinessType['Roll Over']) {
      //   if (this.vehicleForm.get('ChassisNo').value.length != this.maxChassisNo && this.vehicleForm.get('ChassisNo').value.length != this.minChassisNo) {
      //     this._stepTwoAlert.push({
      //       Message: 'Chassis No. must be either ' + this.minChassisNo + ' or ' + this.maxChassisNo + ' characters',
      //       CanDismiss: false,
      //       AutoClose: false,
      //     });
      //   }
      // }
      // else {

      //   if (this.vehicleForm.get('ChassisNo').value.length != this.maxChassisNo) {
      //     this._stepTwoAlert.push({
      //       Message: 'Chassis No. must be of ' + this.maxChassisNo + ' characters',
      //       CanDismiss: false,
      //       AutoClose: false,
      //     });
      //   }
      // }
      if (this.vehicleForm.get('ChassisNo').value.length > this.maxChassisNo || this.vehicleForm.get('ChassisNo').value.length < this.minChassisNo) {
        this._stepTwoAlert.push({
          Message: 'Chassis No. must be between of ' + this.minChassisNo + ' to ' + this.maxChassisNo + ' characters',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // //NCB
    // if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').value > 0 && this.isNCBApplicable() == false) {
    //   this._stepTwoAlert.push({
    //     Message: 'NCB is not Applicable.',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }


    if (this._stepTwoAlert.length > 0) {
      this._step2.setErrors({ required: true });
      return this._step2;
    } else {
      this._step2.reset();
      return this._step2;
    }
  }

  // error in stepper 2
  public stepTwoError(): any {
    if (this._stepTwoAlert.length > 0) {
      this._alertservice.raiseErrors(this._stepTwoAlert);
      return;
    }
  }

  public getminRegDate(): void {
    if (this.vehicleForm.get('ManufacturingDate').value) {
      let MfgParts = this.vehicleForm.get('ManufacturingDate').value.split('/');
      if (MfgParts.length > 1) {
        if (this.isNumber(MfgParts[0]) && this.isNumber(MfgParts[1])) {
          let MfgDate = MfgParts[0] + '/01/' + MfgParts[1];
          this.minRegDate = new Date(
            this._datePipe.transform(MfgDate, 'yyyy-MM-dd')
          );
        }
      }
    }

    return;
  }

  public checkMfgWithReg(): boolean {
    if (
      this.vehicleForm.get('ManufacturingDate').value &&
      this.vehicleForm.get('RegistrationDate').value
    ) {
      let MfgParts = this.vehicleForm.get('ManufacturingDate').value.split('/');
      if (MfgParts.length > 1) {
        let RegistrationDate = this.vehicleForm.get('RegistrationDate').value;

        if (this.isNumber(MfgParts[0]) && this.isNumber(MfgParts[1])) {
          let MfgDate = MfgParts[1] + '-' + MfgParts[0] + '-01';
          let ManufacturingDate = new Date(
            this._datePipe.transform(MfgDate, 'yyyy-MM-dd')
          );
          RegistrationDate = new Date(
            this._datePipe.transform(RegistrationDate, 'yyyy-MM-dd')
          );

          this.minRegDate = ManufacturingDate;
          // compare Registration Date and Manufacturing Date

          // Greater than check
          if (ManufacturingDate > RegistrationDate) {
            this._alertservice.raiseErrorAlert(
              'Manufacturing is greater than Registration Date which is not allowed'
            );
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * According to the change in value of mat-slide-toggle , value of CustomerType is updated
   * @param event : to identify change in the value of mat-slide-toggle
   */
  public changeInCustomerType(event): void {
    if (event.checked) {
      this.motorQuickQuoteForm.get('CustomerDetail').patchValue({
        CustomerType: MotorCustomerTypeEnum.Corporate,
      });
    } else {
      this.motorQuickQuoteForm.get('CustomerDetail').patchValue({
        CustomerType: MotorCustomerTypeEnum.Individual,
      });
    }
  }

  /**
   * Function called on blur event to check
   * Policy start date with previous policy end date 
  */
  public checkPolicyStartDate(): void {

    let currentDate = moment(this._datePipe.transform(new Date()))

    if (this.motorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyEndDate != null) {
      // let policyStartDate = moment(this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyStartDate').value, 'yyyy-MM-dd'));
      let prevPolicyEndDate = moment(this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyEndDate, 'yyyy-MM-dd'));

      if (prevPolicyEndDate < currentDate) {
        this.motorQuickQuoteForm.get('PolicyStartDate').patchValue(currentDate, { emitEvent: false });
      }
      else {
        prevPolicyEndDate = prevPolicyEndDate.add(1, 'day')
        this.motorQuickQuoteForm.get('PolicyStartDate').patchValue(prevPolicyEndDate, { emitEvent: false });
      }
    }
  }

  // reset stepper and form
  public ResetStepper(stepper: MatStepper): void {
    if (localStorage.getItem('TwoWheelerMotorInsurance') ||
    localStorage.getItem('TwoWheelerVehicleDetails')) {
      this._dialogService
        .confirmDialog({
          title: 'Are You Sure?',
          message: "You want Fresh Quote",
          confirmText: 'Yes, Clear!',
          cancelText: 'No',
        })
        .subscribe((res) => {
          if (res == true) {
            this.showFreshQuotebutton = false
            localStorage.removeItem('TwoWheelerMotorInsurance');
            localStorage.removeItem('TwoWheelerVehicleDetails');
            this.motorQuickQuoteForm.reset();
            stepper.reset();
            this._InitValueOfForm();
          }

        })

    }

  }

  //#endregion public-methods

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private isNumber(value?: string | number): boolean {
    return value != null && value !== '' && !isNaN(Number(value.toString()));
  }

  /**
   * auto fill form if data is available from locaol storage
   */
  private _dataFromLocalStorage(): void {
    this.vehicleNo.patchValue(this.vehicleForm.get('VehicleNo').value);
    this._formDataDetails();
    this.vehicleForm.get('RTOCode').patchValue(
      this.motorQuickQuoteForm.get('RTOCode').value
    );
    this._policyListFilter(this.motorQuickQuoteForm.get('BusinessType').value);
    this.AddOnFliedDisabled();
  }

  /**
   * change the format of VehicleNo
   * remove '-' from VehicleNo
   * @returns VehicleNo without '-' or space
   */
  private _vehicleNumFormat(): string {
    let tempVehicleNum = this.vehicleNo.value.split('-');

    return (
      tempVehicleNum[0] +
      tempVehicleNum[1] +
      tempVehicleNum[2] +
      tempVehicleNum[3]
    );
  }

  // validating vehicle No.
  private _checkvehicleNo(): Alert[] {
    let vehicleNoError: Alert[] = [];
    if (this.vehicleNo.invalid) {
      vehicleNoError.push({
        Message: 'Enter Two Wheeler Number.',
        CanDismiss: false,
        AutoClose: false,
      });
    } else if (this.vehicleNo.value) {
      if (!this._vehicleReg.test(this.vehicleNo.value)) {
        vehicleNoError.push({
          Message: 'Enter Two Wheeler Number with Valid Format.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
    return vehicleNoError;
  }

  /**
   * identify change in the value of form
   */
  private _changeInRtoData(): void {
    this.vehicleForm.get('BrandId').valueChanges.subscribe((res) => {
      this._column.FilterConditions.Rules = [
        { Field: 'Status', Operator: 'eq', Value: '1' },
      ];
      this._brandChanges(res);
      this._loadDataWithFilters('Brand.Id', this.vehicleForm.get('BrandId').value, 'Model');

      this._column.FilterConditions.Rules = [
        { Field: 'Status', Operator: 'eq', Value: '1' },
      ];
      this.vehicleForm.get('Model').setValue('', { emitEvent: false })
      this.vehicleForm.get('ModelId').setValue(0, { emitEvent: false })
      this.vehicleForm.get('SubModel').setValue('', { emitEvent: false })
      this.vehicleForm.get('SubModelId').setValue(0, { emitEvent: false })
    });

    this.vehicleForm.get('ModelId').valueChanges.subscribe((res) => {

      if (this.vehicleForm.get('ModelId').valid) {
        this._modelChanges(res);

        this._column.FilterConditions.Rules = [
          { Field: 'Status', Operator: 'eq', Value: '1' },
          { Field: 'FuelType', Operator: 'eq', Value: this.vehicleForm?.get('FuelType').value },
        ];

        this._loadDataWithFilters('Model.Id', this.vehicleForm.get('ModelId').value, 'M', 'eq');
        this._motorInsuranceService
          ._loadLists(API_ENDPOINTS.VehicleSubModel.Base)
          .subscribe((result) => {
            if (result.Success) {
              this.subList = result.Data.Items;
              this._subArray = this.subList;
            }
          });
        this.vehicleForm.get('SubModel').setValue('', { emitEvent: false })
        this.vehicleForm.get('SubModelId').setValue(0, { emitEvent: false })
      }
    });

    this.vehicleForm.get('SubModelId').valueChanges.subscribe((res) => {
      this._subChange(res);
    });

    this.vehicleForm.get('Fuel').valueChanges.subscribe((res) => {
      let fuelvalue = this.dropdownMaster.FuelTypeOptions?.filter((option) =>
        option.name?.includes(res)
      );
      if (fuelvalue?.length) {
        this.vehicleForm.patchValue({
          FuelType: fuelvalue[0].value,
        });
        this._loadDataWithFilters(
          'FuelType',
          this.vehicleForm.get('FuelType').value,
          'Sub',
          'eq'
        );
        this.vehicleForm.get('SubModel').setValue('', { emitEvent: false })
        this.vehicleForm.get('SubModelId').setValue(0, { emitEvent: false })
      }
    });
  }

  /**
   * get data from api with filter
   * @param field : name of the field that is to be filtered
   * @param value : value of the filter field
   * @param Name : to identify which API is to a send request (Model or Sub)
   * @param operator : contains or eq
   * @param isAdditional : if any additional filter is required
   */
  private _loadDataWithFilters(
    field: string,
    value,
    Name: string,
    operator = '',
    isAdditional: boolean = false
  ): void {
    let onSearch: any;
    onSearch = {
      field: field,
      searchValue: value,
      operator: operator,
      isAdditional: isAdditional,
    };

    this._column.UpdateFilter(onSearch);
    this._pagefilters.currentPage = 1;

    if (Name == 'Model') {
      let rtorules: IFilterRule[] = [
        { Field: 'Status', Operator: 'eq', Value: '1' },
        { Field: 'Type', Operator: 'eq', Value: 'Two Wheeler' },
        { Field: 'Brand.Id', Operator: 'eq', Value: this.vehicleForm.get('BrandId').value },
      ];

      let orderSpecs: OrderBySpecs[] = [
        { field: "Name", direction: "asc" }
      ]

      let AdditionalFilters: IAdditionalFilterObject[]

      this._masterListService
        .getFilteredMultiRulMasterDataList(
          API_ENDPOINTS.VehicleModel.List,
          field,
          value,
          rtorules,
          AdditionalFilters,
          orderSpecs,
          "eq"
        )
        .subscribe((res) => {
          this.modelList = res.Data.Items;
          this._modelArray = this.modelList;
        });

      // this._motorInsuranceService
      //   ._loadLists(API_ENDPOINTS.VehicleModel.Base)
      //   .subscribe((res) => {
      //     if (res.Success) {
      //       this.modelList = res.Data.Items;
      //       this._modelArray = this.modelList;
      //     }
      //   });
      // this._column.FilterConditions.Rules = [
      //   { Field: 'Status', Operator: 'eq', Value: '1' },
      // ];
    } else if (Name == 'Sub') {
      this._motorInsuranceService
        ._loadLists(API_ENDPOINTS.VehicleSubModel.Base)
        .subscribe((res) => {
          if (res.Success) {
            this.subList = res.Data.Items;
            this._subArray = this.subList;
          }
        });
    } else {
      return this._column.UpdateFilter(onSearch);
    }
  }

  /**
   * patch value of BrandId based on Brand seleced
   * @param result : value of Brand
   */
  private _brandChanges(result): void {
    if (this._brandArray && this._brandArray.length > 0) {
      let brand = this._brandArray.filter((option) => result == option.Id)
      // let brand = this._brandArray.filter((option) =>
      //   option.Name?.toLowerCase().includes(result?.toLowerCase())
      // );
      if (brand.length > 0) {
        this.vehicleForm.patchValue({
          Brand: brand[0].Name,
        });
      }
    }
    // this.vehicleForm.get('Model').reset('')
  }

  /**
   * patch value of ModelId based on Model selected
   * @param result : value of Model
   */
  private _modelChanges(result): void {
    let model = this._modelArray.filter((option) => result == option.Id)
    if (this.vehicleForm.get('ModelId').valid) {
      if (model.length > 0) {
        this.vehicleForm.patchValue({
          Model: model[0].Name
        });
      }
    }
    // this.vehicleForm.get('SubModel').reset('')
  }

  /**
   * patch value of SubModelId based on SubModel selected
   * @param result : value of SubModel
   */
  private _subChange(result): void {
    if (this._subArray) {
      let Submodel = this._subArray.filter((option) => result == option.Id)
      // let model = this._subArray.filter((option) =>
      //   option.Name?.toLowerCase().includes(result?.toLowerCase())
      // );
      if (this.vehicleForm.get('SubModelId').valid) {
        if (Submodel.length > 0) {
          this.vehicleForm.patchValue({
            SubModel: Submodel[0].Name,
          });
        }
      }
    }
  }

  // change format of the date to (yyyy-MM-dd) format
  private _dateFormat(): void {
    this.motorQuickQuoteForm.patchValue({
      ProposalDate: this._datePipe.transform(
        this.motorQuickQuoteForm.getRawValue().ProposalDate,
        'yyyy-MM-dd'
      ),
      PolicyStartDate: this._datePipe.transform(
        this.motorQuickQuoteForm.getRawValue().PolicyStartDate,
        'yyyy-MM-dd'
      ),
      RegistrationDate: this._datePipe.transform(
        this.motorQuickQuoteForm.getRawValue().RegistrationDate,
        'yyyy-MM-dd'
      ),
    });
    this.vehicleForm.patchValue({
      RegistrationDate: this._datePipe.transform(
        this.vehicleForm.getRawValue().RegistrationDate,
        'yyyy-MM-dd'
      ),
    });
    this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
      DateofFirstRegistration: this._datePipe.transform(
        this.motorQuickQuoteForm.get('TwoWheelerDetail').getRawValue()
          .DateofFirstRegistration,
        'yyyy-MM-dd'
      ),
    });

    this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
      // PreviousPolicyODEndDate: this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyODEndDate, 'yyyy-MM-dd'),
      PreviousPolicyTPEndDate: this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyTPEndDate, 'yyyy-MM-dd'),
      PreviousPolicyTPStartDate: this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyTPStartDate, 'yyyy-MM-dd'),
      PreviousPolicyStartDate: this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyStartDate, 'yyyy-MM-dd'),
      PreviousPolicyEndDate: this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyEndDate, 'yyyy-MM-dd'),
    });
  }

  /**
   * depending on the value of BusinessType the policy Type List is being filtered
   * @param BusinessType : value of BusinessType in MotorQuickQuoteForm form
   *
   */
  private _policyListFilter(BusinessType: string): void {
    this.policyTypeList = [];
    this.previousPolicyTypeList = [];
    if (BusinessType == 'New') {
      /**
       * set minimum date for PolicyStartDate & Registration date
       */
      this.minRegDate = new Date(); // minimum Registration Date
      this.minRegDate.setDate(this.currentDate.getDate() - 9);
      this.minRegDate = new Date(
        this._datePipe.transform(this.minRegDate, 'yyyy-MM-dd')
      );
      this.motorQuickQuoteForm.get('ProposalDate').patchValue(
        this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')
      );
      this.motorQuickQuoteForm.get('PolicyStartDate').patchValue(
        this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')
      );
      this.vehicleNo.patchValue('New');

      // remove details of previous policy when Businesstype is "New"
      this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
        // PreviousPolicyODEndDate: '',
        PreviousPolicyTPStartDate: '',
        PreviousPolicyTPEndDate: '',
        PreviousPolicyType: '',
        PreviousInsurer: '',
      });

      /**
       * if BusinessType is 'New' than PolicyTypeList will not have 'OwnDamage' option
       */
      this.policyTypeList = JSON.parse(
        JSON.stringify(this.dropdownMaster.MotorPolicyTypeButtonOptions)
      );
      this.policyTypeList.forEach((element, index) => {
        if (element.value == 'OwnDamage') {
          this.policyTypeList.splice(index, 1);
        }
        if (element.value == 'ThirdPartyOnly') {
          this.policyTypeList.splice(index, 1);
        }
      });
      // for BusinessType 'New' , RTOCode will be enable
      this.vehicleForm.get('RTOCode').enable();
      this.maxPolicyStartDate = new Date();

      // this.minChassisNo = 10;
      // this.maxChassisNo = 10;
    } else {
      // policy start date must be within next 3 month
      this.maxPolicyStartDate = new Date();
      this.maxPolicyStartDate = new Date(
        this.maxPolicyStartDate.setMonth(this.maxPolicyStartDate.getMonth() + 3)
      );

      this.policyTypeList = JSON.parse(JSON.stringify(this.dropdownMaster.MotorPolicyTypeButtonOptions));
      this.previousPolicyTypeList = JSON.parse(JSON.stringify(this.dropdownMaster.MotorPolicyTypeButtonOptions));
      this._proposalPolicyDate();
      if (
        this.motorQuickQuoteForm.get('BusinessType').value ==
        this.MotorBusinessType['Roll Over'] &&
        this.vehicleForm.get('RTOCode').valid
      ) {
        this.vehicleForm.get('RTOCode').disable();
      }

      // this.minChassisNo = 10;
      // this.maxChassisNo = 17;

      if (this.motorQuickQuoteForm.get('PolicyType').value == MotorPolicyTypeEnum.Comprehensive || this.motorQuickQuoteForm.get('PolicyType').value == MotorPolicyTypeEnum['Third Party Only']) {
        /**
         * if BusinessType is 'New' than PolicyTypeList will not have 'OwnDamage' option
         */

        this.previousPolicyTypeList.forEach((element, index) => {
          if (element.value == 'OwnDamage') {
            this.previousPolicyTypeList.splice(index, 1);
          }
        });

      }
    }

    //if only one value its must be select
    if (!localStorage.getItem('TwoWheelerMotorInsurance') && !localStorage.getItem('TwoWheelerVehicleDetails')) {
      if (this.policyTypeList && this.policyTypeList.length > 0) {
        this.motorQuickQuoteForm.get('PolicyType').patchValue(
          this.policyTypeList[0].value
        );
      }
    }
  }

  // check stepper 3 for error
  private _stepThreeValidation(): Alert[] {
    let error: Alert[] = [];

    // DriverCover
    if (this.motorQuickQuoteForm.get('TwoWheelerDetail.DriverCover').value == null) {
      error.push({
        Message: 'Select Driver Cover',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // // DriverCoverSumInsured
    // if (
    //   this.motorQuickQuoteForm.get('TwoWheelerDetail.DriverCover').value == true &&
    //   this.motorQuickQuoteForm.get('TwoWheelerDetail.DriverCoverSumInsured').value ==
    //   null
    // ) {
    //   error.push({
    //     Message: 'Enter Driver Cover Sum Insured',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }

    // ZeroDepreciation
    if (this.motorQuickQuoteForm.get('TwoWheelerDetail.ZeroDepreciation').value == null) {
      error.push({
        Message: 'Select Zero Depreciation',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // if (this.motorQuickQuoteForm.get('TwoWheelerDetail.ZeroDepreciation').value == true) {    
    //   if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').value == null) {
    //     error.push({
    //       Message: 'Select Is Previous Policy Zero Depreciation?',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }
    // else
    // {
    //   this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
    //     PreviousPolicyZeroDepreciation : Boolean(false)
    //   })
    // }

    // Accessories
    if (this.motorQuickQuoteForm.get('TwoWheelerDetail.Accessories').value == null) {
      error.push({
        Message: 'Select Accessories',
        CanDismiss: false,
        AutoClose: false,
      });
    } else {
      if (this.motorQuickQuoteForm.get('TwoWheelerDetail.Accessories').value == true) {
        // ElectricalAccessories
        if (
          this.motorQuickQuoteForm.get('TwoWheelerDetail.ElectricalAccessories')
            .invalid
        ) {
          error.push({
            Message: 'Enter Electrical Accessories',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        // NonElectricalAccessories
        if (
          this.motorQuickQuoteForm.get('TwoWheelerDetail.NonElectricalAccessories')
            .invalid
        ) {
          error.push({
            Message: 'Enter Non-Electrical Accessories',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
    }

    // // NCBProtection
    // if (this.isNCBApplicable()) {
    //   if (this.motorQuickQuoteForm.get('TwoWheelerDetail.NCBProtection').value == null) {
    //     error.push({
    //       Message: 'Select NCB Protection',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }

    // InvoiceCover
    if (this.motorQuickQuoteForm.get('TwoWheelerDetail.InvoiceCover').value == null) {
      error.push({
        Message: 'Select Invoice Cover',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // if (this.motorQuickQuoteForm.get('TwoWheelerDetail.InvoiceCover').value == true) {    
    //   if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyInvoiceCover').value == null) {
    //     error.push({
    //       Message: 'Select Is Previous Policy Invoice Cover?',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }
    // else
    // {
    //   this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
    //     PreviousPolicyInvoiceCover : Boolean(false)
    //   })
    // }

    // RoadsideAssistance
    if (this.motorQuickQuoteForm.get('TwoWheelerDetail.RoadsideAssistance').value == null) {
      error.push({
        Message: 'Select Road side Assistance',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // EngineProtector
    if (this.motorQuickQuoteForm.get('TwoWheelerDetail.EngineProtector').value == null) {
      error.push({
        Message: 'Select Engine Protector',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // if (this.motorQuickQuoteForm.get('TwoWheelerDetail.EngineProtector').value == true) {    
    //   if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEngineProtector').value == null) {
    //     error.push({
    //       Message: 'Select Is Previous Policy Engine Protector?',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }
    // else
    // {
    //   this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
    //     PreviousPolicyEngineProtector : Boolean(false)
    //   })
    // }

    // if (this.motorQuickQuoteForm.get('TwoWheelerDetail.Consumable').value == true) {    
    //   if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyConsumable').value == null) {
    //     error.push({
    //       Message: 'Select Is Previous Policy Consumable?',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }
    // else
    // {
    //   this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
    //     PreviousPolicyConsumable : Boolean(false),
    //   })
    // }

    return error;
  }

  /**
   * to identify the change in the value of form and according to that changing the value of form fields that dependes on the it .
   */
  private _changeInData(): void {
    this.vehicleForm.get('RegistrationDate').valueChanges.subscribe((value) => {
      this._fillData();
    });

    this.vehicleNo.valueChanges.subscribe((value) => {
      // Reset Field
      this.vehicleForm.patchValue({
        Financed: false,
        Financer: null,
      });
      this.vehicleForm.get('VehicleNo').patchValue(value);
      this._fillData();
    });

    this.vehicleForm.get('VehicleNo').valueChanges.subscribe((value) => {
      this._fillData();
    });

    this.vehicleForm.get('RTOCode').valueChanges.subscribe((value) => {
      this._fillData();
    });

    this.vehicleForm.get('SubModelId').valueChanges.subscribe((value) => {
      this._fillData();
    });

    this.vehicleForm.get('ManufacturingDate').valueChanges.subscribe(
      (value) => {
        this.getminRegDate();
        this._fillData();
      }
    );

    this.motorQuickQuoteForm.get('BusinessType').valueChanges.subscribe(
      (value) => {
        if (value == MotorBusinessTypeEnum['Roll Over']) {
          this._startEndDate();
        }
        this.motorQuickQuoteForm.get('PolicyType').patchValue('');
        this._policyListFilter(value);

        if (value == MotorBusinessTypeEnum.New) {
          this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
            PreviousPolicyType: null,
            PreviousPolicyStartDate: null,
            PreviousPolicyEndDate: null,
            PreviousPolicyTPStartDate: null,
            PreviousPolicyTPEndDate: null
          });
        }
      }
    );

    this.motorQuickQuoteForm.get('PolicyType').valueChanges.subscribe(
      (value) => {

        this.previousPolicyTypeList = [];

        if (
          this.motorQuickQuoteForm.get('BusinessType').value ==
          MotorBusinessTypeEnum['Roll Over']
        ) {
          this._proposalPolicyDate(value);
        }

        if (this.motorQuickQuoteForm.get('BusinessType').value == MotorBusinessTypeEnum.New && value == MotorPolicyTypeEnum.Comprehensive) {
          this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
            PreviousPolicyType: null,
            PreviousPolicyStartDate: null,
            PreviousPolicyEndDate: null,
            PreviousPolicyTPStartDate: null,
            PreviousPolicyTPEndDate: null
          });
        }
        else if (this.motorQuickQuoteForm.get('BusinessType').value == MotorBusinessTypeEnum['Roll Over'] && (value == MotorPolicyTypeEnum.Comprehensive || value == MotorPolicyTypeEnum['Third Party Only'])) {

          this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
            PreviousPolicyTPStartDate: null,
            PreviousPolicyTPEndDate: null
          });

          /**
           * if BusinessType is 'New' than PolicyTypeList will not have 'OwnDamage' option
           */
          this.previousPolicyTypeList = JSON.parse(
            JSON.stringify(this.dropdownMaster.MotorPolicyTypeButtonOptions)
          );

          this.previousPolicyTypeList.forEach((element, index) => {
            if (element.value == 'OwnDamage') {
              this.previousPolicyTypeList.splice(index, 1);
            }
          });

        }
        else if (this.motorQuickQuoteForm.get('BusinessType').value == MotorBusinessTypeEnum['Roll Over'] && value == MotorPolicyTypeEnum['Own Damage']) {

          /**
           * bind Previous Policy Type List
           */
          this.previousPolicyTypeList = JSON.parse(
            JSON.stringify(this.dropdownMaster.MotorPolicyTypeButtonOptions)
          );

        }

      }
    );

    // this.motorQuickQuoteForm.get('TwoWheelerDetail.IsBiFuel').valueChanges.subscribe(
    //   (value) => {
    //     if (!value) {
    //       this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
    //         BiFuelType: '',
    //         BiFuelKitValue: 0,
    //       });
    //     }
    //   }
    // );

    this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyClaim').valueChanges.subscribe((value) => {
      if (value) {
        this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
          // PreviousPolicyNCBPercentage: 0,
          PreviousPolicyNCBPercentage: null,
        });
      }
    });

    // this.motorQuickQuoteForm.get('TwoWheelerDetail.DriverCover').valueChanges.subscribe((value) => {
    //   if (value == false) {
    //     this.motorQuickQuoteForm.get(
    //       'TwoWheelerDetail.DriverCoverSumInsured'
    //     ).patchValue(null);
    //   }
    // });

    this.motorQuickQuoteForm.get('TwoWheelerDetail.Accessories').valueChanges.subscribe((value) => {
      if (value == false) {
        this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
          ElectricalAccessories: null,
          NonElectricalAccessories: null,
        });
      }
    });

    // this.motorQuickQuoteForm.get('TwoWheelerDetail.PersonAccident').valueChanges.subscribe((value) => {
    //   if (value == false) {
    //     this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
    //       // NoOfPerson: null,
    //       PersonSumInsured: null,
    //     });
    //   }
    // });

    // this.motorQuickQuoteForm.get(
    //   'PolicyDetail.PreviousPolicyNCBPercentage'
    // ).valueChanges.subscribe((value) => {
    //   if (value) {
    //   }
    // });

    this.motorQuickQuoteForm.get('CustomerDetail.CustomerType').valueChanges.subscribe((value) => {
      this.AddOnFliedDisabled();
    });

    this.motorQuickQuoteForm.get('BusinessType').valueChanges.subscribe((value) => {
      this.AddOnFliedDisabled();
    });

    this.motorQuickQuoteForm.get('PolicyType').valueChanges.subscribe((value) => {
      this.AddOnFliedDisabled();
    });

    this.motorQuickQuoteForm.get('PolicyStartDate').valueChanges.subscribe((value) => {
      this.AddOnFliedDisabled();
    });

    this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyType').valueChanges.subscribe((value) => {
      this.AddOnFliedDisabled();
    });

    this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').valueChanges.subscribe((value) => {
      this.AddOnFliedDisabled();
    });

    this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyType').valueChanges.subscribe((value) => {
      if (value == MotorPolicyTypeEnum['Third Party Only']) {
        this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyClaim').patchValue(false);
        this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
      }
    });

  }

  /**
   * based on the value of PolicyType PolicyStartDate value is patched
   * @param value : value of PolicyType
   */
  private _proposalPolicyDate(value = this.motorQuickQuoteForm.get('PolicyType').value): void {
    this.motorQuickQuoteForm.get('ProposalDate').patchValue(
      this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')
    );
    if (value == MotorPolicyTypeEnum['Own Damage']) {
      let odEndDate = moment(this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyEndDate, 'yyyy-MM-dd'));
      // max six month

      let CuDate = moment(
        this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')
      );
      let diffBtwRegistrationCurrentDate = CuDate.diff(odEndDate, 'month');
      if (diffBtwRegistrationCurrentDate > 6) {
        let AfterSixMonthDate = new Date();
        AfterSixMonthDate = new Date(
          AfterSixMonthDate.setMonth(AfterSixMonthDate.getMonth() + 6)
        );

        let startDate = moment(
          this._datePipe.transform(
            AfterSixMonthDate,
            'yyyy-MM-dd'
          )
        );
        startDate = startDate.add(1, 'day');
        if (startDate >= moment(this.minPolicyStartDate) && startDate < moment(this.maxPolicyStartDate)) {
          this.motorQuickQuoteForm.get('PolicyStartDate').patchValue(startDate);
        } else {
          if (localStorage.getItem('TwoWheelerMotorInsurance') == "") { this.motorQuickQuoteForm.get('PolicyStartDate').patchValue(this.currentDate); }
        }
      }
      else {
        odEndDate = odEndDate.add(1, 'day');
        if (odEndDate >= moment(this.minPolicyStartDate) && odEndDate < moment(this.maxPolicyStartDate)) {
          this.motorQuickQuoteForm.get('PolicyStartDate').patchValue(odEndDate);
        } else {
          if (localStorage.getItem('TwoWheelerMotorInsurance') == "") { this.motorQuickQuoteForm.get('PolicyStartDate').patchValue(this.currentDate); }
        }
      }

    } else if (
      value == MotorPolicyTypeEnum.Comprehensive ||
      value == MotorPolicyTypeEnum['Third Party Only']
    ) {
      let tpEndDate = moment(
        this._datePipe.transform(
          this.motorQuickQuoteForm.get('PolicyDetail').getRawValue()
            .PreviousPolicyTPEndDate,
          'yyyy-MM-dd'
        )
      );
      tpEndDate = tpEndDate.add(1, 'day');
      if (tpEndDate >= moment(this.minPolicyStartDate) && tpEndDate < moment(this.maxPolicyStartDate)) {
        this.motorQuickQuoteForm.get('PolicyStartDate').patchValue(tpEndDate);
      } else {
        if (localStorage.getItem('TwoWheelerMotorInsurance') == "") { this.motorQuickQuoteForm.get('PolicyStartDate').patchValue(this.currentDate); }
      }
      // this.motorQuickQuoteForm.get('PolicyStartDate').patchValue(tpEndDate);
    }
  }

  /**
   * change in value of data
   */
  private _fillData(): void {
    this.motorQuickQuoteForm.patchValue({
      VehicleSubModelId: this.vehicleForm.get('SubModelId').value,
      RTOCode: this.vehicleForm.get('RTOCode').value,
      RegistrationDate: this.vehicleForm.get('RegistrationDate').value,
    });

    this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
      DateofFirstRegistration: this.vehicleForm.get('RegistrationDate').value,
    });

    this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
      VehicleNo: this.vehicleForm.get('VehicleNo').value,
    });
    if (this.vehicleForm.get('ManufacturingDate').value) {
      let ManufactureYear =
        this.vehicleForm.get('ManufacturingDate').value.split('/');
      this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
        YearOfManufacture: ManufactureYear[1],
      });
    }

    // for BusinessType RollOver and RTOCode have valid value, RTOCode will be disabled
    if (
      this.motorQuickQuoteForm.get('BusinessType').value ==
      this.MotorBusinessType['Roll Over'] &&
      this.vehicleForm.get('RTOCode').valid
    ) {
      this.vehicleForm.get('RTOCode').disable();
    }
    // else if (this.motorQuickQuoteForm.get('BusinessType').value == this.MotorBusinessType.New) {
    //   this.vehicleForm.get('RTOCode').enable()
    // }
  }

  /**
   * patch the data of Two Wheeler details that are obtained in response
   * @param result : response of API (RTo data api)
   */
  private _TwoWheelerDetails(result): void {
    this.vehicleForm.patchValue({
      Brand: result.Data.VehicleBrand,
      BrandId: result.Data.VehicleBrandId,
      Model: result.Data.VehicleModel,
      ModelId: result.Data.VehicleModelId,
      SubModel: result.Data.VehicleSubModel,
      SubModelId: result.Data.VehicleSubModelId,
      Fuel: result.Data.FuelTypeName,
      FuelType: result.Data.FuelType,
    }, { emitEvent: false });

    this._formDataDetails(
      result.Data.VehicleBrandId,
      result.Data.VehicleModelId,
      result.Data.VehicleSubModelId
    );

    this.vehicleForm.patchValue({
      RTOCode: result.Data.RTOData.RTOCode,
      RegistrationDate: result.Data.RTOData.RegistrationDate,
      ManufacturingDate: result.Data.RTOData.ManufacturingDate,
      VehicleNo: this.vehicleNo.value,
      EngineNo: result.Data.RTOData.EngineNo,
      ChassisNo: result.Data.RTOData.ChassisNo,
      CC: result.Data.CC,
      Financed: result.Data.RTOData.Financed,
      Financer: result.Data.RTOData.Financer,
    });

    this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
      PreviousPolicyTPEndDate: result.Data.RTOData.InsuranceExpiryDate,
      PreviousInsurer: result.Data.RTOData.InsuranceCompany,
    });
    if (
      this.motorQuickQuoteForm.get('BusinessType').value ==
      MotorBusinessTypeEnum['Roll Over']
    ) {
      this._startEndDate();
    }
  }

  /**
   * PreviousPolicyEndDate and PreviousPolicyTPStartDate based on the difference between RegistrationDate and PreviousPolicyTPEndDate
   * if difference is equal to or more than 4 years , PreviousPolicyTPStartDate will be 1 year less than PreviousPolicyTPEndDate and PreviousPolicyEndDate
   * will be one year more than PreviousPolicyTPStartDate
   * if difference is less than 4 years , PreviousPolicyTPStartDate will be 3 years less than PreviousPolicyTPEndDate and PreviousPolicyEndDate
   * will be one year more than PreviousPolicyTPStartDate
   */
  private _startEndDate(): void {
    this.minRegDate = null;
    let RegDate = moment(
      this._datePipe.transform(
        this.motorQuickQuoteForm.getRawValue().RegistrationDate,
        'yyyy-MM-dd'
      )
    );
    let TPEndDate = moment(this._datePipe.transform(this.motorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyTPEndDate, 'yyyy-MM-dd'));

    let diffInYears = TPEndDate.diff(RegDate, 'year');

    if (diffInYears < 4) {
      let startDate = TPEndDate.subtract(3, 'years');
      let tempStartDate = moment(startDate)
      this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
        PreviousPolicyTPStartDate: startDate,
      });
      let endDate = tempStartDate.add(1, 'years');

      this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').patchValue(endDate);
    } else if (diffInYears >= 4) {
      let startDate = TPEndDate.subtract(1, 'years');
      let tempStartDate = moment(startDate)
      this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
        PreviousPolicyTPStartDate: startDate,
      });
      let endDate = tempStartDate.add(1, 'years');

      this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').patchValue(endDate);
    }
    if (this.vehicleNo?.value.toLowerCase() == 'new') {
      this.vehicleNo.patchValue('');
    }

    this._proposalPolicyDate();
  }

  /**
   * list of model and subModel when the data of all the fields of the form is provided
   */
  private _formDataDetails(
    Brand = this.vehicleForm.get('BrandId').value,
    Model = this.vehicleForm.get('ModelId').value,
    Sub = this.vehicleForm.get('SubModelId').value
  ): void {
    if (Brand) {
      this._column.FilterConditions.Rules = [
        { Field: 'Status', Operator: 'eq', Value: '1' },
      ];

      this._loadDataWithFilters('Brand.Id', Brand, 'Model');
    }
    if (Model) {
      this._column.FilterConditions.Rules = [
        { Field: 'Status', Operator: 'eq', Value: '1' },
        { Field: 'FuelType', Operator: 'eq', Value: this.vehicleForm?.get('FuelType').value },
      ];
      this._loadDataWithFilters('Model.Id', Model, 'S', 'eq');
      this._motorInsuranceService
        ._loadLists(API_ENDPOINTS.VehicleSubModel.Base)
        .subscribe((result) => {
          if (result.Success) {
            this.subList = result.Data.Items;
            this._subArray = this.subList;
            this._subChange(Sub);
          }
        });
    }
  }

  // form for Two Wheeler details
  private _buildTwoWheelerDetails(data?): FormGroup {
    let vehicledetailsForm = this._fb.group({
      VehicleType: ["TwoWheeler"],
      Brand: ['', [Validators.required]],
      BrandId: [0, Validators.required],
      Model: ['', [Validators.required]],
      ModelId: [0, Validators.required],
      SubModel: ['', [Validators.required]],
      SubModelId: [0, Validators.required],
      Fuel: ['', [Validators.required]],
      FuelType: [''],
      RTOCode: ['', [Validators.required]],
      RegistrationDate: ['', [Validators.required]],
      ManufacturingDate: ['', [Validators.required]],
      VehicleNo: ['', [Validators.required]],
      EngineNo: [],
      ChassisNo: [],
      CC: [],
      Financed: [],
      Financer: [],
    });
    if (data) {
      vehicledetailsForm.patchValue(data);
    }
    return vehicledetailsForm;
  }

  private _initMotorQuickQuoteForm(data): FormGroup {
    let mQQ = this._fb.group({
      VehicleType: ["TwoWheeler"],
      Insurer: [0],
      BusinessType: ['', [Validators.required]],
      PolicyStartDate: [new Date(), [Validators.required]],
      ProposalDate: ['', [Validators.required]],
      RegistrationDate: ['', [Validators.required]],
      RTOCode: ['', [Validators.required]],
      VehicleSubModelId: [],
      PolicyType: ['', [Validators.required]],
      PolicyDetail: this._buildMotorQuickQuotePolicyDetailForm(data.PolicyDetail),
      TwoWheelerDetail: this._buildMotorQuickQuoteTwoWheelerDetailForm(data.TwoWheelerDetail),
      CustomerDetail: this._buildMotorQuickQuoteCustomerDetailForm(data.CustomerDetail),

    });

    if (data) {
      mQQ.patchValue(data);
    }

    return mQQ;
  }

  private _buildMotorQuickQuotePolicyDetailForm(data): FormGroup {
    let mQPD = this._fb.group({
      VehicleNo: [''],
      PreviousPolicyNo: ['', [Validators.required]],
      PreviousPolicyClaim: [false],
      PolicyPeriod: [1],
      PreviousPolicyType: ['', [Validators.required]],
      PreviousInsurer: ['', [Validators.required]],
      PreviousInsurerAddress: ['', [Validators.required]],
      PreviousPolicyStartDate: ['', [Validators.required]],
      PreviousPolicyEndDate: ['', [Validators.required]],
      PreviousPolicyTPStartDate: ['', [Validators.required]],
      PreviousPolicyTPEndDate: ['', [Validators.required]],
      PreviousPolicyBiFuel: [false],
      PreviousPolicyNCBPercentage: [null],
    });

    if (data) {
      mQPD.patchValue(data);
    }

    return mQPD;
  }

  private _buildMotorQuickQuoteTwoWheelerDetailForm(data): FormGroup {
    let mQCD = this._fb.group({
      YearOfManufacture: [],
      PersonalAccident: [false],
      DriverCover: [false],
      ZeroDepreciation: [false],
      Accessories: [false],
      ElectricalAccessories: [null, [Validators.required, Validators.min(1)]],
      NonElectricalAccessories: [null, [Validators.required, Validators.min(1)]],
      NCBProtection: [false],
      InvoiceCover: [false],
      RoadsideAssistance: [false],
      EngineProtector: [false],
      DateofFirstRegistration: ['', [Validators.required]],
      VehicleIDV: [],
    });

    if (data) {
      mQCD.patchValue(data);
    }

    return mQCD;
  }

  private _buildMotorQuickQuoteCustomerDetailForm(data): FormGroup {

    let CustomerDetails = this._fb.group({
      CustomerType: [MotorCustomerTypeEnum.Individual],
    });

    if (data) {
      CustomerDetails.patchValue(data);
    }

    return CustomerDetails;
  }

  /**
   * Policy Type, Proposal Type and Customer Type wise Add on fields disables or enabled
   */
  private AddOnFliedDisabled(): void {

    let ProposalType = this.motorQuickQuoteForm.get('BusinessType').value;
    let PolicyType = this.motorQuickQuoteForm.get('PolicyType').value;
    let CustomerType = this.motorQuickQuoteForm.get('CustomerDetail.CustomerType').value;

    if (ProposalType != "" && PolicyType != "" && CustomerType != "") {

      let PreviousPolicyType = this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyType').value;

      if (CustomerType == MotorCustomerTypeEnum.Individual) {

        if (ProposalType == MotorBusinessTypeEnum.New && PolicyType == MotorPolicyTypeEnum.Comprehensive) {
          this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
          this.motorQuickQuoteForm.get("PolicyDetail.PreviousPolicyNCBPercentage").disable();

          this.motorQuickQuoteForm.get("TwoWheelerDetail.PersonalAccident").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.ZeroDepreciation").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.NCBProtection").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.InvoiceCover").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.RoadsideAssistance").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.EngineProtector").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.DriverCover").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.Accessories").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.ElectricalAccessories").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.NonElectricalAccessories").enable();

          this.chkPersonalAccident = false;
          this.chkZeroDepreciation = false;
          this.chkNCBProtection = false;
          this.chkInvoiceCover = false;
          this.chkRoadAssistance = false;
          this.chkEngineProtector = false;
          this.chkDriverCover = false;
          this.chkAccessories = false;

        }
        else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum.Comprehensive) {

          if (PreviousPolicyType == MotorPolicyTypeEnum['Own Damage'] || PreviousPolicyType == MotorPolicyTypeEnum.Comprehensive) {

            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            let PolicyStartDate: any = new Date(this.motorQuickQuoteForm.get('PolicyStartDate').value);
            const ODDate: any = new Date(this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value);
            const diffDays = Math.round(Math.abs((PolicyStartDate - ODDate) / oneDay)); // difference day between two date

            if (diffDays > 90) {
              this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
              this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').disable();
            }
            else {
              this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').enable();
            }
          }

          this.motorQuickQuoteForm.get("TwoWheelerDetail.PersonalAccident").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.ZeroDepreciation").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.NCBProtection").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.InvoiceCover").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.RoadsideAssistance").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.EngineProtector").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.DriverCover").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.Accessories").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.ElectricalAccessories").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.NonElectricalAccessories").enable();

          this.chkPersonalAccident = false;
          this.chkZeroDepreciation = false;
          this.chkNCBProtection = false;
          this.chkInvoiceCover = false;
          this.chkRoadAssistance = false;
          this.chkEngineProtector = false;
          this.chkDriverCover = false;
          this.chkAccessories = false;
        }
        else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Third Party Only']) {

          this.motorQuickQuoteForm.get("TwoWheelerDetail.PersonalAccident").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.DriverCover").enable();

          this.chkPersonalAccident = false;
          this.chkDriverCover = false;

          this.chkZeroDepreciation = true;
          this.chkNCBProtection = true;
          this.chkInvoiceCover = true;
          this.chkRoadAssistance = true;
          this.chkEngineProtector = true;
          this.chkAccessories = true;

          this.motorQuickQuoteForm.get('TwoWheelerDetail.ZeroDepreciation').disable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.NCBProtection').disable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.InvoiceCover').disable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.RoadsideAssistance').disable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.EngineProtector').disable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.Accessories').disable();

          this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
            ZeroDepreciation: false,
            NCBProtection: false,
            InvoiceCover: false,
            RoadsideAssistance: false,
            EngineProtector: false,
            Accessories: false,
          });

        }
        else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Own Damage']) {

          this.motorQuickQuoteForm.get('TwoWheelerDetail.ZeroDepreciation').enable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.NCBProtection').enable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.InvoiceCover').enable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.RoadsideAssistance').enable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.EngineProtector').enable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.Accessories').enable();

          this.motorQuickQuoteForm.get('TwoWheelerDetail.PersonalAccident').disable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.DriverCover').disable();

          this.chkPersonalAccident = true;
          this.chkDriverCover = true;

          this.chkZeroDepreciation = false;
          this.chkNCBProtection = false;
          this.chkInvoiceCover = false;
          this.chkRoadAssistance = false;
          this.chkEngineProtector = false;
          this.chkAccessories = false;

          const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
          let PolicyStartDate: any = new Date(this.motorQuickQuoteForm.get('PolicyStartDate').value);
          const ODDate: any = new Date(this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value);
          const diffDays = Math.round(Math.abs((PolicyStartDate - ODDate) / oneDay)); // difference day between two date

          if (diffDays > 90) {
            this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
            this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').disable();
          }
          else {
            this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').enable();
          }

          this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
            PersonalAccident: false,
            DriverCover: false,
          });

          if (PreviousPolicyType == MotorPolicyTypeEnum['Own Damage'] || PreviousPolicyType == MotorPolicyTypeEnum.Comprehensive) {

            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            let PolicyStartDate: any = new Date(this.motorQuickQuoteForm.get('PolicyStartDate').value);
            const ODDate: any = new Date(this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value);
            const diffDays = Math.round(Math.abs((PolicyStartDate - ODDate) / oneDay)); // difference day between two date

            if (diffDays > 90) {
              this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
              this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').disable();
            }
            else {
              this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').enable();
            }
          }

        }

      }
      else if (CustomerType == MotorCustomerTypeEnum.Corporate) {

        this.motorQuickQuoteForm.get('TwoWheelerDetail.PersonalAccident').disable();
        this.motorQuickQuoteForm.get('TwoWheelerDetail.PersonalAccident').patchValue(false);
        this.chkPersonalAccident = true;

        if (ProposalType == MotorBusinessTypeEnum.New && PolicyType == MotorPolicyTypeEnum.Comprehensive) {

          this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
          this.motorQuickQuoteForm.get("PolicyDetail.PreviousPolicyNCBPercentage").disable();

          this.chkDriverCover = false;
          this.chkZeroDepreciation = false;
          this.chkNCBProtection = false;
          this.chkInvoiceCover = false;
          this.chkRoadAssistance = false;
          this.chkEngineProtector = false;
          this.chkAccessories = false;

          this.motorQuickQuoteForm.get("TwoWheelerDetail.PersonAccident").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.DriverCover").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.ZeroDepreciation").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.NCBProtection").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.InvoiceCover").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.RoadsideAssistance").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.EngineProtector").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.Accessories").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.ElectricalAccessories").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.NonElectricalAccessories").enable();
        }
        else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum.Comprehensive) {

          const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
          let PolicyStartDate: any = new Date(this.motorQuickQuoteForm.get('PolicyStartDate').value);
          const ODDate: any = new Date(this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value);
          const diffDays = Math.round(Math.abs((PolicyStartDate - ODDate) / oneDay)); // difference day between two date

          if (diffDays > 90) {
            this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
            this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').disable();
          }
          else {
            this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').enable();
          }

          this.motorQuickQuoteForm.get("TwoWheelerDetail.PersonAccident").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.DriverCover").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.ZeroDepreciation").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.NCBProtection").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.InvoiceCover").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.RoadsideAssistance").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.EngineProtector").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.Accessories").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.ElectricalAccessories").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.NonElectricalAccessories").enable();

          this.chkPersonalAccident = false;
          this.chkDriverCover = false;
          this.chkZeroDepreciation = false;
          this.chkNCBProtection = false;
          this.chkInvoiceCover = false;
          this.chkRoadAssistance = false;
          this.chkEngineProtector = false;
          this.chkAccessories = false;
        }
        else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Third Party Only']) {

          this.motorQuickQuoteForm.get('TwoWheelerDetail.ZeroDepreciation').disable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.NCBProtection').disable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.InvoiceCover').disable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.RoadsideAssistance').disable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.EngineProtector').disable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.Accessories').disable();
          this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').disable();
          this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);

          this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
            ZeroDepreciation: false,
            NCBProtection: false,
            InvoiceCover: false,
            RoadsideAssistance: false,
            EngineProtector: false,
            Accessories: false,
          });

          this.chkDriverCover = false;
          this.chkZeroDepreciation = true;
          this.chkNCBProtection = true;
          this.chkInvoiceCover = true;
          this.chkRoadAssistance = true;
          this.chkEngineProtector = true;
          this.chkAccessories = true;

          // this.motorQuickQuoteForm.get("TwoWheelerDetail.PersonAccident").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.DriverCover").enable();
        }
        else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Own Damage']) {
          // this.motorQuickQuoteForm.get('TwoWheelerDetail.PersonAccident').disable();
          this.motorQuickQuoteForm.get('TwoWheelerDetail.DriverCover').disable();

          this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
            // PersonAccident: false,
            DriverCover: false,
          });

          const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
          let PolicyStartDate: any = new Date(this.motorQuickQuoteForm.get('PolicyStartDate').value);
          const ODDate: any = new Date(this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value);
          const diffDays = Math.round(Math.abs((PolicyStartDate - ODDate) / oneDay)); // difference day between two date

          if (diffDays > 90) {
            this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
            this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').disable();
          }
          else {
            this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').enable();
          }

          this.motorQuickQuoteForm.get("TwoWheelerDetail.ZeroDepreciation").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.NCBProtection").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.InvoiceCover").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.RoadsideAssistance").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.EngineProtector").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.Accessories").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.ElectricalAccessories").enable();
          this.motorQuickQuoteForm.get("TwoWheelerDetail.NonElectricalAccessories").enable();

          this.chkDriverCover = true;

          this.chkZeroDepreciation = false;
          this.chkNCBProtection = false;
          this.chkInvoiceCover = false;
          this.chkRoadAssistance = false;
          this.chkEngineProtector = false;
          this.chkAccessories = false;
        }
      }
    }
  }

  private setPolicyDetailsFormValue(): void {

    if (this.motorQuickQuoteForm.get('BusinessType').value == MotorBusinessTypeEnum.New && this.motorQuickQuoteForm.get('PolicyType').value == MotorPolicyTypeEnum.Comprehensive) {
      this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
        PreviousPolicyType: null,
        PreviousPolicyStartDate: null,
        PreviousPolicyEndDate: null,
        PreviousPolicyTPStartDate: null,
        PreviousPolicyTPEndDate: null
      });
    }
    else if (this.motorQuickQuoteForm.get('BusinessType').value == MotorBusinessTypeEnum['Roll Over'] && (this.motorQuickQuoteForm.get('PolicyType').value == MotorPolicyTypeEnum.Comprehensive || this.motorQuickQuoteForm.get('PolicyType').value == MotorPolicyTypeEnum['Third Party Only'])) {

      this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
        PreviousPolicyTPStartDate: null,
        PreviousPolicyTPEndDate: null
      });
    }

    if (this.motorQuickQuoteForm.get('PolicyDetail.PreviousPolicyType').value == MotorPolicyTypeEnum['Third Party Only']) {

      this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
        PreviousPolicyNCBPercentage: null,
        PreviousPolicyClaim: false
      });
    }
  }

  // Inital value of Form fields
  private _InitValueOfForm(): void {

    this.motorQuickQuoteForm.patchValue({
      VehicleType: "TwoWheeler",
      Insurer: 0,
      BusinessType: '',
      PolicyStartDate: '',
      ProposalDate: '',
      RegistrationDate: '',
      RTOCode: '',
      VehicleSubModelId: null,
      PolicyType: '',
    })

    this.motorQuickQuoteForm.get('PolicyDetail').patchValue({
      VehicleNo: '',
      PreviousPolicyNo: '',
      PreviousPolicyClaim: false,
      PolicyPeriod: 1,
      PreviousPolicyType: '',
      PreviousInsurer: '',
      PreviousInsurerAddress: '',
      PreviousPolicyStartDate: '',
      PreviousPolicyEndDate: '',
      PreviousPolicyTPStartDate: '',
      PreviousPolicyTPEndDate: '',
      PreviousPolicyBiFuel: false,
      PreviousPolicyNCBPercentage: null,
    })

    this.motorQuickQuoteForm.get('TwoWheelerDetail').patchValue({
      YearOfManufacture: null,
      PersonalAccident: false,
      DriverCover: false,
      // TyreSecure: false,
      // DriverCoverSumInsured: null,
      ZeroDepreciation: false,
      Accessories: false,
      ElectricalAccessories: null,
      NonElectricalAccessories: null,
      NCBProtection: false,
      // PersonAccident: false,
      // PersonSumInsured: null,
      InvoiceCover: false,
      RoadsideAssistance: false,
      EngineProtector: false,
      // Consumable: false,
      // KeyandLockReplacement: false,
      // RepairofGlass: false,
      DateofFirstRegistration: '',
      VehicleIDV: null,
      // IsBiFuel: false,
      // BiFuelType: '',
      // BiFuelKitValue: '',
      // PassengerCover: null,
      // PassengerCoverSumInsured: null,
    })


    this.vehicleForm.patchValue({
      Brand: '',
      BrandId: 0,
      Model: '',
      ModelId: 0,
      SubModel: '',
      SubModelId: 0,
      Fuel: '',
      FuelType: '',
      RTOCode: '',
      RegistrationDate: '',
      ManufacturingDate: '',
      VehicleNo: '',
      EngineNo: null,
      ChassisNo: null,
      CC: null,
      Financed: null,
      Financer: null,
    })

    this.motorQuickQuoteForm.get('CustomerDetail').patchValue({
      CustomerType: MotorCustomerTypeEnum.Individual,
    })

    this.manufacturingDate.setValue(moment())
    this.vehicleNo.setValue('')
  }

  //#endregion Private methods

}
