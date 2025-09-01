import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { HttpService } from '@lib/services/http/http.service';
import { AppDataGridListDto, CurrencyFormatter, dateFormatter } from '@models/common';
import { AuthService } from '@services/auth/auth.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { CategoryCodeEnum } from 'src/app/shared/enums';
import { EndorsementConfirmDialogComponent } from '../endorsement-confirm-dialog/endorsement-confirm-dialog.component';

@Component({
  selector: 'gnx-endorsement-transaction-list',
  templateUrl: './endorsement-transaction-list.component.html',
  styleUrls: ['./endorsement-transaction-list.component.scss'],
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

export class EndorsementTransactionListComponent {

  // #region public variables

  public title: string = 'Endorsements';
  public destroy$: Subject<any>;

  public TransactionList: BehaviorSubject<any>;
  public TransactionList$: Observable<any>;

  public TransactionListApi = API_ENDPOINTS.Transaction.Base


  // Default page filters
  public pagefilters = {
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
  public columnDef: AppDataGridListDto[] = [
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
      head: 'Customer Name',
      fieldName: 'CustomerName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'CustomerFullName',
      isFilterable: true,
      searchFieldName: 'CustomerFullName',
      filterType: 'text',
      width: '10%',
      minWidth: '215px',
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
      head: 'Brand',
      fieldName: 'BrandName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.VehicleDetail.SubModel.Model.Brand.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.VehicleDetail.SubModel.Model.Brand.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Model',
      fieldName: 'ModelName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.VehicleDetail.SubModel.Model.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.VehicleDetail.SubModel.Model.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Sub Model',
      fieldName: 'SubModelName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.VehicleDetail.SubModel.Model.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.VehicleDetail.SubModel.Model.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
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
      head: 'Actions',
      fieldName: '',
      listActions: [
        {
          name: "Convert",
          tooltip: "Convert to Endorsement",
          icon: 'fa-solid fa-sync-alt',
          action: (item) => { this._openConvertEndorsementDialog(item)  },
          hidden: () => (this._authService._userProfile?.value?.AuthKeys?.includes("OfflineTransaction-create"))
        },
      ]
    },
  ];

  // #end region public variables

  /**
   * #region constructor
   * @param _route : used for getting dynamic route or id
   */

  constructor(
    private _dataService: HttpService,
    private _column: ColumnSearchService,
    private _authService: AuthService,
    private _router: Router,
    private _datePipe: DatePipe,
    public dialog: MatDialog,
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

    // /**
    //  * Get All Active Transaction Entry
    //  */
    // let PolicyEndDate = new Date();
    // this._column.FilterConditions.Rules.push({
    //   Field: 'Transaction.EndDate',
    //   Operator: 'gte',
    //   Value: this._datePipe.transform(PolicyEndDate, 'yyyy-MM-dd HH:mm:ss')
    // });

    /**
     * Transaction List Show only those policy type like New, RollOver, Renewal-Same Company & Renewal-Change Company
     * Also Policy 
     */
    this._column.AdditionalFilters.push({
      key: 'Endorsement',
      filterValues:['true']
    });

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

  public sortColumn(column: string): void {
    this._column.UpdateSort(column);
    this.pagefilters.currentPage = 1;
    this._loadLists();
  }

  public searchColumn(value): void {
    this._column.UpdateFilter(value);
    this.pagefilters.currentPage = 1
    this._loadLists();
  }



  public setLimit(value): void {
    this.pagefilters.limit = value;
    this._loadLists();
  }
  // pagination for next page
  public nextPage(): void {
    this.pagefilters.currentPage = this.pagefilters.currentPage + 1;
    this._loadLists();
  }

  // pagination for prev page
  public previousPage():void {
    this.pagefilters.currentPage = this.pagefilters.currentPage - 1;
    this._loadLists();
  }




  // #endregion public methods

  // #region private methods

  private _init():void {
    // get dynamic title from route
    // this._route.data.subscribe((x: any) => {
    //   this.title = x.title;
    // });

    this._loadLists();
  }

  private _loadLists():void {
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

  private _openConvertEndorsementDialog(element):void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '25vw';
    dialogConfig.minWidth = '365px';
    dialogConfig.panelClass = "endorsement-confirm-dialog";

    dialogConfig.data = {
      title: 'Convert to Endorsement'
    };

    const dialogRef = this.dialog.open(EndorsementConfirmDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((res:string) => {
      if (res) {
        this._redirect(element ,res)
      }
    });
  }

  private _redirect(element, PolicyType:string):void {
    if (element && element.Id && PolicyType) {
      this._router.navigate([`/app/transaction/EndorsementTransaction/${element.Id}`], { state: { PolicyType: PolicyType } })
    }
  }
  // #endregion private methods
}
