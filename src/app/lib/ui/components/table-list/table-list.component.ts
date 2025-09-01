import { debounceTime, Subject, takeUntil, distinctUntilChanged } from 'rxjs';
// #region imports
import { Component, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import * as moment from 'moment';
import { GoDigitDownloadPolicyDto, IGoDigitDownloadPolicyDto } from '@models/dtos/config/GoDigit/GoDigitDownloadPolicy.Dto';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';

// #endregion imports

@Component({
  selector: 'gnx-table-list',
  templateUrl: './table-list.component.html',
  styleUrls: ['./table-list.component.scss'],
  providers: [
    DatePipe,],

})
export class TableListComponent implements OnInit, OnDestroy {
  // header and column defination
  @Input() public headArray;
  @Input() public listDataObservable;
  @Input() public pagefilters;
  // extend functionality for particular master
  @Input() public masterName;

  @Input() public isViewDisabled = false;
  @Input() public isEditDisabled = false;
  @Input() public isCancelDisabled = false;
  @Input() public isDeleteDisabled = false;
  @Input() public isDownloadDisabled = false;
  @Input() public isRoleDisabled = false;

  @Output() onDelete = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<any>();
  @Output() onAttachment = new EventEmitter<any>();
  @Output() onDownload = new EventEmitter<any>();
  @Output() onPayment = new EventEmitter<any>();
  @Output() onKYC = new EventEmitter<any>();
  @Output() onCheckKYC = new EventEmitter<any>();
  @Output() onPaymentMapping = new EventEmitter<any>();
  @Output() onSearch = new EventEmitter<any>();
  @Output() onSort = new EventEmitter<any>();
  @Output() onNext = new EventEmitter<any>();
  @Output() onPrev = new EventEmitter<any>();
  @Output() redirect = new EventEmitter<any>();
  @Output() viewRFQHealth = new EventEmitter<any>();
  @Output() convertToTransactionEntry = new EventEmitter<any>();
  @Output() convertTopUpToTransactionEntry = new EventEmitter<any>();
  @Output() onLimitChange = new EventEmitter<any>();
  @Output() onSelectedData = new EventEmitter<any>();
  @Output() onMultiSelectedData = new EventEmitter<any>();
  @Output() onBreakIn = new EventEmitter<any>();
  @Output() onKYCStatus = new EventEmitter<any>();
  @Output() onRefreshPaymentStatus = new EventEmitter<any>();

  destroyed$: Subject<boolean> = new Subject();
  searchTerm$: Subject<string> = new Subject();
  pagedData;
  selectedData: any;
  multiSelectedData: any[] = [];
  PolicyNo: string;
  CorrelationId: string;
  CustomerId: string;
  downloadApi: string = API_ENDPOINTS.Policy.base

  GoDigitDownload: IGoDigitDownloadPolicyDto

  // #region public variables

  // #endregion public variables

  /**
   * #region constructor
   */
  constructor() {
    this.searchTerm$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((res) => {
        this.ngOnInit();
      });

    this.GoDigitDownload = new GoDigitDownloadPolicyDto()
  }

  // #endregion constructor

  ngOnInit(): void {
    if (this.listDataObservable) {
      this.listDataObservable
        .pipe(takeUntil(this.destroyed$))
        .subscribe((res) => {
          this.pagedData = res;
        });
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  public get InsurerCompanyName() {
    return InsuranceCompanyName
  }

  /**
   * #region public methods
   */

  deleteButton(id: any) {
    this.onDelete.emit(id);
  }

  public cancelButton(id: any) {
    this.onCancel.emit(id);
  }

  public attachmentButton(id: any) {
    this.onAttachment.emit(id);
  }

  public redirectButton(Id) {
    this.redirect.emit(Id)
  }

  public ViewRFQHealth(objRFQ) {
    this.viewRFQHealth.emit(objRFQ)
  }

  public convertToTransactionButton(data) {
    this.convertToTransactionEntry.emit(data)
  }

  public convertTopUpToTransactionEntryButton(data) {
    this.convertTopUpToTransactionEntry.emit(data)
  }

  public download(Id) {
    this.onDownload.emit(Id);
  }

  public payment(Id) {
    this.onPayment.emit(Id)

  }

  public KYC(Id) {
    this.onKYC.emit(Id)
  }

  public breakIn(Id){
    this.onBreakIn.emit(Id);
  }

  public CheckKYCStatus(Id){
    this.onKYCStatus.emit(Id);
  }

  public refreshPaymentStatus(obj){
    this.onRefreshPaymentStatus.emit(obj);
  }

  public statusCheck(Id) {
    this.onCheckKYC.emit(Id)
  }

  public paymentMapping(Id) {
    this.onPaymentMapping.emit(Id)
  }
  sortColumns(
    fieldName: any,
    sortfieldName: any = '',
    isAdditional: boolean = false,
    head: any,
  ) {
    this.headArray.forEach(element => {
      element.isSort = false;
      if (element == head) {
        element.isSort = true;
      }
    });
    if (isAdditional && isAdditional == true) this.onSort.emit(sortfieldName);
    else this.onSort.emit(fieldName);
  }

  columnSearch(field: string, value: string, isAdditional: boolean = false) {
    this.searchTerm$.next(value);
    this.onSearch.emit({
      field: field,
      searchValue: value,
      operator: '',
      isAdditional: isAdditional,
    });
  }

  premiumamountSearch(field: string, value: string, isAdditional: boolean = false, Operator= 'eq') {
    this.searchTerm$.next(value);
    this.onSearch.emit({
      field: field,
      searchValue: value,
      operator: Operator,
      isAdditional: isAdditional,
    });
  }


  CCSearch(field: string, value: string, isAdditional: boolean = false, Operator= 'eq') {
    this.searchTerm$.next(value);
    this.onSearch.emit({
      field: field,
      searchValue: value,
      operator: Operator,
      isAdditional: isAdditional,
    });
  }


  dateColumnSearch(field: string, value: any, isAdditional: boolean = false, operator = '',searchType:string) {

    if (value.value != null) {
      value = moment(value.value).format("YYYY-MM-DD")
      this.searchTerm$.next(value);

      this.onSearch.emit({
        field: field,
        searchValue: value,
        operator: operator,
        isAdditional: isAdditional,
        searchType:searchType,
      });
    } else {
      this.searchTerm$.next('');
      this.onSearch.emit({
        field: field,
        searchValue: '',
        operator: 'eq',
        isAdditional: isAdditional,
        searchType:searchType,
      });
    }

  }

  onSearchChange($event, field: string, isAdditional: boolean = false) {
    if ($event.target.value != '-1') {
      this.searchTerm$.next($event.target.value);
      this.onSearch.emit({
        field: field,
        searchValue: $event.target.value,
        operator: 'eq',
        isAdditional: isAdditional,
      });
    } else {
      this.searchTerm$.next('');
      this.onSearch.emit({
        field: field,
        searchValue: '',
        operator: 'eq',
        isAdditional: isAdditional,
      });
    }
  }
  setLimit(value) {
    this.onLimitChange.emit(value);
  }

  valueChange(index) {
    this.selectedData = this.pagedData.Data.Items[index];
    this.onSelectedData.emit(this.selectedData);
  }

  multiSelect($event, index: any) {
    if ($event.target.checked) {
      let data = this.pagedData.Data.Items[index];
      this.multiSelectedData.push(data);
    } else {
      this.multiSelectedData.splice(this.multiSelectedData.indexOf(index), 1);
    }
    this.onMultiSelectedData.emit(this.multiSelectedData);
  }

  pagePrevious() {
    this.onPrev.emit();
  }

  pageNext() {
    this.onNext.emit();
  }
  // #endregion public methods
}
