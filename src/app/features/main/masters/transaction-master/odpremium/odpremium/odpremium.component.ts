import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { IODPremiumDto, ODPremiumDto } from '@models/dtos/core/ODPremiumDto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-odpremium',
  templateUrl: './odpremium.component.html',
  styleUrls: ['./odpremium.component.scss']
})
export class ODPremiumComponent {


  // #region public variables
  
  // Strings
  mode: string = '';
  title: string = '';

  //boolean
  editable:boolean

  // FormGroup
  ODPremium: IODPremiumDto;
  ODPremiumForm: FormGroup;


  api=API_ENDPOINTS.ODPremium.Base;

  // Errors
  errors: unknown;
  // #endregion public variables


  InsuranceCompany$:Observable<IInsuranceCompanyDto[]>
  destroy$: Subject<any>;

  // #region constructor

  constructor(
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _router: Router,
    private _alertservice: AlertsService,
    private _dataService:HttpService,
    private _MasterListService: MasterListService,
    public dialog: MatDialog,
    // private _datePipe: DatePipe,
  ) {
    this.ODPremium = new ODPremiumDto()
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
        this.ODPremium = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.ODPremium = data['data'];
        break;
      default:
        break;
    }

    this.ODPremiumForm = this._init(this.ODPremium,this.mode)
    this._onFormChanges()
  }

  //#endregion lifecycle hooks

  // #region getters

  public get info() {
    return this.ODPremiumForm.controls
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
    // this.dateFormat()
    switch (this.mode) {

      case 'Create': {
        this._dataService
          .createData(this.ODPremiumForm.value,this.api)
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
          .updateData(this.ODPremiumForm.value,this.api)
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

  public openDiolog(type: string, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";
  
    dialogConfig.data = {
      type: type,
      title: title,
      ispopup: true,
    };
  
    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        if (type == 'Insurance') {
          this.ODPremiumForm.patchValue({
            InsuranceCompanyCode: result.Code,
            InsuranceCompanyName: result.Name,
          })
        }
  
      }
    });
  }

  // bind the data of InsuranceCompanyName & InsuranceCompanyCode [autoComplete]
  public InsuranceCompanyNameSelected(event: MatAutocompleteSelectedEvent): void {
    this.ODPremiumForm.patchValue({
      InsuranceCompanyCode: event.option.value.Code,
      InsuranceCompanyName: event.option.value.Name,
    })

  }

  // Reset function
  public clear(name: string, id: string): void {
    this.info[name].setValue("")
    this.info[id].setValue("")
    if(name == 'SubCategoryName'){
      this.info['CategoryName'].setValue("");
      this.info['CategoryId'].setValue("");
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

  private _onFormChanges() {
    this.ODPremiumForm.get('InsuranceCompanyName').valueChanges.subscribe((val) => {
      this.InsuranceCompany$ = this._MasterListService.getFilteredCompanyNameList(val).pipe(
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

  private _init(odPremium:IODPremiumDto, mode: string): FormGroup {
    let odp = this._fb.group({
      Id: [0],
      InsuranceCompanyCode: ['',[Validators.required]],
      InsuranceCompanyName: ['',[Validators.required]],
      OwnerDriver: [0,[Validators.required]],
      Status: [1],
    });



    if (odPremium) {
      odp.patchValue(odPremium);
    }
    if (mode == "View") {
      odp.disable();
    }
    return odp;
  }
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  // #endregion private methods
}
