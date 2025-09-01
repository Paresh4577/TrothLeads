import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { StatusOptions } from '@config/status.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HelperService } from '@lib/services/helper.service';
import { HttpService } from '@lib/services/http/http.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { AgentDocumentDto, AgentDto, AttachmentDetailsDto, IAgentDocumentDto, IAgentDto } from '@models/dtos/core/agent-dto';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { DatePipe, Location } from '@angular/common';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { dropdown } from '@config/dropdown.config';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { MasterListService } from '@lib/services/master-list.service';
import { ISourceDto } from '@models/dtos/core/SourceDto';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ISubSourceDto } from '@models/dtos/core/SubSourceDto';
import { IBankDto } from '@models/dtos/core/BankDto';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { IUserAttachment, IUserDto, UserAttachmentDto } from '@models/dtos/core/userDto';
import { ICityPincodeDto } from '@models/dtos/core/CityDto';
import { Alert, IAdditionalFilterObject, IFilterRule } from '@models/common';
import { MatStepper } from '@angular/material/stepper';
import { toNumber } from 'lodash';
import { environment } from 'src/environments/environment';
import { ValidationRegex } from '@config/validationRegex.config';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { AuthService } from '@services/auth/auth.service';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { DialogService } from '@lib/services/dialog.service';
import { AgentPolicyDocumentTypeList } from '@config/agent';
import { UserTypeEnum } from 'src/app/shared/enums';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss'],
  providers: [DatePipe, {
    provide: DateAdapter,
    useClass: MomentDateAdapter,
    deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
  },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class AgentComponent {
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  // #region public variables
  hide = true;
  // Strings
  mode: string = '';
  title: string = '';
  Code: string;
  isAdmin: boolean;
  SourceApi = API_ENDPOINTS.Source.Base;
  SubSourceApi = API_ENDPOINTS.SubSource.Base;
  BankApi = API_ENDPOINTS.Bank.Base;
  LanguageApi = API_ENDPOINTS.Language.Base;
  RoleApi = API_ENDPOINTS.Role.Base;
  BranchApi = API_ENDPOINTS.Branch.Base;
  PinCode = new FormControl();
  TotalTrainingHours = new FormControl();
  RecruitingPersonRole = new FormControl();
  UserApi = API_ENDPOINTS.User.Base;
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;
  Domain = API_ENDPOINTS.Domain;
  DropdownMaster: dropdown;
  Img_Url = API_ENDPOINTS.Attachment.Upload
  ApproveAPI = API_ENDPOINTS.Agent.ApproveReject
  api = API_ENDPOINTS.Agent.Base;
  statusOption = StatusOptions;
  imgsrc = "/assets//images/avatars/upload.png"
  FamilyDataSource: MatTableDataSource<AbstractControl>;
  GenderList: any[];
  //boolean
  editable: boolean;
  update: boolean
  LanguageList;
  RoleList;
  // FormGroup
  AgentForm: FormGroup;
  agentForm: IAgentDto
  addAgentForm: any;
  Sources$: Observable<ISourceDto[]>;
  SubSources$: Observable<ISubSourceDto[]>;
  pincodes$: Observable<ICityPincodeDto[]>;
  Banks$: Observable<IBankDto[]>;
  References$: Observable<IUserDto[]>;
  Branchs$: Observable<IBranchDto[]>;
  CREs$: Observable<IUserDto[]>;
  CRMs$: Observable<IUserDto[]>;
  VerticalHeads$: Observable<IUserDto[]>;
  RecruitingPersons$: Observable<IAgentDto[]>;
  InsuranceCompanyList: IInsuranceCompanyDto[] = []
  public branchs: IBranchDto[] = [];
  // Alerts
  alerts: Alert[] = [];
  alertsThree: Alert[] = [];
  alertsFour: Alert[] = [];
  alertsFive: Alert[] = [];
  alertsSix: Alert[] = [];
  alertsSeven: Alert[] = [];
  alertsEight: Alert[] = [];
  hourList: string[] = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  minuteList: string[] = ["00", "15", "30", "45"];
  // StepControl
  step1 = new FormControl()
  step3 = new FormControl();
  step4 = new FormControl();
  step5 = new FormControl();
  step6 = new FormControl();
  step7 = new FormControl();
  step8 = new FormControl();
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  phoneNum: RegExp = ValidationRegex.phoneNumReg;
  AadharNum: RegExp = ValidationRegex.UIDNumValidationReg;
  PANNum: RegExp = ValidationRegex.PANNumValidationReg;

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


  // Date
  maxBirthDate: Date;
  // Errors
  errors: unknown;
  test: boolean;
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
    private _fb: FormBuilder, private _datePipe: DatePipe,
    private _dataService: HttpService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _alertservice: AlertsService,
    public _helperservice: HelperService,
    private _MasterListService: MasterListService,
    private _authService: AuthService,
    public dialog: MatDialog,
    private _location: Location,
    private _dialogService: DialogService,
    private cdr: ChangeDetectorRef,
  ) {
    this.DropdownMaster = new dropdown
    this.agentForm = new AgentDto();
    this.getLanguageList()
    this.destroy$ = new Subject();
    this.maxBirthDate = new Date(Date.now());
  }
  // #endregion constructor


  // Documents Form array
  public get documents(): FormArray {
    return this.AgentForm.get('Documents') as FormArray;
  }

  public get AgentPolicyDocumentTypeList(){
    return AgentPolicyDocumentTypeList
  }

  // start of ngOnInit

  ngOnInit(): void {
    let data = this._route.snapshot.data;
    this.mode = data['mode'];
    this.title = data['title'];
    this._fillMasterList();
    if (this.mode == 'Edit' || this.mode == 'View' || this.mode == "ConvertAgent") {
      if (data['data'].SourceName == null) {
        data['data'].SourceName = ""
      }
      if (data['data'].SubSourceName == null) {
        data['data'].SubSourceName = ""
      }
      if (data['data'].ReferenceName == null) {
        data['data'].ReferenceName = ""
      }
    }

    switch (this.mode) {
      case "Create":
        this.update = true;
        this.editable = true;
        break;
      case "View":

        this.update = true;
        this.editable = false;

        // this.VeiwEditMode()
        this.agentForm = data['data'];

        this.Roles = data['data'].RecruitingPersonRole

        this.TotalTrainingHours.setValue(data['data'].TotalTrainingHours)


        break;
      case "Edit": case "ConvertAgent":
        this.update = false;
        this.editable = true;

        // this.VeiwEditMode()

        this.agentForm = data['data'];
        this.Roles = data['data'].RecruitingPersonRole
        this.TotalTrainingHours.setValue(data['data'].TotalTrainingHours)

        break;
      default:
        break;
    }
    
    this._init(this.agentForm, this.mode);
    if (this.mode == "View") {
      this.AgentForm.disable();
    }
    this._formChanges()
    if (this.mode == "Edit" || this.mode == "ConvertAgent") {
      this.AgentForm.controls["Password"].clearValidators()

      //  get isAdmin flag
      this._authService.userProfile$.subscribe((user: IMyProfile) => {
        if (user) {
          this.isAdmin = user.IsAdmin
        }
      });

      if (this.f['IsExperianced'].value == true || this.f['IsExperianced'].value == 'true') {
        this.f['InsCompanyCode'].setValidators([Validators.required])
      } else {
        this.f['InsCompanyCode'].clearValidators()
      }
      this.f['InsCompanyCode'].updateValueAndValidity()
      this.cdr.detectChanges();
    }
    if (this.mode == 'Edit' || this.mode == 'View' || this.mode == "ConvertAgent") {
      this.VeiwEditMode()
    }

    this._onFormChanges()
    if (this.infFile.value.length != 0) {
      this.imgsrc = environment.apiDomain + environment.Attachments_Middleware + '/' + this.infFile.value[0].StorageFilePath
    }
  }

  // end of ngOnInit


  // start of Public methods

  public clear(name: string, id: string): void {
    this.f[name].setValue("");
    this.f[id].setValue("");

    if (name == "PinCodeNumber") {
      this.f["CityName"].setValue("");
      this.f["StateName"].setValue("");
      this.f["CountryName"].setValue("");
    }

    if (name == "RecruitingPersonName") {
      this.Roles = []
    }
  }

  public autocompleteCleardEvent(SelectedFor: string): void {
    switch (SelectedFor) {
      case "BDO":
        this.AgentForm.patchValue({
          BDOId: null,
          BDOName: null,
          BDMId: null,
          BDMName: null,
          VerticalHeadId: null,
          VerticalHeadName: null
        });
        break;

      default:
        break;
    }

  }

  onChange(event, type: string) {


    if (type == 'IsCertificateIssued') {


      if (event.checked === true) {
        this.AgentForm.controls['IsCertificateIssued'].setValue(true)
      } else {
        this.AgentForm.controls['IsCertificateIssued'].setValue(false)
      }

      if (this.AgentForm.controls['IsCertificateIssued'].value === true) {
        this.f['CertificateIssuedDate'].enable();
      }
      else {
        this.f['CertificateIssuedDate'].setValue("");
      }
    }
  }




  onStatus(event, type: string) {

    if (type == 'Status') {

      if (event.checked === true) {
        this.AgentForm.controls['Status'].setValue(1)
      } else {
        this.AgentForm.controls['Status'].setValue(0)

      }
    }
  }

  _formChanges() {

    this.AgentForm.get('LifeStartDate').valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })

    this.AgentForm.controls['LifeEndDate'].valueChanges.subscribe(() => {

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

    this.AgentForm.controls['NonLifeStartDate'].valueChanges.subscribe(() => {

      this.chnageInTrainingDateAndTime()

    })
    this.AgentForm.controls['NonLifeEndDate'].valueChanges.subscribe(() => {

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

  onPOSP(event, type: string) {
    if (type == 'IsContactPersonPOSP') {
      if (event.checked === true) {
        this.AgentForm.controls['IsContactPersonPOSP'].setValue(true)
      } else {
        this.AgentForm.controls['IsContactPersonPOSP'].setValue(false)
      }
    }
  }

  Roles: any[]
  public openDiolog(type: string, title: string) {
    let Rule: IFilterRule[] = [];
    let AdditionalFilters: IAdditionalFilterObject[] = []

    if (type == "ReferenceName") {
      AdditionalFilters.push({ key: 'UserType', filterValues: [UserTypeEnum.StandardUser,UserTypeEnum.Agent,UserTypeEnum.TeamReference] })
    }


    if (type == 'BDOName'){
      Rule = [{
        Field: 'Status',
        Operator: 'eq',
        Value: 1,
      }]
      AdditionalFilters.push({ key: "BDOOnly", filterValues: ["true"] })
      AdditionalFilters.push({ key: "UserType", filterValues: [UserTypeEnum.StandardUser] })

      if (this.AgentForm.get('BranchId').value) {
        AdditionalFilters.push({ key: "Branch", filterValues: [this.AgentForm.get('BranchId').value?.toString()] });
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
      ispopup: true,
      filterData: Rule,
      addFilterData: AdditionalFilters
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        if (type == 'Pincode') {
          this.AgentForm.patchValue({
            CityName: result.CityName,
            StateName: result.StateName,
            CountryName: result.CountryName,
            PinCodeId: result.Id,
            PinCodeNumber: result.PinCode
          })

          this.PinCode.patchValue(result.PinCodeNumber)

        }
        if (type == 'Source') {
          this.AgentForm.patchValue({
            SourceId: result.Id,
            SourceName: result.Name
          })

        }
        if (type == 'SubSource') {
          this.AgentForm.patchValue({
            SubSourceId: result.Id,
            SubSourceName: result.Name
          })

        }
        if (type == 'Bank') {
          this.AgentForm.patchValue({
            BankId: result.Id,
            BankName: result.Name
          })

        }
        if (type == 'Branch') {
          this.AgentForm.patchValue({
            BranchId: result.Id,
            BranchName: result.Name
          })

        }
        if (type == 'RecruitingPerson') {


          this.AgentForm.patchValue({
            RecruitingPersonId: result.Id,
            RecruitingPersonName: result.FullName,

          })

          this._dataService.getDataById(result.Id, this.UserApi).subscribe(res => {
            this.Roles = []
            let role = res.Data.Roles
            role.forEach(element => {
              this.Roles.push(element.RoleName)

            });
          })
        }
        if (type == 'ReferenceName') {
          this.AgentForm.patchValue({
            ReferenceId: result.Id,
            ReferenceName: result.FullName
          })

        }
        if (type == 'BDOName') {
          this.AgentForm.patchValue({
            BDOId: result.Id,
            BDOName: result.FullName,
            BDMId: result.ReportingManagerId,
            BDMName: result.ReportingManagerName,
            VerticalHeadId: result.VHReportingManagerId,
            VerticalHeadName: result.VHReportingManagerName
          })

        }
        if (type == 'BDMName') {
          this.AgentForm.patchValue({
            BDMId: result.Id,
            BDMName: result.FullName
          })

        }
        if (type == 'VerticalHeadName') {
          this.AgentForm.patchValue({
            VerticalHeadId: result.Id,
            VerticalHeadName: result.FullName
          })

        }
      }
    });
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

  private AddAttachment(UploadedeData) {

    let AttachObject: IUserAttachment = new UserAttachmentDto()
    AttachObject.FileName = UploadedeData.FileName
    AttachObject.StorageFileName = UploadedeData.StorageFileName
    AttachObject.StorageFilePath = UploadedeData.StorageFilePath
    AttachObject.Type = "UserPhoto"

    let data = this._initAttchFile(AttachObject)
    this.infFile.push(data)
  }

  // #region getters

  get f() {
    return this.AgentForm.controls
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

  // #endregion getters

  /**
   * #region public methods
   */

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

  public setValue() {
    if (this.AgentForm.get('IsContactPersonPOSP').value == true) {
      this.AgentForm.patchValue({
        TitleOfContactPerson: this.AgentForm.get('Title').value,
        FirstNameOfContactPerson: this.AgentForm.get('FirstName').value,
        LastNameOfContactPerson: this.AgentForm.get('LastName').value,
        PhoneNumberOfContactPerson: this.AgentForm.get('MobileNo').value
      })
    }
    else {
      this.AgentForm.get('TitleOfContactPerson').setValue('')
      this.AgentForm.get('FirstNameOfContactPerson').setValue('')
      this.AgentForm.get('LastNameOfContactPerson').setValue('')
      this.AgentForm.get('PhoneNumberOfContactPerson').setValue('')
    }
  }

  get infFile() {
    return this.AgentForm.controls['AttachmentDetails'] as FormArray;
  }


  public getLanguageList() {

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

    this._dataService.getDataList(querySpec, this.LanguageApi).subscribe((res: any) => {
      this.LanguageList = res?.Data.Items
    })

  }

  // submit or save action
  submitform = () => {

    let LifeStartTotalDays
    let LifeEndTotalDays
    let NonLifeStartTotalDays
    let NonLifeEndTotalDays

    if (this.AgentForm.get('LifeStartDate').value == null && this.AgentForm.get('LifeEndDate').value == null) {
      this.AgentForm.patchValue({
        LifeTrainingStartDate: null
      })
    }

    if (this.AgentForm.get('NonLifeStartDate').value == null && this.AgentForm.get('NonLifeEndDate').value == null) {
      this.AgentForm.patchValue({
        NonLifeTrainingStartDate: null
      })
    }

    else {

      if (this.LifeStartAMPM.value == 'pm') {
        LifeStartTotalDays = this._datePipe.transform(this.AgentForm.getRawValue().LifeStartDate, "yyyy-MM-dd") + "T" + (toNumber(this.LifeStartHours.value) + 12) + ':' + this.LifeStartMinutes.value
      } else {
        LifeStartTotalDays = this._datePipe.transform(this.AgentForm.getRawValue().LifeStartDate, "yyyy-MM-dd") + "T" + this.LifeStartHours.value + ':' + this.LifeStartMinutes.value
      }

      if (this.LifeEndAMPM.value == 'pm') {
        LifeEndTotalDays = this._datePipe.transform(this.AgentForm.getRawValue().LifeEndDate, "yyyy-MM-dd") + "T" + (toNumber(this.LifeEndHours.value) + 12) + ":" + this.LifeEndMinutes.value
      } else {
        LifeEndTotalDays = this._datePipe.transform(this.AgentForm.getRawValue().LifeEndDate, "yyyy-MM-dd") + "T" + this.LifeEndHours.value + ":" + this.LifeEndMinutes.value
      }

      if (this.NonLifeStartAMPM.value == 'pm') {
        NonLifeStartTotalDays = this._datePipe.transform(this.AgentForm.getRawValue().NonLifeStartDate, "yyyy-MM-dd") + "T" + (toNumber(this.NonLifeStartHours.value) + 12) + ":" + this.NonLifeStartMinutes.value
      } else {
        NonLifeStartTotalDays = this._datePipe.transform(this.AgentForm.getRawValue().NonLifeStartDate, "yyyy-MM-dd") + "T" + this.NonLifeStartHours.value + ":" + this.NonLifeStartMinutes.value
      }

      if (this.NonLifeEndAMPM.value == 'pm') {
        NonLifeEndTotalDays = this._datePipe.transform(this.AgentForm.getRawValue().NonLifeEndDate, "yyyy-MM-dd") + "T" + (toNumber(this.NonLifeEndHours.value) + 12) + ":" + this.NonLifeEndMinutes.value
      } else {
        NonLifeEndTotalDays = this._datePipe.transform(this.AgentForm.getRawValue().NonLifeEndDate, "yyyy-MM-dd") + "T" + this.NonLifeEndHours.value + ":" + this.NonLifeEndMinutes.value
      }
    }

    this.AgentForm.patchValue({
      DateOfBirth: this._datePipe.transform(this.AgentForm.getRawValue().DateOfBirth, "yyyy-MM-dd"),
      RegistrationDate: this._datePipe.transform(this.AgentForm.getRawValue().RegistrationDate, "yyyy-MM-dd"),
      LifeTrainingStartDate: LifeStartTotalDays,
      LifeTrainingEndDate: LifeEndTotalDays,
      NonLifeTrainingStartDate: NonLifeStartTotalDays,
      NonLifeTrainingEndDate: NonLifeEndTotalDays,
      ExamDate: this._datePipe.transform(this.AgentForm.getRawValue().ExamDate, "yyyy-MM-dd"),
      CertificateIssuedDate: this._datePipe.transform(this.AgentForm.getRawValue().CertificateIssuedDate, "yyyy-MM-dd"),

    })


    switch (this.mode) {

      case 'Create': case 'ConvertAgent': {
        this._dataService
          .createData(this.AgentForm.value, this.api + '/true')
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
          .updateData(this.AgentForm.value, this.api)
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
    if (this.mode == "ConvertAgent") {
      this._location.back();
    }
    else if (this.mode == 'View' || this.mode == 'Edit') {
      this._router.navigate(['../../'], { relativeTo: this._route })
    } else {
      this._router.navigate(['../'], { relativeTo: this._route })
    }
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
      case 3:
        this.StepThreeSubmit();
        break;
      default:
        break;
    }
  }

  public StepOneSubmit(): any {
    this.alerts = [];

    if (this.AgentForm.get('Title').value == '') {
      this.alerts.push({
        Message: 'Enter Your Title',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('FirstName').invalid) {
      this.alerts.push({
        Message: 'Enter Your First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('LastName').invalid) {
      this.alerts.push({
        Message: 'Enter Your Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('Gender').value == '') {
      this.alerts.push({
        Message: 'Enter Your Gender',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('PreferredLanguage').value == '' || this.AgentForm.get('PreferredLanguage').value == null) {
      this.alerts.push({
        Message: 'Enter Your Preferred Language',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('RegistrationDate').value == '' || this.AgentForm.get('RegistrationDate').value == null) {
      this.alerts.push({
        Message: 'Enter Your Registration Date',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('DateOfBirth').value == '' || this.AgentForm.get('DateOfBirth').value == null) {
      this.alerts.push({
        Message: 'Enter Your Date Of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('MobileNo').value == '' || this.AgentForm.get('MobileNo').value == null) {
      this.alerts.push({
        Message: 'Enter Your Mobile No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('MobileNo').value != '' && this.AgentForm.get('MobileNo').value != null) {
      if (!this.phoneNum.test(this.AgentForm.get('MobileNo').value)) {
        this.alerts.push({
          Message: 'Mobile Number must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
    
    if (this.AgentForm.get('WhatsAppNo').value == '' || this.AgentForm.get('WhatsAppNo').value == null) {
      this.alerts.push({
        Message: 'Enter Your Mobile No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('WhatsAppNo').value != '' && this.AgentForm.get('WhatsAppNo').value != null) {
      if (!this.phoneNum.test(this.AgentForm.get('WhatsAppNo').value)) {
        this.alerts.push({
          Message: 'WhatsApp No must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.AgentForm.get('EmailId').invalid) {
      {
        this.alerts.push({
          Message: 'Enter Your Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.AgentForm.get('EmailId').value != '') {
      if (!this.emailValidationReg.test(this.AgentForm.get('EmailId').value)) {
        this.alerts.push({
          Message: 'Enter Valid Email',
          CanDismiss: false,
          AutoClose: false,
        });
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
  public StepTwoSubmit(): any { }

  // Step3 Validation
  public StepThreeSubmit(): any {
    this.alertsThree = [];

    if (this.AgentForm.get('Address').invalid) {
      this.alertsThree.push({
        Message: 'Enter Your Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('PinCodeNumber').value == '') {
      this.alertsThree.push({
        Message: 'Enter Your Pin Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('CityName').value == '') {
      this.alertsThree.push({
        Message: 'Enter Your City Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('StateName').value == '') {
      this.alertsThree.push({
        Message: 'Enter Your State Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('CountryName').value == '') {
      this.alertsThree.push({
        Message: 'Select Your Country Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }




    if (this.alertsThree.length > 0) {
      this.step3.setErrors({ required: true });
      return this.step3;
    } else {
      this.step3.reset();
      return this.step3;
    }

  }

  StepThreeError() {
    if (this.alertsThree.length > 0) {
      this._alertservice.raiseErrors(this.alertsThree);
    }
  }

  // Step4 validation
  public StepFourSubmit(): any {
    this.alertsFour = [];

    if (this.AgentForm.get('PANNumber').invalid) {

      this.alertsFour.push({
        Message: 'Enter Your PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('PANNumber').value != '') {
      if (!this.PANNum.test(this.AgentForm.get('PANNumber').value)) {
        this.alertsFour.push({
          Message: 'Enter Valid PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.AgentForm.get('AadharNumber').value !== '') {
      if (!this.AadharNum.test(this.AgentForm.get('AadharNumber').value)) {
        this.alertsFour.push({
          Message: 'Enter Valid Aadhar',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }


    if (this.alertsFour.length > 0) {
      this.step4.setErrors({ required: true });
      return this.step4;
    } else {
      this.step4.reset();
      return this.step4;
    }

  }

  StepFourError() {
    if (this.alertsFour.length > 0) {
      this._alertservice.raiseErrors(this.alertsFour);
    }
  }

  // StepFive Validation
  public StepFiveSubmit(): any {
    this.alertsFive = [];

    if (this.AgentForm.get('NameAsPerBank').invalid) {
      this.alertsFive.push({
        Message: 'Enter Your Name As Per Bank',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('BankName').invalid) {
      this.alertsFive.push({
        Message: 'Enter Your Bank Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('AccountNumber').value == '') {
      this.alertsFive.push({
        Message: ' Enter Your Account Number',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('IFSCCode').value == '') {
      this.alertsFive.push({
        Message: ' Enter Your IFSC Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.alertsFive.length > 0) {
      this.step5.setErrors({ required: true });
      return this.step5;
    } else {
      this.step5.reset();
      return this.step5;
    }
  }

  StepFiveError() {
    if (this.alertsFive.length > 0) {
      this._alertservice.raiseErrors(this.alertsFive);
    }
  }

  // StepSix Validation

  public StepSixSubmit(): any {
    this.alertsSix = [];

    if (this.AgentForm.get('BranchName').value == '') {
      this.alertsSix.push({
        Message: 'Enter Your Branch Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('BDOName').value == '') {
      this.alertsSix.push({
        Message: 'Enter Your BDO',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('BDMName').value == '') {
      this.alertsSix.push({
        Message: ' Enter Your BDM Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('VerticalHeadName').value == '') {
      this.alertsSix.push({
        Message: 'Enter Your Vertical Head Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.AgentForm.get('RecruitingPersonName').value == '') {
      this.alertsSix.push({
        Message: 'Enter Your Recruiting Person Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.alertsSix.length > 0) {
      this.step6.setErrors({ required: true })
      return this.step6;
    } else {
      this.step6.reset();
      return this.step6;
    }
  }

  StepSixError() {
    if (this.alertsSix.length > 0) {
      this._alertservice.raiseErrors(this.alertsSix)
    }
  }

  // StepSeven validation
  public StepSevenSubmit(): any {
    this.alertsSeven = [];

    if (this.AgentForm.get('UserName').invalid) {
      this.alertsSeven.push({
        Message: 'Enter Your User Name',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.AgentForm.get('Password').invalid) {
      if (this.mode == 'Create')
        this.alertsSeven.push({
          Message: 'Enter Your Password',
          CanDismiss: false,
          AutoClose: false,
        })
    }

    if (this.alertsSeven.length > 0) {
      this.step7.setErrors({ required: true });
      return this.step7;
    } else {
      this.step7.reset();
      return this.step7;
    }
  }

  StepSevenError() {
    if (this.alertsSeven.length > 0) {
      this._alertservice.raiseErrors(this.alertsSeven)
    }
  }

  // StepEight Validation
  public StepEightSubmit(): any {
    this.alertsEight = [];

    if (this.alertsEight.length > 0) {
      this.step8.setErrors({ required: true });
      return this.step8;
    } else {
      this.step8.reset();
      return this.step8;
    }
  }

  StepEightError() {
    if (this.alertsEight.length > 0) {
      this._alertservice.raiseErrors(this.alertsEight)
    }
  }



  // Autocomplete

  SourceSelected(event: MatAutocompleteSelectedEvent): void {
    this.AgentForm.patchValue({
      SourceId: event.option.value.Id,
      SourceName: event.option.value.Name
    });
  }

  SubSourceSelected(event: MatAutocompleteSelectedEvent): void {
    this.AgentForm.patchValue({
      SubSourceId: event.option.value.Id,
      SubSourceName: event.option.value.Name
    });
  }

  PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.AgentForm.patchValue({
      CityName: event.option.value.CityName,
      StateName: event.option.value.StateName,
      CountryName: event.option.value.CountryName,
      PinCodeId: event.option.value.Id,
      PinCodeNumber: event.option.value.PinCode,
    });
    this.PinCode.patchValue(event.option.value.PinCodeNumber);
  }

  BankSelected(event: MatAutocompleteSelectedEvent): void {
    this.AgentForm.patchValue({
      BankId: event.option.value.Id,
      BankName: event.option.value.Name
    });
  }

  ReferenceSelected(event: MatAutocompleteSelectedEvent): void {
    this.AgentForm.patchValue({
      ReferenceId: event.option.value.Id,
      ReferenceName: event.option.value.FullName
    });
  }

  BranchSelected(event: MatAutocompleteSelectedEvent): void {
    this.AgentForm.patchValue({
      BranchId: event.option.value.Id,
      BranchName: event.option.value.Name
    });
  }

  CRESelected(event: MatAutocompleteSelectedEvent): void {
    this.AgentForm.patchValue({
      BDOId: event.option.value.Id,
      BDOName: event.option.value.FullName,
      BDMId: event.option.value.ReportingManagerId,
      BDMName: event.option.value.ReportingManagerName,
      VerticalHeadId: event.option.value.VHReportingManagerId,
      VerticalHeadName: event.option.value.VHReportingManagerName
    });
  }

  CRMSelected(event: MatAutocompleteSelectedEvent): void {
    this.AgentForm.patchValue({
      BDMId: event.option.value.Id,
      BDMName: event.option.value.FullName
    });
  }

  VerticalHeadSelected(event: MatAutocompleteSelectedEvent): void {
    this.AgentForm.patchValue({
      VerticalHeadId: event.option.value.Id,
      VerticalHeadName: event.option.value.FullName
    });
  }

  RecruitingPersonSelected(event: MatAutocompleteSelectedEvent): void {
    this.AgentForm.patchValue({
      RecruitingPersonId: event.option.value.Id,
      RecruitingPersonName: event.option.value.FullName,
    });
    this._dataService.getDataById(event.option.value.Id, this.UserApi).subscribe(res => {
      this.Roles = []
      let role = res.Data.Roles
      role.forEach(element => {
        this.Roles.push(element.RoleName)

      });
    })
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
      const row: IAgentDocumentDto = new AgentDocumentDto();
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

  // #region private methods

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
    const LifeHours = (LEH - LSH) * 60
    const NonLifeHours = (NEH - NSH) * 60
    const LifeMinutes = toNumber(this.LifeEndMinutes.value) - toNumber(this.LifeStartMinutes.value)
    const NonLifeMinutes = toNumber(this.NonLifeEndMinutes.value) - toNumber(this.NonLifeStartMinutes.value)

    const lifestart = moment(this._datePipe.transform(this.AgentForm.getRawValue().LifeStartDate, "yyyy-MM-dd"))
    const lifeend = moment(this._datePipe.transform(this.AgentForm.getRawValue().LifeEndDate, "yyyy-MM-dd"))
    const nonlifestart = moment(this._datePipe.transform(this.AgentForm.getRawValue().NonLifeStartDate, "yyyy-MM-dd"))
    const nonlifeend = moment(this._datePipe.transform(this.AgentForm.getRawValue().NonLifeEndDate, "yyyy-MM-dd"))
    const lifetotal = lifeend.diff(lifestart, 'days') + 1;
    const nonlifetotal = nonlifeend.diff(nonlifestart, 'days') + 1;

    const TotalLifeHours = LifeHours * lifetotal
    const TotalNonLifeHours = NonLifeHours * nonlifetotal
    const TotalLifeMinutes = LifeMinutes * lifetotal
    const TotalNonLifeMinutes = NonLifeMinutes * nonlifetotal

    const TotalLifeTimeInHours = (TotalLifeHours + TotalLifeMinutes) / 60
    const TotalNonLifeTimeInHours = (TotalNonLifeHours + TotalNonLifeMinutes) / 60




    if (TotalLifeTimeInHours > 0) {
      this.AgentForm.patchValue({
        LifeTrainingHours: TotalLifeTimeInHours
      })
    }else{
      this.AgentForm.patchValue({
        LifeTrainingHours: 0
      })
    }

    if (TotalNonLifeTimeInHours > 0) {
      this.AgentForm.patchValue({
        NonLifeTrainingHours: TotalNonLifeTimeInHours
      })
    }else{
      this.AgentForm.patchValue({
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
    this.agentForm = data['data'];
    if (data['data'].LifeTrainingStartDate == null && data['data'].LifeTrainingEndDate == null && data['data'].NonLifeTrainingStartDate == null && data['data'].NonLifeTrainingEndDate == null) {

      this.LifeStartMinutes.setValue('00');
      this.LifeEndMinutes.setValue('00');
      this.NonLifeStartMinutes.setValue('00');
      this.NonLifeEndMinutes.setValue('00');
      this.LifeStartHours.setValue('01')
      this.LifeEndHours.setValue('01');
      this.NonLifeStartHours.setValue('01');
      this.NonLifeEndHours.setValue('01')
      this.LifeStartAMPM.setValue('am');
      this.LifeEndAMPM.setValue('am');
      this.NonLifeStartAMPM.setValue('am');
      this.NonLifeEndAMPM.setValue('am');

    }
    else {
      this.agentForm.LifeStartDate = data['data'].LifeTrainingStartDate.split('T')[0];
      this.agentForm.LifeEndDate = data['data'].LifeTrainingEndDate.split('T')[0];
      this.agentForm.NonLifeStartDate = data['data'].NonLifeTrainingStartDate.split('T')[0];
      this.agentForm.NonLifeEndDate = data['data'].NonLifeTrainingEndDate.split('T')[0];
      this.LifeStartMinutes.setValue((data['data'].LifeTrainingStartDate.split('T')[1]).split(':')[1]);
      this.LifeEndMinutes.setValue((data['data'].LifeTrainingEndDate.split('T')[1]).split(':')[1]);
      this.NonLifeStartMinutes.setValue((data['data'].NonLifeTrainingStartDate.split('T')[1]).split(':')[1]);
      this.NonLifeEndMinutes.setValue((data['data'].NonLifeTrainingEndDate.split('T')[1]).split(':')[1]);
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


    }
  }

  private _onFormChanges() {
    this.AgentForm.get('SourceName').valueChanges.subscribe((val) => {
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



    this.AgentForm.get('SubSourceName').valueChanges.subscribe((val) => {
      this.SubSources$ = this._MasterListService.getFilteredSubSourceList(val).pipe(
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

    this.AgentForm.get('PinCodeNumber').valueChanges.subscribe((val) => {
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


    this.AgentForm.get('BankName').valueChanges.subscribe((val) => {
      this.Banks$ = this._MasterListService.getFilteredBankList(val).pipe(
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

     // Reference Name
    this.AgentForm.get('ReferenceName').valueChanges.subscribe((val) => {
    
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

    // this.AgentForm.get('ReferenceName').valueChanges.subscribe((val) => {
    //   this.References$ = this._MasterListService.getFilteredReferenceList(val).pipe(
    //     takeUntil(this.destroy$),
    //     switchMap((res) => {
    //       if (res.Success) {
    //         if (res.Data.Items.length) {
    //           let result = Array.from(
    //             res.Data.Items.reduce(
    //               (m, t) => m.set(t.FullName, t),
    //               new Map()
    //             ).values()
    //           );
    //           result = result.filter((el) => {
    //             if (el.FullName) {
    //               return el;
    //             }
    //           });
    //           return of(result);
    //         } else {
    //           return of([]);
    //         }
    //       } else {
    //         return of([]);
    //       }
    //     })
    //   );
    // });

    this.AgentForm.get('BranchId').valueChanges.subscribe((val) => {
      this.AgentForm.patchValue({
        BDOId: null,
        BDOName: null,
        BDMId: null,
        BDMName: null,
        VerticalHeadId: null,
        VerticalHeadName: null
      },{emitEvent:false});
    });

    this.AgentForm.get('BDOName').valueChanges.subscribe((val) => {

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

      if (this.AgentForm.get('BranchId').value) {
        BDONameAdditionalFilters.push({ key: "Branch", filterValues: [this.AgentForm.get('BranchId').value?.toString()] });
      }

      this.CREs$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', ActiveMasterData, BDONameAdditionalFilters).pipe(
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


    // this.AgentForm.get('BDMName').valueChanges.subscribe((val) => {
    //   this.CRMs$ = this._MasterListService.getFilteredCRMList(val).pipe(
    //     takeUntil(this.destroy$),
    //     switchMap((res) => {
    //       if (res.Success) {
    //         if (res.Data.Items.length) {
    //           return of(res.Data.Items);
    //         } else {
    //           return of([]);
    //         }
    //       } else {
    //         return of([]);
    //       }
    //     })
    //   );
    // });

    // this.AgentForm.get('VerticalHeadName').valueChanges.subscribe((val) => {
    //   this.VerticalHeads$ = this._MasterListService.getFilteredVerticalHeadList(val).pipe(
    //     takeUntil(this.destroy$),
    //     switchMap((res) => {
    //       if (res.Success) {
    //         if (res.Data.Items.length) {
    //           return of(res.Data.Items);
    //         } else {
    //           return of([]);
    //         }
    //       } else {
    //         return of([]);
    //       }
    //     })
    //   );
    // });

    this.AgentForm.get('RecruitingPersonName').valueChanges.subscribe((val) => {
      this.RecruitingPersons$ = this._MasterListService.getFilteredRecruitingPersonList(val).pipe(
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

    this.AgentForm.get('DefalutCP').valueChanges.subscribe((val) => {

      if (val) {
        this.AgentForm.patchValue({
          ODNet: false,
          TP: false,
          Terrorism: false,
          StampDuty: false,
        })
      } else {
        this.AgentForm.patchValue({
          ODNet: true,
          TP: true,
          Terrorism: true,
          StampDuty: true,
        })
      }

    });
    
    this.AgentForm.get('IsExperianced').valueChanges.subscribe((val) => {
        this.AgentForm.patchValue({
          InsCompanyCode: null,
          YearOfExperiance: null,
        })

      if (val == true || val == 'true'){
        this.f['InsCompanyCode'].setValidators([Validators.required])
      }else{
        this.f['InsCompanyCode'].clearValidators()
      }
      this.f['InsCompanyCode'].updateValueAndValidity()
      this.cdr.detectChanges();
    });

    if (this.mode == "Create") {
      this.AgentForm.get('Title').patchValue("Mr");
    }

  }


  private _fillMasterList() {
    this.GenderList = [];
    this.GenderList.push({ Name: "Male" });
    this.GenderList.push({ Name: "Female" });


    // fill Branch
        this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List, 'Name', "", [ActiveMasterDataRule])
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


  // details from health form
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  private _init(agentData: AgentDto, mode: string): FormGroup {
    this.AgentForm = this._fb.group({
      Id: [0],
      agentOnBoardId: [0],
      Title: ['', [Validators.required]],
      FirstName: ['', [Validators.required, Validators.maxLength(120), this.noWhitespaceValidator]],
      MiddleName: [''],
      LastName: ['', [Validators.required, Validators.maxLength(120), this.noWhitespaceValidator]],
      Gender: [0, [Validators.required]],
      SourceId: [0],
      SourceName: ['', [Validators.maxLength(120)]],
      SubSourceId: [0],
      SubSourceName: ['', [Validators.maxLength(120)]],
      DateOfBirth: ['', [Validators.required]],
      RegistrationDate: ['', [Validators.required]],
      PreferredLanguage: [0, [Validators.required, Validators.maxLength(256)]],
      MobileNo: ['', [Validators.required]],
      WhatsAppNo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      EmailId: ['', [Validators.required, this.noWhitespaceValidator, Validators.maxLength(60)]],
      Address: ['', [Validators.required, Validators.maxLength(1024), this.noWhitespaceValidator]],
      PinCodeId: [0],
      PinCodeNumber: ['', [Validators.required]],
      CityName: ['', [Validators.required]],
      StateName: ['', [Validators.required]],
      CountryName: ['', [Validators.required]],
      IsContactPersonPOSP: [false],
      TitleOfContactPerson: ['',],
      FirstNameOfContactPerson: ['', [Validators.maxLength(120)]],
      MiddleNameOfContactPerson: [''],
      LastNameOfContactPerson: ['', [Validators.maxLength(120)]],
      PhoneNumberOfContactPerson: [''],
      PANNumber: ['', [Validators.required, Validators.maxLength(15), this.noWhitespaceValidator]],
      AadharNumber: ['', [Validators.maxLength(15)]],
      BankId: [0, [Validators.required]],
      BankName: ['', [Validators.required]],
      NameAsPerBank: ['', [Validators.required, Validators.maxLength(120), this.noWhitespaceValidator]],
      AccountNumber: ['', [Validators.required, Validators.maxLength(20)]],
      IFSCCode: ['', [Validators.required, this.noWhitespaceValidator, Validators.maxLength(20)]],
      BranchId: [0, [Validators.required]],
      BranchName: [''],
      RecruitingPersonId: [0],
      RecruitingPersonName: ['', [Validators.required]],
      ReferenceId: [0],
      ReferenceName: ['',],
      ReferenceContactNo: ['', [Validators.minLength(10), Validators.maxLength(10)]],
      BDOId: [0],
      BDOName: ['', [Validators.required]],
      BDMId: [0],
      BDMName: ['', [Validators.required]],
      VerticalHeadId: [0],
      VerticalHeadName: ['', [Validators.required]],
      LifeTrainingStartDate: [null, []],
      LifeTrainingEndDate: [null, []],
      LifeTrainingHours: [0],
      NonLifeTrainingStartDate: [null, []],
      NonLifeTrainingEndDate: [null, []],
      NonLifeTrainingHours: [0],
      ExamDate: [''],
      IsCertificateIssued: [false],
      CertificateIssuedDate: [''],
      UserName: ['', [Validators.required, this.noWhitespaceValidator, Validators.maxLength(30)]],
      Password: ['', [Validators.required, this.noWhitespaceValidator, Validators.maxLength(20)]],
      Status: [1],
      StatusYN: [''],
      LifeStartDate: [null],
      LifeEndDate: [null],
      NonLifeStartDate: [null],
      NonLifeEndDate: [null],
      DefalutCP: [true],
      ODNet: [false],
      TP: [false],
      Terrorism: [false],
      StampDuty: [false],
      YearOfExperiance: [],
      InsCompanyCode: [],
      IsExperianced: [false],

      AttachmentDetails: this._buildAgentFormArray(agentData.AttachmentDetails, "Attachment"),
      Documents: this._buildAgentFormArray(agentData.Documents, "Document")
    });




    if (agentData) {
      this.AgentForm.patchValue(agentData);
    }

    this.AgentForm.patchValue({
      LifeStartDate: agentData.LifeTrainingStartDate,
      LifeEndDate: agentData.LifeTrainingEndDate,
      NonLifeStartDate: agentData.NonLifeTrainingStartDate,
      NonLifeEndDate: agentData.NonLifeTrainingEndDate
    });

    if (mode == "View") {
      this.AgentForm.disable();
      this.TotalTrainingHours.disable();
    }

    this.f['CityName'].disable();
    this.f['StateName'].disable();
    this.f['CountryName'].disable();
    this.f['CertificateIssuedDate'].disable();
    if (this.AgentForm.controls['IsCertificateIssued'].value === true) {
      this.f['CertificateIssuedDate'].enable();
    }
    return this.AgentForm;
  }

  private _buildAgentFormArray(items: any = [], type: string): FormArray {

    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0) && this.mode !== "View") {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {

          if (type == "Attachment") {
            formArray.push(this._initAttchFile(i));
          }
          
          if (type == "Document") {
            formArray.push(this._initDocument(i));
          }

        });
      }
    }

    return formArray;
  }

  private _initAttchFile(item: any = null): FormGroup {
    let fg = this._fb.group({
      Id: [0],
      AttachmentId: [0],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: [""],
      Description: [""],
      Type: [""],
      Number: [""],
      IsDefault: [true],
      Deleted: [false]
    });
    if (item != null) {
      if (!item) {
        item = new AttachmentDetailsDto();
      }

      if (item) {
        fg.patchValue(item);
      }
    }
    return fg;
  }
  
  private _initDocument(item: any = null): FormGroup {
    let fg = this._fb.group({
      Id: [0],
      AgentId: [0],
      DocumentType: [],
      DocumentTypeName: [],
      DocumentNo: [],
      Remarks: [],
      FileName: ['',[Validators.required]],
      StorageFileName: [],
      StorageFilePath: ['', [Validators.required]],
    });
      if (item) {
        fg.patchValue(item);
      }
    return fg;
  }
  // #endregion private methods


}


