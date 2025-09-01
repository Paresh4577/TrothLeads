import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { AppDataGridListDto, YesNoFormatter } from '@models/common';
import { ILanguageDto } from '@models/dtos/core/LanguageDto';
import { AuthService } from '@services/auth/auth.service';
import { Subject, BehaviorSubject, Observable, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-languages-list',
  templateUrl: './languages-list.component.html',
  styleUrls: ['./languages-list.component.scss']
})
export class LanguagesListComponent {

   // #region public variables

   title: string;

   destroy$: Subject<any>;
   LanguageList: BehaviorSubject<ILanguageDto>;
   LanguageList$: Observable<any>
   LanguageApi=API_ENDPOINTS.Language.Base

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
      head: 'Language',
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
          name: "View",
          tooltip: "View",
          icon: 'fa fa-eye',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Admin.LanguageView + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Language-get"))
        },
        {
          name: "Edit",
          tooltip: "Edit",
          icon: 'fa fa-edit',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Admin.LanguageEdit + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Language-update"))
        },
        {
          name: "Delete",
          tooltip: "Delete",
          icon: 'fa fa-trash',
          action: (item) => this.deleteLanguage(item.Id),
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Language-delete"))
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
      private _authService: AuthService,
      private _router: Router,
       ) {
     this.destroy$ = new Subject();
     this._column.FilterConditions.Rules = [];
     this._column.AdditionalFilters = [];
     this.LanguageList = new BehaviorSubject(null);
     this.LanguageList$ = this.LanguageList.asObservable();
     this._init()
   }

   // #endregion constructor

  /**
* If User Have Access for Buy Policy then Display Add button
*/
  get canDisplayCreateBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("Language-create")) {
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

   deleteLanguage(id) {
     this._dialogService.confirmDialog({
       title: 'Are You Sure?',
       message: "You won't be able to revert this",
       confirmText: 'Yes, Delete!',
       cancelText: "No"
     }).subscribe(res => {
       if (res) {
         this._dataService.deleteData(id,this.LanguageApi).subscribe((res) => {
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
       .getDataList(listRequestBody, this.LanguageApi)
       .pipe(takeUntil(this.destroy$))
       .subscribe(
         (res) => {
           if (res.Success) {
             this.LanguageList.next(res);
           }
         },
         (err) => {
         }
       );

   }

   // #endregion private methods

}
