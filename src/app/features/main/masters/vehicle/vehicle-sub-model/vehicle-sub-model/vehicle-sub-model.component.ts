import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { StatusOptions } from '@config/status.config';
import { VehicleSubmodelFuelTypeList, VehicleSubTypeList } from '@config/vehicle-SubModel';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert } from '@models/common';
import { IVehicleModelDto } from '@models/dtos/core/VehicleModelDto';
import { IVehicleSubModelDto, VehicleSubModelDto } from '@models/dtos/core/VehicleSubModel';
import { IVehicleSubModelVehicleInsuranceMappingDto, VehicleSubModelVehicleInsuranceMappingDto } from '@models/dtos/core/VehicleSubModelVehicleInsuranceMappingDto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { SubCategoryTypeEnum } from 'src/app/shared/enums/SubCategoryType.enum';
import { Moment } from 'moment';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { VehicleTypeEnum } from 'src/app/shared/enums/VehicleType.enum';
import { SubCategoryCodeEnum } from 'src/app/shared/enums';
import { TransactionVehicleSubTypeList } from '@config/transaction-entry/vehicle-type.config';

@Component({
  selector: 'gnx-vehicle-sub-model',
  templateUrl: './vehicle-sub-model.component.html',
  styleUrls: ['./vehicle-sub-model.component.scss'],
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
export class VehicleSubModelComponent {

  // #region public variables

  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  selectedFuelType: string = ''; // for Fuel Type Text
  Model_api = API_ENDPOINTS.VehicleModel.Base
  SubModel_API = API_ENDPOINTS.VehicleSubModel.Base
  statusOption = StatusOptions
  //boolean
  editable: boolean;
  isReadOnly: boolean = false;

  DropdownMaster: dropdown;

  // FormGroup
  VehicleModelForm: FormGroup;
  VehicleModelFrom: IVehicleSubModelDto
  addVehicleModelForm: any
  Models$: Observable<IVehicleModelDto[]>;
  destroy$: Subject<any>;
  InsuranceCompany$: Observable<IInsuranceCompanyDto[]>;

  minPriceyear
  maxPriceyear


  // error array
  vehicleSubModelErrorAlerts: Alert[] = []
  // Errors
  errors: unknown;

  ModelList;

  // #endregion public variables

  /**
   * #region constructor
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
    this.VehicleModelFrom = new VehicleSubModelDto()
    this.getModelList()
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();
    this.minPriceyear = new Date()
    this.minPriceyear.setFullYear(1983)
    this.maxPriceyear = new Date()
  }
  // #endregion constructor


  ngOnInit(): void {
    let data = this._route.snapshot.data;
    this.mode = data['mode'];
    this.title = data['title'];
    switch (this.mode) {
      case "Create":
        this.VehicleModelFrom.VehicleInsuranceMapping = new Array<VehicleSubModelVehicleInsuranceMappingDto>();
        this.editable = true;
        break;
      case "View":
        this.editable = false;
        this.VehicleModelFrom = data['data'];
        break;
      case "Edit":
        this.isReadOnly = true;
        this.editable = true;
        this.VehicleModelFrom = data['data'];
        break;
      default:
        break;
    }
    this.addVehicleModelForm = this._init(this.VehicleModelFrom, this.mode);
    if (this.mode == "View") {
      this.VehicleModelForm.disable();
    }

    if (this.mode == "Edit") {
      this.VehicleModelForm.get("FuelType").disable()
    }
    this._fillList()
    this._onFormChanges();
  }
  // #region getters

  get f() {
    return this.VehicleModelForm.controls
  }

  get inf() {
    return this.VehicleModelForm.controls['VehicleInsuranceMapping'] as FormArray
  }

  get VehicleSubTypeList() {
    let SUbtypeList = []

    let SubCategoryCode = "";
    if (this.f['Type'].value == VehicleTypeEnum.PrivateCar) {
      SubCategoryCode = SubCategoryCodeEnum.PrivateCar
    }
    else if (this.f['Type'].value == VehicleTypeEnum.TwoWheeler) {
      SubCategoryCode = SubCategoryCodeEnum.TwoWheeler
    }
    else if (this.f['Type'].value == VehicleTypeEnum.GCV) {
      SubCategoryCode = SubCategoryCodeEnum.GCV
    }
    else if (this.f['Type'].value == VehicleTypeEnum.PCV) {
      SubCategoryCode = SubCategoryCodeEnum.PCV
    }
    else if (this.f['Type'].value == VehicleTypeEnum.Miscellaneous) {
      SubCategoryCode = SubCategoryCodeEnum.MiscellaneousD
    }
    let VehicleTypeObj = TransactionVehicleSubTypeList.find(item => item.SubCategoryCode == SubCategoryCode);
    // let VehicleTypeObj = VehicleSubTypeList.find(item => item.VehicleType == this.f['Type'].value);
    if (VehicleTypeObj) {
      SUbtypeList = VehicleTypeObj.VehicleSubType
    }

    return SUbtypeList
  }

  public get VehicleSubmodelFuelTypeList():any {
    return VehicleSubmodelFuelTypeList;
  }
  // #endregion getters
  onChange(event, type: string) {


    if (type == 'Status') {


      if (event.checked === true) {
        this.VehicleModelForm.controls['Status'].setValue(1)
      } else {
        this.VehicleModelForm.controls['Status'].setValue(0)
      }
    }
  }
  /**
   * #region public methods
   */
  // Reset function
  public clear(name: string, id: string): void {
    this.f[name].setValue("")
    this.f[id].setValue("")
    if (name == 'ModelName') {
      this.f['Type'].setValue("")
      this.f['BrandName'].setValue("")
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
        if (type == 'Model') {
          this.VehicleModelForm.patchValue({
            ModelId: result.Id,
            ModelName: result.Name,
            BrandName: result.BrandName,
            Type: result.Type
          });
        }
      }
    });
  }
  // submit or save action
  submitform = () => {
    let errorMsg = this._getFormError();
    if (errorMsg) {
      this._alertservice.raiseErrorAlert(errorMsg);
      return;
    }

    this._validateVehicleSubModelField()

    if (this.vehicleSubModelErrorAlerts.length > 0) {
      this._alertservice.raiseErrors(this.vehicleSubModelErrorAlerts);
      return;
    }

    this.VehicleModelForm.get("FuelType").enable()

    switch (this.mode) {

      case 'Create': {
        this._dataService
          .createData(this.VehicleModelForm.value, this.SubModel_API)
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
          .updateData(this.VehicleModelForm.value, this.SubModel_API)
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


  /**
   * add new row in VehicleInsuranceMapping array
   */
  public addVehicleInsuranceMappingRow() {
    this._validateVehicleSubModelField()

    if (this.vehicleSubModelErrorAlerts.length > 0) {
      this._alertservice.raiseErrors(this.vehicleSubModelErrorAlerts);
      return;
    }
    else {
      this.isReadOnly = true;
      this.VehicleModelForm.get("FuelType").disable()
    }
    var row: IVehicleSubModelVehicleInsuranceMappingDto = new VehicleSubModelVehicleInsuranceMappingDto()
    row.BrandName = this.VehicleModelForm.get('BrandName').value
    row.ModelName = this.VehicleModelForm.get('ModelName').value
    row.SubModelName = this.VehicleModelForm.get('Name').value
    row.CC = this.VehicleModelForm.get('CC').value
    row.FuelType = this.selectedFuelType
    this.VehicleModelFrom.VehicleInsuranceMapping.push(row)
    this.inf.push(this._initVehicleInsuranceMappingForm(row))
  }

  /**
   * delete a row from VehicleInsuranceMapping array based on the index
   * @param index : index number of row
   */
  public deleteVehicleInsuranceMappingRow(index) {
    this.inf.removeAt(index);
    if (this.inf.value.length < 1) {
      this.isReadOnly = false;
      this.VehicleModelForm.get("FuelType").enable()
    }

  }

  public getModelList() {

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

    this._dataService.getDataList(querySpec, this.Model_api).subscribe((res: any) => {
      this.ModelList = res?.Data.Items
    })

  }

  public modelChange(ModelId) {
    if (ModelId > 0) {
      this._dataService.getDataById(ModelId, this.Model_api).subscribe(res => {
        if (res.Success) {
          this.VehicleModelForm.patchValue({
            BrandName: res.Data.BrandName,
            Type: res.Data.Type

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

  //disabled function for options in dropdown fuel type
  public checkValueForDisabled(Value: string): boolean {
    //find object with value equal to the Value

    let VehicleType = this.VehicleModelForm.get('Type').value

    if (VehicleType == SubCategoryTypeEnum['Two Wheeler'] && (Value == "C" || Value == "L" || Value == "D")) {
      return true;
    }
    else {
      return false;
    }
  }

  public onFuelTypeSelected(event: any): void {
    this.selectedFuelType = event.target.options[event.target.options.selectedIndex].text;
  }

  // #endregion public methods

  ModelSelected(event: MatAutocompleteSelectedEvent): void {
    this.VehicleModelForm.patchValue({
      ModelId: event.option.value.Id,
      ModelName: event.option.value.Name,
      Type: event.option.value.Type,
      BrandName: event.option.value.BrandName,
    });
  }


  public chosenYearHandler(mfgYear: Moment, picker) {
    this.VehicleModelForm.get('PriceYear').patchValue(mfgYear.year());
    picker.close();
  }

  // * #region private methods

  private _onFormChanges() {
    this.VehicleModelForm.get('ModelName').valueChanges.subscribe((val) => {
      this.Models$ = this._MasterListService.getFilteredVehilceModelList(val).pipe(
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

  private _init(SubModelData: VehicleSubModelDto, mode: string): FormGroup {
    this.VehicleModelForm = this._fb.group({
      Id: [0],
      Name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(120), this.noWhitespaceValidator]],
      Type: ['', [Validators.required, this.noWhitespaceValidator]],
      Status: [1],
      BrandName: ['', [Validators.required]],
      ModelId: [0],
      ModelName: ['', [Validators.required]],
      FuelType: ['', [Validators.required]],
      FuelTypeName: [''],
      CC: [null, [Validators.required]],
      BodyType: [""],
      VehicleSubType: [, [Validators.required]],
      ShowroomPrice: [],
      PriceYear: [],
      Power: [],
      ProductionStatus: ["", [Validators.required]],
      SeatCapacity: [0],
      VehicleInsuranceMapping: this._buildCityPinCodeInsurenceMappings(SubModelData.VehicleInsuranceMapping)

    });


    if (SubModelData) {
      this.VehicleModelForm.patchValue(SubModelData);
    }
    if (mode == "View") {
      this.VehicleModelForm.disable();
    }
    return this.VehicleModelForm;
  }

  private _buildCityPinCodeInsurenceMappings(items: IVehicleSubModelVehicleInsuranceMappingDto[] = []): FormArray {

    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0) && this.mode !== "View") {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initVehicleInsuranceMappingForm(i));
        });
      }
    }
    return formArray;
  }

  private _initVehicleInsuranceMappingForm(item: IVehicleSubModelVehicleInsuranceMappingDto = null): FormGroup {
    let vimp = this._fb.group({
      Id: [0],
      VehicleSubModelId: [0],
      InsuranceCompanyCode: [''],
      InsuranceVehicleCode: [''],
      BrandName: [''],
      ModelName: [''],
      SubModelName: [''],
      NumberOfWheels: [],
      CC: [],
      SeatCapacity: [0],
      GrossWeight: [],
      CarryCapacity: [],
      FuelType: [''],
      TransmissionType: [''],
      Segment: ['']
    })

    if (item != null) {
      if (!item) {
        item = new VehicleSubModelVehicleInsuranceMappingDto();
      }

      if (item) {
        vimp.patchValue(item);
      }
    }
    return vimp;
  }



  private _getFormError(): any {
    if (this.f['ModelId'].value == 0) {
      return "Select Model Name";
    }

    // if (this.inf.controls.length == 0) {
    //   return "At least one Insurance Company Mapping(Online) is required.";
    // }

  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  /**
   *  Validate Vehicle SubModel Field
   */
  private _validateVehicleSubModelField() {
    this.vehicleSubModelErrorAlerts = [];

    if (this.VehicleModelForm.get('Name').invalid) {
      this.vehicleSubModelErrorAlerts.push({
        Message: 'Enter Vehicle Sub Model',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.VehicleModelForm.get('ModelName').invalid) {
      this.vehicleSubModelErrorAlerts.push({
        Message: 'Select Vehicle Model',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.VehicleModelForm.get('Type').invalid) {
      this.vehicleSubModelErrorAlerts.push({
        Message: 'Select Vehicle Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.VehicleModelForm.get('BrandName').invalid) {
      this.vehicleSubModelErrorAlerts.push({
        Message: 'Select Vehicle Brand',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.VehicleModelForm.get('FuelType').invalid) {
      this.vehicleSubModelErrorAlerts.push({
        Message: 'Select Fuel Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.VehicleModelForm.get('CC').invalid) {
      this.vehicleSubModelErrorAlerts.push({
        Message: 'Enter CC',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.inf.value.length > 0) {
      for (let i = 0; i < this.inf.value.length; i++) {

        if (this.inf.value[i].InsuranceCompanyCode == "" || this.inf.value[i].InsuranceCompanyCode == 0) {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Select Company Code',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.inf.value[i].InsuranceVehicleCode == "") {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Enter Vehicle Code',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.inf.value[i].BrandName == "") {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Enter Brand Name',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.inf.value[i].ModelName == "") {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Enter Model Name',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.inf.value[i].SubModelName == "") {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Enter Sub Model Name',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.inf.value[i].NumberOfWheels == "" || this.inf.value[i].NumberOfWheels == null) {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Enter No. Of Wheels',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.inf.value[i].CC == "" || this.inf.value[i].CC == null) {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Enter CC',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.inf.value[i].SeatCapacity == "" || this.inf.value[i].SeatCapacity == 0 || this.inf.value[i].SeatCapacity == null) {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Enter Seat Capacity',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.inf.value[i].GrossWeight == "" || this.inf.value[i].GrossWeight == 0 || this.inf.value[i].GrossWeight == null) {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Enter Gross Weight',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.inf.value[i].CarryCapacity == "" || this.inf.value[i].CarryCapacity == 0 || this.inf.value[i].CarryCapacity == null) {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Enter Carry Capacity',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.inf.value[i].FuelType == "" || this.inf.value[i].FuelType == 0) {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Enter Fuel Type',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.inf.value[i].TransmissionType == "") {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Enter Transmission Type',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (this.inf.value[i].Segment == "") {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Enter Segment',
            CanDismiss: false,
            AutoClose: false,
          })
        }

      }
    }

    /**
     * Check Duplicate Company Code in Vehicle Details 
     */
    if (this.inf.value.length > 1) {

      // get unique insurance company code
      let uniqueCompanyCodes = [...new Set(this.inf.value.map(item => item.InsuranceCompanyCode))];

      for (let i = 0; i < uniqueCompanyCodes.length; i++) {

        var duplicateData = this.inf.value.filter(function (element) {
          return (element.InsuranceCompanyCode == uniqueCompanyCodes[i]);
        });

        if (duplicateData.length > 1) {
          this.vehicleSubModelErrorAlerts.push({
            Message: 'Company Code already exists in Vehicle Insurance Mapping list.',
            CanDismiss: false,
            AutoClose: false,
          })
          break
        }
      };
    }
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
