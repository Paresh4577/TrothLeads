import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { DialogService } from '@lib/services/dialog.service';
import { HttpService } from '@lib/services/http/http.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { IStateDto, StateDto } from '@models/dtos/core/StateDto';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { AppDataGridListDto, IFilterConditions, YesNoFormatter } from '@models/common';
import { AuthService } from '@services/auth/auth.service';
import { ROUTING_PATH } from '@config/routingPath.config';

@Component({
  selector: 'gnx-state-list',
  templateUrl: './state-list.component.html',
  styleUrls: ['./state-list.component.scss'],
})
export class StateListComponent {
  // #region public variables
  api = API_ENDPOINTS.State.Base;
  title: string;
  destroy$: Subject<any>;

  StateList: BehaviorSubject<IStateDto>;
  StateList$: Observable<any>;
  FilterConditionsRules: any[] = [];

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
      head: 'Code',
      fieldName: 'Code',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Code',
      isFilterable: true,
      searchFieldName: 'Code',
      filterType: 'text',
      width: '20%',
      minWidth: '150px',
    },
    {
      head: 'State',
      fieldName: 'Name',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Name',
      isFilterable: true,
      searchFieldName: 'Name',
      filterType: 'text',
      width: '30%',
      minWidth: '150px',
    },
    {
      head: 'Country',
      fieldName: 'CountryName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Country.Name',
      isFilterable: true,
      searchFieldName: 'Country.Name',
      filterType: 'text',
      width: '30%',
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
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Regional.StateView + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("State-get"))
        },
        {
          name: "Edit",
          tooltip: "Edit",
          icon: 'fa fa-edit',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Regional.StateEdit + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("State-update"))
        },
        {
          name: "Delete",
          tooltip: "Delete",
          icon: 'fa fa-trash',
          action: (item) => this.deleteState(item.Id),
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("State-delete"))
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
    private _alertservice: AlertsService,
    private _dialogService: DialogService,
    private _column: ColumnSearchService,
    private _router: Router,
    private _authService: AuthService,
  ) {
    this.destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [{field:'CreatedDate',direction:'desc'}];
    this.StateList = new BehaviorSubject(null);
    this.StateList$ = this.StateList.asObservable();
    this._init();
  }

  // #endregion constructor

  /**
* If User Have Access for Buy Policy then Display Add button
*/
  get canDisplayCreateBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("State-create")) {
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
    this._loadStates();
  }

  searchColumn(value) {
    this._column.UpdateFilter(value);
    this.pagefilters.currentPage = 1;
    this._loadStates();
  }

  setLimit(value) {
    this.pagefilters.limit = value;
    this._loadStates();
  }

  // pagination for next page
  nextPage() {
    this.pagefilters.currentPage = this.pagefilters.currentPage + 1;
    this._loadStates();
  }

  // pagination for prev page
  previousPage() {
    this.pagefilters.currentPage = this.pagefilters.currentPage - 1;
    this._loadStates();
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

    this._loadStates();
  }

  private _loadStates() {
    let listRequestBody = {
      IncludeDeleted: false,
      PaginationSpecs: {
        PaginationRequired: true,
        Page: this.pagefilters.currentPage,
        Limit: this.pagefilters.limit,
      },
      FilterConditions:this._column.FilterConditions,
      OrderBySpecs: this._column.OrderBySpecs,
      AdditionalFilters: this._column.AdditionalFilters,
      DisplayColumns: [],
    };

    this._dataService
      .getDataList(listRequestBody, this.api)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (res.Success) {
            this.StateList.next(res);
          }
        },
        (err) => {
        }
      );
  }

  deleteState(id) {
    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this._dataService.deleteData(id, this.api).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, 'true');
               this._loadStates();
            }
            else{
              this._alertservice.raiseErrors(res.Alerts);
            }
          });
        }
      });
  }
  // #endregion private methods
}
