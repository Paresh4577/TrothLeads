import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ILiabilityPrePolicyDTO, LiabilityPrePolicyDTO, RFQLiabilityDocumentsDto } from '@models/dtos';
import { environment } from 'src/environments/environment';
import { ROUTING_PATH } from '@config/routingPath.config';
import { IRfqDoclistDTO, ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { RFQDocumentsDrpList } from '@config/rfq';
import { CategoryCodeEnum } from 'src/app/shared/enums';
import { RfqLiabilityService } from '../rfq-liability.service';
import { MatStepper } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert } from '@models/common';
import { AuthService } from '@services/auth/auth.service';


@Component({
  selector: 'gnx-liability-proposal-submission-uw',
  templateUrl: './liability-proposal-submission-uw.component.html',
  styleUrls: ['./liability-proposal-submission-uw.component.scss'],
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
export class LiabilityProposalSubmissionUwComponent {

  //#region public properties
  @ViewChild('stepper') public stepper: MatStepper;
  @ViewChild('DocumentDropdown') public DocumentDropdown: ElementRef;

  // Variables
  public pagetitle: string = '';
  public mode: string = '';
  public currentDate = new Date();
  public isExpand: boolean = false;
  public isPOSPUser: boolean = false;
  public subCategoryList: any[] = [];
  public selectedQN: any
  public displayForm: any;
  public maxDate = new Date()
  public ProposalSubmissionForm: FormGroup;


  //#endregion


  //#region private properties
  private _uploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API
  private _proposalSubmissionInformationAlerts: Alert[] = [];
  private _proposalSubmissionInformationStepCtrl = new FormControl();
  private _documentAttachmentAlert: Alert[] = [];
  private _documentAttachmentStepCtrl = new FormControl()
  //#endregion

  //#region Constructor
  constructor(
    private _fb: FormBuilder,
    private _alertservice: AlertsService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _datePipe: DatePipe,
    private authService: AuthService,
    private _dialogService: DialogService,
    private _rfqLiabilityService: RfqLiabilityService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
  ) {
  }
  //#endregion constructor

  // #region Getters

  // Documents
  public get documents(): FormArray {
    return this.ProposalSubmissionForm.get('Documents') as FormArray;
  }

  // Document Type List
  public get policyDocumentList(): IRfqDoclistDTO[] {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Liability))
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

    this.displayForm = data['data'];

    /**
* When No one PrevPolicyDetail Found Then Add one object in PrevPolicyDetail details TO display Blank field
*/
    if (!this.displayForm.PrevPolicyDetail || this.displayForm.PrevPolicyDetail?.length == 0) {
      let row: ILiabilityPrePolicyDTO = new LiabilityPrePolicyDTO()
      row.RFQId = this.displayForm.Id
      this.displayForm.PrevPolicyDetail.push(row)
    }


    // build Engineering form
    this.ProposalSubmissionForm = this._buildForm(this.displayForm);

    if (this.displayForm.QNDocuments.length > 0) {
      this.displayForm.QNDocuments.forEach((el) => {
        if (el.Buy == true) {
          this.selectedQN = el;
        }
      });
    }

    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == "Agent") {
      this.isPOSPUser = true;
    }
    else {
      this.isPOSPUser = false;
    }
  }

  // After View Init
  ngAfterViewInit(): void {
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    if (this.displayForm.PolicyType == 'Rollover' || this.displayForm.PolicyType == 'Renewal-Change Company' || this.displayForm.PolicyType == 'Renewal-Same Company') {
      this.stepper.next();
      this.stepper.next();
    }

    this._cdr.detectChanges();
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // back button
  public backButton(): void {
    this._Location.back();
  }

  // Reject Button
  public rejectButton(): void {
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

          this._rfqLiabilityService.reject(SendBackRejectObj).subscribe((res) => {
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
  public sendBackButton(): void {
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

          this._rfqLiabilityService.sendBack(SendBackRejectObj).subscribe((res) => {
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

  public submitForm(): void {
    this._dateFormat();

    if (this._proposalSubmissionInformationAlerts.length > 0) {
      this._alertservice.raiseErrors(this._proposalSubmissionInformationAlerts);
      return;
    }

    if (this._documentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this._documentAttachmentAlert);
      return;
    }

    let submitFormValue = JSON.parse(JSON.stringify(this.ProposalSubmissionForm.value))

    if (!submitFormValue.ProposalSubmissionDetail.StorageFilePath) {
      submitFormValue.ProposalSubmissionDetail = null
    }

    this._rfqLiabilityService.submitProposalSubmission(submitFormValue).subscribe(res => {
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

  public expandCollaps(): void {
    this.isExpand = !this.isExpand;
  }

  public proposalSubmissionInformationValidations(): FormControl {
    this._proposalSubmissionInformationAlerts = []

    if (!this.ProposalSubmissionForm.get('ProposalSubmissionDate').value) {
      this._proposalSubmissionInformationAlerts.push({
        Message: `Proposal Submission Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      const ProposalSubmissionDate = new Date(this._datePipe.transform(this.ProposalSubmissionForm.get('ProposalSubmissionDate').value, 'dd-MM-yyyy'));
      const currentDate = new Date(this._datePipe.transform(this.currentDate, 'dd-MM-yyyy'));

      if (ProposalSubmissionDate > currentDate) {
        this._proposalSubmissionInformationAlerts.push({
          Message: `Proposal Submission Date can not be gretter than Current Date.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this._proposalSubmissionInformationAlerts.length > 0) {
      this._proposalSubmissionInformationStepCtrl.setErrors({ required: true });
      return this._proposalSubmissionInformationStepCtrl;
    }
    else {
      this._proposalSubmissionInformationStepCtrl.reset();
      return this._proposalSubmissionInformationStepCtrl;
    }
  }

  public proposalSubmissionInformationError(): void {
    if (this._proposalSubmissionInformationAlerts.length > 0) {
      this._alertservice.raiseErrors(this._proposalSubmissionInformationAlerts);
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

  // Proposal attachment (uploading the file on this.UploadFileAPI and patching the name & path in form)
  public attachProposalForm(event): void {
    let file = event.target.files[0]
    let reader = new FileReader();
    reader.onload = () => { };
    reader.readAsDataURL(file);

    if (file) {
      this._dataService
        .UploadFile(this._uploadFileAPI, file)
        .subscribe((res) => {

          if (res.Success) {
            this._alertservice.raiseSuccessAlert(res.Message);

            this.ProposalSubmissionForm.get('ProposalSubmissionDetail').patchValue({
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              FileName: res.Data.FileName,
              RFQId: this.displayForm.Id,
              Stage: this.displayForm.Stage,
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

  public removeProposalDoc(): void {
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
    const row: RFQLiabilityDocumentsDto = new RFQLiabilityDocumentsDto();
    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.policyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.policyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.policyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = this.displayForm.Stage;
        this.documents.push(this._initDocumentsForm(row));
      }
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
  public viewDocument(StorageFilePath: string): void {
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
  private _buildForm(data: any): FormGroup {

    let fg = this._fb.group({
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
  private _buildDocumentsForm(items: RFQLiabilityDocumentsDto[] = []): FormArray {
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
  private _initDocumentsForm(item: RFQLiabilityDocumentsDto): FormGroup {

    let dF = this._fb.group({
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

    if (item) {
      dF.patchValue(item);
    }

    return dF
  }



  private _dateFormat(): void {
    this.ProposalSubmissionForm.patchValue({
      ProposalSubmissionDate: this._datePipe.transform(this.ProposalSubmissionForm.get('ProposalSubmissionDate').value, 'yyyy-MM-dd')
    })
  }


  //#endregion private-methods
}
