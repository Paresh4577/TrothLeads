import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { AuthService } from '@services/auth/auth.service';
import { RfqLifeService } from '../rfq-life.service';
import { ROUTING_PATH } from '@config/routingPath.config';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { LifeDocumentsDto, LifeFamilyDetailsDto, ILifeDocumentsDto, ILifeFamilyDetailsDto, ILifeQNSelectionSPDto, ILifeNomineeDetailsDto, ILifeQNDocumentsDto, LifeMemberDTO, LifeNomineeDetailsDto, LifeQNDocumentsDto } from '@models/dtos';
import { Alert } from '@models/common';
import { CategoryCodeEnum, SubCategoryCodeEnum } from 'src/app/shared/enums';
import { MatStepper } from '@angular/material/stepper';
import { DisplayedLifeMarritalStatus, DisplayedLifeMoninneRelation, DisplayedLifeOccupation, DisplayedLifePremiumInstallmentType } from '@config/rfq';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { ValidationRegex } from '@config/validationRegex.config';
import { RFQDocumentsDrpList } from '@config/rfq';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { RfqService } from '../../rfq.service';

@Component({
  selector: 'gnx-life-qn-selection-sp',
  templateUrl: './life-qn-selection-sp.component.html',
  styleUrls: ['./life-qn-selection-sp.component.scss'],
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
export class LifeQnSelectionSpComponent {

  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;
  @ViewChild('stepper') stepper: MatStepper;

  // Variables
  pagetitle: string = '';
  isExpand: boolean = false;
  mode: string = '';
  ProposerName: string;
  DisplayForm: any;

  setmaxBirthDate: Date = new Date(); //Max DOB

  //Form Group 
  LifeQNSForm: FormGroup;

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  PANNumValidationReg: RegExp = ValidationRegex.PANNumValidationReg; // PAN number Validation regex
  UIDNumValidationReg: RegExp = ValidationRegex.UIDNumValidationReg; //Aadhar/UID number Validation regex
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg; //Email Validation regex

  // Alert Array List
  detailsFieldsList: any[] // A list of Insured person Questionary
  QuotationSelectionAerts: Alert[] = []; // Step Invalid field error message
  ProductCategoryDetailsAlert: Alert[] = [];
  ProductCategoryNomineeDetailsAlert: Alert[] = [];
  ProductCategoryFamilyDetailsAlert: Alert[] = [];
  KYCDetailsAlerts: Alert[] = [];
  PaymentModeDetailsAlerts: Alert[] = [];
  DocumentAttachmentAlert: Alert[] = [];

  ProductCategoryDetailsStepCtrl = new FormControl();
  QuotationSelectionStepctrl = new FormControl()
  KYCDetailsStepCtrl = new FormControl()
  PaymentModeDetailsStepCtrl = new FormControl()
  DocumentAttachmentStepCtrl = new FormControl()

  // Enums
  SubCategoryCodeEnum = SubCategoryCodeEnum;

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
    private authService: AuthService,
    private _dialogService: DialogService,
    private _MasterListService: MasterListService,
    private _rfqLifeService: RfqLifeService,
    private _Location: Location,
    private _datePipe: DatePipe,
    private _rfqServive: RfqService,
  ) {
    // Get Inssuerd Person Questionary list
    this.detailsFieldsList = this._rfqLifeService.getdetailsFieldsList()
  }
  // #endregion constructor

  // #region Getters

  // Document Type List
  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Life))
  }

  // QNDocuments Form array
  get QNselection() {
    return this.LifeQNSForm.get('QNDocuments') as FormArray;
  }

  // Documents Form array
  get Documents() {
    return this.LifeQNSForm.get('Documents') as FormArray;
  }

  // Members Form array
  get Members() {
    return this.LifeQNSForm.get('Members') as FormArray;
  }

  // Displayed Life premium installment type options
  get DisplayedLifePremiumInstallmentType() {
    return DisplayedLifePremiumInstallmentType;
  }

  get DisplayedLifeOccupation() {
    return DisplayedLifeOccupation
  }

  // Displayed Life Marrital Status options
  get DisplayedLifeMarritalStatus() {
    return DisplayedLifeMarritalStatus;
  }

  get DisplayedLifeMoninneRelation() {
    return DisplayedLifeMoninneRelation
  }


  // #endRegion Getters


  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  // On Init
  ngOnInit(): void {

    //Get Route Params Data
    let data = this._route.snapshot.data;
    this.pagetitle = data['title']
    this.DisplayForm = data['data'];
    this.mode = data['mode']

    // Init Form
    this.LifeQNSForm = this._initForm(this.DisplayForm);

    this._OnformChange()
    /**
     * If Find Any member is Life assued Then Add Nominee Details & Family Details
     */
    this.Members.controls.forEach((m, i) => {
      if (m.get('IsLifeAssured').value == true) {

        if (m.value.NomineeDetails?.length == 0) {
          this.AddNomeneeDetails(i)
        }

        if (m.value.FamilyDetails?.length == 0) {
          this.AddFamilyDetails(i)
        }

      }
    });
    
    this.ProposerName = this.Members?.controls[0]?.value?.Name

  }

  // After View Init
  ngAfterViewInit(): void {

    this.stepper.next();
    this.stepper.next();

    this.cdr.detectChanges();

  }

  //#endregion lifecyclehooks


  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // Back Button
  public backButton() {
    this._Location.back();
  }

  // Expand Collapse Button
  public ExpandCollaps() {
    this.isExpand = !this.isExpand;
  }


  // Reject Button
  public RejectButton() {
    if (this.LifeQNSForm.get('SendBackRejectDesc').value == "" || this.LifeQNSForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.LifeQNSForm.value.Id;
          SendBackRejectObj.Stage = this.LifeQNSForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.LifeQNSForm.value.SendBackRejectDesc;
          this._rfqLifeService.Reject(SendBackRejectObj).subscribe((res) => {
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
    if (this.LifeQNSForm.get('SendBackRejectDesc').value == "" || this.LifeQNSForm.get('SendBackRejectDesc').value == null) {
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
          let SendBackRejectObj: ISendBackRejectDTO = new SendBackRejectDTO()
          SendBackRejectObj.Id = this.LifeQNSForm.value.Id;
          SendBackRejectObj.Stage = this.LifeQNSForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.LifeQNSForm.value.SendBackRejectDesc;

          this._rfqLifeService.SendBack(SendBackRejectObj).subscribe((res) => {
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

  // Submit Form Button
  public SubmitFormButton() {

    if (this.QuotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAerts);
      return;
    }

    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
      return;
    }

    if (this.ProductCategoryNomineeDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryNomineeDetailsAlert);
      return;
    }

    if (this.ProductCategoryFamilyDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryFamilyDetailsAlert);
      return;
    }

    if (this.KYCDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.KYCDetailsAlerts);
      return;
    }

    if (this.PaymentModeDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PaymentModeDetailsAlerts);
      return;
    }

    if (this.DocumentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this.DocumentAttachmentAlert);
      return;
    }

    this._DateFormat()

    let SubmitFormValue = JSON.parse(JSON.stringify(this.LifeQNSForm.value))

    // if pan not attach then Field value is set null
    if (!SubmitFormValue.PANDetails?.StorageFilePath) {
      SubmitFormValue.PANDetails = null
    }
    // if Aadhar not attach then Field value is set null
    if (!SubmitFormValue.AadharDetails?.StorageFilePath) {
      SubmitFormValue.AadharDetails = null
    }

    this._rfqLifeService.SubmitQNSelectionSP(SubmitFormValue).subscribe((res) => {
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

  /**
   * Set true Selected quotation
   * @param index "Selected Quotation index"
   */
  public SelectBuy(index: number) {

    if (this.QNselection.controls[index].get('Buy').value) {
      this._alertservice.raiseErrorAlert('Quotation is already Selected.');
      return;
    }

    this.QNselection.controls.forEach((qn, i) => {
      if (i == index) {
        qn.get('Buy').setValue(true)
        if (this.LifeQNSForm.get('PaymentMode').value == 'Cheque') {
          this.LifeQNSForm.get('PaymentAccountName').patchValue(qn.value.InsuranceCompanyName)
        }
      } else {
        qn.get('Buy').setValue(false)
      }
    })
  }

  /**
   * Download attch QN Documents
   * @returns 
  */
  public DonloadQNdocument() {
    if (this.QuotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAerts);
      return;
    }

    //Find Selected QN Doc
    let SelectedQuotation = this.QNselection.value.find(qn => qn.Buy == true)

    if (SelectedQuotation) {
      this._rfqLifeService.DownloadQnDocument(SelectedQuotation.Id).subscribe(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = SelectedQuotation.FileName;
        a.click();
        URL.revokeObjectURL(objectUrl);
      })
    }
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
    const row: ILifeDocumentsDto = new LifeDocumentsDto();
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

  // Remove KYC Documents
  public removeKycDoc(DocumentType: string) {
    if (DocumentType == 'UID') {
      this.LifeQNSForm.get('AadharDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
    }
    else if (DocumentType == 'PAN') {
      this.LifeQNSForm.get('PANDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
    }

  }


  /**
* Check step two Invalid Formfield
*/
  public QuotationSelectionValidationControl() {
    this.QuotationSelectionAerts = [];

    if (this.mode != "view") {
      if (!this.QNselection.value.some(ele => ele.Buy == true)) {
        this.QuotationSelectionAerts.push({
          Message: `Quotation Selection is Required`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    /**
    *  Step control Validate
    */
    if (this.QuotationSelectionAerts.length > 0) {
      this.QuotationSelectionStepctrl.setErrors({ required: true });
      return this.QuotationSelectionStepctrl;
    } else {
      this.QuotationSelectionStepctrl.reset();
      return this.QuotationSelectionStepctrl;
    }
  }

  /**
    * Display Error message 
    */
  public QuotationSelectionValidationError() {
    if (this.QuotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAerts);
    }
  }


  public ProductCategoryDetailsValidations() {

    this.ProductCategoryDetailsAlert = []
    this.ProductCategoryNomineeDetailsAlert = [];
    this.ProductCategoryFamilyDetailsAlert = [];

    this.Members.controls.forEach((m, i) => {

      if (!m.get('Name').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Name is required`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (!m.get('PlaceOfBirth').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Place of Birth is required`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (!m.get('Email').value) {
        // this.ProductCategoryDetailsAlert.push({
        //   Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Email is required`,
        //   CanDismiss: false,
        //   AutoClose: false,
        // })
      } else {
        if (!this.emailValidationReg.test(m.get('Email').value)) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Enter Valid Email`,
            CanDismiss: false,
            AutoClose: false,
          });
        }

      }

      if (m.get("HeightFeetInch").hasError("required") && m.get("HeightCM").hasError("required")) {
        this.ProductCategoryDetailsAlert.push({
          Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Enter Height  Eigther  Feet/Inch or CM`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      // if (m.get("HeightCM").hasError("required")) {
      //   this.ProductCategoryDetailsAlert.push({
      //     Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Enter Height (CM)`,
      //     CanDismiss: false,
      //     AutoClose: false,
      //   })
      // }
      if (m.get("Weight").hasError("required")) {
        this.ProductCategoryDetailsAlert.push({
          Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Enter Weight`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (!m.get('FatherName').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Father Name is required`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (!m.get('MotherName').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Mother Name is required`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (!m.get('Marital').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Marital Status is required`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (m.get('Marital').value == 'Married') {
        if (!m.get('SpouseName').value) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Spouse Name is required`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }

      if (!m.get('Qualification').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Highest Qualifiaction is required`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (m.get('Alcohol').value == null) {
        this.ProductCategoryDetailsAlert.push({
          Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Habit of Alcohol is required`,
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if ((m.value.IsLifeAssured && this.DisplayForm.SubCategoryCode != SubCategoryCodeEnum.ChildPlan) ||
        (m.value.IsPolicyHolder)) {
        if (!m.get('Occupation').value) {
          this.ProductCategoryDetailsAlert.push({
            Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Occupation is required`,
            CanDismiss: false,
            AutoClose: false,
          })
        }

        if (m.get('Occupation').value == "Salaried" || m.get('Occupation').value == "Business Owner") {
          if (!m.get('EmployerName').value) {
            this.ProductCategoryDetailsAlert.push({
              Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Employer Name is required`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (!m.get('Designation').value) {
            this.ProductCategoryDetailsAlert.push({
              Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Designation is required`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (!m.get('OfficeAddress').value) {
            this.ProductCategoryDetailsAlert.push({
              Message: `${m.value.IsPolicyHolder ? "Policy Holder" : "Life Assured "} - Office Address is required`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }

      }




      if (m.value.IsLifeAssured) {

        if (m.get('AnyPrevInsuranceCover').value == null) {
          this.ProductCategoryDetailsAlert.push({
            Message: "Any Previous Insurance Cover is required",
            CanDismiss: false,
            AutoClose: false,
          })
        }
        if (m.get('AnyPrevInsuranceCover').value == 'true' || m.get('AnyPrevInsuranceCover').value == true) {
          if (!m.get('AnyPrevInsuranceCoverDesc').value) {
            this.ProductCategoryDetailsAlert.push({
              Message: "Details of Insurance Cover is required",
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }

        if (m.get('AnyPreExistingMedicalIssue').value == null) {
          this.ProductCategoryDetailsAlert.push({
            Message: "Any Health Issue is required",
            CanDismiss: false,
            AutoClose: false,
          })
        }
        if (m.get('AnyPreExistingMedicalIssue').value == 'true' || m.get('AnyPreExistingMedicalIssue').value == true) {
          if (!m.get('MedicalIssueDetails').value) {
            this.ProductCategoryDetailsAlert.push({
              Message: "Details of Health Issue is required",
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }




        let NominneDetailsFormArray = m.get('NomineeDetails') as FormArray
        let FamilyDetailsFormArray = m.get('FamilyDetails') as FormArray

        /**
         * Total of nominee percentage 
         */

        let nomineePerSum = 0;

        if (NominneDetailsFormArray.controls.length > 0) {
          NominneDetailsFormArray.controls.forEach(n => {
            if (n.get("NomineePer")?.value) {
              nomineePerSum += parseFloat(n.get("NomineePer")?.value)
            }
          })
        }

        if (nomineePerSum != 100) {
          this.ProductCategoryDetailsAlert.push({
            Message: "Sum of Nominee % Should be 100.",
            CanDismiss: false,
            AutoClose: false,
          })
        }


        /**
         * Nominee details validation
         */
        NominneDetailsFormArray.controls.forEach((nominee, n) => {

          if (!nominee.get('Name').value) {
            this.ProductCategoryNomineeDetailsAlert.push({
              Message: `${n + 1} - Nominee Name is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (!nominee.get('DOB').value) {
            this.ProductCategoryNomineeDetailsAlert.push({
              Message: `${n + 1} - Nominee Date of birth is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          } else {
            if (this._datePipe.transform(nominee.get('DOB').value, 'yyyy-MM-dd') > this._datePipe.transform(this.setmaxBirthDate, 'yyyy-MM-dd')) {
              this.ProductCategoryNomineeDetailsAlert.push({
                Message: `${n + 1} - Future date not allow in Nominee Date of birth.`,
                CanDismiss: false,
                AutoClose: false,
              })
            }
          }

          if (!nominee.get('Relation').value) {
            this.ProductCategoryNomineeDetailsAlert.push({
              Message: `${n + 1} - Nominee Relation with Life Assured is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (!nominee.get('NomineePer').value) {
            this.ProductCategoryNomineeDetailsAlert.push({
              Message: `${n + 1} - Nominee % is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (this.NomineeAge(nominee.get('DOB').value) < 18) {

            if (!nominee.get('AppointeeName').value) {
              this.ProductCategoryNomineeDetailsAlert.push({
                Message: `${n + 1} - Appointee Name is required.`,
                CanDismiss: false,
                AutoClose: false,
              })
            }

            if (!nominee.get('AppointeeDOB').value) {
              this.ProductCategoryNomineeDetailsAlert.push({
                Message: `${n + 1} - Appointee Date of birth is required.`,
                CanDismiss: false,
                AutoClose: false,
              })
            }

            if (!nominee.get('AppointeeRelation').value) {
              this.ProductCategoryNomineeDetailsAlert.push({
                Message: `${n + 1} - Appointee Relation with Life Assured is required.`,
                CanDismiss: false,
                AutoClose: false,
              })
            }



          }



        })


        /**
         * Family Details Validation
         */
        FamilyDetailsFormArray.controls.forEach((family, f) => {

          if (!family.get('Relation').value) {
            this.ProductCategoryFamilyDetailsAlert.push({
              Message: `${f + 1} - Family member Relation is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (!family.get('Age').value) {
            this.ProductCategoryFamilyDetailsAlert.push({
              Message: `${f + 1} - Family member age is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          if (!family.get('HealthStatus').value) {
            this.ProductCategoryFamilyDetailsAlert.push({
              Message: `${f + 1} - Family member Health status is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          // if (!family.get('Height').value) {
          //   this.ProductCategoryFamilyDetailsAlert.push({
          //     Message: `${f + 1} - Family member Height is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (!family.get('Weight').value) {
          //   this.ProductCategoryFamilyDetailsAlert.push({
          //     Message: `${f + 1} - Family member Weight is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (family.get('SmokerTibco').value == null) {
          //   this.ProductCategoryFamilyDetailsAlert.push({
          //     Message: `${f + 1} - Family member  Consume Tobacco/Alcohol field is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          if (family.get('Alive').value == null || family.get('Alive').value.toString() == "") {
            this.ProductCategoryFamilyDetailsAlert.push({
              Message: `${f + 1} - Family member  Alive field is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }



          if (family.get('Alive').value == false || family.get('Alive').value == "false") {

            if (!family.get('ExpireAge').value) {
              this.ProductCategoryFamilyDetailsAlert.push({
                Message: `${f + 1} - Family member Age at death is required.`,
                CanDismiss: false,
                AutoClose: false,
              })
            }

            if (!family.get('CauseOfDeath').value) {
              this.ProductCategoryFamilyDetailsAlert.push({
                Message: `${f + 1} - Family member Cause of Death is required.`,
                CanDismiss: false,
                AutoClose: false,
              })
            }



          }

        })
      }



    });



    if (this.ProductCategoryDetailsAlert.length > 0
      || this.ProductCategoryNomineeDetailsAlert.length > 0
      || this.ProductCategoryFamilyDetailsAlert.length > 0) {
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
    if (this.ProductCategoryNomineeDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryNomineeDetailsAlert);
      return;
    }
    if (this.ProductCategoryFamilyDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryFamilyDetailsAlert);
      return;
    }
  }

  /**
* Check step four Invalid Formfield
*/
  public KYCDetailsValidationControl() {
    this.KYCDetailsAlerts = [];

    if (this.mode != "view") {

      if (!this.LifeQNSForm.get('AadharNo').value) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter  Aadhar',
          CanDismiss: false,
          AutoClose: false,
        });
      } else if (!this.UIDNumValidationReg.test(this.LifeQNSForm.get('AadharNo').value)) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter valid Aadhar',
          CanDismiss: false,
          AutoClose: false,
        });
      }


      if (!this.LifeQNSForm.get('PANNo').value) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter  PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      } else if (!this.PANNumValidationReg.test(this.LifeQNSForm.get('PANNo').value)) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter valid PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      }

    }

    /**
    * Step control Validate
    */
    if (this.KYCDetailsAlerts.length > 0) {
      this.KYCDetailsStepCtrl.setErrors({ required: true });
      return this.KYCDetailsStepCtrl;
    } else {
      this.KYCDetailsStepCtrl.reset();
      return this.KYCDetailsStepCtrl;
    }
  }

  /**
   * Display Error message 
   */
  public KYCDetailsValidationError() {
    if (this.KYCDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.KYCDetailsAlerts);
    }
  }



  public PaymentModeDetailValidationControl() {
    this.PaymentModeDetailsAlerts = [];

    if (this.mode != "view") {
      if (!this.LifeQNSForm.get("PaymentMode").value) {
        this.PaymentModeDetailsAlerts.push({
          Message: "Select any one PaymentMode",
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.LifeQNSForm.get("PaymentMode").value == 'Cheque') {
        if (!this.LifeQNSForm.get("PaymentAccountName").value) {
          this.PaymentModeDetailsAlerts.push({
            Message: "Insurance Company - Full Name is required",
            CanDismiss: false,
            AutoClose: false,
          })
        }
      }
    }
    /**
    * Step control Validate
    */
    if (this.PaymentModeDetailsAlerts.length > 0) {
      this.PaymentModeDetailsStepCtrl.setErrors({ required: true });
      return this.PaymentModeDetailsStepCtrl;
    } else {
      this.PaymentModeDetailsStepCtrl.reset();
      return this.PaymentModeDetailsStepCtrl;
    }
  }

  /**
    * Display Error message 
    */
  public PaymentModeDetailsValidationError() {
    if (this.PaymentModeDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.PaymentModeDetailsAlerts);
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

  // Select KYC Documents
  public SelectKycDoc(event, DocumentType: string) {
    let file = event.target.files[0]

    if (file) {
      this._dataService.UploadFile(this.UploadFileAPI, file).subscribe((res) => {
        if (res.Success) {
          if (DocumentType == 'UID') {
            this.LifeQNSForm.get('AadharDetails').patchValue({
              RFQId: this.LifeQNSForm.value.Id,
              DocumentType: "UID",
              DocumentTypeName: "Aadhar Card",
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.LifeQNSForm.value.Stage
            })
          }
          else if (DocumentType == 'PAN') {
            this.LifeQNSForm.get('PANDetails').patchValue({
              RFQId: this.LifeQNSForm.value.Id,
              DocumentType: "PAN",
              DocumentTypeName: "PAN Card",
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.LifeQNSForm.value.Stage
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

  // View KYC document
  public ViewDocument(StorageFilePath: string) {
    if (StorageFilePath) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + StorageFilePath)
    }
  }

  public AddNomeneeDetails(MemberIndex: number) {
    if (this.ProductCategoryNomineeDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryNomineeDetailsAlert);
      return;
    }

    let Nominee: LifeNomineeDetailsDto = new LifeNomineeDetailsDto()
    let NomineeDetailsFormArray = this.Members.controls[MemberIndex].get('NomineeDetails') as FormArray
    NomineeDetailsFormArray.push(this._initExistingPolicyDetailsForm(Nominee))
  }

  public AddFamilyDetails(MemberIndex: number) {
    if (this.ProductCategoryFamilyDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryFamilyDetailsAlert);
      return;
    }

    let FamilyDetails: LifeFamilyDetailsDto = new LifeFamilyDetailsDto()
    let FamilyDetailsFormArray = this.Members.controls[MemberIndex].get('FamilyDetails') as FormArray
    FamilyDetailsFormArray.push(this._initFamilyDetailsForm(FamilyDetails))
  }

  public RemoveNomeneeDetails(MemberIndex: number, nomineeIndex: number) {
    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          let NomineeDetailsFormArray = this.Members.controls[MemberIndex].get('NomineeDetails') as FormArray
          NomineeDetailsFormArray.removeAt(nomineeIndex)
        }
      });
  }

  public RemoveFamilyDetails(MemberIndex: number, nomineeIndex: number) {
    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          let FamilyDetailsFormArray = this.Members.controls[MemberIndex].get('FamilyDetails') as FormArray
          FamilyDetailsFormArray.removeAt(nomineeIndex)
        }
      })
  }

  public NomineeAge(nomineeDOB) {
    if (nomineeDOB) {
      let NomineeAge = moment.duration(moment().diff(nomineeDOB));
      return NomineeAge.years()
    } else {
      return 0;
    }
  }

  // PopUp to share policy details
  public openDiologShare() {

    if (this.QuotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAerts);
      return;
    }

    let selectedQuotation = this.QNselection.controls.find(quotation => quotation.get('Buy').value == true)
    if (selectedQuotation && selectedQuotation.value) {
      this._rfqServive.rfqShareDialog(selectedQuotation.value);
    } else {
      this._alertservice.raiseErrorAlert('Quotation not found.')
    }
  }
  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  // Init Form
  private _initForm(data: ILifeQNSelectionSPDto) {
    let fg = this.fb.group({
      Id: [0],
      PaymentMode: [''],
      PaymentAccountName: [''],
      Documents: this._buildDocumentsForm(data.Documents),
      AadharNo: [''],
      AadharDetails: this._initDocumentForm(data.AadharDetails),
      PANNo: [''],
      PANDetails: this._initDocumentForm(data.PANDetails),
      QNDocuments: this._buildQNDocuments(data.QNDocuments),
      Members: this._buildPolicyPersonForm(data.Members),

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
  private _buildQNDocuments(items: ILifeQNDocumentsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);

    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          // if (i.Buy == true) {
          formArray.push(this._initQNDocuments(i));
          // }
        });
      }
    }

    return formArray;
  }

  // Init Quotation Note Document Form
  private _initQNDocuments(item: ILifeQNDocumentsDto): FormGroup {
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
      if (!item) {
        item = new LifeQNDocumentsDto();
      }

      if (item) {
        dFQN.patchValue(item);
      }
    }
    return dFQN
  }

  // Documents FormArray
  private _buildDocumentsForm(items: ILifeDocumentsDto[] = []): FormArray {
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
  private _initDocumentForm(data: ILifeDocumentsDto): FormGroup {

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
      Relation: [''],
      Name: [''],
      HeightFeetInch: ['', [Validators.required]],
      HeightCM: ['', [Validators.required]],
      Weight: [0, [Validators.required]],
      Marital: [''],
      Occupation: [''],
      NomineeDetails: this._buildNomineeDetailsDetailsFormArray(item.NomineeDetails),
      PlaceOfBirth: [''],
      Email: [''],
      FatherName: [''],
      MotherName: [''],
      SpouseName: [''],
      Qualification: [''],
      EmployerName: [''],
      Designation: [''],
      OfficeAddress: [''],
      AnnualIncome: [0],
      Alcohol: [false],
      AlcoholDescription: [''],
      FamilyDetails: this._buildFamilyDetailsDetailsFormArray(item.FamilyDetails),
      IsLifeAssured: [],
      IsPolicyHolder: [],
      AnyPrevInsuranceCover: [false],
      AnyPrevInsuranceCoverDesc: [],
      AnyPreExistingMedicalIssue: [false],
      MedicalIssueDetails: [],
    })

    if (item) {
      pPF.patchValue(item);
    }
    // }
    return pPF;
  }


  // Build Nominee Details Formarray
  private _buildNomineeDetailsDetailsFormArray(items: ILifeNomineeDetailsDto[] = []): FormArray {
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

  // Init Nominee Details Formgroup
  private _initExistingPolicyDetailsForm(item: ILifeNomineeDetailsDto): FormGroup {

    let NomineeDetails = this.fb.group({
      Id: [0],
      RFQMemberId: [0],
      Name: [''],
      DOB: [''],
      Relation: [''],
      NomineePer: [0],
      AppointeeName: [''],
      AppointeeDOB: [''],
      AppointeeRelation: ['']
    })

    if (item) {
      NomineeDetails.patchValue(item)
    }

    return NomineeDetails
  }

  // Build Family Details Formarray
  private _buildFamilyDetailsDetailsFormArray(items: ILifeFamilyDetailsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initFamilyDetailsForm(i));
        });
      }
    }

    return formArray;
  }

  // Init Family Details group
  private _initFamilyDetailsForm(item: ILifeFamilyDetailsDto): FormGroup {

    let FamilyDetailsForm = this.fb.group({
      Id: [0],
      RFQMemberId: [0],
      Relation: [''],
      Age: [0],
      HealthStatus: [''],
      Height: [0],
      Weight: [0],
      SmokerTibco: [false],
      SmokerTibcoDescription: [''],
      Alive: [true],
      ExpireAge: [0],
      CauseOfDeath: ['']
    })

    if (item) {
      FamilyDetailsForm.patchValue(item)
    }
    return FamilyDetailsForm
  }


  private _OnformChange() {

    this.Members.controls.forEach((element, index) => {

      // element.get('Occupation').valueChanges.subscribe(val=>{
      //   if (val != 'Salaried' || val != 'Business Owner'){
      //     element.patchValue({
      //       Designation : null,
      //       OfficeAddress : null,
      //       EmployerName : null,

      //     })
      //   }
      // })

      element.get('Marital').valueChanges.subscribe(val => {
        if (val != 'Married') {
          element.patchValue({
            SpouseName: null,
          })
        }
      })

      element.get('AnyPrevInsuranceCover').valueChanges.subscribe(val => {
        element.patchValue({
          AnyPrevInsuranceCoverDesc: null,
        })
      })

      element.get('AnyPreExistingMedicalIssue').valueChanges.subscribe(val => {
        element.patchValue({
          MedicalIssueDetails: null,
        })
      })


    });


    this.LifeQNSForm.get('PaymentMode').valueChanges.subscribe(val => {
      if (val == 'Cheque') {
        let selectedQn = this.QNselection.value.find(qn => qn.Buy == true)
        if (selectedQn) {
          this.LifeQNSForm.get('PaymentAccountName').patchValue(selectedQn.InsuranceCompanyName)
        }
      } else {
        this.LifeQNSForm.get('PaymentAccountName').patchValue(null)
      }
    })

  }


  // RFQ Health Form All date Formate Change
  private _DateFormat() {

    this.Members.controls.forEach((m, index) => {

      let Nominee = m.get('NomineeDetails') as FormArray

      Nominee.controls.forEach((n, i) => {
        n.patchValue({
          DOB: this._datePipe.transform(n.get('DOB').value, 'yyyy-MM-dd'),
          AppointeeDOB: this._datePipe.transform(n.get('AppointeeDOB').value, 'yyyy-MM-dd')
        }, { emitEvent: false })
      })
    })
  }

  //#endregion private-methods

}
