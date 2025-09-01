import { DatePipe, Location } from '@angular/common';
import { Component } from '@angular/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { AuthService } from '@services/auth/auth.service';
import { Subject, BehaviorSubject, Observable, takeUntil } from 'rxjs';
import { AttachmentModalComponent } from '../attachment-modal/attachment-modal.component';
import { TransactionCancelDialogComponent } from '../transaction-cancel-dialog/transaction-cancel-dialog.component';
import { AppDataGridListDto, CurrencyFormatter, dateFormatter, QuerySpecs } from '@models/common';
import { ROUTING_PATH } from '@config/routingPath.config';
import { TransactionEntryService } from '../transactionentry.service';

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

  // #region public variables

  title: string = 'Transaction Entries';
  destroy$: Subject<any>;
  salesDashBoardData:any;

  TransactionList: BehaviorSubject<any>;
  TransactionList$: Observable<any>;

  TransactionListApi = API_ENDPOINTS.Transaction.CoShareWiseList
  CancelApi = API_ENDPOINTS.Transaction.Cancel
  AttachmentApi = API_ENDPOINTS.Attachment.List

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
  columnDef: AppDataGridListDto[] = []

    public DateOfEntryCol: AppDataGridListDto = {
      head: 'Date of Entry',
      fieldName: 'TransactionDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.TransactionDate',
      isFilterable: true,
      searchFieldName: 'Transaction.TransactionDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter
    }
  public TransactionIDCol: AppDataGridListDto = {
      head: 'Transaction ID',
      fieldName: 'COshareTransactionNo',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'COshareTransactionNo',
      isFilterable: true,
      searchFieldName: 'COshareTransactionNo',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    }
  public CategoryCol: AppDataGridListDto =  {
      head: 'Category',
      fieldName: 'CategoryName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.Category.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.Category.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    }
  public SubCategoryCol: AppDataGridListDto = {
      head: 'Sub-Category',
      fieldName: 'SubCategoryName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.SubCategory.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.SubCategory.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    }
  public PolicyTypeCol: AppDataGridListDto =  {
      head: 'Policy Type',
      fieldName: 'PolicyType',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.PolicyType',
      isFilterable: true,
      searchFieldName: 'Transaction.PolicyType',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    }
  public InsuranceCompanyCol: AppDataGridListDto =  {
      head: 'Insurance Company',
      fieldName: 'InsurerCompanyShortName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Company.ShortName',
      isFilterable: true,
      searchFieldName: 'Company.ShortName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    }
  public ProductPlanNameCol: AppDataGridListDto =  {
      head: 'Product/Plan Name',
      fieldName: 'InsurancePlan',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.Product.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.Product.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    }
  public VehicleNumbereCol: AppDataGridListDto =  {
      head: 'Vehicle Number',
      fieldName: 'VehicleNumber',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.VehicleDetail.VehicleNumber',
      isFilterable: true,
      searchFieldName: 'Transaction.VehicleDetail.VehicleNumber',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    }
  public GroupHeadCol: AppDataGridListDto = {
      head: 'Group Head',
      fieldName: 'GroupHeadName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.GroupHead.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.GroupHead.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px'
    }
  public CustomerNameCol: AppDataGridListDto =  {
      head: 'Customer Name',
      fieldName: 'CustomerName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'CustomerFullName',
      isFilterable: true,
      searchFieldName: 'CustomerFullName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
      isAdditional: true
    }
  public BranchCol: AppDataGridListDto = {
      head: 'Branch',
      fieldName: 'BranchName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.Branch.Name',
      isFilterable: true,
      searchFieldName: 'Transaction.Branch.Name',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    }
  public SalesPersonCol: AppDataGridListDto =   {
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
    }
  public TeamReferanceCol: AppDataGridListDto = {
      head: 'Team Referance',
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
    }
  public PolicyNoCol: AppDataGridListDto = {
      head: 'Policy No.',
      fieldName: 'PolicyNo',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.PolicyNo',
      isFilterable: true,
      searchFieldName: 'Transaction.PolicyNo',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    }

  public TotalPremiumAmountCol: AppDataGridListDto =   {
      head: 'Total Premium Amount',
      fieldName: 'CoShareTotalNetPremium',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'CoShareTotalNetPremium',
      isFilterable: true,
      searchFieldName: 'CoShareTotalNetPremium',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    }
  
  public SumInsuredCol: AppDataGridListDto =   {
      head: 'Sum Insured',
      fieldName: 'SumInsured',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.SumInsured',
      isFilterable: true,
      searchFieldName: 'Transaction.SumInsured',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    }
  
  public GrossPremiumCol: AppDataGridListDto =   {
      head: 'Gross Premium ',
      fieldName: 'TotalPolicyPremium',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.PremiumDetail.TotalPolicyPremium',
      isFilterable: true,
      searchFieldName: 'Transaction.PremiumDetail.TotalPolicyPremium',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    }

  public PolicyIssueDateCol: AppDataGridListDto =  {
      head: 'Policy issue date',
      fieldName: 'IssueDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.IssueDate',
      isFilterable: true,
      searchFieldName: 'Transaction.IssueDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter
    }
  public PolicyStartDateCol: AppDataGridListDto = {
      head: 'Policy Start date',
      fieldName: 'StartDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.StartDate',
      isFilterable: true,
      searchFieldName: 'Transaction.StartDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter
    }
  public PolicyEndDateCol: AppDataGridListDto =  {
      head: 'Policy end date',
      fieldName: 'EndDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.EndDate',
      isFilterable: true,
      searchFieldName: 'Transaction.EndDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter
    }
  public RFQNoCol: AppDataGridListDto ={
      head: 'RFQ No',
      fieldName: 'TransactionBaseRFQNo',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.TransactionRFQ.RFQNo',
      isFilterable: true,
      searchFieldName: 'Transaction.TransactionRFQ.RFQNo',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    }
  public RFQDateCol: AppDataGridListDto =  {
      head: 'RFQ Date',
      fieldName: 'TransactionBaseRFQDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.TransactionRFQ.RFQDate',
      isFilterable: true,
      searchFieldName: 'Transaction.TransactionRFQ.RFQDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter,
    }
  public StatusCol: AppDataGridListDto ={
      head: 'Status',
      fieldName: 'StatusName',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.Status',
      isFilterable: true,
      searchFieldName: 'Transaction.Status',
      filterType: 'dropdown',
      width: '10%',
      minWidth: '150px',
      drpDataList: [
        { Text: '-- select --', Value: '-1' },
        { Text: 'Active', Value: '1' },
        { Text: 'Cancelled', Value: '2' },
      ],
    }

  public ActionsCol: AppDataGridListDto = {
      head: 'Actions',
      fieldName: '',
      listActions: [
        {
          name: "View",
          tooltip: "View",
          icon: 'fa fa-eye',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.TransactionEntry.view + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("OfflineTransaction-get"))
        },
        {
          name: "Edit",
          tooltip: "Edit",
          icon: 'fa fa-edit',
          action: (item) => { this._router.navigate([ROUTING_PATH.Master.TransactionEntry.edit + '/' + item.Id]) },
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("OfflineTransaction-update"))
        },
        {
          name: "Cancel",
          tooltip: "Cancel",
          icon: 'fa-solid fa-ban',
          action: (item) => this.CancelTransaction(item),
          hidden: (item) => (item.Status != 2 && this._authService._userProfile.value?.AuthKeys?.includes("OfflineTransaction-update"))
        },
        {
          name: "Canceled",
          tooltip: "Canceled Reason",
          icon: 'fa-solid fa-ban',
          action: (item) => this.CancelTransaction(item),
          hidden: (item) => (item.Status == 2 && this._authService._userProfile.value?.AuthKeys?.includes("OfflineTransaction-update"))
        },
        {
          name: "Attachments",
          tooltip: "Attachments",
          icon: 'fa-solid fa-paperclip',
          action: (item) => this.AttachedTransaction(item),
          hidden: (item) => (this._authService._userProfile.value?.AuthKeys?.includes("OfflineTransaction-get"))
        },
      ]
    }
  // ];



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
    public dialog: MatDialog,
    private _router: Router,
    private _Location: Location,
    private _transactionEntryService: TransactionEntryService,
  ) {
    this.destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [{ field: 'Transaction.CreatedDate', direction: 'desc' }];
    this.TransactionList = new BehaviorSubject(null);
    this.TransactionList$ = this.TransactionList.asObservable();

    /**
     * Set Sales dashboard filter data & set list column 
     */
    this.salesDashBoardData = this._Location.getState();

    if (this.salesDashBoardData && this.salesDashBoardData?.salesDashboardFilterData){
      this.TransactionListApi = API_ENDPOINTS.Transaction.CoShareWiseList + '/true'
      let spec = this._getFilter()
      this._column.AdditionalFilters = spec.AdditionalFilters;

      this.columnDef = [
        this.PolicyIssueDateCol,
        this.TransactionIDCol,
        this.DateOfEntryCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CustomerNameCol,
        this.PolicyNoCol,
        this.SumInsuredCol,
        this.GrossPremiumCol,
        this.SalesPersonCol,
        this.TeamReferanceCol,
      ]
    }else{
      this.columnDef = [
        this.DateOfEntryCol,
        this.TransactionIDCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.PolicyTypeCol,
        this.InsuranceCompanyCol,
        this.ProductPlanNameCol,
        this.VehicleNumbereCol,
        this.GroupHeadCol,
        this.CustomerNameCol,
        this.BranchCol,
        this.SalesPersonCol,
        this.TeamReferanceCol,
        this.PolicyNoCol,
        this.TotalPremiumAmountCol,
        this.PolicyIssueDateCol,
        this.PolicyStartDateCol,
        this.PolicyEndDateCol,
        this.RFQNoCol,
        this.RFQDateCol,
        this.StatusCol,
        this.ActionsCol,
      ]
    }
  }

  // #endregion constructor

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
    if (this._authService._userProfile?.value?.AuthKeys?.includes("OfflineTransaction-create") 
      && !(this.salesDashBoardData && this.salesDashBoardData.salesDashboardFilterData)
    ) {
      return true;
    } else {
      return false;
    }
  }
  
  /**
* If User Have Access for Buy Policy then Display Add button
*/
  get canDisplayBackBtn(): boolean {
    if (this.salesDashBoardData && this.salesDashBoardData?.salesDashboardFilterData) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Set Page Header title as per Dashboard data click
   */
  public get PageTitle():string{
    let title = this.title;
    if (this.salesDashBoardData) {
      if (this.salesDashBoardData?.graphData?.PolicyType) {
        title = this.salesDashBoardData?.graphData?.PolicyType + ' Policy List';
      }
      else if (this.salesDashBoardData?.graphData?.CategoryCode) {
        title = this.salesDashBoardData?.graphData?.CategoryName + ' Policy List';
      }
      else if (this.salesDashBoardData?.graphData?.Month) {
        title = this.salesDashBoardData?.graphData?.MonthName + ' Policy List';
      }
    } else {
      title = this.title;
    }

    return title;
  }
  // #region public methods

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

  /**
   * Open Dialog to conform Cancel Transaction with Reason User input Field
   * @param id 
   */
  public CancelTransaction(id) {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '30vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";
    dialogConfig.panelClass = "fleet-dialog";
    dialogConfig.data = {
      TransactionObj: id
    };

    const dialogRef = this.dialog.open(TransactionCancelDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((res) => {

      if (res) {
        this._dataService.cancelData(id.Id, 2, this.CancelApi, res).subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message, 'true');
            this._loadLists();
          }
          else {
            this._alertservice.raiseErrors(res.Alerts);
          }
        });
      }

    });
  }

  public AttachedTransaction(id) {
    let api = this.AttachmentApi
    let ID = id.Id

    this._dataService.getDataById(ID, api).subscribe((res) => {
      if (res.Success) {
        let dialogConfig = new MatDialogConfig();

        dialogConfig.autoFocus = true;
        dialogConfig.disableClose = true;
        dialogConfig.minWidth = "40vw";
        dialogConfig.minHeight = "55vh";
        dialogConfig.maxHeight = "75vh";

        dialogConfig.data = {
          Documents: res.Data.Documents,
          TransactionNo: res.Data.TransactionNo
        };

        const dialogRef = this.dialog.open(AttachmentModalComponent, dialogConfig);
        // dialogRef.afterClosed().subscribe((result) => {
        // })
      }
      else {
        this._alertservice.raiseErrorAlert(res.Message);
      }
    })

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

  public backCLick(){
    this._router.navigate([ROUTING_PATH.Basic.SalesDashboard],
      {
        state: {
          salesDashboardFilterData: this.salesDashBoardData,
        }
      }
    )
  }
  // #endregion public methods

  // #region private methods

  private _init() {
    // get dynamic title from route
    // this._route.data.subscribe((x: any) => {
    //   this.title = x.title;
    // });

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

    this._transactionEntryService
      .getDataListCoShare(listRequestBody, this.TransactionListApi)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (res.Success) {
            this.TransactionList.next(res);
          }
        },
        (err) => {
        }
      );
  }


  private _getFilter(): QuerySpecs {

    let filterFormData = this.salesDashBoardData?.salesDashboardFilterData;

    let specs = new QuerySpecs();
    specs.PaginationSpecs.PaginationRequired = false;
    specs.PaginationSpecs.Limit = 50;
    specs.FilterConditions.Rules = []
    specs.AdditionalFilters = []

    specs.AdditionalFilters.push(
      { key: 'SalesDashboard', filterValues: ['true'] }
    )

    if (filterFormData.FinancialYearId) {
      specs.AdditionalFilters.push(
        { key: 'FinancialYearId', filterValues: [filterFormData.FinancialYearId.toString()] }
      )
    }

    if (this.salesDashBoardData?.graphData?.Month) {
      specs.AdditionalFilters.push(
        { key: 'Month', filterValues: [this.salesDashBoardData?.graphData?.Month] }
      )
    }
    else if (filterFormData.Month) {
      specs.AdditionalFilters.push(
        { key: 'Month', filterValues: [filterFormData.Month.toString()] }
      )
    }

    if (filterFormData.BranchId) {
      specs.AdditionalFilters.push(
        { key: 'BranchId', filterValues: [filterFormData.BranchId.toString()] }
      )
    }

    if (filterFormData.SalesPersonId) {
      specs.AdditionalFilters.push(
        { key: 'AgentOrTealLeadId', filterValues: [filterFormData.SalesPersonId.toString()] }
      )
    } else if (filterFormData.BDOId) {
      specs.AdditionalFilters.push(
        { key: 'BDOId', filterValues: [filterFormData.BDOId.toString()] }
      )
    } else if (filterFormData.BDMId) {
      specs.AdditionalFilters.push(
        { key: 'BDMId', filterValues: [filterFormData.BDMId.toString()] }
      )
    } else if (filterFormData.VerticalHeadId) {
      specs.AdditionalFilters.push(
        { key: 'VerticleHeadId', filterValues: [filterFormData.VerticalHeadId.toString()] }
      )
    }

    if (this.salesDashBoardData?.graphData?.PolicyType){
      specs.AdditionalFilters.push(
        { key: 'PolicyType', filterValues: [this.salesDashBoardData?.graphData?.PolicyType] }
      )
    }
    
    if (this.salesDashBoardData?.graphData?.CategoryCode){
      specs.AdditionalFilters.push(
        { key: 'CategoryCode', filterValues: [this.salesDashBoardData?.graphData?.CategoryCode] }
      )
    }

    return specs;
  }
  // #endregion private methods
}