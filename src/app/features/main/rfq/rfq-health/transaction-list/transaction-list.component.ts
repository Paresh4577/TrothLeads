import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { CommonFunctionsService } from '@lib/services/common-functions.service';
import { HttpService } from '@lib/services/http/http.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { ITransactionDto } from '@models/dtos/config/RFQHealth/transaction-dto';
import { AuthService } from '@services/auth/auth.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class TransactionListComponent {

  title: string = 'Transaction List' // List Page Heading Title
  api = API_ENDPOINTS.RFQ.TransactionList // Transaction List API

  destroy$: Subject<any>;

  PolicyList: BehaviorSubject<ITransactionDto>; //  Trasaction list
  PolicyList$: Observable<any>; // Observable of Trasaction list

  pagefilters = {
    currentPage: 1,
    limit: 20,
    columnSearchOptions: {
      field: 'StartDate',
      searchString: '',
      operator: '',
    },
    columnSortOptions: {
      orderField: 'CreatedDate',
      orderDirection: 'desc',
    },
  };


  // Column Defination of table
  columnDef = [
    {
      head: 'Transaction Type',
      fieldName: 'TransactionType',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'TransactionType',
    },
    {
      head: 'Transaction No.',
      fieldName: 'TransactionNo',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'TransactionNo',
    },
    {
      head: 'Company',
      fieldName: 'InsuranceCompany',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'InsuranceCompany',
    },
    {
      head: 'Policy No.',
      fieldName: 'PolicyNo',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'PolicyNo',
    },
    {
      head: 'Sum Insured',
      fieldName: 'SumInsured',
      isSearch: 'true',
      searchType: 'dropdown',
      optionArray: this._CommonFuncService.SumInsuredArray(),
      searchFieldName: 'SumInsured',
    },
    {
      head: 'Date Of Purchase',
      fieldName: 'StartDate',
      isSearch: 'true',
      searchType: 'date',
      searchFieldName: 'StartDate',
    },
    // {
    //   head: 'Actions',
    //   fieldName: '',
    // },

  ]

  //#region constructor
  constructor(
    private _dataService: HttpService,
    private _column: ColumnSearchService,
    private authService: AuthService,
    private _CommonFuncService: CommonFunctionsService
  ) {
    this.destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [{
      field: "CreatedDate",
      direction: "desc"
    }
    ];
    this.PolicyList = new BehaviorSubject(null);
    this.PolicyList$ = this.PolicyList.asObservable();
    this.authService.userProfile$.subscribe((user: IMyProfile) => {
        if (!user?.IsAdmin) {
          this._column.FilterConditions.Rules = [{
            Field: 'CreatedBy',
            Operator: 'eq',
            Value: user?.Id,
          }];
        } else {
          this._column.FilterConditions.Rules = [];
        }

      })


      this._loadLists();
  }

  // #endregion constructor

  // #region public methods

  // sort column
  sortColumn(column: string) {
    this._column.UpdateSort(column);
    this.pagefilters.currentPage = 1;
    this._loadLists();
  }

  // search
  searchColumn(value) {
    this._column.UpdateFilter(value);
    this.pagefilters.currentPage = 1

    this._loadLists();
  }

  // change limit
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

  // #region private methods

  // load data from API
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
      .getDataList(listRequestBody, this.api)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (res.Success) {
            this.PolicyList.next(res);
          }
        },
        (err) => {
        }
      );

  }


  // #endregion private methods

}
