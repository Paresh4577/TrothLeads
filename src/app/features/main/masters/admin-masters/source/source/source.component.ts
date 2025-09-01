import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { ModeType } from '@models/common/mode.types';
import { HttpService } from '@lib/services/http/http.service';
import { HelperService } from '@lib/services/helper.service';
import { ISourceDto, SourceDto } from '@models/dtos/core/SourceDto';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { StatusOptions } from '@config/status.config';

@Component({
  selector: 'gnx-source',
  templateUrl: './source.component.html',
  styleUrls: ['./source.component.scss']
})
export class SourceComponent {

  // #region public variables

  //boolean
  editable: boolean

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  sourceApi = API_ENDPOINTS.Source.Base;
  statusOption = StatusOptions

  // FormGroup
  SourceForm: FormGroup;
  SourceFrom: ISourceDto;
  addSourceForm: any;

  // Errors
  errors: unknown;

  countryList;

  // #endregion public variables
  onChange(event,type:string) {


    if(type=='Status'){


  if (event.checked === true) {
    this.SourceForm.controls['Status'].setValue(1)
    // this.Form.controls['Online'].value = 1

  } else {
    this.SourceForm.controls['Status'].setValue(0)

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
        this.SourceFrom = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.SourceFrom = data['data'];
        break;
      default:
        break;
    }
    this.addSourceForm = this._init(this.SourceFrom, this.mode);
    if (this.mode == "View") {
      this.SourceForm.disable();
    }

  }
  //#endregion lifecycle hooks


  // #region getters

  get f() {
    return this.SourceForm.controls
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
          .createData(this.SourceForm.value, this.sourceApi)
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
          .updateData(this.SourceForm.value, this.sourceApi)
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



  private _init(sourceData: SourceDto, mode: string): FormGroup {
    this.SourceForm = this._fb.group({
      Id: [0],
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(120), this.noWhitespaceValidator]],
      Status: [1]
    });


    if (sourceData) {
      this.SourceForm.patchValue(sourceData);
    }
    if (mode == "View") {
      this.SourceForm.disable();
    }
    return this.SourceForm;
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }
  // #endregion private methods



}
