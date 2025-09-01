import { Component, ElementRef, ViewChild } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { Alert, IAdditionalFilterObject, IFilterRule, OrderBySpecs, QuerySpecs } from '@models/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { RfqFireService } from '../rfq-fire.service';
import { AuthService } from '@services/auth/auth.service';
import { DialogService } from '@lib/services/dialog.service';
import { MasterListService } from '@lib/services/master-list.service';
import { HttpService } from '@lib/services/http/http.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { IUserDto } from '@models/dtos/core/userDto';
import { ICityPincodeDto } from '@models/dtos/core';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { DisplayedRenewalPolicyType, RFQDocumentsDrpList } from '@config/rfq';
import { CategoryCodeEnum, SalesPersonTypeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { ROUTING_PATH } from '@config/routingPath.config';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { environment } from 'src/environments/environment';
import { FireDocumentsDto, FireRaiseDTO, IFireRaiseDTO, IFireOtherDetailDto, ISumInsuredDetailDto } from '@models/dtos';
import { DisplayedPolicyPreriod, DisplayedPolicyType, DisplayedSolarType, FireRFQtype } from '@config/rfq';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';

const ActiveMasterDataRule: IFilterRule = {
  Field: 'Status',
  Operator: 'eq',
  Value: 1
}

@Component({
  selector: 'gnx-fire-raise',
  templateUrl: './fire-raise.component.html',
  styleUrls: ['./fire-raise.component.scss'],
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
export class FireRaiseComponent {

  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  //Variables
  pagetitle: string; // Page main header title
  mode: string; // for identify of Raise page is create or edit
  isExpand: boolean = false;
  maxDate: Date = new Date();

  UserProfileObj: IMyProfile;
  DisplayForm: any;
  FirePackageSumInsuredDetails: any;

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // declare validation Regex
  phoneNum: RegExp = ValidationRegex.phoneNumReg;
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;

  // declare Alert Array List
  BasicDetailsAlert: Alert[] = [];
  ProductCategoryDetailsAlert: Alert[] = [];
  PrevPolicyDetailAlerts: Alert[] = [];
  DocumentAttachmentAlert: Alert[] = [];
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  TeamDetailsAlerts: Alert[] = [];

  // declare form control
  BasicDetailsStepCtrl = new FormControl(); // Step 1 Control
  ProductCategoryDetailsStepCtrl = new FormControl();
  PreviousPolicyDetailsStepCtrl = new FormControl();
  TeamDetailsStepCtrl = new FormControl(); // Step 5 Control
  DocumentAttachmentStepCtrl = new FormControl()

  // Observable List
  TeamRefUser$: Observable<IUserDto[]>;
  salesPersonName$: Observable<IUserDto[]> // Observable of user list
  BDOlist$: Observable<IUserDto[]>;
  BDMlist$: Observable<IUserDto[]>;
  pincodes$: Observable<ICityPincodeDto[]>; // observable of pincode list
  //List objects
  Branchs: IBranchDto[] = [];
  InsuranceCompany: IInsuranceCompanyDto[];
  SubCategoryList = [];

  //FormGroup 
  RFQRaisedForm !: FormGroup;
  RFQRaised: IFireRaiseDTO
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
    public _RfqFireService: RfqFireService,
    private _Location: Location,
  ) {
    this.destroy$ = new Subject();
    this.FirePackageSumInsuredDetails = this._RfqFireService.DisplaySumInsuredDetailsFirePackage()
  }
  //#endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    this.RFQRaised = new FireRaiseDTO();

    // Route params data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title'];
    this.mode = data['mode'];

    this.DisplayForm = data['data'];

    // in case of Edit and View mode then 
    if (this.mode == "edit" || this.mode == "view" || this.mode == 'RenewalRFQ') {
      this.RFQRaised = data['data'];
    }

    // build travel form
    this.RFQRaisedForm = this._buildForm(this.RFQRaised);

    // set sales person info
    // this._salesPersonInfo()

    // in case of view mode then all form value is disabled mode
    if (this.mode == "view") {
      this.RFQRaisedForm.disable({ emitEvent: false });
      this.isExpand = true;
    }

    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.UserProfileObj = user
      }
    })

    this._fillMasterList()
    this._onFormChange();
  }


  get SumInsuredDetailForm() {
    return this.RFQRaisedForm.controls['SumInsuredDetail'] as FormGroup
  }


  // Document Type List
  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Fire))
  }

  // get uploaded documents
  get Documents() {
    return this.RFQRaisedForm.controls["Documents"] as FormArray;
  }

  // get Fire RFQ type
  get FireRFQtype() {
    return FireRFQtype
  }

  // get Fire Policy type
  get DisplayedPolicyType() {
    if (this.DisplayForm?.TransactionId) {
      return DisplayedRenewalPolicyType
    }
    else {
      return DisplayedPolicyType
    }
  }

  // get Fire Solar type
  get DisplayedSolarType() {
    return DisplayedSolarType
  }

  // get Fire Policy period
  get DisplayedPolicyPreriod() {
    return DisplayedPolicyPreriod
  }



  /**
   * Only editable in login user is standard user & Sales person type is POSP
   */
  get canEditableSalesPerson() {
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser && this.mode != 'view') {
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
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser && this.mode != 'view') {
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
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser && this.mode != 'view') {
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



  public FilterDisplaySumInsuredDetails() {

    let TypeWiseDisplaySumInsuredDetails = this._RfqFireService.DisplaySumInsuredDetailsHomeAndFire()
      .filter(item => item.DisplayFor.includes(this.RFQRaisedForm.get('Type').value))

    return TypeWiseDisplaySumInsuredDetails
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


    let SubmitFormData: IFireRaiseDTO = this.RFQRaisedForm.value

    // submit form
    switch (this.mode) {
      case "create": case "RenewalRFQ":
        this._RfqFireService.CreateProposal(SubmitFormData).subscribe((res) => {
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
        this._RfqFireService.UpdateProposal(SubmitFormData).subscribe((res) => {
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

  // autocomplete for PinCode and also binding value of cityName & cityId
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.RFQRaisedForm.patchValue({
      PincodeId: event.option.value.Id,
      Pincode: event.option.value.PinCode,
      CityId: event.option.value.CityId,
      CityName: event.option.value.CityName
    });
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
          this.RFQRaisedForm.patchValue({
            Pincode: result.PinCode,
            PincodeId: result.Id,
            CityId: result.CityId,
            CityName: result.CityName
          });
        }
      }
    });
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
    const row: FireDocumentsDto = new FireDocumentsDto();
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

    if (!this.RFQRaisedForm.get('Type').value) {
      this.BasicDetailsAlert.push({
        Message: 'Select RFQ Type',
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



    if (!this.RFQRaisedForm.get('ProposerName').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Insured Name is required',
        CanDismiss: false,
        AutoClose: false,
      })
    }



    if (!this.RFQRaisedForm.get('ProposerMobileNo').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Mobile No is required.',
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

    if (!this.RFQRaisedForm.get('Pincode').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Select PIN Code',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQRaisedForm.get('Type').value == 'Home') {
      if (!this.RFQRaisedForm.get('OtherDetail.BuildingAge').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Age of Building(Year) is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }


    if (this.RFQRaisedForm.get('Type').value == 'Solar') {
      if (!this.RFQRaisedForm.get('SolarType').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Solar Type is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if ((this.RFQRaisedForm.get('Type').value == 'Solar' && this.RFQRaisedForm.get('SolarType').value == 'Corporate') ||
      (this.RFQRaisedForm.get('Type').value == 'Other') ||
      (this.RFQRaisedForm.get('Type').value == 'Fire') ||
      (this.RFQRaisedForm.get('Type').value == 'Fire Package')) {
      if (!this.RFQRaisedForm.get('NatureOfBusiness').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Nature of Business is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if ((this.RFQRaisedForm.get('Type').value == 'Solar') ||
      (this.RFQRaisedForm.get('Type').value == 'Other')) {
      if (!this.RFQRaisedForm.get('SumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.SumInsuredDetailForm.get('Building').value) {
      if (!this.SumInsuredDetailForm.get('BuildingSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Building Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.SumInsuredDetailForm.get('Furniture').value) {
      if (!this.SumInsuredDetailForm.get('FurnitureSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Furniture Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('ElectricleOrElectronic').value) {
      if (!this.SumInsuredDetailForm.get('ElectricleOrElectronicSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Electricle Or Electronic Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('GeneralContent').value) {
      if (!this.SumInsuredDetailForm.get('GeneralContentSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'General Content Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('Solar').value) {
      if (!this.SumInsuredDetailForm.get('SolarSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Solar Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('ValuableContents').value) {
      if (!this.SumInsuredDetailForm.get('ValuableContentsSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Valuable Content Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('PlantAndMachinery').value) {
      if (!this.SumInsuredDetailForm.get('PlantAndMachinerySumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Plant And Machinery Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('MachineryBreakdown').value) {
      if (!this.SumInsuredDetailForm.get('MachineryBreakdownSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Machinery Breakdown Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('MachineryLossOfProfit').value) {
      if (!this.SumInsuredDetailForm.get('MachineryLossOfProfitGrossProfit').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Machinery Loss Of Profit - Gross Profit is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('StockIncludingRMWIPFG').value) {
      if (!this.SumInsuredDetailForm.get('StockIncludingRMWIPFGSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Stock Including RMWIPFG Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('OtherContents').value) {
      if (!this.SumInsuredDetailForm.get('OtherContentsSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Other Contents Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('FireLossOfProfit').value) {
      if (!this.SumInsuredDetailForm.get('FireLossOfProfitGrossProfit').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Fire Loss Of Profit -  Gross Profit is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('ElectricInstallation').value) {
      if (!this.SumInsuredDetailForm.get('ElectricInstallationSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Electric Installation Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('BreakdownDomesticAppliances').value) {
      if (!this.SumInsuredDetailForm.get('BreakdownDomesticSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Break down Domestic Appliances Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('MoneyInTransit').value) {
      if (!this.SumInsuredDetailForm.get('MoneyInTransitSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Money In Transit Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('MoneyInSafe').value) {
      if (!this.SumInsuredDetailForm.get('MoneyInSafeSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Money In Safe Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('MoneyInCounter').value) {
      if (!this.SumInsuredDetailForm.get('MoneyInCounterSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Money In Counter Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('PlateGlass').value) {
      if (!this.SumInsuredDetailForm.get('PlateGlassSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Plate Glass Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('NeonSign').value) {
      if (!this.SumInsuredDetailForm.get('NeonSignSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Neon Sign Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('FedilityGuaranteeCover').value) {
      if (!this.SumInsuredDetailForm.get('FedilityGuaranteeCoverSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Fedility Guarantee Cover Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (!this.SumInsuredDetailForm.get('FGNoOfEmployees').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Fedility Guarantee Cover No of employee  is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('PublicLiabilityCover').value) {
      if (!this.SumInsuredDetailForm.get('PublicLiabilityCoverSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Public Liability Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('WorkmensCompensationCover').value) {
      if (!this.SumInsuredDetailForm.get('WorkmensCompensationCoverSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Workmens Compensation Total Monthly Wages is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (!this.SumInsuredDetailForm.get('WCNoOfEmployees').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Workmens Compensation No of Employee is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    if (this.SumInsuredDetailForm.get('PortableEquipmentCover').value) {
      if (!this.SumInsuredDetailForm.get('PortableEquipmentCoverSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Portable Equipment Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.SumInsuredDetailForm.get('Other').value) {
      if (!this.SumInsuredDetailForm.get('OtherSumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Other Sum insured is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (!this.SumInsuredDetailForm.get('OtherDesc').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Other Specify Here.. is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }
    // if (this.SumInsuredDetailForm.get('Building').value){
    //     if (!this.SumInsuredDetailForm.get('BuildingSumInsured').value) {
    //     this.ProductCategoryDetailsAlert.push({
    //       Message: 'Building Sum insured is required.',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     })
    //   }
    // }
    // if (this.SumInsuredDetailForm.get('Building').value){
    //     if (!this.SumInsuredDetailForm.get('BuildingSumInsured').value) {
    //     this.ProductCategoryDetailsAlert.push({
    //       Message: 'Building Sum insured is required.',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     })
    //   }
    // }
    // if (this.SumInsuredDetailForm.get('Building').value){
    //     if (!this.SumInsuredDetailForm.get('BuildingSumInsured').value) {
    //     this.ProductCategoryDetailsAlert.push({
    //       Message: 'Building Sum insured is required.',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     })
    //   }
    // }
    // if (this.SumInsuredDetailForm.get('Building').value){
    //     if (!this.SumInsuredDetailForm.get('BuildingSumInsured').value) {
    //     this.ProductCategoryDetailsAlert.push({
    //       Message: 'Building Sum insured is required.',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     })
    //   }
    // }






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


  // check step three  Field & Invalid Field Error message push in alert Array
  public PreviousPolicyDetailsValidations() {
    this.PrevPolicyDetailAlerts = []

    if (this.RFQRaisedForm.get('PolicyType').value == 'Rollover' || this.RFQRaisedForm.get('PolicyType').value == 'Renewal-Change Company' || this.RFQRaisedForm.get('PolicyType').value == 'Renewal-Same Company') {

      if (this.RFQRaisedForm.get('PrevPolicySumInsured').invalid || this.RFQRaisedForm.get('PrevPolicySumInsured').value == 0) {
        this.PrevPolicyDetailAlerts.push({
          Message: 'Enter Sum Insured',
          CanDismiss: false,
          AutoClose: false,
        })
      }


    }

    if (this.PrevPolicyDetailAlerts.length > 0) {
      this.PreviousPolicyDetailsStepCtrl.setErrors({ required: true });
      return this.PreviousPolicyDetailsStepCtrl;
    } else {
      this.PreviousPolicyDetailsStepCtrl.reset();
      return this.PreviousPolicyDetailsStepCtrl;
    }
  }

  // alert message if step three is not validated
  public PreviousPolicyDetailsError() {
    if (this.PrevPolicyDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PrevPolicyDetailAlerts);
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
   * IF RFQ Sendback & is selected Burglary 
   * then RFQNo. found last two String F1 then hidden Burglary Details
   * @param Field SumInssured Details key
   * @returns 
   */
  public CanDisplayBurglary(Field: string) {

    if (this.DisplayForm && this.DisplayForm?.RFQNo != null && this.DisplayForm?.RFQNo != "") {
      if (Field == 'Burglary' || Field == 'BurglaryCover') {
        if (this.DisplayForm && this.DisplayForm.RFQNo.slice(-2).toLowerCase() == 'f1') {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    }
    else {
      return true;
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
  private _buildForm(data: IFireRaiseDTO) {
    let form = this.fb.group({

      // Basic Details
      Id: [0],
      TransactionId: [0],
      CategoryId: [0],
      CategoryName: [""],
      SubCategoryId: [0],
      SubCategoryCode: [],
      SubCategoryName: [""],
      RFQDate: [""],
      RFQNo: [],
      Type: [''],
      PolicyType: ["", [Validators.required]],

      //proposer details
      ProposerName: [''],
      ProposerMobileNo: [''],
      ProposerEmail: [''],
      PincodeId: [0],
      Pincode: [''],
      CityId: [0],
      CityName: [''],

      // Previous policy Details
      PrevPolicyInsurComp: [''],
      PrevPolicySumInsured: [0],
      PreviousPolicyPremium: [0],
      PreviousPolicyRemark: [''],
      PreviousPolicyStartDate: [''],
      PreviousPolicyEndDate: [''],
      AnyClaiminLast3Year: [false],

      // Product Category Details >>>> Proposer Details
      NatureOfBusiness: [''],
      SolarType: [''],
      GSTNo: [''],
      SumInsured: [0],
      PolicyPeriod: [0],
      ProjectRemark: [''],
      SumInsuredDetail: this._initSumInsuredDetailForm(data.SumInsuredDetail),
      OtherDetail: this._initOtherDetailForm(data.OtherDetail),

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
  private _buildDocumentsForm(items: FireDocumentsDto[] = []): FormArray {
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
  private _initDocumentsForm(item: FireDocumentsDto): FormGroup {
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
        item = new FireDocumentsDto();
      }

      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }

  //Init document formgroup
  private _initOtherDetailForm(item: IFireOtherDetailDto): FormGroup {
    let dF = this.fb.group({
      Id: [0],
      RFQId: [0],
      BuildingAge: [""],
      CarpetArea: [""],
      BasementCoverage: [false],
      OtherDetailRemark: ['']
    })

    if (item) {
      dF.patchValue(item);
    }

    return dF
  }

  //Init document formgroup
  private _initSumInsuredDetailForm(item: ISumInsuredDetailDto): FormGroup {
    let dF = this.fb.group({
      Id: [0],
      RFQId: [0],
      StandardFireCover: [false],
      Building: [false],
      BuildingSumInsured: [0],
      Furniture: [false],
      FurnitureSumInsured: [0],
      ElectricleOrElectronic: [false],
      ElectricleOrElectronicSumInsured: [0],
      GeneralContent: [false],
      GeneralContentSumInsured: [0],
      Solar: [false],
      SolarSumInsured: [0],
      ValuableContents: [false],
      ValuableContentsSumInsured: [0],
      Burglary: [false],
      BurglaryIncludingTheftandRSMD: [false],
      PlantAndMachinery: [false],
      PlantAndMachinerySumInsured: [0],
      MachineryBreakdown: [false],
      MachineryBreakdownSumInsured: [0],
      MachineryLossOfProfit: [false],
      MachineryLossOfProfitGrossProfit: [0],
      StockIncludingRMWIPFG: [false],
      StockIncludingRMWIPFGSumInsured: [0],
      OtherContents: [false],
      OtherContentsSumInsured: [0],
      FireLossOfProfit: [false],
      FireLossOfProfitGrossProfit: [0],
      ElectricInstallation: [false],
      ElectricInstallationSumInsured: [0],
      BreakdownDomesticAppliances: [false],
      BreakdownDomesticSumInsured: [0],
      Other: [false],
      OtherSumInsured: [0],
      OtherDesc: [''],
      BurglaryCover: [false],
      MoneyInsuranceCover: [false],
      MoneyInTransit: [false],
      MoneyInTransitSumInsured: [0],
      MoneyInSafe: [false],
      MoneyInSafeSumInsured: [0],
      MoneyInCounter: [false],
      MoneyInCounterSumInsured: [0],
      OtherCoverage: [false],
      PlateGlass: [false],
      PlateGlassSumInsured: [0],
      NeonSign: [false],
      NeonSignSumInsured: [0],
      FedilityGuaranteeCover: [false],
      FedilityGuaranteeCoverSumInsured: [0],
      FGNoOfEmployees: [0],
      PublicLiabilityCover: [false],
      PublicLiabilityCoverSumInsured: [0],
      WorkmensCompensationCover: [false],
      WorkmensCompensationCoverSumInsured: [0],
      WCNoOfEmployees: [0],
      PortableEquipmentCover: [false],
      PortableEquipmentCoverSumInsured: [0],
    })

    if (item) {
      dF.patchValue(item);
    }

    return dF
  }



  // form changes 
  private _onFormChange() {

    // changes product type
    this.RFQRaisedForm.get('Type').valueChanges.subscribe(val => {

      /**
       * CHange Type All addition Field Is Reset
       */
      this.SumInsuredDetailForm.patchValue({
        StandardFireCover: false,
        Building: false,
        BuildingSumInsured: 0,
        Furniture: false,
        FurnitureSumInsured: 0,
        ElectricleOrElectronic: false,
        ElectricleOrElectronicSumInsured: 0,
        GeneralContent: false,
        GeneralContentSumInsured: 0,
        Solar: false,
        SolarSumInsured: 0,
        ValuableContents: false,
        ValuableContentsSumInsured: 0,
        Burglary: false,
        BurglaryIncludingTheftandRSMD: false,
        PlantAndMachinery: false,
        PlantAndMachinerySumInsured: 0,
        MachineryBreakdown: false,
        MachineryBreakdownSumInsured: 0,
        MachineryLossOfProfit: false,
        MachineryLossOfProfitGrossProfit: 0,
        StockIncludingRMWIPFG: false,
        StockIncludingRMWIPFGSumInsured: 0,
        OtherContents: false,
        OtherContentsSumInsured: 0,
        FireLossOfProfit: false,
        FireLossOfProfitGrossProfit: 0,
        ElectricInstallation: false,
        ElectricInstallationSumInsured: 0,
        BreakdownDomesticAppliances: false,
        BreakdownDomesticSumInsured: 0,
        Other: false,
        OtherSumInsured: 0,
        OtherDesc: '',
        BurglaryCover: false,
        MoneyInsuranceCover: false,
        MoneyInTransit: false,
        MoneyInTransitSumInsured: 0,
        MoneyInSafe: false,
        MoneyInSafeSumInsured: 0,
        MoneyInCounter: false,
        MoneyInCounterSumInsured: 0,
        OtherCoverage: false,
        PlateGlass: false,
        PlateGlassSumInsured: 0,
        NeonSign: false,
        NeonSignSumInsured: 0,
        FedilityGuaranteeCover: false,
        FedilityGuaranteeCoverSumInsured: 0,
        FGNoOfEmployees: 0,
        PublicLiabilityCover: false,
        PublicLiabilityCoverSumInsured: 0,
        WorkmensCompensationCover: false,
        WorkmensCompensationCoverSumInsured: 0,
        WCNoOfEmployees: 0,
        PortableEquipmentCover: false,
        PortableEquipmentCoverSumInsured: 0,
      })

      this.RFQRaisedForm.patchValue({
        SolarType: '',
        NatureOfBusiness: '',
        GSTNo: '',
        PolicyPeriod: 0
      })

      this.RFQRaisedForm.get('OtherDetail').patchValue({
        BuildingAge: null,
        CarpetArea: null,
        BasementCoverage: false,
        OtherDetailRemark: ""
      })

    })

    this.RFQRaisedForm.get('PolicyType').valueChanges.subscribe((val) => {
      if (val == "New") {
      this.RFQRaisedForm.patchValue({
        PrevPolicyInsurComp: "",
        PrevPolicySumInsured: 0,
        PreviousPolicyPremium: 0,
        PreviousPolicyRemark: "",
        PreviousPolicyStartDate: "",
        PreviousPolicyEndDate: "",
        AnyClaiminLast3Year: false,
      })

    }
    });

    this.RFQRaisedForm.get('SolarType').valueChanges.subscribe(val => {
      this.RFQRaisedForm.patchValue({
        NatureOfBusiness: '',
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


    // change pincode
    this.RFQRaisedForm.get('Pincode').valueChanges.subscribe((val) => {
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


    this.SumInsuredDetailForm.get('Building').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        BuildingSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('Furniture').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        FurnitureSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('ElectricleOrElectronic').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        ElectricleOrElectronicSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('GeneralContent').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        GeneralContentSumInsured: 0
      })
    })


    this.SumInsuredDetailForm.get('Solar').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        SolarSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('ValuableContents').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        ValuableContentsSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('Burglary').valueChanges.subscribe((val) => {
      if (val) {
        this.SumInsuredDetailForm.patchValue({
          BurglaryIncludingTheftandRSMD: true
        })
      } else {
        this.SumInsuredDetailForm.patchValue({
          BurglaryIncludingTheftandRSMD: false
        })
      }

    })

    this.SumInsuredDetailForm.get('PlantAndMachinery').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        PlantAndMachinerySumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('MachineryBreakdown').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        MachineryBreakdownSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('MachineryLossOfProfit').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        MachineryLossOfProfitGrossProfit: 0
      })
    })

    this.SumInsuredDetailForm.get('StockIncludingRMWIPFG').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        StockIncludingRMWIPFGSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('OtherContents').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        OtherContentsSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('FireLossOfProfit').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        FireLossOfProfitGrossProfit: 0
      })
    })

    this.SumInsuredDetailForm.get('ElectricInstallation').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        ElectricInstallationSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('BreakdownDomesticAppliances').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        BreakdownDomesticSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('Other').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        OtherSumInsured: 0,
        OtherDesc: '',
      })
    })

    this.SumInsuredDetailForm.get('Building').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        BuildingSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('MoneyInTransit').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        MoneyInTransitSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('MoneyInSafe').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        MoneyInSafeSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('MoneyInCounter').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        MoneyInCounterSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('PlateGlass').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        PlateGlassSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('NeonSign').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        NeonSignSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('FedilityGuaranteeCover').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        FedilityGuaranteeCoverSumInsured: 0,
        FGNoOfEmployees: 0
      })
    })


    this.SumInsuredDetailForm.get('PublicLiabilityCover').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        PublicLiabilityCoverSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('WorkmensCompensationCover').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        WorkmensCompensationCoverSumInsured: 0,
        WCNoOfEmployees: 0,
      })
    })

    this.SumInsuredDetailForm.get('PortableEquipmentCover').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        PortableEquipmentCoverSumInsured: 0
      })
    })

    this.SumInsuredDetailForm.get('StandardFireCover').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        Building: false,
        BuildingSumInsured: 0,
        Furniture: false,
        FurnitureSumInsured: 0,
        PlantAndMachinery: false,
        PlantAndMachinerySumInsured: 0,
        StockIncludingRMWIPFG: false,
        StockIncludingRMWIPFGSumInsured: 0,
        OtherContents: false,
        OtherContentsSumInsured: 0,
      })
    })

    this.SumInsuredDetailForm.get('BurglaryCover').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        Burglary: false,
        BurglaryIncludingTheftandRSMD: false,
      })
    })

    this.SumInsuredDetailForm.get('MoneyInsuranceCover').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        MoneyInTransit: false,
        MoneyInTransitSumInsured: 0,
        MoneyInSafe: false,
        MoneyInSafeSumInsured: 0,
        MoneyInCounter: false,
        MoneyInCounterSumInsured: 0,
      })
    })

    this.SumInsuredDetailForm.get('OtherCoverage').valueChanges.subscribe((val) => {
      this.SumInsuredDetailForm.patchValue({
        PlateGlass: false,
        PlateGlassSumInsured: 0,
        MachineryBreakdown: false,
        MachineryBreakdownSumInsured: 0,
        NeonSign: false,
        NeonSignSumInsured: 0,
        ElectricleOrElectronic: false,
        ElectricleOrElectronicSumInsured: 0,
        FedilityGuaranteeCover: false,
        FedilityGuaranteeCoverSumInsured: 0,
        FGNoOfEmployees: 0,
        PublicLiabilityCover: false,
        PublicLiabilityCoverSumInsured: 0,
        WorkmensCompensationCover: false,
        WorkmensCompensationCoverSumInsured: 0,
        WCNoOfEmployees: 0,
        PortableEquipmentCover: false,
        PortableEquipmentCoverSumInsured: 0,
        Other: false,
        OtherSumInsured: 0,
        OtherDesc: ""
      })
    })

  }

  private _fillMasterList() {

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
    let InsuranceCompanyRule: IFilterRule[] = [ActiveMasterDataRule];

    let InsuranceCompanyAdditionalFilters: IAdditionalFilterObject[] = [
      { key: "CatagoryCode", filterValues: [CategoryCodeEnum.Fire] }
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