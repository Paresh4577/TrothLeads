import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { StatusOptions } from '@config/status.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { ICityDto } from '@models/dtos/core';
import { IRTOInsuranceMappingDto, IRtoDto, RTOInsuranceMappingDto, RtoDto } from '@models/dtos/core/RtoDto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'gnx-rto',
  templateUrl: './rto.component.html',
  styleUrls: ['./rto.component.scss']
})
export class RtoComponent {
  // #region public variables

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  RTO_api = API_ENDPOINTS.RTO.Base
City_API=API_ENDPOINTS.City.Base
  statusOption = StatusOptions
  //boolean
  editable: boolean;

  // FormGroup
  RTOForm: FormGroup;
  RTOFrom: IRtoDto
  addRtoForm: any
  Citys$:Observable<ICityDto[]>;
  destroy$: Subject<any>;
  InsuranceCompany$: Observable<IInsuranceCompanyDto[]>;
  // Errors
  errors: unknown;

  cityList;

  // #endregion public variables
  onChange(event,type:string) {


    if(type=='Status'){


  if (event.checked === true) {
    this.RTOForm.controls['Status'].setValue(1)

  } else {
    this.RTOForm.controls['Status'].setValue(0)

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
    private _dataService: HttpService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _alertservice: AlertsService,
    public _helperservice: HelperService,
    private _MasterListService: MasterListService,
    public dialog: MatDialog
  ) {
    this.RTOFrom = new RtoDto()
    this.getCityList()
    this.destroy$ = new Subject();
  }
  // #endregion constructor


  ngOnInit(): void {
    let data = this._route.snapshot.data;
    this.mode = data['mode'];
    this.title = data['title'];
    switch (this.mode) {
      case "Create":
        this.RTOFrom.RTOInsuranceMapping = new Array<RTOInsuranceMappingDto>();
        this.editable = true;
        break;
      case "View":
        this.editable = false;
        this.RTOFrom = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.RTOFrom = data['data'];
        break;
      default:
        break;
    }
    this.addRtoForm = this._init(this.RTOFrom, this.mode);
    if (this.mode == "View") {
      this.RTOForm.disable();
    }

    this._fillList();
    this._onFormChanges();
  }
  // #region getters

  get f() {
    return this.RTOForm.controls
  }

  get inf() {
    return this.RTOForm.controls['RTOInsuranceMapping'] as FormArray
  }

  // #endregion getters

   // Reset function
 public clear(name: string, id: string): void {
  this.f[name].setValue("")
  this.f[id].setValue("")
  if(name == 'CityName'){
    this.f['StateName'].setValue("")
  }
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
      if (type == 'City') {
        this.RTOForm.patchValue({
          CityId: result.Id,
          CityName: result.Name,
          StateName: result.StateName,
        });
      }

    }
  });
}
  /**
   * #region public methods
   */

  // submit or save action
  submitform = () => {    
    switch (this.mode) {

      case 'Create': {
        this._dataService
          .createData(this.RTOForm.value, this.RTO_api)
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
          .updateData(this.RTOForm.value, this.RTO_api)
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



  public getCityList() {

    let querySpec = {
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

    this._dataService.getDataList(querySpec, this.City_API).subscribe((res: any) => {
      this.cityList = res?.Data.Items
    })

  }

  public stateChange(CityId) {
    if (CityId > 0) {
      this._dataService.getDataById(CityId, this.City_API).subscribe(res => {
        if (res.Success) {
          this.RTOForm.patchValue({
            StateName: res.Data.StateName,
            CityName:res.Data.Name
          })
        }
      })
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


  /**
   * add new row in RTOInsuranceMapping array
   */
  public addRTOInsuranceMappingRow() {
    var row:IRTOInsuranceMappingDto = new RTOInsuranceMappingDto()
    this.RTOFrom.RTOInsuranceMapping.push(row)
    this.inf.push(this._initRTOInsuranceMappingForm(row))
  }

  /**
   * delete a row from RTOInsuranceMapping array based on the index
   * @param index : index number of row
   */
  public deleteRTOInsuranceMappingRow(index) {
    this.inf.removeAt(index);

  }

  // #endregion public methods

  CitySelected(event: MatAutocompleteSelectedEvent): void {
    this.RTOForm.patchValue({
      CityId: event.option.value.Id,
      CityName: event.option.value.Name,
      StateName: event.option.value.StateName,
    });
  }


  // * #region private methods

  private _onFormChanges() {
    this.RTOForm.get('CityName').valueChanges.subscribe((val) => {
      this.Citys$ = this._MasterListService.getFilteredCityList(val).pipe(
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

  private _init(RTOData: RtoDto, mode: string): FormGroup {
    this.RTOForm = this._fb.group({
      Id: [0],
      Code: ['', [Validators.required, Validators.maxLength(50), this.noWhitespaceValidator]],
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100), this.noWhitespaceValidator]],
      Status: [1, [Validators.required]],
      CityId: [null, [Validators.required]],
      CityName: ["", [Validators.required]],
      StateName: [{ value: "", disabled: true }, [Validators.required]],
      RTOInsuranceMapping : this._buildRTOInsuranceMapping(RTOData.RTOInsuranceMapping)
    });


    if (RTOData) {
      this.RTOForm.patchValue(RTOData);
    }
    if (mode == "View") {
      this.RTOForm.disable();
    }
    return this.RTOForm;
  }

  private _buildRTOInsuranceMapping(items: IRTOInsuranceMappingDto[] = []): FormArray {
    
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0) && this.mode !== "View") {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initRTOInsuranceMappingForm(i));
        });
      }
    }
    return formArray;
  }

  private _initRTOInsuranceMappingForm(item:IRTOInsuranceMappingDto = null): FormGroup {
    let vimp = this._fb.group({
      Id: [0],
      RTOId: [0],
      InsuranceCompanyCode: [''],
      InsuranceRTOCode: [''],
      RegistrationCity: [''],
      RegistrationCityCode: [''],
      StateCode: [''],
      ClusterZone: [''],
      CarZone: [''],
    })

    if (item != null) {
      if (!item) {
        item = new RTOInsuranceMappingDto();
      }

      if (item) {
        vimp.patchValue(item);
      }
    }
    return vimp;
  }
  
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  private _fillList() {

    this.InsuranceCompany$ = this._MasterListService
      .getAllCompanyNameList('')
      .pipe(
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
  }
  // #endregion private methods

}
