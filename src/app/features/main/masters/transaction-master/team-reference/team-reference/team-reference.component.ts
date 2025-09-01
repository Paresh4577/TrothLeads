import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, IAdditionalFilterObject, IFilterRule } from '@models/common';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { ITeamRefDocumentDto, ITeamReferenceDto, TeamRefDocumentDto, TeamReferenceDto } from '@models/dtos/core/TeamReferenceDto';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { IRoleDto } from '@models/dtos/core/RoleDto';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { HttpService } from '@lib/services/http/http.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { dropdown } from '@config/dropdown.config';
import { ICityPincodeDto } from '@models/dtos/core/CityDto';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { CommonGeneral } from '@config/CommonGeneral';
import { IUserDto } from '@models/dtos/core/userDto';
import { IBankDto } from '@models/dtos/core/BankDto';
import { ValidationRegex } from '@config/validationRegex.config';
import { toNumber } from 'lodash';
import * as moment from 'moment';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { environment } from 'src/environments/environment';
import { AgentPolicyDocumentTypeList } from '@config/agent';
import { DialogService } from '@lib/services/dialog.service';
import { UserTypeEnum } from 'src/app/shared/enums';
import { IAgentDto } from '@models/dtos/core/agent-dto';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-team-reference',
  templateUrl: './team-reference.component.html',
  styleUrls: ['./team-reference.component.scss'],
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
export class TeamReferenceComponent {

  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  // #region public variables

  // Strings
  mode: string = '';
  title: string = '';
  hide = true;
  Img_Url = API_ENDPOINTS.Attachment.Upload
  
  // FormGroup
  TeamRef: ITeamReferenceDto;
  TeamRefForm: FormGroup;

  api=API_ENDPOINTS.TeamRef.Base;


  DropdownMaster: dropdown;

  //boolean
  editable:boolean

  step1 = new FormControl();
  step2 = new FormControl();
  step3 = new FormControl();
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  phoneNum: RegExp = ValidationRegex.phoneNumReg;

  step1error: Alert[]
  step2error: Alert[]
  step3error: Alert[]

  public branchs: IBranchDto[] = [];
  Branchs$: Observable<IBranchDto[]>;
  pincodes$: Observable<ICityPincodeDto[]>;
  Roles$: Observable<IRoleDto[]>;
  Banks$: Observable<IBankDto[]>;
  BDOlist$: Observable<IUserDto[]>;
  BDMlist$: Observable<IUserDto[]>;
  VerticalHeads$: Observable<IUserDto[]>;
  References$: Observable<IUserDto[]>;
  RecruitingPersons$: Observable<IAgentDto[]>;
  InsuranceCompanyList: IInsuranceCompanyDto[] = []
  Roles: any[]
  destroy$: Subject<any>;

  commonGeneral: CommonGeneral; // to salutation wise gender code return

  // formControls for time

  LifeStartHours = new FormControl("01");
  LifeStartMinutes = new FormControl("00");
  LifeStartAMPM = new FormControl("am");
  LifeEndHours = new FormControl("01");
  LifeEndMinutes = new FormControl("00");
  LifeEndAMPM = new FormControl("am");
  NonLifeStartHours = new FormControl("01");
  NonLifeStartMinutes = new FormControl("00");
  NonLifeStartAMPM = new FormControl("am");
  NonLifeEndHours = new FormControl("01");
  NonLifeEndMinutes = new FormControl("00");
  NonLifeEndAMPM = new FormControl("am");
  TotalTrainingHours = new FormControl();

  hourList: string[] = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  minuteList: string[] = ["00", "15", "30", "45"];

  // Date
  maxBirthDate: Date;
  // Errors
  errors: unknown;
  // #endregion public variables



  // #region constructor

  constructor(
    private _route: ActivatedRoute,
    private _fb: FormBuilder,
    private _router: Router,
    private _MasterListService: MasterListService,
    private _alertservice: AlertsService,
    private _dataService:HttpService,
    public dialog: MatDialog,
    private _datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private _dialogService: DialogService,
  ) {
    this.DropdownMaster = new dropdown();
    this.TeamRef = new TeamReferenceDto()
    this.destroy$ = new Subject();
    this.commonGeneral = new CommonGeneral();
    this._fillMasterList()
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
        this.TeamRef = data['data'];
        break;
      case "Edit":
        this.editable = true;
        this.TeamRef = data['data'];
        break;
      default:
        break;
    }

    if (this.mode == 'Edit' || this.mode == 'View'){
      this.TotalTrainingHours.setValue(data['data'].TotalTrainingHours)
    }
    this.TeamRefForm = this._init(this.TeamRef,this.mode)

    this._onFormChanges()
    this._formChanges()
    
    if (this.mode == 'Edit' || this.mode == 'View' || this.mode == "ConvertAgent") {
      this.VeiwEditMode()
      this.Roles = data['data'].RecruitingPersonRole

      if (this.TeamRefForm.get('IsExperianced').value == true || this.TeamRefForm.get('IsExperianced').value == 'true') {
        this.TeamRefForm.get('InsCompanyCode').setValidators([Validators.required])
      } else {
        this.TeamRefForm.get('InsCompanyCode').clearValidators()
      }
      this.TeamRefForm.get('InsCompanyCode').updateValueAndValidity()
      this.cdr.detectChanges();
      this.f['CertificateIssuedDate'].disable();
      if (this.f['IsCertificateIssued'].value === true) {
        this.f['CertificateIssuedDate'].enable();
      }

    }
  }

  //#endregion lifecycle hooks

  // #region getters

  public get info() {
    return this.TeamRefForm.controls
  }

  get f() {
    return this.TeamRefForm.controls
  }

    // Documents Form array
    public get documents(): FormArray {
      return this.TeamRefForm.get('Documents') as FormArray;
    }
  
    public get AgentPolicyDocumentTypeList(){
      return AgentPolicyDocumentTypeList
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


    if (this.step1error.length > 0) {
      this._alertservice.raiseErrors(this.step1error)
      return;
    }

    if (this.step2error.length > 0) {
      this._alertservice.raiseErrors(this.step2error)
      return;
    }

    if (this.step3error.length > 0) {
      this._alertservice.raiseErrors(this.step3error)
      return;
    }

    let LifeStartTotalDays
    let LifeEndTotalDays
    let NonLifeStartTotalDays
    let NonLifeEndTotalDays


    if (this.TeamRefForm.get('LifeStartDate').value) {
      if (this.LifeStartAMPM.value == 'pm') {
        LifeStartTotalDays = this._datePipe.transform(this.TeamRefForm.getRawValue().LifeStartDate, "yyyy-MM-dd") + "T" + (toNumber(this.LifeStartHours.value) + 12) + ':' + this.LifeStartMinutes.value
      } else {
        LifeStartTotalDays = this._datePipe.transform(this.TeamRefForm.getRawValue().LifeStartDate, "yyyy-MM-dd") + "T" + this.LifeStartHours.value + ':' + this.LifeStartMinutes.value
      }
    }else{
        LifeStartTotalDays = null
    }
    
    if (this.TeamRefForm.get('LifeEndDate').value) {
      if (this.LifeEndAMPM.value == 'pm') {
        LifeEndTotalDays = this._datePipe.transform(this.TeamRefForm.getRawValue().LifeEndDate, "yyyy-MM-dd") + "T" + (toNumber(this.LifeEndHours.value) + 12) + ":" + this.LifeEndMinutes.value
      } else {
        LifeEndTotalDays = this._datePipe.transform(this.TeamRefForm.getRawValue().LifeEndDate, "yyyy-MM-dd") + "T" + this.LifeEndHours.value + ":" + this.LifeEndMinutes.value
      }
    }else{
      LifeEndTotalDays = null;
    }

    if (this.TeamRefForm.get('NonLifeStartDate').value) {
      if (this.NonLifeStartAMPM.value == 'pm') {
        NonLifeStartTotalDays = this._datePipe.transform(this.TeamRefForm.getRawValue().NonLifeStartDate, "yyyy-MM-dd") + "T" + (toNumber(this.NonLifeStartHours.value) + 12) + ":" + this.NonLifeStartMinutes.value
      } else {
        NonLifeStartTotalDays = this._datePipe.transform(this.TeamRefForm.getRawValue().NonLifeStartDate, "yyyy-MM-dd") + "T" + this.NonLifeStartHours.value + ":" + this.NonLifeStartMinutes.value
      }
    }else{
      NonLifeStartTotalDays = null;
    }
    
    if (this.TeamRefForm.get('NonLifeEndDate').value) {
      if (this.NonLifeEndAMPM.value == 'pm') {
        NonLifeEndTotalDays = this._datePipe.transform(this.TeamRefForm.getRawValue().NonLifeEndDate, "yyyy-MM-dd") + "T" + (toNumber(this.NonLifeEndHours.value) + 12) + ":" + this.NonLifeEndMinutes.value
      } else {
        NonLifeEndTotalDays = this._datePipe.transform(this.TeamRefForm.getRawValue().NonLifeEndDate, "yyyy-MM-dd") + "T" + this.NonLifeEndHours.value + ":" + this.NonLifeEndMinutes.value
      }
    }else{
      NonLifeEndTotalDays = null
    }



    this.TeamRefForm.patchValue({
      DateOfBirth: this._datePipe.transform(this.TeamRefForm.getRawValue().DateOfBirth, "yyyy-MM-dd"),
      RegistrationDate: this._datePipe.transform(this.TeamRefForm.getRawValue().RegistrationDate, "yyyy-MM-dd"),
      LifeTrainingStartDate: LifeStartTotalDays,
      LifeTrainingEndDate: LifeEndTotalDays,
      NonLifeTrainingStartDate: NonLifeStartTotalDays,
      NonLifeTrainingEndDate: NonLifeEndTotalDays,
      ExamDate: this._datePipe.transform(this.TeamRefForm.getRawValue().ExamDate, "yyyy-MM-dd"),
      CertificateIssuedDate: this._datePipe.transform(this.TeamRefForm.getRawValue().CertificateIssuedDate, "yyyy-MM-dd"),

    })

    
    // this.dateFormat()
    switch (this.mode) {

      case 'Create': {
        this._dataService
          .createData(this.TeamRefForm.value,this.api)
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
          .updateData(this.TeamRefForm.value,this.api)
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

  public openDiolog(type: string, title: string,openFor:string) {


    let ActiveMasterData: IFilterRule =
      {
        Field: 'Status',
        Operator: 'eq',
        Value: 1,
      }


    let ActiveMasterDataRule: IFilterRule[] = []
    let AdditionalFilters: IAdditionalFilterObject[] = []

    if (type == 'Branch' || type == 'VerticalHeadName' || type == 'BDMName' || type == 'BDOName' || type == 'Bank' || type == "ReferenceName"){
      ActiveMasterDataRule.push(ActiveMasterData)
    }

    if (openFor == 'BDOName'){
      AdditionalFilters.push({ key: "BDOOnly", filterValues: ["true"] })
      AdditionalFilters.push({ key: "UserType", filterValues: [UserTypeEnum.StandardUser] })

      if (this.TeamRefForm.get('BranchId').value) {
        AdditionalFilters.push({ key: "Branch", filterValues: [this.TeamRefForm.get('BranchId').value?.toString()] });
      }
    }

    if (type == "ReferenceName") {
      AdditionalFilters.push({ key: 'UserType', filterValues: [UserTypeEnum.StandardUser, UserTypeEnum.Agent, UserTypeEnum.TeamReference] })
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
      ispopup: true,
      filterData: ActiveMasterDataRule,
      addFilterData: AdditionalFilters

    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        if (openFor == 'Branch') {
          this.TeamRefForm.patchValue({
            BranchName: result.Name,
            BranchId: result.Id
          })

        }

        if (type == 'ReferenceName') {
          this.TeamRefForm.patchValue({
            ReferenceId: result.Id,
            ReferenceName: result.FullName
          })

        }

        if (type == 'RecruitingPerson') {


          this.TeamRefForm.patchValue({
            RecruitingPersonId: result.Id,
            RecruitingPersonName: result.FullName,

          })

          this._dataService.getDataById(result.Id, API_ENDPOINTS.User.Base).subscribe(res => {
            this.Roles = []
            let role = res.Data.Roles
            role.forEach(element => {
              this.Roles.push(element.RoleName)

            });
          })
        }

        if (openFor == 'Pincode') {
          this.TeamRefForm.patchValue({
            CityName: result.CityName,
            StateName: result.StateName,
            CountryName: result.CountryName,
            PinCodeId: result.Id,
            PinCodeNumber: result.PinCode,
            CityId: result.CityId,
            StateId: result.StateId,
            CountryId: result.CountryId,
          })
        }
        if (openFor == 'Bank') {
            this.TeamRefForm.patchValue({
              BankId: result.Id,
              BankName: result.Name
            });
        }

        if (openFor == 'BDOName') {
          this.TeamRefForm.patchValue({
            BDOId: result.Id,
            BDOName: result.FullName,
            BDMId: result.ReportingManagerId,
            BDMName: result.ReportingManagerName,
            VerticalHeadId: result.VHReportingManagerId,
            VerticalHeadName: result.VHReportingManagerName
          }, { emitEvent: false });
        }

        if (openFor == 'BDMName') {
          this.TeamRefForm.patchValue({
            BDMId: result.Id,
            BDMName: result.FullName
          }, { emitEvent: false });
        }

        if (openFor == 'VerticalHeadName') {
          this.TeamRefForm.patchValue({
            VerticalHeadId: result.Id,
            VerticalHeadName: result.FullName
          }, { emitEvent: false });
        }

        // if (type == 'Role') {
        //   this.TeamRefForm.patchValue({
        //     Role: result[0].Name
        //   })

        // }
      }
    });
  }

  public clear(name: string,id:string): void {
    this.info[name].setValue("");
    this.info[id].setValue(0);

    if (name == "RecruitingPersonName") {
      this.Roles = []
    }
  }


  public autocompleteCleardEvent(SelectedFor: string): void {
    switch (SelectedFor) {
      case "BDO":
        this.TeamRefForm.patchValue({
          BDOId: null,
          BDOName: null,
          BDMId: null,
          BDMName: null,
          VerticalHeadId: null,
          VerticalHeadName: null
        },{emitEvent:false});
        break;

      default:
        break;
    }

  }

  public BranchSelected(event: MatAutocompleteSelectedEvent): void {
    this.TeamRefForm.patchValue({
      BranchName: event.option.value.Name,
      BranchId: event.option.value.Id,
    });
  }

  BankSelected(event: MatAutocompleteSelectedEvent): void {
    this.TeamRefForm.patchValue({
      BankId: event.option.value.Id,
      BankName: event.option.value.Name
    },{emitEvent:false});
  }

  BDOSelected(event: MatAutocompleteSelectedEvent): void {
    this.TeamRefForm.patchValue({
      BDOId: event.option.value.Id,
      BDOName: event.option.value.FullName,
      BDMId: event.option.value.ReportingManagerId,
      BDMName: event.option.value.ReportingManagerName,
      VerticalHeadId: event.option.value.VHReportingManagerId,
      VerticalHeadName: event.option.value.VHReportingManagerName
    }, { emitEvent: false });
  }

  BDMSelected(event: MatAutocompleteSelectedEvent): void {
    this.TeamRefForm.patchValue({
      BDMId: event.option.value.Id,
      BDMName: event.option.value.FullName
    }, { emitEvent: false });
  }

  VerticalHeadSelected(event: MatAutocompleteSelectedEvent): void {
    this.TeamRefForm.patchValue({
      VerticalHeadId: event.option.value.Id,
      VerticalHeadName: event.option.value.FullName
    }, { emitEvent: false });
  }

  ReferenceSelected(event: MatAutocompleteSelectedEvent): void {
    this.TeamRefForm.patchValue({
      ReferenceId: event.option.value.Id,
      ReferenceName: event.option.value.FullName
    });
  }

  RecruitingPersonSelected(event: MatAutocompleteSelectedEvent): void {
    this.TeamRefForm.patchValue({
      RecruitingPersonId: event.option.value.Id,
      RecruitingPersonName: event.option.value.FullName,
    });
    this._dataService.getDataById(event.option.value.Id,API_ENDPOINTS.User.Base).subscribe(res => {
      this.Roles = []
      let role = res.Data.Roles
      role.forEach(element => {
        this.Roles.push(element.RoleName)

      });
    })
  }

  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.TeamRefForm.patchValue({
      CityName: event.option.value.CityName,
      StateName: event.option.value.StateName,
      CountryName: event.option.value.CountryName,
      PinCodeId: event.option.value.Id,
      PinCodeNumber: event.option.value.PinCode,
      CityId: event.option.value.CityId,
      StateId: event.option.value.StateId,
      CountryId: event.option.value.CountryId,
    });
    
  }

  public onChange(event, type: string) {
    if (type == 'Status') {
      if (event.checked === true) {
        this.TeamRefForm.controls['Status'].setValue(1)

      } else {
        this.TeamRefForm.controls['Status'].setValue(0)
      }
    }

    if (type == 'IsCertificateIssued') {


      if (event.checked === true) {
        this.TeamRefForm.controls['IsCertificateIssued'].setValue(true)
      } else {
        this.TeamRefForm.controls['IsCertificateIssued'].setValue(false)
      }

      if (this.TeamRefForm.controls['IsCertificateIssued'].value === true) {
        this.f['CertificateIssuedDate'].enable();
      }
      else {
        this.f['CertificateIssuedDate'].setValue("");
      }
    }
  }

  // public RoleSelected(event: MatAutocompleteSelectedEvent): void {
  //   this.TeamRefForm.patchValue({
  //     Role: event.option.value.Name
  //   });
  // }  


  public StepOneControl(): any {
    this.step1error = [];

    if (this.TeamRefForm.get('Title').value == '') {
      this.step1error.push({
        Message: 'Select Your Title',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.TeamRefForm.get('FirstName').invalid) {
      this.step1error.push({
        Message: 'Enter Your First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.TeamRefForm.get('LastName').invalid) {
      this.step1error.push({
        Message: 'Enter you Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // gender required
    if (this.TeamRefForm.get('Name').value == '') {
      this.step1error.push({
        Message: 'Enter Team Reference Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.TeamRefForm.get('UserName').invalid) {
      this.step1error.push({
        Message: 'Enter Your User Name',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TeamRefForm.get('Password').invalid) {
      if (this.mode == 'Create')
        this.step1error.push({
          Message: 'Enter Password',
          CanDismiss: false,
          AutoClose: false,
        });
    }

    if (this.TeamRefForm.get('BranchId').value == 0 || this.TeamRefForm.get('BranchId').value == null) {
      this.step1error.push({
        Message: 'Branch is required',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TeamRefForm.get('DOB').value == '') {
      this.step1error.push({
        Message: 'Enter Your Date of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.TeamRefForm.get('MobileNo').value == '') {
      this.step1error.push({
        Message: 'Enter Mobile No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.TeamRefForm.get('MobileNo').value != '') {
      if (this.TeamRefForm.get('MobileNo').value.toString().length != 10) {
        this.step1error.push({
          Message: 'Enter Valid Mobile No.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // if (this.TeamRefForm.get('PhoneNo').value == '') {
    //   this.step1error.push({
    //     Message: 'Enter Phone No.',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   });
    // }

    // if (this.TeamRefForm.get('PhoneNo').value != '') {
    //   if (this.TeamRefForm.get('PhoneNo').value.toString().length != 10) {
    //     this.step1error.push({
    //       Message: 'Enter Valid Phone No.',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }

    if (this.TeamRefForm.get('EmailId').invalid) {
      this.step1error.push({
        Message: 'Enter your Email Id',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.TeamRefForm.get('EmailId').value != '') {
      if (!this.emailValidationReg.test(this.TeamRefForm.get('EmailId').value)) {
        this.step1error.push({
          Message: 'Enter Valid Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.TeamRefForm.get('PinCodeId').value == 0 || this.TeamRefForm.get('PinCodeId').value == null) {
      this.step1error.push({
        Message: 'PIN Code is required',
        CanDismiss: false,
        AutoClose: false,
      })
    }


    if (this.step1error.length > 0) {
      this.step1.setErrors({ required: true });
      return this.step1;
    } else {
      this.step1.reset();
      return this.step1;
    }
  }

  public StepOneError(){
    if (this.step1error.length > 0) {
      this._alertservice.raiseErrors(this.step1error)
    }
  }

  public StepTwoControl(): any {
    this.step2error = [];

    if (this.TeamRefForm.get('NameAsPerBank').invalid) {
      this.step2error.push({
        Message: 'Name as per Bank is required',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    
    if (this.TeamRefForm.get('BankId').value == 0 || this.TeamRefForm.get('BankId').value == null) {
      this.step2error.push({
        Message: 'Bank is required',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TeamRefForm.get('AccountNumber').invalid) {
      this.step2error.push({
        Message: 'Account Number is required',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    // gender required
    if (this.TeamRefForm.get('IFSCCode').invalid) {
      this.step2error.push({
        Message: 'IFSCCode is required',
        CanDismiss: false,
        AutoClose: false,
      });
    }

   

    if (this.step2error.length > 0) {
      this.step2.setErrors({ required: true });
      return this.step2;
    } else {
      this.step2.reset();
      return this.step2;
    }
  }

  public StepTwoError() {
    if (this.step2error.length > 0) {
      this._alertservice.raiseErrors(this.step2error)
    }
  }

  public StepThreeControl(): any {
    this.step3error = [];



    if (this.TeamRefForm.get('BDOId').value == 0 || this.TeamRefForm.get('BDOId').value == null) {
      this.step3error.push({
        Message: 'BDO is required',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TeamRefForm.get('BDMId').value == 0 || this.TeamRefForm.get('BDMId').value == null) {
      this.step3error.push({
        Message: 'BDM is required',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TeamRefForm.get('VerticalHeadId').value == 0 || this.TeamRefForm.get('VerticalHeadId').value == null) {
      this.step3error.push({
        Message: 'VerticalHead is required',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.step3error.length > 0) {
      this.step3.setErrors({ required: true });
      return this.step3;
    } else {
      this.step3.reset();
      return this.step3;
    }
  }

  public StepThreeError() {
    if (this.step3error.length > 0) {
      this._alertservice.raiseErrors(this.step3error)
    }
  }


    /**
     * Document Selection Change
    */
    public onDocumentSelectionChange(selectedValue): void {
  
      let selectedDocument = selectedValue.target.value;
      this.addDocuments(selectedDocument);
      this.DocumentDropdown.nativeElement.value = ""
    }
  
    /**
       * Add new row in Document array
      */
      public addDocuments(selectedDocument?: string) {
        const row: ITeamRefDocumentDto = new TeamRefDocumentDto();
        if (selectedDocument && selectedDocument != "") {
          let RowIndex = this.AgentPolicyDocumentTypeList.findIndex((doc) => doc.DocumentType == selectedDocument)
          row.DocumentType = this.AgentPolicyDocumentTypeList[RowIndex].DocumentType;
          row.DocumentTypeName = this.AgentPolicyDocumentTypeList[RowIndex].DocumentTypeName;
          this.documents.push(this._initDocument(row));
          
        }
      }
  
    /**
  * Delete document With User Confirmation
  */
    public removeDocuments(index: number): void {
      this._dialogService.confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
        .subscribe((res) => {
          if (res) {
            this.documents.removeAt(index)
          }
        });
    }
  
    /**
     * File Data (policy document that is added)
    */
    public selectDocuments(event, DocIndex: number): void {
  
      let file = event.target.files[0]
  
      if (file) {
        this._dataService.UploadFile(this.Img_Url, file).subscribe((res) => {
          if (res.Success) {
  
            if (DocIndex >= 0) {
              this.documents.controls[DocIndex].patchValue({
                FileName: res.Data.FileName,
                StorageFileName: res.Data.StorageFileName,
                StorageFilePath: res.Data.StorageFilePath,
              })
            }
            this._alertservice.raiseSuccessAlert(res.Message);
          }
          else {
            if (res.Alerts && res.Alerts?.length > 0) {
              this._alertservice.raiseErrors(res.Alerts)
            }
            else {
              this._alertservice.raiseErrorAlert(res.Message)
            }
          }
        });
      }
    }
  
    /**
  * View Uploaded Document
  */
    public viewDocuments(fileName: string): void {
      if (fileName) {
        window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
      }
    }

  // #endregion public methods

  /**
   * #region private methods
   */

  private formValidation() {
    let alerts:Alert[] = []
  }

  private _onFormChanges() {

    this.TeamRefForm.get('IsExperianced').valueChanges.subscribe((val) => {
      this.TeamRefForm.patchValue({
        InsCompanyCode: null,
        YearOfExperiance: null,
      })

      if (val == true || val == 'true') {
        this.f['InsCompanyCode'].setValidators([Validators.required])
      } else {
        this.f['InsCompanyCode'].clearValidators()
      }
      this.f['InsCompanyCode'].updateValueAndValidity()
      this.cdr.detectChanges();
    });

    this.TeamRefForm.get('RecruitingPersonName').valueChanges.subscribe((val) => {
      this.RecruitingPersons$ = this._MasterListService.getFilteredRecruitingPersonList(val).pipe(
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

    // Reference Name
    this.TeamRefForm.get('ReferenceName').valueChanges.subscribe((val) => {

      let Rule: IFilterRule[] = [];
      let AdditionalFilters: IAdditionalFilterObject[] = [
        { key: "FullName", filterValues: [val] },
        { key: 'UserType', filterValues: [UserTypeEnum.StandardUser, UserTypeEnum.Agent, UserTypeEnum.TeamReference] }
      ]

      this.References$ = this._MasterListService
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

    this.TeamRefForm.get('PinCodeNumber').valueChanges.subscribe((val) => {
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

    this.TeamRefForm.get('BranchId').valueChanges.subscribe((val) => {
      this.TeamRefForm.patchValue({
        BDOId: null,
        BDOName: null,
        BDMId: null,
        BDMName: null,
        VerticalHeadId: null,
        VerticalHeadName: null
      }, { emitEvent: false });
    });

    this.TeamRefForm.get('Title').valueChanges.subscribe((val) => {
      this.TeamRefForm.get('Gender').patchValue(this.commonGeneral.GetGenderCode(val));
    })



    this.TeamRefForm.get('BankName').valueChanges.subscribe((val) => {
      let ActiveMasterData: IFilterRule[] = [
        {
          Field: 'Status',
          Operator: 'eq',
          Value: 1,
        }
      ];
      this.Banks$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Bank.List, 'Name', val, ActiveMasterData).pipe(
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

    this.TeamRefForm.get('BDOName').valueChanges.subscribe((val) => {
      let ActiveMasterData: IFilterRule[] = [
        {
          Field: 'Status',
          Operator: 'eq',
          Value: 1,
        }
      ];
      
      let BDONameAdditionalFilters: IAdditionalFilterObject[] = [
        { key: "FullName", filterValues: [val] },
        { key: "BDOOnly", filterValues: ["true"] },
        { key: "UserType", filterValues: [UserTypeEnum.StandardUser] }
      ]

      if(this.TeamRefForm.get('BranchId').value){  
        BDONameAdditionalFilters.push({ key: "Branch", filterValues: [this.TeamRefForm.get('BranchId').value?.toString()] });
      }

      this.BDOlist$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', ActiveMasterData, BDONameAdditionalFilters).pipe(
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

    this.TeamRefForm.get('BDMName').valueChanges.subscribe((val) => {
      let ActiveMasterData: IFilterRule[] = [
        {
          Field: 'Status',
          Operator: 'eq',
          Value: 1,
        }
      ];
      let BDMNameAdditionalFilters: IAdditionalFilterObject[] = [
        { key: "FullName", filterValues: [val] }
      ]
      this.BDMlist$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', ActiveMasterData, BDMNameAdditionalFilters).pipe(
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

    this.TeamRefForm.get('VerticalHeadName').valueChanges.subscribe((val) => {
      let ActiveMasterData: IFilterRule[] = [
        {
          Field: 'Status',
          Operator: 'eq',
          Value: 1,
        }
      ];
      let VerticalHeadNameAdditionalFilters: IAdditionalFilterObject[] = [
        { key: "FullName", filterValues: [val] }
      ]
      this.VerticalHeads$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', ActiveMasterData, VerticalHeadNameAdditionalFilters).pipe(
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


    this.TeamRefForm.get('DefalutCP').valueChanges.subscribe((val) => {

      if (val) {
        this.TeamRefForm.patchValue({
          ODNet: false,
          TP: false,
          Terrorism: false,
          StampDuty: false,
        })
      } else {
        this.TeamRefForm.patchValue({
          ODNet: true,
          TP: true,
          Terrorism: true,
          StampDuty: true,
        })
      }

    });
  }

  private _init(teamReference:ITeamReferenceDto, mode: string): FormGroup {
    let fyi = this._fb.group({
      Id: [0],
      TeamReferenceNo: [''],
      Name: ['',[Validators.required,this.noWhitespaceValidator]],
      Title: ['',[Validators.required,this.noWhitespaceValidator]],
      FirstName: ['',[Validators.required,this.noWhitespaceValidator]],
      MiddleName: [''],
      LastName: ['',[Validators.required,this.noWhitespaceValidator]],
      Password: ['',[Validators.required,this.noWhitespaceValidator]],
      BranchId: [0,[Validators.required,Validators.min(1)]],
      BranchName: [''],
      DOB: ['',[Validators.required]],
      RegistrationDate: ['',[Validators.required]],
      MobileNo: ['',[Validators.required,Validators.maxLength(10),Validators.minLength(10)]],
      PhoneNo: [''],
      WhatsAppNo: ['',[Validators.required,Validators.maxLength(10),Validators.minLength(10)]],
      EmailId: ['',[Validators.required,Validators.email]],
      Address: [''],
      PinCodeId: [0,[Validators.required,Validators.min(1)]],
      PinCodeNumber: ['',[Validators.required]],
      ReferenceId: [0],
      ReferenceName: ['',],
      RecruitingPersonId: [0],
      RecruitingPersonName: ['', [Validators.required]],
      ReferenceContactNo: [''],
      CityId: [],
      CityName: [''],
      StateId: [],
      StateName: [''],
      CountryId: [],
      CountryName: [''],
      UserName: ['',[Validators.required,this.noWhitespaceValidator]],
      Status: [1],
      Gender:[],
      BankId: [0, [Validators.required]],
      BankName: ['', [Validators.required]],
      NameAsPerBank: ['', [Validators.required]],
      AccountNumber: ['', [Validators.required]],
      IFSCCode: ['', [Validators.required]],
      BDOId: [0, [Validators.required]],
      BDOName: [''],
      BDMId: [0, [Validators.required]],
      BDMName: [''],
      VerticalHeadId: [0, [Validators.required]],
      VerticalHeadName: [''],
      DefalutCP: [true],
      ODNet: [false],
      TP: [false],
      Terrorism: [false],
      StampDuty: [false],

      YearOfExperiance: [],
      InsCompanyCode: [],
      IsExperianced: [false],
      // Documents: this._buildAgentFormArray(agentData.Documents, "Document")
      LifeStartDate: [null],
      LifeEndDate: [null],
      NonLifeStartDate: [null],
      NonLifeEndDate: [null],
      LifeTrainingStartDate: [null],
      LifeTrainingEndDate: [null],
      LifeTrainingHours: [0],
      NonLifeTrainingStartDate: [null],
      NonLifeTrainingEndDate: [null],
      NonLifeTrainingHours: [0],
      ExamDate: [''],
      IsCertificateIssued: [false],
      CertificateIssuedDate: [''],
      Documents: this._buildAgentFormArray(teamReference.Documents, "Document")

    });


    if (teamReference) {
      fyi.patchValue(teamReference);
    }

    fyi.patchValue({
      LifeStartDate: teamReference.LifeTrainingStartDate,
      LifeEndDate: teamReference.LifeTrainingEndDate,
      NonLifeStartDate: teamReference.NonLifeTrainingStartDate,
      NonLifeEndDate: teamReference.NonLifeTrainingEndDate
    });

    if (mode == "View") {
      fyi.disable();
    }

    
    return fyi;
  }

  private _buildAgentFormArray(items: any = [], type: string): FormArray {

    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0) && this.mode !== "View") {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {

          if (type == "Document") {
            formArray.push(this._initDocument(i));
          }

        });
      }
    }

    return formArray;
  }


  private _initDocument(item: any = null): FormGroup {
    let fg = this._fb.group({
      Id: [0],
      AgentId: [0],
      DocumentType: [],
      DocumentTypeName: [],
      DocumentNo: [],
      Remarks: [],
      FileName: ['', [Validators.required]],
      StorageFileName: [],
      StorageFilePath: ['', [Validators.required]],
    });
    if (item) {
      fg.patchValue(item);
    }
    return fg;
  }

  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }


  _formChanges() {

    this.TeamRefForm.get('LifeStartDate').valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.TeamRefForm.controls['LifeEndDate'].valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.LifeStartHours.valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.LifeStartMinutes.valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.LifeStartAMPM.valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.LifeEndHours.valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.LifeEndAMPM.valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.LifeEndMinutes.valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.TeamRefForm.controls['NonLifeStartDate'].valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })
    this.TeamRefForm.controls['NonLifeEndDate'].valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.NonLifeStartHours.valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.NonLifeStartMinutes.valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.NonLifeStartAMPM.valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.NonLifeEndHours.valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.NonLifeEndMinutes.valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.NonLifeEndAMPM.valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })
  }

    private chnageInTrainingDateAndTime() {
      let LSH
      let LEH
      let NSH
      let NEH
  
      if (this.LifeStartAMPM.value == 'pm') {
        LSH = toNumber(this.LifeStartHours.value) + 12
      } else {
        LSH = this.LifeStartHours.value
      }
      if (this.LifeEndAMPM.value == 'pm') {
        LEH = toNumber(this.LifeEndHours.value) + 12
      }
      else {
        LEH = this.LifeEndHours.value
      }
      if (this.NonLifeStartAMPM.value == 'pm') {
        NSH = toNumber(this.NonLifeStartHours.value) + 12
      }
      else {
        NSH = this.NonLifeStartHours.value
      }
      if (this.NonLifeEndAMPM.value == 'pm') {
        NEH = toNumber(this.NonLifeEndHours.value) + 12
      }
      else {
        NEH = this.NonLifeEndHours.value
      }
      const LifeHours = (LEH - LSH) 
      const NonLifeHours = (NEH - NSH)
      const LifeMinutes = toNumber(this.LifeEndMinutes.value) - toNumber(this.LifeStartMinutes.value)
      const NonLifeMinutes = toNumber(this.NonLifeEndMinutes.value) - toNumber(this.NonLifeStartMinutes.value)
  
      const lifestart = moment(this._datePipe.transform(this.TeamRefForm.getRawValue().LifeStartDate, "yyyy-MM-dd"))
      const lifeend = moment(this._datePipe.transform(this.TeamRefForm.getRawValue().LifeEndDate, "yyyy-MM-dd"))
      const nonlifestart = moment(this._datePipe.transform(this.TeamRefForm.getRawValue().NonLifeStartDate, "yyyy-MM-dd"))
      const nonlifeend = moment(this._datePipe.transform(this.TeamRefForm.getRawValue().NonLifeEndDate, "yyyy-MM-dd"))
      const lifetotal = lifeend.diff(lifestart, 'days') ;
      const nonlifetotal = nonlifeend.diff(nonlifestart, 'days');
  
      const TotalLifeHours = LifeHours + (lifetotal * 24) // life total day convert in to hour
      const TotalNonLifeHours = NonLifeHours + (nonlifetotal * 24)//non life total day convert in to hour
      const TotalLifeMinutes = LifeMinutes
      const TotalNonLifeMinutes = NonLifeMinutes
  
      const TotalLifeTimeInHours = TotalLifeHours + (TotalLifeMinutes / 60) // total life minute convert in to hour
      const TotalNonLifeTimeInHours = TotalNonLifeHours + (TotalNonLifeMinutes / 60) // total non life minute convert in to hour
  
  
      if (TotalLifeTimeInHours > 0) {
        this.TeamRefForm.patchValue({
          LifeTrainingHours: TotalLifeTimeInHours
        })
      }else{
        this.TeamRefForm.patchValue({
          LifeTrainingHours: 0
        })
      }

      if (TotalNonLifeTimeInHours > 0) {
        this.TeamRefForm.patchValue({
          NonLifeTrainingHours: TotalNonLifeTimeInHours
        })
      }else{
        this.TeamRefForm.patchValue({
          NonLifeTrainingHours: 0
        })
      }
  
      if (TotalLifeTimeInHours > 0 && TotalNonLifeTimeInHours > 0) {
        const total = TotalLifeTimeInHours + TotalNonLifeTimeInHours;
        this.TotalTrainingHours.patchValue(
          total
        )
      }
    }
  
    private VeiwEditMode() {
      let data = this._route.snapshot.data;
      let tempLifeStartHours
      let tempLifeEndHours
      let tempNonLifeStartHours
      let tempNonLifeEndHours
      this.TeamRef = data['data'];


      /**
       * SET LIFE START DATE & TIME
       */
      if (data['data'].LifeTrainingStartDate) {

        this.TeamRef.LifeStartDate = data['data'].LifeTrainingStartDate.split('T')[0];
        this.LifeStartMinutes.setValue((data['data'].LifeTrainingStartDate.split('T')[1]).split(':')[1]);
        tempLifeStartHours = (data['data'].LifeTrainingStartDate.split('T')[1]).split(':')[0];


        if (tempLifeStartHours > 12) {
          tempLifeStartHours = tempLifeStartHours - 12

          if (tempLifeStartHours < 10) {
            tempLifeStartHours = 0 + tempLifeStartHours.toString()
            this.LifeStartHours.patchValue(tempLifeStartHours);
          } else {
            this.LifeStartHours.patchValue(tempLifeStartHours);
          }

          this.LifeStartAMPM.patchValue('pm')
        }
        else {
          this.LifeStartHours.patchValue(tempLifeStartHours);
          this.LifeStartAMPM.patchValue('am')
        }

      }else{
        this.LifeStartMinutes.setValue('00');
        this.LifeStartHours.setValue('01')
        this.LifeStartAMPM.setValue('am');
      }

      /**
       * SET LIFE END DATE & TIME
       */
      if (data['data'].LifeTrainingEndDate) {
        this.TeamRef.LifeEndDate = data['data'].LifeTrainingEndDate.split('T')[0];
        this.LifeEndMinutes.setValue((data['data'].LifeTrainingEndDate.split('T')[1]).split(':')[1]);
        tempLifeEndHours = (data['data'].LifeTrainingEndDate.split('T')[1]).split(':')[0];

        if (tempLifeEndHours > 12) {
          tempLifeEndHours = tempLifeEndHours - 12
          if (tempLifeEndHours < 10) {
            tempLifeEndHours = 0 + tempLifeEndHours.toString()
            this.LifeEndHours.patchValue(tempLifeEndHours);
          } else {
            this.LifeEndHours.patchValue(tempLifeEndHours);
          }

          this.LifeEndAMPM.patchValue('pm')
        }
        else {
          this.LifeEndHours.patchValue(tempLifeEndHours);
          this.LifeEndAMPM.patchValue('am')
        }
        
      }else{
        this.LifeEndMinutes.setValue('00');
        this.LifeEndHours.setValue('01');
        this.LifeEndAMPM.setValue('am');
      }

      /**
       * SET NON LIFE START DATE & TIME
       */
      if (data['data'].NonLifeTrainingStartDate) {

        this.TeamRef.NonLifeStartDate = data['data'].NonLifeTrainingStartDate.split('T')[0];
        this.NonLifeStartMinutes.setValue((data['data'].NonLifeTrainingStartDate.split('T')[1]).split(':')[1]);
        tempNonLifeStartHours = (data['data'].NonLifeTrainingStartDate.split('T')[1]).split(':')[0];

        if (tempNonLifeStartHours > 12) {
          tempNonLifeStartHours = tempNonLifeStartHours - 12

          if (tempNonLifeStartHours < 10) {
            tempNonLifeStartHours = 0 + tempNonLifeStartHours.toString()
            this.NonLifeStartHours.patchValue(tempNonLifeStartHours);
          } else {
            this.NonLifeStartHours.patchValue(tempNonLifeStartHours);
          }

          this.NonLifeStartAMPM.patchValue('pm')
        }
        else {
          this.NonLifeStartHours.patchValue(tempNonLifeStartHours);
          this.NonLifeStartAMPM.patchValue('am')
        }

      }else{
        this.NonLifeStartMinutes.setValue('00');
        this.NonLifeStartHours.setValue('01');
        this.NonLifeStartAMPM.setValue('am');
      }

      /**
       * SET NON LIFE END DATE & TIME
       */

      if (data['data'].NonLifeTrainingEndDate) {
        this.TeamRef.NonLifeEndDate = data['data'].NonLifeTrainingEndDate.split('T')[0];
        this.NonLifeEndMinutes.setValue((data['data'].NonLifeTrainingEndDate.split('T')[1]).split(':')[1]);



        tempNonLifeEndHours = (data['data'].NonLifeTrainingEndDate.split('T')[1]).split(':')[0];

        if (tempNonLifeEndHours > 12) {
          tempNonLifeEndHours = tempNonLifeEndHours - 12

          if (tempNonLifeEndHours < 10) {
            tempNonLifeEndHours = 0 + tempNonLifeEndHours.toString()
            this.NonLifeEndHours.patchValue(tempNonLifeEndHours);
          } else {
            this.NonLifeEndHours.patchValue(tempNonLifeEndHours);
          }

          this.NonLifeEndAMPM.patchValue('pm')
        }
        else {
          this.NonLifeEndHours.patchValue(tempNonLifeEndHours);
          this.NonLifeEndAMPM.patchValue('am')
        }
      }else{
        this.NonLifeEndMinutes.setValue('00');
        this.NonLifeEndHours.setValue('01');
        this.NonLifeEndAMPM.setValue('am');
      }
    }


  private _fillMasterList() {


    // fill Branch
    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List + "/true", 'Name', "", [ActiveMasterDataRule])
      .subscribe(res => {
        if (res.Success) {
          this.branchs = res.Data.Items
        }
      });

    let InsuranceCompanyRule: IFilterRule[] = [
      {
        Field: 'Status',
        Operator: 'eq',
        Value: 1,
      }
    ];
    this._MasterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.InsuranceCompany.list, 'Name', "", InsuranceCompanyRule)
      .subscribe(((res) => {
        if (res.Success) {
          this.InsuranceCompanyList = res.Data.Items
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
  }
  // #endregion private methods

}
