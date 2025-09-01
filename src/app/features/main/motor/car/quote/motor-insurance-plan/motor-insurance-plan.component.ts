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
  title: string;

  // Formgroup & DTO
  VehicleDetails: IVehicleDetailsDto;
  VehicleForm: FormGroup;

  MotorQuickQuoteForm: FormGroup;
  MotorQuickQuote: IMotorQuickQuoteDto;

  // array
  PolicyTypeList = [];
  PreviousPolicyTypeList = [];

  PreviousPolicyAddOns = [
    { Name: 'Zero Depreciation', Value: false },
    { Name: 'Consumable', Value: false },
    { Name: 'Engine Protector', Value: false },
    { Name: 'Invoice Cover', Value: false },
    { Name: 'Tyre Secure', Value: false }
  ]


  NCBPercentageList = [
    { Name: '-- Select --', Value: null },
    { Name: '0%', Value: 0 },
    { Name: '20%', Value: 20 },
    { Name: '25%', Value: 25 },
    { Name: '35%', Value: 35 },
    { Name: '45%', Value: 45 },
    { Name: '50%', Value: 50 },
  ];
  SumInsuredAmount = [
    { name: '1 Lakh', value: 100000 },
    { name: '2 Lakh', value: 200000 },
  ];
  DriverCoverAmount = [
    { name: '1 Lakh', value: 100000 },
    { name: '2 Lakh', value: 200000 },
  ];
  DropdownMaster: dropdown;

  // error list
  alert: Alert[] = [];
  stepTwoAlert: Alert[] = [];
  // date
  currentDate: Date; // current date
  minPolicyStartDate: Date; //minimum policy start date(for Business Type 'New' minPolicy start date can be 10 days back than current date)
  maxPolicyStartDate: Date;
  minRegDate: Date; //minimum Registration Date

  // Form Control
  step1 = new FormControl();
  step2 = new FormControl();

  ManufacturingDate = new FormControl(moment());
  VehicleNo = new FormControl('', [Validators.required]);

  // list for car details
  BrandList: any[];
  ModelList: any[];
  SubList: any[];
  RTOList: any[];

  BrandArray: any[];
  ModelArray: any[];
  SubArray: any[];
  RTOArray: any[];

  // chassis number : maximum and minimum length
  MinChassisNo: number = 10;
  MaxChassisNo: number = 17;

  // boolean
  chkPersonalAccident: boolean = false;
  chkZeroDepreciation: boolean = false;
  chkNCBProtection: boolean = false;
  chkInvoiceCover: boolean = false;
  chkTyreSecure: boolean = false;
  chkRoadAssistance: boolean = false;
  chkEngineProtector: boolean = false;
  chkConsumable: boolean = false;
  chkKeyandLockReplacement: boolean = false;
  chkRepairofGlass: boolean = false;
  chkAccessories: boolean = false;
  chkPassenger: boolean = false;
  chkDriverCover: boolean = false;
  showFreshQuotebutton: boolean = false

  /*
   * Dropdown Search Input Element Access
   */
  @ViewChild('BrandSearchCtrl') BrandSearch: ElementRef;
  @ViewChild('ModelSearchCtrl') ModelSearch: ElementRef;
  @ViewChild('SubModelSearchCtrl') SubModelSearch: ElementRef;
  @ViewChild('RTOSearchCtrl') RTOSearch: ElementRef;

  pagefilters = {
    currentPage: 1,
  };

  // format for VehicleNo
  VehicleReg: RegExp = ValidationRegex.VehicleNumReg;
  BHRTONopattern: RegExp = ValidationRegex.BHRTONopattern;

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
    this.title = 'Motor - Private Car'; //title
    this.DropdownMaster = new dropdown();
    this.currentDate = new Date(); //current Date
    this.minPolicyStartDate = new Date(); // minimum Proposal Date
    this.maxPolicyStartDate = new Date(); // minimum Proposal Date

    this.VehicleDetails = new VehicleDetailsDto();

    this._column.FilterConditions.Rules = [
      { Field: 'Status', Operator: 'eq', Value: '1' },
    ];

    let AdditionalFilters: IAdditionalFilterObject[] = [
      { key: 'VehicleType', filterValues: ['Private Car'] },
    ];

    let rules: IFilterRule[] = [
      { Field: 'Status', Operator: 'eq', Value: '1' },
    ];

    this._masterListService
      .getFilteredMultiRulMasterDataList(
        API_ENDPOINTS.VehicleBrand.List,
        'Name',
        '',
        rules,
        AdditionalFilters
      )
      .subscribe((res) => {
        this.BrandList = res.Data.Items;
        this.BrandArray = this.BrandList;
      });

    // this.BrandList = this._motorInsuranceService._loadListsWithResponse(
    //   API_ENDPOINTS.VehicleBrand.Base
    // );

    this.RTOList = this._motorInsuranceService._loadListsWithResponse(
      API_ENDPOINTS.RTO.Base
    );

    // this.BrandArray = this.BrandList;
    this.RTOArray = this.RTOList;

    this.MotorQuickQuote = new MotorQuickQuoteDto();
    this.MotorQuickQuoteForm = this._initMotorQuickQuoteForm(
      this.MotorQuickQuote
    );

    this.VehicleForm = this._buildCarDetails();

    if (
      localStorage.getItem('MotorInsurance') &&
      localStorage.getItem('VehicleDetails')
    ) {
      this.showFreshQuotebutton = true
      this.MotorQuickQuoteForm.patchValue(
        JSON.parse(localStorage.getItem('MotorInsurance'))
      );
      this.VehicleForm.patchValue(
        JSON.parse(localStorage.getItem('VehicleDetails'))
      );
      this._dataFromLocalStorage();
    }
  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this._changeInData();
    this._changeInRtoData();
  }

  //#endregion lifecyclehooks

  get f() {
    return this.MotorQuickQuoteForm.controls;
  }

  get MotorBusinessType() {
    return MotorBusinessTypeEnum;
  }

  get MotorBiFuleType() {
    return MotorBiFuelTypeEnum;
  }

  get FuelType() {
    return FuelTypeEnum;
  }

  get VehicleType() {
    return MotorVehicleTypeEnum;
  }

  get MotorCustomerType() {
    return MotorCustomerTypeEnum;
  }

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // back to motor page
  public back() {
    this._router.navigate([ROUTING_PATH.Basic.Motor]);
  }

  /**
   * Selected Previous Policy Add On Push on PreviousPolicyAddOn List Array
   */
  public PushPreviousAddOnValue(optionData) {

    let ArrIndex = this.PreviousPolicyAddOns.findIndex(item => item.Name === optionData.Name);

    if (optionData.Value == true) {

      this.PreviousPolicyAddOns[ArrIndex].Value = false;

      if (optionData.Name == "Zero Depreciation") {
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').patchValue(false);
      }
      else if (optionData.Name == "Consumable") {
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyConsumable').patchValue(false);
      }
      else if (optionData.Name == "Engine Protector") {
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEngineProtector').patchValue(false);
      }
      else if (optionData.Name == "Invoice Cover") {
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyInvoiceCover').patchValue(false);
      }
      else if (optionData.Name == "Tyre Secure") {
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyTyreCover').patchValue(false);
      }
    }
    else {
      this.PreviousPolicyAddOns[ArrIndex].Value = true;

      if (optionData.Name == "Zero Depreciation") {
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').patchValue(true);
      }
      else if (optionData.Name == "Consumable") {
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyConsumable').patchValue(true);
      }
      else if (optionData.Name == "Engine Protector") {
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEngineProtector').patchValue(true);
      }
      else if (optionData.Name == "Invoice Cover") {
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyInvoiceCover').patchValue(true);
      }
      else if (optionData.Name == "Tyre Secure") {
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyTyreCover').patchValue(true);
      }
    }

  }

  /**
   * blur event for Registration No..
   * When Vehicle Type is Old blur event is triggered for Registration No.
   * Firstly VehicleNo is validated and checked if value is in correct format
   * than RTO Api is called to get Car Details
   */
  public rtoDetailsAPI(event) {
    if (event.target.value) {

      // remove before set new data
      localStorage.removeItem('MotorInsurance');
      this.MotorQuickQuoteForm.get('CarDetail').patchValue({
        YearOfManufacture: '',
        PersonalAccident: false,
        TyreSecure: false,
        DriverCover: false,
        DriverCoverSumInsured: 0,
        ZeroDepreciation: false,
        Accessories: false,
        ElectricalAccessories: null,
        NonElectricalAccessories: null,
        NCBProtection: false,
        PersonAccident: false,
        PersonSumInsured: null,
        InvoiceCover: false,
        RoadsideAssistance: false,
        EngineProtector: false,
        Consumable: false,
        KeyandLockReplacement: false,
        RepairofGlass: false,
        DateofFirstRegistration: '',
        VehicleIDV: 0,
        IsBiFuel: false,
        BiFuelType: '',
        BiFuelKitValue: '',
        PassengerCover: 0,
        PassengerCoverSumInsured: 0,
      }, { emitEvent: false });

      this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
        VehicleNo: '',
        PreviousPolicyNo: '',
        PreviousPolicyClaim: false,
        PolicyPeriod: 1,
        PreviousPolicyNCBPercentage: null,
        PreviousPolicyType: '',
        PreviousInsurer: '',
        PreviousInsurerAddress: '',
        PreviousPolicyStartDate: '',
        PreviousPolicyEndDate: '',
        PreviousPolicyTPStartDate: '',
        PreviousPolicyTPEndDate: '',
        PreviousPolicyBiFuel: false,
        PreviousPolicyZeroDepreciation: false,
        PreviousPolicyConsumable: false,
        PreviousPolicyEngineProtector: false,
        PreviousPolicyInvoiceCover: false,
        PreviousPolicyTyreCover: false,
        PreviousAddOns: []
      }, { emitEvent: false })

      this.MotorQuickQuoteForm.patchValue({
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
        this._motorInsuranceService
          .vehicleDetails(VehicleData)
          .subscribe((res) => {
            if (res.Success) {
              this._carDetails(res);
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
  public vehicleNoFormating(event) {
    // this.VehicleNo.patchValue(event.target.value.toUpperCase())
    let No: string = event.target.value.trim().toUpperCase();
    if (No.length == 2 || No.length == 5) No += '-'; // Alpha in RTO No may be single or double
    this.VehicleNo.patchValue(No);
  }

  /**
   * check for stepper 2 validation
   * if all the fields are valid than move forward
   * Firstly change the format of the PolicyStartDate & ProposalDate to yyyy-MM-dd format and than store the data in local storage
   */
  public getQuickQuote() {
    let stepThreeError: Alert[] = this._stepThreeValidation();
    if (stepThreeError.length > 0) {
      this._alertservice.raiseErrors(stepThreeError);
      return;
    }
    this._dateFormat();
    this.setPolicyDetailsFormValue();
    this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
      PreviousPolicyBiFuel: this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyBiFuel').value == "true" || this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyBiFuel').value == true ? true : false,
      // PreviousPolicyZeroDepreciation : this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').value || this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').value == true ? true : false,
      // PreviousPolicyInvoiceCover : this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyInvoiceCover').value == "true" || this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyInvoiceCover').value == true ? true : false, 
      // PreviousPolicyEngineProtector : this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEngineProtector').value == "true" || this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEngineProtector').value == true ? true : false,
      // PreviousPolicyConsumable : this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyConsumable').value == "true" || this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyConsumable').value == true ? true : false,
    })

    if (this.MotorQuickQuoteForm.get('BusinessType').value != MotorBusinessTypeEnum['Roll Over']) {
      this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
        PreviousPolicyBiFuel: false,
        PreviousPolicyZeroDepreciation: false,
        PreviousPolicyInvoiceCover: false,
        PreviousPolicyTyreCover: false,
        PreviousPolicyEngineProtector: false,
        PreviousPolicyConsumable: false,
      });
    }

    localStorage.setItem(
      'MotorInsurance',
      JSON.stringify(this.MotorQuickQuoteForm.value)
    );
    localStorage.setItem(
      'VehicleDetails',
      JSON.stringify(this.VehicleForm.value)
    );
    this._router.navigate([ROUTING_PATH.MotorCarQuote.Plan]);
  }

  /**
   * When Close Mat-select Search drplist Bind Origin data In list
   * && Clear SearchCtrl Value
   * @param closeFor
   */
  public CloseDropdownEven(closeFor: string) {
    if (closeFor == 'Brand') {
      this.BrandSearch.nativeElement.value = '';
      this.BrandList = this.filterDropDownList('', closeFor);
    }
    if (closeFor == 'Model') {
      this.ModelSearch.nativeElement.value = '';
      this.ModelList = this.filterDropDownList('', closeFor);
    }
    if (closeFor == 'Sub') {
      this.SubModelSearch.nativeElement.value = '';
      this.SubList = this.filterDropDownList('', closeFor);
    }
    if (closeFor == 'RTO') {
      this.RTOSearch.nativeElement.value = '';
      this.RTOList = this.filterDropDownList('', closeFor);
    }
  }

  // search in dropDown
  /**
   * to filter from the list
   * @param event : change in the value
   * @param name : dropdown in which search is being done
   */
  public searchInDropDown(event, name) {
    let value = event.target.value;

    if (name == 'Brand') {
      this.BrandList = this.filterDropDownList(value, name);
    }
    if (name == 'Model') {
      this.ModelList = this.filterDropDownList(value, name);
    }
    if (name == 'Sub') {
      this.SubList = this.filterDropDownList(value, name);
    }
    if (name == 'RTO') {
      this.RTOList = this.filterDropDownList(value, name);
    }
  }

  // filter lists as per data
  public filterDropDownList(value: string, name) {
    let filter = value?.toLowerCase();

    if (name == 'Brand') {
      if (this.BrandArray && this.BrandArray.length > 0) {
        return this.BrandArray.filter((option) =>
          option.Name?.toLowerCase().includes(filter)
        );
      } else {
        return [];
      }
    }

    if (name == 'Model') {
      let Brand = this.VehicleForm.get('Brand').value?.toLowerCase();
      if (this.ModelArray && this.ModelArray.length > 0) {
        return this.ModelArray.filter(
          (option) =>
            option.Name?.toLowerCase().includes(filter) &&
            option.BrandName?.toLowerCase().includes(Brand)
        );
      } else {
        return [];
      }
    }

    if (name == 'Sub') {
      let Model = this.VehicleForm.get('Model')?.value.toLowerCase();
      if (this.SubArray && this.SubArray.length > 0) {
        return this.SubArray.filter(
          (option) =>
            option.Name?.toLowerCase().includes(filter) &&
            option.ModelName?.toLowerCase().includes(Model) &&
            option.FuelType?.toLowerCase().includes(
              this.VehicleForm?.get('FuelType').value.toLowerCase()
            )
        );
      } else {
        return [];
      }
    }

    if (name == 'RTO') {
      if (this.RTOArray && this.RTOArray.length > 0) {
        return this.RTOArray.filter((option) =>
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
  public chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.ManufacturingDate.value;
    ctrlValue.year(normalizedYear.year());
    this.ManufacturingDate.setValue(ctrlValue);
  }

  // chosen month
  public chosenMonthHandler(
    normalizedMonth: Moment,
    datepicker: MatDatepicker<Moment>
  ) {
    const ctrlValue = this.ManufacturingDate.value;
    ctrlValue.month(normalizedMonth.month());
    this.ManufacturingDate.setValue(ctrlValue);
    var DateString = moment(this.ManufacturingDate.value).format('MM/YYYY');
    this.VehicleForm.patchValue({ ManufacturingDate: DateString });
    datepicker.close();
  }

  // public isNCBApplicable() {

  //   if (this.MotorQuickQuoteForm.get('BusinessType').value == this.MotorBusinessType['Roll Over']) {

  //     let PolicyStartDate = new Date(
  //       this._datePipe.transform(this.MotorQuickQuoteForm.get('PolicyStartDate').value, 'yyyy-MM-dd')
  //     );

  //     let PreviousPolicyTPEndDate = new Date(this._datePipe.transform(this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyTPEndDate').value, 'yyyy-MM-dd'));

  //     let startDate = moment(this._datePipe.transform(PolicyStartDate, 'yyyy-MM-dd'));
  //     startDate = startDate.add(-1, 'day');

  //     PolicyStartDate = new Date(this._datePipe.transform(startDate.toDate(), 'yyyy-MM-dd'));

  //     // Greater than check
  //     if (PolicyStartDate > PreviousPolicyTPEndDate) {
  //       return false;
  //     }

  //     let PreviousPolicyEndDate = new Date(this._datePipe.transform(this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value, 'yyyy-MM-dd'));
  //     if (PolicyStartDate > PreviousPolicyEndDate) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }

  // check stepper 1 for error
  public stepOneValidation() {
    this.alert = [];

    // BusinessType
    if (this.MotorQuickQuoteForm.get('BusinessType').invalid) {
      this.alert.push({
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
          this.MotorQuickQuoteForm.getRawValue().RegistrationDate,
          'yyyy-MM-dd'
        )
      );
      let CuDate = moment(
        this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')
      );
      let diffBtwRegistrationCurrentDate = CuDate.diff(RegDate, 'month');
      if (
        this.MotorQuickQuoteForm.get('BusinessType').value ==
        MotorBusinessTypeEnum.New &&
        diffBtwRegistrationCurrentDate > 6
      ) {
        this.alert.push({
          Message:
            'In case of New Proposal Type , Registration or Delivery Date must be within past 6 months period.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // PolicyType
    if (this.MotorQuickQuoteForm.get('PolicyType').invalid) {
      this.alert.push({
        Message: 'Select Policy Type',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Registration No.
    if (this.VehicleNo.invalid) {
      this.alert.push({
        Message: 'Enter Registration No.',
        CanDismiss: false,
        AutoClose: false,
      });
    } else if (this.VehicleNo.value.toLocaleLowerCase() != 'new') {
      let isValidNo: Boolean = false;
      if (
        this.VehicleReg.test(this.VehicleNo.value) ||
        this.BHRTONopattern.test(this.VehicleNo.value)
      ) {
        isValidNo = true;
      }
      if (isValidNo == false) {
        this.alert.push({
          Message: 'Enter Registration No. with Valid Format.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // Brand
    if (this.VehicleForm.get('Brand').invalid) {
      this.alert.push({
        Message: 'Select Brand',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Model
    if (this.VehicleForm.get('Model').invalid) {
      this.alert.push({
        Message: 'Select Model',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // Fuel
    if (this.VehicleForm.get('Fuel').invalid) {
      this.alert.push({
        Message: 'Select Fuel',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // SubModel
    if (this.VehicleForm.get('SubModel').invalid) {
      this.alert.push({
        Message: 'Select Sub-Model',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // RTOCode
    if (this.VehicleForm.get('RTOCode').invalid) {
      this.alert.push({
        Message: 'Select RTO Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // ManufacturingDate
    if (this.VehicleForm.get('ManufacturingDate').value == '') {
      this.alert.push({
        Message: 'Enter Month & Year Of Mfg',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // RegistrationDate
    if (this.VehicleForm.get('RegistrationDate').invalid) {
      if (this.VehicleForm.get('RegistrationDate').value != '') {
        this.alert.push({
          Message: 'Enter Valid Registration or Delivery Date',
          CanDismiss: false,
          AutoClose: false,
        });
      } else {
        this.alert.push({
          Message: 'Enter Registration or Delivery Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.alert.length > 0) {
      this.step1.setErrors({ required: true });
      return this.step1;
    } else {
      this.step1.reset();
      return this.step1;
    }
  }

  // error in stepper 1
  public stepOneError() {
    if (this.alert.length > 0) {
      this._alertservice.raiseErrors(this.alert);
      return;
    }
  }

  // check stepper 2 for error
  public stepTwoValidation() {
    this.stepTwoAlert = [];

    // ProposalDate
    if (this.MotorQuickQuoteForm.get('ProposalDate').invalid) {
      if (this.MotorQuickQuoteForm.get('ProposalDate').value) {
        this.stepTwoAlert.push({
          Message: 'Enter Valid Proposal Date',
          CanDismiss: false,
          AutoClose: false,
        });
      } else {
        this.stepTwoAlert.push({
          Message: 'Enter Proposal Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // PolicyStartDate
    if (this.MotorQuickQuoteForm.get('PolicyStartDate').value == "" || this.MotorQuickQuoteForm.get('PolicyStartDate').value == null) {
      this.stepTwoAlert.push({
        Message: 'Enter Policy Start Date',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    // if (this.MotorQuickQuoteForm.get('PolicyStartDate').invalid) {

    //   if (this.MotorQuickQuoteForm.get('PolicyStartDate').value) {
    //     this.stepTwoAlert.push({
    //       Message: 'Enter Valid Policy Start Date',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   } else {

    //   }
    // }
    else {
      // check PolicyStartDate is today in case of new business type
      //|| this.MotorQuickQuoteForm.get('BusinessType').value == 'Rollover'
      if (this.MotorQuickQuoteForm.get('BusinessType').value == 'New') {
        let PolicyStartDate = new Date(
          this._datePipe.transform(
            this.MotorQuickQuoteForm.getRawValue().PolicyStartDate,
            'yyyy-MM-dd'
          )
        );

        let TodayDate = new Date(
          this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')
        );

        if (!moment(PolicyStartDate).isSame(moment(TodayDate, 'yyy-MM-dd'))) {
          this.stepTwoAlert.push({
            Message: 'Policy Start Date must be today in case of new Policy',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
      else {
        //this.maxPolicyStartDate
        let PolicyStartDate = new Date(
          this._datePipe.transform(this.MotorQuickQuoteForm.get('PolicyStartDate').value, 'yyyy-MM-dd')
        );
        // Greater than check
        if (PolicyStartDate > this.maxPolicyStartDate) {

          this.stepTwoAlert.push({
            Message: 'Policy Start Date must not greater then ' + this._datePipe.transform(this.MotorQuickQuoteForm.get('PolicyStartDate').value, 'dd/MM/yyyy').toString(),
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
    }

    // DateofFirstRegistration
    if (
      this.MotorQuickQuoteForm.get('CarDetail.DateofFirstRegistration').invalid
    ) {
      this.stepTwoAlert.push({
        Message: 'Enter Date of First Registration',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.VehicleForm.get('FuelType').value == this.FuelType.Petrol) {
      // IsBiFuel
      if (this.MotorQuickQuoteForm.get('CarDetail.IsBiFuel').value) {
        // BiFuelType
        if (this.MotorQuickQuoteForm.get('CarDetail.BiFuelType').invalid) {
          this.stepTwoAlert.push({
            Message: 'Select BiFuel Type',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        // BiFuelKitValue
        if (this.MotorQuickQuoteForm.get('CarDetail.BiFuelKitValue').invalid) {
          if (
            this.MotorQuickQuoteForm.get('CarDetail.BiFuelKitValue').value > 0
          ) {
            this.stepTwoAlert.push({
              Message: 'BiFuel Kit Value cannot be more than 40000',
              CanDismiss: false,
              AutoClose: false,
            });
          } else {
            if (
              this.MotorQuickQuoteForm.get('CarDetail.BiFuelKitValue').value !=
              ''
            ) {
              this.stepTwoAlert.push({
                Message: 'Enter valid BiFuel Kit Value',
                CanDismiss: false,
                AutoClose: false,
              });
            } else {
              this.stepTwoAlert.push({
                Message: 'Enter BiFuel Kit Value',
                CanDismiss: false,
                AutoClose: false,
              });
            }
          }
        }

        // BiFuelType
        if (this.MotorQuickQuoteForm.get('CarDetail.IsBiFuel').value == true) {
          if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyBiFuel').value == null) {
            this.stepTwoAlert.push({
              Message: 'Select Is Previous Policy BiFuel Taken?',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
      }
      else {
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyBiFuel').patchValue(false);
      }
    }
    else {
      this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyBiFuel').patchValue(false);
    }

    if (
      this.MotorQuickQuoteForm.get('BusinessType').value ==
      this.MotorBusinessType['Roll Over']
    ) {
      // PreviousPolicyType
      if (
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyType').invalid
      ) {
        this.stepTwoAlert.push({
          Message: 'Enter Previous Policy Type',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // PreviousPolicyStartDate
      if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyStartDate').value == "" || this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyStartDate').value == null) {
        this.stepTwoAlert.push({
          Message: 'Enter Previous Policy Start Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // PreviousPolicyEndDate
      if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value == "" || this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value == null) {
        this.stepTwoAlert.push({
          Message: 'Enter Previous Policy End Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyStartDate').value != "" && this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyStartDate').value != null && this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value != "" && this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value != null) {

        var startDate = this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyStartDate').value;
        var endDate = this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value;

        if ((Date.parse(endDate) <= Date.parse(startDate))) {
          this.stepTwoAlert.push({
            Message: 'Previous Policy End Date should be greater than Previous Policy Start Date',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

      // // PreviousPolicyODEndDate
      // if (this.MotorQuickQuoteForm.get('PolicyType').value != 'ThirdPartyOnly') {
      //   if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyODEndDate').invalid) {
      //     this.stepTwoAlert.push({
      //       Message: 'Enter On Damage End Date',
      //       CanDismiss: false,
      //       AutoClose: false,
      //     });
      //   }
      // }

      if (this.MotorQuickQuoteForm.get('PolicyType').value == MotorPolicyTypeEnum['Own Damage']) {

        // PreviousPolicyTPStartDate
        if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyTPStartDate').invalid) {
          this.stepTwoAlert.push({
            Message: 'Enter Third Party Start Date',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        // PreviousPolicyTPEndDate
        if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyTPEndDate').invalid) {
          this.stepTwoAlert.push({
            Message: 'Enter Third Party End Date',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

      // PreviousPolicyClaim
      if (
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyClaim')
          .value == null
      ) {
        this.stepTwoAlert.push({
          Message: 'Select Claim In Previous Year',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // EngineNo
    if (this.VehicleForm.get('EngineNo').invalid) {
      this.stepTwoAlert.push({
        Message: 'Enter Engine No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // ChassisNo
    if (!this.VehicleForm.get('ChassisNo').value) {
      this.stepTwoAlert.push({
        Message: 'Enter Chassis No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    else {

      // if (this.MotorQuickQuoteForm.get('BusinessType').value == this.MotorBusinessType['Roll Over']) {
      //   if (this.VehicleForm.get('ChassisNo').value.length != this.MaxChassisNo && this.VehicleForm.get('ChassisNo').value.length != this.MinChassisNo) {
      //     this.stepTwoAlert.push({
      //       Message: 'Chassis No. must be either ' + this.MinChassisNo + ' or ' + this.MaxChassisNo + ' characters',
      //       CanDismiss: false,
      //       AutoClose: false,
      //     });
      //   }
      // }
      // else {

      //   if (this.VehicleForm.get('ChassisNo').value.length != this.MaxChassisNo) {
      //     this.stepTwoAlert.push({
      //       Message: 'Chassis No. must be of ' + this.MaxChassisNo + ' characters',
      //       CanDismiss: false,
      //       AutoClose: false,
      //     });
      //   }
      // }
      if (this.VehicleForm.get('ChassisNo').value.length > this.MaxChassisNo || this.VehicleForm.get('ChassisNo').value.length < this.MinChassisNo) {
        this.stepTwoAlert.push({
          Message: 'Chassis No. must be between of ' + this.MinChassisNo + ' to ' + this.MaxChassisNo + ' characters',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // //NCB
    // if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').value > 0 && this.isNCBApplicable() == false) {
    //   this.stepTwoAlert.push({
    //     Message: 'NCB is not Applicable.',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }


    if (this.stepTwoAlert.length > 0) {
      this.step2.setErrors({ required: true });
      return this.step2;
    } else {
      this.step2.reset();
      return this.step2;
    }
  }

  // error in stepper 2
  public stepTwoError() {
    if (this.stepTwoAlert.length > 0) {
      this._alertservice.raiseErrors(this.stepTwoAlert);
      return;
    }
  }

  public getminRegDate() {
    if (this.VehicleForm.get('ManufacturingDate').value) {
      let MfgParts = this.VehicleForm.get('ManufacturingDate').value.split('/');
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

  private isNumber(value?: string | number): boolean {
    return value != null && value !== '' && !isNaN(Number(value.toString()));
  }
  public checkMfgWithReg() {
    if (
      this.VehicleForm.get('ManufacturingDate').value &&
      this.VehicleForm.get('RegistrationDate').value
    ) {
      let MfgParts = this.VehicleForm.get('ManufacturingDate').value.split('/');
      if (MfgParts.length > 1) {
        let RegistrationDate = this.VehicleForm.get('RegistrationDate').value;

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
  public changeInCustomerType(event) {
    if (event.checked) {
      this.MotorQuickQuoteForm.get('CustomerDetail').patchValue({
        CustomerType: MotorCustomerTypeEnum.Corporate,
      });
    } else {
      this.MotorQuickQuoteForm.get('CustomerDetail').patchValue({
        CustomerType: MotorCustomerTypeEnum.Individual,
      });
    }
  }

  /**
   * Function called on blur event to check
   * Policy start date with previous policy end date 
  */
  public checkPolicyStartDate() {
    if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value != "" && this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value != null) {
      let currentDate = moment(this._datePipe.transform(new Date()))
      // let policyStartDate = moment(this._datePipe.transform(this.MotorQuickQuoteForm.get('PolicyStartDate').value, 'yyyy-MM-dd'));
      let prevPolicyEndDate = moment(this._datePipe.transform(this.MotorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyEndDate, 'yyyy-MM-dd'));

      if (prevPolicyEndDate < currentDate) {
        this.MotorQuickQuoteForm.get('PolicyStartDate').patchValue(currentDate, { emitEvent: false });
      }
      else {
        prevPolicyEndDate = prevPolicyEndDate.add(1, 'day')
        this.MotorQuickQuoteForm.get('PolicyStartDate').patchValue(prevPolicyEndDate, { emitEvent: false });
      }
    }
  }


  // reset stepper and form
  public ResetStepper(stepper: MatStepper) {
    if (localStorage.getItem('HealthQuateForm')) {
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
            localStorage.removeItem('MotorInsurance');
            localStorage.removeItem('VehicleDetails');
            this.MotorQuickQuoteForm.reset();
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

  /**
   * auto fill form if data is available from locaol storage
   */
  private _dataFromLocalStorage() {
    this.VehicleNo.patchValue(this.VehicleForm.get('VehicleNo').value);
    this._formDataDetails();
    this.VehicleForm.get('RTOCode').patchValue(
      this.MotorQuickQuoteForm.get('RTOCode').value
    );
    this._policyListFilter(this.MotorQuickQuoteForm.get('BusinessType').value);
    this.AddOnFliedDisabled();
    this.bindPreviousAddOnFromLocalStorage();
  }

  /**
   * previous Add on bind data from local storage
   */

  private bindPreviousAddOnFromLocalStorage() {

    let ArrIndex = null;
    ArrIndex = this.PreviousPolicyAddOns.findIndex(x => x.Name == "Zero Depreciation");
    this.PreviousPolicyAddOns[ArrIndex].Value = this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').value;

    ArrIndex = this.PreviousPolicyAddOns.findIndex(x => x.Name == "Consumable");
    this.PreviousPolicyAddOns[ArrIndex].Value = this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyConsumable').value;

    ArrIndex = this.PreviousPolicyAddOns.findIndex(x => x.Name == "Engine Protector");
    this.PreviousPolicyAddOns[ArrIndex].Value = this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEngineProtector').value;

    ArrIndex = this.PreviousPolicyAddOns.findIndex(x => x.Name == "Invoice Cover");
    this.PreviousPolicyAddOns[ArrIndex].Value = this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyInvoiceCover').value;

    ArrIndex = this.PreviousPolicyAddOns.findIndex(x => x.Name == "Tyre Secure");
    this.PreviousPolicyAddOns[ArrIndex].Value = this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyTyreCover').value;

  }

  /**
   * change the format of VehicleNo
   * remove '-' from VehicleNo
   * @returns VehicleNo without '-' or space
   */
  private _vehicleNumFormat() {
    let tempVehicleNum = this.VehicleNo.value.split('-');

    return (
      tempVehicleNum[0] +
      tempVehicleNum[1] +
      tempVehicleNum[2] +
      tempVehicleNum[3]
    );
  }

  // validating vehicle No.
  private _checkvehicleNo() {
    let vehicleNoError: Alert[] = [];
    if (this.VehicleNo.invalid) {
      vehicleNoError.push({
        Message: 'Enter Car Number.',
        CanDismiss: false,
        AutoClose: false,
      });
    } else if (this.VehicleNo.value) {
      if (!this.VehicleReg.test(this.VehicleNo.value)) {
        vehicleNoError.push({
          Message: 'Enter Car Number with Valid Format.',
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
  private _changeInRtoData() {
    this.VehicleForm.get('BrandId').valueChanges.subscribe((res) => {
      this._column.FilterConditions.Rules = [
        { Field: 'Status', Operator: 'eq', Value: '1' },
      ];
      this._brandChanges(res);
      this._loadDataWithFilters('Brand.Id', this.VehicleForm.get('BrandId').value, 'Model');

      this._column.FilterConditions.Rules = [
        { Field: 'Status', Operator: 'eq', Value: '1' },
      ];
      this.VehicleForm.get('Model').setValue('', { emitEvent: false })
      this.VehicleForm.get('ModelId').setValue(0, { emitEvent: false })
      this.VehicleForm.get('SubModel').setValue('', { emitEvent: false })
      this.VehicleForm.get('SubModelId').setValue(0, { emitEvent: false })
    });

    this.VehicleForm.get('ModelId').valueChanges.subscribe((res) => {

      if (this.VehicleForm.get('ModelId').valid) {
        this._modelChanges(res);

        this._column.FilterConditions.Rules = [
          { Field: 'Status', Operator: 'eq', Value: '1' },
          { Field: 'FuelType', Operator: 'eq', Value: this.VehicleForm?.get('FuelType').value },
        ];

        this._loadDataWithFilters('Model.Id', this.VehicleForm.get('ModelId').value, 'M', 'eq');
        this._motorInsuranceService
          ._loadLists(API_ENDPOINTS.VehicleSubModel.Base)
          .subscribe((result) => {
            if (result.Success) {
              this.SubList = result.Data.Items;
              this.SubArray = this.SubList;
            }
          });
        this.VehicleForm.get('SubModel').setValue('', { emitEvent: false })
        this.VehicleForm.get('SubModelId').setValue(0, { emitEvent: false })
      }
    });

    this.VehicleForm.get('SubModelId').valueChanges.subscribe((res) => {
      this._subChange(res);
    });

    this.VehicleForm.get('Fuel').valueChanges.subscribe((res) => {
      let fuelvalue = this.DropdownMaster.FuelTypeOptions?.filter((option) =>
        option.name?.includes(res)
      );
      if (fuelvalue?.length) {
        this.VehicleForm.patchValue({
          FuelType: fuelvalue[0].value,
        });
        this._loadDataWithFilters(
          'FuelType',
          this.VehicleForm.get('FuelType').value,
          'Sub',
          'eq'
        );
        this.VehicleForm.get('SubModel').setValue('', { emitEvent: false })
        this.VehicleForm.get('SubModelId').setValue(0, { emitEvent: false })
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
  ) {
    let onSearch: any;
    onSearch = {
      field: field,
      searchValue: value,
      operator: operator,
      isAdditional: isAdditional,
    };

    this._column.UpdateFilter(onSearch);
    this.pagefilters.currentPage = 1;

    if (Name == 'Model') {
      let rtorules: IFilterRule[] = [
        { Field: 'Status', Operator: 'eq', Value: '1' },
        { Field: 'Type', Operator: 'eq', Value: 'Private Car' },
        { Field: 'Brand.Id', Operator: 'eq', Value: this.VehicleForm.get('BrandId').value },
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
          this.ModelList = res.Data.Items;
          this.ModelArray = this.ModelList;
        });

      // this._motorInsuranceService
      //   ._loadLists(API_ENDPOINTS.VehicleModel.Base)
      //   .subscribe((res) => {
      //     if (res.Success) {
      //       this.ModelList = res.Data.Items;
      //       this.ModelArray = this.ModelList;
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
            this.SubList = res.Data.Items;
            this.SubArray = this.SubList;
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
  private _brandChanges(result) {
    if (this.BrandArray && this.BrandArray.length > 0) {
      let brand = this.BrandArray.filter((option) => result == option.Id)
      // let brand = this.BrandArray.filter((option) =>
      //   option.Name?.toLowerCase().includes(result?.toLowerCase())
      // );
      if (brand.length > 0) {
        this.VehicleForm.patchValue({
          Brand: brand[0].Name,
        });
      }
    }
    // this.VehicleForm.get('Model').reset('')
  }

  /**
   * patch value of ModelId based on Model selected
   * @param result : value of Model
   */
  private _modelChanges(result) {
    let model = this.ModelArray.filter((option) => result == option.Id)
    if (this.VehicleForm.get('ModelId').valid) {
      if (model.length > 0) {
        this.VehicleForm.patchValue({
          Model: model[0].Name
        });
      }
    }
    // this.VehicleForm.get('SubModel').reset('')
  }

  /**
   * patch value of SubModelId based on SubModel selected
   * @param result : value of SubModel
   */
  private _subChange(result) {
    if (this.SubArray) {
      let Submodel = this.SubArray.filter((option) => result == option.Id)
      // let model = this.SubArray.filter((option) =>
      //   option.Name?.toLowerCase().includes(result?.toLowerCase())
      // );
      if (this.VehicleForm.get('SubModelId').valid) {
        if (Submodel.length > 0) {
          this.VehicleForm.patchValue({
            SubModel: Submodel[0].Name,
          });
        }
      }
    }
  }

  // change format of the date to (yyyy-MM-dd) format
  private _dateFormat() {
    this.MotorQuickQuoteForm.patchValue({
      ProposalDate: this._datePipe.transform(
        this.MotorQuickQuoteForm.getRawValue().ProposalDate,
        'yyyy-MM-dd'
      ),
      PolicyStartDate: this._datePipe.transform(
        this.MotorQuickQuoteForm.getRawValue().PolicyStartDate,
        'yyyy-MM-dd'
      ),
      RegistrationDate: this._datePipe.transform(
        this.MotorQuickQuoteForm.getRawValue().RegistrationDate,
        'yyyy-MM-dd'
      ),
    });
    this.VehicleForm.patchValue({
      RegistrationDate: this._datePipe.transform(
        this.VehicleForm.getRawValue().RegistrationDate,
        'yyyy-MM-dd'
      ),
    });
    this.MotorQuickQuoteForm.get('CarDetail').patchValue({
      DateofFirstRegistration: this._datePipe.transform(
        this.MotorQuickQuoteForm.get('CarDetail').getRawValue()
          .DateofFirstRegistration,
        'yyyy-MM-dd'
      ),
    });

    this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
      // PreviousPolicyODEndDate: this._datePipe.transform(this.MotorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyODEndDate, 'yyyy-MM-dd'),
      PreviousPolicyTPEndDate: this._datePipe.transform(this.MotorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyTPEndDate, 'yyyy-MM-dd'),
      PreviousPolicyTPStartDate: this._datePipe.transform(this.MotorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyTPStartDate, 'yyyy-MM-dd'),
      PreviousPolicyStartDate: this._datePipe.transform(this.MotorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyStartDate, 'yyyy-MM-dd'),
      PreviousPolicyEndDate: this._datePipe.transform(this.MotorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyEndDate, 'yyyy-MM-dd'),
    });
  }

  /**
   * depending on the value of BusinessType the policy Type List is being filtered
   * @param BusinessType : value of BusinessType in MotorQuickQuoteForm form
   *
   */
  private _policyListFilter(BusinessType: string) {
    this.PolicyTypeList = [];
    this.PreviousPolicyTypeList = [];
    if (BusinessType == 'New') {
      /**
       * set minimum date for PolicyStartDate & Registration date
       */
      this.minRegDate = new Date(); // minimum Registration Date
      this.minRegDate.setDate(this.currentDate.getDate() - 9);
      this.minRegDate = new Date(
        this._datePipe.transform(this.minRegDate, 'yyyy-MM-dd')
      );
      this.MotorQuickQuoteForm.get('ProposalDate').patchValue(
        this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')
      );
      this.MotorQuickQuoteForm.get('PolicyStartDate').patchValue(
        this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')
      );
      this.VehicleNo.patchValue('New');

      // remove details of previous policy when Businesstype is "New"
      this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
        // PreviousPolicyODEndDate: '',
        PreviousPolicyTPStartDate: '',
        PreviousPolicyTPEndDate: '',
        PreviousPolicyType: '',
        PreviousInsurer: '',
      });

      /**
       * if BusinessType is 'New' than PolicyTypeList will not have 'OwnDamage' option
       */
      this.PolicyTypeList = JSON.parse(
        JSON.stringify(this.DropdownMaster.MotorPolicyTypeButtonOptions)
      );
      this.PolicyTypeList.forEach((element, index) => {
        if (element.value == 'OwnDamage') {
          this.PolicyTypeList.splice(index, 1);
        }
        if (element.value == 'ThirdPartyOnly') {
          this.PolicyTypeList.splice(index, 1);
        }
      });
      // for BusinessType 'New' , RTOCode will be enable
      this.VehicleForm.get('RTOCode').enable();
      this.maxPolicyStartDate = new Date();

      // this.MinChassisNo = 10;
      // this.MaxChassisNo = 10;
    } else {
      // policy start date must be within next 3 month
      this.maxPolicyStartDate = new Date();
      this.maxPolicyStartDate = new Date(
        this.maxPolicyStartDate.setMonth(this.maxPolicyStartDate.getMonth() + 3)
      );

      this.PolicyTypeList = JSON.parse(JSON.stringify(this.DropdownMaster.MotorPolicyTypeButtonOptions));
      this.PreviousPolicyTypeList = JSON.parse(JSON.stringify(this.DropdownMaster.MotorPolicyTypeButtonOptions));
      this._proposalPolicyDate();
      if (
        this.MotorQuickQuoteForm.get('BusinessType').value ==
        this.MotorBusinessType['Roll Over'] &&
        this.VehicleForm.get('RTOCode').valid
      ) {
        this.VehicleForm.get('RTOCode').disable();
      }

      // this.MinChassisNo = 10;
      // this.MaxChassisNo = 17;

      if (this.MotorQuickQuoteForm.get('PolicyType').value == MotorPolicyTypeEnum.Comprehensive || this.MotorQuickQuoteForm.get('PolicyType').value == MotorPolicyTypeEnum['Third Party Only']) {
        /**
         * if BusinessType is 'New' than PolicyTypeList will not have 'OwnDamage' option
         */

        this.PreviousPolicyTypeList.forEach((element, index) => {
          if (element.value == 'OwnDamage') {
            this.PreviousPolicyTypeList.splice(index, 1);
          }
        });

      }
    }

    //if only one value its must be select
    if (!localStorage.getItem('MotorInsurance') && !localStorage.getItem('VehicleDetails')) {
      if (this.PolicyTypeList && this.PolicyTypeList.length > 0) {
        this.MotorQuickQuoteForm.get('PolicyType').patchValue(
          this.PolicyTypeList[0].value
        );
      }
    }
  }

  // check stepper 3 for error
  private _stepThreeValidation() {
    let error: Alert[] = [];

    // PersonalAccident
    if (
      this.MotorQuickQuoteForm.get('CarDetail.PersonalAccident').value == null
    ) {
      error.push({
        Message: 'Select Personal Accident',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // DriverCover
    if (this.MotorQuickQuoteForm.get('CarDetail.DriverCover').value == null) {
      error.push({
        Message: 'Select Driver Cover',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // // DriverCoverSumInsured
    // if (
    //   this.MotorQuickQuoteForm.get('CarDetail.DriverCover').value == true &&
    //   this.MotorQuickQuoteForm.get('CarDetail.DriverCoverSumInsured').value ==
    //   null
    // ) {
    //   error.push({
    //     Message: 'Enter Driver Cover Sum Insured',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }

    // ZeroDepreciation
    if (
      this.MotorQuickQuoteForm.get('CarDetail.ZeroDepreciation').value == null
    ) {
      error.push({
        Message: 'Select Zero Depreciation',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // if (this.MotorQuickQuoteForm.get('CarDetail.ZeroDepreciation').value == true) {    
    //   if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyZeroDepreciation').value == null) {
    //     error.push({
    //       Message: 'Select Is Previous Policy Zero Depreciation?',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }
    // else
    // {
    //   this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
    //     PreviousPolicyZeroDepreciation : Boolean(false)
    //   })
    // }

    // Accessories
    if (this.MotorQuickQuoteForm.get('CarDetail.Accessories').value == null) {
      error.push({
        Message: 'Select Accessories',
        CanDismiss: false,
        AutoClose: false,
      });
    } else {
      if (this.MotorQuickQuoteForm.get('CarDetail.Accessories').value == true) {
        // ElectricalAccessories
        if (
          this.MotorQuickQuoteForm.get('CarDetail.ElectricalAccessories')
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
          this.MotorQuickQuoteForm.get('CarDetail.NonElectricalAccessories')
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
    //   if (this.MotorQuickQuoteForm.get('CarDetail.NCBProtection').value == null) {
    //     error.push({
    //       Message: 'Select NCB Protection',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }

    // PersonAccident
    if (
      this.MotorQuickQuoteForm.get('CarDetail.PersonAccident').value == null
    ) {
      error.push({
        Message: 'Select Person Accident',
        CanDismiss: false,
        AutoClose: false,
      });
    } else {
      if (
        this.MotorQuickQuoteForm.get('CarDetail.PersonAccident').value == true
      ) {
        // PersonSumInsured
        if (
          this.MotorQuickQuoteForm.get('CarDetail.PersonSumInsured').invalid
        ) {
          error.push({
            Message: 'Enter Person Sum Insured',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
    }

    // InvoiceCover
    if (this.MotorQuickQuoteForm.get('CarDetail.InvoiceCover').value == null) {
      error.push({
        Message: 'Select Invoice Cover',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // if (this.MotorQuickQuoteForm.get('CarDetail.InvoiceCover').value == true) {    
    //   if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyInvoiceCover').value == null) {
    //     error.push({
    //       Message: 'Select Is Previous Policy Invoice Cover?',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }
    // else
    // {
    //   this.MotorQuickQuoteForm.get('CarDetail').patchValue({
    //     PreviousPolicyInvoiceCover : Boolean(false)
    //   })
    // }

    // RoadsideAssistance
    if (
      this.MotorQuickQuoteForm.get('CarDetail.RoadsideAssistance').value == null
    ) {
      error.push({
        Message: 'Select Road side Assistance',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // EngineProtector
    if (
      this.MotorQuickQuoteForm.get('CarDetail.EngineProtector').value == null
    ) {
      error.push({
        Message: 'Select Engine Protector',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // if (this.MotorQuickQuoteForm.get('CarDetail.EngineProtector').value == true) {    
    //   if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEngineProtector').value == null) {
    //     error.push({
    //       Message: 'Select Is Previous Policy Engine Protector?',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }
    // else
    // {
    //   this.MotorQuickQuoteForm.get('CarDetail').patchValue({
    //     PreviousPolicyEngineProtector : Boolean(false)
    //   })
    // }


    // Consumable
    if (this.MotorQuickQuoteForm.get('CarDetail.Consumable').value == null) {
      error.push({
        Message: 'Select Consumable',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // if (this.MotorQuickQuoteForm.get('CarDetail.Consumable').value == true) {    
    //   if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyConsumable').value == null) {
    //     error.push({
    //       Message: 'Select Is Previous Policy Consumable?',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }
    // else
    // {
    //   this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
    //     PreviousPolicyConsumable : Boolean(false),
    //   })
    // }

    // KeyandLockReplacement
    if (
      this.MotorQuickQuoteForm.get('CarDetail.KeyandLockReplacement').value ==
      null
    ) {
      error.push({
        Message: 'Select Key and Lock Replacement',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // RepairofGlass
    if (this.MotorQuickQuoteForm.get('CarDetail.RepairofGlass').value == null) {
      error.push({
        Message: 'Select Repair of Glass',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    return error;
  }

  /**
   * to identify the change in the value of form and according to that changing the value of form fields that dependes on the it .
   */
  private _changeInData() {
    this.VehicleForm.get('RegistrationDate').valueChanges.subscribe((value) => {
      this._fillData();
    });

    this.VehicleNo.valueChanges.subscribe((value) => {
      // Reset Field
      this.VehicleForm.patchValue({
        Financed: false,
        Financer: null,
      });
      this.VehicleForm.get('VehicleNo').patchValue(value);
      this._fillData();
    });

    this.VehicleForm.get('VehicleNo').valueChanges.subscribe((value) => {
      this._fillData();
    });

    this.VehicleForm.get('RTOCode').valueChanges.subscribe((value) => {
      this._fillData();
    });

    this.VehicleForm.get('SubModelId').valueChanges.subscribe((value) => {
      this._fillData();
    });

    this.VehicleForm.get('ManufacturingDate').valueChanges.subscribe(
      (value) => {
        this.getminRegDate();
        this._fillData();
      }
    );

    this.MotorQuickQuoteForm.get('BusinessType').valueChanges.subscribe(
      (value) => {
        if (value == MotorBusinessTypeEnum['Roll Over']) {
          this._startEndDate();
        }
        this.MotorQuickQuoteForm.get('PolicyType').patchValue('');
        this._policyListFilter(value);

        if (value == MotorBusinessTypeEnum.New) {
          this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
            PreviousPolicyType: null,
            PreviousPolicyStartDate: null,
            PreviousPolicyEndDate: null,
            PreviousPolicyTPStartDate: null,
            PreviousPolicyTPEndDate: null
          });
        }
      }
    );

    this.MotorQuickQuoteForm.get('PolicyType').valueChanges.subscribe(
      (value) => {

        this.PreviousPolicyTypeList = [];

        if (
          this.MotorQuickQuoteForm.get('BusinessType').value ==
          MotorBusinessTypeEnum['Roll Over']
        ) {
          this._proposalPolicyDate(value);
        }

        if (this.MotorQuickQuoteForm.get('BusinessType').value == MotorBusinessTypeEnum.New && value == MotorPolicyTypeEnum.Comprehensive) {
          this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
            PreviousPolicyType: null,
            PreviousPolicyStartDate: null,
            PreviousPolicyEndDate: null,
            PreviousPolicyTPStartDate: null,
            PreviousPolicyTPEndDate: null
          });
        }
        else if (this.MotorQuickQuoteForm.get('BusinessType').value == MotorBusinessTypeEnum['Roll Over'] && (value == MotorPolicyTypeEnum.Comprehensive || value == MotorPolicyTypeEnum['Third Party Only'])) {

          this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
            PreviousPolicyTPStartDate: null,
            PreviousPolicyTPEndDate: null
          });

          /**
           * if BusinessType is 'New' than PolicyTypeList will not have 'OwnDamage' option
           */
          this.PreviousPolicyTypeList = JSON.parse(
            JSON.stringify(this.DropdownMaster.MotorPolicyTypeButtonOptions)
          );

          this.PreviousPolicyTypeList.forEach((element, index) => {
            if (element.value == 'OwnDamage') {
              this.PreviousPolicyTypeList.splice(index, 1);
            }
          });

        }
        else if (this.MotorQuickQuoteForm.get('BusinessType').value == MotorBusinessTypeEnum['Roll Over'] && value == MotorPolicyTypeEnum['Own Damage']) {

          /**
           * bind Previous Policy Type List
           */
          this.PreviousPolicyTypeList = JSON.parse(
            JSON.stringify(this.DropdownMaster.MotorPolicyTypeButtonOptions)
          );

        }

      }
    );

    this.MotorQuickQuoteForm.get('CarDetail.IsBiFuel').valueChanges.subscribe(
      (value) => {
        if (!value) {
          this.MotorQuickQuoteForm.get('CarDetail').patchValue({
            BiFuelType: '',
            BiFuelKitValue: 0,
          });
        }
      }
    );

    this.MotorQuickQuoteForm.get(
      'PolicyDetail.PreviousPolicyClaim'
    ).valueChanges.subscribe((value) => {
      if (value) {
        this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
          // PreviousPolicyNCBPercentage: 0,
          PreviousPolicyNCBPercentage: null,
        });
      }
    });

    this.MotorQuickQuoteForm.get(
      'CarDetail.DriverCover'
    ).valueChanges.subscribe((value) => {
      if (value == false) {
        this.MotorQuickQuoteForm.get(
          'CarDetail.DriverCoverSumInsured'
        ).patchValue(null);
      }
    });

    this.MotorQuickQuoteForm.get(
      'CarDetail.Accessories'
    ).valueChanges.subscribe((value) => {
      if (value == false) {
        this.MotorQuickQuoteForm.get('CarDetail').patchValue({
          ElectricalAccessories: null,
          NonElectricalAccessories: null,
        });
      }
    });

    this.MotorQuickQuoteForm.get(
      'CarDetail.PersonAccident'
    ).valueChanges.subscribe((value) => {
      if (value == false) {
        this.MotorQuickQuoteForm.get('CarDetail').patchValue({
          // NoOfPerson: null,
          PersonSumInsured: null,
        });
      }
    });

    // this.MotorQuickQuoteForm.get(
    //   'PolicyDetail.PreviousPolicyNCBPercentage'
    // ).valueChanges.subscribe((value) => {
    //   if (value) {
    //   }
    // });

    this.MotorQuickQuoteForm.get('CustomerDetail.CustomerType').valueChanges.subscribe((value) => {
      this.AddOnFliedDisabled();
    });

    this.MotorQuickQuoteForm.get('BusinessType').valueChanges.subscribe((value) => {
      this.AddOnFliedDisabled();
    });

    this.MotorQuickQuoteForm.get('PolicyType').valueChanges.subscribe((value) => {
      this.AddOnFliedDisabled();
    });

    this.MotorQuickQuoteForm.get('PolicyStartDate').valueChanges.subscribe((value) => {
      this.AddOnFliedDisabled();
    });

    this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyType').valueChanges.subscribe((value) => {
      this.AddOnFliedDisabled();
    });

    this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').valueChanges.subscribe((value) => {
      this.AddOnFliedDisabled();
    });

    this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyType').valueChanges.subscribe((value) => {
      if (value == MotorPolicyTypeEnum['Third Party Only']) {
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyClaim').patchValue(false);
        this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
      }
    });

  }

  /**
   * based on the value of PolicyType PolicyStartDate value is patched
   * @param value : value of PolicyType
   */
  private _proposalPolicyDate(
    value = this.MotorQuickQuoteForm.get('PolicyType').value
  ) {
    this.MotorQuickQuoteForm.get('ProposalDate').patchValue(
      this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')
    );
    if (value == MotorPolicyTypeEnum['Own Damage']) {
      let odEndDate = moment(this._datePipe.transform(this.MotorQuickQuoteForm.get('PolicyDetail').getRawValue().PreviousPolicyEndDate, 'yyyy-MM-dd'));
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
          this.MotorQuickQuoteForm.get('PolicyStartDate').patchValue(startDate);
        } else {
          if (localStorage.getItem('MotorInsurance') == "") { this.MotorQuickQuoteForm.get('PolicyStartDate').patchValue(this.currentDate); }
        }
      }
      else {
        odEndDate = odEndDate.add(1, 'day');
        if (odEndDate >= moment(this.minPolicyStartDate) && odEndDate < moment(this.maxPolicyStartDate)) {
          this.MotorQuickQuoteForm.get('PolicyStartDate').patchValue(odEndDate);
        } else {
          if (localStorage.getItem('MotorInsurance') == "") { this.MotorQuickQuoteForm.get('PolicyStartDate').patchValue(this.currentDate); }
        }
      }

    } else if (
      value == MotorPolicyTypeEnum.Comprehensive ||
      value == MotorPolicyTypeEnum['Third Party Only']
    ) {
      let tpEndDate = moment(
        this._datePipe.transform(
          this.MotorQuickQuoteForm.get('PolicyDetail').getRawValue()
            .PreviousPolicyTPEndDate,
          'yyyy-MM-dd'
        )
      );
      tpEndDate = tpEndDate.add(1, 'day');
      if (tpEndDate >= moment(this.minPolicyStartDate) && tpEndDate < moment(this.maxPolicyStartDate)) {
        this.MotorQuickQuoteForm.get('PolicyStartDate').patchValue(tpEndDate);
      } else {
        if (localStorage.getItem('MotorInsurance') == "") { this.MotorQuickQuoteForm.get('PolicyStartDate').patchValue(this.currentDate); }
      }
      // this.MotorQuickQuoteForm.get('PolicyStartDate').patchValue(tpEndDate);
    }
  }

  /**
   * change in value of data
   */
  private _fillData() {
    this.MotorQuickQuoteForm.patchValue({
      VehicleSubModelId: this.VehicleForm.get('SubModelId').value,
      RTOCode: this.VehicleForm.get('RTOCode').value,
      RegistrationDate: this.VehicleForm.get('RegistrationDate').value,
    });

    this.MotorQuickQuoteForm.get('CarDetail').patchValue({
      DateofFirstRegistration: this.VehicleForm.get('RegistrationDate').value,
    });

    this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
      VehicleNo: this.VehicleForm.get('VehicleNo').value,
    });
    if (this.VehicleForm.get('ManufacturingDate').value) {
      let ManufactureYear =
        this.VehicleForm.get('ManufacturingDate').value.split('/');
      this.MotorQuickQuoteForm.get('CarDetail').patchValue({
        YearOfManufacture: ManufactureYear[1],
      });
    }

    // for BusinessType RollOver and RTOCode have valid value, RTOCode will be disabled
    if (
      this.MotorQuickQuoteForm.get('BusinessType').value ==
      this.MotorBusinessType['Roll Over'] &&
      this.VehicleForm.get('RTOCode').valid
    ) {
      this.VehicleForm.get('RTOCode').disable();
    }
    // else if (this.MotorQuickQuoteForm.get('BusinessType').value == this.MotorBusinessType.New) {
    //   this.VehicleForm.get('RTOCode').enable()
    // }
  }

  /**
   * patch the data of car details that are obtained in response
   * @param result : response of API (RTo data api)
   */
  private _carDetails(result) {
    this.VehicleForm.patchValue({
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

    this.VehicleForm.patchValue({
      RTOCode: result.Data.RTOData.RTOCode,
      RegistrationDate: result.Data.RTOData.RegistrationDate,
      ManufacturingDate: result.Data.RTOData.ManufacturingDate,
      VehicleNo: this.VehicleNo.value,
      EngineNo: result.Data.RTOData.EngineNo,
      ChassisNo: result.Data.RTOData.ChassisNo,
      CC: result.Data.CC,
      Financed: result.Data.RTOData.Financed,
      Financer: result.Data.RTOData.Financer,
    });

    this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
      PreviousPolicyTPEndDate: result.Data.RTOData.InsuranceExpiryDate,
      PreviousInsurer: result.Data.RTOData.InsuranceCompany,
    });
    if (
      this.MotorQuickQuoteForm.get('BusinessType').value ==
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
  private _startEndDate() {
    this.minRegDate = null;
    let RegDate = moment(
      this._datePipe.transform(
        this.MotorQuickQuoteForm.getRawValue().RegistrationDate,
        'yyyy-MM-dd'
      )
    );
    let TPEndDate = moment(
      this._datePipe.transform(
        this.MotorQuickQuoteForm.get('PolicyDetail').getRawValue()
          .PreviousPolicyTPEndDate,
        'yyyy-MM-dd'
      )
    );

    let diffInYears = TPEndDate.diff(RegDate, 'year');

    if (diffInYears < 4) {
      let startDate = TPEndDate.subtract(3, 'years');
      let tempStartDate = moment(startDate)
      this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
        PreviousPolicyTPStartDate: startDate,
      });
      let endDate = tempStartDate.add(1, 'years');

      this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').patchValue(endDate);
    } else if (diffInYears >= 4) {
      let startDate = TPEndDate.subtract(1, 'years');
      let tempStartDate = moment(startDate)
      this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
        PreviousPolicyTPStartDate: startDate,
      });
      let endDate = tempStartDate.add(1, 'years');

      this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').patchValue(endDate);
    }
    if (this.VehicleNo?.value.toLowerCase() == 'new') {
      this.VehicleNo.patchValue('');
    }

    this._proposalPolicyDate();
  }

  /**
   * list of model and subModel when the data of all the fields of the form is provided
   */
  private _formDataDetails(
    Brand = this.VehicleForm.get('BrandId').value,
    Model = this.VehicleForm.get('ModelId').value,
    Sub = this.VehicleForm.get('SubModelId').value
  ) {
    if (Brand) {
      this._column.FilterConditions.Rules = [
        { Field: 'Status', Operator: 'eq', Value: '1' },
      ];

      this._loadDataWithFilters('Brand.Id', Brand, 'Model');
    }
    if (Model) {
      this._column.FilterConditions.Rules = [
        { Field: 'Status', Operator: 'eq', Value: '1' },
        { Field: 'FuelType', Operator: 'eq', Value: this.VehicleForm?.get('FuelType').value },
      ];
      this._loadDataWithFilters('Model.Id', Model, 'S', 'eq');
      this._motorInsuranceService
        ._loadLists(API_ENDPOINTS.VehicleSubModel.Base)
        .subscribe((result) => {
          if (result.Success) {
            this.SubList = result.Data.Items;
            this.SubArray = this.SubList;
            this._subChange(Sub);
          }
        });
    }
  }

  // form for car details
  private _buildCarDetails(data?) {
    let vehicledetailsForm = this._fb.group({
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

  private _initMotorQuickQuoteForm(data) {
    let mQQ = this._fb.group({
      Insurer: [0],
      BusinessType: ['', [Validators.required]],
      PolicyStartDate: [new Date(), [Validators.required]],
      ProposalDate: ['', [Validators.required]],
      RegistrationDate: ['', [Validators.required]],
      RTOCode: ['', [Validators.required]],
      VehicleSubModelId: [],
      PolicyType: ['', [Validators.required]],
      PolicyDetail: this._buildMotorQuickQuotePolicyDetailForm(data.PolicyDetail),
      CarDetail: this._buildMotorQuickQuoteCarDetailForm(data.CarDetail),
      CustomerDetail: this._buildMotorQuickQuoteCustomerDetailForm(data.CustomerDetail),

    });

    if (data) {
      mQQ.patchValue(data);
    }

    return mQQ;
  }

  private _buildMotorQuickQuotePolicyDetailForm(data) {
    let mQPD = this._fb.group({
      VehicleNo: [''],
      PreviousPolicyNo: ['', [Validators.required]],
      PreviousPolicyClaim: [false],
      PolicyPeriod: [1],
      PreviousPolicyNCBPercentage: [null],
      PreviousPolicyType: ['', [Validators.required]],
      PreviousInsurer: ['', [Validators.required]],
      PreviousInsurerAddress: ['', [Validators.required]],
      // PreviousPolicyODEndDate: [''],
      PreviousPolicyStartDate: ['', [Validators.required]],
      PreviousPolicyEndDate: ['', [Validators.required]],
      PreviousPolicyTPStartDate: ['', [Validators.required]],
      PreviousPolicyTPEndDate: ['', [Validators.required]],
      PreviousPolicyBiFuel: [false],
      PreviousPolicyZeroDepreciation: [false],
      PreviousPolicyConsumable: [false],
      PreviousPolicyEngineProtector: [false],
      PreviousPolicyInvoiceCover: [false],
      PreviousPolicyTyreCover: [false],
      PreviousAddOns: []
    });

    if (data) {
      mQPD.patchValue(data);
    }

    return mQPD;
  }

  private _buildMotorQuickQuoteCarDetailForm(data) {
    let mQCD = this._fb.group({
      YearOfManufacture: [],
      PersonalAccident: [false],
      DriverCover: [false],
      TyreSecure: [false],
      DriverCoverSumInsured: [],
      ZeroDepreciation: [false],
      Accessories: [false],
      ElectricalAccessories: [null, [Validators.required, Validators.min(1)]],
      NonElectricalAccessories: [null, [Validators.required, Validators.min(1)]],
      NCBProtection: [false],
      PersonAccident: [false],
      PersonSumInsured: [null, [Validators.required, Validators.min(1)]],
      InvoiceCover: [false],
      RoadsideAssistance: [false],
      EngineProtector: [false],
      Consumable: [false],
      KeyandLockReplacement: [false],
      RepairofGlass: [false],
      DateofFirstRegistration: ['', [Validators.required]],
      VehicleIDV: [],
      IsBiFuel: [false],
      BiFuelType: ['', [Validators.required]],
      BiFuelKitValue: ['', [Validators.required, Validators.min(1), Validators.max(40000)]],
      PassengerCover: [],
      PassengerCoverSumInsured: [],
    });

    if (data) {
      mQCD.patchValue(data);
    }

    return mQCD;
  }

  private _buildMotorQuickQuoteCustomerDetailForm(data) {

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
  private AddOnFliedDisabled() {

    let ProposalType = this.MotorQuickQuoteForm.get('BusinessType').value;
    let PolicyType = this.MotorQuickQuoteForm.get('PolicyType').value;
    let CustomerType = this.MotorQuickQuoteForm.get('CustomerDetail.CustomerType').value;

    if (ProposalType != "" && PolicyType != "" && CustomerType != "") {

      let PreviousPolicyType = this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyType').value;

      if (CustomerType == MotorCustomerTypeEnum.Individual) {

        if (ProposalType == MotorBusinessTypeEnum.New && PolicyType == MotorPolicyTypeEnum.Comprehensive) {
          this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
          this.MotorQuickQuoteForm.get("PolicyDetail.PreviousPolicyNCBPercentage").disable();

          this.MotorQuickQuoteForm.get("CarDetail.PersonalAccident").enable();
          this.MotorQuickQuoteForm.get("CarDetail.PersonAccident").enable();
          this.MotorQuickQuoteForm.get("CarDetail.DriverCover").enable();
          this.MotorQuickQuoteForm.get("CarDetail.TyreSecure").enable();
          this.MotorQuickQuoteForm.get("CarDetail.ZeroDepreciation").enable();
          this.MotorQuickQuoteForm.get("CarDetail.NCBProtection").enable();
          this.MotorQuickQuoteForm.get("CarDetail.InvoiceCover").enable();
          this.MotorQuickQuoteForm.get("CarDetail.RoadsideAssistance").enable();
          this.MotorQuickQuoteForm.get("CarDetail.EngineProtector").enable();
          this.MotorQuickQuoteForm.get("CarDetail.Consumable").enable();
          this.MotorQuickQuoteForm.get("CarDetail.KeyandLockReplacement").enable();
          this.MotorQuickQuoteForm.get("CarDetail.RepairofGlass").enable();
          this.MotorQuickQuoteForm.get("CarDetail.Accessories").enable();
          this.MotorQuickQuoteForm.get("CarDetail.ElectricalAccessories").enable();
          this.MotorQuickQuoteForm.get("CarDetail.NonElectricalAccessories").enable();
          this.MotorQuickQuoteForm.get('CarDetail.IsBiFuel').enable();

          this.chkPersonalAccident = false;
          this.chkZeroDepreciation = false;
          this.chkNCBProtection = false;
          this.chkInvoiceCover = false;
          this.chkRoadAssistance = false;
          this.chkEngineProtector = false;
          this.chkConsumable = false;
          this.chkKeyandLockReplacement = false;
          this.chkRepairofGlass = false;
          this.chkAccessories = false;
          this.chkPassenger = false;
          this.chkDriverCover = false;
          this.chkTyreSecure = false;

        }
        else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum.Comprehensive) {

          if (PreviousPolicyType == MotorPolicyTypeEnum['Own Damage'] || PreviousPolicyType == MotorPolicyTypeEnum.Comprehensive) {

            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            let PolicyStartDate: any = new Date(this.MotorQuickQuoteForm.get('PolicyStartDate').value);
            const ODDate: any = new Date(this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value);
            const diffDays = Math.round(Math.abs((PolicyStartDate - ODDate) / oneDay)); // difference day between two date

            if (diffDays > 90) {
              this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
              this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').disable();
            }
            else {
              this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').enable();
            }
          }
          this.MotorQuickQuoteForm.get("CarDetail.PersonalAccident").enable();
          this.MotorQuickQuoteForm.get("CarDetail.PersonAccident").enable();
          this.MotorQuickQuoteForm.get("CarDetail.DriverCover").enable();
          this.MotorQuickQuoteForm.get("CarDetail.TyreSecure").enable();
          this.MotorQuickQuoteForm.get("CarDetail.ZeroDepreciation").enable();
          this.MotorQuickQuoteForm.get("CarDetail.NCBProtection").enable();
          this.MotorQuickQuoteForm.get("CarDetail.InvoiceCover").enable();
          this.MotorQuickQuoteForm.get("CarDetail.RoadsideAssistance").enable();
          this.MotorQuickQuoteForm.get("CarDetail.EngineProtector").enable();
          this.MotorQuickQuoteForm.get("CarDetail.Consumable").enable();
          this.MotorQuickQuoteForm.get("CarDetail.KeyandLockReplacement").enable();
          this.MotorQuickQuoteForm.get("CarDetail.RepairofGlass").enable();
          this.MotorQuickQuoteForm.get("CarDetail.Accessories").enable();
          this.MotorQuickQuoteForm.get("CarDetail.ElectricalAccessories").enable();
          this.MotorQuickQuoteForm.get("CarDetail.NonElectricalAccessories").enable();
          this.MotorQuickQuoteForm.get('CarDetail.IsBiFuel').enable();

          this.chkPersonalAccident = false;
          this.chkZeroDepreciation = false;
          this.chkNCBProtection = false;
          this.chkInvoiceCover = false;
          this.chkRoadAssistance = false;
          this.chkEngineProtector = false;
          this.chkConsumable = false;
          this.chkKeyandLockReplacement = false;
          this.chkRepairofGlass = false;
          this.chkAccessories = false;
          this.chkPassenger = false;
          this.chkDriverCover = false;
          this.chkTyreSecure = false;
        }
        else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Third Party Only']) {

          this.MotorQuickQuoteForm.get("CarDetail.PersonalAccident").enable();
          this.MotorQuickQuoteForm.get("CarDetail.PersonAccident").enable();
          this.MotorQuickQuoteForm.get("CarDetail.DriverCover").enable();

          this.chkPersonalAccident = false;
          this.chkPassenger = false;
          this.chkDriverCover = false;

          this.chkZeroDepreciation = true;
          this.chkNCBProtection = true;
          this.chkInvoiceCover = true;
          this.chkTyreSecure = true;
          this.chkRoadAssistance = true;
          this.chkEngineProtector = true;
          this.chkConsumable = true;
          this.chkKeyandLockReplacement = true;
          this.chkRepairofGlass = true;
          this.chkAccessories = true;

          this.MotorQuickQuoteForm.get('CarDetail.ZeroDepreciation').disable();
          this.MotorQuickQuoteForm.get('CarDetail.NCBProtection').disable();
          this.MotorQuickQuoteForm.get('CarDetail.InvoiceCover').disable();
          this.MotorQuickQuoteForm.get("CarDetail.TyreSecure").disable();
          this.MotorQuickQuoteForm.get('CarDetail.RoadsideAssistance').disable();
          this.MotorQuickQuoteForm.get('CarDetail.EngineProtector').disable();
          this.MotorQuickQuoteForm.get('CarDetail.Consumable').disable();
          this.MotorQuickQuoteForm.get('CarDetail.KeyandLockReplacement').disable();
          this.MotorQuickQuoteForm.get('CarDetail.RepairofGlass').disable();
          this.MotorQuickQuoteForm.get('CarDetail.Accessories').disable();
          this.MotorQuickQuoteForm.get('CarDetail.IsBiFuel').disable();
          this.MotorQuickQuoteForm.get('CarDetail.IsBiFuel').patchValue(false);
          this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').disable();
          this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);

          this.MotorQuickQuoteForm.get('CarDetail').patchValue({
            ZeroDepreciation: false,
            NCBProtection: false,
            InvoiceCover: false,
            TyreSecure: false,
            RoadsideAssistance: false,
            EngineProtector: false,
            Consumable: false,
            KeyandLockReplacement: false,
            RepairofGlass: false,
            Accessories: false,
            IsBiFuel: false,
          });

        }
        else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Own Damage']) {

          this.MotorQuickQuoteForm.get('CarDetail.ZeroDepreciation').enable();
          this.MotorQuickQuoteForm.get('CarDetail.NCBProtection').enable();
          this.MotorQuickQuoteForm.get('CarDetail.InvoiceCover').enable();
          this.MotorQuickQuoteForm.get('CarDetail.TyreSecure').enable();
          this.MotorQuickQuoteForm.get('CarDetail.RoadsideAssistance').enable();
          this.MotorQuickQuoteForm.get('CarDetail.EngineProtector').enable();
          this.MotorQuickQuoteForm.get('CarDetail.Consumable').enable();
          this.MotorQuickQuoteForm.get('CarDetail.KeyandLockReplacement').enable();
          this.MotorQuickQuoteForm.get('CarDetail.RepairofGlass').enable();
          this.MotorQuickQuoteForm.get('CarDetail.Accessories').enable();
          this.MotorQuickQuoteForm.get('CarDetail.IsBiFuel').enable();

          this.MotorQuickQuoteForm.get('CarDetail.PersonalAccident').disable();
          this.MotorQuickQuoteForm.get('CarDetail.PersonAccident').disable();
          this.MotorQuickQuoteForm.get('CarDetail.DriverCover').disable();

          this.chkPersonalAccident = true;
          this.chkPassenger = true;
          this.chkDriverCover = true;

          this.chkZeroDepreciation = false;
          this.chkNCBProtection = false;
          this.chkInvoiceCover = false;
          this.chkTyreSecure = false;
          this.chkRoadAssistance = false;
          this.chkEngineProtector = false;
          this.chkConsumable = false;
          this.chkKeyandLockReplacement = false;
          this.chkRepairofGlass = false;
          this.chkAccessories = false;

          const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
          let PolicyStartDate: any = new Date(this.MotorQuickQuoteForm.get('PolicyStartDate').value);
          const ODDate: any = new Date(this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value);
          const diffDays = Math.round(Math.abs((PolicyStartDate - ODDate) / oneDay)); // difference day between two date

          if (diffDays > 90) {
            this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
            this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').disable();
          }
          else {
            this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').enable();
          }

          this.MotorQuickQuoteForm.get('CarDetail').patchValue({
            PersonalAccident: false,
            PersonAccident: false,
            DriverCover: false,
            TyreSecure: false,
          });

          if (PreviousPolicyType == MotorPolicyTypeEnum['Own Damage'] || PreviousPolicyType == MotorPolicyTypeEnum.Comprehensive) {

            const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            let PolicyStartDate: any = new Date(this.MotorQuickQuoteForm.get('PolicyStartDate').value);
            const ODDate: any = new Date(this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value);
            const diffDays = Math.round(Math.abs((PolicyStartDate - ODDate) / oneDay)); // difference day between two date

            if (diffDays > 90) {
              this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
              this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').disable();
            }
            else {
              this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').enable();
            }
          }

        }

      }
      else if (CustomerType == MotorCustomerTypeEnum.Corporate) {

        this.MotorQuickQuoteForm.get('CarDetail.PersonalAccident').disable();
        this.MotorQuickQuoteForm.get('CarDetail.PersonalAccident').patchValue(false);
        this.chkPersonalAccident = true;

        if (ProposalType == MotorBusinessTypeEnum.New && PolicyType == MotorPolicyTypeEnum.Comprehensive) {

          this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
          this.MotorQuickQuoteForm.get("PolicyDetail.PreviousPolicyNCBPercentage").disable();

          this.chkPassenger = false;
          this.chkDriverCover = false;
          this.chkTyreSecure = false;
          this.chkZeroDepreciation = false;
          this.chkNCBProtection = false;
          this.chkInvoiceCover = false;
          this.chkRoadAssistance = false;
          this.chkEngineProtector = false;
          this.chkConsumable = false;
          this.chkKeyandLockReplacement = false;
          this.chkRepairofGlass = false;
          this.chkAccessories = false;

          this.MotorQuickQuoteForm.get("CarDetail.PersonAccident").enable();
          this.MotorQuickQuoteForm.get("CarDetail.DriverCover").enable();
          this.MotorQuickQuoteForm.get("CarDetail.TyreSecure").enable();
          this.MotorQuickQuoteForm.get("CarDetail.ZeroDepreciation").enable();
          this.MotorQuickQuoteForm.get("CarDetail.NCBProtection").enable();
          this.MotorQuickQuoteForm.get("CarDetail.InvoiceCover").enable();
          this.MotorQuickQuoteForm.get("CarDetail.RoadsideAssistance").enable();
          this.MotorQuickQuoteForm.get("CarDetail.EngineProtector").enable();
          this.MotorQuickQuoteForm.get("CarDetail.Consumable").enable();
          this.MotorQuickQuoteForm.get("CarDetail.KeyandLockReplacement").enable();
          this.MotorQuickQuoteForm.get("CarDetail.RepairofGlass").enable();
          this.MotorQuickQuoteForm.get("CarDetail.Accessories").enable();
          this.MotorQuickQuoteForm.get("CarDetail.ElectricalAccessories").enable();
          this.MotorQuickQuoteForm.get("CarDetail.NonElectricalAccessories").enable();
          this.MotorQuickQuoteForm.get('CarDetail.IsBiFuel').enable();
        }
        else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum.Comprehensive) {

          const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
          let PolicyStartDate: any = new Date(this.MotorQuickQuoteForm.get('PolicyStartDate').value);
          const ODDate: any = new Date(this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value);
          const diffDays = Math.round(Math.abs((PolicyStartDate - ODDate) / oneDay)); // difference day between two date

          if (diffDays > 90) {
            this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
            this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').disable();
          }
          else {
            this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').enable();
          }

          this.MotorQuickQuoteForm.get("CarDetail.PersonAccident").enable();
          this.MotorQuickQuoteForm.get("CarDetail.DriverCover").enable();
          this.MotorQuickQuoteForm.get("CarDetail.TyreSecure").enable();
          this.MotorQuickQuoteForm.get("CarDetail.ZeroDepreciation").enable();
          this.MotorQuickQuoteForm.get("CarDetail.NCBProtection").enable();
          this.MotorQuickQuoteForm.get("CarDetail.InvoiceCover").enable();
          this.MotorQuickQuoteForm.get("CarDetail.RoadsideAssistance").enable();
          this.MotorQuickQuoteForm.get("CarDetail.EngineProtector").enable();
          this.MotorQuickQuoteForm.get("CarDetail.Consumable").enable();
          this.MotorQuickQuoteForm.get("CarDetail.KeyandLockReplacement").enable();
          this.MotorQuickQuoteForm.get("CarDetail.RepairofGlass").enable();
          this.MotorQuickQuoteForm.get("CarDetail.Accessories").enable();
          this.MotorQuickQuoteForm.get("CarDetail.ElectricalAccessories").enable();
          this.MotorQuickQuoteForm.get("CarDetail.NonElectricalAccessories").enable();
          this.MotorQuickQuoteForm.get('CarDetail.IsBiFuel').enable();

          this.chkPassenger = false;
          this.chkDriverCover = false;
          this.chkTyreSecure = false;
          this.chkZeroDepreciation = false;
          this.chkNCBProtection = false;
          this.chkInvoiceCover = false;
          this.chkRoadAssistance = false;
          this.chkEngineProtector = false;
          this.chkConsumable = false;
          this.chkKeyandLockReplacement = false;
          this.chkRepairofGlass = false;
          this.chkAccessories = false;
        }
        else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Third Party Only']) {

          this.MotorQuickQuoteForm.get('CarDetail.ZeroDepreciation').disable();
          this.MotorQuickQuoteForm.get('CarDetail.NCBProtection').disable();
          this.MotorQuickQuoteForm.get('CarDetail.InvoiceCover').disable();
          this.MotorQuickQuoteForm.get('CarDetail.TyreSecure').disable();
          this.MotorQuickQuoteForm.get('CarDetail.RoadsideAssistance').disable();
          this.MotorQuickQuoteForm.get('CarDetail.EngineProtector').disable();
          this.MotorQuickQuoteForm.get('CarDetail.Consumable').disable();
          this.MotorQuickQuoteForm.get('CarDetail.KeyandLockReplacement').disable();
          this.MotorQuickQuoteForm.get('CarDetail.RepairofGlass').disable();
          this.MotorQuickQuoteForm.get('CarDetail.Accessories').disable();
          this.MotorQuickQuoteForm.get('CarDetail.IsBiFuel').disable();
          this.MotorQuickQuoteForm.get('CarDetail.IsBiFuel').patchValue(false);

          this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').disable();
          this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);

          this.MotorQuickQuoteForm.get('CarDetail').patchValue({
            ZeroDepreciation: false,
            NCBProtection: false,
            InvoiceCover: false,
            TyreSecure: false,
            RoadsideAssistance: false,
            EngineProtector: false,
            Consumable: false,
            KeyandLockReplacement: false,
            RepairofGlass: false,
            Accessories: false,
            IsBiFuel: false,
          });

          this.chkPassenger = false;
          this.chkDriverCover = false;
          this.chkZeroDepreciation = true;
          this.chkNCBProtection = true;
          this.chkInvoiceCover = true;
          this.chkTyreSecure = true;
          this.chkRoadAssistance = true;
          this.chkEngineProtector = true;
          this.chkConsumable = true;
          this.chkKeyandLockReplacement = true;
          this.chkRepairofGlass = true;
          this.chkAccessories = true;

          this.MotorQuickQuoteForm.get("CarDetail.PersonAccident").enable();
          this.MotorQuickQuoteForm.get("CarDetail.DriverCover").enable();
        }
        else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Own Damage']) {
          this.MotorQuickQuoteForm.get('CarDetail.PersonAccident').disable();
          this.MotorQuickQuoteForm.get('CarDetail.DriverCover').disable();

          this.MotorQuickQuoteForm.get('CarDetail').patchValue({
            PersonAccident: false,
            DriverCover: false,
          });

          const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
          let PolicyStartDate: any = new Date(this.MotorQuickQuoteForm.get('PolicyStartDate').value);
          const ODDate: any = new Date(this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyEndDate').value);
          const diffDays = Math.round(Math.abs((PolicyStartDate - ODDate) / oneDay)); // difference day between two date

          if (diffDays > 90) {
            this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').patchValue(null);
            this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').disable();
          }
          else {
            this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyNCBPercentage').enable();
          }

          this.MotorQuickQuoteForm.get("CarDetail.ZeroDepreciation").enable();
          this.MotorQuickQuoteForm.get("CarDetail.NCBProtection").enable();
          this.MotorQuickQuoteForm.get("CarDetail.InvoiceCover").enable();
          this.MotorQuickQuoteForm.get('CarDetail.TyreSecure').enable();
          this.MotorQuickQuoteForm.get("CarDetail.RoadsideAssistance").enable();
          this.MotorQuickQuoteForm.get("CarDetail.EngineProtector").enable();
          this.MotorQuickQuoteForm.get("CarDetail.Consumable").enable();
          this.MotorQuickQuoteForm.get("CarDetail.KeyandLockReplacement").enable();
          this.MotorQuickQuoteForm.get("CarDetail.RepairofGlass").enable();
          this.MotorQuickQuoteForm.get("CarDetail.Accessories").enable();
          this.MotorQuickQuoteForm.get("CarDetail.ElectricalAccessories").enable();
          this.MotorQuickQuoteForm.get("CarDetail.NonElectricalAccessories").enable();
          this.MotorQuickQuoteForm.get('CarDetail.IsBiFuel').enable();

          this.chkPassenger = true;
          this.chkDriverCover = true;

          this.chkZeroDepreciation = false;
          this.chkNCBProtection = false;
          this.chkInvoiceCover = false;
          this.chkTyreSecure = false;
          this.chkRoadAssistance = false;
          this.chkEngineProtector = false;
          this.chkConsumable = false;
          this.chkKeyandLockReplacement = false;
          this.chkRepairofGlass = false;
          this.chkAccessories = false;
        }
      }
    }
  }

  private setPolicyDetailsFormValue() {

    if (this.MotorQuickQuoteForm.get('BusinessType').value == MotorBusinessTypeEnum.New && this.MotorQuickQuoteForm.get('PolicyType').value == MotorPolicyTypeEnum.Comprehensive) {
      this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
        PreviousPolicyType: null,
        PreviousPolicyStartDate: null,
        PreviousPolicyEndDate: null,
        PreviousPolicyTPStartDate: null,
        PreviousPolicyTPEndDate: null
      });
    }
    else if (this.MotorQuickQuoteForm.get('BusinessType').value == MotorBusinessTypeEnum['Roll Over'] && (this.MotorQuickQuoteForm.get('PolicyType').value == MotorPolicyTypeEnum.Comprehensive || this.MotorQuickQuoteForm.get('PolicyType').value == MotorPolicyTypeEnum['Third Party Only'])) {

      this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
        PreviousPolicyTPStartDate: null,
        PreviousPolicyTPEndDate: null
      });
    }

    if (this.MotorQuickQuoteForm.get('PolicyDetail.PreviousPolicyType').value == MotorPolicyTypeEnum['Third Party Only']) {

      this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
        PreviousPolicyNCBPercentage: null,
        PreviousPolicyClaim: false
      });
    }
  }

  // Inital value of Form fields
  private _InitValueOfForm() {

    this.MotorQuickQuoteForm.patchValue({
      Insurer: 0,
      BusinessType: '',
      PolicyStartDate: '',
      ProposalDate: '',
      RegistrationDate: '',
      RTOCode: '',
      VehicleSubModelId: null,
      PolicyType: '',
    })


    this.MotorQuickQuoteForm.get('PolicyDetail').patchValue({
      VehicleNo: '',
      PreviousPolicyNo: '',
      PreviousPolicyClaim: false,
      PolicyPeriod: 1,
      PreviousPolicyNCBPercentage: null,
      PreviousPolicyType: '',
      PreviousInsurer: '',
      PreviousInsurerAddress: '',
      PreviousPolicyStartDate: '',
      PreviousPolicyEndDate: '',
      PreviousPolicyTPStartDate: '',
      PreviousPolicyTPEndDate: '',
      PreviousPolicyBiFuel: false,
      PreviousPolicyZeroDepreciation: false,
      PreviousPolicyConsumable: false,
      PreviousPolicyEngineProtector: false,
      PreviousPolicyInvoiceCover: false,
      PreviousPolicyTyreCover: false,
      PreviousAddOns: null
    })

    this.MotorQuickQuoteForm.get('CarDetail').patchValue({

      YearOfManufacture: null,
      PersonalAccident: false,
      DriverCover: false,
      TyreSecure: false,
      DriverCoverSumInsured: null,
      ZeroDepreciation: false,
      Accessories: false,
      ElectricalAccessories: null,
      NonElectricalAccessories: null,
      NCBProtection: false,
      PersonAccident: false,
      PersonSumInsured: null,
      InvoiceCover: false,
      RoadsideAssistance: false,
      EngineProtector: false,
      Consumable: false,
      KeyandLockReplacement: false,
      RepairofGlass: false,
      DateofFirstRegistration: '',
      VehicleIDV: null,
      IsBiFuel: false,
      BiFuelType: '',
      BiFuelKitValue: '',
      PassengerCover: null,
      PassengerCoverSumInsured: null,
    })


    this.VehicleForm.patchValue({
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

    this.MotorQuickQuoteForm.get('CustomerDetail').patchValue({
      CustomerType: MotorCustomerTypeEnum.Individual,
    })

    this.ManufacturingDate.setValue(moment())
    this.VehicleNo.setValue('')
  }

  //#endregion Private methods
}
