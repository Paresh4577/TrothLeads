import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { DialogService } from '@lib/services/dialog.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { IUserDto } from '@models/dtos/core/userDto';
import { HttpService } from '@lib/services/http/http.service';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { AuthService } from '@services/auth/auth.service';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AppDataGridListDto, QuerySpecs, ResponseMessage, YesNoFormatter } from '@models/common';

@Component({
  selector: 'gnx-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit, OnDestroy {
  // #region public variables

  title: string;
  destroy$: Subject<any>;

  UserList: BehaviorSubject<IUserDto>;
  UserList$: Observable<any>;

  Api = API_ENDPOINTS.User.Base;

  // Default page filters
  pagefilters = {
    currentPage: 1,
    limit: 20,
    columnSearchOptions: {
      field: 'UserName',
      searchString: '',
      operator: '',
    },
    columnSortOptions: {
      orderField: 'UserName',
      orderDirection: 'asc',
    },
  };

  // Column Defination of table
  columnDef: AppDataGridListDto[] = [
    {
      head: 'FullName',
      fieldName: 'FullName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'FirstName',
      isFilterable: true,
      searchFieldName: 'FullName',
      filterType: 'text',
      isAdditional: true,
      width: '40%',
      minWidth: '150px',
    },
    {
      head: 'User Name',
      fieldName: 'UserName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'UserName',
      isFilterable: true,
      searchFieldName: 'UserName',
      filterType: 'text',
      width: '40%',
      minWidth: '150px',
    },
    {
      head: 'Mobile',
      fieldName: 'MobileNo',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'MobileNo',
      isFilterable: true,
      searchFieldName: 'MobileNo',
      filterType: 'text',
      width: '40%',
      minWidth: '150px',
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
      width: '40%',
      minWidth: '150px',
    },
    {
      head: 'Designation',
      fieldName: 'DesignationName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Designation.Name',
      isFilterable: true,
      searchFieldName: 'Designation.Name',
      filterType: 'text',
      width: '40%',
      minWidth: '150px',
    },
    {
      head: 'Reporting Manager',
      fieldName: 'ReportingManagerName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'FirstName',
      isFilterable: true,
      searchFieldName: 'ReportingManager',
      filterType: 'text',
      width: '40%',
      minWidth: '150px',
      isAdditional: true,
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
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Admin.UserView + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("User-get"))
        },
        {
          name: "Edit",
          tooltip: "Edit",
          icon: 'fa fa-edit',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Admin.UserEdit + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("User-update"))
        },
        {
          name: "Delete",
          tooltip: "Delete",
          icon: 'fa fa-trash',
          action: (item) => this.deleteUser(item.Id),
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("User-delete"))
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
    private _router: Router,
    private _authService: AuthService,
  ) {
    this.destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [{field:'CreatedDate',direction:'desc'}];
    this.UserList = new BehaviorSubject(null);
    this.UserList$ = this.UserList.asObservable();
  }

  // #endregion constructor

  ngOnInit(): void {
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


  /**
* If User Have Access for Buy Policy then Display Add button
*/
  get canDisplayCreateBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("User-create")) {
      return true;
    } else {
      return false;
    }
  }
 
  /**
* If User Have Access for Export To Excel
*/
  get canDisplayExportBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("User-export")) {
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

  searchColumn(value) {
    this._column.UpdateFilter(value);
    this.pagefilters.currentPage = 1;
    this._loadLists();
  }

  deleteUser(id) {
    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this._dataService.deleteData(id, this.Api).subscribe((res) => {
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

  public downloadMasterDataExcel(){

    let spec = new QuerySpecs()
    spec.PaginationSpecs.PaginationRequired = false;

    this._dataService.exportToExcel(spec, API_ENDPOINTS.User.Export).subscribe((blob) =>{
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
              a.download = this.title + '_master_data';
              a.click();
              URL.revokeObjectURL(objectUrl);
              }
    })
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
      .getDataList(listRequestBody, this.Api)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (res.Success) {
            this.UserList.next(res);
          }
        },
        (err) => {
        }
      );
  }
  // #endregion private methods
}
