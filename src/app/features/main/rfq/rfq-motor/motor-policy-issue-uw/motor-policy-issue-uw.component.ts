import { DatePipe, Location } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { DocumentsDto, IDocumentsDto, IPolicyIssueDto, PolicyIssueDto } from '@models/dtos/config/RFQMotor';
import { MotorPolicyTypeEnum, MotorSubCategoryCodeEnum } from 'src/app/shared/enums/rfq-motor';
import { DialogService } from '@lib/services/dialog.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { environment } from 'src/environments/environment';
import { Alert } from '@models/common';
import { RfqMotorService } from '../rfq-motor.service';
import { RfqService } from '../../rfq.service';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { UserTypeEnum } from 'src/app/shared/enums';
import { AuthService } from '@services/auth/auth.service';


@Component({
  selector: 'gnx-motor-policy-issue-uw',
  templateUrl: './motor-policy-issue-uw.component.html',
  styleUrls: ['./motor-policy-issue-uw.component.scss'],
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
export class MotorPolicyIssueUwComponent {

  @ViewChild('stepper') stepper: MatStepper;

  //Variables
  pagetitle: string; // Page main header title
  mode: string; // for identify of Raise page is create or edit or view
  InsuranceCompany: string = ""
  isExpand: boolean = false;
  IsPOSorReamRefPUser: boolean = false;


  //FormGroup 
  PIUWForm !: FormGroup;
  DisplayForm: any;

  PolicyIssueDetailsAlert: Alert[] = [];

  //Form Controls
  PolicyIssueDetailsStepCtrl = new FormControl();

  //ENUMs
  SubCategoryCodeEnum = MotorSubCategoryCodeEnum;
  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

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
    private _datePipe: DatePipe,
    private _RfqMotorService: RfqMotorService,
    private _RfqService: RfqService,
    private _Location: Location,
    private authService: AuthService,
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
    // data['data'].QNDocuments = data['data'].QNDocuments.filter((el) => el.Buy == true)
    this.DisplayForm = data['data'];
    this.mode = data['mode']

    if (this.DisplayForm.QNDocuments.length > 0) {
      this.DisplayForm.QNDocuments.forEach((el) => {
        if (el.Buy == true) {
          this.InsuranceCompany = el.InsuranceCompany;
        }
      });
    }

    // if (this.DisplayForm.LoadingPremium) {
    //   this.DisplayForm.PaymentDetails = this.DisplayForm.LoadingPaymentDetails
    // }
    // else {
    //   this.DisplayForm.PaymentDetails = this.DisplayForm.PaymentDetails
    // }


    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == UserTypeEnum.Agent || this.authService._userProfile.value?.UserType == UserTypeEnum.TeamReference) {
      this.IsPOSorReamRefPUser = true;
    }
    else {
      this.IsPOSorReamRefPUser = false;
    }

    this.PIUWForm = this._initForm(this.DisplayForm);

    this._onFormChange()

    if (this.mode == 'view') {
      this.PIUWForm.disable()
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


  //Get Gross Premium for only Buy=true
  get getGrossPremium() {
    return this.DisplayForm.QNDocuments.find((f) => f.Buy == true)?.GrossPremium
  }

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------


  // SendBack Button
  public SendBackButton() {
    if (this.PIUWForm.get('SendBackRejectDesc').value == "" || this.PIUWForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.PIUWForm.value.Id;
          SendBackRejectObj.Stage = this.PIUWForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.PIUWForm.value.SendBackRejectDesc;

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

  //Reject Button
  public RejectButton() {
    if (this.PIUWForm.get('SendBackRejectDesc').value == "" || this.PIUWForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.PIUWForm.value.Id;
          SendBackRejectObj.Stage = this.PIUWForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.PIUWForm.value.SendBackRejectDesc;

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

  // Submit Form
  public SubmitForm() {

    if (this.PolicyIssueDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.PolicyIssueDetailsAlert);
      return;
    }

    this._dateFormat();

    this._RfqMotorService.SubmitPolicyIssue(this.PIUWForm.value).subscribe(res => {
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
    })
  }

  // back button
  public backButton() {
    this._Location.back();
  }


  // file data (policy document that is added)
  public UploadDocument(event) {
    if (event.target.files.length > 0) {

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

              this.PIUWForm.get('PolicyIssueDetail').patchValue({
                FileName: res.Data.FileName,
                StorageFileName: res.Data.StorageFileName,
                StorageFilePath: res.Data.StorageFilePath,
                Stage: this.DisplayForm.Stage,
                DocumentType: 'Policy',
              })
            }
            else {
              this._alertservice.raiseErrors(res.Alerts);
            }
          });
      }
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

  public PolicyIssueDetailsValidation() {
    this.PolicyIssueDetailsAlert = []



    if (!this.PIUWForm.get('PolicyIssueDate').value) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy Issue Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }
    if (!this.PIUWForm.get('PolicyStartDate').value) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy Start Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }
    if (!this.PIUWForm.get('PolicyEndDate').value) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy End Date is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    } else {
      if (this.PIUWForm.get('PolicyStartDate').value > this.PIUWForm.get('PolicyEndDate').value) {
        this.PolicyIssueDetailsAlert.push({
          Message: 'Enter valid Policy EndDate.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.DisplayForm.VehicleDetail.PremiumType == '1 OD + 3 TP' || this.DisplayForm.VehicleDetail.PremiumType == '1 OD + 5 TP') {

      if (!this.PIUWForm.get('PolicyTPStartDate').value) {
        this.PolicyIssueDetailsAlert.push({
          Message: `Policy TP Start Date is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
      if (!this.PIUWForm.get('PolicyTPEndDate').value) {
        this.PolicyIssueDetailsAlert.push({
          Message: `Policy TP End Date is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      } else {
        if (this.PIUWForm.get('PolicyTPStartDate').value > this.PIUWForm.get('PolicyTPEndDate').value) {
          this.PolicyIssueDetailsAlert.push({
            Message: 'Enter valid  Policy TP EndDate.',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
    }


    if (!this.PIUWForm.get('PolicyNo').value) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy No is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }
    if (!this.PIUWForm.value.PolicyIssueDetail.FileName) {
      this.PolicyIssueDetailsAlert.push({
        Message: `Policy Document Attachment is required.`,
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.PolicyIssueDetailsAlert.length > 0) {
      this.PolicyIssueDetailsStepCtrl.setErrors({ required: true });
      return this.PolicyIssueDetailsStepCtrl;
    }
    else {
      this.PolicyIssueDetailsStepCtrl.reset();
      return this.PolicyIssueDetailsStepCtrl;
    }

  }

  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }


  // view attached file 
  public ViewQnDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  private _initForm(data: IPolicyIssueDto) {

    let fg = this.fb.group({
      Id: [0],
      PolicyNo: [''],
      PolicyIssueDate: [''],
      PolicyStartDate: [''],
      PolicyEndDate: [''],
      PolicyTPStartDate: [],
      PolicyTPEndDate: [],
      PolicyIssueDetail: this._initDocumentsForm(data?.PolicyIssueDetail),
      Additionalinformation: [''],
      Stage: [''],
      SendBackRejectDesc: [''],
      LoadingPremiumAmountPaidBy: [],
      PremiumAmountPaidBy: []
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

  // Document formgroup
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


  private _dateFormat() {
    this.PIUWForm.patchValue({
      PolicyIssueDate: this._datePipe.transform(this.PIUWForm.get('PolicyIssueDate').value, 'yyyy-MM-dd'),
      PolicyStartDate: this._datePipe.transform(this.PIUWForm.get('PolicyStartDate').value, 'yyyy-MM-dd'),
      PolicyEndDate: this._datePipe.transform(this.PIUWForm.get('PolicyEndDate').value, 'yyyy-MM-dd'),

    })
  }

  private _onFormChange() {

    this.PIUWForm.get('PolicyStartDate').valueChanges.subscribe(val => {

      if (val) {
        let StartDate = this._datePipe.transform(this.PIUWForm.get('PolicyStartDate').value, 'yyyy-MM-dd');
        let endDate = new Date(StartDate);
        endDate.setFullYear(endDate.getFullYear() + 1); // add year
        endDate.setDate(endDate.getDate() - 1);  // one day les
        this.PIUWForm.get('PolicyEndDate').patchValue(endDate);

        let PremiumType = this.DisplayForm.VehicleDetail.PremiumType;


        if (PremiumType == '1 OD + 3 TP' || PremiumType == '1 OD + 5 TP') {
          this.PIUWForm.get('PolicyTPStartDate').patchValue(StartDate);
        }
      }

    })

    this.PIUWForm.get('PolicyTPStartDate').valueChanges.subscribe((val) => {
      if (this.PIUWForm.get('PolicyTPStartDate').value) {
        let TPStartDate = this._datePipe.transform(this.PIUWForm.get('PolicyTPStartDate').value, 'yyyy-MM-dd');
        let tPEndDate = new Date(TPStartDate);

        let PremiumType = this.DisplayForm.VehicleDetail.PremiumType;
        let TP: number = 0;
        if (PremiumType == '1 OD + 1 TP') {
          TP = 1;
        }
        if (PremiumType == '1 OD + 3 TP') {
          TP = 3;
        }
        if (PremiumType == '1 OD + 5 TP') {
          TP = 5;
        }

        tPEndDate.setFullYear(tPEndDate.getFullYear() + TP); // add year
        tPEndDate.setDate(tPEndDate.getDate() - 1);  // one day les
        this.PIUWForm.patchValue({
          PolicyTPEndDate: tPEndDate
        });
      }
    })

  }

  //#endregion private-methods
}
