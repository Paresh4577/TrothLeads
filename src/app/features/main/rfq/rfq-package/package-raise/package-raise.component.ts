import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ValidationRegex } from '@config/validationRegex.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { Alert, IAdditionalFilterObject, IFilterRule, OrderBySpecs, QuerySpecs } from '@models/common';
import { IPackageDTO, IPackageSumInsuredDetailDTO, RFQPackageDocumentsDto, PackageDTO, IPackageOtherDetailDTO, IPackageSuminnsuredQuestionDTO, IPackageSuminnsuredSubQuestionDTO } from '@models/dtos';
import { ICityPincodeDto } from '@models/dtos/core';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { IUserDto } from '@models/dtos/core/userDto';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { RfqPackageService } from '../rfq-package.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { AuthService } from '@services/auth/auth.service';
import { DialogService } from '@lib/services/dialog.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { CategoryCodeEnum, SalesPersonTypeEnum, SubCategoryCodeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { DisplayedRFQRenewalPackagePolicyType, RFQDocumentsDrpList } from '@config/rfq';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { environment } from 'src/environments/environment';
import { ROUTING_PATH } from '@config/routingPath.config';
import { DisplayedRFQPackagePolicyType } from '@config/rfq';
import { IRfqDoclistDTO, IRfqStaticDataListDTO } from '@models/dtos/config/rfq-common';

const activeMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-package-raise',
  templateUrl: './package-raise.component.html',
  styleUrls: ['./package-raise.component.scss'],
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
export class PackageRaiseComponent {

  //#region public properties

  //Variables
  @ViewChild('DocumentDropdown') public documentDropdown: ElementRef;
  public pagetitle: string = "RFQ (Requisition for Quotation) - Package"; // Page main header title
  public mode: string; // for identify of Raise page is create or edit
  public isExpand: boolean = false;
  public displayForm: any;
  public jewellersBlockPoliciesSumInsuredDetails: IPackageSuminnsuredSubQuestionDTO[];

  // Observable List
  public teamRefUser$: Observable<IUserDto[]>;
  public salesPersonName$: Observable<IUserDto[]> // Observable of user list
  public bdolist$: Observable<IUserDto[]>;
  public bdmlist$: Observable<IUserDto[]>;
  public pincodes$: Observable<ICityPincodeDto[]>;

  //List objects
  public branches: IBranchDto[] = [];
  public insuranceCompany: IInsuranceCompanyDto[];
  public SubCategoryList = [];

  //FormGroup 
  public rfqRaiseForm !: FormGroup;

  //#endregion

  //#region private properties

  private _basicDetailsAlert: Alert[] = [];
  private _productCategoryDetailsAlert: Alert[] = [];
  private _documentAttachmentAlert: Alert[] = [];
  private _atachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  private _teamDetailsAlerts: Alert[] = [];
  private _prevPolicyDetailAlerts: Alert[] = []; // Insurer Query Details field error message

  private _basicDetailsStepCtrl: FormControl = new FormControl();
  private _ProductCategoryDetailsStepCtrl: FormControl = new FormControl();
  private _documentAttachmentStepCtrl = new FormControl()
  private _teamDetailsStepCtrl = new FormControl();
  private _previousPolicyDetailsStepCtrl = new FormControl();

  private _userProfileObj: IMyProfile;
  private _uploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API
  private _phoneNum: RegExp = ValidationRegex.phoneNumReg;
  private _emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  private _destroy$: Subject<any>;
  //#endregion


  //#region  constructor
  constructor(
    private _fb: FormBuilder,
    private _alertservice: AlertsService,
    private _dialog: MatDialog,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _masterListService: MasterListService,
    private _datePipe: DatePipe,
    private _authService: AuthService,
    private _dialogService: DialogService,
    private _rfqPackageService: RfqPackageService,
    private _location: Location,
  ) {
    this._destroy$ = new Subject();
    this.jewellersBlockPoliciesSumInsuredDetails = this._rfqPackageService.DisplaySumInsuredDetailsJewellersBlockPolicies()
  }
  //#endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {


    // Route params data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title'];
    this.mode = data['mode'];
    this.displayForm = data['data'];

    this._authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this._userProfileObj = user
      }
    })

    // build Package form
    this.rfqRaiseForm = this._buildForm(this.displayForm);

    // in case of view mode then all form value is disabled mode
    if (this.mode == "view") {
      this.rfqRaiseForm.disable({ emitEvent: false });
      this.isExpand = true;
    }

    this._fillMasterList();
    this._onFormChange();
    this._sumInsuredDetailValuechanges()
  }


  //#region public-getters

  // get uploaded documents
  public get documents(): FormArray {
    return this.rfqRaiseForm.controls["Documents"] as FormArray;
  }

  public get sumInsuredDetailForm(): FormGroup {
    return this.rfqRaiseForm.controls['SumInsuredDetail'] as FormGroup
  }

  // Document Type List
  public get policyDocumentList(): IRfqDoclistDTO[] {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Package))
  }


  // MiscellaneousPolicyType  List
  public get displayedRFQPackagePolicyType(): IRfqStaticDataListDTO[] {
    if (this.displayForm?.TransactionId) {
      return DisplayedRFQRenewalPackagePolicyType;
    }
    else {
      return DisplayedRFQPackagePolicyType;
    }
  }

  // enum used so return type any
  public get subCategoryCodeEnum(): any {
    return SubCategoryCodeEnum
  }

  /**
   * Only editable in login user is standard user & Sales person type is POSP
   */
  public get canEditableSalesPerson(): boolean {
    if (this._userProfileObj?.UserType == UserTypeEnum.StandardUser && this.mode != 'view') {
      if (this.rfqRaiseForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
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
  public get canEditableBdoBdm(): boolean {
    if (this._userProfileObj?.UserType == UserTypeEnum.StandardUser && this.mode != 'view') {
      if (this.rfqRaiseForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {
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
  public get canEditableSalespersonTypeAndBranch(): boolean {
    if (this._userProfileObj?.UserType == UserTypeEnum.StandardUser && this.mode != 'view') {
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

  public expandCollaps(): void {
    this.isExpand = !this.isExpand;
  }

  // back button
  public backButton(): void {
    this._location.back();
  }

  public autocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, SelectedFor: string): void {

    switch (SelectedFor) {

      case "TeamRef":
        this.rfqRaiseForm.patchValue({
          TeamReferenceId: event.option.value.Id,
          TeamReferenceName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        });
        break;

      case "PINcode":
        this.rfqRaiseForm.patchValue({
          PincodeId: event.option.value.Id,
          Pincode: event.option.value.PinCode,
        });
        break;

      case "Sales":
        this.rfqRaiseForm.patchValue({
          SalesPersonId: event.option.value.Id,
          SalesPersonName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        })
        break;

      case "BDMName":
        this.rfqRaiseForm.patchValue({
          BDMName: event.option.value.FullName,
          BDMId: event.option.value.Id,
        });
        break;

      case "BDOName":
        this.rfqRaiseForm.patchValue({
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
  public openDiolog(type: string, title: string, openFor: string): void {
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
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      type: type,
      title: title,
      ispopup: true,
      filterData: specs.FilterConditions.Rules,
      addFilterData: specs.AdditionalFilters

    };

    const dialogRef = this._dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

        switch (openFor) {

          case "Sales":
            this.rfqRaiseForm.patchValue({
              SalesPersonId: result.Id,
              SalesPersonName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "TeamRef":
            this.rfqRaiseForm.patchValue({
              TeamReferenceId: result.Id,
              TeamReferenceName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "BDMName":
            this.rfqRaiseForm.patchValue({
              BDMName: result.FullName,
              BDMId: result.Id,
            });
            break;

          case "BDOName":
            this.rfqRaiseForm.patchValue({
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

  public openDiologForPINcode(type: string, title: string): void {

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

    const dialogRef = this._dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {

      if (result) {
        this.rfqRaiseForm.patchValue({
          PincodeId: result.Id,
          Pincode: result.PinCode,
        });
      }

    });
  }

  public clearPincode(): void {
    this.rfqRaiseForm.patchValue({
      PincodeId: null,
      Pincode: "",
    });
  }

  public clear(name: string, id: string): void {
    this.rfqRaiseForm.controls[name].setValue("")
    this.rfqRaiseForm.controls[id].setValue(null)
  }

  /**
  * Validation part 
  */

  public basicDetailsValidations(): FormControl {
    this._basicDetailsAlert = []

    if (this.rfqRaiseForm.get('SubCategoryId').value == 0 || this.rfqRaiseForm.get('SubCategoryId').value == null) {
      this._basicDetailsAlert.push({
        Message: 'Select Poduct Sub Category',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.rfqRaiseForm.get('PolicyType').hasError('required')) {
      this._basicDetailsAlert.push({
        Message: 'Select Policy Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this._basicDetailsAlert.length > 0) {
      this._basicDetailsStepCtrl.setErrors({ required: true });
      return this._basicDetailsStepCtrl;
    }
    else {
      this._basicDetailsStepCtrl.reset();
      return this._basicDetailsStepCtrl;
    }

  }

  public basicDetailsError(): void {
    if (this._basicDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this._basicDetailsAlert);
      return;
    }
  }

  public productCategoryDetailsValidations(): FormControl {

    this._productCategoryDetailsAlert = []

    if (this.rfqRaiseForm.get('ProposerName').invalid) {
      this._productCategoryDetailsAlert.push({
        Message: 'Enter Insured Name.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.rfqRaiseForm.get('PincodeId').invalid || this.rfqRaiseForm.get('PincodeId').value == 0) {
      this._productCategoryDetailsAlert.push({
        Message: 'Enter Risk Location/Pin Code.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.rfqRaiseForm.get('ProposerMobileNo').value) {
      this._productCategoryDetailsAlert.push({
        Message: 'Enter Mobile No.',
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (
        !this._phoneNum.test(this.rfqRaiseForm.get('ProposerMobileNo').value)
      ) {
        this._productCategoryDetailsAlert.push({
          Message: 'Mobile No must be 10 digit.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.rfqRaiseForm.get('ProposerEmail').value != "" && this.rfqRaiseForm.get('ProposerEmail').value != null) {
      if (!this._emailValidationReg.test(this.rfqRaiseForm.get('ProposerEmail').value)) {
        this._productCategoryDetailsAlert.push({
          Message: 'Enter Valid Email ID.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }


    if (this.rfqRaiseForm.get('SubCategoryCode').value == SubCategoryCodeEnum.JewellersBlockPolicies) {
      if (this.rfqRaiseForm.get('OtherDetail.IsInsureMultipleLocation').value == null) {
        this._productCategoryDetailsAlert.push({
          Message: 'Select Insure Multiple Location.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    /*
     * HotelPack, HouseHolder, OfficePack, Shopkeepers
    * TO get Question Array from Service file As per selected Subcategory
    * then Validate Checked Question SUm inssued & other field for required field
     */

    if (this.rfqRaiseForm.get('SubCategoryCode').value == SubCategoryCodeEnum.HotelPack ||
      this.rfqRaiseForm.get('SubCategoryCode').value == SubCategoryCodeEnum.HouseHolder ||
      this.rfqRaiseForm.get('SubCategoryCode').value == SubCategoryCodeEnum.OfficePack ||
      this.rfqRaiseForm.get('SubCategoryCode').value == SubCategoryCodeEnum.Shopkeepers) {

      this.filterDisplaySumInsuredDetails().forEach(que => {

        // If Question is checkd then check it s field
        if (this.sumInsuredDetailForm.get(que.questionKey).value) {

          // Check Number & decimal field
          if (que.answerKey && (!this.sumInsuredDetailForm.get(que.answerKey).value || this.sumInsuredDetailForm.get(que.answerKey).value == 0) &&
            (que.answerType == 'decimal' || que.answerType == 'number')) {
            this._productCategoryDetailsAlert.push({
              Message: `${que.question} - ${que.answersLabel} is required.`,
              CanDismiss: false,
              AutoClose: false,
            });
          }

          // Check Description User Entry Fielsd

          if (que.descriptionKey && !this.sumInsuredDetailForm.get(que.descriptionKey).value && que.descriptionType == 'text') {
            this._productCategoryDetailsAlert.push({
              Message: `${que.question} - ${que.descriptionLabel} is required.`,
              CanDismiss: false,
              AutoClose: false,
            });
          }
          // Check Description Numeric field
          if (que.descriptionKey && (!this.sumInsuredDetailForm.get(que.descriptionKey).value || this.sumInsuredDetailForm.get(que.descriptionKey).value == 0) &&
            (que.descriptionType == 'decimal' || que.descriptionType == 'number')) {
            this._productCategoryDetailsAlert.push({
              Message: `${que.question} - ${que.descriptionLabel} is required.`,
              CanDismiss: false,
              AutoClose: false,
            });
          }


        }

      })

    }


    /**
     * For jeweller Details block
     * IF Checked MAin Question Then Check Sub question . 
     * if , Sub question is selected after validate ther Sum inssued field
     */

    if (this.rfqRaiseForm.get('SubCategoryCode').value == SubCategoryCodeEnum.JewellersBlockPolicies) {

      this.jewellersBlockPoliciesSumInsuredDetails.forEach(que => {

        // If Question is checkd then check it s field
        if (this.sumInsuredDetailForm.get(que.questionKey).value) {

          que.subquestion.forEach(subque => {

            // Check Number & decimal field
            if (this.sumInsuredDetailForm.get(subque.questionKey).value) {
              if (subque.answerKey && (!this.sumInsuredDetailForm.get(subque.answerKey).value || this.sumInsuredDetailForm.get(subque.answerKey).value == 0) &&
                (subque.answerType == 'decimal' || subque.answerType == 'number')) {
                this._productCategoryDetailsAlert.push({
                  Message: `${subque.question} - ${subque.answersLabel} is required.`,
                  CanDismiss: false,
                  AutoClose: false,
                });
              }

              // Check Description User Entry Fielsd
              if (subque.descriptionKey && !this.sumInsuredDetailForm.get(subque.descriptionKey).value && subque.descriptionType == 'text') {
                this._productCategoryDetailsAlert.push({
                  Message: `${subque.question} - ${subque.descriptionLabel} is required.`,
                  CanDismiss: false,
                  AutoClose: false,
                });
              }

              // Check Description Numeric field
              if (subque.descriptionKey && (!this.sumInsuredDetailForm.get(subque.descriptionKey).value || this.sumInsuredDetailForm.get(subque.descriptionKey).value == 0) &&
                (subque.descriptionType == 'decimal' || subque.descriptionType == 'number')) {
                this._productCategoryDetailsAlert.push({
                  Message: `${subque.question} - ${subque.descriptionLabel} is required.`,
                  CanDismiss: false,
                  AutoClose: false,
                });
              }
            }
          })
        }
      })

    }


    if (this._productCategoryDetailsAlert.length > 0) {
      this._ProductCategoryDetailsStepCtrl.setErrors({ required: true });
      return this._ProductCategoryDetailsStepCtrl;
    }
    else {
      this._ProductCategoryDetailsStepCtrl.reset();
      return this._ProductCategoryDetailsStepCtrl;
    }

  }

  public productCategoryDetailsError(): void {
    if (this._productCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this._productCategoryDetailsAlert);
    }
  }

  // check step three  Field & Invalid Field Error message push in alert Array
  public previousPolicyDetailsValidations(): FormControl {
    this._prevPolicyDetailAlerts = []

    if (this.rfqRaiseForm.get('PolicyType').value == 'Rollover' || this.rfqRaiseForm.get('PolicyType').value == 'Renewal-Change Company' || this.rfqRaiseForm.get('PolicyType').value == 'Renewal-Same Company') {
      if (this.rfqRaiseForm.get('PreviousPolicyStartDate').value && this.rfqRaiseForm.get('PreviousPolicyEndDate').value && this.rfqRaiseForm.get('PreviousPolicyEndDate').value < this.rfqRaiseForm.get('PreviousPolicyStartDate').value) {
        this._prevPolicyDetailAlerts.push({
          Message: 'Enter Valid Policy End Date',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this._prevPolicyDetailAlerts.length > 0) {
      this._previousPolicyDetailsStepCtrl.setErrors({ required: true });
      return this._previousPolicyDetailsStepCtrl;
    } else {
      this._previousPolicyDetailsStepCtrl.reset();
      return this._previousPolicyDetailsStepCtrl;
    }
  }

  // alert message if step three is not validated
  public previousPolicyDetailsError(): void {
    if (this._prevPolicyDetailAlerts.length > 0) {
      this._alertservice.raiseErrors(this._prevPolicyDetailAlerts);
      return;
    }
  }

  // check step four
  public teamDetailsValidations(): FormControl {
    this._teamDetailsAlerts = [];

    if (this.rfqRaiseForm.get('BranchId').invalid || this.rfqRaiseForm.get('BranchId').value == 0) {
      this._teamDetailsAlerts.push({
        Message: 'Select Branch',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.rfqRaiseForm.get('SalesPersonType').invalid || this.rfqRaiseForm.get('SalesPersonType').value == "") {
      this._teamDetailsAlerts.push({
        Message: 'Select Sales Person Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }


    if (this.rfqRaiseForm.get('SalesPersonName').invalid || this.rfqRaiseForm.get('SalesPersonName').value == "") {
      this._teamDetailsAlerts.push({
        Message: 'Select Sales Person',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.rfqRaiseForm.get('SalesPersonType').value == 'Team Reference') {
      if (this.rfqRaiseForm.get('TeamReferenceName').invalid || this.rfqRaiseForm.get('TeamReferenceName').value == "") {
        this._teamDetailsAlerts.push({
          Message: 'Select Team Reference Name',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (!this.rfqRaiseForm.get('BDMName').value) {
      this._teamDetailsAlerts.push({
        Message: 'BDM Name is Required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.rfqRaiseForm.get('BDOName').value) {
      this._teamDetailsAlerts.push({
        Message: 'BDO Name is Required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this._teamDetailsAlerts.length > 0) {
      this._teamDetailsStepCtrl.setErrors({ required: true });
      return this._teamDetailsStepCtrl;
    } else {
      this._teamDetailsStepCtrl.reset();
      return this._teamDetailsStepCtrl;
    }
  }

  // alert message if step four is not validated
  public teamDetailsError(): void {
    if (this._teamDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this._teamDetailsAlerts);
    }
  }

  /**
   * Document Selection Change
  */
  public onDocumentSelectionChange(selectedValue): void {
    if (this._atachDocumentAlerts.length > 0) {
      this._alertservice.raiseErrors(this._atachDocumentAlerts)
      this.documentDropdown.nativeElement.value = ""
      return;
    }

    let selectedDocument = selectedValue.target.value;
    this.addDocuments(selectedDocument);
    this.documentDropdown.nativeElement.value = ""
  }



  /**
   * Add new row in Document array
  */
  public addDocuments(selectedDocument?: string): void {
    const row: RFQPackageDocumentsDto = new RFQPackageDocumentsDto();
    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.policyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.policyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.policyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = "RFQRaised";
        this.documents.push(this._initDocumentsForm(row));
      }
    }
  }

  /**
 * File Data (policy document that is added)
*/
  public selectDocuments(event, DocIndex: number): void {
    let file = event.target.files[0]

    if (file) {
      this._dataService.UploadFile(this._uploadFileAPI, file).subscribe((res) => {
        if (res.Success) {
          if (DocIndex >= 0) {
            this.documents.controls[DocIndex].patchValue({
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
  public viewDocuments(fileName: string): void {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
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

  public documentAttachmentValidation(): FormControl {
    this._documentAttachmentAlert = []

    this.documents.controls.forEach((item, index) => {
      if (item.get('FileName').hasError('required') || item.get('StorageFilePath').hasError('required')) {
        this._documentAttachmentAlert.push({
          Message: `${item.value.DocumentTypeName} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

    })

    if (this._documentAttachmentAlert.length > 0) {
      this._documentAttachmentStepCtrl.setErrors({ required: true });
      return this._documentAttachmentStepCtrl;
    }
    else {
      this._documentAttachmentStepCtrl.reset();
      return this._documentAttachmentStepCtrl;
    }

  }

  public submitRfq(): void {

    if (this._basicDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this._basicDetailsAlert);
      return;
    }

    if (this._productCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this._productCategoryDetailsAlert);
      return;
    }

    if (this.rfqRaiseForm.get('PolicyType').value == 'Rollover' || this.rfqRaiseForm.get('PolicyType').value == 'Renewal-Change Company' || this.rfqRaiseForm.get('PolicyType').value == 'Renewal-Same Company') {
      if (this._prevPolicyDetailAlerts.length > 0) {
        this._alertservice.raiseErrors(this._prevPolicyDetailAlerts);
        return;
      }
    }

    if (this._teamDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this._teamDetailsAlerts);
      return;
    }

    if (this._documentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this._documentAttachmentAlert);
      return;
    }

    this._dateFormat();

    // submit form
    switch (this.mode) {
      case "create": case "RenewalRFQ":
        this._rfqPackageService.createProposal(this.rfqRaiseForm.value).subscribe((res) => {
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
        this._rfqPackageService.updateProposal(this.rfqRaiseForm.value).subscribe((res) => {
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

  public filterDisplaySumInsuredDetails(): IPackageSuminnsuredQuestionDTO[] {
    let subCategoryWiseDisplaySumInsuredDetails = this._rfqPackageService.DisplaySumInsuredDetailsForSingleColumn(this.rfqRaiseForm.get('SubCategoryCode').value)
    return subCategoryWiseDisplaySumInsuredDetails
  }


  /**
 * When Convert Transaction TO RFQ All Attachments are get
 * Display documents As Per category wise 
 */
  public canDisplayDocuments(DocumentType: string): boolean {
    if (this.mode == 'RenewalRFQ' && this.displayForm && this.displayForm?.TransactionId) {
      let CategoryWiseDocument = this.policyDocumentList.map(doc => doc.DocumentType)
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

  // Build RFQ Package Main Form
  private _buildForm(data: IPackageDTO): FormGroup {
    let form = this._fb.group({
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

      // Proposer Detail
      ProposerName: [""],
      ProposerEmail: [""],
      ProposerMobileNo: [""],
      PincodeId: [, [Validators.required]],
      Pincode: [""],
      CityId: [],
      CityName: [],



      // Insured Detail

      SumInsured: [0],
      ProjectRemark: [""],
      CommunicationAddress: [""],
      RiskLocation: [""],
      NatureOfBusiness: [],


      // Previous Policy Detail (Only for Rollover)
      PrevPolicyInsurComp: [""],
      PrevPolicySumInsured: [0],
      PreviousPolicyPremium: [0],
      PreviousPolicyRemark: [""],
      PreviousPolicyStartDate: [""],
      PreviousPolicyEndDate: [""],

      // Claim Detail
      AnyClaiminLast3Year: [false],

      // Team Details
      BranchId: [0, [Validators.required]],
      BranchName: ['', [Validators.required]],
      SalesPersonType: [""],
      SalesPersonId: [],
      SalesPersonName: ['', [Validators.required]],
      TeamReferenceId: [null],
      TeamReferenceName: ['', [Validators.required]],
      BDOId: [0],
      BDOName: [""],
      BDMId: [0],
      BDMName: [""],


      // Attachment Details
      Documents: this._buildDocumentsForm(data?.Documents),
      SendBackRejectDesc: [''],
      Additionalinformation: [''],



      SumInsuredDetail: this._initSumInsuredDetailForm(data?.SumInsuredDetail),
      OtherDetail: this._initOtherDetailForm(data?.OtherDetail),
    });
    if (data) {
      form.patchValue(data);
    }
    return form;
  }

  //RFQ-Package document Formarray
  private _buildDocumentsForm(items: RFQPackageDocumentsDto[] = []): FormArray {
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
  private _initDocumentsForm(item: RFQPackageDocumentsDto): FormGroup {
    let dF = this._fb.group({
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
    if (item) {
      dF.patchValue(item);
    }
    return dF
  }

  //Init document formgroup
  private _initOtherDetailForm(item: IPackageOtherDetailDTO): FormGroup {
    let dF = this._fb.group({
      Id: [0],
      RFQId: [0],
      NoOfFloor: [""],
      ProductCategoryRemark: [""],
      BuildingAge: [0],
      IsInsureMultipleLocation: [false],

    })

    if (item) {
      dF.patchValue(item);
    }

    return dF
  }

  //Init document formgroup
  private _initSumInsuredDetailForm(item: IPackageSumInsuredDetailDTO): FormGroup {
    let dF = this._fb.group({
      Id: [0],
      RFQId: [0],
      StandardFireCover: [false],
      Building: [false],
      BuildingSumInsured: [0],
      Furniture: [false],
      FurnitureSumInsured: [0],
      ElectricleOrElectronic: [false],
      ElectricleOrElectronicSumInsured: [0],
      StockIncludingRMWIPFG: [false],
      StockIncludingRMWIPFGSumInsured: [0],
      OtherContents: [false],
      OtherContentsSumInsured: [0],
      ValuableContents: [false],
      ValuableContentsSumInsured: [0],
      BreakdownDomesticAppliances: [false],
      BreakdownDomesticSumInsured: [0],
      BurglaryCover: [false],
      Burglary: [false],
      BurglaryIncludingTheftandRSMD: [false],
      BurglarySumInsured: [0],
      Other: [false],
      OtherSumInsured: [0],
      OtherDesc: [""],
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
      EmployeeFidelity: [false],
      EmployeeFidelitySumInsured: [0],
      ThirdPartyFedility: [false],
      ThirdPartyFedilitySumInsured: [0],
      PublicLiabilityCover: [false],
      PublicLiabilityCoverSumInsured: [0],
      WorkmensCompensationCover: [false],
      WorkmensCompensationCoverSumInsured: [0],
      WCNoOfEmployees: [0],
      PortableEquipmentCover: [false],
      PortableEquipmentCoverSumInsured: [0],
      StockInPremises: [false],
      StockTradeInPremises: [false],
      StockTradeInPremisesSumInsured: [0],
      InventorySecurity: [false],
      InventorySecuritySumInsured: [0],
      CurrencyNotes: [false],
      CurrencyNotesSumInsured: [0],
      StockInVaults: [false],
      StockInVaultsSumInsured: [0],
      MedicalExpense: [false],
      MedicalExpenseSumInsured: [0],
      BoilingCasting: [false],
      BoilingCastingSumInsured: [0],
      StockInCustody: [false],
      CustodyOfAuthorisedPerson: [false],
      CustodyOfAuthorisedPersonSumInsured: [0],
      CustodyOfCutters: [false],
      CustodyOfCuttersSumInsured: [0],
      FirstByCover: [false],
      FirstByCoverSumInsured: [0],
      PlaceOfFirstPurchase: [""],
      DeemedExportImport: [false],
      DeemedExportImportSumInsured: [0],
      StockInTransit: [false],
      ByRegisteredPostParcel: [false],
      ByRegisteredPostParcelSumInsured: [0],
      ByAir: [false],
      ByAirSumInsured: [0],
      ByAngadia: [false],
      ByAngadiaSumInsured: [0],
      ByCouriers: [false],
      ByCouriersSumInsured: [0],
      ChandelierCoverage: [false],
      ChandelierCoverageSumInsured: [0],
      BusinessInteruption: [false],
      BusinessInteruptionSumInsured: [0],
      StockInExibition: [false],
      EstimatedAggrigate: [false],
      EstimatedAggrigateSumInsured: [0],
      MachineryBreakdown: [false],
      MachineryBreakdownSumInsured: [0],
      SumInsuredRemark: [""],
    })

    if (item) {
      dF.patchValue(item);
    }

    return dF
  }



  // form changes 
  private _onFormChange(): void {

    // changes product type
    this.rfqRaiseForm.get('SubCategoryId').valueChanges.subscribe(val => {

      let SelectedSubCategory = this.SubCategoryList.find(x => x.Id == val)
      if (SelectedSubCategory) {
        this.rfqRaiseForm.patchValue({
          SubCategoryName: SelectedSubCategory.Name,
          SubCategoryCode: SelectedSubCategory.Code
        })
      }
      else {
        this.rfqRaiseForm.patchValue({
          SubCategoryName: "",
          SubCategoryCode: ""
        })
      }

      this.rfqRaiseForm.patchValue({
        NatureOfBusiness: null
      })

      this.rfqRaiseForm.get('OtherDetail').patchValue({
        BuildingAge: '',
        IsInsureMultipleLocation: false,
        NoOfFloor: '',
        ProductCategoryRemark: '',
      })

      this.rfqRaiseForm.get('SumInsuredDetail').patchValue({
        StandardFireCover: false,
        Building: false,
        BuildingSumInsured: 0,
        Furniture: false,
        FurnitureSumInsured: 0,
        ElectricleOrElectronic: false,
        ElectricleOrElectronicSumInsured: 0,
        StockIncludingRMWIPFG: false,
        StockIncludingRMWIPFGSumInsured: 0,
        OtherContents: false,
        OtherContentsSumInsured: 0,
        ValuableContents: false,
        ValuableContentsSumInsured: 0,
        BreakdownDomesticAppliances: false,
        BreakdownDomesticSumInsured: 0,
        BurglaryCover: false,
        Burglary: false,
        BurglaryIncludingTheftandRSMD: false,
        BurglarySumInsured: 0,
        Other: false,
        OtherSumInsured: 0,
        OtherDesc: '',
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
        EmployeeFidelity: false,
        EmployeeFidelitySumInsured: 0,
        ThirdPartyFedility: false,
        ThirdPartyFedilitySumInsured: 0,
        PublicLiabilityCover: false,
        PublicLiabilityCoverSumInsured: 0,
        WorkmensCompensationCover: false,
        WorkmensCompensationCoverSumInsured: 0,
        WCNoOfEmployees: 0,
        PortableEquipmentCover: false,
        PortableEquipmentCoverSumInsured: 0,
        StockInPremises: false,
        StockTradeInPremises: false,
        StockTradeInPremisesSumInsured: 0,
        InventorySecurity: false,
        InventorySecuritySumInsured: 0,
        CurrencyNotes: false,
        CurrencyNotesSumInsured: 0,
        StockInVaults: false,
        StockInVaultsSumInsured: 0,
        MedicalExpense: false,
        MedicalExpenseSumInsured: 0,
        BoilingCasting: false,
        BoilingCastingSumInsured: 0,
        StockInCustody: false,
        CustodyOfAuthorisedPerson: false,
        CustodyOfAuthorisedPersonSumInsured: 0,
        CustodyOfCutters: false,
        CustodyOfCuttersSumInsured: 0,
        FirstByCover: false,
        FirstByCoverSumInsured: 0,
        PlaceOfFirstPurchase: '',
        DeemedExportImport: false,
        DeemedExportImportSumInsured: 0,
        StockInTransit: false,
        ByRegisteredPostParcel: false,
        ByRegisteredPostParcelSumInsured: 0,
        ByAir: false,
        ByAirSumInsured: 0,
        ByAngadia: false,
        ByAngadiaSumInsured: 0,
        ByCouriers: false,
        ByCouriersSumInsured: 0,
        ChandelierCoverage: false,
        ChandelierCoverageSumInsured: 0,
        BusinessInteruption: false,
        BusinessInteruptionSumInsured: 0,
        StockInExibition: false,
        EstimatedAggrigate: false,
        EstimatedAggrigateSumInsured: 0,
        MachineryBreakdown: false,
        MachineryBreakdownSumInsured: 0,
        SumInsuredRemark: '',
      })

    })

    this.rfqRaiseForm.get('PolicyType').valueChanges.subscribe(val => {
      if (val == "New"){
      this.rfqRaiseForm.patchValue({
        PrevPolicyInsurComp: "",
        PrevPolicySumInsured: 0,
        PreviousPolicyPremium: 0,
        PreviousPolicyRemark: "",
        PreviousPolicyStartDate: "",
        PreviousPolicyEndDate: "",
        AnyClaiminLast3Year: false,
      })
    }
    })

    // change sales person
    this.rfqRaiseForm.get('SalesPersonName').valueChanges.subscribe((val) => {

      let salesPersonListSpecs = this._salesPersonListAPIfilter();
      salesPersonListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })

      this.salesPersonName$ = this._masterListService
        .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", salesPersonListSpecs.FilterConditions.Rules,salesPersonListSpecs.AdditionalFilters)
        .pipe(
          takeUntil(this._destroy$),
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
    this.rfqRaiseForm.get('TeamReferenceName').valueChanges.subscribe(
      (val) => {

        let teamReferenceListSpecs = this._teamReferenceListAPIfilter();
        teamReferenceListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })

        this.teamRefUser$ = this._masterListService
          .getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', "", teamReferenceListSpecs.FilterConditions.Rules, teamReferenceListSpecs.AdditionalFilters)
          .pipe(
            takeUntil(this._destroy$),
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

    this.rfqRaiseForm.get('TeamReferenceId').valueChanges.subscribe(
      (val) => {
        if (!val && this._userProfileObj.UserType == UserTypeEnum.StandardUser && this.rfqRaiseForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {
          this.rfqRaiseForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );


    this.rfqRaiseForm.get('SalesPersonId').valueChanges.subscribe(
      (val) => {
        if (!val && this._userProfileObj.UserType == UserTypeEnum.StandardUser && this.rfqRaiseForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
          this.rfqRaiseForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );

    this.rfqRaiseForm.get('Pincode').valueChanges.subscribe((val) => {
      this.pincodes$ = this._masterListService.getFilteredPincodeList(val).pipe(
        takeUntil(this._destroy$),
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
     * Sales person Type - Direct"
     * Selected branch BQP need to auto fetch under sales person
     */
    this.rfqRaiseForm.get('BranchId').valueChanges.subscribe((val) => {
      this._teamDetailsForStandardUser()
    })


    this.rfqRaiseForm.get('SalesPersonType').valueChanges.subscribe((val) => {
      this._teamDetailsForStandardUser()
    })

    /**
    * selected branch All BDO from user
    */
    this.rfqRaiseForm.get('BDOName').valueChanges.subscribe((val) => {
      let bdoListSpecs = this._bdoListAPIfilter();
      bdoListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })

      this.bdolist$ = this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', bdoListSpecs.FilterConditions.Rules, bdoListSpecs.AdditionalFilters).pipe(
        takeUntil(this._destroy$),
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
    this.rfqRaiseForm.get('BDMName').valueChanges.subscribe((val) => {
      
      let bdmListSpecs = this._bdmListAPIfilter();
      bdmListSpecs.AdditionalFilters.push({ key: "FullName", filterValues: [val] })

      this.bdmlist$ = this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.User.List, 'FirstName', '', bdmListSpecs.FilterConditions.Rules, bdmListSpecs.AdditionalFilters).pipe(
        takeUntil(this._destroy$),
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

  private _sumInsuredDetailValuechanges(): void {

    this.sumInsuredDetailForm.get('Building').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        BuildingSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('Furniture').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        FurnitureSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('ElectricleOrElectronic').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        ElectricleOrElectronicSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('StockIncludingRMWIPFG').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        StockIncludingRMWIPFGSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('OtherContents').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        OtherContentsSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('ValuableContents').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        ValuableContentsSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('BreakdownDomesticAppliances').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        BreakdownDomesticSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('Burglary').valueChanges.subscribe((val) => {
      if (val) {
        this.sumInsuredDetailForm.patchValue({
          BurglaryIncludingTheftandRSMD: true
        })
      } else {
        this.sumInsuredDetailForm.patchValue({
          BurglaryIncludingTheftandRSMD: false
        })

      }
    })

    this.sumInsuredDetailForm.get('Other').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        OtherSumInsured: 0,
        OtherDesc: ''
      })
    })

    this.sumInsuredDetailForm.get('MoneyInTransit').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        MoneyInTransitSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('MoneyInSafe').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        MoneyInSafeSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('MoneyInCounter').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        MoneyInCounterSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('PlateGlass').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        PlateGlassSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('NeonSign').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        NeonSignSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('FedilityGuaranteeCover').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        FedilityGuaranteeCoverSumInsured: 0,
        FGNoOfEmployees: 0
      })
    })

    this.sumInsuredDetailForm.get('EmployeeFidelity').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        EmployeeFidelitySumInsured: 0,
        FGNoOfEmployees: 0
      })
    })

    this.sumInsuredDetailForm.get('ThirdPartyFedility').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        ThirdPartyFedilitySumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('PublicLiabilityCover').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        PublicLiabilityCoverSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('WorkmensCompensationCover').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        WorkmensCompensationCoverSumInsured: 0,
        WCNoOfEmployees: 0,
      })
    })

    this.sumInsuredDetailForm.get('PortableEquipmentCover').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        PortableEquipmentCoverSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('StockTradeInPremises').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        StockTradeInPremisesSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('InventorySecurity').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        InventorySecuritySumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('CurrencyNotes').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        CurrencyNotesSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('StockInVaults').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        StockInVaultsSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('MedicalExpense').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        MedicalExpenseSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('BoilingCasting').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        BoilingCastingSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('CustodyOfAuthorisedPerson').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        CustodyOfAuthorisedPersonSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('CustodyOfCutters').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        CustodyOfCuttersSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('FirstByCover').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        FirstByCoverSumInsured: 0,
        PlaceOfFirstPurchase: ""
      })
    })

    this.sumInsuredDetailForm.get('DeemedExportImport').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        DeemedExportImportSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('ByRegisteredPostParcel').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        ByRegisteredPostParcelSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('ByAir').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        ByAirSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('ByAngadia').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        ByAngadiaSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('ByCouriers').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        ByCouriersSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('ChandelierCoverage').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        ChandelierCoverageSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('BusinessInteruption').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        BusinessInteruptionSumInsured: 0
      })
    })

    this.sumInsuredDetailForm.get('EstimatedAggrigate').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({ EstimatedAggrigateSumInsured: 0 })
    })

    this.sumInsuredDetailForm.get('MachineryBreakdown').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({ MachineryBreakdownSumInsured: 0 })
    })


    /*
    Jewelry Block Main question Change value
    */
    this.sumInsuredDetailForm.get('StockInPremises').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        InventorySecurity: false,
        StockTradeInPremises: false,
        CurrencyNotes: false,
        StockInVaults: false,
        MedicalExpense: false,
        BoilingCasting: false,
      })
    })

    this.sumInsuredDetailForm.get('StockInCustody').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        CustodyOfAuthorisedPerson: false,
        CustodyOfCutters: false,
        FirstByCover: false,
        DeemedExportImport: false,
      })
    })

    this.sumInsuredDetailForm.get('StockInTransit').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        ByRegisteredPostParcel: false,
        ByAir: false,
        ByAngadia: false,
        ByCouriersSumInsured: 0,
      })
    })

    this.sumInsuredDetailForm.get('StandardFireCover').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        Building: false,
        Furniture: false,
        OtherContents: false,
        ChandelierCoverage: false,
        BusinessInteruption: false,
      })
    })

    this.sumInsuredDetailForm.get('BurglaryCover').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        Burglary: false,
      })
    })

    this.sumInsuredDetailForm.get('FedilityGuaranteeCover').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        EmployeeFidelity: false,
        ThirdPartyFedility: false,
      })
    })

    this.sumInsuredDetailForm.get('StockInExibition').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        EstimatedAggrigate: false,
      })
    })

    this.sumInsuredDetailForm.get('OtherCoverage').valueChanges.subscribe((val) => {
      this.sumInsuredDetailForm.patchValue({
        PlateGlass: false,
        PortableEquipmentCover: false,
        NeonSign: false,
        ElectricleOrElectronic: false,
        WorkmensCompensationCover: false,
        PublicLiabilityCover: false,
        MoneyInTransit: false,
        MachineryBreakdown: false,
        Other: false,
      })
    })

  }

  private _fillMasterList(): void {
    // fill Product Type
    let SubCategoryRule: IFilterRule[] = [activeMasterDataRule,
      { Field: "Category.Code", Operator: "eq", Value: CategoryCodeEnum.Package }
    ]
    let OrderBySpecs: OrderBySpecs[] = [{ field: "SrNo", direction: "asc" }]

    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.SubCategory.List, 'Name', '', SubCategoryRule, [], OrderBySpecs)
      .subscribe(res => {
        if (res.Success) {
          this.SubCategoryList = res.Data.Items
        }
      })

    // Fill Insurance Company
    let InsuranceCompanyRule: IFilterRule[] = [{ Field: 'Status', Operator: 'eq', Value: 1, }];
    let InsuranceCompanyAdditionalFilters: IAdditionalFilterObject[] = [{ key: "CatagoryCode", filterValues: [CategoryCodeEnum.Package] }]

    this._masterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.InsuranceCompany.list, 'Name', "", InsuranceCompanyRule, InsuranceCompanyAdditionalFilters)
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.insuranceCompany = res.Data.Items
          } else {
            this.insuranceCompany = []
          }
        } else {
          this.insuranceCompany = []
        }
      });

    // fill Branch
    this._masterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List + "/true", 'Name', "", [activeMasterDataRule])
      .subscribe(res => {
        if (res.Success) {
          this.branches = res.Data.Items

          /**
           * After Get Branch list Fill Team details 
           */
          if (this.mode == 'create') {
            this._teamDetailsInfo()
          }
        }
      });
  }

  private _dateFormat(): void {
    this.rfqRaiseForm.patchValue({
      ProjectStartDate: this._datePipe.transform(this.rfqRaiseForm.get('ProjectStartDate')?.value, 'yyyy-MM-dd'),
      PreviousPolicyStartDate: this._datePipe.transform(this.rfqRaiseForm.get('PreviousPolicyStartDate')?.value, 'yyyy-MM-dd'),
      PreviousPolicyEndDate: this._datePipe.transform(this.rfqRaiseForm.get('PreviousPolicyEndDate')?.value, 'yyyy-MM-dd'),
    }, { emitEvent: false })
  }

  // Team details from MyProfile
  private _teamDetailsInfo(): void {
    this._authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this._userProfileObj = user
        // set Branch details
        this.rfqRaiseForm.patchValue({
          BranchId: user.BranchId,
          BranchName: user.BranchName,
        });

        // ************* set required field from user profile data ************* \\
        // set User type from user profile
        if (user.UserType == UserTypeEnum.Agent) {

          this.rfqRaiseForm.patchValue({
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
          this.rfqRaiseForm.patchValue({
            TeamReferenceId: user.Id,
            TeamReferenceName: user.FullName,
            SalesPersonType: 'Team Reference',
            BDMId: user.BDMId,
            BDMName: user.BDMName,
            BDOId: user.BDOId,
            BDOName: user.BDOName,
          }, { emitEvent: false });

          if (this.rfqRaiseForm.value?.BranchId) {

            let LoginUserBranch = this.branches.find(b => b.Id == this.rfqRaiseForm.value?.BranchId)
            if (LoginUserBranch) {
              this.rfqRaiseForm.patchValue({
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

  private _teamDetailsForStandardUser(): void {
    if (this._userProfileObj.UserType == UserTypeEnum.StandardUser) {

      /**
       * SalesPersonType Direct sales person is Selected branch bqp
       * Other Field is null
       */
      if (this.rfqRaiseForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {


        let LoginUserBranch = this.branches.find(b => b.Id == this.rfqRaiseForm.get('BranchId').value)


        if (LoginUserBranch) {
          this.rfqRaiseForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.rfqRaiseForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.rfqRaiseForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });

      } else if (this.rfqRaiseForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {

        this.rfqRaiseForm.patchValue({
          SalesPersonId: null,
          SalesPersonName: null,
          TeamReferenceId: null,
          TeamReferenceName: null,
        });


        /**
         * SalesPersonType TeamReference sales person is Selected branch bqp
         * Other Field is null
         */
      } else if (this.rfqRaiseForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {

        let LoginUserBranch = this.branches.find(b => b.Id == this.rfqRaiseForm.value?.BranchId)
        if (LoginUserBranch) {
          this.rfqRaiseForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.rfqRaiseForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.rfqRaiseForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });
      }

      this.rfqRaiseForm.patchValue({
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
    if (this.rfqRaiseForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [activeMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.rfqRaiseForm.get('BranchId').value, }
      ]
    }

    if (this.rfqRaiseForm.get('SalesPersonType').value == "POSP") {
      specs.FilterConditions.Rules = [
        activeMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.rfqRaiseForm.get('BranchId').value, }
      ];
    }


    if (this.rfqRaiseForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.rfqRaiseForm.get('SalesPersonType').value == "POSP") {
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
    if (this.rfqRaiseForm.get('SalesPersonType').value == "Team Reference") {
      specs.FilterConditions.Rules = [activeMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.rfqRaiseForm.get('BranchId').value, }
      ];
    }

    if (this.rfqRaiseForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.rfqRaiseForm.get('SalesPersonType').value == "Team Reference") {
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

    if (this.rfqRaiseForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [activeMasterDataRule];
    }

    if (this.rfqRaiseForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDOOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.rfqRaiseForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.rfqRaiseForm.get('BranchId').value?.toString()] })
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

    if (this.rfqRaiseForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [activeMasterDataRule];
    }

    if (this.rfqRaiseForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDMOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.rfqRaiseForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.rfqRaiseForm.get('BranchId').value?.toString()] })
      }
    }

    return specs;
  }
  //#endregion private-methods

}