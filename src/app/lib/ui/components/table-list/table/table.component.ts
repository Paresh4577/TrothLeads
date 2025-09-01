import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageSizeOptions } from '@config/pagination.config';
import { operator, PagedList } from '@models/common';
import * as moment from 'moment';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {

  
  @Input() public headArray: any;//for column defination
  @Input() public listDataObservable: Observable<any>;
  @Input() public masterName;

  @Output() onSearch = new EventEmitter<any>();
  @Output() onSort = new EventEmitter<any>();
  @Output() onNext = new EventEmitter<any>();
  @Output() onPrev = new EventEmitter<any>();
  @Output() onLimitChange = new EventEmitter<any>();


  pageSize: number;


  noDataMsg: BehaviorSubject<string>;
  noDataMsg$: Observable<string>;

  paginationOptions = PageSizeOptions;

  //Subjects
  destroyed$: Subject<boolean> = new Subject()
  pagedData: PagedList<any>;
  searchValue$ = new Subject<any>();

  //#region  constructor

  constructor() {
    this.noDataMsg = new BehaviorSubject('');
    this.noDataMsg$ = this.noDataMsg.asObservable();
  }

  // #endregion constructor


  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this.searchValue$.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((val) => this.onSearch.emit(val));

  }

  //On Changes

  ngOnChanges(): void {
    if (this.listDataObservable) {
      this.listDataObservable
        .pipe(
          takeUntil(this.destroyed$),
        )
        .subscribe({
          next: (res) => {
            if (res && res.Success) {
              this.pageSize = res.Data.PageSize
              this.pagedData = res;
              // if (res.Data.items.length == 0) {
              //   this.noDataMsg.next(AppMessages.noTableData);
              // }
            } else {
              // this.noDataMsg.next(AppMessages.dataFetchError);
            }
          },
          error: (err) => {
            // this.noDataMsg.next(AppMessages.dataFetchError);
            // this._alertService.handleError(err);
          }
        })
    }
  }

  //On Destroy
  ngOnDestroy(): void {
    this.destroyed$.next(true)
    this.destroyed$.complete()
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public sortColumns(fieldName: any, head) {
    this.headArray.forEach(element => {
      element.isSort = false;
      if (element == head) {
        element.isSort = true;
      }
    });
    if(fieldName){
      this.onSort.emit(fieldName)
    }
  }

  public columnSearch(field: string, value: string, operator:operator, isAdditional: boolean = false) {
    this.searchValue$.next({
      field: field,
      searchValue: value,
      operator: operator,
      isAdditional: isAdditional,
    });

  }


  public checkActionHidden(callback: (params: any) => boolean, item: any): boolean {
    if (!callback) return true;

    return callback(item);
  }


  public onSearchChange($event, field: string, isAdditional: boolean = false) {
    if ($event.target.value != '-1') {
      this.searchValue$.next({
        field: field,
        searchValue: $event.target.value,
        operator: 'eq',
        isAdditional: isAdditional,
      });
    } else {
      this.searchValue$.next({
        field: field,
        searchValue: '',
        operator: 'eq',
        isAdditional: isAdditional,
      });
    }
  }


  public dateColumnSearch(field: string, value: any, isAdditional: boolean = false, operator = '', searchType: string) {

    if (value.value != null) {
      value = moment(value.value).format("YYYY-MM-DD")
      this.searchValue$.next({
        field: field,
        searchValue: value,
        operator: operator,
        isAdditional: isAdditional,
        searchType: searchType,
      });
    } else {
      this.searchValue$.next({
        field: field,
        searchValue: '',
        operator: 'eq',
        isAdditional: isAdditional,
        searchType: searchType,
      });
    }

  }

  public pagePrevious() {
    this.onPrev.emit();
  }

  public pageNext() {
    this.onNext.emit();
  }
  public setLimit(value) {
    this.onLimitChange.emit(value);
  }

  //#endregion public-methods
}
