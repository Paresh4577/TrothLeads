import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { HttpService } from '@lib/services/http/http.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { CountryDto, ICountryDto } from '@models/dtos/core/CountryDto';
import { StatusOptions } from '@config/status.config';

@Component({
  selector: 'gnx-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss']
})
export class CountryComponent {
  // #region public variables

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  api=API_ENDPOINTS.Country.Base
  statusOption = StatusOptions

//boolean
  editable:boolean;

  // FormGroup
  CountryForm: FormGroup;
  countryFrom: ICountryDto
  addCountryForm:any
  // Errors
  errors: unknown;

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
    private _dataService:HttpService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _alertservice: AlertsService,
    public _helperservice: HelperService
  ) {

  }
  // #endregion constructor

  onChange(event,type:string) {


    if(type=='Status'){


  if (event.checked === true) {
    this.CountryForm.controls['Status'].setValue(1)
    // this.Form.controls['Online'].value = 1

  } else {
    this.CountryForm.controls['Status'].setValue(0)

  }
}
}


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
        this.countryFrom = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.countryFrom = data['data'];
        break;
      default:
        break;
    }
    this.addCountryForm = this._init(this.countryFrom, this.mode);
    if (this.mode == "View") {
      this.CountryForm.disable();
    }
    if (this.mode == "Edit") {
      this.CountryForm.get('Code').disable();
    }

  }
  // #region getters

  get f() {
    return this.CountryForm.controls
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
          .createData(this.CountryForm.value,this.api)
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
        this.CountryForm.get('Code').enable();
        this._dataService
          .updateData(this.CountryForm.value,this.api)
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

  private _init(countryData: CountryDto, mode: string): FormGroup {
    this.CountryForm = this._fb.group({
      Id: [0],
      Code: ['', [Validators.required, Validators.maxLength(3), this.noWhitespaceValidator]],
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(256), this.noWhitespaceValidator]],
      Status: [1, [Validators.required]],
    });


    if (countryData) {
      this.CountryForm.patchValue(countryData);
    }
    if (mode == "View") {
      this.CountryForm.disable();
    }
    return this.CountryForm;
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }
  // #endregion private methods
}
