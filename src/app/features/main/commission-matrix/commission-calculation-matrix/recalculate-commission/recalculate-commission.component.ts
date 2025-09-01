import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MasterListService } from '@lib/services/master-list.service';
import { Alert, IAdditionalFilterObject, IFilterRule, OrderBySpecs } from '@models/common';
import { ICategoryDto } from '@models/dtos/core/CategoryDto';
import { CommissionMatrixService } from '../../commission-matrix.service';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { IUserDto } from '@models/dtos/core/userDto';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

const ActiveMasterDataRule: IFilterRule = {
  Field: 'Status',
  Operator: 'eq',
  Value: 1
}

@Component({
  selector: 'gnx-recalculate-commission',
  templateUrl: './recalculate-commission.component.html',
  styleUrls: ['./recalculate-commission.component.scss'],
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
export class RecalculateCommissionComponent {

  //#region public properties
  public title: string = '';
  public categoryList: ICategoryDto[] = [];
  public commissionMatrixForm: FormGroup;
  public userList$: Observable<IUserDto[]> // Observable of user list
  //#endregion

  //#region private properties
  private _commissionMatrixFormAlert: Alert[] = [];
  _destroy$: Subject<any>;
  //#endregion


  /**
   * 
   * #region constructor
   * @param _fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   * @param _commissionMatrixService 
   * @param _alertservice 
   * @param _MasterListService 
   * @param _datePipe 
   */
  constructor(
    private _fb: FormBuilder,
    private _commissionMatrixService: CommissionMatrixService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _alertservice: AlertsService,
    private _MasterListService: MasterListService,
    private _datePipe: DatePipe,
  ) {
    this._destroy$ = new Subject();
    this._fillMasterList()
  }
  // #endregion constructor


  //#region lifecycle-hooks

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  //on init
  ngOnInit(): void {
    let data = this._route.snapshot.data;
    this.title = data['title']
    this.commissionMatrixForm = this._initCommissionMatrixForm();
    this._onFormChange()
  }

  //#endregion

  //#region public methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // submit or save action
  public recalculateCommission(): void {

    this._commissionMatrixFormValidations()
    if (this._commissionMatrixFormAlert.length > 0) {
      this._alertservice.raiseErrors(this._commissionMatrixFormAlert);
      return;
    }

    this, this.commissionMatrixForm.patchValue({
      EffectiveDate: this._datePipe.transform(this.commissionMatrixForm.value.EffectiveDate, 'yyyy-MM-dd')
    })

    this._commissionMatrixService
      .recalculateCommission(this.commissionMatrixForm.value)
      .subscribe((res) => {
        if (res.Success) {
          // handle success message here
          this._alertservice.raiseSuccessAlert(res.Message, 'true')
          this.backClicked()
        } else {
          if (res.Alerts && res.Alerts.length > 0) {
            this._alertservice.raiseErrors(res.Alerts);
          } else {
            this._alertservice.raiseErrorAlert(res.Message);
          }
        }
      });

  }


  // previous page navigation button
  public backClicked(): void {
    this._router.navigate([ROUTING_PATH.CommissionMatrix.MatrixManagement])
  }


  /**
   * When Blur POSP Field THen check If User Is selected Or not
   */
  public onPospBlur(): void {
    let User = this.commissionMatrixForm.value.User;

    if (User && User.Id) {
      this.commissionMatrixForm.patchValue({
        UserId: User.Id,
        UserName: User.FullName,
      });
      
    } else {
      this.commissionMatrixForm.patchValue({
        UserId: null,
        UserName:null,
        User:null
      }, { emitEvent: false });
    }
  }

  /**
   * Auto complete Option selected event
   * @param User 
   * @returns 
   */
  public displayPospDataFn = (User) => {
    if (User) {
      this.commissionMatrixForm.patchValue({
        UserId: User.Id,
        UserName: User.FullName,
      });
      return User.FullName;
    }
  };

  // #endregion public methods

  //#region private-methods

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  //inin form
  private _initCommissionMatrixForm(): FormGroup {
    let fg = this._fb.group({
      Id: [0],
      CategoryId: [0],
      CategoryName: [''],
      CategoryCode: [''],
      EffectiveDate: [''],
      User:[],
      UserId: [],
      UserName: [''],
    });

    return fg;
  };


  // Get MAster data for drplist
  private _fillMasterList(): void {

    // fill Product Type
    let SubCategoryRule: IFilterRule[] = [ActiveMasterDataRule]

    let OrderBySpecs: OrderBySpecs[] = [
      {
        field: "SrNo",
        direction: "asc"
      }
    ]

    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Category.List, 'Name', '', SubCategoryRule, [], OrderBySpecs)
      .subscribe(res => {
        if (res.Success) {
          this.categoryList = res.Data.Items
        }
      })


  };


  // Form Validation
  private _commissionMatrixFormValidations(): void {
    this._commissionMatrixFormAlert = []

    if (this.commissionMatrixForm.get('CategoryId').value == 0 || this.commissionMatrixForm.get('CategoryId').value == null) {
      this._commissionMatrixFormAlert.push({
        Message: 'Category is required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.commissionMatrixForm.get('EffectiveDate').value) {
      this._commissionMatrixFormAlert.push({
        Message: 'Effective Date is required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }
  };


  private _onFormChange(): void {

    // changes product type
    this.commissionMatrixForm.get('CategoryId').valueChanges.subscribe(val => {

      let SelectedCategory = this.categoryList.find(x => x.Id == val)
      if (SelectedCategory) {
        this.commissionMatrixForm.patchValue({
          CategoryName: SelectedCategory.Name,
          CategoryCode: SelectedCategory.Code
        })
      }
      else {
        this.commissionMatrixForm.patchValue({
          CategoryName: "",
          CategoryCode: ""
        })
      }
    })


    // change POSP
    this.commissionMatrixForm.get('User').valueChanges.pipe(takeUntil(this._destroy$), debounceTime(500), distinctUntilChanged())
      .subscribe((val) => {
      if (typeof val === "string") {
      let Rule: IFilterRule[] = [];

      let AdditionalFilters: IAdditionalFilterObject[] = [
        { key: "FullName", filterValues: [val] }
      ]


        AdditionalFilters.push({ key: 'UserType', filterValues: ['TeamReference', 'Agent'] })
      


      this.userList$ = this._MasterListService
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
      }
    });

  }


  // #endregion private methods
}
