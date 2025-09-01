import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { HttpService } from '@lib/services/http/http.service';
import { BranchDto, IBranchDto } from '@models/dtos/core/BranchDto';
import { StatusOptions } from '@config/status.config';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { ICityPincodeDto } from '@models/dtos/core/CityDto';
import { MasterListService } from '@lib/services/master-list.service';
import { IUserDto } from '@models/dtos/core/userDto';

@Component({
  selector: 'gnx-branch',
  templateUrl: './branch.component.html',
  styleUrls: ['./branch.component.scss']
})
export class BranchComponent {
  // #region public variables

//boolean
  editable:boolean

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  api=API_ENDPOINTS.Branch.Base
  statusOption = StatusOptions

  // FormGroup
  BranchForm: FormGroup;
  branchForm: IBranchDto;
  addBranchForm:any;


  pincodes$: Observable<ICityPincodeDto[]>;
  BranchHeadName$: Observable<IUserDto[]>
  BQPName$: Observable<IUserDto[]>
  destroy$: Subject<any>;
  // Errors
  errors: unknown;

  // #endregion public variables
  onChange(event,type:string) {


    if(type=='Status'){


  if (event.checked === true) {
    this.BranchForm.controls['Status'].setValue(1)
    // this.Form.controls['Online'].value = 1

  } else {
    this.BranchForm.controls['Status'].setValue(0)

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
    private _dataService:HttpService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _alertservice: AlertsService,
    private _MasterListService: MasterListService,
    public _helperservice: HelperService,
    public dialog: MatDialog
  ) {
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
        this.branchForm = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.branchForm = data['data'];
        break;
      default:
        break;
    }
    this.addBranchForm = this._init(this.branchForm, this.mode);
    if (this.mode == "View") {
      this.BranchForm.disable();
    }

    this._onFormChanges()
  }
  //#endregion lifecycle hooks

  // #region getters

  get f() {
    return this.BranchForm.controls
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
          .createData(this.BranchForm.value,this.api)
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
          .updateData(this.BranchForm.value,this.api)
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

  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.BranchForm.patchValue({
      CityName: event.option.value.CityName,
      StateName: event.option.value.StateName,
      CountryName: event.option.value.CountryName,
      PinCodeId: event.option.value.Id,
      PinCodeNumber: event.option.value.PinCode,
    });
    // this.PinCode.patchValue(event.option.value.PinCodeNumber);
  }

  public BranchHeadSelected(event: MatAutocompleteSelectedEvent): void {
    this.BranchForm.patchValue({
      BranchHeadId: event.option.value.Id,
      BranchHeadName: event.option.value.FullName
    });
  }

  public BQPSelected(event: MatAutocompleteSelectedEvent): void {
    this.BranchForm.patchValue({
      BrokerQualifiedPersonId: event.option.value.Id,
      BrokerQualifiedPersonName: event.option.value.FullName
    });
  }

  public openDiolog(type: string, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "51vw";
    dialogConfig.minWidth = "fit-content";
    dialogConfig.minHeight = "fit-content";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      type: type == "BQPName" ? "User" : type,
      title: title,
      ispopup: true

    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        if (type == 'Pincode') {
          this.BranchForm.patchValue({
            CityName: result.CityName,
            StateName: result.StateName,
            CountryName: result.CountryName,
            PinCodeId: result.Id,
            PinCodeNumber: result.PinCode
          })
        }

        if (type == 'User') {
          this.BranchForm.patchValue({
            BranchHeadId: result.Id,
            BranchHeadName: result.FullName
          })

        }

        if (type == 'BQPName') {
          this.BranchForm.patchValue({
            BrokerQualifiedPersonId: result.Id,
            BrokerQualifiedPersonName: result.FullName
          })
        }

      }
    })
  }

  public clear(name: string, id: string): void {
    this.f[name].setValue("");
    this.f[id].setValue("");

    if (name == "PinCodeNumber") {
      this.f["CityName"].setValue("");
      this.f["StateName"].setValue("");
      this.f["CountryName"].setValue("");
    }

  }

  // #endregion public methods

  /**
   * #region private methods
   */

  private _onFormChanges() {

    this.BranchForm.get('PinCodeNumber').valueChanges.subscribe((val) => {
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

    this.BranchForm.get('BranchHeadName').valueChanges.subscribe((val) => {
      this.BranchHeadName$ = this._MasterListService.getFilteredUserList(val).pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              let result = Array.from(
                res.Data.Items.reduce(
                  (m, t) => m.set(t.FullName, t),
                  new Map()
                ).values()
              );
              result = result.filter((el) => {
                if (el.FullName) {
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

    this.BranchForm.get('BrokerQualifiedPersonName').valueChanges.subscribe((val) => {
      this.BQPName$ = this._MasterListService.getFilteredUserList(val).pipe(
        takeUntil(this.destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              let result = Array.from(
                res.Data.Items.reduce(
                  (m, t) => m.set(t.FullName, t),
                  new Map()
                ).values()
              );
              result = result.filter((el) => {
                if (el.FullName) {
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

  private _init(branchData: BranchDto, mode: string): FormGroup {
    this.BranchForm = this._fb.group({
      Id: [0],
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(120), this.noWhitespaceValidator]],
      Address: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(1024), this.noWhitespaceValidator]],
      PinCodeId: [0,[Validators.required]],
      PinCodeNumber: ['', [Validators.required,Validators.minLength(6), Validators.maxLength(6)]],
      CityName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(60)]],
      StateName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(60)]],
      CountryName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(60)]],
      BranchHeadId: [0,[Validators.required, Validators.min(1)]],
      BranchHeadName: ['', [Validators.required]],
      Status: [1],
      BrokerQualifiedPersonId: [0, [Validators.required, Validators.min(1)]],
	    BrokerQualifiedPersonName: ['', [Validators.required]],
    });



    if (branchData) {
      this.BranchForm.patchValue(branchData);
    }
    if (mode == "View") {
      this.BranchForm.disable();
    }
    return this.BranchForm;
  }
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  // #endregion private methods


}
