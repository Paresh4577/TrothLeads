import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { HttpService } from '@lib/services/http/http.service';
import { Subject, BehaviorSubject, Observable, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-vehicle-type-list',
  templateUrl: './vehicle-type-list.component.html',
  styleUrls: ['./vehicle-type-list.component.scss']
})
export class VehicleTypeListComponent implements OnInit, OnDestroy {
  // #region public variables

  title: string;
  destroy$: Subject<any>;

  VehicleTypeList: BehaviorSubject<any>;
  VehicleTypeList$: Observable<any>;

  VehicleTypeListApi: string = '';

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
  columnDef = [
    {
      head: 'Vehicle Code',
      fieldName: 'Code',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Code',
    },
    {
      head: 'Vehicle Type',
      fieldName: 'Name',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Name',
    },
    {
      head: 'Maker/Brand Name',
      fieldName: 'Code',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Code',
    },
    {
      head: 'Model',
      fieldName: 'Name',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Name',
    },
    {
      head: 'Variant',
      fieldName: 'Code',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Code',
    },
    {
      head: 'Body Type',
      fieldName: 'Name',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Name',
    },
    {
      head: 'Seating Capacity',
      fieldName: 'Code',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Code',
    },
    {
      head: 'Power',
      fieldName: 'Name',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Name',
    },
    {
      head: 'Cubic Capacity',
      fieldName: 'Code',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Code',
    },
    {
      head: 'Gross Vehicle Weight',
      fieldName: 'Name',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Name',
    },
    {
      head: 'Fuel Type',
      fieldName: 'Code',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Code',
    },
    {
      head: 'No. of Wheels',
      fieldName: 'Name',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Name',
    },
    {
      head: 'Ex. Showroom Price',
      fieldName: 'Code',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Code',
    },
    {
      head: 'Price Year',
      fieldName: 'Name',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Name',
    },
    {
      head: 'Production',
      fieldName: 'Code',
      isSearch: 'true',
      searchType: 'text',
      searchFieldName: 'Code',
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
  ];

  // #end region public variables

  /**
   * #region constructor
   * @param _route : used for getting dynamic route or id
   */

  constructor(
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _column: ColumnSearchService
  ) {
    this.destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [{ field: 'CreatedDate', direction: 'desc' }];
    this.VehicleTypeList = new BehaviorSubject(null);
    this.VehicleTypeList$ = this.VehicleTypeList.asObservable();
  }

  // #endregion constructor




  ngOnInit(): void {
    this._init();
  }

  ngOnDestroy(): void {
    // Resets the filters.
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  //#endregion

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // #region getters

 get RoutingConfig(){
  return ROUTING_PATH.Master.Transaction
}

  // #endregion getters

  sortColumn(column: string) {
    this._column.UpdateSort(column);
    this.pagefilters.currentPage = 1;
    this._loadLists();
  }

  searchColumn(value) {
    this._column.UpdateFilter(value);
    this.pagefilters.currentPage = 1
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
      .getDataList(listRequestBody, this.VehicleTypeListApi)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (res.Success) {
            this.VehicleTypeList.next(res);
          }
        },
        (err) => {
        }
      );
  }
  // #endregion private methods
}
