import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormArray, FormBuilder, FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { ICoSharesDto, CoSharesDto, IAddressesDto, AddressesDto, IVehicleDetailDto, VehicleDetailDto, IPremiumDetailDto, PremiumDetailDto, IPaymentDetailDto, IDocumentsDto, DocumentsDto } from '@models/dtos/transaction-entry/PrivateCar';
import { IPrivateCarDto, PrivateCarDto } from '@models/dtos/transaction-entry/PrivateCar/PrivateCar.Dto';
import { AuthService } from '@services/auth/auth.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { Alert, IAdditionalFilterObject, IFilterRule, OrderBySpecs } from '@models/common';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { IUserDto } from '@models/dtos/core/userDto';
import { BehaviorSubject, Observable, Subject, map, of, switchMap, takeUntil } from 'rxjs';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { CategoryCodeEnum, HealthPolicyDocumentType, PremiumpPaymentTypeEnum, SalesPersonTypeEnum, SubCategoryCodeEnum } from 'src/app/shared/enums';
import { ICityPincodeDto } from '@models/dtos/core';
import { ICustomerDto } from '@models/dtos/core/CustomerDto';
import { IFleetDto, IGroupHeadDto } from '@models/dtos/transaction-master';
import { CategoryType1, CategoryType2, DisplayedLifePremiumPaymentType, NCBpercentageList, PermissibleBusinessDetails, PolicyDocumentTypeList, TravelPolicyDaysList } from '@config/transaction-entry';
import { IBankDto } from '@models/dtos/core/BankDto';
import { DisplayedPolicyType } from '@config/transaction-entry/transactionPolicyType.config';
import { OfflineMotorPolicyTypeEnum } from 'src/app/shared/enums/OfflineMotorPolicyType.enum';
import { DialogService } from '@lib/services/dialog.service';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { IProductPlanDto } from '@models/dtos/core/ProductPlanDto';
import { ProductPlanPopupComponent } from '@lib/ui/components/product-plan-popup/product-plan-popup.component';
import { environment } from 'src/environments/environment';
import { MatChipInputEvent } from '@angular/material/chips';
import { ValidationRegex } from '@config/validationRegex.config';
import { IVehicleBrandDto } from '@models/dtos/core/vehicleBrandDto';
import { IVehicleModelDto } from '@models/dtos/core/VehicleModelDto';
import { IVehicleSubModelDto } from '@models/dtos/core/VehicleSubModel';
import { dropdown } from '@config/dropdown.config';
import { FleetPopupComponent } from '@lib/ui/components/fleet-popup/fleet-popup.component';
import { BasicTPPremiumMapping } from '@config/transaction-entry/BasicTPPremiumAmountMapping.config';
import * as moment from 'moment';
import { GSTMapping } from '@config/transaction-entry/GST-Mapping.config';
import { MedicalExpenseLimitTypeEnum } from 'src/app/shared/enums/MedicalExpenseLimitType.enum';
import { PreviousPolicyDetailsComponent } from '../previous-policy-details/previous-policy-details.component';
import { ROUTING_PATH } from '@config/routingPath.config';
import { GroupHeadPopupComponent } from '@lib/ui/components/group-head-popup/group-head-popup.component';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { TransactionEntryService } from '../transactionentry.service';
import { TransactionVehicleSubTypeList } from '@config/transaction-entry/vehicle-type.config';
import { VehicleSubmodelFuelTypeList } from '@config/vehicle-SubModel';


const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-transaction-entry',
  templateUrl: './transaction-entry.component.html',
  styleUrls: ['./transaction-entry.component.scss'],
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
export class TransactionEntryComponent {

  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;
  @ViewChild('RTOSearchCtrl') RTOSearch: ElementRef;


  // String
  mode: string;
  title: string
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload; // upload document API
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;

  // for in case of document type select is Other then "IsRemarks" value is true other wise false
  // "IsRemarks" is "true" then "Other Remarks" Field is show other wise hide
  IsRemark: boolean = false;




  // FormGroup
  TransactionEntryForm: FormGroup


  // Model- DTO
  TrasactioinData: IPrivateCarDto

  //Flags
  editable: boolean = true;
  isExpand: boolean = false;
  IsbasicDetailsDisable: boolean = false;
  IsSalesPersonReadOnly: boolean = false
  isCoShareDisabled: boolean = true;
  isCoShareFinancialDisabled: boolean = true;
  isInsuranceCompanyHidden: boolean = true;

  tempIsPermissibleBusinessforPoSP: boolean;
  GroupHeadResponseData: Observable<any>;
  GroupHeadRespons: BehaviorSubject<any>

  premiumPaymenttype = PremiumpPaymentTypeEnum
  mExpenseLimittype = MedicalExpenseLimitTypeEnum
  MedicalExpenseLimitType: Observable<any[]>;
  PremiumPaymentType: Observable<any[]>;

  DropdownMaster: dropdown;
  TpPremiumMasterData: any;
  PassengerPAList: any[] = []

  // Observable List
  BrokerPerson$: Observable<IUserDto[]>;
  TeamRefUser$: Observable<IUserDto[]>;
  SalesPerson$: Observable<IUserDto[]>;
  GroupHeadName$: Observable<IGroupHeadDto[]>
  CustomerName$: Observable<ICustomerDto[]>;
  BACUser$: Observable<IUserDto[]>
  BAAUser$: Observable<IUserDto[]>
  TransactionList$: Observable<any[]>;
  CompanyName$: Observable<IInsuranceCompanyDto[]>;
  InsuranceCompany$: Observable<IInsuranceCompanyDto[]>;
  Product$: Observable<IProductPlanDto[]>;
  pincodes$: Observable<ICityPincodeDto[]>;
  pincodestwo$: Observable<ICityPincodeDto[]>;
  Brand$: Observable<IVehicleBrandDto[]>;
  BrandList: IVehicleBrandDto[];
  Model$: Observable<IVehicleModelDto[]>;
  SubModel$: Observable<IVehicleSubModelDto[]>;
  FleetCode$: Observable<IFleetDto[]>

  //List objects
  CategoryList = [];
  SubCategoryList = [];
  BasicTPPremiumAmountList = [];
  GSTMappingList = [];
  PermissibleBusinessList = []
  Branchs: IBranchDto[] = [];
  BankList: IBankDto[];
  CategoryType1List: any[]
  CategoryType2List: any[]
  RTOCodeList: any[];
  FilteredRTOCodeList: any[];
  TravelPolicydaysdrplist: any[]
  selectedDocumentTypes: string[] = [];
  EmailArray: string[] = []
  destroy$: Subject<any>;

  // formControl
  CoShareBool = new FormControl(false, [Validators.required])
  CoShareId = new FormControl(null, [Validators.required])
  CoShareName = new FormControl('', [Validators.required])
  CoSharePercent = new FormControl(null, [Validators.required])

  BrandSearchCtrl = new FormControl()

  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  BasicDetailsAlert: Alert[] = [];
  PolicyDetailsAlert: Alert[] = [];
  CustomerDetailsAlert: Alert[] = [];
  categoryInfoMotorAlert: Alert[] = [];
  categoryTypeAlert: Alert[] = [];
  TeamDetailsAlert: Alert[] = [];
  PolicyInformationAlert: Alert[] = [];
  PremiumInformationAlert: Alert[] = [];
  PaymentInformationAlert: Alert[] = [];
  DocumentAttachmentAlert: Alert[] = [];

  // Step Control
  BasicDetailsStepCtrl = new FormControl()
  PolicyDetailsStepCtrl = new FormControl()
  CustomerDetailsStepCtrl = new FormControl()
  categoryInfoMotorStepCtrl = new FormControl()
  categoryTypeStepCtrl = new FormControl()
  TeamDetailsStepCtrl = new FormControl()
  PolicyInformationStepCtrl = new FormControl()
  PremiumInformationStepCtrl = new FormControl()
  PaymentInformationStepCtrl = new FormControl()
  DocumentAttachmentStepCtrl = new FormControl()

  //Date
  currentDate: Date
  //number
  noOfYears: number = 1

  //#region  constructor
  constructor(
    private _fb: FormBuilder,
    private _MasterListService: MasterListService,
    private _privateCarService: TransactionEntryService,
    private _alertservice: AlertsService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _datePipe: DatePipe,
    public dialog: MatDialog,
    private _dialogService: DialogService,
    private _dataservice: HttpService,
    private authService: AuthService,
    private _Location: Location,
  ) {
    this.DropdownMaster = new dropdown();
    this.destroy$ = new Subject();
    this._fillMasterList()
    this.currentDate = new Date()
  }
  //#endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init
  ngOnInit(): void {
    // let message = navigation?.extras.state?.['message'];

    
    
    //get data from route
    let data = this._route.snapshot.data;
    this.mode = data['mode'];
    this.title = data['title'];
    this.TrasactioinData = new PrivateCarDto()
    switch (this.mode) {
      case "Create":
        this.TrasactioinData = new PrivateCarDto()
        this.editable = true;
        break;
        
        case "View":
          case "RFQView":
            this.TrasactioinData = data['data'];
            this.editable = false;
            this.isExpand = true;
            break;
            
            case "Edit":
              this.TrasactioinData = data['data'];
              this.editable = true;
              this.IsSalesPersonReadOnly = true;
              this._dataservice.getDataById(this.TrasactioinData.GroupHeadId, API_ENDPOINTS.GroupHead.Base).subscribe((response) => {
                if (response.Success) {
                  this.groupHead(response.Data)
                }
              })
              break;
              
              case "Convert":
                this.TrasactioinData = data['data'];
                this.editable = true;
                break;
                
                case "RenewalTransaction":
                  this.TrasactioinData = data['data'];
                  this.TrasactioinData.PolicyType = "";
        this.editable = true;
        break;
        case "EndorsementConvert":
          this.TrasactioinData = new PrivateCarDto()
          this.editable = true;
          let navigation:any = this._Location.getState(); 
        if (navigation?.PolicyType){
          this.TrasactioinData.PolicyType = navigation?.PolicyType;
        }else{
          this.TrasactioinData.PolicyType = "Endorsement-Financial";
        }
          break;
        
      case "OnlineHealthPolicyConvert":
      case "OnlineMotorPolicyConvert":
        this.TrasactioinData = data['data'];
        this.editable = true;
          break;
          
      default:
        break;
    }

    if (this.mode != 'Create' && this.mode != 'Convert' && this.mode != 'RFQView' && this.mode != 'EndorsementConvert' &&
      this.mode != 'OnlineHealthPolicyConvert' && this.mode != 'OnlineMotorPolicyConvert'
    ) {
      let CoSharesArray = this.TrasactioinData.CoShares;
      if (CoSharesArray.length > 0) {
        CoSharesArray = CoSharesArray.filter((f) => f.COshare == true);
      }
      //filtered CoShares array patched for COshare == true
      this.TrasactioinData.CoShares = CoSharesArray;

      if (this.TrasactioinData.CoShares?.length > 0) {
        this.CoShareBool.patchValue(true, { emitEvent: false })
      } else {
        this.CoShareBool.patchValue(false, { emitEvent: false })
      }

      this.TrasactioinData?.Documents?.forEach(doc => {
        this.selectedDocumentTypes.push(doc.DocumentType)
      })
    }

    if (this.mode != "Create" && this.mode != 'Convert' && this.mode != 'RFQView' && this.mode != 'RenewalTransaction' && this.mode != 'EndorsementConvert' && 
      this.mode != 'OnlineHealthPolicyConvert' && this.mode != 'OnlineMotorPolicyConvert'
    ) {
      let SortOrder = ['Correspondence', 'Property']
      let FilterAddresses = this.TrasactioinData.Addresses.filter(ele => ele.AddressType == "Correspondence" || ele.AddressType == "Property")
      this.TrasactioinData.Addresses = FilterAddresses.sort((a, b) => SortOrder.indexOf(a.AddressType) - SortOrder.indexOf(b.AddressType))
    }


    this.TransactionEntryForm = this._buildTransactionEntryForm(this.TrasactioinData)
    if (this.mode == "Create" || this.mode == "Convert" || this.mode == 'RenewalTransaction' || this.mode == "EndorsementConvert" || 
      this.mode == 'OnlineHealthPolicyConvert' || this.mode == 'OnlineMotorPolicyConvert'
    ) {
      for (let i = 0; i < 2; i++) {
        this.addAddressesRow(i)
      }
    }

    this.BasicTPPremiumAmountList = BasicTPPremiumMapping["BasicTPPremiumAmountList"];
    this.GSTMappingList = GSTMapping["GSTMappingList"];
    this.PremiumPaymentType = of(Object.values(PremiumpPaymentTypeEnum));
    this.MedicalExpenseLimitType = of(Object.values(MedicalExpenseLimitTypeEnum));
    this._onFormChange()
    this._PaymentInformationAmountChange()
    this.OnViewEditFillMasterData()
    this._onFormControlChange()

    if (this.mode == 'EndorsementConvert') {
      let TransactionId = this._route.snapshot.params['Id']
      this.GetTransactionData(TransactionId)
      data['data'] = this.TransactionEntryForm.getRawValue()
    }

    if (this.mode != "Create") {
      // this._getCategoryWiseSubCategogry(this.TransactionEntryForm.get('CategoryId').value)
      this._getCategoryWiseInsuranceCampany(this.TransactionEntryForm.get('CategoryId').value)
      this._getSubCategoryWiseTPPremium(this.TransactionEntryForm.get('SubCategoryId').value)
      this._getInsuranceCampnyWiseProduct(this.TransactionEntryForm.get('SubCategoryId').value, this.TransactionEntryForm.get('InsuranceCompanyCode').value)
      this._getSubCategoryWiseBrandList()
      this.TransactionEntryForm.get('CategoryId').disable({ emitEvent: false })
      // this.TransactionEntryForm.get('SubCategoryId').disable({ emitEvent: false })
      if ((this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Same Company'
        || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial'
        || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial'
        || this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Change Company')
        && (this.TransactionEntryForm.get('CategoryCode').value != CategoryCodeEnum.Motor)) {
        this.TransactionEntryForm.get('SubCategoryId').enable({ emitEvent: false })
      } else {
        this.TransactionEntryForm.get('SubCategoryId').disable({ emitEvent: false })
      }

      if (this.mode != 'OnlineHealthPolicyConvert' && this.mode != 'OnlineMotorPolicyConvert'){
        this.TransactionEntryForm.get('BranchId').disable({ emitEvent: false })
      }

      this._getCategoryData(data['data'].CategoryCode, data['data'].SubCategoryCode)

      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {

        if (this.TransactionEntryForm.get('PremiumType').value == '1 OD + 3 TP') {
          this.noOfYears = 3
        }
        else if (this.TransactionEntryForm.get('PremiumType').value == '1 OD + 5 TP') {
          this.noOfYears = 5
        } else {
          this.noOfYears = 1
        }
      }

      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
        this.TransactionEntryForm.get('PremiumType').value == 'SAOD') {
        this._DisableLIABILITYPartField()
      }
      else if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
        this.TransactionEntryForm.get('PremiumType').value == 'SATP') {
        this._DisableOWNDAMAGEPartField()
      }
      else if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
        this.TransactionEntryForm.get('PremiumType').value == 'PAOD') {
        this._DisableAtPAODSelection();
      }

      if (this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial') {
        this._disableFinancial();
      }

      if (this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial') {
        this._disableNonFinancial();
      }


    }
    if (this.mode == 'Convert') {
      this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').setValue(this.getPermissibleBusinessFlag())
      this.setGSTPerBaseOnCategoryNSubCategory();
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        this.totalValue()
        this.getBasicTPPremiumAmount();
      }

    }

  }


  ngOnChanges() {

    if (this.document?.length == 0) {
      this.selectedDocumentTypes = [];
    }
  }


  // #region getters
  get f() {
    return this.TransactionEntryForm.controls
  }

  get PaymentForm() {
    return this.f['PaymentDetail'] as FormGroup
  }

  get PremiumDetailForm() {
    return this.f['PremiumDetail'] as FormGroup
  }

  get CategoryCodeEnum() {
    return CategoryCodeEnum
  }

  get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum
  }

  get SubCategoryWisePolicyType(): string[] {

    if (this.mode != "RenewalTransaction") {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Life) {
        return DisplayedPolicyType.lifePolicyType;
      }
      else {
        return DisplayedPolicyType.motorPolicyType
      }
    }
    else {
      return DisplayedPolicyType.renewalPolicyType
    }

  }

  get MotorPolicyTypeEnum() {
    return OfflineMotorPolicyTypeEnum
  }

  get Coshare() {
    return this.TransactionEntryForm.controls['CoShares'] as FormArray
  }

  // Co share per. sum without Selected insurance campany co-share per.
  get CosharePerSum(): number {
    let sum: number = 0
    this.Coshare.controls.forEach((item, i) => {
      if (i != 0)
        sum = sum + parseFloat(item.get('COshareper').value)
    })

    return sum;
  }


  get address() {
    return this.TransactionEntryForm.controls['Addresses'] as FormArray
  }



  get PolicyDocumentList() {
    let sortedList = PolicyDocumentTypeList.sort((a, b) =>
      a.SortOrder - b.SortOrder);
    return sortedList
  }

  get document() {
    return this.TransactionEntryForm.controls["Documents"] as FormArray;
  }

  get PolicyDocumentAttachment() {
    return this.document.controls.filter(doc => doc.get('DocumentType').value != 'Mandate' && doc.get('DocumentType').value != 'PreviousPolicy')
  }

  get MandateDoc() {
    let Index = this.document.value.findIndex(ele => ele.DocumentType == 'Mandate')
    if (Index != -1) {
      return this.document.controls[Index].value;
    } else {
      return "";
    }
  }

  get PreviuospolicyDoc() {
    let Index = this.document.value.findIndex(ele => ele.DocumentType == 'PreviousPolicy')
    if (Index != -1) {
      return this.document.controls[Index].value;
    } else {
      return "";
    }
  }

  get NCBpercentageList() {
    return NCBpercentageList
  }


  get DisplayedLifePremiumPaymentType() {
    return DisplayedLifePremiumPaymentType
  }


  /**
   * Sub Category Wise Vehicle Type
   */
  get TransactionVehicleTypeList() {
    let SUbtypeList = []
    let VehicleTypeObj = TransactionVehicleSubTypeList.find(item => item.SubCategoryCode == this.TransactionEntryForm.get('SubCategoryCode').value);
    if (VehicleTypeObj) {
      SUbtypeList = VehicleTypeObj.VehicleSubType
    }

    return SUbtypeList
  }


  public get VehicleSubmodelFuelTypeList(): any {
    return VehicleSubmodelFuelTypeList;
  }
  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // previous page navigation button
  public backClicked() {
    if (this.mode == 'View' || this.mode == 'Edit') {
      this._router.navigate(['../../'], { relativeTo: this._route })
    } else if (this.mode == 'RFQView' || this.mode == 'Convert' || this.mode == 'RenewalTransaction' || this.mode == 'EndorsementConvert'
      || this.mode == 'OnlineHealthPolicyConvert' || this.mode == 'OnlineMotorPolicyConvert'
    ) {
      this._Location.back();
    } else {
      this._router.navigate(['../'], { relativeTo: this._route })
    }
  }


  public submiitTransactionEntryForm() {


    if (this.BasicDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.BasicDetailsAlert);
      return;
    }
    if (this.PolicyDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.PolicyDetailsAlert);
      return;
    }
    if (this.CustomerDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.CustomerDetailsAlert);
      return;
    }
    if (this.categoryTypeAlert.length > 0) {
      this._alertservice.raiseErrors(this.categoryTypeAlert);
      return;
    }
    if (this.categoryInfoMotorAlert.length > 0) {
      this._alertservice.raiseErrors(this.categoryInfoMotorAlert);
      return;
    }
    if (this.PolicyInformationAlert.length > 0) {
      this._alertservice.raiseErrors(this.PolicyInformationAlert);
      return;
    }
    if (this.PremiumInformationAlert.length > 0) {
      this._alertservice.raiseErrors(this.PremiumInformationAlert);
      return;
    }
    if (this.PaymentInformationAlert.length > 0) {
      this._alertservice.raiseErrors(this.PaymentInformationAlert);
      return;
    }
    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }

    // this.TransactionEntryForm.enable({ emitEvent: false })
    this.Coshare
    this.TransactionEntryForm.get('SubCategoryId').enable({ emitEvent: false })
    this.TransactionEntryForm.get('CategoryId').enable({ emitEvent: false })
    this.TransactionEntryForm.get('BranchId').enable({ emitEvent: false })


    this._dateFormat()
    // this.MotorPremiumDetailsEnable()
    // this.EnablePartField()
    // this.EnableODfield()
    // this._EnableAtPAODSelection()

    let CategoryCode = this.TransactionEntryForm.get('CategoryCode').value

    let TransactionEntryData = JSON.parse(JSON.stringify(this.TransactionEntryForm.getRawValue()))


    TransactionEntryData.Addresses = TransactionEntryData.Addresses.filter(address => address.CityPinCodeId != null)
    // TransactionEntryData.Documents = TransactionEntryData.Documents.filter(doc => doc.ImageUploadPath != "")
    switch (this.mode) {

      case 'Create':
      case 'OnlineHealthPolicyConvert':
      case 'OnlineMotorPolicyConvert':
      case 'EndorsementConvert':
      case "RenewalTransaction": {

        TransactionEntryData.CoShares.forEach(doc => { doc.Id = 0 })
        TransactionEntryData.Addresses.forEach(doc => { doc.Id = 0 })
        TransactionEntryData.Documents.forEach(doc => { doc.Id = 0 })
        TransactionEntryData.VehicleDetail.Id = 0;
        TransactionEntryData.PremiumDetail.Id = 0;
        TransactionEntryData.PaymentDetail.Id = 0;

        // return
        this._privateCarService.pCarTransaction(CategoryCode, TransactionEntryData).subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message, 'true')
            if (this.mode == 'OnlineHealthPolicyConvert'){
              this._router.navigate([ROUTING_PATH.SideBar.HealthPolicyList])
            }else if (this.mode == 'OnlineMotorPolicyConvert'){
              this._router.navigate([ROUTING_PATH.SideBar.MotorPoliciesList])
            }
            else{
              this._router.navigate([ROUTING_PATH.Master.TransactionEntry.transactionentry])
            }
            
          }
          else {
            if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
              this.TransactionEntryForm.get('PremiumType').value == 'SAOD') {
              this._DisableLIABILITYPartField()
            }
            else if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
              this.TransactionEntryForm.get('PremiumType').value == 'SATP') {
              this._DisableOWNDAMAGEPartField()
            }
            else if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
              this.TransactionEntryForm.get('PremiumType').value == 'PAOD') {
              this._DisableAtPAODSelection();
              this.TransactionEntryForm.get('PremiumDetail').patchValue({
                BasicTPPremium: 0,
              })
            }

            this._alertservice.raiseErrors(res.Alerts)

          }
        })
        break;
      }

      case 'Edit': {
        this._privateCarService.pCarTransactionUpdate(CategoryCode, TransactionEntryData).subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message, 'true')
            this._router.navigate([ROUTING_PATH.Master.TransactionEntry.transactionentry])
          }
          else {
            if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
              this.TransactionEntryForm.get('PremiumType').value == 'SAOD') {
              this._DisableLIABILITYPartField()
            }
            else if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
              this.TransactionEntryForm.get('PremiumType').value == 'SATP') {
              // this._DisableOWNDAMAGEPartField()
            }
            else if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
              this.TransactionEntryForm.get('PremiumType').value == 'PAOD') {
              this._DisableAtPAODSelection();
            }

            // this.TransactionEntryForm.get('SubCategoryId').disable({ emitEvent: false })
            if ((this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Same Company'
              || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial'
              || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial'
              || this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Change Company')
              && (this.TransactionEntryForm.get('CategoryCode').value != CategoryCodeEnum.Motor)) {
              this.TransactionEntryForm.get('SubCategoryId').enable({ emitEvent: false })
            } else {
              this.TransactionEntryForm.get('SubCategoryId').disable({ emitEvent: false })
            }
            this.TransactionEntryForm.get('CategoryId').disable({ emitEvent: false })
            this.TransactionEntryForm.get('BranchName').disable({ emitEvent: false })
            this._alertservice.raiseErrors(res.Alerts)

          }
        })
        break;
      }
      case 'Convert': {

        TransactionEntryData.CoShares.forEach(doc => { doc.Id = 0 })
        TransactionEntryData.Addresses.forEach(doc => { doc.Id = 0 })
        TransactionEntryData.Documents.forEach(doc => { doc.Id = 0 })
        TransactionEntryData.VehicleDetail.Id = 0;
        TransactionEntryData.PremiumDetail.Id = 0;
        TransactionEntryData.PaymentDetail.Id = 0;

        // return
        this._privateCarService.pCarTransaction(CategoryCode, TransactionEntryData).subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message, 'true')
            this._router.navigate([ROUTING_PATH.Basic.Dashboard])
          }
          else {
            if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
              this.TransactionEntryForm.get('PremiumType').value == 'SAOD') {
              this._DisableLIABILITYPartField()
            }
            else if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
              this.TransactionEntryForm.get('PremiumType').value == 'SATP') {
              this._DisableOWNDAMAGEPartField()
            }
            else if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
              this.TransactionEntryForm.get('PremiumType').value == 'PAOD') {
              this._DisableAtPAODSelection();
              this.TransactionEntryForm.get('PremiumDetail').patchValue({
                BasicTPPremium: 0,
              })
            }

            this._alertservice.raiseErrors(res.Alerts)

          }
        })
        break;
      }
    }


  }


  bsaicDetailsDisableOnStepperSelectionChabge(event: StepperSelectionEvent) {
    if (this.BasicDetailsValidations().valid && event.selectedIndex == 1) {
      if (this.mode == 'Create'){
      this.IsbasicDetailsDisable = true
      this.TransactionEntryForm.get('CategoryId').disable({ emitEvent: false })
      // this.TransactionEntryForm.get('SubCategoryId').disable({ emitEvent: false })
      if ((this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Same Company'
        || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial'
        || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial'
        || this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Change Company')
        && (this.TransactionEntryForm.get('CategoryCode').value != CategoryCodeEnum.Motor)) {
        this.TransactionEntryForm.get('SubCategoryId').enable({ emitEvent: false })
      } else {
        this.TransactionEntryForm.get('SubCategoryId').disable({ emitEvent: false })
      }
      this.TransactionEntryForm.get('BranchId').disable({ emitEvent: false })
    }

      if (this.mode == 'Create' || this.mode == 'OnlineHealthPolicyConvert' || this.mode == 'OnlineMotorPolicyConvert') {

        this.TransactionEntryForm.get('BranchId').disable({ emitEvent: false })
      }
    }
  }

  public onTransactionDataBlur(): void {
    let TransactionData = this.TransactionEntryForm.value.TransactionData;

    if (TransactionData && TransactionData.Id) {
      this.TransactionEntryForm.patchValue({
        InsertTransactionNo: TransactionData.TransactionNo,
      });
      this.GetTransactionData(TransactionData.Id)
    } else {
      this.TransactionEntryForm.patchValue({
        InsertTransactionNo: "",
        TransactionData: null
      }, { emitEvent: false });
    }
  }


  public GetTransactionData(TransactionId) {
    if (TransactionId) {
      this._dataservice.getDataById(TransactionId, API_ENDPOINTS.Transaction.Base).subscribe(res => {
        if (res.Success) {

          let CoSharesArray = res.Data.CoShares;
          if (CoSharesArray.length > 0) {
            CoSharesArray = CoSharesArray.filter((f) => f.COshare == true);
          }
          //filtered CoShares array patched for COshare == true
          res.Data.CoShares = CoSharesArray;

          res.Data.Documents.forEach(doc => {
            this.selectedDocumentTypes.push(doc.DocumentType)
          })

          let SortOrder = ['Correspondence', 'Property']
          let FilterAddresses = res.Data.Addresses.filter(ele => ele.AddressType == "Correspondence" || ele.AddressType == "Property")
          res.Data.Addresses = FilterAddresses.sort((a, b) => SortOrder.indexOf(a.AddressType) - SortOrder.indexOf(b.AddressType))

          this.TransactionEntryForm.get('SubCategoryId').enable({ emitEvent: false })
          this.TransactionEntryForm.get('CategoryId').enable({ emitEvent: false })
          this.TransactionEntryForm.get('BranchId').enable({ emitEvent: false })
          if (this.mode == 'EndorsementConvert') {
            this.TransactionEntryForm.get('SubCategoryId').patchValue(res.Data.SubCategoryId,{ emitEvent: false })
            this.TransactionEntryForm.get('CategoryId').patchValue(res.Data.CategoryId, { emitEvent: false })
            this.TransactionEntryForm.get('BranchId').patchValue(res.Data.BranchId, { emitEvent: false })
            this.TransactionEntryForm.get('SubCategoryCode').patchValue(res.Data.SubCategoryCode,{ emitEvent: false })
            this.TransactionEntryForm.get('CategoryCode').patchValue(res.Data.CategoryCode, { emitEvent: false })
            this.TransactionEntryForm.get('InsertTransactionNo').patchValue(res.Data.TransactionNo, { emitEvent: false })
          }
          this.TransactionEntryForm.enable({ emitEvent: false })
          let TransactionEntryAllData: any = JSON.parse(JSON.stringify(this.TransactionEntryForm.value))


          if (this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Same Company' || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial'
            || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial' || this.TransactionEntryForm.get('PolicyType').value == 'Installment'
            || this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Change Company') {
            //  TransactionEntryAllData = {

            if (res.Data.CoShares?.length > 0) {
              this.CoShareBool.patchValue(true, { emitEvent: false })
            } else {
              this.CoShareBool.patchValue(false, { emitEvent: false })
            }

            // TransactionEntryAllData.TransactionDate = res.Data.TransactionDate,
            TransactionEntryAllData.InsuranceCompanyCode = res.Data.InsuranceCompanyCode,
              TransactionEntryAllData.InsuranceCompany = res.Data.InsuranceCompany,
              TransactionEntryAllData.InsurancePlan = res.Data.InsurancePlan,
              TransactionEntryAllData.ProductCode = res.Data.ProductCode,
              TransactionEntryAllData.GroupHeadName = res.Data.GroupHeadName,
              TransactionEntryAllData.GroupHeadId = res.Data.GroupHeadId,
              TransactionEntryAllData.CustomerId = res.Data.CustomerId,
              TransactionEntryAllData.CustomerName = res.Data.CustomerName,
              // TransactionEntryAllData.BrokerQualifiedPersonId = res.Data.BrokerQualifiedPersonId,
              // TransactionEntryAllData.BrokerQualifiedPersonName = res.Data.BrokerQualifiedPersonName,
              TransactionEntryAllData.MobileNo = res.Data.MobileNo,
              // TransactionEntryAllData.SalesPersonName = res.Data.SalesPersonName,
              // TransactionEntryAllData.SalesPersonId = res.Data.SalesPersonId,
              // TransactionEntryAllData.SalesPersonType = res.Data.SalesPersonType,
              // TransactionEntryAllData.TeamReferenceUserId = res.Data.TeamReferenceUserId,
              // TransactionEntryAllData.TeamReferenceUserName = res.Data.TeamReferenceUserName,
              TransactionEntryAllData.CustomerReference = res.Data.CustomerReference,
              TransactionEntryAllData.BranchName = res.Data.BranchName,
              TransactionEntryAllData.BranchId = res.Data.BranchId,
              TransactionEntryAllData.MandateObtained = res.Data.MandateObtained,
              TransactionEntryAllData.GrossPremium = res.Data.GrossPremium,
              TransactionEntryAllData.Remark = res.Data.Remark,
              TransactionEntryAllData.CoShares = res.Data.CoShares,
              TransactionEntryAllData.Documents = res.Data.Documents,
              TransactionEntryAllData.Addresses = res.Data.Addresses,
              TransactionEntryAllData.CategoryType = res.Data.CategoryType,
              TransactionEntryAllData.SubCategoryType = res.Data.SubCategoryType,
              TransactionEntryAllData.PrevPolicyInsurComp = res.Data.PrevPolicyInsurComp
            TransactionEntryAllData.PrevPolicySumInsured = res.Data.PrevPolicySumInsured
            TransactionEntryAllData.PrevPolicyType = res.Data.PrevPolicyType
            TransactionEntryAllData.PrevPolicyPeriod = res.Data.PrevPolicyPeriod
            TransactionEntryAllData.PassportNo = res.Data.PassportNo
            TransactionEntryAllData.PassportExpiryDate = res.Data.PassportExpiryDate
            TransactionEntryAllData.DomesticDetail = res.Data.DomesticDetail
            TransactionEntryAllData.SalesPersonType = res.Data.SalesPersonType
            // Added on 31-05-2024

            TransactionEntryAllData.PremiumPaymentTypeName = res.Data.PremiumPaymentTypeName
            TransactionEntryAllData.PremiumPaymentType = res.Data.PremiumPaymentType

            if (res.Data.VehicleDetail != null) {
              TransactionEntryAllData.VehicleDetail.VehicleType = res.Data.VehicleDetail.VehicleType
              TransactionEntryAllData.VehicleDetail.VehicleNumber = res.Data.VehicleDetail.VehicleNumber
              TransactionEntryAllData.VehicleDetail.ManufacturingYear = res.Data.VehicleDetail.ManufacturingYear
              TransactionEntryAllData.VehicleDetail.RegistrationDate = res.Data.VehicleDetail.RegistrationDate
              TransactionEntryAllData.VehicleDetail.FuelType = res.Data.VehicleDetail.FuelType
              TransactionEntryAllData.VehicleDetail.EngineNumber = res.Data.VehicleDetail.EngineNumber
              TransactionEntryAllData.VehicleDetail.ChasisNumber = res.Data.VehicleDetail.ChasisNumber
              TransactionEntryAllData.VehicleDetail.CubicCapacityORKW = res.Data.VehicleDetail.CubicCapacityORKW
              TransactionEntryAllData.VehicleDetail.PassengerCapacity = res.Data.VehicleDetail.PassengerCapacity
              TransactionEntryAllData.VehicleDetail.GrossVehicleWeight = res.Data.VehicleDetail.GrossVehicleWeight
              TransactionEntryAllData.VehicleDetail.Remarks = res.Data.VehicleDetail.Remarks
              TransactionEntryAllData.VehicleDetail.BrandName = res.Data.VehicleDetail.BrandName
              TransactionEntryAllData.VehicleDetail.BrandId = res.Data.VehicleDetail.BrandId
              TransactionEntryAllData.VehicleDetail.ModelName = res.Data.VehicleDetail.ModelName
              TransactionEntryAllData.VehicleDetail.ModelId = res.Data.VehicleDetail.ModelId
              TransactionEntryAllData.VehicleDetail.SubModelName = res.Data.VehicleDetail.SubModelName
              TransactionEntryAllData.VehicleDetail.isFleetBusiness = res.Data.VehicleDetail.isFleetBusiness
              TransactionEntryAllData.VehicleDetail.FleetBusinessId = res.Data.VehicleDetail.FleetBusinessId
              TransactionEntryAllData.VehicleDetail.FleetBusinessName = res.Data.VehicleDetail.FleetBusinessName
              TransactionEntryAllData.VehicleDetail.AnyClaiminPreviousYear = res.Data.VehicleDetail.AnyClaiminPreviousYear
              TransactionEntryAllData.VehicleDetail.VehicleAge = res.Data.VehicleDetail.VehicleAge
              TransactionEntryAllData.VehicleDetail.IsPermissibleBusinessforPoSP = res.Data.VehicleDetail.IsPermissibleBusinessforPoSP
              TransactionEntryAllData.VehicleDetail.BusinessTarget = res.Data.VehicleDetail.BusinessTarget
              TransactionEntryAllData.VehicleDetail.RTOCode = res.Data.VehicleDetail.RTOCode
              TransactionEntryAllData.VehicleDetail.VehicleClass = res.Data.VehicleDetail.VehicleClass
              TransactionEntryAllData.VehicleDetail.RegistrationType = res.Data.VehicleDetail.RegistrationType
              TransactionEntryAllData.VehicleDetail.ContractPeriod = res.Data.VehicleDetail.ContractPeriod
              TransactionEntryAllData.VehicleDetail.TaxiAgency = res.Data.VehicleDetail.TaxiAgency
              TransactionEntryAllData.VehicleDetail.Usage = res.Data.VehicleDetail.Usage
            }

          } else {
            TransactionEntryAllData.SalesPersonName = res.Data.SalesPersonName,
              // TransactionEntryAllData.SalesPersonId = res.Data.SalesPersonId,
              // TransactionEntryAllData.SalesPersonType = res.Data.SalesPersonType,
              // TransactionEntryAllData.TeamReferenceUserId = res.Data.TeamReferenceUserId,
              // TransactionEntryAllData.TeamReferenceUserName = res.Data.TeamReferenceUserName,
              TransactionEntryAllData.CustomerReference = res.Data.CustomerReference,
              // TransactionEntryAllData.BrokerQualifiedPersonId = res.Data.BrokerQualifiedPersonId,
              // TransactionEntryAllData.BrokerQualifiedPersonName = res.Data.BrokerQualifiedPersonName,
              TransactionEntryAllData.GroupHeadName = res.Data.GroupHeadName,
              TransactionEntryAllData.GroupHeadId = res.Data.GroupHeadId,
              TransactionEntryAllData.NameProposal = res.Data.NameProposal,
              TransactionEntryAllData.DateOfBirth = res.Data.DateOfBirth,
              TransactionEntryAllData.LifeInsPlanName = res.Data.LifeInsPlanName,
              TransactionEntryAllData.CustomerId = res.Data.CustomerId,
              TransactionEntryAllData.CustomerName = res.Data.CustomerName,
              TransactionEntryAllData.MobileNo = res.Data.MobileNo,
              TransactionEntryAllData.Addresses = res.Data.Addresses
            // TransactionEntryAllData.SalesPersonType = res.Data.SalesPersonType
          }

          /**
           * Payment details & Premium details only Bind in Installment & Endorsement-Non Finacial
           */
          if (this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial' ||
            this.TransactionEntryForm.get('PolicyType').value == 'Installment') {
            TransactionEntryAllData.PaymentDetail = res.Data.PaymentDetail,
              TransactionEntryAllData.PremiumDetail = res.Data.PremiumDetail
          }


          /**
           * Policy Information Data Patch As per Proposal Type
           */
          if (this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial' ||
            this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' ||
            this.TransactionEntryForm.get('PolicyType').value == 'Installment') {
            TransactionEntryAllData.PremiumType = res.Data.PremiumType,
              TransactionEntryAllData.SubmissionDate = res.Data.SubmissionDate,
              TransactionEntryAllData.IssueDate = res.Data.IssueDate,
              TransactionEntryAllData.StartDate = res.Data.StartDate,
              TransactionEntryAllData.EndDate = res.Data.EndDate,
              TransactionEntryAllData.PolicyNo = res.Data.PolicyNo,
              TransactionEntryAllData.TPStartDate = res.Data.TPStartDate
            TransactionEntryAllData.TPEndDate = res.Data.TPEndDate
            TransactionEntryAllData.SumInsured = res.Data.SumInsured,
              TransactionEntryAllData.NameProposal = res.Data.NameProposal,
              TransactionEntryAllData.DateOfBirth = res.Data.DateOfBirth,
              TransactionEntryAllData.LifeInsPlanName = res.Data.LifeInsPlanName,
              TransactionEntryAllData.NameofLifeAssured = res.Data.NameofLifeAssured,
              TransactionEntryAllData.PremiumInstallmentType = res.Data.PremiumInstallmentType,
              TransactionEntryAllData.PremiumPayingTerm = res.Data.PremiumPayingTerm,
              TransactionEntryAllData.PolicyTerms = res.Data.PolicyTerms,
              TransactionEntryAllData.PolicyPeriod = res.Data.PolicyPeriod
            TransactionEntryAllData.PerBillingLimit = res.Data.PerBillingLimit,
              TransactionEntryAllData.PerLocationLimit = res.Data.PerLocationLimit,
              TransactionEntryAllData.PremiumInstallmentAmount = res.Data.PremiumInstallmentAmount,
              TransactionEntryAllData.NextPremiumPaymentDate = res.Data.NextPremiumPaymentDate,
              TransactionEntryAllData.VehicleDetail = res.Data.VehicleDetail
          }



          this.TransactionEntryForm = this._buildTransactionEntryForm(TransactionEntryAllData)


          // this.TransactionEntryForm.get('SubCategoryId').disable({ emitEvent: false })
          if ((this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Same Company'
            || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial'
            || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial'
            || this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Change Company')
            && (this.TransactionEntryForm.get('CategoryCode').value != CategoryCodeEnum.Motor)) {
            this.TransactionEntryForm.get('SubCategoryId').enable({ emitEvent: false })
          } else {
            this.TransactionEntryForm.get('SubCategoryId').disable({ emitEvent: false })
          }
          this.TransactionEntryForm.get('CategoryId').disable({ emitEvent: false })

          if (this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial') {
            this._disableFinancial();
          }

          if (this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial') {
            this._disableNonFinancial();
          }

          if (this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Same Company') {
            this._renewalDateChange();
          }

          this._onFormChange()
          this._PaymentInformationAmountChange()
          this.OnViewEditFillMasterData()


          this._getCategoryWiseInsuranceCampany(this.TransactionEntryForm.get('CategoryId').value)
          this._getInsuranceCampnyWiseProduct(this.TransactionEntryForm.get('SubCategoryId').value, this.TransactionEntryForm.get('InsuranceCompanyCode').value)
          this._getSubCategoryWiseTPPremium(this.TransactionEntryForm.get('SubCategoryId').value)
          this._getSubCategoryWiseBrandList()
          this.TransactionEntryForm.get('CategoryId').disable({ emitEvent: false })
          // this.TransactionEntryForm.get('SubCategoryId').disable({ emitEvent: false })
          if ((this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Same Company'
            || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial'
            || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial'
            || this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Change Company')
            && (this.TransactionEntryForm.get('CategoryCode').value != CategoryCodeEnum.Motor)) {
            this.TransactionEntryForm.get('SubCategoryId').enable({ emitEvent: false })
          } else {
            this.TransactionEntryForm.get('SubCategoryId').disable({ emitEvent: false })
          }
          this.TransactionEntryForm.get('BranchId').disable({ emitEvent: false })
          this.TransactionEntryForm.get('PolicyType').disable({ emitEvent: false })

          if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
            this.TransactionEntryForm.get('PremiumType').value == 'SAOD') {
            this._DisableLIABILITYPartField()
          }
          else if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
            this.TransactionEntryForm.get('PremiumType').value == 'SATP') {
            this._DisableOWNDAMAGEPartField()
          }
          else if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
            this.TransactionEntryForm.get('PremiumType').value == 'PAOD') {
            this._DisableAtPAODSelection();
          }



          // get GroupHead data by id
          this._dataservice.getDataById(res.Data.GroupHeadId, API_ENDPOINTS.GroupHead.Base).subscribe((response) => {
            if (response.Success) {
              this.groupHead(response.Data)
            }
          })

          this.TransactionEntryForm.patchValue({
            GroupHeadName: res.Data.GroupHeadName,
            GroupHeadId: res.Data.GroupHeadId,
          })

          if (this.TransactionEntryForm.get('PremiumDetail.PA').value == true) {
            if (this.TpPremiumMasterData.Success && this.TpPremiumMasterData.Data.Items.length > 0) {
              this.PassengerPAList = this.TpPremiumMasterData.Data.Items[0].TPPremiumPADetails
            }
          }
          // if (this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Same Company' || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial') {
          //   if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
          //     this.TransactionEntryForm.get('PremiumType').value == 'SAOD') {
          //     this._DisableLIABILITYPartField()
          //   }

          //   if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
          //     this.TransactionEntryForm.get('PremiumType').value == 'SATP') {
          //     this._DisableOWNDAMAGEPartField()
          //   }

          // }

          if ((this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Same Company' || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial') &&
            (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor)) {
            this.TransactionEntryForm.get('VehicleDetail').patchValue({
              BrandId: res.Data.VehicleDetail.BrandId,
              BrandName: res.Data.VehicleDetail.BrandName,
              ModelName: res.Data.VehicleDetail.ModelName,
              ModelId: res.Data.VehicleDetail.ModelId,
              SubModelId: res.Data.VehicleDetail.SubModelId,
              SubModelName: res.Data.VehicleDetail.SubModelName,
              VehicleType: res.Data.VehicleDetail.VehicleType
            }, { emitEvent: false })
          }

          if (this.mode == 'EndorsementConvert') {
            this._getCategoryData(this.TransactionEntryForm.get('CategoryCode').value, this.TransactionEntryForm.get('SubCategoryCode').value)

            let SelectedBranch = this.Branchs.find(branch => branch.Id == this.TransactionEntryForm.get('BranchId').value)

            if (SelectedBranch) {
              this.TransactionEntryForm.patchValue({
                BrokerQualifiedPersonName: SelectedBranch.BrokerQualifiedPersonName,
                BrokerQualifiedPersonId: SelectedBranch.BrokerQualifiedPersonId,
                BranchName: SelectedBranch.Name
              }, { emitEvent: false })
            } else {
              this.TransactionEntryForm.patchValue({
                BrokerQualifiedPersonName: "",
                BrokerQualifiedPersonId: 0,
                BranchName: ""
              }, { emitEvent: false })
            }
          }


        }
      })
    }
  }


  public clear(name: string, id: string): void {
    this.f[name].setValue("")
    this.f[id].setValue(null)
  }

  public clearWithIdZero(name: string, id: string): void {
    this.f[name].setValue("")
    this.f[id].setValue(0)
  }

  public clearCreditAmountAuthorized() {
    this.TransactionEntryForm.get('PaymentDetail').patchValue({
      BalanceAmountAuthorizedUserName: "",
      BalanceAmountAuthorizedUserId: "",
    })
  }

  public clearBalanceAmountcollectionResponsibility() {
    this.TransactionEntryForm.get('PaymentDetail').patchValue({
      BalancecollectionResponsibilityUserName: "",
      BalancecollectionResponsibilityUserId: "",
    })
  }

  public clearFleetBusiness() {
    this.TransactionEntryForm.get('VehicleDetail').patchValue({
      FleetBusinessName: "",
      FleetBusinessId: null,
    })
  }

  public PageReload() {
    location.reload()
  }

  public clearVehicleSModel() {
    this.TransactionEntryForm.get('VehicleDetail').patchValue({
      ModelName: "",
      ModelId: 0,
    })
  }

  public clearVehicleSubModel() {
    this.TransactionEntryForm.get('VehicleDetail').patchValue({
      SubModelName: "",
      SubModelId: 0,
      CubicCapacityORKW: "",
      PassengerCapacity: 0,
      GrossVehicleWeight: 0,
      FuelType: ""
    })
  }

  public AutocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, SelectedFor: string): void {



    switch (SelectedFor) {

      case "Broker":
        this.TransactionEntryForm.patchValue({
          BrokerQualifiedPersonName: event.option.value.FullName,
          BrokerQualifiedPersonId: event.option.value.Id,
        });
        break;

      case "Sales":
        this.TransactionEntryForm.patchValue({
          SalesPersonName: event.option.value.FullName,
          SalesPersonId: event.option.value.Id,
        });
        break;

      case "customer":
        this.TransactionEntryForm.patchValue({
          CustomerName: event.option.value.FullName,
          CustomerId: event.option.value.Id,
        });
        break;

      case "TeamRef":
        this.TransactionEntryForm.patchValue({
          TeamReferenceUserName: event.option.value.FullName,
          TeamReferenceUserId: event.option.value.Id,
        });
        break;

      case "GroupHead":
        this.TransactionEntryForm.patchValue({
          GroupHeadName: event.option.value.Name,
          GroupHeadId: event.option.value.Id,
          MobileNo: event.option.value.MobileNo,
        });

        if (event.option.value.GroupHeadAddress != undefined) {
          event.option.value.GroupHeadAddress.forEach((item, index) => {
            if (item.AddressType == event.option.value.CorrespondenceAddress) {
              this.address.controls[0].patchValue({
                AddressLine1: item.AddressLine1,
                AddressLine2: item.AddressLine2,
                CityPinCodeId: item.CityPinCodeId,
                CityPinCode: item.PinCodeNumber,
                CityName: item.CityName,
                StateName: item.StateName,
                CountryName: item.CountryName,
                StateId: item.StateId,
                CityId: item.CityId,
              })
            }
          })
        }

        break;

      case "BACR":
        this.PaymentForm.patchValue({
          BalancecollectionResponsibilityUserId: event.option.value.Id,
          BalancecollectionResponsibilityUserName: event.option.value.FullName
        });
        break;
      case "BAAB":
        this.PaymentForm.patchValue({
          BalanceAmountAuthorizedUserId: event.option.value.Id,
          BalanceAmountAuthorizedUserName: event.option.value.FullName
        });
        break;

      case "Model":
        this.TransactionEntryForm.get('VehicleDetail').patchValue({
          ModelId: event.option.value.Id,
          ModelName: event.option.value.Name,
        });
        break;

      case "SubModel":

        this.TransactionEntryForm.get('VehicleDetail').patchValue({
          SubModelId: event.option.value.Id,
          SubModelName: event.option.value.Name,
          CubicCapacityORKW: event.option.value.CC,
          FuelType: event.option.value.FuelTypeName,
          // VehicleType: event.option.value.VehicleSubType,
        });
        if (this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar || this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TwoWheeler || this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PCV) {
          this.TransactionEntryForm.get('VehicleDetail').patchValue({
            PassengerCapacity: event.option.value.SeatCapacity,
          })
        }
        // this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PCV ||
        if (this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.GCV) {
          this.TransactionEntryForm.get('VehicleDetail').patchValue({
            GrossVehicleWeight: event.option.value.GrossWeight,
          })
        }

        break;


      case "FleetBusiness":
        this.TransactionEntryForm.get('VehicleDetail').patchValue({
          FleetBusinessId: event.option.value.Id,
          FleetBusinessName: event.option.value.FleetNo,
        });
        break;

      default:
        break;
    }

  }



  public displayTransactionDataFn = (TransactionData) => {
    if (TransactionData) {
      this.TransactionEntryForm.patchValue({
        InsertTransactionNo: TransactionData.TransactionNo,
      });
      return TransactionData.TransactionNo;
    }
  };

  ResetInsertTransactionNo() {
    this.TransactionEntryForm.patchValue({
      InsertTransactionNo: "",
      TransactionData: null
    }, { emitEvent: false });
  }


  public PinCodeSelected(event: MatAutocompleteSelectedEvent, index: number): void {
    this.address.controls[index].patchValue({
      CityName: event.option.value.CityName,
      StateName: event.option.value.StateName,
      CountryName: event.option.value.CountryName,
      CityPinCodeId: event.option.value.Id,
      CityPinCode: event.option.value.PinCode,
      CityId: event.option.value.CityId,
      StateId: event.option.value.StateId,
      CountryId: event.option.value.CountryId,
    });
  }


  public CheckSameas(event) {
    if (event.target.checked) {
      this.address.controls[1].patchValue({
        AddressLine1: this.address.controls[0].value.AddressLine1,
        AddressLine2: this.address.controls[0].value.AddressLine2,
        CityId: this.address.controls[0].value.CityId,
        CityName: this.address.controls[0].value.CityName,
        CityPinCode: this.address.controls[0].value.CityPinCode,
        CityPinCodeId: this.address.controls[0].value.CityPinCodeId,
        CountryId: this.address.controls[0].value.CountryId,
        CountryName: this.address.controls[0].value.CountryName,
        StateId: this.address.controls[0].value.StateId,
        StateName: this.address.controls[0].value.StateName
      })
    }
  }

  public ClearPincode(index) {
    if (index == 0 || index == 1) {
      this.address.controls[index].get('AddressLine1').setValue(""),
        this.address.controls[index].get('AddressLine2').setValue(""),
        this.address.controls[index].get('CityPinCodeId').setValue(null),
        this.address.controls[index].get('CityPinCode').setValue(""),
        this.address.controls[index].get('CityName').setValue(""),
        this.address.controls[index].get('StateName').setValue(""),
        this.address.controls[index].get('CountryName').setValue(""),
        this.address.controls[index].get('CityId').setValue(""),
        this.address.controls[index].get('StateId').setValue(""),
        this.address.controls[index].get('CountryId').setValue("")
    }
  }

  public ExpandCollaps() {
    if (this.BasicDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.BasicDetailsAlert);
      return;
    }
    this.isExpand = !this.isExpand
    if (this.BasicDetailsValidations().valid) {
      if(this.mode == 'Create'){
        
        this.IsbasicDetailsDisable = true
        this.TransactionEntryForm.get('CategoryId').disable({ emitEvent: false })
        
        if ((this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Same Company'
        || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial'
        || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial'
        || this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Change Company')
        && (this.TransactionEntryForm.get('CategoryCode').value != CategoryCodeEnum.Motor)) {
        this.TransactionEntryForm.get('SubCategoryId').enable({ emitEvent: false })
      } else {
        this.TransactionEntryForm.get('SubCategoryId').disable({ emitEvent: false })
      }
    }
      if (this.mode == 'Create' || this.mode == 'OnlineHealthPolicyConvert' || this.mode == 'OnlineMotorPolicyConvert'){
    
      this.TransactionEntryForm.get('BranchId').disable({ emitEvent: false })
      }
    }
  }

  /**
 * pop up to create fleet details and created Fleet data patch
 */
  public openDiologForFleet() {

    if (!this.authService._userProfile.value?.AuthKeys.includes('FleetBusiness-create')) {
      this._alertservice.raiseErrorAlert("Access Permission required for Group Create.")
      return;
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";
    dialogConfig.panelClass = "fleet-dialog";
    dialogConfig.data = {
      title: 'Add ADD Fleet Details',
      mode: 'PopUpCreate'
    };

    const dialogRef = this.dialog.open(FleetPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // get GroupHead data by id
        this._dataservice.getDataById(result.Id, API_ENDPOINTS.Fleet.Base).subscribe((response) => {
          if (response.Success) {

            this.TransactionEntryForm.get('VehicleDetail').patchValue({
              FleetBusinessId: response.Data.Id,
              FleetBusinessName: response.Data.FleetNo
            })
          }
        })
      }
    });

  }


  // /* Pop Up for Name of the Insurance Company
  //  * @param type:to identify api of which list is to be called
  //   * @param title: title that will be displayed on PopUp
  //   * /
  public openDiolog(type: string, title: string, openFor: string) {
    let Rule: IFilterRule[] = [];
    let AdditionalFilters: IAdditionalFilterObject[] = []

    switch (openFor) {

      case "Broker":
        Rule = [ActiveMasterDataRule]
        break;

      case "Sales":

        Rule = [
          ActiveMasterDataRule,
          {
            Field: 'Branch.Id',
            Operator: 'eq',
            Value: this.TransactionEntryForm.get('BranchId').value,
          }
        ]

        if (this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').value) {
          AdditionalFilters = [{ key: 'UserType', filterValues: ['StandardUser', 'Agent'] }]
        }

        break;

      case "customer":
        Rule = [ActiveMasterDataRule,
          { Field: "GroupHeadId", Operator: "eq", Value: this.TransactionEntryForm.get('GroupHeadId').value }
        ]
        break;

      case "TeamRef":
        Rule = [ActiveMasterDataRule]

        if (this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').value == false) {
          AdditionalFilters = [
            { key: 'UserType', filterValues: ['TeamReference', 'Agent'] },
          ]
        } else {
          AdditionalFilters = [
            { key: 'UserType', filterValues: ['TeamReference'] }
          ]
        }
        break;

      case "GroupHead":
        Rule = [ActiveMasterDataRule,
          {
            Field: "Branch.Id",
            Operator: "eq",
            Value: this.TransactionEntryForm.get('BranchId').value
          },
        ]
        break;

      case "BACR":
        Rule = [ActiveMasterDataRule]
        break;

      case "BAAB":
        Rule = [ActiveMasterDataRule]
        break;

      case "VehicleDetailModel":
        Rule = [ActiveMasterDataRule,
          {
            Field: "Brand.Id",
            Operator: "eq",
            Value: this.TransactionEntryForm.get('VehicleDetail.BrandId').value
          }, {
            Field: "Type",
            Operator: "contains",
            Value: this.TransactionEntryForm.get('SubCategoryName').value
          }
        ]
        break;

      case "VehicleDetailSubModel":
        Rule = [ActiveMasterDataRule,
          {
            Field: "Model.Id",
            Operator: "eq",
            Value: this.TransactionEntryForm.get('VehicleDetail.ModelId').value
          }, {
            Field: "Model.Type",
            Operator: "contains",
            Value: this.TransactionEntryForm.get('SubCategoryName').value
          }
        ]
        break;

      case "Transaction":
        Rule = [
          {
            Field: "Category.Name",
            Operator: "contains",
            Value: this.f['CategoryName'].value
          },
          {
            Field: "Branch.Name",
            Operator: "contains",
            Value: this.f['BranchName'].value
          }
        ]

        if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
          Rule.push({
            Field: "SubCategory.Name",
            Operator: "contains",
            Value: this.f['SubCategoryName'].value
          })
        }

        if (this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial'
          || this.TransactionEntryForm.get('PolicyType').value == 'Installment') {
          Rule.push({
            Field: "PolicyType",
            Operator: "in",
            Value: ["New", "Rollover", "Renewal-Same Company", "Renewal-Change Company"]
          })
        }
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
      filterData: Rule,
      addFilterData: AdditionalFilters
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        switch (openFor) {

          case "Broker":
            this.TransactionEntryForm.patchValue({
              BrokerQualifiedPersonName: result.FullName,
              BrokerQualifiedPersonId: result.Id,
            });
            break;

          case "Sales":
            this.TransactionEntryForm.patchValue({
              SalesPersonName: result.FullName,
              SalesPersonId: result.Id,
            });
            break;

          case "customer":
            this.TransactionEntryForm.patchValue({
              CustomerName: result.FullName,
              CustomerId: result.Id,
            })
            break;

          case "TeamRef":
            this.TransactionEntryForm.patchValue({
              TeamReferenceUserName: result.FullName,
              TeamReferenceUserId: result.Id,
            });
            break;

          case "GroupHead":
            this.TransactionEntryForm.patchValue({
              GroupHeadName: result.Name,
              GroupHeadId: result.Id,
              MobileNo: result.MobileNo,
            })

            if (result.GroupHeadAddress != undefined) {
              result.GroupHeadAddress.forEach((item, index) => {
                if (item.AddressType == result.CorrespondenceAddress) {
                  this.address.controls[0].patchValue({
                    AddressLine1: item.AddressLine1,
                    AddressLine2: item.AddressLine2,
                    CityPinCodeId: item.CityPinCodeId,
                    CityPinCode: item.PinCodeNumber,
                    CityName: item.CityName,
                    StateName: item.StateName,
                    CountryName: item.CountryName,
                    StateId: item.StateId,
                    CityId: item.CityId,
                  })
                }
              })
            }
            break;

          case "BACR":
            this.PaymentForm.patchValue({
              BalancecollectionResponsibilityUserId: result.Id,
              BalancecollectionResponsibilityUserName: result.FullName,
            });
            break;

          case "BAAB":
            this.PaymentForm.patchValue({
              BalanceAmountAuthorizedUserId: result.Id,
              BalanceAmountAuthorizedUserName: result.FullName,
            });
            break;

          case "VehicleDetailModel":
            this.TransactionEntryForm.get('VehicleDetail').patchValue({
              ModelId: result.Id,
              ModelName: result.Name,
            });

            break;

          case "VehicleDetailSubModel":


            this.TransactionEntryForm.get('VehicleDetail').patchValue({
              SubModelId: result.Id,
              SubModelName: result.Name,
              CubicCapacityORKW: result.CC,
              FuelType: result.FuelTypeName,
              // VehicleType: result.VehicleSubType,
            });
            if (this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar || this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TwoWheeler || this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PCV) {
              this.TransactionEntryForm.get('VehicleDetail').patchValue({
                PassengerCapacity: result.SeatCapacity,
              })
            }
            // this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PCV || 
            if (this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.GCV) {
              this.TransactionEntryForm.get('VehicleDetail').patchValue({
                GrossVehicleWeight: result.GrossWeight,
              })
            }


            break;

          case "Transaction":
            this.TransactionEntryForm.patchValue({
              InsertTransactionNo: result.TransactionNo,
              TransactionData: result
            }, { emitEvent: false })
            this.GetTransactionData(result.Id)
            break;

          default:
            break;
        }
      }

    })
  }

  public openDiologForPINcode(type: string, title: string, index: number) {


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
        this.address.controls[index].patchValue({
          CityName: result.CityName,
          StateName: result.StateName,
          CountryName: result.CountryName,
          CityPinCodeId: result.Id,
          CityPinCode: result.PinCode,
          CityId: result.CityId,
          StateId: result.StateId,
          CountryId: result.CountryId,
        })
      }

    });
  }


  public openDiologForPreviousPolicy() {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      formGroupData: this.TransactionEntryForm.value,
      InsuranceCompany: this.InsuranceCompany$,
      SubCategoryWisePolicyType: this.SubCategoryWisePolicyType,
      PreviousPolicyDoc: this.PreviuospolicyDoc
    };
    const dialogRef = this.dialog.open(PreviousPolicyDetailsComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.TransactionEntryForm.patchValue({
          PrevPolicyInsurComp: result.PrevPolicyInsurComp,
          PrevPolicyPeriod: result.PrevPolicyPeriod,
          PrevPolicySumInsured: result.PrevPolicySumInsured,
          PrevPolicyType: result.PrevPolicyType
        })


        let PrevPolicyDocIndex = this.document.controls.findIndex(doc =>
          doc.get('DocumentType').value == 'PreviousPolicy'
        )

        if (result.PrevPolicyDoc.FileName && result.PrevPolicyDoc.ImageUploadPath) {


          if (PrevPolicyDocIndex >= 0) {
            this.document.controls[PrevPolicyDocIndex].patchValue({
              DocumentType: result.PrevPolicyDoc.DocumentType,
              FileName: result.PrevPolicyDoc.FileName,
              ImageUploadName: result.PrevPolicyDoc.ImageUploadName,
              ImageUploadPath: result.PrevPolicyDoc.ImageUploadPath
            })
          } else {
            const row: IDocumentsDto = new DocumentsDto();
            row.DocumentType = result.PrevPolicyDoc.DocumentType;
            row.DocumentTypeName = result.PrevPolicyDoc.DocumentType;
            row.ImageUploadName = result.PrevPolicyDoc.ImageUploadName,
              row.ImageUploadPath = result.PrevPolicyDoc.ImageUploadPath
            row.FileName = result.PrevPolicyDoc.FileName,
              this.document.push(this._initDocumentsForm(row));
          }
        } else {
          if (PrevPolicyDocIndex >= 0) {
            this.document.removeAt(PrevPolicyDocIndex)
          }
        }

      }
    });
  }


  /** Pop Up to add new Group Header */
  public openDiologForGroupHead() {


    if (!this.authService._userProfile.value?.AuthKeys.includes('GroupHead-create')) {
      this._alertservice.raiseErrorAlert("Access Permission required for Group Create.")
      return;
    }

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";
    dialogConfig.panelClass = "group-head-dialog";

    dialogConfig.data = {
      title: 'Add New Group Head',
      mode: 'PopUpCreate',
      BranchId: this.TransactionEntryForm.get('BranchId').value,
      BranchName: this.TransactionEntryForm.get('BranchName').value,
    };
    const dialogRef = this.dialog.open(GroupHeadPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // get GroupHead data by id
        this._dataservice.getDataById(result.Id, API_ENDPOINTS.GroupHead.Base).subscribe((response) => {
          if (response.Success) {
            this.TransactionEntryForm.patchValue({
              GroupHeadName: response.Data.Name,
              GroupHeadId: response.Data.Id,
              MobileNo: response.Data.MobileNo,
            })

            if (response.Data.GroupHeadAddress != undefined) {
              response.Data.GroupHeadAddress.forEach((item, index) => {
                if (item.AddressType == response.Data.CorrespondenceAddress) {
                  this.address.controls[0].patchValue({
                    AddressLine1: item.AddressLine1,
                    AddressLine2: item.AddressLine2,
                    CityPinCodeId: item.CityPinCodeId,
                    CityPinCode: item.PinCodeNumber,
                    CityName: item.CityName,
                    StateName: item.StateName,
                    CountryName: item.CountryName,
                    StateId: item.StateId,
                    CityId: item.CityId,
                  })
                }
              })
            }
          }
        })
      }
    });
  }

  /**
  * when date is invalid
  * @param event :blur event
  * @param field :name of the formcontrol and id of input
  */
  public validateDate(event, field) {
    if (this.TransactionEntryForm.get(field).invalid) {
      this._alertservice.raiseErrorAlert('Enter valid Date');
      document.getElementById(field).focus()
    }

  }

  public validatePaymentDetailsDate(event, field) {
    if (this.PaymentForm.get(field).invalid) {
      this._alertservice.raiseErrorAlert('Enter valid Date');
      document.getElementById(field).focus()
    }

  }

  // public validateDate(event) {

  //   if (this.PaymentForm.get('DatebywhichBalancewillbecollected').invalid) {
  //     if (this.PaymentForm.get('DatebywhichBalancewillbecollected').value == '') {

  //     }
  //     else {
  //       this._alertservice.raiseErrorAlert('Enter valid Date');
  //       document.getElementById("DWBWC").focus()
  //     }

  //   }

  //   if (this.PaymentForm.get('ChequeDate').invalid) {
  //     this._alertservice.raiseErrorAlert('Enter valid Date');
  //     document.getElementById("ChequeDate").focus()
  //   }

  // }

  /**
 * add new row in CoShares array
 */
  public addCoSharesRow() {
    let error = this.CoShareValidation()
    if (error.length > 0) {
      this._alertservice.raiseErrors(error)
      return
    }
    var row: ICoSharesDto = new CoSharesDto()
    row.COshare = this.CoShareBool.value
    row.COshareInsurer = this.CoShareName.value
    row.COshareInsurerShortName = this.CoShareName.value
    row.COshareInsurerCode = this.CoShareId.value
    row.COshareper = this.CoSharePercent.value
    this.Coshare.push(this._initCoSharesForm(row))
    this.Coshare.controls[0].patchValue({
      COshareper: (this.Coshare.controls[0].value.COshareper - parseFloat(this.CoSharePercent.value))
    })
    this.clearCoShare()

  }

  /**
  * delete a row from CoShares array based on the index
  * @param index : index number of row
  */
  public deleteCoSharesRow(index) {
    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.Coshare.removeAt(index);

          this.Coshare.controls[0].patchValue({
            COshareper: (100 - this.CosharePerSum).toFixed(2)
          })
        }
      })


  }

  /**
 * reset value of CoShare
 */
  private clearCoShare() {
    // this.CoShareBool.reset(false)
    this.CoShareId.reset()
    this.CoShareName.reset()
    this.CoSharePercent.reset()
  }


  /**
   * edit CoShare % in table
   * @param index :index number
   */
  public editCoShareRow(index) {
    this.Coshare.controls[index].patchValue({
      EditCoSharePer: true
    })
  }

  /**
   * check the condition and if satisfied save the change.
   * @param index : index number
   * @returns
   */
  public saveCoShareRow(index) {

    if ((100 - this.CosharePerSum) < 1) {
      this._alertservice.raiseErrorAlert('Total Co-Share Percentage can not be greater than 100')
      return
    }
    this.Coshare.controls[0].patchValue({
      COshareper: (100 - this.CosharePerSum).toFixed(2)
    })
    this.Coshare.controls[index].patchValue({
      EditCoSharePer: false
    })
  }


  /** Pop Up to add new Product/Plan */
  public openDiologForProductPlan() {
    if (!this.authService._userProfile.value?.AuthKeys.includes('Product-create')) {
      this._alertservice.raiseErrorAlert("Access Permission required for Group Create.")
      return;
    }
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";
    dialogConfig.panelClass = "product-plan";

    dialogConfig.data = {
      title: 'Add Product/Plan',
      mode: 'PopUpCreate',
      CategoryName: this.f['CategoryName'].value,
      CategoryId: this.f['CategoryId'].value,
      SubCategoryName: this.f['SubCategoryName'].value,
      SubCategoryId: this.f['SubCategoryId'].value,
      InsurerCode: this.TransactionEntryForm.get('InsuranceCompanyCode').value,
      InsurerName: this.TransactionEntryForm.get('InsuranceCompany').value
    };
    const dialogRef = this.dialog.open(ProductPlanPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        let Rule: IFilterRule[] = [
          ActiveMasterDataRule,
          {
            Field: "SubCategory.Id",
            Operator: "eq",
            Value: this.TransactionEntryForm.get('SubCategoryId').value
          },
          {
            Field: "InsurerCode",
            Operator: "eq",
            Value: this.TransactionEntryForm.get('InsuranceCompanyCode').value
          }
        ]

        this._dataservice.getDataByCode(result.Code, result.InsurerCode, API_ENDPOINTS.ProductPlan.Base).subscribe((response) => {
          if (response.Success) {

            this._getInsuranceCampnyWiseProduct(this.TransactionEntryForm.get('SubCategoryId').value, this.TransactionEntryForm.get('InsuranceCompanyCode').value)
            this.TransactionEntryForm.patchValue({
              ProductCode: response.Data.ProductCode,
            })

          }
        })
      }
    });
  }

  /**
 * @param data :
 */
  public groupHead(data) {

    this.GroupHeadRespons = new BehaviorSubject(null);
    this.GroupHeadRespons.next(data)

    this.GroupHeadResponseData = this.GroupHeadRespons.asObservable()
  }

  //disabled function for options in dropdown vehicle category
  public checkValue(documentTypeName: string): boolean {
    return this.selectedDocumentTypes.includes(documentTypeName);
  }

  public onDocumentSelectionChange(selectedValue): void {
    this._validateAttachDocField()

    if (this.AttachDocumentAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachDocumentAlerts)
      this.DocumentDropdown.nativeElement.value = ""
      return;
    }

    let selectedDocument = selectedValue.target.value;
    if (!this.selectedDocumentTypes.includes(selectedDocument)) {
      this.selectedDocumentTypes.push(selectedDocument);
    } else {
      this.selectedDocumentTypes = this.selectedDocumentTypes.filter(type => type !== selectedDocument);
    }

    // for in case of document type select is Other then "IsRemarks" value is true other wise false
    // "IsRemarks" is "true" then "Other Remarks" Field is show other wise hide
    if (selectedDocument == "Other") {
      this.IsRemark = true;
    }

    this.addDocuments(selectedDocument);
    this.DocumentDropdown.nativeElement.value = ""
  }

  public addDocuments(selectedDocument?: string) {

    const row: IDocumentsDto = new DocumentsDto();

    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.PolicyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.PolicyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.PolicyDocumentList[RowIndex].DocumentTypeName;
        this.document.push(this._initDocumentsForm(row));
      }
    }
  }

  // Remove row in Document array
  public RemoveDocuments(index: number, docObj) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.document.removeAt(index)

          let OtherDocsCount = 0;
          // get Other document count from Documents array
          this.document.controls.forEach(el => {
            if (el.value.DocumentType == "Other") {
              OtherDocsCount++;
            }
          });

          let selectedDoctypeIndex = this.selectedDocumentTypes.findIndex(doctype => doctype == docObj.DocumentType)


          if (selectedDoctypeIndex != -1) {
            this.selectedDocumentTypes.splice(selectedDoctypeIndex, 1)
          }

          // for in case of document type select is Other then "IsRemarks" value is true other wise false
          // "IsRemarks" is "true" then "Other Remarks" Field is show other wise hide
          if (docObj.DocumentType == "Other" && OtherDocsCount == 0) {
            this.IsRemark = false;
          }

        }

      });


  }

  public RemoveMandateDocuments() {
    let mandateDocIndex = this.document.value.findIndex(doc => doc.DocumentType == 'Mandate')
    if (mandateDocIndex >= 0) {
      this.document.removeAt(mandateDocIndex)
    }
  }

  public ViewQnDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  // file data (policy document that is added)
  public SelectTransactionDocument(event, DocumentType: string, DocumentTypeName: string, index: number = null) {
    let file = event.target.files[0]

    if (file) {

      let FileName = file.name.split('.')
      if (FileName && FileName.length >= 2) {
        let fileExtention = FileName[FileName.length - 1]
        if (DocumentType != 'Mandate' && !(fileExtention.toLowerCase() == 'pdf' ||
          fileExtention.toLowerCase() == 'doc' ||
          fileExtention.toLowerCase() == 'docx')) {
          this._alertservice.raiseErrorAlert("Please select a valid Word or PDF File")
          return;
        }


        this._dataservice
          .UploadFile(this.UploadFileAPI, file)
          .subscribe((res) => {
            if (res.Success) {

              // for policy documents array loop
              if (index != null) {
                if (this.document.controls != undefined) {
                  this.document.controls.forEach((el, i) => {
                    if (el.value.DocumentType == DocumentType && i == index) {
                      el.patchValue({
                        FileName: res.Data.FileName,
                        ImageUploadName: res.Data.StorageFileName,
                        ImageUploadPath: res.Data.StorageFilePath
                      });
                    }
                  });
                }
              }
              else {

                //  for Mandate document and other individual document 
                let DocIndex = this.document.controls.findIndex((doc) => doc.get('DocumentType').value === DocumentType)

                if (DocIndex >= 0) {
                  this.document.controls[DocIndex].patchValue({
                    FileName: res.Data.FileName,
                    ImageUploadName: res.Data.StorageFileName,
                    ImageUploadPath: res.Data.StorageFilePath
                  })
                } else {
                  const row: IDocumentsDto = new DocumentsDto();
                  row.DocumentType = DocumentType;
                  row.DocumentTypeName = DocumentTypeName;
                  row.ImageUploadName = res.Data.StorageFileName,
                    row.ImageUploadPath = res.Data.StorageFilePath
                  row.FileName = res.Data.FileName,
                    this.document.push(this._initDocumentsForm(row));
                }
              }

              this._alertservice.raiseSuccessAlert(res.Message);


            }
            else {
              this._alertservice.raiseErrors(res.Alerts);
            }
          });

      } else {
        this._alertservice.raiseErrorAlert("Please select a valid  File")
        return;
      }

      return


    }

  }


  public AddCustomerEmail(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if (!value.trim()) {
      this._alertservice.raiseErrorAlert("Customer Email is required.")
      return;
    }

    if (!this.emailValidationReg.test(value.trim())) {
      this._alertservice.raiseErrorAlert("Enter Valid Customer Email.")
      return;
    }

    // Add our fruit
    if ((value || '').trim()) {
      this.EmailArray.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  public RemovedCustomerEmail(email: any): void {
    this.EmailArray.splice(email, 1);
  }


  /**
  * When Focus out on Vehicle Number Bind First Four DIGIT of vehicle number in RTO code
  */
  public bindVehicleCode() {
    let VehicleNo = this.TransactionEntryForm.get('VehicleDetail.VehicleNumber').value
    if (this.TransactionEntryForm.get('PolicyType').value != 'New') {
      if (VehicleNo.length > 4) {
        this.TransactionEntryForm.get('VehicleDetail.RTOCode').setValue(VehicleNo.substring(0, 4))
      }
    } else {
      this.TransactionEntryForm.get('VehicleDetail.RTOCode').setValue('New')
    }
  }

  public ClearSearchCtrl() {
    this.BrandSearchCtrl.setValue('')
  }


  /**
   * Calculate Policy End date for Fire/Engineering/Health/Group/Marine/Liability/WC/Misc/Package/PA
   * PolicyEndDate = (Start Date) + 1 Year - (1 Day)
   */
  public _calculatePolicyEndDate() {

    if (this.f['CategoryCode'].value == CategoryCodeEnum.Fire ||
      this.f['CategoryCode'].value == CategoryCodeEnum.Engineering ||
      // this.f['CategoryCode'].value == CategoryCodeEnum.Health ||
      this.f['CategoryCode'].value == CategoryCodeEnum.Group ||
      this.f['CategoryCode'].value == CategoryCodeEnum.Marine ||
      this.f['CategoryCode'].value == CategoryCodeEnum.Liability ||
      this.f['CategoryCode'].value == CategoryCodeEnum.WorkmenComp ||
      this.f['CategoryCode'].value == CategoryCodeEnum.Miscellaneous ||
      this.f['CategoryCode'].value == CategoryCodeEnum.Package ||
      this.f['CategoryCode'].value == CategoryCodeEnum.PA) {

      let PolicyStartDate = this.TransactionEntryForm.get('StartDate').value;

      if (PolicyStartDate != "" && PolicyStartDate != null) {

        let startDate = this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd');
        let PolicyEndDate = new Date(startDate);

        PolicyEndDate.setFullYear(PolicyEndDate.getFullYear() + 1) // set year
        PolicyEndDate.setDate(PolicyEndDate.getDate() - 1);  // one day les

        this.TransactionEntryForm.get('EndDate').patchValue(PolicyEndDate);
      }
    }
  }


  /**
 * Calculate Policy End date for Life Insurance Category
 * PolicyEndDate = (Policy Start Date) + (Policy Term - Year) - (1 Day)
 */
  public setPolicyEndDateForLife() {
    let PolicyStartDate = this.TransactionEntryForm.get('StartDate').value;
    let PolicyTermYear = this.TransactionEntryForm.get('PolicyTerms').value;

    if (PolicyStartDate != "" && PolicyStartDate != null && PolicyTermYear != "" && PolicyTermYear != null) {

      let startDate = this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd');
      let PolicyEndDate = new Date(startDate);

      PolicyEndDate.setFullYear(PolicyEndDate.getFullYear() + parseFloat(PolicyTermYear)) // set year
      PolicyEndDate.setDate(PolicyEndDate.getDate() - 1);  // one day les

      this.TransactionEntryForm.get('EndDate').patchValue(PolicyEndDate);
    }

  }


  /**
  * Premium Details calculations
  */
  public ODPremiumChange() {

    /*
    Basic OD Premium: User Entry Field
    NCB Amount Formula: Basic OD Premium * NCB %
    Discount Amount Formula: [Basic OD Premium - (NCB Amount)] * Discount % (If the Discount % is not inserted then allow the User to directly insert the Discount Value)
    OD Premium Formula: Basic OD Premium - NCB Amount - Discount Amount
    Add on Premiun: User Entry Field
    Total OD Premium: OD Premium + Add on Premium
    Total OD GST Amount : (Total OD Premium)*GST %
    Basic TP Premium : User Entry Field
    Paid Driver Formula: Auto-fetch the PD, LL & CNG Amounts As per the TP Premium Master
    LL Driver Formula: Auto-fetch the PD, LL & CNG Amounts As per the TP Premium Master
    CNG Formula: Auto-fetch the PD, LL & CNG Amounts As per the TP Premium Master
    Passanger PA Formula: Based on inserted PA Sum Insured Amount. Amit Sir will share the Sum Insured wise Slab Details for Passenger PA Calculation.
    PA Owner Driver Formula: Auto-fetch the OD Amount As per the Owner Driver Premium Master
    Other Liability Premium: PD + LL + CNG + Passenger PA + Owner Driver
    Total Liability Premium: Basic TP Premium + Other Liability Premium
    Basic TP GST Amount Formula: Basic TP Premium *  Basic TP GST %
    Other Liability GST Amount Formula: Total Liability Premium *  Basic TP GST %
    Net Premium : Total OD Premium + Total Liability
    Total Premium Formula: Net OD Premium + GST OD Amount + TP Basic Amount + TP Basic GST Amount + TP Other Premium + TP Other GST Amount

    */
    let BasicODPremium: number = 0;
    let NCBPer: number = 0;
    let DiscountPer: number = 0;
    let ODGSTPer: number = 0;
    let NCBAmount: number = 0;
    let TPGSTPer: number = 0;
    let DiscountAmount: number = 0;
    let ODPremium: number = 0;
    let AddonPremiun: number = 0;
    let TotalODPremium: number = 0;
    let TotalODGSTAmount: number = 0;
    let BasicTPPremium: number = 0;
    let PaidDriver: number = 0;
    let LLDriver: number = 0;
    let CNG: number = 0;
    let PassangerPA: number = 0;
    let PAOwnerDriver: number = 0;
    let OtherLiabilityPremium: number = 0;
    let TotalTPPremium: number = 0;
    let OtherLiabilityGSTPer: number = 0;
    let BasicTPGSTAmount: number = 0;
    let OtherLiabilityGSTAmount: number = 0;
    let TotalPremium: number = 0;
    let TotalNetPremium: number = 0;

    if (this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value) {
      BasicODPremium = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value)
    }

    if (this.TransactionEntryForm.get('PremiumDetail.NCBPer').value) {
      NCBPer = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.NCBPer').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.NCBPer').value)
    }
    //if (this.TransactionEntryForm.get('PremiumDetail.NCBPremium').value)
    NCBAmount = NCBPer * BasicODPremium / 100
    this.TransactionEntryForm.get('PremiumDetail.NCBPremium').patchValue(NCBAmount.toFixed(2))

    if (this.TransactionEntryForm.get('PremiumDetail.DiscountPer').value) {
      DiscountPer = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.DiscountPer').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.DiscountPer').value)
    }
    /**
     * remove Discount Amount Calculation in V-20
     */
    // if (this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value)
    // DiscountAmount = (BasicODPremium - NCBAmount) * DiscountPer / 100
    // this.TransactionEntryForm.get('PremiumDetail.DiscountAmount').patchValue(DiscountAmount.toFixed(2))

    if (this.TransactionEntryForm.get('PremiumDetail.DiscountAmount').value) {
      DiscountAmount = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.DiscountAmount').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.DiscountAmount').value)
    }


    // if (this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value)
    ODPremium = BasicODPremium - NCBAmount - DiscountAmount
    this.TransactionEntryForm.get('PremiumDetail.NetODPremium').patchValue(ODPremium.toFixed(2))

    if (this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').value) {
      AddonPremiun = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').value)
    }

    // if (this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value)
    TotalODPremium = ODPremium + AddonPremiun
    this.TransactionEntryForm.get('PremiumDetail.TotalODPremium').patchValue(TotalODPremium.toFixed(2))

    if (this.TransactionEntryForm.get('PremiumDetail.ODGSTPer').value) {
      ODGSTPer = parseFloat(this.TransactionEntryForm.get('PremiumDetail.ODGSTPer').value)
    }
    TotalODGSTAmount = TotalODPremium * ODGSTPer / 100
    this.TransactionEntryForm.get('PremiumDetail.ODGSTAmount').patchValue(TotalODGSTAmount.toFixed(2))

    if (this.TransactionEntryForm.get('PremiumDetail.BasicTPPremium').value)
      BasicTPPremium = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.BasicTPPremium').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.BasicTPPremium').value)
    if (this.TransactionEntryForm.get('PremiumDetail.PaidDriverPremium').value)
      PaidDriver = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.PaidDriverPremium').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.PaidDriverPremium').value)
    if (this.TransactionEntryForm.get('PremiumDetail.LLDriverPremium').value)
      LLDriver = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.LLDriverPremium').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.LLDriverPremium').value)
    if (this.TransactionEntryForm.get('PremiumDetail.CNGAmount').value)
      CNG = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.CNGAmount').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.CNGAmount').value)

    if (this.TransactionEntryForm.get('PremiumDetail.PAPremium').value)
      PassangerPA = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.PAPremium').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.PAPremium').value)

    if (this.TransactionEntryForm.get('PremiumDetail.OwnerDriverPremium').value)
      PAOwnerDriver = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.OwnerDriverPremium').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.OwnerDriverPremium').value)
    // if (this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value)

    OtherLiabilityPremium = PaidDriver + LLDriver + CNG + PassangerPA + PAOwnerDriver

    this.TransactionEntryForm.get('PremiumDetail.OtherLiabilityPremium').patchValue(OtherLiabilityPremium.toFixed(2))


    // if (this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value)
    TotalTPPremium = BasicTPPremium + OtherLiabilityPremium
    this.TransactionEntryForm.get('PremiumDetail.TotalTPPremium').patchValue(TotalTPPremium.toFixed(2))


    if (this.TransactionEntryForm.get('PremiumDetail.TPGSTPer').value) {
      TPGSTPer = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.TPGSTPer').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.TPGSTPer').value)
    }

    BasicTPGSTAmount = BasicTPPremium * TPGSTPer / 100
    this.TransactionEntryForm.get('PremiumDetail.TPGSTAmount').patchValue(BasicTPGSTAmount.toFixed(2))


    if (this.TransactionEntryForm.get('PremiumDetail.OtherLiabilityGSTPer').value) {
      OtherLiabilityGSTPer = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.OtherLiabilityGSTPer').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.OtherLiabilityGSTPer').value)
    }

    OtherLiabilityGSTAmount = OtherLiabilityPremium * OtherLiabilityGSTPer / 100
    this.TransactionEntryForm.get('PremiumDetail.OtherLiabilityGSTAmount').patchValue(OtherLiabilityGSTAmount.toFixed(2))

    // if (this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value)
    TotalPremium = TotalODPremium + TotalTPPremium
    this.TransactionEntryForm.get('PremiumDetail.TotalPremium').patchValue(TotalPremium.toFixed(2))

    // if (this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value)
    // Total Premium Formula: Net OD Premium + GST OD Amount + TP Basic Amount + TP Basic GST Amount + TP Other Premium + TP Other GST Amount
    TotalNetPremium = TotalODPremium + TotalODGSTAmount + BasicTPPremium + BasicTPGSTAmount + OtherLiabilityPremium + OtherLiabilityGSTAmount
    this.TransactionEntryForm.get('PremiumDetail.TotalNetPremium').patchValue(TotalNetPremium.toFixed(2))


    // let ncbAmount = this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value * (this.TransactionEntryForm.get('PremiumDetail.NCBPer').value / 100)
    // this.TransactionEntryForm.get('PremiumDetail.NCBPremium').patchValue(ncbAmount)

  }



  public onChange(event, type: string) {

    if (type == "PaidDriver") {
      this.getTPAddOnPremiumAmount(type)
      if (event.target.checked === false) {
        this.TransactionEntryForm.get('PremiumDetail.PaidDriverPremium').patchValue(0);
      }
    }
    else if (type == "LLDriver") {
      this.getTPAddOnPremiumAmount(type)
      if (event.target.checked === false) {
        this.TransactionEntryForm.get('PremiumDetail.LLDriverPremium').patchValue(0);
      }
    }
    else if (type == "CNG") {
      this.getTPAddOnPremiumAmount(type)
      if (event.target.checked === false) {
        this.TransactionEntryForm.get('PremiumDetail.CNGAmount').patchValue(0);
      }
    }
    else if (type == "OwnerDriver") {
      this.getTPAddOnPremiumAmount(type)
      if (event.target.checked === false) {
        this.TransactionEntryForm.get('PremiumDetail.OwnerDriverPremium').patchValue(0);
      }
    }
    else if (type == "PA") {
      if (event.target.checked === false) {
        this.TransactionEntryForm.get('PremiumDetail.PAPremium').patchValue(0);
        this.TransactionEntryForm.get('PremiumDetail.PASumInsure').patchValue("");
        this.PassengerPAList = []
      } else {
        if (this.TpPremiumMasterData.Success && this.TpPremiumMasterData.Data.Items.length > 0) {
          this.PassengerPAList = this.TpPremiumMasterData.Data.Items[0].TPPremiumPADetails
        }
      }
    }

    this.ODPremiumChange();
  }


  public BasicDetailsValidations() {
    this.BasicDetailsAlert = []

    if (this.TransactionEntryForm.get('CategoryId').value == 0 || this.TransactionEntryForm.get('CategoryId').value == null) {
      this.BasicDetailsAlert.push({
        Message: 'Select Product Category',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionEntryForm.get('SubCategoryId').value == 0 || this.TransactionEntryForm.get('SubCategoryId').value == null) {
      this.BasicDetailsAlert.push({
        Message: 'Select Product Sub Category',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionEntryForm.get('BranchId').value == 0 || this.TransactionEntryForm.get('BranchId').value == null) {
      this.BasicDetailsAlert.push({
        Message: 'Select Branch',
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

  /**
 * step one validation
 */
  public PolicyDetailsValidations() {
    this.PolicyDetailsAlert = []
    let CoShare = this.CoShareBool.value

    if (this.TransactionEntryForm.get('TransactionDate').invalid) {
      this.PolicyDetailsAlert.push({
        Message: 'Enter Date of Entry',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionEntryForm.get('PolicyType').invalid) {
      this.PolicyDetailsAlert.push({
        Message: 'Select Policy Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionEntryForm.get('InsuranceCompanyCode').invalid) {
      this.PolicyDetailsAlert.push({
        Message: 'Select Insurance Company',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if ((this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Same Company' ||
      this.TransactionEntryForm.get('PolicyType').value == 'Renewal-Change Company' ||
      this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' ||
      this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial') && this.mode == 'Create') {
      if (this.TransactionEntryForm.get('InsertTransactionNo').value == "") {
        this.PolicyDetailsAlert.push({
          Message: 'Insert Transaction ID is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }


    if (CoShare == true && this.Coshare.length == 0) {
      this.PolicyDetailsAlert.push({
        Message: 'Add atleast one Co-Share data',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.Coshare.length > 0) {
      let CompanyInCoShare: boolean = false
      let sum: number = 0
      this.Coshare.controls.forEach((item) => {
        sum = sum + parseFloat(item.get('COshareper').value)
        if (item.get('COshareInsurerCode').value == this.TransactionEntryForm.get('InsuranceCompanyCode').value) {
          CompanyInCoShare = true
        }
      })
      if (CompanyInCoShare == false) {
        this.PolicyDetailsAlert.push({
          Message: `${this.TransactionEntryForm.get('InsuranceCompany').value} must be selected in Co-Share Insurance Company list`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
      if (sum > 100) {
        this.PolicyDetailsAlert.push({
          Message: 'Total Co-Share Percentage can not be greater than 100',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.TransactionEntryForm.get('PolicyType').value == 'Rollover') {


      if (this.TransactionEntryForm.get('PrevPolicyInsurComp').value == "" ||
        this.TransactionEntryForm.get('PrevPolicyInsurComp').value == null) {
        this.PolicyDetailsAlert.push({
          Message: 'Select Previous Insurance Company',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TransactionEntryForm.get('PrevPolicySumInsured').value == 0 ||
        this.TransactionEntryForm.get('PrevPolicySumInsured').value == null) {
        this.PolicyDetailsAlert.push({
          Message: 'Enter Previous Insurance Sum Inssured',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if ((this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) && (this.TransactionEntryForm.get('PrevPolicyType').value == "" ||
        this.TransactionEntryForm.get('PrevPolicyType').value == null)) {
        this.PolicyDetailsAlert.push({
          Message: 'Select Previous Policy Type',
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }

    if (this.PolicyDetailsAlert.length > 0) {
      this.PolicyDetailsStepCtrl.setErrors({ required: true });
      return this.PolicyDetailsStepCtrl;
    }
    else {
      this.PolicyDetailsStepCtrl.reset();
      return this.PolicyDetailsStepCtrl;
    }

  }


  public PolicyDetailsError() {
    if (this.PolicyDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.PolicyDetailsAlert);
      return;
    }
  }


  public CustomerDetailsValidations() {
    this.CustomerDetailsAlert = []
    if (this.TransactionEntryForm.get('GroupHeadName').invalid) {
      this.CustomerDetailsAlert.push({
        Message: 'Select Group Head',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionEntryForm.get('CustomerId').value == 0 && this.TransactionEntryForm.get('CustomerName').valid) {
      let Name = this.TransactionEntryForm.get('CustomerName').value.trim().replace(/ +/g, ' ').split(' ')
      if (Name.length < 2) {
        this.CustomerDetailsAlert.push({
          Message: 'Enter Full Customer Name [First Name + Last Name]',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.TransactionEntryForm.get('CustomerName').invalid) {
      this.CustomerDetailsAlert.push({
        Message: 'Select Customer Name',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionEntryForm.get('MobileNo').invalid) {
      if (this.TransactionEntryForm.get('MobileNo').value) {
        this.CustomerDetailsAlert.push({
          Message: 'Enter valid Mobile Number',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        this.CustomerDetailsAlert.push({
          Message: 'Enter Mobile Number',
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }

    if (this.CustomerDetailsAlert.length > 0) {
      this.CustomerDetailsStepCtrl.setErrors({ required: true });
      return this.CustomerDetailsStepCtrl;
    }
    else {
      this.CustomerDetailsStepCtrl.reset();
      return this.CustomerDetailsStepCtrl;
    }
  }

  // Customer Details error message
  public CustomerDetailsError() {

    if (this.CustomerDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.CustomerDetailsAlert);
      return;
    }
  }

  // step four validation
  public categoryInfoMotorValidations() {
    this.categoryInfoMotorAlert = []

    if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
      if (this.TransactionEntryForm.get('VehicleDetail.BrandId').value == 0) {
        this.categoryInfoMotorAlert.push({
          Message: 'Select Manufacturer/Brand Name',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TransactionEntryForm.get('VehicleDetail.ModelId').value == 0) {
        this.categoryInfoMotorAlert.push({
          Message: 'Select Model',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TransactionEntryForm.get('VehicleDetail.SubModelId').value == 0) {
        this.categoryInfoMotorAlert.push({
          Message: 'Select Sub-Model',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (!this.TransactionEntryForm.get('VehicleDetail.RTOCode').value) {
        this.categoryInfoMotorAlert.push({
          Message: 'Select RTO Code',
          CanDismiss: false,
          AutoClose: false,
        })
      }


      // if (this.TransactionEntryForm.get('PolicyType').value != 'New') {
      if (this.TransactionEntryForm.get('VehicleDetail.VehicleNumber').invalid) {
        this.categoryInfoMotorAlert.push({
          Message: 'Enter Vehicle Number',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      // }


      if (!this.TransactionEntryForm.get('VehicleDetail.RegistrationDate').value) {
        this.categoryInfoMotorAlert.push({
          Message: 'Enter Registration Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TransactionEntryForm.get('VehicleDetail.FuelType').invalid) {
        this.categoryInfoMotorAlert.push({
          Message: 'Select Fuel Type',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TransactionEntryForm.get('VehicleDetail.EngineNumber').invalid) {
        this.categoryInfoMotorAlert.push({
          Message: 'Enter Engine Number',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TransactionEntryForm.get('VehicleDetail.ChasisNumber').invalid) {

        this.categoryInfoMotorAlert.push({
          Message: 'Enter Chasis Number is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TransactionEntryForm.get('VehicleDetail.VehicleType').invalid) {
        this.categoryInfoMotorAlert.push({
          Message: 'Vehicle type is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TransactionEntryForm.get('VehicleDetail.CubicCapacityORKW').value == 0) {
        this.categoryInfoMotorAlert.push({
          Message: 'Enter Cubic Capacity/KW',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PrivateCar ||
        this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TwoWheeler ||
        this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.PCV) {
        if (this.TransactionEntryForm.get('VehicleDetail.PassengerCapacity').value == 0) {
          this.categoryInfoMotorAlert.push({
            Message: 'Enter Passenger Capacity',
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }
    }


    if (this.categoryInfoMotorAlert.length > 0) {
      this.categoryInfoMotorStepCtrl.setErrors({ required: true });
      return this.categoryInfoMotorStepCtrl;
    }
    else {
      this.categoryInfoMotorStepCtrl.reset();
      return this.categoryInfoMotorStepCtrl;
    }
  }

  public categoryInfoMotorError() {
    if (this.categoryInfoMotorAlert.length > 0) {
      this._alertservice.raiseErrors(this.categoryInfoMotorAlert);
      return;
    }
  }

  public categoryTypeValidations() {
    this.categoryTypeAlert = []

    if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Travel || this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Fire
      || this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Marine || this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Health
      || this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Liability || this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Life
    ) {

      if (this.TransactionEntryForm.get('CategoryType').value == '' || this.TransactionEntryForm.get('CategoryType').value == null) {
        this.categoryTypeAlert.push({
          Message: 'Category Type is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }

    if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Travel) {

      if (this.TransactionEntryForm.get('SubCategoryType').invalid) {
        this.categoryTypeAlert.push({
          Message: 'Category Type-2 is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TransactionEntryForm.get('PolicyPeriod').invalid) {
        this.categoryTypeAlert.push({
          Message: 'Policy Days is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }

    if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Travel &&
      (this.TransactionEntryForm.get('CategoryType').value == 'Including USA & Canada' ||
        this.TransactionEntryForm.get('CategoryType').value == 'Excluding USA & Canada')) {
      if (this.TransactionEntryForm.get('PassportNo').invalid) {
        this.categoryTypeAlert.push({
          Message: 'Passport number is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TransactionEntryForm.get('PassportExpiryDate').invalid) {
        this.categoryTypeAlert.push({
          Message: 'Passport Expiry Date is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }

    if (this.categoryTypeAlert.length > 0) {
      this.categoryTypeStepCtrl.setErrors({ required: true });
      return this.categoryTypeStepCtrl;
    }
    else {
      this.categoryTypeStepCtrl.reset();
      return this.categoryTypeStepCtrl;
    }


  }

  public categoryTypeError() {
    if (this.categoryTypeAlert.length > 0) {
      this._alertservice.raiseErrors(this.categoryTypeAlert);
      return;
    }
  }

  public PolicyInformationValidations() {



    this.PolicyInformationAlert = []

    if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
      if (this.TransactionEntryForm.get('PremiumType').invalid) {
        this.PolicyInformationAlert.push({
          Message: 'Premium Type is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }


    if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Life) {
      // if (this.TransactionEntryForm.get('InsurancePlan').invalid) {
      //   this.PolicyInformationAlert.push({
      //     Message: 'Plan Name is required',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   })
      // }

      if (this.TransactionEntryForm.get('LifeInsPlanName').invalid) {
        this.PolicyInformationAlert.push({
          Message: 'Plan Name is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      if (this.TransactionEntryForm.get('NameProposal').invalid) {
        this.PolicyInformationAlert.push({
          Message: 'Name Of Policy Holder is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }


      if (this.TransactionEntryForm.get('NameofLifeAssured').invalid) {
        this.PolicyInformationAlert.push({
          Message: 'Name Of Life Assured is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      // if (this.TransactionEntryForm.get('PremiumPaymentTypeName').invalid) {
      //   this.PolicyInformationAlert.push({
      //     Message: 'Premium Payment Type is required',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   })
      // }

      if (this.TransactionEntryForm.get('PremiumPaymentType').value == null) {
        this.PolicyInformationAlert.push({
          Message: 'Premium Payment Type is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TransactionEntryForm.get('PremiumPayingTerm').invalid) {
        this.PolicyInformationAlert.push({
          Message: 'Premium Paying Term (Year) is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Engineering
      || this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Fire ||
      this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Life) {
      if (this.TransactionEntryForm.get('PolicyTerms').invalid || this.TransactionEntryForm.get('PolicyTerms').value == 0) {
        this.PolicyInformationAlert.push({
          Message: 'Policy term - Year is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.TransactionEntryForm.get('PolicyNo').invalid) {
      this.PolicyInformationAlert.push({
        Message: 'Enter Policy Number',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TransactionEntryForm.get('SubmissionDate').invalid) {
      if (this.TransactionEntryForm.get('SubmissionDate').value) {
        this.PolicyInformationAlert.push({
          Message: 'Enter Valid Proposal  Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        this.PolicyInformationAlert.push({
          Message: 'Enter Proposal  Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }

    if (this.TransactionEntryForm.get('PolicyType').value != "Endorsement-Financial" && this.TransactionEntryForm.get('PolicyType').value != "Endorsement-Non Financial") {
      // if (moment(this.TransactionEntryForm.get('SubmissionDate').value, 'yyyy-MM-dd').isAfter(moment(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd'))) {
        if (this._datePipe.transform(this.TransactionEntryForm.get('SubmissionDate').value, 'yyyy-MM-dd') > this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd')) {
        this.PolicyInformationAlert.push({
          Message: 'Proposal Submission Date cannot be After Policy Start Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.TransactionEntryForm.get('IssueDate').invalid) {
      if (this.TransactionEntryForm.get('IssueDate').value) {
        this.PolicyInformationAlert.push({
          Message: 'Enter Valid Policy Issue Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        this.PolicyInformationAlert.push({
          Message: 'Enter Policy Issue Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }

    if (this.TransactionEntryForm.get('SumInsured').value < 1 && this.TransactionEntryForm.get('PremiumType').value != 'SATP' &&
      this.TransactionEntryForm.get('PremiumType').value != 'PAOD') {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        this.PolicyInformationAlert.push({
          Message: 'Enter Vehicle IDV',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        this.PolicyInformationAlert.push({
          Message: 'Enter Sum Insured',
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }

    if (this.TransactionEntryForm.get('StartDate').invalid) {
      if (this.TransactionEntryForm.get('StartDate').value) {
        this.PolicyInformationAlert.push({
          Message: 'Enter Valid Policy Start Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        this.PolicyInformationAlert.push({
          Message: 'Enter Policy Start Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }

    if (this.TransactionEntryForm.get('EndDate').invalid) {
      if (this.TransactionEntryForm.get('EndDate').value) {
        this.PolicyInformationAlert.push({
          Message: 'Enter Valid Policy End Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        this.PolicyInformationAlert.push({
          Message: 'Enter Policy End Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }

    if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Health ||
      this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.PA){

      if (!this.TransactionEntryForm.get('DateOfBirth').value) {
        this.PolicyInformationAlert.push({
          Message: 'Date of Birth is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      } else {
        if (this._datePipe.transform(this.TransactionEntryForm.get('DateOfBirth').value, 'yyyy-MM-dd') > this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')) {
          this.PolicyInformationAlert.push({
            Message: `Enter Valid Date of Birth.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }

    }

    if (this.f['CategoryCode'].value == CategoryCodeEnum.Health ||
      this.f['CategoryCode'].value == CategoryCodeEnum.Group ||
      this.f['CategoryCode'].value == CategoryCodeEnum.Life ||
      this.f['CategoryCode'].value == CategoryCodeEnum.Fire ||
      this.f['CategoryCode'].value == CategoryCodeEnum.Engineering) {
      if (this.TransactionEntryForm.get('PremiumInstallmentType').invalid) {
        this.PolicyInformationAlert.push({
          Message: 'Select Premium Installment Type',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    // if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Marine) {
    //   if (this.TransactionEntryForm.get('PerBillingLimit').value == 0) {
    //     this.PolicyInformationAlert.push({
    //       Message: 'Enter Per Billing Limit (PBL)',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     })
    //   }
    // }
    // if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Marine) {
    //   if (this.TransactionEntryForm.get('PerLocationLimit').value == 0) {
    //     this.PolicyInformationAlert.push({
    //       Message: 'Enter Per Location Limit (PLL)',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     })
    //   }
    // }

    if (this.PolicyInformationAlert.length > 0) {
      this.PolicyInformationStepCtrl.setErrors({ required: true });
      return this.PolicyInformationStepCtrl;
    }
    else {
      this.PolicyInformationStepCtrl.reset();
      return this.PolicyInformationStepCtrl;
    }
  }

  public PolicyInformationError() {
    if (this.PolicyInformationAlert.length > 0) {
      this._alertservice.raiseErrors(this.PolicyInformationAlert);
      return;
    }
  }


  public PremiumInformationValidations() {

    this.PremiumInformationAlert = []

    if (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Non Financial') {

      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {

        let PremiumType = this.TransactionEntryForm.get('PremiumType').value;

        if (PremiumType == '1 OD + 3 TP' || PremiumType == '1 OD + 5 TP' || PremiumType == '1 OD + 1 TP' || PremiumType == 'SAOD') {
          if (
            (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial' && this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value < 0)
            ||
            (
              this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' &&
              (this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value == null || this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').value == "")
            )
          ) {
            this.PremiumInformationAlert.push({
              Message: 'Basic OD Premium is required',
              CanDismiss: false,
              AutoClose: false,
            })
          }

          // if (
          //   (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial' && this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').value < 0)
          //   ||
          //   (
          //     this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' &&
          //     (this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').value == null || this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').value == "")
          //   )
          // ) {
          //   this.PremiumInformationAlert.push({
          //     Message: 'Add-On Premium is required',
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          if (this.TransactionEntryForm.get('PremiumDetail.ODGSTPer').value == null ||
            this.TransactionEntryForm.get('PremiumDetail.ODGSTPer').value.toString() == "" ||
            parseInt(this.TransactionEntryForm.get('PremiumDetail.ODGSTPer').value) < 0) {
            // if (this.TransactionEntryForm.get('PremiumDetail.ODGSTPer').value < 0) {
            this.PremiumInformationAlert.push({
              Message: 'OD GST % is required',
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }


        if (PremiumType == '1 OD + 3 TP' || PremiumType == '1 OD + 5 TP' || PremiumType == '1 OD + 1 TP' || PremiumType == 'SATP') {
          if (
            (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial' && this.TransactionEntryForm.get('PremiumDetail.BasicTPPremium').value < 0)
            ||
            (
              this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' &&
              (this.TransactionEntryForm.get('PremiumDetail.BasicTPPremium').value == null || this.TransactionEntryForm.get('PremiumDetail.BasicTPPremium').value == "")
            )
          ) {
            this.PremiumInformationAlert.push({
              Message: 'Basic TP Premium is required',
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (this.TransactionEntryForm.get('PremiumDetail.PaidDriver').value) {
            if (
              (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial' && this.TransactionEntryForm.get('PremiumDetail.PaidDriverPremium').value < 0)
              ||
              (
                this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' &&
                (this.TransactionEntryForm.get('PremiumDetail.PaidDriverPremium').value == null || this.TransactionEntryForm.get('PremiumDetail.PaidDriverPremium').value == "")
              )
            ) {
              this.PremiumInformationAlert.push({
                Message: 'PD Amount is required',
                CanDismiss: false,
                AutoClose: false,
              })
            }
          }

          if (this.TransactionEntryForm.get('PremiumDetail.LLDriver').value) {
            if (
              (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial' && this.TransactionEntryForm.get('PremiumDetail.LLDriverPremium').value < 0)
              ||
              (
                this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' &&
                (this.TransactionEntryForm.get('PremiumDetail.LLDriverPremium').value == null || this.TransactionEntryForm.get('PremiumDetail.LLDriverPremium').value == "")
              )
            ) {
              this.PremiumInformationAlert.push({
                Message: 'LL Amount is required',
                CanDismiss: false,
                AutoClose: false,
              })
            }
          }

          if (this.TransactionEntryForm.get('PremiumDetail.OwnerDriver').value) {
            if (
              (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial' && this.TransactionEntryForm.get('PremiumDetail.OwnerDriverPremium').value < 0)
              ||
              (
                this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' &&
                (this.TransactionEntryForm.get('PremiumDetail.OwnerDriverPremium').value == null || this.TransactionEntryForm.get('PremiumDetail.OwnerDriverPremium').value == "")
              )
            ) {
              this.PremiumInformationAlert.push({
                Message: 'PA OD Amount is required',
                CanDismiss: false,
                AutoClose: false,
              })
            }
          }

          if (this.TransactionEntryForm.get('PremiumDetail.PA').value) {
            if (
              (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial' && this.TransactionEntryForm.get('PremiumDetail.PAPremium').value < 0)
              ||
              (
                this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' &&
                (this.TransactionEntryForm.get('PremiumDetail.PAPremium').value == null || this.TransactionEntryForm.get('PremiumDetail.PAPremium').value == "")
              )
            ) {
              this.PremiumInformationAlert.push({
                Message: 'PA Amount is required',
                CanDismiss: false,
                AutoClose: false,
              })
            }
          }

          if (this.TransactionEntryForm.get('PremiumDetail.TPGSTPer').value == null ||
            this.TransactionEntryForm.get('PremiumDetail.TPGSTPer').value.toString() == "" ||
            parseInt(this.TransactionEntryForm.get('PremiumDetail.TPGSTPer').value) < 0) {
            // if (this.TransactionEntryForm.get('PremiumDetail.TPGSTPer').value < 0) {
            this.PremiumInformationAlert.push({
              Message: 'Basic TP GST  % is required',
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }

        if (PremiumType == 'PAOD') {
          if (
            (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial' && this.TransactionEntryForm.get('PremiumDetail.OwnerDriverPremium').value < 0)
            ||
            (
              this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' &&
              (this.TransactionEntryForm.get('PremiumDetail.OwnerDriverPremium').value == null || this.TransactionEntryForm.get('PremiumDetail.OwnerDriverPremium').value == "")
            )
          ) {
            this.PremiumInformationAlert.push({
              Message: 'PA OD Amount is required',
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }
      }


      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.WorkmenComp) {
        if (this.TransactionEntryForm.get('PremiumDetail.TotalPerson').value < 0) {
          this.PremiumInformationAlert.push({
            Message: 'Total Person is required',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.TransactionEntryForm.get('PremiumDetail.Wages').value < 0) {
          this.PremiumInformationAlert.push({
            Message: 'Wages is required',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.TransactionEntryForm.get('PremiumDetail.MedicalExpenseLimitType').invalid) {
          this.PremiumInformationAlert.push({
            Message: 'Medical Expense Limit Type is required',
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }


      if (this.TransactionEntryForm.get('CategoryCode').value != CategoryCodeEnum.Motor) {
        if (
          (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial' && (this.TransactionEntryForm.get('PremiumDetail.BasicPremium').value <= 0 || this.TransactionEntryForm.get('PremiumDetail.BasicPremium').value == null || this.TransactionEntryForm.get('PremiumDetail.BasicPremium').value == ""))
          ||
          (
            this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' &&
            (this.TransactionEntryForm.get('PremiumDetail.BasicPremium').value == null || this.TransactionEntryForm.get('PremiumDetail.BasicPremium').value == "")
          )
        ) {
          this.PremiumInformationAlert.push({
            Message: 'Enter Basic Premium',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        /**
         * Change Validation in TI-658
         */
        // if (
        //   (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial' && (this.TransactionEntryForm.get('PremiumDetail.GSTPer').value <= 0 || this.TransactionEntryForm.get('PremiumDetail.GSTPer').value == null || this.TransactionEntryForm.get('PremiumDetail.GSTPer').value == ""))
        //   ||
        //   (
        //     this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' &&
        //     (this.TransactionEntryForm.get('PremiumDetail.GSTPer').value == null || this.TransactionEntryForm.get('PremiumDetail.GSTPer').value == "")
        //   )
        // ) {
        //   this.PremiumInformationAlert.push({
        //     Message: 'Enter GST %',
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        if (this.TransactionEntryForm.get('PremiumDetail.GSTPer').value == null ||
          this.TransactionEntryForm.get('PremiumDetail.GSTPer').value.toString() == "" ||
          parseInt(this.TransactionEntryForm.get('PremiumDetail.GSTPer').value) < 0) {

          this.PremiumInformationAlert.push({
            Message: 'Enter GST %',
            CanDismiss: false,
            AutoClose: false,
          })
        }

      }

      // if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Fire || this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Engineering) {
      //   // if (
      //   //   (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial' && (this.TransactionEntryForm.get('PremiumDetail.TerrorismPremium').value < 0 || this.TransactionEntryForm.get('PremiumDetail.TerrorismPremium').value == null))
      //   //   ||
      //   //   (
      //   //     this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' &&
      //   //     (this.TransactionEntryForm.get('PremiumDetail.TerrorismPremium').value == null || this.TransactionEntryForm.get('PremiumDetail.TerrorismPremium').value == "")
      //   //   )
      //   // ) {
      //   //   this.PremiumInformationAlert.push({
      //   //     Message: 'Terrorism Premium is required',
      //   //     CanDismiss: false,
      //   //     AutoClose: false,
      //   //   })
      //   // }

      //   // if (
      //   //   (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial' && this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').value < 0)
      //   //   ||
      //   //   (
      //   //     this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' &&
      //   //     (this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').value == null || this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').value == "")
      //   //   )
      //   // ) {
      //   //   this.PremiumInformationAlert.push({
      //   //     Message: 'Add on Premium is required',
      //   //     CanDismiss: false,
      //   //     AutoClose: false,
      //   //   })
      //   // }
      // }

      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Marine) {
        if (
          (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial' && (this.TransactionEntryForm.get('PremiumDetail.StampDuty').value < 0 || this.TransactionEntryForm.get('PremiumDetail.StampDuty').value == null || this.TransactionEntryForm.get('PremiumDetail.StampDuty').value.toString() == ''))
          ||
          (
            this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' &&
            (this.TransactionEntryForm.get('PremiumDetail.StampDuty').value == null || this.TransactionEntryForm.get('PremiumDetail.StampDuty').value == "")
          )
        ) {
          this.PremiumInformationAlert.push({
            Message: 'Stamp Duty is required',
            CanDismiss: false,
            AutoClose: false,
          })
        }

      }

      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor ||
        this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Marine ||
        this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.WorkmenComp ||
        this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Engineering ||
        this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Fire) {
        if (this.TransactionEntryForm.get('PremiumDetail.DiscountPer').value == null ||
          this.TransactionEntryForm.get('PremiumDetail.DiscountPer').value.toString() == "" ||
          parseInt(this.TransactionEntryForm.get('PremiumDetail.DiscountPer').value) < 0) {

          this.PremiumInformationAlert.push({
            Message: 'Discount Percentage is requried.',
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }


      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.WorkmenComp) {
        if (this.TransactionEntryForm.get('PremiumDetail.MedicalExpenseLimitType').value != 'Not Applicable' && this.TransactionEntryForm.get('PremiumDetail.MedicalExpenseValue').value <= 0) {
          this.PremiumInformationAlert.push({
            Message: 'Enter Medical Expense Value',
            CanDismiss: false,
            AutoClose: false,
          })
        }

      }



      // if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {

      if (this.TransactionEntryForm.get('PremiumDetail.TotalPolicyPremium').value == "" || this.TransactionEntryForm.get('PremiumDetail.TotalPolicyPremium').value == null) {
        this.PremiumInformationAlert.push({
          // Message: '"Total Policy Premium - As Calculated" and "Total Policy Premium - According to Policy" must be equal',
          Message: 'Total Policy Premium - According to Policy is required.',
          CanDismiss: false,
          AutoClose: false,
        })
        // }

      }

      let TotalPolicyPremiumAsCalculated = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.TotalNetPremium').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.TotalNetPremium').value)
      let TotalPolicyPremiumAccordingToPolicy = isNaN(parseFloat(this.TransactionEntryForm.get('PremiumDetail.TotalPolicyPremium').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PremiumDetail.TotalPolicyPremium').value)
      let result = Math.abs(TotalPolicyPremiumAsCalculated - TotalPolicyPremiumAccordingToPolicy)

      if (result > 5) {
        this.PremiumInformationAlert.push({
          // Message: '"Total Policy Premium - As Calculated" and "Total Policy Premium - According to Policy" must be equal',
          Message: 'Enter valid amount "Total Policy Premium - As Calculated" and "Total Policy Premium - According to Policy"',
          CanDismiss: false,
          AutoClose: false,
        })
        // }

      }
    }

    if (this.PremiumInformationAlert.length > 0) {
      this.PremiumInformationStepCtrl.setErrors({ required: true });
      return this.PremiumInformationStepCtrl;
    }
    else {
      this.PremiumInformationStepCtrl.reset();
      return this.PremiumInformationStepCtrl;
    }
  }

  public PremiumInformationError() {
    if (this.PremiumInformationAlert.length > 0) {
      this._alertservice.raiseErrors(this.PremiumInformationAlert);
      return;
    }
  }

  public PaymentInformationValidations() {
    this.PaymentInformationAlert = []

    if (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Non Financial') {

      if (!this.TransactionEntryForm.get('PaymentDetail.ChequePayment').value && !this.TransactionEntryForm.get('PaymentDetail.CashPayment').value
        && !this.TransactionEntryForm.get('PaymentDetail.OnlinePayment').value && !this.TransactionEntryForm.get('PaymentDetail.CreditCardPayment').value
        && !this.TransactionEntryForm.get('PaymentDetail.BrokerCdACPayment').value && !this.TransactionEntryForm.get('PaymentDetail.CustomerFloatPayment').value) {

        this.PaymentInformationAlert.push({
          Message: 'Select atleast one payment mode',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.TransactionEntryForm.get('PaymentDetail.ChequePayment').value) {

        if (this.TransactionEntryForm.get('PaymentDetail.BankName').invalid) {
          this.PaymentInformationAlert.push({
            Message: 'Select Bank Name',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.TransactionEntryForm.get('PaymentDetail.ChequeNo').invalid) {
          this.PaymentInformationAlert.push({
            Message: 'Enter Cheque No.',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.TransactionEntryForm.get('PaymentDetail.ChequeDate').invalid) {
          this.PaymentInformationAlert.push({
            Message: 'Enter Cheque Date',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.TransactionEntryForm.get('PaymentDetail.ChequeAmount').value < 1 || this.TransactionEntryForm.get('PaymentDetail.ChequeAmount').invalid) {
          this.PaymentInformationAlert.push({
            Message: 'Enter Cheque Amount',
            CanDismiss: false,
            AutoClose: false,
          })
        }

      }

      if (this.TransactionEntryForm.get('PaymentDetail.CashPayment').value) {
        if (this.TransactionEntryForm.get('PaymentDetail.CashAmount').value < 1 || this.TransactionEntryForm.get('PaymentDetail.CashAmount').invalid) {
          this.PaymentInformationAlert.push({
            Message: 'Enter Cash Amount',
            CanDismiss: false,
            AutoClose: false,
          })
        }

      }

      if (this.TransactionEntryForm.get('PaymentDetail.OnlinePayment').value) {
        if (this.TransactionEntryForm.get('PaymentDetail.OnlineTransferredAmount').value < 1 || this.TransactionEntryForm.get('PaymentDetail.OnlineTransferredAmount').invalid) {
          this.PaymentInformationAlert.push({
            Message: 'Enter Online Transferred Amount',
            CanDismiss: false,
            AutoClose: false,
          })
        }

      }

      if (this.TransactionEntryForm.get('PaymentDetail.CreditCardPayment').value) {
        if (this.TransactionEntryForm.get('PaymentDetail.CreditCardAmount').value < 1 || this.TransactionEntryForm.get('PaymentDetail.CreditCardAmount').invalid) {
          this.PaymentInformationAlert.push({
            Message: 'Enter Credit Card Amount',
            CanDismiss: false,
            AutoClose: false,
          })
        }

      }

      if (this.TransactionEntryForm.get('PaymentDetail.BrokerCdACPayment').value) {
        if (this.TransactionEntryForm.get('PaymentDetail.BrokerCdACAmount').value < 1 || this.TransactionEntryForm.get('PaymentDetail.BrokerCdACAmount').invalid) {
          this.PaymentInformationAlert.push({
            Message: 'Enter Broker Flote A/C Amount',
            CanDismiss: false,
            AutoClose: false,
          })
        }

      }

      if (this.TransactionEntryForm.get('PaymentDetail.CustomerFloatPayment').value) {
        if (this.TransactionEntryForm.get('PaymentDetail.CustomerFloatAmount').value < 1 || this.TransactionEntryForm.get('PaymentDetail.CustomerFloatAmount').invalid) {
          this.PaymentInformationAlert.push({
            Message: 'Enter Customer Float Amount',
            CanDismiss: false,
            AutoClose: false,
          })
        }

      }

      if (this.TransactionEntryForm.get('PaymentDetail.BalanceAmount').value > 5 && this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial') {

        if (this.TransactionEntryForm.get('PaymentDetail.DatebywhichBalancewillbecollected').invalid) {
          if (this.TransactionEntryForm.get('PaymentDetail.DatebywhichBalancewillbecollected').value) {
            this.PaymentInformationAlert.push({
              Message: 'Enter Valid Date by which Balance will be collected',
              CanDismiss: false,
              AutoClose: false,
            })
          }
          else {
            this.PaymentInformationAlert.push({
              Message: 'Enter Date by which Balance will be collected',
              CanDismiss: false,
              AutoClose: false,
            })
          }

        }

        if (this.TransactionEntryForm.get('PaymentDetail.BalancecollectionResponsibilityUserId').value == 0 || this.TransactionEntryForm.get('PaymentDetail.BalancecollectionResponsibilityUserId').value == null) {
          this.PaymentInformationAlert.push({
            Message: 'Select Balance Amount collection Responsibility',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.TransactionEntryForm.get('PaymentDetail.BalanceAmountAuthorizedUserId').value == 0 || this.TransactionEntryForm.get('PaymentDetail.BalanceAmountAuthorizedUserId').value == null) {
          this.PaymentInformationAlert.push({
            Message: 'Select Credit Amount Authorized By',
            CanDismiss: false,
            AutoClose: false,
          })
        }

      }

      if (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial') {
        if (this.TransactionEntryForm.get('PaymentDetail.ReceivableAmount').value < this.TransactionEntryForm.get('PaymentDetail.CollectedAmount').value && Math.abs(this.TransactionEntryForm.get('PaymentDetail.ReceivableAmount').value - this.TransactionEntryForm.get('PaymentDetail.CollectedAmount').value) > 5) {
          this.PaymentInformationAlert.push({
            Message: 'Collected Amount cannot be greater than Policy Amount.',
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }

    }

    if (this.PaymentInformationAlert.length > 0) {
      this.PaymentInformationStepCtrl.setErrors({ required: true });
      return this.PaymentInformationStepCtrl;
    }
    else {
      this.PaymentInformationStepCtrl.reset();
      return this.PaymentInformationStepCtrl;
    }
  }

  public PaymentInformationError() {
    if (this.PaymentInformationAlert.length > 0) {
      this._alertservice.raiseErrors(this.PaymentInformationAlert);
      return;
    }
  }


  public DocumentAttachmentValidation() {
    this.DocumentAttachmentAlert = []

    if (this.TransactionEntryForm.get('MandateObtained').value == true) {
      if (!this.MandateDoc && !this.MandateDoc?.FileName)
        this.DocumentAttachmentAlert.push({
          Message: 'Attach Mandate Copy',
          CanDismiss: false,
          AutoClose: false,
        })
    }

    this.document.controls.forEach((item, index) => {
      if (item.get('DocumentType').value != HealthPolicyDocumentType.Mandate) {
        if (item.get('FileName').hasError('required') || item.get('ImageUploadPath').hasError('required')) {
          this.DocumentAttachmentAlert.push({
            Message: `${item.value.DocumentTypeName} Attachment is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
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


  /**
 * value of Corresponding Premium based on the selected Product Name from TP Premium master
 *  ResponseOfTP : is response from TP premium master based on selected Product
 * response is obtained from Policy details component
 */
  /**
  * Get TP Add On Premium Amount Base On Category and Sub Category
  */
  public getTPAddOnPremiumAmount(type: string) {

    let Response = this.TpPremiumMasterData

    if (Response && this.TransactionEntryForm.get('PremiumType').value && this.TransactionEntryForm.get('PremiumType').value != 'PAOD') {
      if (Response.Success) {
        if (Response.Data.Items.length > 0) {

          if (type == 'CNG' || type == 'All') {
            if (this.TransactionEntryForm.get('PremiumDetail.CNG').value == true) {
              this.TransactionEntryForm.get('PremiumDetail.CNGAmount').patchValue((Response.Data.Items[0].CNG * this.noOfYears).toFixed(2))
            }
            else {
              this.TransactionEntryForm.get('PremiumDetail.CNGAmount').patchValue(0)
            }
          }

          if (type == 'PaidDriver' || type == 'All') {
            if (this.TransactionEntryForm.get('PremiumDetail.PaidDriver').value == true) {
              this.TransactionEntryForm.get('PremiumDetail.PaidDriverPremium').patchValue((Response.Data.Items[0].PaidDriver * this.noOfYears).toFixed(2))
            }
            else {
              this.TransactionEntryForm.get('PremiumDetail.PaidDriverPremium').patchValue(0)
            }
          }

          if (type == 'LLDriver' || type == 'All') {
            if (this.TransactionEntryForm.get('PremiumDetail.LLDriver').value == true) {
              this.TransactionEntryForm.get('PremiumDetail.LLDriverPremium').patchValue((Response.Data.Items[0].LLDriver * this.noOfYears).toFixed(2))
            }
            else {
              this.TransactionEntryForm.get('PremiumDetail.LLDriverPremium').patchValue(0)
            }
          }

          if (type == 'OwnerDriver' || type == 'All') {
            if (this.TransactionEntryForm.get('PremiumDetail.OwnerDriver').value == true) {
              this.TransactionEntryForm.get('PremiumDetail.OwnerDriverPremium').patchValue((Response.Data.Items[0].OwnerDriver * this.noOfYears).toFixed(2))
            }
            else {
              this.TransactionEntryForm.get('PremiumDetail.OwnerDriverPremium').patchValue(0)
            }
          }
        }
      }
    }

    this.ODPremiumChange()

  }



  public DecimalWithMinus(event: KeyboardEvent) {

    const allowedKeys = [
      'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete',
      '.', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];

    if (this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial') {
      allowedKeys.push('-');
    }

    if (allowedKeys.indexOf(event.key) === -1) {
      event.preventDefault();
    }

    // Allow only one minus sign at the beginning
    if (event.key === '-' && (event.target as HTMLInputElement).selectionStart !== 0) {
      event.preventDefault();
    }

    // Allow only one decimal point
    if (event.key === '.' && (event.target as HTMLInputElement).value.includes('.')) {
      event.preventDefault();
    }

    const allowedKeysFor2digit = [
      'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'
    ];

    // Allow only two decimal places
    if ((event.target as HTMLInputElement).value.includes('.') &&
      (event.target as HTMLInputElement).value.split('.')[1].length >= 2 &&
      (event.target as HTMLInputElement).selectionStart > (event.target as HTMLInputElement).value.indexOf('.') &&
      allowedKeysFor2digit.indexOf(event.key) === -1) {
      event.preventDefault();
    }
  }


  /**
 * When Close Mat-select Search drplist Bind Origin data In list
 * && Clear SearchCtrl Value
 * @param closeFor
 */
  public CloseDropdownEven(closeFor: string) {
    if (closeFor == 'RTO') {
      this.RTOSearch.nativeElement.value = '';
      this.filterDropDownList('', closeFor);
    }
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


  // search in dropDown
  /**
   * to filter from the list
   * @param event : change in the value
   * @param name : dropdown in which search is being done
   */
  public searchInDropDown(event, name) {
    let value = event.target.value;

    if (name == 'RTO') {
      this.filterDropDownList(value, name);
    }

  }


  // filter lists as per data
  public filterDropDownList(value: string, name) {
    let filter = value?.toLowerCase();

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



  public VehicleNumberAllowkey(event: KeyboardEvent) {

    const allowedKeys = [
      'Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete',
      '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];


    if (allowedKeys.indexOf(event.key) === -1) {
      event.preventDefault();
    }

  }


  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _buildTransactionEntryForm(transactionEntryData: IPrivateCarDto): FormGroup {

    let transactionEntryForm = this._fb.group({
      Id: [0],
      Mode: [''],
      CategoryId: [0, [Validators.required]],
      CategoryName: ['', [Validators.required]],
      CategoryCode: ['', [Validators.required]],
      SubCategoryId: [0, [Validators.required]],
      SubCategoryName: ['', [Validators.required]],
      SubCategoryCode: ['', [Validators.required]],
      TransactionNo: [''],
      InsertTransactionNo: [''],
      TransactionData: [],
      TransactionDate: ['', [Validators.required]],
      PolicyType: ['New', [Validators.required]],
      InsuranceCompanyCode: ['', [Validators.required]],
      InsuranceCompany: ['', [Validators.required]],
      InsurancePlan: ['', [Validators.required]],
      ProductCode: [0],
      GroupHeadName: ['', [Validators.required]],
      GroupHeadId: [],
      NameProposal: ['', [Validators.required]],
      DateOfBirth: [''],
      LifeInsPlanName: ['', [Validators.required]],
      CustomerId: [0],
      CustomerName: ['', [Validators.required]],
      BrokerQualifiedPersonId: [],
      BrokerQualifiedPersonName: ['', [Validators.required]],
      MobileNo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      SalesPersonName: ['', [Validators.required]],
      SalesPersonId: [],
      SalesPersonType: [''],
      TeamReferenceUserId: [],
      TeamReferenceUserName: ['', [Validators.required]],
      CustomerReference: [''],
      BranchName: ['', [Validators.required]],
      BranchId: [0],
      MandateObtained: [false],
      SumInsured: [0],
      GrossPremium: [0],
      PolicyNo: ['', [Validators.required]],
      PremiumType: ['', [Validators.required]],
      SubmissionDate: ['', [Validators.required]],
      IssueDate: ['', [Validators.required]],
      StartDate: ['', [Validators.required]],
      EndDate: ['', [Validators.required]],
      PolicyTerms: [0, [Validators.required]], //Fire & Engineering
      PremiumInstallmentAmount: [], //Fire & Engineering
      PremiumInstallmentType: [0, [Validators.required]], //Health
      PremiumPaymentType: [0],
      PremiumPaymentTypeName: [""],
      NextPremiumPaymentDate: [],
      Remark: [''], //Health
      CoShares: this._buildCoSharesForm(transactionEntryData.CoShares),
      Documents: this._buildDocumentsForm(transactionEntryData.Documents),
      Addresses: this._buildAddressesForm(transactionEntryData.Addresses),
      VehicleDetail: this._buildVehicleDetailForm(transactionEntryData.VehicleDetail),
      PremiumDetail: this._buildPremiumDetailForm(transactionEntryData.PremiumDetail),
      PaymentDetail: this._buildPaymentDetailForm(transactionEntryData.PaymentDetail),
      PerBillingLimit: [0, [Validators.required]],
      PerLocationLimit: [0, [Validators.required]],
      CategoryType: ["", [Validators.required]],
      SubCategoryType: ["", [Validators.required]],
      NameofLifeAssured: ["", [Validators.required]],
      PremiumPayingTerm: [, [Validators.required]],
      TPStartDate: [],
      TPEndDate: [],
      PrevPolicyInsurComp: [""],
      PrevPolicySumInsured: [0],
      PrevPolicyType: [""],
      PrevPolicyPeriod: [0],
      PassportNo: [],
      PassportExpiryDate: [],
      PolicyPeriod: [1],
      DomesticDetail: [],
      DocumentRemarks: [],
      
      RFQId: [0], // for convert rfq time mandatory this field
      MotorProposalId: [],// for convert Online Motor Policy time mandatory this field
      HealthProposalId: [],// for convert Online Health Policy time mandatory this field
    })

    if (transactionEntryData) {
      transactionEntryForm.patchValue(transactionEntryData)

      // transactionEntryForm.get('PremiumDetail').patchValue({
      //   GSTAmount : transactionEntryData.PremiumDetail?.GSTAmount?.toFixed(2)
      // })


    }

    if (this.mode == 'View' || this.mode == 'RFQView') {
      transactionEntryForm.disable()
    }

    if (this.mode == 'Create' || this.mode == 'EndorsementConvert') {
      transactionEntryForm.get('TransactionDate').patchValue(this._datePipe.transform(this.currentDate, 'yyyy-MM-dd'))
    }

    return transactionEntryForm
  }

  private _buildCoSharesForm(items: ICoSharesDto[] = []): FormArray {

    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initCoSharesForm(i));
        });
      }
    }
    return formArray;
  }

  private _initCoSharesForm(item: ICoSharesDto = null): FormGroup {
    let coshareForm = this._fb.group({
      Id: [0],
      TransactionId: [],
      COshare: [false],
      COshareper: [],
      COshareInsurer: [''],
      COshareInsurerShortName: [""],
      COshareInsurerCode: [],
      EditCoSharePer: [false]
    })

    if (item != null) {
      if (!item) {
        item = new CoSharesDto();
      }

      if (item) {
        coshareForm.patchValue(item);
      }
    }
    return coshareForm;
  }

  private _buildAddressesForm(items: IAddressesDto[] = []): FormArray {

    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initAddressesForm(i));
        });
      }
    }
    return formArray;
  }

  private _initAddressesForm(item: IAddressesDto = null): FormGroup {
    let addressForm = this._fb.group({
      Id: [0],
      TransactionId: [],
      AddressType: [''],
      AddressLine1: [''],
      AddressLine2: [''],
      CityPinCodeId: [],
      CityPinCode: [''],
      CityId: [],
      CityName: [''],
      StateId: [],
      StateName: [''],
      CountryId: [],
      CountryName: [''],
    })

    if (item != null) {
      if (!item) {
        item = new AddressesDto();
      }

      if (item) {
        addressForm.patchValue(item);
      }
    }
    return addressForm;
  }

  //Build document Formarray
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
    let documentForm = this._fb.group({
      Id: [0],
      TransactionId: [0],
      Remark: [""],
      FileName: ["", [Validators.required]],
      DocumentType: [''],
      DocumentTypeName: [''],
      ImageUploadName: ['', [Validators.required]],
      ImageUploadPath: ['', [Validators.required]],
    })
    if (item != null) {
      if (!item) {
        item = new DocumentsDto();
      }

      if (item) {
        documentForm.patchValue(item);
      }
    }
    return documentForm
  }

  private _buildVehicleDetailForm(item: IVehicleDetailDto): FormGroup {
    let vehicleDetailsForm = this._fb.group({
      Id: [0],
      TransactionId: [],
      SubModelId: [0],
      VehicleType: ["", [Validators.required]],
      VehicleNumber: ['', [Validators.required]],
      ManufacturingYear: ['', [Validators.required]],
      RegistrationDate: ['', [Validators.required]],
      FuelType: ['', [Validators.required]],
      EngineNumber: ['', [Validators.required]],
      ChasisNumber: ['', [Validators.required]],
      CubicCapacityORKW: [0, [Validators.required]],
      PassengerCapacity: [0, [Validators.required]],
      GrossVehicleWeight: [0],
      CNGKitValue: [0],
      ElectricalAccessoriesValue: [0],
      NonElectricalAccessoriesValue: [0],
      OtherFitmentValue: [0],
      TotalValue: [0],
      Remarks: [''],
      BrandName: ['', [Validators.required]],
      BrandId: [0],
      ModelName: ['', [Validators.required]],
      ModelId: [0],
      SubModelName: ['', [Validators.required]],
      isFleetBusiness: [false, [Validators.required]],
      FleetBusinessId: [0, [Validators.required]],
      FleetBusinessName: [""],
      AnyClaiminPreviousYear: [, [Validators.required]],
      VehicleAge: [0, [Validators.required]],
      IsPermissibleBusinessforPoSP: ['', [Validators.required]],
      BusinessTarget: [''],
      RTOCode: [''],
      VehicleClass: ['', [Validators.required]],
      RegistrationType: [""],
      ContractPeriod: [""],
      TaxiAgency: [""],
      Usage: ["Public"]

    })

    if (item != null) {
      if (!item) {
        item = new VehicleDetailDto();
      }

      if (item) {
        vehicleDetailsForm.patchValue(item);
      }
    }
    return vehicleDetailsForm;
  }


  private _buildPremiumDetailForm(item: IPremiumDetailDto = null): FormGroup {
    let premiumDetailsForm = this._fb.group({
      Id: [0],
      TransactionId: [],
      BasicODPremium: [0, [Validators.required]],
      NCBPer: [0, [Validators.required]],
      NCBPremium: [],
      DiscountPer: [],
      DiscountAmount: [0],
      NetODPremium: [0],
      TotalODPremium: [0],
      AddOnPremium: [0], //, [Validators.required]
      ODGSTPer: [18, [Validators.required]],
      ODGSTAmount: [],
      BasicTPPremium: [0, [Validators.required]],
      PaidDriver: [false],
      PaidDriverPremium: [0, [Validators.required]],
      LLDriver: [false],
      LLDriverPremium: [0],
      CNG: [false],
      CNGAmount: [0],
      PA: [false],
      PASumInsure: [0],
      PAPremium: [0],
      OwnerDriver: [false],
      OwnerDriverPremium: [0],
      OtherLiabilityPremium: [0],
      TotalTPPremium: [0],
      TPGSTPer: [18, [Validators.required]],
      TPGSTAmount: [0],
      ProductCode: [''],
      OtherLiabilityGSTPer: [18, [Validators.required]],
      OtherLiabilityGSTAmount: [0],
      TotalPremium: [0],
      TotalNetPremium: [0],
      TotalPolicyPremium: [0],
      BasicPremium: [], //Health && Fire
      GSTPer: [18], //Health && Fire
      GSTAmount: [], //Health && Fire
      BasicRate: [], // Fire
      BasicPremiumAfterDiscount: [], // Fire
      TerrorismPremium: [], // Fire

      TotalPerson: [],
      Wages: [],
      MedicalExpenseLimitType: [, [Validators.required]],
      MedicalExpenseLimitTypeName: [],
      MedicalExpenseValue: [],
      MedicalPremium: [],
      StampDuty: [], // Marine
      ReceiptNo: [""],
      ReceiptDate: [""],

    })

    if (item != null) {
      if (!item) {
        item = new PremiumDetailDto();
      }

      if (item) {
        premiumDetailsForm.patchValue(item);
      }
    }
    return premiumDetailsForm;
  }


  private _buildPaymentDetailForm(item: IPaymentDetailDto = null): FormGroup {
    let paymentDetailsForm = this._fb.group({
      Id: [0],
      TransactionId: [],
      ChequePayment: [false],
      BankName: ['', [Validators.required]],
      ChequeNo: ['', [Validators.required]],
      ChequeDate: ['', [Validators.required]],
      ChequeAmount: [0],
      CashPayment: [false],
      CashAmount: [0],
      OnlinePayment: [false],
      OnlineTransactionNo: [''],
      OnlineTransferredAmount: [0],
      CreditCardPayment: [false],
      CreditCardAmount: [0],
      BrokerCdACPayment: [false],
      BrokerCdACAmount: [0],
      CustomerFloatPayment: [false],
      CustomerFloatAmount: [0],
      CollectedAmount: [0],
      ReceivableAmount: [0],
      BalanceAmount: [0],
      DatebywhichBalancewillbecollected: ['', [Validators.required]],
      BalancecollectionResponsibilityUserId: [],
      BalanceAmountAuthorizedUserId: [],
      BalancecollectionResponsibilityUserName: [''],
      BalanceAmountAuthorizedUserName: [''],
      Remark: [''],
    })

    if (item) {
      paymentDetailsForm.patchValue(item)
    }
    return paymentDetailsForm
  }


  private _validateAttachDocField() {

    this.AttachDocumentAlerts = []

    this.document.controls.forEach((element, index) => {
      if (element.get('ImageUploadPath').hasError('required')) {

        this.AttachDocumentAlerts.push({
          Message: `${element.value.DocumentTypeName} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });

  }


  private _dateFormat() {
    this.TransactionEntryForm.patchValue({
      SubmissionDate: this._datePipe.transform(this.TransactionEntryForm.get('SubmissionDate').value, 'yyyy-MM-dd'),
      EndDate: this._datePipe.transform(this.TransactionEntryForm.get('EndDate').value, 'yyyy-MM-dd'),
      StartDate: this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd'),
      IssueDate: this._datePipe.transform(this.TransactionEntryForm.get('IssueDate').value, 'yyyy-MM-dd'),

      TransactionDate: this._datePipe.transform(this.TransactionEntryForm.get('TransactionDate').value, 'yyyy-MM-dd'),
    },{emitEvent:false})

    if (this.TransactionEntryForm.get('TPStartDate').value){
      this.TransactionEntryForm.patchValue({
        TPStartDate: this._datePipe.transform(this.TransactionEntryForm.get('TPStartDate').value, 'yyyy-MM-dd'),
      }, { emitEvent: false })
    }
    
    if (this.TransactionEntryForm.get('TPEndDate').value){
      this.TransactionEntryForm.patchValue({
        TPEndDate: this._datePipe.transform(this.TransactionEntryForm.get('TPEndDate').value, 'yyyy-MM-dd'),
      }, { emitEvent: false })
    }
    
    if (this.TransactionEntryForm.get('DateOfBirth').value){
      this.TransactionEntryForm.patchValue({
        DateOfBirth: this._datePipe.transform(this.TransactionEntryForm.get('DateOfBirth').value, 'yyyy-MM-dd'),
      }, { emitEvent: false })
    }

    this.TransactionEntryForm.get('VehicleDetail').patchValue({
      RegistrationDate: this._datePipe.transform(this.TransactionEntryForm.get('VehicleDetail.RegistrationDate').value, 'yyyy-MM-dd'),
    }, { emitEvent: false })

    this.TransactionEntryForm.get('PaymentDetail').patchValue({
      DatebywhichBalancewillbecollected: this._datePipe.transform(this.TransactionEntryForm.get('PaymentDetail.DatebywhichBalancewillbecollected').value, 'yyyy-MM-dd'),
    }, { emitEvent: false })

    this.TransactionEntryForm.get('PremiumDetail').patchValue({
      ReceiptDate: this._datePipe.transform(this.TransactionEntryForm.get('PremiumDetail.ReceiptDate').value, 'yyyy-MM-dd'),
    }, { emitEvent: false })
  }

  /**
 * load list of Sub-Category when form is open in View or Edit mode
 */
  private OnViewEditFillMasterData() {
    if (this.mode != 'Create') {
      let SubCategoryRule: IFilterRule[] = [
        ActiveMasterDataRule,
        {
          Field: "Category.Id",
          Operator: "eq",
          Value: this.TransactionEntryForm.get('CategoryId').value
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
    }
  }
  /**
   * to validate CoShare data
   * @returns : alert message
   */
  private CoShareValidation() {
    let error: Alert[] = []

    if (this.CoShareBool.invalid) {
      error.push({
        Message: 'Enter Co-Share',
        CanDismiss: false,
        AutoClose: false,
      })
    }
    if (this.CoShareId.invalid && this.CoShareName.value) {
      error.push({
        Message: 'Enter valid Insurance Company',
        CanDismiss: false,
        AutoClose: false,
      })
    }
    if (this.CoShareId.valid) {
      let duplicate: boolean = false
      this.Coshare.controls.forEach((item) => {
        if (this.CoShareId.value == item.get('COshareInsurerCode').value) {
          duplicate = true
        }
      })
      if (duplicate) {
        error.push({
          Message: `${this.CoShareName.value} can not be added twice`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.CoShareName.invalid) {
      error.push({
        Message: 'Enter Insurance Company',
        CanDismiss: false,
        AutoClose: false,
      })
    }
    if (this.CoSharePercent.invalid) {
      error.push({
        Message: 'Enter Co-Share Percentage',
        CanDismiss: false,
        AutoClose: false,
      })
    }
    else if (this.CoSharePercent.valid) {
      if (this.CoSharePercent.value < 1) {
        error.push({
          Message: 'Co-Share Percentage must be greater than 0',
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {

        if ((this.Coshare.controls[0].value.COshareper - parseFloat(this.CoSharePercent.value) < 1)) {
          error.push({
            Message: 'Total Co-Share Percentage can not be greater than 100',
            CanDismiss: false,
            AutoClose: false,
          })
        }

      }

    }

    return error
  }
  private _fillMasterList() {

    // Get Category List Order by srno & only Active master Data
    let ActiveDataRule: IFilterRule[] = [ActiveMasterDataRule]

    let OrderBySpecs: OrderBySpecs[] = [
      {
        field: "SrNo",
        direction: "asc"
      }
    ]

    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Category.List, 'Name', "", ActiveDataRule, [], OrderBySpecs)
      .subscribe(res => {
        if (res.Success) {
          this.CategoryList = res.Data.Items
        }

      })

    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Bank.List, 'Name', "", ActiveDataRule)
      .subscribe(res => {
        if (res.Success) {
          this.BankList = res.Data.Items
        }

      })

    /**
     * Get Branch As per User Access
     */
    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List + "/true", 'Name', "", ActiveDataRule)
      .subscribe(res => {
        if (res.Success) {
          this.Branchs = res.Data.Items
          if (this.Branchs.length == 1) {
            this.TransactionEntryForm.patchValue({ BranchId: this.Branchs[0].Id })
          }
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
  }

  /**
 * add new row in Addresses array
 */
  private addAddressesRow(i: number) {

    var row: IAddressesDto = new AddressesDto()
    if (i == 0) {
      row.AddressType = 'Correspondence'
    } else if (i == 1) {
      row.AddressType = 'Property'
    }
    this.address.push(this._initAddressesForm(row))
  }


  private _onFormChange() {
    this.TransactionEntryForm.get('CategoryId').valueChanges.subscribe(val => {

      this.TransactionEntryForm.patchValue({
        SubCategoryName: "",
        SubCategoryCode: "",
        SubCategoryId: 0
      })
      let SelectedCategory = this.CategoryList.find(cat => cat.Id == val)

      if (SelectedCategory) {

        this.TransactionEntryForm.patchValue({
          CategoryName: SelectedCategory.Name,
          CategoryCode: SelectedCategory.Code
        })

      } else {

        this.TransactionEntryForm.patchValue({
          CategoryName: "",
          CategoryCode: ""
        })
      }

      this._getCategoryWiseSubCategogry(val)
      this._getCategoryWiseInsuranceCampany(val)
      this._resetErrorAlertAndStepCtrl()
      this.setGSTPerBaseOnCategoryNSubCategory();
    })


    this.TransactionEntryForm.get('SubCategoryId').valueChanges.subscribe(val => {

      let SelectedSubCategory = this.SubCategoryList.find(cat => cat.Id == val)
      if (SelectedSubCategory) {
        this.TransactionEntryForm.patchValue({
          SubCategoryName: SelectedSubCategory.Name,
          SubCategoryCode: SelectedSubCategory.Code
        })
      } else {
        this.TransactionEntryForm.patchValue({
          SubCategoryName: "",
          SubCategoryCode: ""
        })
      }
      this._getCategoryData(this.TransactionEntryForm.get('CategoryCode').value, this.TransactionEntryForm.get('SubCategoryCode').value)
      this._getSubCategoryWiseBrandList()

      if (this.TransactionEntryForm.get('CategoryName').value
        && this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        this._getSubCategoryWiseTPPremium(this.TransactionEntryForm.get('SubCategoryId').value)
      }
      this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').setValue(this.getPermissibleBusinessFlag())
      this.setGSTPerBaseOnCategoryNSubCategory();
      this._resetErrorAlertAndStepCtrl()
    })

    this.TransactionEntryForm.get('BranchId').valueChanges.subscribe(val => {


      let SelectedBranch = this.Branchs.find(branch => branch.Id == val)

      if (SelectedBranch) {
        this.TransactionEntryForm.patchValue({
          BrokerQualifiedPersonName: SelectedBranch.BrokerQualifiedPersonName,
          BrokerQualifiedPersonId: SelectedBranch.BrokerQualifiedPersonId,
          BranchName: SelectedBranch.Name
        })
      } else {
        this.TransactionEntryForm.patchValue({
          BrokerQualifiedPersonName: "",
          BrokerQualifiedPersonId: 0,
          BranchName: ""
        })
      }

    })

    this.TransactionEntryForm.get('PolicyType').valueChanges.subscribe((val) => {


      if ((val == 'Renewal-Same Company' || val == 'Endorsement-Financial'
        || val == 'Endorsement-Non Financial' || val == 'Renewal-Change Company') &&
        (this.TransactionEntryForm.get('CategoryCode').value != CategoryCodeEnum.Motor)) {
        this.TransactionEntryForm.get('SubCategoryId').enable({ emitEvent: false })
      } else {
        this.TransactionEntryForm.get('SubCategoryId').disable({ emitEvent: false })
      }

      this.setGSTPerBaseOnCategoryNSubCategory()
      this.TransactionEntryForm.patchValue({
        PrevPolicyInsurComp: "",
        PrevPolicyPeriod: 0,
        PrevPolicySumInsured: null,
        PrevPolicyType: ""
      })


      let PrevPolicyDocIndex = this.document.controls.findIndex(doc =>
        doc.get('DocumentType').value == 'PreviousPolicy'
      )

      if (PrevPolicyDocIndex >= 0) {
        this.document.removeAt(PrevPolicyDocIndex)
      }

    })

    this.TransactionEntryForm.get('InsuranceCompanyCode').valueChanges.subscribe(val => {

      this.InsuranceCompany$.pipe(map((items) => items.filter((item) => item.Code == val))).subscribe((a) => {
        if (a) {
          if (a.length > 0) {
            this.TransactionEntryForm.get('InsuranceCompany').patchValue(a[0].ShortName)
          } else {
            this.TransactionEntryForm.get('InsuranceCompany').patchValue("")
          }
        }
      });


      this._getInsuranceCampnyWiseProduct(this.TransactionEntryForm.get('SubCategoryId').value, val)
      this.TransactionEntryForm.get('ProductCode').patchValue("")
    })


    this.TransactionEntryForm.get('BrokerQualifiedPersonName').
      valueChanges.subscribe((val) => {
        this.BrokerPerson$ = this._MasterListService
          .getFilteredUserList(val)
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

    this.TransactionEntryForm.get('BrokerQualifiedPersonId').valueChanges.subscribe((val) => {

      /**
      * When PermissibleBusiness "YES"
      * SalesPersonType is Team REF.
      * Selected branch BQP Default select in salesperson
      */
      if (this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').value == true &&
        this.TransactionEntryForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {
        this.TransactionEntryForm.patchValue({
          SalesPersonId: this.TransactionEntryForm.get('BrokerQualifiedPersonId').value,
          SalesPersonName: this.TransactionEntryForm.get('BrokerQualifiedPersonName').value,
        }, { emitEvent: false });
      }

      /**
       * When PermissibleBusiness "NO"
       * SalesPersonType is POSP OR Team REF.
       * Selected branch BQP Default select in salesperson
       */
      if ((this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').value == false) &&
        (this.TransactionEntryForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference ||
          this.TransactionEntryForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP)) {
        this.TransactionEntryForm.patchValue({
          SalesPersonId: this.TransactionEntryForm.get('BrokerQualifiedPersonId').value,
          SalesPersonName: this.TransactionEntryForm.get('BrokerQualifiedPersonName').value,
        }, { emitEvent: false });
      }

    });

    this.TransactionEntryForm.get('TeamReferenceUserName').valueChanges.subscribe(
      (val) => {
        let Rule: IFilterRule[] = [ActiveMasterDataRule];

        let AdditionalFilters: IAdditionalFilterObject[] = [
          { key: "FullName", filterValues: [val] }
        ]

        if (this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').value == false) {
          AdditionalFilters.push({ key: 'UserType', filterValues: ['TeamReference', 'Agent'] })
        } else {
          AdditionalFilters.push({ key: 'UserType', filterValues: ['TeamReference'] })
        }

        this.TeamRefUser$ = this._MasterListService
          .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", Rule, AdditionalFilters)
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

    this.TransactionEntryForm.get('SalesPersonName').valueChanges.subscribe(
      (val) => {
        let Rule: IFilterRule[] = [
          ActiveMasterDataRule,
          {
            Field: 'Branch.Id',
            Operator: 'eq',
            Value: this.TransactionEntryForm.get('BranchId').value
          },
        ];

        let AdditionalFilters: IAdditionalFilterObject[] = [
          { key: "FullName", filterValues: [val] }
        ]
        if (this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').value) {
          AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
        }

        this.SalesPerson$ = this._MasterListService
          .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", Rule, AdditionalFilters)
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

    this.TransactionEntryForm.get('GroupHeadName').valueChanges.subscribe((val) => {
      let Rule: IFilterRule[] = [ActiveMasterDataRule,
        {
          Field: "Branch.Id",
          Operator: "eq",
          Value: this.TransactionEntryForm.get('BranchId').value
        },
      ]
      this.GroupHeadName$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.GroupHead.List, 'Name', val, Rule).pipe(
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

    this.TransactionEntryForm.get('GroupHeadId').valueChanges.subscribe((val) => {
      if (val) {
        this._dataservice.getDataById(val, API_ENDPOINTS.GroupHead.Base).subscribe((response) => {
          if (response.Success) {
            this.groupHead(response.Data)

            if (this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').value == false) {
              this._TeamDetailsDataBindForPermissibleBusinessNo(response.Data)
            } else {
              this._TeamDetailsDataBindForPermissibleBusinessYes(response.Data)
            }

            this.IsSalesPersonReadOnly = true;
            this.getPermissibleBusinessFlag();
            this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').setValue(this.getPermissibleBusinessFlag())
          }
        })
      } else {
        this.groupHead(null)
        this.TransactionEntryForm.patchValue({
          SalesPersonId: 0,
          SalesPersonName: "",
          SalesPersonType: "",
          TeamReferenceUserId: 0,
          TeamReferenceUserName: '',
          MobileNo: ''
        }, { emitEvent: false });

        this.address.controls.forEach((item, index) => {
          item.get('AddressLine1').setValue("")
          item.get('AddressLine2').setValue("")
          item.get('CityPinCodeId').setValue(null)
          item.get('CityPinCode').setValue("")
          item.get('CityName').setValue("")
          item.get('StateName').setValue("")
          item.get('CountryName').setValue("")

        })

        this.IsSalesPersonReadOnly = false;

      }
    });

    this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').valueChanges.subscribe(val => {
      if (this.tempIsPermissibleBusinessforPoSP != val) {
        this.tempIsPermissibleBusinessforPoSP = val
        if (val == false) {
          // if (this.modeFlag) {
          if (this.GroupHeadResponseData) {
            this.GroupHeadResponseData.pipe(takeUntil(this.destroy$)).subscribe(
              (res) => {
                this._TeamDetailsDataBindForPermissibleBusinessNo(res)
              }
            );
          }
          // }
        } else {
          if (this.GroupHeadResponseData) {
            this.GroupHeadResponseData.pipe(takeUntil(this.destroy$)).subscribe(
              (res) => {
                this._TeamDetailsDataBindForPermissibleBusinessYes(res)
              }
            );
          }
        }
      }

    });

    this.TransactionEntryForm.get('BrokerQualifiedPersonId').valueChanges.subscribe((val) => {

      /**
      * When PermissibleBusiness "YES"
      * SalesPersonType is Team REF.
      * Selected branch BQP Default select in salesperson
      */
      if (this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').value == true &&
        (this.TransactionEntryForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference ||
          this.TransactionEntryForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct)) {
        this.TransactionEntryForm.patchValue({
          SalesPersonId: this.TransactionEntryForm.get('BrokerQualifiedPersonId').value,
          SalesPersonName: this.TransactionEntryForm.get('BrokerQualifiedPersonName').value,
        }, { emitEvent: false });
      }

      /**
       * When PermissibleBusiness "NO"
       * SalesPersonType is POSP OR Team REF.
       * Selected branch BQP Default select in salesperson
       */
      if ((this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').value == false) &&
        (this.TransactionEntryForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference ||
          this.TransactionEntryForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP ||
          this.TransactionEntryForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct)) {
        this.TransactionEntryForm.patchValue({
          SalesPersonId: this.TransactionEntryForm.get('BrokerQualifiedPersonId').value,
          SalesPersonName: this.TransactionEntryForm.get('BrokerQualifiedPersonName').value,
        }, { emitEvent: false });
      }

    });


    this.TransactionEntryForm.get('CustomerName').valueChanges.subscribe((val) => {
      let Rule: IFilterRule[] = [
        ActiveMasterDataRule,
        {
          Field: "GroupHeadId",
          Operator: "eq",
          Value: this.TransactionEntryForm.get('GroupHeadId').value
        },
      ]

      let CustomerAdditionalFilters: IAdditionalFilterObject[] = [
        { key: "FullName", filterValues: [val] }
      ]

      this.CustomerName$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Customer.List, 'FirstName', "", Rule, CustomerAdditionalFilters).pipe(
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

    this.PaymentForm.get('BalancecollectionResponsibilityUserName').valueChanges.subscribe((val) => {
      this.BACUser$ = this._MasterListService.getFilteredUserList(val).pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              let result = Array.from(
                res.Data.Items.reduce(
                  (m, t) => m.set(t.FullName, t),
                  new Map()
                ).values()
              );
              result = result.filter((el) => {
                if (el.FullName) {
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

    this.PaymentForm.get('BalanceAmountAuthorizedUserName').valueChanges.subscribe((val) => {
      this.BAAUser$ = this._MasterListService.getFilteredUserList(val).pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              let result = Array.from(
                res.Data.Items.reduce(
                  (m, t) => m.set(t.FullName, t),
                  new Map()
                ).values()
              );
              result = result.filter((el) => {
                if (el.FullName) {
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

    this.TransactionEntryForm.get('TransactionData').valueChanges.subscribe((val) => {
      let Rule: IFilterRule[] = [
        {
          Field: "Category.Name",
          Operator: "contains",
          Value: this.f['CategoryName'].value
        },

        {
          Field: "Branch.Name",
          Operator: "contains",
          Value: this.f['BranchName'].value
        },
      ]

      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        Rule.push({
          Field: "SubCategory.Name",
          Operator: "contains",
          Value: this.f['SubCategoryName'].value
        })
      }

      if (this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Financial' || this.TransactionEntryForm.get('PolicyType').value == 'Endorsement-Non Financial') {
        Rule.push({
          Field: "PolicyType",
          Operator: "in",
          Value: ["New", "Rollover", "Renewal-Same Company", "Renewal-Change Company"]
        })
      }
      this.TransactionList$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Transaction.List, 'TransactionNo', val, Rule).pipe(
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

    this.address?.controls[0]?.get('CityPinCode').valueChanges.subscribe((val) => {
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

    this.address?.controls[1]?.get('CityPinCode').valueChanges.subscribe((val) => {
      this.pincodestwo$ = this._MasterListService.getFilteredPincodeList(val).pipe(
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

    this.TransactionEntryForm.get('MandateObtained').valueChanges.subscribe((val) => {
      this.RemoveMandateDocuments()
    });


    this.TransactionEntryForm.get('VehicleDetail.BrandId').valueChanges.subscribe((val) => {

      if (this.TransactionEntryForm.get('VehicleDetail.BrandId').value && this.Brand$) {
        this.Brand$.pipe(
          map((items) =>
            items.filter((item) => item.Id == this.TransactionEntryForm.get('VehicleDetail.BrandId').value)
          )
        ).subscribe((a) => {
          if (a) {
            this.TransactionEntryForm.get('VehicleDetail').patchValue({
              BrandName: a[0].Name,
            });
          }
        });
      }


      let Rule: IFilterRule[] = [
        {
          Field: "Status",
          Operator: "eq",
          Value: 1
        },
        {
          Field: "Brand.Id",
          Operator: "eq",
          Value: this.TransactionEntryForm.get('VehicleDetail.BrandId').value
        }, {
          Field: "Type",
          Operator: "contains",
          Value: this.TransactionEntryForm.get('SubCategoryName').value
        }
      ]

      this.Model$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.VehicleModel.List, 'Name', '', Rule).pipe(
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

      this.TransactionEntryForm.get('VehicleDetail').patchValue({
        ModelName: "",
        SubModelName: "",
        ModelId: "",
        SubModelId: ""
      })

    });



    this.TransactionEntryForm.get('VehicleDetail.ModelId').valueChanges.subscribe((val) => {
      this.TransactionEntryForm.get('VehicleDetail').patchValue({
        SubModelName: "",
        SubModelId: 0,
        CubicCapacityORKW: "",
        PassengerCapacity: 0,
        GrossVehicleWeight: 0,
        FuelType: ""
      })
    });

    this.TransactionEntryForm.get('VehicleDetail.ModelName').valueChanges.subscribe((val) => {
      let Rule: IFilterRule[] = [
        {
          Field: "Status",
          Operator: "eq",
          Value: 1
        },
        {
          Field: "Brand.Id",
          Operator: "eq",
          Value: this.TransactionEntryForm.get('VehicleDetail.BrandId').value
        }, {
          Field: "Type",
          Operator: "contains",
          Value: this.TransactionEntryForm.get('SubCategoryName').value
        }
      ]

      this.Model$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.VehicleModel.List, 'Name', val, Rule).pipe(
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

    this.TransactionEntryForm.get('VehicleDetail.SubModelName').valueChanges.subscribe((val) => {


      let Rule: IFilterRule[] = [
        {
          Field: "Status",
          Operator: "eq",
          Value: 1
        },
        {
          Field: "Model.Id",
          Operator: "eq",
          Value: this.TransactionEntryForm.get('VehicleDetail.ModelId').value
        }, {
          Field: "Model.Type",
          Operator: "contains",
          Value: this.TransactionEntryForm.get('SubCategoryName').value
        }
      ]
      this.SubModel$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.VehicleSubModel.List, 'Name', val, Rule).pipe(
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

    this.TransactionEntryForm.get('VehicleDetail.CubicCapacityORKW').valueChanges.subscribe((val) => {
      /**
       * Get Basic TP Premium Amount Base On Category, Sub Category and CC
       */
      this.getBasicTPPremiumAmount();
    });

    this.TransactionEntryForm.get('VehicleDetail.FleetBusinessName').valueChanges.subscribe((val) => {
      this.FleetCode$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Fleet.List, 'FleetNo', val).pipe(
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

    this.TransactionEntryForm.get('VehicleDetail.RegistrationDate').valueChanges.subscribe((val) => {
      if (val) {
        let RegistrationDate = this._datePipe.transform(this.TransactionEntryForm.get('VehicleDetail.RegistrationDate').value, 'yyyy-MM-dd');
        let ManufacturingDate = new Date(RegistrationDate);
        let ManufacturingYear = ManufacturingDate.getFullYear()
        this.TransactionEntryForm.get('VehicleDetail.ManufacturingYear').setValue(ManufacturingYear)

        let VehicleAge = moment.duration(moment().diff(RegistrationDate));

        this.TransactionEntryForm.get('VehicleDetail.VehicleAge').
          setValue(`${VehicleAge.years()}Yr ${VehicleAge.months()}m`)

      } else {
        this.TransactionEntryForm.get('VehicleDetail.ManufacturingYear').setValue("")
      }

    });

    // set end date base on start date
    this.TransactionEntryForm.get('StartDate').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('StartDate').value && this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        let StartDate = this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd');
        let endDate = new Date(StartDate);
        endDate.setFullYear(endDate.getFullYear() + 1); // add year
        endDate.setDate(endDate.getDate() - 1);  // one day les
        this.TransactionEntryForm.get('EndDate').patchValue(endDate);

        let PremiumType = this.TransactionEntryForm.get('PremiumType').value;


        if (PremiumType == '1 OD + 3 TP' || PremiumType == '1 OD + 5 TP') {
          this.TransactionEntryForm.get('TPStartDate').patchValue(StartDate);
        }

      }


      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Travel && this.TransactionEntryForm.get('PolicyPeriod').value) {
        let StartDate = this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd');
        let endDate = new Date(StartDate);
        endDate.setDate(endDate.getDate() + (isNaN(parseFloat(this.TransactionEntryForm.get('PolicyPeriod').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('PolicyPeriod').value) - 1));
        this.TransactionEntryForm.get('EndDate').setValue(endDate)
      }

      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Life) {
        this.setPolicyEndDateForLife()
      }


      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Health) {
        if (this.TransactionEntryForm.get('StartDate').value) {
          let StartDate = this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd');
          let EndDate = new Date(StartDate);
          let PolicyPeriod = Number(this.TransactionEntryForm.get('PolicyPeriod').value);
          EndDate.setFullYear(EndDate.getFullYear() + PolicyPeriod); // add year
          EndDate.setDate(EndDate.getDate() - 1);  // one day les
          this.TransactionEntryForm.patchValue({
            EndDate: EndDate
          });

        }

      }

      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Health ||
        this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Fire ||
        this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Life
        || this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Engineering ||
        this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Group) {
        this._calculateNextPremiumDate();
      }
    })

    this.TransactionEntryForm.get('PolicyPeriod').valueChanges.subscribe((val) => {

      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Travel && val && this.TransactionEntryForm.get('StartDate').value) {
        let StartDate = this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd');
        let endDate = new Date(StartDate);
        endDate.setDate(endDate.getDate() + (isNaN(parseFloat(val)) == true ? 0 : parseFloat(val) - 1));
        this.TransactionEntryForm.get('EndDate').setValue(endDate)
      }

      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Health && val && this.TransactionEntryForm.get('StartDate').value) {
        let StartDate = this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd');
        let EndDate = new Date(StartDate);
        let PolicyPeriod = Number(this.TransactionEntryForm.get('PolicyPeriod').value);
        EndDate.setFullYear(EndDate.getFullYear() + PolicyPeriod); // add year
        EndDate.setDate(EndDate.getDate() - 1);  // one day les
        this.TransactionEntryForm.patchValue({
          EndDate: EndDate
        });

      }

    })


    this.TransactionEntryForm.get('PremiumInstallmentType').valueChanges.subscribe((val) => {

      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Health ||
        this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Fire ||
        this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Life
        || this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Engineering ||
        this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Group) {
        this._calculateNextPremiumDate();
      }

    })


    this.TransactionEntryForm.get('TPStartDate').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('TPStartDate').value) {
        let TPStartDate = this._datePipe.transform(this.TransactionEntryForm.get('TPStartDate').value, 'yyyy-MM-dd');
        let tPEndDate = new Date(TPStartDate);
        let PremiumType = this.TransactionEntryForm.get('PremiumType').value;
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
        this.TransactionEntryForm.patchValue({
          TPEndDate: tPEndDate
        });
      }
    })

    this.TransactionEntryForm.get('PremiumType').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {

        if (val == '1 OD + 3 TP') {
          this.noOfYears = 3
        }
        else if (val == '1 OD + 5 TP') {
          this.noOfYears = 5
        } else {
          this.noOfYears = 1
        }
        // this.getTPAddOnPremiumAmount()
        this.getBasicTPPremiumAmount()
      }

      this.MotorPremiumDetailsEnable()

      this.TransactionEntryForm.get('PremiumDetail').patchValue({
        BasicODPremium: 0,
        NCBPer: 0,
        AddOnPremium: 0,
        DiscountAmount: 0,
        OwnerDriverPremium: 0,
        CNGAmount: 0,
        LLDriverPremium: 0,
        PAPremium: 0,
        PaidDriverPremium: 0,
        PaidDriver: false,
        LLDriver: false,
        OwnerDriver: false,
        PA: false,
        CNG: false,
        DiscountPer: 0,
        PASumInsure: ""
      })
      this.PassengerPAList = []
      this.ODPremiumChange();
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor && val == 'SAOD') {
        this._DisableLIABILITYPartField()
      }
      else if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor && val == 'SATP') {
        // this.MotorPremiumDetailsEnable()
        this._DisableOWNDAMAGEPartField()
        this.TransactionEntryForm.get('SumInsured').patchValue(0);
        this.TransactionEntryForm.get('VehicleDetail').patchValue({
          CNGKitValue: 0,
          ElectricalAccessoriesValue: 0,
          NonElectricalAccessoriesValue: 0,
          OtherFitmentValue: 0
        });
      }
      // this.MotorPremiumDetailsEnable()
      else if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor && val == 'PAOD') {
        this._DisableAtPAODSelection()

        if (this.mode == 'Create') {
          this.TransactionEntryForm.get('PremiumDetail').patchValue({
            BasicTPPremium: 0,
          })
        }

      }

      if (this.TransactionEntryForm.get('CategoryName').value
        && this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').setValue(this.getPermissibleBusinessFlag())
      }


      // clear if user change policy type
      this.TransactionEntryForm.patchValue({
        TPStartDate: '',
        TPEndDate: '',
      });

    })

    this.TransactionEntryForm.get('CategoryType').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Travel && val == 'Domestic') {
        this.TransactionEntryForm.get('SubCategoryType').patchValue('Other')
      }

      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Travel && val != 'Domestic' && this.TransactionEntryForm.get('SubCategoryType').value == 'Other') {
        this.TransactionEntryForm.get('SubCategoryType').patchValue('')
      }

    });

    this.TransactionEntryForm.get('VehicleDetail.GrossVehicleWeight').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor && this.TransactionEntryForm.get('SubCategoryCode').value == SubCategoryCodeEnum.GCV) {
        /**
         * Get Basic TP Premium Amount Base On Category, Sub Category and CC
         */
        this.getBasicTPPremiumAmount();
      }
    });

    this.TransactionEntryForm.get('VehicleDetail.AnyClaiminPreviousYear').valueChanges.subscribe((val) => {
      if (val == 'true') {
        this.TransactionEntryForm.get('PremiumDetail.NCBPer').setValue(0)
      }
    });

    this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        this.ODPremiumChange()
      }
    })

    this.TransactionEntryForm.get('PremiumDetail.DiscountAmount').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        this.ODPremiumChange()
      }
    })

    this.TransactionEntryForm.get('PremiumDetail.NCBPer').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        this.ODPremiumChange()
      }
    })
    this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        this.ODPremiumChange()
      }
    })
    this.TransactionEntryForm.get('PremiumDetail.ODGSTPer').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        this.ODPremiumChange()
      }
    })
    this.TransactionEntryForm.get('PremiumDetail.BasicTPPremium').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        this.ODPremiumChange()
      }
    })
    this.TransactionEntryForm.get('PremiumDetail.PASumInsure').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        // this.TransactionEntryForm.get('PremiumDetail.PASumInsure').valueChanges.subscribe((val) => {
        for (let i = 0; i < this.PassengerPAList.length; i++) {
          if (this.PassengerPAList[i].PassengerPA == this.TransactionEntryForm.get('PremiumDetail.PASumInsure').value) {

            let PassengerPAAmount = isNaN(this.PassengerPAList[i].PassengerPAAmount) == true ? 0 : this.PassengerPAList[i].PassengerPAAmount
            if (!PassengerPAAmount) {
              PassengerPAAmount = 0
            }
            this.TransactionEntryForm.get('PremiumDetail.PAPremium').patchValue(parseFloat(PassengerPAAmount) * this.noOfYears)
            break;
          }
          else {
            this.TransactionEntryForm.get('PremiumDetail.PAPremium').patchValue(0)
          }
        }
        // })
        this.ODPremiumChange()
      }
    })
    this.TransactionEntryForm.get('PremiumDetail.TPGSTPer').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        this.ODPremiumChange()
      }
    })
    this.TransactionEntryForm.get('PremiumDetail.OtherLiabilityGSTPer').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor) {
        this.ODPremiumChange()
      }
    })

    this.TransactionEntryForm.get('PremiumDetail.TotalNetPremium').valueChanges.subscribe((val) => {

      this.TransactionEntryForm.get('PaymentDetail.ReceivableAmount').patchValue(val)

    })

    this.TransactionEntryForm.get('SumInsured').valueChanges.subscribe((val) => {
      if (this.TransactionEntryForm.get('CategoryName').value && this.TransactionEntryForm.get('SubCategoryName').value) {
        this.TransactionEntryForm.get('VehicleDetail.IsPermissibleBusinessforPoSP').setValue(this.getPermissibleBusinessFlag())
      }
      this.totalValue()
    })


    this.TransactionEntryForm.get('VehicleDetail.CNGKitValue').valueChanges.subscribe((val) => {
      this.totalValue()
    })

    this.TransactionEntryForm.get('VehicleDetail.ElectricalAccessoriesValue').valueChanges.subscribe((val) => {
      this.totalValue()
    })

    this.TransactionEntryForm.get('VehicleDetail.NonElectricalAccessoriesValue').valueChanges.subscribe((val) => {
      this.totalValue()
    })

    this.TransactionEntryForm.get('VehicleDetail.OtherFitmentValue').valueChanges.subscribe((val) => {
      this.totalValue()
    })

    this.PremiumDetailForm.get('BasicPremium').valueChanges.subscribe((val) => {
      this._premiumCalculation()
    })
    this.PremiumDetailForm.get('GSTPer').valueChanges.subscribe((val) => {
      this._premiumCalculation()
    })

    this.PremiumDetailForm.get('StampDuty').valueChanges.subscribe((val) => {
      this._premiumCalculation()
    })

    // this.PremiumDetailForm.get('DiscountPer').valueChanges.subscribe((val) => {
    //   this._premiumCalculation()
    // })


    this.PremiumDetailForm.get('AddOnPremium').valueChanges.subscribe((val) => {

      if (this.TransactionEntryForm.get('CategoryCode').value != CategoryCodeEnum.Motor) {
        this._premiumCalculation()
      }
    })

    this.PremiumDetailForm.get('TerrorismPremium').valueChanges.subscribe((val) => {
      this._premiumCalculation()
    })
    this.PremiumDetailForm.get('BasicRate').valueChanges.subscribe((val) => {
      this._premiumCalculation()
    })
    this.PremiumDetailForm.get('MedicalPremium').valueChanges.subscribe((val) => {
      this._premiumCalculation()
    })


    this.PremiumDetailForm.get('MedicalExpenseLimitType').valueChanges.subscribe((val) => {
      if (val == 'Not Applicable') {
        this.PremiumDetailForm.get('MedicalExpenseValue').patchValue(0)
      }
    })


  }

  private _onFormControlChange() {


    this.CoShareBool.valueChanges.subscribe((val) => {

      let selectedCampany
      this.InsuranceCompany$.subscribe(campany => {
        selectedCampany = campany.filter(c => c.Code == this.TransactionEntryForm.get('InsuranceCompanyCode').value)

        if (val == true) {
          if (selectedCampany) {
            var row: ICoSharesDto = new CoSharesDto()
            row.COshare = this.CoShareBool.value
            row.COshareInsurer = selectedCampany[0].ShortName
            row.COshareInsurerShortName = selectedCampany[0].ShortName
            row.COshareInsurerCode = selectedCampany[0].Code
            row.COshareper = 100
            this.Coshare.push(this._initCoSharesForm(row))
          }
        } else {
          while (this.Coshare.controls.length !== 0) {
            this.Coshare.removeAt(0)
          }
        }
      })
    })

    this.CoShareId.valueChanges.subscribe((val) => {

      this.InsuranceCompany$.pipe(
        map((items) =>
          items.filter((item) => item.Code.indexOf(this.CoShareId.value) > -1)
        )
      ).subscribe((a) => {
        if (a.length > 0) {
          this.CoShareName.patchValue(a[0].ShortName);
        }
      });
    })

    this.BrandSearchCtrl.valueChanges.subscribe(val => {
      let filter = val.toLowerCase();
      this.Brand$.pipe(
        map((items) =>
          items.filter(option => option.Name.toLowerCase().includes(filter))
        )
      ).subscribe(res => {
        this.BrandList = res
      })
    })


  }

  private totalValue() {
    let SumInsured: number = 0
    let CNGKitValue: number = 0
    let ElectricalAccessoriesValue: number = 0
    let NonElectricalAccessoriesValue: number = 0
    let OtherFitmentValue: number = 0

    let TotalValue: number = 0

    if (this.TransactionEntryForm.get('SumInsured').value) {
      SumInsured = isNaN(parseFloat(this.TransactionEntryForm.get('SumInsured').value)) ? 0 : parseFloat(this.TransactionEntryForm.get('SumInsured').value)
    }
    if (this.TransactionEntryForm.get('VehicleDetail.CNGKitValue').value) {
      CNGKitValue = isNaN(parseFloat(this.TransactionEntryForm.get('VehicleDetail.CNGKitValue').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('VehicleDetail.CNGKitValue').value)
    }
    if (this.TransactionEntryForm.get('VehicleDetail.ElectricalAccessoriesValue').value) {
      ElectricalAccessoriesValue = isNaN(parseFloat(this.TransactionEntryForm.get('VehicleDetail.ElectricalAccessoriesValue').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('VehicleDetail.ElectricalAccessoriesValue').value)
    }
    if (this.TransactionEntryForm.get('VehicleDetail.NonElectricalAccessoriesValue').value) {
      NonElectricalAccessoriesValue = isNaN(parseFloat(this.TransactionEntryForm.get('VehicleDetail.NonElectricalAccessoriesValue').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('VehicleDetail.NonElectricalAccessoriesValue').value)
    }
    if (this.TransactionEntryForm.get('VehicleDetail.OtherFitmentValue').value) {
      OtherFitmentValue = isNaN(parseFloat(this.TransactionEntryForm.get('VehicleDetail.OtherFitmentValue').value)) == true ? 0 : parseFloat(this.TransactionEntryForm.get('VehicleDetail.OtherFitmentValue').value)
    }
    TotalValue = OtherFitmentValue + ElectricalAccessoriesValue + NonElectricalAccessoriesValue + CNGKitValue + SumInsured

    this.TransactionEntryForm.get('VehicleDetail.TotalValue').patchValue(TotalValue.toFixed(2))

  }


  private _premiumCalculation() {

    if (this.TransactionEntryForm.get('CategoryCode').value != CategoryCodeEnum.WorkmenComp &&
      this.TransactionEntryForm.get('CategoryCode').value != CategoryCodeEnum.Fire &&
      this.TransactionEntryForm.get('CategoryCode').value != CategoryCodeEnum.Engineering) {
      // Basic Premium: User Entry Field
      // GST Amount Formula: Basic Premium *  GST % (default 18%)
      // Total Premium Formula: Basic Premium + GST Amount

      let BasicPremium: number = 0
      let GSTPer: number = 0
      let GSTAmount: number = 0
      let TotalNetPremium: number = 0
      let ProductCode: string = ''

      if (this.PremiumDetailForm.get('BasicPremium').value) {
        BasicPremium = isNaN(parseFloat(this.PremiumDetailForm.get('BasicPremium').value)) == true ? 0 : parseFloat(this.PremiumDetailForm.get('BasicPremium').value)
      }
      if (this.PremiumDetailForm.get('GSTPer').value) {
        GSTPer = parseFloat(this.PremiumDetailForm.get('GSTPer').value)
      }
      // if(this.PremiumDetailsForm.get('ProductCode').value){
      //   ProductCode = parseFloat(this.PremiumDetailsForm.get('ProductCode').value).toString()
      // }
      GSTAmount = BasicPremium * GSTPer / 100
      this.PremiumDetailForm.patchValue({
        GSTAmount: GSTAmount.toFixed(2)
      })

      TotalNetPremium = BasicPremium + GSTAmount
      this.PremiumDetailForm.patchValue({
        TotalNetPremium: TotalNetPremium.toFixed(2)
      })
    }

    if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.WorkmenComp) {
      let TotalPerson: number = 0
      let Wages: number = 0
      let MedicalExpenseLimitType: string
      let Value: number = 0
      let BasicRate: number = 0
      let BasicPremium: number = 0
      let DiscountPer: number = 0
      let DiscountAmount: number = 0
      let MedicalPremium: number = 0
      let GSTPer: number = 0
      let GSTAmount: number = 0
      let TotalPremium: number = 0
      let ProductCode: string = ''
      let BasicPremiumAfterDiscount: number = 0


      if (this.PremiumDetailForm.get('TotalPerson').value) {
        TotalPerson = parseFloat(this.PremiumDetailForm.get('TotalPerson').value)
      }
      if (this.PremiumDetailForm.get('Wages').value) {
        Wages = parseFloat(this.PremiumDetailForm.get('Wages').value)
      }
      if (this.PremiumDetailForm.get('MedicalExpenseLimitType').value) {
        MedicalExpenseLimitType = this.PremiumDetailForm.get('MedicalExpenseLimitType').value.toString()
      }
      const wagesControl = this.PremiumDetailForm.get('Wages');
      if (wagesControl) {
        Wages = parseFloat(wagesControl.value);
      }

      if (this.PremiumDetailForm.get('MedicalExpenseValue').value) {
        Value = isNaN(parseFloat(this.PremiumDetailForm.get('MedicalExpenseValue').value)) == true ? 0 : parseFloat(this.PremiumDetailForm.get('MedicalExpenseValue').value)
      }
      if (this.PremiumDetailForm.get('BasicRate').value) {
        BasicRate = isNaN(parseFloat(this.PremiumDetailForm.get('BasicRate').value)) == true ? 0 : parseFloat(this.PremiumDetailForm.get('BasicRate').value)
      }
      if (this.PremiumDetailForm.get('MedicalPremium').value) {
        MedicalPremium = isNaN(parseFloat(this.PremiumDetailForm.get('MedicalPremium').value)) == true ? 0 : parseFloat(this.PremiumDetailForm.get('MedicalPremium').value)
      }




      if (this.PremiumDetailForm.get('BasicPremium').value) {
        BasicPremium = isNaN(parseFloat(this.PremiumDetailForm.get('BasicPremium').value)) == true ? 0 : parseFloat(this.PremiumDetailForm.get('BasicPremium').value)
      }
      if (this.PremiumDetailForm.get('DiscountPer').value) {
        DiscountPer = parseFloat(this.PremiumDetailForm.get('DiscountPer').value)
      }
      // if(this.PremiumDetailsForm.get('ProductCode').value){
      //   ProductCode = parseFloat(this.PremiumDetailsForm.get('ProductCode').value).toString()
      // }

      /**
     * remove Discount Amount Calculation in V-20
     */
      // DiscountAmount = BasicPremium * DiscountPer / 100
      // this.PremiumDetailsForm.patchValue({
      //   DiscountAmount: DiscountAmount
      // })

      DiscountAmount = 0


      BasicPremiumAfterDiscount = BasicPremium - DiscountAmount
      this.PremiumDetailForm.patchValue({
        BasicPremiumAfterDiscount: BasicPremiumAfterDiscount
      })


      if (this.PremiumDetailForm.get('GSTPer').value) {
        GSTPer = parseFloat(this.PremiumDetailForm.get('GSTPer').value)
      }
      GSTAmount = (BasicPremium - DiscountAmount + MedicalPremium) * GSTPer / 100
      this.PremiumDetailForm.patchValue({
        GSTAmount: GSTAmount.toFixed(2)
      })

      TotalPremium = BasicPremium + MedicalPremium + GSTAmount
      this.PremiumDetailForm.patchValue({
        TotalNetPremium: TotalPremium.toFixed(2)
      })

    }

    if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Fire || this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Engineering) {
      // Calculation Formula
      // Basic Rate: User Entry Field
      // Basic Premium: User Entry Field
      // Discount Amount Formula: [Basic Premium * Discount %] (or it can be inserted manually if % is not mentioned)
      // Basic Premium After Discount: Basic Premium - Discount Amount
      // Terrorism Premium: User Entry Field
      // Add-On Premium: User Entry Field
      // Net Premium: Basic Premium after Discount + Terrorism Premium + Add on Premium
      // GST Amount: Net Premium * GST %
      // Total Policy Premium: Net Premium + GST Amount

      let BasicRate: number = 0
      let BasicPremium: number = 0
      let DiscountPer: number = 0
      let DiscountAmount: number = 0
      let BasicPremiumAfterDiscount: number = 0
      let TerrorismPremium: number = 0
      let AddOnPremium: number = 0
      let TotalPremium: number = 0
      let GSTPer: number = 0
      let GSTAmount: number = 0
      let TotalNetPremium: number = 0
      let ProductCode: string = ''

      if (this.PremiumDetailForm.get('BasicPremium').value) {
        BasicPremium = isNaN(parseFloat(this.PremiumDetailForm.get('BasicPremium').value)) == true ? 0 : parseFloat(this.PremiumDetailForm.get('BasicPremium').value)
      }
      if (this.PremiumDetailForm.get('DiscountPer').value) {
        DiscountPer = parseFloat(this.PremiumDetailForm.get('DiscountPer').value)
      }
      // if(this.PremiumDetailsForm.get('ProductCode').value){
      //   ProductCode = parseFloat(this.PremiumDetailsForm.get('ProductCode').value).toString()
      // }

      /**
 * remove Discount Amount Calculation in V-20
 */
      // DiscountAmount = BasicPremium * DiscountPer/100
      // this.PremiumDetailsForm.patchValue({
      //   DiscountAmount : DiscountAmount
      // })

      DiscountAmount = 0

      BasicPremiumAfterDiscount = BasicPremium - DiscountAmount
      this.PremiumDetailForm.patchValue({
        BasicPremiumAfterDiscount: BasicPremiumAfterDiscount
      })

      if (this.PremiumDetailForm.get('TerrorismPremium').value) {
        TerrorismPremium = isNaN(parseFloat(this.PremiumDetailForm.get('TerrorismPremium').value)) == true ? 0 : parseFloat(this.PremiumDetailForm.get('TerrorismPremium').value)
      }

      if (this.PremiumDetailForm.get('AddOnPremium').value) {
        AddOnPremium = isNaN(parseFloat(this.PremiumDetailForm.get('AddOnPremium').value)) == true ? 0 : parseFloat(this.PremiumDetailForm.get('AddOnPremium').value)
      }

      TotalPremium = BasicPremiumAfterDiscount + TerrorismPremium + AddOnPremium
      this.PremiumDetailForm.patchValue({
        TotalPremium: TotalPremium
      })

      if (this.PremiumDetailForm.get('GSTPer').value) {
        GSTPer = parseFloat(this.PremiumDetailForm.get('GSTPer').value)
      }

      GSTAmount = TotalPremium * GSTPer / 100
      this.PremiumDetailForm.patchValue({
        GSTAmount: GSTAmount.toFixed(2)
      })

      TotalNetPremium = TotalPremium + GSTAmount
      this.PremiumDetailForm.patchValue({
        TotalNetPremium: TotalNetPremium.toFixed(2)
      })

    }

    if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Marine) {
      let BasicPremium: number = 0
      let DiscountPer: number = 0
      let DiscountAmount: number = 0
      let StampDuty: number = 0
      let TotalPremium: number = 0
      let GSTPer: number = 0
      let GSTAmount: number = 0
      let TotalNetPremium: number = 0

      if (this.PremiumDetailForm.get('BasicPremium').value) {
        BasicPremium = isNaN(parseFloat(this.PremiumDetailForm.get('BasicPremium').value)) == true ? 0 : parseFloat(this.PremiumDetailForm.get('BasicPremium').value)
      }

      if (this.PremiumDetailForm.get('DiscountPer').value) {
        DiscountPer = parseFloat(this.PremiumDetailForm.get('DiscountPer').value)
      }

      /**
   * remove Discount Amount Calculation in V-20
   */
      DiscountAmount = 0

      // DiscountAmount = BasicPremium * DiscountPer/100
      // this.PremiumDetailsForm.patchValue({
      //   DiscountAmount : DiscountAmount
      // })

      if (this.PremiumDetailForm.get('StampDuty').value) {
        StampDuty = isNaN(parseFloat(this.PremiumDetailForm.get('StampDuty').value)) == true ? 0 : parseFloat(this.PremiumDetailForm.get('StampDuty').value)
      }

      if (this.PremiumDetailForm.get('DiscountPer').value) {
        DiscountPer = parseFloat(this.PremiumDetailForm.get('DiscountPer').value)
      }

      if (this.PremiumDetailForm.get('DiscountAmount').value) {
        DiscountAmount = isNaN(parseFloat(this.PremiumDetailForm.get('DiscountAmount').value)) == true ? 0 : parseFloat(this.PremiumDetailForm.get('DiscountAmount').value)
      }

      TotalPremium = (BasicPremium - DiscountAmount) + StampDuty;

      this.PremiumDetailForm.patchValue({
        TotalPremium: TotalPremium
      })

      if (this.PremiumDetailForm.get('GSTPer').value) {
        GSTPer = parseFloat(this.PremiumDetailForm.get('GSTPer').value)
      }

      GSTAmount = TotalPremium * GSTPer / 100
      this.PremiumDetailForm.patchValue({
        GSTAmount: GSTAmount.toFixed(2)
      })

      TotalNetPremium = TotalPremium + GSTAmount;
      this.PremiumDetailForm.patchValue({
        TotalNetPremium: TotalNetPremium.toFixed(2)
      })

    }

  }

  private _getCategoryWiseSubCategogry(CategoryId: number) {

    let SubCategoryRule: IFilterRule[] = [
      ActiveMasterDataRule,
      {
        Field: "Category.Id",
        Operator: "eq",
        Value: CategoryId
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
  }

  private _getCategoryWiseInsuranceCampany(CategoryId: any) {
    let InsuranceCompanyRule: IFilterRule[] = [
      {
        Field: 'Status',
        Operator: 'eq',
        Value: 1,
      }
    ];
    let InsuranceCompanyAdditionalFilters: IAdditionalFilterObject[] = [
      { key: "CatagoryId", filterValues: [CategoryId] }
    ]
    this.InsuranceCompany$ = this._MasterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.InsuranceCompany.list, 'Name', "", InsuranceCompanyRule, InsuranceCompanyAdditionalFilters)
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

  private _getInsuranceCampnyWiseProduct(SubCategoryId: number, InsuranceCompanyCode: string) {
    let Rule: IFilterRule[] = [
      ActiveMasterDataRule,
      {
        Field: "SubCategory.Id",
        Operator: "eq",
        Value: SubCategoryId
      },
      {
        Field: "InsurerCode",
        Operator: "eq",
        Value: InsuranceCompanyCode
      }
    ]

    this.Product$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.ProductPlan.List, 'Name', '', Rule).pipe(
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

  private _getSubCategoryWiseBrandList() {

    let SubCategoryName = this.TransactionEntryForm.get('SubCategoryName').value;

    let Rule: IFilterRule[] = [ActiveMasterDataRule];

    let AdditionalFilters: IAdditionalFilterObject[] = [
      { key: "VehicleType", filterValues: [SubCategoryName] }
    ]

    this.Brand$ = this._MasterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.VehicleBrand.List, 'Name', "", Rule, AdditionalFilters).pipe(
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

    this.Brand$.subscribe(res => {
      this.BrandList = res
    })
  }


  /**
 * value of Corresponding Premium based on the selected Category and Sub Category Name from TP Premium master
 *  ResponseOfTP : is response from TP premium master based on selected Category and Sub Category
 */
  private _getSubCategoryWiseTPPremium(SubCategoryId) {
    let api = API_ENDPOINTS.TPPremium.List

    let Rule: IFilterRule[] = [
      ActiveMasterDataRule,
      {
        Field: "SubCategory.Id",
        Operator: "eq",
        Value: SubCategoryId
      }
    ]

    this._MasterListService.getFilteredMultiRulMasterDataList(api, 'SubCategory.Name', '', Rule).subscribe((res) => {
      if (res.Success) {
        this.TpPremiumMasterData = res
      }

      if (this.mode != 'Create') {
        this.PassengerPAList = []
        if (this.TransactionEntryForm.get('PremiumDetail.PA').value == true) {
          if (this.TpPremiumMasterData.Success && this.TpPremiumMasterData.Data.Items.length > 0) {
            this.PassengerPAList = this.TpPremiumMasterData.Data.Items[0].TPPremiumPADetails
          }
        }
      }

    });
  }


  private _PaymentInformationAmountChange() {
    this.PaymentForm.get('ChequePayment').valueChanges.subscribe((val) => {
      if (val == false) {
        this.PaymentForm.get('ChequeAmount').patchValue(0)
      }
      this._calculations()
    })
    this.PaymentForm.get('ChequeAmount').valueChanges.subscribe((val) => {
      this._calculations()
    })
    this.PaymentForm.get('CashPayment').valueChanges.subscribe((val) => {
      if (val == false) {
        this.PaymentForm.get('CashAmount').patchValue(0)
      }
      this._calculations()
    })
    this.PaymentForm.get('CashAmount').valueChanges.subscribe((val) => {
      this._calculations()
    })
    this.PaymentForm.get('OnlinePayment').valueChanges.subscribe((val) => {
      if (val == false) {
        this.PaymentForm.get('OnlineTransferredAmount').patchValue(0)
      }
      this._calculations()
    })
    this.PaymentForm.get('OnlineTransferredAmount').valueChanges.subscribe((val) => {
      this._calculations()
    })
    this.PaymentForm.get('CreditCardPayment').valueChanges.subscribe((val) => {
      if (val == false) {
        this.PaymentForm.get('CreditCardAmount').patchValue(0)
      }
      this._calculations()
    })
    this.PaymentForm.get('CreditCardAmount').valueChanges.subscribe((val) => {
      this._calculations()
    })
    this.PaymentForm.get('BrokerCdACPayment').valueChanges.subscribe((val) => {
      if (val == false) {
        this.PaymentForm.get('BrokerCdACAmount').patchValue(0)
      }
      this._calculations()
    })
    this.PaymentForm.get('BrokerCdACAmount').valueChanges.subscribe((val) => {
      this._calculations()
    })
    this.PaymentForm.get('CustomerFloatPayment').valueChanges.subscribe((val) => {
      if (val == false) {
        this.PaymentForm.get('CustomerFloatAmount').patchValue(0)
      }
      this._calculations()
    })
    this.PaymentForm.get('CustomerFloatAmount').valueChanges.subscribe((val) => {
      this._calculations()
    })

    this.PaymentForm.get('ReceivableAmount').valueChanges.subscribe((val) => {
      this._compareCollectedReceiveAmount()
      this._calculations()
    })
    this.PaymentForm.get('CollectedAmount').valueChanges.subscribe((val) => {
      this._compareCollectedReceiveAmount()
    })

  }


  /**
 * raise alert message when Collected Amount is greater than Policy Amount
 */
  private _compareCollectedReceiveAmount() {
    if (this.TransactionEntryForm.get('PolicyType').value != 'Endorsement-Financial') {
      if (this.PaymentForm.get('ReceivableAmount').value < this.PaymentForm.get('CollectedAmount').value && Math.abs(this.PaymentForm.get('ReceivableAmount').value - this.PaymentForm.get('CollectedAmount').value) > 5) {
        this._alertservice.raiseErrorAlert('Collected Amount cannot be greater than Policy Amount.', true)
      }
    }
  }

  private _calculations() {
    let ChequeAmount: number = 0
    let CashAmount: number = 0
    let OnlineTransferredAmount: number = 0
    let CreditCardAmount: number = 0
    let BrokerCdACAmount: number = 0
    let CustomerFloatAmount: number = 0
    let ReceivableAmount: number = 0
    let CollectedAmount: number = 0
    let BalanceAmount: number = 0

    if (this.PaymentForm.get('ChequeAmount').value) {
      ChequeAmount = isNaN(parseFloat(this.PaymentForm.get('ChequeAmount').value)) == true ? 0 : parseFloat(this.PaymentForm.get('ChequeAmount').value)
    }
    if (this.PaymentForm.get('CashAmount').value) {
      CashAmount = isNaN(parseFloat(this.PaymentForm.get('CashAmount').value)) == true ? 0 : parseFloat(this.PaymentForm.get('CashAmount').value)
    }
    if (this.PaymentForm.get('OnlineTransferredAmount').value) {
      OnlineTransferredAmount = isNaN(parseFloat(this.PaymentForm.get('OnlineTransferredAmount').value)) == true ? 0 : parseFloat(this.PaymentForm.get('OnlineTransferredAmount').value)
    }
    if (this.PaymentForm.get('CreditCardAmount').value) {
      CreditCardAmount = isNaN(parseFloat(this.PaymentForm.get('CreditCardAmount').value)) == true ? 0 : parseFloat(this.PaymentForm.get('CreditCardAmount').value)
    }
    if (this.PaymentForm.get('BrokerCdACAmount').value) {
      BrokerCdACAmount = isNaN(parseFloat(this.PaymentForm.get('BrokerCdACAmount').value)) == true ? 0 : parseFloat(this.PaymentForm.get('BrokerCdACAmount').value)
    }
    if (this.PaymentForm.get('CustomerFloatAmount').value) {
      CustomerFloatAmount = isNaN(parseFloat(this.PaymentForm.get('CustomerFloatAmount').value)) == true ? 0 : parseFloat(this.PaymentForm.get('CustomerFloatAmount').value)
    }
    if (this.PaymentForm.get('ReceivableAmount').value) {
      ReceivableAmount = isNaN(parseFloat(this.PaymentForm.get('ReceivableAmount').value)) == true ? 0 : parseFloat(this.PaymentForm.get('ReceivableAmount').value)
    }

    CollectedAmount = ChequeAmount + CashAmount + OnlineTransferredAmount + CreditCardAmount + BrokerCdACAmount + CustomerFloatAmount
    this.PaymentForm.get('CollectedAmount').patchValue(CollectedAmount)
    // if (CollectedAmount > ReceivableAmount) {
    //   BalanceAmount = 0;
    // }
    // else {
    //   BalanceAmount = ReceivableAmount - CollectedAmount
    // }
    BalanceAmount = ReceivableAmount - CollectedAmount

    this.PaymentForm.get('BalanceAmount').patchValue(BalanceAmount.toFixed(2))
  }


  /**
 * CategoryType1 , CategoryType2 === Come From Config File & filter data As per selected Category & Subcategory
 * @param categoryCode
 * @param subCategoryCode
 */
  private _getCategoryData(categoryCode, subCategoryCode) {
    this.CategoryType1List = []
    this.CategoryType2List = []
    this.TravelPolicydaysdrplist = []

    const categoryObj = CategoryType1.find(cat => cat.CategoryCode === categoryCode);
    if (categoryObj) {
      if (categoryObj.items != null) {
        this.CategoryType1List = categoryObj.items
      } else {
        if (subCategoryCode) {
          const subCategoryObj = categoryObj.SubCategory.find(subCat => subCat.SubCategoryCode === subCategoryCode);
          if (subCategoryObj) {
            this.CategoryType1List = subCategoryObj.items
          }
        }
      }
    }

    const categoryObj2 = CategoryType2.find(cat => cat.CategoryCode === categoryCode);
    if (categoryObj2) {
      if (categoryObj2.items != null) {
        this.CategoryType2List = categoryObj2.items
      }
    }

    if (subCategoryCode) {
      const TravelPolicyDay = TravelPolicyDaysList.find(subCat => subCat.SubCategoryCode === subCategoryCode);

      if (TravelPolicyDay) {
        this.TravelPolicydaysdrplist = TravelPolicyDay.items;
      }

    }
  }

  /**
* Get Basic TP Premium Amount Base On Category, Sub Category and CC
*/
  private getBasicTPPremiumAmount() {

    let CategoryCode = this.TransactionEntryForm.get("CategoryCode").value
    let SubCategoryCode = this.TransactionEntryForm.get("SubCategoryCode").value
    let CC = this.TransactionEntryForm.get("VehicleDetail.CubicCapacityORKW").value

    if (SubCategoryCode == SubCategoryCodeEnum.MiscellaneousD) {
      CC = 1
    }

    if (CategoryCode == CategoryCodeEnum.Motor && SubCategoryCode == SubCategoryCodeEnum.GCV) {
      CC = this.TransactionEntryForm.get("VehicleDetail.GrossVehicleWeight").value
    }

    let objBasicTPPremiumAmount = this.BasicTPPremiumAmountList.filter(x =>
      x.CategoryName == CategoryCode
      && x.SubCategoryCode == SubCategoryCode
      && (parseFloat(parseFloat(x.FromCC).toFixed(2)) < parseFloat(parseFloat(CC).toFixed(2)) && parseFloat(parseFloat(x.ToCC).toFixed(2)) >= parseFloat(parseFloat(CC).toFixed(2)))
    )

    let BasicTPPremiumAmount = 0

    if (objBasicTPPremiumAmount != null && objBasicTPPremiumAmount.length > 0) {
      BasicTPPremiumAmount = parseFloat(objBasicTPPremiumAmount[0].BasicTPPremiumAmount);
    }

    let noOfYears = 1


    if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
      this.TransactionEntryForm.get('PremiumType').value == '1 OD + 3 TP') {
      noOfYears = 3
    }
    else if (this.TransactionEntryForm.get('CategoryCode').value == CategoryCodeEnum.Motor &&
      this.TransactionEntryForm.get('PremiumType').value == '1 OD + 5 TP') {
      noOfYears = 5
    } else {
      noOfYears = 1
    }

    this.TransactionEntryForm.get('PremiumDetail.BasicTPPremium').patchValue((BasicTPPremiumAmount * noOfYears).toFixed(2))
  }

  /**
* Get TP Add On Premium Amount Base On Category and Sub Category
* GSTMappingList
*/
  private setGSTPerBaseOnCategoryNSubCategory() {
    // let CategoryName = this.TransactionEntryForm.get("CategoryName").value
    let CategoryCode = this.TransactionEntryForm.get("CategoryCode").value
    let SubCategoryCode = this.TransactionEntryForm.get("SubCategoryCode").value
    let PolicyType = this.TransactionEntryForm.get("PolicyType").value;

    if ((PolicyType == "New" || PolicyType == "Renewal-Same Company" || PolicyType == "Renewal-Change Company") && CategoryCode == CategoryCodeEnum.Life) {
      PolicyType = "New_Renewal";
    }
    else if (PolicyType == "Renewal-Same Company" || PolicyType == "Renewal-Change Company") {
      PolicyType = "Renewal";
    }
    else if (PolicyType == "New") {
      PolicyType = "New";
    }
    else if (PolicyType == "Rollover") {
      PolicyType = "Rollover";
    }
    else {
      PolicyType = "Other";
    }

    if (PolicyType != "Other") {
      let GSTPer = 0
      let objGSTPercetages = this.GSTMappingList.filter(x =>
        x.CategoryCode == CategoryCode
        && (x.PolicyType == PolicyType)
      )

      // if (this.TransactionEntryForm.get("PolicyType").value != "") {
      PolicyType = this.TransactionEntryForm.get("PolicyType").value
      // }
      // else {
      //   PolicyType = this.PolicyDetail.PolicyDetailsForm.get("PolicyType").value
      // }

      if (objGSTPercetages != null && objGSTPercetages.length > 0) {

        if (PolicyType == "New" && CategoryCode == CategoryCodeEnum.Life) {
          GSTPer = parseFloat(objGSTPercetages[0].New);
        }
        else if ((PolicyType == "Renewal-Same Company" || PolicyType == "Renewal-Change Company") && CategoryCode == CategoryCodeEnum.Life) {
          GSTPer = parseFloat(objGSTPercetages[0].Renewal);
        }
        else if (PolicyType == "Renewal-Same Company" || PolicyType == "Renewal-Change Company") {
          GSTPer = parseFloat(objGSTPercetages[0].Renewal);
        }
        else if (PolicyType == "New") {
          GSTPer = parseFloat(objGSTPercetages[0].New);
        }
        else {
          GSTPer = 18;
        }

      }
      else {
        if ((PolicyType == "Rollover" || PolicyType == "Endorsement-Financial" || PolicyType == "Endorsement-Non Financial") && CategoryCode == CategoryCodeEnum.Life) {
          GSTPer = 0;
        }
        else {
          GSTPer = 18;
        }
      }

      this.TransactionEntryForm.get('PremiumDetail').patchValue({
        GSTPer: parseFloat(GSTPer.toFixed(2))
      })


      let  OD_GSTPer = 18;
      this.TransactionEntryForm.get('PremiumDetail.GSTPer').patchValue(GSTPer.toFixed(2))
      if (CategoryCode == CategoryCodeEnum.Motor && (SubCategoryCode == SubCategoryCodeEnum.GCV || SubCategoryCode == SubCategoryCodeEnum.PCV || SubCategoryCode == SubCategoryCodeEnum.MiscellaneousD)) {
        GSTPer = 12;
        this.TransactionEntryForm.get('PremiumDetail').patchValue({
          TPGSTPer: parseFloat(GSTPer.toFixed(2)),
          ODGSTPer: parseFloat(OD_GSTPer.toFixed(2)),
        })
      }
      else {
        GSTPer = 18;
        this.TransactionEntryForm.get('PremiumDetail').patchValue({
          TPGSTPer: parseFloat(GSTPer.toFixed(2)),
          ODGSTPer: parseFloat(OD_GSTPer.toFixed(2)),
        })
      }
    }

  }

  /**
    * Get Category on Permissible Business Flag Yes/No
    * Find the Permissible Business Flag in Category wise array from PermissibleBusinessDetails.config.ts file
*/
  public getPermissibleBusinessFlag(): boolean {
    let CategoryCode = this.TransactionEntryForm.get("CategoryCode").value
    let SubCategoryCode = this.TransactionEntryForm.get("SubCategoryCode").value

    let PremiumType = this.TransactionEntryForm.get('PremiumType').value


    let SalesPersonType
    if (this.GroupHeadResponseData) {
      this.GroupHeadResponseData.pipe(takeUntil(this.destroy$)).subscribe(
        (res) => {
          SalesPersonType = res.SalesPersonType
        }
      );
    } else {
      SalesPersonType = '';
    }



    let SumInsured = isNaN(parseFloat(this.TransactionEntryForm.get("SumInsured").value)) ? 0 : parseFloat(this.TransactionEntryForm.get("SumInsured").value)


    let PermissibleBusinessForPoSP = false;
    this.PermissibleBusinessList = []

    if (SalesPersonType == SalesPersonTypeEnum.TeamReference) {
      PermissibleBusinessForPoSP = false;
      return PermissibleBusinessForPoSP;
    }

    if (SalesPersonType == SalesPersonTypeEnum.Direct) {
      PermissibleBusinessForPoSP = true;
      return PermissibleBusinessForPoSP;
    }

    if (CategoryCode == CategoryCodeEnum.Motor && PremiumType == 'SATP') {
      PermissibleBusinessForPoSP = false;
      return PermissibleBusinessForPoSP;
    }
    if (CategoryCode == CategoryCodeEnum.Motor && PremiumType == 'PAOD') {
      PermissibleBusinessForPoSP = true;
      return PermissibleBusinessForPoSP;
    }

    if (CategoryCode == CategoryCodeEnum.Motor) { // && SubCategoryCode == SubCategoryCodeEnum.PrivateCar

      this.PermissibleBusinessList = PermissibleBusinessDetails["Motor"];
      for (let i = 0; i < this.PermissibleBusinessList.length; i++) {
        if (this.PermissibleBusinessList[i].CategoryCode == CategoryCode
          //&& this.PermissibleBusinessList[i].SubCategoryCode == SubCategoryCode
          && (parseFloat(this.PermissibleBusinessList[i > 0 ? i - 1 : 0].SumInsured) > parseFloat(SumInsured.toFixed(2)) && parseFloat(this.PermissibleBusinessList[i].SumInsured) <= parseFloat(SumInsured.toFixed(2)))
        ) {
          PermissibleBusinessForPoSP = false
          break
        }
        else if (parseFloat(this.PermissibleBusinessList[i].SumInsured) < parseFloat(SumInsured.toFixed(2))) {
          PermissibleBusinessForPoSP = false
          break
        }
        else if (parseFloat(this.PermissibleBusinessList[i].SumInsured) > parseFloat(SumInsured.toFixed(2))) {
          PermissibleBusinessForPoSP = true
          break
        }
      }
    }
    else if (CategoryCode == CategoryCodeEnum.Motor && SubCategoryCode != SubCategoryCodeEnum.PrivateCar) { // Done

      this.PermissibleBusinessList = PermissibleBusinessDetails["Motor"];

      for (let i = 0; i < this.PermissibleBusinessList.length; i++) {
        if (this.PermissibleBusinessList[i].CategoryCode == CategoryCode
          && this.PermissibleBusinessList[i].SubCategoryCode == SubCategoryCode
          && parseFloat(this.PermissibleBusinessList[i].SumInsured) == parseFloat(SumInsured.toFixed(2))
        ) {
          PermissibleBusinessForPoSP = true
          break
        }
      }
    }
    else if (CategoryCode == CategoryCodeEnum.Engineering ||
      CategoryCode == CategoryCodeEnum.Group ||
      CategoryCode == CategoryCodeEnum.Marine ||
      CategoryCode == CategoryCodeEnum.Miscellaneous ||
      CategoryCode == CategoryCodeEnum.Liability ||
      CategoryCode == CategoryCodeEnum.WorkmenComp) {
      PermissibleBusinessForPoSP = false
    }
    else if (CategoryCode == CategoryCodeEnum.Package) {

      this.PermissibleBusinessList = PermissibleBusinessDetails["Package"];

      for (let i = 0; i < this.PermissibleBusinessList.length; i++) {

        if (this.PermissibleBusinessList[i].CategoryCode == CategoryCodeEnum.Package) {
          if (SubCategoryCode == SubCategoryCodeEnum.MyHome && this.PermissibleBusinessList[i].SubCategoryCode == SubCategoryCode) {
            if (parseFloat(this.PermissibleBusinessList[i].SumInsured) <= parseFloat(SumInsured.toFixed(2))) {
              PermissibleBusinessForPoSP = false
              break
            } else {
              PermissibleBusinessForPoSP = true
              break
            }
          } else {
            PermissibleBusinessForPoSP = false
            break
          }
        }
      }
    }
    else if (CategoryCode == CategoryCodeEnum.Fire) {

      this.PermissibleBusinessList = PermissibleBusinessDetails["Fire"];

      for (let i = 0; i < this.PermissibleBusinessList.length; i++) {

        if (this.PermissibleBusinessList[i].CategoryCode == CategoryCodeEnum.Fire) {
          if (parseFloat(this.PermissibleBusinessList[i].SumInsured) <= parseFloat(SumInsured.toFixed(2))) {
            PermissibleBusinessForPoSP = false
            break
          } else {
            PermissibleBusinessForPoSP = true
            break
          }
        } else {
          PermissibleBusinessForPoSP = false
          break
        }
      }
    }
    else if (CategoryCode == CategoryCodeEnum.Health) {

      this.PermissibleBusinessList = PermissibleBusinessDetails["Health"];

      for (let i = 0; i < this.PermissibleBusinessList.length; i++) {

        if (this.PermissibleBusinessList[i].CategoryCode == CategoryCodeEnum.Health) {
          if (SubCategoryCode == SubCategoryCodeEnum.Mediclaim && this.PermissibleBusinessList[i].SubCategoryCode == SubCategoryCode) {
            if (parseFloat(this.PermissibleBusinessList[i].SumInsured) <= parseFloat(SumInsured.toFixed(2))) {
              PermissibleBusinessForPoSP = false
              break
            } else {
              PermissibleBusinessForPoSP = true
              break
            }
          }
          else if (SubCategoryCode == SubCategoryCodeEnum.CriticalIllness && this.PermissibleBusinessList[i].SubCategoryCode == SubCategoryCode) {
            if (parseFloat(this.PermissibleBusinessList[i].SumInsured) <= parseFloat(SumInsured.toFixed(2))) {
              PermissibleBusinessForPoSP = false
              break
            } else {
              PermissibleBusinessForPoSP = true
              break
            }

          }
          else if (SubCategoryCode == SubCategoryCodeEnum.TopUpPlan && this.PermissibleBusinessList[i].SubCategoryCode == SubCategoryCode) {
            if (parseFloat(this.PermissibleBusinessList[i].SumInsured) <= parseFloat(SumInsured.toFixed(2))) {
              PermissibleBusinessForPoSP = false
              break
            } else {
              PermissibleBusinessForPoSP = true
              break
            }
          }
        }
      }
    }
    else if (CategoryCode == "Home") { // Done

      this.PermissibleBusinessList = PermissibleBusinessDetails["Home"];

      for (let i = 0; i < this.PermissibleBusinessList.length; i++) {

        if (this.PermissibleBusinessList[i].CategoryCode == "Home") {
          if (parseFloat(this.PermissibleBusinessList[i].SumInsured) < parseFloat(SumInsured.toFixed(2))) {
            PermissibleBusinessForPoSP = false
            break
          }
          else if (parseFloat(this.PermissibleBusinessList[i].SumInsured) >= parseFloat(SumInsured.toFixed(2))) {
            PermissibleBusinessForPoSP = true
            break
          }
        }
      }
    }
    else if (CategoryCode == CategoryCodeEnum.Life) {

      if (SubCategoryCode == SubCategoryCodeEnum.TermPlan) {
        PermissibleBusinessForPoSP = true
      }
      else if (SubCategoryCode == SubCategoryCodeEnum.InvestmentPlan || SubCategoryCode == SubCategoryCodeEnum.RetirementPlan || SubCategoryCode == SubCategoryCodeEnum.ChildPlan) {
        PermissibleBusinessForPoSP = false
      }
    }
    else if (CategoryCode == CategoryCodeEnum.PA) {

      if (SumInsured > 5000000) {
        PermissibleBusinessForPoSP = false
      }
      else {
        PermissibleBusinessForPoSP = true
      }
    }
    else if (CategoryCode == CategoryCodeEnum.Travel) {

      this.PermissibleBusinessList = PermissibleBusinessDetails["Travel"];

      for (let i = 0; i < this.PermissibleBusinessList.length; i++) {

        if (this.PermissibleBusinessList[i].CategoryCode == CategoryCodeEnum.Travel) {
          if (this.PermissibleBusinessList[i].SubCategoryCode == SubCategoryCodeEnum.Individual && SubCategoryCode == SubCategoryCodeEnum.Individual) {
            if (parseFloat(this.PermissibleBusinessList[i].SumInsured) <= parseFloat(SumInsured.toFixed(2))) {
              PermissibleBusinessForPoSP = false
              break
            } else {
              PermissibleBusinessForPoSP = true
              break
            }
          }
          else if (this.PermissibleBusinessList[i].SubCategoryCode == SubCategoryCodeEnum.StudentTravel && SubCategoryCode == SubCategoryCodeEnum.StudentTravel) {
            if (parseFloat(this.PermissibleBusinessList[i].SumInsured) <= parseFloat(SumInsured.toFixed(2))) {
              PermissibleBusinessForPoSP = false
              break
            } else {
              PermissibleBusinessForPoSP = true
              break
            }
          }
          else if (this.PermissibleBusinessList[i].SubCategoryCode == SubCategoryCodeEnum.Corporate && SubCategoryCode == SubCategoryCodeEnum.Corporate) {
            if (parseFloat(this.PermissibleBusinessList[i].SumInsured) <= parseFloat(SumInsured.toFixed(2))) {
              PermissibleBusinessForPoSP = false
              break
            } else {
              PermissibleBusinessForPoSP = true
              break
            }
          }
        }
      }
    }

    return PermissibleBusinessForPoSP;
  }

  private _DisableLIABILITYPartField() {
    this.TransactionEntryForm.get('PremiumDetail').patchValue({
      BasicTPPremium: 0,
      PaidDriver: false,
      LLDriver: false,
      CNG: false,
      OwnerDriver: false,
      PA: false,
      PaidDriverPremium: 0,
      LLDriverPremium: 0,
      CNGAmount: 0,
      OwnerDriverPremium: 0,
      PAPremium: 0
    })
    // this.getTPAddOnPremiumAmount()
    this.TransactionEntryForm.get('PremiumDetail.BasicTPPremium').disable()
    this.TransactionEntryForm.get('PremiumDetail.PaidDriver').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.LLDriver').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.CNG').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.OwnerDriver').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.PA').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.TPGSTPer').disable({ emitEvent: false })
  }

  private _DisableOWNDAMAGEPartField() {
    this.TransactionEntryForm.get('PremiumDetail').patchValue({
      BasicODPremium: 0,
      AddOnPremium: 0,
      DiscountAmount: 0,
    })

    this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.DiscountAmount').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.ODGSTPer').disable({ emitEvent: false })
  }

  private _DisableAtPAODSelection() {
    this.TransactionEntryForm.get('PremiumDetail').patchValue({
      BasicODPremium: 0,
      AddOnPremium: 0,
      DiscountAmount: 0,
    })

    this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.NCBPer').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.NCBPremium').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.NetODPremium').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.DiscountAmount').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.PA').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.LLDriver').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.CNG').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.PaidDriver').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.TPGSTPer').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.TotalODPremium').disable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.ODGSTPer').disable({ emitEvent: false })
  }

  private _EnableAtPAODSelection() {
    this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.NCBPer').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.NCBPremium').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.NetODPremium').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.DiscountAmount').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.PA').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.LLDriver').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.CNG').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.PaidDriver').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.TPGSTPer').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.TotalODPremium').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.ODGSTPer').enable({ emitEvent: false })
  }


  private EnablePartField() {
    this.TransactionEntryForm.get('PremiumDetail.BasicTPPremium').enable()
    this.TransactionEntryForm.get('PremiumDetail.PaidDriver').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.LLDriver').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.CNG').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.OwnerDriver').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.PA').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.TPGSTPer').enable({ emitEvent: false })
  }

  private EnableODfield() {
    this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.ODGSTPer').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.DiscountAmount').enable({ emitEvent: false })
  }

  private MotorPremiumDetailsEnable() {
    this.TransactionEntryForm.get('PremiumDetail.BasicODPremium').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.AddOnPremium').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.ODGSTPer').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.DiscountAmount').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.BasicTPPremium').enable()
    this.TransactionEntryForm.get('PremiumDetail.PaidDriver').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.LLDriver').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.CNG').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.OwnerDriver').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.PA').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.TPGSTPer').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.NCBPer').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.NCBPremium').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.NetODPremium').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumDetail.TotalODPremium').enable({ emitEvent: false })
  }

  private _TeamDetailsDataBindForPermissibleBusinessNo(res) {
    /**
     * Permissible Business - No
     */
    switch (res.SalesPersonType) {
      /**
       * Salesperson ==== BQP
       * Team Ref. === is Blank
       */
      case SalesPersonTypeEnum.Direct:

        this.TransactionEntryForm.patchValue({
          SalesPersonId: this.TransactionEntryForm.get('BrokerQualifiedPersonId').value,
          SalesPersonName: this.TransactionEntryForm.get('BrokerQualifiedPersonName').value,
          SalesPersonType: res.SalesPersonType,
          TeamReferenceUserId: null,
          TeamReferenceUserName: '',
        }, { emitEvent: false });

        break;

      /**
     * Salesperson ==== BQP
     * Team Ref. === Selected Group-Head Sales person
     */
      case SalesPersonTypeEnum.POSP:

        this.TransactionEntryForm.patchValue({
          SalesPersonId: this.TransactionEntryForm.get('BrokerQualifiedPersonId').value,
          SalesPersonName: this.TransactionEntryForm.get('BrokerQualifiedPersonName').value,
          SalesPersonType: 'Team Reference',
          TeamReferenceUserId: res.SalesPersonId,
          TeamReferenceUserName: res.SalesPersonName,
        }, { emitEvent: false });

        break;

      /**
     * Salesperson ==== BQP
     * Team Ref. === Selected Group-Head TEam Ref.
     */
      case SalesPersonTypeEnum.TeamReference:

        this.TransactionEntryForm.patchValue({
          SalesPersonId: this.TransactionEntryForm.get('BrokerQualifiedPersonId').value,
          SalesPersonName: this.TransactionEntryForm.get('BrokerQualifiedPersonName').value,
          SalesPersonType: res.SalesPersonType,
          TeamReferenceUserId: res.TeamReferenceUserId,
          TeamReferenceUserName: res.TeamReferenceUserName,
        }, { emitEvent: false });
    }
    // if (this.TransactionEntryForm.get('SalesPersonId').value > 0) {
    //   this.IsSalesPersonReadOnly = true;
    // } else {
    //   this.IsSalesPersonReadOnly = false;
    // }
  }

  private _TeamDetailsDataBindForPermissibleBusinessYes(res) {
    /**
     * Permissible Business - YES
     */
    switch (res.SalesPersonType) {
      /**
       * Salesperson ==== BQP
       * Team Ref. === is Blank
       */
      case SalesPersonTypeEnum.Direct:
        this.TransactionEntryForm.patchValue({
          SalesPersonId: this.TransactionEntryForm.get('BrokerQualifiedPersonId').value,
          SalesPersonName: this.TransactionEntryForm.get('BrokerQualifiedPersonName').value,
          SalesPersonType: res.SalesPersonType,
          TeamReferenceUserId: null,
          TeamReferenceUserName: '',
        }, { emitEvent: false });

        break;

      /**
       * Salesperson ==== Selected Group-Head Sales person
       * Team Ref. === is Blank
       */
      case SalesPersonTypeEnum.POSP:

        this.TransactionEntryForm.patchValue({
          SalesPersonId: res.SalesPersonId,
          SalesPersonName: res.SalesPersonName,
          SalesPersonType: res.SalesPersonType,
          TeamReferenceUserId: null,
          TeamReferenceUserName: '',
        }, { emitEvent: false });

        break;

      /**
     * Salesperson ==== BQP
     * Team Ref. === Selected Group-Head TEam Ref.
     */
      case SalesPersonTypeEnum.TeamReference:

        this.TransactionEntryForm.patchValue({
          SalesPersonId: this.TransactionEntryForm.get('BrokerQualifiedPersonId').value,
          SalesPersonName: this.TransactionEntryForm.get('BrokerQualifiedPersonName').value,
          SalesPersonType: res.SalesPersonType,
          TeamReferenceUserId: res.TeamReferenceUserId,
          TeamReferenceUserName: res.TeamReferenceUserName,
        }, { emitEvent: false });
    }

    // if (this.TransactionEntryForm.get('SalesPersonId').value > 0){
    //   this.IsSalesPersonReadOnly = true;
    // }else{
    //   this.IsSalesPersonReadOnly = false;
    // }

  }

  /**
 * calculate Next Premium Date for Fire/Engineering/Health/Group/Life
 * NextPremiumDate = (PolicyStartDate) + (Selected Premium Installment Type) - (1 day)
 */
  private _calculateNextPremiumDate() {

    let PolicyStartDate = this.TransactionEntryForm.get('StartDate').value;
    let PremiumInstallmentType = this.TransactionEntryForm.get('PremiumInstallmentType').value;

    // 12 : mean Annually
    // 1 : mean Monthly
    // 3 : mean Quarterly
    // 6 : mean  Half Yearly
    if (PolicyStartDate != "" && PolicyStartDate != null) {
      // 12 : mean Annually
      if (PremiumInstallmentType == 12) {

        let startDate = this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd');
        let NextPremiumDate = new Date(startDate);

        NextPremiumDate.setFullYear(NextPremiumDate.getFullYear() + 1) // set year
        NextPremiumDate.setDate(NextPremiumDate.getDate() - 1);  // one day les

        this.TransactionEntryForm.get('NextPremiumPaymentDate').patchValue(NextPremiumDate);

      }
      // 1 : mean Monthly
      else if (PremiumInstallmentType == 1) {

        let startDate = this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd');
        let NextPremiumDate = new Date(startDate);

        NextPremiumDate.setMonth(NextPremiumDate.getMonth() + 1) // set year
        NextPremiumDate.setDate(NextPremiumDate.getDate() - 1);  // one day les

        this.TransactionEntryForm.get('NextPremiumPaymentDate').patchValue(NextPremiumDate);

      }
      // 3 : mean Quarterly
      else if (PremiumInstallmentType == 3) {

        let startDate = this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd');
        let NextPremiumDate = new Date(startDate);

        NextPremiumDate.setMonth(NextPremiumDate.getMonth() + 3) // set year
        NextPremiumDate.setDate(NextPremiumDate.getDate() - 1);  // one day les

        this.TransactionEntryForm.get('NextPremiumPaymentDate').patchValue(NextPremiumDate);

      }
      // 6 : mean  Half Yearly
      else if (PremiumInstallmentType == 6) {

        let startDate = this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd');
        let NextPremiumDate = new Date(startDate);

        NextPremiumDate.setMonth(NextPremiumDate.getMonth() + 6) // set year
        NextPremiumDate.setDate(NextPremiumDate.getDate() - 1);  // one day les

        this.TransactionEntryForm.get('NextPremiumPaymentDate').patchValue(NextPremiumDate);

      }
      else {
        this.TransactionEntryForm.get('NextPremiumPaymentDate').patchValue('');
      }
    }


  }


  private _resetErrorAlertAndStepCtrl() {
    this.PolicyDetailsAlert = []
    this.CustomerDetailsAlert = []
    this.categoryInfoMotorAlert = []
    this.categoryTypeAlert = []
    this.TeamDetailsAlert = []
    this.PolicyInformationAlert = []
    this.PremiumInformationAlert = []
    this.PaymentInformationAlert = []
    this.DocumentAttachmentAlert = []


    this.PolicyDetailsStepCtrl.reset()
    this.CustomerDetailsStepCtrl.reset()
    this.categoryInfoMotorStepCtrl.reset()
    this.categoryTypeStepCtrl.reset()
    this.TeamDetailsStepCtrl.reset()
    this.PolicyInformationStepCtrl.reset()
    this.PremiumInformationStepCtrl.reset()
    this.PaymentInformationStepCtrl.reset()
    this.DocumentAttachmentStepCtrl.reset()
  }

  private _disableNonFinancial() {
    //Disabled entire Form
    this.TransactionEntryForm.disable({ emitEvent: false })

    //Policy Information Enabled
    // this.TransactionEntryForm.get('PremiumType').enable({emitEvent: false})
    this.TransactionEntryForm.get('SubmissionDate').enable({ emitEvent: false })
    this.TransactionEntryForm.get('IssueDate').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PolicyNo').enable({ emitEvent: false })
    this.TransactionEntryForm.get('StartDate').enable({ emitEvent: false })
    this.TransactionEntryForm.get('EndDate').enable({ emitEvent: false })
    // this.TransactionEntryForm.get('SumInsured').enable({emitEvent: false})
    this.TransactionEntryForm.get('TPStartDate').enable({ emitEvent: false })
    this.TransactionEntryForm.get('TPEndDate').enable({ emitEvent: false })
    // this.TransactionEntryForm.get('VehicleDetail.CNGKitValue').enable({emitEvent: false})
    // this.TransactionEntryForm.get('VehicleDetail.ElectricalAccessoriesValue').enable({emitEvent: false})
    // this.TransactionEntryForm.get('VehicleDetail.NonElectricalAccessoriesValue').enable({emitEvent: false})
    // this.TransactionEntryForm.get('VehicleDetail.OtherFitmentValue').enable({emitEvent: false})
    this.TransactionEntryForm.get('VehicleDetail.TotalValue').enable({ emitEvent: false })
    this.TransactionEntryForm.get('VehicleDetail.Remarks').enable({ emitEvent: false })
    this.TransactionEntryForm.get('InsurancePlan').enable({ emitEvent: false })
    this.TransactionEntryForm.get('NameProposal').enable({ emitEvent: false })
    this.TransactionEntryForm.get('DateOfBirth').enable({ emitEvent: false })
    this.TransactionEntryForm.get('LifeInsPlanName').enable({ emitEvent: false })
    this.TransactionEntryForm.get('NameofLifeAssured').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumPaymentTypeName').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumPaymentType').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumPaymentType').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumPayingTerm').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PolicyTerms').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PerBillingLimit').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PerLocationLimit').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumInstallmentType').enable({ emitEvent: false })
    this.TransactionEntryForm.get('PremiumInstallmentAmount').enable({ emitEvent: false })
    this.TransactionEntryForm.get('NextPremiumPaymentDate').enable({ emitEvent: false })

    //Customer Details Enabled
    this.TransactionEntryForm.get('GroupHeadName').enable({ emitEvent: false })
    this.TransactionEntryForm.get('CustomerName').enable({ emitEvent: false })
    this.TransactionEntryForm.get('MobileNo').enable({ emitEvent: false })
    this.TransactionEntryForm.get('Addresses').enable({ emitEvent: false })

    this.TransactionEntryForm.get('CoShares').enable({ emitEvent: false })

    this.isCoShareDisabled = false;

    this.TransactionEntryForm.get('VehicleDetail.RTOCode').enable({ emitEvent: false })
    this.TransactionEntryForm.get('VehicleDetail.VehicleNumber').enable({ emitEvent: false })
    this.TransactionEntryForm.get('VehicleDetail.RegistrationDate').enable({ emitEvent: false })
    this.TransactionEntryForm.get('VehicleDetail.EngineNumber').enable({ emitEvent: false })
    this.TransactionEntryForm.get('VehicleDetail.ChasisNumber').enable({ emitEvent: false })
    this.TransactionEntryForm.get('VehicleDetail.PassengerCapacity').enable({ emitEvent: false })
    this.TransactionEntryForm.get('VehicleDetail.FuelType').enable({ emitEvent: false })
    // this.TransactionEntryForm.get('VehicleDetail.AnyClaiminPreviousYear').enable({ emitEvent: false })
    this.TransactionEntryForm.get('VehicleDetail.VehicleAge').enable({ emitEvent: false })
    this.TransactionEntryForm.get('VehicleDetail.VehicleClass').enable({ emitEvent: false })

    this.TransactionEntryForm.get('SalesPersonName').enable({ emitEvent: false })
    this.TransactionEntryForm.get('TeamReferenceUserName').enable({ emitEvent: false })
    this.TransactionEntryForm.get('SalesPersonType').enable({ emitEvent: false })
    this.TransactionEntryForm.get('CustomerReference').enable({ emitEvent: false })
    this.TransactionEntryForm.get('BrokerQualifiedPersonName').enable({ emitEvent: false })

    this.TransactionEntryForm.get('VehicleDetail.RegistrationType').enable({ emitEvent: false })
    this.TransactionEntryForm.get('VehicleDetail.Usage').enable({ emitEvent: false })
    this.TransactionEntryForm.get('VehicleDetail.TaxiAgency').enable({ emitEvent: false })
    this.TransactionEntryForm.get('VehicleDetail.ContractPeriod').enable({ emitEvent: false })
    this.TransactionEntryForm.get('VehicleDetail.VehicleType').enable({ emitEvent: false })

    this.CoShareBool.disable({ emitEvent: false })

  }

  private _disableFinancial() {
    this.TransactionEntryForm.get('InsuranceCompanyCode').disable({ emitEvent: false })
    this.CoShareBool.disable({ emitEvent: false })

    // this.TransactionEntryForm.get('CoShares').disable({ emitEvent: false })
    this.isCoShareFinancialDisabled = false;
  }

  private _renewalDateChange() {
    let policyEndDate = this._datePipe.transform(this.TransactionEntryForm.get('EndDate').value, 'yyyy-MM-dd');

    //update start Date with end date
    this.TransactionEntryForm.get('StartDate').patchValue(policyEndDate);

    let policyStartDate = this._datePipe.transform(this.TransactionEntryForm.get('StartDate').value, 'yyyy-MM-dd');

    let tpStartDate = this._datePipe.transform(this.TransactionEntryForm.get('TPStartDate').value, 'yyyy-MM-dd')
    let tpEndDate = this._datePipe.transform(this.TransactionEntryForm.get('TPEndDate').value, 'yyyy-MM-dd');

    if (tpEndDate < policyStartDate) {
      this.TransactionEntryForm.get('TPStartDate').patchValue(policyStartDate);
    }

  }
  //#endregion private-methods
}
