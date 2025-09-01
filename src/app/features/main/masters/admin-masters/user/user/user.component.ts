import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AdditionalBranchesDto, IAdditionalBranchesDto, IPermissibleProductsDto, IUserAttachment, IUserDto, PermissibleProductsDto, UserAttachmentDto, UserDto, UserFamilyDto } from '@models/dtos/core/userDto';
import { StatusOptions } from '@config/status.config';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '@lib/services/http/http.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { dropdown } from '@config/dropdown.config';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { RoleDto } from '@models/dtos/core/RoleDto';
import { MasterListService } from '@lib/services/master-list.service';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { ICityPincodeDto } from '@models/dtos/core/CityDto';
import { Alert, IAdditionalFilterObject, IFilterRule, IQuerySpecs } from '@models/common';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { IDesignationDto } from '@models/dtos/core/DesignationDto';
import { MatStepper } from '@angular/material/stepper';
import { environment } from 'src/environments/environment';
import { remove } from 'lodash';
import { ValidationRegex } from '@config/validationRegex.config';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { AuthService } from '@services/auth/auth.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { UserTypeEnum } from 'src/app/shared/enums';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
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
export class UserComponent implements OnDestroy {
  // #region public variables

  incentiveDisplayedColumns: string[] = [
    'Name',
    'Relation',
    'Blood Group',
    'Phone No',
    'Email',
    'Action',
  ];
  FamilyDataSource: MatTableDataSource<AbstractControl>;

  //boolean
  editable: boolean;
  update: boolean;
  isAdmin: boolean;
  maxBirthDate: Date;
  hide = true;
  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  desigApi = API_ENDPOINTS.Designation.Base;
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;
  userApi = API_ENDPOINTS.User.Base;
  statusOption = StatusOptions;
  DropdownMaster: dropdown;
  imgsrc = '/assets//images/avatars/upload.png';
  Domain = API_ENDPOINTS.Domain;
  // FormGroup
  PinCode = new FormControl();
  pincodes$: Observable<ICityPincodeDto[]>;
  Designations$: Observable<IDesignationDto[]>;
  ReportingManagers$: Observable<IUserDto[]>;
  BranchList: IBranchDto[];
  UserForm: FormGroup;
  userForm: IUserDto;
  addStateForm: any;
  alerts: Alert[] = [];
  alertsTwo: Alert[] = [];
  Roles: any[] = [];
  AdditionalBranches: any[] = [];
  PermissibleProducts: any[] = [];
  GenderList: any[];
  step1 = new FormControl();
  step2 = new FormControl();
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  phoneNum: RegExp = ValidationRegex.phoneNumReg;
  // Errors
  errors: unknown;
  error: Alert[]

  addUserForm: FormGroup<any>;
  destroy$: Subject<any>;
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
    private _datePipe: DatePipe,
    private _dataService: HttpService,
    private _alertservice: AlertsService,
    public _helperservice: HelperService,
    private _MasterListService: MasterListService,
    private _authService: AuthService,
    public dialog: MatDialog,
  ) {
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();
    this.userForm = new UserDto();
    this.FamilyDataSource = new MatTableDataSource([]);
    this.userForm.UserFamilyDetail = new Array<UserFamilyDto>();
    this.maxBirthDate = new Date(Date.now());
    this._fillList()
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
    this._fillMasterList();

    if (this.mode == 'Edit' || this.mode == 'View') {
      if (data['data'].ReportingManagerName == null) {
        data['data'].ReportingManagerName = '';
      }
    }

    switch (this.mode) {
      case 'Create':
        this.update = true;
        this.editable = true;
        this.userForm.UserFamilyDetail = new Array<UserFamilyDto>();
        break;
      case 'View':
        this.update = true;
        this.editable = false;
        this.userForm = data['data'];
        break;
      case 'Edit':
        this.update = false;
        this.editable = true;
        this.userForm = data['data'];
        this.Roles = this.userForm.Roles
        this.AdditionalBranches = this.userForm.AdditionalBranches
        this.PermissibleProducts = this.userForm.PermissibleProducts
        break;
      default:
        break;
    }
    this.addUserForm = this._init(this.userForm, this.mode);
    this.FamilyDataSource.data = this.inf.controls;
    if (this.mode == 'View') {
      this.UserForm.disable();
    }
    if (this.mode == 'Edit') {
      this.UserForm.controls['Password'].clearValidators();

      //  get is admin flag
      this._authService.userProfile$.subscribe((user: IMyProfile) => {
        if (user) {
          this.isAdmin = user.IsAdmin
        }
      });
    }
    this._onFormChanges();
    if (this.infFile.value.length != 0) {
      this.imgsrc = environment.apiDomain + environment.Attachments_Middleware + '/' + this.infFile.value[0].StorageFilePath
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  //#endregion lifecycle hooks

  onChange(event, type: string) {
    if (type == 'Status') {
      if (event.checked === true) {
        this.UserForm.controls['Status'].setValue(1);
      } else {
        this.UserForm.controls['Status'].setValue(0);
      }
    }

    if (type == 'IsAdmin') {
      if (event.checked === true) {
        this.UserForm.controls['IsAdmin'].setValue(true);
      } else {
        this.UserForm.controls['IsAdmin'].setValue(false);
      }
    }

    if (type == 'IsUnderWriter') {
      if (event.checked === true) {
        this.UserForm.controls['IsUnderWriter'].setValue(true);
      } else {
        this.UserForm.controls['IsUnderWriter'].setValue(false);
      }
    }
  }
  // #region getters

  get f() {
    return this.UserForm.controls;
  }

  get inf() {
    return this.UserForm.controls['UserFamilyDetail'] as FormArray;
  }

  get infg() {
    return this.UserForm.controls['Roles'] as FormArray;
  }

  get AdditionalBranchFormArray() {
    return this.UserForm.controls['AdditionalBranches'] as FormArray;
  }

  get PermissibleProductsFormArray() {
    return this.UserForm.controls['PermissibleProducts'] as FormArray;
  }

  get infFile() {
    return this.UserForm.controls['AttachmentDetails'] as FormArray;
  }

  // #endregion getters

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

    this.UserForm.patchValue({
      DateOfBirth: this._datePipe.transform(
        this.UserForm.getRawValue().DateOfBirth,
        'yyyy-MM-dd'
      ),
      DateOfJoining: this._datePipe.transform(
        this.UserForm.getRawValue().DateOfJoining,
        'yyyy-MM-dd'
      ),
      EffectiveDate: this._datePipe.transform(
        this.UserForm.getRawValue().EffectiveDate,
        'yyyy-MM-dd'
      ),
    });

    this.error = []
    if (this.inf.value.length != 0) {
      let index = this.inf.value.length - 1

      if (this.inf.controls[index].value.Name == '') {
        this.error.push({
          Message: 'Enter Name',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.inf.controls[index].value.Relation == '') {
        this.error.push({
          Message: 'Enter Relation',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.inf.controls[index].value.EmailId == '') {
        this.error.push({
          Message: 'Enter Email',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.inf.controls[index].value.EmailId != '') {
        if (!this.emailValidationReg.test(this.inf.controls[index].value.EmailId)) {
          this.error.push({
            Message: 'Enter Valid Email',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

      if (this.inf.controls[index].value.MobileNo != '' && this.inf.controls[index].value.MobileNo != null) {
        if (!this.phoneNum.test(this.inf.controls[index].value.MobileNo)) {
          this.error.push({
            Message: 'Mobile Number must be 10 digit',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

    }


    if (this.error.length > 0) {
      this._alertservice.raiseErrors(this.error);
      return;
    }

    switch (this.mode) {
      case 'Create': {
        this._dataService
          .createData(this.UserForm.value, this.userApi)
          .subscribe((res) => {
            if (res.Success) {
              // handle success message here
              this._alertservice.raiseSuccessAlert(res.Message, 'true');
              this.backClicked();
            } else {
              this._alertservice.raiseErrors(res.Alerts);
              // handle page/form level alerts here
              if (res.Alerts[0]) {
                this.errors = res.Alerts[0].Message;
              }
            }
          });
        break;
      }

      case 'Edit': {
        this._dataService
          .updateData(this.UserForm.value, this.userApi)
          .subscribe((res) => {
            if (res.Success) {
              // handle success message here
              this._alertservice.raiseSuccessAlert(res.Message, 'true');
              this.backClicked();
            } else {
              this._alertservice.raiseErrors(res.Alerts);
              // handle page/form level alerts here
              if (res.Alerts[0]) {
                this.errors = res.Alerts[0].Message;
              }
            }
          });
        break;
      }
    }

  };

  public addUserFamilyDetails() {
    this.error = []
    if (this.inf.value.length != 0) {
      let index = this.inf.value.length - 1

      if (this.inf.controls[index].value.Name == '') {
        this.error.push({
          Message: 'Enter Name',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.inf.controls[index].value.Relation == '') {
        this.error.push({
          Message: 'Enter Relation',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.inf.controls[index].value.EmailId == '') {
        this.error.push({
          Message: 'Enter Email',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.inf.controls[index].value.EmailId != '') {
        if (!this.emailValidationReg.test(this.inf.controls[index].value.EmailId)) {
          this.error.push({
            Message: 'Enter Valid Email',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

      if (this.inf.controls[index].value.MobileNo != '' && this.inf.controls[index].value.MobileNo != null) {
        if (!this.phoneNum.test(this.inf.controls[index].value.MobileNo)) {
          this.error.push({
            Message: 'Mobile Number must be 10 digit',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

    }


    if (this.error.length > 0) {
      this._alertservice.raiseErrors(this.error);
      return;
    }

    this.userForm = this.UserForm.value;
    var row: UserFamilyDto = new UserFamilyDto();
    this.userForm.UserFamilyDetail.push(row);
    this.inf.push(this._initUserFamilyDetailForm(row));
    this.FamilyDataSource.data = this.inf.controls;
  }
  // )}


  public deleteUserFamilyDetails(index) {
    this.inf.removeAt(index);
    this.FamilyDataSource.data = this.inf.controls;
  }

  get file(): boolean {
    if (this.infFile.value.length) {
      let fil = this.infFile.controls.filter((m) => m.get("Deleted").value === false);
      if (fil.length) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  @ViewChild('img') img: ElementRef

  public deletePhoto() {
    let element = this.infFile.value[0]
    if (element.Id) {
      this.infFile.controls[0].get('Deleted').setValue(true)
    }
    else {
      this.infFile.removeAt(0)
    }
    this.imgsrc = '/assets//images/avatars/upload.png';
    this.img.nativeElement.value = ""
  }

  // Reset function
  public clear(name: string, id: string): void {
    this.f[name].setValue('');
    this.f[id].setValue('');
    if (name == 'PinCodeNumber') {
      this.f['CityName'].setValue('');
      this.f['StateName'].setValue('');
      this.f['CountryName'].setValue('');
    }
  }

  public openDiolog(type: string, title: string) {

    let Rule: IFilterRule[] = [];

    if (type == 'MultiCategory' || type == 'MultiBranch') {
      Rule.push(ActiveMasterDataRule)
    }

    let AdditionalFilters: IAdditionalFilterObject[] = []

    
        if(type == 'BDOName'){
          AdditionalFilters.push({ key: "UserType", filterValues: [UserTypeEnum.StandardUser] })
    
          if (this.UserForm.get('BranchId').value) {
            AdditionalFilters.push({ key: "Branch", filterValues: [this.UserForm.get('BranchId').value?.toString()] });
          }
        }

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
      filterData: Rule,
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'Pincode') {
          this.UserForm.patchValue({
            CityName: result.CityName,
            StateName: result.StateName,
            CountryName: result.CountryName,
            PinCodeId: result.Id,
            PinCodeNumber: result.PinCode,
          });

          this.PinCode.patchValue(result.PinCodeNumber);
        }

        if (type == 'Designation') {
          this.UserForm.patchValue({
            DesignationId: result.Id,
            DesignationName: result.Name,
          });
        }

        if (type == 'User') {
          this.UserForm.patchValue({
            ReportingManagerId: result.Id,
            ReportingManagerName: result.FullName,
          });
        }

        if (type == 'Role') {
          result.forEach((ele) => {
            if (this.Roles.some((e) => e.RoleId == ele.Id)) {
              this._alertservice.raiseErrorAlert(
                `${ele.Name} Role already exists`
              );
            }
            else {
              let role = this._initRoles(ele);
              this.Roles.push(role.value);
            }
          });
          this.UserForm.setControl('Roles', this._buildRoleFormArray(this.Roles));
          this.userForm = this.UserForm.value;
        }

        if (type == 'MultiBranch') {
          result.forEach((ele) => {
            if (this.AdditionalBranches.some((e) => e.BranchId == ele.Id)) {
              this._alertservice.raiseErrorAlert(
                `${ele.Name} Branch already exists`
              );
            }
            else {
              let branch = new AdditionalBranchesDto()
              branch.BranchId = ele.Id
              branch.BranchName = ele.Name
              branch.UserId = this.UserForm.value.Id
              this.AdditionalBranches.push(this._initAdditionalBranches(branch).value);
            }
          });
          this.UserForm.setControl('AdditionalBranches', this._buildAdditionalBranch(this.AdditionalBranches));
          this.userForm = this.UserForm.value;
        }


        if (type == 'MultiCategory') {
          result.forEach((ele) => {
            if (this.PermissibleProducts.some((e) => e.CategoryId == ele.Id)) {
              this._alertservice.raiseErrorAlert(
                `${ele.Name} Product already exists`
              );
            }
            else {
              let product = new PermissibleProductsDto()
              product.CategoryId = ele.Id
              product.CategoryName = ele.Name
              product.UserId = this.UserForm.value.Id
              this.PermissibleProducts.push(this._initPermissibleProducts(product).value);
            }
          });
          this.UserForm.setControl('PermissibleProducts', this._buildPermissibleProducts(this.PermissibleProducts));
          this.userForm = this.UserForm.value;
        }
      }
    });
  }
  
  public openDiologForMasterData(type: string, title: string,openFor:string) {

    let Rule: IFilterRule[] = [ActiveMasterDataRule];
    let AdditionalFilters: IAdditionalFilterObject[] = []

    
    if (openFor == 'ReportingManager'){
          AdditionalFilters.push({ key: "UserType", filterValues: [UserTypeEnum.StandardUser] })
    
          if (this.UserForm.get('BranchId').value) {
            AdditionalFilters.push({ key: "Branch", filterValues: [this.UserForm.get('BranchId').value?.toString()] });
          }
        }

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
      filterData: Rule,
      addFilterData: AdditionalFilters
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        if (openFor == 'ReportingManager') {
          this.UserForm.patchValue({
            ReportingManagerId: result.Id,
            ReportingManagerName: result.FullName,
          });
        }

      }
    });
  }

  onToppingRemoved(index: any) {
    this.infg.removeAt(index);
    this.Roles = this.infg.value;
  }
  RemoveAdditionalBranch(index: any) {
    this.AdditionalBranchFormArray.removeAt(index);
    this.AdditionalBranches = this.AdditionalBranchFormArray.value;
  }
  RemoveProduct(index: any) {
    this.PermissibleProductsFormArray.removeAt(index);
    this.PermissibleProducts = this.PermissibleProductsFormArray.value;
  }

  public imgPreiview(files) {
    if (files[0]) {
      let file = files[0];

      let reader = new FileReader();
      reader.onload = () => { };
      reader.readAsDataURL(file);
      var pattern = /image-*/;
      if (!file.type.match(pattern)) {
        this._alertservice.raiseErrorAlert('Only jpg/jpeg and png files are allowed!');
        return;
      }

      if (file) {
        this._dataService
          .UploadFile(this.UploadFileAPI, file)
          .subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message);
              this.imgsrc = environment.apiDomain + environment.Attachments_Middleware + '/' + res.Data.StorageFilePath;
              if (this.infFile.value.length == 0) {
                this.AddAttachment(res.Data)
              } else {
                this.infFile.controls[0].patchValue({
                  Deleted: false,
                  FileName: res.Data.FileName,
                  StorageFileName: res.Data.StorageFileName,
                  StorageFilePath: res.Data.StorageFilePath
                })
              }
            }
            else {
              this._alertservice.raiseErrors(res.Alerts);
            }
          });
      }
    }
  }



  // previous page navigation button
  public backClicked() {
    if (this.mode == 'View' || this.mode == 'Edit') {
      this._router.navigate(['../../'], { relativeTo: this._route });
    } else {
      this._router.navigate(['../'], { relativeTo: this._route });
    }
  }


  PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.UserForm.patchValue({
      CityName: event.option.value.CityName,
      StateName: event.option.value.StateName,
      CountryName: event.option.value.CountryName,
      PinCodeId: event.option.value.Id,
      PinCodeNumber: event.option.value.PinCode,
    });
    this.PinCode.patchValue(event.option.value.PinCodeNumber);
  }

  DesignationSelected(event: MatAutocompleteSelectedEvent): void {
    this.UserForm.patchValue({
      DesignationId: event.option.value.Id,
      DesignationName: event.option.value.Name,
    });
  }

  ReportingManagerSelected(event: MatAutocompleteSelectedEvent): void {
    this.UserForm.patchValue({
      ReportingManagerId: event.option.value.Id,
      ReportingManagerName: event.option.value.FullName,
    });
  }

  // Validation
  public submitStep(stepper: MatStepper, StepNo: number) {
    switch (StepNo) {
      case 1:
        this.StepOneSubmit();
        break;
      case 2:
        this.StepTwoSubmit();
        break;
      default:
        break;
    }
  }

  public StepOneSubmit(): any {
    this.alerts = [];

    if (this.UserForm.get('Title').value == '') {
      this.alerts.push({
        Message: 'Enter Your Title',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.UserForm.get('FirstName').invalid) {
      this.alerts.push({
        Message: 'Enter Your First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.UserForm.get('LastName').invalid) {
      this.alerts.push({
        Message: 'Enter you Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // gender required
    if (this.UserForm.get('Gender').value == '') {
      this.alerts.push({
        Message: 'Select your Gender',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.UserForm.get('EmployeeCode').invalid) {
      this.alerts.push({
        Message: 'Enter Your Employee Code',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.UserForm.get('DesignationName').value == '') {
      this.alerts.push({
        Message: 'Enter Designation Name',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.UserForm.get('EffectiveDate').value == '') {
      this.alerts.push({
        Message: 'Enter Effective Date',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.UserForm.get('DateOfBirth').value == '') {
      this.alerts.push({
        Message: 'Enter Your Date of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.UserForm.get('DateOfJoining').value == '') {
      this.alerts.push({
        Message: 'Enter Your Date of Joining',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.UserForm.get('UserName').invalid) {
      this.alerts.push({
        Message: 'Enter User Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.UserForm.get('Password').invalid) {
      if (this.mode == 'Create')
        this.alerts.push({
          Message: 'Enter Password',
          CanDismiss: false,
          AutoClose: false,
        });
    }

    if (this.infg.length == 0) {
      this.alerts.push({
        Message: 'Enter At least One Role',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.UserForm.get('IsUnderWriter').value) {
      if (this.PermissibleProductsFormArray.controls.length == 0) {
        this.alerts.push({
          Message: 'Permissible Products is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.alerts.length > 0) {
      this.step1.setErrors({ required: true });
      return this.step1;
    } else {
      this.step1.reset();
      return this.step1;
    }
  }

  StepOneError() {
    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
    }
  }

  // Step2 Validation

  public StepTwoSubmit(): any {
    this.alertsTwo = [];

    if (this.UserForm.get('PinCodeNumber').value == '') {
      this.alertsTwo.push({
        Message: 'Enter Your Pin Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.UserForm.get('CityName').value == '') {
      this.alertsTwo.push({
        Message: 'Enter your City Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.UserForm.get('StateName').value == '') {
      this.alertsTwo.push({
        Message: 'Enter Your State Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.UserForm.get('CountryName').value == '') {
      this.alertsTwo.push({
        Message: 'Select Your Country Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.UserForm.get('EmailId').invalid) {
      this.alertsTwo.push({
        Message: 'Enter your Email Id',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.UserForm.get('EmailId').value != '') {
      if (!this.emailValidationReg.test(this.UserForm.get('EmailId').value)) {
        this.alertsTwo.push({
          Message: 'Enter Valid Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.UserForm.get('MobileNo').value == '') {
      this.alertsTwo.push({
        Message: 'Enter Phone No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.UserForm.get('MobileNo').value != '') {
      if (this.UserForm.get('MobileNo').value.toString().length != 10) {
        this.alertsTwo.push({
          Message: 'Enter Valid Phone No.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.alertsTwo.length > 0) {
      this.step2.setErrors({ required: true });
      return this.step2;
    } else {
      this.step2.reset();
      return this.step2;
    }
  }

  StepTwoError() {
    if (this.alertsTwo.length > 0) {
      this._alertservice.raiseErrors(this.alertsTwo);
    }
  }

  // #endregion public methods

  /**
   * #region private methods
   */

  private _onFormChanges() {
    this.UserForm.get('DesignationName').valueChanges.subscribe((val) => {
      this.Designations$ = this._MasterListService
        .getFilteredDesignationList(val)
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
    });

    this.UserForm.get('PinCodeNumber').valueChanges.subscribe((val) => {
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

    this.UserForm.get('DateOfJoining').valueChanges.subscribe((val) => {
      if (val) {
        this.UserForm.get('EffectiveDate').setValue(val)
      }

    })

    this.UserForm.get('IsUnderWriter').valueChanges.subscribe((val) => {

      this.PermissibleProducts = []
      while (this.PermissibleProductsFormArray.controls.length != 0) {
        this.PermissibleProductsFormArray.removeAt(0)
      }

    })

    this.UserForm.get('ReportingManagerName').valueChanges.subscribe((val) => {

      let Rule: IFilterRule[] = [ActiveMasterDataRule];
      let AdditionalFilters: IAdditionalFilterObject[] = []

        AdditionalFilters.push({ key: "UserType", filterValues: [UserTypeEnum.StandardUser] })

        if (this.UserForm.get('BranchId').value) {
          AdditionalFilters.push({ key: "Branch", filterValues: [this.UserForm.get('BranchId').value?.toString()] });
        }

      this.ReportingManagers$ = this._MasterListService
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
    
    this.UserForm.get('BranchId').valueChanges.subscribe((val) => {
      this.UserForm.patchValue({
        ReportingManagerId:null,
        ReportingManagerName: null,
      },{emitEvent:false});
    });
  }

  private AddAttachment(UploadedeData) {

    let AttachObject: IUserAttachment = new UserAttachmentDto()
    AttachObject.FileName = UploadedeData.FileName
    AttachObject.StorageFileName = UploadedeData.StorageFileName
    AttachObject.StorageFilePath = UploadedeData.StorageFilePath
    AttachObject.Type = "UserPhoto"

    let data = this._initAttchFile(AttachObject)
    this.infFile.push(data)
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  private _init(userData: UserDto, mode: string): FormGroup {
    this.UserForm = this._fb.group({
      Id: [0],
      Title: ['', [Validators.required]],
      FirstName: ['', [Validators.required, Validators.maxLength(120), this.noWhitespaceValidator]],
      MiddleName: [''],
      LastName: ['', [Validators.required, Validators.maxLength(120), this.noWhitespaceValidator]],
      Gender: [0, [Validators.required]],
      EmployeeCode: ['', [Validators.required, Validators.maxLength(15), this.noWhitespaceValidator]],
      DateOfBirth: ['', [Validators.required]],
      DateOfJoining: ['', [Validators.required]],
      UserName: ['', [Validators.required, Validators.maxLength(60), this.noWhitespaceValidator]],
      Password: ['', [Validators.required, Validators.maxLength(20), this.noWhitespaceValidator]],
      ReportingManagerId: [0],
      ReportingManagerName: [''],
      DesignationId: [0],
      DesignationName: ['', [Validators.required]],
      EffectiveDate: ['', [Validators.required]],
      AddressLine1: ['', [Validators.maxLength(1024)]],
      AddressLine2: ['', [Validators.maxLength(1024)]],
      PinCodeNumber: ['', [Validators.required]],
      PinCodeId: [0],
      CityName: ['', [Validators.required]],
      StateName: ['', [Validators.required]],
      CountryName: ['', [Validators.required]],
      MobileNo: ['', [Validators.required]],
      EmailId: ['', [Validators.email, Validators.maxLength(60), this.noWhitespaceValidator]],
      Status: [1, [Validators.required]],
      StatusYN: [''],
      IsAdmin: [false],
      BranchId: [0, [Validators.required]],
      BranchName: [""],
      Roles: this._buildUserFormArray(userData.Roles, 'Role'),
      UserFamilyDetail: this._buildUserFormArray(
        userData.UserFamilyDetail, 'UserFamilyDetail'),
      AttachmentDetails: this._buildUserFormArray(
        userData.AttachmentDetails,
        'Attachment'
      ),
      IsUnderWriter: [false],
      AdditionalBranches: this._buildAdditionalBranch(userData.AdditionalBranches),
      PermissibleProducts: this._buildPermissibleProducts(userData.PermissibleProducts),
    });
    if (userData) {
      this.UserForm.patchValue(userData);
    }
    if (mode == 'View') {
      this.UserForm.disable();
    }

    this.f['CityName'].disable();
    this.f['StateName'].disable();
    this.f['CountryName'].disable();
    return this.UserForm;
  }

  private _buildRoleFormArray(items: any = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      items.forEach((i) => {
        formArray.push(this._SetRole(i));
      });
    }
    return formArray;
  }
  private _SetRole(item: any = null): FormGroup {
    let fg = this._fb.group({
      UserId: [0],
      UserName: [''],
      RoleId: [item.RoleId, [Validators.required]],
      RoleName: [item.RoleName, [Validators.required]],
    });
    return fg;
  }

  private _buildUserFormArray(items: any = [], type: string): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0) && this.mode !== 'View') {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          if (type == 'Role') {
            formArray.push(this._initRoles(i));
          }

          if (type == 'Attachment') {
            formArray.push(this._initAttchFile(i));
          }

          if (type == 'UserFamilyDetail') {
            formArray.push(this._initUserFamilyDetailForm(i));
          }
        });
      }
    }
    return formArray;
  }



  /**
   * @param item
   * @returns
   */

  private _initUserFamilyDetailForm(item: UserFamilyDto = null): FormGroup {
    let fg = this._fb.group({
      Id: [0],
      UserId: [0],
      UserName: [''],
      Name: ['', [this.noWhitespaceValidator, Validators.maxLength(120)]],
      Relation: ['', [Validators.maxLength(60)]],
      BloodGroup: ['', [Validators.maxLength(20)]],
      MobileNo: [''],
      EmailId: ['', [Validators.email, Validators.maxLength(60), this.noWhitespaceValidator]],
    });
    if (item != null) {
      if (!item) {
        item = new UserFamilyDto();
      }

      if (item) {
        fg.patchValue(item);
      }
    }
    return fg;
  }

  private _initRoles(item: any = null): FormGroup {
    let fg = this._fb.group({
      UserId: [0],
      UserName: [''],
      RoleId: [0, [Validators.required]],
      RoleName: ['', [Validators.required]],
    });
    if (item != null) {
      if (!item) {
        item = new RoleDto();
      }

      if (item) {
        fg.patchValue({
          RoleId: item.Id,
          RoleName: item.Name,
        });
      }
    }
    return fg;
  }

  private _initAttchFile(item: any = null): FormGroup {
    let fg = this._fb.group({
      Id: [0],
      AttachmentId: [0],
      FileName: [''],
      StorageFileName: [''],
      StorageFilePath: [''],
      Description: [''],
      Type: [''],
      Number: [''],
      IsDefault: [true],
      Deleted: [false]
    });
    if (item != null) {
      if (!item) {
        item = new UserAttachmentDto();
      }

      if (item) {
        fg.patchValue(item);
      }
    }
    return fg;
  }


  // Build AdditionalBranch Formarray
  private _buildAdditionalBranch(items: IAdditionalBranchesDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);

    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initAdditionalBranches(i));
        });
      }
    }

    return formArray;
  }

  // Init AdditionalBranch Form
  private _initAdditionalBranches(item: IAdditionalBranchesDto): FormGroup {
    let AdditionalBranch = this._fb.group({
      Id: [0],
      UserId: [0],
      UserName: [""],
      BranchId: [0],
      BranchName: [""],
    })

    if (item != null) {
      if (item) {
        AdditionalBranch.patchValue(item);
      }
    }
    return AdditionalBranch
  }


  // Build PermissibleProducts Formarray
  private _buildPermissibleProducts(items: IPermissibleProductsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);

    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPermissibleProducts(i));
        });
      }
    }

    return formArray;
  }

  // Init PermissibleProducts Form
  private _initPermissibleProducts(item: IPermissibleProductsDto): FormGroup {
    let PermissibleProducts = this._fb.group({
      Id: [0],
      UserId: [0],
      UserName: [""],
      CategoryId: [0],
      CategoryName: [""],
    })

    if (item != null) {
      if (item) {
        PermissibleProducts.patchValue(item);
      }
    }
    return PermissibleProducts
  }


  private _fillMasterList() {
    this.GenderList = [];
    this.GenderList.push({ Name: "Male" });
    this.GenderList.push({ Name: "Female" });
  }

  private _getFormError(): any {
    if (this.f['PinCodeId'].invalid) {
      return 'PinCode Is Required';
    }

    if (this.infg.length == 0) {
      return 'Enter At least One Role ';
    }

    if (this.UserForm.get('IsUnderWriter').value) {
      if (this.PermissibleProductsFormArray.controls.length == 0) {
        return 'Permissible Products is required.';
      }
    }
  }


  private _fillList() {

    let Rule: IFilterRule[] = [
      {
        Field: "Status",
        Operator: "eq",
        Value: 1
      }]
    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List, 'Name', '', Rule).subscribe((res) => {
      if (res.Success) {
        if (res.Data.Items.length) {
          this.BranchList = res.Data.Items
        } else {
          this.BranchList = []
        }
      } else {
        this.BranchList = []
      }
    })
  }
  // #endregion private methods
}
