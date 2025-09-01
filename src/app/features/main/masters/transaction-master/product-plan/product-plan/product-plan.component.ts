import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, IFilterRule } from '@models/common';
import { IProductPlanDto, ProductPlanDto } from '@models/dtos/core/ProductPlanDto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { ISubCategoryDto } from '@models/dtos/core/subCategoryDto';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-product-plan',
  templateUrl: './product-plan.component.html',
  styleUrls: ['./product-plan.component.scss']
})
export class ProductPlanComponent {

  // #region public variables
  @Input() public PopUpmodes;
  @Input() public PopUptitles;
  @Input() public CategoryName;
  @Input() public CategoryId;
  @Input() public SubCategoryName;
  @Input() public SubCategoryId;
  @Input() public InsurerCode;
  @Input() public InsurerName;
  
  @Output() productPlanCreateData = new EventEmitter<any>()

  // Strings
  mode: string = '';
  title: string = '';

  //boolean
  editable: boolean

  // FormGroup
  ProductPlan: IProductPlanDto;
  ProductPlanForm: FormGroup;

  // Array
  DropdownMaster: dropdown;

  InsuranceCompany$: Observable<IInsuranceCompanyDto[]>
  SubCategory$: Observable<ISubCategoryDto[]>;
  destroy$: Subject<any>;

  api = API_ENDPOINTS.ProductPlan.Base;
  InsurerApi = API_ENDPOINTS.InsuranceCompany.Base

  // Errors
  errors: unknown;


  // #endregion public variables



  // #region constructor

  constructor(
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _router: Router,
    private _alertservice: AlertsService,
    private _dataService: HttpService,
    public dialog: MatDialog,
    private _MasterListService: MasterListService,
  ) {
    this.ProductPlan = new ProductPlanDto()
    this.DropdownMaster = new dropdown()
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

    /**
     * Use For Product/Plan create From Popup
     */
    if (this.PopUpmodes){
      this.mode = this.PopUpmodes
    }
    if (this.PopUptitles) {
      this.title = this.PopUptitles
    }

    switch (this.mode) {
      case "PopUpCreate":
        this.editable = true;
        break;
      case "Create":
        this.editable = true;
        break;
      case "View":
        this.editable = false;
        this.ProductPlan = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.ProductPlan = data['data'];
        break;
      default:
        break;
    }

    this.ProductPlanForm = this._init(this.ProductPlan, this.mode)
    if (this.mode == 'View' || this.mode == 'Edit') {
      this._dataService.getDataById(this.ProductPlanForm.get('InsurerCode').value, this.InsurerApi).subscribe((res) => {
        if (res.Success) {
          this.ProductPlanForm.patchValue({
            InsurerName: res.Data.Name
          })
        }
      })
    }

    if (this.PopUpmodes == "PopUpCreate") {
      
      if(this.CategoryId !="" && this.CategoryName !=""){        
        this.ProductPlanForm.patchValue({
          CategoryId: this.CategoryId,
          CategoryName:  this.CategoryName
        })
      }

      if(this.SubCategoryId !="" && this.SubCategoryName !=""){        
        this.ProductPlanForm.patchValue({
          SubCategoryId: this.SubCategoryId,
          SubCategoryName:  this.SubCategoryName
        })
      }     

      if(this.InsurerCode !="" && this.InsurerName !=""){        
        this.ProductPlanForm.patchValue({
          InsurerCode: this.InsurerCode,
          InsurerName:  this.InsurerName
        })
      }      
    }

    this._onFormChanges()
  }

  //#endregion lifecycle hooks

  // #region getters

  public get info() {
    return this.ProductPlanForm.controls
  }
  // #endregion getters

  /**
   * #region public methods
   */

  // previous page navigation button
  public backClicked() {
    if (this.mode == 'View' || this.mode == 'Edit') {
      this._router.navigate(['../../../'], { relativeTo: this._route })
    } 
    else if (this.mode == 'PopUpCreate') {
      this.productPlanCreateData.emit(null);
    }
    else {
      this._router.navigate(['../'], { relativeTo: this._route })
    }
  }

  public submitForm() {
    switch (this.mode) {

      case 'PopUpCreate': {
        this._dataService
          .createData(this.ProductPlanForm.value, this.api)
          .subscribe((res) => {
            if (res.Success) {
              // handle success message here
              this._alertservice.raiseSuccessAlert(res.Message, 'true')
              this.productPlanCreateData.emit(res.Data);
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

      case 'Create': {
        this._dataService
          .createData(this.ProductPlanForm.value, this.api)
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
          .updateData(this.ProductPlanForm.value, this.api)
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
    }
    // this._router.navigate([ROUTING_PATH.Master.Transaction.FinancialYear])
  }

  public openDiolog(type: string, title: string) {

    let filterData: IFilterRule[] = [];

    // default Rule For Only Get Active Data
    if (type == "SubCategory" || type == "Insurance") {
      filterData.push({
        Field: "Status",
        Operator: "eq",
        Value: 1
      })
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
      filterData: filterData,
      ispopup: true,
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'SubCategory') {
          this.ProductPlanForm.patchValue({
            SubCategoryId: result.Id,
            SubCategoryName: result.Name,
            CategoryId: result.CategoryId,
            CategoryName: result.CategoryName
          });
        }

        if (type == 'Insurance') {
          this.ProductPlanForm.patchValue({
            InsurerCode: result.Code,
            InsurerName: result.Name,
          })
        }

      }
    });
  }

  public onChange(event, type: string) {
    if (type == 'Status') {


      if (event.checked === true) {
        this.info['Status'].setValue(1)
      } else {
        this.info['Status'].setValue(0)

      }
    }
  }

  public SubCategorySelected(event: MatAutocompleteSelectedEvent): void {
    this.ProductPlanForm.patchValue({
      SubCategoryId: event.option.value.Id,
      SubCategoryName: event.option.value.Name,
      CategoryName: event.option.value.CategoryName,
      CategoryId: event.option.value.CategoryId,
    });
  }


  // bind the data of InsuranceCompanyName & InsuranceCompanyCode [autoComplete]
  public InsuranceCompanyNameSelected(event: MatAutocompleteSelectedEvent): void {
    this.ProductPlanForm.patchValue({
      InsurerCode: event.option.value.Code,
      InsurerName: event.option.value.Name,
    })

  }

  // Reset function
  public clear(name: string, id: string): void {
    this.info[name].setValue("")
    this.info[id].setValue("")
    if (name == 'SubCategoryName') {
      this.info['CategoryName'].setValue("");
      this.info['CategoryId'].setValue("");
    }
  }

  // #endregion public methods

  /**
   * #region private methods
   */

  private _onFormChanges() {

    // Rule For Get Only Active Master Data
    let Rule: IFilterRule[] = [
      {
        Field: "Status",
        Operator: "eq",
        Value: 1
      }
    ]

    this.ProductPlanForm.get('SubCategoryName').valueChanges.subscribe((val) => {
      this.SubCategory$ = this._MasterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.SubCategory.List, 'Name', val, Rule)
        .pipe(
          takeUntil(this.destroy$),
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

    this.ProductPlanForm.get('InsurerName').valueChanges.subscribe((val) => {
      this.InsuranceCompany$ = this._MasterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.InsuranceCompany.list, 'Name', val, Rule)
        .pipe(
          takeUntil(this.destroy$),
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

  private formValidation() {
    let alerts: Alert[] = []
  }

  private _init(prductPlan: IProductPlanDto, mode: string): FormGroup {
    let fyi = this._fb.group({
      ProductCode: ['<< Auto >>'],
      InsurerCode: [''],
      InsurerName: [''],
      Name: ['', [Validators.required]],
      SubCategoryId: [0, [Validators.required]],
      SubCategoryName: ['', [Validators.required]],
      CategoryId: [0, [Validators.required]],
      CategoryName: ['', [Validators.required]],
      SalesPersonType: [''],
      Status: [1],
    });



    if (prductPlan) {
      fyi.patchValue(prductPlan);
    }
    if (mode == "View") {
      fyi.disable();
    }
    return fyi;
  }
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  // #endregion private methods
}
