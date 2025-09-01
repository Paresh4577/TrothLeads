import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { IODPremiumDto } from '@models/dtos/core/ODPremiumDto';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-odpremium-list',
  templateUrl: './odpremium-list.component.html',
  styleUrls: ['./odpremium-list.component.scss']
})
export class ODPremiumListComponent {
  title: string;

  destroy$: Subject<any>;
  ODPremium: BehaviorSubject<IODPremiumDto>;
  ODPremium$: Observable<any>;
  Api = API_ENDPOINTS.ODPremium.Base

  pagefilters = {
    currentPage: 1,
    limit: 20,
    columnSearchOptions: {
      field: 'InsuranceCompanyName',
      searchString: '',
      operator: '',
    },
    columnSortOptions: {
      orderField: 'InsuranceCompanyName',
      orderDirection: 'asc',
    },
  };

  // Column Defination of table
  columnDef = [
    {
      head: 'Company Name',
      fieldName: 'InsuranceCompanyName',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'InsuranceCompany.Name',
    },
    {
      head: 'Owner Driver ',
      fieldName: 'OwnerDriver',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'OwnerDriver',
    },
    {
      head: 'Is Active?',
      fieldName: 'Status',
      isSearch: 'true',
      searchType: 'dropdown',
      optionArray: [
        { Text: '-- select --', Value: '-1' },
        { Text: 'Yes', Value: '1' },
        { Text: 'No', Value: '0' },
      ],
      searchFieldName: 'Status',
    },
    {
      head: 'Actions',
      fieldName: '',
    },
  ]

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
  ) {
    this.destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [{ field:'InsuranceCompany.Name',direction:'asc'}];
    this.ODPremium = new BehaviorSubject(null);
    this.ODPremium$ = this.ODPremium.asObservable();
    this._init();
  }

  // #endregion constructor

  // #region public methods

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

  deleteODPremium(id) {
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

  // #endregion public methods

  // #region private methods

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
            this.ODPremium.next(res);
          }
        },
        (err) => {
        }
      );
  }
  // #endregion private methods
}
