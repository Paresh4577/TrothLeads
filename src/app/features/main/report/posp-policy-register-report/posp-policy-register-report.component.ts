import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { DisplayedPolicy, DisplayedPolicyPeriod } from '@config/report/policy-register-report';
import { DisplayedPolicyType } from '@config/report/policy-register-report/policy-type.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, IAdditionalFilterObject, IFilterRule, OrderBySpecs, ResponseMessage } from '@models/common';
import { IInsuranceCompanyDetailDto, IMyProfile } from '@models/dtos/auth/MyProfile';
import { IPOSPPolicyRegisterReportDto, POSPPolicyRegisterReportDto } from '@models/dtos/config/Report/posp-policy-register';
import { ICustomerDto } from '@models/dtos/core/CustomerDto';
import { IProductPlanDto } from '@models/dtos/core/ProductPlanDto';
import { AuthService } from '@services/auth/auth.service';
import * as moment from 'moment';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-posp-policy-register-report',
  templateUrl: './posp-policy-register-report.component.html',
  styleUrls: ['./posp-policy-register-report.component.scss'],
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
export class PospPolicyRegisterReportComponent {
  //#region decorator
  //#endregion decorator

  // #region public variables
  public title: string = "";
  public isExpand: boolean = true;

  // FormGroup 
  public policyRegisterForm: FormGroup;

  // Alert Array List
  public policyDetailAlert: Alert[] = [];

  //Form Controls
  public policyDetailStepCtrl = new FormControl();

  // Observable
  public transactionList$: Observable<any[]>;
  public productPlan$: Observable<IProductPlanDto[]>;
  public customerName$: Observable<ICustomerDto[]>;

  // array list
  public insuranceCompanyList: IInsuranceCompanyDetailDto[] = [];
  public categoryList = [];
  public subCategoryList = [];

  // #endregion public-variables

  //#region private properties
  private _destroy$: Subject<any>;
  private _userProfileObj: IMyProfile;
  private _policyRegisterReportData: IPOSPPolicyRegisterReportDto = new POSPPolicyRegisterReportDto();
  // Default page filters
  private _pageFilters: any = {
    currentPage: 1,
    limit: 1,
    columnSearchOptions: {},
    columnSortOptions: {},
  };

  private _registerReportApi = API_ENDPOINTS.Report.AgentRegisterReport;
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
    private _column: ColumnSearchService,
    private _dialogService: DialogService,
    private _alertservice: AlertsService,
    private _datePipe: DatePipe,
    private _dataService: HttpService,
    private _authService: AuthService,
    public dialog: MatDialog
  ) {
    this._currentDate = new Date()
    this._destroy$ = new Subject();
    this._fillMasterList();
  }

  //#endregion constructor

  //#region public-getters
  // -----------------------------------------------------------------------------------------------------
  // @ Pubic Getters
  // -----------------------------------------------------------------------------------------------------

  // get Policy
  get displayedPolicy() {
    return DisplayedPolicy
  }

  // get Policy period
  get displayedPolicyPeriod() {
    return DisplayedPolicyPeriod
  }

  // get Policy Type
  get displayedPolicyType() {
    return DisplayedPolicyType
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

    this._authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this._userProfileObj = user
        this.insuranceCompanyList = this._userProfileObj.InsuranceCompanyDetail;
      }
    });

    this.policyRegisterForm = this._initForm(this._policyRegisterReportData);
    this._onFormChange();
  }

  ngOnDestroy(): void {
    // Resets the filters.
    this._destroy$.next(null);
    this._destroy$.complete();

    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [];
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
    // if (this.BasicDetailsAlert.length > 0) {
    //   this._alertservice.raiseErrors(this.BasicDetailsAlert);
    //   return;
    // }
    this.isExpand = !this.isExpand
  }

  /**
  * Start Validation part 
  */

  public policyDetailsValidations(): FormControl {
    this.policyDetailAlert = []

    if (this.policyRegisterForm.get('Policy').value == "" || this.policyRegisterForm.get('Policy').value == null) {
      this.policyDetailAlert.push({
        Message: 'Select Policy',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.policyRegisterForm.get('PolicyPeriod').value == "" || this.policyRegisterForm.get('PolicyPeriod').value == null) {
      this.policyDetailAlert.push({
        Message: 'Select Policy Period',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.policyRegisterForm.get('PolicyPeriod').value == "DateRange") {

      if (this.policyRegisterForm.get('FromDate').value == "" || this.policyRegisterForm.get('FromDate').value == null) {
        this.policyDetailAlert.push({
          Message: 'Select From Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.policyRegisterForm.get('ToDate').value == "" || this.policyRegisterForm.get('ToDate').value == null) {
        this.policyDetailAlert.push({
          Message: 'Select To Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.policyRegisterForm.get('FromDate').value != "" && this.policyRegisterForm.get('FromDate').value != null && this.policyRegisterForm.get('ToDate').value != "" && this.policyRegisterForm.get('ToDate').value != null) {
        // if (moment(this._datePipe.transform(this.policyRegisterForm.get('FromDate').value, 'dd-MM-yyyy')).isBefore(moment(this._datePipe.transform(this.policyRegisterForm.get('ToDate').value, 'dd-MM-yyyy')))) {

          const fromDate = new Date(this._datePipe.transform(this.policyRegisterForm.get('FromDate').value, 'dd-MM-yyyy'));
          const toDate = new Date(this._datePipe.transform(this.policyRegisterForm.get('ToDate').value, 'dd-MM-yyyy'));

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
    this.policyRegisterForm.get(name).setValue('');
    this.policyRegisterForm.get(id).setValue(null);
  }

  // Clear TransactionID 
  public clearSingleValue(name: string): void {
    this.policyRegisterForm.get(name).setValue('');
  }

  // auto complete select event execute
  public AutocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, selectedFor: string): void {

    switch (selectedFor) {
      case "TransactionID":
        this.policyRegisterForm.patchValue({
          TransactionID: event.option.value.TransactionNo
        });
        break;

      case "PolicyNumber":
        this.policyRegisterForm.patchValue({
          PolicyNumber: event.option.value.PolicyNo
        });
        break;

      case "SalesPersonName":
        this.policyRegisterForm.patchValue({
          SalesPersonName: event.option.value.FullName,
          SalesPersonId: event.option.value.Id,
        });
        break;

      case "TeamRef":
        this.policyRegisterForm.patchValue({
          TeamReferenceName: event.option.value.FullName,
          TeamReferenceId: event.option.value.Id,
        });
        break;

      case "GroupHead":
        this.policyRegisterForm.patchValue({
          GroupHeadName: event.option.value.Name,
          GroupHeadId: event.option.value.Id,
        });
        break

      case "customer":
        this.policyRegisterForm.patchValue({
          CustomerName: event.option.value.FullName,
          CustomerId: event.option.value.Id,
        });
        break;

      case "BDMName":
        this.policyRegisterForm.patchValue({
          BDMName: event.option.value.FullName,
          BDMId: event.option.value.Id,
        });
        break;

      case "BDOName":
        this.policyRegisterForm.patchValue({
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
    let rule: IFilterRule[] = [];
    let additionalFilters: IAdditionalFilterObject[] = []
    switch (openFor) {

      case "SalesPersonName":
        rule = [{ Field: 'Branch.Id', Operator: 'eq', Value: this.policyRegisterForm.get('BranchId').value, }];
        additionalFilters = [{ key: 'UserType', filterValues: ['StandardUser', 'Agent'] }];
        break;

      case "TeamRef":
        additionalFilters = [{ key: 'UserType', filterValues: ['TeamReference'] }];
        break;

      case "GroupHead":
        rule = [{ Field: "Branch.Id", Operator: "eq", Value: this.policyRegisterForm.get('BranchId').value }];
        break;

      case "customer":
        // rule = [{ Field: "GroupHeadId", Operator: "eq", Value: this.policyRegisterForm.get('GroupHeadId').value }];
        rule = [];
        break;

      case "BDOName":
        rule = [{ Field: 'Branch.Id', Operator: 'eq', Value: this.policyRegisterForm.get('BranchId').value, }];
        additionalFilters.push({ key: 'BDOOnly', filterValues: ['true'] });
        break;

      case "BDMName":
        rule = [{ Field: 'Branch.Id', Operator: 'eq', Value: this.policyRegisterForm.get('BranchId').value, }];
        additionalFilters.push({ key: 'BDMOnly', filterValues: ['true'] });
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
            this.policyRegisterForm.patchValue({
              SalesPersonName: result.FullName,
              SalesPersonId: result.Id,
            });
            break;

          case "TeamRef":
            this.policyRegisterForm.patchValue({
              TeamReferenceName: result.FullName,
              TeamReferenceId: result.Id,
            });
            break;

          case "CoShareTransaction":
            this.policyRegisterForm.patchValue({
              TransactionID: result.TransactionNo,
            }, { emitEvent: false })
            break;

          case "GroupHead":
            this.policyRegisterForm.patchValue({
              GroupHeadName: result.Name,
              GroupHeadId: result.Id,
            });
            break;

          case "customer":
            this.policyRegisterForm.patchValue({
              CustomerName: result.FullName,
              CustomerId: result.Id,
            })
            break;

          case "BDMName":
            this.policyRegisterForm.patchValue({
              BDMName: result.FullName,
              BDMId: result.Id,
            });
            break;

          case "BDOName":
            this.policyRegisterForm.patchValue({
              BDOName: result.FullName,
              BDOId: result.Id,
            });
            break;

          case "PolicyNumber":
            this.policyRegisterForm.patchValue({
              PolicyNumber: result.PolicyNo,
            }, { emitEvent: false })
            break;

          default:
            break;
        }
      }
    });
  }

  /**
 * to have value of Registration No. in upper case and append ' - '
 */
  public vehicleNoFormatting(event): void {
    let No: string = event.target.value.trim().toUpperCase();
    if (No.length == 2 || No.length == 5) No += '-'; // Alpha in RTO No may be single or double
    this.policyRegisterForm.get("VehicleNo").patchValue(No);
  }

  /**
   * 
   */
  public generateReport(): void {

    if (!this._authService._userProfile.value?.AuthKeys?.includes("AgentRegisterReport-export")) {
      this._alertservice.raiseErrorAlert("Role assigned to you does not contain permission for Policy Register Report");
      return;
    }

    if (this.policyDetailAlert.length > 0) {
      this._alertservice.raiseErrors(this.policyDetailAlert);
      return;
    }

    //set date format
    this.dateFormat();

    // clear filter rule
    this._column.FilterConditions.Rules = [];

    let rules: IFilterRule[] = [];
    let additionalFilters: IAdditionalFilterObject[] = [];

    if (this.policyRegisterForm.get("Policy").value == "Issue") {
      rules.push({ Field: "Transaction.IssueDate", Operator: "gte", Value: this.policyRegisterForm.get("FromDate").value });
      rules.push({ Field: "Transaction.IssueDate", Operator: "lte", Value: this.policyRegisterForm.get("PolicyPeriod").value != "DateRange" ? this._currentDate : this.policyRegisterForm.get("ToDate").value });
    }
    else if (this.policyRegisterForm.get("Policy").value == "Submission") {
      rules.push({ Field: "Transaction.SubmissionDate", Operator: "gte", Value: this.policyRegisterForm.get("FromDate").value });
      rules.push({ Field: "Transaction.SubmissionDate", Operator: "lte", Value: this.policyRegisterForm.get("PolicyPeriod").value != "DateRange" ? this._currentDate : this.policyRegisterForm.get("ToDate").value });
    }
    else if (this.policyRegisterForm.get("Policy").value == "Submission") {
      rules.push({ Field: "Transaction.StartDate", Operator: "gte", Value: this.policyRegisterForm.get("FromDate").value });
      rules.push({ Field: "Transaction.StartDate", Operator: "lte", Value: this.policyRegisterForm.get("PolicyPeriod").value != "DateRange" ? this._currentDate : this.policyRegisterForm.get("ToDate").value });
    }

    //Transaction ID
    if (this.policyRegisterForm.get("TransactionID").value != "" && this.policyRegisterForm.get("TransactionID").value != null) {
      rules.push({ Field: "COshareTransactionNo", Operator: "eq", Value: this.policyRegisterForm.get("TransactionID").value });
    }

    //Insurance Company
    if (this.policyRegisterForm.get("InsuranceCompany").value != "" && this.policyRegisterForm.get("InsuranceCompany").value != null) {
      rules.push({ Field: "Transaction.Company.Code", Operator: "eq", Value: this.policyRegisterForm.get("InsuranceCompany").value });
    }

    //Product/Plan Name
    if (this.policyRegisterForm.get("ProductPlanName").value != "" && this.policyRegisterForm.get("ProductPlanName").value != null) {
      rules.push({ Field: "Transaction.ProductCode", Operator: "eq", Value: this.policyRegisterForm.get("ProductPlanName").value });
    }

    //Policy Type
    if (this.policyRegisterForm.get("PolicyType").value != "" && this.policyRegisterForm.get("PolicyType").value != null) {
      rules.push({ Field: "Transaction.PolicyType", Operator: "eq", Value: this.policyRegisterForm.get("PolicyType").value });
    }

    //Policy Number
    if (this.policyRegisterForm.get("PolicyNumber").value != "" && this.policyRegisterForm.get("PolicyNumber").value != null) {
      rules.push({ Field: "Transaction.PolicyNo", Operator: "eq", Value: this.policyRegisterForm.get("PolicyNumber").value });
    }

    //Customer
    if (this.policyRegisterForm.get("CustomerId").value != "" && this.policyRegisterForm.get("CustomerId").value != null && this.policyRegisterForm.get("CustomerId").value != 0) {
      rules.push({ Field: "Transaction.CustomerId", Operator: "eq", Value: this.policyRegisterForm.get("CustomerId").value });
    }

    //Category
    if (this.policyRegisterForm.get("CategoryCode").value != "" && this.policyRegisterForm.get("CategoryCode").value != null && this.policyRegisterForm.get("CategoryCode").value != 0) {
      rules.push({ Field: "Transaction.Category.Code", Operator: "eq", Value: this.policyRegisterForm.get("CategoryCode").value });
    }

    //SubCategory
    if (this.policyRegisterForm.get("SubCategoryCode").value != "" && this.policyRegisterForm.get("SubCategoryCode").value != null && this.policyRegisterForm.get("SubCategoryCode").value != 0) {
      rules.push({ Field: "Transaction.SubCategory.Code", Operator: "eq", Value: this.policyRegisterForm.get("SubCategoryCode").value });
    }

    //Vehicle No
    if (this.policyRegisterForm.get('CategoryCode').value == 'Motor' && this.policyRegisterForm.get("VehicleNo").value != "" && this.policyRegisterForm.get("VehicleNo").value != null && this.policyRegisterForm.get("VehicleNo").value != 0) {
      rules.push({ Field: "Transaction.VehicleDetail.VehicleNumber", Operator: "eq", Value: this.policyRegisterForm.get("VehicleNo").value });
    }

    //Gross Premium From
    if (this.policyRegisterForm.get("GrossPremiumFrom").value != "" && this.policyRegisterForm.get("GrossPremiumFrom").value != null && this.policyRegisterForm.get("GrossPremiumFrom").value != 0) {
      additionalFilters.push({ key: "GrossPremiumFrom", filterValues: [this.policyRegisterForm.get("GrossPremiumFrom").value] });
    }

    //Gross Premium To
    if (this.policyRegisterForm.get("GrossPremiumTo").value != "" && this.policyRegisterForm.get("GrossPremiumTo").value != null && this.policyRegisterForm.get("GrossPremiumTo").value != 0) {
      additionalFilters.push({ key: "GrossPremiumTo", filterValues: [this.policyRegisterForm.get("GrossPremiumTo").value] });
    }

    //Commision From
    if (this.policyRegisterForm.get("CommisionFrom").value != "" && this.policyRegisterForm.get("CommisionFrom").value != null && this.policyRegisterForm.get("CommisionFrom").value != 0) {
      additionalFilters.push({ key: "CommisionFrom", filterValues: [this.policyRegisterForm.get("CommisionFrom").value] });
    }

    //Commision To
    if (this.policyRegisterForm.get("CommisionTo").value != "" && this.policyRegisterForm.get("CommisionTo").value != null && this.policyRegisterForm.get("CommisionTo").value != 0) {
      additionalFilters.push({ key: "CommisionTo", filterValues: [this.policyRegisterForm.get("CommisionTo").value] });
    }

    //bind rules
    this._column.FilterConditions.Rules = rules;

    // bind addition filter
    this._column.AdditionalFilters = additionalFilters;

    let listRequestBody = {
      IncludeDeleted: false,
      PaginationSpecs: {
        PaginationRequired: false,
        Page: this._pageFilters.currentPage,
        Limit: this._pageFilters.limit,
      },
      FilterConditions: this._column.FilterConditions,
      OrderBySpecs: this._column.OrderBySpecs,
      AdditionalFilters: this._column.AdditionalFilters,
      DisplayColumns: [],
    };

    this._dataService
      .exportToExcel(listRequestBody, this._registerReportApi + "/ExportExcel")
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
          a.download = this.policyRegisterForm.get("Policy").value + "_Policy_Register_Report";
          a.click();
          URL.revokeObjectURL(objectUrl);
        }
      });
  }

  /**
 * Reset Policy Register Form
 */
  public resetForm(): void {
    this.policyRegisterForm.patchValue({
      Policy: "",
      PolicyPeriod: "",
      FromDate: "",
      ToDate: "",
      TransactionID: "",
      InsuranceCompany: "",
      ProductPlanName: "",
      PolicyType: "",
      PolicyNumber: "",
      CustomerId: null,
      CustomerName: "",
      CategoryId: null,
      CategoryName: "",
      CategoryCode: "",
      SubCategoryId: null,
      SubCategoryName: "",
      SubCategoryCode: "",
      VehicleRegisterNo: "",
      GrossPremiumFrom: null,
      GrossPremiumTo: null,
      CommisionFrom: null,
      CommisionTo: null,
      VehicleNo: ""
    });
    this._fillMasterList();
  }

  //#endregion public-methods

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build Main Form
  private _initForm(data: IPOSPPolicyRegisterReportDto) {
    let fg = this._fb.group({
      Policy: [""],
      PolicyPeriod: [""],
      FromDate: [""],
      ToDate: [""],
      TransactionID: [""],
      InsuranceCompany: [""],
      ProductPlanName: [""],
      PolicyType: [""],
      PolicyNumber: [""],
      CustomerId: [null],
      CustomerName: [""],
      CategoryId: [null],
      CategoryName: [""],
      CategoryCode: [""],
      SubCategoryId: [null],
      SubCategoryName: [""],
      SubCategoryCode: [""],
      VehicleRegisterNo: [""],
      GrossPremiumFrom: [null],
      GrossPremiumTo: [null],
      CommisionFrom: [null],
      CommisionTo: [null],
      VehicleNo: [""]
    });

    if (data != null) {
      fg.patchValue(data);
    }

    return fg;
  }

  private dateFormat(): void {
    this.policyRegisterForm.patchValue({
      FromDate: this._datePipe.transform(this.policyRegisterForm.getRawValue().FromDate, "yyyy-MM-dd"),
      ToDate: this._datePipe.transform(this.policyRegisterForm.getRawValue().ToDate, "yyyy-MM-dd"),
    });
    this._currentDate = this._datePipe.transform(this._currentDate, "yyyy-MM-dd");
  }

  private _fillMasterList(): void {
    // Get Category List Order by srno & only Active master Data
    let activeDataRule: IFilterRule[] = [];
    let orderBySpecs: OrderBySpecs[] = [{ field: 'SrNo', direction: 'asc', },];

    //Category
    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Category.List, 'Name', "", activeDataRule, [], orderBySpecs)
      .subscribe(res => {
        if (res.Success) {
          this.categoryList = res.Data.Items
        }
      });
  }

  private _getCategoryWiseSubCategory(CategoryId: number) {

    let subCategoryRule: IFilterRule[] = [{ Field: "Category.Id", Operator: "eq", Value: CategoryId }];
    let orderBySpecs: OrderBySpecs[] = [{ field: "SrNo", direction: "asc" }];

    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.SubCategory.List, 'Name', '', subCategoryRule, [], orderBySpecs).subscribe(res => {
      if (res.Success) {
        this.subCategoryList = res.Data.Items
      }
    });
  }

  private _getInsuranceCompanyWiseProduct(InsuranceCompanyCode: string) {
    let Rule: IFilterRule[] = [
      {
        Field: "InsurerCode",
        Operator: "eq",
        Value: InsuranceCompanyCode
      }
    ]

    this.productPlan$ = this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.ProductPlan.List, 'Name', '', Rule).pipe(
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

  private _onFormChange() {

    //Insurance Company
    this.policyRegisterForm.get('InsuranceCompany').valueChanges.subscribe(val => {
      this._getInsuranceCompanyWiseProduct(val)
      this.policyRegisterForm.get('ProductPlanName').patchValue("")
    });

    //Customer
    this.policyRegisterForm.get('CustomerName').valueChanges.subscribe((val) => {
      // let Rule: IFilterRule[] = [{
      //   Field: "GroupHeadId",
      //   Operator: "eq",
      //   Value: this.policyRegisterForm.get('GroupHeadId').value
      // }];
      let Rule: IFilterRule[] = [];

      let CustomerAdditionalFilters: IAdditionalFilterObject[] = [{ key: "FullName", filterValues: [val] }];

      this.customerName$ = this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Customer.List, 'FirstName', "", Rule, CustomerAdditionalFilters).pipe(
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

    //Category Code
    this.policyRegisterForm.get('CategoryCode').valueChanges.subscribe(val => {

      this.policyRegisterForm.patchValue({
        SubCategoryName: "",
        SubCategoryCode: "",
        SubCategoryId: 0,
        VehicleNo: ""
      });

      let selectedCategory = this.categoryList.find(cat => cat.Code == val);

      if (selectedCategory) {
        this.policyRegisterForm.patchValue({
          CategoryName: selectedCategory.Name,
          CategoryId: selectedCategory.Id
        });
        this._getCategoryWiseSubCategory(selectedCategory.Id)
      }
      else {
        this.policyRegisterForm.patchValue({
          CategoryName: "",
          CategoryId: 0
        });
      }

    });

    //Policy Period
    this.policyRegisterForm.get('PolicyPeriod').valueChanges.subscribe(val => {

      this._currentDate = this._datePipe.transform(this._currentDate, 'yyyy-MM-dd');
      let endDate = new Date(this._currentDate);
      if (val == "OneMonth") {
        endDate.setMonth(endDate.getMonth() - 1);
      }
      else if (val == "ThreeMonth") {
        endDate.setMonth(endDate.getMonth() - 3);
      }
      else if (val == "SixMonth") {
        endDate.setMonth(endDate.getMonth() - 6);
      }
      else if (val == "OneYear") {
        endDate.setMonth(endDate.getMonth() - 12);
      }

      this.policyRegisterForm.get("FromDate").patchValue(endDate);
    });

    //Transaction Data
    this.policyRegisterForm.get('TransactionID').valueChanges.subscribe(val => {

      this.transactionList$ = this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Transaction.CoShareWiseList + "/true", 'COshareTransactionNo', val).pipe(
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
        }));
    });

    //Policy Number
    this.policyRegisterForm.get('PolicyNumber').valueChanges.subscribe(val => {
      this.transactionList$ = this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Transaction.CoShareWiseList + "/true", 'Transaction.PolicyNo', val).pipe(
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
        }));
    });

  }

  //#endregion private-methods
}
