import { Component} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { HelperService } from '@lib/services/helper.service';
import { ISubCategoryDto, SubCategoryDto } from '@models/dtos/core/subCategoryDto';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { StatusOptions } from '@config/status.config';
import { MasterListService } from '@lib/services/master-list.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { ICategoryDto } from '@models/dtos/core/CategoryDto';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'gnx-sub-category',
  templateUrl: './sub-category.component.html',
  styleUrls: ['./sub-category.component.scss']
})
export class SubCategoryComponent {
  // #region public variables

  //boolean
  editable: boolean

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  subCategoryeApi = API_ENDPOINTS.SubCategory.Base;
  categoryApi=API_ENDPOINTS.Category.Base
  statusOption = StatusOptions

  // FormGroup
  SubCategoryeForm: FormGroup;
subCategoryFrom: ISubCategoryDto;
  addSubCategoryForm: any;
  destroy$: Subject<any>;
  Category$:Observable<ICategoryDto[]>;
  // Errors
  errors: unknown;

  categoryList;

  // #endregion public variables
  onChange(event,type:string) {


    if(type=='Status'){


  if (event.checked === true) {
    this.SubCategoryeForm.controls['Status'].setValue(1)
    // this.Form.controls['Online'].value = 1

  } else {
    this.SubCategoryeForm.controls['Status'].setValue(0)

  }
}
  }
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
    public dialog: MatDialog
  ) {
    this.CategoryList()
    this.destroy$ = new Subject();
  }
  // #endregion constructor

 // Reset function
 public clear(name: string, id: string): void {
  this.f[name].setValue("")
  this.f[id].setValue("")
}

public openDiolog(type: string, title: string) {
  const dialogConfig = new MatDialogConfig();
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.width = '51vw';
  dialogConfig.minWidth = 'fit-content';
  dialogConfig.minHeight = "80vh";
  dialogConfig.maxHeight = '80vh';

  dialogConfig.data = {
    type: type,
    title: title,
    ispopup: true,
  };

  const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      if (type == 'Category') {
        this.SubCategoryeForm.patchValue({
          CategoryId: result.Id,
          CategoryName: result.Name,
        });
      }

    }
  });
}
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
        this.subCategoryFrom = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.subCategoryFrom = data['data'];
        break;
      default:
        break;
    }
    this.addSubCategoryForm = this._init(this.subCategoryFrom, this.mode);
    if (this.mode == "View") {
      this.SubCategoryeForm.disable();
    }
    this._onFormChanges();
  }
  //#endregion lifecycle hooks


  // #region getters

  get f() {
    return this.SubCategoryeForm.controls
  }

  // #endregion getters

  /**
   * #region public methods
   */

  // submit or save action
  submitform = () => {
    switch (this.mode) {

      case 'Create': {
        this._dataService
          .createData(this.SubCategoryeForm.value, this.subCategoryeApi)
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
          .updateData(this.SubCategoryeForm.value, this.subCategoryeApi)
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
  };

  // previous page navigation button
  public backClicked() {
    if (this.mode == 'View' || this.mode == 'Edit') {
      this._router.navigate(['../../'], { relativeTo: this._route })
    } else {
      this._router.navigate(['../'], { relativeTo: this._route })
    }
  }

  // #endregion public methods

  CategorySelected(event: MatAutocompleteSelectedEvent): void {
    this.SubCategoryeForm.patchValue({
          CategoryId: event.option.value.Id,
            CategoryName: event.option.value.Name
    });
  }


  // * #region private methods

  private _onFormChanges() {
    this.SubCategoryeForm.get('CategoryName').valueChanges.subscribe((val) => {
      this.Category$ = this._MasterListService.getFilteredCategoryList(val).pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              let result = Array.from(
                res.Data.Items.reduce(
                  (m, t) => m.set(t.Name, t),
                  new Map()
                ).values()
              );
              result = result.filter((el) => {
                if (el.Name) {
                  return el;
                }
              });
              return of(result);
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
  /**
   * #region private methods
   */



  private _init(subCategoryData: SubCategoryDto, mode: string): FormGroup {
    this.SubCategoryeForm = this._fb.group({
      Id: [0],
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), this.noWhitespaceValidator]],
      CategoryId: [null,[Validators.required]],
      CategoryName: ['',Validators.required],
      Status: [1, Validators.required],
      SrNo: [0],
    });


    if (subCategoryData) {
      this.SubCategoryeForm.patchValue(subCategoryData);
    }
    if (mode == "View") {
      this.SubCategoryeForm.disable();
    }
    return this.SubCategoryeForm;
  }

  private CategoryList() {
    let defaultQSpec = {
      IncludeDeleted: false,
      PaginationSpecs: {
        PaginationRequired: false,
        Page: '1',
        Limit: '100',
      },
      FilterConditions: {
        Condition: 'and',
        Rules: [
          {
            Field: "Name",
            Operator: "eq",
            Value: ''
          }
        ],
      },
      OrderBySpecs: [
        {
          Field: 'Name',
          Direction: 'asc',
        },
      ],
      AdditionalFilters: [],
      DisplayColumns: [],
    }


    this._dataService.getDataList(defaultQSpec, this.categoryApi).subscribe((res: any) => {
      this.categoryList = res?.Data.Items
    })
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }
  // #endregion private methods

}
