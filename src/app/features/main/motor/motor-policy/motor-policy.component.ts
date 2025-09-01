import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ColumnSearchService } from '@lib/services/columnSearch/column-search.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { IMotorListDto } from '@models/dtos/core/motor-policy-dto';
import { HDFCDownloadPolicy, IHDFCDownloadPolicy } from '@models/dtos/motor-insurance/hdfc-motor';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';
import { CommonFunctionsService } from '@lib/services/common-functions.service';
import { MotorQuoteService } from '../motor-quote.service';
import { environment } from 'src/environments/environment';
import { QuoteService } from '../../health/quote/quote.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ZunoDownloadPolicy } from '@models/dtos/motor-insurance/ZunoMotor';
import { TataAIADownloadPolicy } from '@models/dtos/motor-insurance/TataAIA/TataAIAMotorPolicydto';
import { KYCPopUpComponent } from '../car/quote/proposal-pages/tata-aia/kycpop-up/kycpop-up.component';
import { ITataAIAkycdto, TataAIAkycdto } from '@models/dtos/motor-insurance/TataAIA';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MotorCustomerTypeEnum } from 'src/app/shared/enums/MotorCustomerType.enum';
import { TataAiaService } from '../car/quote/proposal-pages/tata-aia/tata-aia.service';
import { CurrencyFormatter, dateFormatter, IFilterRule } from '@models/common';
import { DialogService } from '@lib/services/dialog.service';
import { BAJAJDownloadPolicy, IBAJAJDownloadPolicy } from '@models/dtos/motor-insurance/bajaj';
import { BajajService } from '../car/quote/proposal-pages/bajaj/bajaj.service';
import { GoDigitService } from '../car/quote/proposal-pages/go-digit/go-digit.service';
import { GoDigitStatusDto, IGoDigitStatusDto } from '@models/dtos/config/Motor/go-digit/go-digit-status-dto';
import { GoDigitDownloadPolicy, IGoDigitDownloadPolicy } from '@models/dtos/motor-insurance/go-digit/go-digit-download-policy';
import { AuthService } from '@services/auth/auth.service';

@Component({
  selector: 'gnx-motor-policy',
  templateUrl: './motor-policy.component.html',
  styleUrls: ['./motor-policy.component.scss'],
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
export class MotorPolicyComponent {
  title: string = 'Motor Policies';
  TRN: string

  destroy$: Subject<any>;

  MotorList: BehaviorSubject<IMotorListDto>;
  MotorList$: Observable<any>;
  api = API_ENDPOINTS.MotorList.base;

  HDFCDownload: IHDFCDownloadPolicy;
  BAJAJDownload: IBAJAJDownloadPolicy;
  GoDigitDownload: IGoDigitDownloadPolicy;
  KYCStatus: IGoDigitStatusDto;

  pagefilters = {
    currentPage: 1,
    limit: 20,
    columnSearchOptions: {
      field: 'Insurer',
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
      head: 'Insurer Name',
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
      head: 'Policy Holder',
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
      head: 'Response No',
      fieldName: 'TransactionNo',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'TransactionNo',
      isFilterable: true,
      searchFieldName: 'TransactionNo',
      filterType: 'text',
      width: '10%',
      minWidth: '150px'
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
      minWidth: '150px'
    },

    {
      head: 'Registration No',
      fieldName: 'VehicleNo',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'VehicleNo',
      isFilterable: true,
      searchFieldName: 'VehicleNo',
      filterType: 'text',
      width: '10%',
      minWidth: '150px'
    },

    {
      head: 'Mobile No',
      fieldName: 'Mobile',
      oprator: 'contains',
      isSortable: true,
      sortFieldName: 'Mobile',
      isFilterable: true,
      searchFieldName: 'Mobile',
      filterType: 'text',
      width: '10%',
      minWidth: '150px'
    },
    {
      head: 'OD End Date',
      fieldName: 'PolicyODEndDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'PolicyODEndDate',
      isFilterable: true,
      searchFieldName: 'PolicyODEndDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter
    },
    {
      head: 'TP End Date',
      fieldName: 'PolicyTPEndDate',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'PolicyTPEndDate',
      isFilterable: true,
      searchFieldName: 'PolicyTPEndDate',
      filterType: 'date',
      width: '10%',
      minWidth: '150px',
      valueFormatter: dateFormatter
    },
    {
      head: 'IDV',
      fieldName: 'IDV',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'IDV',
      isFilterable: true,
      searchFieldName: 'IDV',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'Payment Amount',
      fieldName: 'PaymentAmount',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'PaymentAmount',
      isFilterable: true,
      searchFieldName: 'PaymentAmount',
      filterType: 'number',
      width: '10%',
      minWidth: '150px',
      valueFormatter: CurrencyFormatter
    },
    {
      head: 'Policy Type',
      fieldName: 'PolicyType',
      oprator: 'eq',
      isSortable: true,
      sortFieldName: 'PolicyType',
      isFilterable: true,
      searchFieldName: 'PolicyType',
      filterType: 'dropdown',
      width: '10%',
      minWidth: '150px',
      drpDataList: this._CommonFuncService.motorPolicyTypeArray(),
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
      drpDataList: this._CommonFuncService.statusArrayForMotor(),
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
          hidden: (item) => (item.PaymentStatus != 1 && item.PolicyStatus != 2)
        },
        {
          name: "CompleteKYC",
          tooltip: "Complete KYC",
          icon: 'fa-solid fa-check',
          action: (item) => this.kyc(item.Id),
          hidden: (item) => (item.IsKYC != true && item.PolicyStatus != 2)
        },
        {
          name: "BreakIn",
          tooltip: "Break-In",
          icon: 'fas fa-sync-alt',
          action: (item) => this.breakIn(item.TransactionNo),
          hidden: (item) => (item.PolicyStatus == 2)
        },
        {
          name: "RefreshPaymentStatus",
          tooltip: "Refresh Payment Status",
          icon: 'fas fa-sync-alt',
          action: (item) => this.getPaymentStatus(item),
          hidden: (item) => (item.Insurer == 'BajajAllianz' && item.PaymentStatus == 0)
        },
        {
          name: "CheckKYCStatus",
          tooltip: "Check KYC Status",
          icon: 'fas fa-sync-alt',
          action: (item) => this.CheckGoDigitKYCStatus(item.TransactionNo),
          hidden: (item) => (item.Insurer == 'GoDigit' && item.PolicyStatus != 1 && !item.IsKYC)
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
    private _dataService: HttpService,
    private _alertservice: AlertsService,
    private _column: ColumnSearchService,
    private _motorQuoteuoteService: MotorQuoteService,
    private _CommonFuncService: CommonFunctionsService,
    private _quoteService: QuoteService,
    private _datePipe: DatePipe, //to change the format of date
    private _tataAIAMotorService: TataAiaService,
    private _bajajService: BajajService,
    public dialog: MatDialog,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dialogService: DialogService,
    private _goDigitService: GoDigitService,
    private authService: AuthService,
  ) {
    this.destroy$ = new Subject();
    this._column.FilterConditions.Rules = [];
    this._column.AdditionalFilters = [];
    this._column.OrderBySpecs = [
      {
        field: 'CreatedDate',
        direction: 'desc',
      },
    ];
    this.MotorList = new BehaviorSubject(null);
    this.MotorList$ = this.MotorList.asObservable();
    this._column.FilterConditions.Rules = [];

    let data = this._route.snapshot.queryParams;
    this.TRN = data['TRN']
    this.KYCStatus = new GoDigitStatusDto()
    if (this.TRN) {
      this.KYCStatus.TransactionNo = this.TRN
      this.getGoDigitKYCStatus(this.KYCStatus);
    }
    else {
      this._loadLists();
    }
  }

  // #endregion constructor

  /**
   * If User Have Access for Buy Policy then Display buynow button
   */
  get canDisplayBuyNow(): boolean {
    if (this.authService._userProfile.value?.AuthKeys.includes("MotorProposal-create")) {
      return true;
    } else {
      return false;
    }
  }

  // #region public methods

  // rout to motor page
  public buyNow() {
    this._router.navigate([ROUTING_PATH.Basic.Motor]);
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
    this.pagefilters.currentPage = 1;

    this._loadLists();
  }

  // download policy
  downloadPolicy(id) {
    this._dataService.getDataById(id, this.api).subscribe((res) => {
      if (res.Data.PaymentStatus == 1) {
        //HdfcErgo
        if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.HdfcErgo) {
          this.HDFCDownload = new HDFCDownloadPolicy();
          this.HDFCDownload.PolicyNo = res.Data.PolicyNo;
          this.HDFCDownload.Productcode = res.Data.ProductCode;
          this.HDFCDownload.TransactionNo = res.Data.TransactionNo;
          this._motorQuoteuoteService
            .HDFCPolicyJson(this.HDFCDownload)
            .subscribe((jsonRes) => {
              if (jsonRes.Success) {
                this._motorQuoteuoteService
                  .HDFCDownloadPolicy(this.HDFCDownload)
                  .subscribe((response) => {
                    this._CommonFuncService.DownloadPolicy(response);
                  });
              } else {
                this._alertservice.raiseErrors(jsonRes.Alerts);
              }
            });
        } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.Zuno) {
          let ZunoDownload = new ZunoDownloadPolicy();
          ZunoDownload.Insurer = res.Data.Insurer;
          ZunoDownload.PolicyNo = res.Data.PolicyNo;

          this._motorQuoteuoteService
            .ZunoDownloadjson(ZunoDownload)
            .subscribe((jsonRes) => {
              if (jsonRes.Success) {
                this._motorQuoteuoteService
                  .ZunoDownloadPolicy(ZunoDownload)
                  .subscribe((response) => {
                    this._CommonFuncService.DownloadPolicy(response);
                  });
              } else {
                this._alertservice.raiseErrors(jsonRes.Alerts);
              }
            });
        } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.TataAIA) {
          let TataAIADownload = new TataAIADownloadPolicy();
          TataAIADownload.Insurer = res.Data.Insurer;
          TataAIADownload.PolicyNo = res.Data.PolicyNo;

          this._motorQuoteuoteService
            .TATAAIADownloadjson(TataAIADownload)
            .subscribe((jsonRes) => {
              if (jsonRes.Success) {
                this._motorQuoteuoteService
                  .TATAAIADownloadPolicy(TataAIADownload)
                  .subscribe((response) => {
                    this._CommonFuncService.DownloadPolicy(response);
                  });
              } else {
                this._alertservice.raiseErrors(jsonRes.Alerts);
              }
            });
        } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.BajajAllianz) {
          this.BAJAJDownload = new BAJAJDownloadPolicy();
          this.BAJAJDownload.PolicyNo = res.Data.PolicyNo;
          this.BAJAJDownload.Insurer = res.Data.Insurer;
          this._motorQuoteuoteService
            .BAJAJPolicyJson(this.BAJAJDownload)
            .subscribe((jsonRes) => {
              if (jsonRes.Success) {
                this._motorQuoteuoteService
                  .BAJAJDownloadPolicy(this.BAJAJDownload)
                  .subscribe((response) => {
                    this._CommonFuncService.DownloadPolicy(response);
                  });
              } else {
                this._alertservice.raiseErrors(jsonRes.Alerts);
              }
            });
        } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.GoDigit) {
          this.GoDigitDownload = new GoDigitDownloadPolicy();
          this.GoDigitDownload.PolicyNo = res.Data.PolicyNo;
          this.GoDigitDownload.Insurer = res.Data.Insurer;
          this._motorQuoteuoteService.GoDigitPolicyJson(this.GoDigitDownload)
            .subscribe((jsonRes) => {
              if (jsonRes.Success) {
                this._motorQuoteuoteService
                  .GoDigitDownloadPolicy(this.GoDigitDownload)
                  .subscribe((response) => {
                    this._CommonFuncService.DownloadPolicy(response);
                  });
              } else {
                this._alertservice.raiseErrors(jsonRes.Alerts);
              }
            });
        }
      }
      else if (res.Data.PaymentStatus != 1) {
        this._alertservice.raiseErrorAlert('Payment not Done', true);
      }
    });
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
            if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.HdfcErgo) {
              this._quoteService.openWindowWithPost(environment.MotorhdfcPayment, {
                Trnsno: res.Data.MotorProposalHDFCDetail.PaymentTransactionNo,
                Amt: res.Data.PremiumAmount.toFixed(2),
                Appid: res.Data.MotorProposalHDFCDetail.AppID,
                Subid: res.Data.MotorProposalHDFCDetail.SubscriptionID,
                Surl: res.Data.MotorProposalHDFCDetail.SuccessUrl,
                Furl: res.Data.MotorProposalHDFCDetail.FailureUrl,
                Src: 'POST',
                Chksum: res.Data.MotorProposalHDFCDetail.Checksum,
              });
            } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.Zuno) {
              this._quoteService.openWindowWithPost(
                res.Data.MotorProposalZunoDetail.BillDeskURL,
                {
                  msg:
                    res.Data.MotorProposalZunoDetail.Msg +
                    '|' +
                    res.Data.MotorProposalZunoDetail.Checksum,
                }
              );
            } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.TataAIA) {

              if (!res.Data.IsKYC) {
                this.TATAAIAKYCPopUp(res);
              }
              else {
                this._tataAIAMotorService.Payment(res.Data.TransactionNo).subscribe((kycres) => {
                  if (kycres.Success) {
                    this._quoteService.openWindowWithPost(kycres.Data.PaymentURL, null);
                  } else {
                    this._alertservice.raiseErrorAlert(kycres.Message);
                  }
                });

              }
            }
            else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.BajajAllianz) {
              let api = environment.MotorBajajPayment.replace("##TransactionNo", res.Data.TransactionNo.toString())
              this._quoteService.openWindowWithPost(api, null);
            }
            else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.GoDigit) {
              this.KYCStatus.TransactionNo = res.Data.TransactionNo.toString();
              if (res.Data.IsKYC) {
                this.getGoDigitPaymentStatus(this.KYCStatus)
              }
              else {
                this._alertservice.raiseErrorAlert('KYC not done', true);
              }
            }
            else {

            }
          });
        }
      })
  }

  kyc(id) {

    this._dataService.getDataById(id, this.api).subscribe((res) => {

      if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.TataAIA) {
        this.TATAAIAKYCPopUp(res);
        // window.open(res.Data.HealthProposalGoDigitDetail.KYCLink,'_self')
      }
      // else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.ICICI) {
      //   window.open(res.Data.HealthProposalICICIDetail.KYCLink, '_self')
      // } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.AdityaBirla) {
      //   window.open(res.Data.HealthProposalAdityaBirlaDetail.KYCLink, '_self')
      // } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.Care) {
      //   window.open(res.Data.HealthProposalCareDetail.KYCLink, '_self')
      // } else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.BajajAllianz) {
      //   window.open(res.Data.HealthProposalBajajAllianzDetail.KYCLink, '_self')
      // }
      else if (res.Data.Insurer.toLowerCase() == InsuranceCompanyName.GoDigit) {
        this.KYCStatus.TransactionNo = res.Data.TransactionNo
        this.getGoDigitKYCStatus(this.KYCStatus)
      }
    });
  }

  breakIn(TransactionNo) {
    this._tataAIAMotorService.BreakIn(TransactionNo).subscribe((res) => {
      if (res.Success) {

        let Rule: IFilterRule[] = [
          {
            Field: "TransactionNo",
            Operator: "contains",
            Value: TransactionNo
          }
        ]

        this._column.FilterConditions.Rules = Rule;
        this._loadLists();

        this._alertservice.raiseSuccessAlert(res.Message);

      } else {
        this._alertservice.raiseErrorAlert(res.Message);
      }
    });
  }

 public getPaymentStatus(obj) {
    this._bajajService.getPaymentStatus(obj.Id).subscribe((res) => {
      if (res.Success) {

        let Rule: IFilterRule[] = [
          {
            Field: "TransactionNo",
            Operator: "contains",
            Value: obj.TransactionNo
          }
        ]

        this._column.FilterConditions.Rules = Rule;
        this._loadLists();

        this._alertservice.raiseSuccessAlert(res.Message);

      } else {
        this._alertservice.raiseErrorAlert(res.Message);
      }
    });
  }

  public TATAAIAKYCPopUp(res: any) {
    /**
     *  KYC OBJECT
     *
     */

    let KYCdata: ITataAIAkycdto = new TataAIAkycdto();
    if (res.Data.CustomerType == MotorCustomerTypeEnum.Individual) {
      KYCdata.Name = this._fullName(
        res.Data.FirstName,
        res.Data.LastName,
        res.Data.MiddleName
      );
      KYCdata.isCorporate = false;
      KYCdata.DOB = this._datePipe.transform(res.Data.DOB, 'yyyy-MM-dd');
    } else if (res.Data.CustomerType == MotorCustomerTypeEnum.Corporate) {
      KYCdata.Name = res.Data.CompanyName;
      KYCdata.isCorporate = true;
      KYCdata.DOB = this._datePipe.transform(res.Data.DOB, 'yyyy-MM-dd');
    } else {
    }
    KYCdata.TransactionNo = res.Data.TransactionNo;
    KYCdata.PanNUMBER = res.Data.MotorProposalTataAIADetail.PanNo;

    /** KYC */

    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '20vw';
    dialogConfig.minWidth = '20vw';
    dialogConfig.minHeight = 'fit-content';
    dialogConfig.maxHeight = '45vh';

    dialogConfig.data = {
      title: 'KYC',
      kycdetails: KYCdata,
      ispopup: true,
    };

    const dialogRef = this.dialog.open(KYCPopUpComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((kycres) => {
      if (kycres) {
        // Payment
        this._tataAIAMotorService.Payment(KYCdata.TransactionNo).subscribe((res) => {
          if (res.Success) {
            this._quoteService.openWindowWithPost(res.Data.PaymentURL, null);
          } else {
            this._alertservice.raiseErrorAlert(res.Message);
          }
        });
      }
    });
  }

  // change page limit
  public setLimit(value) {
    this.pagefilters.limit = value;
    this._loadLists();
  }

  // pagination for next page
  public nextPage() {
    this.pagefilters.currentPage = this.pagefilters.currentPage + 1;
    this._loadLists();
  }

  // pagination for prev page
  public previousPage() {
    this.pagefilters.currentPage = this.pagefilters.currentPage - 1;
    this._loadLists();
  }

  //#region Go Digit Plan

  CheckGoDigitKYCStatus(TransactionNo) {
    if (TransactionNo != "" && TransactionNo != null) {
      this.KYCStatus.TransactionNo = TransactionNo.toString()

      this._goDigitService.StatusKYCCheck(this.KYCStatus).subscribe((response) => {
        this._loadLists();
      });
    }
    else {
      this._alertservice.raiseSuccessAlert("Transaction No is required")
    }
  }

  getGoDigitKYCStatus(data: any) {
    this._goDigitService.StatusKYCCheck(data).subscribe((response) => {

      if (response.Data.KYCVerificationStatus.toUpperCase() == "DONE") {
        this._alertservice.raiseSuccessAlert(response.Message);
        this._loadLists();
      }
      else {
        if (response.Data.Link != "" && response.Data.Link != null) {
          location.href = response.Data.Link
        }
        else {
          // KYC URL not found
          this._alertservice.raiseErrorAlert('Something went wrong, Please try after sometime.', true);
        }
      }
    });
  }

  getGoDigitPaymentStatus(data: any) {
    this._goDigitService.PaymentStatus(data).subscribe((response) => {

      if (response.Data != null) {

        if (response.Data.PaymentUrl != "" && response.Data.PaymentUrl != null) {
          location.href = response.Data.PaymentUrl
        }
        else {
          this._alertservice.raiseSuccessAlert(response.Message)
          this._loadLists();
        }

      }
      else {
        this._alertservice.raiseErrorAlert(response.Message)
      }

    });
  }

  //#endregion

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
            this.MotorList.next(res);
          }
        },
        (err) => {
          // this.alertService.handleError(err);
        }
      );
  }

  // full name for KYC
  private _fullName(FName: string, LName: string, MName?: string) {
    let Name: string;
    if (MName) {
      Name = FName.concat(' ', MName, ' ', LName);
    } else {
      Name = FName.concat(' ', LName);
    }
    return Name;
  }

  private _convertToTransaction(id) {
    this._router.navigate([ROUTING_PATH.Master.TransactionEntry.MotorPolicyConvert + "/" + id])
  }

  // #endregion private methods
}
