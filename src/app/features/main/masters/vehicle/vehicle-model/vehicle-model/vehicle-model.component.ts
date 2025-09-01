import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { StatusOptions } from '@config/status.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { IVehicleModelDto, VehicleModelDto } from '@models/dtos/core/VehicleModelDto';
import { IVehicleBrandDto } from '@models/dtos/core/vehicleBrandDto';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-vehicle-model',
  templateUrl: './vehicle-model.component.html',
  styleUrls: ['./vehicle-model.component.scss']
})
export class VehicleModelComponent {
  // #region public variables

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  Model_api = API_ENDPOINTS.VehicleModel.Base
  Brand_API = API_ENDPOINTS.VehicleBrand.Base
  statusOption = StatusOptions
  DropdownMaster: dropdown;
  //boolean
  editable: boolean;

  // FormGroup
  VehicleModelForm: FormGroup;
  VehicleModelFrom: IVehicleModelDto
  addVehicleModelForm: any
  brands$:Observable<IVehicleBrandDto[]>;
  destroy$: Subject<any>;
  // Errors
  errors: unknown;

  BrandList;

  // #endregion public variables
  onChange(event,type:string) {


    if(type=='Status'){


  if (event.checked === true) {
    this.VehicleModelForm.controls['Status'].setValue(1)

  } else {
    this.VehicleModelForm.controls['Status'].setValue(0)

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
    private _dataService: HttpService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _alertservice: AlertsService,
    public _helperservice: HelperService,
    private _MasterListService: MasterListService,
    public dialog: MatDialog
  ) {
    this.getBrandList()
    this.DropdownMaster= new dropdown;
    this.destroy$ = new Subject();
  }
  // #endregion constructor


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
        this.VehicleModelFrom = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.VehicleModelFrom = data['data'];
        break;
      default:
        break;
    }
    this.addVehicleModelForm = this._init(this.VehicleModelFrom, this.mode);
    if (this.mode == "View") {
      this.VehicleModelForm.disable();
    }
    this._onFormChanges();
  }
  // #region getters

  get f() {
    return this.VehicleModelForm.controls
  }

  // #endregion getters

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
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      type: type,
      title: title,
      ispopup: true,
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'Brand') {
          this.VehicleModelForm.patchValue({
            BrandId: result.Id,
            BrandName: result.Name,
          });
        }
      }
    });
  }
  /**
   * #region public methods
   */

  // submit or save action
  submitform = () => {
    switch (this.mode) {

      case 'Create': {
        this._dataService
          .createData(this.VehicleModelForm.value, this.Model_api)
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
          .updateData(this.VehicleModelForm.value, this.Model_api)
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



  public getBrandList() {

    let querySpec = {
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

    this._dataService.getDataList(querySpec, this.Brand_API).subscribe((res: any) => {
      this.BrandList = res?.Data.Items
    })

  }


  // previous page navigation button
  public backClicked() {
    if (this.mode == 'View' || this.mode == 'Edit') {
      this._router.navigate(['../../'], { relativeTo: this._route })
    } else {
      this._router.navigate(['../'], { relativeTo: this._route })
    }
  }

  // #endregion public methods

  VehicleBrandSelected(event: MatAutocompleteSelectedEvent): void {
    this.VehicleModelForm.patchValue({
      BrandId: event.option.value.Id,
      BrandName: event.option.value.Name,
    });
  }


  // * #region private methods

  private _onFormChanges() {
      this.VehicleModelForm.get('BrandName').valueChanges.subscribe((val) => {
        this.brands$ = this._MasterListService.getFilteredVehilceBrandList(val).pipe(
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

  private _init(RTOData: VehicleModelDto, mode: string): FormGroup {
    this.VehicleModelForm = this._fb.group({
      Id: [0],
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(120), this.noWhitespaceValidator]],
      Type: ['', [Validators.required]],
      Status: [1, [Validators.required]],
      BrandId: [null,[Validators.required]],
      BrandName: ['', [Validators.required]],

    });


    if (RTOData) {
      this.VehicleModelForm.patchValue(RTOData);
    }
    if (mode == "View") {
      this.VehicleModelForm.disable();
    }
    return this.VehicleModelForm;
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }
  // #endregion private methods
}
