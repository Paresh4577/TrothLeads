import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert } from '@models/common';
import { RfqPaService } from '../rfq-pa.service';
import { RfqService } from '../../rfq.service';
import { RFQDocumentsDrpList } from '@config/rfq';
import { CategoryCodeEnum } from 'src/app/shared/enums';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { ROUTING_PATH } from '@config/routingPath.config';
import { PADocumentsDto, IPADocumentsDto, IPAQNbyUWDTO, IPAQNDocumentsDto, PAQNDocumentsDto } from '@models/dtos';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'gnx-pa-qn-by-uw',
  templateUrl: './pa-qn-by-uw.component.html',
  styleUrls: ['./pa-qn-by-uw.component.scss'],
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
export class PaQnByUwComponent {

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  //Variables
  pagetitle: string; // Page main header title
  mode: string; // for identify of Raise page is create or edit or view

  SelfCoverRequired: boolean = false;
  SpouseCoverRequired: boolean = false;
  DaughterCoverRequired: boolean = false;
  SonCoverRequired: boolean = false;
  noOfDaughter: number = 0;
  noOfSon: number = 0;
  SelfGender: string = '';
  SpouseGender: string = '';
  myMembers = []; // store selected member icon path
  allMemberCard = []; // to store display Member icon in card
  ProposerName: string;

  //FormGroup 
  QNForm !: FormGroup;
  DisplayForm: any;
  isExpand: boolean = false;



  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // Alert Array List
  DocumentAttachmentAlert: Alert[] = [];
  QnDocumentAlert: Alert[] = [];

  //Form Controls
  QnDocumentStepCtrl = new FormControl();
  DocumentAttachmentStepCtrl = new FormControl();



  /**
   * #region constructor
   * @param _fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   */

  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public dialog: MatDialog,
    public _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private cdr: ChangeDetectorRef,
    private _dialogService: DialogService,
    private _RfqPAService: RfqPaService,
    private _RFQService: RfqService,
    private _Location: Location,
  ) {

    this.allMemberCard = this._RfqPAService.PamemberCardArray()
  }
  // #endregion constructor


  // #region Getters
  get QNDocuments() {
    return this.QNForm.get('QNDocuments') as FormArray;
  }

  get Documents() {
    return this.QNForm.get('Documents') as FormArray;
  }

  get RFQLifeDocumentsList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.PA))
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
    this.DisplayForm = data['data'];
    this.mode = data['mode']

    // Init Form
    this.QNForm = this._initForm(this.DisplayForm);


    //Remove All Existing QN Documents
    while (this.QNDocuments.controls.length !== 0) {
      this.QNDocuments.removeAt(0)
    }

    this.ProposerName = this.DisplayForm?.Members[0]?.Name;
  }

  ngAfterViewInit(): void {

    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();

    this.cdr.detectChanges();
  }

  //#endregion lifecyclehooks


  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // Reject Button 
  public RejectButton() {
    if (this.QNForm.get('SendBackRejectDesc').value == "" || this.QNForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.QNForm.value.Id;
          SendBackRejectObj.Stage = this.QNForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.QNForm.value.SendBackRejectDesc;

          this._RFQService.Reject(SendBackRejectObj).subscribe((res) => {
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

    if (this.QNForm.get('SendBackRejectDesc').value == "" || this.QNForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.QNForm.value.Id;
          SendBackRejectObj.Stage = this.QNForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.QNForm.value.SendBackRejectDesc;

          this._RFQService.SendBack(SendBackRejectObj).subscribe((res) => {
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


  public SubmitFormButton() {

    if (this.QnDocumentAlert.length > 0) {
      this._alertservice.raiseErrors(this.QnDocumentAlert);
      return;
    }

    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }

    this._RfqPAService.SubmitQuotation(this.QNForm.value).subscribe(res => {
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
  public backButton() {
    this._Location.back();
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
    const row: IPADocumentsDto = new PADocumentsDto();
    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.RFQLifeDocumentsList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.RFQLifeDocumentsList[RowIndex].DocumentType;
        row.DocumentTypeName = this.RFQLifeDocumentsList[RowIndex].DocumentTypeName;
        row.Stage = this.DisplayForm.Stage;
        this.Documents.push(this._initDocumentForm(row));
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
              Stage: this.DisplayForm.Stage
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
              RFQId: this.QNForm.get('Id').value
            })
          }
          else {
            this._alertservice.raiseErrors(res.Alerts);
          }
        });
    }
  }

  // Add new row in document array
  public addQNDocuments() {
    if (this.QNDocuments.controls.length > 0 && this.QnDocumentAlert.length > 0) {
      this._alertservice.raiseErrors(this.QnDocumentAlert);
      return;
    }
    else {
      var row: IPAQNDocumentsDto = new PAQNDocumentsDto()
      this.QNDocuments.push(this._initQNDocuments(row))
    }
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

  public ExpandCollaps() {
    this.isExpand = !this.isExpand
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
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  private _initForm(data: IPAQNbyUWDTO) {
    let fg = this.fb.group({
      Id: [0],
      Deductible: [0],
      PremiumInstallmentType: [],
      QNDocuments: this._buildQNDocuments(data.QNDocuments),
      Documents: this._buildDocumentsForm(data.Documents),

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
  private _buildQNDocuments(items: IPAQNDocumentsDto[] = []): FormArray {
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
  private _initQNDocuments(item: IPAQNDocumentsDto): FormGroup {
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
        item = new PAQNDocumentsDto();
      }
    }
    return dFQN
  }


  // Documents FormArray
  private _buildDocumentsForm(items: IPADocumentsDto[] = []): FormArray {
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
  private _initDocumentForm(data: IPADocumentsDto): FormGroup {

    let DocumentForm = this.fb.group({
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

  //#endregion private-methods
}