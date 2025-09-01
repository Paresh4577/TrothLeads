import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { AppDataGridListDto, YesNoFormatter } from '@models/common';
import { AuthService } from '@services/auth/auth.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-fleet-list',
  templateUrl: './fleet-list.component.html',
  styleUrls: ['./fleet-list.component.scss']
})
export class FleetListComponent implements OnInit, OnDestroy {
  // #region public variables

  title: string;
  destroy$: Subject<any>;

  FleetList: BehaviorSubject<any>;
  FleetList$: Observable<any>;

  FleetListApi: string = API_ENDPOINTS.Fleet.Base;

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
      orderField: 'FleetNo',
      orderDirection: 'asc',
    },
  };



  // Column Defination of table
  columnDef: AppDataGridListDto[] = [
    {
      head: 'Fleet Business ID',
      fieldName: 'FleetNo',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'FleetNo',
      isFilterable: true,
      searchFieldName: 'FleetNo',
      filterType: 'text',
      width: '40%',
      minWidth: '150px',
    },
    {
      head: 'Customer Name',
      fieldName: 'Name',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Name',
      isFilterable: true,
      searchFieldName: 'Name',
      filterType: 'text',
      width: '40%',
      minWidth: '150px',
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
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Transaction.fleetView + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("FleetBusiness-get"))
        },
        {
          name: "Edit",
          tooltip: "Edit",
          icon: 'fa fa-edit',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Transaction.fleetEdit + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("FleetBusiness-update"))
        },
        {
          name: "Delete",
          tooltip: "Delete",
          icon: 'fa fa-trash',
          action: (item) => this._deleteFleet(item.Id),
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("FleetBusiness-delete"))
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
    private _column: ColumnSearchService,
    private _dialogService: DialogService,
    private _alertservice: AlertsService,
    private _authService: AuthService,
    private _router: Router,
  ) {
    this.destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [{ field: 'CreatedDate', direction: 'desc' }];
    this.FleetList = new BehaviorSubject(null);
    this.FleetList$ = this.FleetList.asObservable();
  }
  // #endregion constructor


  //#region lifecycle-hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

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
    if (this._authService._userProfile?.value?.AuthKeys?.includes("FleetBusiness-create")) {
      return true;
    } else {
      return false;
    }
  }
  //#endregion

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public sortColumn(column: string) {
    this._column.UpdateSort(column);
    this.pagefilters.currentPage = 1;
    this._loadLists();
  }

  public searchColumn(value) {
    this._column.UpdateFilter(value);
    this.pagefilters.currentPage = 1
    this._loadLists();
  }

  public setLimit(value) {
    this.pagefilters.limit = value;
    this._loadLists();
  }
  // pagination for next page
  public nextPage() {
    this.pagefilters.currentPage = this.pagefilters.currentPage + 1;
    this._loadLists();
  }

  // pagination for prev page
  public previousPage() {
    this.pagefilters.currentPage = this.pagefilters.currentPage - 1;
    this._loadLists();
  }

  public _deleteFleet(id) {
    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this._dataService.deleteData(id, this.FleetListApi).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, 'true');
              this._loadLists();
            }
            else {
              this._alertservice.raiseErrors(res.Alerts);
            }
          });
        }
      });
  }

  //#endregion

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
      .getDataList(listRequestBody, this.FleetListApi)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (res.Success) {
            this.FleetList.next(res);
          }
        },
        (err) => {
        }
      );
  }
  // #endregion private methods
}
