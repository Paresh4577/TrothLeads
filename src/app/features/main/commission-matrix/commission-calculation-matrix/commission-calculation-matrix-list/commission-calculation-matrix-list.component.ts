import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { HttpService } from '@lib/services/http/http.service';
import { AppDataGridListDto, dateFormatter, dateTimeFormatter, ResponseMessage } from '@models/common';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { CommissionMatrixService } from '../../commission-matrix.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { AuthService } from '@services/auth/auth.service';

@Component({
  selector: 'gnx-commission-calculation-matrix-list',
  templateUrl: './commission-calculation-matrix-list.component.html',
  styleUrls: ['./commission-calculation-matrix-list.component.scss']
})
export class CommissionCalculationMatrixListComponent {

  //#region public properties
 public title: string = '' // Commission Cal Matrix List page header title
 public commissionCalculationMatrixList: BehaviorSubject<any>; //Store CommissionCalMatrix list
 public commissionCalculationMatrixList$: Observable<any>;  // Observable for CommissionCalMatrix lits

  // Column Defination of table
  public columnDef: AppDataGridListDto[] = [
    {
      head: 'Category',
      fieldName: 'CategoryName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Category.Name',
      isFilterable: true,
      searchFieldName: 'Category.Name',
      filterType: 'text',
      width: '15%',
      minWidth: '150px',
    },
    {
      head: 'File Name',
      fieldName: 'FileName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'FileName',
      isFilterable: true,
      searchFieldName: 'FileName',
      filterType: 'text',
      // width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Effective Date',
      fieldName: 'EffectiveDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'EffectiveDate',
      isFilterable: true,
      searchFieldName: 'EffectiveDate',
      filterType: 'date',
      width: '15%',
      minWidth: '150px',
      valueFormatter: dateFormatter
    },
    {
      head: 'Remarks',
      fieldName: 'Description',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Description',
      isFilterable: true,
      searchFieldName: 'Description',
      filterType: 'text',
      // width: '10%',
      minWidth: '150px',
    },
    
    {
      head: 'Uploaded By',
      fieldName: 'UploadBy',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Creator.FirstName',
      isFilterable: true,
      searchFieldName: 'Creator.FirstName',
      filterType: 'text',
      // width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Uploaded On',
      fieldName: 'UploadDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'CreatedDate',
      isFilterable: true,
      searchFieldName: 'CreatedDate',
      filterType: 'date',
      width: '15%',
      minWidth: '150px',
      valueFormatter: dateTimeFormatter
    },
    {
      head: 'Actions',
      fieldName: '',
      listActions: [
        {
          name: "Download",
          tooltip: "Download",
          icon: 'fa-solid fa-download',
          action: (item) => this._downloadUploadSheet(item),
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("CommissionCalMatrix-get"))
        },
      ]
    },
  ]
  
  //#endregion


  //#region private properties
 private _destroy$: Subject<any>;
 private _api = API_ENDPOINTS.CommissionCalMatrix.Base // CommissionCalMatrix list API
  
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
//#endregion
  
  //#region constructor
  /**
   * 
   * @param _dataService 
   * @param _column 
   * @param _route 
   * @param _router 
   */
  constructor(
    private _dataService: HttpService,
    private _column: ColumnSearchService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _commissionMatrixService: CommissionMatrixService,
    private _alertservice: AlertsService,
    private _authService: AuthService,
  ) {
    this._destroy$ = new Subject();
  }

  // #endregion constructor

  /**
* If User Have Access for Buy Policy then Display Add button
*/
  get canDisplayCreateBtn(): boolean {
    if (this._authService._userProfile?.value?.AuthKeys?.includes("CommissionCalMatrix-create")) {
      return true;
    } else {
      return false;
    }
  }


  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    //Get Route Params Data
    let data = this._route.snapshot.data;
    this.title = data['title']


    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [
      {
        field: "Category.Name",
        direction: "asc"
      },
      {
      field: "CreatedDate",
      direction: "desc"
      }
    ];
    this.commissionCalculationMatrixList = new BehaviorSubject(null);
    this.commissionCalculationMatrixList$ = this.commissionCalculationMatrixList.asObservable();

    this._loadLists();

  }
  //On Destroy
  ngOnDestroy(): void {
    // Resets the filters.
    this._destroy$.next(null);
    this._destroy$.complete();
    this._column.FilterConditions.Rules = [];
    this._column.OrderBySpecs = [];
  }

  //#endregion lifecyclehooks


  //#region public methods

  // ----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // sort column
 public sortColumn(column: string) {
    this._column.UpdateSort(column);
    this._pagefilters.currentPage = 1;
    this._loadLists();
  }

  public backClick(): void {
    this._router.navigate([ROUTING_PATH.CommissionMatrix.MatrixManagement])
  }
  
  public uploadCommissionMatrix(): void {
    this._router.navigate([ROUTING_PATH.CommissionMatrix.CommissionCalculationMatrixModuleUpload])
  }

  // search
  public searchColumn(value): void {

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
  public setLimit(value): void {
    this._pagefilters.limit = value;
    this._loadLists();
  }

  // pagination for next page
  public nextPage(): void {
    this._pagefilters.currentPage = this._pagefilters.currentPage + 1;
    this._loadLists();
  }

  // pagination for prev page
  public previousPage(): void {
    this._pagefilters.currentPage = this._pagefilters.currentPage - 1;
    this._loadLists();
  }

  // #endregion public methods

  // #region private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // load data from API
  private _loadLists(): void {

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
      .getDataList(listRequestBody, this._api)
      .pipe(takeUntil(this._destroy$))
      .subscribe(
        (res) => {
          if (res.Success) {
            this.commissionCalculationMatrixList.next(res);
          }
        },
        (err) => {
        }
      );

  }

  /**
* Download Commission matrix excel file category wise
*/
  private _downloadUploadSheet(item): void {

    this._commissionMatrixService.downloadUploadedCommissionMatrixFile(item.Id)
      .subscribe((blob:Blob) => {

        if (blob.type == 'application/json'){

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

        }else{
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = item.FileName;
          a.click();
          URL.revokeObjectURL(objectUrl);
        }

      })

    //   .subscribe(
    //     // {
    //     // next: 
    //     (response: Blob) => {
    //       if (response.type === 'application/json') {
    //         const reader = new FileReader();
    //         reader.onload = (event: any) => {
              
    //             const json = JSON.parse(event.target.result);
    //             // Handle the JSON response
              
    //         };
            
    //         reader.readAsText(response);
    //       } 
    //     }
    //   // }
    // );
  

  }

  // #endregion private methods

}
