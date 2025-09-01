import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { Alert, IAdditionalFilterObject, IFilterRule, OrderBySpecs, QuerySpecs } from '@models/common';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { PADocumentsDto, IPACoverageDetailDto, IPaRaiseDTO, PaRaiseDTO } from '@models/dtos';
import { ICityPincodeDto } from '@models/dtos/core';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { IUserDto } from '@models/dtos/core/userDto';
import { AuthService } from '@services/auth/auth.service';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { PARenewalPolicyType, RFQDocumentsDrpList } from '@config/rfq';
import { CategoryCodeEnum, SalesPersonTypeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { ROUTING_PATH } from '@config/routingPath.config';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { environment } from 'src/environments/environment';
import { PaOccupation, PAPolicyType } from '@config/rfq';
import { RfqPaService } from '../rfq-pa.service';

const ActiveMasterDataRule: IFilterRule = {
  Field: 'Status',
  Operator: 'eq',
  Value: 1
}

@Component({
  selector: 'gnx-pa-raise',
  templateUrl: './pa-raise.component.html',
  styleUrls: ['./pa-raise.component.scss'],
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
export class PaRaiseComponent {

  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  //Variables
  pagetitle: string; // Page main header title
  mode: string; // for identify of Raise page is create or edit
  isExpand: boolean = false;

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
  BDOlist$: Observable<IUserDto[]>;
  BDMlist$: Observable<IUserDto[]>;
  pincodes$: Observable<ICityPincodeDto[]>; // observable of pincode list
  //List objects
  Branchs: IBranchDto[] = [];
  SubCategoryList = [];

  //FormGroup 
  RFQRaisedForm !: FormGroup;
  RFQRaised: IPaRaiseDTO
  destroy$: Subject<any>;

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
    private _RfqPAService: RfqPaService,
    private _Location: Location,
  ) {
    this.destroy$ = new Subject();
  }
  //#endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    this.RFQRaised = new PaRaiseDTO();

    // Route params data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title'];
    this.mode = data['mode'];

    this.DisplayForm = data['data'];

    // in case of Edit and View mode then 
    if (this.mode == "edit" || this.mode == "view" || this.mode == "RenewalRFQ") {
      this.RFQRaised = data['data'];
    }

    // build travel form
    this.RFQRaisedForm = this._buildForm(this.RFQRaised);

    // set sales person info
    // this._salesPersonInfo()

    // in case of view mode then all form value is disabled mode
    if (this.mode == "view") {
      this.RFQRaisedForm.disable()
    }

    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.UserProfileObj = user
      }
    })

    // in case of view mode then all form value is disabled mode
    if (this.mode == "view") {
      this.RFQRaisedForm.disable({ emitEvent: false });
      this.isExpand = true;
    }

    this._fillMasterList()
    this._onFormChange();
  }



  // Document Type List
  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.PA))
  }

  // get uploaded documents
  get Documents() {
    return this.RFQRaisedForm.controls["Documents"] as FormArray;
  }


  get DisplayedPolicyType() {
    if (this.DisplayForm?.TransactionId) {
      return PARenewalPolicyType
    }
    else {
      return PAPolicyType
    }
  }

  get PaOccupation() {
    return PaOccupation
  }


  /**
   * Only editable in login user is standard user & Sales person type is POSP
   */
  get canEditableSalesPerson() {
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser) {
      if (this.RFQRaisedForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
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
      if (this.RFQRaisedForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {
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

  // back button
  public backButton() {
    this._Location.back();
  }


  public ExpandCollaps() {
    this.isExpand = !this.isExpand;
  }

  public SubmitRfq() {

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


    let SubmitFormData: IPaRaiseDTO = this.RFQRaisedForm.value

    // submit form
    switch (this.mode) {
      case "create": case "RenewalRFQ":
        this._RfqPAService.CreateProposal(SubmitFormData).subscribe((res) => {
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
        this._RfqPAService.UpdateProposal(SubmitFormData).subscribe((res) => {
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


  public AutocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, SelectedFor: string): void {

    switch (SelectedFor) {

      case "TeamRef":
        this.RFQRaisedForm.patchValue({
          TeamReferenceId: event.option.value.Id,
          TeamReferenceName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        });
        break;

      case "Sales":
        this.RFQRaisedForm.patchValue({
          SalesPersonId: event.option.value.Id,
          SalesPersonName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        })
        break;

      case "BDMName":
        this.RFQRaisedForm.patchValue({
          BDMName: event.option.value.FullName,
          BDMId: event.option.value.Id,
        });
        break;

      case "BDOName":
        this.RFQRaisedForm.patchValue({
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
    let specs = new QuerySpecs()


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
    dialogConfig.minHeight = '80vh';
    dialogConfig.maxHeight = '80vh';

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
            this.RFQRaisedForm.patchValue({
              SalesPersonId: result.Id,
              SalesPersonName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "TeamRef":
            this.RFQRaisedForm.patchValue({
              TeamReferenceId: result.Id,
              TeamReferenceName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "BDMName":
            this.RFQRaisedForm.patchValue({
              BDMName: result.FullName,
              BDMId: result.Id,
            });
            break;

          case "BDOName":
            this.RFQRaisedForm.patchValue({
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
    this.RFQRaisedForm.controls[name].setValue("")
    this.RFQRaisedForm.controls[id].setValue(null)
  }


  /**
   * Document Selection Change
  */
  public onDocumentSelectionChange(selectedValue): void {
    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert)
      this.DocumentDropdown.nativeElement.value = ""
      return;
    }

    let selectedDocument = selectedValue.target.value;
    this.addDocuments(selectedDocument);
    this.DocumentDropdown.nativeElement.value = ""
  }



  /**
   * Add new row in Document array
  */
  public addDocuments(selectedDocument?: string) {
    const row: PADocumentsDto = new PADocumentsDto();
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




  /**
 * Validation part 
 */

  public BasicDetailsValidations() {
    this.BasicDetailsAlert = []

    if (this.RFQRaisedForm.get('SubCategoryId').value == 0 || this.RFQRaisedForm.get('SubCategoryId').value == null) {
      this.BasicDetailsAlert.push({
        Message: 'Select Poduct Sub Category',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQRaisedForm.get('PolicyType').hasError('required')) {
      this.BasicDetailsAlert.push({
        Message: 'Select Policy Type',
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

    if (!this.RFQRaisedForm.get('SumInsures').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Sum Insured is required',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.RFQRaisedForm.get('ProposerName').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Proposer Name is required',
        CanDismiss: false,
        AutoClose: false,
      })
    }



    if (!this.RFQRaisedForm.get('ProposerMobileNo').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Proposer Mobile No is required.',
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (
        !this.phoneNum.test(this.RFQRaisedForm.get('ProposerMobileNo').value)
      ) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Mobile Number must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (!this.RFQRaisedForm.get('ProposerEmail').value) {
      // this.ProductCategoryDetailsAlert.push({
      //   Message: 'Email ID is required.',
      //   CanDismiss: false,
      //   AutoClose: false,
      // })
    } else {
      if (
        !this.emailValidationReg.test(this.RFQRaisedForm.get('ProposerEmail').value)
      ) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Enter Valid Email ID',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }


    if (!this.RFQRaisedForm.get('Occupation').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Occupation is required',
        CanDismiss: false,
        AutoClose: false,
      })
    }



    if (this.RFQRaisedForm.get('CoverageDetail.Other')?.value == true) {
      if (this.RFQRaisedForm.get('CoverageDetail.OtherDescription').value == "" || this.RFQRaisedForm.get('CoverageDetail.OtherDescription').value == null) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Enter Remarks',
          CanDismiss: false,
          AutoClose: false,
        })
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


  // check step four
  public TeamDetailsValidations() {
    this.TeamDetailsAlerts = [];

    if (this.RFQRaisedForm.get('BranchId').invalid || this.RFQRaisedForm.get('BranchId').value == 0) {
      this.TeamDetailsAlerts.push({
        Message: 'Select Branch',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQRaisedForm.get('SalesPersonType').invalid || this.RFQRaisedForm.get('SalesPersonType').value == "") {
      this.TeamDetailsAlerts.push({
        Message: 'Select Sales Person Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }


    if (this.RFQRaisedForm.get('SalesPersonName').invalid || this.RFQRaisedForm.get('SalesPersonName').value == "") {
      this.TeamDetailsAlerts.push({
        Message: 'Select Sales Person',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQRaisedForm.get('SalesPersonType').value == 'Team Reference') {
      if (this.RFQRaisedForm.get('TeamReferenceName').invalid || this.RFQRaisedForm.get('TeamReferenceName').value == "") {
        this.TeamDetailsAlerts.push({
          Message: 'Select Team Reference Name',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (!this.RFQRaisedForm.get('BDMName').value) {
      this.TeamDetailsAlerts.push({
        Message: 'BDM Name is Required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.RFQRaisedForm.get('BDOName').value) {
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
  private _buildForm(data: IPaRaiseDTO) {
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
      PolicyType: ["New", [Validators.required]],

      // Product Category Details >>>> Proposer Details
      Occupation: [''],
      Designation: [''],
      ProposerMobileNo: [''],
      ProposerName: [''],
      ProposerEmail: [''],
      PincodeId: [0],
      Pincode: [''],
      CityId: [0],
      CityName: [''],
      SumInsures: [],
      ProjectRemark: [''],

      // Product Category Details >>>> Coverage Preference
      CoverageDetail: this._initCoveragesForm(data.CoverageDetail),

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
  private _buildDocumentsForm(items: PADocumentsDto[] = []): FormArray {
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
  private _initDocumentsForm(item: PADocumentsDto): FormGroup {
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
        item = new PADocumentsDto();
      }

      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }

  //Init Coverage formgroup
  private _initCoveragesForm(item: IPACoverageDetailDto): FormGroup {
    let dF = this.fb.group({
      Id: [0],
      RFQId: [0],
      AccidentalDeath: [false],
      PermanentTotalDisability: [false],
      PermanentPartialDisability: [false],
      AmbulanceCharge: [false],
      LossOfIncome: [false],
      FactureCare: [false],
      ComaBenefit: [false],
      AccidentalHospitalization: [false],
      Other: [false],
      OtherDescription: [""],

    })
    if (item != null) {
      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }

  // form changes 
  private _onFormChange() {

    // changes product type
    this.RFQRaisedForm.get('SubCategoryId').valueChanges.subscribe(val => {

      let SelectedSubCategory = this.SubCategoryList.find(x => x.Id == val)
      if (SelectedSubCategory) {
        this.RFQRaisedForm.patchValue({
          SubCategoryName: SelectedSubCategory.Name,
          SubCategoryCode: SelectedSubCategory.Code
        })
      }
      else {
        this.RFQRaisedForm.patchValue({
          SubCategoryName: "",
          SubCategoryCode: ""
        })
      }

      this.RFQRaisedForm.patchValue({
        CategoryType: null
      })
    })

    // change sales person
    this.RFQRaisedForm.get('SalesPersonName').valueChanges.subscribe((val) => {

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
    this.RFQRaisedForm.get('TeamReferenceName').valueChanges.subscribe(
      (val) => {

        let teamReferenceListSpecs = this._teamReferenceListAPIfilter();
        teamReferenceListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })


        this.TeamRefUser$ = this._MasterListService
          .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", teamReferenceListSpecs.FilterConditions.Rules, teamReferenceListSpecs.AdditionalFilters)
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

    this.RFQRaisedForm.get('TeamReferenceId').valueChanges.subscribe(
      (val) => {
        if (!val && this.UserProfileObj.UserType == UserTypeEnum.StandardUser && this.RFQRaisedForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {
          this.RFQRaisedForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );


    this.RFQRaisedForm.get('SalesPersonId').valueChanges.subscribe(
      (val) => {
        if (!val && this.UserProfileObj.UserType == UserTypeEnum.StandardUser && this.RFQRaisedForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
          this.RFQRaisedForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );

    /**
     * Sales person Type - Direct"
     * Selected branch BQP need to auto fetch under sales person
     */
    this.RFQRaisedForm.get('BranchId').valueChanges.subscribe((val) => {
      this._TeamDetailsForStandardUser()
    })


    this.RFQRaisedForm.get('SalesPersonType').valueChanges.subscribe((val) => {
      this._TeamDetailsForStandardUser()
    })

    /**
    * selected branch All BDO from user
    */
    this.RFQRaisedForm.get('BDOName').valueChanges.subscribe((val) => {

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
    this.RFQRaisedForm.get('BDMName').valueChanges.subscribe((val) => {
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

  }

  private _fillMasterList() {

    // fill Product Type
    let SubCategoryRule: IFilterRule[] = [ActiveMasterDataRule,
      {
        Field: "Category.Code",
        Operator: "eq",
        Value: CategoryCodeEnum.PA
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

          if (this.mode == "create" && this.SubCategoryList.length == 1) {

            this.RFQRaisedForm.patchValue({
              SubCategoryId: this.SubCategoryList[0].Id,
              SubCategoryName: this.SubCategoryList[0].Name,
              SubCategoryCode: this.SubCategoryList[0].Code,
            })


          }
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
  }


  private _dateFormat() {

  }


  // Team details from MyProfile
  private _TeamDetailsInfo() {
    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.UserProfileObj = user
        // set Branch details
        this.RFQRaisedForm.patchValue({
          BranchId: user.BranchId,
          BranchName: user.BranchName,
        });

        // ************* set required field from user profile data ************* \\
        // set User type from user profile
        if (user.UserType == UserTypeEnum.Agent) {

          this.RFQRaisedForm.patchValue({
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
          this.RFQRaisedForm.patchValue({
            TeamReferenceId: user.Id,
            TeamReferenceName: user.FullName,
            SalesPersonType: 'Team Reference',
            BDMId: user.BDMId,
            BDMName: user.BDMName,
            BDOId: user.BDOId,
            BDOName: user.BDOName,
          }, { emitEvent: false });


          if (this.RFQRaisedForm.value?.BranchId) {

            let LoginUserBranch = this.Branchs.find(b => b.Id == this.RFQRaisedForm.value?.BranchId)
            if (LoginUserBranch) {
              this.RFQRaisedForm.patchValue({
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
      if (this.RFQRaisedForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {


        let LoginUserBranch = this.Branchs.find(b => b.Id == this.RFQRaisedForm.get('BranchId').value)


        if (LoginUserBranch) {
          this.RFQRaisedForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.RFQRaisedForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.RFQRaisedForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });

      } else if (this.RFQRaisedForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {

        this.RFQRaisedForm.patchValue({
          SalesPersonId: null,
          SalesPersonName: null,
          TeamReferenceId: null,
          TeamReferenceName: null,
        });


        /**
         * SalesPersonType TeamReference sales person is Selected branch bqp
         * Other Field is null
         */
      } else if (this.RFQRaisedForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {

        let LoginUserBranch = this.Branchs.find(b => b.Id == this.RFQRaisedForm.get('BranchId').value)
        if (LoginUserBranch) {
          this.RFQRaisedForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.RFQRaisedForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.RFQRaisedForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });
      }


      this.RFQRaisedForm.patchValue({
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
    if (this.RFQRaisedForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQRaisedForm.get('BranchId').value, }
      ]
    }

    if (this.RFQRaisedForm.get('SalesPersonType').value == "POSP") {
      specs.FilterConditions.Rules = [
        ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQRaisedForm.get('BranchId').value, }
      ];
    }


    if (this.RFQRaisedForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.RFQRaisedForm.get('SalesPersonType').value == "POSP") {
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
    if (this.RFQRaisedForm.get('SalesPersonType').value == "Team Reference") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQRaisedForm.get('BranchId').value, }
      ];
    }

    if (this.RFQRaisedForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.RFQRaisedForm.get('SalesPersonType').value == "Team Reference") {
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

    if (this.RFQRaisedForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule];
    }

    if (this.RFQRaisedForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDOOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.RFQRaisedForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.RFQRaisedForm.get('BranchId').value?.toString()] })
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

    if (this.RFQRaisedForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule];
    }

    if (this.RFQRaisedForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDMOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.RFQRaisedForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.RFQRaisedForm.get('BranchId').value?.toString()] })
      }
    }

    return specs;
  }

}
