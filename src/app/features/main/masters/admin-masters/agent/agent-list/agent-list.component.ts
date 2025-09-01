import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { AppDataGridListDto, QuerySpecs, ResponseMessage, YesNoFormatter } from '@models/common';
import { IAgentDto } from '@models/dtos/core/agent-dto';
import { AuthService } from '@services/auth/auth.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss'],
})
export class AgentListComponent implements OnInit, OnDestroy {
  // #region public variables

  title: string;
  destroy$: Subject<any>;

  AgentList: BehaviorSubject<IAgentDto>;
  AgentList$: Observable<any>;

  Api = API_ENDPOINTS.Agent.Base;

  // Default page filters
  pagefilters = {
    currentPage: 1,
    limit: 20,
    columnSearchOptions: {
      field: 'Id',
      searchString: '',
      operator: '',
    },
    columnSortOptions: {
      orderField: 'Id',
      orderDirection: 'asc',
    },
  };

  // Column Defination of table
  columnDef: AppDataGridListDto[] = [
    {
      head: 'Name',
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
      head: 'Login Id',
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
      head: 'City',
      fieldName: 'CityName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'PinCode.City.Name',
      isFilterable: true,
      searchFieldName: 'PinCode.City.Name',
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
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Admin.AgentView + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Agent-get"))
        },
        {
          name: "Edit",
          tooltip: "Edit",
          icon: 'fa fa-edit',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Admin.AgentEdit + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Agent-update"))
        },
        {
          name: "Delete",
          tooltip: "Delete",
          icon: 'fa fa-trash',
          action: (item) => this.deleteAgent(item.Id),
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Agent-delete"))
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
    this.AgentList = new BehaviorSubject(null);
    this.AgentList$ = this.AgentList.asObservable();
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

    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [];
  }


  /**
* If User Have Access for Buy Policy then Display Add button
*/
  get canDisplayCreateBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("Agent-create")) {
      return true;
    } else {
      return false;
    }
  }

  /**
* If User Have Access for Export To Excel
*/
  get canDisplayExportBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("Agent-export")) {
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

  deleteAgent(id) {
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


  public downloadMasterDataExcel() {

    let spec = new QuerySpecs()
    spec.PaginationSpecs.PaginationRequired = false;
    spec.OrderBySpecs = [{
      field: 'FirstName',
      direction: 'asc',
    }];

    this._dataService.exportToExcel(spec, API_ENDPOINTS.Agent.Export).subscribe((blob) => {
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
            this.AgentList.next(res);
          }
        },
        (err) => {
        }
      );
  }
  // #endregion private methods
}
