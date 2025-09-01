import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { DisplayedDashboardMonth } from '@config/dashboard';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { CategoryType1 } from '@config/transaction-entry';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, IFilterRule, OrderBySpecs, QuerySpecs, ResponseMessage } from '@models/common';
import { UserProfile } from '@models/dtos/auth';
import { IUserListDto } from '@models/dtos/core';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { IFinancialYearDto } from '@models/dtos/core/FinancialYearDto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { AuthService } from '@services/auth/auth.service';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { SalesPersonTypeEnum, UserTypeEnum } from 'src/app/shared/enums';

@Component({
  selector: 'gnx-fy-growth-report',
  templateUrl: './fy-growth-report.component.html',
  styleUrls: ['./fy-growth-report.component.scss'],
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
export class FyGrowthReportComponent {
  //#region decorator
  //#endregion decorator

  // #region public variables
  public title: string = "";
  public isExpand: boolean = true;

  public userProfileObj: UserProfile;
  public currentDate = new Date();

  // FormGroup 
  public fyGrowthForm: FormGroup;

  // Alert Array List
  public fyGrowthAlert: Alert[] = [];

  //Form Controls
  public fyGrowthStepCtrl = new FormControl();

  // Observable
  public salesPerson$: Observable<IUserListDto[]>;
  public teamRefUser$: Observable<IUserListDto[]>;
  public bdoList$: Observable<IUserListDto[]>;
  public bdmList$: Observable<IUserListDto[]>;
  public verticalHeadList$: Observable<IUserListDto[]> // Observable of user list
  public financialYearList: IFinancialYearDto[] = []

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


  private _fyGrowthReportApi = API_ENDPOINTS.Report.FYGrowthReport;

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

  public get monthDrpList(): any {
    return DisplayedDashboardMonth;
  }

  /**
   * sales ref field field display for sales persontype direct or POSP.
   */
  public get canDisplaySalesPersonField(): boolean {
    if (
      this.fyGrowthForm.get('SalesPersonType').value &&
      this.fyGrowthForm.get('SalesPersonType').value != SalesPersonTypeEnum.TeamReference
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
      this.fyGrowthForm.get('SalesPersonType').value &&
      this.fyGrowthForm.get('SalesPersonType').value != SalesPersonTypeEnum.POSP
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
      this.fyGrowthForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP ||
      this.fyGrowthForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference
    ) {
      if (
        this.fyGrowthForm.get('TeamReferenceId').value ||
        this.fyGrowthForm.get('SalesPersonId').value
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
      this.fyGrowthForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP ||
      this.fyGrowthForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference
    ) {
      if (
        this.fyGrowthForm.get('TeamReferenceId').value ||
        this.fyGrowthForm.get('BDMId').value ||
        this.fyGrowthForm.get('SalesPersonId').value
      ) {
        return false;
      } else {
        return true;
      }
    }else{
      if (
        this.fyGrowthForm.get('BDMId').value
      ) {
        return false;
      } else {
        return true;
      }
    }

  }

  public get UserTypeEnum(){
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

    this.fyGrowthForm = this._initForm();
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

  public fyGrowthValidations(): FormControl {
    this.fyGrowthAlert = []

    if (!this.fyGrowthForm.get('FinancialYearId').value) {
      this.fyGrowthAlert.push({
        Message: 'Select Financial Year',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.fyGrowthAlert.length > 0) {
      this.fyGrowthStepCtrl.setErrors({ required: true });
      return this.fyGrowthStepCtrl;
    }
    else {
      this.fyGrowthStepCtrl.reset();
      return this.fyGrowthStepCtrl;
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
        this.fyGrowthForm.patchValue({
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
        this.fyGrowthForm.patchValue({
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
        this.fyGrowthForm.patchValue({
          BDMName: null,
          BDMId: 0,
          VerticleHeadName: null,
          VerticleHeadId: 0,
        }, { emitEvent: false });

        break;

      case "BDOName":
        this.fyGrowthForm.patchValue({
          BDOName: null,
          BDOId: 0,
        }, { emitEvent: false });
        break;

      case "VerticleHeadName":
        this.fyGrowthForm.patchValue({
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
        this.fyGrowthForm.patchValue({
          SalesPersonName: event.option.value.FullName,
          SalesPersonId: event.option.value.Id,
        });

        this._bdobdmDefaultDataBind(event.option.value)
        break;

      case "TeamRef":
        this.fyGrowthForm.patchValue({
          TeamReferenceName: event.option.value.FullName,
          TeamReferenceId: event.option.value.Id,
        });

        this._bdobdmDefaultDataBind(event.option.value)
        break;

      case "BDMName":
        this.fyGrowthForm.patchValue({
          BDMName: event.option.value.FullName,
          BDMId: event.option.value.Id,
        });

        this._verticalHeadDefaultDataBind(event.option.value)
        break;

      case "BDOName":
        this.fyGrowthForm.patchValue({
          BDOName: event.option.value.FullName,
          BDOId: event.option.value.Id,
        });
        break;

      case "VerticleHeadName":
        this.fyGrowthForm.patchValue({
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
            this.fyGrowthForm.patchValue({
              SalesPersonName: result.FullName,
              SalesPersonId: result.Id,
            });
            this._bdobdmDefaultDataBind(result)
            break;

          case "TeamRef":
            this.fyGrowthForm.patchValue({
              TeamReferenceName: result.FullName,
              TeamReferenceId: result.Id,
            });

            this._bdobdmDefaultDataBind(result)
            break;

          case "BDMName":
            this.fyGrowthForm.patchValue({
              BDMName: result.FullName,
              BDMId: result.Id,
            });

            this._verticalHeadDefaultDataBind(result)
            break;

          case "BDOName":
            this.fyGrowthForm.patchValue({
              BDOName: result.FullName,
              BDOId: result.Id,
            });
            break;

          case "VerticleHeadName":
            this.fyGrowthForm.patchValue({
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

    if (!this._authService._userProfile.value?.AuthKeys?.includes("FYGrowthReport-export")) {
      this._alertservice.raiseErrorAlert("Role assigned to you does not contain permission for Policy Type - FY Growth Report");
      return;
    }

    if (this.fyGrowthAlert.length > 0) {
      this._alertservice.raiseErrors(this.fyGrowthAlert);
      return;
    }

    this._dataService
      .exportToExcel(this._getFilter(), this._fyGrowthReportApi)
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
          a.download = "Policy Type-FY Growth Report";
          a.click();
          URL.revokeObjectURL(objectUrl);
        }
      });
  }

  /**
   * Reset Policy Register Form
   */
  public resetForm(): void {

    this.fyGrowthForm.patchValue({
      InsuranceCompany: "",
      FinancialYearId: "",
      Month: "",
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
    this._setDefaultFilterData()

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
      FinancialYearId: [""],
      Month: [""],
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
      CategoryId: [""],
      SubCategoryCode: [""],
      SubCategoryId: [""],
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
            this.fyGrowthForm.patchValue({ BranchId: this.branches[0].Id })
          }
        }

      })

    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.FinancialYear.List, 'FYCode', "", [])
      .subscribe(res => {
        if (res.Success) {
          this.financialYearList = res.Data.Items

          this._setDefaultFilterData();

        }
      });
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
    allItems.forEach(e => {
      if (!this.CategoryTypeList.find(ele => ele.title == e.title)) {
        this.CategoryTypeList.push(e)
      }
    })


    /**
     * Set Other value in last Index
     */
    let OtherValueObj = this.CategoryTypeList.find(e => e.title == 'Other')

    if (OtherValueObj) {
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


    switch (this.fyGrowthForm.get('SalesPersonType').value) {
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

    if (this.fyGrowthForm.get('BranchId').value) {
      specs.AdditionalFilters.push(
        { key: 'Branch', filterValues: [this.fyGrowthForm.get('BranchId').value.toString()] }
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


    switch (this.fyGrowthForm.get('SalesPersonType').value) {
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

    if (this.fyGrowthForm.get('BranchId').value) {
      specs.AdditionalFilters.push(
        { key: 'Branch', filterValues: [this.fyGrowthForm.get('BranchId').value.toString()] }
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

    if (this.fyGrowthForm.get('BranchId').value) {
      specs.AdditionalFilters.push(
        { key: 'Branch', filterValues: [this.fyGrowthForm.get('BranchId').value.toString()] }
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

    if (this.fyGrowthForm.get('BranchId').value) {
      specs.AdditionalFilters.push(
        { key: 'Branch', filterValues: [this.fyGrowthForm.get('BranchId').value.toString()] }
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

    if (this.fyGrowthForm.get('BranchId').value) {
      specs.AdditionalFilters.push(
        { key: 'Branch', filterValues: [this.fyGrowthForm.get('BranchId').value.toString()] }
      )
    }

    return specs;
  }

/**
 * Set Current finacial year
 */
  private _setDefaultFilterData() {
    let currectFinancialYear = this.financialYearList.filter(year =>
      (year.FromDate <= this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')) &&
      (year.ToDate >= this._datePipe.transform(this.currentDate, 'yyyy-MM-dd')))

    if (currectFinancialYear && currectFinancialYear?.length > 0) {
      this.fyGrowthForm.patchValue({
        FinancialYearId: currectFinancialYear[0].Id
      })
    } else {
      if (this.financialYearList?.length > 0) {
        this.fyGrowthForm.patchValue({
          FinancialYearId: this.financialYearList[0].Id
        })
      }
    }
  }


  /**
   * BDO & BDM & Verticle Head data bind as per selected POSP or Team ref.
   * @param result 
   */
  private _bdobdmDefaultDataBind(result: IUserListDto): void {
    if (
      this.fyGrowthForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP ||
      this.fyGrowthForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference
    ) {

      if (this.canDisplayBDMField) {
        this.fyGrowthForm.patchValue({
          BDMName: result.BDMName,
          BDMId: result.BDMId,
        }, { emitEvent: false });
      }

      if (this.canDisplayBDOField) {
        this.fyGrowthForm.patchValue({
          BDOName: result.BDOName,
          BDOId: result.BDOId,
        }, { emitEvent: false });
      }

      if (this.canDisplayVerticalHeadField) {
        this.fyGrowthForm.patchValue({
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
      this.fyGrowthForm.patchValue({
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
    this.fyGrowthForm.get('SalesPersonName').valueChanges.subscribe((val) => {
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
    this.fyGrowthForm.get('TeamReferenceName').valueChanges.subscribe((val) => {
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
    this.fyGrowthForm.get('BDOName').valueChanges.subscribe((val) => {
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
    this.fyGrowthForm.get('BDMName').valueChanges.subscribe((val) => {
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
    this.fyGrowthForm.get('VerticleHeadName').valueChanges.subscribe((val) => {
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
    this.fyGrowthForm.get('CategoryCode').valueChanges.subscribe(val => {

      let selectedCategory = this.categoryList.find(cat => cat.Code == val);
      if (selectedCategory) {
        this.fyGrowthForm.patchValue({
          CategoryId: selectedCategory.Id,
        });
      }
      else {
        this.fyGrowthForm.patchValue({
          CategoryId: 0,
        });
      }

      this.fyGrowthForm.patchValue({
        SubCategoryCode: "",
        CategoryType: ""
      });

      this._getCategoryType(val, '')
      this._getCategoryWiseSubCategory(val)

    });

    // SubCategoryCode
    this.fyGrowthForm.get('SubCategoryCode').valueChanges.subscribe(val => {
      this.fyGrowthForm.patchValue({
        CategoryType: ""
      });

      let selectedSubCategory = this.subCategoryList.find(subcat => subcat.Code == val);
      if (selectedSubCategory) {
        this.fyGrowthForm.patchValue({
          SubCategoryId: selectedSubCategory.Id,
        });
        this._getCategoryType(selectedSubCategory.CategoryCode, val)
      }
      else {
        this.fyGrowthForm.patchValue({
          SubCategoryId: 0,
        });
        this._getCategoryType(this.fyGrowthForm.get('CategoryCode').value, val)
      }
    });

    // BranchId
    this.fyGrowthForm.get('BranchId').valueChanges.subscribe(val => {
      this.fyGrowthForm.patchValue({
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
    this.fyGrowthForm.get('SalesPersonType').valueChanges.subscribe(val => {
      this.fyGrowthForm.patchValue({
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


    if (this.fyGrowthForm.get('InsuranceCompany').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'InsuranceCompany', filterValues: [this.fyGrowthForm.get('InsuranceCompany').value] }
      )
    }

    if (this.fyGrowthForm.get('FinancialYearId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'FinancialYearId', filterValues: [this.fyGrowthForm.get('FinancialYearId').value.toString()] }
      )
    }

    if (this.fyGrowthForm.get('Month').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'Month', filterValues: [this.fyGrowthForm.get('Month').value.toString()] }
      )
    }


    if (this.fyGrowthForm.get('BranchId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'Branch', filterValues: [this.fyGrowthForm.get('BranchId').value.toString()] }
      )
    }
    
    if (this.fyGrowthForm.get('SalesPersonType').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'SalesPersonType', filterValues: [this.fyGrowthForm.get('SalesPersonType').value] }
      )
    }

    if (this.fyGrowthForm.get('SalesPersonId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'AgentOrTealLeadId', filterValues: [this.fyGrowthForm.get('SalesPersonId').value.toString()] }
      )
    } 
    
    if (this.fyGrowthForm.get('TeamReferenceId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'TeamReferenceId', filterValues: [this.fyGrowthForm.get('TeamReferenceId').value.toString()] }
      )
    } 

     if (this.fyGrowthForm.get('BDOId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'BDOId', filterValues: [this.fyGrowthForm.get('BDOId').value.toString()] }
      )
    } 
    
    if (this.fyGrowthForm.get('BDMId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'BDMId', filterValues: [this.fyGrowthForm.get('BDMId').value.toString()] }
      )
    } 
    
    if (this.fyGrowthForm.get('VerticleHeadId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'VerticleHeadId', filterValues: [this.fyGrowthForm.get('VerticleHeadId').value.toString()] }
      )
    }
    
    if (this.fyGrowthForm.get('CategoryId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'CategoryId', filterValues: [this.fyGrowthForm.get('CategoryId').value.toString()] }
      )
    }
    
    if (this.fyGrowthForm.get('SubCategoryId').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'SubCategoryId', filterValues: [this.fyGrowthForm.get('SubCategoryId').value.toString()] }
      )
    }
     
    if (this.fyGrowthForm.get('CategoryType').value) {
      generateReportSpecs.AdditionalFilters.push(
        { key: 'CategoryType', filterValues: [this.fyGrowthForm.get('CategoryType').value] }
      )
    }


    return generateReportSpecs;
  }
  //#endregion private-methods
}
