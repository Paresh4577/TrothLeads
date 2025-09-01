import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ValidationRegex } from '@config/validationRegex.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, IAdditionalFilterObject, IFilterRule } from '@models/common';
import { ICityPincodeDto } from '@models/dtos/core';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { IUserDto } from '@models/dtos/core/userDto';
import { DocumentAttachmentsDto, IDocumentAttachmentsDto } from '@models/dtos/transaction-entry';
import { GroupHeadAddressDto, GroupHeadDto, IGroupHeadAddressDto, IGroupHeadDto } from '@models/dtos/transaction-master';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { AddressType2LabelMapping, GroupHeadType2LabelMapping, HealthPolicyDocumentType2LabelMapping, SalesPersonTypeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { environment } from 'src/environments/environment';

const ActiveMasterDataRule: IFilterRule = {
  Field: 'Status',
  Operator: 'eq',
  Value: 1
}

@Component({
  selector: 'gnx-group-head',
  templateUrl: './group-head.component.html',
  styleUrls: ['./group-head.component.scss'],
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
export class GroupHeadComponent {
  // #region public variables
  @Input() public PopUpmodes;
  @Input() public PopUptitles;
  @Input() public BranchId;
  @Input() public BranchName;
  @Output() groupHeadCreateData = new EventEmitter<any>()


  // Strings
  mode: string = ''; // Page mode like as add, edit.....
  detailsstyle: string;
  title: string = ''; // page Header Title
  GroupHeadListApi: string = API_ENDPOINTS.GroupHead.Base
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload; // upload document API

  // Validation Regex
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  PANNum: RegExp = ValidationRegex.PANNumValidationReg;
  AadharNum: RegExp = ValidationRegex.UIDNumValidationReg;
  phoneNum: RegExp = ValidationRegex.phoneNumReg;

  // FormGroup
  GroupHeadForm: FormGroup; // Reactive Form
  GroupHead: IGroupHeadDto // Form Value

  step1Validate: FormControl = new FormControl()

  alerts: Alert[] = []; // Step Invalid field error message
  TeamReferenceList$: Observable<IUserDto[]>;
  POSPSalesPerson$: Observable<IUserDto[]>;
  PinCodeList$: Observable<ICityPincodeDto[]>;
  Branchs: IBranchDto[] = [];
  destroy$: Subject<any>;

  // boolean
  editable: boolean; // Editable Flag

  // Date
  maxDate: Date; // Maxdate Validate


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
    public dialog: MatDialog,
    private _MasterListService: MasterListService,
    private _datePipe: DatePipe,
  ) {
    // this.detailsstyle = "height:"+ (window.innerHeight - 350) +"px;";


    this.GroupHead = new GroupHeadDto()
    this.destroy$ = new Subject();
    this.maxDate = new Date(Date.now());

    this._fillMasterList()
  }
  // #endregion constructor

  /**
   * Only editable in =Sales person type is POSP
   */
 public  get canEditableSalesPerson() {
        if (this.GroupHeadForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
          return true;
        } else {
          return false;
        }
    }


  //#region lifecycle-hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    let data = this._route.snapshot.data;
    this.mode = data['mode']; // set Page mode
    this.title = data['title']; // Set PAge Title
    // Resolve Data

    /**
     * Use For Group-head create From Popup
     */
    if (this.PopUpmodes) {
      this.mode = this.PopUpmodes
    }
    if (this.PopUptitles) {
      this.title = this.PopUptitles
    }

    this.detailsstyle = "height:" + (window.innerHeight - 180) + "px;";

    switch (this.mode) {
      case "PopUpCreate":
        this.editable = true;
        this.detailsstyle = "height:" + (window.innerHeight - 350) + "px;";
        break;
      case "Create":
        this.editable = true;
        break;
      case "View":
        this.editable = false;
        this.GroupHead = data['data'];

        this.GroupHead.GroupHeadAddress = this.GroupHead.GroupHeadAddress.filter(ele => ele.AddressType == "Office" || ele.AddressType == "Home")
        break;
      case "Edit":
        this.editable = true;
        this.GroupHead = data['data'];

        this.GroupHead.GroupHeadAddress = this.GroupHead.GroupHeadAddress.filter(ele => ele.AddressType == "Office" || ele.AddressType == "Home")

        break;
      default:
        break;
    }

    // Inin Form
    this._initForm(this.GroupHead, this.mode);

    // In view Mode All Form Field Is diable
    if (this.mode == "View") {
      this.GroupHeadForm.disable();
    }

    if (this.mode == 'PopUpCreate') {
      this.GroupHeadForm.patchValue({
        BranchId: this.BranchId,
        BranchName: this.BranchName
      })
    }

    // IN Create mode Add Two Addres In Address FormArray
    if (this.mode == 'Create' || this.mode == 'PopUpCreate') {
      this.addAddress()
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
    return this.GroupHeadForm.controls
  }

  // return Address Type From enum
  get AddressType() {
    return AddressType2LabelMapping;
  }

  // return Group type Type From enum
  get GroupHeadType() {
    return GroupHeadType2LabelMapping;
  }

  // return Document Type From enum
  get HealthPolicyDocumentType() {
    return HealthPolicyDocumentType2LabelMapping;
  }

  // FormArray of Address Array
  public get address() {
    return this.GroupHeadForm.controls["GroupHeadAddress"] as FormArray;
  }

  // FormArray of Document Array
  public get document() {
    return this.GroupHeadForm.controls["Documents"] as FormArray;
  }

  // Get MAndate Document From Document Array from MAin Form
  get MandateDoc() {
    let ExistingMandateDocIndex = this.document.value.findIndex(doc => doc.DocumentType == this.HealthPolicyDocumentType.Mandate)
    if (ExistingMandateDocIndex != -1) {
      return this.document.controls[ExistingMandateDocIndex].value
    } else {
      return null
    }
  }
  // #endregion getters

  // submit or save action
  public submitform = () => {

    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts)
      return;
    }

    if (this.f['DateOfBirth'].value) {
      this.f['DateOfBirth'].setValue(this._datePipe.transform(this.f['DateOfBirth'].value, 'yyyy-MM-dd'));
    }

    if (this.f['AnniversaryDate'].value) {
      this.f['AnniversaryDate'].setValue(this._datePipe.transform(this.f['AnniversaryDate'].value, 'yyyy-MM-dd'));
    }


    let Address = []

    this.address.controls.forEach((ele, i) => {
      if (ele.value.CityPinCodeId != 0 && ele.value.CityPinCodeId != null) {
        Address.push(ele.value)
      }
    })

    // Remove BLank Pincode Address Object From Address Array
    let GroupHeadData = this.GroupHeadForm.value
    GroupHeadData.GroupHeadAddress = Address

    // validate Correspondence Address 
    if (this.GroupHeadForm.get('GroupHeadAddress').value.length > 0) {
      this.alerts = [];
      this.GroupHeadForm.get('GroupHeadAddress').value.forEach((el, i) => {
        if (el.AddressType == this.GroupHeadForm.get('CorrespondenceAddress').value) {

          if (el.AddressLine1 == "" || el.AddressLine1 == null || el.AddressLine1 == undefined) {
            this.alerts.push({
              Message: el.AddressType + " Address (Line 1) is required.",
              CanDismiss: false,
              AutoClose: false,
            });
          }

          if (el.AddressLine2 == "" || el.AddressLine2 == null || el.AddressLine2 == undefined || el.AddressLine2 == 0) {
            this.alerts.push({
              Message: el.AddressType + " Address (Line 2) is required.",
              CanDismiss: false,
              AutoClose: false,
            });
          }

          if (el.CityPinCodeId == "" || el.CityPinCodeId == null || el.CityPinCodeId == undefined || el.CityPinCodeId == 0) {
            this.alerts.push({
              Message: "PIN Code (" + el.AddressType + ") is required.",
              CanDismiss: false,
              AutoClose: false,
            });
          }

          if (el.StateName == "" || el.StateName == null || el.StateName == undefined) {
            this.alerts.push({
              Message: el.AddressType + " State is required.",
              CanDismiss: false,
              AutoClose: false,
            });
          }

          if (el.CityName == "" || el.CityName == null || el.CityName == undefined) {
            this.alerts.push({
              Message: el.AddressType + " City is required.",
              CanDismiss: false,
              AutoClose: false,
            });
          }

        }
      });
    }

    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts)
      return;
    }

    switch (this.mode) {

      case 'PopUpCreate': {
        this._dataService
          .createData(this.GroupHeadForm.value, this.GroupHeadListApi)
          .subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, 'true')
              this.groupHeadCreateData.emit(res.Data);
            } else {
              this._alertservice.raiseErrors(res.Alerts);
            }
          });
        break;
      }

      case 'Create': {
        this._dataService
          .createData(this.GroupHeadForm.value, this.GroupHeadListApi)
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
          .updateData(GroupHeadData, this.GroupHeadListApi)
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
        this.GroupHeadForm.controls['Status'].setValue(1)
      } else {
        this.GroupHeadForm.controls['Status'].setValue(0)
      }
    }
  }


  // previous page navigation button
  public backClicked() {
    if (this.mode == 'View' || this.mode == 'Edit') {
      this._router.navigate(['../../'], { relativeTo: this._route })
    }
    else if (this.mode == 'PopUpCreate') {
      this.groupHeadCreateData.emit(null);
    } else {
      this._router.navigate(['../'], { relativeTo: this._route })
    }
  }

  // A triggred Event When Select User From Auto-complete Option
  public TeamReferenceUserSelected(event: MatAutocompleteSelectedEvent): void {
    this.GroupHeadForm.patchValue({
      TeamReferenceUserId: event.option.value.Id,
      TeamReferenceUserName: event.option.value.FullName
    });
  }

  // A triggred Event When Select User From Auto-complete Option
  public SalesPersonelected(event: MatAutocompleteSelectedEvent): void {
    this.GroupHeadForm.patchValue({
      SalesPersonId: event.option.value.Id,
      SalesPersonName: event.option.value.FullName
    });
  }


  

  // A triggred Event When Select Pincode From Auto-complete Option
  public PinCodeSelected(event: MatAutocompleteSelectedEvent, index: number): void {
    this.address.controls[index].patchValue({
      CityPinCodeId: event.option.value.Id,
      PinCodeNumber: event.option.value.PinCode,
      CityName: event.option.value.CityName,
      StateName: event.option.value.StateName,
      CountryName: event.option.value.CountryName
    })

  }

  // Clear Pincode Value
  public ClearPincode(i: number) {
    if (this.address.controls[i].value.PinCodeNumber == "" || this.address.controls[i].value.PinCodeNumber == null) {

      this.address.controls[i].patchValue({
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

    let AdditionalFilters: IAdditionalFilterObject[] = []


    if (fieldName == "SalesPersonName") {

      AdditionalFilters = [
        { key: 'UserType', filterValues: [UserTypeEnum.Agent] }
      ]
    }

    if (fieldName == "TeamReferenceUser") {

      AdditionalFilters = [
        { key: 'UserType', filterValues: [UserTypeEnum.TeamReference] }
      ]
    }

    // default Rule For Only Get Active Data
    if (fieldName == "TeamReferenceUser" || fieldName == "SalesPersonName") {
      filterData.push(ActiveMasterDataRule);

      if (this.f['BranchId'].value) {
        filterData.push(
          {
            Field: "Branch.Id",
            Operator: "eq",
            Value: this.f['BranchId'].value
          }
        )
      }
    }


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
      addFilterData: AdditionalFilters,
      ispopup: true

    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        if (fieldName == "TeamReferenceUser") {
          this.GroupHeadForm.patchValue({
            TeamReferenceUserId: result.Id,
            TeamReferenceUserName: result.FullName
          });
        }

        if (fieldName == "SalesPersonName") {
          this.GroupHeadForm.patchValue({
            SalesPersonId: result.Id,
            SalesPersonName: result.FullName
          });
        }

        if (fieldName == "Pincode") {
          this.address.controls[index].patchValue({
            CityPinCodeId: result.Id,
            PinCodeNumber: result.PinCode,
            CityName: result.CityName,
            StateName: result.StateName,
            CountryName: result.CountryName
          })
        }

      }
    });
  }


  // On Change Document Select
  public selectedDocument(event) {
    let file = event.target.files[0]

    if (file) {
      this._dataService
        .UploadFile(this.UploadFileAPI, file)
        .subscribe((res) => {
          if (res.Success) {
            let ExistingMandateDocIndex = this.document.value.findIndex(doc => doc.DocumentType == this.HealthPolicyDocumentType.Mandate)

            // If Alredy existing Mandate Doc. Than Update FileName & Path 
            //else
            // Add New Doc
            if (ExistingMandateDocIndex != -1) {

              this.document.controls[ExistingMandateDocIndex].patchValue({
                ImageUploadName: res.Data.StorageFileName,
                ImageUploadPath: res.Data.StorageFilePath
              })
            } else {
              let NewDoc: IDocumentAttachmentsDto = new DocumentAttachmentsDto()

              NewDoc.DocumentType = this.HealthPolicyDocumentType.Mandate
              NewDoc.ImageUploadName = res.Data.StorageFileName,
                NewDoc.ImageUploadPath = res.Data.StorageFilePath
              this.document.push(this._initDocumentForm(NewDoc))
            }

          }
          else {
            this._alertservice.raiseErrors(res.Alerts);
          }
        });
    }

  }

  // Validating stepper One
  public StepOneSubmit(): any {
    //validate Step One
    this.alerts = [];


    if (this.f['Name'].value == '') {
      this.alerts.push({
        Message: "Group Head Name is required.",
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.f['MobileNo'].value == '') {
      this.alerts.push({
        Message: "Mobile Number is required.",
        CanDismiss: false,
        AutoClose: false,
      })
    }


    if (this.f['MobileNo'].value != '') {
      if (!this.phoneNum.test(this.f['MobileNo'].value)) {
        this.alerts.push({
          Message: 'Mobile Number must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.f['PANNumber'].value != '' && this.f['PANNumber'].value != null) {
      if (!this.PANNum.test(this.f['PANNumber'].value)) {
        this.alerts.push({
          Message: 'Enter Valid PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.f['AadharNumber'].value != '' && this.f['AadharNumber'].value != null) {
      if (!this.AadharNum.test(this.f['AadharNumber'].value)) {
        this.alerts.push({
          Message: 'Enter Valid Aadhar',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.f['BranchId'].value == 0 || this.f['BranchId'].value == "") {
      this.alerts.push({
        Message: "Branch is required.",
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.f['SalesPersonType'].value == "") {
      this.alerts.push({
        Message: "Sales Person Type is required.",
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.f['SalesPersonId'].value) {
      this.alerts.push({
        Message: "POSP (Sales Person) is required.",
        CanDismiss: false,
        AutoClose: false,
      })
    }
    
    if (this.f['SalesPersonType'].value == SalesPersonTypeEnum.TeamReference) {
    if (!this.f['TeamReferenceUserId'].value) {
      this.alerts.push({
        Message: "Team Reference is required.",
        CanDismiss: false,
        AutoClose: false,
      })
    }
    }

    if (this.f['Email'].value == '') {
      this.alerts.push({
        Message: "Email Address is required.",
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.f['Email'].value != '') {
      if (!this.emailValidationReg.test(this.f['Email'].value)) {
        this.alerts.push({
          Message: 'Enter Valid Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.f['SecondaryEmail'].value != '' && this.f['SecondaryEmail'].value != null) {
      if (!this.emailValidationReg.test(this.f['SecondaryEmail'].value)) {
        this.alerts.push({
          Message: 'Enter Valid Secondary Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }



    if (this.f['MandateObtained'].value == null) {
      this.alerts.push({
        Message: "Select Mandate Obtained",
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.f['MandateObtained'].value) {
      let ExistingMandateDocIndex = this.document.value.findIndex(doc => doc.DocumentType == this.HealthPolicyDocumentType.Mandate)

      if (ExistingMandateDocIndex == -1) {
        this.alerts.push({
          Message: "Attach Mandate Copy is required.",
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.f['Type'].value == null || this.f['Type'].value == '') {
      this.alerts.push({
        Message: "Type is required.",
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.f['CorrespondenceAddress'].value == null || this.f['CorrespondenceAddress'].value == '') {
      this.alerts.push({
        Message: "Correspondence Address is required.",
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.alerts.length > 0) {
      this.step1Validate.setErrors({ required: true });
      return this.step1Validate;
    } else {
      this.step1Validate.reset();
      return this.step1Validate;
    }
  }


  /**
 * View Mandate document
 * @param item 
 */
  public ViewQnDocument(fileName: string) {
    window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
  }


  // #endregion public methods

  //#endregion

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build Main Form
  private _initForm(GroupHeadData: IGroupHeadDto, mode: string): FormGroup {
    this.GroupHeadForm = this._fb.group({
      Id: [0],
      Status: [1, [Validators.required]],
      GroupHeadNumber: [""],
      Name: [""],
      DateOfBirth: [""],
      MobileNo: [""],
      PANNumber: [""],
      AadharNumber: [""],
      SalesPersonId: [0],
      SalesPersonName: [""],
      SalesPersonType: [""],
      TeamReferenceUserId: [0],
      TeamReferenceUserName: [""],
      AnniversaryDate: [""],
      Email: [""],
      SecondaryEmail: [],
      CustomerReference: [""],
      MandateObtained: [false],
      Type: [],
      CorrespondenceAddress: [],
      BranchName: [""],
      BranchId: [0, [Validators.required]],
      Documents: this._buildDocumentForm(GroupHeadData.Documents),
      GroupHeadAddress: this._buildAddressForm(GroupHeadData.GroupHeadAddress)
    });


    if (GroupHeadData) {
      this.GroupHeadForm.patchValue(GroupHeadData);
    }
    if (mode == "View") {
      this.GroupHeadForm.disable();
    }
    return this.GroupHeadForm;
  }


  //Build Address Formarray
  private _buildAddressForm(items: IGroupHeadAddressDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initAddressForm(i));
        });
      }
    }

    return formArray;
  }

  //Init Address formgroup
  private _initAddressForm(item: IGroupHeadAddressDto): FormGroup {
    let dF = this._fb.group({
      Id: [0],
      AddressType: [""],
      GroupHeadId: [0],
      AddressLine1: [""],
      AddressLine2: [""],
      CityPinCodeId: [0],
      PinCodeNumber: [""],
      CityName: [""],
      StateName: [""],
      CountryName: [""],
    })
    if (item != null) {
      if (!item) {
        item = new GroupHeadAddressDto();
      }

      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }

  //Build document Formarray
  private _buildDocumentForm(items: IDocumentAttachmentsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initDocumentForm(i));
        });
      }
    }

    return formArray;
  }

  //Init document formgroup
  private _initDocumentForm(item: IDocumentAttachmentsDto): FormGroup {
    let dF = this._fb.group({
      Id: [0],
      TransactionId: [],
      Remark: [""],
      DocumentTypeName: [""],
      DocumentType: [""],
      ImageUploadName: [""],
      ImageUploadPath: [""],
    })
    if (item != null) {
      if (!item) {
        item = new DocumentAttachmentsDto();
      }

      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }


  // add new row in GroupHeadAddress array
  private addAddress() {
    var row: IGroupHeadAddressDto = new GroupHeadAddressDto()

    // Add By defualt two Address
    for (let i = 1; i < 3; i++) {
      if (i == 1) {
        row.AddressType = AddressType2LabelMapping.Home
      }
      if (i == 2) {
        row.AddressType = AddressType2LabelMapping.Office
      }

      this.address.push(this._initAddressForm(row));

    }
  }

  // On CHange Form Control
  private _onFormChanges() {

    // Rule For Get Only Active Master Data
    let Rule: IFilterRule[] = [];



    this.GroupHeadForm.get('TeamReferenceUserName').valueChanges.subscribe((val) => {

      Rule = [
        {
          Field: "Status",
          Operator: "eq",
          Value: 1
        }
      ]
      let TeamRefAdditionalFilters: IAdditionalFilterObject[] = []

      TeamRefAdditionalFilters = [
        { key: 'UserType', filterValues: [UserTypeEnum.TeamReference] },
        { key: "FullName", filterValues: [val] }
      ]

      if (this.f['BranchId'].value) {
        Rule.push(
          {
            Field: "Branch.Id",
            Operator: "eq",
            Value: this.f['BranchId'].value
          }
        )
      }
      this.TeamReferenceList$ = this._MasterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", Rule, TeamRefAdditionalFilters)
        .pipe(
          takeUntil(this.destroy$),
          switchMap((res) => {
            if (res.Success) {
              if (res.Data.Items.length) {
                return of(res.Data.Items);
              } else {
                return of([]);
              }
            } else {
              return of([]);
            }
          })
        );
    });

    this.GroupHeadForm.get('SalesPersonName').valueChanges.subscribe((val) => {

      Rule = [
        {
          Field: "Status",
          Operator: "eq",
          Value: 1
        }
      ]
      let AdditionalFilters: IAdditionalFilterObject[] = []

      AdditionalFilters = [
        { key: 'UserType', filterValues: [UserTypeEnum.Agent] },
        { key: "FullName", filterValues: [val] }
      ]

      if(this.f['BranchId'].value){
        Rule.push(
          {
            Field: "Branch.Id",
            Operator: "eq",
            Value: this.f['BranchId'].value
          }
        )
      }

      this.POSPSalesPerson$ = this._MasterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", Rule, AdditionalFilters)
        .pipe(
          takeUntil(this.destroy$),
          switchMap((res) => {
            if (res.Success) {
              if (res.Data.Items.length) {
                return of(res.Data.Items);
              } else {
                return of([]);
              }
            } else {
              return of([]);
            }
          })
        );
    });
    
    this.GroupHeadForm.get('BranchId').valueChanges.subscribe((val) => {
      this._salesPersonUserDetails()
    });
    
    this.GroupHeadForm.get('SalesPersonType').valueChanges.subscribe((val) => {
      this._salesPersonUserDetails()
    });




    this.address.controls.forEach((element, index) => {
      element.get('PinCodeNumber').valueChanges.subscribe((val) => {
        this.PinCodeList$ = this._MasterListService
          .getFilteredPincodeList(val)
          .pipe(
            takeUntil(this.destroy$),
            switchMap((res) => {
              if (res.Success) {
                if (res.Data.Items.length) {
                  return of(res.Data.Items);
                } else {
                  return of([]);
                }
              } else {
                return of([]);
              }
            })
          );
      });
    });



  }

  private _fillMasterList() {
  
      // fill Branch
      this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List, 'Name', "", [ActiveMasterDataRule])
        .subscribe(res => {
          if (res.Success) {
            this.Branchs = res.Data.Items
          }
        });
    }


  private _salesPersonUserDetails() {
   
          /**
           * SalesPersonType Direct OR team ref. sales person is Selected branch bqp
           * Other Field is null
           */
      if (this.GroupHeadForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct || 
        this.GroupHeadForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {
    
    
        let selectedBranch = this.Branchs.find(b => b.Id == this.GroupHeadForm.get('BranchId').value)
    
            if (selectedBranch) {
              this.GroupHeadForm.patchValue({
                SalesPersonId: selectedBranch.BrokerQualifiedPersonId,
                SalesPersonName: selectedBranch.BrokerQualifiedPersonName,
              },{emitEvent:false});
            } else {
              this.GroupHeadForm.patchValue({
                SalesPersonId: null,
                SalesPersonName: null,
              }, { emitEvent: false });
            }
    
    
      } else if (this.GroupHeadForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
            this.GroupHeadForm.patchValue({
              SalesPersonId: null,
              SalesPersonName: null,
            }, { emitEvent: false });
      } 

      }
  // #endregion private methods
}
