import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { DisplayedPolicyPeriod } from '@config/report/policy-register-report';
import { DisplayedRFQReportPolicyType } from '@config/report/rfq-report/rfq-report-policy-type.config';
import { CommonFunctionsService } from '@lib/services/common-functions.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, IAdditionalFilterObject, IFilterRule, OrderBySpecs, QuerySpecs, ResponseMessage } from '@models/common';
import { IPolicyRegisterReportDto, PolicyRegisterReportDto } from '@models/dtos/config/Report/PolicyRegister';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { IUserDto } from '@models/dtos/core/userDto';
import { AuthService } from '@services/auth/auth.service';
import * as moment from 'moment';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { UserTypeEnum } from 'src/app/shared/enums';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-rfq-report',
  templateUrl: './rfq-report.component.html',
  styleUrls: ['./rfq-report.component.scss'],
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
export class RfqReportComponent {
  //#region decorator
  //#endregion decorator

  // #region public variables
  public title: string = "";
  public isExpand: boolean = true;

  // FormGroup 
  public rfqReportForm: FormGroup;

  // Alert Array List
  public policyDetailAlert: Alert[] = [];

  //Form Controls
  public policyDetailStepCtrl = new FormControl();

  // Observable
  public salesPerson$: Observable<IUserDto[]>;
  public BDOList$: Observable<IUserDto[]> // Observable of user list
  public BDMList$: Observable<IUserDto[]> // Observable of user list

  // array list
  public insuranceCompanyList: IInsuranceCompanyDto[] = [];
  public branches: IBranchDto[] = [];
  public categoryList = [];
  public subCategoryList = [];
  public policyStatusList = []
  public requestTypeList = []

  // #endregion public-variables

  //#region private properties
  private _destroy$: Subject<any>;
  private _policyRegisterReportData: IPolicyRegisterReportDto = new PolicyRegisterReportDto();

  private _rfqReportApi = API_ENDPOINTS.Report.RFQReport;
  private _currentDate
  //#endregion private-properties

  //#region constructor
  // -----------------------------------------------------------------------------------------------------
  // @ Constructor
  // -----------------------------------------------------------------------------------------------------

  constructor(
    private _fb: FormBuilder,
    private _masterListService: MasterListService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _alertservice: AlertsService,
    private _datePipe: DatePipe,
    private _dataService: HttpService,
    private _authService: AuthService,
    public dialog: MatDialog,
    private _commonFunService: CommonFunctionsService,
  ) {
    this._currentDate = new Date()
    this._destroy$ = new Subject();
    this._fillMasterList();
    this._getCategoryWiseSubCategory('')
    this._getCategoryWiseinsuranceCompanyList('')
  }

  //#endregion constructor

  //#region public-getters
  // -----------------------------------------------------------------------------------------------------
  // @ Pubic Getters
  // -----------------------------------------------------------------------------------------------------

  // get Policy


  // get Policy period
  get displayedPolicyPeriod() {
    return DisplayedPolicyPeriod
  }

  // get Policy Type
  get displayedPolicyType() {
    return DisplayedRFQReportPolicyType;
  }

  //#endregion public-getters

  //#region life cycle hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    //get data from route
    let data = this._route.snapshot.data;
    this.title = data['title'];

    this.policyStatusList = this._commonFunService.healthPolicyStatus();
    this.requestTypeList = this._commonFunService.RFQrequestType();
    this.rfqReportForm = this._initForm(this._policyRegisterReportData);
    this._onFormChange();
  }

  ngOnDestroy(): void {
    // Resets the filters.
    this._destroy$.next(null);
    this._destroy$.complete();
  }
  //#endregion life-cycle-hooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // previous page navigation button
  public backClicked(): void {
    this._router.navigate(['../'], { relativeTo: this._route })
  }

  // all tab expand and Collaps
  public ExpandCollaps(): void {
    this.isExpand = !this.isExpand
  }

  /**
  * Start Validation part 
  */

  public policyDetailsValidations(): FormControl {
    this.policyDetailAlert = []


    if (this.rfqReportForm.get('PolicyPeriod').value == "" || this.rfqReportForm.get('PolicyPeriod').value == null) {
      this.policyDetailAlert.push({
        Message: 'Select RFQ Period',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.rfqReportForm.get('PolicyPeriod').value == "DateRange") {

      if (this.rfqReportForm.get('FromDate').value == "" || this.rfqReportForm.get('FromDate').value == null) {
        this.policyDetailAlert.push({
          Message: 'From Date is required.',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.rfqReportForm.get('ToDate').value == "" || this.rfqReportForm.get('ToDate').value == null) {
        this.policyDetailAlert.push({
          Message: 'Select To Date is required.',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.rfqReportForm.get('FromDate').value != "" && this.rfqReportForm.get('FromDate').value != null && this.rfqReportForm.get('ToDate').value != "" && this.rfqReportForm.get('ToDate').value != null) {

        const fromDate = new Date(this._datePipe.transform(this.rfqReportForm.get('FromDate').value, 'dd-MM-yyyy'));
        const toDate = new Date(this._datePipe.transform(this.rfqReportForm.get('ToDate').value, 'dd-MM-yyyy'));

        if (fromDate > toDate) {
          this.policyDetailAlert.push({
            Message: `To date can not be less than From date.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }
    }

    if (this.policyDetailAlert.length > 0) {
      this.policyDetailStepCtrl.setErrors({ required: true });
      return this.policyDetailStepCtrl;
    }
    else {
      this.policyDetailStepCtrl.reset();
      return this.policyDetailStepCtrl;
    }
  }

  public policyDetailsError() {
    if (this.policyDetailAlert.length > 0) {
      this._alertservice.raiseErrors(this.policyDetailAlert);
      return;
    }
  }

  /**
   * End Validation part 
  */

  // Clear function for Selected input box 
  public clear(name: string, id: string): void {
    this.rfqReportForm.get(name).setValue('');
    this.rfqReportForm.get(id).setValue(null);
  }

  // Clear TransactionID 
  public clearSingleValue(name: string): void {
    this.rfqReportForm.get(name).setValue('');
  }

  // auto complete select event execute
  public AutocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, selectedFor: string): void {

    switch (selectedFor) {
      case "SalesPersonName":
        this.rfqReportForm.patchValue({
          SalesPersonName: event.option.value.FullName,
          SalesPersonId: event.option.value.Id,
        });
        break;

      case "BDM":
        this.rfqReportForm.patchValue({
          BDMName: event.option.value.FullName,
          BDMId: event.option.value.Id,
        })
        break;

      case "BDO":
        this.rfqReportForm.patchValue({
          BDOName: event.option.value.FullName,
          BDOId: event.option.value.Id,
        })
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
    let rule: IFilterRule[] = [];
    let additionalFilters: IAdditionalFilterObject[] = []
    switch (openFor) {

      case "SalesPersonName":

        rule = [ActiveMasterDataRule]

        additionalFilters.push({ key: 'ReportSalesPersonOnly', filterValues: ['true'] })

        additionalFilters.push({
          key: 'UserType',
          filterValues: [UserTypeEnum.StandardUser,UserTypeEnum.Agent, UserTypeEnum.TeamReference]
        })

        if (this.rfqReportForm.get('BranchId').value) {
          additionalFilters.push({ key: "Branch", "filterValues": [this.rfqReportForm.get('BranchId').value?.toString()] })
        }

        if (this.rfqReportForm.get('BDOId').value) {
          additionalFilters.push({ key: "BDOBDMId", "filterValues": [this.rfqReportForm.get('BDOId').value?.toString()] })
        } else if (this.rfqReportForm.get('BDMId').value) {
          additionalFilters.push({ key: "BDOBDMId", "filterValues": [this.rfqReportForm.get('BDMId').value?.toString()] })
        }

        break;

        
      case "BDM":
        rule = [ActiveMasterDataRule]

        additionalFilters.push({ key: 'BDMOnly', filterValues: ['true'] })

        additionalFilters.push({
          key: 'UserType',
          filterValues: [UserTypeEnum.StandardUser]
        })


        if (this.rfqReportForm.get('BranchId').value) {
          additionalFilters.push({ key: "Branch", "filterValues": [this.rfqReportForm.get('BranchId').value?.toString()] })
        }
        break;

      case "BDO":
        rule = [ActiveMasterDataRule]

        additionalFilters.push({ key: 'BDOOnly', filterValues: ['true'] })

        additionalFilters.push({
          key: 'UserType',
          filterValues: [UserTypeEnum.StandardUser]
        })

        if (this.rfqReportForm.get('BDMId').value) {
          additionalFilters.push({ key: "BDMId", "filterValues": [this.rfqReportForm.get('BDMId').value?.toString()] })
        }

        if (this.rfqReportForm.get('BranchId').value) {
          additionalFilters.push({ key: "Branch", "filterValues": [this.rfqReportForm.get('BranchId').value?.toString()] })
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
      filterData: rule,
      addFilterData: additionalFilters
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        switch (openFor) {
          case "SalesPersonName":
            this.rfqReportForm.patchValue({
              SalesPersonName: result.FullName,
              SalesPersonId: result.Id,
            });
            break;

          case "BDM":
            this.rfqReportForm.patchValue({
              BDMName: result.FullName,
              BDMId: result.Id,
            });
            break;

          case "BDO":
            this.rfqReportForm.patchValue({
              BDOName: result.FullName,
              BDOId: result.Id,
            });
            break;


          default:
            break;
        }
      }
    });
  }



  /**
   * 
   */
  public generateReport(): void {

    if (!this._authService._userProfile.value?.AuthKeys?.includes("RFQReport-export")) {
      this._alertservice.raiseErrorAlert("Role assigned to you does not contain permission for RFQ Report");
      return;
    }

    if (this.policyDetailAlert.length > 0) {
      this._alertservice.raiseErrors(this.policyDetailAlert);
      return;
    }

    let specs = this._getFilter();

    this._dataService
      .exportToExcel(specs, this._rfqReportApi)
      .pipe(takeUntil(this._destroy$))
      .subscribe((blob: any) => {
        if (blob.type == 'application/json') {

          const reader = new FileReader();

          reader.onload = (event: any) => {
            const res: ResponseMessage = JSON.parse(event.target.result);

            if (res.Success) {
              // handle success message here
              this._alertservice.raiseSuccessAlert(res.Message)
            } else {
              // handle failure message here
              if (res.Alerts && res.Alerts.length > 0) {
                this._alertservice.raiseErrors(res.Alerts);
              } else {
                this._alertservice.raiseErrorAlert(res.Message);
              }
            }
          }

          reader.readAsText(blob);

        } else {
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download =
            (this.rfqReportForm.get("FromDate").value
              ?
              this._datePipe.transform(this.rfqReportForm.get("FromDate").value, "dd/MM/yyyy") +
              " To " +
              this._datePipe.transform(this.rfqReportForm.get("ToDate").value, "dd/MM/yyyy")
              : "") + "_RFQ_Report";

          a.click();
          URL.revokeObjectURL(objectUrl);
        }
      });
  }

  /**
   * Reset Policy Register Form
   */
  public resetForm(): void {
    this.rfqReportForm.patchValue({
      BranchId: "",
      PolicyType: "",
      SalesPersonId: null,
      SalesPersonName: "",
      PolicyPeriod: "",
      FromDate: "",
      ToDate: "",
      CategoryId: "",
      SubCategoryId: "",
      InsuranceCompany: "",
      RFQStage: '',
      RequestType: "",
    }, { emitEvent: false });

    this._getCategoryWiseSubCategory('')
    this._getCategoryWiseinsuranceCompanyList('')
  }
  //#endregion public-methods

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build Main Form
  private _initForm(data) {
    let fg = this._fb.group({
      BranchId: [""],
      PolicyType: [""],
      SalesPersonId: [null],
      SalesPersonName: [""],
      BDMId: [],
      BDMName: [],
      BDOId: [],
      BDOName: [],
      PolicyPeriod: [""],
      FromDate: [""],
      ToDate: [""],
      CategoryId: [""],
      SubCategoryId: [""],
      RFQStage: [''],
      RequestType: [""],
      InsuranceCompany: [""],
    });

    if (data != null) {
      fg.patchValue(data);
    }

    return fg;
  }


  private _fillMasterList(): void {
    // Get Category List Order by srno & only Active master Data
    let activeDataRule: IFilterRule[] = [ActiveMasterDataRule];
    let orderBySpecs: OrderBySpecs[] = [{ field: 'SrNo', direction: 'asc', },];

    //Category
    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Category.List, 'Name', "", activeDataRule, [], orderBySpecs)
      .subscribe(res => {
        if (res.Success) {
          this.categoryList = res.Data.Items
        }
      });

    // Get Branch As per User Access
    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List + "/true", 'Name', "")
      .subscribe(res => {
        if (res.Success) {
          this.branches = res.Data.Items
          if (this.branches.length == 1) {
            this.rfqReportForm.patchValue({ BranchId: this.branches[0].Id })
          }
        }

      })
  }

  private _getCategoryWiseSubCategory(CategoryId: any) {

    let subCategoryRule: IFilterRule[] = [ActiveMasterDataRule];

    if (CategoryId) {
      subCategoryRule.push(
        { Field: "Category.Id", Operator: "eq", Value: CategoryId }
      )
    }
    let orderBySpecs: OrderBySpecs[] = [{ field: "SrNo", direction: "asc" }];

    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.SubCategory.List, 'Name', '', subCategoryRule, [], orderBySpecs).subscribe(res => {
      if (res.Success) {
        this.subCategoryList = res.Data.Items
      }
    });
  }

  private _getCategoryWiseinsuranceCompanyList(CategoryId: any) {

    // Fill Insurance Company
    let InsuranceCompanyRule: IFilterRule[] = [ActiveMasterDataRule];
    let InsuranceCompanyAdditionalFilters: IAdditionalFilterObject[] = []

    if (CategoryId) {
      InsuranceCompanyAdditionalFilters.push(
        { key: "CatagoryId", filterValues: [CategoryId] }
      )
    }

    this._masterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.InsuranceCompany.list, 'Name', "", InsuranceCompanyRule, InsuranceCompanyAdditionalFilters)
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.insuranceCompanyList = res.Data.Items
          } else {
            this.insuranceCompanyList = []
          }
        } else {
          this.insuranceCompanyList = []
        }
      });
  }


  private _onFormChange() {

    //Sales Person
    this.rfqReportForm.get('SalesPersonName').valueChanges.subscribe((val) => {
      let Rule: IFilterRule[] = [ActiveMasterDataRule];

      let AdditionalFilters: IAdditionalFilterObject[] = [
        { key: "FullName", filterValues: [val] },
        { key: 'ReportSalesPersonOnly', filterValues: ['true'] },
        {
          key: 'UserType',
          filterValues: [UserTypeEnum.StandardUser ,UserTypeEnum.Agent, UserTypeEnum.TeamReference]
        }
      ]
      if (this.rfqReportForm.get('BranchId').value) {
        AdditionalFilters.push({ key: "Branch", "filterValues": [this.rfqReportForm.get('BranchId').value?.toString()] })
      }

      if (this.rfqReportForm.get('BDOId').value) {
        AdditionalFilters.push({ key: "BDOBDMId", "filterValues": [this.rfqReportForm.get('BDOId').value?.toString()] })
      } else if (this.rfqReportForm.get('BDMId').value) {
        AdditionalFilters.push({ key: "BDOBDMId", "filterValues": [this.rfqReportForm.get('BDMId').value?.toString()] })
      }

      this.salesPerson$ = this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", Rule, AdditionalFilters)
        .pipe(takeUntil(this._destroy$), switchMap((res) => {
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

    // change sales person
    this.rfqReportForm.get('BDMName').valueChanges.subscribe((val) => {

      let Rule: IFilterRule[] = [ActiveMasterDataRule];

      let AdditionalFilters: IAdditionalFilterObject[] = [
        { key: "FullName", filterValues: [val] },
        { key: 'BDMOnly', filterValues: ['true'] },
        {
          key: 'UserType',
          filterValues: [UserTypeEnum.StandardUser]
        }
      ]

      if (this.rfqReportForm.get('BranchId').value) {
        AdditionalFilters.push({ key: "Branch", "filterValues": [this.rfqReportForm.get('BranchId').value?.toString()] })
      }

      this.BDMList$ = this._masterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", Rule, AdditionalFilters)
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


    // change sales person
    this.rfqReportForm.get('BDOName').valueChanges.subscribe((val) => {

      let Rule: IFilterRule[] = [ActiveMasterDataRule];

      let AdditionalFilters: IAdditionalFilterObject[] = [
        { key: "FullName", filterValues: [val] },
        { key: 'BDOOnly', filterValues: ['true'] },
        {
          key: 'UserType',
          filterValues: [UserTypeEnum.StandardUser]
        }
      ]

      if (this.rfqReportForm.get('BranchId').value) {
        AdditionalFilters.push({ key: "Branch", "filterValues": [this.rfqReportForm.get('BranchId').value?.toString()] })
      }

      if (this.rfqReportForm.get('BDMId').value) {
        AdditionalFilters.push({ key: "BDMId", "filterValues": [this.rfqReportForm.get('BDMId').value?.toString()] })
      }



      this.BDOList$ = this._masterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", Rule, AdditionalFilters)
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

    // changes Branch
    this.rfqReportForm.get('BDMId').valueChanges.subscribe(val => {
      this.rfqReportForm.patchValue({
        SalesPersonId: null,
        SalesPersonName: null,
        BDOName: null,
        BDOId: null,
      }, { emitEvent: false });
    })

    // changes Branch
    this.rfqReportForm.get('BDOId').valueChanges.subscribe(val => {
      this.rfqReportForm.patchValue({
        SalesPersonId: null,
        SalesPersonName: null,
      }, { emitEvent: false });
    })

    this.rfqReportForm.get('CategoryId').valueChanges.subscribe(val => {

      this.rfqReportForm.patchValue({
        SubCategoryId: 0,
        InsuranceCompany: "",
      });

      this._getCategoryWiseSubCategory(val)
      this._getCategoryWiseinsuranceCompanyList(val)

    });
    
    this.rfqReportForm.get('BranchId').valueChanges.subscribe(val => {
      this.rfqReportForm.patchValue({
        SalesPersonName: "",
        SalesPersonId: null,
        BDOName: null,
        BDOId: null,
        BDMName: null,
        BDMId: null,
      });
    });

    this.rfqReportForm.get('PolicyPeriod').valueChanges.subscribe(val => {

      this._currentDate = this._datePipe.transform(this._currentDate, 'yyyy-MM-dd');
      let endDate = new Date(this._currentDate);

      this.rfqReportForm.get("ToDate").patchValue(this._currentDate);
      if (val == "OneMonth") {
        endDate.setMonth(endDate.getMonth() - 1);
        this.rfqReportForm.get("FromDate").patchValue(endDate);
      }
      else if (val == "ThreeMonth") {
        endDate.setMonth(endDate.getMonth() - 3);
        this.rfqReportForm.get("FromDate").patchValue(endDate);
      }
      else if (val == "SixMonth") {
        endDate.setMonth(endDate.getMonth() - 6);
        this.rfqReportForm.get("FromDate").patchValue(endDate);
      }
      else if (val == "OneYear") {
        endDate.setMonth(endDate.getMonth() - 12);
        this.rfqReportForm.get("FromDate").patchValue(endDate);
      }

    });


  }

  private _getFilter(): QuerySpecs {
    let specs = new QuerySpecs();
    specs.PaginationSpecs.PaginationRequired = false;
    specs.PaginationSpecs.Limit = 50;
    specs.FilterConditions.Rules = []
    specs.AdditionalFilters = []
    specs.OrderBySpecs = []

    if (this.rfqReportForm.get('RFQStage').value) {
      specs.FilterConditions.Rules.push(
        {
          Field: "Stage",
          Operator: "eq",
          Value: this.rfqReportForm.get('RFQStage').value
        }
      )
    }

    if (this.rfqReportForm.get('PolicyType').value) {
      specs.FilterConditions.Rules.push(
        {
          Field: "PolicyType",
          Operator: "eq",
          Value: this.rfqReportForm.get('PolicyType').value
        }
      )
    }

    if (this.rfqReportForm.get('CategoryId').value) {
      specs.FilterConditions.Rules.push(
        {
          Field: "Category.Id",
          Operator: "eq",
          Value: this.rfqReportForm.get('CategoryId').value
        }
      )
    }

    if (this.rfqReportForm.get('SubCategoryId').value) {
      specs.FilterConditions.Rules.push(
        {
          Field: "SubCategory.Id",
          Operator: "eq",
          Value: this.rfqReportForm.get('SubCategoryId').value
        }
      )
    }

    if (this.rfqReportForm.get('BranchId').value) {
      specs.FilterConditions.Rules.push(
        {
          Field: "Branch.Id",
          Operator: "eq",
          Value: this.rfqReportForm.get('BranchId').value
        }
      )
    }

    if (this.rfqReportForm.get('SalesPersonId').value) {
      specs.AdditionalFilters.push(
        { key: 'ReportSalesPersonId', filterValues: [this.rfqReportForm.get('SalesPersonId').value.toString()] }
      )
    }
    else if (this.rfqReportForm.get('BDOId').value) {
      specs.AdditionalFilters.push(
        { key: 'BDOId', filterValues: [this.rfqReportForm.get('BDOId').value.toString()] }
      )
    } else if (this.rfqReportForm.get('BDMId').value) {
      specs.AdditionalFilters.push(
        { key: 'BDMId', filterValues: [this.rfqReportForm.get('BDMId').value.toString()] }
      )
    }

    if (this.rfqReportForm.get('InsuranceCompany').value) {
      specs.AdditionalFilters.push(
        { key: 'InsCompanyKey', filterValues: [this.rfqReportForm.get('InsuranceCompany').value] }
      )
    }

    if (this.rfqReportForm.get('RequestType').value) {
      specs.AdditionalFilters.push(
        { key: 'RequestType', filterValues: [this.rfqReportForm.get('RequestType').value] }
      )
    }

    if (this.rfqReportForm.get('FromDate').value) {
      specs.AdditionalFilters.push(
        { key: 'FromDate', filterValues: [this._datePipe.transform(this.rfqReportForm.get('FromDate').value, 'yyyy-MM-dd')] }
      )
    }

    if (this.rfqReportForm.get('ToDate').value) {
      specs.AdditionalFilters.push(
        { key: 'ToDate', filterValues: [this._datePipe.transform(this.rfqReportForm.get('ToDate').value, 'yyyy-MM-dd')] }
      )
    }

    specs.OrderBySpecs.push(
      {
        field: "CreatedDate",
        direction: "desc"
      }
    )

    return specs;
  }

  //#endregion private-methods
}