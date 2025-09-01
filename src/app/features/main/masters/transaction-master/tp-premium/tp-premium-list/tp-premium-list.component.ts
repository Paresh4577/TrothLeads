import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { AppDataGridListDto, CurrencyFormatter, YesNoFormatter } from '@models/common';
import { AuthService } from '@services/auth/auth.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-tp-premium-list',
  templateUrl: './tp-premium-list.component.html',
  styleUrls: ['./tp-premium-list.component.scss']
})
export class TpPremiumListComponent implements OnInit, OnDestroy {
  // #region public variables

  title: string;
  destroy$: Subject<any>;

  TpPremiumList: BehaviorSubject<any>;
  TpPremiumList$: Observable<any>;

 TpPremiumListApi = API_ENDPOINTS.TPPremium.Base;

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
      head: 'Category Name',
      fieldName: 'CategoryName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Category.Name',
      isFilterable: true,
      searchFieldName: 'Category.Name',
      filterType: 'text',
      width: '40%',
      minWidth: '150px',
    },
    {
      head: 'Sub Category Name',
      fieldName: 'SubCategoryName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'SubCategory.Name',
      isFilterable: true,
      searchFieldName: 'SubCategory.Name',
      filterType: 'text',
      width: '40%',
      minWidth: '150px',
    },
    {
      head: 'Paid Driver',
      fieldName: 'PaidDriver',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'PaidDriver',
      isFilterable: true,
      searchFieldName: 'PaidDriver',
      filterType: 'number',
      width: '40%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'Owner Driver',
      fieldName: 'OwnerDriver',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'OwnerDriver',
      isFilterable: true,
      searchFieldName: 'OwnerDriver',
      filterType: 'number',
      width: '40%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'LL Driver',
      fieldName: 'LLDriver',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'LLDriver',
      isFilterable: true,
      searchFieldName: 'LLDriver',
      filterType: 'number',
      width: '40%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'CNG',
      fieldName: 'CNG',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'CNG',
      isFilterable: true,
      searchFieldName: 'CNG',
      filterType: 'number',
      width: '40%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'Is Active?',
      fieldName: 'Status',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Status',
      isFilterable: true,
      searchFieldName: 'Status',
      filterType: 'dropdown',
      drpDataList: [
        { Text: '-- select --', Value: '-1' },
        { Text: 'Yes', Value: '1' },
        { Text: 'No', Value: '0' },
      ],
      width: '10%',
      minWidth: '150px',
      valueFormatter: YesNoFormatter
    },
    {
      head: 'Actions',
      fieldName: '',
      listActions: [
        {
          name: "View",
          tooltip: "View",
          icon: 'fa fa-eye',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Transaction.TpPremiumView + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("TPPremium-get"))
        },
        {
          name: "Edit",
          tooltip: "Edit",
          icon: 'fa fa-edit',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Transaction.TpPremiumEdit + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("TPPremium-update"))
        },
        {
          name: "Delete",
          tooltip: "Delete",
          icon: 'fa fa-trash',
          action: (item) => this.deleteTPPremium(item.Id),
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("TPPremium-delete"))
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
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _dialogService: DialogService,
    private _alertservice: AlertsService,
    private _column: ColumnSearchService,
    private _authService: AuthService,
    private _router: Router,
  ) {
    this.destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [{ field: 'Category.Name', direction: 'asc' }];
    this.TpPremiumList = new BehaviorSubject(null);
    this.TpPremiumList$ = this.TpPremiumList.asObservable();
  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init
  ngOnInit(): void {
    this._init();
  }

  ngOnDestroy(): void {
    // Resets the filters.
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  /**
* If User Have Access for Buy Policy then Display Add button
*/
  get canDisplayCreateBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("TPPremium-create")) {
      return true;
    } else {
      return false;
    }
  }

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  sortColumn(column: string) {
    this._column.UpdateSort(column);
    this.pagefilters.currentPage = 1;
    this._loadLists();
  }

  deleteTPPremium(id) {
    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this._dataService.deleteData(id, this.TpPremiumListApi).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, 'true');
              this._loadLists();
            }
            else{
              this._alertservice.raiseErrors(res.Alerts);
            }
          });
        }
      });
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

  // #endregion public methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _init() {
    // get dynamic title from route
    this._route.data.subscribe((x: any) => {
      this.title = x.title;
    });

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
      .getDataList(listRequestBody, this.TpPremiumListApi)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (res.Success) {
            this.TpPremiumList.next(res);
          }
        },
        (err) => {
        }
      );
  }
  // #endregion private methods
}
