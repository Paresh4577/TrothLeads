import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { FleetBusinessVehicle } from '@config/fleetbusinessVehicle.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, IFilterRule } from '@models/common';
import { ICityPincodeDto } from '@models/dtos/core';
import { IFleetVehicleDetailsDto } from '@models/dtos/transaction-master/FleetVehicleDetails.Dto';
import { FleetDto, IFleetDto } from '@models/dtos/transaction-master/fleet.Dto';
import { BehaviorSubject, Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';


export interface ISelectedValue{
  id: number,
  value: string
}

@Component({
  selector: 'gnx-fleet',
  templateUrl: './fleet.component.html',
  styleUrls: ['./fleet.component.scss']
})
export class FleetComponent {
  // #region public variables
  @Input() public PopUpmodes;
  @Input() public PopUptitles;
  @Input() public content;

  @Output() fleetCreateData = new EventEmitter<any>()

  // Strings
  mode: string = ''; // Page mode like as add, edit.....
  title: string = ''; // page Header Title
  FleetListApi: string = API_ENDPOINTS.Fleet.Base

  // Validation Regex
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  phoneNum: RegExp = ValidationRegex.phoneNumReg;

  // FormGroup
  FleetForm: FormGroup; // Reactive Form
  Fleet: IFleetDto // Form Value
  SubCategoryNameData: Observable<any>
  SubCategoryName: BehaviorSubject<any>
  step1Validate: FormControl = new FormControl()

  alerts: Alert[] = []; // Step Invalid field error message
  PinCodeList$: Observable<ICityPincodeDto[]>;
  destroy$: Subject<any>;

  // boolean
  editable: boolean; // Editable Flag

  dropdownOptions : IFleetVehicleDetailsDto[] = FleetBusinessVehicle;

  selectedValues: ISelectedValue[] = [];
  Object: any;

  sumNoOfVehicles : number = 0;
  NoOfVehicles : any[] = [];

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
    public dialog: MatDialog,
  ) {
    this.Fleet = new FleetDto()
    this.destroy$ = new Subject();
  }
  // #endregion constructor


  //#region lifecycle-hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    let data = this._route.snapshot.data;
    this.mode = data['mode']  // set Page mode
    this.title = data['title']  // Set PAge Title

    /**
     * Use For Fleet create From Popup
     */
    if (this.PopUpmodes) {
      this.mode = this.PopUpmodes
    }
    if (this.PopUptitles) {
      this.title = this.PopUptitles
    }

    switch (this.mode) {
      case "PopUpCreate":
        this.editable = true;
        break;
      case "Create":
        this.editable = true;
        break;
      case "View":
        this.editable = false;
        this.Fleet = data['data'];
        // this.Fleet.FleetBusinessVehicleDetails = this.Fleet.FleetBusinessVehicleDetails
        break;
      case "Edit":
        this.editable = true;
        this.Fleet = data['data'];
        // this.Fleet.FleetBusinessVehicleDetails = this.Fleet.FleetBusinessVehicleDetails
        break;
      default:
        break;
    }

    // Inin Form
    this._initForm(this.Fleet, this.mode);

    if (this.mode == "Create" || this.mode == "PopUpCreate") {
      this.addAddress(5)
    }
    else
    {
      // edit and view
      this.sumNoOfVehicles =0;
      this.Fleet.FleetBusinessVehicleDetails.forEach((f,i)=>{
        this.selectedValues.push({ "id" : i, "value" : f.SubCategoryName });
        this.sumNoOfVehicles += this.FleetForm.value.FleetBusinessVehicleDetails[i].NoOfVehicle;
      })
      if(this.Fleet.FleetBusinessVehicleDetails.length<5){
        this.addAddress(5 - this.Fleet.FleetBusinessVehicleDetails.length)
      }
    }

    this._onFormChanges()
  }

  //#endregion

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // #region getters

  // return Main Form Control
  get f() {
    return this.FleetForm.controls
  }

  fiveTimesArray = new Array(5).fill(0);

  // FormArray of FleetBusiness Vehicle Details Array
  public get FleetBusinessVehicleDetails() {

    return this.FleetForm.controls["FleetBusinessVehicleDetails"] as FormArray;

  }

  //Change function on dropdown vehicle category
  public onDropdownChange(event : any, index: number): void {

    //condition to check if id has a value already present
    //removing the previous value to push new value in array
    if(this.selectedValues.filter((f) => f.id == index)){
      this.selectedValues = this.selectedValues.filter((f) => f.id != index)
    }

    let value = event.target.value;      //value fetched from option selected
    this.selectedValues.push({ "id" : index, "value" : value });    //value pushed into array with the adjacent dropdown ID
  }

  //disabled function for options in dropdown vehicle category
  public checkValue(fetchedValue : string) : boolean {
    //find object with value equal to the fetchedValue
    let temp = this.selectedValues.find((f) => f.value == fetchedValue)

    if(temp != null){
      return true;
    }
    return false;
  }

  //get sum of total number of vehicles
  totalVehicles(i : number){

    //condition to check if id has a value already present
    //removing the previous value to push new value in array
    if(this.NoOfVehicles.filter((f) => f.index == i)){
      this.NoOfVehicles = this.NoOfVehicles.filter((f) => f.index != i)
    }

    this.NoOfVehicles.push({"index" : i , "Number" : this.FleetForm.value.FleetBusinessVehicleDetails[i].NoOfVehicle})

    let sum = 0;
    this.NoOfVehicles.forEach((ele) => {
      sum = sum + ele.Number
    })

    this.sumNoOfVehicles = sum;
  }


  // submit or save action
  public submitform = () => {

    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts)
      return;
    }
    let VehicleDetails = []

    this.FleetBusinessVehicleDetails.controls.forEach((ele, i) => {
      let obj : IFleetVehicleDetailsDto[];

      if (ele != null){
        obj = this.dropdownOptions.filter(x=>x.SubCategoryName == ele.value.SubCategoryName)
        if(obj != null && obj.length > 0){
          ele.value.SubCategoryId = obj[0].SubCategoryId
          VehicleDetails.push(ele.value)
          VehicleDetails = VehicleDetails.filter((f) => f.SubCategoryName != '');
        }
      }
    })


    let FleetData = this.FleetForm.value
    FleetData.FleetBusinessVehicleDetails = VehicleDetails

    switch (this.mode) {
      case 'PopUpCreate': {
        this._dataService
          .createData(this.FleetForm.value, this.FleetListApi)
          .subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, 'true')
              this.fleetCreateData.emit(res.Data);
            } else {
              this._alertservice.raiseErrors(res.Alerts);
            }
          });
        break;
      }
      case 'Create': {
        this._dataService
          .createData(this.FleetForm.value, this.FleetListApi)
          .subscribe((res) => {
            if (res.Success) {
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
          .updateData(FleetData, this.FleetListApi)
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


  // Change Status On toggle Stats button
  public onChange(event, type: string) {
    if (type == 'Status') {
      if (event.checked === true) {
        this.FleetForm.controls['Status'].setValue(1)
      } else {
        this.FleetForm.controls['Status'].setValue(0)
      }
    }
  }
  // A triggred Event When Select Pincode From Auto-complete Option
  public SubCategorySelected(event: MatAutocompleteSelectedEvent, index: number): void {
    this.FleetBusinessVehicleDetails.controls[index].patchValue({
      FleetBudinessId: event.option.value.Id,
      SubCategoryId: event.option.value.SubCategoryId,
      SubSubCategoryName: event.option.value.SubSubCategoryName,
      NoOfVehicle: event.option.value.NoOfVehicle,
    })

  }

  // previous page navigation button
  public backClicked() {
    if (this.mode == 'View' || this.mode == 'Edit') {
      this._router.navigate(['../../'], { relativeTo: this._route })
    }
    else if (this.mode == 'PopUpCreate') {
      this.fleetCreateData.emit(null);
    }
    else {
      this._router.navigate(['../'], { relativeTo: this._route })
    }
  }



  // A triggred Event When Select Pincode From Auto-complete Option
  public PinCodeSelected(event: MatAutocompleteSelectedEvent, index?: number): void {
    this.FleetForm.patchValue({
      CityPinCodeId: event.option.value.Id,
      PinCodeNumber: event.option.value.PinCode,
      CityName: event.option.value.CityName,
      StateName: event.option.value.StateName,
      CountryName: event.option.value.CountryName
    })

  }

  // Clear Pincode Value
  public ClearPincode(i?: number) {
    if (this.FleetForm.value.PinCodeNumber == "" || this.FleetForm.value.PinCodeNumber == null) {

      this.FleetForm.patchValue({
        CityPinCodeId: 0,
        PinCodeNumber: "",
        CityName: "",
        StateName: "",
        CountryName: ""
      })
    }
  }

  // Clear Data In Auto-Complete
  public clear(name: string, id: string): void {
    this.f[name].setValue("");
    this.f[id].setValue("");
  }

  // Open Pop-up For Select Data
  public openDiolog(type: string, title: string, fieldName: string, index?: number) {


    let filterData: IFilterRule[] = [];

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
      filterData: filterData,
      ispopup: true

    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (fieldName == "Pincode") {
          this.FleetForm.patchValue({
            PinCodeId: result.Id,
            StateId: result.StateId,
            CountryId: result.CountryId,
            CityId: result.CityId,
            PinCodeNumber: result.PinCode,
            CityName: result.CityName,
            StateName: result.StateName,
            CountryName: result.CountryName
          })
        }

      }
    });
  }


  // #endregion public methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build Main Form
  private _initForm(FleetData: IFleetDto, mode: string): FormGroup {
    this.FleetForm = this._fb.group({
      Id: [0],
      Status: [1, [Validators.required]],
      FleetNo: [""],
      Name: [""],
      Mobile: [""],
      Email: [""],
      Address: [""],
      Address1: [""],
      PinCodeId: [0],
      PinCodeNumber: [""],
      CityId: [0],
      CountryId: [0],
      CityName: [""],
      StateId: [0],
      StateName: [""],
      StatusYN: [""],
      FleetBusinessVehicleDetails : this._buildBusinessDetailsForm(FleetData.FleetBusinessVehicleDetails)
    });


    if (FleetData) {
      this.FleetForm.patchValue(FleetData);
    }

    if (mode == "View") {
      this.FleetForm.disable();
      this.FleetBusinessVehicleDetails.controls.forEach((control: FormGroup) => {
        control.disable();
      });
    }

    return this.FleetForm;
  }


  //Build Address Formarray
  private _buildBusinessDetailsForm(items: IFleetVehicleDetailsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initBusinessDetailsForm(i));
        });
      }
    }

    return formArray;
  }

  // add new row in GroupHeadAddress array
  private addAddress(N:number) {
    for (let i = 0; i < N; i++) {
      let row: IFleetVehicleDetailsDto = {
        Id: 0,
        FleetBusinessId: 0,
        SubCategoryId: 0,
        SubCategoryName: "",
        NoOfVehicle: 0
      };
      this.FleetBusinessVehicleDetails.push(this._initBusinessDetailsForm(row));
    }
  }

  //Init Address formgroup
  private _initBusinessDetailsForm(item: IFleetVehicleDetailsDto): FormGroup {
    let dF = this._fb.group({
      Id: [item?.Id || 0],
      FleetBusinessId: [item?.FleetBusinessId || 0],
      SubCategoryId: [item?.SubCategoryId || 0],
      SubCategoryName: [item?.SubCategoryName || ''],
      NoOfVehicle: [item?.NoOfVehicle || 0],
    });
    return dF;
  }

  // On CHange Form Control
  private _onFormChanges() {

    // Rule For Get Only Active Master Data
    let Rule: IFilterRule[] = [
      {
        Field: "Status",
        Operator: "eq",
        Value: 1
      }
    ]

  }

  // #endregion private methods
}
