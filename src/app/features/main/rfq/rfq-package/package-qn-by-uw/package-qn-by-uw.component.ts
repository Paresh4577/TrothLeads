import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { RFQDocumentsDrpList } from '@config/rfq';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { IRfqDoclistDTO, IRfqStaticDataListDTO, ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { IPackagePrePolicyDTO, IPackageQNbyUWDTO, IPackageSuminnsuredQuestionDTO, IRFQPackageContentDetailsDTO, IRFQPackageDocumentsDto, IRFQPackageQNDocumentsDto, PackagePrePolicyDTO, PackageQNbyUWDTO, RFQPackageContentDetailsDTO, RFQPackageDocumentsDto, RFQPackageQNDocumentsDto } from '@models/dtos';
import { CategoryCodeEnum, SubCategoryCodeEnum } from 'src/app/shared/enums';
import { environment } from 'src/environments/environment';
import { RfqPackageService } from '../rfq-package.service';
import { DialogService } from '@lib/services/dialog.service';
import { RfqService } from '../../rfq.service';
import { Alert, IFilterRule } from '@models/common';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MasterListService } from '@lib/services/master-list.service';
import { IFinancialYearDto } from '@models/dtos/core/FinancialYearDto';
import { Moment } from 'moment';
import { PackagePrevPolicyCliamStatus } from '@config/rfq';

const activeMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-package-qn-by-uw',
  templateUrl: './package-qn-by-uw.component.html',
  styleUrls: ['./package-qn-by-uw.component.scss'],
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
export class PackageQnByUwComponent {



  //#region public properties
  @ViewChild('stepper') public stepper: MatStepper;
  @ViewChild('DocumentDropdown') public DocumentDropdown: ElementRef;

  //Variables
  public pagetitle: string; // Page main header title
  public mode: string; // for identify of Raise page is create or edit or view

  //FormGroup 
  public qnForm !: FormGroup;
  public displayForm: any;
  public maxManufacturingYear: Date = new Date()
  public jewellersBlockPoliciesSumInsuredDetails: any;
  public isExpand: boolean = false;
  public financialYearList: IFinancialYearDto[] = []


  //#endregion

  //#region private properties

  private _uploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API
  // Alert Array List
  private _documentAttachmentAlert: Alert[] = [];
  private _qnDocumentAlert: Alert[] = [];

  //Form Controls
  private _qnDocumentStepCtrl = new FormControl();
  private _documentAttachmentStepCtrl = new FormControl();


  //#endregion

  /**
   * #region constructor
   */

  constructor(
    private _fb: FormBuilder,
    private _alertservice: AlertsService,
    private _dialog: MatDialog,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _cdr: ChangeDetectorRef,
    private _dialogService: DialogService,
    private _rfqPackageService: RfqPackageService,
    private _rFQService: RfqService,
    private _location: Location,
    private _masterListService: MasterListService,
  ) {

    this.jewellersBlockPoliciesSumInsuredDetails = this._rfqPackageService.DisplaySumInsuredDetailsJewellersBlockPolicies()
  }
  // #endregion constructor


  // #region Getters
  public get qnDocuments(): FormArray {
    return this.qnForm.get('QNDocuments') as FormArray;
  }

  public get documents(): FormArray {
    return this.qnForm.get('Documents') as FormArray;
  }

  public get contentDetails(): FormArray {
    return this.qnForm.get('ContentDetails') as FormArray;
  }

  // get PrevPolicyDetail list
  public get prevPolicyDetails(): FormArray {
    return this.qnForm.get('PrevPolicyDetail') as FormArray;
  }

  public get rfqDocumentsList(): IRfqDoclistDTO[] {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Package))
  }

  public get prevPolicyCliamStatus(): IRfqStaticDataListDTO[] {
    return PackagePrevPolicyCliamStatus
  }

  // enum used so return type any
  public get subCategoryCodeEnum(): any {
    return SubCategoryCodeEnum
  }


  public get canDisplayJwelleryDetails(): boolean {

    if (this.displayForm.SubCategoryCode == SubCategoryCodeEnum.HouseHolder &&
      (this.displayForm?.SumInsuredDetail.BreakdownDomesticAppliances || this.displayForm?.SumInsuredDetail.ElectricleOrElectronic)) {
      return true;
    }

    else if (this.displayForm.SubCategoryCode == SubCategoryCodeEnum.JewellersBlockPolicies &&
      (this.displayForm?.SumInsuredDetail.MachineryBreakdown ||
        this.displayForm?.SumInsuredDetail.ElectricleOrElectronic ||
        this.displayForm?.SumInsuredDetail.PortableEquipmentCover)) {
      return true;
    }

    else if (this.displayForm.SubCategoryCode == SubCategoryCodeEnum.OfficePack &&
      (this.displayForm?.SumInsuredDetail.MachineryBreakdown ||
        this.displayForm?.SumInsuredDetail.ElectricleOrElectronic ||
        this.displayForm?.SumInsuredDetail.PortableEquipmentCover)) {
      return true;
    }

    else if (this.displayForm.SubCategoryCode == SubCategoryCodeEnum.Shopkeepers &&
      (this.displayForm?.SumInsuredDetail.MachineryBreakdown ||
        this.displayForm?.SumInsuredDetail.ElectricleOrElectronic)) {
      return true;
    }

    else {
      return false;
    }
  }

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    //Get Route Params Data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title']
    this.displayForm = data['data'];
    this.mode = data['mode']

    // Init Form
    this.qnForm = this._initForm(this.displayForm);


    //Remove All Existing QN Documents
    while (this.qnDocuments.controls.length !== 0) {
      this.qnDocuments.removeAt(0)
    }

    this.addQNDocuments()
    if (this.prevPolicyDetails.controls.length <= 0 && this.displayForm.AnyClaiminLast3Year) {
      this.addPrevPolicyDetails();
    }

    this._fillMasterList();
  }

  //After View-Init
  ngAfterViewInit(): void {

    this.stepper.next();
    this.stepper.next();

    // If Equipment Detail is display Then don't skip Product category Stepper
    if (!this.canDisplayJwelleryDetails) {
      this.stepper.next();
      this.stepper.next();
      if ((this.displayForm.PolicyType == 'Rollover' || this.displayForm.PolicyType == 'Renewal-Change Company' || this.displayForm.PolicyType == 'Renewal-Same Company') && !this.displayForm.AnyClaiminLast3Year) {
        this.stepper.next();
        this.stepper.next();
      }
    }

    this._cdr.detectChanges();
  }


  //#endregion lifecyclehooks


  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // Reject Button 
  public rejectButton(): void {
    if (this.qnForm.get('SendBackRejectDesc').value == "" || this.qnForm.get('SendBackRejectDesc').value == null) {
      this._alertservice.raiseErrorAlert(`Reject Reason is required.`);
      return;
    }

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You want to reject request",
        confirmText: 'Yes, reject it!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {

          let SendBackRejectObj: ISendBackRejectDTO = new SendBackRejectDTO()
          SendBackRejectObj.Id = this.qnForm.value.Id;
          SendBackRejectObj.Stage = this.qnForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.qnForm.value.SendBackRejectDesc;

          this._rFQService.Reject(SendBackRejectObj).subscribe((res) => {
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
          });
        }
      });
  }

  // Send Back Button 
  public sendBackButton(): void {

    if (this.qnForm.get('SendBackRejectDesc').value == "" || this.qnForm.get('SendBackRejectDesc').value == null) {
      this._alertservice.raiseErrorAlert(`Send Back Reason is required.`);
      return;
    }

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You want to send back request",
        confirmText: 'Yes, send it back!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {

          let SendBackRejectObj: ISendBackRejectDTO = new SendBackRejectDTO()
          SendBackRejectObj.Id = this.qnForm.value.Id;
          SendBackRejectObj.Stage = this.qnForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.qnForm.value.SendBackRejectDesc;

          this._rFQService.SendBack(SendBackRejectObj).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, "false")
              this._router.navigate([ROUTING_PATH.Basic.Dashboard])
            }
            else {
              if (res.Alerts && res.Alerts?.length > 0) {
                this._alertservice.raiseErrors(res.Alerts)
              } else {
                this._alertservice.raiseErrorAlert(res.Message)
              }
            }
          });
        }
      });
  }


  public submitFormButton(): void {

    if (this._qnDocumentAlert.length > 0) {
      this._alertservice.raiseErrors(this._qnDocumentAlert);
      return;
    }

    if (this._documentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this._documentAttachmentAlert);
      return;
    }

    this._rfqPackageService.submitQuotation(this.qnForm.value).subscribe(res => {
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
  }

  // back button
  public backButton(): void {
    this._location.back();
  }

  /**
   * Document Selection Change
  */
  public onDocumentSelectionChange(selectedValue): void {
    if (this._documentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this._documentAttachmentAlert)
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
  public addDocuments(selectedDocument?: string): void {
    const row: IRFQPackageDocumentsDto = new RFQPackageDocumentsDto();
    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.rfqDocumentsList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.rfqDocumentsList[RowIndex].DocumentType;
        row.DocumentTypeName = this.rfqDocumentsList[RowIndex].DocumentTypeName;
        row.Stage = this.displayForm.Stage;
        this.documents.push(this._initDocumentForm(row));
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
              Stage: this.displayForm.Stage
            })
          }
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


  // file data (QN document that is added)
  public uploadQNPDF(event, index): void {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = () => { };
    reader.readAsDataURL(file);

    if (file) {

      this._dataService
        .UploadFile(this._uploadFileAPI, file)
        .subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message);
            this.qnDocuments.controls[index].patchValue({
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              DocumentType: 'Other',
              FileName: event.target.files[0].name,
              RFQId: this.qnForm.get('Id').value
            })
          }
          else {
            this._alertservice.raiseErrors(res.Alerts);
          }
        });
    }
  }

  // Add new row in document array
  public addQNDocuments(): void {
    if (this.qnDocuments.controls.length > 0 && this._qnDocumentAlert.length > 0) {
      this._alertservice.raiseErrors(this._qnDocumentAlert);
      return;
    }
    else {
      var row: IRFQPackageQNDocumentsDto = new RFQPackageQNDocumentsDto()
      this.qnDocuments.push(this._initQNDocuments(row))
    }
  }

  // delete row from the document array based on index number
  public deleteDocument(index: number): void {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.qnDocuments.removeAt(index)
        }
      });

  }


  public qnDocumentValidation(): FormControl {
    this._qnDocumentAlert = []

    if (this.qnDocuments.controls.length <= 0) {
      this._qnDocumentAlert.push({
        Message: `At least one Qn Document is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }


    this.qnDocuments.controls.forEach((el, i) => {
      if (el.get('FileName').value === "") {
        this._qnDocumentAlert.push({
          Message: `Attach QN PDF ${i + 1} is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });

    if (this._qnDocumentAlert.length > 0) {
      this._qnDocumentStepCtrl.setErrors({ required: true });
      return this._qnDocumentStepCtrl;
    }
    else {
      this._qnDocumentStepCtrl.reset();
      return this._qnDocumentStepCtrl;
    }

  }

  public qnDocumentError(): void {
    if (this._qnDocumentAlert.length > 0) {
      this._alertservice.raiseErrors(this._qnDocumentAlert);
      return;
    }
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

  public expandCollaps(): void {
    this.isExpand = !this.isExpand
  }

  public addJContentDetails(): void {
    var row: IRFQPackageContentDetailsDTO = new RFQPackageContentDetailsDTO()
    row.RFQId = this.qnForm.get("Id").value;
    this.contentDetails.push(this._initContentDetailsForm(row));
  }

  // remove Query details 
  public removeContentDetails(index: number): void {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.contentDetails.removeAt(index);
        }
      });

  }

  public chosenYearHandler(mfgYear: Moment, picker, index: number): void {
    this.contentDetails.controls[index].patchValue({
      ManufacturingYear: mfgYear.year()
    });
    picker.close();
  }


  public addPrevPolicyDetails(): void {
    var row: IPackagePrePolicyDTO = new PackagePrePolicyDTO()
    row.RFQId = this.qnForm.get("Id").value;
    this.prevPolicyDetails.push(this._initPrevPoliciesForm(row));
  }

  // remove Query details 
  public removePrevPolicyDetails(index: number): void {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.prevPolicyDetails.removeAt(index);
        }
      });

  }



  public filterDisplaySumInsuredDetails(): IPackageSuminnsuredQuestionDTO[] {
    let SubCategoryWiseDisplaySumInsuredDetails = this._rfqPackageService.DisplaySumInsuredDetailsForSingleColumn(this.displayForm.SubCategoryCode)
    return SubCategoryWiseDisplaySumInsuredDetails
  }

  public rfqUWassign(type: 'assign' | 'unassign' | 'reassign') {
    this._rFQService.rfqUWassign(this.displayForm, type)
    this._rFQService.assignUnassignRes.subscribe(res => {
      if (res) {
        this.backButton()
        this._rFQService.assignUnassignRes.unsubscribe()
      }
    })
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  private _initForm(data: IPackageQNbyUWDTO): FormGroup {
    let fg = this._fb.group({
      Id: [0],
      Deductible: [0],
      PremiumInstallmentType: [],
      QNDocuments: this._buildQNDocuments(data.QNDocuments),
      Documents: this._buildDocumentsForm(data.Documents),
      PrevPolicyDetail: this._buildPrevPoliciesForm(data.PrevPolicyDetail),
      ContentDetails: this._buildContentDetailsForm(data.ContentDetails),

      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: ['']
    })

    if (data) {
      fg.patchValue(data);
    }

    return fg;
  }

  // Build Quotation Note Document Formarray
  private _buildQNDocuments(items: IRFQPackageQNDocumentsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);

    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initQNDocuments(i));
        });
      }
    }

    return formArray;
  }

  // Init Quotation Note Document Form
  private _initQNDocuments(item: IRFQPackageQNDocumentsDto): FormGroup {
    let dFQN = this._fb.group({
      Id: [0],
      RFQId: [0],
      InsuranceCompany: [''],
      InsuranceCompanyName: [''],
      InsuranceCompanyShortName: [''],
      ProductName: [''],
      ProductCode: [''],
      SumInsured: [0],
      GrossPremium: [0],
      Buy: [false],
      FileName: [''],
      StorageFileName: [''],
      StorageFilePath: ['']
    })


    if (item) {
      dFQN.patchValue(item);
    }

    return dFQN
  }


  // Documents FormArray
  private _buildDocumentsForm(items: IRFQPackageDocumentsDto[] = []): FormArray {
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

  // Documents FormGroup
  private _initDocumentForm(data: IRFQPackageDocumentsDto): FormGroup {

    let DocumentForm = this._fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      DocumentTypeName: [''],
      DocumentNo: [''],
      FileName: ['', [Validators.required]],
      StorageFileName: [''],
      StorageFilePath: ['', [Validators.required]],
      ImageUploadName: [''],
      ImageUploadPath: ['', [Validators.required]],
      Description: [''],
      Stage: [''],
    });

    if (data) {
      DocumentForm.patchValue(data)
    }

    return DocumentForm;

  }

  //RFQ-Engineering PrevPolicyDetail Formarray
  private _buildPrevPoliciesForm(items: IPackagePrePolicyDTO[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPrevPoliciesForm(i));
        });
      }
    }

    return formArray;
  }

  //Init PrevPolicy formgroup
  private _initPrevPoliciesForm(item: IPackagePrePolicyDTO): FormGroup {
    let dF = this._fb.group({
      Id: [0],
      RFQId: [0],
      FinancialYearId: [],
      FinancialYear: [""],
      MemberName: [""],
      ClaimType: [""],
      ReasonOfClaim: [""],
      Status: [""],
      ClaimApprovalAmount: [0],
      _Premium: [0],
      Premium: [0],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: [""],
      ImageUploadName: [""],
      ImageUploadPath: [""],
    })

    if (item) {
      dF.patchValue(item);
    }

    return dF
  }

  // Documents FormArray
  private _buildContentDetailsForm(items: IRFQPackageContentDetailsDTO[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initContentDetailsForm(i));
        });
      }
    }

    return formArray;
  }

  // Documents FormGroup
  private _initContentDetailsForm(data: IRFQPackageContentDetailsDTO): FormGroup {

    let DocumentForm = this._fb.group({
      Id: [0],
      RFQId: [0],
      ItemDesc: [""],
      Make: [""],
      SerialNo: [""],
      ModelNo: [""],
      ManufacturingYear: [""],
      SumInsured: [0],
      Quantity: [0],
      Remarks: [""],
    });

    if (data) {
      DocumentForm.patchValue(data)
    }

    return DocumentForm;

  }

  private _fillMasterList(): void {
    // Fill Insurance Company
    let FinancialYearRule: IFilterRule[] = [activeMasterDataRule];

    this._masterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.FinancialYear.List, 'FYCode', "", FinancialYearRule)
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.financialYearList = res.Data.Items
          } else {
            this.financialYearList = [];
          }
        } else {
          this.financialYearList = []
        }
      })
  }

  //#endregion private-methods
}
