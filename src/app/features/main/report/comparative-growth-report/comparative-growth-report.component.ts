import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { CategoryType1 } from '@config/transaction-entry';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, QuerySpecs, ResponseMessage, IFilterRule, OrderBySpecs } from '@models/common';
import { UserProfile } from '@models/dtos/auth';
import { IUserListDto } from '@models/dtos/core';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { AuthService } from '@services/auth/auth.service';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { SalesPersonTypeEnum, UserTypeEnum } from 'src/app/shared/enums';

@Component({
  selector: 'gnx-comparative-growth-report',
  templateUrl: './comparative-growth-report.component.html',
  styleUrls: ['./comparative-growth-report.component.scss'],
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
export class ComparativeGrowthReportComponent {
  //#region decorator
  //#endregion decorator

  // #region public variables
  public title: string = "";
  public isExpand: boolean = true;

  public userProfileObj: UserProfile;
  public currentDate = new Date();

  // FormGroup 
  public comparativeGrowthReportForm: FormGroup;

  // Alert Array List
  public comparativeGrowthReportAlert: Alert[] = [];

  //Form Controls
  public comparativeGrowthReportStepCtrl = new FormControl();

  // Observable
  public salesPerson$: Observable<IUserListDto[]>;
  public teamRefUser$: Observable<IUserListDto[]>;
  public bdoList$: Observable<IUserListDto[]>;
  public bdmList$: Observable<IUserListDto[]>;
  public verticalHeadList$: Observable<IUserListDto[]> // Observable of user list

  // array list
  public insuranceCompanyList: IInsuranceCompanyDto[] = [];
  public branches: IBranchDto[] = [];
  public categoryList = [];
  public subCategoryList = [];
  public CategoryTypeList = [];

  // #endregion public-variables

  //#region private properties
  private _destroy$: Subject<any>;
  // Default page filters


  private _comparativeGrowthReportApi = API_ENDPOINTS.Report.PeriodWiseReport;

  //#endregion private-properties

  //#region constructor
  // -----------------------------------------------------------------------------------------------------
  // @ Constructor
  // -----------------------------------------------------------------------------------------------------

  constructor(
    private _fb: FormBuilder,
    private _masterListService: MasterListService,
    private _route: ActivatedRoute,
    private _router: Router,
    private _alertservice: AlertsService,
    private _datePipe: DatePipe,
    private _dataService: HttpService,
    private _authService: AuthService,
    public dialog: MatDialog
  ) {
    this._destroy$ = new Subject();
    this._fillMasterList();
    this._getCategoryType('', '')
    this._getCategoryWiseSubCategory('')
  }

  //#endregion constructor

  //#region public-getters
  // -----------------------------------------------------------------------------------------------------
  // @ Pubic Getters
  // -----------------------------------------------------------------------------------------------------

  /**
   * sales ref field field display for sales persontype direct or POSP.
   */
  public get canDisplaySalesPersonField(): boolean {
    if (
      this.comparativeGrowthReportForm.get('SalesPersonType').value &&
      this.comparativeGrowthReportForm.get('SalesPersonType').value != SalesPersonTypeEnum.TeamReference
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Team ref. field display for sales persontype direct or Temref.
   */
  public get canDisplayTeamReferenceField(): boolean {
    if (
      this.comparativeGrowthReportForm.get('SalesPersonType').value &&
      this.comparativeGrowthReportForm.get('SalesPersonType').value != SalesPersonTypeEnum.POSP
    ) {
      return true;
    } else {
      return false;
    };
  }

  /**
   * only disply for Admin user
   */
  public get canDisplayBDMField(): boolean {
    if (this.userProfileObj.IsAdmin) {
      return true;
    } else {
      return false;
    };
  }

  /**
   * only open for admin OR BDM login
   */
  public get canDisplayBDOField(): boolean {
    if (this.userProfileObj.IsAdmin || this.userProfileObj.IsBDM) {
      return true;
    } else {
      return false;
    };
  }

  /**
   * only open for admin login
   */
  public get canDisplayVerticalHeadField(): boolean {
    if (this.userProfileObj.IsAdmin) {
      return true;
    } else {
      return false;
    };
  }

  /**
* Only editable in type is POSP or Teamref. & sales person or team not selected
*/
  public get canEditableBdoBdm(): boolean {
    if (
      this.comparativeGrowthReportForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP ||
      this.comparativeGrowthReportForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference
    ) {
      if (
        this.comparativeGrowthReportForm.get('TeamReferenceId').value ||
        this.comparativeGrowthReportForm.get('SalesPersonId').value
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  /**
* Only editable in  sales person or team or bdm not selected
*/

  public get canEditableVerticalHead(): boolean {
    if (
      this.comparativeGrowthReportForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP ||
      this.comparativeGrowthReportForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference
    ) {
      if (
        this.comparativeGrowthReportForm.get('TeamReferenceId').value ||
        this.comparativeGrowthReportForm.get('BDMId').value ||
        this.comparativeGrowthReportForm.get('SalesPersonId').value
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      if (
        this.comparativeGrowthReportForm.get('BDMId').value
      ) {
        return false;
      } else {
        return true;
      }
    }

  }

  public get UserTypeEnum() {
    return UserTypeEnum;
  }

  //#endregion public-getters

  //#region life cycle hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  ngOnInit(): void {
    //get data from route
    let data = this._route.snapshot.data;
    this.title = data['title'];

    this._authService.userProfile$.subscribe((user: UserProfile) => {
      if (user) {
        this.userProfileObj = user
      }
    });

    this.comparativeGrowthReportForm = this._initForm();
    this._onFormChange();
  }

  ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
  }
  //#endregion life-cycle-hooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // previous page navigation button
  public backClicked(): void {
    this._router.navigate(['../'], { relativeTo: this._route })
  }

  // all tab expand and Collaps
  public ExpandCollaps(): void {
    this.isExpand = !this.isExpand
  }

  /**
  * Start Validation part 
  */

  public comparativeGrowthValidations(): FormControl {
    this.comparativeGrowthReportAlert = []


    if (!this.comparativeGrowthReportForm.get('CurrentPeriodFromDate').value) {
      this.comparativeGrowthReportAlert.push({
        Message: 'Select Current Period-From Date',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (!this.comparativeGrowthReportForm.get('CurrentPeriodToDate').value) {
      this.comparativeGrowthReportAlert.push({
        Message: 'Select Current Period-To Date',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.comparativeGrowthReportForm.get('CurrentPeriodFromDate').value && this.comparativeGrowthReportForm.get('CurrentPeriodToDate').value) {

      const CurrentPeriodFromDate =new Date(this.comparativeGrowthReportForm.get('CurrentPeriodFromDate').value)
      const CurrentPeriodToDate =new Date(this.comparativeGrowthReportForm.get('CurrentPeriodToDate').value)

      
      if (CurrentPeriodFromDate > CurrentPeriodToDate) {
        this.comparativeGrowthReportAlert.push({
          Message: `Current Period-To date can not be less than Current Period-From date.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
   
    if (!this.comparativeGrowthReportForm.get('PreviousPeriodFromDate').value) {
      this.comparativeGrowthReportAlert.push({
        Message: 'Select Previous Period-From Date',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (!this.comparativeGrowthReportForm.get('PreviousPeriodToDate').value) {
      this.comparativeGrowthReportAlert.push({
        Message: 'Select Previous Period-To Date',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.comparativeGrowthReportForm.get('PreviousPeriodFromDate').value && this.comparativeGrowthReportForm.get('PreviousPeriodToDate').value) {

      const PreviousPeriodFromDate = new Date(this.comparativeGrowthReportForm.get('PreviousPeriodFromDate').value);
      const PreviousPeriodToDate = new Date(this.comparativeGrowthReportForm.get('PreviousPeriodToDate').value);

      if (PreviousPeriodFromDate > PreviousPeriodToDate) {
        this.comparativeGrowthReportAlert.push({
          Message: `Previous Period-To date can not be less than Previous Period-From date.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.comparativeGrowthReportAlert.length > 0) {
      this.comparativeGrowthReportStepCtrl.setErrors({ required: true });
      return this.comparativeGrowthReportStepCtrl;
    }
    else {
      this.comparativeGrowthReportStepCtrl.reset();
      return this.comparativeGrowthReportStepCtrl;
    }
  }

  /**
   * End Validation part 
  */

  /**
   * Clear Autocomplete value
   * @param selectedFor 
   */
  public autocompleteCleardEvent(selectedFor: string): void {
    switch (selectedFor) {

      case "SalesPersonName":
        this.comparativeGrowthReportForm.patchValue({
          SalesPersonName: null,
          SalesPersonId: 0,
          BDOName: null,
          BDOId: 0,
          BDMName: null,
          BDMId: 0,
          VerticleHeadName: null,
          VerticleHeadId: 0,
        }, { emitEvent: false });

        break;

      case "TeamRef":
        this.comparativeGrowthReportForm.patchValue({
          TeamReferenceName: null,
          TeamReferenceId: 0,
          BDOName: null,
          BDOId: 0,
          BDMName: null,
          BDMId: 0,
          VerticleHeadName: null,
          VerticleHeadId: 0,
        }, { emitEvent: false });
        break;

      case "BDMName":
        this.comparativeGrowthReportForm.patchValue({
          BDMName: null,
          BDMId: 0,
          VerticleHeadName: null,
          VerticleHeadId: 0,
        }, { emitEvent: false });

        break;

      case "BDOName":
        this.comparativeGrowthReportForm.patchValue({
          BDOName: null,
          BDOId: 0,
        }, { emitEvent: false });
        break;

      case "VerticleHeadName":
        this.comparativeGrowthReportForm.patchValue({
          VerticleHeadName: null,
          VerticleHeadId: 0,
        }, { emitEvent: false });
        break;

      default:
        break;
    }

  }

  // auto complete select event execute
  public AutocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, selectedFor: string): void {

    switch (selectedFor) {

      case "SalesPersonName":
        this.comparativeGrowthReportForm.patchValue({
          SalesPersonName: event.option.value.FullName,
          SalesPersonId: event.option.value.Id,
        });

        this._bdobdmDefaultDataBind(event.option.value)
        break;

      case "TeamRef":
        this.comparativeGrowthReportForm.patchValue({
          TeamReferenceName: event.option.value.FullName,
          TeamReferenceId: event.option.value.Id,
        });

        this._bdobdmDefaultDataBind(event.option.value)
        break;

      case "BDMName":
        this.comparativeGrowthReportForm.patchValue({
          BDMName: event.option.value.FullName,
          BDMId: event.option.value.Id,
        });

        this._verticalHeadDefaultDataBind(event.option.value)
        break;

      case "BDOName":
        this.comparativeGrowthReportForm.patchValue({
          BDOName: event.option.value.FullName,
          BDOId: event.option.value.Id,
        });
        break;

      case "VerticleHeadName":
        this.comparativeGrowthReportForm.patchValue({
          VerticleHeadName: event.option.value.FullName,
          VerticleHeadId: event.option.value.Id,
        });
        break;

      default:
        break;
    }
  }

  // /* Pop Up for Name of the Insurance Company
  //  * @param type:to identify api of which list is to be called
  //   * @param title: title that will be displayed on PopUp
  //   * /
  public openDiolog(type: string, title: string, openFor: string) {

    let specs = new QuerySpecs()
    switch (openFor) {

      case "SalesPersonName":
        specs = this._salesPersonListAPIfilter()
        break;

      case "TeamRef":
        specs = this._teamReferenceListAPIfilter()
        break;

      case "BDOName":
        specs = this._bdoListAPIfilter()
        break;

      case "BDMName":
        specs = this._bdmListAPIfilter()
        break;
      
      case "VerticleHeadName":
        specs = this._verticleHeadListAPIfilter()
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
      filterData: specs.FilterConditions.Rules,
      addFilterData: specs.AdditionalFilters
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        switch (openFor) {
          case "SalesPersonName":
            this.comparativeGrowthReportForm.patchValue({
              SalesPersonName: result.FullName,
              SalesPersonId: result.Id,
            });
            this._bdobdmDefaultDataBind(result)
            break;

          case "TeamRef":
            this.comparativeGrowthReportForm.patchValue({
              TeamReferenceName: result.FullName,
              TeamReferenceId: result.Id,
            });

            this._bdobdmDefaultDataBind(result)
            break;

          case "BDMName":
            this.comparativeGrowthReportForm.patchValue({
              BDMName: result.FullName,
              BDMId: result.Id,
            });

            this._verticalHeadDefaultDataBind(result)
            break;

          case "BDOName":
            this.comparativeGrowthReportForm.patchValue({
              BDOName: result.FullName,
              BDOId: result.Id,
            });
            break;

          case "VerticleHeadName":
            this.comparativeGrowthReportForm.patchValue({
              VerticleHeadName: result.FullName,
              VerticleHeadId: result.Id,
            });
            break;


          default:
            break;
        }
      }
    });
  }


  /**
   * Donload Report Excel
   */
  public generateReport(): void {

    if (!this._authService._userProfile.value?.AuthKeys?.includes("ComparativeGrowthReport-export")) {
      this._alertservice.raiseErrorAlert("Role assigned to you does not contain permission for Policy Type - Comparative Growth Report");
      return;
    }

    if (this.comparativeGrowthReportAlert.length > 0) {
      this._alertservice.raiseErrors(this.comparativeGrowthReportAlert);
      return;
    }

    this._dataService
      .exportToExcel(this._getFilter(), this._comparativeGrowthReportApi)
      .pipe(takeUntil(this._destroy$))
      .subscribe((blob: any) => {
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
          a.download = "Policy Type - Comparative Growth Report";
          a.click();
          URL.revokeObjectURL(objectUrl);
        }
      });
  }

  /**
   * Reset Policy Register Form
   */
  public resetForm(): void {

    this.comparativeGrowthReportForm.patchValue({
      InsuranceCompany: "",
      CurrentPeriodFromDate: "",
      CurrentPeriodToDate: "",
      PreviousPeriodFromDate: "",
      PreviousPeriodToDate: "",
      BranchId: 0,
      SalesPersonType: "",
      SalesPersonId: 0,
      SalesPersonName: "",
      TeamReferenceId: 0,
      TeamReferenceName: "",
      BDOId: 0,
      BDOName: "",
      BDMId: 0,
      BDMName: "",
      VerticleHeadName: "",
      VerticleHeadId: 0,
      CategoryCode: "",
      SubCategoryCode: "",
      CategoryType: "",
      CategoryId: 0,
      SubCategoryId: 0,
    }, { emitEvent: false })

    this._getCategoryWiseSubCategory('');
    this._getCategoryType('', '');

  }
  //#endregion public-methods

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build Main Form
  private _initForm() {
    let fg = this._fb.group({
      InsuranceCompany: [""],
      CurrentPeriodFromDate: [""],
      CurrentPeriodToDate: [""],
      PreviousPeriodFromDate: [""],
      PreviousPeriodToDate: [""],
      BranchId: [""],
      SalesPersonType: [""],
      SalesPersonId: [null],
      SalesPersonName: [""],
      TeamReferenceId: [null],
      TeamReferenceName: [""],
      BDOId: [null],
      BDOName: [""],
      BDMId: [null],
      BDMName: [""],
      VerticleHeadName: [],
      VerticleHeadId: [],
      CategoryCode: [""],
      CategoryId: [0],
      SubCategoryCode: [""],
      SubCategoryId: [0],
      CategoryType: [''],
    });


    return fg;
  }

/**
 * Fill master data 
 */
  private _fillMasterList(): void {
    // Get Category List Order by srno & only Active master Data
    let activeDataRule: IFilterRule[] = [];
    let orderBySpecs: OrderBySpecs[] = [{ field: 'SrNo', direction: 'asc', },];

    //Category
    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Category.List, 'Name', "", activeDataRule, [], orderBySpecs)
      .subscribe(res => {
        if (res.Success) {
          this.categoryList = res.Data.Items
        }
      });

    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.InsuranceCompany.list, 'Name', "", [])
      .subscribe(res => {
        if (res.Success) {
          this.insuranceCompanyList = res.Data.Items
        }
      });

    // Get Branch As per User Access
    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List + "/true", 'Name', "")
      .subscribe(res => {
        if (res.Success) {
          this.branches = res.Data.Items
          if (this.branches.length == 1) {
            this.comparativeGrowthReportForm.patchValue({ BranchId: this.branches[0].Id })
          }
        }

      })
  }

  /**
   * Get Category wise Sub category
   * @param CategoryCode 
   */
  private _getCategoryWiseSubCategory(CategoryCode: string) {

    let subCategoryRule: IFilterRule[] = [{ Field: "Category.Code", Operator: "eq", Value: CategoryCode }];
    let orderBySpecs: OrderBySpecs[] = [{ field: "SrNo", direction: "asc" }];

    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.SubCategory.List, 'Name', '', subCategoryRule, [], orderBySpecs).subscribe(res => {
      if (res.Success) {
        this.subCategoryList = res.Data.Items
      }
    });
  }

  /**
   * Get Category type based on category & sub category
   * @param categoryCode 
   * @param subCategoryCode 
   */
  private _getCategoryType(categoryCode: string, subCategoryCode: string) {

    let allItems = []
    this.CategoryTypeList = [];
    if (categoryCode && subCategoryCode) {

      const categoryObj = CategoryType1.find(cat => cat.CategoryCode === categoryCode);
      if (categoryObj) {
        if (categoryObj.items != null) {
          allItems = categoryObj.items
        } else {
          if (subCategoryCode) {
            const subCategoryObj = categoryObj.SubCategory.find(subCat => subCat.SubCategoryCode === subCategoryCode);
            if (subCategoryObj) {
              allItems = subCategoryObj.items
            }
          }
        }
      }

    } else if (categoryCode) {

      const categoryObj = CategoryType1.find(cat => cat.CategoryCode === categoryCode);
      if (categoryObj) {
        if (categoryObj.items != null) {
          allItems = categoryObj.items
        } else {
          if (!subCategoryCode) {

            if (categoryObj.SubCategory) {
              categoryObj.SubCategory.forEach(subCategory => {
                if (subCategory.items) {
                  allItems.push(...subCategory.items);
                }
              });
            }
          }
        }
      }

    }
    else {

      CategoryType1.forEach(ctype => {
        if (ctype.items) {
          allItems.push(...ctype.items);
        }

        if (ctype.SubCategory) {
          ctype.SubCategory.forEach(subCategory => {
            if (subCategory.items) {
              allItems.push(...subCategory.items);
            }
          });
        }

      })


    }

    //Remove Duplicate Items
    allItems.forEach(e=>{
      if (!this.CategoryTypeList.find(ele => ele.title == e.title)){
        this.CategoryTypeList.push(e)
      }
    })


    /**
     * Set Other value in last Index
     */
    let OtherValueObj = this.CategoryTypeList.find(e=> e.title == 'Other')

    if(OtherValueObj){
      let index = this.CategoryTypeList.indexOf(OtherValueObj);

          if (index !== -1) {
            let ele = this.CategoryTypeList.splice(index, 1);
            this.CategoryTypeList.push(OtherValueObj);
          }

    }
  }


  /**
   * Sales person list data List API query spec
   * @returns 
   */
  private _salesPersonListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];


    switch (this.comparativeGrowthReportForm.get('SalesPersonType').value) {
      case SalesPersonTypeEnum.Direct:
        specs.AdditionalFilters.push({ key: 'BQPOnly', filterValues: ['true'] })
        specs.AdditionalFilters.push({ key: 'UserType', filterValues: [UserTypeEnum.StandardUser] })
        break;

      case SalesPersonTypeEnum.POSP:
        specs.AdditionalFilters.push({ key: 'UserType', filterValues: [UserTypeEnum.Agent] })
        break;

      case SalesPersonTypeEnum.TeamReference:

        break;

      default:
        specs.AdditionalFilters.push({ key: 'SalesPersonOnly', filterValues: ['true'] })
        specs.AdditionalFilters.push({ key: 'UserType', filterValues: [UserTypeEnum.StandardUser, UserTypeEnum.Agent] })
        break;
    }

    if (this.comparativeGrowthReportForm.get('BranchId').value) {
      specs.AdditionalFilters.push(
        { key: 'Branch', filterValues: [this.comparativeGrowthReportForm.get('BranchId').value.toString()] }
      )
    }

    return specs;
  }

  /**
  * Team ref. list data List API query spec
  * @returns 
  */
  private _teamReferenceListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];


    switch (this.comparativeGrowthReportForm.get('SalesPersonType').value) {
      case SalesPersonTypeEnum.Direct:
        specs.AdditionalFilters.push({ key: 'UserType', filterValues: [UserTypeEnum.Agent, UserTypeEnum.TeamReference] })
        break;

      case SalesPersonTypeEnum.POSP:
        break;

      case SalesPersonTypeEnum.TeamReference:
        specs.AdditionalFilters.push({ key: 'UserType', filterValues: [UserTypeEnum.TeamReference] })
        break;

      default:
        specs.AdditionalFilters.push({ key: 'UserType', filterValues: [UserTypeEnum.TeamReference, UserTypeEnum.Agent] })
        break;
    }

    if (this.comparativeGrowthReportForm.get('BranchId').value) {
      specs.AdditionalFilters.push(
        { key: 'Branch', filterValues: [this.comparativeGrowthReportForm.get('BranchId').value.toString()] }
      )
    }

    return specs;
  }

  /**
  * BDO list data List API query spec
  * @returns 
  */
  private _bdoListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    specs.AdditionalFilters.push({ key: 'BDOOnly', filterValues: ['true'] });
    specs.AdditionalFilters.push({ key: 'UserType', filterValues: [UserTypeEnum.StandardUser] });

    if (this.comparativeGrowthReportForm.get('BranchId').value) {
      specs.AdditionalFilters.push(
        { key: 'Branch', filterValues: [this.comparativeGrowthReportForm.get('BranchId').value.toString()] }
      )
    }

    return specs;
  }

  /**
    *BDM list data List API query spec
    * @returns 
    */
  private _bdmListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    specs.AdditionalFilters.push({ key: 'BDMOnly', filterValues: ['true'] });
    specs.AdditionalFilters.push({ key: 'UserType', filterValues: [UserTypeEnum.StandardUser] });

    if (this.comparativeGrowthReportForm.get('BranchId').value) {
      specs.AdditionalFilters.push(
        { key: 'Branch', filterValues: [this.comparativeGrowthReportForm.get('BranchId').value.toString()] }
      )
    }

    return specs;
  }
  
  /**
  * verticle headlist data List API query spec
  * @returns 
  */
  private _verticleHeadListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    specs.AdditionalFilters.push({ key: 'VerticleHeadOnly', filterValues: ['true'] });
    specs.AdditionalFilters.push({ key: 'UserType', filterValues: [UserTypeEnum.StandardUser] });

    if (this.comparativeGrowthReportForm.get('BranchId').value) {
      specs.AdditionalFilters.push(
        { key: 'Branch', filterValues: [this.comparativeGrowthReportForm.get('BranchId').value.toString()] }
      )
    }

    return specs;
  }



  /**
   * BDO & BDM & Verticle Head data bind as per selected POSP or Team ref.
   * @param result 
   */
  private _bdobdmDefaultDataBind(result: IUserListDto): void {
    if (
      this.comparativeGrowthReportForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP ||
      this.comparativeGrowthReportForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference
    ) {

      if (this.canDisplayBDMField) {
        this.comparativeGrowthReportForm.patchValue({
          BDMName: result.BDMName,
          BDMId: result.BDMId,
        }, { emitEvent: false });
      }

      if (this.canDisplayBDOField) {
        this.comparativeGrowthReportForm.patchValue({
          BDOName: result.BDOName,
          BDOId: result.BDOId,
        }, { emitEvent: false });
      }

      if (this.canDisplayVerticalHeadField) {
        this.comparativeGrowthReportForm.patchValue({
          VerticleHeadName: result.VerticleHeadName,
          VerticleHeadId: result.VerticleHeadId,
        }, { emitEvent: false });
      }

    }
  }

  /**
   *  Verticle Head data bind as per selected BDM.
   * @param result 
   */
  private _verticalHeadDefaultDataBind(result: IUserListDto): void {
    if (this.canDisplayVerticalHeadField) {
      this.comparativeGrowthReportForm.patchValue({
        VerticleHeadName: result.ReportingManagerName,
        VerticleHeadId: result.ReportingManagerId,
      }, { emitEvent: false });
    }
  }

  /**
   * Form Change Event
   */
  private _onFormChange() {

    //Sales Person
    this.comparativeGrowthReportForm.get('SalesPersonName').valueChanges.subscribe((val) => {
      let SalesPersonListSpecs = this._salesPersonListAPIfilter();
      SalesPersonListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })
      this.salesPerson$ = this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", SalesPersonListSpecs.FilterConditions.Rules, SalesPersonListSpecs.AdditionalFilters)
        .pipe(takeUntil(this._destroy$), switchMap((res) => {
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

    //Team Reference
    this.comparativeGrowthReportForm.get('TeamReferenceName').valueChanges.subscribe((val) => {
      let TeamReferenceListSpecs = this._teamReferenceListAPIfilter();
      TeamReferenceListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })
      this.teamRefUser$ = this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", TeamReferenceListSpecs.FilterConditions.Rules, TeamReferenceListSpecs.AdditionalFilters)
        .pipe(takeUntil(this._destroy$), switchMap((res) => {
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


    //BDO
    this.comparativeGrowthReportForm.get('BDOName').valueChanges.subscribe((val) => {
      let bdoListSpecs = this._bdoListAPIfilter()
      bdoListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })
      this.bdoList$ = this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', bdoListSpecs.FilterConditions.Rules, bdoListSpecs.AdditionalFilters).pipe(
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

    //BDM
    this.comparativeGrowthReportForm.get('BDMName').valueChanges.subscribe((val) => {
      let bdmListSpecs = this._bdmListAPIfilter()
      bdmListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })

      this.bdmList$ = this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', bdmListSpecs.FilterConditions.Rules, bdmListSpecs.AdditionalFilters).pipe(
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
   
    //VerticleHead
    this.comparativeGrowthReportForm.get('VerticleHeadName').valueChanges.subscribe((val) => {
      let VerticleHeadListSpecs = this._verticleHeadListAPIfilter()
      VerticleHeadListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })

      this.verticalHeadList$ = this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', VerticleHeadListSpecs.FilterConditions.Rules, VerticleHeadListSpecs.AdditionalFilters).pipe(
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

    // CategoryCode
    this.comparativeGrowthReportForm.get('CategoryCode').valueChanges.subscribe(val => {

      let selectedCategory = this.categoryList.find(cat => cat.Code == val);
      if (selectedCategory) {
        this.comparativeGrowthReportForm.patchValue({
          CategoryId: selectedCategory.Id,
        });
      }
      else {
        this.comparativeGrowthReportForm.patchValue({
          CategoryId: 0,
        });
      }

      this.comparativeGrowthReportForm.patchValue({
        SubCategoryCode: "",
        CategoryType: ""
      });

      this._getCategoryType(val, '')
      this._getCategoryWiseSubCategory(val)

    });

    // SubCategoryCode
    this.comparativeGrowthReportForm.get('SubCategoryCode').valueChanges.subscribe(val => {
      this.comparativeGrowthReportForm.patchValue({
        CategoryType: ""
      });

      let selectedSubCategory = this.subCategoryList.find(subcat => subcat.Code == val);
      if (selectedSubCategory) {
        this.comparativeGrowthReportForm.patchValue({
          SubCategoryId: selectedSubCategory.Id,
        });
        this._getCategoryType(selectedSubCategory.CategoryCode, val)
      }
      else {
        this.comparativeGrowthReportForm.patchValue({
          SubCategoryId: 0,
        });
        this._getCategoryType(this.comparativeGrowthReportForm.get('CategoryCode').value, val)
      }
    });

    // BranchId
    this.comparativeGrowthReportForm.get('BranchId').valueChanges.subscribe(val => {
      this.comparativeGrowthReportForm.patchValue({
        SalesPersonId: 0,
        SalesPersonName: "",
        TeamReferenceId: 0,
        TeamReferenceName: "",
        BDOId: 0,
        BDOName: "",
        BDMId: 0,
        BDMName: "",
        VerticleHeadId: 0,
        VerticleHeadName: "",
      }, { emitEvent: false })
    });

    // SalesPersonType
    this.comparativeGrowthReportForm.get('SalesPersonType').valueChanges.subscribe(val => {
      this.comparativeGrowthReportForm.patchValue({
        SalesPersonId: 0,
        SalesPersonName: "",
        TeamReferenceId: 0,
        TeamReferenceName: "",
        BDOId: 0,
        BDOName: "",
        BDMId: 0,
        BDMName: "",
        VerticleHeadId: 0,
        VerticleHeadName: "",
      }, { emitEvent: false })
    });

  }

/**
 * Report API Query Spec
 * @returns 
 */
  private _getFilter(): QuerySpecs {
    let generateReportSpecs = new QuerySpecs();
    generateReportSpecs.PaginationSpecs.PaginationRequired = false;
    generateReportSpecs.PaginationSpecs.Limit = 50;
    generateReportSpecs.FilterConditions.Rules = []
    generateReportSpecs.AdditionalFilters = []
    generateReportSpecs.OrderBySpecs = []


    if (this.comparativeGrowthReportForm.get('InsuranceCompany').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'InsuranceCompany', filterValues: [this.comparativeGrowthReportForm.get('InsuranceCompany').value] }
      )
    }
    
    if (this.comparativeGrowthReportForm.get('CurrentPeriodFromDate').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'CurrentPeriodStartDate', filterValues: [this._datePipe.transform(this.comparativeGrowthReportForm.get('CurrentPeriodFromDate').value, "yyyy-MM-dd")] }
      )
    }
    
    if (this.comparativeGrowthReportForm.get('CurrentPeriodToDate').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'CurrentPeriodEndDate', filterValues: [this._datePipe.transform(this.comparativeGrowthReportForm.get('CurrentPeriodToDate').value, "yyyy-MM-dd")] }
      )
      
    }
    
    
    if (this.comparativeGrowthReportForm.get('PreviousPeriodFromDate').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'PreviousPeriodStartDate', filterValues: [this._datePipe.transform(this.comparativeGrowthReportForm.get('PreviousPeriodFromDate').value, "yyyy-MM-dd")] }
      )
    }
    
    if (this.comparativeGrowthReportForm.get('PreviousPeriodToDate').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'PreviousPeriodEndDate', filterValues: [this._datePipe.transform(this.comparativeGrowthReportForm.get('PreviousPeriodToDate').value, "yyyy-MM-dd")] }
      )
    }



    if (this.comparativeGrowthReportForm.get('BranchId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'Branch', filterValues: [this.comparativeGrowthReportForm.get('BranchId').value.toString()] }
      )
    }
    
    if (this.comparativeGrowthReportForm.get('SalesPersonType').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'SalesPersonType', filterValues: [this.comparativeGrowthReportForm.get('SalesPersonType').value] }
      )
    }

    if (this.comparativeGrowthReportForm.get('SalesPersonId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'AgentOrTealLeadId', filterValues: [this.comparativeGrowthReportForm.get('SalesPersonId').value.toString()] }
      )
    } 
    
    if (this.comparativeGrowthReportForm.get('TeamReferenceId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'TeamReferenceId', filterValues: [this.comparativeGrowthReportForm.get('TeamReferenceId').value.toString()] }
      )
    } 

     if (this.comparativeGrowthReportForm.get('BDOId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'BDOId', filterValues: [this.comparativeGrowthReportForm.get('BDOId').value.toString()] }
      )
    } 
    
    if (this.comparativeGrowthReportForm.get('BDMId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'BDMId', filterValues: [this.comparativeGrowthReportForm.get('BDMId').value.toString()] }
      )
    } 
    
    if (this.comparativeGrowthReportForm.get('VerticleHeadId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'VerticleHeadId', filterValues: [this.comparativeGrowthReportForm.get('VerticleHeadId').value.toString()] }
      )
    }
    
    if (this.comparativeGrowthReportForm.get('CategoryId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'CategoryId', filterValues: [this.comparativeGrowthReportForm.get('CategoryId').value.toString()] }
      )
    }
    
    if (this.comparativeGrowthReportForm.get('SubCategoryId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'SubCategoryId', filterValues: [this.comparativeGrowthReportForm.get('SubCategoryId').value.toString()] }
      )
    }
     
    if (this.comparativeGrowthReportForm.get('CategoryType').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'CategoryType', filterValues: [this.comparativeGrowthReportForm.get('CategoryType').value] }
      )
    }


    return generateReportSpecs;
  }
  //#endregion private-methods
}