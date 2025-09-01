import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  Alert,
  AppDataGridListDto,
  CurrencyFormatter,
  dateFormatter,
  IAdditionalFilterObject,
  IFilterRule,
} from '@models/common';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { HttpService } from '@lib/services/http/http.service';
import { Subject, BehaviorSubject, Observable, takeUntil } from 'rxjs';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { FormGroup,  FormBuilder,} from '@angular/forms';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { MasterListService } from '@lib/services/master-list.service';
import { DisplayedPolicyPeriod } from '@config/report/policy-register-report';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { AlertsService } from '@lib/services/error-handling/alerts.service';

const ActiveMasterDataRule: IFilterRule = {
  Field: 'Status',
  Operator: 'eq',
  Value: 1,
};


@Component({
  selector: 'gnx-mis-report',
  templateUrl: './mis-report.component.html',
  styleUrls: ['./mis-report.component.scss'],
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
export class MisReportComponent {

  // Paramter
  title: string = 'MIS Report';
  generated: boolean = false;
  submitted: boolean = false;
  Branchs: IBranchDto[] = [];

  // FormGroup 
  public MISReportForm: FormGroup;
  // #region public variables

  destroy$: Subject<any>;
  // Alert Array List
  public misReportErrorAlert: Alert[] = [];

  ReportData: BehaviorSubject<any>;
  ReportData$: Observable<any>;

  MISReportApi = API_ENDPOINTS.Report.MISReport;

  // Default page filters
  pagefilters: any = {
    currentPage: 1,
    limit: 20,
    columnSearchOptions: {},
    columnSortOptions: {},
  };

  private _currentDate = new Date()

  // Column Defination of table
  columnDef: AppDataGridListDto[] = [
    {
      head: 'Transaction No',
      fieldName: 'TransactionNo',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'COshareTransactionNo',
      isFilterable: true,
      searchFieldName: 'COshareTransactionNo',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Policy Type',
      fieldName: 'PolicyType',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.PolicyType',
      isFilterable: true,
      searchFieldName: 'Transaction.PolicyType',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Policy No',
      fieldName: 'PolicyNo',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.PolicyNo',
      isFilterable: true,
      searchFieldName: 'Transaction.PolicyNo',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Issue Date',
      fieldName: 'IssueDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.IssueDate',
      isFilterable: true,
      searchFieldName: 'Transaction.IssueDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter
    },
    {
      head: 'Start Date',
      fieldName: 'StartDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.StartDate',
      isFilterable: true,
      searchFieldName: 'Transaction.StartDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter
    },
    {
      head: 'End Date',
      fieldName: 'EndDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.EndDate',
      isFilterable: true,
      searchFieldName: 'Transaction.EndDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter
    },
    {
      head: 'Sum Insured',
      fieldName: 'SumInsured',
      oprator: 'eq',
      isSortable: false,
      sortFieldName: 'Transaction.SumInsured',
      isFilterable: false,
      searchFieldName: 'Transaction.SumInsured',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'Branch',
      fieldName: 'BranchName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.Branch.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.Branch.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Category',
      fieldName: 'CategoryName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.Category.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.Category.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Sub Category',
      fieldName: 'SubCategoryName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.SubCategory.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.SubCategory.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Customer',
      fieldName: 'CustomerName',
      oprator: 'contains',
      isSortable: false,
      sortFieldName: 'CustomerFullName',
      isFilterable: true,
      searchFieldName: 'CustomerFullName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
      isAdditional: true,
    },
    {
      head: 'GroupHead',
      fieldName: 'GroupHeadName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.GroupHead.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.GroupHead.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Main Insurer',
      fieldName: 'MainInsurer',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.Company.ShortName',
      isFilterable: true,
      searchFieldName: 'Transaction.Company.ShortName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Product',
      fieldName: 'ProductName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.ProductCode',
      isFilterable: true,
      searchFieldName: 'Transaction.ProductCode',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'COshareInsurer',
      fieldName: 'COshareInsurer',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Company.ShortName',
      isFilterable: true,
      searchFieldName: 'Company.ShortName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'COshare',
      fieldName: 'COshare',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'COshare',
      isFilterable: true,
      searchFieldName: 'COshare',
      filterType: 'dropdown',
      width: '10%',
      minWidth: '150px',
      drpDataList: [
        { Text: '-- select --', Value: '-1' },
        { Text: 'Yes', Value: '1' },
        { Text: 'No', Value: '0' },
      ],
    },
    {
      head: 'COshare %',
      fieldName: 'COshareper',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'COshareper',
      isFilterable: true,
      searchFieldName: 'COshareper',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'CoShare GST Amount',
      fieldName: 'CoShareGSTAmount',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'CoShareGSTAmount',
      isFilterable: true,
      searchFieldName: 'CoShareGSTAmount',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'CoShare Total Net Premium',
      fieldName: 'CoShareTotalNetPremium',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'CoShareTotalNetPremium',
      isFilterable: true,
      searchFieldName: 'CoShareTotalNetPremium',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'SalesPerson Type',
      fieldName: 'SalesPersonType',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.SalesPersonType',
      isFilterable: true,
      searchFieldName: 'Transaction.SalesPersonType',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Sales Person',
      fieldName: 'SalesPersonName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'SalesPersonName',
      isFilterable: true,
      searchFieldName: 'SalesPersonName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
      isAdditional: true
    },
    {
      head: 'Team Referance',
      fieldName: 'TeamReferenceName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'TeamReferenceName',
      isFilterable: true,
      searchFieldName: 'TeamReferenceName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
      isAdditional: true
    },
    {
      head: 'Premium Installment Type',
      fieldName: 'PremiumInstallmentType',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'PremiumInstallmentType',
      isFilterable: true,
      searchFieldName: 'PremiumInstallmentType',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Policy Terms',
      fieldName: 'PolicyTerms',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.PolicyTerms',
      isFilterable: true,
      searchFieldName: 'Transaction.PolicyTerms',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Name of Life Assured',
      fieldName: 'NameofLifeAssured',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.NameofLifeAssured',
      isFilterable: true,
      searchFieldName: 'Transaction.NameofLifeAssured',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Premium Payment Type',
      fieldName: 'PremiumPaymentType',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.PremiumPaymentType',
      isFilterable: true,
      searchFieldName: 'Transaction.PremiumPaymentType',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Broker Qualified PersonName',
      fieldName: 'BrokerQualifiedPersonName',
      oprator: 'contains',
      isSortable: false,
      sortFieldName: 'BrokerQualifiedPersonName',
      isFilterable: true,
      searchFieldName: 'BrokerQualifiedPersonName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
      isAdditional: true
    },
    {
      head: 'Premium Type',
      fieldName: 'PremiumType',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.PremiumType',
      isFilterable: true,
      searchFieldName: 'Transaction.PremiumType',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'TPStart Date',
      fieldName: 'TPStartDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.TPStartDate',
      isFilterable: true,
      searchFieldName: 'Transaction.TPStartDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter
    },
    {
      head: 'TPEnd Date',
      fieldName: 'TPEndDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.TPEndDate',
      isFilterable: true,
      searchFieldName: 'Transaction.TPEndDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter
    },
    {
      head: 'Category Type',
      fieldName: 'CategoryType',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.CategoryType',
      isFilterable: true,
      searchFieldName: 'Transaction.CategoryType',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'SubCategory Type',
      fieldName: 'SubCategoryType',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.SubCategoryType',
      isFilterable: true,
      searchFieldName: 'Transaction.SubCategoryType',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Transaction Date',
      fieldName: 'TransactionDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.TransactionDate',
      isFilterable: true,
      searchFieldName: 'Transaction.TransactionDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter
    },
    {
      head: 'Collected Amount',
      fieldName: 'CollectedAmount',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.PaymentDetail.CollectedAmount',
      isFilterable: true,
      searchFieldName: 'Transaction.PaymentDetail.CollectedAmount',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'Balance Amount',
      fieldName: 'BalanceAmount',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.PaymentDetail.BalanceAmount',
      isFilterable: true,
      searchFieldName: 'Transaction.PaymentDetail.BalanceAmount',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'Receivable Amount',
      fieldName: 'ReceivableAmount',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.PaymentDetail.ReceivableAmount',
      isFilterable: true,
      searchFieldName: 'Transaction.PaymentDetail.ReceivableAmount',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'Basic Premium',
      fieldName: 'ReceivableBasicPremiumAmount',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.PaymentDetail.BasicPremium',
      isFilterable: true,
      searchFieldName: 'Transaction.PaymentDetail.BasicPremium',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'GST Amount',
      fieldName: 'GSTAmount',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.PaymentDetail.GSTAmount',
      isFilterable: true,
      searchFieldName: 'Transaction.PaymentDetail.GSTAmount',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'Total Net Premium',
      fieldName: 'TotalNetPremium',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.PaymentDetail.TotalNetPremium',
      isFilterable: true,
      searchFieldName: 'Transaction.PaymentDetail.TotalNetPremium',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'Total Policy Premium',
      fieldName: 'TotalPolicyPremium',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.PaymentDetail.TotalPolicyPremium',
      isFilterable: true,
      searchFieldName: 'Transaction.PaymentDetail.TotalPolicyPremium',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'Vehicle Number',
      fieldName: 'VehicleNumber',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.VehicleDetail.VehicleNumber',
      isFilterable: true,
      searchFieldName: 'Transaction.VehicleDetail.VehicleNumber',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Brand',
      fieldName: 'BrandName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.VehicleDetail.BrandName',
      isFilterable: true,
      searchFieldName: 'Transaction.VehicleDetail.BrandName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Model',
      fieldName: 'ModelName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.VehicleDetail.ModelName',
      isFilterable: true,
      searchFieldName: 'Transaction.VehicleDetail.ModelName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Sub Model',
      fieldName: 'SubModelName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.VehicleDetail.SubModelName',
      isFilterable: true,
      searchFieldName: 'Transaction.VehicleDetail.SubModelName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
  ]

  constructor(
    private _fb: FormBuilder,
    private _MasterListService: MasterListService,
    private _column: ColumnSearchService,
    private _dataService: HttpService,
    private _datePipe: DatePipe,
    private _alertservice: AlertsService,
  ) {
    this._fillMasterList();
    this.destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [
      { field: 'IssueDate', direction: 'desc' },
    ];
    this.ReportData = new BehaviorSubject(null);
    this.ReportData$ = this.ReportData.asObservable();
  }

   // get Policy period
    get displayedPolicyPeriod() {
      return DisplayedPolicyPeriod;
    }

  // #endregion constructor

  ngOnInit(): void { 
    this.MISReportForm = this._initForm();

    this._onFormChange()
  }

  ngOnDestroy(): void {
    // Resets the filters.
    this.destroy$.next(null);
    this.destroy$.complete();
    this.pagefilters.currentPage = 1;
    this.pagefilters.limit = 20;

    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [];
  }

  // #region public methods

  sortColumn(column: string) {
    this._column.UpdateSort(column);
    this.pagefilters.currentPage = 1;
    this._loadLists();
  }

  searchColumn(value) {
    this._column.UpdateFilter(value);
    this.pagefilters.currentPage = 1;
    this._loadLists();
  }
  setLimit(value) {
    this.pagefilters.limit = value;
    this._loadLists();
  }
  // pagination for next page
  nextPage() {
    this.pagefilters.currentPage = this.pagefilters.currentPage + 1;
    this._loadLists();
  }
  // pagination for prev page
  previousPage() {
    this.pagefilters.currentPage = this.pagefilters.currentPage - 1;
    this._loadLists();
  }


  // #endregion public methods

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build Main Form
  private _initForm() {
    let fg = this._fb.group({
      BranchId: [""],
      PolicyPeriod: [""],
      FromDate: [""],
      ToDate: [""],
    });

    return fg;
  }

  private _fillMasterList() {
    //  only Active master Data
    let ActiveDataRule: IFilterRule[] = [ActiveMasterDataRule];

    /**
     * Get Branch As per User Access
     */
    this._MasterListService
      .getFilteredMultiRulMasterDataList(
        API_ENDPOINTS.Branch.List + '/true',
        'Name',
        '',
        ActiveDataRule
      )
      .subscribe((res) => {
        if (res.Success) {
          this.Branchs = res.Data.Items;
          if (this.Branchs.length == 1) {
            this.MISReportForm.patchValue({ BranchId: this.Branchs[0].Id });
          }
        }
      });
  }

  private _loadLists(Export: boolean = false) {
    let listRequestBody = {
      IncludeDeleted: false,
      PaginationSpecs: {
        PaginationRequired: true,
        Page: this.pagefilters.currentPage,
        Limit: this.pagefilters.limit,
      },
      FilterConditions: this._column.FilterConditions,
      OrderBySpecs: this._column.OrderBySpecs,
      AdditionalFilters: this._column.AdditionalFilters,
      DisplayColumns: [],
    };

    if (Export) {
      this._dataService
        .exportToExcel(listRequestBody, this.MISReportApi + "/ExportExcel")
        .pipe(takeUntil(this.destroy$))
        .subscribe((blob: any) => {
          const a = document.createElement("a");
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = "MIS Report";
          a.click();
          URL.revokeObjectURL(objectUrl);
        });
    }
    else {
      this._dataService
        .getData(listRequestBody, this.MISReportApi)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (res) => {
            if (res.Success) {
              this.ReportData.next(res);
            }
          },
          (err) => { }
        );
    }
  }

  private _buildReportFilters(): IFilterRule[] {
    this._column.FilterConditions.Rules = [];

    if (this.MISReportForm.value.BranchId) {
      let ActiveMasterDataRule: IFilterRule = {
        Field: 'Transaction.Branch.Id',
        Operator: 'eq',
        Value: this.MISReportForm.value.BranchId,
      };
      this._column.FilterConditions.Rules.push(ActiveMasterDataRule);
    }

    this._column.FilterConditions.Rules.push(
      { Field: "Transaction.IssueDate", 
        Operator: "gte", 
        Value: this.MISReportForm.get("FromDate").value 
      });
    this._column.FilterConditions.Rules.push(
      { 
        Field: "Transaction.IssueDate", 
        Operator: "lte", 
        Value: this.MISReportForm.get("PolicyPeriod").value != "DateRange" ?
          this._datePipe.transform(this._currentDate, "yyyy-MM-dd")
         : this.MISReportForm.get("ToDate").value });
    return this._column.FilterConditions.Rules;
  }

  private _buildAdditionalFilters(): IAdditionalFilterObject[] {
    this._column.AdditionalFilters = [];
    

    return this._column.AdditionalFilters;
  }

  // #endregion private methods

  public generateReport(): void {
    this.MISreportValidations()
    if (this.misReportErrorAlert.length > 0) {
      this._alertservice.raiseErrors(this.misReportErrorAlert);
      return;
    }
    this.dateFormat();

    this.generated = !this.generated;
    this.submitted = !this.submitted;
    this._column.AdditionalFilters = this._buildAdditionalFilters();
    this._column.FilterConditions.Rules = this._buildReportFilters();
    this._loadLists();
  }

  public exportToExcel(): void {
    this._loadLists(true);
  }
  public backToReport() {
    this.pagefilters.currentPage = 1;
    this.pagefilters.limit = 20;
    this.generated = !this.generated;
    this.submitted = !this.submitted;
  }

   private _onFormChange() {
  
  
      this.MISReportForm.get('PolicyPeriod').valueChanges.subscribe(val => {
        let endDate = new Date(this._currentDate);
  
        this.MISReportForm.get("ToDate").patchValue(this._currentDate);
        if (val == "OneMonth") {
          endDate.setMonth(endDate.getMonth() - 1);
          this.MISReportForm.get("FromDate").patchValue(endDate);
        }
        else if (val == "ThreeMonth") {
          endDate.setMonth(endDate.getMonth() - 3);
          this.MISReportForm.get("FromDate").patchValue(endDate);
        }
        else if (val == "SixMonth") {
          endDate.setMonth(endDate.getMonth() - 6);
          this.MISReportForm.get("FromDate").patchValue(endDate);
        }
        else if (val == "OneYear") {
          endDate.setMonth(endDate.getMonth() - 12);
          this.MISReportForm.get("FromDate").patchValue(endDate);
        }
  
      });
    }

      /**
      * Start Validation part 
      */
    
      public MISreportValidations(){
        this.misReportErrorAlert = []
    
    
        if (this.MISReportForm.get('PolicyPeriod').value == "" || this.MISReportForm.get('PolicyPeriod').value == null) {
          this.misReportErrorAlert.push({
            Message: 'Select Policy Period',
            CanDismiss: false,
            AutoClose: false,
          });
        }
    
        if (this.MISReportForm.get('PolicyPeriod').value == "DateRange") {
    
          if (this.MISReportForm.get('FromDate').value == "" || this.MISReportForm.get('FromDate').value == null) {
            this.misReportErrorAlert.push({
              Message: 'From Date is required.',
              CanDismiss: false,
              AutoClose: false,
            });
          }
    
          if (this.MISReportForm.get('ToDate').value == "" || this.MISReportForm.get('ToDate').value == null) {
            this.misReportErrorAlert.push({
              Message: 'Select To Date is required.',
              CanDismiss: false,
              AutoClose: false,
            });
          }
    
          if (this.MISReportForm.get('FromDate').value != "" && this.MISReportForm.get('FromDate').value != null && this.MISReportForm.get('ToDate').value != "" && this.MISReportForm.get('ToDate').value != null) {
    
            const fromDate = new Date(this._datePipe.transform(this.MISReportForm.get('FromDate').value, 'dd-MM-yyyy'));
            const toDate = new Date(this._datePipe.transform(this.MISReportForm.get('ToDate').value, 'dd-MM-yyyy'));
    
            if (fromDate > toDate) {
              this.misReportErrorAlert.push({
                Message: `To date can not be less than From date.`,
                CanDismiss: false,
                AutoClose: false,
              })
            }
          }
        }

      }

  private dateFormat(): void {
    this.MISReportForm.patchValue({
      FromDate: this._datePipe.transform(this.MISReportForm.getRawValue().FromDate, "yyyy-MM-dd"),
      ToDate: this._datePipe.transform(this.MISReportForm.getRawValue().ToDate, "yyyy-MM-dd"),
    });
  }
}
