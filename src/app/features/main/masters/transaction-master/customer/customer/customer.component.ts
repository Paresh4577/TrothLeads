import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { ICityPincodeDto } from '@models/dtos/core/CityDto';
import { CustomerDto, ICustomerDto } from '@models/dtos/core/CustomerDto';
import { IGroupHeadDto } from '@models/dtos/transaction-master/group-head.Dto';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
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
export class CustomerComponent {
  // #region public variables

  // Strings
  mode: string = ''; // Page mode like as add, edit.....
  title: string = ''; // page Header Title
  CustomerListApi = API_ENDPOINTS.Customer.Base

  // FormGroup
  CustomerForm: FormGroup; // Reactive Form
  Customer: ICustomerDto // Form Value

  // boolean
  editable: boolean;

  GroupHeadName$: Observable<IGroupHeadDto[]>
  pincodes$: Observable<ICityPincodeDto[]>;
  destroy$: Subject<any>;

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
    private _MasterListService: MasterListService,
    public dialog: MatDialog
  ) {
    this.destroy$ = new Subject();
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

    this.Customer = new CustomerDto()

    switch (this.mode) {
      case "Create":
        this.editable = true;
        break;
      case "View":
        this.editable = false;
        this.Customer = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.Customer = data['data'];
        break;
      default:
        break;
    }

    this.CustomerForm = this._initForm(this.Customer, this.mode);

    // In view Mode All Form Field Is diable
    if (this.mode == "View") {
      this.CustomerForm.disable();
    }
    this._onFormChanges()

  }

  //#endregion

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // #region getters

  get f() {
    return this.CustomerForm.controls
  }

  // #endregion getters

  // submit or save action
  public submitform = () => {
    switch (this.mode) {

      case 'Create': {
        this._dataService
          .createData(this.CustomerForm.value, this.CustomerListApi)
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
          .updateData(this.CustomerForm.value, this.CustomerListApi)
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

  public openDiolog(type: string, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "51vw";
    dialogConfig.minWidth = "fit-content";
    dialogConfig.minHeight = "fit-content";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      type: type,
      title: title,
      ispopup: true

    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        if (type == 'Pincode') {
          this.CustomerForm.patchValue({
            CityName: result.CityName,
            StateName: result.StateName,
            CountryName: result.CountryName,
            PinCodeId: result.Id,
            PinCodeNumber: result.PinCode,
            CityId: result.CityId,
            StateId: result.StateId,
            CountryId: result.CountryId,
          })

          // this.PinCode.patchValue(result.PinCodeNumber)
        }
        
        if (type == 'GroupHead') {
          this.CustomerForm.patchValue({
            GroupHeadName: result.Name,
            GroupHeadId: result.Id
          })
        }
      }
    });
  }

  public clear(name: string, id: string): void {
    this.f[name].setValue("");
    this.f[id].setValue("");

    if (name == "PinCodeNumber") {
      this.f["CityName"].setValue("");
      this.f["StateName"].setValue("");
      this.f["CountryName"].setValue("");
      this.f["CityId"].setValue("");
      this.f["StateId"].setValue("");
      this.f["CountryId"].setValue("");
    }
  }

  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.CustomerForm.patchValue({
      CityName: event.option.value.CityName,
      StateName: event.option.value.StateName,
      CountryName: event.option.value.CountryName,
      PinCodeId: event.option.value.Id,
      PinCodeNumber: event.option.value.PinCode,
      CityId: event.option.value.CityId,
      StateId: event.option.value.StateId,
      CountryId: event.option.value.CountryId,
    });
    // this.PinCode.patchValue(event.option.value.PinCodeNumber);
  }

  public GroupHeadSelected(event: MatAutocompleteSelectedEvent): void {
    this.CustomerForm.patchValue({
      GroupHeadName: event.option.value.Name,
      GroupHeadId: event.option.value.Id,
    });

  }


  public onChange(event, type: string) {
    if (type == 'Status') {
      if (event.checked === true) {
        this.CustomerForm.controls['Status'].setValue(1)

      } else {
        this.CustomerForm.controls['Status'].setValue(0)
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

  private _onFormChanges() {

    this.CustomerForm.get('PinCodeNumber').valueChanges.subscribe((val) => {
      this.pincodes$ = this._MasterListService.getFilteredPincodeList(val).pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              let result = Array.from(
                res.Data.Items.reduce(
                  (m, t) => m.set(t.PinCode, t),
                  new Map()
                ).values()
              );
              result = result.filter((el) => {
                if (el.PinCode) {
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

    this.CustomerForm.get('GroupHeadName').valueChanges.subscribe((val) => {
      this.GroupHeadName$ = this._MasterListService.getFilteredGroupHeadList(val).pipe(
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

  private _initForm(CustomerData: ICustomerDto, mode: string): FormGroup {
    let cf = this._fb.group({
      Id: [0],
      CustomerNo:["<< Auto >>"],
      FirstName: ['',[Validators.required]],
      MiddleName: [''],
      LastName: ['',[Validators.required]],
      GroupHeadId: [0,[Validators.required]],
      GroupHeadName: ['',[Validators.required]],
      Address: [''],
      PinCodeId: [0,[Validators.required]],
      PinCodeNumber: ['',[Validators.required]],
      CityId: [0,[Validators.required]],
      CityName: ['',[Validators.required]],
      StateId: [0,[Validators.required]],
      StateName: ['',[Validators.required]],
      CountryId: [0,[Validators.required]],
      CountryName: ['',[Validators.required]],
      Email: [],
      MobileNo: ['',[Validators.maxLength(10),Validators.minLength(10)]],
      DOB: [],
      ProposalCount: [0],
      MotorProposalCount: [0],
      InsurerCustomerId: [''],
      InsurerCKYCId: [''],
      Status: [1, [Validators.required]],
    });


    if (CustomerData) {
      cf.patchValue(CustomerData);
    }
    if (mode == "View") {
      cf.disable();
    }
    return cf;
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }
  // #endregion private methods
}
