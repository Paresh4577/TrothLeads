import { Component, ElementRef, ViewChild } from '@angular/core';

import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { Alert, IAdditionalFilterObject, IFilterRule, OrderBySpecs, QuerySpecs } from '@models/common';
import { DocumentsDto, IDocumentsDto, IMotorRaiseDTO, MotorRaiseDTO, VehicleDetails } from '@models/dtos/config/RFQMotor';
import { IVehicleDetailsDto, VehicleDetailsDto } from '@models/dtos/config/Vehicle/vehicle-details-dto';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { IVehicleBrandDto } from '@models/dtos/core/vehicleBrandDto';
import { IVehicleModelDto } from '@models/dtos/core/VehicleModelDto';
import { IVehicleSubModelDto } from '@models/dtos/core/VehicleSubModel';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { CategoryCodeEnum, SalesPersonTypeEnum, SubCategoryCodeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { dropdown } from '@config/dropdown.config';
import { DatePipe, Location } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import * as moment from 'moment';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { ICityPincodeDto } from '@models/dtos/core';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { AuthService } from '@services/auth/auth.service';
import { IUserDto } from '@models/dtos/core/userDto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { DisplayedCategoryType, RFQMotorDisplayedPolicyType, RFQMotorRenewalDisplayedPolicyType } from '@config/rfq';
import { MotorPolicyTypeEnum } from 'src/app/shared/enums/rfq-motor';
import { environment } from 'src/environments/environment';
import { DialogService } from '@lib/services/dialog.service';
import { MotorInsurancePlanService } from '../../../motor/car/quote/motor-insurance-plan/motor-insurance-plan.service';
import { RfqMotorService } from '../rfq-motor.service';
import { RFQDocumentsDrpList } from '@config/rfq';


const ActiveMasterDataRule: IFilterRule = {
  Field: 'Status',
  Operator: 'eq',
  Value: 1
}

@Component({
  selector: 'gnx-motor-raise',
  templateUrl: './motor-raise.component.html',
  styleUrls: ['./motor-raise.component.scss'],
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
export class MotorRaiseComponent {

  //Variables
  pagetitle: string; // Page main header title
  mode: string; // for identify of Raise page is create or edit
  DisplayedCategoryType = [];

  isExpand: boolean = false;

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message

  //FormGroup 
  RFQMotorForm !: FormGroup;
  destroy$: Subject<any>;

  //ENUMs
  MotorPolicyType = MotorPolicyTypeEnum

  //List objects
  Branchs: IBranchDto[] = [];
  InsuranceCompany: IInsuranceCompanyDto[];
  SubCategoryList = [];
  FilteredBrandList: IVehicleBrandDto[];
  BrandList: IVehicleBrandDto[];
  ModelList: IVehicleModelDto[];
  FilteredModelList: IVehicleModelDto[];
  SubModelList: IVehicleSubModelDto[];
  FilteredSubModelList: IVehicleSubModelDto[];
  RTOCodeList: any[];
  FilteredRTOCodeList: any[];
  pincodes$: Observable<ICityPincodeDto[]>;
  TeamRefUser$: Observable<IUserDto[]>;
  salesPersonName$: Observable<IUserDto[]> // Observable of user list
  BDOlist$: Observable<IUserDto[]>;
  BDMlist$: Observable<IUserDto[]>;
  DropdownMaster: dropdown;
  UserProfileObj: IMyProfile;
  PCRForm = new MotorRaiseDTO();

  BasicDetailsAlert: Alert[] = [];
  ProductCategoryDetailsAlert: Alert[] = [];
  AddOnDetailsAlert: Alert[] = [];
  PreviousPolicyDetailsAlert: Alert[] = [];
  TeamDetailsAlert: Alert[] = [];
  DocumentAttachmentAlert: Alert[] = [];

  BasicDetailsStepCtrl = new FormControl(); // Step 1 Control
  ProductCategoryDetailsStepCtrl = new FormControl(); // Step 2 Control
  AddOnDetailsStepCtrl = new FormControl(); // Step 3 Control
  PreviousPolicyDetailsStepCtrl = new FormControl(); // Step 4 Control
  TeamDetailsStepCtrl = new FormControl(); // Step 5 Control
  DocumentAttachmentStepCtrl = new FormControl()

  //FormControls
  VehicleNo = new FormControl('', [Validators.required]);

  // format for VehicleNo
  VehicleReg: RegExp = ValidationRegex.VehicleNumReg;
  BHRTONopattern: RegExp = ValidationRegex.BHRTONopattern;
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  MobileNoValidationReg: RegExp = ValidationRegex.phoneNumReg;

  /*
  * Dropdown Search Input Element Access
  */
  @ViewChild('BrandSearchCtrl') BrandSearch: ElementRef;
  @ViewChild('ModelSearchCtrl') ModelSearch: ElementRef;
  @ViewChild('SubModelSearchCtrl') SubModelSearch: ElementRef;
  @ViewChild('RTOSearchCtrl') RTOSearch: ElementRef;
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  /**
   * #region constructor
   * @param _fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   */
  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public dialog: MatDialog,
    public _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _MasterListService: MasterListService,
    private _motorInsuranceService: MotorInsurancePlanService,
    private _RFQService: RfqMotorService,
    private _datePipe: DatePipe,
    private authService: AuthService,
    private _dialogService: DialogService,
    private _RfqMotorService: RfqMotorService,
    private _Location: Location,
  ) {
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();


  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    // Route params data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title'];
    this.mode = data['mode'];

    if (data['data']) {
      this.PCRForm = data['data'];
      this.VehicleNo.patchValue(this.PCRForm.VehicleDetail.VehicleNumber);

      // Init Form
      this.RFQMotorForm = this._buildPCRForm(this.PCRForm);

      // List Data
      this._getSubCategoryWiseBrandList();
      this._getBrandWiseModelList()
      this._getModelWiseSubModelList()
    }
    else {
      this.PCRForm = new MotorRaiseDTO();

      // Init Form
      this.RFQMotorForm = this._buildPCRForm(this.PCRForm);
    }


    this._fillMasterList()

    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.UserProfileObj = user
      }
    })
    // Form Changes
    this._onFormChange()

    if (this.RFQMotorForm.get('SubCategoryCode')?.value == SubCategoryCodeEnum.PrivateCar ||
      this.RFQMotorForm.get('SubCategoryCode')?.value == SubCategoryCodeEnum.TwoWheeler) {
      this.DisplayedCategoryType = DisplayedCategoryType;
    }
    else {
      this.DisplayedCategoryType = DisplayedCategoryType.filter((f) => f.value != 'PAOD' && f.value != 'SAOD');
    }

    // in case of view mode then all form value is disabled mode
    if (this.mode == "view") {
      this.RFQMotorForm.disable({ emitEvent: false });
      this.VehicleNo.disable({ emitEvent: false });
      this.isExpand = true;
    }
  }

  //#endregion lifecyclehooks

  // region Getter methhod

  get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum
  }
  // get DisplayedCategoryType() {
  //   return DisplayedCategoryType
  // }
  get DisplayedPolicyType() {
    if (this.PCRForm?.TransactionId) {
      return RFQMotorRenewalDisplayedPolicyType;
    }
    else {
      return RFQMotorDisplayedPolicyType;
    }
  }

  //Documents FormArray
  get Documents() {
    return this.RFQMotorForm.get('Documents') as FormArray;
  }

  // Document Type List
  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Motor))
  }


  /**
 * Only editable in login user is standard user & Sales person type is POSP
 */
  get canEditableSalesPerson() {
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser) {
      if (this.RFQMotorForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
 * Only editable in login user is standard user & Sales person type is Direct
 */
  get canEditableBdoBdm() {
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser) {
      if (this.RFQMotorForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Branch ANd sales person is editable only in login user is Standard User
   */
  get CanEditableSalespersonTypeAndBranch() {
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser) {
      return true;
    } else {
      return false;
    }
  }

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  public nextComponent() {

    if (this.BasicDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.BasicDetailsAlert);
      return;
    }

    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
      return;
    }

    if (this.AddOnDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.AddOnDetailsAlert);
      return;
    }

    if (this.RFQMotorForm.get('PolicyType').value == this.MotorPolicyType.Rollover || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Change Company' || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Same Company') {
      if (this.PreviousPolicyDetailsAlert.length > 0) {
        this._alertservice.raiseErrors(this.PreviousPolicyDetailsAlert);
        return;
      }
    }

    if (this.TeamDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.TeamDetailsAlert);
      return;
    }

    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }

    this.RFQMotorForm.get('VehicleDetail.VehicleNumber').patchValue(this.VehicleNo.value);
    this._dateFormat();

    // submit form
    switch (this.mode) {
      case "create": case "RenewalRFQ":
        this._RfqMotorService.CreateProposal(this.RFQMotorForm.value).subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message, "false")
            this._router.navigate([ROUTING_PATH.Basic.Dashboard])
          }
          else {
            if (res.Alerts && res.Alerts?.length > 0) {
              this._alertservice.raiseErrors(res.Alerts)
            }
            else {
              this._alertservice.raiseErrorAlert(res.Message)
            }
          }
        })
        break;

      case "edit":
        this._RfqMotorService.UpdateProposal(this.RFQMotorForm.value).subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message, "false")
            this._router.navigate([ROUTING_PATH.Basic.Dashboard])
          }
          else {
            if (res.Alerts && res.Alerts?.length > 0) {
              this._alertservice.raiseErrors(res.Alerts)
            }
            else {
              this._alertservice.raiseErrorAlert(res.Message)
            }
          }
        })
        break;
    }


    // this._router.navigate([ROUTING_PATH.RFQ.MotorQNByUW])
  }

  // back button
  public backButton() {
    this._Location.back();
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
      this.filterDropDownList(value, name);
    }
    if (name == 'Model') {
      this.filterDropDownList(value, name);
    }
    if (name == 'Sub') {
      this.filterDropDownList(value, name);
    }
    if (name == 'RTO') {
      this.filterDropDownList(value, name);
    }

  }

  // filter lists as per data
  public filterDropDownList(value: string, name) {
    let filter = value?.toLowerCase();

    if (name == 'Brand') {
      if (this.BrandList && this.BrandList.length > 0) {
        this.FilteredBrandList = this.BrandList.filter((option) =>
          option.Name?.toLowerCase().includes(filter)
        );
      } else {
        this.FilteredBrandList = [];
      }
    }

    if (name == 'Model') {
      if (this.ModelList && this.ModelList.length > 0) {
        this.FilteredModelList = this.ModelList.filter((option) =>
          option.Name?.toLowerCase().includes(filter)
        );
      } else {
        this.FilteredModelList = [];
      }
    }

    if (name == 'Sub') {
      if (this.SubModelList && this.SubModelList.length > 0) {
        this.FilteredSubModelList = this.SubModelList.filter((option) =>
          option.Name?.toLowerCase().includes(filter)
        );
      } else {
        this.FilteredSubModelList = [];
      }
    }

    if (name == 'RTO') {
      if (this.RTOCodeList && this.RTOCodeList.length > 0) {
        this.FilteredRTOCodeList = this.RTOCodeList.filter((option) =>
          option.Code?.toLowerCase().includes(filter)
        );
      } else {
        this.FilteredRTOCodeList = [];
      }
    }

  }

  /**
   * When Close Mat-select Search drplist Bind Origin data In list
   * && Clear SearchCtrl Value
   * @param closeFor
   */
  public CloseDropdownEven(closeFor: string) {
    if (closeFor == 'Brand') {
      this.BrandSearch.nativeElement.value = '';
      this.filterDropDownList('', closeFor);
    }
    if (closeFor == 'Model') {
      this.ModelSearch.nativeElement.value = '';
      this.filterDropDownList('', closeFor);
    }
    if (closeFor == 'Sub') {
      this.SubModelSearch.nativeElement.value = '';
      this.filterDropDownList('', closeFor);
    }
    if (closeFor == 'RTO') {
      this.RTOSearch.nativeElement.value = '';
      this.filterDropDownList('', closeFor);
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
   * blur event for Registration No..
   * When Vehicle Type is Old blur event is triggered for Registration No.
   * Firstly VehicleNo is validated and checked if value is in correct format
   * than RTO Api is called to get Car Details
   */
  public rtoDetailsAPI(event) {
    if (event.target.value) {
      if (event.target.value?.toLowerCase() == 'new') {
      } else {
        let VehicleData: IVehicleDetailsDto = new VehicleDetailsDto();
        let error: Alert[] = this._checkvehicleNo();
        if (error.length > 0) {
          this._alertservice.raiseErrors(error);
          return;
        }
        VehicleData.VehicleNo = this._vehicleNumFormat();
        VehicleData.VehicleType = this.RFQMotorForm.get('SubCategoryName').value;
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


  public AutocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, SelectedFor: string): void {

    switch (SelectedFor) {

      case "TeamRef":
        this.RFQMotorForm.patchValue({
          TeamReferenceId: event.option.value.Id,
          TeamReferenceName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        });
        break;

      case "PINcode":
        this.RFQMotorForm.patchValue({
          PincodeId: event.option.value.Id,
          Pincode: event.option.value.PinCode,
          CityId: event.option.value.CityId,
          CityName: event.option.value.CityName
        });
        break;

      case "Sales":
        this.RFQMotorForm.patchValue({
          SalesPersonId: event.option.value.Id,
          SalesPersonName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        })
        break;

      case "BDMName":
        this.RFQMotorForm.patchValue({
          BDMName: event.option.value.FullName,
          BDMId: event.option.value.Id,
        });
        break;

      case "BDOName":
        this.RFQMotorForm.patchValue({
          BDOName: event.option.value.FullName,
          BDOId: event.option.value.Id,
        });
        break;

      default:
        break;
    }
  }

  // /* Pop Up for Name of the Insurance Company
  //  * @param type:to identify api of which list is to be called
  //   * @param title: title that will be displayed on PopUp
  //   * /
  public openDiolog(type: string, title: string, openFor: string) {
    let specs = new QuerySpecs()


    switch (openFor) {

      case "Sales":
        specs = this._salesPersonListAPIfilter();
        break;

      case "TeamRef":
        specs = this._teamReferenceListAPIfilter();
        break;

      case "BDOName":
        specs = this._bdoListAPIfilter();
        break;

      case "BDMName":
        specs = this._bdmListAPIfilter();
        break;

      default:
        break;
    }



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
      filterData: specs.FilterConditions.Rules,
      addFilterData: specs.AdditionalFilters

    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        switch (openFor) {

          case "Sales":
            this.RFQMotorForm.patchValue({
              SalesPersonId: result.Id,
              SalesPersonName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "TeamRef":
            this.RFQMotorForm.patchValue({
              TeamReferenceId: result.Id,
              TeamReferenceName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "BDMName":
            this.RFQMotorForm.patchValue({
              BDMName: result.FullName,
              BDMId: result.Id,
            });
            break;

          case "BDOName":
            this.RFQMotorForm.patchValue({
              BDOName: result.FullName,
              BDOId: result.Id,
            });
            break;

          default:
            break;
        }
      }

    })
  }

  public openDiologForPINcode(type: string, title: string) {

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
        this.RFQMotorForm.patchValue({
          PincodeId: result.Id,
          Pincode: result.PinCode,
          CityId: result.CityId,
          CityName: result.CityName
        });
      }

    });
  }

  public ClearPincode() {
    this.RFQMotorForm.patchValue({
      PincodeId: 0,
      Pincode: "",
    });
  }

  public clear(name: string, id: string): void {
    this.RFQMotorForm.controls[name].setValue("")
    this.RFQMotorForm.controls[id].setValue(null)
  }

  /**
   * Check of Non-Tariff Addons
  */
  public checkNonTariffAddOns() {


    /**
     * Vehicle category is GCV & policy type Rollover 
     * then Only check Zero depreciation
     * other wise check all Non Tariff Add On
     */
    if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.GCV
      && (this.RFQMotorForm.get('PolicyType').value == this.MotorPolicyType.Rollover || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Change Company' || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Same Company')) {
      if (this.RFQMotorForm.get('VehicleDetail.ZeroDepreciation').value == true) {
        return true;
      } else {
        return false
      }
    } else {
      if (this.RFQMotorForm.get('VehicleDetail.ZeroDepreciation').value == true &&
        this.RFQMotorForm.get('VehicleDetail.Consumable').value == true &&
        this.RFQMotorForm.get('VehicleDetail.EngineProtector').value == true &&
        this.RFQMotorForm.get('VehicleDetail.ReturnToInvoice').value == true &&
        this.RFQMotorForm.get('VehicleDetail.RoadsideAssistance').value == true &&
        this.RFQMotorForm.get('VehicleDetail.TyreCover').value == true &&
        this.RFQMotorForm.get('VehicleDetail.KeyandLockReplacement').value == true &&
        this.RFQMotorForm.get('VehicleDetail.NCBProtection').value == true &&
        this.RFQMotorForm.get('VehicleDetail.PersonalBelongings').value == true &&
        this.RFQMotorForm.get('VehicleDetail.DailyAllowance').value == true
      ) {
        return true;
      } else {
        return false;
      }
    }
  }

  /**
   * Check Tariff Addons
  */
  public checkTariffAddOns() {
    /**
     * For Private Car,
     * PCV,
     * MiscellaneousD
    */
    if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar ||
      this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PCV ||
      this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.MiscellaneousD
    ) {
      if (this.RFQMotorForm.get('VehicleDetail.PAOwnerDriver').value == true &&
        this.RFQMotorForm.get('VehicleDetail.GeographicalExtention').value == true &&
        this.RFQMotorForm.get('VehicleDetail.PAUnnamedPassenger').value == true &&
        this.RFQMotorForm.get('VehicleDetail.PAPaidDriver').value == true &&
        this.RFQMotorForm.get('VehicleDetail.RestrictedTPPD').value == true &&
        this.RFQMotorForm.get('VehicleDetail.LiabilityPaidDriver').value == true &&
        this.RFQMotorForm.get('VehicleDetail.LiabilityOtherEmployees').value == true &&
        this.RFQMotorForm.get('VehicleDetail.OtherAddOn').value == true
      ) {

        /**
         * In PCV & Roolver  Case 
         * Check IMT23 Add on
         */
        if ((this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PCV &&
          (this.RFQMotorForm.get('PolicyType').value == this.MotorPolicyType.Rollover || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Change Company' || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Same Company'))) {

          if (this.RFQMotorForm.get('VehicleDetail.IMT23').value == true) {
            return true;
          } else {
            return false
          }
        }

        /**
       *  MiscellaneousD Case 
       * Check IMT23 && IMT47 Add on
       */
        if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.MiscellaneousD) {

          if (this.RFQMotorForm.get('VehicleDetail.IMT23').value == true &&
            this.RFQMotorForm.get('VehicleDetail.IMT47').value == true) {
            return true;
          } else {
            return false
          }
        }

        return true;
      } else {
        return false;
      }
    }
    /**
     * For Two Wheeler
    */
    else if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TwoWheeler) {
      if (this.RFQMotorForm.get('VehicleDetail.PAOwnerDriver').value == true &&
        this.RFQMotorForm.get('VehicleDetail.GeographicalExtention').value == true &&
        this.RFQMotorForm.get('VehicleDetail.PAPaidDriver').value == true &&
        this.RFQMotorForm.get('VehicleDetail.PAPillionRider').value == true &&
        this.RFQMotorForm.get('VehicleDetail.OtherAddOn').value == true
      ) {
        return true;
      } else {
        return false;
      }
    }
    /**
     * For GCV
    */
    else if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.GCV) {
      if (this.RFQMotorForm.get('VehicleDetail.PAOwnerDriver').value == true &&
        this.RFQMotorForm.get('VehicleDetail.GeographicalExtention').value == true &&
        this.RFQMotorForm.get('VehicleDetail.PAUnnamedPassenger').value == true &&
        this.RFQMotorForm.get('VehicleDetail.PAPaidDriver').value == true &&
        this.RFQMotorForm.get('VehicleDetail.RestrictedTPPD').value == true &&
        this.RFQMotorForm.get('VehicleDetail.LiabilityPaidDriver').value == true &&
        this.RFQMotorForm.get('VehicleDetail.LiabilityOtherEmployees').value == true &&
        this.RFQMotorForm.get('VehicleDetail.IMT23').value == true &&
        this.RFQMotorForm.get('VehicleDetail.OtherAddOn').value == true
      ) {
        return true;
      } else {
        return false;
      }
    }
    /**
     * Default : Return false
    */
    else {
      return false;
    }
  }

  /**
   * Document Selection Change
  */
  public onDocumentSelectionChange(selectedValue): void {
    this._validateAttachDocField()

    if (this.AttachDocumentAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachDocumentAlerts)
      this.DocumentDropdown.nativeElement.value = ""
      return;
    }

    let selectedDocument = selectedValue.target.value;
    this.addDocuments(selectedDocument);
    this.DocumentDropdown.nativeElement.value = ""
  }

  /**
   * Add new row in Document array
  */
  public addDocuments(selectedDocument?: string) {
    const row: IDocumentsDto = new DocumentsDto();
    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.PolicyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.PolicyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.PolicyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = "RFQRaised";
        this.Documents.push(this._initDocumentsForm(row));
      }
    }
  }

  /**
   * File Data (policy document that is added)
  */
  public SelectDocuments(event, DocIndex: number) {
    let file = event.target.files[0]

    if (file) {
      this._dataService.UploadFile(this.UploadFileAPI, file).subscribe((res) => {
        if (res.Success) {
          if (DocIndex >= 0) {
            this.Documents.controls[DocIndex].patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: "RFQRaised"
            })
          }
          this._alertservice.raiseSuccessAlert(res.Message);
        }
        else {
          this._alertservice.raiseErrors(res.Alerts);
        }
      });
    }
  }

  /**
   * View Uploaded Document
  */
  public ViewDocuments(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  /**
   * Delete document With User Confirmation
   */
  public RemoveDocuments(index: number) {
    this._dialogService.confirmDialog({
      title: 'Are You Sure?',
      message: "You won't be able to revert this",
      confirmText: 'Yes, Delete!',
      cancelText: 'No',
    })
      .subscribe((res) => {
        if (res) {
          this.Documents.removeAt(index)
        }
      });
  }

  /**
   * Validation part 
   */

  public BasicDetailsValidations() {
    this.BasicDetailsAlert = []

    if (this.RFQMotorForm.get('SubCategoryId').value == 0 || this.RFQMotorForm.get('SubCategoryId').value == null) {
      this.BasicDetailsAlert.push({
        Message: 'Select Poduct Sub Category',
        CanDismiss: false,
        AutoClose: false,
      })
    }



    if (this.RFQMotorForm.get('PolicyType').hasError('required')) {
      this.BasicDetailsAlert.push({
        Message: 'Select Policy Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQMotorForm.get('CategoryType').hasError('required')) {
      this.BasicDetailsAlert.push({
        Message: 'Select Category Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQMotorForm.get('PolicyType').value.toLocaleLowerCase() != 'new') {
      if (this.VehicleNo.invalid) {
        this.BasicDetailsAlert.push({
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
          this.BasicDetailsAlert.push({
            Message: 'Enter Registration No. with Valid Format.',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
    }


    if (this.RFQMotorForm.get('VehicleDetail.RegistrationDate').hasError('required')) {
      this.BasicDetailsAlert.push({
        Message: 'Registration Date is required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQMotorForm.get('VehicleDetail.BrandId').value == 0 || this.RFQMotorForm.get('VehicleDetail.BrandId').value == null) {
      this.BasicDetailsAlert.push({
        Message: 'Select Manufacturer/Brand',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQMotorForm.get('VehicleDetail.ModelId').value == 0 || this.RFQMotorForm.get('VehicleDetail.ModelId').value == null) {
      this.BasicDetailsAlert.push({
        Message: 'Select Model',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQMotorForm.get('VehicleDetail.SubModelId').value == 0 || this.RFQMotorForm.get('VehicleDetail.SubModelId').value == null) {
      this.BasicDetailsAlert.push({
        Message: 'Select Sub-model',
        CanDismiss: false,
        AutoClose: false,
      })
    }


    if (this.BasicDetailsAlert.length > 0) {
      this.BasicDetailsStepCtrl.setErrors({ required: true });
      return this.BasicDetailsStepCtrl;
    }
    else {
      this.BasicDetailsStepCtrl.reset();
      return this.BasicDetailsStepCtrl;
    }

  }


  public BasicDetailsError() {
    if (this.BasicDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.BasicDetailsAlert);
      return;
    }
  }

  public ProductCategoryDetailsValidations() {
    this.ProductCategoryDetailsAlert = []

    if (this.RFQMotorForm.get('VehicleDetail.PremiumType').value != 'SATP' &&
      this.RFQMotorForm.get('VehicleDetail.PremiumType').value != 'PAOD' &&
      (this.RFQMotorForm.get('PolicyType').value != this.MotorPolicyType.Rollover && this.RFQMotorForm.get('PolicyType').value != 'Renewal-Change Company' && this.RFQMotorForm.get('PolicyType').value != 'Renewal-Same Company')) {

      if (!this.RFQMotorForm.get('SumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'IDV is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (!this.RFQMotorForm.get('PincodeId').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'PIN Code is required',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.RFQMotorForm.get('ProposerName').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Proposer Name is required.',
        CanDismiss: false,
        AutoClose: false,
      });
    }


    if (!this.RFQMotorForm.get('ProposerMobileNo').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Mobile Number is required.',
        CanDismiss: false,
        AutoClose: false,
      });
    }


    if (this.RFQMotorForm.get('ProposerMobileNo').value != '' && this.RFQMotorForm.get('ProposerMobileNo').value != null) {
      if (!this.MobileNoValidationReg.test(this.RFQMotorForm.get('ProposerMobileNo').value)) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Mobile Number must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // if (this.RFQMotorForm.get('ProposerEmail').value == '') {
    //   this.ProductCategoryDetailsAlert.push({
    //     Message: 'Email ID is required.',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }

    if (this.RFQMotorForm.get('ProposerEmail').value) {
      if (
        !this.emailValidationReg.test(
          this.RFQMotorForm.get('ProposerEmail').value
        )
      ) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Enter Valid Email ID',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (!this.RFQMotorForm.get('VehicleDetail.PremiumType').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Premium Type is required.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.GCV) {

      if (this.RFQMotorForm.get('VehicleDetail.GrossVehicleWeight').value == null ||
        this.RFQMotorForm.get('VehicleDetail.GrossVehicleWeight').value.toString() == "" ||
        parseInt(this.RFQMotorForm.get('VehicleDetail.GrossVehicleWeight').value) < 0) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Gross Vehicle Weight (KG) is required.',
          CanDismiss: false,
          AutoClose: false,
        });
      }

    }



    if (this.ProductCategoryDetailsAlert.length > 0) {
      this.ProductCategoryDetailsStepCtrl.setErrors({ required: true });
      return this.ProductCategoryDetailsStepCtrl;
    }
    else {
      this.ProductCategoryDetailsStepCtrl.reset();
      return this.ProductCategoryDetailsStepCtrl;
    }

  }


  public ProductCategoryDetailsError() {
    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
      return;
    }
  }
  public AddOnDetailsValidations() {
    this.AddOnDetailsAlert = []
    if (this.RFQMotorForm.get('VehicleDetail.InsureAddons').value) {

      if (
        this.RFQMotorForm.get('VehicleDetail.ZeroDepreciation').value == false &&
        this.RFQMotorForm.get('VehicleDetail.Consumable').value == false &&
        this.RFQMotorForm.get('VehicleDetail.EngineProtector').value == false &&
        this.RFQMotorForm.get('VehicleDetail.ReturnToInvoice').value == false &&
        this.RFQMotorForm.get('VehicleDetail.RoadsideAssistance').value == false &&
        this.RFQMotorForm.get('VehicleDetail.TyreCover').value == false &&
        this.RFQMotorForm.get('VehicleDetail.KeyandLockReplacement').value == false &&
        this.RFQMotorForm.get('VehicleDetail.NCBProtection').value == false &&
        this.RFQMotorForm.get('VehicleDetail.PersonalBelongings').value == false &&
        this.RFQMotorForm.get('VehicleDetail.DailyAllowance').value == false &&
        this.RFQMotorForm.get('VehicleDetail.PAOwnerDriver').value == false &&
        this.RFQMotorForm.get('VehicleDetail.GeographicalExtention').value == false &&
        this.RFQMotorForm.get('VehicleDetail.PAUnnamedPassenger').value == false &&
        this.RFQMotorForm.get('VehicleDetail.PAPaidDriver').value == false &&
        this.RFQMotorForm.get('VehicleDetail.RestrictedTPPD').value == false &&
        this.RFQMotorForm.get('VehicleDetail.LiabilityPaidDriver').value == false &&
        this.RFQMotorForm.get('VehicleDetail.LiabilityOtherEmployees').value == false &&
        this.RFQMotorForm.get('VehicleDetail.PAPillionRider').value == false &&
        this.RFQMotorForm.get('VehicleDetail.IMT23').value == false &&
        this.RFQMotorForm.get('VehicleDetail.OtherAddOn').value == false
      ) {
        this.AddOnDetailsAlert.push({
          Message: 'At Least one Add-on is required.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.AddOnDetailsAlert.length > 0) {
      this.AddOnDetailsStepCtrl.setErrors({ required: true });
      return this.AddOnDetailsStepCtrl;
    }
    else {
      this.AddOnDetailsStepCtrl.reset();
      return this.AddOnDetailsStepCtrl;
    }

  }


  public AddOnDetailsError() {
    if (this.AddOnDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.AddOnDetailsAlert);
      return;
    }
  }

  public PreviousPolicyDetailsValidations() {
    this.PreviousPolicyDetailsAlert = []

    if (this.RFQMotorForm.get('PolicyType').value == this.MotorPolicyType.Rollover || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Change Company' || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Same Company') {
      if (!this.RFQMotorForm.get('PrevPolicyInsurComp').value) {
        this.PreviousPolicyDetailsAlert.push({
          Message: 'Select Previous Insurance Company.',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      // if (!this.RFQMotorForm.get('PrevPolicyType').value) {
      //   this.PreviousPolicyDetailsAlert.push({
      //     Message: 'Previous Policy Type is Required.',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   });
      // }

      // if (!this.RFQMotorForm.get('PreviousPolicyStartDate').value) {
      //   this.PreviousPolicyDetailsAlert.push({
      //     Message: 'Previous Policy StartDate is Required.',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   });
      // }

      // if (!this.RFQMotorForm.get('PreviousPolicyEndDate').value) {
      //   this.PreviousPolicyDetailsAlert.push({
      //     Message: 'Previous Policy EndDate is Required.',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   });
      // } else {
      //   if (this.RFQMotorForm.get('PreviousPolicyStartDate').value > this.RFQMotorForm.get('PreviousPolicyEndDate').value) {
      //     this.PreviousPolicyDetailsAlert.push({
      //       Message: 'Enter valid Previous Policy EndDate.',
      //       CanDismiss: false,
      //       AutoClose: false,
      //     });
      //   }
      // }

      // if (this.RFQMotorForm.get('PrevPolicyType').value == '1 OD + 3 TP' || this.RFQMotorForm.get('PrevPolicyType').value == '1 OD + 5 TP') {

      //   if (!this.RFQMotorForm.get('PrevPolicyTPStartDate').value) {
      //     this.PreviousPolicyDetailsAlert.push({
      //       Message: `Policy TP Start Date is required.`,
      //       CanDismiss: false,
      //       AutoClose: false,
      //     })
      //   }
      //   if (!this.RFQMotorForm.get('PrevPolicyTPEndDate').value) {
      //     this.PreviousPolicyDetailsAlert.push({
      //       Message: `Policy TP End Date is required.`,
      //       CanDismiss: false,
      //       AutoClose: false,
      //     })
      //   } else {
      //     if (this.RFQMotorForm.get('PrevPolicyTPStartDate').value > this.RFQMotorForm.get('PrevPolicyTPEndDate').value) {
      //       this.PreviousPolicyDetailsAlert.push({
      //         Message: 'Enter valid  Policy TP EndDate.',
      //         CanDismiss: false,
      //         AutoClose: false,
      //       });
      //     }
      //   }
      // }

      // if (!this.RFQMotorForm.get('PrevPolicySumInsured').value) {
      //   this.PreviousPolicyDetailsAlert.push({
      //     Message: 'Previous Policy IDV is Required.',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   });
      // }

      // if (!this.RFQMotorForm.get('PreviousPolicyPremium').value) {
      //   this.PreviousPolicyDetailsAlert.push({
      //     Message: 'Previous Policy Premium is Required.',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   });
      // }
    }

    if (this.PreviousPolicyDetailsAlert.length > 0) {
      this.PreviousPolicyDetailsStepCtrl.setErrors({ required: true });
      return this.PreviousPolicyDetailsStepCtrl;
    }
    else {
      this.PreviousPolicyDetailsStepCtrl.reset();
      return this.PreviousPolicyDetailsStepCtrl;
    }

  }


  public PreviousPolicyDetailsError() {
    if (this.PreviousPolicyDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.PreviousPolicyDetailsAlert);
      return;
    }
  }


  public TeamDetailsValidation() {
    this.TeamDetailsAlert = []

    if (!this.RFQMotorForm.get('BranchId').value) {
      this.TeamDetailsAlert.push({
        Message: 'Branch is Required.',
        CanDismiss: false,
        AutoClose: false,
      });
    }



    if (this.RFQMotorForm.get("SalesPersonType").value == "POSP" || this.RFQMotorForm.get("SalesPersonType").value == "Direct") {
      if (!this.RFQMotorForm.get('SalesPersonId').value) {
        this.TeamDetailsAlert.push({
          Message: 'Sales person is Required.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.RFQMotorForm.get("SalesPersonType").value == "Team Reference") {
      if (!this.RFQMotorForm.get('TeamReferenceId').value) {
        this.TeamDetailsAlert.push({
          Message: 'Team Reference is Required.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.TeamDetailsAlert.length > 0) {
      this.TeamDetailsStepCtrl.setErrors({ required: true });
      return this.TeamDetailsStepCtrl;
    }
    else {
      this.TeamDetailsStepCtrl.reset();
      return this.TeamDetailsStepCtrl;
    }

  }

  public TeamDetailsError() {
    if (this.TeamDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.TeamDetailsAlert);
      return;
    }
  }

  public DocumentAttachmentValidation() {
    this.DocumentAttachmentAlert = []


    this.Documents.controls.forEach((item, index) => {
      if (item.get('FileName').hasError('required') || item.get('StorageFilePath').hasError('required')) {
        this.DocumentAttachmentAlert.push({
          Message: `${item.value.DocumentTypeName} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

    })

    if (this.DocumentAttachmentAlert.length > 0) {
      this.DocumentAttachmentStepCtrl.setErrors({ required: true });
      return this.DocumentAttachmentStepCtrl;
    }
    else {
      this.DocumentAttachmentStepCtrl.reset();
      return this.DocumentAttachmentStepCtrl;
    }

  }


  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }


  /**
 * to have value of Registration No. in upper case and append ' - '
 */
  public rtoCodeFormating(event: KeyboardEvent) {

    // this.VehicleNo.patchValue(event.target.value.toUpperCase())
    let No: string = (event.target as HTMLInputElement).value.trim().toUpperCase();
    if (No.length == 2) {
      No += '-'; // Alpha in RTO No may be single or double
    }
    (event.target as HTMLInputElement).value = No
  }

  /**
 * When Convert Transaction TO RFQ All Attachments are get
 * Display documents As Per category wise 
 */
  public canDisplayDocuments(DocumentType: string): boolean {
    if (this.mode == 'RenewalRFQ' && this.PCRForm && this.PCRForm?.TransactionId) {
      let CategoryWiseDocument = this.PolicyDocumentList.map(doc => doc.DocumentType)
      if (CategoryWiseDocument.includes(DocumentType)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }


  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------


  // Init  Selected policy Person Existing Illness Detail Form
  private _buildPCRForm(data: IMotorRaiseDTO): FormGroup {

    let _pcrForm = this.fb.group({
      Id: [0],
      TransactionId: [0],
      CategoryId: [0],
      CategoryName: [''],
      SubCategoryId: [0],
      SubCategoryCode: [''],
      SubCategoryName: [''],
      RFQDate: [''],
      RFQNo: [''],
      PolicyType: ['', [Validators.required]],
      Deductible: [],
      CategoryType: ['', [Validators.required]],
      PolicyPeriod: [1],
      SumInsured: [0],
      OtherSumInsured: [],
      PincodeId: [0],
      Pincode: [''],
      CityId: [0],
      CityName: [''],
      ProposerName: [''],
      ProposerMobileNo: [''],
      ProposerEmail: [''],
      PrevPolicyInsurComp: [''],
      PrevPolicyType: [],
      ClaimInPreviousYear: [],
      PrevPolicySumInsured: [],
      PreviousPolicyPremium: [],
      PreviousPolicyStartDate: [''],
      PreviousPolicyEndDate: [''],
      PrevPolicyTPStartDate: [],
      PrevPolicyTPEndDate: [],
      PrevPolicyCNGLPG: [],
      BranchId: [0],
      BranchName: [''],
      SalesPersonType: [''],
      SalesPersonId: [],
      SalesPersonName: [''],
      BDOName: [],
      BDOId: [],
      BDMId: [],
      BDMName: [],
      TeamReferenceId: [],
      TeamReferenceName: [''],
      PrevPolicyPeriod: [0],
      Documents: this._buildDocumentsForm(data.Documents),
      VehicleDetail: this._buildVechileDetails(data.VehicleDetail),
      Additionalinformation: [''],
      SendBackRejectDesc: [''],
    });

    if (data != null) {
      if (!data) {
        data = new MotorRaiseDTO();
      }
      if (data) {
        _pcrForm.patchValue(data);
      }
    }

    return _pcrForm;
  }

  //RFQ-health document Formarray
  private _buildDocumentsForm(items: IDocumentsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initDocumentsForm(i));
        });
      }
    }
    return formArray;
  }
  //Init document formgroup
  private _initDocumentsForm(item: IDocumentsDto): FormGroup {

    let dF = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentNo: [''],
      DocumentType: [''],
      DocumentTypeName: [''],
      FileName: ['', [Validators.required, this.noWhitespaceValidator]],
      StorageFileName: [''],
      StorageFilePath: ['', [Validators.required, this.noWhitespaceValidator]],
      ImageUploadName: [''],
      ImageUploadPath: [''],
      Description: [''],
      Stage: [''],
    })

    if (item != null) {
      if (!item) {
        item = new DocumentsDto();
      }
      if (item) {
        dF.patchValue(item);
      }
    }

    return dF
  }

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  private _buildVechileDetails(data): FormGroup {

    let VechicleDetailsForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      SubModelId: [0],
      SubModelName: [''],
      ModelId: [0],
      ModelName: [''],
      BrandId: [0],
      BrandName: [''],
      VehicleType: [''],
      FuelType: [''],
      BreakinPeriod: [''],
      VehicleNumber: [''],
      ManufacturingYear: [''],
      RegistrationDate: [''],
      RTOCode: [''],
      EngineNumber: [''],
      ChasisNumber: [''],
      CNGKitValue: [],
      ElectricalAccessoriesValue: [],
      NonElectricalAccessoriesValue: [],
      PrevPolicyCNGLPG: [],
      IDV: [],
      PremiumType: [''],
      AnyClaiminPreviousYear: [false],
      VehicleAge: [''],
      Usage: [''],
      RegistrationType: [''],
      ContractPeriod: [''],
      TaxiAgency: [''],
      VehicleClass: [''],
      CubicCapacityORKW: [],
      PassengerCapacity: [],
      GrossVehicleWeight: [],
      ClaiminPreviousYear: [],
      FleetBusinessName: [''],
      BreakInPeriodDays: [''],
      InsureAddons: [false],          //Added by Yash
      NonTariffAddOns: [false],       //Added by Yash
      TariffAddOns: [false],          //Added by Yash
      PersonalAccident: [false],
      ZeroDepreciation: [false],
      Consumable: [false],
      EngineProtector: [false],
      ReturnToInvoice: [false],
      RoadsideAssistance: [false],
      TyreCover: [false],
      KeyandLockReplacement: [false],
      NCBProtection: [false],
      PersonalBelongings: [false],
      DailyAllowance: [false],
      PAOwnerDriver: [false],
      GeographicalExtention: [false],
      PAUnnamedPassenger: [false],
      PAPaidDriver: [false],
      RestrictedTPPD: [false],
      LiabilityPaidDriver: [false],
      LiabilityOtherEmployees: [false],
      PAPillionRider: [false],
      IMT23: [false],
      IMT47: [false],
      OtherAddOn: [false],
      OtherAddonDesc: [''],
    })

    if (data != null) {
      if (!data) {
        data = new VehicleDetails();
      }
      if (data) {
        VechicleDetailsForm.patchValue(data);
      }
    }

    return VechicleDetailsForm;

  }

  // form changes 
  private _onFormChange() {

    // changes product type
    this.RFQMotorForm.get('SubCategoryId').valueChanges.subscribe(val => {

      let SelectedSubCategory = this.SubCategoryList.find(cat => cat.Id == val)
      if (SelectedSubCategory) {
        this.RFQMotorForm.patchValue({
          SubCategoryName: SelectedSubCategory.Name,
          SubCategoryCode: SelectedSubCategory.Code
        })
      } else {
        this.RFQMotorForm.patchValue({
          SubCategoryName: "",
          SubCategoryCode: ""
        })
      }

      if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar ||
        this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TwoWheeler) {
        this.DisplayedCategoryType = DisplayedCategoryType;
      }
      else {
        this.DisplayedCategoryType = DisplayedCategoryType.filter((f) => f.value != 'PAOD' && f.value != 'SAOD');
      }

      this._getSubCategoryWiseBrandList()

      if (this.RFQMotorForm.get('PolicyType').value == 'New') {
        if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar) {
          this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 3 TP')
        }
        else if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TwoWheeler) {
          this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 5 TP')
        } else {
          this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('')
        }



      } else {
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('')

        if (this.RFQMotorForm.get('CategoryType').value == 'Comprehensive' &&
          this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TwoWheeler &&
          this.RFQMotorForm.get('PolicyType').value != 'New') {
          this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 1 TP')
        }

        if (this.RFQMotorForm.get('CategoryType').value == 'Comprehensive' &&
          this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar &&
          this.RFQMotorForm.get('PolicyType').value != 'New') {
          this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 1 TP')
        }

        if (this.RFQMotorForm.get('CategoryType').value == 'Comprehensive' &&
          (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.MiscellaneousD ||
            this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PCV ||
            this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.GCV)
        ) {
          this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 1 TP')
        }
      }

      if (this.RFQMotorForm.get('CategoryType').value == 'ThirdParty') {
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('SATP')
      }


      if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar &&
        (this.RFQMotorForm.get('PolicyType').value == 'Rollover' || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Change Company' || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Same Company')) {
        this.RFQMotorForm.get('VehicleDetail.InsureAddons').patchValue(true)
      }

    })

    // changes Policy type
    this.RFQMotorForm.get('PolicyType').valueChanges.subscribe(val => {

      if (val == 'New') {
        this.VehicleNo.patchValue('New');
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('')
        if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar) {
          this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 3 TP')
        }
        else if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TwoWheeler
          && this.RFQMotorForm.get('CategoryType').value == 'Comprehensive') {
          this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 5 TP')
        } else {
          this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('')
        }
      } else {
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('')
        this.VehicleNo.patchValue('');

        if (this.RFQMotorForm.get('CategoryType').value == 'Comprehensive' &&
          this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TwoWheeler &&
          this.RFQMotorForm.get('PolicyType').value != 'New') {
          this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 1 TP')
        }

        if (this.RFQMotorForm.get('CategoryType').value == 'Comprehensive' &&
          this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar &&
          this.RFQMotorForm.get('PolicyType').value != 'New') {
          this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 1 TP')
        }
      }

      if (this.RFQMotorForm.get('CategoryType').value == 'ThirdParty') {
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('SATP')
      }

      if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar &&
        (this.RFQMotorForm.get('PolicyType').value == 'Rollover' || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Change Company' || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Same Company')) {
        this.RFQMotorForm.get('VehicleDetail.InsureAddons').patchValue(true)
      }

      if (val == this.MotorPolicyType.Rollover || val == 'Renewal-Change Company' || val == 'Renewal-Same Company') {
        this.RFQMotorForm.patchValue({
          SumInsured: 0,
        })
      }

      this.RFQMotorForm.get('VehicleDetail.AnyClaiminPreviousYear').patchValue(false)
    })


    // changes Policy type
    this.RFQMotorForm.get('CategoryType').valueChanges.subscribe(val => {

      if (this.RFQMotorForm.get('CategoryType').value == 'ThirdParty') {
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('SATP')
      } else if (val == 'SAOD') {
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('SAOD')
      } else if (val == 'PAOD') {
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('PAOD')
      } else if (val == 'Comprehensive' && this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar &&
        this.RFQMotorForm.get('PolicyType').value == 'New') {
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 3 TP')
      }
      else if (val == 'Comprehensive' && (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TwoWheeler ||
        this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar) &&
        this.RFQMotorForm.get('PolicyType').value != 'New') {
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 1 TP')
      }

      else if (this.RFQMotorForm.get('CategoryType').value == 'Comprehensive' &&
        this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TwoWheeler &&
        this.RFQMotorForm.get('PolicyType').value == 'New') {
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 5 TP')
      }

      else if (this.RFQMotorForm.get('CategoryType').value == 'Comprehensive' &&
        this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar &&
        this.RFQMotorForm.get('PolicyType').value == 'New') {
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 3 TP')
      }

      else if (this.RFQMotorForm.get('CategoryType').value == 'Comprehensive' &&
        (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.MiscellaneousD ||
          this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PCV ||
          this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.GCV)
      ) {
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('1 OD + 1 TP')
      }

      else {
        this.RFQMotorForm.get('VehicleDetail.PremiumType').patchValue('')
      }
    })


    this.RFQMotorForm.get('VehicleDetail.BrandId').valueChanges.subscribe(val => {
      let SelectedBrand = this.BrandList?.find(brand => brand.Id == val)

      if (SelectedBrand) {
        this.RFQMotorForm.get('VehicleDetail').patchValue({
          BrandName: SelectedBrand.Name
        })
        this._getBrandWiseModelList()
      } else {
        this.RFQMotorForm.get('VehicleDetail').patchValue({
          BrandName: ""
        })

        this.BrandList = []
        this.FilteredBrandList = []
      }

      this.RFQMotorForm.get('VehicleDetail').patchValue({
        ModelId: 0,
        ModelName: "",
        SubModelId: 0,
        SubModelName: ""
      }, { emitEvent: false })
    })

    this.RFQMotorForm.get('VehicleDetail.ModelId').valueChanges.subscribe(val => {

      let SelectedModel = this.ModelList?.find(model => model.Id == val)
      if (SelectedModel) {
        this.RFQMotorForm.get('VehicleDetail').patchValue({
          ModelName: SelectedModel.Name
        })
        this._getModelWiseSubModelList()
      } else {
        this.RFQMotorForm.get('VehicleDetail').patchValue({
          ModelName: ""
        })
        this.ModelList = []
        this.FilteredModelList = []
      }

      this.RFQMotorForm.get('VehicleDetail').patchValue({
        SubModelId: 0,
        SubModelName: ""
      }, { emitEvent: false })
    })


    this.RFQMotorForm.get('VehicleDetail.SubModelId').valueChanges.subscribe(val => {
      let SelectedSubModel = this.SubModelList?.find(submodel => submodel.Id == val)
      if (SelectedSubModel) {
        this.RFQMotorForm.get('VehicleDetail').patchValue({
          SubModelName: SelectedSubModel.Name,
          FuelType: SelectedSubModel.FuelType,
          CubicCapacityORKW: SelectedSubModel.CC,
          PassengerCapacity: SelectedSubModel.SeatCapacity,
        })
      } else {
        this.RFQMotorForm.get('VehicleDetail').patchValue({
          SubModelName: "",
          FuelType: '',
          CubicCapacityORKW: null,
          PassengerCapacity: null,
        })
        this.SubModelList = []
        this.FilteredSubModelList = []
      }

      this.RFQMotorForm.get('VehicleDetail').patchValue({
        SubModelName: ""
      }, { emitEvent: false })
    })

    this.RFQMotorForm.get('VehicleDetail.RegistrationDate').valueChanges.subscribe(val => {
      this._calVehicleAge()
    })

    this.RFQMotorForm.get('VehicleDetail.PremiumType').valueChanges.subscribe(val => {
      if (val == 'PAOD' || val == 'SATP') {
        this.RFQMotorForm.get('VehicleDetail').patchValue({
          CNGKitValue: null,
          ElectricalAccessoriesValue: null,
          NonElectricalAccessoriesValue: null,
        })
        this.RFQMotorForm.patchValue({
          SumInsured: 0,
        })
      }
    })

    this.RFQMotorForm.get('Pincode').valueChanges.subscribe((val) => {
      this.pincodes$ = this._MasterListService.getFilteredPincodeList(val).pipe(
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

    this.RFQMotorForm.get('BranchId').valueChanges.subscribe((val) => {
      this._TeamDetailsForStandardUser()
    })

    this.RFQMotorForm.get('SalesPersonType').valueChanges.subscribe((val) => {
      this._TeamDetailsForStandardUser()
    })


    this.RFQMotorForm.get('TeamReferenceId').valueChanges.subscribe(
      (val) => {
        if (!val && this.UserProfileObj.UserType == UserTypeEnum.StandardUser && this.RFQMotorForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {
          this.RFQMotorForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );


    this.RFQMotorForm.get('SalesPersonId').valueChanges.subscribe(
      (val) => {
        if (!val && this.UserProfileObj.UserType == UserTypeEnum.StandardUser && this.RFQMotorForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
          this.RFQMotorForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );

    // change sales person
    this.RFQMotorForm.get('SalesPersonName').valueChanges.subscribe((val) => {
      let salesPersonListSpecs = this._salesPersonListAPIfilter();
      salesPersonListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })


      this.salesPersonName$ = this._MasterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", salesPersonListSpecs.FilterConditions.Rules,salesPersonListSpecs.AdditionalFilters)
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

    // change Team Referance
    this.RFQMotorForm.get('TeamReferenceName').valueChanges.subscribe(
      (val) => {

        let teamReferenceListSpecs = this._teamReferenceListAPIfilter();
        teamReferenceListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })

        this.TeamRefUser$ = this._MasterListService
          .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", teamReferenceListSpecs.FilterConditions.Rules,teamReferenceListSpecs.AdditionalFilters)
          .pipe(
            takeUntil(this.destroy$),
            switchMap((res) => {
              if (res.Success) {
                if (res.Data.Items) {
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


    this.RFQMotorForm.get('BDOName').valueChanges.subscribe((val) => {
      let bdoListSpecs = this._bdoListAPIfilter()
      bdoListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })
      
      this.BDOlist$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', bdoListSpecs.FilterConditions.Rules,bdoListSpecs.AdditionalFilters).pipe(
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

    this.RFQMotorForm.get('BDMName').valueChanges.subscribe((val) => {
      let bdmListSpecs = this._bdmListAPIfilter()
      bdmListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })

      this.BDMlist$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', bdmListSpecs.FilterConditions.Rules,bdmListSpecs.AdditionalFilters).pipe(
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


    //On Change in Non-Tariff AddOns value
    this.RFQMotorForm.get('VehicleDetail.NonTariffAddOns').valueChanges.subscribe((res) => {
      /**
    * Vehicle category is GCV & policy type Rollover 
    * then Only check Zero depreciation
    * other wise check all Non Tariff Add On
    */
      if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.GCV
        && (this.RFQMotorForm.get('PolicyType').value == this.MotorPolicyType.Rollover || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Change Company' || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Same Company')) {
        this.RFQMotorForm.get('VehicleDetail').patchValue({
          ZeroDepreciation: res,
        }, { emitEvent: false });
      } else {
        this.RFQMotorForm.get('VehicleDetail').patchValue({
          ZeroDepreciation: res,
          Consumable: res,
          EngineProtector: res,
          ReturnToInvoice: res,
          RoadsideAssistance: res,
          TyreCover: res,
          KeyandLockReplacement: res,
          NCBProtection: res,
          PersonalBelongings: res,
          DailyAllowance: res,
        }, { emitEvent: false });
      }

    })

    //On Change in Tariff AddOns value
    this.RFQMotorForm.get('VehicleDetail.TariffAddOns').valueChanges.subscribe((res) => {

      if (!this.RFQMotorForm.get('SubCategoryCode').value) {
        this._alertservice.raiseErrorAlert("Please Select Vehicle Category", true);
      }

      if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar ||
        this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PCV ||
        this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.MiscellaneousD
      ) {
        this.RFQMotorForm.get('VehicleDetail').patchValue({
          PAOwnerDriver: res,
          GeographicalExtention: res,
          PAUnnamedPassenger: res,
          PAPaidDriver: res,
          RestrictedTPPD: res,
          LiabilityPaidDriver: res,
          LiabilityOtherEmployees: res,
          OtherAddOn: res,
          OtherAddonDesc: '',
        }, { emitEvent: false });

        /**
          * In PCV & Roolver  Case 
          * Check IMT23 Add on
          */
        if ((this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PCV &&
          (this.RFQMotorForm.get('PolicyType').value == this.MotorPolicyType.Rollover || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Change Company' || this.RFQMotorForm.get('PolicyType').value == 'Renewal-Same Company'))) {

          this.RFQMotorForm.get('VehicleDetail').patchValue({
            IMT23: res
          }, { emitEvent: false });
        }

        /**
       *  MiscellaneousD Case 
       * Check IMT23 && IMT47 Add on
       */
        if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.MiscellaneousD) {
          this.RFQMotorForm.get('VehicleDetail').patchValue({
            IMT23: res,
            IMT47: res
          }, { emitEvent: false });
        }

      }
      else if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TwoWheeler) {
        this.RFQMotorForm.get('VehicleDetail').patchValue({
          PAOwnerDriver: res,
          GeographicalExtention: res,
          PAPillionRider: res,
          PAPaidDriver: res,
          OtherAddOn: res,
          OtherAddonDesc: "",
        }, { emitEvent: false });
      }
      else if (this.RFQMotorForm.get('SubCategoryCode').value == SubCategoryCodeEnum.GCV) {
        this.RFQMotorForm.get('VehicleDetail').patchValue({
          PAOwnerDriver: res,
          GeographicalExtention: res,
          PAUnnamedPassenger: res,
          PAPaidDriver: res,
          RestrictedTPPD: res,
          LiabilityPaidDriver: res,
          LiabilityOtherEmployees: res,
          IMT23: res,
          OtherAddOn: res,
          OtherAddonDesc: "",
        }, { emitEvent: false });
      }

    })

    // Insure AddOns value change, make all checkbox unchecked
    this.RFQMotorForm.get('VehicleDetail.InsureAddons').valueChanges.subscribe((res) => {

      this.RFQMotorForm.get('VehicleDetail').patchValue({
        NonTariffAddOns: false,
        TariffAddOns: false,
        PersonalAccident: false,
        ZeroDepreciation: false,
        Consumable: false,
        EngineProtector: false,
        ReturnToInvoice: false,
        RoadsideAssistance: false,
        TyreCover: false,
        KeyandLockReplacement: false,
        NCBProtection: false,
        PersonalBelongings: false,
        DailyAllowance: false,
        PAOwnerDriver: false,
        GeographicalExtention: false,
        PAUnnamedPassenger: false,
        PAPaidDriver: false,
        RestrictedTPPD: false,
        LiabilityPaidDriver: false,
        LiabilityOtherEmployees: false,
        PAPillionRider: false,
        IMT23: false,
        OtherAddOn: false
      }, { emitEvent: false });
    })

    // Insure AddOns value change, make all checkbox unchecked
    this.RFQMotorForm.get('PreviousPolicyStartDate').valueChanges.subscribe((res) => {
      let StartDate = this._datePipe.transform(this.RFQMotorForm.get('PreviousPolicyStartDate').value, 'yyyy-MM-dd');
      let endDate = new Date(StartDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // add year
      endDate.setDate(endDate.getDate() - 1);  // one day les
      this.RFQMotorForm.get('PreviousPolicyEndDate').patchValue(endDate);

      let PremiumType = this.RFQMotorForm.get('PrevPolicyType').value;


      if (PremiumType == '1 OD + 3 TP' || PremiumType == '1 OD + 5 TP') {
        this.RFQMotorForm.get('PrevPolicyTPStartDate').patchValue(StartDate);
      }
    })

    // Insure AddOns value change, make all checkbox unchecked
    this.RFQMotorForm.get('PreviousPolicyEndDate').valueChanges.subscribe((res) => {
      let EndDate = this._datePipe.transform(this.RFQMotorForm.get('PreviousPolicyEndDate').value, 'yyyy-MM-dd');
      let CurrentDate = this._datePipe.transform(new Date(), 'yyyy-MM-dd');
      let difference = moment(EndDate).diff(CurrentDate, 'days');

      if (difference > 90) {
        this.RFQMotorForm.get('VehicleDetail.BreakInPeriodDays').patchValue('>90');
        return;
      }
      if (difference <= 90) {
        this.RFQMotorForm.get('VehicleDetail.BreakInPeriodDays').patchValue('<=90');
        return;
      }


    })

    this.RFQMotorForm.get('PrevPolicyTPStartDate').valueChanges.subscribe((val) => {
      if (this.RFQMotorForm.get('PrevPolicyTPStartDate').value) {
        let TPStartDate = this._datePipe.transform(this.RFQMotorForm.get('PrevPolicyTPStartDate').value, 'yyyy-MM-dd');
        let tPEndDate = new Date(TPStartDate);

        let PremiumType = this.RFQMotorForm.get('PrevPolicyType').value;
        let TP: number = 0;
        if (PremiumType == '1 OD + 1 TP') {
          TP = 1;
        }
        if (PremiumType == '1 OD + 3 TP') {
          TP = 3;
        }
        if (PremiumType == '1 OD + 5 TP') {
          TP = 5;
        }

        tPEndDate.setFullYear(tPEndDate.getFullYear() + TP); // add year
        tPEndDate.setDate(tPEndDate.getDate() - 1);  // one day les
        this.RFQMotorForm.patchValue({
          PrevPolicyTPEndDate: tPEndDate
        });
      }
    })

    /**
     * Policy Type Valuechanges
     * 'Previous Policy' under attachment Documents made mandatory
    */
    // this.RFQMotorForm.get('PolicyType').valueChanges.subscribe((res) => {
      // let selectedDocument = 'PrevPolicy';

      // if (this.Documents.value.length != 0) {
      //   let selectedDoctypeIndex = this.Documents.value.findIndex((f) => f.DocumentType == selectedDocument);

      //   if (selectedDoctypeIndex != -1) {
      //     this.Documents.removeAt(selectedDoctypeIndex);
      //   }
      // }

      // if (res == this.MotorPolicyType.Rollover || res == 'Renewal-Change Company' || res == 'Renewal-Same Company') {
      //   this.addDocuments(selectedDocument);
      //   this.DocumentDropdown.nativeElement.value = " "
      // }
    // })

  }

  private _fillMasterList() {

    // fill Product Type
    let SubCategoryRule: IFilterRule[] = [ActiveMasterDataRule,
      {
        Field: "Category.Code",
        Operator: "eq",
        Value: CategoryCodeEnum.Motor
      }
    ]

    let OrderBySpecs: OrderBySpecs[] = [
      {
        field: "SrNo",
        direction: "asc"
      }
    ]

    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.SubCategory.List, 'Name', '', SubCategoryRule, [], OrderBySpecs)
      .subscribe(res => {
        if (res.Success) {
          this.SubCategoryList = res.Data.Items
        }
      })


    let RTOrule: IFilterRule[] = [ActiveMasterDataRule];

    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.RTO.List, 'Code', "", RTOrule)
      .pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.RTOCodeList = res.Data.Items;
            this.FilteredRTOCodeList = res.Data.Items;
          } else {
            this.RTOCodeList = [];
            this.FilteredRTOCodeList = []
          }
        } else {
          this.RTOCodeList = [];
          this.FilteredRTOCodeList = []
        }
      })

    // fill Branch
    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List + "/true", 'Name', "", [ActiveMasterDataRule])
      .subscribe(res => {
        if (res.Success) {
          this.Branchs = res.Data.Items

          /**
           * After Get Branch list Fill Team details 
           */
          if (this.mode == 'create') {
            this._TeamDetailsInfo()
          }
        }
      });


    // Fill Insurance Company
    let InsuranceCompanyRule: IFilterRule[] = [
      {
        Field: 'Status',
        Operator: 'eq',
        Value: 1,
      }
    ];

    let InsuranceCompanyAdditionalFilters: IAdditionalFilterObject[] = [
      { key: "CatagoryCode", filterValues: [CategoryCodeEnum.Motor] }
    ]

    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.InsuranceCompany.list, 'Name', "", InsuranceCompanyRule, InsuranceCompanyAdditionalFilters)
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.InsuranceCompany = res.Data.Items;
          } else {
            this.InsuranceCompany = [];
          }
        } else {
          this.InsuranceCompany = [];
        }
      })



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

  /**
 * patch the data of car details that are obtained in response
 * @param result : response of API (RTo data api)
 */
  private _carDetails(result) {

    this.RFQMotorForm.get('VehicleDetail').patchValue({
      SubModelId: result.Data.VehicleSubModelId,
      SubModelName: result.Data.VehicleSubModel,
      ModelId: result.Data.VehicleModelId,
      ModelName: result.Data.VehicleModel,
      BrandId: result.Data.VehicleBrandId,
      BrandName: result.Data.VehicleBrand,
      FuelType: result.Data.FuelType,
      RTOCode: result.Data.RTOData.RTOCode,
      RegistrationDate: result.Data.RTOData.RegistrationDate,
      CubicCapacityORKW: result.Data.CC,
      PassengerCapacity: result.Data.RTOData.SeatCapacity
    }, { emitEvent: false });

    this.RFQMotorForm.patchValue({
      ProposerName: result.Data.RTOData.Owner,
    }, { emitEvent: false });

    this._getBrandWiseModelList()
    this._getModelWiseSubModelList()
    this._calVehicleAge()
  }

  private _calVehicleAge() {
    if (this.RFQMotorForm.get('VehicleDetail.RegistrationDate').value) {
      let RegistrationDate = this._datePipe.transform(this.RFQMotorForm.get('VehicleDetail.RegistrationDate').value, 'yyyy-MM-dd');
      let VehicleAge = moment.duration(moment().diff(RegistrationDate));
      this.RFQMotorForm.get('VehicleDetail.VehicleAge').
        setValue(`${VehicleAge.years()}Yr ${VehicleAge.months()}m`)
    } else {
      this.RFQMotorForm.get('VehicleDetail.VehicleAge').
        setValue("")
    }
  }

  private _getSubCategoryWiseBrandList() {

    let SubCategoryName = this.RFQMotorForm.get('SubCategoryName').value;

    let Rule: IFilterRule[] = [ActiveMasterDataRule];

    let AdditionalFilters: IAdditionalFilterObject[] = [
      { key: "VehicleType", filterValues: [SubCategoryName] }
    ]

    let OrderBySpecs: OrderBySpecs[] = [
      {
        field: "SrNo",
        direction: "desc"
      },
      {
        field: "Name",
        direction: "asc"
      }
    ]

    this._MasterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.VehicleBrand.List, 'Name', "", Rule, AdditionalFilters, OrderBySpecs)
      .pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.BrandList = res.Data.Items;
            this.FilteredBrandList = res.Data.Items;

          } else {
            this.BrandList = [];
            this.FilteredBrandList = []
          }
        } else {
          this.BrandList = [];
          this.FilteredBrandList = []
        }
      })

  }
  private _getBrandWiseModelList() {

    let Rule: IFilterRule[] = [ActiveMasterDataRule,
      {
        Field: "Brand.Id",
        Operator: "eq",
        Value: this.RFQMotorForm.get('VehicleDetail.BrandId').value
      },
    ];

    this._MasterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.VehicleModel.List, 'Name', "", Rule)
      .pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.ModelList = res.Data.Items;
            this.FilteredModelList = res.Data.Items;

          } else {
            this.ModelList = [];
            this.FilteredModelList = []
          }
        } else {
          this.ModelList = [];
          this.FilteredModelList = []
        }
      })

  }
  private _getModelWiseSubModelList() {

    let Rule: IFilterRule[] = [ActiveMasterDataRule,
      {
        Field: "Model.Id",
        Operator: "eq",
        Value: this.RFQMotorForm.get('VehicleDetail.ModelId').value
      },
    ];

    this._MasterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.VehicleSubModel.List, 'Name', "", Rule)
      .pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.SubModelList = res.Data.Items;
            this.FilteredSubModelList = res.Data.Items;

          } else {
            this.SubModelList = [];
            this.FilteredSubModelList = []
          }
        } else {
          this.SubModelList = [];
          this.FilteredSubModelList = []
        }
      })

  }

  /**
   * Validate the Attached Document
  */
  private _validateAttachDocField() {
    this.AttachDocumentAlerts = []
    this.Documents.controls.forEach((element, index) => {
      if (element.get('StorageFilePath').hasError('required')) {
        this.AttachDocumentAlerts.push({
          Message: `${element.value.DocumentType} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });
  }

  private _dateFormat() {
    this.RFQMotorForm.patchValue({
      RegistrationDate: this._datePipe.transform(this.RFQMotorForm.get('VehicleDetail.RegistrationDate').value, 'yyyy-MM-dd'),
      PreviousPolicyStartDate: this._datePipe.transform(this.RFQMotorForm.get('PreviousPolicyStartDate').value, 'yyyy-MM-dd'),
      PreviousPolicyEndDate: this._datePipe.transform(this.RFQMotorForm.get('PreviousPolicyEndDate').value, 'yyyy-MM-dd'),
      PrevPolicyTPStartDate: this._datePipe.transform(this.RFQMotorForm.get('PrevPolicyTPStartDate').value, 'yyyy-MM-dd'),
      PrevPolicyTPEndDate: this._datePipe.transform(this.RFQMotorForm.get('PrevPolicyTPEndDate').value, 'yyyy-MM-dd')
    }, { emitEvent: false })
  }


  // Team details from MyProfile
  private _TeamDetailsInfo() {
    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.UserProfileObj = user
        // set Branch details
        this.RFQMotorForm.patchValue({
          BranchId: user.BranchId,
          BranchName: user.BranchName,
        });

        // ************* set required field from user profile data ************* \\
        // set User type from user profile
        if (user.UserType == UserTypeEnum.Agent) {

          this.RFQMotorForm.patchValue({
            SalesPersonId: user.Id,
            SalesPersonName: user.FullName,
            SalesPersonType: 'POSP',
            BDMId: user.BDMId,
            BDMName: user.BDMName,
            BDOId: user.BDOId,
            BDOName: user.BDOName,
          }, { emitEvent: false });

        }
        else if (user.UserType == UserTypeEnum.TeamReference) {
          // in case of login user type is "team reference" then auto bind data in team reference id and team reference name from user profile api
          this.RFQMotorForm.patchValue({
            TeamReferenceId: user.Id,
            TeamReferenceName: user.FullName,
            SalesPersonType: 'Team Reference',
            BDMId: user.BDMId,
            BDMName: user.BDMName,
            BDOId: user.BDOId,
            BDOName: user.BDOName,
          }, { emitEvent: false });


          if (this.RFQMotorForm.value?.BranchId) {

            let LoginUserBranch = this.Branchs?.find(b => b.Id == this.RFQMotorForm.value?.BranchId)
            if (LoginUserBranch) {
              this.RFQMotorForm.patchValue({
                SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
                SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
              }, { emitEvent: false });
            }

          }


        }
      }
    })

  }


  /**
   * When Login use is Standard user then 
   * change branch or Sales person type then call function
   */

  private _TeamDetailsForStandardUser() {
    if (this.UserProfileObj.UserType == UserTypeEnum.StandardUser) {

      /**
       * SalesPersonType Direct sales person is Selected branch bqp
       * Other Field is null
       */
      if (this.RFQMotorForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {


        let LoginUserBranch = this.Branchs?.find(b => b.Id == this.RFQMotorForm.get('BranchId').value)


        if (LoginUserBranch) {
          this.RFQMotorForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.RFQMotorForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.RFQMotorForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });

      } else if (this.RFQMotorForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {

        this.RFQMotorForm.patchValue({
          SalesPersonId: null,
          SalesPersonName: null,
          TeamReferenceId: null,
          TeamReferenceName: null,
        });


        /**
         * SalesPersonType TeamReference sales person is Selected branch bqp
         * Other Field is null
         */
      } else if (this.RFQMotorForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {

        let LoginUserBranch = this.Branchs?.find(b => b.Id == this.RFQMotorForm.value?.BranchId)
        if (LoginUserBranch) {
          this.RFQMotorForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.RFQMotorForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.RFQMotorForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });
      }


      this.RFQMotorForm.patchValue({
        BDMId: null,
        BDMName: null,
        BDOId: null,
        BDOName: null,
      });

    }
  }

  /**
* Sales person list data List API query spec
* @returns 
*/
  private _salesPersonListAPIfilter(): QuerySpecs {
    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    /**
     * Sales person Type - "POSP"
     * Login BDO/BDM- POSP need to display under Sales person
     */
    if (this.RFQMotorForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQMotorForm.get('BranchId').value, }
      ]
    }

    if (this.RFQMotorForm.get('SalesPersonType').value == "POSP") {
      specs.FilterConditions.Rules = [
        ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQMotorForm.get('BranchId').value, }
      ];
    }


    if (this.RFQMotorForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.RFQMotorForm.get('SalesPersonType').value == "POSP") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['Agent'] })
      specs.AdditionalFilters.push({ key: 'RFQSalesPersonOnly', filterValues: ['true'] })
    }

    return specs;
  }

  /**
  * Team ref. list data List API query spec
  * @returns 
  */
  private _teamReferenceListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    /**
         * Sales Person Type -"Team Reference"
         * Login BDO/BDM- Team Reference need to display under Team Reference
         */
    if (this.RFQMotorForm.get('SalesPersonType').value == "Team Reference") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQMotorForm.get('BranchId').value, }
      ];
    }

    if (this.RFQMotorForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.RFQMotorForm.get('SalesPersonType').value == "Team Reference") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['TeamReference'] })
      specs.AdditionalFilters.push({ key: 'RFQSalesPersonOnly', filterValues: ['true'] })
    }

    return specs;
  }

  /**
  * BDO list data List API query spec
  * @returns 
  */
  private _bdoListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    if (this.RFQMotorForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule];
    }

    if (this.RFQMotorForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDOOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.RFQMotorForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.RFQMotorForm.get('BranchId').value?.toString()] })
      }
    }


    return specs;
  }

  /**
    *BDM list data List API query spec
    * @returns 
    */
  private _bdmListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    if (this.RFQMotorForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule];
    }

    if (this.RFQMotorForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDMOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.RFQMotorForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.RFQMotorForm.get('BranchId').value?.toString()] })
      }
    }

    return specs;
  }

  //#endregion private-methods

}

