import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert } from '@models/common';
import { DocumentsDto, IDocumentsDto, IProposalSubmissionDto } from '@models/dtos/config/RFQMotor';
import { MotorPolicyTypeEnum, MotorSubCategoryCodeEnum } from 'src/app/shared/enums/rfq-motor';
import { environment } from 'src/environments/environment';
import { AuthService } from '@services/auth/auth.service';
import { RfqMotorService } from '../rfq-motor.service';
import { RfqService } from '../../rfq.service';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { RFQDocumentsDrpList } from '@config/rfq';
import { CategoryCodeEnum } from 'src/app/shared/enums';


@Component({
  selector: 'gnx-motor-proposal-submission-uw',
  templateUrl: './motor-proposal-submission-uw.component.html',
  styleUrls: ['./motor-proposal-submission-uw.component.scss'],
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
export class MotorProposalSubmissionUwComponent {

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  //Variables
  pagetitle: string; // Page main header title
  mode: string; // for identify of Raise page is create or edit or view
  ProposalFormFileName: string = '';
  ProposalFormFilePath: string = '';
  isExpand: boolean = false;
  currentDate = new Date();

  //FormGroup 
  PSUWForm !: FormGroup;
  DisplayForm: any;
  // Boolean
  IsPOSPUser: boolean = false;

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message

  ProposalSubmissionInformationAlerts: Alert[] = [];
  ProposalSubmissionInformationStepCtrl = new FormControl();
  DocumentAttachmentAlert: Alert[] = [];
  DocumentAttachmentStepCtrl = new FormControl()

  //Enums
  MotorPolicyTypeEnum = MotorPolicyTypeEnum;
  SubCategoryCodeEnum = MotorSubCategoryCodeEnum;

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
    private _dialogService: DialogService,
    private cdr: ChangeDetectorRef,
    private _datePipe: DatePipe,
    private _RfqMotorService: RfqMotorService,
    private _RfqService: RfqService,
    private _authService: AuthService,
    private _Location: Location,
  ) { }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  //On Init
  ngOnInit(): void {

    //Get Route Params Data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title'];
    this.DisplayForm = data['data'];
    this.mode = data['mode']

    // Init Form
    this.PSUWForm = this._initForm(this.DisplayForm);

    // get User type from user profile
    if (this._authService._userProfile.value?.UserType == "Agent") {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }

  }

  ngAfterViewInit(): void {

    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();

    if (this.DisplayForm.PolicyType == MotorPolicyTypeEnum.Rollover || this.DisplayForm.PolicyType == 'Renewal-Change Company' || this.DisplayForm.PolicyType == 'Renewal-Same Company') {
      this.stepper.next();
    }

    this.cdr.detectChanges();

  }

  //#endregion lifecyclehooks

  //#region Getters

  // Documents FormArray
  get Documents() {
    return this.PSUWForm.get('Documents') as FormArray;
  }

  // Document Type List
  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Motor))
  }

  //#endRegion Getters

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public stepOneValidation() {

  }

  public SubmitForm() {

    if (this.ProposalSubmissionInformationAlerts.length > 0) {
      this._alertservice.raiseErrors(this.ProposalSubmissionInformationAlerts);
      return;
    }

    // Validate form (If not return altert message .) 
    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }

    this._DateFormat();


    let submitFormValue = JSON.parse(JSON.stringify(this.PSUWForm.value))

    if (!submitFormValue.ProposalSubmissionDetail.StorageFilePath) {
      submitFormValue.ProposalSubmissionDetail = null
    }

    // When form is validated submit form value 
    this._RfqMotorService.SubmitProposalSubmission(submitFormValue).subscribe((res) => {
      if (res.Success) {
        this._alertservice.raiseSuccessAlert(res.Message, "false");
        this._router.navigate([ROUTING_PATH.Basic.Dashboard]);
      }
      else {
        if (res.Alerts && res.Alerts?.length > 0) {
          this._alertservice.raiseErrors(res.Alerts);
        }
        else {
          this._alertservice.raiseErrorAlert(res.Message);
        }
      }
    })
  }

  // Reject Button
  public RejectButton() {
    if (this.PSUWForm.get('SendBackRejectDesc').value == "" || this.PSUWForm.get('SendBackRejectDesc').value == null) {
      this._alertservice.raiseErrorAlert('Reject Reason is required.');
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
          SendBackRejectObj.Id = this.PSUWForm.value.Id;
          SendBackRejectObj.Stage = this.PSUWForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.PSUWForm.value.SendBackRejectDesc;

          this._RfqService.Reject(SendBackRejectObj).subscribe((res) => {
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
    if (this.PSUWForm.get('SendBackRejectDesc').value == "" || this.PSUWForm.get('SendBackRejectDesc').value == null) {
      this._alertservice.raiseErrorAlert('Send Back Reason is required.');
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
          SendBackRejectObj.Id = this.PSUWForm.value.Id;
          SendBackRejectObj.Stage = this.PSUWForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.PSUWForm.value.SendBackRejectDesc;

          this._RfqService.SendBack(SendBackRejectObj).subscribe((res) => {
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


  // back button
  public backButton() {
    this._Location.back();
  }

  // view attached file 
  public ViewQnDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
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
            this._alertservice.raiseSuccessAlert(res.Message)


            this.PSUWForm.get('ProposalSubmissionDetail').patchValue({
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              FileName: res.Data.FileName,
              RFQId: this.DisplayForm.Id,
              Stage: this.DisplayForm.Stage,
              DocumentType: 'Proposal',
            })


          }
          else {
            this._alertservice.raiseErrors(res.Alerts);
          }
        });
    }

  }


  public removeProposalDoc() {

    this.PSUWForm.get('ProposalSubmissionDetail').patchValue({
      FileName: null,
      StorageFileName: null,
      StorageFilePath: null
    })
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
    const row: IDocumentsDto = new DocumentsDto();
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


  public ProposalSubmissionInformationValidations() {
    this.ProposalSubmissionInformationAlerts = []

    if (!this.PSUWForm.get('ProposalSubmissionDate').value) {
      this.ProposalSubmissionInformationAlerts.push({
        Message: `Proposal Submission Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      const ProposalSubmissionDate = new Date(this._datePipe.transform(this.PSUWForm.get('ProposalSubmissionDate').value, 'dd-MM-yyyy'));
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

  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  private _initForm(data: IProposalSubmissionDto) {

    let fg = this.fb.group({
      Id: [0],
      ProposalSubmissionDate: [''],
      Documents: this._buildDocumentsForm(data.Documents),
      ProposalSubmissionDetail: this._initDocumentsForm(data.ProposalSubmissionDetail),
      Additionalinformation: [''],
      Stage: [""],
      SendBackRejectDesc: ['']
    })

    if (data != null) {
      fg.patchValue(data);
    }

    return fg;
  }

  // Documents Formarray
  private _buildDocumentsForm(items: IDocumentsDto[] = []): FormArray {
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
  private _initDocumentsForm(item: IDocumentsDto): FormGroup {

    let dF = this.fb.group({
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
    })

    if (item != null) {
      if (!item) {
        item = new DocumentsDto();
      }
      if (item) {
        dF.patchValue(item);
      }
    }

    return dF
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

  // date format
  private _DateFormat() {
    this.PSUWForm.patchValue({
      ProposalSubmissionDate: this._datePipe.transform(this.PSUWForm.get('ProposalSubmissionDate').value, 'yyyy-MM-dd')
    })
  }

  //#endregion private-methods
}
