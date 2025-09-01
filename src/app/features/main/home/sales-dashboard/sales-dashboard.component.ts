import { DatePipe, Location, } from '@angular/common';
import { Component, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { DisplayedDashboardMonth } from '@config/dashboard';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { CurrencyFormatterWithoutSymbol, IAdditionalFilterObject, IFilterRule, precisionformatter, QuerySpecs } from '@models/common';
import { ISalesDashboardDataDto, ISalesDashboardPolicyTypeDataDto, ISalesDshboardCategoryDto, MonthWisePolicy } from '@models/dtos';
import { UserProfile } from '@models/dtos/auth';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { IFinancialYearDto } from '@models/dtos/core/FinancialYearDto';
import { IUserDto } from '@models/dtos/core/userDto';
import { AuthService } from '@services/auth/auth.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { BaseChartDirective } from 'ng2-charts';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { UserTypeEnum } from 'src/app/shared/enums';
const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }
@Component({
  selector: 'gnx-sales-dashboard',
  templateUrl: './sales-dashboard.component.html',
  styleUrls: ['./sales-dashboard.component.scss'],
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
export class SalesDashboardComponent {
  //#region public properties
  @ViewChildren(BaseChartDirective) charts: any | undefined;

  public salesDashboardData: ISalesDashboardDataDto
  public currentDate = new Date();
  public userProfileObj:UserProfile;

  //formgroup
  public salesDashboardFilterForm: FormGroup;
  public salesDashboardFilterData: any;

  // Array List
  public branchs: IBranchDto[] = [];
  FinancialYearList: IFinancialYearDto[] = []
  public salesPersonList$: Observable<IUserDto[]> // Observable of user list
  public VerticalHeadList$: Observable<IUserDto[]> // Observable of user list
  public BDOList$: Observable<IUserDto[]> // Observable of user list
  public BDMList$: Observable<IUserDto[]> // Observable of user list


  public policyWiseDoughnutChartClolor = [
    { PolicyType: 'Rollover', color: '#007f73' },
    { PolicyType: 'New', color: '#00b050' },
    { PolicyType: 'Renewal-Change Company', color: '#ff33d3' },
    { PolicyType: 'Renewal-Same Company', color: '#4472c4' },
    { PolicyType: 'Endorsement-Financial', color: '#ffc000' },
    { PolicyType: 'Endorsement-Non Financial', color: '#a503fc' },
    { PolicyType: 'Installment', color: '#219b9d' }
  ]

  // -----------------------------------------------------------------------------------------------------
  // @ Policy Type Wise Policy Count
  // @ Doughnut Chart
  // -----------------------------------------------------------------------------------------------------
  public doughnutChartLabels: string[] = [];
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      label: '',
      data: [],
      backgroundColor: [],
      hoverOffset: 4,
    }],
  };
  public doughnutChartType: ChartType = 'doughnut';
  public chartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        align: 'center',
        spacing: 15,
        labels: {
          fontSize: 10,
          usePointStyle: true,
          padding: 20
        },
      },
      datalabels: {
        color: '#4472c4',
        anchor: 'end',
        align: 'end',
        font: {
          size: 10,
        },
        formatter: (value: number) => {
          return CurrencyFormatterWithoutSymbol(value); // Format number with commas (e.g., 1,000 or 5,000)
        }
      },
      title: {
        display: true,
        text: 'Policy Type wise Policy Counts',
        padding: {
          bottom: 30
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const chartElement = elements[0];
        const index = chartElement.index;

        /**
         * Click on Chart re direct on Transaction List Page
         */
        let policyType = this.doughnutChartData.labels[index]
        this._redirectTransactionList('','',policyType,'','')
      }
    }
  };

  // -----------------------------------------------------------------------------------------------------
  // @ Category-wise GP
  // @ bar Chart
  // -----------------------------------------------------------------------------------------------------
  public barChartType: ChartType = 'bar';
  public barChartPlugins = [DataLabelsPlugin];
  public barChart1Options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false // Hide vertical grid lines
        }
      },
      y: {
        title: {
          display: true,
          text: 'GP'
        },
        ticks: {
          beginAtZero: true,
          callback: function (value) {
            return precisionformatter(value,false);
          }

        }
      }
    },
    plugins: {
      legend: {
        display: false,
        position: 'bottom'
      },
      datalabels: {
        color: '#d91656',
        anchor: 'end',
        align: 'end',
        textAlign: 'center',
        formatter: (value, context) => {
          const dataIndex = context.dataIndex;
          // Convert the value to crores 
          const croreValue =  precisionformatter(value);
          const percentage = this.barChart1Percentage[dataIndex] + '%';

          return `( ${percentage} )` + `\n` + croreValue;
          // return `<span style="color: red;">( ${percentage} )</span>` + `\n` + `<span style="color: green;">${croreValue}</span>`;
        },
        font: {
          size: 10,
        }
      },
      title: {
        display: true,
        text: 'Category-Wise GP',
        padding: {
          bottom: 30
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const chartElement = elements[0];
        const index = chartElement.index;

        /**
         * Click on Chart re direct on Transaction List Page
         */
        let categoryCode = this.barChart1CategoryCode[index]
        let categoryName = this.barChart1Data.labels[index]
        this._redirectTransactionList(categoryCode, categoryName,'', '', '')
      }
    }

  };

  public barChart1Percentage: number[] = [];
  public barChart1CategoryCode: string[] = [];
  public barChart1Labels: string[] = [];
  public barChart1Data: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: '',
      data: [],
      barPercentage: 0.7,
      maxBarThickness: 40,
      borderRadius: 5,
      backgroundColor: '#00b050',
      minBarLength: 2,
    }],
  };

  // -----------------------------------------------------------------------------------------------------
  // @ Category-wise Policy
  // @ bar Chart
  // -----------------------------------------------------------------------------------------------------
  public barChart2Percentage: number[] = [];
  public barChart2CategoryCode: string[] = [];
  public barChart2Labels: string[] = [];
  public barChart2Data: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: '',
      data: [],
      barPercentage: 0.7,
      maxBarThickness: 40,
      borderRadius: 5,
      backgroundColor: '#d91656',
      minBarLength: 2,
    }],
  };

  public barChart2Options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false // Hide vertical grid lines
        }
      },
      y: {
          title: {
            display: true,
            text: 'No. Of Policies'
          },
        ticks: {
          beginAtZero: true,
          callback: function (value) {
            return precisionformatter(value, false);
          }

        }
      }
    },
    plugins: {
      legend: {
        display: false,
        position: 'bottom'
      },
      datalabels: {
        color: '#00b050',
        anchor: 'end',
        align: 'end',
        textAlign: 'center',
        formatter: (value, context) => {
          const dataIndex = context.dataIndex;

          const percentage = this.barChart2Percentage[dataIndex] + '%';
          return `( ${percentage} )` + `\n` + CurrencyFormatterWithoutSymbol(value);
        },
        font: {
          size: 10,
        }
      },
      title: {
        display: true,
        text: 'Category-Wise Policy',
        padding: {
          bottom: 30
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const chartElement = elements[0];
        const index = chartElement.index;

        /**
         * Click on Chart re direct on Transaction List Page
         */
        let categoryCode = this.barChart2CategoryCode[index]
        let categoryName = this.barChart2Data.labels[index]
        this._redirectTransactionList(categoryCode, categoryName,'','','')
      }
    }
  };

  // -----------------------------------------------------------------------------------------------------
  // @ Category-wise Policy
  // @ mixed Chart
  // -----------------------------------------------------------------------------------------------------
  public mixChartDataChartMonth:number[] = []
  public mixChartType: ChartType = 'bar';
  public mixChartLabels: string[] = [];
  public mixChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false // Hide vertical grid lines
        }
      },
      y: {
        title: {
          display: true,
          text: 'No. Of Policies'
        },
        ticks: {
          padding: 2,
          font: {
            size: 10
          },
          beginAtZero: true,
          callback: function (value) {
            return precisionformatter(value, false);
          }
        },
        // First Y-axis configuration (primary axis)
      },
      y2: {
        title: {
          display: true,
          text: 'Total Amount'  // Change this to the label for your second Y-axis
        },
        position: 'right',  // Position it on the right side
        ticks: {
          padding: 2,
          font: {
            size: 10
          },
          
          beginAtZero: true,
          callback: function (value) {
            return precisionformatter(value, false);
          }
        },
        grid: {
          drawOnChartArea: false, // This makes the grid line visible on this axis as well
        },
        // Second Y-axis configuration (secondary axis)
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      datalabels: {
        // color: '#007f73',
        // backgroundColor:'#ffffff',
        display: true,
        anchor: 'end',
        align: 'end',
        font: {
          size: 10,
        },
      },
      title: {
        display: true,
        text: 'Month wise Policy vs Cp',
        padding: {
          bottom: 30
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const chartElement = elements[0];
        const index = chartElement.index;

        /**
         * Click on Chart re direct on Transaction List Page
         */
        let month = this.mixChartDataChartMonth[index]
        let monthName = this.mixChartData.labels[index]
        this._redirectTransactionList('', '', '', month, monthName)
      }
    }
  };
  public mixChartData: ChartData<'bar' | 'line'> = {
    labels: [],
    datasets: [
      {
        type: 'bar',
        label: 'Policy',
        data: [],
        backgroundColor: '#4472c4',
        barPercentage: 0.7,
        maxBarThickness: 40,
        borderRadius: 5,
        minBarLength: 2,
        yAxisID: 'y',  // Primary Y-axis,
        order: 2,
        datalabels: {
          padding: 15,
          anchor: 'end',
          align: 'end',
          // position: 'top',  // Place data labels at the top of the bars
          formatter: (value: number) => {
            return CurrencyFormatterWithoutSymbol(value); // Format number with commas (e.g., 1,000 or 5,000)
          }
        }
      },
      {
        type: 'line',
        label: 'CP_Total',
        data: [],
        borderColor: '#ff0000',
        backgroundColor: '#ff0000',
        fill: false,
        yAxisID: 'y2',  // Secondary Y-axis
        order: 1,

        datalabels: {
          anchor: 'center',
          align: 'end',
          color: '#54bfd1',
          formatter: (value, context) => {
            const dataIndex = context.dataIndex;
            // Convert the value to crores 
            const croreValue = precisionformatter(value);
            return croreValue;
          },
          font: {
            weight: 'bold'
          }
        }
      }
    ],
  };



  //#endregion


  //#region private properties

  private _destroy$: Subject<any>;
  //#endregion


  //#region  constructor

  constructor(
    private _httpService: HttpService,
    private _masterListService: MasterListService,
    private _fb: FormBuilder,
    private _dialog: MatDialog,
    private _datePipe: DatePipe,
    private _router:Router,
    private _Location: Location,
    private _authService:AuthService
  ) {
    this._destroy$ = new Subject();
    this.userProfileObj = this._authService._userProfile.value
  }

  //#endregion constructor


  //#region public-getters

  public get monthDrpList(): any {
    return DisplayedDashboardMonth;
  }

// IF login by BDM - Hide  Vertical Head
// IF Login by BDO - Hide  Vertical Head
// IF Login by POSP / Team Reference - Hide Vertical Head Field 
  public get canDisplayVerticleHead(): boolean {
    if (this.userProfileObj.IsAdmin) {
      return true;
    } else {
      if (this.userProfileObj.UserType == UserTypeEnum.StandardUser) {
        if (this.userProfileObj.IsBDM || this.userProfileObj.IsBDO) {
          return false
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  }

  // IF login by BDM - Hide BDM
  // IF Login by BDO - Hide BDM
  // IF Login by POSP / Team Reference - Hide BDM Field 
  public get canDisplayBDM():boolean{
    if (this.userProfileObj.IsAdmin) {
      return true;
    } else {
      if (this.userProfileObj.UserType == UserTypeEnum.StandardUser) {
        if (this.userProfileObj.IsBDM || this.userProfileObj.IsBDO) {
          return false
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  }

  // IF Login by BDO - Hide  BDO 
  // IF Login by POSP / Team Reference - Hide BDO Field 
  public get canDisplayBDO():boolean{
    if (this.userProfileObj.IsAdmin) {
      return true;
    } else {
      if (this.userProfileObj.UserType == UserTypeEnum.StandardUser) {
        if (this.userProfileObj.IsBDO) {
          return false
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  }

  // IF Login by POSP / Team Reference - Hide POSP Field 
  public get canDisplayPOSP():boolean{
    if (this.userProfileObj.IsAdmin) {
      return true;
    } else {
      if (this.userProfileObj.UserType == UserTypeEnum.Agent || this.userProfileObj.UserType == UserTypeEnum.TeamReference ) {
          return false;
      } else {
        return true;
      }
    }
  }
  //#endregion


  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    this.salesDashboardFilterForm = this._initFilterForm()
    this._fillMasterList()
    this._onFormChange()
  }


  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public autocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, SelectedFor: string): void {
    switch (SelectedFor) {
      case "Sales":
        this.salesDashboardFilterForm.patchValue({
          SalesPersonName: event.option.value.FullName,
          SalesPersonId: event.option.value.Id,
        });
        break;

      case "VerticalHead":
        this.salesDashboardFilterForm.patchValue({
          VerticalHeadName: event.option.value.FullName,
          VerticalHeadId: event.option.value.Id,
        })
        break;

      case "BDM":
        this.salesDashboardFilterForm.patchValue({
          BDMName: event.option.value.FullName,
          BDMId: event.option.value.Id,
        })
        break;

      case "BDO":
        this.salesDashboardFilterForm.patchValue({
          BDOName: event.option.value.FullName,
          BDOId: event.option.value.Id,
        })
        break;

      default:
        break;
    }

  }

  public autocompleteCleardEvent(SelectedFor: string): void {
    switch (SelectedFor) {
      case "Sales":
        this.salesDashboardFilterForm.patchValue({
          SalesPersonName: null,
          SalesPersonId: null,
        });
        break;

      case "VerticalHead":
        this.salesDashboardFilterForm.patchValue({
          VerticalHeadName: null,
          VerticalHeadId: null,
        })
        break;

      case "BDM":
        this.salesDashboardFilterForm.patchValue({
          BDMName: null,
          BDMId: null,
        })
        break;

      case "BDO":
        this.salesDashboardFilterForm.patchValue({
          BDOName: null,
          BDOId: null,
        })
        break;

      default:
        break;
    }

  }

  // /* Pop Up for Name of the Insurance Company
  //  * @param type:to identify api of which list is to be called
  //   * @param title: title that will be displayed on PopUp
  //   * /
  public openDiolog(type: string, title: string, openFor: string): void {
    let Rule: IFilterRule[] = [];
    let AdditionalFilters: IAdditionalFilterObject[] = []

    switch (openFor) {
      case "Sales":
        Rule = [ActiveMasterDataRule]

        AdditionalFilters.push({
          key: 'UserType',
          filterValues: [UserTypeEnum.Agent, UserTypeEnum.TeamReference]
        })


        if (this.salesDashboardFilterForm.get('BranchId').value) {
          AdditionalFilters.push({ key: "Branch", "filterValues": [this.salesDashboardFilterForm.get('BranchId').value?.toString()] })
        }

        if (this.salesDashboardFilterForm.get('BDOId').value) {
          AdditionalFilters.push({ key: "BDOBDMId", "filterValues": [this.salesDashboardFilterForm.get('BDOId').value?.toString()] })
        }else if (this.salesDashboardFilterForm.get('BDMId').value) {
          AdditionalFilters.push({ key: "BDOBDMId", "filterValues": [this.salesDashboardFilterForm.get('BDMId').value?.toString()] })
        }
        break;

      case "VerticalHead":
        Rule = [ActiveMasterDataRule]

        AdditionalFilters.push({ key: 'VerticleHeadOnly', filterValues: ['true'] })
        AdditionalFilters.push({ key: 'UserType', filterValues: [UserTypeEnum.StandardUser] })

        if (this.salesDashboardFilterForm.get('BranchId').value) {
          AdditionalFilters.push({ key: "Branch", "filterValues": [this.salesDashboardFilterForm.get('BranchId').value?.toString()] })
        }
        break;

      case "BDM":
        Rule = [ActiveMasterDataRule]

        AdditionalFilters.push({ key: 'BDMOnly', filterValues: ['true'] })

        AdditionalFilters.push({
          key: 'UserType',
          filterValues: [UserTypeEnum.StandardUser]
        })

        if (this.salesDashboardFilterForm.get('VerticalHeadId').value) {
          AdditionalFilters.push({ key: "VerticleHeadId", "filterValues": [this.salesDashboardFilterForm.get('VerticalHeadId').value?.toString()] })
        }

        if (this.salesDashboardFilterForm.get('BranchId').value) {
          AdditionalFilters.push({ key: "Branch", "filterValues": [this.salesDashboardFilterForm.get('BranchId').value?.toString()] })
        }
        break;

      case "BDO":
        Rule = [ActiveMasterDataRule]

        AdditionalFilters.push({ key: 'BDOOnly', filterValues: ['true'] })

        AdditionalFilters.push({
          key: 'UserType',
          filterValues: [UserTypeEnum.StandardUser]
        })

        if (this.salesDashboardFilterForm.get('VerticalHeadId').value) {
          AdditionalFilters.push({ key: "VerticleHeadId", "filterValues": [this.salesDashboardFilterForm.get('VerticalHeadId').value?.toString()] })
        }
        
        if (this.salesDashboardFilterForm.get('BDMId').value) {
          AdditionalFilters.push({ key: "BDMId", "filterValues": [this.salesDashboardFilterForm.get('BDMId').value?.toString()] })
        }

        if (this.salesDashboardFilterForm.get('BranchId').value) {
          AdditionalFilters.push({ key: "Branch", "filterValues": [this.salesDashboardFilterForm.get('BranchId').value?.toString()] })
        }
        break;

      default:
        break;
    }


    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      type: type,
      title: title,
      ispopup: true,
      filterData: Rule,
      addFilterData: AdditionalFilters
    };

    const dialogRef = this._dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        switch (openFor) {
          case "Sales":
            this.salesDashboardFilterForm.patchValue({
              SalesPersonName: result.FullName,
              SalesPersonId: result.Id,
            });
            break;

          case "VerticalHead":
            this.salesDashboardFilterForm.patchValue({
              VerticalHeadName: result.FullName,
              VerticalHeadId: result.Id,
            });
            break;

          case "BDM":
            this.salesDashboardFilterForm.patchValue({
              BDMName: result.FullName,
              BDMId: result.Id,
            });
            break;

          case "BDO":
            this.salesDashboardFilterForm.patchValue({
              BDOName: result.FullName,
              BDOId: result.Id,
            });
            break;

          default:
            break;
        }
      }

    })
  }

  public searchFiltervalue(): void {
    this._getSalesdashboardData()
  }

  public resetFiltervalue(): void {

    this.salesDashboardFilterForm.patchValue({
      Month: null,
      FinancialYearId: null,
      BranchId: null,
      VerticalHeadId: null,
      VerticalHeadName: null,
      BDMId: null,
      BDMName: null,
      BDOId: null,
      BDOName: null,
      SalesPersonId: null,
      SalesPersonName: null,
    }, { emitEvent: false })

    this._setDefaultFilterData();
    this._getSalesdashboardData();
    this._Location.replaceState(ROUTING_PATH.Basic.SalesDashboard,'',{})
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _initFilterForm(): FormGroup {
    let fg = this._fb.group({
      Month: [],
      FinancialYearId: [],
      BranchId: [],
      VerticalHeadId: [0],
      VerticalHeadName: [''],
      BDMId: [],
      BDMName: [],
      BDOId: [],
      BDOName: [],
      SalesPersonId: [],
      SalesPersonName: [],
    });

    return fg;

  }


  private _fillMasterList(): void {

    // fill Branch
    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List + "/true", 'Name', "", [ActiveMasterDataRule])
      .subscribe(res => {
        if (res.Success) {
          this.branchs = res.Data.Items
        }
      });

    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.FinancialYear.List, 'FYCode', "", [ActiveMasterDataRule])
      .subscribe(res => {
        if (res.Success) {
          this.FinancialYearList = res.Data.Items

          let salesDashBoardData:any = this._Location.getState();
          
          if (salesDashBoardData && salesDashBoardData?.salesDashboardFilterData && salesDashBoardData?.salesDashboardFilterData?.salesDashboardFilterData
){
            this.salesDashboardFilterForm.patchValue(salesDashBoardData.salesDashboardFilterData.salesDashboardFilterData ,{emitEvent:false})
          }else{
            this._setDefaultFilterData();
          }

         

          this._getSalesdashboardData()
        }
      });
  }


  private _setDefaultFilterData(){
    let currectFinancialYear = this.FinancialYearList.filter(year =>
      (year.FromDate <= this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')) &&
      (year.ToDate >= this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')))

    if (currectFinancialYear && currectFinancialYear?.length > 0) {
      this.salesDashboardFilterForm.patchValue({
        FinancialYearId: currectFinancialYear[0].Id
      })
    } else {
      if (this.FinancialYearList?.length > 0) {
        this.salesDashboardFilterForm.patchValue({
          FinancialYearId: this.FinancialYearList[0].Id
        })
      }
    }
  }



  private _onFormChange(): void {



    // changes Branch
    this.salesDashboardFilterForm.get('BranchId').valueChanges.subscribe(val => {
      this.salesDashboardFilterForm.patchValue({
        VerticalHeadId: null,
        VerticalHeadName: null,
        SalesPersonId: null,
        SalesPersonName: null,
        BDMName: null,
        BDMId: null,
        BDOName: null,
        BDOId: null,
      }, { emitEvent: false });
    })

    // changes Branch
    this.salesDashboardFilterForm.get('VerticalHeadId').valueChanges.subscribe(val => {
      this.salesDashboardFilterForm.patchValue({
        SalesPersonId: null,
        SalesPersonName: null,
        BDMName: null,
        BDMId: null,
        BDOName: null,
        BDOId: null,
      }, { emitEvent: false });
    })

    // changes Branch
    this.salesDashboardFilterForm.get('BDMId').valueChanges.subscribe(val => {
      this.salesDashboardFilterForm.patchValue({
        SalesPersonId: null,
        SalesPersonName: null,
        BDOName: null,
        BDOId: null,
      }, { emitEvent: false });
    })

    // changes Branch
    this.salesDashboardFilterForm.get('BDOId').valueChanges.subscribe(val => {
      this.salesDashboardFilterForm.patchValue({
        SalesPersonId: null,
        SalesPersonName: null,
      }, { emitEvent: false });
    })


    // change sales person
    this.salesDashboardFilterForm.get('VerticalHeadName').valueChanges.subscribe((val) => {

      let Rule: IFilterRule[] = [ActiveMasterDataRule];

      let AdditionalFilters: IAdditionalFilterObject[] = [
        { key: "FullName", filterValues: [val] },
        { key: 'VerticleHeadOnly', filterValues: ['true'] },
        { key: 'UserType', filterValues: [UserTypeEnum.StandardUser] }
      ]

      if (this.salesDashboardFilterForm.get('BranchId').value) {
        AdditionalFilters.push({ key: "Branch", "filterValues": [this.salesDashboardFilterForm.get('BranchId').value?.toString()] })
      }

      this.VerticalHeadList$ = this._masterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", Rule, AdditionalFilters)
        .pipe(
          takeUntil(this._destroy$),
          switchMap((res) => {
            if (res.Success) {
              if (res.Data.Items.length) {
                return of(res.Data.Items);
              } else {
                return of([]);
              }
            } else {
              return of([]);
            }
          })
        );
    });


    // change sales person
    this.salesDashboardFilterForm.get('BDMName').valueChanges.subscribe((val) => {

      let Rule: IFilterRule[] = [ActiveMasterDataRule];

      let AdditionalFilters: IAdditionalFilterObject[] = [
        { key: "FullName", filterValues: [val] },
        { key: 'BDMOnly', filterValues: ['true'] },
        {
          key: 'UserType',
          filterValues: [UserTypeEnum.StandardUser]
        }
      ]

      if (this.salesDashboardFilterForm.get('BranchId').value) {
        AdditionalFilters.push({ key: "Branch", "filterValues": [this.salesDashboardFilterForm.get('BranchId').value?.toString()] })
      }

      if (this.salesDashboardFilterForm.get('VerticalHeadId').value) {
        AdditionalFilters.push({ key: "VerticleHeadId", "filterValues": [this.salesDashboardFilterForm.get('VerticalHeadId').value?.toString()] })
      }

      this.BDMList$ = this._masterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", Rule, AdditionalFilters)
        .pipe(
          takeUntil(this._destroy$),
          switchMap((res) => {
            if (res.Success) {
              if (res.Data.Items.length) {
                return of(res.Data.Items);
              } else {
                return of([]);
              }
            } else {
              return of([]);
            }
          })
        );
    });


    // change sales person
    this.salesDashboardFilterForm.get('BDOName').valueChanges.subscribe((val) => {

      let Rule: IFilterRule[] = [ActiveMasterDataRule];

      let AdditionalFilters: IAdditionalFilterObject[] = [
        { key: "FullName", filterValues: [val] },
        { key: 'BDOOnly', filterValues: ['true'] },
        {
          key: 'UserType',
          filterValues: [UserTypeEnum.StandardUser]
        }
      ]

      if (this.salesDashboardFilterForm.get('BranchId').value) {
        AdditionalFilters.push({ key: "Branch", "filterValues": [this.salesDashboardFilterForm.get('BranchId').value?.toString()] })
      }

      if (this.salesDashboardFilterForm.get('BDMId').value) {
        AdditionalFilters.push({ key: "BDMId", "filterValues": [this.salesDashboardFilterForm.get('BDMId').value?.toString()] })
      }

      if (this.salesDashboardFilterForm.get('VerticalHeadId').value) {
        AdditionalFilters.push({ key: "VerticleHeadId", "filterValues": [this.salesDashboardFilterForm.get('VerticalHeadId').value?.toString()] })
      }

      this.BDOList$ = this._masterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", Rule, AdditionalFilters)
        .pipe(
          takeUntil(this._destroy$),
          switchMap((res) => {
            if (res.Success) {
              if (res.Data.Items.length) {
                return of(res.Data.Items);
              } else {
                return of([]);
              }
            } else {
              return of([]);
            }
          })
        );
    });


    // change sales person
    this.salesDashboardFilterForm.get('SalesPersonName').valueChanges.subscribe((val) => {

      let Rule: IFilterRule[] = [ActiveMasterDataRule];

      let AdditionalFilters: IAdditionalFilterObject[] = [
        { key: "FullName", filterValues: [val] },
        {
          key: 'UserType',
          filterValues: [UserTypeEnum.Agent, UserTypeEnum.TeamReference]
        }
      ]

      if (this.salesDashboardFilterForm.get('BranchId').value) {
        AdditionalFilters.push({ key: "Branch", "filterValues": [this.salesDashboardFilterForm.get('BranchId').value?.toString()] })
      }

      if (this.salesDashboardFilterForm.get('BDOId').value) {
        AdditionalFilters.push({ key: "BDOBDMId", "filterValues": [this.salesDashboardFilterForm.get('BDOId').value?.toString()] })
      }else if (this.salesDashboardFilterForm.get('BDMId').value) {
        AdditionalFilters.push({ key: "BDOBDMId", "filterValues": [this.salesDashboardFilterForm.get('BDMId').value?.toString()] })
      }

      this.salesPersonList$ = this._masterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", Rule, AdditionalFilters)
        .pipe(
          takeUntil(this._destroy$),
          switchMap((res) => {
            if (res.Success) {
              if (res.Data.Items.length) {
                return of(res.Data.Items);
              } else {
                return of([]);
              }
            } else {
              return of([]);
            }
          })
        );
    });


  }

  private _getSalesdashboardData(): void {
    this.salesDashboardFilterData = this.salesDashboardFilterForm.getRawValue()
    let specs = this._getFilter();
    let api = API_ENDPOINTS.Dashboard.salesDashboard
    this._httpService.getData(specs, api).subscribe(res => {
      if (res.Success) {
        this.salesDashboardData = res.Data

        // -----------------------------------------------------------------------------------------------------
        // @ Policy Type Wise Policy Count
        // @ Doughnut Chart
        // -----------------------------------------------------------------------------------------------------
        let tempColorSet = []
        this.doughnutChartData.datasets[0].backgroundColor = [];
        this.doughnutChartData.labels = [];
        this.doughnutChartData.datasets[0].data = [];
        if (res.Data && res.Data?.PolicyTypeWiseCount && res.Data?.PolicyTypeWiseCount?.length > 0) {

          res.Data.PolicyTypeWiseCount.forEach((ele: ISalesDashboardPolicyTypeDataDto) => {

            this.doughnutChartData.labels.push(ele.PolicyTypeName)
            this.doughnutChartData.datasets[0].data.push(ele.PolicyCount)

            let color: string = this.policyWiseDoughnutChartClolor.find(item => item.PolicyType == ele.PolicyType).color;
            if (color) {
              tempColorSet.push(color)
            }
          })
          this.doughnutChartData.datasets[0].backgroundColor = tempColorSet
        }

        // -----------------------------------------------------------------------------------------------------
        // @ Category-wise GP
        // @ bar Chart
        // -----------------------------------------------------------------------------------------------------
        this.barChart1Percentage = [];
        this.barChart1CategoryCode = []
        this.barChart1Data.labels = [];
        this.barChart1Data.datasets[0].data = [];
        if (res.Data && res.Data?.CategoryWiseGP && res.Data?.CategoryWiseGP?.length > 0) {

          res.Data.CategoryWiseGP.forEach((ele: ISalesDshboardCategoryDto) => {
            this.barChart1Percentage.push(ele.Per)
            this.barChart1CategoryCode.push(ele.CategoryCode)
            this.barChart1Data.labels.push(ele.CategoryName)
            this.barChart1Data.datasets[0].data.push(ele.TotalAmount)
          })
        }


        // -----------------------------------------------------------------------------------------------------
        // @ Category-wise Policy
        // @ bar Chart
        // -----------------------------------------------------------------------------------------------------
        this.barChart2Percentage = []
        this.barChart2CategoryCode = []
        this.barChart2Data.labels = []
        this.barChart2Data.datasets[0].data = []
        if (res.Data && res.Data?.CategoryWisePolicy && res.Data?.CategoryWisePolicy?.length > 0) {

          res.Data.CategoryWisePolicy.forEach(ele => {
            this.barChart2Percentage.push(ele.Per)
            this.barChart2CategoryCode.push(ele.CategoryCode)
            this.barChart2Data.labels.push(ele.CategoryName)
            this.barChart2Data.datasets[0].data.push(ele.TotalAmount)
          })
        }

        // -----------------------------------------------------------------------------------------------------
        // @ Month Wise Policy VS CP
        // @ mixed Chart
        // -----------------------------------------------------------------------------------------------------
        this.mixChartDataChartMonth = [];
        this.mixChartData.labels = [];
        this.mixChartData.datasets[0].data = [];
        this.mixChartData.datasets[1].data = [];
        if (res.Data && res.Data?.MonthWisePolicyVSCP && res.Data?.MonthWisePolicyVSCP?.length > 0) {

          res.Data.MonthWisePolicyVSCP.forEach((ele: MonthWisePolicy) => {
            this.mixChartDataChartMonth.push(ele.Month)
            this.mixChartData.labels.push(ele.MonthName)
            this.mixChartData.datasets[0].data.push(ele.TotalPolicy)

            this.mixChartData.datasets[1].data.push(ele.TotalAmount)
          })
        }

        (this.charts._results.forEach((e) => {
          e.update();
          e.render();
        }))
      }

    })

  }


  /**
   * Get Sales dashboard data
   */
  private _getFilter(): QuerySpecs {
    let specs = new QuerySpecs();
    specs.PaginationSpecs.PaginationRequired = false;
    specs.PaginationSpecs.Limit = 50;
    specs.FilterConditions.Rules = []
    specs.AdditionalFilters = []

    if (this.salesDashboardFilterForm.get('FinancialYearId').value) {
      specs.AdditionalFilters.push(
        { key: 'FinancialYearId', filterValues: [this.salesDashboardFilterForm.get('FinancialYearId').value.toString()] }
      )
    }

    if (this.salesDashboardFilterForm.get('Month').value) {
      specs.AdditionalFilters.push(
        { key: 'Month', filterValues: [this.salesDashboardFilterForm.get('Month').value.toString()] }
      )
    }

    if (this.salesDashboardFilterForm.get('BranchId').value) {
      specs.AdditionalFilters.push(
        { key: 'BranchId', filterValues: [this.salesDashboardFilterForm.get('BranchId').value.toString()] }
      )
    }

    if (this.salesDashboardFilterForm.get('SalesPersonId').value) {
      specs.AdditionalFilters.push(
        { key: 'AgentOrTealLeadId', filterValues: [this.salesDashboardFilterForm.get('SalesPersonId').value.toString()] }
      )
    } else if (this.salesDashboardFilterForm.get('BDOId').value) {
      specs.AdditionalFilters.push(
        { key: 'BDOId', filterValues: [this.salesDashboardFilterForm.get('BDOId').value.toString()] }
      )
    } else if (this.salesDashboardFilterForm.get('BDMId').value) {
      specs.AdditionalFilters.push(
        { key: 'BDMId', filterValues: [this.salesDashboardFilterForm.get('BDMId').value.toString()] }
      )
    }  else if (this.salesDashboardFilterForm.get('VerticalHeadId').value) {
      specs.AdditionalFilters.push(
        { key: 'VerticleHeadId', filterValues: [this.salesDashboardFilterForm.get('VerticalHeadId').value.toString()] }
      )
    }




    return specs;
  }


  // Navigate on transaction list
  private _redirectTransactionList(CategoryCode, CategoryName, PolicyType, Month, MonthName){

    let graphdata = {
      CategoryCode: CategoryCode,
      CategoryName: CategoryName,
      PolicyType: PolicyType,
      Month: Month,
      MonthName: MonthName,
    }

    this._router.navigate(['/app/transaction/list'], { 
      state: { 
        salesDashboardFilterData: this.salesDashboardFilterData,
        graphData: graphdata
      } 
    })
  }

  //#endregion private-methods

}
