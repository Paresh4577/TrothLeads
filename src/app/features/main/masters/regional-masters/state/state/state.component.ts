import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { HttpService } from '@lib/services/http/http.service';
import { IStateDto, StateDto } from '@models/dtos/core/StateDto';
import { StatusOptions } from '@config/status.config';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { MasterListService } from '@lib/services/master-list.service';
import { ICountryDto } from '@models/dtos/core/CountryDto';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';

@Component({
  selector: 'gnx-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.scss']
})
export class StateComponent {
  // #region public variables

  //boolean
  editable:boolean

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
stateApi = API_ENDPOINTS.State.Base;
countryApi=API_ENDPOINTS.Country.Base;
  statusOption = StatusOptions
  // FormGroup
  StateForm: FormGroup;
  stateFrom: IStateDto;
  Countrys$:Observable<ICountryDto[]>
  destroy$: Subject<any>;
  addStateForm:any;

  // Errors
  errors: unknown;

  countryList;

  // #endregion public variables
  onChange(event,type:string) {


    if(type=='Status'){


  if (event.checked === true) {
    this.StateForm.controls['Status'].setValue(1)
    // this.Form.controls['Online'].value = 1

  } else {
    this.StateForm.controls['Status'].setValue(0)

  }
}
  }

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
      if (type == 'Country') {
        this.StateForm.patchValue({
          CountryId: result.Id,
          CountryName: result.Name,
        });
      }

    }
  });
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
    private _dataService:HttpService,
    private _alertservice: AlertsService,
    private _MasterListService: MasterListService,
    public _helperservice: HelperService,
    public dialog: MatDialog

  ) {
    this.CountryList()
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
    switch (this.mode) {
      case "Create":
        this.editable = true;
        break;
      case "View":
        this.editable = false;
        this.stateFrom = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.stateFrom = data['data'];
        break;
      default:
        break;
    }
    this.addStateForm = this._init(this.stateFrom, this.mode);
    if (this.mode == "View") {
      this.StateForm.disable();
    }
    if (this.mode == "Edit") {
      this.StateForm.get('Code').disable();
    }
    this._onFormChanges();
  }
    //#endregion lifecycle hooks


  // #region getters

  get f() {
    return this.StateForm.controls
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
          .createData(this.StateForm.value,this.stateApi)
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
        this.StateForm.get('Code').enable();
        this._dataService
          .updateData(this.StateForm.value,this.stateApi)
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

  CountrySelected(event: MatAutocompleteSelectedEvent): void {
    this.StateForm.patchValue({
      CountryId: event.option.value.Id,
      CountryName: event.option.value.Name
    });
  }


  // * #region private methods

  private _onFormChanges() {
    this.StateForm.get('CountryName').valueChanges.subscribe((val) => {
      this.Countrys$ = this._MasterListService.getFilteredCountryList(val).pipe(
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



  private _init(stateData: StateDto, mode: string): FormGroup {
    this.StateForm = this._fb.group({
      Id: [0],
      Code: ['', [Validators.required, this.noWhitespaceValidator]],
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(256), this.noWhitespaceValidator]],
      CountryId: ['',[Validators.required]],
      CountryName: ['', Validators.required],
      Status: [1]
    });


    if (stateData) {
      this.StateForm.patchValue(stateData);
    }
    if (mode == "View") {
      this.StateForm.disable();
    }
    return this.StateForm;
  }

  private CountryList(){
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


    this._dataService.getDataList(defaultQSpec, this.countryApi).subscribe((res: any) => {
      this.countryList = res?.Data.Items
    })
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }



  // #endregion private methods
}
