import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { MarineRenewalPolicyType, RFQDocumentsDrpList } from '@config/rfq';
import { MarineCategoryType, MarinePolicyType, MarinePrevPolicyCliamStatus } from '@config/rfq';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, IAdditionalFilterObject, IFilterRule, OrderBySpecs, QuerySpecs } from '@models/common';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { IMarineRaiseDTO, MarineRaiseDTO } from '@models/dtos';
import { MarineConsignmentDTO, MarineDocumentsDto, IMarinePrePolicyDTO, MarinePrePolicyDTO } from '@models/dtos';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { ICommodityTypeDto } from '@models/dtos/core/commodity-type-dto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { IUserDto } from '@models/dtos/core/userDto';
import { AuthService } from '@services/auth/auth.service';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { CategoryCodeEnum, SalesPersonTypeEnum, SubCategoryCodeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { environment } from 'src/environments/environment';
import { RFQMarineService } from '../rfq-marine.service';
import { ICountryDto } from '@models/dtos/core/CountryDto';
import { IFinancialYearDto } from '@models/dtos/core/FinancialYearDto';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }
@Component({
  selector: 'gnx-marine-raise',
  templateUrl: './marine-raise.component.html',
  styleUrls: ['./marine-raise.component.scss'],
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

export class MarineRaiseComponent {
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  //Variables
  pagetitle: string = "RFQ (Requisition for Quotation) - Marine"; // Page main header title
  mode: string; // for identify of Raise page is create or edit
  currentDate // Set current date 
  isExpand: boolean = false;
  DisplayForm: any;
  UserProfileObj: IMyProfile;

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // declare validation Regex
  phoneNum: RegExp = ValidationRegex.phoneNumReg;
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;

  // declare Alert Array List
  BasicDetailsAlert: Alert[] = [];
  ProductCategoryDetailsAlert: Alert[] = [];
  DocumentAttachmentAlert: Alert[] = [];
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  TeamDetailsAlerts: Alert[] = [];
  PrevPolicyDetailAlerts: Alert[] = []; // Insurer Query Details field error message
  PrevPolicyClaimsDetailAlerts: Alert[] = [];

  // declare form control
  BasicDetailsStepCtrl = new FormControl(); // Step 1 Control
  ProductCategoryDetailsStepCtrl = new FormControl();
  DocumentAttachmentStepCtrl = new FormControl()
  TeamDetailsStepCtrl = new FormControl(); // Step 5 Control
  PreviousPolicyDetailsStepCtrl = new FormControl(); // Step 3 Control

  // Observable List
  TeamRefUser$: Observable<IUserDto[]>;
  CommodityTypes$: Observable<ICommodityTypeDto[]>;
  salesPersonName$: Observable<IUserDto[]> // Observable of user list
  InsuranceCompany$: Observable<IInsuranceCompanyDto[]>;
  BDOlist$: Observable<IUserDto[]>;
  BDMlist$: Observable<IUserDto[]>;
  ToCountries$: Observable<ICountryDto[]>;
  FromCountries$: Observable<ICountryDto[]>;
  FinancialYearList: IFinancialYearDto[] = []

  //List objects
  Branches: IBranchDto[] = [];
  InsuranceCompany: IInsuranceCompanyDto[];
  SubCategoryList = [];
  MarineCategoryTypeList = [];
  CommodityTypeList = [];

  DropdownMaster: dropdown;
  //FormGroup 
  RFQMarineForm !: FormGroup;
  RFQMarine: IMarineRaiseDTO
  destroy$: Subject<any>;

  //#region  constructor
  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public dialog: MatDialog,
    public _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _MasterListService: MasterListService,
    private _datePipe: DatePipe,
    private authService: AuthService,
    private _dialogService: DialogService,
    private _RFQMarineService: RFQMarineService,
    private _Location: Location,
  ) {
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();
  }
  //#endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    this.RFQMarine = new MarineRaiseDTO();

    // Route params data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title'];
    this.mode = data['mode'];
    this.DisplayForm = data['data'];

    // in case of Edit and View mode then 
    if (this.mode == "edit" || this.mode == "view" || this.mode == "RenewalRFQ") {
      this.RFQMarine = data['data'];
    }

    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.UserProfileObj = user
      }
    })

    // build Marine form
    this.RFQMarineForm = this._buildForm(this.RFQMarine);

    // in case of view mode then all form value is disabled mode
    if (this.mode == "view") {
      this.RFQMarineForm.disable({ emitEvent: false });
      this.isExpand = true;
    }

    this._fillMasterList();
    this._onFormChange();
  }

  // get marine policy type
  get MarinePolicyType() {
    if (this.DisplayForm?.TransactionId) {
      return MarineRenewalPolicyType;
    } else {
      return MarinePolicyType;
    }
  }

  get PrevPolicyCliamStatus() {
    return MarinePrevPolicyCliamStatus
  }

  // get PrevPolicyDetail list
  get PrevPolicyDetails() {
    return this.RFQMarineForm.get('PrevPolicyDetail') as FormArray;
  }

  // get uploaded documents
  get Documents() {
    return this.RFQMarineForm.controls["Documents"] as FormArray;
  }

  // Document Type List
  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Marine))
  }


  /**
   * Only editable in login user is standard user & Sales person type is POSP
   */
  get canEditableSalesPerson() {
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser && this.mode != 'view') {
      if (this.RFQMarineForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
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
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser && this.mode != 'view') {
      if (this.RFQMarineForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {
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

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public ExpandCollaps() {
    this.isExpand = !this.isExpand;
  }

  // back button
  public backButton() {
    this._Location.back();
  }

  public AutocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, SelectedFor: string): void {

    switch (SelectedFor) {

      case "CommodityType":
        this.RFQMarineForm.get("ConsignmentDetail").patchValue({
          CommodityTypeId: event.option.value.Id,
          CommodityTypeName: event.option.value.CommodityDesc,
        });
        break;

      case "TeamRef":
        this.RFQMarineForm.patchValue({
          TeamReferenceId: event.option.value.Id,
          TeamReferenceName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        });
        break;

      case "Sales":
        this.RFQMarineForm.patchValue({
          SalesPersonId: event.option.value.Id,
          SalesPersonName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        })
        break;

      case "BDMName":
        this.RFQMarineForm.patchValue({
          BDMName: event.option.value.FullName,
          BDMId: event.option.value.Id,
        });
        break;

      case "BDOName":
        this.RFQMarineForm.patchValue({
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
    let specs = new QuerySpecs();

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
    dialogConfig.minHeight = '80vh';
    dialogConfig.maxHeight = '80vh';

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
            this.RFQMarineForm.patchValue({
              SalesPersonId: result.Id,
              SalesPersonName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "TeamRef":
            this.RFQMarineForm.patchValue({
              TeamReferenceId: result.Id,
              TeamReferenceName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "BDMName":
            this.RFQMarineForm.patchValue({
              BDMName: result.FullName,
              BDMId: result.Id,
            });
            break;

          case "BDOName":
            this.RFQMarineForm.patchValue({
              BDOName: result.FullName,
              BDOId: result.Id,
            });
            break;

          case "CommodityType":
            this.RFQMarineForm.get("ConsignmentDetail").patchValue({
              CommodityTypeId: result.Id,
              CommodityTypeName: result.CommodityDesc,
            });
            break;

          default:
            break;
        }
      }

    })
  }

  public clear(name: string, id: string): void {
    this.RFQMarineForm.controls[name].setValue("")
    this.RFQMarineForm.controls[id].setValue(null)
  }

  public clearCommodityType(name: string, id: string): void {
    this.RFQMarineForm.get("ConsignmentDetail").patchValue({
      CommodityTypeName: "",
      CommodityTypeId: null
    })
  }


  /**
   * Validation part 
   */

  public BasicDetailsValidations() {
    this.BasicDetailsAlert = []

    if (this.RFQMarineForm.get('SubCategoryId').value == 0 || this.RFQMarineForm.get('SubCategoryId').value == null) {
      this.BasicDetailsAlert.push({
        Message: 'Select Poduct Sub Category',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQMarineForm.get('PolicyType').hasError('required')) {
      this.BasicDetailsAlert.push({
        Message: 'Select Policy Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.RFQMarineForm.get('CategoryType').value) {
      this.BasicDetailsAlert.push({
        Message: 'Select Category Type',
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

    if (this.RFQMarineForm.get('ProposerName').invalid) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Enter Insured Name.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    // if (this.RFQMarineForm.get('CommunicationAddress').invalid) {
    //   this.ProductCategoryDetailsAlert.push({
    //     Message: 'Enter Address of Insured.',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   })
    // }

    if (!this.RFQMarineForm.get('ProposerMobileNo').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Enter Mobile No.',
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (
        !this.phoneNum.test(this.RFQMarineForm.get('ProposerMobileNo').value)
      ) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Mobile No must be 10 digit.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.RFQMarineForm.get('ProposerEmail').value != "" && this.RFQMarineForm.get('ProposerEmail').value != null) {
      if (!this.emailValidationReg.test(this.RFQMarineForm.get('ProposerEmail').value)) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Enter Valid Email ID.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.RFQMarineForm.get('GSTNo').value) {
      if (this.RFQMarineForm.get('GSTNo')?.value.length > 15 && this.RFQMarineForm.get('GSTNo')?.value < 15) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Enter Valid GST No.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.RFQMarineForm.get('ConsignmentDetail.CommodityTypeName').value == "" || this.RFQMarineForm.get('ConsignmentDetail.CommodityTypeName').value == null) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Select Goods Description',
        CanDismiss: false,
        AutoClose: false,
      })
    }




    let InvoiceValueErrorMSG = "Enter Invoice Value";
    // in case of Category Type is "Turnover Policy" or "Open Cover" then change validation message
    if (this.RFQMarineForm.get('CategoryType').value == 'Sales Turnover Policy - STOP' || this.RFQMarineForm.get('CategoryType').value == 'Open Cover') {
      InvoiceValueErrorMSG = "Enter Maximum Invoice Value";
    }

    if (this.RFQMarineForm.get('ConsignmentDetail.InvoiceValue').value == 0 || this.RFQMarineForm.get('ConsignmentDetail.InvoiceValue').value == "" || this.RFQMarineForm.get('ConsignmentDetail.InvoiceValue').value == null) {
      this.ProductCategoryDetailsAlert.push({
        Message: InvoiceValueErrorMSG,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQMarineForm.get('CategoryType').value == 'Sales Turnover Policy - STOP'
      || this.RFQMarineForm.get('CategoryType').value == 'Open Cover'
      || this.RFQMarineForm.get('CategoryType').value == 'Hull Insurance') {
      if (!this.RFQMarineForm.get('SumInsures').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Total Turn Over is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.RFQMarineForm.get('ConsignmentDetail.CommodityTypeName')?.value == "Other") {
      if (this.RFQMarineForm.get('ConsignmentDetail.Remarks').value == "" || this.RFQMarineForm.get('ConsignmentDetail.Remarks').value == null) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Enter Remarks',
          CanDismiss: false,
          AutoClose: false,
        })
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


  public addPrevPolicyDetails() {

    // if (this.PrevPolicyDetails.controls.length > 0) {
    //   this.validatePrevPolicyDetails();
    // }

    if (this.PrevPolicyClaimsDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PrevPolicyClaimsDetailAlerts);
      return;
    }
    else {
      var row: IMarinePrePolicyDTO = new MarinePrePolicyDTO()
      row.RFQId = this.RFQMarineForm.get("Id").value;
      this.PrevPolicyDetails.push(this._initPrevPoliciesForm(row));
    }
  }

  // check step three  Field & Invalid Field Error message push in alert Array
  public PreviousPolicyDetailsValidations() {
    this.PrevPolicyDetailAlerts = []
    this.PrevPolicyClaimsDetailAlerts = []

    if (this.RFQMarineForm.get('PolicyType').value == 'Rollover' || this.RFQMarineForm.get('PolicyType').value == 'Renewal-Change Company' || this.RFQMarineForm.get('PolicyType').value == 'Renewal-Same Company') {

      // if (!this.RFQMarineForm.get('PrevPolicyInsurComp').value) {
      //   this.PrevPolicyDetailAlerts.push({
      //     Message: 'Select Insurance Company',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   })
      // }

      // if (this.RFQMarineForm.get('PrevPolicySumInsured').invalid || this.RFQMarineForm.get('PrevPolicySumInsured').value == 0) {
      //   this.PrevPolicyDetailAlerts.push({
      //     Message: 'Enter Sum Insured',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   })
      // }

      // if (this.RFQMarineForm.get('PreviousPolicyPremium').invalid || this.RFQMarineForm.get('PreviousPolicyPremium').value == 0) {
      //   this.PrevPolicyDetailAlerts.push({
      //     Message: 'Enter Premium Amount',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   })
      // }

      // if (this.RFQMarineForm.get('PreviousPolicyStartDate').invalid) {
      //   this.PrevPolicyDetailAlerts.push({
      //     Message: 'Enter Policy Start Date',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   })
      // }

      // if (this.RFQMarineForm.get('PreviousPolicyEndDate').invalid && !this.RFQMarineForm.get('PreviousPolicyEndDate').value) {
      //   this.PrevPolicyDetailAlerts.push({
      //     Message: 'Enter Policy End Date',
      //     CanDismiss: false,
      //     AutoClose: false,
      //   })
      // }

      if (this.RFQMarineForm.get('PreviousPolicyStartDate').value && this.RFQMarineForm.get('PreviousPolicyEndDate').value && this.RFQMarineForm.get('PreviousPolicyEndDate').value < this.RFQMarineForm.get('PreviousPolicyStartDate').value) {
        this.PrevPolicyDetailAlerts.push({
          Message: 'Enter Valid Policy End Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }



      if (this.RFQMarineForm.get('AnyClaiminLast3Year').value == null) {
        this.PrevPolicyDetailAlerts.push({
          Message: 'Have you taken any claims in the last 3 years Is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.RFQMarineForm.get('AnyClaiminLast3Year').value == true) {

        this.PrevPolicyDetails.controls.forEach((el, i) => {

          if (!el.get("FinancialYearId").value || el.get("FinancialYearId").value == 0) {
            this.PrevPolicyClaimsDetailAlerts.push({
              Message: `${i + 1}. Enter Financial Year.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (el.get("ClaimType").value == "" || el.get("ClaimType").value == null) {
            this.PrevPolicyClaimsDetailAlerts.push({
              Message: `${i + 1}. Enter Claim Type.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (el.get("ReasonOfClaim").value == "" || el.get("ReasonOfClaim").value == null) {
            this.PrevPolicyClaimsDetailAlerts.push({
              Message: `${i + 1}. Enter Reason of Claim.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          // if (el.get("Status").value == "" || el.get("Status").value == null) {
          //   this.PrevPolicyClaimsDetailAlerts.push({
          //     Message: `${i + 1}. Select Status.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          if (el.get("ClaimApprovalAmount").value == 0 || el.get("ClaimApprovalAmount").value == "" || el.get("ClaimApprovalAmount").value == null) {
            this.PrevPolicyClaimsDetailAlerts.push({
              Message: `${i + 1}. Enter Claim Amount.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

        });


        // this.PrevPolicyDetails.controls.forEach((pd, i) => {

        //   if (!pd.get('FinancialYearId').value) {
        //     this.PrevPolicyClaimsDetailAlerts.push({
        //       Message: `${i + 1} - Financial Year Is required.`,
        //       CanDismiss: false,
        //       AutoClose: false,
        //     })
        //   }

        //   if (!pd.get('ClaimType').value) {
        //     this.PrevPolicyClaimsDetailAlerts.push({
        //       Message: `${i + 1} - Claim Type Is required.`,
        //       CanDismiss: false,
        //       AutoClose: false,
        //     })
        //   }

        //   if (!pd.get('ReasonOfClaim').value) {
        //     this.PrevPolicyClaimsDetailAlerts.push({
        //       Message: `${i + 1} - Reason Of Claim Is required.`,
        //       CanDismiss: false,
        //       AutoClose: false,
        //     })
        //   }

        //   if (!pd.get('Status').value) {
        //     this.PrevPolicyClaimsDetailAlerts.push({
        //       Message: `${i + 1} - Status Is required.`,
        //       CanDismiss: false,
        //       AutoClose: false,
        //     })
        //   }

        //   if (!pd.get('ClaimApprovalAmount').value) {
        //     this.PrevPolicyClaimsDetailAlerts.push({
        //       Message: `${i + 1} - Claim Approved Amount Is required.`,
        //       CanDismiss: false,
        //       AutoClose: false,
        //     })
        //   }

        //   // if (!pd.get('Premium').value) {
        //   //   this.PrevPolicyClaimsDetailAlerts.push({
        //   //     Message: `${i + 1} - Premium Amount Is required.`,
        //   //     CanDismiss: false,
        //   //     AutoClose: false,
        //   //   })
        //   // }

        // })
      }

    }

    if (this.PrevPolicyDetailAlerts.length > 0 || this.PrevPolicyClaimsDetailAlerts.length > 0) {
      this.PreviousPolicyDetailsStepCtrl.setErrors({ required: true });
      return this.PreviousPolicyDetailsStepCtrl;
    } else {
      this.PreviousPolicyDetailsStepCtrl.reset();
      return this.PreviousPolicyDetailsStepCtrl;
    }
  }

  // alert message if step three is not validated
  public PreviousPolicyDetailsError() {
    if (this.PrevPolicyDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PrevPolicyDetailAlerts);
      return;
    }
    if (this.PrevPolicyClaimsDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PrevPolicyClaimsDetailAlerts);
      return;
    }
  }

  // remove Query details 
  public removePrevPolicyDetails(index: number) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.PrevPolicyDetails.removeAt(index);
        }
      });

  }

  // Previous Policy Details validation
  public validatePrevPolicyDetails() {
    this.PrevPolicyDetails.controls.forEach((el, i) => {

      if (!el.get("FinancialYearId").value || el.get("FinancialYearId").value == 0) {
        this.PrevPolicyDetailAlerts.push({
          Message: `${i + 1}. Enter Financial Year.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (el.get("ClaimType").value == "" || el.get("ClaimType").value == null) {
        this.PrevPolicyDetailAlerts.push({
          Message: `${i + 1}. Enter Claim Type.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (el.get("ReasonOfClaim").value == "" || el.get("ReasonOfClaim").value == null) {
        this.PrevPolicyDetailAlerts.push({
          Message: `${i + 1}. Enter Reason of Claim.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      // if (el.get("Status").value == "" || el.get("Status").value == null) {
      //   this.PrevPolicyDetailAlerts.push({
      //     Message: `${i + 1}. Select Status.`,
      //     CanDismiss: false,
      //     AutoClose: false,
      //   })
      // }

      if (el.get("ClaimApprovalAmount").value == 0 || el.get("ClaimApprovalAmount").value == "" || el.get("ClaimApprovalAmount").value == null) {
        this.PrevPolicyDetailAlerts.push({
          Message: `${i + 1}. Enter Claim Amount.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

    });
  }

  // check step four
  public TeamDetailsValidations() {
    this.TeamDetailsAlerts = [];

    if (this.RFQMarineForm.get('BranchId').invalid || this.RFQMarineForm.get('BranchId').value == 0) {
      this.TeamDetailsAlerts.push({
        Message: 'Select Branch',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQMarineForm.get('SalesPersonType').invalid || this.RFQMarineForm.get('SalesPersonType').value == "") {
      this.TeamDetailsAlerts.push({
        Message: 'Select Sales Person Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }


    if (this.RFQMarineForm.get('SalesPersonName').invalid || this.RFQMarineForm.get('SalesPersonName').value == "") {
      this.TeamDetailsAlerts.push({
        Message: 'Select Sales Person',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQMarineForm.get('SalesPersonType').value == 'Team Reference') {
      if (this.RFQMarineForm.get('TeamReferenceName').invalid || this.RFQMarineForm.get('TeamReferenceName').value == "") {
        this.TeamDetailsAlerts.push({
          Message: 'Select Team Reference Name',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (!this.RFQMarineForm.get('BDMName').value) {
      this.TeamDetailsAlerts.push({
        Message: 'BDM Name is Required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.RFQMarineForm.get('BDOName').value) {
      this.TeamDetailsAlerts.push({
        Message: 'BDO Name is Required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TeamDetailsAlerts.length > 0) {
      this.TeamDetailsStepCtrl.setErrors({ required: true });
      return this.TeamDetailsStepCtrl;
    } else {
      this.TeamDetailsStepCtrl.reset();
      return this.TeamDetailsStepCtrl;
    }
  }

  // alert message if step four is not validated
  public TeamDetailsError() {
    if (this.TeamDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.TeamDetailsAlerts);
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

  /**
   * Add new row in Document array
  */
  public addDocuments(selectedDocument?: string) {
    const row: MarineDocumentsDto = new MarineDocumentsDto();
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
          if (res.Alerts && res.Alerts?.length > 0) {
            this._alertservice.raiseErrors(res.Alerts)
          }
          else {
            this._alertservice.raiseErrorAlert(res.Message)
          }
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

  public SubmitRfqMarine() {

    if (this.BasicDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.BasicDetailsAlert);
      return;
    }

    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
      return;
    }

    if (this.RFQMarineForm.get('PolicyType').value == 'Rollover' || this.RFQMarineForm.get('PolicyType').value == 'Renewal-Change Company' || this.RFQMarineForm.get('PolicyType').value == 'Renewal-Same Company') {
      if (this.PrevPolicyDetailAlerts.length > 0) {
        this._alertservice.raiseErrors(this.PrevPolicyDetailAlerts);
        return;
      }

      if (this.RFQMarineForm.get('AnyClaiminLast3Year').value == true) {
        if (this.PrevPolicyClaimsDetailAlerts.length > 0) {
          this._alertservice.raiseErrors(this.PrevPolicyClaimsDetailAlerts);
          return;
        }
      }
    }

    if (this.TeamDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.TeamDetailsAlerts);
      return;
    }

    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }

    this._dateFormat();

    // submit form
    switch (this.mode) {
      case "create": case "RenewalRFQ":
        this._RFQMarineService.CreateProposal(this.RFQMarineForm.value).subscribe((res) => {
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
        this._RFQMarineService.UpdateProposal(this.RFQMarineForm.value).subscribe((res) => {
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
  }

  /**
 * When Convert Transaction TO RFQ All Attachments are get
 * Display documents As Per category wise 
 */
  public canDisplayDocuments(DocumentType: string): boolean {
    if (this.mode == 'RenewalRFQ' && this.DisplayForm && this.DisplayForm?.TransactionId) {
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
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build RFQ Life Main Form
  private _buildForm(data: IMarineRaiseDTO) {
    let form = this.fb.group({
      Id: [0],
      TransactionId: [0],
      RFQDate: [""],
      RFQNo: [""],
      CategoryId: [0],
      CategoryName: [""],

      // Basic Details
      SubCategoryId: [0],
      SubCategoryCode: [],
      SubCategoryName: [""],
      PolicyType: ["", [Validators.required]],
      CategoryType: [""],

      // Insured Detail
      ProposerName: [""],
      CommunicationAddress: [""],
      ProposerMobileNo: [""],
      ProposerEmail: [""],
      GSTNo: [""],
      AnyClaiminLast3Year: [false],
      SumInsures: [],

      // Consignment Detail
      ConsignmentDetail: this._initConsignmentsForm(data.ConsignmentDetail),

      // Previous Policy Detail (Only for Rollover)
      PrevPolicyInsurComp: [""],
      PrevPolicySumInsured: [0],
      PreviousPolicyPremium: [0],
      PreviousPolicyRemark: [""],
      PreviousPolicyStartDate: [""],
      PreviousPolicyEndDate: [""],
      PrevPolicyDetail: this._buildPrevPoliciesForm(data.PrevPolicyDetail),

      // Team Details
      BranchId: [0, [Validators.required]],
      BranchName: ['', [Validators.required]],
      SalesPersonType: [""],
      SalesPersonId: [],
      SalesPersonName: ['', [Validators.required]],
      TeamReferenceId: [null],
      TeamReferenceName: ['', [Validators.required]],
      BDOId: [0],
      BDOName: [""],
      BDMId: [0],
      BDMName: [""],

      // Attachment Details
      Documents: this._buildDocumentsForm(data.Documents),
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
    });

    if (data) {
      form.patchValue(data);
    }

    return form;
  }

  //Init Consignment formgroup
  private _initConsignmentsForm(item: MarineConsignmentDTO): FormGroup {
    let dF = this.fb.group({
      Id: [0],
      RFQId: [0],
      CommodityTypeId: [0],
      CommodityTypeName: [''],
      InvoiceValue: [0],
      Remarks: [''],
    })
    if (item != null) {

      if (!item) {
        item = new MarineConsignmentDTO();
      }

      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }

  //RFQ-Marine PrevPolicyDetail Formarray
  private _buildPrevPoliciesForm(items: MarinePrePolicyDTO[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPrevPoliciesForm(i));
        });
      }
    }

    return formArray;
  }

  //Init PrevPolicy formgroup
  private _initPrevPoliciesForm(item: MarinePrePolicyDTO): FormGroup {
    let dF = this.fb.group({
      Id: [0],
      RFQId: [0],
      FinancialYearId: [],
      FinancialYear: [""],
      MemberName: [""],
      ClaimType: [""],
      ReasonOfClaim: [""],
      Status: [""],
      ClaimApprovalAmount: [0],
      _Premium: [0],
      Premium: [0],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: [""],
      ImageUploadName: [""],
      ImageUploadPath: [""],
    })
    if (item != null) {
      if (!item) {
        item = new MarinePrePolicyDTO();
      }

      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }

  //RFQ-Marine document Formarray
  private _buildDocumentsForm(items: MarineDocumentsDto[] = []): FormArray {
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
  private _initDocumentsForm(item: MarineDocumentsDto): FormGroup {
    let dF = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      DocumentTypeName: [''],
      FileName: ['', [Validators.required]],
      StorageFileName: [''],
      StorageFilePath: ['', [Validators.required]],
      Stage: [''],
      Description: [''], // remarks
    })
    if (item != null) {
      if (!item) {
        item = new MarineDocumentsDto();
      }

      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }

  // form changes 
  private _onFormChange() {

    // changes product type
    this.RFQMarineForm.get('SubCategoryId').valueChanges.subscribe(val => {

      let SelectedSubCategory = this.SubCategoryList.find(x => x.Id == val)
      if (SelectedSubCategory) {
        this.RFQMarineForm.patchValue({
          SubCategoryName: SelectedSubCategory.Name,
          SubCategoryCode: SelectedSubCategory.Code
        })
      }
      else {
        this.RFQMarineForm.patchValue({
          SubCategoryName: "",
          SubCategoryCode: ""
        })
      }

      // get Marine Category Type list based on "Sub Category Code"
      if (SelectedSubCategory) {
        this.MarineCategoryTypeList = MarineCategoryType.filter(x => x.SubCategoryCode == SelectedSubCategory.Code)
      }

      // if (this.mode == "create") {
      this.RFQMarineForm.patchValue({
        CategoryType: ""
      })
      // }
    })

    this.RFQMarineForm.get('PolicyType').valueChanges.subscribe(val => {
      if (this.mode == "create" && val == 'Rollover' || val == 'Renewal-Change Company' || val == 'Renewal-Same Company') {
        // this.addPrevPolicyDetails()
      }

      if (val == "New") {
      this.RFQMarineForm.patchValue({
        PrevPolicyInsurComp: "",
        PrevPolicySumInsured: 0,
        PreviousPolicyPremium: 0,
        PreviousPolicyRemark: "",
        PreviousPolicyStartDate: "",
        PreviousPolicyEndDate: "",
        AnyClaiminLast3Year: false,
      })


      while (this.PrevPolicyDetails.controls.length != 0) {
        this.PrevPolicyDetails.removeAt(0)

      }
    }
    })

    this.RFQMarineForm.get('CategoryType').valueChanges.subscribe(val => {
      if (val != 'Sales Turnover Policy - STOP' && val != 'Open Cover' && val != 'Hull Insurance') {
        this.RFQMarineForm.get('SumInsures').patchValue('')
      }
    })

    // change sales person
    this.RFQMarineForm.get('SalesPersonName').valueChanges.subscribe((val) => {
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
    this.RFQMarineForm.get('TeamReferenceName').valueChanges.subscribe(
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

    this.RFQMarineForm.get('TeamReferenceId').valueChanges.subscribe(
      (val) => {
        if (!val && this.UserProfileObj.UserType == UserTypeEnum.StandardUser && this.RFQMarineForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {
          this.RFQMarineForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );


    this.RFQMarineForm.get('SalesPersonId').valueChanges.subscribe(
      (val) => {
        if (!val && this.UserProfileObj.UserType == UserTypeEnum.StandardUser && this.RFQMarineForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
          this.RFQMarineForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );

    // change Team Referance
    this.RFQMarineForm.get('ConsignmentDetail.CommodityTypeName').valueChanges.subscribe(
      (val) => {
        let Rule: IFilterRule[] = [
          { Field: 'CommodityCode', Operator: 'contains', Value: val },
          { Field: 'CommodityDesc', Operator: 'contains', Value: val },
        ];

        let AdditionalFilters: IAdditionalFilterObject[] = []

        let orderSpecs: OrderBySpecs[] = [{ field: "CreatedDate", direction: "desc" }]

        this.CommodityTypes$ = this._MasterListService
          .getFilteredMultiRulMasterDataList(API_ENDPOINTS.CommodityType.List, 'CommodityCode', "", Rule, AdditionalFilters, orderSpecs)
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


    /**
     * Sales person Type - Direct"
     * Selected branch BQP need to auto fetch under sales person
     */
    this.RFQMarineForm.get('BranchId').valueChanges.subscribe((val) => {
      this._TeamDetailsForStandardUser()
    })


    this.RFQMarineForm.get('SalesPersonType').valueChanges.subscribe((val) => {
      this._TeamDetailsForStandardUser()
    })

    /**
    * selected branch All BDO from user
    */
    this.RFQMarineForm.get('BDOName').valueChanges.subscribe((val) => {
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

    /**
     * BDM - Selected branch all BDM from user
     */
    this.RFQMarineForm.get('BDMName').valueChanges.subscribe((val) => {
      let bdmListSpecs = this._bdmListAPIfilter()
      bdmListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })
      this.BDMlist$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', bdmListSpecs.FilterConditions.Rules, bdmListSpecs.AdditionalFilters).pipe(
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

    this.RFQMarineForm.get('AnyClaiminLast3Year').valueChanges.subscribe(val => {
      if (!val) {
        //Remove Previous Policy Details
        while (this.PrevPolicyDetails.controls.length !== 0) {
          this.PrevPolicyDetails.removeAt(0)
        }
      }
      else if (val) {
        this.addPrevPolicyDetails();
      }
    })

  }

  private _fillMasterList() {
    // fill Product Type
    let SubCategoryRule: IFilterRule[] = [ActiveMasterDataRule,
      {
        Field: "Category.Code",
        Operator: "eq",
        Value: CategoryCodeEnum.Marine
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

          if (this.SubCategoryList.length > 0 && this.mode == 'create') {

            // set default Sub Category Code is "Cargo"
            let SubCategoryData = this.SubCategoryList.filter(x => x.Code == SubCategoryCodeEnum.Cargo);
            this.RFQMarineForm.patchValue({
              SubCategoryId: SubCategoryData[0].Id,
              SubCategoryName: SubCategoryData[0].Name,
              SubCategoryCode: SubCategoryData[0].Code,
            })
          }


          /**
           * If Mode is edit or view Then Category type list fill as per selected sub category
           */
          if (this.mode == "edit" || this.mode == "view") {
            let SelectedSubCategory = this.SubCategoryList.find(x => x.Id == this.RFQMarine.SubCategoryId)
            if (SelectedSubCategory) {
              this.MarineCategoryTypeList = MarineCategoryType.filter(x => x.SubCategoryCode == SelectedSubCategory.Code)
            }
          }

        }
      })

    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.CommodityType.List, 'CommodityCode', '')
      .subscribe(res => {
        if (res.Success) {
          this.CommodityTypeList = res.Data.Items
        }
      })

    // get marine category type
    this.MarineCategoryTypeList = MarineCategoryType

    // Fill Insurance Company
    let InsuranceCompanyRule: IFilterRule[] = [{ Field: 'Status', Operator: 'eq', Value: 1, }];
    let InsuranceCompanyAdditionalFilters: IAdditionalFilterObject[] = [{ key: "CatagoryCode", filterValues: [CategoryCodeEnum.Marine] }]

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

    // fill Branch
    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List + "/true", 'Name', "", [ActiveMasterDataRule])
      .subscribe(res => {
        if (res.Success) {
          this.Branches = res.Data.Items

          /**
           * After Get Branch list Fill Team details 
           */
          if (this.mode == 'create') {
            this._TeamDetailsInfo()
          }
        }
      });

    // Fill Insurance Company
    let FinancialYearRule: IFilterRule[] = [ActiveMasterDataRule];


    this._MasterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.FinancialYear.List, 'FYCode', "", FinancialYearRule)
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.FinancialYearList = res.Data.Items
          } else {
            this.FinancialYearList = [];
          }
        } else {
          this.FinancialYearList = []
        }
      })
  }

  private _dateFormat() {
    this.RFQMarineForm.patchValue({
      PreviousPolicyStartDate: this._datePipe.transform(this.RFQMarineForm.get('PreviousPolicyStartDate')?.value, 'yyyy-MM-dd'),
      PreviousPolicyEndDate: this._datePipe.transform(this.RFQMarineForm.get('PreviousPolicyEndDate')?.value, 'yyyy-MM-dd'),
    }, { emitEvent: false })
  }

  // Team details from MyProfile
  private _TeamDetailsInfo() {
    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.UserProfileObj = user
        // set Branch details
        this.RFQMarineForm.patchValue({
          BranchId: user.BranchId,
          BranchName: user.BranchName,
        });

        // ************* set required field from user profile data ************* \\
        // set User type from user profile
        if (user.UserType == UserTypeEnum.Agent) {

          this.RFQMarineForm.patchValue({
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
          this.RFQMarineForm.patchValue({
            TeamReferenceId: user.Id,
            TeamReferenceName: user.FullName,
            SalesPersonType: 'Team Reference',
            BDMId: user.BDMId,
            BDMName: user.BDMName,
            BDOId: user.BDOId,
            BDOName: user.BDOName,
          }, { emitEvent: false });

          if (this.RFQMarineForm.value?.BranchId) {

            let LoginUserBranch = this.Branches.find(b => b.Id == this.RFQMarineForm.value?.BranchId)
            if (LoginUserBranch) {
              this.RFQMarineForm.patchValue({
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
      if (this.RFQMarineForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {


        let LoginUserBranch = this.Branches.find(b => b.Id == this.RFQMarineForm.get('BranchId').value)


        if (LoginUserBranch) {
          this.RFQMarineForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.RFQMarineForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.RFQMarineForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });

      } else if (this.RFQMarineForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {

        this.RFQMarineForm.patchValue({
          SalesPersonId: null,
          SalesPersonName: null,
          TeamReferenceId: null,
          TeamReferenceName: null,
        });


        /**
         * SalesPersonType TeamReference sales person is Selected branch bqp
         * Other Field is null
         */
      } else if (this.RFQMarineForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {

        let LoginUserBranch = this.Branches.find(b => b.Id == this.RFQMarineForm.value?.BranchId)
        if (LoginUserBranch) {
          this.RFQMarineForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.RFQMarineForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.RFQMarineForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });
      }

      this.RFQMarineForm.patchValue({
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
    if (this.RFQMarineForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQMarineForm.get('BranchId').value, }
      ]
    }

    if (this.RFQMarineForm.get('SalesPersonType').value == "POSP") {
      specs.FilterConditions.Rules = [
        ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQMarineForm.get('BranchId').value, }
      ];
    }


    if (this.RFQMarineForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.RFQMarineForm.get('SalesPersonType').value == "POSP") {
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
    if (this.RFQMarineForm.get('SalesPersonType').value == "Team Reference") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQMarineForm.get('BranchId').value, }
      ];
    }

    if (this.RFQMarineForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.RFQMarineForm.get('SalesPersonType').value == "Team Reference") {
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

    if (this.RFQMarineForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule];
    }

    if (this.RFQMarineForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDOOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.RFQMarineForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.RFQMarineForm.get('BranchId').value?.toString()] })
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

    if (this.RFQMarineForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule];
    }

    if (this.RFQMarineForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDMOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.RFQMarineForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.RFQMarineForm.get('BranchId').value?.toString()] })
      }
    }

    return specs;
  }


  //#endregion private-methods

}
