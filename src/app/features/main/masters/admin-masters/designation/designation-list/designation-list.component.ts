import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { DialogService } from '@lib/services/dialog.service';
import { HttpService } from '@lib/services/http/http.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { IDesignationDto } from '@models/dtos/core/DesignationDto';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { AppDataGridListDto, YesNoFormatter } from '@models/common';
import { AuthService } from '@services/auth/auth.service';
import { ROUTING_PATH } from '@config/routingPath.config';

@Component({
  selector: 'gnx-designation-list',
  templateUrl: './designation-list.component.html',
  styleUrls: ['./designation-list.component.scss']
})
export class DesignationListComponent {
// #region public variables

title: string;

  destroy$: Subject<any>;
  DesignationList: BehaviorSubject<IDesignationDto>;
DesignationList$: Observable<any>
designationApi=API_ENDPOINTS.Designation.Base

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
    orderDirection: 'asc'
  }
}

  // Column Defination of table
  columnDef: AppDataGridListDto[] = [
    {
      head: 'Designation',
      fieldName: 'Name',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Name',
      isFilterable: true,
      searchFieldName: 'Name',
      filterType: 'text',
      width: '70%',
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
      width: '20%',
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
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Admin.DesignationView + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Designation-get"))
        },
        {
          name: "Edit",
          tooltip: "Edit",
          icon: 'fa fa-edit',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Admin.DesignationEdit + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Designation-update"))
        },
        {
          name: "Delete",
          tooltip: "Delete",
          icon: 'fa fa-trash',
          action: (item) => this.deleteDesignation(item.Id),
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Designation-delete"))
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
  this._column.OrderBySpecs = [{field:'CreatedDate',direction:'desc'}];
  this.DesignationList = new BehaviorSubject(null);
  this.DesignationList$ = this.DesignationList.asObservable();
  this._init()
}

// #endregion constructor

  /**
* If User Have Access for Buy Policy then Display Add button
*/
  get canDisplayCreateBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("Designation-create")) {
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
  this._loadDesignations();
}

searchColumn(value) {
  this._column.UpdateFilter(value);
    this.pagefilters.currentPage = 1
  this._loadDesignations();
}

setLimit(value) {
  this.pagefilters.limit = value
  this._loadDesignations()
}

// delete Designation from list
deleteDesignation(id) {
  this._dialogService.confirmDialog({
    title: 'Are You Sure?',
    message: "You won't be able to revert this",
    confirmText: 'Yes, Delete!',
    cancelText: "No"
  }).subscribe(res => {
    if (res) {
      this._dataService.deleteData(id,this.designationApi).subscribe((res) => {
        if (res.Success) {
          this._alertservice.raiseSuccessAlert(res.Message, 'true')
          this._loadDesignations();
        }
        else{
          this._alertservice.raiseErrors(res.Alerts);
        }
      });
    }
  })
}

// pagination for next page
nextPage() {
  this.pagefilters.currentPage = this.pagefilters.currentPage + 1;
  this._loadDesignations()
}

// pagination for prev page
previousPage() {
  this.pagefilters.currentPage = this.pagefilters.currentPage - 1;
  this._loadDesignations()
}

// #endregion public methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

private _init() {
  // Get Title from route
  this._route.data.subscribe((x: any) => {
    this.title = x.title
  })

  this._loadDesignations()
}

private _loadDesignations() {
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
    .getDataList(listRequestBody, this.designationApi)
    .pipe(takeUntil(this.destroy$))
    .subscribe(
      (res) => {
        if (res.Success) {
          this.DesignationList.next(res);
        }
      },
      (err) => {
      }
    );

}

// #endregion private methods
}
