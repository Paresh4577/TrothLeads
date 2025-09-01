import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';

@Component({
  selector: 'gnx-vehicle-type',
  templateUrl: './vehicle-type.component.html',
  styleUrls: ['./vehicle-type.component.scss']
})
export class VehicleTypeComponent {
  // #region public variables

  // Strings
  mode: string = ''; // Page mode like as add, edit.....
  title: string = ''; // page Header Title
  VehicleTypeMappingApi: string = ""

  // FormGroup
  VehicleTypeMappingForm: FormGroup; // Reactive Form
  VehicleTypeMapping: any // Form Value

  // boolean
  editable: boolean;


  // currencyList;

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
    private _dataService: HttpService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _alertservice: AlertsService,
  ) {

  }
  // #endregion constructor


  //#region lifecycle-hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    let data = this._route.snapshot.data;
    this.mode = data['mode']; // set Page mode
    this.title = data['title']; // Set PAge Title
    // Resolve Data



    switch (this.mode) {
      case "Create":
        this.editable = true;
        break;
      case "View":
        this.editable = false;
        this.VehicleTypeMapping = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.VehicleTypeMapping = data['data'];
        break;
      default:
        break;
    }

    this._initForm(this.VehicleTypeMapping, this.mode);

    // In view Mode All Form Field Is diable
    if (this.mode == "View") {
      this.VehicleTypeMappingForm.disable();
    }


  }

  //#endregion

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // #region getters

  get f() {
    return this.VehicleTypeMappingForm.controls
  }

  // #endregion getters

  // submit or save action
  public submitform = () => {
    switch (this.mode) {

      case 'Create': {
        this._dataService
          .createData(this.VehicleTypeMappingForm.value, this.VehicleTypeMappingApi)
          .subscribe((res) => {
            if (res.Success) {
              // handle success message here
              this._alertservice.raiseSuccessAlert(res.Message, 'true')
              this.backClicked()
            } else {
              this._alertservice.raiseErrors(res.Alerts);
            }
          });
        break;
      }

      case 'Edit': {
        this._dataService
          .updateData(this.VehicleTypeMappingForm.value, this.VehicleTypeMappingApi)
          .subscribe((res) => {
            if (res.Success) {
              // handle success message here
              this._alertservice.raiseSuccessAlert(res.Message, 'true')
              this.backClicked()
            } else {
              this._alertservice.raiseErrors(res.Alerts);
            }
          });
        break;
      }
    }
  };


  public onChange(event, type: string) {
    if (type == 'Status') {
      if (event.checked === true) {
        this.VehicleTypeMappingForm.controls['Status'].setValue(1)
        // this.Form.controls['Online'].value = 1

      } else {
        this.VehicleTypeMappingForm.controls['Status'].setValue(0)
      }
    }
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

  //#endregion

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _initForm(VehicleTypeMappingData: any, mode: string): FormGroup {
    this.VehicleTypeMappingForm = this._fb.group({
      Id: [0],
      Status: [1, [Validators.required]],
    });


    if (VehicleTypeMappingData) {
      this.VehicleTypeMappingForm.patchValue(VehicleTypeMappingData);
    }
    if (mode == "View") {
      this.VehicleTypeMappingForm.disable();
    }
    return this.VehicleTypeMappingForm;
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }
  // #endregion private methods
}
