import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { DisplayedLifeCategoryType, DisplayedLifeOccupation, DisplayedLifePolicyType, DisplayedLifeRenewalPolicyType, DisplayedLifePremiumInstallmentType, DisplayedLifePremiumPaymentType, DisplayedLifeRelation } from '@config/rfq';
import { ROUTING_PATH } from '@config/routingPath.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert, IAdditionalFilterObject, IFilterRule, OrderBySpecs, QuerySpecs } from '@models/common';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { LifeDocumentsDto, ILifeRaiseDTO, LifeRaiseDTO, LifeMemberDTO } from '@models/dtos';
import { LifeExistingPolicyDetailsDto, ILifeExistingPolicyDetailsDto } from '@models/dtos';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { IUserDto } from '@models/dtos/core/userDto';
import { AuthService } from '@services/auth/auth.service';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { CategoryCodeEnum, SalesPersonTypeEnum, SubCategoryCodeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { environment } from 'src/environments/environment';
import { RfqLifeService } from '../rfq-life.service';
import { ValidationRegex } from '@config/validationRegex.config';
import { RFQDocumentsDrpList } from '@config/rfq';
import * as moment from 'moment';

const ActiveMasterDataRule: IFilterRule = {
  Field: 'Status',
  Operator: 'eq',
  Value: 1
}

@Component({
  selector: 'gnx-life-raise',
  templateUrl: './life-raise.component.html',
  styleUrls: ['./life-raise.component.scss'],
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
export class LifeRaiseComponent {
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  //Variables
  pagetitle: string; // Page main header title
  mode: string; // for identify of Raise page is create or edit
  setminBirthDate: Date; //Max DOB
  setmaxBirthDate: Date = new Date(); //Max DOB

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  phoneNum: RegExp = ValidationRegex.phoneNumReg;
  isExpand: boolean = false;
  UserProfileObj: IMyProfile;
  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message

  // Observable List
  TeamRefUser$: Observable<IUserDto[]>;
  salesPersonName$: Observable<IUserDto[]> // Observable of user list

  DropdownMaster: dropdown;
  //FormGroup 
  RFQLifeForm !: FormGroup;
  RFQLife: ILifeRaiseDTO
  destroy$: Subject<any>;

  //List objects
  Branchs: IBranchDto[] = [];
  InsuranceCompany: IInsuranceCompanyDto[];
  SubCategoryList = [];

  BasicDetailsAlert: Alert[] = [];
  ProductCategoryDetailsAlert: Alert[] = [];
  ExistingLifeInsurancePolicyDetailsAlert: Alert[] = [];
  DocumentAttachmentAlert: Alert[] = [];
  TeamDetailsAlert: Alert[] = [];

  BasicDetailsStepCtrl = new FormControl(); // Step 1 Control
  ProductCategoryDetailsStepCtrl = new FormControl();
  ExistingLifeInsurancePolicyStepCtrl = new FormControl();
  DocumentAttachmentStepCtrl = new FormControl()
  TeamDetailsStepCtrl = new FormControl();

  BDMlist$: Observable<IUserDto[]>;
  BDOlist$: Observable<IUserDto[]>;

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
    private _RFQService: RfqLifeService,
    private _Location: Location,
  ) {
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();

    this.setminBirthDate = new Date(Date.now());
  }
  //#endregion constructor


  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    this.RFQLife = new LifeRaiseDTO();

    // Route params data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title'];
    this.mode = data['mode'];

    if (this.mode == "edit" || this.mode == "view" || this.mode == "RenewalRFQ") {
      this.RFQLife = data['data'];
      this.RFQLife.Members = this.RFQLife.Members.filter(m => m.IsLifeAssured == true)

      if (this.RFQLife.SubCategoryCode == this.SubCategoryCodeEnum.ChildPlan) {
        this.setminBirthDate = new Date(this.setminBirthDate.setFullYear(this.setminBirthDate.getFullYear() - 18));
      }
      else {
        this.setminBirthDate = new Date(Date.now());
      }
    }
    this.RFQLifeForm = this._buildRFQLifeForm(this.RFQLife);

    // in case of view mode then all form value is disabled mode
    if (this.mode == "view") {
      this.RFQLifeForm.disable()
    }

    if (this.mode == "create") {
      this.Addmember(true)

      this.RFQLifeForm.patchValue({
        Stage: 'RFQRaised'
      })
    }
    this._fillMasterList()
    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.UserProfileObj = user
      }
    })

    // in case of view mode then all form value is disabled mode
    if (this.mode == "view") {
      this.RFQLifeForm.disable()
      this.isExpand = true;
    }

    this._onFormChange();
    if (this.RFQLifeForm.value?.SubCategoryCode == SubCategoryCodeEnum.TermPlan || this.mode == 'view') {
      this.RFQLifeForm.get('SameAsPolicyHolder').disable({ emitEvent: false })
    } else {
      this.RFQLifeForm.get('SameAsPolicyHolder').enable({ emitEvent: false })
    }
  }


  get f() {
    return this.RFQLifeForm.controls;
  }

  get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum
  }
  get DisplayedLifeCategoryType() {
    let subCategoryCode = this.RFQLifeForm.get('SubCategoryCode').value
    if (subCategoryCode) {
      const subCategoryObj = DisplayedLifeCategoryType.find(subCat => subCat.SubCategoryCode === subCategoryCode);
      if (subCategoryObj) {
        return subCategoryObj.items
      } else {
        return [];
      }
    } else {
      return [];
    }
  }

  get DisplayedLifePolicyType() {
    if (this.RFQLife?.TransactionId) {
      return DisplayedLifeRenewalPolicyType;
    }
    else {
      return DisplayedLifePolicyType;
    }
  }

  get LifeAssuredmember() {
    return this.RFQLifeForm.controls["Members"] as FormArray;
  }

  get Documents() {
    return this.RFQLifeForm.controls["Documents"] as FormArray;
  }

  // Document Type List
  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Life))
  }

  get DisplayedLifePremiumPaymentType() {
    return DisplayedLifePremiumPaymentType
  }

  get DisplayedLifePremiumInstallmentType() {
    return DisplayedLifePremiumInstallmentType
  }
  get DisplayedLifeOccupation() {
    return DisplayedLifeOccupation
  }
  get DisplayedLifeRelation() {
    return DisplayedLifeRelation
  }

  /**
 * Only editable in login user is standard user & Sales person type is POSP
 */
  get canEditableSalesPerson() {
    if (this.UserProfileObj?.UserType == UserTypeEnum.StandardUser) {
      if (this.RFQLifeForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
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
      if (this.RFQLifeForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {
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

  public SubmitRfqLife() {

    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
      return;
    }

    if (this.ExistingLifeInsurancePolicyDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ExistingLifeInsurancePolicyDetailsAlert);
      return;
    }
    if (this.TeamDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.TeamDetailsAlert);
      return;
    }
    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }


    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }

    this._dateFormat();

    /**
     * Enable Field 
     */
    this.RFQLifeForm.get('SameAsPolicyHolder').enable({ emitEvent: false })


    let SubmitFormValue = JSON.parse(JSON.stringify(this.RFQLifeForm.value))

    if (SubmitFormValue.SumInsured.toString() == "") {
      SubmitFormValue.SumInsured = null
    }

    if (SubmitFormValue.InvestmentAmountPerYear.toString() == "") {
      SubmitFormValue.InvestmentAmountPerYear = null
    }

    // submit form
    switch (this.mode) {
      case "create": case "RenewalRFQ":
        this._RFQService.CreateProposal(SubmitFormValue).subscribe((res) => {
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

            if (this.RFQLifeForm.value?.SubCategoryCode == SubCategoryCodeEnum.TermPlan) {
              this.RFQLifeForm.get('SameAsPolicyHolder').disable({ emitEvent: false })
            } else {
              this.RFQLifeForm.get('SameAsPolicyHolder').enable({ emitEvent: false })
            }
          }
        })
        break;

      case "edit":
        this._RFQService.UpdateProposal(SubmitFormValue).subscribe((res) => {
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

            if (this.RFQLifeForm.value?.SubCategoryCode == SubCategoryCodeEnum.TermPlan) {
              this.RFQLifeForm.get('SameAsPolicyHolder').disable({ emitEvent: false })
            } else {
              this.RFQLifeForm.get('SameAsPolicyHolder').enable({ emitEvent: false })
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

  /**
   * Add bt deafult One Member for Life Assured
   */
  public Addmember(boolean) {

    let Member: LifeMemberDTO = new LifeMemberDTO()
    Member.IsLifeAssured = boolean
    this.LifeAssuredmember.push(this._initPolicyPersonForm(Member))

  }

  /**
   * Add bt deafult One Member for Life Assured
   */
  public AddExistingPolicyDetails() {

    let ExistingPolicyDetails: ILifeExistingPolicyDetailsDto = new LifeExistingPolicyDetailsDto()

    let LifeAssuedMemberIndex = this.LifeAssuredmember.controls.findIndex(member => member.value.IsLifeAssured == true)

    if (this.ExistingLifeInsurancePolicyDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ExistingLifeInsurancePolicyDetailsAlert)
      return
    }

    if (LifeAssuedMemberIndex >= 0) {

      let ExistingPolicyDetailsFormArray = this.LifeAssuredmember.controls[LifeAssuedMemberIndex].get('ExistingPolicyDetails') as FormArray
      ExistingPolicyDetailsFormArray.push(this._initExistingPolicyDetailsForm(ExistingPolicyDetails))
    }

  }

  public RemoveExistingPolicyDetails(LifeAssuedMemberIndex: number, index: number) {
    this._dialogService.confirmDialog({
      title: 'Are You Sure?',
      message: "You won't be able to revert this",
      confirmText: 'Yes, Delete!',
      cancelText: 'No',
    })
      .subscribe((res) => {
        if (res) {
          if (LifeAssuedMemberIndex >= 0) {
            let ExistingPolicyDetailsFormArray = this.LifeAssuredmember.controls[LifeAssuedMemberIndex].get('ExistingPolicyDetails') as FormArray
            ExistingPolicyDetailsFormArray.removeAt(index)
          }
        }
      });
  }



  public AutocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, SelectedFor: string): void {

    switch (SelectedFor) {

      case "TeamRef":
        this.RFQLifeForm.patchValue({
          TeamReferenceId: event.option.value.Id,
          TeamReferenceName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        });
        break;

      case "Sales":
        this.RFQLifeForm.patchValue({
          SalesPersonId: event.option.value.Id,
          SalesPersonName: event.option.value.FullName,
          BDMName: event.option.value.BDMName,
          BDMId: event.option.value.BDMId,
          BDOName: event.option.value.BDOName,
          BDOId: event.option.value.BDOId,
        })
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
            this.RFQLifeForm.patchValue({
              SalesPersonId: result.Id,
              SalesPersonName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "TeamRef":
            this.RFQLifeForm.patchValue({
              TeamReferenceId: result.Id,
              TeamReferenceName: result.FullName,
              BDMName: result.BDMName,
              BDMId: result.BDMId,
              BDOName: result.BDOName,
              BDOId: result.BDOId,
            });
            break;

          case "BDMName":
            this.RFQLifeForm.patchValue({
              BDMName: result.FullName,
              BDMId: result.Id,
            });
            break;

          case "BDOName":
            this.RFQLifeForm.patchValue({
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
    this.RFQLifeForm.controls[name].setValue("")
    this.RFQLifeForm.controls[id].setValue(null)
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
    const row: LifeDocumentsDto = new LifeDocumentsDto();
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
  public SelectDocuments(event, index: number) {
    let file = event.target.files[0]

    if (file) {
      this._dataService.UploadFile(this.UploadFileAPI, file).subscribe((res) => {
        if (res.Success) {

          this.Documents.controls[index].patchValue({
            FileName: res.Data.FileName,
            StorageFileName: res.Data.StorageFileName,
            StorageFilePath: res.Data.StorageFilePath,
            Stage: "RFQRaised"
          })

          this._alertservice.raiseSuccessAlert(res.Message);
        }
        else {
          this._alertservice.raiseErrors(res.Alerts);
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

  /**
   * Validation part 
   */


  public BasicDetailsValidations() {
    this.BasicDetailsAlert = []

    if (this.RFQLifeForm.get('SubCategoryId').value == 0 || this.RFQLifeForm.get('SubCategoryId').value == null) {
      this.BasicDetailsAlert.push({
        Message: 'Select Poduct Sub Category',
        CanDismiss: false,
        AutoClose: false,
      })
    }



    if (this.RFQLifeForm.get('PolicyType').hasError('required')) {
      this.BasicDetailsAlert.push({
        Message: 'Select Policy Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQLifeForm.get('SubCategoryCode').value == SubCategoryCodeEnum.InvestmentPlan
      || this.RFQLifeForm.get('SubCategoryCode').value == SubCategoryCodeEnum.RetirementPlan) {
      if (!this.RFQLifeForm.get('CategoryType').value) {
        this.BasicDetailsAlert.push({
          Message: 'Select Category Type',
          CanDismiss: false,
          AutoClose: false,
        })
      }
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

    if (this.RFQLifeForm.get('SubCategoryCode').value == SubCategoryCodeEnum.TermPlan) {
      if (!this.RFQLifeForm.get('SumInsured').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Sum Assured  is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    } else {
      if (!this.RFQLifeForm.get('InvestmentAmountPerYear').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Investment amount per year is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }


    if (!this.RFQLifeForm.get('ProposerMobileNo').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Proposer Mobile No is required.',
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (
        !this.phoneNum.test(this.RFQLifeForm.get('ProposerMobileNo').value)
      ) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Mobile Number must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (!this.RFQLifeForm.get('ProposerEmail').value) {
      // this.ProductCategoryDetailsAlert.push({
      //   Message: 'Email ID is required.',
      //   CanDismiss: false,
      //   AutoClose: false,
      // })
    } else {
      if (
        !this.emailValidationReg.test(this.RFQLifeForm.get('ProposerEmail').value)
      ) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Enter Valid Email ID',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (!this.RFQLifeForm.get('PolicyPeriod').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Policy Term-Year is required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQLifeForm.get('PremiumPaymentType').value == null || this.RFQLifeForm.get('PremiumPaymentType').value.toString() == "") {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Premium Payment Type is required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.RFQLifeForm.get('PremiumPayingTerm').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Premium Paying Term is required.',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.RFQLifeForm.get('Gender').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Gender is required (Policy Holder).',
        CanDismiss: false,
        AutoClose: false,
      })
    }
    if (!this.RFQLifeForm.get('ProposerName').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Name is required (Policy Holder).',
        CanDismiss: false,
        AutoClose: false,
      })
    }
    if (!this.RFQLifeForm.get('DOB').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Date of Birth is required (Policy Holder).',
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (this._datePipe.transform(this.RFQLifeForm.get('DOB').value, 'yyyy-MM-dd') > this._datePipe.transform(this.setmaxBirthDate, 'yyyy-MM-dd')) {
        this.ProductCategoryDetailsAlert.push({
          Message: `Future date not allow Date of birth.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (!this.RFQLifeForm.get('Occupation').value) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Occupation is required (Policy Holder).',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.RFQLifeForm.get('AnnualIncome').value == null ||
      this.RFQLifeForm.get('AnnualIncome').value.toString() == "" ||
      this.RFQLifeForm.get('AnnualIncome').value < 0) {
      this.ProductCategoryDetailsAlert.push({
        Message: 'Annual Income is required (Policy Holder).',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    this.LifeAssuredmember.controls.forEach(m => {

      if (m.value.IsLifeAssured) {

        if (!m.get('Gender').value) {
          this.ProductCategoryDetailsAlert.push({
            Message: 'Gender is required (Life Assured).',
            CanDismiss: false,
            AutoClose: false,
          })
        }
        if (!m.get('Name').value) {
          this.ProductCategoryDetailsAlert.push({
            Message: 'Name is required (Life Assured).',
            CanDismiss: false,
            AutoClose: false,
          })
        }
        if (!m.get('DOB').value) {
          this.ProductCategoryDetailsAlert.push({
            Message: 'Date of Birth is required (Life Assured).',
            CanDismiss: false,
            AutoClose: false,
          })
        } else {
          if (this._datePipe.transform(this.RFQLifeForm.get('DOB').value, 'yyyy-MM-dd') > this._datePipe.transform(this.setmaxBirthDate, 'yyyy-MM-dd')) {
            this.ProductCategoryDetailsAlert.push({
              Message: `Future date not allow Date of Birth (Life Assured).`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }
        if (m.get('DOB').value && this.RFQLifeForm.get('SubCategoryCode').value == SubCategoryCodeEnum.ChildPlan) {
          if (!this.BirthdateCheck(m.get('DOB').value)) {
            this.ProductCategoryDetailsAlert.push({
              Message: 'Child Plan - Not allow for More then 18 Year of Child(Life Assured)',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }

        if (m.get('SmokerTibco').value == null) {
          this.ProductCategoryDetailsAlert.push({
            Message: 'Habbit of Smoking/ Tobacco is required (Life Assured).',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (!m.get('Relation').value) {
          this.ProductCategoryDetailsAlert.push({
            Message: 'Relation with Policy Holder is required (Life Assured).',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        // if (m.get('AnnualIncome').value == null ||
        //   m.get('AnnualIncome').value.toString() == "" ||
        //   m.get('AnnualIncome').value < 0) {
        //   this.ProductCategoryDetailsAlert.push({
        //     Message: 'Annual Income is required (Life Assured).',
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        if (!m.get('Occupation').value && this.RFQLifeForm.get('SubCategoryCode').value != SubCategoryCodeEnum.ChildPlan) {
          this.ProductCategoryDetailsAlert.push({
            Message: 'Occupation is required (Life Assured).',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (m.get('ExistingIllness').value == null) {
          this.ProductCategoryDetailsAlert.push({
            Message: 'Any existing Illness is required (Life Assured).',
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (m.get('ExistingIllness').value) {
          if (!m.get('Remark').value) {
            this.ProductCategoryDetailsAlert.push({
              Message: 'Remarks is required (Life Assured).',
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }
      }


    });




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

  public ExistingLifeInsurancePolicyValidations() {

    this.ExistingLifeInsurancePolicyDetailsAlert = []

    this.LifeAssuredmember.controls.forEach(m => {

      if (m.value.IsLifeAssured) {

        if (m.get('AnyExistingPolicy').value == null) {
          this.ExistingLifeInsurancePolicyDetailsAlert.push({
            Message: 'Is Life Assured have any existing life insurance policies is required.',
            CanDismiss: false,
            AutoClose: false,
          })
        }


        if (m.get('AnyExistingPolicy').value == true) {
          (m.get('ExistingPolicyDetails') as FormArray).controls.forEach(ele => {

            if (this.RFQLifeForm.get('SubCategoryCode').value != SubCategoryCodeEnum.TermPlan) {
              if (!ele.get('PolicyInsurComp').value) {
                this.ExistingLifeInsurancePolicyDetailsAlert.push({
                  Message: 'Insurance Company is required.',
                  CanDismiss: false,
                  AutoClose: false,
                })
              }
            }

            if (!ele.get('PolicyNumber').value) {
              this.ExistingLifeInsurancePolicyDetailsAlert.push({
                Message: 'Policy Number is required.',
                CanDismiss: false,
                AutoClose: false,
              })
            }

            if (ele.get('PolicySumInsured').value == null ||
              ele.get('PolicySumInsured').value.toString() == "" ||
              ele.get('PolicySumInsured').value <= 0) {
              this.ExistingLifeInsurancePolicyDetailsAlert.push({
                Message: 'Policy SumInsured is required.',
                CanDismiss: false,
                AutoClose: false,
              })
            }

            if (this.RFQLifeForm.get('SubCategoryCode').value != SubCategoryCodeEnum.TermPlan) {
              if (ele.get('PolicyPremium').value == null ||
                ele.get('PolicyPremium').value.toString() == "" ||
                ele.get('PolicyPremium').value <= 0) {
                this.ExistingLifeInsurancePolicyDetailsAlert.push({
                  Message: 'Policy Premium is required.',
                  CanDismiss: false,
                  AutoClose: false,
                })
              }
            }

            if (ele.get('IsPolicyActive').value == null) {
              this.ExistingLifeInsurancePolicyDetailsAlert.push({
                Message: 'Policy Active is required.',
                CanDismiss: false,
                AutoClose: false,
              })
            }


          })

        }
      }


    });




    if (this.ExistingLifeInsurancePolicyDetailsAlert.length > 0) {
      this.ExistingLifeInsurancePolicyStepCtrl.setErrors({ required: true });
      return this.ExistingLifeInsurancePolicyStepCtrl;
    }
    else {
      this.ExistingLifeInsurancePolicyStepCtrl.reset();
      return this.ExistingLifeInsurancePolicyStepCtrl;
    }

  }


  public ExistingLifeInsurancePolicyError() {
    if (this.ExistingLifeInsurancePolicyDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ExistingLifeInsurancePolicyDetailsAlert);
      return;
    }
  }

  public TeamDetailsValidation() {
    this.TeamDetailsAlert = []

    if (!this.RFQLifeForm.get('BranchId').value) {
      this.TeamDetailsAlert.push({
        Message: 'Branch is Required.',
        CanDismiss: false,
        AutoClose: false,
      });
    }



    if (this.RFQLifeForm.get("SalesPersonType").value == "POSP" || this.RFQLifeForm.get("SalesPersonType").value == "Direct") {
      if (!this.RFQLifeForm.get('SalesPersonId').value) {
        this.TeamDetailsAlert.push({
          Message: 'Sales person is Required.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.RFQLifeForm.get("SalesPersonType").value == "Team Reference") {
      if (!this.RFQLifeForm.get('TeamReferenceId').value) {
        this.TeamDetailsAlert.push({
          Message: 'Team Reference is Required.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.TeamDetailsAlert.length > 0) {
      this.TeamDetailsStepCtrl.setErrors({ required: true });
      return this.TeamDetailsStepCtrl;
    }
    else {
      this.TeamDetailsStepCtrl.reset();
      return this.TeamDetailsStepCtrl;
    }

  }

  public TeamDetailsError() {
    if (this.TeamDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.TeamDetailsAlert);
      return;
    }
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

  // binding data of sales person using autoComplete
  public SalesPersonSelected(event: MatAutocompleteSelectedEvent): void {
    this.RFQLifeForm.patchValue({
      SalesPersonId: event.option.value.Id,
      SalesPersonName: event.option.value.FullName,
      SalesPersonContactNo: event.option.value.MobileNo,
      BDMName: event.option.value.BDMName,
      BDMId: event.option.value.BDMId,
      BDOName: event.option.value.BDOName,
      BDOId: event.option.value.BDOId,
    })
  }


  public clearControl(name: string, id: string): void {
    this.f[name].setValue("")
    this.f[id].setValue(null)
  }


  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }

  /**
 * When Convert Transaction TO RFQ All Attachments are get
 * Display documents As Per category wise 
 */
  public canDisplayDocuments(DocumentType: string): boolean {
    if (this.mode == 'RenewalRFQ' && this.RFQLife && this.RFQLife?.TransactionId) {
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
  private _buildRFQLifeForm(data: ILifeRaiseDTO) {
    let form = this.fb.group({
      Id: [0],
      TransactionId: [0],
      CategoryId: [0],
      CategoryName: [""],
      SubCategoryId: [0],
      SubCategoryCode: [],
      SubCategoryName: [""],
      RFQDate: [""],
      RFQNo: [""],
      PolicyType: ["New", [Validators.required]],
      ProposerMobileNo: [""],
      ProposerEmail: [""],
      CategoryType: [],
      SumInsured: [0],
      InvestmentAmountPerYear: [0],
      PolicyPeriod: [0],
      PremiumPaymentType: [0],
      PremiumPaymentTypeName: [""],
      PremiumPayingTerm: [0],
      PremiumInstallmentType: [12],
      PremiumInstallmentTypeName: [""],
      ProposerName: [""],
      DOB: [""],
      Gender: [""],
      Occupation: [""],
      AnnualIncome: [0],
      Description: [""],
      Members: this._buildPolicyPersonForm(data.Members),
      SameAsPolicyHolder: [false],

      // [4] Team Details
      BranchId: [0, [Validators.required]],
      BranchName: ['', [Validators.required]],
      SalesPersonType: [''],
      BDOName: [],
      BDOId: [],
      BDMId: [],
      BDMName: [],
      SalesPersonId: [],
      SalesPersonName: ['', [Validators.required]],
      TeamReferenceId: [null],
      TeamReferenceName: ['', [Validators.required]],

      // 5. Attachment Details
      Documents: this._buildDocumentsForm(data.Documents),
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
      Stage: [],
    });

    if (data) {
      form.patchValue(data);
    }

    return form;
  }


  //Build  policy Person Formarray
  private _buildPolicyPersonForm(items: LifeMemberDTO[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPolicyPersonForm(i));
        });
      }
    }

    return formArray;
  }

  //Init policy Person Formgroup
  private _initPolicyPersonForm(item: LifeMemberDTO): FormGroup {
    let pPF = this.fb.group({
      Id: [0],
      RFQId: [0],
      Relation: [],
      Name: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      Gender: [],
      Remark: ['', [Validators.required]],
      Occupation: [""],
      AnnualIncome: [0],
      SmokerTibco: [null],
      SmokerTibcoDescription: [''],
      ExistingIllness: [null],
      IsLifeAssured: [false],
      // ExistingIllnessDetail: this._buildExistingIllnessDetailForm(),
      SumInsured: [0, [Validators.required]],
      OtherSumInsured: [0, [Validators.required]],
      Deductible: [0, [Validators.required]],
      AnyExistingPolicy: [false],
      ExistingPolicyDetails: this._buildExistingPolicyDetailsFormArray(item.ExistingPolicyDetails),
    })
    // if (item != null) {
    // if (!item) {
    //   item = new MemberDTO();
    // }

    if (item) {
      pPF.patchValue(item);
    }
    // }
    return pPF;
  }


  //Build  policy Person Formarray
  private _buildExistingPolicyDetailsFormArray(items: ILifeExistingPolicyDetailsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initExistingPolicyDetailsForm(i));
        });
      }
    }

    return formArray;
  }

  private _initExistingPolicyDetailsForm(item: ILifeExistingPolicyDetailsDto): FormGroup {

    let ExistingPolicyDetailsForm = this.fb.group({
      Id: [0],
      RFQMemberId: [0],
      PolicyInsurComp: [""],
      PolicyNumber: [""],
      PolicySumInsured: [0],
      PolicyPremium: [0],
      IsPolicyActive: [false],
    })

    if (item) {
      ExistingPolicyDetailsForm.patchValue(item)
    }

    return ExistingPolicyDetailsForm
  }

  //RFQ-Life document Formarray
  private _buildDocumentsForm(items: LifeDocumentsDto[] = []): FormArray {
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
  private _initDocumentsForm(item: LifeDocumentsDto): FormGroup {
    let dF = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      DocumentTypeName: [''],
      FileName: ['', [Validators.required]],
      StorageFileName: [''],
      StorageFilePath: ['', [Validators.required]],
      Description: [''], // remarks
      Stage: ['']
    })
    if (item != null) {
      if (!item) {
        item = new LifeDocumentsDto();
      }

      if (item) {
        dF.patchValue(item);
      }
    }
    return dF
  }

  // form changes 
  private _onFormChange() {

    // changes product type
    this.RFQLifeForm.get('SubCategoryId').valueChanges.subscribe(val => {

      let SelectedSubCategory = this.SubCategoryList.find(x => x.Id == val)
      if (SelectedSubCategory) {
        this.RFQLifeForm.patchValue({
          SubCategoryName: SelectedSubCategory.Name,
          SubCategoryCode: SelectedSubCategory.Code
        })

        if (SelectedSubCategory.Code == SubCategoryCodeEnum.TermPlan) {
          this.RFQLifeForm.patchValue({
            InvestmentAmountPerYear: 0,
            SameAsPolicyHolder: true
          })

          this.RFQLifeForm.get('SameAsPolicyHolder').disable({ emitEvent: false });

          this.LifeAssuredmember.controls.forEach(m => {
            (m.get('ExistingPolicyDetails') as FormArray).controls.forEach(ele => {
              ele.get('PolicyInsurComp').patchValue('');
              ele.get('PolicyPremium').patchValue(0);
            })
          })

          this.setminBirthDate = new Date();
        }
        else if (SelectedSubCategory.Code == SubCategoryCodeEnum.ChildPlan) {

          this.LifeAssuredmember.controls.forEach(member => {
            if (member.value.IsLifeAssured) {
              member.patchValue({
                Occupation: '',
                AnnualIncome: 0,
              })
            }
          });

          this.RFQLifeForm.get('SameAsPolicyHolder').patchValue(false);

          this.setminBirthDate = new Date(this.setminBirthDate.setFullYear(this.setminBirthDate.getFullYear() - 18));
        }
        else {
          this.RFQLifeForm.patchValue({
            SameAsPolicyHolder: false,
            SumInsured: 0,
          })
          this.RFQLifeForm.get('SameAsPolicyHolder').enable({ emitEvent: false });

          this.setminBirthDate = new Date();
        }
      }
      else {
        this.RFQLifeForm.patchValue({
          SubCategoryName: "",
          SubCategoryCode: "",
          InvestmentAmountPerYear: 0,
          SumInsured: 0,
        })
      }

      this.RFQLifeForm.patchValue({
        CategoryType: null
      })
    })

    // changes SameAsPolicyHolder
    this.RFQLifeForm.get('SameAsPolicyHolder').valueChanges.subscribe(val => {

      if (val == true) {
        this.LifeAssuredmember.controls.forEach(member => {
          if (member.value.IsLifeAssured) {
            member.patchValue({
              Gender: this.RFQLifeForm.get('Gender').value,
              DOB: this.RFQLifeForm.get('DOB').value,
              Name: this.RFQLifeForm.get('ProposerName').value,
              Occupation: this.RFQLifeForm.get('Occupation').value,
              AnnualIncome: this.RFQLifeForm.get('AnnualIncome').value,
              Relation: 'Self',
            })
          }
        });
      }

      if (val == false) {
        this.LifeAssuredmember.controls.forEach(member => {
          if (member.value.IsLifeAssured) {
            member.patchValue({
              Gender: '',
              DOB: '',
              Name: '',
              Occupation: '',
              AnnualIncome: 0,
              Relation: '',
            })
          }
        });
      }

    })

    // changes Name
    this.RFQLifeForm.get('ProposerName').valueChanges.subscribe(val => {

      if (this.RFQLifeForm.get('SameAsPolicyHolder').value == true) {
        this.LifeAssuredmember.controls.forEach(member => {
          if (member.value.IsLifeAssured) {
            member.patchValue({
              Name: this.RFQLifeForm.get('ProposerName').value,
            })
          }
        });
      }

    })

    // changes DOB
    this.RFQLifeForm.get('DOB').valueChanges.subscribe(val => {

      if (this.RFQLifeForm.get('SameAsPolicyHolder').value == true) {
        this.LifeAssuredmember.controls.forEach(member => {
          if (member.value.IsLifeAssured) {
            member.patchValue({
              DOB: this.RFQLifeForm.get('DOB').value,
            })
          }
        });
      }

    })

    // changes Gender
    this.RFQLifeForm.get('Gender').valueChanges.subscribe(val => {

      if (this.RFQLifeForm.get('SameAsPolicyHolder').value == true) {
        this.LifeAssuredmember.controls.forEach(member => {
          if (member.value.IsLifeAssured) {
            member.patchValue({
              Gender: this.RFQLifeForm.get('Gender').value,
            })
          }
        });
      }

    })

    // changes Occupation
    this.RFQLifeForm.get('Occupation').valueChanges.subscribe(val => {

      if (this.RFQLifeForm.get('SameAsPolicyHolder').value == true) {
        this.LifeAssuredmember.controls.forEach(member => {
          if (member.value.IsLifeAssured) {
            member.patchValue({
              Occupation: this.RFQLifeForm.get('Occupation').value,
            })
          }
        });
      }

    })

    // changes AnnualIncome
    this.RFQLifeForm.get('AnnualIncome').valueChanges.subscribe(val => {

      if (this.RFQLifeForm.get('SameAsPolicyHolder').value == true) {
        this.LifeAssuredmember.controls.forEach(member => {
          if (member.value.IsLifeAssured) {
            member.patchValue({
              AnnualIncome: this.RFQLifeForm.get('AnnualIncome').value,
            })
          }
        });
      }

    })

    this.RFQLifeForm.get('BranchId').valueChanges.subscribe((val) => {
      this._TeamDetailsForStandardUser()
    })

    this.RFQLifeForm.get('SalesPersonType').valueChanges.subscribe((val) => {
      this._TeamDetailsForStandardUser()
    })


    this.RFQLifeForm.get('TeamReferenceId').valueChanges.subscribe(
      (val) => {
        if (!val && this.UserProfileObj.UserType == UserTypeEnum.StandardUser && this.RFQLifeForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {
          this.RFQLifeForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );


    this.RFQLifeForm.get('SalesPersonId').valueChanges.subscribe(
      (val) => {
        if (!val && this.UserProfileObj.UserType == UserTypeEnum.StandardUser && this.RFQLifeForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {
          this.RFQLifeForm.patchValue({
            BDMId: null,
            BDMName: null,
            BDOId: null,
            BDOName: null,
          }, { emitEvent: false });
        }
      }
    );

    // change sales person
    this.RFQLifeForm.get('SalesPersonName').valueChanges.subscribe((val) => {

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
    this.RFQLifeForm.get('TeamReferenceName').valueChanges.subscribe(
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


    this.RFQLifeForm.get('BDOName').valueChanges.subscribe((val) => {
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

    this.RFQLifeForm.get('BDMName').valueChanges.subscribe((val) => {
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


    this.LifeAssuredmember.controls.forEach(member => {

      member.get('AnyExistingPolicy').valueChanges.subscribe(val => {
        if (val) {
          this.AddExistingPolicyDetails()
        } else {
          let ExistingPolicyDetailsFormArray = member.get('ExistingPolicyDetails') as FormArray
          while (ExistingPolicyDetailsFormArray.controls.length != 0) {
            ExistingPolicyDetailsFormArray.removeAt(0)
          }
        }

      })

    });

    this.RFQLifeForm.get('PremiumPaymentType').valueChanges.subscribe((val) => {

      /**
       * RFQLifeForm.get('PremiumPaymentType').value == 2
       * means PremiumPaymentType is Regular
       */
      if (this.RFQLifeForm.get('PremiumPaymentType').value == 2) {
        this.RFQLifeForm.get('PremiumPayingTerm').setValue(this.RFQLifeForm.get('PolicyPeriod').value)
      }

    })
    this.RFQLifeForm.get('PolicyPeriod').valueChanges.subscribe((val) => {

      /**
       * RFQLifeForm.get('PremiumPaymentType').value == 2
       * means PremiumPaymentType is Regular
       */
      if (this.RFQLifeForm.get('PremiumPaymentType').value == 2) {
        this.RFQLifeForm.get('PremiumPayingTerm').setValue(val)
      }

    })

  }

  private _fillMasterList() {

    // fill Product Type
    let SubCategoryRule: IFilterRule[] = [ActiveMasterDataRule,
      {
        Field: "Category.Code",
        Operator: "eq",
        Value: CategoryCodeEnum.Life
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
      { key: "CatagoryCode", filterValues: [CategoryCodeEnum.Life] }
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
    this.RFQLifeForm.patchValue({
      DOB: this._datePipe.transform(this.RFQLifeForm.get('DOB').value, 'yyyy-MM-dd'),
    }, { emitEvent: false })

    this.LifeAssuredmember.controls.forEach(member => {
      member.patchValue({
        DOB: this._datePipe.transform(member.get('DOB').value, 'yyyy-MM-dd')
      })
    })
  }


  // Team details from MyProfile
  private _TeamDetailsInfo() {
    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.UserProfileObj = user
        // set Branch details
        this.RFQLifeForm.patchValue({
          BranchId: user.BranchId,
          BranchName: user.BranchName,
        });

        // ************* set required field from user profile data ************* \\
        // set User type from user profile
        if (user.UserType == UserTypeEnum.Agent) {

          this.RFQLifeForm.patchValue({
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
          this.RFQLifeForm.patchValue({
            TeamReferenceId: user.Id,
            TeamReferenceName: user.FullName,
            SalesPersonType: 'Team Reference',
            BDMId: user.BDMId,
            BDMName: user.BDMName,
            BDOId: user.BDOId,
            BDOName: user.BDOName,
          }, { emitEvent: false });


          if (this.RFQLifeForm.value?.BranchId) {

            let LoginUserBranch = this.Branchs.find(b => b.Id == this.RFQLifeForm.value?.BranchId)
            if (LoginUserBranch) {
              this.RFQLifeForm.patchValue({
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
      if (this.RFQLifeForm.get('SalesPersonType').value == SalesPersonTypeEnum.Direct) {


        let LoginUserBranch = this.Branchs.find(b => b.Id == this.RFQLifeForm.get('BranchId').value)

        if (LoginUserBranch) {
          this.RFQLifeForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.RFQLifeForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.RFQLifeForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });

      } else if (this.RFQLifeForm.get('SalesPersonType').value == SalesPersonTypeEnum.POSP) {

        this.RFQLifeForm.patchValue({
          SalesPersonId: null,
          SalesPersonName: null,
          TeamReferenceId: null,
          TeamReferenceName: null,
        });


        /**
         * SalesPersonType TeamReference sales person is Selected branch bqp
         * Other Field is null
         */
      } else if (this.RFQLifeForm.get('SalesPersonType').value == SalesPersonTypeEnum.TeamReference) {

        let LoginUserBranch = this.Branchs.find(b => b.Id == this.RFQLifeForm.value?.BranchId)
        if (LoginUserBranch) {
          this.RFQLifeForm.patchValue({
            SalesPersonId: LoginUserBranch.BrokerQualifiedPersonId,
            SalesPersonName: LoginUserBranch.BrokerQualifiedPersonName,
          });
        } else {
          this.RFQLifeForm.patchValue({
            SalesPersonId: null,
            SalesPersonName: null,
          });
        }

        this.RFQLifeForm.patchValue({
          TeamReferenceId: null,
          TeamReferenceName: null,
        });
      }


      this.RFQLifeForm.patchValue({
        BDMId: null,
        BDMName: null,
        BDOId: null,
        BDOName: null,
      });

    }
  }

  // Birthdate check for 18 years and above
  private BirthdateCheck(date) {
    // let years = moment.duration(moment().diff(date)).years()

    let CurrentDate = new Date()
    let Befor18YearDate = new Date(CurrentDate.setFullYear(CurrentDate.getFullYear() - 18));

    if (this._datePipe.transform(Befor18YearDate, 'yyyy-MM-dd') > this._datePipe.transform(date, 'yyyy-MM-dd')) {
      return false;
    }
    else {
      return true;
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
    if (this.RFQLifeForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQLifeForm.get('BranchId').value, }
      ]
    }

    if (this.RFQLifeForm.get('SalesPersonType').value == "POSP") {
      specs.FilterConditions.Rules = [
        ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQLifeForm.get('BranchId').value, }
      ];
    }


    if (this.RFQLifeForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.RFQLifeForm.get('SalesPersonType').value == "POSP") {
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
    if (this.RFQLifeForm.get('SalesPersonType').value == "Team Reference") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule,
        { Field: 'Branch.Id', Operator: 'eq', Value: this.RFQLifeForm.get('BranchId').value, }
      ];
    }

    if (this.RFQLifeForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'UserType', filterValues: ['StandardUser', 'Agent'] })
    }
    else if (this.RFQLifeForm.get('SalesPersonType').value == "Team Reference") {
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

    if (this.RFQLifeForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule];
    }

    if (this.RFQLifeForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDOOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.RFQLifeForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.RFQLifeForm.get('BranchId').value?.toString()] })
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

    if (this.RFQLifeForm.get('SalesPersonType').value == "Direct") {
      specs.FilterConditions.Rules = [ActiveMasterDataRule];
    }

    if (this.RFQLifeForm.get('SalesPersonType').value == "Direct") {
      specs.AdditionalFilters.push({ key: 'BDMOnly', filterValues: ['true'] });
      specs.AdditionalFilters.push({ key: 'AccessOnRFQandTrans', filterValues: ['true'] });

      if (this.RFQLifeForm.get('BranchId').value) {
        specs.AdditionalFilters.push({ key: 'Branch', filterValues: [this.RFQLifeForm.get('BranchId').value?.toString()] })
      }
    }

    return specs;
  }
  //#endregion private-methods


}
