import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert } from '@models/common';
import { AuthService } from '@services/auth/auth.service';
import { RfqWcService } from '../../rfq-wc/rfq-wc.service';
import { RfqService } from '../../rfq.service';
import { RFQDocumentsDrpList } from '@config/rfq';
import { CategoryCodeEnum, UserTypeEnum } from 'src/app/shared/enums';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { ROUTING_PATH } from '@config/routingPath.config';
import { PADocumentsDto, IPADocumentsDto, IPANomineeDetailDto, PANomineeDetailDto } from '@models/dtos';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'gnx-pa-proposal-submission-uw',
  templateUrl: './pa-proposal-submission-uw.component.html',
  styleUrls: ['./pa-proposal-submission-uw.component.scss'],
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
export class PaProposalSubmissionUwComponent {

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  // Variables
  pagetitle: string = '';
  mode: string = '';
  currentDate = new Date();
  isExpand: boolean = false;
  IsPOSPUser: boolean = false;
  ProposerName: string;
  SubCategoryList: any[] = [];

  DisplayForm: any;

  // APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // FormGroup 
  ProposalSubmissionForm: FormGroup;

  // Alert Array List

  ProposalSubmissionInformationAlerts: Alert[] = [];
  ProposalSubmissionInformationStepCtrl = new FormControl();

  DocumentAttachmentAlert: Alert[] = [];
  DocumentAttachmentStepCtrl = new FormControl()


  //#region Constructor
  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public dialog: MatDialog,
    public _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private authService: AuthService,
    private _dialogService: DialogService,
    private _RFQPAService: RfqWcService,
    private _RFQService: RfqService,
    private _cdr: ChangeDetectorRef,
    private _datePipe: DatePipe,
    private _Location: Location,
  ) {
  }
  //#endregion constructor

  // #region Getters


  // Documents
  get Documents() {
    return this.ProposalSubmissionForm.get('Documents') as FormArray;
  }

  // Document Type List
  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.PA))
  }


  // #end-region Getters

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

    this.DisplayForm = data['data'];

    /**
 * When No one Nominne Found Then Add one object in nominee details TO display Blank field
 */
    if (!this.DisplayForm.NomineeDetails || this.DisplayForm.NomineeDetails?.length == 0) {
      let Nominee: IPANomineeDetailDto = new PANomineeDetailDto()
      Nominee.RFQId = this.DisplayForm.Id
      this.DisplayForm.NomineeDetails.push(Nominee)
    }

    // build travel form
    this.ProposalSubmissionForm = this._buildForm(this.DisplayForm);

    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == UserTypeEnum.Agent || this.authService._userProfile.value?.UserType == UserTypeEnum.TeamReference) {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }

    this.ProposerName = this.DisplayForm?.Members[0]?.Name;
  }

  // After View Init
  ngAfterViewInit(): void {
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
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
    if (this.ProposalSubmissionForm.get('SendBackRejectDesc').value == "" || this.ProposalSubmissionForm.get('SendBackRejectDesc').value == null) {
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

          let SendBackRejectObj: ISendBackRejectDTO = new SendBackRejectDTO()
          SendBackRejectObj.Id = this.ProposalSubmissionForm.value.Id;
          SendBackRejectObj.Stage = this.ProposalSubmissionForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.ProposalSubmissionForm.value.SendBackRejectDesc;

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

  // SendBack Button
  public SendBackButton() {
    if (this.ProposalSubmissionForm.get('SendBackRejectDesc').value == "" || this.ProposalSubmissionForm.get('SendBackRejectDesc').value == null) {
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
          let Id = this.ProposalSubmissionForm.get('Id').value

          let SendBackRejectObj: ISendBackRejectDTO = new SendBackRejectDTO()
          SendBackRejectObj.Id = this.ProposalSubmissionForm.value.Id;
          SendBackRejectObj.Stage = this.ProposalSubmissionForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.ProposalSubmissionForm.value.SendBackRejectDesc;

          this._RFQService.SendBack(SendBackRejectObj).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, "false");
              this._router.navigate([ROUTING_PATH.Basic.Dashboard]);
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

  public SubmitForm() {
    if (this.ProposalSubmissionInformationAlerts.length > 0) {
      this._alertservice.raiseErrors(this.ProposalSubmissionInformationAlerts);
      return;
    }

    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }


    this._dateFormat()

    let submitFormValue = JSON.parse(JSON.stringify(this.ProposalSubmissionForm.value))

    if (!submitFormValue.ProposalSubmissionDetail.StorageFilePath) {
      submitFormValue.ProposalSubmissionDetail = null
    }

    this._RFQPAService.SubmitProposalSubmission(submitFormValue).subscribe(res => {
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


  public ProposalSubmissionInformationValidations() {
    this.ProposalSubmissionInformationAlerts = []

    if (!this.ProposalSubmissionForm.get('ProposalSubmissionDate').value) {
      this.ProposalSubmissionInformationAlerts.push({
        Message: `Proposal Submission Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      const ProposalSubmissionDate = new Date(this._datePipe.transform(this.ProposalSubmissionForm.get('ProposalSubmissionDate').value, 'dd-MM-yyyy'));
      const currentDate = new Date(this._datePipe.transform(this.currentDate, 'dd-MM-yyyy'));

      if (ProposalSubmissionDate > currentDate) {
        this.ProposalSubmissionInformationAlerts.push({
          Message: `Proposal Submission Date can not be gretter than Current Date.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.ProposalSubmissionInformationAlerts.length > 0) {
      this.ProposalSubmissionInformationStepCtrl.setErrors({ required: true });
      return this.ProposalSubmissionInformationStepCtrl;
    }
    else {
      this.ProposalSubmissionInformationStepCtrl.reset();
      return this.ProposalSubmissionInformationStepCtrl;
    }

  }


  public ProposalSubmissionInformationError() {
    if (this.ProposalSubmissionInformationAlerts.length > 0) {
      this._alertservice.raiseErrors(this.ProposalSubmissionInformationAlerts);
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


  // Proposal attachment (uploading the file on this.UploadFileAPI and patching the name & path in form)
  public attachProposalForm(event) {
    let file = event.target.files[0]
    let reader = new FileReader();
    reader.onload = () => { };
    reader.readAsDataURL(file);

    if (file) {
      this._dataService
        .UploadFile(this.UploadFileAPI, file)
        .subscribe((res) => {

          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message);

            this.ProposalSubmissionForm.get('ProposalSubmissionDetail').patchValue({
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              FileName: res.Data.FileName,
              RFQId: this.DisplayForm.Id,
              Stage: this.DisplayForm.Stage,
              DocumentType: 'Proposal',
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


  public removeProposalDoc() {

    this.ProposalSubmissionForm.get('ProposalSubmissionDetail').patchValue({
      FileName: null,
      StorageFileName: null,
      StorageFilePath: null
    })
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
      let RowIndex = this.PolicyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.PolicyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.PolicyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = this.DisplayForm.Stage;
        this.Documents.push(this._initDocumentsForm(row));
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


  /**
  * View Quotation document
  * @param item 
  */
  public ViewDocument(StorageFilePath: string) {
    if (StorageFilePath) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + StorageFilePath)
    }
  }
  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build Main Form
  private _buildForm(data: any) {

    let fg = this.fb.group({
      Id: [0],
      ProposalSubmissionDate: [''],
      Documents: this._buildDocumentsForm(data.Documents),
      ProposalSubmissionDetail: this._initDocumentsForm(data.ProposalSubmissionDetail),

      Stage: [""],
      SendBackRejectDesc: [''],
      Additionalinformation: ['']
    })

    if (data != null) {
      fg.patchValue(data);
    }

    return fg;
  }

  // Documents Formarray
  private _buildDocumentsForm(items: IPADocumentsDto[] = []): FormArray {
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

  // Init Documents Formgroup
  private _initDocumentsForm(item: IPADocumentsDto): FormGroup {

    let dF = this.fb.group({
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


  private _dateFormat() {
    this.ProposalSubmissionForm.patchValue({
      ProposalSubmissionDate: this._datePipe.transform(this.ProposalSubmissionForm.get('ProposalSubmissionDate').value, 'yyyy-MM-dd')
    })
  }

  //#endregion private-methods

}
