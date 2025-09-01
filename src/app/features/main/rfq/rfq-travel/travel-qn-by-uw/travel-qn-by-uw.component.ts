import { DatePipe, Location } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ROUTING_PATH } from '@config/routingPath.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { RfqTravelService } from '../rfq-travel-service';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { MatStepper } from '@angular/material/stepper';
import { TravelCategoryType } from '@config/rfq';
import { Alert, IFilterRule, OrderBySpecs } from '@models/common';
import { CategoryCodeEnum } from 'src/app/shared/enums';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { environment } from 'src/environments/environment';
import { TravelDocumentsDto, ITravelDocumentsDto, ITravelQNDocumentsDto, ITravelQNbyUWDTO, TravelQNDocumentsDto } from '@models/dtos';
import { dropdown } from '@config/dropdown.config';
import { RFQDocumentsDrpList } from '@config/rfq';
import { RfqService } from '../../rfq.service';

@Component({
  selector: 'gnx-travel-qn-by-uw',
  templateUrl: './travel-qn-by-uw.component.html',
  styleUrls: ['./travel-qn-by-uw.component.scss'],
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
export class TravelQnByUwComponent implements OnInit, AfterViewInit {

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  // Variables
  pagetitle: string = '';
  mode: string = '';
  isExpand: boolean = false;
  DropdownMaster: dropdown;
  ProposerName: string;

  SubCategoryList: any[] = [];

  DisplayForm: any;

  // FormGroup 
  TravelQNUWForm: FormGroup;

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  QNDocAlerts: Alert[] = []; // Step Invalid field error message
  DocumentAttachmentAlert: Alert[] = [];
  QnDocumentAlert: Alert[] = [];

  //Form Controls
  QnDocumentStepCtrl = new FormControl();
  DocumentAttachmentStepCtrl = new FormControl();

  //#region Constructor
  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public dialog: MatDialog,
    public _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _MasterListService: MasterListService,
    private _dialogService: DialogService,
    private _RFQTravelService: RfqTravelService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
    private _RFQService:RfqService,
  ) {

    this.DropdownMaster = new dropdown();

  }

  //#endregion constructor

  // #region Getters

  // get travel category type
  get TravelCategoryType() {
    return TravelCategoryType;
  }

  // get QNDocuments Form array
  get QNDocuments() {
    return this.TravelQNUWForm.get('QNDocuments') as FormArray;
  }

  // get Documents Form Array 
  get Documents() {
    return this.TravelQNUWForm.get('Documents') as FormArray;
  }

  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Travel))
  }

  // #end-region Getters

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  //On Init
  ngOnInit(): void {

    this._fillMasterList();

    // Route params data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title'];
    this.mode = data['mode'];

    this.DisplayForm = data['data'];

    // build travel form
    this.TravelQNUWForm = this._buildForm(this.DisplayForm);

    //Remove All Existing QN Documents
    while (this.QNDocuments.controls.length !== 0) {
      this.QNDocuments.removeAt(0)
    }

    this.addQNDocuments();
    this.ProposerName = this.DisplayForm?.Members[0]?.Name;
  }

  // After View Init
  ngAfterViewInit(): void {
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();

    this._cdr.detectChanges();
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

  // Reject Button 
  public RejectButton() {
    if (this.TravelQNUWForm.get('SendBackRejectDesc').value == "" || this.TravelQNUWForm.get('SendBackRejectDesc').value == null) {
      this._alertservice.raiseErrors([{
        Message: `Reject Reason is required.`,
        CanDismiss: false,
        AutoClose: false,
      }]);
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
          this._RFQTravelService.Reject(this.TravelQNUWForm.value).subscribe((res) => {
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
  public SendBackButton() {

    if (this.TravelQNUWForm.get('SendBackRejectDesc').value == "" || this.TravelQNUWForm.get('SendBackRejectDesc').value == null) {
      this._alertservice.raiseErrors([{
        Message: `Send Back Reason is required.`,
        CanDismiss: false,
        AutoClose: false,
      }]);
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
          this._RFQTravelService.SendBack(this.TravelQNUWForm.value).subscribe((res) => {
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

  public SubmitForm() {

    if (this.QnDocumentAlert.length > 0) {
      this._alertservice.raiseErrors(this.QnDocumentAlert);
      return;
    }

    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }

    this._RFQTravelService.SubmitTravelQuotation(this.TravelQNUWForm.value).subscribe(res => {
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

  public ExpandCollaps() {
    this.isExpand = !this.isExpand;
  }

  // delete row from the document array based on index number
  public deleteDocument(index: number) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.QNDocuments.removeAt(index)
        }
      });

  }


  // file data (QN document that is added)
  public UploadQNPDF(event, index) {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = () => { };
    reader.readAsDataURL(file);

    if (file) {

      this._dataService
        .UploadFile(this.UploadFileAPI, file)
        .subscribe((res) => {
          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message);
            this.QNDocuments.controls[index].patchValue({
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              DocumentType: 'Other',
              FileName: event.target.files[0].name,
              RFQId: this.TravelQNUWForm.get('Id').value
            })
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

  // Add new row in document array
  public addQNDocuments() {
    this.QNDocAlerts = [];
    this.QNDocuments.controls.forEach((el, i) => {
      if (el.get('FileName').value === "") {
        this.QNDocAlerts.push({
          Message: `Attach QN PDF ${i + 1} is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });

    if (this.QNDocAlerts.length > 0) {
      this._alertservice.raiseErrors(this.QNDocAlerts);
      return;
    }
    else {
      var row: ITravelQNDocumentsDto = new TravelQNDocumentsDto()
      this.QNDocuments.push(this._initQNDocuments(row))
    }
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
   * Add new row in Document array
  */
  public addDocuments(selectedDocument?: string) {
    const row: ITravelDocumentsDto = new TravelDocumentsDto();
    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.PolicyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.PolicyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.PolicyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = this.DisplayForm.Stage;
        this.Documents.push(this._initDocumentForm(row));
      }
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
              Stage: this.DisplayForm.Stage
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


  public QnDocumentValidation() {
    this.QnDocumentAlert = []

    if (this.QNDocuments.controls.length <= 0) {
      this.QnDocumentAlert.push({
        Message: `At least one Qn Document is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }


    this.QNDocuments.controls.forEach((el, i) => {
      if (el.get('FileName').value === "") {
        this.QnDocumentAlert.push({
          Message: `Attach QN PDF ${i + 1} is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });

    if (this.QnDocumentAlert.length > 0) {
      this.QnDocumentStepCtrl.setErrors({ required: true });
      return this.QnDocumentStepCtrl;
    }
    else {
      this.QnDocumentStepCtrl.reset();
      return this.QnDocumentStepCtrl;
    }

  }

  public QnDocumentError() {
    if (this.QnDocumentAlert.length > 0) {
      this._alertservice.raiseErrors(this.QnDocumentAlert);
      return;
    }
  }

  public rfqUWassign(type: 'assign' | 'unassign' | 'reassign') {
    this._RFQService.rfqUWassign(this.DisplayForm, type)
    this._RFQService.assignUnassignRes.subscribe(res => {
      if (res) {
        this.backButton()
        this._RFQService.assignUnassignRes.unsubscribe()
      }
    })
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build Main Form
  private _buildForm(data: ITravelQNbyUWDTO) {

    let fg = this.fb.group({
      Id: [0],
      Deductible: [0],
      QNDocuments: this._buildQNDocuments(data.QNDocuments),
      Documents: this._buildDocumentsForm(data.Documents),

      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
    })

    if (data != null) {
      fg.patchValue(data);
    }

    return fg;
  }

  // Build Quotation Note Document Formarray
  private _buildQNDocuments(items: ITravelQNDocumentsDto[] = []): FormArray {
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
  private _initQNDocuments(item: ITravelQNDocumentsDto): FormGroup {
    let dFQN = this.fb.group({
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

    if (item != null) {
      if (item) {
        dFQN.patchValue(item);
      }
      else {
        item = new TravelQNDocumentsDto();
      }
    }
    return dFQN
  }


  // Documents FormArray
  private _buildDocumentsForm(items: ITravelDocumentsDto[] = []): FormArray {
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
  private _initDocumentForm(data: ITravelDocumentsDto): FormGroup {

    let DocumentForm = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      DocumentTypeName: [''],
      DocumentNo: [''],
      FileName: ['', [Validators.required, this.noWhitespaceValidator]],
      StorageFileName: [''],
      StorageFilePath: ['', [Validators.required, this.noWhitespaceValidator]],
      ImageUploadName: [''],
      ImageUploadPath: ['', [Validators.required, this.noWhitespaceValidator]],
      Description: [''],
      Stage: [''],
    });

    if (data) {
      DocumentForm.patchValue(data)
    }

    return DocumentForm;

  }

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
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


  private _fillMasterList() {
    // fill Product Type
    let SubCategoryRule: IFilterRule[] = [
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
      });
  }

  //#endregion private-methods

}
