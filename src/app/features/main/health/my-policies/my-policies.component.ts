import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { IPolicyDto } from '@models/dtos/core/policy-dto';
import { AuthService } from '@services/auth/auth.service';
import { Subject, BehaviorSubject, Observable, takeUntil } from 'rxjs';
import { QuoteService } from '../quote/quote.service';
import { environment } from 'src/environments/environment';
import { GodigitService } from '../quote/proposal-pages/go-digit/godigit.service';
import { IIffcoTokioDownloadPolicyDto, IffcoTokioDownloadPolicyDto } from '@models/dtos/config/IffcoTokio/iffco-tokio-download-policy-dto';
import { IciciService } from '../quote/proposal-pages/icicihealth/icici.service';
import { InsuranceCompanyName } from '../../../../shared/enums/insuranceCompanyName.enum';
import { CommonFunctionsService } from '@lib/services/common-functions.service';
import { GoDigitDownloadPolicyDto, GoDigitStatusDto, IGoDigitDownloadPolicyDto, IGoDigitStatusDto } from '@models/dtos/config/GoDigit';
import { HDFCDownloadPolicyDto, HDFCPaymentMappingDto, IHDFCDownloadPolicyDto, IHDFCPaymentMappingDto } from '@models/dtos/config/Hdfc';
import { IIciciHealthPaymentDto, IciciHealthPaymentDto } from '@models/dtos/config/Icici';
import { HdfcService } from '../quote/proposal-pages/hdfcergo/hdfc.service';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AppDataGridListDto, CurrencyFormatter, dateFormatter } from '@models/common';

@Component({
  selector: 'gnx-my-policies',
  templateUrl: './my-policies.component.html',
  styleUrls: ['./my-policies.component.scss'],
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
export class MyPoliciesComponent {
  title: string = 'Health Policies'

  PolicyNo: string;
  CorrelationId: string;
  CustomerId: string;
  GoDigitDownload: IGoDigitDownloadPolicyDto
  HDFCDownload: IHDFCDownloadPolicyDto
  IffcoTokioDownload: IIffcoTokioDownloadPolicyDto
  KYCStatus: IGoDigitStatusDto;
  HDFCPaymentMapping: IHDFCPaymentMappingDto;
  ICICIHealthPayment:IIciciHealthPaymentDto;
  TRN: string

  destroy$: Subject<any>;

  currentDate
  PolicyList: BehaviorSubject<IPolicyDto>;
  PolicyList$: Observable<any>;
  api = API_ENDPOINTS.Policy.base
  downloadApi = API_ENDPOINTS.Policy.download


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
  // columnDef = [
  //   {
  //     head: 'Insurance Company',
  //     fieldName: 'Insurer',
  //     isSearch: 'true',
  //     searchType: 'text',
  //     searchFieldName: 'Insurer',
  //   },
  //   {
  //     head: 'Plan Name',
  //     fieldName: 'ProductName',
  //     isSearch: 'true',
  //     searchType: 'text',
  //     searchFieldName: 'ProductName',
  //   },
  //   {
  //     head: 'Insured Person',
  //     fieldName: 'PolicyHolderName',
  //     isSearch: 'true',
  //     searchType: 'text',
  //     searchFieldName: 'PolicyHolder',
  //     isAdditional: true
  //   },
  //   {
  //     head: 'Contact No',
  //     fieldName: 'Mobile',
  //     isSearch: 'true',
  //     searchType: 'text',
  //     searchFieldName: 'Mobile',
  //   },
  //   {
  //     head: 'Premium Amount',
  //     fieldName: 'PremiumAmount',
  //     isSearch: 'true',
  //     searchType: 'text',
  //     searchFieldName: 'PremiumAmount',
  //   },
  //   {
  //     head: 'Policy No.',
  //     fieldName: 'PolicyNo',
  //     isSearch: 'true',
  //     searchType: 'text',
  //     searchFieldName: 'PolicyNo',
  //   },
  //   {
  //     head: 'Transaction No.',
  //     fieldName: 'TransactionNo',
  //     isSearch: 'true',
  //     searchType: 'text',
  //     searchFieldName: 'TransactionNo',
  //   },
  //   {
  //     head: 'Sum Insured',
  //     fieldName: 'SumInsured',
  //     isSearch: 'true',
  //     searchType: 'dropdown',
  //     optionArray: this._CommonFuncService.SumInsuredArray(),
  //     searchFieldName: 'SumInsured',
  //   },
  //   {
  //     head: 'Date Of Purchase',
  //     fieldName: 'PolicyStartDate',
  //     isSearch: 'true',
  //     searchType: 'date',
  //     searchFieldName: 'PolicyStartDate',
  //   },
  //   {
  //     head: 'Status',
  //     fieldName: 'PolicyStatusName',
  //     isSearch: 'true',
  //     searchType: 'dropdown',
  //     optionArray: this._CommonFuncService.statusArray(),
  //     searchFieldName: 'PolicyStatus',
  //   },
  //   {
  //     head: 'Actions',
  //     fieldName: '',
  //   },
  // ];

  // Column Defination of table
  columnDef: AppDataGridListDto[] = [
    {
      head: 'Insurance Company',
      fieldName: 'Insurer',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Insurer',
      isFilterable: true,
      searchFieldName: 'Insurer',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Plan Name',
      fieldName: 'ProductName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'ProductName',
      isFilterable: true,
      searchFieldName: 'ProductName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Insured Person',
      fieldName: 'PolicyHolderName',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'PolicyHolderName',
      isFilterable: true,
      searchFieldName: 'PolicyHolderName',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
      isAdditional: true
    },
    {
      head: 'Contact No',
      fieldName: 'Mobile',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Mobile',
      isFilterable: true,
      searchFieldName: 'Mobile',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Premium Amount',
      fieldName: 'PremiumAmount',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'PremiumAmount',
      isFilterable: true,
      searchFieldName: 'PremiumAmount',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'Policy No.',
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
      head: 'Response No.',
      fieldName: 'TransactionNo',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'TransactionNo',
      isFilterable: true,
      searchFieldName: 'TransactionNo',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Sum Insured',
      fieldName: 'SumInsured',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'SumInsured',
      isFilterable: true,
      searchFieldName: 'SumInsured',
      filterType: 'dropdown',
      width: '10%',
      minWidth: '150px',
      drpDataList: this._CommonFuncService.SumInsuredArray(),
    },
    {
      head: 'Date Of Purchase',
      fieldName: 'PolicyStartDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'PolicyStartDate',
      isFilterable: true,
      searchFieldName: 'PolicyStartDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter,
    },
    {
      head: 'Transaction No.',
      fieldName: 'OfflineTransactionNo',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Transaction.TransactionNo',
      isFilterable: true,
      searchFieldName: 'Transaction.TransactionNo',
      filterType: 'text',
      width: '10%',
      minWidth: '150px',
    },
    {
      head: 'Transaction Date',
      fieldName: 'TransactionDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'Transaction.TransactionDate',
      isFilterable: true,
      searchFieldName: 'Transaction.TransactionDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter,
    },
    {
      head: 'Status',
      fieldName: 'PolicyStatusName',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'PolicyStatus',
      isFilterable: true,
      searchFieldName: 'PolicyStatus',
      filterType: 'dropdown',
      width: '10%',
      minWidth: '150px',
      drpDataList: this._CommonFuncService.statusArray(),
    },
    {
      head: 'Actions',
      fieldName: '',
      listActions: [
        {
          name: "DownloadPolicy",
          tooltip: "Download Policy",
          icon: 'fa fa-download',
          action: (item) => this.downloadPolicy(item.Id),
        },
        {
          name: "CompletePayment",
          tooltip: "Complete Payment",
          icon: 'fas fa-rupee-sign',
          action: (item) => this.payment(item.Id),
          hidden: (item) => (item.PaymentStatus != 1)
        },
        {
          name: "CompleteKYC",
          tooltip: "Complete KYC",
          icon: 'fa-solid fa-check',
          action: (item) => this.kyc(item.Id),
          hidden: (item) => (item.IsKYC!=true)
        },
        {
          name: "Sync",
          tooltip: "Sync",
          icon: 'fas fa-sync-alt',
          action: (item) => this.statusCheck(item.Id),
          hidden: (item) => (item.Insurer.toLowerCase() == InsuranceCompanyName.GoDigit && item.PolicyStatusName != 'Complete')
        },
        {
          name: "PaymentMapping",
          tooltip: "Payment Mapping",
          icon: 'fas fa-sync-alt',
          action: (item) => this.paymentMapping(item.Id),
          hidden: (item) => (item.Insurer.toLowerCase() == InsuranceCompanyName.HdfcErgo && item.PolicyStatus == 10)
        },
        {
          name: "Convert",
          tooltip: "Convert to Transaction Entry",
          icon: 'fa fa-solid fa-money-bill-transfer',
          action: (item) => this._convertToTransaction(item.Id),
          hidden: (item) => (
            item.PolicyStatus == 1 && 
            !item.TransactionId &&
            this.authService._userProfile?.value?.AuthKeys?.includes("OfflineTransaction-create"))
        },
      ]
    }
  ];

  //#region constructor
  constructor(
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _dialogService: DialogService,
    private _alertservice: AlertsService,
    private _column: ColumnSearchService,
    private _quote: QuoteService,
    private authService: AuthService,
    private _iciciService: IciciService,
    private _goDigitService: GodigitService,
    private _CommonFuncService: CommonFunctionsService,
    private _hdfcService: HdfcService,
    private _router: Router,
    private _datepipe:DatePipe
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


    this.GoDigitDownload = new GoDigitDownloadPolicyDto()
    this.HDFCDownload = new HDFCDownloadPolicyDto()
    this.KYCStatus = new GoDigitStatusDto()
    this.ICICIHealthPayment = new IciciHealthPaymentDto()
    this.HDFCPaymentMapping = new HDFCPaymentMappingDto()

    let data = this._route.snapshot.queryParams;
    this.TRN = data['TRN']
    if (this.TRN) {
      this.KYCStatus.TransactionNo = this.TRN
      this._goDigitService.StatusCheck(this.KYCStatus).subscribe((response) => {
        this._alertservice.raiseSuccessAlert(response.Message)
        this._alertservice.raiseSuccessAlert(response.Data.KYCVerificationStatus)
        this._loadLists();
      })
    } else {
      this._loadLists();
    }
  }

  // #endregion constructor


  /**
   * If User Have Access for Buy Policy then Display buynow button
   */
  get canDisplayBuyNow(): boolean {
    if (this.authService._userProfile.value?.AuthKeys.includes("HealthProposal-create")) {
      return true;
    } else {
      return false;
    }
  }

  // #region public methods

  // rout to Health page 
  public buyNow () {
    this._router.navigate([ROUTING_PATH.Basic.Health]);
  }

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

  // delete policy
  deletePolicy(id) {
    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this._dataService.deleteData(id, this.api).subscribe((res) => {
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

  // download policy
  downloadPolicy(id) {
    this._dataService.getDataById(id, this.api).subscribe((res) => {

      if (res.Data.IsKYC == true && res.Data.PaymentStatus == 1) {
        this.PolicyNo = res.Data.PolicyNo

        if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.ICICI) {
          this.CorrelationId = res.Data.HealthProposalICICIDetail.CorrelationId
          this.CustomerId = res.Data.HealthProposalICICIDetail.CustomerId

          this._quote.ICICIPolicyJson(this.PolicyNo, this.CorrelationId, this.CustomerId).subscribe((jsonRes) => {
            if (jsonRes.Success) {
              this._quote.DownloadPolicy(this.PolicyNo, this.CorrelationId, this.CustomerId).subscribe((response) => {
                this._CommonFuncService.DownloadPolicy(response,this.PolicyNo)
              });
            }
            else {
              this._alertservice.raiseErrors(jsonRes.Alerts)
            }
          });
        }
        else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.Care) {
          this._quote.CarePolicyJson(this.PolicyNo).subscribe((jsonRes) => {
            if (jsonRes.Success) {
              this._quote.CareDownloadPolicy(this.PolicyNo).subscribe((response) => {
                this._CommonFuncService.DownloadPolicy(response,this.PolicyNo)
              })
            }
            else {
              this._alertservice.raiseErrors(jsonRes.Alerts)
            }
          })
        }
        else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.BajajAllianz) {
          this._quote.BajajPolicyJson(this.PolicyNo).subscribe((jsonRes) => {
            if (jsonRes.Success) {
              this._quote.BajajDownloadPolicy(this.PolicyNo).subscribe((response) => {
                this._CommonFuncService.DownloadPolicy(response,this.PolicyNo)
              })
            }
            else {
              this._alertservice.raiseErrors(jsonRes.Alerts)
            }
          })
        }
        else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.GoDigit) {
          this.GoDigitDownload.PolicyNo = this.PolicyNo
          this._quote.GoDigitPolicyJson(this.GoDigitDownload).subscribe((jsonRes) => {
            if (jsonRes.Success) {
              this._quote.GoDigitDownloadPolicy(this.GoDigitDownload).subscribe((response) => {
                this._CommonFuncService.DownloadPolicy(response,this.PolicyNo)
              })
            }
            else {
              this._alertservice.raiseErrors(jsonRes.Alerts)
            }
          })
          
        }
        else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.AdityaBirla) {
          this._quote.AdityaBirlaPolicyJson(this.PolicyNo).subscribe((jsonRes) => {
            if(jsonRes.Success) {
              this._quote.AdityaBirlaDownloadPolicy(this.PolicyNo).subscribe((response) => {
                this._CommonFuncService.DownloadPolicy(response,this.PolicyNo)
              })
            }
            else {
              this._alertservice.raiseErrors(jsonRes.Alerts)
            }
          })
        }
        else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.HdfcErgo) {
          this.HDFCDownload.PolicyNo = this.PolicyNo
          this.HDFCDownload.TransactionNo = res.Data.TransactionNo
          this.HDFCDownload.Productcode = res.Data.ProductCode
          this._quote.HDFCPolicyJson(this.HDFCDownload).subscribe((jsonRes) => {
            if(jsonRes.Success) {
              this._quote.HDFCDownloadPolicy(this.HDFCDownload).subscribe((response) => {
                this._CommonFuncService.DownloadPolicy(response,this.PolicyNo)
              })
            }
            else {
              this._alertservice.raiseErrors(jsonRes.Alerts)
            }
          })
        }
        else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.IffcoTokio) {
          this.IffcoTokioDownload = new IffcoTokioDownloadPolicyDto()
          this.IffcoTokioDownload.PolicyNo = this.PolicyNo
          // this.IffcoTokioDownload.Insurer = res.Data.Insurer
          this.IffcoTokioDownload.PolicyType = res.Data.HealthProposalIFFCOTOKIODetail.Product
          this._quote.IFFCOTOKIODownloadPolicy(this.IffcoTokioDownload).subscribe((response) => {

            if (response.Success) {
              window.open(response.Data.PolicyDownloadLink,'_blank')
            }
          })
        }
      }
      else if (res.Data.PaymentStatus != 1) {
        this._alertservice.raiseErrorAlert('Payment not Done', true)
      }
      else {
        this._alertservice.raiseErrorAlert('KYC not Done', true)

      }
    })
  }

  // complete payment
  payment(id) {
    this._dialogService.confirmDialog({
        title: 'Policy Payment',
        message: `Do you want to proceed with Payment?`,
        confirmText: 'Yes',
        cancelText: 'No',
      })
      .subscribe((result) => {
        if (result == true) {
          this._dataService.getDataById(id, this.api).subscribe((res) => {
            if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.Care) {
      
              this._quote.openWindowWithPost(environment.carePayment, {
                proposalNum: res.Data.HealthProposalCareDetail.ProposalNumber,
                returnURL: API_ENDPOINTS.Care.Payment + "/" + res.Data.HealthProposalCareDetail.ProposalNumber,
      
              })
            } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.AdityaBirla) {
              this._quote.openWindowWithPost(environment.AdityaBirlaPayment,{
                  SourceCode: environment.AdityaBirlaSourceCode,
                  Currency: environment.Currency,
                  secSignature: environment.AdityaBirlaSecSignature,
                  ReturnURL: API_ENDPOINTS.AdityaBirla.Payment,
                  PhoneNo: res.Data.Mobile,
                  Email: res.Data.Email,
                  OrderAmount: res.Data.PremiumAmount,
                  GrossPremium: res.Data.PremiumAmount,
                  FinalPremium: res.Data.PremiumAmount,
                SourceTxnId: this._datepipe.transform(new Date(), 'ddMMyyHHmmss'),// Use This Date For Unique source tnx Id Generate For Payment
                  QuoteId: res.Data.TransactionNo,
                  productinfo: res.Data.TransactionNo,
                  SubCode: '',
                  paymentMode: '',
              })
            } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.ICICI && res.Data.PolicyStartDate) {
      
              this._iciciService.currentDate().subscribe((date) => {
                let temp = date.toString()
                this.currentDate = temp.split(' ')[0]
      
      
                if (this.currentDate == res.Data.PolicyStartDate.split('T')[0]) {
      
                  this.ICICIHealthPayment.ProposalNumber = res.Data.HealthProposalICICIDetail.ProposalNumber
                  this._iciciService.paymentLink(this.ICICIHealthPayment).subscribe((response) => {
                    window.open(response.Data.PaymentURL,'_self')
                  })
                } else {
                  this._alertservice.raiseErrorAlert('Can not make Payment as Date of Purchase is not current date',true)
                }
              })
      
      
      
      
            } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.IffcoTokio) {
      
              this._quote.openWindowWithPost(environment.IffcoTokioPayment,{
                ptnrTransactionLogId : res.Data.HealthProposalIFFCOTOKIODetail.PtnrTransactionLogId,
                orderNo : res.Data.HealthProposalIFFCOTOKIODetail.OrderNo,
                traceNo : res.Data.HealthProposalIFFCOTOKIODetail.TraceNo,
              })
            } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.HdfcErgo) {
      
              this._quote.openWindowWithPost(environment.hdfcPayment,{
                Trnsno : res.Data.HealthProposalHDFCDetail.PaymentTransactionNo,
                Amt : res.Data.PremiumAmount.toFixed(2),
                Appid : res.Data.HealthProposalHDFCDetail.AppID,
                Subid : res.Data.HealthProposalHDFCDetail.SubscriptionID,
                Surl : res.Data.HealthProposalHDFCDetail.SuccessUrl,
                Furl : res.Data.HealthProposalHDFCDetail.FailureUrl,
                Src : 'POST',
                Chksum : res.Data.HealthProposalHDFCDetail.Checksum,
              })
            }
            else {
              window.open(res.Data.PaymentLink, '_self')
            }
      
          })
        }
    })
  }

  // complete KYC
  kyc(id) {
    this._dataService.getDataById(id, this.api).subscribe((res) => {
      if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.GoDigit) {
        window.open(res.Data.HealthProposalGoDigitDetail.KYCLink,'_self')
      } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.ICICI) {
        window.open(res.Data.HealthProposalICICIDetail.KYCLink, '_self')
      } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.AdityaBirla) {
        window.open(res.Data.HealthProposalAdityaBirlaDetail.KYCLink, '_self')
      } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.Care) {
        window.open(res.Data.HealthProposalCareDetail.KYCLink, '_self')
      } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.BajajAllianz) {
        window.open(res.Data.HealthProposalBajajAllianzDetail.KYCLink, '_self')
      }
    })
  }

  // check status (only for GoDigit)
  statusCheck(id) {
    this._dialogService.confirmDialog({
      title: 'Sync',
      message: `Do you want to Sync?`,
      confirmText: 'Yes',
      cancelText: 'No',
    })
    .subscribe((result) => {
      if (result == true) {
        this._dataService.getDataById(id, this.api).subscribe((res) => {
          this.KYCStatus = new GoDigitStatusDto()
          this.KYCStatus.PolicyNo = res.Data.PolicyNo
          this.KYCStatus.TransactionNo = res.Data.TransactionNo
          this._goDigitService.StatusCheck(this.KYCStatus).subscribe((response) => {
            if(response.Success){
              this._loadLists();
              this._alertservice.raiseSuccessAlert(response.Message)
            }
            else {
              this._alertservice.raiseErrorAlert(response.Message)
            }            
          })
        })
      }
    })
  }

  // check status of payment (only for HDFC)
  paymentMapping(id) {
    this._dataService.getDataById(id, this.api).subscribe((res) => {
      this.HDFCPaymentMapping = new HDFCPaymentMappingDto()
      this.HDFCPaymentMapping.Productcode = res.Data.ProductCode
      this.HDFCPaymentMapping.TransactionNo = res.Data.TransactionNo
      this.HDFCPaymentMapping.TransactionDate = res.Data.HealthProposalHDFCDetail .TransactionDate
      this.HDFCPaymentMapping.ProposalNo = res.Data.HealthProposalHDFCDetail.ProposalNumber
      this.HDFCPaymentMapping.PaymentTransactionNo = res.Data.HealthProposalHDFCDetail.PaymentTransactionNo
      this.HDFCPaymentMapping.Amount = res.Data.HealthProposalHDFCDetail.TxnAmount
      this._hdfcService.paymentMapping(this.HDFCPaymentMapping).subscribe((response) => {
        if (response.Success) {
          this._loadLists();
        }
        else {
          this._alertservice.raiseErrorAlert(response.Message)
        }
      })
    })
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

  // get data from API
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

  private _convertToTransaction(id){
    this._router.navigate([ROUTING_PATH.Master.TransactionEntry.HealthPolicyConvert + "/" + id])
  }
  // #endregion private methods

}
