import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { StatusOptions } from '@config/status.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { ModeType } from '@models/common/mode.types';
import { ISourceDto } from '@models/dtos/core/SourceDto';
import { ISubSourceDto, SubSourceDto } from '@models/dtos/core/SubSourceDto';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';


@Component({
  selector: 'gnx-sub-source',
  templateUrl: './sub-source.component.html',
  styleUrls: ['./sub-source.component.scss']
})
export class SubSourceComponent {
  // #region public variables

  //boolean
  editable: boolean

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  subSourceApi = API_ENDPOINTS.SubSource.Base;
  sourceApi = API_ENDPOINTS.Source.Base;
  statusOption = StatusOptions
  // FormGroup
  SubSourceForm: FormGroup;
  subSourceFrom: ISubSourceDto;
  Sources$:Observable<ISourceDto[]>;
  addSubSourceForm: any;
  destroy$: Subject<any>;

  // Errors
  errors: unknown;

  sourceList;

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
    private _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _alertservice: AlertsService,
    public _helperservice: HelperService,
    private _MasterListService: MasterListService,
    public dialog: MatDialog
  ) {
    this.subSourceList();
    this.destroy$ = new Subject();
  }
  // #endregion constructor
  onChange(event,type:string) {


    if(type=='Status'){


  if (event.checked === true) {
    this.SubSourceForm.controls['Status'].setValue(1)
    // this.Form.controls['Online'].value = 1

  } else {
    this.SubSourceForm.controls['Status'].setValue(0)

  }
}
  }

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
        this.subSourceFrom = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.subSourceFrom = data['data'];
        break;
      default:
        break;
    }
    this.addSubSourceForm = this._init(this.subSourceFrom, this.mode);
    if (this.mode == "View") {
      this.SubSourceForm.disable();
    }
    this._onFormChanges();
  }
  //#endregion lifecycle hooks

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
      if (type == 'Source') {
        this.SubSourceForm.patchValue({
          SourceId: result.Id,
          SourceName: result.Name,
        });
      }

    }
  });
}
  // #region getters

  get f() {
    return this.SubSourceForm.controls
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
          .createData(this.SubSourceForm.value, this.subSourceApi)
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
          .updateData(this.SubSourceForm.value, this.subSourceApi)
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

  SourceSelected(event: MatAutocompleteSelectedEvent): void {
    this.SubSourceForm.patchValue({
          SourceId: event.option.value.Id,
            SourceName: event.option.value.Name
    });
  }


  // * #region private methods

  private _onFormChanges() {
    this.SubSourceForm.get('SourceName').valueChanges.subscribe((val) => {
      this.Sources$ = this._MasterListService.getFilteredSourceList(val).pipe(
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



  private _init(subSourceData: SubSourceDto, mode: string): FormGroup {
    this.SubSourceForm = this._fb.group({
      Id: [0],
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(120), this.noWhitespaceValidator]],
      SourceId: ['', [Validators.required]],
      SourceName: ['', [Validators.required]],
      Status: [1, Validators.required],
    });


    if (subSourceData) {
      this.SubSourceForm.patchValue(subSourceData);
    }
    if (mode == "View") {
      this.SubSourceForm.disable();
    }
    return this.SubSourceForm;
  }

  private subSourceList() {
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


    this._dataService.getDataList(defaultQSpec, this.sourceApi).subscribe((res: any) => {
      this.sourceList = res?.Data.Items
    })
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }



  // #endregion private methods

}
