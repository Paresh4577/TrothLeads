import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Alert, IAdditionalFilterObject, IFilterRule, OrderBySpecs, QuerySpecs } from '@models/common';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { IUserDto } from '@models/dtos/core/userDto';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { dropdown } from '@config/dropdown.config';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TravelDocumentsDto, ITravelRaiseDTO, TravelMemberDTO, TravelRaiseDTO } from '@models/dtos';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { AuthService } from '@services/auth/auth.service';
import { DialogService } from '@lib/services/dialog.service';
import { RfqTravelService } from '../rfq-travel-service';
import { TravelCoverageDto, ITravelCoverageDto } from '@models/dtos';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { CategoryCodeEnum, SalesPersonTypeEnum, SubCategoryCodeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { environment } from 'src/environments/environment';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { ROUTING_PATH } from '@config/routingPath.config';
import { TravelPolicyType, TravelRenewalPolicyType } from '@config/rfq';
import { TravelCategoryType } from '@config/rfq';
import { ValidationRegex } from '@config/validationRegex.config';
import { ICityPincodeDto } from '@models/dtos/core';
import * as moment from 'moment';
import { RFQDocumentsDrpList } from '@config/rfq';

const ActiveMasterDataRule: IFilterRule = {
  Field: 'Status',
  Operator: 'eq',
  Value: 1
}

@Component({
  selector: 'gnx-travel-raise',
  templateUrl: './travel-raise.component.html',
  styleUrls: ['./travel-raise.component.scss'],
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

export class TravelRaiseComponent {
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  //Variables
  pagetitle: string; // Page main header title
  mode: string; // for identify of Raise page is create or edit
  maxDate // Set Max date 
  currentDate // Set current date 
  maxBirthDate: Date; // Max birth date validation
  ProposerName: string;
  isExpand: boolean = false;
  BDOlist$: Observable<IUserDto[]>;
  BDMlist$: Observable<IUserDto[]>;
  UserProfileObj: IMyProfile;
  DisplayForm: any;

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // declare validation Regex
  phoneNum: RegExp = ValidationRegex.phoneNumReg;
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;

  // declare Alert Array List
  BasicDetailsAlert: Alert[] = [];
  ProductCategoryDetailsAlert: Alert[] = [];
  DocumentAttachmentAlert: Alert[] = [];
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  TeamDetailsAlerts: Alert[] = [];

  // declare form control
  BasicDetailsStepCtrl = new FormControl(); // Step 1 Control
  ProductCategoryDetailsStepCtrl = new FormControl();
  DocumentAttachmentStepCtrl = new FormControl()
  TeamDetailsStepCtrl = new FormControl(); // Step 5 Control

  // Observable List
  TeamRefUser$: Observable<IUserDto[]>;
  salesPersonName$: Observable<IUserDto[]> // Observable of user list
  pincodes$: Observable<ICityPincodeDto[]>; // observable of pincode list

  DropdownMaster: dropdown;
  //FormGroup 
  RFQTravelForm !: FormGroup;
  RFQTravel: ITravelRaiseDTO
  destroy$: Subject<any>;



  //List objects
  Branchs: IBranchDto[] = [];
  InsuranceCompany: IInsuranceCompanyDto[];
  SubCategoryList = [];

  //#region  constructor
  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public dialog: MatDialog,
    public _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _MasterListService: MasterListService,
    private _datePipe: DatePipe,
    private authService: AuthService,
    private _dialogService: DialogService,
    private _RFQTravelService: RfqTravelService,
    private _Location: Location,
  ) {
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();

    // set current date in MaxDate variable
    this.maxDate = new Date(Date.now());

    // set current date in CurrentDate variable
    this.currentDate = new Date(Date.now());

    // Set max birthdate is before three month of current date
    this.maxBirthDate = new Date(Date.now());
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);

  }
  //#endregion constructor


  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    this.RFQTravel = new TravelRaiseDTO();

    // Route params data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title'];
    this.mode = data['mode'];

    this.DisplayForm = data['data'];

    // in case of Edit and View mode then 
    if (this.mode == "edit" || this.mode == "view" || this.mode == "RenewalRFQ") {
      this.RFQTravel = data['data'];
    }

    // build travel form
    this.RFQTravelForm = this._buildForm(this.RFQTravel);

    // set sales person info
    // this._salesPersonInfo()

    // in case of view mode then all form value is disabled mode
    if (this.mode == "view") {
      this.RFQTravelForm.disable()
    }

    if (this.RFQTravelForm.get("Members").value.length <= 0) {
      // Add By defualt documet 
      for (let i = 0; i < 1; i++) {
        this.addMemberDetails();
      }
    }

    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.UserProfileObj = user
      }
    })

    // in case of view mode then all form value is disabled mode
    if (this.mode == "view") {
      this.RFQTravelForm.disable({ emitEvent: false });
      this.isExpand = true;
    }

    this._fillMasterList()
    this._onFormChange();
  }

  // get sub category enum list
  get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum
  }

  // get travel category type
  get TravelCategoryType() {
    return TravelCategoryType
  }

  // Document Type List
  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Travel))
  }

  // get uploaded documents
  get Documents() {
    return this.RFQTravelForm.controls["Documents"] as FormArray;
  }

  // get Member details
  get Members() {

    return this.RFQTravelForm.controls["Members"] as FormArray;
  }

  // get travel policy type
  get TravelPolicyType() {
    if (this.RFQTravel?.TransactionId) {
      return TravelRenewalPolicyType;
    }
    else {
      return TravelPolicyType;
    }
  }

  /**
   * Only editable in login user is standard user & Sales person type is POSP
   */
  get canEditableSalesPerson() {
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser && this.mode != 'view') {
      if (this.RFQTravelForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
 * Only editable in login user is standard user & Sales person type is Direct
 */
  get canEditableBdoBdm() {
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser) {
      if (this.RFQTravelForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Branch ANd sales person is editable only in login user is Standard User
   */
  get CanEditableSalespersonTypeAndBranch() {
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser) {
      return true;
    } else {
      return false;
    }
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public ExpandCollaps() {
    this.isExpand = !this.isExpand;
  }

  public SubmitRfqTravel() {

    if (this.BasicDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.BasicDetailsAlert);
      return;
    }

    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
      return;
    }

    if (this.TeamDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.TeamDetailsAlerts);
      return;
    }

    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }

    this._dateFormat();

    // submit form
    switch (this.mode) {
      case "create": case "RenewalRFQ":
        this._RFQTravelService.CreateProposal(this.RFQTravelForm.value).subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message, "false")
            this._router.navigate([ROUTING_PATH.Basic.Dashboard])
          }
          else {
            if (res.Alerts && res.Alerts?.length > 0) {
              this._alertservice.raiseErrors(res.Alerts)
            }
            else {
              this._alertservice.raiseErrorAlert(res.Message)
            }
          }
        })
        break;

      case "edit":
        this._RFQTravelService.UpdateProposal(this.RFQTravelForm.value).subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message, "false")
            this._router.navigate([ROUTING_PATH.Basic.Dashboard])
          }
          else {
            if (res.Alerts && res.Alerts?.length > 0) {
              this._alertservice.raiseErrors(res.Alerts)
            }
            else {
              this._alertservice.raiseErrorAlert(res.Message)
            }
          }
        })
        break;
    }
  }

  // back button
  public backButton() {
    this._Location.back();
  }

  public AutocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, SelectedFor: string): void {

    switch (SelectedFor) {

      case "TeamRef":
        this.RFQTravelForm.patchValue({
          TeamReferenceId: event.option.value.Id,
          TeamReferenceName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        });
        break;

      case "PINcode":
        this.RFQTravelForm.patchValue({
          PincodeId: event.option.value.Id,
          Pincode: event.option.value.PinCode,
          CityId: event.option.value.CityId,
          CityName: event.option.value.CityName
        });
        break;

      case "Sales":
        this.RFQTravelForm.patchValue({
          SalesPersonId: event.option.value.Id,
          SalesPersonName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        })
        break;

      case "BDMName":
        this.RFQTravelForm.patchValue({
          BDMName: event.option.value.FullName,
          BDMId: event.option.value.Id,
        });
        break;

      case "BDOName":
        this.RFQTravelForm.patchValue({
          BDOName: event.option.value.FullName,
          BDOId: event.option.value.Id,
        });
        break;

      default:
        break;
    }
  }

  // /* Pop Up for Name of the Insurance Company
  //  * @param type:to identify api of which list is to be called
  //   * @param title: title that will be displayed on PopUp
  //   * /
  public openDiolog(type: string, title: string, openFor: string) {
    let specs = new QuerySpecs();


    switch (openFor) {

      case "Sales":
        specs = this._salesPersonListAPIfilter();
        break;

      case "TeamRef":
        specs = this._teamReferenceListAPIfilter();
        break;

      case "BDOName":
        specs = this._bdoListAPIfilter();
        break;

      case "BDMName":
        specs = this._bdmListAPIfilter();
        break;

      default:
        break;
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
      filterData: specs.FilterConditions.Rules,
      addFilterData: specs.AdditionalFilters

    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        switch (openFor) {

          case "Sales":
            this.RFQTravelForm.patchValue({
              SalesPersonId: result.Id,
              SalesPersonName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "TeamRef":
            this.RFQTravelForm.patchValue({
              TeamReferenceId: result.Id,
              TeamReferenceName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "BDMName":
            this.RFQTravelForm.patchValue({
              BDMName: result.FullName,
              BDMId: result.Id,
            });
            break;

          case "BDOName":
            this.RFQTravelForm.patchValue({
              BDOName: result.FullName,
              BDOId: result.Id,
            });
            break;

          default:
            break;
        }
      }

    })
  }

  public clear(name: string, id: string): void {
    this.RFQTravelForm.controls[name].setValue("")
    this.RFQTravelForm.controls[id].setValue(null)
  }

  /**
   * Document Selection Change
  */
  public onDocumentSelectionChange(selectedValue): void {
    this._validateAttachDocField()

    if (this.AttachDocumentAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachDocumentAlerts)
      this.DocumentDropdown.nativeElement.value = ""
      return;
    }

    let selectedDocument = selectedValue.target.value;
    this.addDocuments(selectedDocument);
    this.DocumentDropdown.nativeElement.value = ""
  }

  /**
   * Validate the Attached Document
  */
  private _validateAttachDocField() {
    this.AttachDocumentAlerts = []
    this.Documents.controls.forEach((element, index) => {
      if (element.get('StorageFilePath').hasError('required')) {
        this.AttachDocumentAlerts.push({
          Message: `${element.value.DocumentType} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });
  }

  /**
   * Add new row in Document array
  */
  public addDocuments(selectedDocument?: string) {
    const row: TravelDocumentsDto = new TravelDocumentsDto();
    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.PolicyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.PolicyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.PolicyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = "RFQRaised";
        this.Documents.push(this._initDocumentsForm(row));
      }
    }
  }

  /**
 * File Data (policy document that is added)
*/
  public SelectDocuments(event, DocIndex: number) {
    let file = event.target.files[0]

    if (file) {
      this._dataService.UploadFile(this.UploadFileAPI, file).subscribe((res) => {
        if (res.Success) {
          if (DocIndex >= 0) {
            this.Documents.controls[DocIndex].patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: "RFQRaised"
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
  public ViewDocuments(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  /**
   * Delete document With User Confirmation
   */
  public RemoveDocuments(index: number) {
    this._dialogService.confirmDialog({
      title: 'Are You Sure?',
      message: "You won't be able to revert this",
      confirmText: 'Yes, Delete!',
      cancelText: 'No',
    })
      .subscribe((res) => {
        if (res) {
          this.Documents.removeAt(index)
        }
      });
  }

  public DocumentAttachmentValidation() {
    this.DocumentAttachmentAlert = []

    this.Documents.controls.forEach((item, index) => {
      if (item.get('FileName').hasError('required') || item.get('StorageFilePath').hasError('required')) {
        this.DocumentAttachmentAlert.push({
          Message: `${item.value.DocumentTypeName} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

    })

    if (this.DocumentAttachmentAlert.length > 0) {
      this.DocumentAttachmentStepCtrl.setErrors({ required: true });
      return this.DocumentAttachmentStepCtrl;
    }
    else {
      this.DocumentAttachmentStepCtrl.reset();
      return this.DocumentAttachmentStepCtrl;
    }

  }

  // PopUp for Pincode Selection
  public openDiologPincode(type: string, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '44vw';
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
        if (type == 'Pincode') {
          this.RFQTravelForm.patchValue({
            Pincode: result.PinCode,
            PincodeId: result.Id,
          });
        }
      }
    });
  }

  // autocomplete for PinCode and also binding value of cityName & cityId
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.RFQTravelForm.patchValue({
      Pincode: event.option.value.PinCode,
      PincodeId: event.option.value.Id,
    });
  }

  // remove cheque details 
  public removeChequeDetails(rowNo: number) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.Members.removeAt(rowNo);
        }

      });

  }

  // add member row
  public addMemberDetails() {

    this.TravelDetailValidation()

    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
      return;
    }
    else {
      var row: TravelMemberDTO = new TravelMemberDTO()
      row.RFQId = this.RFQTravelForm.get("Id").value;
      this.Members.push(this._initMemberForm(row))
    }
  }

  // calculate age base on DOB
  public changeTravellerDOB(event, rowNo: number) {
    if (event.target.value != "" && event.target.value != null) {
      // let TravellerAge = moment.duration(moment().diff(event.target.value));
      // this.Members.controls[rowNo].patchValue({
      //   Age: TravellerAge.years()
      // })

      let BirthDate = this._datePipe.transform(event.target.value, 'yyyy-MM-dd');
      let TravellerAge = moment.duration(moment().diff(BirthDate));
      this.Members.controls[rowNo].patchValue({
        Age: `${TravellerAge.years()}Yr ${TravellerAge.months()}M ${TravellerAge.days()}D`
      })
    } else {
      this.Members.controls[rowNo].patchValue({
        Age: ""
      })
    }
  }

  /**
   * Validation part 
   */

  public BasicDetailsValidations() {
    this.BasicDetailsAlert = []

    if (this.RFQTravelForm.get('SubCategoryId').value == 0 || this.RFQTravelForm.get('SubCategoryId').value == null) {
      this.BasicDetailsAlert.push({
        Message: 'Select Poduct Sub Category',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQTravelForm.get('PolicyType').hasError('required')) {
      this.BasicDetailsAlert.push({
        Message: 'Select Policy Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.RFQTravelForm.get('CategoryType').value) {
      this.BasicDetailsAlert.push({
        Message: 'Select Category Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.BasicDetailsAlert.length > 0) {
      this.BasicDetailsStepCtrl.setErrors({ required: true });
      return this.BasicDetailsStepCtrl;
    }
    else {
      this.BasicDetailsStepCtrl.reset();
      return this.BasicDetailsStepCtrl;
    }

  }

  public BasicDetailsError() {
    if (this.BasicDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.BasicDetailsAlert);
      return;
    }
  }

  public ProductCategoryDetailsValidations() {

    this.ProductCategoryDetailsAlert = []

    this.TravelDetailValidation();

    if (this.RFQTravelForm.get('PincodeId').value == null || this.RFQTravelForm.get('PincodeId').value == 0) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Select PIN Code',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.RFQTravelForm.get('ProposerMobileNo').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Proposer Mobile No is required.',
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (
        !this.phoneNum.test(this.RFQTravelForm.get('ProposerMobileNo').value)
      ) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Mobile Number must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (!this.RFQTravelForm.get('ProposerEmail').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Email ID is required.',
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (
        !this.emailValidationReg.test(this.RFQTravelForm.get('ProposerEmail').value)
      ) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Enter Valid Email ID',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.ProductCategoryDetailsAlert.length > 0) {
      this.ProductCategoryDetailsStepCtrl.setErrors({ required: true });
      return this.ProductCategoryDetailsStepCtrl;
    }
    else {
      this.ProductCategoryDetailsStepCtrl.reset();
      return this.ProductCategoryDetailsStepCtrl;
    }

  }

  public ProductCategoryDetailsrror() {
    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
      return;
    }
  }

  public TravelDetailValidation() {
    this.Members.controls.forEach((el, i) => {

      if (el.get('SumInsured').value == "" || el.get('SumInsured').value == 0 || el.get('SumInsured').value == null) {
        this.ProductCategoryDetailsAlert.push({
          Message: `${i + 1}. Sum Insured is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (el.get('Name').value === "" || el.get('Name').value === null) {
        this.ProductCategoryDetailsAlert.push({
          Message: `${i + 1}. Name of Traveller is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (el.get('DOB').value === "") {
        this.ProductCategoryDetailsAlert.push({
          Message: `${i + 1}. Date of Birth is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        if (moment(this._datePipe.transform(el.get('DOB').value, 'yyyy-MM-dd')).isSameOrBefore(moment(this._datePipe.transform(this.maxDate, 'yyyy-MM-dd'))) == false) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${i + 1}. Enter valid Date of Birth.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }

      // if (el.get('Age').value === "" || el.get('Age').value === null) {
      //   this.ProductCategoryDetailsAlert.push({
      //     Message: `${i + 1}. Age of Traveller is required.`,
      //     CanDismiss: false,
      //     AutoClose: false,
      //   })
      // }
      // else {
      //   if (el.get('Age').value > 100) {
      //     this.ProductCategoryDetailsAlert.push({
      //       Message: `${i + 1}. Invalid Age of Traveller.`,
      //       CanDismiss: false,
      //       AutoClose: false,
      //     })
      //   }
      //   else {

      //     let TravellerAge = moment.duration(moment().diff(el.get('DOB').value));

      //     if (el.get('Age').value > TravellerAge.years()) {
      //       this.ProductCategoryDetailsAlert.push({
      //         Message: `${i + 1}. Age of Traveller should not be greater than the real age based on his/her calculated Date of Birth.`,
      //         CanDismiss: false,
      //         AutoClose: false,
      //       })
      //     }
      //   }
      // }

      if (el.get('DepartureDate').value === "") {
        this.ProductCategoryDetailsAlert.push({
          Message: `${i + 1}. Date of Departure is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
      // else {
      //   if (moment(this._datePipe.transform(el.get('DepartureDate').value, 'yyyy-MM-dd')).isSameOrAfter(moment(this._datePipe.transform(this.maxDate, 'yyyy-MM-dd'))) == false) {
      //     this.ProductCategoryDetailsAlert.push({
      //       Message: `${i + 1}. Enter valid Date of Departure.`,
      //       CanDismiss: false,
      //       AutoClose: false,
      //     })
      //   }
      // }

      if (el.get('ReturnDate').value === "") {
        this.ProductCategoryDetailsAlert.push({
          Message: `${i + 1}. Date of Return is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
      else {
        if (moment(this._datePipe.transform(el.get('ReturnDate').value, 'yyyy-MM-dd')).isSameOrAfter(moment(this._datePipe.transform(el.get('DepartureDate').value, 'yyyy-MM-dd'))) == false) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${i + 1}. Enter valid Date of Return.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }

      if (el.get('TravelingDays').value === "" || el.get('TravelingDays').value === 0) {
        this.ProductCategoryDetailsAlert.push({
          Message: `${i + 1}. Travel Days is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (el.get('AnyPreExistingMedicalIssue').value === "" || el.get('AnyPreExistingMedicalIssue').value === null) {
        this.ProductCategoryDetailsAlert.push({
          Message: `${i + 1}. Any Pre-Existing Medical issue is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (el.get('AnyPreExistingMedicalIssue').value == true || el.get('AnyPreExistingMedicalIssue').value == "true") {
        if (el.get('MedicalIssueDetails').value === "") {
          this.ProductCategoryDetailsAlert.push({
            Message: `${i + 1}. Specify Medical Condition is required.`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }

      if (this.RFQTravelForm.get("CategoryType").value != "Domestic") {

        // if (el.get('PassportNo').value === "") {
        //   this.ProductCategoryDetailsAlert.push({
        //     Message: `${i + 1}. Passport No is required.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        /**
         * Remove Validation in TI-594
         */
        // if (el.get('PassportExpiryDate').value === "") {
        //   this.ProductCategoryDetailsAlert.push({
        //     Message: `${i + 1}. Passport Expiry Date is required.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }
      }

    });
  }


  // check step four
  public TeamDetailsValidations() {
    this.TeamDetailsAlerts = [];

    if (this.RFQTravelForm.get('BranchId').invalid || this.RFQTravelForm.get('BranchId').value == 0) {
      this.TeamDetailsAlerts.push({
        Message: 'Select Branch',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQTravelForm.get('SalesPersonType').invalid || this.RFQTravelForm.get('SalesPersonType').value == "") {
      this.TeamDetailsAlerts.push({
        Message: 'Select Sales Person Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }


    if (this.RFQTravelForm.get('SalesPersonName').invalid || this.RFQTravelForm.get('SalesPersonName').value == "") {
      this.TeamDetailsAlerts.push({
        Message: 'Select Sales Person',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQTravelForm.get('SalesPersonType').value == 'Team Reference') {
      if (this.RFQTravelForm.get('TeamReferenceName').invalid || this.RFQTravelForm.get('TeamReferenceName').value == "") {
        this.TeamDetailsAlerts.push({
          Message: 'Select Team Reference Name',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (!this.RFQTravelForm.get('BDMName').value) {
      this.TeamDetailsAlerts.push({
        Message: 'BDM Name is Required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.RFQTravelForm.get('BDOName').value) {
      this.TeamDetailsAlerts.push({
        Message: 'BDO Name is Required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.TeamDetailsAlerts.length > 0) {
      this.TeamDetailsStepCtrl.setErrors({ required: true });
      return this.TeamDetailsStepCtrl;
    } else {
      this.TeamDetailsStepCtrl.reset();
      return this.TeamDetailsStepCtrl;
    }
  }

  // alert message if step four is not validated
  public TeamDetailsError() {
    if (this.TeamDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.TeamDetailsAlerts);
    }
  }

  // calculate Travel Days base on (Date of Return - Date of Departure) 
  public calculateOfTravelDays() {

    this.Members.controls.forEach((el, i) => {
      if (el.get('DepartureDate').value != "" && el.get('DepartureDate').value != null && el.get('ReturnDate').value != "" && el.get('ReturnDate').value != null) {
        let DateOfReturn = moment(this._datePipe.transform(el.get('DepartureDate').value, 'yyyy-MM-dd'));
        let ReturnDate = moment(this._datePipe.transform(el.get('ReturnDate').value, 'yyyy-MM-dd'));
        var diffDays = Math.abs(DateOfReturn.diff(ReturnDate, 'days'));
        el.get('TravelingDays').patchValue(diffDays + 1);
      }
    });

  }

  public fillCustomerName() {
    this.ProposerName = this.Members.controls[0]?.value?.Name;
  }

  /**
 * When Convert Transaction TO RFQ All Attachments are get
 * Display documents As Per category wise 
 */
  public canDisplayDocuments(DocumentType: string): boolean {
    if (this.mode == 'RenewalRFQ' && this.DisplayForm && this.DisplayForm?.TransactionId) {
      let CategoryWiseDocument = this.PolicyDocumentList.map(doc => doc.DocumentType)
      if (CategoryWiseDocument.includes(DocumentType)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build RFQ Life Main Form
  private _buildForm(data: ITravelRaiseDTO) {
    let form = this.fb.group({
      Id: [0],
      TransactionId: [0],
      RFQDate: [""],
      RFQNo: [""],
      CategoryId: [0],
      CategoryName: [""],

      // Basic Details
      SubCategoryId: [0],
      SubCategoryCode: [],
      SubCategoryName: [""],
      PolicyType: ["", [Validators.required]],
      CategoryType: [""],

      // Product Category Details >>>> Proposer Details
      ProposerMobileNo: [""],
      ProposerEmail: [""],
      PincodeId: [0],
      Pincode: ['', [Validators.required]],

      // Product Category Details >>>> Travel Details
      Members: this._buildMemberForm(data.Members),

      // Team Details
      BranchId: [0, [Validators.required]],
      BranchName: ['', [Validators.required]],
      SalesPersonType: [''],
      SalesPersonId: [],
      SalesPersonName: ['', [Validators.required]],
      TeamReferenceId: [null],
      TeamReferenceName: ['', [Validators.required]],
      BDOId: [0],
      BDOName: [""],
      BDMId: [0],
      BDMName: [""],

      // Attachment Details
      Documents: this._buildDocumentsForm(data.Documents),
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
    });

    if (data) {
      form.patchValue(data);
    }

    return form;
  }

  //RFQ-Travel document Formarray
  private _buildDocumentsForm(items: TravelDocumentsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initDocumentsForm(i));
        });
      }
    }

    return formArray;
  }

  //Init document formgroup
  private _initDocumentsForm(item: TravelDocumentsDto): FormGroup {
    let dF = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      DocumentTypeName: [''],
      FileName: ['', [Validators.required]],
      StorageFileName: [''],
      StorageFilePath: ['', [Validators.required]],
      Stage: [''],
      Description: [''], // remarks
    })
    if (item != null) {
      if (!item) {
        item = new TravelDocumentsDto();
      }

      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }


  //Build  policy Person Formarray
  private _buildMemberForm(items: TravelMemberDTO[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initMemberForm(i));
        });
      }
    }
    return formArray;
  }

  //Init policy Person Formgroup
  private _initMemberForm(item: TravelMemberDTO): FormGroup {
    let pPF = this.fb.group({
      Id: [0],
      RFQId: [0],
      // Relation: [],
      Name: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      Gender: [],
      Deductible: [0, [Validators.required]],
      SumInsured: [0, [Validators.required]],
      OtherSumInsured: [0, [Validators.required]],
      Remark: ['', [Validators.required]],
      // IsPolicyHolder: [false],
      // SmokerTibco: [null],
      // SmokerTibcoDescription: [''],
      Age: [""],
      DepartureDate: [""],
      ReturnDate: [""],
      TravelingDays: [0],
      AnyPreExistingMedicalIssue: [null],
      MedicalIssueDetails: [""],
      PassportNo: [""],
      PassportExpiryDate: [""],
    })

    if (item) {
      pPF.patchValue(item);
    }
    return pPF;
  }

  // form changes 
  private _onFormChange() {

    // changes product type
    this.RFQTravelForm.get('SubCategoryId').valueChanges.subscribe(val => {

      let SelectedSubCategory = this.SubCategoryList.find(x => x.Id == val)
      if (SelectedSubCategory) {
        this.RFQTravelForm.patchValue({
          SubCategoryName: SelectedSubCategory.Name,
          SubCategoryCode: SelectedSubCategory.Code
        })
      }
      else {
        this.RFQTravelForm.patchValue({
          SubCategoryName: "",
          SubCategoryCode: ""
        })
      }

      this.RFQTravelForm.patchValue({
        CategoryType: null
      })
    })

    // change sales person
    this.RFQTravelForm.get('SalesPersonName').valueChanges.subscribe((val) => {

      let salesPersonListSpecs = this._salesPersonListAPIfilter();
      salesPersonListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })


      this.salesPersonName$ = this._MasterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", salesPersonListSpecs.FilterConditions.Rules,salesPersonListSpecs.AdditionalFilters)
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

    // change Team Referance
    this.RFQTravelForm.get('TeamReferenceName').valueChanges.subscribe(
      (val) => {

        let teamReferenceListSpecs = this._teamReferenceListAPIfilter();
        teamReferenceListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })


        this.TeamRefUser$ = this._MasterListService
          .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", teamReferenceListSpecs.FilterConditions.Rules,teamReferenceListSpecs.AdditionalFilters)
          .pipe(
            takeUntil(this.destroy$),
            switchMap((res) => {
              if (res.Success) {
                if (res.Data.Items) {
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
    );

    this.RFQTravelForm.get('TeamReferenceId').valueChanges.subscribe(
      (val) => {
        if (!val && this.UserProfileObj.UserType == UserTypeEnum.StandardUser && this.RFQTravelForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {
          this.RFQTravelForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );


    this.RFQTravelForm.get('SalesPersonId').valueChanges.subscribe(
      (val) => {
        if (!val && this.UserProfileObj.UserType == UserTypeEnum.StandardUser && this.RFQTravelForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
          this.RFQTravelForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );

    // change pincode
    this.RFQTravelForm.get('Pincode').valueChanges.subscribe((val) => {
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

    /**
     * Sales person Type - Direct"
     * Selected branch BQP need to auto fetch under sales person
     */
    this.RFQTravelForm.get('BranchId').valueChanges.subscribe((val) => {
      this._TeamDetailsForStandardUser()
    })


    this.RFQTravelForm.get('SalesPersonType').valueChanges.subscribe((val) => {
      this._TeamDetailsForStandardUser()
    })

    /**
    * selected branch All BDO from user
    */
    this.RFQTravelForm.get('BDOName').valueChanges.subscribe((val) => {
      let bdoListSpecs = this._bdoListAPIfilter()
      bdoListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })

      this.BDOlist$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', bdoListSpecs.FilterConditions.Rules,bdoListSpecs.AdditionalFilters).pipe(
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

    /**
     * BDM - Selected branch all BDM from user
     */
    this.RFQTravelForm.get('BDMName').valueChanges.subscribe((val) => {
      let bdmListSpecs = this._bdmListAPIfilter()
      bdmListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })

      this.BDMlist$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', bdmListSpecs.FilterConditions.Rules,bdmListSpecs.AdditionalFilters).pipe(
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


    this.Members.controls.forEach(m => {
      /**
       * When Change DepartureDate Change return date as per DepartureDate + TravelingDays
       */
      m.get('DepartureDate').valueChanges.subscribe(val => {

        if (val && m.get('TravelingDays').value != null) {

          let DepartureDate = this._datePipe.transform(m.get('DepartureDate').value, 'yyyy-MM-dd');
          let ReturnDate = new Date(DepartureDate);

          let TravelingDays = 1
          if (m.get('TravelingDays').value) {
            TravelingDays = isNaN(parseFloat(m.get('TravelingDays').value)) ? 0 : parseFloat(m.get('TravelingDays').value)
          }

          ReturnDate.setDate(ReturnDate.getDate() + TravelingDays - 1);  // one day les
          m.get('ReturnDate').patchValue(ReturnDate, { emitEvent: false });

        }

      })
      /**
       * When Change Travelling days Change return date as per DepartureDate + TravelingDays
       */
      m.get('TravelingDays').valueChanges.subscribe(val => {

        if (m.get('DepartureDate').value != "" && m.get('DepartureDate').value != null && m.get('TravelingDays').value != "" && m.get('TravelingDays').value != null) {

          let DepartureDate = this._datePipe.transform(m.get('DepartureDate').value, 'yyyy-MM-dd');
          let ReturnDate = new Date(DepartureDate);

          let TravelingDays = 1
          if (m.get('TravelingDays').value) {
            TravelingDays = isNaN(parseFloat(m.get('TravelingDays').value)) ? 0 : parseFloat(m.get('TravelingDays').value)
          }

          ReturnDate.setDate(ReturnDate.getDate() + TravelingDays - 1);  // one day les
          m.get('ReturnDate').patchValue(ReturnDate, { emitEvent: false });

        }

      })

      /**
       * When Change ReturnDate Change TravelingDays as per DepartureDate - ReturnDate
       */
      m.get('ReturnDate').valueChanges.subscribe(val => {
        if (m.get('DepartureDate').value != "" && m.get('DepartureDate').value != null && m.get('ReturnDate').value != "" && m.get('ReturnDate').value != null) {
          let DateOfReturn = moment(this._datePipe.transform(m.get('DepartureDate').value, 'yyyy-MM-dd'));
          let ReturnDate = moment(this._datePipe.transform(m.get('ReturnDate').value, 'yyyy-MM-dd'));
          var diffDays = Math.abs(DateOfReturn.diff(ReturnDate, 'days'));
          m.get('TravelingDays').patchValue(diffDays + 1, { emitEvent: false });
        }

      })
    })

  }

  private _fillMasterList() {

    // fill Product Type
    let SubCategoryRule: IFilterRule[] = [ActiveMasterDataRule,
      {
        Field: "Category.Code",
        Operator: "eq",
        Value: CategoryCodeEnum.Travel
      }
    ]

    let OrderBySpecs: OrderBySpecs[] = [
      {
        field: "SrNo",
        direction: "asc"
      }
    ]

    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.SubCategory.List, 'Name', '', SubCategoryRule, [], OrderBySpecs)
      .subscribe(res => {
        if (res.Success) {
          this.SubCategoryList = res.Data.Items
        }
      })


    // fill Branch
    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List + "/true", 'Name', "", [ActiveMasterDataRule])
      .subscribe(res => {
        if (res.Success) {
          this.Branchs = res.Data.Items

          /**
           * After Get Branch list Fill Team details 
           */
          if (this.mode == 'create') {
            this._TeamDetailsInfo()
          }
        }
      });


    // Fill Insurance Company
    let InsuranceCompanyRule: IFilterRule[] = [
      {
        Field: 'Status',
        Operator: 'eq',
        Value: 1,
      }
    ];

    let InsuranceCompanyAdditionalFilters: IAdditionalFilterObject[] = [
      { key: "CatagoryCode", filterValues: [CategoryCodeEnum.Travel] }
    ]

    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.InsuranceCompany.list, 'Name', "", InsuranceCompanyRule, InsuranceCompanyAdditionalFilters)
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.InsuranceCompany = res.Data.Items;
          } else {
            this.InsuranceCompany = [];
          }
        } else {
          this.InsuranceCompany = [];
        }
      })

  }


  private _dateFormat() {
    this.RFQTravelForm.patchValue({
      DOB: this._datePipe.transform(this.RFQTravelForm.get('Member.DOB')?.value, 'yyyy-MM-dd'),
    }, { emitEvent: false })

    this.RFQTravelForm.get("Members").value.forEach((el, i) => {
      el.DOB = this._datePipe.transform(el.DOB, 'yyyy-MM-dd');
      el.DepartureDate = this._datePipe.transform(el.DepartureDate, 'yyyy-MM-dd');
      el.ReturnDate = this._datePipe.transform(el.ReturnDate, 'yyyy-MM-dd');
    });

  }


  // Team details from MyProfile
  private _TeamDetailsInfo() {
    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.UserProfileObj = user
        // set Branch details
        this.RFQTravelForm.patchValue({
          BranchId: user.BranchId,
          BranchName: user.BranchName,
        });

        // ************* set required field from user profile data ************* \\
        // set User type from user profile
        if (user.UserType == UserTypeEnum.Agent) {

          this.RFQTravelForm.patchValue({
            SalesPersonId: user.Id,
            SalesPersonName: user.FullName,
            SalesPersonType: 'POSP',
            BDMId: user.BDMId,
            BDMName: user.BDMName,
            BDOId: user.BDOId,
            BDOName: user.BDOName,
          }, { emitEvent: false });

        }
        else if (user.UserType == UserTypeEnum.TeamReference) {
          // in case of login user type is "team reference" then auto bind data in team reference id and team reference name from user profile api
          this.RFQTravelForm.patchValue({
            TeamReferenceId: user.Id,
            TeamReferenceName: user.FullName,
            SalesPersonType: 'Team Reference',
            BDMId: user.BDMId,
            BDMName: user.BDMName,
            BDOId: user.BDOId,
            BDOName: user.BDOName,
          }, { emitEvent: false });


          if (this.RFQTravelForm.value?.BranchId) {

            let LoginUserBranch = this.Branchs.find(b => b.Id == this.RFQTravelForm.value?.BranchId)
            if (LoginUserBranch) {
              this.RFQTravelForm.patchValue({
                SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
                SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
              }, { emitEvent: false });
            }

          }


        }
      }
    })

  }


  /**
   * When Login use is Standard user then 
   * change branch or Sales person type then call function
   */

  private _TeamDetailsForStandardUser() {
    if (this.UserProfileObj.UserType == UserTypeEnum.StandardUser) {

      /**
       * SalesPersonType Direct sales person is Selected branch bqp
       * Other Field is null
       */
      if (this.RFQTravelForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {


        let LoginUserBranch = this.Branchs.find(b => b.Id == this.RFQTravelForm.get('BranchId').value)


        if (LoginUserBranch) {
          this.RFQTravelForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.RFQTravelForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.RFQTravelForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });

      } else if (this.RFQTravelForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {

        this.RFQTravelForm.patchValue({
          SalesPersonId: null,
          SalesPersonName: null,
          TeamReferenceId: null,
          TeamReferenceName: null,
        });


        /**
         * SalesPersonType TeamReference sales person is Selected branch bqp
         * Other Field is null
         */
      } else if (this.RFQTravelForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {

        let LoginUserBranch = this.Branchs.find(b => b.Id == this.RFQTravelForm.value?.BranchId)
        if (LoginUserBranch) {
          this.RFQTravelForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.RFQTravelForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.RFQTravelForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });
      }


      this.RFQTravelForm.patchValue({
        BDMId: null,
        BDMName: null,
        BDOId: null,
        BDOName: null,
      });

    }
  }


  /**
* Sales person list data List API query spec
* @returns 
*/
  private _salesPersonListAPIfilter(): QuerySpecs {
    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    /**
     * Sales person Type - "POSP"
     * Login BDO/BDM- POSP need to display under Sales person
     */
    if (this.RFQTravelForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQTravelForm.get('BranchId').value, }
      ]
    }

    if (this.RFQTravelForm.get('SalesPersonType').value == "POSP") {
      specs.FilterConditions.Rules = [
        ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQTravelForm.get('BranchId').value, }
      ];
    }


    if (this.RFQTravelForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.RFQTravelForm.get('SalesPersonType').value == "POSP") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['Agent'] })
      specs.AdditionalFilters.push({ key: 'RFQSalesPersonOnly', filterValues: ['true'] })
    }

    return specs;
  }

  /**
  * Team ref. list data List API query spec
  * @returns 
  */
  private _teamReferenceListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    /**
         * Sales Person Type -"Team Reference"
         * Login BDO/BDM- Team Reference need to display under Team Reference
         */
    if (this.RFQTravelForm.get('SalesPersonType').value == "Team Reference") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQTravelForm.get('BranchId').value, }
      ];
    }

    if (this.RFQTravelForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.RFQTravelForm.get('SalesPersonType').value == "Team Reference") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['TeamReference'] })
      specs.AdditionalFilters.push({ key: 'RFQSalesPersonOnly', filterValues: ['true'] })
    }

    return specs;
  }

  /**
  * BDO list data List API query spec
  * @returns 
  */
  private _bdoListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    if (this.RFQTravelForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule];
    }

    if (this.RFQTravelForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDOOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.RFQTravelForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.RFQTravelForm.get('BranchId').value?.toString()] })
      }
    }


    return specs;
  }

  /**
    *BDM list data List API query spec
    * @returns 
    */
  private _bdmListAPIfilter(): QuerySpecs {

    let specs = new QuerySpecs()
    specs.AdditionalFilters = [];
    specs.FilterConditions.Rules = [];

    if (this.RFQTravelForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule];
    }

    if (this.RFQTravelForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDMOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.RFQTravelForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.RFQTravelForm.get('BranchId').value?.toString()] })
      }
    }

    return specs;
  }
  //#endregion private-methods

}
