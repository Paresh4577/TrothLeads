import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { AppDataGridListDto, CurrencyFormatter, dateFormatter, QuerySpecs, ResponseMessage } from '@models/common';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { AuthService } from '@services/auth/auth.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { CategoryCodeEnum } from 'src/app/shared/enums';

@Component({
  selector: 'gnx-renewal-transaction-list',
  templateUrl: './renewal-transaction-list.component.html',
  styleUrls: ['./renewal-transaction-list.component.scss'],
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
export class RenewalTransactionListComponent {

  // #region public variables

  title: string = 'Renewals';
  destroy$: Subject<any>;

  TransactionList: BehaviorSubject<any>;
  TransactionList$: Observable<any>;

  TransactionListApi = API_ENDPOINTS.Transaction.Base
  public transactionExportAPI = API_ENDPOINTS.Transaction.Export


  // Default page filters
  pagefilters = {
    currentPage: 1,
    limit: 20,
    columnSearchOptions: {
      field: 'Name',
      searchString: '',
      operator: '',
    },
    columnSortOptions: {
      orderField: 'Name',
      orderDirection: 'asc',
    },
  };

  // Column Defination of table
  columnDef: AppDataGridListDto[] = [
    {
      head: 'Date of Entry',
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
      head: 'Transaction ID',
      fieldName: 'COshareTransactionNo',
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
      head: 'Sub-Category',
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
      head: 'Insurance Company',
      fieldName: 'InsurerCompanyShortName',
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
      head: 'Product/Plan Name',
      fieldName: 'InsurancePlan',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.Product.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.Product.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
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
      head: 'Group Head',
      fieldName: 'GroupHeadName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.GroupHead.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.GroupHead.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px'
    },
    {
      head: 'Customer Name',
      fieldName: 'CustomerName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'CustomerFullName',
      isFilterable: true,
      searchFieldName: 'CustomerFullName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
      isAdditional: true
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
      head: 'Policy No.',
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
      head: 'Total Premium Amount',
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
      head: 'Policy issue date',
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
      head: 'Policy Start date',
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
      head: 'Policy end date',
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
      head: 'Status',
      fieldName: 'StatusName',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.Status',
      isFilterable: true,
      searchFieldName: 'Transaction.Status',
      filterType: 'dropdown',
      width: '10%',
      minWidth: '150px',
      drpDataList: [
        { Text: '-- select --', Value: '-1' },
        { Text: 'Active', Value: '1' },
        { Text: 'Cancelled', Value: '2' },
      ],
    },

    {
      head: 'Actions',
      fieldName: '',
      listActions: [
        {
          name: "View",
          tooltip: "View",
          icon: 'fa fa-eye',
          action: (data) => { this._router.navigate([ROUTING_PATH.Master.TransactionEntry.view + '/' + data.Id]) },
          hidden: () => (this._authService._userProfile.value?.AuthKeys?.includes("OfflineTransaction-get"))
        },
        {
          name: "Convert",
          tooltip: "Convert to Transaction Entry",
          icon: 'fa-solid fa-sync-alt',
          action: (data) => this._convertToTransactionEntry(data),
          hidden: () => (this._authService._userProfile?.value?.AuthKeys?.includes("OfflineTransaction-create"))
        },
        {
          name: "ConvertRFQ",
          tooltip: "Convert to RFQ",
          icon: 'fa fa-solid fa-money-bill-transfer',
          action: (data) => { this._convertToRFQ(data) },
          hidden: () => (this._authService._userProfile.value?.AuthKeys?.includes("RFQ-create"))
        }
      ]
    },
  ];

  // #end region public variables

  /**
   * #region constructor
   * @param _route : used for getting dynamic route or id
   */

  constructor(
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _column: ColumnSearchService,
    private _authService: AuthService,
    private _router: Router,
    private _datePipe: DatePipe,
    private _alertservice: AlertsService,
  ) {
    this.destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [{ field: 'Transaction.CreatedDate', direction: 'desc' }];
    this.TransactionList = new BehaviorSubject(null);
    this.TransactionList$ = this.TransactionList.asObservable();
  }

  // #endregion constructor

  ngOnInit(): void {

    let PolicyEndDate = new Date();
    let policyEndDate30DaysBefore = PolicyEndDate.setDate(PolicyEndDate.getDate() - 30);
    let policyEndDate30DaysAfter = PolicyEndDate.setDate(PolicyEndDate.getDate() + 60);


    // /**
    //  * from system date 15 day before & 15 days after Record
    //  */
    // this._column.FilterConditions.Rules.push({
    //   Field: 'Transaction.EndDate',
    //   Operator: 'gte',
    //   Value: this._datePipe.transform(policyEndDate30DaysBefore, 'yyyy-MM-dd 00:00:00')
    // });

    // this._column.FilterConditions.Rules.push({
    //   Field: 'Transaction.EndDate',
    //   Operator: 'lte',
    //   Value: this._datePipe.transform(policyEndDate30DaysAfter, 'yyyy-MM-dd 23:59:59')
    // });

    this._column.AdditionalFilters.push({
      key: 'Renew',
      filterValues: ['true']
    });

    /**
     * Only for Motor Category Record
     */
    // this._column.FilterConditions.Rules.push({
    //   Field: 'Transaction.Category.Code',
    //   Operator: 'ni',
    //   Value: CategoryCodeEnum.Life
    // });

    /**
    * Transaction List Show only those policy type like New, RollOver, Renewal-Same Company & Renewal-Change Company
    * Also Policy 
    */
    // this._column.FilterConditions.Rules.push({
    //   Field: 'Transaction.PolicyType',
    //   Operator: 'in',
    //   Value: ['New', 'Rollover', 'Renewal-Same Company', 'Renewal-Change Company']
    // });

    this._init();
  }

  ngOnDestroy(): void {
    // Resets the filters.
    this.destroy$.next(null);
    this.destroy$.complete();
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
    this.pagefilters.currentPage = 1
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

  public exportToExcelRenewalTransaction():void {
    let transactionExportAPI = this.transactionExportAPI.replace("{PermissionBase}", 'true');

    let spec = new QuerySpecs()
    spec.PaginationSpecs.PaginationRequired = false;
    spec.OrderBySpecs = [{ field: 'Transaction.CreatedDate', direction: 'desc' }];
    spec.AdditionalFilters = [{
      key: 'Renew',
      filterValues: ['true']
    }];

    this._dataService.exportToExcel(spec, transactionExportAPI).subscribe((blob) => {
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
        a.download = this.title;
        a.click();
        URL.revokeObjectURL(objectUrl);
      }
    })
  }

  // #endregion public methods

  // #region private methods

  private _init() {
    // get dynamic title from route
    // this._route.data.subscribe((x: any) => {
    //   this.title = x.title;
    // });

    this._loadLists();
  }

  private _loadLists() {
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

    this._dataService
      .getRenewalEndorsementList(listRequestBody, this.TransactionListApi)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (res.Success) {
            this.TransactionList.next(res);
          }
        },
        (err) => {
        }
      );
  }

  private _convertToRFQ(data) {

    let categoryCode = data.CategoryCode;
    // Health
    if (categoryCode == CategoryCodeEnum.Health) {
      this._router.navigate([ROUTING_PATH.RFQ.Raise + "/RenewalRFQ/" + data.Id])
    }
    // Motor
    else if (categoryCode == CategoryCodeEnum.Motor) {
      this._router.navigate([ROUTING_PATH.RFQMotor.MotorRaise + "/RenewalRFQ/" + data.Id])
    }
    // Life
    else if (categoryCode == CategoryCodeEnum.Life) {
      this._router.navigate([ROUTING_PATH.RFQLife.LifeRaise + "/RenewalRFQ/" + data.Id])
    }
    // Travel
    else if (categoryCode == CategoryCodeEnum.Travel) {
      this._router.navigate([ROUTING_PATH.RFQTravel.TravelRaise + "/RenewalRFQ/" + data.Id])
    }
    // PA
    else if (categoryCode == CategoryCodeEnum.PA) {
      this._router.navigate([ROUTING_PATH.RFQPA.PARaise + "/RenewalRFQ/" + data.Id])
    }
    // Marine
    else if (categoryCode == CategoryCodeEnum.Marine) {
      this._router.navigate([ROUTING_PATH.RFQMarine.MarineRaise + "/RenewalRFQ/" + data.Id])
    }
    // WorkmenComp
    else if (categoryCode == CategoryCodeEnum.WorkmenComp) {
      this._router.navigate([ROUTING_PATH.RFQWC.WcRaise + "/RenewalRFQ/" + data.Id])
    }
    // Liability
    else if (categoryCode == CategoryCodeEnum.Liability) {
      this._router.navigate([ROUTING_PATH.RFQLiability.LiabilityRaise + "/RenewalRFQ/" + data.Id])
    }
    // Fire
    else if (categoryCode == CategoryCodeEnum.Fire) {
      this._router.navigate([ROUTING_PATH.RFQFire.FireRaise + "/RenewalRFQ/" + data.Id])
    }
    // Engineering
    else if (categoryCode == CategoryCodeEnum.Engineering) {
      this._router.navigate([ROUTING_PATH.RFQEngineering.EngineeringRaise + "/RenewalRFQ/" + data.Id])
    }
    // Group
    else if (categoryCode == CategoryCodeEnum.Group) {
      this._router.navigate([ROUTING_PATH.RFQGroup.GroupRaise + "/RenewalRFQ/" + data.Id])
    }
    // Miscellaneous
    else if (categoryCode == CategoryCodeEnum.Miscellaneous) {
      this._router.navigate([ROUTING_PATH.RFQMiscellaneous.MiscellaneousRaise + "/RenewalRFQ/" + data.Id])
    }
    // Package
    else if (categoryCode == CategoryCodeEnum.Package) {
      this._router.navigate([ROUTING_PATH.RFQPackage.PackageRaise + "/RenewalRFQ/" + data.Id])
    }
  }

  private _convertToTransactionEntry(data) {
    this._router.navigate([ROUTING_PATH.Master.TransactionEntry.RenewalConvert + "/" + data.Id])
  }
  // #endregion private methods
}
