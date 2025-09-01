import { Component, ViewChildren } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { Router } from '@angular/router';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AuthService } from '@services/auth/auth.service';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { CategoryCodeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { IAdditionalFilterObject, IFilterRule, OrderBySpecs, QuerySpecs } from '@models/common';
import { HttpService } from '@lib/services/http/http.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { BaseChartDirective } from 'ng2-charts';
import { MasterListService } from '@lib/services/master-list.service';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { IUserDto } from '@models/dtos/core/userDto';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { DisplayedDashboardPolicyType } from '@config/dashboard';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';

const ActiveMasterDataRule: IFilterRule = {Field: 'Status',Operator: 'eq',Value: 1}
@Component({
  selector: 'gnx-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
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
export class DashboardComponent {
  @ViewChildren(BaseChartDirective) charts: any | undefined;
  // #region public variables
  // Array List
  public MyPendingRequest = [];
  public subCategoryList = [];
  public categoryList = [];
  public branchs: IBranchDto[] = [];
  public salesPersonList$: Observable<IUserDto[]> // Observable of user list
  public teamLeaderList$: Observable<IUserDto[]> // Observable of user list
  //formgroup
  public filterForm:FormGroup;
  //boolean
  public isSearchOpen:boolean = false;

  // Chart data variable object & list
  public categoryBarChartClolor = [
    { category: CategoryCodeEnum.Life, color: '#c060b2' },
    { category: CategoryCodeEnum.WorkmenComp, color: '#90a2cf' },
    { category: CategoryCodeEnum.PA, color: '#2777c7' },
    { category: CategoryCodeEnum.Package, color: '#ff697b' },
    { category: CategoryCodeEnum.Miscellaneous, color: '#529adc' },
    { category: CategoryCodeEnum.Liability, color: '#c9022d' },
    { category: CategoryCodeEnum.Marine, color: '#af1357' },
    { category: CategoryCodeEnum.Travel, color: '#51c382' },
    { category: CategoryCodeEnum.Engineering, color: '#ff3399' },
    { category: CategoryCodeEnum.Fire, color: '#007693' },
    { category: CategoryCodeEnum.Health, color: '#ecc370' },
    { category: CategoryCodeEnum.Motor, color: '#5a3d9b' },
    { category: CategoryCodeEnum.Group, color: '#66be00' },
  ]

  public barChartType: ChartType = 'bar';
  public barChartPlugins = [DataLabelsPlugin];
  public barChartLabels: string[] = [];

  public barChartData: ChartData<'bar'> = {
    labels: this.barChartLabels,
    datasets: [], 
  };

  public barChart1Percentage: number[] = [];
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {},
      y: {
        title: { display: true, text: 'No. Of Policies' },
        ticks:{
          padding:2,
          font: {
            size:8
          }
        }
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      },
      datalabels: {
        anchor: 'end',
        align: 'end',
        font: {
          size: 10,
        },
        color: '#000', // Set the color of the data labels 
        // backgroundColor: '#fff', // Set the background color of the data labels
        borderRadius: 3, // Set the border radius of the data labels 
        padding: 4 ,
        textAlign:'center',
        formatter: (value, context) => {
                  const dataIndex = context.datasetIndex;
                  const percentage = this.barChart1Percentage[dataIndex] + '%';
                  return `(${percentage})` + `\n` + value;
                },
      },

      title: {
        display: true,
        text: 'Policy Counts',
        padding: {
          bottom: 50
        }
      }
    },
    layout:{
      padding:{
        top:10
      }
    }
  };
  // #endregion public variables

  //#region private properties
  private _destroy$: Subject<any>; 
  //#endregion

  /**
   * #region constructor
   * @param _fb : Formbuilder
   * @param _router: module for routing
   * @param _dashboardService 
   * @param _alertService 
   * @param _authService 
   * @param _httpService 
   * @param _masterListService 
   * @param _dialog 
   * @param _datePipe 
   */
  constructor(
    private _router: Router,
    private _dashboardService: DashboardService,
    private _alertService: AlertsService,
    private _authService: AuthService,
    private _httpService:HttpService,
    private _masterListService: MasterListService,
    private _fb:FormBuilder,
    private _dialog: MatDialog,
    private _datePipe: DatePipe,
  ) {
  this._destroy$ = new Subject();
    this._fillMasterList()
    this.filterForm = this._initFilterForm()
  }
  // #endregion constructor


 public get DisplayedDashboardPolicyType() {
      return DisplayedDashboardPolicyType;
    }

 public get canDisplayQuotation(): boolean {
    if (this._authService._userProfile.value?.AuthKeys.includes("RFQ-list")) {
      return true;
    } else {
      return false;
    }
  }

  public get canDisplayFilterFied():boolean{
    if (this._authService._userProfile.value?.IsAdmin) {
      return true;
    } else {
      if (this._authService._userProfile.value?.UserType == UserTypeEnum.Agent ||
        this._authService._userProfile.value?.UserType == UserTypeEnum.TeamReference
      ){
        return false;
      }else{
        return true;
      }
    }
  }
  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    // get my approval request list
    this.getMyApprovalRequest();
    this._getRFQdashboardData();
    this._onFormChange()

  }


  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // redirect page
  public redirectPage(StageCode): void {
    this._router.navigate([ROUTING_PATH.RFQ.List + "/" + StageCode])
  }


   public autocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, SelectedFor: string): void {
      switch (SelectedFor) {
        case "Sales":
          this.filterForm.patchValue({
            SalesPersonName: event.option.value.FullName,
            SalesPersonId: event.option.value.Id,
          });
          break;
  
        case "TeamLeader":
          this.filterForm.patchValue({
            TeamLeaderName: event.option.value.FullName,
            TeamLeaderId: event.option.value.Id,
          })
          break;
  
        default:
          break;
      }
  
    }
   
    public autocompleteCleardEvent(SelectedFor: string): void {
      switch (SelectedFor) {
        case "Sales":
          this.filterForm.patchValue({
            SalesPersonName: null,
            SalesPersonId: null,
          });
          break;
  
        case "TeamLeader":
          this.filterForm.patchValue({
            TeamLeaderName: null,
            TeamLeaderId: null,
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

            AdditionalFilters.push({ key: 'SalesPersonOnly', filterValues: ['true'] })

            AdditionalFilters.push({
              key: 'UserType',
              filterValues: [UserTypeEnum.StandardUser,UserTypeEnum.Agent,UserTypeEnum.TeamReference]
            })

            if (this.filterForm.get('TeamLeaderId').value) {
              AdditionalFilters.push({ key: "TeamLeaderId", "filterValues": [this.filterForm.get('TeamLeaderId').value?.toString()] })
            }
            
            if (this.filterForm.get('BranchId').value) {
              AdditionalFilters.push({ key: "Branch", "filterValues": [this.filterForm.get('BranchId').value?.toString()] })
            }
            break;
  
          case "TeamLeader":
            Rule = [ActiveMasterDataRule]  

            AdditionalFilters.push({ key: 'TeamLeaderOnly', filterValues: ['true'] })
            AdditionalFilters.push({
              key: 'UserType',
              filterValues: [UserTypeEnum.StandardUser]
            })

            if (this.filterForm.get('BranchId').value) {
              AdditionalFilters.push({ key: "Branch", "filterValues": [this.filterForm.get('BranchId').value?.toString()] })
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
                this.filterForm.patchValue({
                  SalesPersonName: result.FullName,
                  SalesPersonId: result.Id,
                });
                break;

              case "TeamLeader":
                this.filterForm.patchValue({
                  TeamLeaderName: result.FullName,
                  TeamLeaderId: result.Id,
                });
                break;
    
              default:
                break;
            }
          }
    
        })
      }

  public searchFiltervalue(): void{
        let fromDate = this._datePipe.transform(this.filterForm.get('FromDate').value, 'yyyy-MM-dd')
        let toDate = this._datePipe.transform(this.filterForm.get('ToDate').value, 'yyyy-MM-dd')
        if(fromDate && toDate){
          if(fromDate > toDate){
            this._alertService.raiseErrorAlert('To Date cannot be less than From Date')
            return;
          }
        }

        this._getRFQdashboardData()
      }
      
  public resetAllFilter(): void{
        this.filterForm.patchValue({
          BranchId:null,
          BranchName:null,
          PolicyType:null,
          CategoryId:null,
          CategoryName:null,
          SubCategoryId:null,
          SubCategoryName:null,
          TeamLeaderId:null,
          TeamLeaderName:null,
          SalesPersonId:null,
          SalesPersonName:null,
          FromDate:null,
          ToDate:null,
        }, { emitEvent: false });
        this._getRFQdashboardData()
        this._getCategoryWiseSubCategogry('') 
      }
  //#endregion public-methods
  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // get my approval request
  private getMyApprovalRequest(): void {

    this._dashboardService.getPendingMyRequest().subscribe((res: any) => {

      if (res.Success) {
        this.MyPendingRequest = res.Data.Stages
      }

    });

  }

  private _initFilterForm(): FormGroup{
    let fg = this._fb.group({
      BranchId:[],
      BranchName:[],
      PolicyType:[],
      CategoryId:[],
      CategoryName:[],
      SubCategoryId:[],
      SubCategoryName:[],
      TeamLeaderId:[],
      TeamLeaderName:[],
      SalesPersonId:[],
      SalesPersonName:[],
      FromDate:[],
      ToDate:[],
    });

    return fg;

  }

  private _getRFQdashboardData(): void{

    let specs = this._getFilter();
    let api = API_ENDPOINTS.RFQ.base
    this._httpService.getDataList(specs,api).subscribe(res=>{
      if(res.Success){
        let tempdataset = []
        res.Data.Category.forEach(e => {
          let a = { 
            data: [e.Count], 
            label: e.CategoryName, 
            backgroundColor: this.categoryBarChartClolor.find(ele => ele.category == e.CategoryCode).color,
            barPercentage: 0.7,
            categoryPercentage: 1, 
            maxCategoryPercentage: 1, 
            maxBarThickness: 40,
            borderRadius: 5,  
           }
          tempdataset.push(a)
          this.barChart1Percentage.push(e.CategoryPer)
        })

        this.barChartData.datasets = tempdataset;
        this.barChartData.labels = [''];
        (this.charts._results.forEach((e) => {
          e.update();
          e.render();
        }))
      }
      
    })

  }


  private _getFilter(): QuerySpecs {
    let specs = new QuerySpecs();
    specs.PaginationSpecs.PaginationRequired = false;
    specs.PaginationSpecs.Limit = 50;
    specs.FilterConditions.Rules = []
    specs.AdditionalFilters = []

    if (this.filterForm.get('BranchId').value) {
      specs.AdditionalFilters.push(
        { key: 'BranchId', filterValues: [this.filterForm.get('BranchId').value.toString()] }
      )
    }

    if (this.filterForm.get('PolicyType').value) {
      specs.AdditionalFilters.push(
        { key: 'PolicyType', filterValues: [this.filterForm.get('PolicyType').value] }
      )
    }

    if (this.filterForm.get('CategoryId').value) {
      specs.AdditionalFilters.push(
        { key: 'CategoryId', filterValues: [this.filterForm.get('CategoryId').value.toString()] }
      )
    }

    if (this.filterForm.get('SubCategoryId').value) {
      specs.AdditionalFilters.push(
        { key: 'SubCategoryId', filterValues: [this.filterForm.get('SubCategoryId').value.toString()] }
      )
    }

    if (this.filterForm.get('TeamLeaderId').value) {
      specs.AdditionalFilters.push(
        { key: 'TeamLeaderId', filterValues: [this.filterForm.get('TeamLeaderId').value.toString()] }
      )
    }

    if (this.filterForm.get('SalesPersonId').value) {
      specs.AdditionalFilters.push(
        { key: 'SalesPersonId', filterValues: [this.filterForm.get('SalesPersonId').value.toString()] }
      )
    }

    if (this.filterForm.get('FromDate').value) {
      specs.AdditionalFilters.push(
        { key: 'FromDate', filterValues: [this._datePipe.transform(this.filterForm.get('FromDate').value, 'yyyy-MM-dd')] }
      )
    }

    if (this.filterForm.get('ToDate').value) {
      specs.AdditionalFilters.push(
        { key: 'ToDate', filterValues: [this._datePipe.transform(this.filterForm.get('ToDate').value, 'yyyy-MM-dd')] }
      )
    }

    return specs;
  }

  private _fillMasterList(): void {
  
      // fill Product Type
      let SubCategoryRule: IFilterRule[] = [ActiveMasterDataRule]
      let OrderBySpecs: OrderBySpecs[] = [
        {
          field: "SrNo",
          direction: "asc"
        }
      ]
  
      this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.SubCategory.List, 'Name', '', SubCategoryRule, [], OrderBySpecs)
        .subscribe(res => {
          if (res.Success) {
            this.subCategoryList = res.Data.Items
          }
        })

        this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Category.List, 'Name', '', SubCategoryRule, [], OrderBySpecs)
        .subscribe(res => {
          if (res.Success) {
            this.categoryList = res.Data.Items
          }
        })

         // fill Branch
            this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List + "/true", 'Name', "", [ActiveMasterDataRule])
              .subscribe(res => {
                if (res.Success) {
                  this.branchs = res.Data.Items
                }
              });
      }

        // form changes 
  private _onFormChange(): void {
      
          // changes Category
          this.filterForm.get('CategoryId').valueChanges.subscribe(val => {
              this.filterForm.patchValue({
                SubCategoryName: "",
                SubCategoryId: ""
              })

            this._getCategoryWiseSubCategogry(val) 
          })
          
          // changes Branch
          this.filterForm.get('BranchId').valueChanges.subscribe(val => {
            this.filterForm.patchValue({
              TeamLeaderId: null,
              TeamLeaderName: null,
              SalesPersonId: null,
              SalesPersonName: null,
            }, { emitEvent: false });
          })
          
          // changes Team leader
          this.filterForm.get('TeamLeaderId').valueChanges.subscribe(val => {
            this.filterForm.patchValue({
              SalesPersonId: null,
              SalesPersonName: null,
            }, { emitEvent: false });
          })
      
          // change sales person
          this.filterForm.get('SalesPersonName').valueChanges.subscribe((val) => {
      
            let Rule: IFilterRule[] = [ActiveMasterDataRule];
      
            let AdditionalFilters: IAdditionalFilterObject[] = [
              { key: "FullName", filterValues: [val] },
              { key: 'SalesPersonOnly', filterValues: ['true'] },
              {
                key: 'UserType',
                filterValues: [UserTypeEnum.StandardUser, UserTypeEnum.Agent, UserTypeEnum.TeamReference]
              }
            ]

            if (this.filterForm.get('TeamLeaderId').value){
              AdditionalFilters.push({ key: "TeamLeaderId", "filterValues": [this.filterForm.get('TeamLeaderId').value?.toString()]})
            }

            if (this.filterForm.get('BranchId').value) {
              AdditionalFilters.push({ key: "Branch", "filterValues": [this.filterForm.get('BranchId').value?.toString()] })
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
      
          // change Team Referance
          this.filterForm.get('TeamLeaderName').valueChanges.subscribe(
            (val) => {
      
              let Rule: IFilterRule[] = [ActiveMasterDataRule];
      
              let AdditionalFilters: IAdditionalFilterObject[] = [
                { key: "FullName", filterValues: [val] },
                { key: 'TeamLeaderOnly', filterValues: ['true'] },
                {
                  key: 'UserType',
                  filterValues: [UserTypeEnum.StandardUser]
                }
              ]
      
              if (this.filterForm.get('BranchId').value) {
                AdditionalFilters.push({ key: "Branch", "filterValues": [this.filterForm.get('BranchId').value?.toString()] })
              }
      
              this.teamLeaderList$ = this._masterListService
                .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", Rule, AdditionalFilters)
                .pipe(
                  takeUntil(this._destroy$),
                  switchMap((res) => {
                    if (res.Success) {
                      if (res.Data.Items) {
                        return of(res.Data.Items);
                      } else {
                        return of([]);
                      }
                    } else {
                      return of([]);
                    }
                  })
                );
            }
          );

        }
        
         private _getCategoryWiseSubCategogry(CategoryId: any) {
        
            let SubCategoryRule: IFilterRule[] = [
              ActiveMasterDataRule,
              {
                Field: "Category.Id",
                Operator: "eq",
                Value: CategoryId
              }
            ]
        
            let OrderBySpecs: OrderBySpecs[] = [
              {
                field: "SrNo",
                direction: "asc"
              }
            ]
        
            this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.SubCategory.List, 'Name', '', SubCategoryRule, [], OrderBySpecs)
              .subscribe(res => {
                if (res.Success) {
                  this.subCategoryList = res.Data.Items
                }
              })
          }
  //#endregion Private methods

}
