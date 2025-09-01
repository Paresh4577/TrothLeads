import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { CommonFunctionsService } from '@lib/services/common-functions.service';
import { HttpService } from '@lib/services/http/http.service';
import { CurrencyFormatterWithoutSymbol, dateFormatter } from '@models/common';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { CategoryCodeEnum } from 'src/app/shared/enums';
import { HealthPolicyStatusCode } from 'src/app/shared/enums/rfq-health';
import { RfqService } from '../../rfq.service';
import { DatePipe, Location } from '@angular/common';
import { AuthService } from '@services/auth/auth.service';

@Component({
  selector: 'gnx-package-rfq-list',
  templateUrl: './package-rfq-list.component.html',
  styleUrls: ['./package-rfq-list.component.scss']
})
export class PackageRfqListComponent {

//#region public properties
public title: string = 'Policy Register' // RFQ List page header title
public StageCode: string = ''; // for: dashboard to redirect from rfq list with stage code then "this.StageCode" variable is not null
public permissionBase: boolean = true; // for login user wise show list
public RFQList: BehaviorSubject<any>; //Store RFQ list
public RFQList$: Observable<any>;  // Observable for RFQ lits

 // Column Defination of table
public columnDef = [
   {
     head: 'Branch',
     fieldName: 'BranchName',
     oprator: 'contains',
     isSortable: true,
     sortFieldName: 'Branch.Name',
     isFilterable: true,
     searchFieldName: 'Branch.Name',
     filterType: 'text',
     width: '10%',
     minWidth: '150px',
   },
   {
     head: 'RFQ Date',
     fieldName: 'RFQDate',
     oprator: 'eq',
     isSortable: true,
     sortFieldName: 'RFQDate',
     isFilterable: true,
     searchFieldName: 'RFQDate',
     filterType: 'date',
     width: '10%',
     minWidth: '150px',
     valueFormatter: dateFormatter
   },
   {
     head: 'RFQ No.',
     fieldName: 'RFQNo',
     oprator: 'contains',
     isSortable: true,
     sortFieldName: 'RFQNo',
     isFilterable: true,
     searchFieldName: 'RFQNo',
     filterType: 'text',
     width: '10%',
     minWidth: '150px',
   },
   {
     head: 'Sub Category',
     fieldName: 'SubCategoryName',
     oprator: 'contains',
     isSortable: true,
     sortFieldName: 'SubCategory.Name',
     isFilterable: true,
     searchFieldName: 'SubCategory.Name',
     filterType: 'text',
     width: '10%',
     minWidth: '150px',
   },
   {
     head: 'Category Type',
     fieldName: 'CategoryType',
     oprator: 'contains',
     isSortable: true,
     sortFieldName: 'CategoryType',
     isFilterable: true,
     searchFieldName: 'CategoryType',
     filterType: 'text',
     width: '10%',
     minWidth: '150px',
   },
   {
     head: 'QN Date',
     fieldName: 'QNDate',
     oprator: 'eq',
     isSortable: true,
     sortFieldName: 'QNDate',
     isFilterable: true,
     searchFieldName: 'QNDate',
     filterType: 'date',
     width: '10%',
     minWidth: '150px',
     valueFormatter: dateFormatter
   },
   {
     head: 'QN No',
     fieldName: 'QNNo',
     oprator: 'contains',
     isSortable: true,
     sortFieldName: 'QNNo',
     isFilterable: true,
     searchFieldName: 'QNNo',
     filterType: 'text',
     width: '10%',
     minWidth: '150px',
   },
   {
     head: 'Sum Insured',
     fieldName: 'SumInsured',
     oprator: 'contains',
     isSortable: true,
     sortFieldName: 'SumInsured',
     isFilterable: true,
     searchFieldName: 'SumInsured',
     filterType: 'number',
     width: '10%',
     minWidth: '150px',
     isAdditional: true,
     valueFormatter: CurrencyFormatterWithoutSymbol
   },

   {
     head: 'Gross Premium',
     fieldName: 'GrossPremium',
     oprator: 'contains',
     isSortable: true,
     sortFieldName: 'GrossPremium',
     isFilterable: true,
     searchFieldName: 'GrossPremium',
     filterType: 'number',
     width: '10%',
     minWidth: '150px',
     isAdditional: true,
     valueFormatter: CurrencyFormatterWithoutSymbol
   },
   {
     head: 'Loading Premium',
     fieldName: 'LoadingPremiumAmount',
     oprator: 'contains',
     isSortable: true,
     sortFieldName: 'LoadingPremiumAmount',
     isFilterable: true,
     searchFieldName: 'LoadingPremiumAmount',
     filterType: 'number',
     width: '10%',
     minWidth: '150px',
     valueFormatter: CurrencyFormatterWithoutSymbol
   },
   {
     head: 'Paid Premium',
     fieldName: 'PremiumAmountPaid',
     oprator: 'contains',
     isSortable: true,
     sortFieldName: 'PremiumAmountPaid',
     isFilterable: true,
     searchFieldName: 'PremiumAmountPaid',
     filterType: 'number',
     width: '10%',
     minWidth: '150px',
     valueFormatter: CurrencyFormatterWithoutSymbol
   },
   {
     head: 'RFQ Stage',
     fieldName: 'StageName',
     oprator: 'eq',
     isSortable: true,
     sortFieldName: 'Stage',
     isFilterable: true,
     searchFieldName: 'Stage',
     filterType: 'dropdown',
     width: '10%',
     minWidth: '150px',
     drpDataList: this._commonFunService.healthPolicyStatus()
   },
   {
     head: 'Policy Issue Date',
     fieldName: 'PolicyIssueDate',
     oprator: 'eq',
     isSortable: true,
     sortFieldName: 'PolicyIssueDate',
     isFilterable: true,
     searchFieldName: 'PolicyIssueDate',
     filterType: 'date',
     width: '10%',
     minWidth: '150px',
     valueFormatter: dateFormatter
   },
   {
     head: 'Policy No',
     fieldName: 'PolicyNo',
     oprator: 'contains',
     isSortable: true,
     sortFieldName: 'PolicyNo',
     isFilterable: true,
     searchFieldName: 'PolicyNo',
     filterType: 'text',
     width: '10%',
     minWidth: '150px',
   },
   {
     head: 'Sales Person',
     fieldName: 'SalesPersonName',
     oprator: 'contains',
     isSortable: true,
     sortFieldName: 'SalesPersonName',
     isFilterable: true,
     searchFieldName: 'SalesPersonName',
     filterType: 'text',
     width: '10%',
     minWidth: '150px',
     isAdditional: true
   },
   {
     head: 'Team Reference',
     fieldName: 'TeamReferenceName',
     oprator: 'contains',
     isSortable: true,
     sortFieldName: 'TeamReferenceName',
     isFilterable: true,
     searchFieldName: 'TeamReferenceName',
     filterType: 'text',
     width: '10%',
     minWidth: '150px',
     isAdditional: true
   },
   {
     head: 'Actions',
     fieldName: '',
     listActions: [
       {
         name: "Attachments",
         tooltip: "Attachments",
         icon: 'fa-solid fa-paperclip',
         action: (item) => this._getRfqAttchment(item),
         hidden: (item) => (this._authService._userProfile?.value?.AuthKeys?.includes("RFQ-list"))
       },
       {
         name: "View",
         tooltip: "View Policy",
         icon: 'fa fa-eye',
         action: (item) => this._viewRFQpolicy(item),
         hidden: (item) => ((item.Stage == 'RFQTransactionEntry' || item.Stage == 'RFQTransactionEntryDone') && 
           (this._authService._userProfile?.value?.AuthKeys?.includes("RFQ-get")))
       },
     ]
   },
 ]
 
//#endregion


//#region private properties

private _pagefilters = {
  currentPage: 1,
  limit: 20,
  columnSearchOptions: {
    field: 'PolicyStartDate',
    searchString: '',
    operator: '',
  },
  columnSortOptions: {
    orderField: 'CreatedDate',
    orderDirection: 'desc',
  },
};

private _destroy$: Subject<any>;
private _api = API_ENDPOINTS.RFQ.base // RFQ list API
 

//#endregion

  //#region constructor
  constructor(
    private _dataService: HttpService,
    private _column: ColumnSearchService,
    private _commonFunService: CommonFunctionsService,
    private _router: Router,
    private _rfqService: RfqService,
    private _Location: Location,
    private _authService: AuthService,
  ) {
    this._destroy$ = new Subject();
  }

  // #endregion constructor


  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [{
      field: "CreatedDate",
      direction: "desc"
    }
    ];
    this.RFQList = new BehaviorSubject(null);
    this.RFQList$ = this.RFQList.asObservable();

    this.permissionBase = false // Get Rfq List From Side bar;

    // for get health rfq data list
    this._column.FilterConditions.Rules.push({
      Field: 'Category.Code',
      Operator: 'eq',
      Value: CategoryCodeEnum.Package,
    });

    this._loadLists();

  }

  //#endregion lifecyclehooks

  /**
* If User Have Access for Buy Policy then Display Add button
*/
  get canDisplayCreateBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("RFQ-create")) {
      return true;
    } else {
      return false;
    }
  }

  //#region public methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * sort column
   * @param column 
   */
  public sortColumn(column: string) {
    this._column.UpdateSort(column);
    this._pagefilters.currentPage = 1;
    this._loadLists();
  }

  // search
  public searchColumn(value) {

    if (value.searchType == 'date') {
      this._column.UpdateFilter(value, value.searchType);
    }
    else {
      this._column.UpdateFilter(value);
    }

    this._pagefilters.currentPage = 1

    this._loadLists();
  }

  // change limit
  public setLimit(value) {
    this._pagefilters.limit = value;
    this._loadLists();
  }

  // pagination for next page
  public nextPage() {
    this._pagefilters.currentPage = this._pagefilters.currentPage + 1;
    this._loadLists();
  }

  // pagination for prev page
  public previousPage() {
    this._pagefilters.currentPage = this._pagefilters.currentPage - 1;
    this._loadLists();
  }


  // Navigate Back location
  public backClick() {
    this._Location.back();
  }

  // back button
  public addButton() {
    this._router.navigate([ROUTING_PATH.RFQPackage.PackageRaise])
  }

  // #endregion public methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------
  // load data from API
  private _loadLists() {

    let listRequestBody = {
      IncludeDeleted: false,
      PaginationSpecs: {
        PaginationRequired: true,
        Page: this._pagefilters.currentPage,
        Limit: this._pagefilters.limit,
      },
      FilterConditions: this._column.FilterConditions,
      OrderBySpecs: this._column.OrderBySpecs,
      AdditionalFilters: this._column.AdditionalFilters,
      DisplayColumns: [],
    };

    this._dataService
      .getRFQDataList(listRequestBody, this._api, this.permissionBase)
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (res) => {
          if (res.Success) {
            this.RFQList.next(res);
          }
        },
        (err) => {
        }
      );

  }

  private _viewRFQpolicy(item) {
    if (item.Stage == HealthPolicyStatusCode.RFQTransactionEntryDone || item.Stage == HealthPolicyStatusCode.RFQTransactionEntry) {
      this._router.navigate([ROUTING_PATH.RFQPackage.PackagePolicyIssue + "/View/" + item.Id])
    }
  }

  private _getRfqAttchment(event) {
    this._rfqService.getRFQDocuments(event.Id)
  }

  // #endregion private methods

}
