import { DatePipe, Location } from '@angular/common';
import { Component } from '@angular/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { CommonFunctionsService } from '@lib/services/common-functions.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { IRFQHealthDto } from '@models/dtos/config/RFQHealth';
import { AuthService } from '@services/auth/auth.service';
import { Subject, BehaviorSubject, Observable, takeUntil } from 'rxjs';
import { CategoryCodeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { HealthPolicyStatusCode, HealthPolicyStatus } from 'src/app/shared/enums/rfq-health';
import { LifeRfqStatusCode } from 'src/app/shared/enums/rfq-life';
import { MotorPolicyStatus } from 'src/app/shared/enums/rfq-motor';
import { TravelRfqStatusCode } from 'src/app/shared/enums/rfq-travel';
import { RfqService } from '../rfq.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { RfqAttachmentPopupComponent } from '../rfq-attachment-popup/rfq-attachment-popup.component';
import { MarineRfqStatusCode } from 'src/app/shared/enums/rfq-marine';
import { AppDataGridListDto, CurrencyFormatterWithoutSymbol, dateFormatter, dateTimeFormatter, ResponseMessage, TrueYesFormatter } from '@models/common';
import { EngineeringRfqStatusCode } from 'src/app/shared/enums/rfq-engineering';
import { GroupRfqStatusCode } from 'src/app/shared/enums/rfq-group';

@Component({
  selector: 'gnx-rfq-list',
  templateUrl: './rfq-list.component.html',
  styleUrls: ['./rfq-list.component.scss'],
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
export class RfqListComponent {

  title: string = 'Policy Register' // RFQ List page header title
  StageCode: string = ''; // for: dashboard to redirect from rfq list with stage code then "this.StageCode" variable is not null
  permissionBase: boolean = true; // for login user wise show list

  ListFor = 'RFQList' // Use this variaable to pass listtype in Common table To appy conditon for Action button

  destroy$: Subject<any>;

  PolicyList: BehaviorSubject<IRFQHealthDto>; //Store RFQ list
  PolicyList$: Observable<any>;  // Observable for RFQ lits
  api = API_ENDPOINTS.RFQ.base // RFQ list API


  pagefilters = {
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

  // Column Defination of table
  columnDef = []

  /**
   *  Column Defination
   */

  public RequestDateCol: AppDataGridListDto = {
    head: 'Request Date',
    fieldName: 'RequestedDate',
    oprator: 'eq',
    isSortable: true,
    sortFieldName: 'RequestedDate',
    isFilterable: true,
    searchFieldName: 'RequestedDate',
    filterType: 'date',
    width: '10%',
    minWidth: '170px',
    valueFormatter: dateTimeFormatter,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public RequestTypeCol: AppDataGridListDto = {
    head: 'Request Type',
    fieldName: 'RFQTypeName',
    oprator: 'eq',
    isSortable: true,
    sortFieldName: 'RFQTypeName',
    isFilterable: true,
    searchFieldName: 'RequestType',
    filterType: 'dropdown',
    width: '10%',
    minWidth: '150px',
    drpDataList: this._commonFunService.RFQrequestType(),
    isAdditional: true,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public BranchCol: AppDataGridListDto = {
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
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public RFQDateCol: AppDataGridListDto = {
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
    valueFormatter: dateFormatter,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public RFQNoCol: AppDataGridListDto = {
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
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public QNDateCol: AppDataGridListDto = {
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
    valueFormatter: dateFormatter,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public QNNoCol: AppDataGridListDto = {
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
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public PolicyTypeCol: AppDataGridListDto = {
    head: 'Policy Type',
    fieldName: 'PolicyType',
    oprator: 'contains',
    isSortable: true,
    sortFieldName: 'PolicyType',
    isFilterable: true,
    searchFieldName: 'PolicyType',
    filterType: 'text',
    width: '10%',
    minWidth: '150px',
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public CategoryCol: AppDataGridListDto = {
    head: 'Category',
    fieldName: 'CategoryName',
    oprator: 'contains',
    isSortable: true,
    sortFieldName: 'Category.Name',
    isFilterable: true,
    searchFieldName: 'Category.Name',
    filterType: 'text',
    width: '10%',
    minWidth: '150px',
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }
  public SubCategoryCol: AppDataGridListDto = {
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
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public CategoryTypeCol: AppDataGridListDto = {
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
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public SalesPersonCol: AppDataGridListDto = {
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
    isAdditional: true,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public TeamReferenceCol: AppDataGridListDto = {
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
    isAdditional: true,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }
  
  public AssignNameCol: AppDataGridListDto = {
    head: 'Assign UW',
    fieldName: 'AssignName',
    oprator: 'contains',
    isSortable: false,
    sortFieldName: 'AssignUserName',
    isFilterable: true,
    searchFieldName: 'AssignUserName',
    filterType: 'text',
    width: '10%',
    minWidth: '150px',
    isAdditional: true,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public InsuranceCompanyCol: AppDataGridListDto = {
    head: 'Insurance Company',
    fieldName: 'InsuranceCompanyShortName',
    oprator: 'contains',
    isSortable: true,
    sortFieldName: 'InsuranceCompanyShortName',
    isFilterable: true,
    searchFieldName: 'InsuranceCompanyShortName',
    filterType: 'text',
    width: '10%',
    minWidth: '150px',
    isAdditional: true,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public SumInsuredCol: AppDataGridListDto = {
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
    valueFormatter: CurrencyFormatterWithoutSymbol,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public GrossPremiumCol: AppDataGridListDto = {
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
    valueFormatter: CurrencyFormatterWithoutSymbol,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public ModeofPaymentCol: AppDataGridListDto = {
    head: 'Mode of Payment',
    fieldName: 'PaymentMode',
    oprator: 'contains',
    isSortable: true,
    sortFieldName: 'PaymentMode',
    isFilterable: true,
    searchFieldName: 'PaymentMode',
    filterType: 'text',
    width: '10%',
    minWidth: '150px',
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }


  public QuerybyInsuranceCompanyCol: AppDataGridListDto = {
    head: 'Query by Insurance Company',
    fieldName: 'IsInsuredQuery',
    oprator: 'eq',
    isSortable: true,
    sortFieldName: 'IsInsuredQuery',
    isFilterable: true,
    searchFieldName: 'InsuredQuery',
    filterType: 'dropdown',
    width: '10%',
    minWidth: '150px',
    drpDataList: this._commonFunService.YesNoOption(),
    isAdditional: true,
    valueFormatter: TrueYesFormatter,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public CustomerResponseCol: AppDataGridListDto = {
    head: 'Customer Response',
    fieldName: 'IsCustomerQuery',
    oprator: 'eq',
    isSortable: true,
    sortFieldName: 'IsCustomerQuery',
    isFilterable: true,
    searchFieldName: 'CustomerQuery',
    filterType: 'dropdown',
    width: '10%',
    minWidth: '150px',
    drpDataList: this._commonFunService.YesNoOption(),
    isAdditional: true,
    valueFormatter: TrueYesFormatter,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public LoadingPremiumCol: AppDataGridListDto = {
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
    valueFormatter: CurrencyFormatterWithoutSymbol,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public TotalPaidPremiumCol: AppDataGridListDto = {
    head: 'Total Paid Premium',
    fieldName: 'PremiumAmountPaid',
    oprator: 'contains',
    isSortable: true,
    sortFieldName: 'PremiumAmountPaid',
    isFilterable: true,
    searchFieldName: 'PremiumAmountPaid',
    filterType: 'number',
    width: '10%',
    minWidth: '150px',
    valueFormatter: CurrencyFormatterWithoutSymbol,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public PolicyIssueDateCol: AppDataGridListDto = {
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
    valueFormatter: dateFormatter,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public RejectionDateCol: AppDataGridListDto = {
    head: 'Rejection Date',
    fieldName: 'RejectedDate',
    oprator: 'eq',
    isSortable: true,
    sortFieldName: 'RejectedDate',
    isFilterable: true,
    searchFieldName: 'RejectedDate',
    filterType: 'date',
    width: '10%',
    minWidth: '150px',
    valueFormatter: dateFormatter,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }
 
  public TransactionDateCol: AppDataGridListDto = {
    head: 'Transaction Date',
    fieldName: 'RFQBaseTransactionDate',
    oprator: 'eq',
    isSortable: true,
    sortFieldName: 'Transaction.TransactionDate',
    isFilterable: true,
    searchFieldName: 'Transaction.TransactionDate',
    filterType: 'date',
    width: '10%',
    minWidth: '150px',
    valueFormatter: dateFormatter,
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }
  
  public TransactionIDCol: AppDataGridListDto = {
    head: 'Transaction ID',
    fieldName: 'RFQBaseTransactionNo',
    oprator: 'contains',
    isSortable: true,
    sortFieldName: 'Transaction.TransactionNo',
    isFilterable: true,
    searchFieldName: 'Transaction.TransactionNo',
    filterType: 'text',
    width: '10%',
    minWidth: '150px',
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public RejectedStageCol: AppDataGridListDto = {
    head: 'Rejected Stage',
    fieldName: 'RejectedStageName',
    oprator: 'eq',
    isSortable: true,
    sortFieldName: 'RejectedStageName',
    isFilterable: true,
    searchFieldName: 'RejectedStage',
    filterType: 'dropdown',
    width: '10%',
    minWidth: '250px',
    drpDataList: this._commonFunService.healthPolicyStatus(),
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public ReasonforRejectionCol: AppDataGridListDto = {
    head: 'Reason for Rejection',
    fieldName: 'SendBackRejectDesc',
    oprator: 'contains',
    isSortable: true,
    sortFieldName: 'SendBackRejectDesc',
    isFilterable: true,
    searchFieldName: 'SendBackRejectDesc',
    filterType: 'text',
    width: '10%',
    minWidth: '150px',
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public RFQStageCol: AppDataGridListDto = {
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
    drpDataList: this._commonFunService.healthPolicyStatus(),
    action: (item) => this._actionFromCoulumn(item),
    hidden: (item) => this._canClickonColumn(item)
  }

  public RFQActionCol: AppDataGridListDto = {
    head: 'Actions',
    fieldName: '',
    listActions: [
      {
        name: "next",
        tooltip: "next",
        icon: 'fa-solid fa-arrow-right',
        action: (item) => this.redirect(item.Id),
        hidden: (item) => (this._canDisplayNextButton(item))
      },
      {
        name: "UW",
        tooltip: "Assign UW",
        icon: 'fa-solid fa-user-check',
        action: (item) => this._rfqUWassign(item,'assign'),
        hidden: (item) => ((item.Stage == 'RFQQNUW' && !(item?.AssignId)))
      },
      {
        name: "Convert",
        tooltip: "Convert to Transaction Entry",
        icon: 'fa-solid fa-sync-alt',
        action: (item) => this.convertToTransactionEntry(item),
        hidden: (item) => ((item.Stage == 'RFQTransactionEntry') && (this._authService._userProfile?.value?.AuthKeys?.includes("OfflineTransaction-create")))
      },
      {
        name: "ConvertTopUpPlan",
        tooltip: "Convert (Top-Up Plan) to Transaction Entry",
        icon: 'fa-solid fa-repeat',
        action: (item) => this.convertTopUpToTransactionEntry(item),
        hidden: (item) => ((item.Stage == 'RFQTransactionEntry') && (item.SubCategoryCode == 'MediclaimTopUpPlan') &&
          (this._authService._userProfile?.value?.AuthKeys?.includes("OfflineTransaction-create")))
      },
      {
        name: "Attachments",
        tooltip: "Attachments",
        icon: 'fa-solid fa-paperclip',
        action: (item) => this.GetRfwAttchment(item),
        hidden: (item) => (this._authService._userProfile?.value?.AuthKeys?.includes("RFQ-list"))
      },
      {
        name: "View",
        tooltip: "View Transaction Entry",
        icon: 'fa fa-eye',
        action: (item) => { this._router.navigate([ROUTING_PATH.Master.TransactionEntry.RFQView + '/' + item.TransactionId]) },
        hidden: (item) => ((item.Stage == 'RFQTransactionEntryDone') && (this._authService._userProfile.value?.UserType == UserTypeEnum.StandardUser) &&
          (this._authService._userProfile?.value?.AuthKeys?.includes("OfflineTransaction-get")))
      },
      {
        name: "View",
        tooltip: "View Policy",
        icon: 'fa fa-eye',
        action: (item) => this._ViewRFQpolicy(item),
        hidden: (item) => ((item.Stage == 'RFQTransactionEntry') && (this._authService._userProfile?.value?.AuthKeys?.includes("RFQ-get")))
      },
      {
        name: "View",
        tooltip: "View Raise",
        icon: 'fa fa-eye',
        action: (item) => this.ViewRFQRaised(item),
        hidden: (item) => ((item.Stage == 'RFQQNUW') && (this._authService._userProfile?.value?.AuthKeys?.includes("RFQ-get")))
      },
    ]
  }

  public TotalRFQActionCol: AppDataGridListDto = {
    head: 'Actions',
    fieldName: '',
    listActions: [
      {
        name: "Attachments",
        tooltip: "Attachments",
        icon: 'fa-solid fa-paperclip',
        action: (item) => this.GetRfwAttchment(item),
        hidden: (item) => (this._authService._userProfile?.value?.AuthKeys?.includes("RFQ-list"))

      },
      {
        name: "View",
        tooltip: "View Policy",
        icon: 'fa fa-eye',
        action: (item) => this._ViewRFQpolicy(item),
        hidden: (item) => ((item.Stage == 'RFQTransactionEntry' || item.Stage == 'RFQTransactionEntryDone') &&
          (this._authService._userProfile?.value?.AuthKeys?.includes("RFQ-get")))
      },
      {
        name: "Download",
        tooltip: "Download",
        icon: 'fa fa-download',
        action: (item) => this._downloadTotalRaiseRFQ(item),
        hidden: (item) => ((item.Stage != HealthPolicyStatusCode.RFQRaised && item.Stage != HealthPolicyStatusCode.RFQQNUW
          && (item.CategoryCode == CategoryCodeEnum.Life || item.CategoryCode == CategoryCodeEnum.Fire || item.CategoryCode == CategoryCodeEnum.Package || item.CategoryCode == CategoryCodeEnum.Engineering || item.CategoryCode == CategoryCodeEnum.Liability || item.CategoryCode == CategoryCodeEnum.Marine || item.CategoryCode == CategoryCodeEnum.Miscellaneous || item.CategoryCode == CategoryCodeEnum.WorkmenComp))
          && (this._authService._userProfile?.value?.AuthKeys?.includes("RFQ-get")))
      },
    ]
  }



  //#region constructor
  constructor(
    private _dataService: HttpService,
    private _column: ColumnSearchService,
    private _authService: AuthService,
    private _router: Router,
    private _commonFunService: CommonFunctionsService,
    private _alertservice: AlertsService,
    private _route: ActivatedRoute,
    private _rfqService: RfqService,
    public dialog: MatDialog,
    private _Location: Location,
    private _CommonFuncService: CommonFunctionsService,
  ) {
    this.destroy$ = new Subject();
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
      field: "RequestedDate",
      direction: "desc"
    }
    ];
    this.PolicyList = new BehaviorSubject(null);
    this.PolicyList$ = this.PolicyList.asObservable();


    // Route params data
    /**
     * for: dashboard to redirect from rfq list with stage code then "this.StageCode" variable is not null
     * this variable is not null then Filter with this.StageCode and get list with particular stage
     */
    let data = this._route.snapshot.params;

    this.StageCode = data['StageCode']

    this.columnDef = this._StageWiseColumnConfig(this.StageCode)

    if (this.StageCode != "" && this.StageCode != null && this.StageCode != undefined) {

      //#region  set stage wise page title
      if (this.StageCode == HealthPolicyStatusCode.RFQRaised) {
        this.title = "Raised";
      }
      else if (this.StageCode == HealthPolicyStatusCode.RFQQNUW) {
        this.title = "Quotation";
      }
      else if (this.StageCode == HealthPolicyStatusCode.RFQQNSelectionSP) {
        this.title = "Quotation selection";
      }
      else if (this.StageCode == HealthPolicyStatusCode.RFQPaymentLinkUW) {
        this.title = "Payment Link";
      }
      else if (this.StageCode == HealthPolicyStatusCode.RFQPaymentProofSP) {
        this.title = "Payment Proof";
      }
      else if (this.StageCode == HealthPolicyStatusCode.RFQProposalSubmissionUW) {
        this.title = "Proposal Submission";
      }
      else if (this.StageCode == HealthPolicyStatusCode.RFQCounterOffer) {
        this.title = "Counter Offer Page";
      }
      else if (this.StageCode == HealthPolicyStatusCode.RFQLoadingPaymentLinkUW) {
        this.title = "Loading Payment Link";
      }
      else if (this.StageCode == HealthPolicyStatusCode.RFQLoadingPaymentProofSP) {
        this.title = "Loading Payment Proof";
      }
      else if (this.StageCode == HealthPolicyStatusCode.RFQPolicyIssueUW) {
        this.title = "Policy Issue";
      }
      else if (this.StageCode == HealthPolicyStatusCode.RFQTransactionEntry) {
        this.title = " Transaction Entry - Pending";
      }
      else if (this.StageCode == HealthPolicyStatusCode.RFQTransactionEntryDone) {
        this.title = "Transaction Entry Done";
      }
      else if (this.StageCode == HealthPolicyStatusCode.RFQRejected) {
        this.title = "Rejected RFQ";
      }
      else {
        this.title = 'Policy Register' // RFQ List page header title
      }
      //#endregion

      if (this.StageCode != 'TotalRaisedRFQ') {
        this._column.FilterConditions.Rules = [{
          Field: 'Stage',
          Operator: 'eq',
          Value: this.StageCode,
        }];
      } else {
        this.title = 'Total Raised RFQ'
        this.ListFor = 'TotalRaisedRFQList'
      }

      // find index and "isSearch" column value set is "false"
      // let RowNo = this.columnDef.findIndex(x => x.searchFieldName == "Stage")
      // this.columnDef.splice(RowNo, 1);

      this.permissionBase = true; // Get Rfq List From Dashboard;
    }



    this._loadLists();

  }


  ngOnDestroy(): void {
    // Resets the filters.
    this.destroy$.next(null);
    this.destroy$.complete();
    this._column.FilterConditions.Rules = [];
    this._column.OrderBySpecs = [];
  }
  //#endregion lifecyclehooks


  // #region public methods

  // sort column
  sortColumn(column: string) {
    this._column.UpdateSort(column);
    this.pagefilters.currentPage = 1;
    this._loadLists();
  }

  public BackClick() {
    this._Location.back();
  }


  // search
  searchColumn(value) {

    if (value.searchType == 'date') {
      this._column.UpdateFilter(value, value.searchType);
    }
    else {
      this._column.UpdateFilter(value);
    }

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

  // redirect to pending form
  public redirect(Id) {
    this._dataService.getDataById(Id, this.api).subscribe((res) => {
      if (res.Success) {

        if (res.Data.CategoryCode == CategoryCodeEnum.Health) {
          // Raise RFQ
          if (res.Data.StageName == HealthPolicyStatus.RFQRaised) {

            if (this.StageCode != "" && this.StageCode != null && this.StageCode != undefined) {
              this._router.navigate([ROUTING_PATH.RFQ.Raise + Id + "?StageCode=" + this.StageCode])
            }
            else {
              this._router.navigate([ROUTING_PATH.RFQ.Raise + Id])
            }

          }

          // QN By UW
          else if (res.Data.StageName == HealthPolicyStatus.RFQQNUW) {
            this._router.navigate([ROUTING_PATH.RFQ.QNByUWPending + Id])
          }

          // QN selection(SP)
          else if (res.Data.StageName == HealthPolicyStatus.RFQQNSelectionSP) {
            this._router.navigate([ROUTING_PATH.RFQ.QNSelectionSPPending + Id])
          }

          // Payment Link(UW)
          else if (res.Data.StageName == HealthPolicyStatus.RFQPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQ.PaymetLinkPending + Id])
          }

          // Payment Proof(SP)
          else if (res.Data.StageName == HealthPolicyStatus.RFQPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQ.PaymentProofPending + Id])
          }

          // Proposal Submission(UW)
          else if (res.Data.StageName == HealthPolicyStatus.RFQProposalSubmissionUW) {
            this._router.navigate([ROUTING_PATH.RFQ.ProposalSubPending + Id])
          }

          // Counter Offer Page 
          else if (res.Data.StageName == HealthPolicyStatus.RFQCounterOffer) {
            this._router.navigate([ROUTING_PATH.RFQ.CounterOfferPending + Id])
          }

          // Loading Payment Link(UW)
          else if (res.Data.StageName == HealthPolicyStatus.RFQLoadingPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQ.LoadingPayLinkPending + Id])
          }

          // Loading Payment Proof(SP)
          else if (res.Data.StageName == HealthPolicyStatus.RFQLoadingPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQ.LoadingPayProofPending + Id])
          }

          // Policy Issue(UW)
          else if (res.Data.StageName == HealthPolicyStatus.RFQPolicyIssueUW) {
            this._router.navigate([ROUTING_PATH.RFQ.PolicyIssuePending + Id])
          }

          // Transaction Entry
          else if (res.Data.StageName == HealthPolicyStatus.RFQTransactionEntry) {
            this._router.navigate([ROUTING_PATH.RFQ.TransactionEntryPending + Id])
          }
        } else if (res.Data.CategoryCode == CategoryCodeEnum.Motor) {
          // Motor Raise RFQ
          if (res.Data.StageName == MotorPolicyStatus.RFQRaised) {
            this._router.navigate([ROUTING_PATH.RFQMotor.MotorRaise + '/' + Id]);
          }

          // Motor QN By UW
          else if (res.Data.StageName == MotorPolicyStatus.RFQQNUW) {
            this._router.navigate([ROUTING_PATH.RFQMotor.MotorQN + '/' + Id])
          }

          // Motor QN Selection (SP)
          else if (res.Data.StageName == MotorPolicyStatus.RFQQNSelectionSP) {
            this._router.navigate([ROUTING_PATH.RFQMotor.MotorQNSelection + '/' + Id])
          }

          // Motor Payment Link (UW)
          else if (res.Data.StageName == MotorPolicyStatus.RFQPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQMotor.MotorPaymentLink + '/' + Id])
          }

          // Motor Payment Proof (SP)
          else if (res.Data.StageName == MotorPolicyStatus.RFQPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQMotor.MotorPaymentProof + '/' + Id])
          }

          // Motor Proposal Submission (UW)
          else if (res.Data.StageName == MotorPolicyStatus.RFQProposalSubmissionUW) {
            this._router.navigate([ROUTING_PATH.RFQMotor.MotorProposalSubmission + '/' + Id])
          }

          // Motor Counter Offer
          else if (res.Data.StageName == MotorPolicyStatus.RFQCounterOffer) {
            this._router.navigate([ROUTING_PATH.RFQMotor.MotorCounterOffer + '/' + Id])
          }

          // Motor Loading Payment Link (UW)
          else if (res.Data.StageName == MotorPolicyStatus.RFQLoadingPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQMotor.MotorLoadingPaymentLink + '/' + Id])
          }

          // Motor Loading Payment Proof (SP)
          else if (res.Data.StageName == MotorPolicyStatus.RFQLoadingPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQMotor.MotorLoadingPaymentProof + '/' + Id])
          }

          // Motor Policy Issue (UW)
          else if (res.Data.StageName == MotorPolicyStatus.RFQPolicyIssueUW) {
            this._router.navigate([ROUTING_PATH.RFQMotor.MotorPolicyIssue + '/' + Id])
          }

          // Route Not Found
          else {
            this._alertservice.raiseErrorAlert("Route Not Found...", true);
          }

        } else if (res.Data.CategoryCode == CategoryCodeEnum.Life) {

          // Life Raise RFQ
          if (res.Data.Stage == LifeRfqStatusCode.RFQRaised) {
            this._router.navigate([ROUTING_PATH.RFQLife.LifeRaise + '/' + Id]);
          }

          // Life QN By UW
          else if (res.Data.Stage == LifeRfqStatusCode.RFQQNUW) {
            this._router.navigate([ROUTING_PATH.RFQLife.LifeQN + '/' + Id])
          }

          // Life QN Selection (SP)
          else if (res.Data.Stage == LifeRfqStatusCode.RFQQNSelectionSP) {
            this._router.navigate([ROUTING_PATH.RFQLife.LifeQNSelection + '/' + Id])
          }

          // Life Payment Link (UW)
          else if (res.Data.Stage == LifeRfqStatusCode.RFQPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQLife.LifePaymentLink + '/' + Id])
          }

          // Life Payment Proof (SP)
          else if (res.Data.Stage == LifeRfqStatusCode.RFQPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQLife.LifePaymentProof + '/' + Id])
          }

          // Life Proposal Submission (UW)
          else if (res.Data.Stage == LifeRfqStatusCode.RFQProposalSubmissionUW) {
            this._router.navigate([ROUTING_PATH.RFQLife.LifeProposalSubmission + '/' + Id])
          }

          // Life Counter Offer
          else if (res.Data.Stage == LifeRfqStatusCode.RFQCounterOffer) {
            this._router.navigate([ROUTING_PATH.RFQLife.LifeCounterOffer + '/' + Id])
          }

          // Life Loading Payment Link (UW)
          else if (res.Data.Stage == LifeRfqStatusCode.RFQLoadingPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQLife.LifeLoadingPaymentLink + '/' + Id])
          }

          // Life Loading Payment Proof (SP)
          else if (res.Data.Stage == LifeRfqStatusCode.RFQLoadingPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQLife.LifeLoadingPaymentProof + '/' + Id])
          }

          // Life Policy Issue (UW)
          else if (res.Data.Stage == LifeRfqStatusCode.RFQPolicyIssueUW) {
            this._router.navigate([ROUTING_PATH.RFQLife.LifePolicyIssue + '/' + Id])
          }

          // Route Not Found
          else {
            this._alertservice.raiseErrorAlert("Route Not Found...", true);
          }
        } else if (res.Data.CategoryCode == CategoryCodeEnum.Travel) {

          // Travel Raise RFQ
          if (res.Data.Stage == TravelRfqStatusCode.RFQRaised) {
            this._router.navigate([ROUTING_PATH.RFQTravel.TravelRaise + '/' + Id]);
          }

          // Travel QN By UW
          else if (res.Data.Stage == TravelRfqStatusCode.RFQQNUW) {
            this._router.navigate([ROUTING_PATH.RFQTravel.TravelQN + '/' + Id])
          }

          // Travel QN Selection (SP)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQQNSelectionSP) {
            this._router.navigate([ROUTING_PATH.RFQTravel.TravelQNSelection + '/' + Id])
          }

          // Travel Payment Link (UW)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQTravel.TravelPaymentLink + '/' + Id])
          }

          // Travel Payment Proof (SP)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQTravel.TravelPaymentProof + '/' + Id])
          }

          // Travel Proposal Submission (UW)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQProposalSubmissionUW) {
            this._router.navigate([ROUTING_PATH.RFQTravel.TravelProposalSubmission + '/' + Id])
          }

          // Travel Counter Offer
          else if (res.Data.Stage == TravelRfqStatusCode.RFQCounterOffer) {
            this._router.navigate([ROUTING_PATH.RFQTravel.TravelCounterOffer + '/' + Id])
          }

          // Travel Loading Payment Link (UW)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQLoadingPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQTravel.TravelLoadingPaymentLink + '/' + Id])
          }

          // Travel Loading Payment Proof (SP)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQLoadingPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQTravel.TravelLoadingPaymentProof + '/' + Id])
          }

          // Travel Policy Issue (UW)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQPolicyIssueUW) {
            this._router.navigate([ROUTING_PATH.RFQTravel.TravelPolicyIssue + '/' + Id])
          }

          // Route Not Found
          else {
            this._alertservice.raiseErrorAlert("Route Not Found...", true);
          }
        } else if (res.Data.CategoryCode == CategoryCodeEnum.WorkmenComp) {

          // Travel Raise RFQ
          if (res.Data.Stage == TravelRfqStatusCode.RFQRaised) {
            this._router.navigate([ROUTING_PATH.RFQWC.WcRaise + '/' + Id]);
          }

          // Travel QN By UW
          else if (res.Data.Stage == TravelRfqStatusCode.RFQQNUW) {
            this._router.navigate([ROUTING_PATH.RFQWC.WcQN + '/' + Id])
          }

          // Travel QN Selection (SP)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQQNSelectionSP) {
            this._router.navigate([ROUTING_PATH.RFQWC.WcQNSelection + '/' + Id])
          }

          // Travel Payment Link (UW)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQWC.WcPaymentLink + '/' + Id])
          }

          // Travel Payment Proof (SP)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQWC.WcPaymentProof + '/' + Id])
          }

          // Travel Proposal Submission (UW)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQProposalSubmissionUW) {
            this._router.navigate([ROUTING_PATH.RFQWC.WcProposalSubmission + '/' + Id])
          }

          // Travel Counter Offer
          else if (res.Data.Stage == TravelRfqStatusCode.RFQCounterOffer) {
            this._router.navigate([ROUTING_PATH.RFQWC.WcCounterOffer + '/' + Id])
          }

          // Travel Loading Payment Link (UW)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQLoadingPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQWC.WcLoadingPaymentLink + '/' + Id])
          }

          // Travel Loading Payment Proof (SP)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQLoadingPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQWC.WcLoadingPaymentProof + '/' + Id])
          }

          // Travel Policy Issue (UW)
          else if (res.Data.Stage == TravelRfqStatusCode.RFQPolicyIssueUW) {
            this._router.navigate([ROUTING_PATH.RFQWC.WcPolicyIssue + '/' + Id])
          }

          // Route Not Found
          else {
            this._alertservice.raiseErrorAlert("Route Not Found...", true);
          }
        } else if (res.Data.CategoryCode == CategoryCodeEnum.Marine) {

          // Marine Raise RFQ
          if (res.Data.Stage == MarineRfqStatusCode.RFQRaised) {
            this._router.navigate([ROUTING_PATH.RFQMarine.MarineRaise + '/' + Id]);
          }

          // Marine QN By UW
          else if (res.Data.Stage == MarineRfqStatusCode.RFQQNUW) {
            this._router.navigate([ROUTING_PATH.RFQMarine.MarineQN + '/' + Id])
          }

          // Marine QN Selection (SP)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQQNSelectionSP) {
            this._router.navigate([ROUTING_PATH.RFQMarine.MarineQNSelection + '/' + Id])
          }

          // Marine Payment Link (UW)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQMarine.MarinePaymentLink + '/' + Id])
          }

          // Marine Payment Proof (SP)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQMarine.MarinePaymentProof + '/' + Id])
          }

          // Marine Proposal Submission (UW)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQProposalSubmissionUW) {
            this._router.navigate([ROUTING_PATH.RFQMarine.MarineProposalSubmission + '/' + Id])
          }

          // Marine Counter Offer
          else if (res.Data.Stage == MarineRfqStatusCode.RFQCounterOffer) {
            this._router.navigate([ROUTING_PATH.RFQMarine.MarineCounterOffer + '/' + Id])
          }

          // Marine Loading Payment Link (UW)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQLoadingPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQMarine.MarineLoadingPaymentLink + '/' + Id])
          }

          // Marine Loading Payment Proof (SP)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQLoadingPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQMarine.MarineLoadingPaymentProof + '/' + Id])
          }

          // Marine Policy Issue (UW)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQPolicyIssueUW) {
            this._router.navigate([ROUTING_PATH.RFQMarine.MarinePolicyIssue + '/' + Id])
          }

          // Route Not Found
          else {
            this._alertservice.raiseErrorAlert("Route Not Found...", true);
          }
        } else if (res.Data.CategoryCode == CategoryCodeEnum.PA) {

          // Marine Raise RFQ
          if (res.Data.Stage == MarineRfqStatusCode.RFQRaised) {
            this._router.navigate([ROUTING_PATH.RFQPA.PARaise + '/' + Id]);
          }

          // Marine QN By UW
          else if (res.Data.Stage == MarineRfqStatusCode.RFQQNUW) {
            this._router.navigate([ROUTING_PATH.RFQPA.PAQN + '/' + Id])
          }

          // Marine QN Selection (SP)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQQNSelectionSP) {
            this._router.navigate([ROUTING_PATH.RFQPA.PAQNSelection + '/' + Id])
          }

          // Marine Payment Link (UW)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQPA.PAPaymentLink + '/' + Id])
          }

          // Marine Payment Proof (SP)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQPA.PAPaymentProof + '/' + Id])
          }

          // Marine Proposal Submission (UW)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQProposalSubmissionUW) {
            this._router.navigate([ROUTING_PATH.RFQPA.PAProposalSubmission + '/' + Id])
          }

          // Marine Counter Offer
          else if (res.Data.Stage == MarineRfqStatusCode.RFQCounterOffer) {
            this._router.navigate([ROUTING_PATH.RFQPA.PACounterOffer + '/' + Id])
          }

          // Marine Loading Payment Link (UW)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQLoadingPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQPA.PALoadingPaymentLink + '/' + Id])
          }

          // Marine Loading Payment Proof (SP)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQLoadingPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQPA.PALoadingPaymentProof + '/' + Id])
          }

          // Marine Policy Issue (UW)
          else if (res.Data.Stage == MarineRfqStatusCode.RFQPolicyIssueUW) {
            this._router.navigate([ROUTING_PATH.RFQPA.PAPolicyIssue + '/' + Id])
          }
        } else if (res.Data.CategoryCode == CategoryCodeEnum.Engineering) {

          // Engineering Raise RFQ
          if (res.Data.Stage == EngineeringRfqStatusCode.RFQRaised) {
            this._router.navigate([ROUTING_PATH.RFQEngineering.EngineeringRaise + '/' + Id]);
          }

          // Engineering QN By UW
          else if (res.Data.Stage == EngineeringRfqStatusCode.RFQQNUW) {
            this._router.navigate([ROUTING_PATH.RFQEngineering.EngineeringQN + '/' + Id])
          }

          // Engineering QN Selection (SP)
          else if (res.Data.Stage == EngineeringRfqStatusCode.RFQQNSelectionSP) {
            this._router.navigate([ROUTING_PATH.RFQEngineering.EngineeringQNSelection + '/' + Id])
          }

          // Engineering Payment Link (UW)
          else if (res.Data.Stage == EngineeringRfqStatusCode.RFQPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQEngineering.EngineeringPaymentLink + '/' + Id])
          }

          // Engineering Payment Proof (SP)
          else if (res.Data.Stage == EngineeringRfqStatusCode.RFQPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQEngineering.EngineeringPaymentProof + '/' + Id])
          }

          // Engineering Proposal Submission (UW)
          else if (res.Data.Stage == EngineeringRfqStatusCode.RFQProposalSubmissionUW) {
            this._router.navigate([ROUTING_PATH.RFQEngineering.EngineeringProposalSubmission + '/' + Id])
          }

          // Engineering Policy Issue (UW)
          else if (res.Data.Stage == EngineeringRfqStatusCode.RFQPolicyIssueUW) {
            this._router.navigate([ROUTING_PATH.RFQEngineering.EngineeringPolicyIssue + '/' + Id])
          }

          // Route Not Found
          else {
            this._alertservice.raiseErrorAlert("Route Not Found...", true);
          }
        } else if (res.Data.CategoryCode == CategoryCodeEnum.Fire) {

          // Engineering Raise RFQ
          if (res.Data.Stage == EngineeringRfqStatusCode.RFQRaised) {
            this._router.navigate([ROUTING_PATH.RFQFire.FireRaise + '/' + Id]);
          }

          // Engineering QN By UW
          else if (res.Data.Stage == EngineeringRfqStatusCode.RFQQNUW) {
            this._router.navigate([ROUTING_PATH.RFQFire.FireQN + '/' + Id])
          }

          // Engineering QN Selection (SP)
          else if (res.Data.Stage == EngineeringRfqStatusCode.RFQQNSelectionSP) {
            this._router.navigate([ROUTING_PATH.RFQFire.FireQNSelection + '/' + Id])
          }

          // Engineering Payment Link (UW)
          else if (res.Data.Stage == EngineeringRfqStatusCode.RFQPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQFire.FirePaymentLink + '/' + Id])
          }

          // Engineering Payment Proof (SP)
          else if (res.Data.Stage == EngineeringRfqStatusCode.RFQPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQFire.FirePaymentProof + '/' + Id])
          }

          // Engineering Proposal Submission (UW)
          else if (res.Data.Stage == EngineeringRfqStatusCode.RFQProposalSubmissionUW) {
            this._router.navigate([ROUTING_PATH.RFQFire.FireProposalSubmission + '/' + Id])
          }

          // Engineering Policy Issue (UW)
          else if (res.Data.Stage == EngineeringRfqStatusCode.RFQPolicyIssueUW) {
            this._router.navigate([ROUTING_PATH.RFQFire.FirePolicyIssue + '/' + Id])
          }

          // Route Not Found
          else {
            this._alertservice.raiseErrorAlert("Route Not Found...", true);
          }
        } else if (res.Data.CategoryCode == CategoryCodeEnum.Group) {

          // Group Raise RFQ
          if (res.Data.Stage == GroupRfqStatusCode.RFQRaised) {
            this._router.navigate([ROUTING_PATH.RFQGroup.GroupRaise + '/' + Id]);
          }

          // Group QN By UW
          else if (res.Data.Stage == GroupRfqStatusCode.RFQQNUW) {
            this._router.navigate([ROUTING_PATH.RFQGroup.GroupQN + '/' + Id])
          }

          // Group QN Selection (SP)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQQNSelectionSP) {
            this._router.navigate([ROUTING_PATH.RFQGroup.GroupQNSelection + '/' + Id])
          }

          // Group Payment Link (UW)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQGroup.GroupPaymentLink + '/' + Id])
          }

          // Group Payment Proof (SP)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQGroup.GroupPaymentProof + '/' + Id])
          }

          // Group Proposal Submission (UW)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQProposalSubmissionUW) {
            this._router.navigate([ROUTING_PATH.RFQGroup.GroupProposalSubmission + '/' + Id])
          }

          // Group Policy Issue (UW)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQPolicyIssueUW) {
            this._router.navigate([ROUTING_PATH.RFQGroup.GroupPolicyIssue + '/' + Id])
          }

          // Route Not Found
          else {
            this._alertservice.raiseErrorAlert("Route Not Found...", true);
          }
        } else if (res.Data.CategoryCode == CategoryCodeEnum.Miscellaneous) {

          // Miscellaneous Raise RFQ
          if (res.Data.Stage == GroupRfqStatusCode.RFQRaised) {
            this._router.navigate([ROUTING_PATH.RFQMiscellaneous.MiscellaneousRaise + '/' + Id]);
          }

          // Miscellaneous QN By UW
          else if (res.Data.Stage == GroupRfqStatusCode.RFQQNUW) {
            this._router.navigate([ROUTING_PATH.RFQMiscellaneous.MiscellaneousQN + '/' + Id])
          }

          // Miscellaneous QN Selection (SP)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQQNSelectionSP) {
            this._router.navigate([ROUTING_PATH.RFQMiscellaneous.MiscellaneousQNSelection + '/' + Id])
          }

          // Miscellaneous Payment Link (UW)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQMiscellaneous.MiscellaneousPaymentLink + '/' + Id])
          }

          // Miscellaneous Payment Proof (SP)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQMiscellaneous.MiscellaneousPaymentProof + '/' + Id])
          }

          // Miscellaneous Proposal Submission (UW)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQProposalSubmissionUW) {
            this._router.navigate([ROUTING_PATH.RFQMiscellaneous.MiscellaneousProposalSubmission + '/' + Id])
          }

          // Miscellaneous Policy Issue (UW)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQPolicyIssueUW) {
            this._router.navigate([ROUTING_PATH.RFQMiscellaneous.MiscellaneousPolicyIssue + '/' + Id])
          }

          // Route Not Found
          else {
            this._alertservice.raiseErrorAlert("Route Not Found...", true);
          }
        } else if (res.Data.CategoryCode == CategoryCodeEnum.Package) {

          // Miscellaneous Raise RFQ
          if (res.Data.Stage == GroupRfqStatusCode.RFQRaised) {
            this._router.navigate([ROUTING_PATH.RFQPackage.PackageRaise + '/' + Id]);
          }

          // Miscellaneous QN By UW
          else if (res.Data.Stage == GroupRfqStatusCode.RFQQNUW) {
            this._router.navigate([ROUTING_PATH.RFQPackage.PackageQN + '/' + Id])
          }

          // Miscellaneous QN Selection (SP)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQQNSelectionSP) {
            this._router.navigate([ROUTING_PATH.RFQPackage.PackageQNSelection + '/' + Id])
          }

          // Miscellaneous Payment Link (UW)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQPackage.PackagePaymentLink + '/' + Id])
          }

          // Miscellaneous Payment Proof (SP)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQPackage.PackagePaymentProof + '/' + Id])
          }

          // Miscellaneous Proposal Submission (UW)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQProposalSubmissionUW) {
            this._router.navigate([ROUTING_PATH.RFQPackage.PackageProposalSubmission + '/' + Id])
          }

          // Miscellaneous Policy Issue (UW)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQPolicyIssueUW) {
            this._router.navigate([ROUTING_PATH.RFQPackage.PackagePolicyIssue + '/' + Id])
          }

          // Route Not Found
          else {
            this._alertservice.raiseErrorAlert("Route Not Found...", true);
          }
        } else if (res.Data.CategoryCode == CategoryCodeEnum.Liability) {

          // RFQ Liability Raise RFQ
          if (res.Data.Stage == GroupRfqStatusCode.RFQRaised) {
            this._router.navigate([ROUTING_PATH.RFQLiability.LiabilityRaise + '/' + Id]);
          }

          // RFQ Liability QN By UW
          else if (res.Data.Stage == GroupRfqStatusCode.RFQQNUW) {
            this._router.navigate([ROUTING_PATH.RFQLiability.LiabilityQN + '/' + Id])
          }

          // RFQ Liability QN Selection (SP)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQQNSelectionSP) {
            this._router.navigate([ROUTING_PATH.RFQLiability.LiabilityQNSelection + '/' + Id])
          }

          // RFQ Liability Payment Link (UW)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQPaymentLinkUW) {
            this._router.navigate([ROUTING_PATH.RFQLiability.LiabilityPaymentLink + '/' + Id])
          }

          // RFQ Liability Payment Proof (SP)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQPaymentProofSP) {
            this._router.navigate([ROUTING_PATH.RFQLiability.LiabilityPaymentProof + '/' + Id])
          }

          // RFQ Liability Proposal Submission (UW)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQProposalSubmissionUW) {
            this._router.navigate([ROUTING_PATH.RFQLiability.LiabilityProposalSubmission + '/' + Id])
          }

          // RFQ Liability Policy Issue (UW)
          else if (res.Data.Stage == GroupRfqStatusCode.RFQPolicyIssueUW) {
            this._router.navigate([ROUTING_PATH.RFQLiability.LiabilityPolicyIssue + '/' + Id])
          }

          // Route Not Found
          else {
            this._alertservice.raiseErrorAlert("Route Not Found...", true);
          }
        }
      }
      else {
        if (res.Alerts && res.Alerts?.length > 0) {
          this._alertservice.raiseErrors(res.Alerts)
        } else {
          this._alertservice.raiseErrorAlert(res.Message)
        }
      }


    })

  }

  public convertToTransactionEntry(data) {
    let subCategoryCode = data.SubCategoryCode;

    if (subCategoryCode == "MediclaimTopUpPlan") {
      0
      subCategoryCode = "Mediclaim";
      this._router.navigate([ROUTING_PATH.Master.TransactionEntry.Convert + "/" + data.Id + "/" + subCategoryCode])
    }
    else {
      this._router.navigate([ROUTING_PATH.Master.TransactionEntry.Convert + "/" + data.Id])
    }

  }

  public convertTopUpToTransactionEntry(data) {
    let subCategoryCode = data.SubCategoryCode;

    if (subCategoryCode == "MediclaimTopUpPlan") {
      subCategoryCode = "TopUpPlan";
    }

    this._router.navigate([ROUTING_PATH.Master.TransactionEntry.Convert + "/" + data.Id + "/" + subCategoryCode])
  }

  public ViewRFQHealth(objRFQ) {

    // Raise RFQ
    if (objRFQ.StageName == HealthPolicyStatus.RFQRaised) {
      this._router.navigate([ROUTING_PATH.RFQ.Raise + "View/" + objRFQ.Id])
    }
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW) {
      this._router.navigate([ROUTING_PATH.RFQ.QNByUWPending + "View/" + objRFQ.Id])
    }
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNSelectionSP) {
      this._router.navigate([ROUTING_PATH.RFQ.QNSelectionSPPending + "View/" + objRFQ.Id])
    }
    else if (objRFQ.StageName == HealthPolicyStatus.RFQPaymentLinkUW) {
      this._router.navigate([ROUTING_PATH.RFQ.PaymetLinkPending + "View/" + objRFQ.Id])
    }
    else if (objRFQ.StageName == HealthPolicyStatus.RFQPaymentProofSP) {
      this._router.navigate([ROUTING_PATH.RFQ.PaymentProofPending + "View/" + objRFQ.Id])
    }
    else if (objRFQ.StageName == HealthPolicyStatus.RFQProposalSubmissionUW) {
      this._router.navigate([ROUTING_PATH.RFQ.ProposalSubPending + "View/" + objRFQ.Id])
    }
    else if (objRFQ.StageName == HealthPolicyStatus.RFQCounterOffer) {
      this._router.navigate([ROUTING_PATH.RFQ.CounterOfferPending + "View/" + objRFQ.Id])
    }
    else if (objRFQ.StageName == HealthPolicyStatus.RFQLoadingPaymentLinkUW) {
      this._router.navigate([ROUTING_PATH.RFQ.LoadingPayLinkPending + "View/" + objRFQ.Id])
    }
    else if (objRFQ.StageName == HealthPolicyStatus.RFQLoadingPaymentProofSP) {
      this._router.navigate([ROUTING_PATH.RFQ.LoadingPayProofPending + "View/" + objRFQ.Id])
    }
    else if (objRFQ.StageName == HealthPolicyStatus.RFQPolicyIssueUW) {
      this._router.navigate([ROUTING_PATH.RFQ.PolicyIssuePending + "View/" + objRFQ.Id])
    }

  }

  public ViewRFQRaised(objRFQ) {

    // Health Raise RFQ
    if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW && objRFQ.CategoryCode == CategoryCodeEnum.Health) {
      this._router.navigate([ROUTING_PATH.RFQ.Raise + "/View/" + objRFQ.Id])
    }
    // Motor Raise RFQ
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW && objRFQ.CategoryCode == CategoryCodeEnum.Motor) {
      this._router.navigate([ROUTING_PATH.RFQMotor.MotorRaise + "/View/" + objRFQ.Id])
    }
    // Life Raise RFQ
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW && objRFQ.CategoryCode == CategoryCodeEnum.Life) {
      this._router.navigate([ROUTING_PATH.RFQLife.LifeRaise + "/View/" + objRFQ.Id])
    }
    // Travel Raise RFQ
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW && objRFQ.CategoryCode == CategoryCodeEnum.Travel) {
      this._router.navigate([ROUTING_PATH.RFQTravel.TravelRaise + "/View/" + objRFQ.Id])
    }
    // PA Raise RFQ
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW && objRFQ.CategoryCode == CategoryCodeEnum.PA) {
      this._router.navigate([ROUTING_PATH.RFQPA.PARaise + "/View/" + objRFQ.Id])
    }
    // Marine Raise RFQ
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW && objRFQ.CategoryCode == CategoryCodeEnum.Marine) {
      this._router.navigate([ROUTING_PATH.RFQMarine.MarineRaise + "/View/" + objRFQ.Id])
    }
    // WC Raise RFQ
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW && objRFQ.CategoryCode == CategoryCodeEnum.WorkmenComp) {
      this._router.navigate([ROUTING_PATH.RFQWC.WcRaise + "/View/" + objRFQ.Id])
    }
    // Liability Raise RFQ
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW && objRFQ.CategoryCode == CategoryCodeEnum.Liability) {
      this._router.navigate([ROUTING_PATH.RFQLiability.LiabilityRaise + "/View/" + objRFQ.Id])
    }
    // Fire Raise RFQ
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW && objRFQ.CategoryCode == CategoryCodeEnum.Fire) {
      this._router.navigate([ROUTING_PATH.RFQFire.FireRaise + "/View/" + objRFQ.Id])
    }
    // Engineering Raise RFQ
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW && objRFQ.CategoryCode == CategoryCodeEnum.Engineering) {
      this._router.navigate([ROUTING_PATH.RFQEngineering.EngineeringRaise + "/View/" + objRFQ.Id])
    }
    // Group Raise RFQ
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW && objRFQ.CategoryCode == CategoryCodeEnum.Group) {
      this._router.navigate([ROUTING_PATH.RFQGroup.GroupRaise + "/View/" + objRFQ.Id])
    }
    // Miscellaneous Raise RFQ
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW && objRFQ.CategoryCode == CategoryCodeEnum.Miscellaneous) {
      this._router.navigate([ROUTING_PATH.RFQMiscellaneous.MiscellaneousRaise + "/View/" + objRFQ.Id])
    }
    // Package Raise RFQ
    else if (objRFQ.StageName == HealthPolicyStatus.RFQQNUW && objRFQ.CategoryCode == CategoryCodeEnum.Package) {
      this._router.navigate([ROUTING_PATH.RFQPackage.PackageRaise + "/View/" + objRFQ.Id])
    }
  }


  public GetRfwAttchment(event) {
    this._rfqService.getRFQDocuments(event.Id)
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
      .getRFQDataList(listRequestBody, this.api, this.permissionBase)
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


  private _StageWiseColumnConfig(RfqStage: string) {

    let columnDef = []

    if (RfqStage == HealthPolicyStatusCode.RFQRaised) {
      columnDef = [
        this.RequestDateCol,
        this.RequestTypeCol,
        this.BranchCol,
        this.RFQDateCol,
        this.RFQNoCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CategoryTypeCol,
        this.SalesPersonCol,
        this.TeamReferenceCol,
        this.RFQActionCol

      ]
    } if (RfqStage == HealthPolicyStatusCode.RFQQNUW) {
      columnDef = [
        this.RequestDateCol,
        this.RequestTypeCol,
        this.BranchCol,
        this.RFQDateCol,
        this.RFQNoCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CategoryTypeCol,
        this.SalesPersonCol,
        this.TeamReferenceCol,
        this.AssignNameCol,
        this.RFQActionCol

      ]
    } else if (RfqStage == HealthPolicyStatusCode.RFQQNSelectionSP) {

      columnDef = [
        this.RequestDateCol,
        this.RequestTypeCol,
        this.BranchCol,
        this.RFQDateCol,
        this.RFQNoCol,
        this.QNDateCol,
        this.QNNoCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CategoryTypeCol,
        this.SalesPersonCol,
        this.TeamReferenceCol,
        this.RFQActionCol
      ]

    } else if (RfqStage == HealthPolicyStatusCode.RFQProposalSubmissionUW) {

      columnDef = [
        this.RequestDateCol,
        this.RequestTypeCol,
        this.BranchCol,
        this.RFQDateCol,
        this.RFQNoCol,
        this.QNDateCol,
        this.QNNoCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CategoryTypeCol,
        this.SalesPersonCol,
        this.TeamReferenceCol,
        this.InsuranceCompanyCol,
        this.SumInsuredCol,
        this.GrossPremiumCol,
        this.RFQActionCol
      ]

    } else if (RfqStage == HealthPolicyStatusCode.RFQPaymentLinkUW) {

      columnDef = [
        this.RequestDateCol,
        this.RequestTypeCol,
        this.BranchCol,
        this.RFQDateCol,
        this.RFQNoCol,
        this.QNDateCol,
        this.QNNoCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CategoryTypeCol,
        this.SalesPersonCol,
        this.TeamReferenceCol,
        this.InsuranceCompanyCol,
        this.SumInsuredCol,
        this.GrossPremiumCol,
        this.ModeofPaymentCol,
        this.RFQActionCol
      ]

    } else if (RfqStage == HealthPolicyStatusCode.RFQPaymentProofSP) {


      columnDef = [
        this.RequestDateCol,
        this.RequestTypeCol,
        this.BranchCol,
        this.RFQDateCol,
        this.RFQNoCol,
        this.QNDateCol,
        this.QNNoCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CategoryTypeCol,
        this.SalesPersonCol,
        this.TeamReferenceCol,
        this.InsuranceCompanyCol,
        this.SumInsuredCol,
        this.GrossPremiumCol,
        this.RFQActionCol
      ]

    } else if (RfqStage == HealthPolicyStatusCode.RFQCounterOffer) {

      columnDef = [
        this.RequestDateCol,
        this.RequestTypeCol,
        this.BranchCol,
        this.RFQDateCol,
        this.RFQNoCol,
        this.QNDateCol,
        this.QNNoCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CategoryTypeCol,
        this.SalesPersonCol,
        this.TeamReferenceCol,
        this.InsuranceCompanyCol,
        this.QuerybyInsuranceCompanyCol,
        this.CustomerResponseCol,
        this.SumInsuredCol,
        this.GrossPremiumCol,
        this.LoadingPremiumCol,
        this.RFQActionCol
      ]

    } else if (RfqStage == HealthPolicyStatusCode.RFQLoadingPaymentLinkUW || RfqStage == HealthPolicyStatusCode.RFQLoadingPaymentProofSP) {

      columnDef = [
        this.RequestDateCol,
        this.RequestTypeCol,
        this.BranchCol,
        this.RFQDateCol,
        this.RFQNoCol,
        this.QNDateCol,
        this.QNNoCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CategoryTypeCol,
        this.TeamReferenceCol,
        this.InsuranceCompanyCol,
        this.SumInsuredCol,
        this.GrossPremiumCol,
        this.LoadingPremiumCol,
        this.ModeofPaymentCol,
        this.RFQActionCol
      ]
    } else if (RfqStage == HealthPolicyStatusCode.RFQPolicyIssueUW) {

      columnDef = [
        this.RequestDateCol,
        this.RequestTypeCol,
        this.BranchCol,
        this.RFQDateCol,
        this.RFQNoCol,
        this.QNDateCol,
        this.QNNoCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CategoryTypeCol,
        this.SalesPersonCol,
        this.TeamReferenceCol,
        this.InsuranceCompanyCol,
        this.SumInsuredCol,
        this.GrossPremiumCol,
        this.TotalPaidPremiumCol,
        this.ModeofPaymentCol,
        this.RFQActionCol
      ]

    } else if (RfqStage == HealthPolicyStatusCode.RFQTransactionEntry) {
      columnDef = [
        this.PolicyIssueDateCol,
        this.BranchCol,
        this.RFQDateCol,
        this.RFQNoCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CategoryTypeCol,
        this.SalesPersonCol,
        this.TeamReferenceCol,
        this.InsuranceCompanyCol,
        this.SumInsuredCol,
        this.GrossPremiumCol,
        this.TotalPaidPremiumCol,
        this.ModeofPaymentCol,
        this.RFQActionCol
      ]
    } else if (RfqStage == HealthPolicyStatusCode.RFQTransactionEntryDone) {
      columnDef = [
        this.PolicyIssueDateCol,
        this.BranchCol,
        this.RFQDateCol,
        this.RFQNoCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CategoryTypeCol,
        this.SalesPersonCol,
        this.TeamReferenceCol,
        this.InsuranceCompanyCol,
        this.SumInsuredCol,
        this.GrossPremiumCol,
        this.TotalPaidPremiumCol,
        this.ModeofPaymentCol,
        this.TransactionIDCol,
        this.TransactionDateCol,
        this.RFQActionCol
      ]
    }else if (RfqStage == HealthPolicyStatusCode.RFQRejected) {

      columnDef = [
        this.RFQDateCol,
        this.RFQNoCol,
        this.QNDateCol,
        this.QNNoCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CategoryTypeCol,
        this.SalesPersonCol,
        this.TeamReferenceCol,
        this.InsuranceCompanyCol,
        this.SumInsuredCol,
        this.GrossPremiumCol,
        this.RejectionDateCol,
        this.RejectedStageCol,
        this.ReasonforRejectionCol,
        this.RFQActionCol
      ]
    } else {
      columnDef = [
        this.RequestDateCol,
        this.RequestTypeCol,
        this.BranchCol,
        this.RFQDateCol,
        this.RFQNoCol,
        this.PolicyTypeCol,
        this.CategoryCol,
        this.SubCategoryCol,
        this.CategoryTypeCol,
        this.SalesPersonCol,
        this.TeamReferenceCol,
        this.RFQStageCol,
        this.TotalRFQActionCol
      ]
    }




    return columnDef
  }


  private _ViewRFQpolicy(item) {

    if (item.Stage == HealthPolicyStatusCode.RFQTransactionEntryDone || item.Stage == HealthPolicyStatusCode.RFQTransactionEntry) {
      // Health Policy Issue page view
      if (item.CategoryCode == CategoryCodeEnum.Health) {
        this._router.navigate([ROUTING_PATH.RFQ.PolicyIssuePending + "View/" + item.Id])
      }

      // Motor Policy Issue page view
      else if (item.CategoryCode == CategoryCodeEnum.Motor) {
        this._router.navigate([ROUTING_PATH.RFQMotor.MotorPolicyIssue + "/View/" + item.Id])
      }

      // Workmen Comp Policy Issue page view
      else if (item.CategoryCode == CategoryCodeEnum.WorkmenComp) {
        this._router.navigate([ROUTING_PATH.RFQWC.WcPolicyIssue + "/View/" + item.Id])
      }

      // Marine Comp Policy Issue page view
      else if (item.CategoryCode == CategoryCodeEnum.Marine) {
        this._router.navigate([ROUTING_PATH.RFQMarine.MarinePolicyIssue + "/View/" + item.Id])
      }

      // Life Comp Policy Issue page view
      else if (item.CategoryCode == CategoryCodeEnum.Life) {
        this._router.navigate([ROUTING_PATH.RFQLife.LifePolicyIssue + "/View/" + item.Id])
      }

      // Travel Comp Policy Issue page view
      else if (item.CategoryCode == CategoryCodeEnum.Travel) {
        this._router.navigate([ROUTING_PATH.RFQTravel.TravelPolicyIssue + "/View/" + item.Id])
      }

      // Personal accident Comp Policy Issue page view
      else if (item.CategoryCode == CategoryCodeEnum.PA) {
        this._router.navigate([ROUTING_PATH.RFQPA.PAPolicyIssue + "/View/" + item.Id])
      }
      else if (item.CategoryCode == CategoryCodeEnum.Engineering) {
        this._router.navigate([ROUTING_PATH.RFQEngineering.EngineeringPolicyIssue + "/View/" + item.Id])
      }
      else if (item.CategoryCode == CategoryCodeEnum.Fire) {
        this._router.navigate([ROUTING_PATH.RFQFire.FirePolicyIssue + "/View/" + item.Id])
      }
      else if (item.CategoryCode == CategoryCodeEnum.Miscellaneous) {
        this._router.navigate([ROUTING_PATH.RFQMiscellaneous.MiscellaneousPolicyIssue + "/View/" + item.Id])
      }
      else if (item.CategoryCode == CategoryCodeEnum.Group) {
        this._router.navigate([ROUTING_PATH.RFQGroup.GroupPolicyIssue + "/View/" + item.Id])
      }
      else if (item.CategoryCode == CategoryCodeEnum.Package) {
        this._router.navigate([ROUTING_PATH.RFQPackage.PackagePolicyIssue + "/View/" + item.Id])
      }
      else if (item.CategoryCode == CategoryCodeEnum.Liability) {
        this._router.navigate([ROUTING_PATH.RFQLiability.LiabilityPolicyIssue + "/View/" + item.Id])
      }
      else {
        this._alertservice.raiseErrorAlert("Route Not Found...");
      }
    }
  }


  private _actionFromCoulumn(item) {

    if (item.Stage != 'RFQTransactionEntry' && item.Stage != 'RFQTransactionEntryDone' && item.Stage != 'RFQRejected') {
      this.redirect(item.Id)
    } else if (item.Stage == 'RFQTransactionEntry') {
      this.convertToTransactionEntry(item)
    } else if (item.Stage == 'RFQTransactionEntry' && item.SubCategoryCode == 'MediclaimTopUpPlan') {
      this.convertTopUpToTransactionEntry(item)
    } else if (item.Stage == 'RFQTransactionEntryDone') {
      this._router.navigate([ROUTING_PATH.Master.TransactionEntry.RFQView + '/' + item.TransactionId])
    }
  }

  private _canClickonColumn(item) {
    if (this.StageCode != 'TotalRaisedRFQ' && item.Stage != 'RFQRejected') {
      // return true;

      /**
       * If RFQ In Prossess & User Have Access for get RFQ Then Click able column
       */
      if (item.Stage != 'RFQTransactionEntry' && item.Stage != 'RFQTransactionEntryDone' &&
        item.Stage != 'RFQRejected' && this._authService._userProfile?.value?.AuthKeys?.includes("RFQ-get")) {
        if (item.Stage == 'RFQQNUW'){

          if (item.AssignId){
            return true;
          }else{
            return false;
          }
          }else{
            return true;
          }
      }
      /**
      * If RFQ In TransactionEntry Stage & User Have Access for Create Transaction Then Click able column
      */

      else if (item.Stage == 'RFQTransactionEntry' && this._authService._userProfile?.value?.AuthKeys?.includes("OfflineTransaction-create")) {
        return true;
      }
      /**
     * If RFQ In TransactionEntry Stage & SubCategoryCode == 'MediclaimTopUpPlan'  & User Have Access for Create Transaction Then Click able column
     */
      else if (item.Stage == 'RFQTransactionEntry' && item.SubCategoryCode == 'MediclaimTopUpPlan'
        && this._authService._userProfile?.value?.AuthKeys?.includes("OfflineTransaction-create")
      ) {
        return true;
      }
      /**
      * If RFQ In TransactionEntry Done Stage & User Have Access for Get Transaction Then Click able column
      */
      else if (item.Stage == 'RFQTransactionEntryDone' && this._authService._userProfile?.value?.AuthKeys?.includes("OfflineTransaction-get")) {
        return true;
      }

      else {
        return false;
      }

    } else {
      return false;
    }
  }
  
  private _canDisplayNextButton(item) {
    if ((item.Stage != 'RFQTransactionEntry' && item.Stage != 'RFQTransactionEntryDone' && item.Stage != 'RFQRejected') &&
      (this._authService._userProfile?.value?.AuthKeys?.includes("RFQ-get"))){
      if (item.Stage == 'RFQQNUW') {
        if (item.AssignId) {
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }

    }else{
      return false;
    }
  }

  private _downloadTotalRaiseRFQ(item) {
    this._rfqService.downloadTotalRaiseRFQ(item.Id)
      .subscribe((blob: Blob) => {
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
        }
        else {
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = item.RFQNo + "_" + item.CategoryName;
          a.click();
          URL.revokeObjectURL(objectUrl);
        }
      });
  }

  // Assign UW to RFQ 
  private _rfqUWassign(element, type: 'assign' | 'unassign' | 'reassign') {
    this._rfqService.rfqUWassign(element, type)
    this._rfqService.assignUnassignRes.subscribe(res=>{
      if(res){
        this._loadLists()
        this._rfqService.assignUnassignRes.unsubscribe()
      }
    })
  }
  // #endregion private methods

}

