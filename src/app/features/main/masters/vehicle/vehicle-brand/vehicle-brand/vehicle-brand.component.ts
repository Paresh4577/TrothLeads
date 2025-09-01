import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { StatusOptions } from '@config/status.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { HttpService } from '@lib/services/http/http.service';
import { IVehicleBrandDto, VehicleBrandDto } from '@models/dtos/core/vehicleBrandDto';

@Component({
  selector: 'gnx-vehicle-brand',
  templateUrl: './vehicle-brand.component.html',
  styleUrls: ['./vehicle-brand.component.scss']
})
export class VehicleBrandComponent {

  // #region public variables

  //boolean
  editable: boolean

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  brandApi = API_ENDPOINTS.VehicleBrand.Base;
  statusOption = StatusOptions

  // FormGroup
  VehicleBrandForm: FormGroup;
  VehicleBrandFrom: IVehicleBrandDto;
  addVehicleBrandForm: any;

  // Errors
  errors: unknown;

  BrandList;

  // #endregion public variables
  onChange(event,type:string) {


    if(type=='Status'){


  if (event.checked === true) {
    this.VehicleBrandForm.controls['Status'].setValue(1)

  } else {
    this.VehicleBrandForm.controls['Status'].setValue(0)

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
    public _helperservice: HelperService
  ) {

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
        this.VehicleBrandFrom = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.VehicleBrandFrom = data['data'];
        break;
      default:
        break;
    }
    this.addVehicleBrandForm = this._init(this.VehicleBrandFrom, this.mode);
    if (this.mode == "View") {
      this.VehicleBrandForm.disable();
    }

  }
  //#endregion lifecycle hooks


  // #region getters

  get f() {
    return this.VehicleBrandForm.controls
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
          .createData(this.VehicleBrandForm.value, this.brandApi)
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
          .updateData(this.VehicleBrandForm.value, this.brandApi)
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

  /**
   * #region private methods
   */



  private _init(vehicleBrandData: VehicleBrandDto, mode: string): FormGroup {
    this.VehicleBrandForm = this._fb.group({
      Id: [0],
      Name: ['', [Validators.required, Validators.maxLength(120), this.noWhitespaceValidator]],
      Status: [1]
    });


    if (vehicleBrandData) {
      this.VehicleBrandForm.patchValue(vehicleBrandData);
    }
    if (mode == "View") {
      this.VehicleBrandForm.disable();
    }
    return this.VehicleBrandForm;
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }
  // #endregion private methods
}
