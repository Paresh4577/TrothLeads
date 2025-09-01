import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { DisplayedDepartment } from '@config/insurance-company';
import { StatusOptions } from '@config/status.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { HttpService } from '@lib/services/http/http.service';
import { IInsuranceCompanyContactDetailsDto, IInsuranceCompanyDto, InsuranceCompanyContactDetailsDto, InsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';

@Component({
  selector: 'gnx-insurance-company',
  templateUrl: './insurance-company.component.html',
  styleUrls: ['./insurance-company.component.scss']
})
export class InsuranceCompanyComponent {
  // #region public variables

  //boolean
  editable: boolean
  readOnly: boolean

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  insuranceCompanyAPI = API_ENDPOINTS.InsuranceCompany.Base
  statusOption = StatusOptions

  // FormGroup
  InsuranceCompanyForm: FormGroup;
  insuranceFrom: IInsuranceCompanyDto;
  addInsuranceCompanyForm: any;

  // Errors
  errors: unknown;



  // #endregion public variables
  onChange(event, type: string) {


    if (type == 'Status') {

      if (event.checked === true) {
        this.InsuranceCompanyForm.controls['Status'].setValue(1)
      } else {
        this.InsuranceCompanyForm.controls['Status'].setValue(0)
      }
    }
    else if (type == 'HealthMediclaimIntegrated') {

      if (event.checked === true) {
        this.InsuranceCompanyForm.controls['HealthMediclaimIntegrated'].setValue(true)
      } else {
        this.InsuranceCompanyForm.controls['HealthMediclaimIntegrated'].setValue(false)
      }
    }
    else if (type == 'HealthTopupIntegrated') {

      if (event.checked === true) {
        this.InsuranceCompanyForm.controls['HealthTopupIntegrated'].setValue(true)
      } else {
        this.InsuranceCompanyForm.controls['HealthTopupIntegrated'].setValue(false)
      }
    }
    else if (type == 'MotorPrivateCarIntegrated') {

      if (event.checked === true) {
        this.InsuranceCompanyForm.controls['MotorPrivateCarIntegrated'].setValue(true)
      } else {
        this.InsuranceCompanyForm.controls['MotorPrivateCarIntegrated'].setValue(false)
      }
    }
    else if (type == 'MotorTwoWheelerIntegrated') {

      if (event.checked === true) {
        this.InsuranceCompanyForm.controls['MotorTwoWheelerIntegrated'].setValue(true)
      } else {
        this.InsuranceCompanyForm.controls['MotorTwoWheelerIntegrated'].setValue(false)
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
    private _dialogService: DialogService,
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
        this.readOnly = false;
        break;
      case "View":
        this.editable = false;
        this.readOnly = true;
        this.insuranceFrom = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.readOnly = true;
        this.insuranceFrom = data['data'];
        break;
      default:
        break;
    }
    this.addInsuranceCompanyForm = this._init(this.insuranceFrom, this.mode);
    if(this.InsCompanyContactDetails.controls.length == 0){
      this.addContactDetails()
    }
    if (this.mode == "View") {
      this.InsuranceCompanyForm.disable();
    }


  }
  //#endregion lifecycle hooks


  // #region getters

  get f() {
    return this.InsuranceCompanyForm.controls
  }

  get InsCompanyContactDetails():FormArray {
    return this.InsuranceCompanyForm.controls["InsCompanyContactDetails"] as FormArray;
  }

  get DisplayedDepartment(){
    return DisplayedDepartment;
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
          .createData(this.InsuranceCompanyForm.value, this.insuranceCompanyAPI)
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
          .updateData(this.InsuranceCompanyForm.value, this.insuranceCompanyAPI)
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

    /**
     * Add Employee 
     */
  
    public addContactDetails() {

      let NewContactDetails: IInsuranceCompanyContactDetailsDto = new InsuranceCompanyContactDetailsDto()
      NewContactDetails.InsCompanyId = this.InsuranceCompanyForm.get('Code').value
  
      this.InsCompanyContactDetails.push(this._initContactDetailForm(NewContactDetails))
    }
  
    /**
   * Delete Employee With User Confirmation
   */
    public removeContactDetails(index: number) {
      this._dialogService.confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
        .subscribe((res) => {
          if (res) {
            this.InsCompanyContactDetails.removeAt(index)
          }
        });
    }
  

  // #endregion public methods

  /**
   * #region private methods
   */



  private _init(insuranceData: InsuranceCompanyDto, mode: string): FormGroup {
    this.InsuranceCompanyForm = this._fb.group({
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(256), this.noWhitespaceValidator]],
      ShortName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(256), this.noWhitespaceValidator]],
      Code: ['', [Validators.required, Validators.maxLength(50)]],
      SortOrder: [null, [Validators.required]],
      HealthMediclaimIntegrated: [1],
      HealthTopupIntegrated: [1],
      MotorPrivateCarIntegrated: [1],
      MotorTwoWheelerIntegrated: [1],
      Status: [1],
      Address: [],
      InsCompanyContactDetails: this._buildContactDetailForm(insuranceData?.InsCompanyContactDetails)
    });


    if (insuranceData) {
      this.InsuranceCompanyForm.patchValue(insuranceData);
    }
    if (mode == "View") {
      this.InsuranceCompanyForm.disable();
    }
    return this.InsuranceCompanyForm;
  }

  //Build  policy Person Formarray
  private _buildContactDetailForm(items: IInsuranceCompanyContactDetailsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initContactDetailForm(i));
        });
      }
    }
    return formArray;
  }

  //Init policy Person Formgroup
  private _initContactDetailForm(item: IInsuranceCompanyContactDetailsDto): FormGroup {
    let pPF = this._fb.group({
      Id: [0],
      InsCompanyId: [''],
      DepartmentName: [''],
      ContactPersonName: [''],
      Designation: [''],
      ContactNumber: ['',[Validators.maxLength(10),Validators.minLength(10)]],
      EmailId: ['',[Validators.email]],
    })

    if (item) {
      pPF.patchValue(item);
    }
    return pPF;
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }
  // #endregion private methods

}
