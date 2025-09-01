import {Component} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { IRoleDto, RoleDto } from '@models/dtos/core/RoleDto';
import { HttpService } from '@lib/services/http/http.service';
import { HelperService } from '@lib/services/helper.service';
import { StatusOptions } from '@config/status.config';

@Component({
  selector: 'gnx-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent {

  // #region public variables

  //boolean
  editable: boolean

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  roleApi = API_ENDPOINTS.Role.Base;
  statusOption = StatusOptions

  // FormGroup
  RoleForm: FormGroup;
  RoleFrom: IRoleDto;
  addRoleForm: any;

  // Errors
  errors: unknown;

  countryList;

  // #endregion public variables
  onChange(event,type:string) {


    if(type=='Status'){


  if (event.checked === true) {
    this.RoleForm.controls['Status'].setValue(1)
    // this.Form.controls['Online'].value = 1

  } else {
    this.RoleForm.controls['Status'].setValue(0)

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
        this.RoleFrom = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.RoleFrom = data['data'];
        break;
      default:
        break;
    }
    this.addRoleForm = this._init(this.RoleFrom, this.mode);
    if (this.mode == "View") {
      this.RoleForm.disable();
    }

  }
  //#endregion lifecycle hooks


  // #region getters

  get f() {
    return this.RoleForm.controls
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
          .createData(this.RoleForm.value, this.roleApi)
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
          .updateData(this.RoleForm.value, this.roleApi)
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



  private _init(RoleData:RoleDto, mode: string): FormGroup {

    this.RoleForm = this._fb.group({
      Id: [0, [Validators.required]],
      Name: ['', [Validators.required, Validators.maxLength(20), Validators.minLength(1), this.noWhitespaceValidator]],
      Status: [1, [Validators.required]]
    });

    if (RoleData) {
      this.RoleForm.patchValue(RoleData);
    }
    if (mode == "View") {
      this.RoleForm.disable();
    }
    return this.RoleForm;
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }
  // #endregion private methods
}
