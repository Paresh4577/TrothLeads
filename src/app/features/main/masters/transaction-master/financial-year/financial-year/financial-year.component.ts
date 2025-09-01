import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert } from '@models/common';
import { FinancialYearDto, IFinancialYearDto } from '@models/dtos/core/FinancialYearDto';

@Component({
  selector: 'gnx-financial-year',
  templateUrl: './financial-year.component.html',
  styleUrls: ['./financial-year.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class FinancialYearComponent {

  // #region public variables

  // Strings
  mode: string = '';
  title: string = '';

  //boolean
  editable:boolean

  // FormGroup
  FinancialYear: IFinancialYearDto;
  FinancialYearForm: FormGroup;


  api=API_ENDPOINTS.FinancialYear.Base;

  // Errors
  errors: unknown;

  // #endregion public variables



  // #region constructor

  constructor(
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _router: Router,
    private _alertservice: AlertsService,
    private _dataService:HttpService,
    private _datePipe: DatePipe,
  ) {
    this.FinancialYear = new FinancialYearDto()
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
        this.FinancialYear = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.FinancialYear = data['data'];
        break;
      default:
        break;
    }

    this.FinancialYearForm = this._init(this.FinancialYear,this.mode)
  }

  //#endregion lifecycle hooks

  // #region getters

  public get info() {
    return this.FinancialYearForm.controls
  }
  // #endregion getters

  /**
   * #region public methods
   */

  // previous page navigation button
  public backClicked() {
    if (this.mode == 'View' || this.mode == 'Edit') {
      this._router.navigate(['../../'], { relativeTo: this._route })
    } else {
      this._router.navigate(['../'], { relativeTo: this._route })
    }
  }

  public submitForm() {
    this.dateFormat()
    switch (this.mode) {

      case 'Create': {
        this._dataService
          .createData(this.FinancialYearForm.value,this.api)
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
          .updateData(this.FinancialYearForm.value,this.api)
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
  }

  public onChange(event,type:string) {
    if(type=='Status'){


      if (event.checked === true) {
        this.info['Status'].setValue(1)
      } else {
        this.info['Status'].setValue(0)

      }
    }
  }

  // #endregion public methods

  /**
   * #region private methods
   */

  private dateFormat() {
    this.FinancialYearForm.patchValue({
      FromDate: this._datePipe.transform(this.FinancialYearForm.getRawValue().FromDate, "yyyy-MM-dd"),
      ToDate: this._datePipe.transform(this.FinancialYearForm.getRawValue().ToDate, "yyyy-MM-dd"),
    })
  }

  private formValidation() {
    let alerts:Alert[] = []
  }

  private _init(financialYear:IFinancialYearDto, mode: string): FormGroup {
    let fyi = this._fb.group({
      Id: [0],
      FYCode: ['',[Validators.required]],
      FromDate: ['',[Validators.required]],
      ToDate: ['',[Validators.required]],
      Status: [1],
    });



    if (financialYear) {
      fyi.patchValue(financialYear);
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
