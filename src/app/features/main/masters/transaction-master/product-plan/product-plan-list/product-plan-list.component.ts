import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { AppDataGridListDto, QuerySpecs, ResponseMessage, YesNoFormatter } from '@models/common';
import { IProductPlanDto } from '@models/dtos/core/ProductPlanDto';
import { AuthService } from '@services/auth/auth.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-product-plan-list',
  templateUrl: './product-plan-list.component.html',
  styleUrls: ['./product-plan-list.component.scss']
})
export class ProductPlanListComponent {

  title: string;

  destroy$: Subject<any>;
  ProductPlanList: BehaviorSubject<IProductPlanDto>;
  ProductPlanList$: Observable<any>;
  Api = API_ENDPOINTS.ProductPlan.Base;


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
  columnDef: AppDataGridListDto[] = [
    {
      head: 'Product Code',
      fieldName: 'ProductCode',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'ProductCode',
      isFilterable: true,
      searchFieldName: 'ProductCode',
      filterType: 'text',
      width: '20%',
      minWidth: '150px',
    },
    {
      head: 'Product/Plan Name',
      fieldName: 'Name',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Name',
      isFilterable: true,
      searchFieldName: 'Name',
      filterType: 'text',
      width: '30%',
      minWidth: '150px',
    },
    {
      head: 'Insurance Company',
      fieldName: 'InsurerShortName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Company.ShortName',
      isFilterable: true,
      searchFieldName: 'Company.ShortName',
      filterType: 'text',
      width: '30%',
      minWidth: '150px',
    },
    {
      head: 'Category',
      fieldName: 'CategoryName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'SubCategory.Category.Name',
      isFilterable: true,
      searchFieldName: 'SubCategory.Category.Name',
      filterType: 'text',
      width: '20%',
      minWidth: '150px',
    },
    {
      head: 'Sub Catetory',
      fieldName: 'SubCategoryName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'SubCategory.Name',
      isFilterable: true,
      searchFieldName: 'SubCategory.Name',
      filterType: 'text',
      width: '30%',
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
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Transaction.ProductView + '/' + item.ProductCode + '/' + item.InsurerCode]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Product-get"))
        },
        {
          name: "Edit",
          tooltip: "Edit",
          icon: 'fa fa-edit',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.Transaction.ProductEdit + '/' + item.ProductCode + '/' + item.InsurerCode]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Product-update"))
        },
        {
          name: "Delete",
          tooltip: "Delete",
          icon: 'fa fa-trash',
          action: (item) => this.deleteProduct(item),
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("Product-delete"))
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
    private _column: ColumnSearchService,
    private _dialogService: DialogService,
    private _alertservice: AlertsService,
    private _authService: AuthService,
    private _router: Router,
  ) {
    this.destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [{field:'Name',direction:'asc'}];
    this.ProductPlanList = new BehaviorSubject(null);
    this.ProductPlanList$ = this.ProductPlanList.asObservable();
    this._init();
  }

  // #endregion constructor

  /**
* If User Have Access for Buy Policy then Display Add button
*/
  get canDisplayCreateBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("Product-create")) {
      return true;
    } else {
      return false;
    }
  }

  /**
* If User Have Access for Export To Excel
*/
  get canDisplayExportBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("Product-export")) {
      return true;
    } else {
      return false;
    }
  }

  ngOnDestroy(): void {
    // Resets the filters.
    this.destroy$.next(null);
    this.destroy$.complete();

    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [];
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

  setLimit(value) {
    this.pagefilters.limit = value;
    this._loadLists();
  }

  deleteProduct(item) {
    
    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this._dataService.deleteProductData(item.ProductCode, item.InsurerCode, this.Api).subscribe((res) => {
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
      field: 'SubCategory.Category.Name',
      direction: 'asc',
    }];

    this._dataService.exportToExcel(spec, API_ENDPOINTS.ProductPlan.Export).subscribe((blob) => {
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
            this.ProductPlanList.next(res);
          }
        },
        (err) => {
        }
      );
  }
  // #endregion private methods
}
