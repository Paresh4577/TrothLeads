import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { popUpColumns } from '@config/popupList.config';
import { HttpService } from '@lib/services/http/http.service';
import { IFilterRule, IAdditionalFilterObject } from '@models/common';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'gnx-gen-popup',
  templateUrl: './gen-popup.component.html',
  styleUrls: ['./gen-popup.component.scss']
})
export class GenPopupComponent {
  title: string;
  ispopup: boolean = false;
  columnDef: any;
  selecteData: any
  multiSelectData: any
  FilterConditions: any
  FiltersRules: any[] = []
  AdditionalFilter: IAdditionalFilterObject[] = [];
  columnSortOptions: any[] = []
  sortField: string;
  // Default page filters
  pagefilters = {
    currentPage: 1,
    limit: 20,
    columnSearchOptions: {

      Field: '',
      Operator: "",
      Value: ""

    },
    columnSortOptions: {
      Field: 'Name',
      Direction: 'asc',
    },
  };


  APIendPoint: any;
  displayedColumns: string[];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  destroy$: Subject<any>;
  DataList: BehaviorSubject<any>;
  DataList$: Observable<any>;





  //   // #end region public variables

  //   /**
  //    * #region constructor
  //    * @param _route : used for getting dynamic route or id
  //    */

  constructor(
    private _dataService: HttpService,
    public dialogRef: MatDialogRef<GenPopupComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      type: string;
      title: string;
      filterData: IFilterRule[];
      addFilterData: IAdditionalFilterObject[];
      isMultiple: boolean;
      data?: any;
    }
  ) {
    this.title = this.data.title
    if (data.filterData) {
      this.FiltersRules = this.data.filterData
    }

    if (data.addFilterData) {
      this.AdditionalFilter = data.addFilterData
    }

    if (this.data.type == 'PIN') {
      this.APIendPoint = API_ENDPOINTS.Pincode.list
    }
    if (this.data.type == 'Country') {
      this.APIendPoint = API_ENDPOINTS.Country.List
    }
    if (this.data.type == 'State') {
      this.APIendPoint = API_ENDPOINTS.State.List
    }
    if (this.data.type == 'Pincode') {
      this.APIendPoint = API_ENDPOINTS.Pincode.list
    }
    if (this.data.type == 'Role') {
      this.APIendPoint = API_ENDPOINTS.Role.List
    }
    if (this.data.type == 'ProductPlan') {
      this.APIendPoint = API_ENDPOINTS.ProductPlan.List
    }
    if (this.data.type == 'GroupHead') {
      this.APIendPoint = API_ENDPOINTS.GroupHead.List
    }
    if (this.data.type == 'Customer' || this.data.type == 'CustomerOfGroupHead') {
      this.APIendPoint = API_ENDPOINTS.Customer.List
    }
    if (this.data.type == 'Category' || this.data.type == 'MultiCategory') {
      this.APIendPoint = API_ENDPOINTS.Category.List
    }
    if (this.data.type == 'Insurance') {
      this.APIendPoint = API_ENDPOINTS.InsuranceCompany.list
    }
    if (this.data.type == 'FinancierCode') {
      this.APIendPoint = API_ENDPOINTS.ListHelper.List
      this.sortField = "InsuranceHelper.Name"
    }
    if (this.data.type == 'SubCategory') {
      this.APIendPoint = API_ENDPOINTS.SubCategory.List
    }
    if (this.data.type == 'SubModel' || this.data.type == 'CategoryOfSubModel') {
      this.APIendPoint = API_ENDPOINTS.VehicleSubModel.List
    }
    if (this.data.type == 'Model' || this.data.type == 'CategoryOfModel') {
      this.APIendPoint = API_ENDPOINTS.VehicleModel.List
    }
    if (this.data.type == 'Brand') {
      this.APIendPoint = API_ENDPOINTS.VehicleBrand.List
    }
    if (this.data.type == 'City') {
      this.APIendPoint = API_ENDPOINTS.City.List
    }
    if (this.data.type == 'Designation') {
      this.APIendPoint = API_ENDPOINTS.Designation.List
    }
    if (this.data.type == 'User') {
      this.APIendPoint = API_ENDPOINTS.User.List
    }
    if (this.data.type == 'Agent') {
      this.APIendPoint = API_ENDPOINTS.Agent.List
    }
    if (this.data.type == 'Source') {
      this.APIendPoint = API_ENDPOINTS.Source.List
    }
    if (this.data.type == 'SubSource') {
      this.APIendPoint = API_ENDPOINTS.SubSource.List
    }
    if (this.data.type == 'Bank') {
      this.APIendPoint = API_ENDPOINTS.Bank.List
    }
    if (this.data.type == 'Branch' || this.data.type == 'MultiBranch') {
      this.APIendPoint = API_ENDPOINTS.Branch.List
    }
    if (this.data.type == 'RecruitingPerson') {
      this.APIendPoint = API_ENDPOINTS.User.List
    }
    if (this.data.type == 'ReferenceName') {
      this.APIendPoint = API_ENDPOINTS.User.List
    }
    if (this.data.type == 'BDMName') {
      this.APIendPoint = API_ENDPOINTS.User.List
    }
    if (this.data.type == 'BDOName') {
      this.APIendPoint = API_ENDPOINTS.User.List
    }
    if (this.data.type == 'VerticalHeadName') {
      this.APIendPoint = API_ENDPOINTS.User.List
    }
    if (this.data.type == 'TeamReference') {
      this.APIendPoint = API_ENDPOINTS.TeamRef.List
    }
    if (this.data.type == 'Transaction') {
      this.APIendPoint = API_ENDPOINTS.Transaction.List
    }
    if (this.data.type == 'CoShareTransaction' || this.data.type == 'PolicyNumber') {
      this.APIendPoint = API_ENDPOINTS.Transaction.CoShareWiseList + "/true"
    }
    if (this.data.type == 'FleetBusiness') {
      this.APIendPoint = API_ENDPOINTS.Fleet.List
    }
    if (this.data.type == 'CommodityType') {
      this.APIendPoint = API_ENDPOINTS.CommodityType.List
    }

    this.columnDef = popUpColumns[this.data.type];

    if (this.data.type == 'Pincode' || this.data.type == 'PIN') {
      this.sortField = popUpColumns[this.data.type][2].searchFieldName
    }
    else if (this.data.type == 'TeamReference' || this.data.type == 'User' || this.data.type == 'CustomerOfGroupHead') {
      this.sortField = "FirstName"
    }
    else {
      this.sortField = popUpColumns[this.data.type][1].searchFieldName
    }

    // default sort order
    this.columnSortOptions = [{
      Field: this.sortField,
      Direction: "asc"
    }]
    this.destroy$ = new Subject();

    this.DataList = new BehaviorSubject(null);
    this.DataList$ = this.DataList.asObservable();
  }

  // #endregion constructor

  ngOnInit(): void {
    this.pagefilters.currentPage = 1;
    this._init();
  }

  ngOnDestroy(): void {
    // Resets the filters.
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  // #region public methods

  public cancle() {
    this.dialogRef.close();
  }

  public submit() {
    if (this.selecteData) {
      this.dialogRef.close(this.selecteData);
    }
    if (this.multiSelectData) {
      this.dialogRef.close(this.multiSelectData);
    }
  }
  Direction = 'asc'

  sortColumn(column: string) {
    this.columnSortOptions = []
    this.pagefilters.columnSortOptions.Field = column
    if (this.pagefilters.columnSortOptions.Direction == 'asc') {
      this.pagefilters.columnSortOptions.Direction = 'desc';
      // this._loadLists();
    } else {
      this.Direction = 'asc'
      this.pagefilters.columnSortOptions.Direction = 'asc';
      // this._loadLists();
    }
    this.columnSortOptions.push(this.pagefilters.columnSortOptions)
    this.pagefilters.currentPage = 1;
    this._loadLists();

  }

  searchColumn(value) {
    if (value.isAdditional && value.isAdditional == true) {
      if (value.searchValue != null && value.searchValue != '') {
        let additionalFilters: IAdditionalFilterObject = {
          key: value.field,
          filterValues: [value.searchValue],
        };

        let i = this.AdditionalFilter.findIndex(
          (f) => f.key === additionalFilters.key
        );

        if (i >= 0) {
          this.AdditionalFilter[i] = additionalFilters;
        } else {
          this.AdditionalFilter.push(additionalFilters);
        }
      } else {
        let indexNumber: number = this.AdditionalFilter.findIndex(item => item.key === value.field);
        if (indexNumber !== -1) {
          this.AdditionalFilter.splice(indexNumber, 1);
        }
      }

    } else {
      this.pagefilters.columnSearchOptions.Field = value.field
      this.pagefilters.columnSearchOptions.Operator = "contains"
      this.pagefilters.columnSearchOptions.Value = value.searchValue
      //   if(this.data.type != 'CustomerOfGroupHead' &&
      //   this.data.type != 'CategoryOfModel' &&
      //   this.data.type != 'CategoryOfSubModel' &&
      //     this.data.type != 'Transaction' &&
      //     this.data.type != 'GroupHead'
      // ){
      //     this.FiltersRules = []
      //   }

      let rule = {
        Field: this.pagefilters.columnSearchOptions.Field,
        Operator: this.pagefilters.columnSearchOptions.Operator,
        Value: this.pagefilters.columnSearchOptions.Value,
      }

      if (this.FiltersRules) {
        let i = this.FiltersRules.findIndex((f) => f.Field === rule.Field);
        if (i >= 0) {
          this.FiltersRules[i] = rule;
        } else {
          this.FiltersRules.push(rule);
        }
      }

      // this.FiltersRules.push(this.pagefilters.columnSearchOptions  )
    }

    this.pagefilters.currentPage = 1;
    this._loadLists();
  }

  selectedData(data) {
    // this.selecteData=data
    this.dialogRef.close(data);
  }

  multiSelectedData(data) {
    this.multiSelectData = data
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

  // #endregion public methods

  // #region private methods

  private _init() {

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
      FilterConditions: {
        Condition: 'and',
        Rules: this.FiltersRules,
        // Rules: this.FilterConditions,
      },
      OrderBySpecs: this.columnSortOptions,
      AdditionalFilters: this.AdditionalFilter,
      DisplayColumns: [],
    };

    this._dataService
      .getData(listRequestBody, this.APIendPoint)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (res.Success) {
            this.DataList.next(res);
          }
        },
        (err) => {
          // this.alertService.handleError(err);
        }
      );
  }
  // #endregion private methods
}
