import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { CityDto, CityPinCodeInsurenceMappingsDto, CityPincodeDto, ICityDto, ICityPincodeDto } from '@models/dtos/core';
import { MatTableDataSource } from '@angular/material/table';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { HttpService } from '@lib/services/http/http.service';
import { StatusOptions } from '@config/status.config';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { IStateDto } from '@models/dtos/core/StateDto';
import { MasterListService } from '@lib/services/master-list.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'gnx-city',
  templateUrl: './city.component.html',
  styleUrls: ['./city.component.scss']
})
export class CityComponent {

  incentiveDisplayedColumns: string[] = ["pincode", "area", "Action",];
  cityPincodeDataSource: MatTableDataSource<AbstractControl>;
  // #region public variables

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  apiEndPoint: string;
  api=API_ENDPOINTS.City.Base;
  stateBase_API=API_ENDPOINTS.State.Base
  statusOption = StatusOptions

  // FormGroup
  CityForm: FormGroup;
  cityFrom: CityDto;
  States$:Observable<IStateDto[]>;
  destroy$: Subject<any>;
  addCityForm: any


  editable: boolean;
  // Errors
  errors: unknown;

  stateList;

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
    private _dataService:HttpService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _alertservice: AlertsService,
    public _helperservice: HelperService,
    private _MasterListService: MasterListService,
    public dialog: MatDialog
  ) {
    this.cityFrom = new CityDto()
    this.cityPincodeDataSource = new MatTableDataSource([]);
    this.cityFrom.CityPinCode = new Array<CityPincodeDto>();
    this.getStateList()
    this.destroy$ = new Subject();
  }


  ngOnInit(): void {
    let data = this._route.snapshot.data;
    this.mode = data['mode'];
    this.apiEndPoint = data['apiEndPoint'];
    this.title = data['title'];
    switch (this.mode) {
      case "Create":
        this.editable = true;
        this.cityFrom.CityPinCode = new Array<CityPincodeDto>();
        break;
      case "View":
        this.editable = false;
        this.cityFrom = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.cityFrom = data['data'];
        break;
      default:
        break;
    }
    this.addCityForm = this._init(this.cityFrom, this.mode);
    this.cityPincodeDataSource.data = this.inf.controls;
    if (this.mode == "View") {
      this.CityForm.disable();
    }
    this._onFormChanges();
  }
  // #endregion constructor

  // #region getters

  get f() {
    return this.CityForm.controls
  }

  get inf() {
    return this.CityForm.controls["CityPinCode"] as FormArray;
  }

  public subinf(index) {
    return this.inf.at(index).get("CityPinCodeInsurenceMappings") as FormArray;
  }

  // #endregion getters

  // Reset function
 public clear(name: string, id: string): void {
  this.f[name].setValue("")
  this.f[id].setValue("")
  if(name == 'StateName'){
    this.f['CountryName'].setValue("");
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
      if (type == 'State') {
        this.CityForm.patchValue({
          StateId: result.Id,
          StateName: result.Name,
          CountryName: result.CountryName,
          CountryId: result.CountryId
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



      let errorMsg = this._getFormError();
      if (errorMsg) {
        this._alertservice.raiseErrorAlert(errorMsg);
        return;
      }

    switch (this.mode) {

      case 'Create': {
        this._dataService
          .createData(this.CityForm.value,this.api)
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
          .updateData(this.CityForm.value,this.api)
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


  public addCityPincodeRow() {
    this.cityFrom = this.CityForm.value;
    var row: CityPincodeDto = new CityPincodeDto();
    this.cityFrom.CityPinCode.push(row);
    this.inf.push(this._initCityPincodeForm(row))
    this.cityPincodeDataSource.data = this.inf.controls;
    let index = this.inf.length
    this.addInsurenceMappingsRow(index-1)
  }

  public addInsurenceMappingsRow(index) {
    this.cityFrom = this.CityForm.value;
    var row: CityPinCodeInsurenceMappingsDto = new CityPinCodeInsurenceMappingsDto();
    this.cityFrom.CityPinCode.at(index).CityPinCodeInsurenceMappings.push(row);
    this._initCityPinCodeInsurenceMappingsForm(row)
    this.subinf(index).push(this._initCityPinCodeInsurenceMappingsForm(row))
  }

  public deleteCityPincodeRow(index) {
    this.inf.removeAt(index);
    this.cityPincodeDataSource.data = this.inf.controls;
  }

  public deleteInsurenceMappingsRow(parentIndex,childIndex) {
    this.subinf(parentIndex).removeAt(childIndex)
  }

  public getStateList() {

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

    this._dataService.getDataList(querySpec,this.stateBase_API).subscribe((res: any) => {
      this.stateList = res?.Data.Items
    })

  }

  public stateChange(stateId) {
    if (stateId > 0) {
      this._dataService.getDataById(stateId,this.stateBase_API).subscribe(res => {
        if (res.Success) {
          this.CityForm.patchValue({
            CountryId: res.Data.CountryId,
            CountryName: res.Data.CountryName,
            StateName: res.Data.Name
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

  // #endregion public methods

  onChange(event,type:string) {


    if(type=='Status'){


  if (event.checked === true) {
    this.CityForm.controls['Status'].setValue(1)
    // this.Form.controls['Online'].value = 1

  } else {
    this.CityForm.controls['Status'].setValue(0)

  }
}
  }

  StateSelected(event: MatAutocompleteSelectedEvent): void {
    this.CityForm.patchValue({
      StateId: event.option.value.Id,
      StateName: event.option.value.Name,
      CountryName: event.option.value.CountryName,
      CountryId: event.option.value.CountryId,
    });
  }


  // * #region private methods

  private _onFormChanges() {
    this.CityForm.get('StateName').valueChanges.subscribe((val) => {
      this.States$ = this._MasterListService.getFilteredStateList(val).pipe(
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

  private _init(cityData: CityDto, mode: string): FormGroup {
    this.CityForm = this._fb.group({
      Id: [0],
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(256), this.noWhitespaceValidator]],
      StateId: [0, Validators.required],
      StateName: ["", [Validators.required]],
      CountryId: [, [Validators.required]],
      CountryName: [{value:"", disabled: true }, [Validators.required]],
      Status: [1, [Validators.required]],
      CityPinCode: this._buildCityPincode(cityData.CityPinCode)
    });


    if (cityData) {
      this.CityForm.patchValue(cityData);
    }
    if (mode == "View") {
      this.CityForm.disable();
    }
    return this.CityForm;
  }


  /**
   * @param item
   * @returns
   */
  private _buildCityPincode(items: CityPincodeDto[] = []): FormArray {

    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0) && this.mode !== "View") {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initCityPincodeForm(i));
        });
      }
    }

    return formArray;
  }
  /**
   * @param item
   * @returns
   */

  private _initCityPincodeForm(item: CityPincodeDto = null): FormGroup {
    let fg = this._fb.group({
      Id: [0],
      CityId: [0],
      PinCode: ["", [Validators.required, Validators.pattern('^[0-9]{6}$'), this.noWhitespaceValidator]],
      Area: ["", [Validators.required, Validators.maxLength(120) ,this.noWhitespaceValidator]],
      CityPinCodeInsurenceMappings: this._buildCityPinCodeInsurenceMappings(item.CityPinCodeInsurenceMappings)
    });


    if (item != null) {
      if (!item) {
        item = new CityPincodeDto();
      }

      if (item) {
        fg.patchValue(item);
      }
    }
    return fg;
  }

  private _buildCityPinCodeInsurenceMappings(items: CityPinCodeInsurenceMappingsDto[] = []): FormArray {
    
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0) && this.mode !== "View") {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initCityPinCodeInsurenceMappingsForm(i));
        });
      }
    }
    return formArray;
  }

  private _initCityPinCodeInsurenceMappingsForm(item: CityPinCodeInsurenceMappingsDto = null): FormGroup {
    let cpim = this._fb.group({
      Id: [0],
      CityPinCodeId: [0],
      CategoryType: [''],
      InsuranceCompanyCode: [''],
      Zone: [''],
      CityCode: [''],
      City: [''],
      DistrictCode: [''],
      District: [''],
      StateCode: [''],
      State: [''],
      RegionCode: [''],
      Region: [''],
      CountryCode: [''],
      Country: [''],
      Value: [''],
      Description: [''],
    })

    if (item != null) {
      if (!item) {
        item = new CityPinCodeInsurenceMappingsDto();
      }

      if (item) {
        cpim.patchValue(item);
      }
    }
    return cpim;
  }
  // #endregion private methods


  private _getFormError():any {
    if (this.f['Name'].invalid) {
      return "State Name  is required";
    }

    if(this.inf.length == 0){
      return "Enter At least One Pincode Mapping";
    }

  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }
}
