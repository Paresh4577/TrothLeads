import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { DialogService } from '@lib/services/dialog.service';
import { HttpService } from '@lib/services/http/http.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { IRoleDto } from '@models/dtos/core/RoleDto';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { AuthService } from '@services/auth/auth.service';
import { AppDataGridListDto, YesNoFormatter } from '@models/common';
import { ROUTING_PATH } from '@config/routingPath.config';

@Component({
  selector: 'gnx-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent {
  // #region public variables

  title: string;

  destroy$: Subject<any>;
  RoleList: BehaviorSubject<IRoleDto>;
  RoleList$: Observable<any>
  roleApi=API_ENDPOINTS.Role.Base

  // Default page filters
  pagefilters = {
    currentPage: 1,
    limit: 20,
    columnSearchOptions: {
      field: 'Name',
      searchString: '',
      operator:'',
    },
    columnSortOptions: {
      orderField: 'Name',
      orderDirection: 'asc'
    }
  }

  // Column Defination of table
  columnDef: AppDataGridListDto[] = [
    {
      head: 'Role',
      fieldName: 'Name',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Name',
      isFilterable: true,
      searchFieldName: 'Name',
      filterType: 'text',
      width: '60%',
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
      width: '15%',
      minWidth: '150px',
      valueFormatter: YesNoFormatter
    },
    {
      head: 'Actions',
      fieldName: '',
      listActions: [
        {
          name: "RolePermission",
          tooltip: "Role Permission",
          icon: 'fa fa-cog',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Admin.RolePermission + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Role-update"))
        },
        {
          name: "View",
          tooltip: "View",
          icon: 'fa fa-eye',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Admin.RoleView + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Role-get"))
        },
        //REMOVE IN TI-700
        // {
        //   name: "Edit",
        //   tooltip: "Edit",
        //   icon: 'fa fa-edit',
        //   action: (item) => { this._router.navigate([ROUTING_PATH.Master.Admin.RoleEdit + '/' + item.Id]) },
        //   hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Role-update"))
        // },
        {
          name: "Delete",
          tooltip: "Delete",
          icon: 'fa fa-trash',
          action: (item) => this.deleteRole(item.Id),
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Role-delete"))
        },
      ]
    },
  ];
  // #end region public variables

  /**
   * #region constructor
   * @param _route : used for getting dynamic route or id
   */

  constructor(private _route: ActivatedRoute,
     private _dataService:HttpService,
     private _alertservice: AlertsService,
      private _dialogService: DialogService,
       private _column: ColumnSearchService,
       private _router: Router,
    private _authService: AuthService,

      ) {
    this.destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this.RoleList = new BehaviorSubject(null);
    this.RoleList$ = this.RoleList.asObservable();
    this._init()
  }

  // #endregion constructor

  /**
* If User Have Access for Buy Policy then Display Add button
*/
  get canDisplayCreateBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("Role-create")) {
      return true;
    } else {
      return false;
    }
  }
  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  sortColumn(columnFieldName: string) {
    this.pagefilters.columnSortOptions.orderField = columnFieldName
    
    if (this.pagefilters.columnSortOptions.orderDirection == 'asc') {
      this.pagefilters.columnSortOptions.orderDirection = 'desc'
      this._loadRoles()
    } else {
      this.pagefilters.columnSortOptions.orderDirection = 'asc'
      this._loadRoles()
    }
  }

  searchColumn(value) {
    this._column.UpdateFilter(value);
    this.pagefilters.currentPage = 1

    this._loadRoles();
  }

  deleteRole(id) {
    this._dialogService.confirmDialog({
      title: 'Are You Sure?',
      message: "You won't be able to revert this",
      confirmText: 'Yes, Delete!',
      cancelText: "No"
    }).subscribe(res => {
      if (res) {
        this._dataService.deleteData(id,this.roleApi).subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message, 'true')
            this._loadRoles();
          }
          else{
            this._alertservice.raiseErrors(res.Alerts);
          }
        });
      }
    })
  }

  setLimit(value) {
    this.pagefilters.limit = value;
    this._loadRoles();
  }

  // pagination for next page
  nextPage() {
    this.pagefilters.currentPage = this.pagefilters.currentPage + 1;
    this._loadRoles()
  }

  // pagination for prev page
  previousPage() {
    this.pagefilters.currentPage = this.pagefilters.currentPage - 1;
    this._loadRoles()
  }

  // #endregion public methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _init() {

    // get title from route
    this._route.data.subscribe((x: any) => {
      this.title = x.title
    })

    this._loadRoles()
  }

  private _loadRoles() {
    let listRequestBody = {
      IncludeDeleted: false,
      PaginationSpecs: {
        PaginationRequired: true,
        Page: this.pagefilters.currentPage,
        Limit: this.pagefilters.limit,
      },
      FilterConditions: this._column.FilterConditions,
      OrderBySpecs: [
        {
          Field: this.pagefilters.columnSortOptions.orderField,
          Direction: this.pagefilters.columnSortOptions.orderDirection,
        },
      ],
      AdditionalFilters: this._column.AdditionalFilters,
      DisplayColumns: [],
    };


    this._dataService
      .getDataList(listRequestBody, this.roleApi)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (res.Success) {
            this.RoleList.next(res);
          }
        },
        (err) => {
        }
      );

  }

  // #endregion private methods
}
