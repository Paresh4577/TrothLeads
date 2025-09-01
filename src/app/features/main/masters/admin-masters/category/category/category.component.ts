import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { StatusOptions } from '@config/status.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { Alert, IFilterRule } from '@models/common';
import { CategoryDto, ICategoryDto, IInsuranceCategoriesDto, InsuranceCategoriesDto } from '@models/dtos/core/CategoryDto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent {
  // #region public variables

  //boolean
  editable: boolean

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  categoryApi = API_ENDPOINTS.Category.Base;
  statusOption = StatusOptions

  // FormGroup
  CategoryForm: FormGroup;
  categoryFrom: ICategoryDto;
  addCategoryForm: any;
  InsuranceCompany$: Observable<IInsuranceCompanyDto[]>;
  destroy$: Subject<any>;

  // Errors
  errors: unknown;

  // error array
  InsuranceCompanyAlerts: Alert[] = []; // Step Invalid field error message


  // #endregion public variables

  /**
   * #region constructor
   * @param _location : used for back or prev page navigation
   * @param _fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   */
  constructor(
    private _fb: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _alertservice: AlertsService,
    public _helperservice: HelperService,
    private _MasterListService: MasterListService,
    public _dialogService: DialogService,
  ) {
    this.destroy$ = new Subject();
  }
  // #endregion constructor


  //#region lifecycle hooks
  // -----------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------
  ngOnInit(): void {
    let data = this._route.snapshot.data;
    this.mode = data['mode'];
    this.title = data['title'];
    switch (this.mode) {
      case "Create":
        this.editable = true;
        break;
      case "View":
        this.editable = false;
        this.categoryFrom = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.categoryFrom = data['data'];
        break;
      default:
        break;
    }
    this.addCategoryForm = this._init(this.categoryFrom, this.mode);
    if (this.mode == "View") {
      this.CategoryForm.disable();
    }

    this._fillList();

    if (this.mode == "Create") {
      this.addInsuranceCompanies();
    }
    else {
      if (this.insuranceCategory.value.length < 1) {
        this.addInsuranceCompanies();
      }
    }
  }
  //#endregion lifecycle hooks


  // #region getters

  get f() {
    return this.CategoryForm.controls
  }

  public get insuranceCategory() {
    return this.CategoryForm.controls["InsuranceCategoryMapping"] as FormArray;
  }

  // #endregion getters

  /**
   * #region public methods
   */
  onChange(event, type: string) {


    if (type == 'Online') {


      if (event.checked === true) {
        this.CategoryForm.controls['Online'].setValue(1)
      } else {
        this.CategoryForm.controls['Online'].setValue(0)

      }
    }


    if (type == 'Offline') {


      if (event.checked === true) {
        this.CategoryForm.controls['Offline'].setValue(1)

      } else {
        this.CategoryForm.controls['Offline'].setValue(0)

      }
    }

    if (type == 'Status') {


      if (event.checked === true) {
        this.CategoryForm.controls['Status'].setValue(1)
        // this.Form.controls['Online'].value = 1

      } else {
        this.CategoryForm.controls['Status'].setValue(0)

      }
    }
  }
  // submit or save action
  submitform = () => {

    if (!this.insuranceCategory.value?.length) {
      this._alertservice.raiseErrorAlert('At least one Insurance Companies Mapping  is required');
      return;
    }

    /**
     * Start Of Validation Category Required Field
     */
    if (this.CategoryForm.get('Name').value == 0 || this.CategoryForm.get('Name').value == '') {
      this._alertservice.raiseErrorAlert(`Category Name is required.`, false);
      return;
    }

    if (this.CategoryForm.get('SrNo').value == 0 || this.CategoryForm.get('SrNo').value == '' || this.CategoryForm.get('SrNo').value == null) {
      this._alertservice.raiseErrorAlert(`Sort Order is required.`, false);
      return;
    }

    /**
     * Start of Validate to Insurance Companies Details
     **/

    this._validateInsuranceCompanyField()

    if (this.InsuranceCompanyAlerts.length > 0) {
      this._alertservice.raiseErrors(this.InsuranceCompanyAlerts)
      return;
    }

    if (this.mode == "Edit") {
      this.CategoryForm.value.InsuranceCategoryMapping.map((ele, i) => {
        ele.CategoryId = this.CategoryForm.value.Id;
      });
    }

    switch (this.mode) {

      case 'Create': {
        this._dataService
          .createData(this.CategoryForm.value, this.categoryApi)
          .subscribe((res) => {
            if (res.Success) {
              // handle success message here
              this._alertservice.raiseSuccessAlert(res.Message, 'true')
              this.backClicked()
            } else {
              this._alertservice.raiseErrors(res.Alerts);
              // handle page/form level alerts here
              if (res.Alerts[0]) {
                this.errors = res.Alerts[0].Message
              }
            }
          });
        break;
      }

      case 'Edit': {
        this._dataService
          .updateData(this.CategoryForm.value, this.categoryApi)
          .subscribe((res) => {
            if (res.Success) {
              // handle success message here
              this._alertservice.raiseSuccessAlert(res.Message, 'true')
              this.backClicked()
            } else {
              // handle page/form level alerts here
              this._alertservice.raiseErrors(res.Alerts);
              if (res.Alerts[0]) {
                this.errors = res.Alerts[0].Message
              }
            }
          });
        break;
      }
    }
  };

  // previous page navigation button
  public backClicked() {
    if (this.mode == 'View' || this.mode == 'Edit') {
      this._router.navigate(['../../'], { relativeTo: this._route })
    } else {
      this._router.navigate(['../'], { relativeTo: this._route })
    }
  }

  // add new row in Insurance Company array
  public addInsuranceCompanies() {

    this._validateInsuranceCompanyField()

    if (this.InsuranceCompanyAlerts.length > 0) {
      this._alertservice.raiseErrors(this.InsuranceCompanyAlerts)
      return;
    }

    var row: IInsuranceCategoriesDto = new InsuranceCategoriesDto()
    this.insuranceCategory.push(this._initInsuranceCategoryForm(row));

  }

  // Remove row in Insurance Company array
  public RemoveInsuranceCompanies(index: number) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.insuranceCategory.removeAt(index)
        }
      });
  }

  // #endregion public methods

  /**
   * #region private methods
   */

  private _init(CategoryData: CategoryDto, mode: string): FormGroup {

    this.CategoryForm = this._fb.group({
      Id: [0],
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), this.noWhitespaceValidator]],
      Online: [0, [Validators.required]],
      Offline: [0, [Validators.required]],
      Status: [1, Validators.required],
      SrNo: [0, [Validators.required]],
      InsuranceCategoryMapping: this._buildInsuranceCategoryForm(CategoryData.InsuranceCategoryMapping)
    });

    if (CategoryData) {
      this.CategoryForm.patchValue(CategoryData);
    }


    if (mode == "View") {
      this.CategoryForm.disable();
    }
    return this.CategoryForm;
  }

  private _buildInsuranceCategoryForm(items: InsuranceCategoriesDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);

    if (items != null) {
      if (!(items && items.length > 0) && this.mode !== "View") {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initInsuranceCategoryForm(i));
        });
      }


      // if (items != null) {
      //   if (items && items.length > 0) {
      //     return formArray;
      //   }
      //   if (items != null) {
      //     items.forEach((i) => {
      //       formArray.push(this._initInsuranceCategoryForm(i))
      //     })
      //   }
    }

    return formArray;
  }

  private _initInsuranceCategoryForm(item: InsuranceCategoriesDto): FormGroup {
    let dF = this._fb.group({
      CategoryId: [0],
      InsuranceCompanyCode: ['', [Validators.required]],
      InsuranceCompanyName: ['']
    })

    if (item != null) {
      if (!item) {
        item = new InsuranceCategoriesDto();
      }
      if (item) {
        dF.patchValue(item);
      }
    }
    return dF;
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  /**
   * Fill list in dropdown list in Category Page
   */
  private _fillList() {

    this.InsuranceCompany$ = this._MasterListService.getAllCompanyNameList('').pipe(takeUntil(this.destroy$), switchMap((res) => {

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

  /**   * 
   * Validate Insurance Company Mapping Field
   */
  private _validateInsuranceCompanyField() {

    this.InsuranceCompanyAlerts = []

    this.insuranceCategory.controls.forEach((element, index) => {
      if (element.get('InsuranceCompanyCode').value === "") {

        this.InsuranceCompanyAlerts.push({
          Message: `Insurance Company ${index + 1} is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });

    /**
     * check duplicate value if all mandatory fields are proper validated
     *
    */
    if (this.InsuranceCompanyAlerts.length < 1) {
      this.InsuranceCompanyAlerts = []
      let unique = [...new Set(this.insuranceCategory.value.map(item => item.InsuranceCompanyCode))];

      for (let i = 0; i < unique.length; i++) {

        var duplicateData = this.insuranceCategory.value.filter(function (element) {
          return (element.InsuranceCompanyCode == unique[i]);
        });

        if (duplicateData.length > 1) {
          this.InsuranceCompanyAlerts.push({
            Message: 'Insurance Company already exists in list.',
            CanDismiss: false,
            AutoClose: false,
          })
          this._alertservice.raiseErrors(this.InsuranceCompanyAlerts);
          break
        }
      };
    }

  }

  // #endregion private methods

}