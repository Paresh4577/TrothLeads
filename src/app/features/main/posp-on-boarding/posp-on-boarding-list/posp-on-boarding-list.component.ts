import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { HttpService } from '@lib/services/http/http.service';
import { AppDataGridListDto, dateFormatter, dateTimeFormatter } from '@models/common';
import { AuthService } from '@services/auth/auth.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-posp-on-boarding-list',
  templateUrl: './posp-on-boarding-list.component.html',
  styleUrls: ['./posp-on-boarding-list.component.scss']
})
export class PospOnBoardingListComponent {
  //#region decorator
  //#endregion decorator

  // #region public variables
  public title: string = 'POSP OnBoarding';
  public transactionList: BehaviorSubject<any>;
  public transactionList$: Observable<any>;
  public pospOnBoardingListApi = API_ENDPOINTS.PoSPOnBoarding.Base

  // Column Defination of table
  columnDef: AppDataGridListDto[] = [
    {
      head: 'Request Date',
      fieldName: 'CreatedDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'CreatedDate',
      isFilterable: true,
      searchFieldName: 'CreatedDate',
      filterType: 'date',
      width: '10%',
      minWidth: '170px',
      valueFormatter: dateTimeFormatter,
    },
    {
      head: 'Full Name',
      fieldName: 'FullName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'FirstName',
      isFilterable: true,
      searchFieldName: 'FullName',
      filterType: 'text',
      width: '25%',
      minWidth: '150px',
      isAdditional: true,
    },
    {
      head: 'Mobile No',
      fieldName: 'MobileNo',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'MobileNo',
      isFilterable: true,
      searchFieldName: 'MobileNo',
      filterType: 'text',
      width: '10%',
      minWidth: '80px',
    },
    {
      head: 'Email',
      fieldName: 'EmailId',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'EmailId',
      isFilterable: true,
      searchFieldName: 'EmailId',
      filterType: 'text',
      width: '20%',
      minWidth: '120px',
    },
    {
      head: 'City',
      fieldName: 'CityName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'PinCode.City.Name',
      isFilterable: true,
      searchFieldName: 'PinCode.City.Name',
      filterType: 'text',
      width: '20%',
      minWidth: '100px',
    },
    {
      head: 'Status',
      fieldName: 'StatusName',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Status',
      isFilterable: true,
      searchFieldName: 'Status',
      filterType: 'dropdown',
      width: '10%',
      minWidth: '80px',
      drpDataList: [
        { Text: '-- select --', Value: '-1' },
        { Text: 'Pending', Value: '0' },
        { Text: 'Completed', Value: '2' },
      ],
    },

    {
      head: 'Actions',
      fieldName: '',
      listActions: [
        {
          name: "Convert",
          tooltip: "Convert to POSP OnBoarding",
          icon: 'fa-solid fa-sync-alt',
          action: (data) => this._convertToAgent(data),
          hidden: (data) => (data.Status == 0 && this._authService._userProfile?.value?.AuthKeys?.includes("Agent-create"))
        }
      ]
    },
  ];

  // #endregion public-variables

  //#region private properties

  public _destroy$: Subject<any>;

  // Default page filters
  private _pagefilters = {
    currentPage: 1,
    limit: 20,
    columnSearchOptions: { field: 'Name', searchString: '', operator: '', },
    columnSortOptions: { orderField: 'Name', orderDirection: 'asc', },
  };
  //#endregion private-properties

  //#region constructor
  // -----------------------------------------------------------------------------------------------------
  // @ Constructor
  // -----------------------------------------------------------------------------------------------------
  constructor(
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _column: ColumnSearchService,
    private _authService: AuthService,
    private _router: Router,
  ) {
    this._destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [];
    this.transactionList = new BehaviorSubject(null);
    this.transactionList$ = this.transactionList.asObservable();
  }
  //#endregion constructor

  //#region public-getters
  // -----------------------------------------------------------------------------------------------------
  // @ Pubic Getters
  // -----------------------------------------------------------------------------------------------------

  //#endregion public-getters

  //#region life cycle hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  ngOnInit(): void {

    // get list data
    this._loadLists();
  }

  ngOnDestroy(): void {
    // Resets the filters.
    this._destroy$.next(null);
    this._destroy$.complete();
    this._column.FilterConditions.Rules = [];
    this._column.OrderBySpecs = [];
  }
  //#endregion life-cycle-hooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  sortColumn(column: string) {
    this._column.UpdateSort(column);
    this._pagefilters.currentPage = 1;
    this._loadLists();
  }

  searchColumn(value) {
    this._column.UpdateFilter(value);
    this._pagefilters.currentPage = 1
    this._loadLists();
  }

  setLimit(value) {
    this._pagefilters.limit = value;
    this._loadLists();
  }

  // pagination for next page
  nextPage() {
    this._pagefilters.currentPage = this._pagefilters.currentPage + 1;
    this._loadLists();
  }

  // pagination for prev page
  previousPage() {
    this._pagefilters.currentPage = this._pagefilters.currentPage - 1;
    this._loadLists();
  }
  //#endregion public-methods

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------
  private _loadLists() {
    let listRequestBody = {
      IncludeDeleted: false,
      PaginationSpecs: {
        PaginationRequired: true,
        Page: this._pagefilters.currentPage,
        Limit: this._pagefilters.limit,
      },
      FilterConditions: this._column.FilterConditions,
      OrderBySpecs: this._column.OrderBySpecs,
      AdditionalFilters: this._column.AdditionalFilters,
      DisplayColumns: [],
    };

    this._dataService.getDataList(listRequestBody, this.pospOnBoardingListApi).pipe(takeUntil(this._destroy$)).subscribe((res) => {
      if (res.Success) {
        this.transactionList.next(res);
      }
    }, (err) => { });
  }

  private _convertToAgent(data) {
    this._router.navigate([ROUTING_PATH.Master.Admin.ConvertAgent + "/" + data.Id])
  }
  //#endregion private-methods
}
