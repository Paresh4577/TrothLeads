import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { AppDataGridListDto, YesNoFormatter } from '@models/common';
import { ICategoryDto } from '@models/dtos/core/CategoryDto';
import { AuthService } from '@services/auth/auth.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'gnx-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent {
  // #region public variables

  title: string;
  destroy$: Subject<any>;
  CategoryList: BehaviorSubject<ICategoryDto>;
  CategoryList$: Observable<any>
  categoryApi=API_ENDPOINTS.Category.Base;

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
      head: 'Category',
      fieldName: 'Name',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Name',
      isFilterable: true,
      searchFieldName: 'Name',
      filterType: 'text',
      width: '50%',
      minWidth: '150px',
    },
    {
      head: 'Online',
      fieldName: 'Online',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Online',
      isFilterable: true,
      searchFieldName: 'Online',
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
      head: 'Offline',
      fieldName: 'Offline',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Offline',
      isFilterable: true,
      searchFieldName: 'Offline',
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
          name: "View",
          tooltip: "View",
          icon: 'fa fa-eye',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Admin.CategoryView + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Category-get"))
        },
        {
          name: "Edit",
          tooltip: "Edit",
          icon: 'fa fa-edit',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Admin.CategoryEdit + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Category-update"))
        },
        {
          name: "Delete",
          tooltip: "Delete",
          icon: 'fa fa-trash',
          action: (item) => this.deleteCategory(item.Id),
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Category-delete"))
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
    this.CategoryList = new BehaviorSubject(null);
    this.CategoryList$ = this.CategoryList.asObservable();
    this._init()
  }

  // #endregion constructor

  /**
* If User Have Access for Buy Policy then Display Add button
*/
  get canDisplayCreateBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("Category-create")) {
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
    this._loadCategorys();
  }

  searchColumn(value) {
    this._column.UpdateFilter(value);
    this.pagefilters.currentPage = 1
    this._loadCategorys();
  }

  setLimit(value) {
    this.pagefilters.limit = value
    this._loadCategorys()
  }

  // delete Category from list
  deleteCategory(id) {
    this._dialogService.confirmDialog({
      title: 'Are You Sure?',
      message: "You won't be able to revert this",
      confirmText: 'Yes, Delete!',
      cancelText: "No"
    }).subscribe(res => {
      if (res) {
        this._dataService.deleteData(id,this.categoryApi).subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message, 'true')
            this._loadCategorys();
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
    this._loadCategorys()
  }

  // pagination for prev page
  previousPage() {
    this.pagefilters.currentPage = this.pagefilters.currentPage - 1;
    this._loadCategorys()
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

    this._loadCategorys()
  }

  private _loadCategorys() {
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
      .getDataList(listRequestBody, this.categoryApi)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (res.Success) {
            this.CategoryList.next(res);
          }
        },
        (err) => {
        }
      );
  }

  // #endregion private methods

}
