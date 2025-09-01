import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert, IAdditionalFilterObject, IFilterRule } from '@models/common';
import { IMotorQNSelectionDTO, IQNDocumentsDto, IDocumentsDto, IKycDocumentsDTO, QNDocumentsDto, IVehicleDetail, DocumentsDto } from '@models/dtos/config/RFQMotor';
import { CategoryCodeEnum, HealthPolicyKYCDocumentType } from 'src/app/shared/enums';
import { MotorKYCDocumentsEnum, MotorPolicyTypeEnum, MotorSubCategoryCodeEnum } from 'src/app/shared/enums/rfq-motor';
import { environment } from 'src/environments/environment';
import { MatStepper } from '@angular/material/stepper';
import { RfqMotorService } from '../rfq-motor.service';
import { RfqService } from '../../rfq.service';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { RFQDocumentsDrpList } from '@config/rfq';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { IFleetDto } from '@models/dtos/transaction-master';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-motor-qn-selection-sp',
  templateUrl: './motor-qn-selection-sp.component.html',
  styleUrls: ['./motor-qn-selection-sp.component.scss'],
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
export class MotorQnSelectionSpComponent {

  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;
  @ViewChild('stepper') stepper: MatStepper;

  //Variables
  pagetitle: string; // Page main header title

  PANNumValidationReg: RegExp = ValidationRegex.PANNumValidationReg; // PAN number Validation regex
  UIDNumValidationReg: RegExp = ValidationRegex.UIDNumValidationReg; //Aadhar/UID number Validation regex

  //FormGroup 
  MQSForm !: FormGroup;
  DisplayForm: any;
  mode: string; // for identify of Raise page is create or edit or view
  isExpand: boolean = false;

  //ENUMs
  SubCategoryCodeEnum = MotorSubCategoryCodeEnum
  KYCDocumentTypeEnum = MotorKYCDocumentsEnum
  MotorPolicyTypeEnum = MotorPolicyTypeEnum

  //APIs
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API

  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message
  QuotationSelectionAerts: Alert[] = []; // Step Invalid field error message
  KYCDetailsAlerts: Alert[] = [];
  PaymentModeDetailsAlerts: Alert[] = [];
  DocumentAttachmentAlert: Alert[] = [];
  ProductCategoryDetailsAlert: Alert[] = [];


  ProductCategoryDetailsStepCtrl = new FormControl();
  QuotationSelectionStepctrl = new FormControl()
  KYCDetailsStepCtrl = new FormControl()
  PaymentModeDetailsStepCtrl = new FormControl()
  DocumentAttachmentStepCtrl = new FormControl()

  FleetCode$: Observable<IFleetDto[]>

  destroy$: Subject<any>;

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
    private _RfqMotorService: RfqMotorService,
    private _RfqService: RfqService,
    private cdr: ChangeDetectorRef,
    private _MasterListService: MasterListService,
    private _Location: Location,
  ) {
    this.destroy$ = new Subject();
  }

  // #endregion constructor

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
    this.MQSForm = this._initForm(this.DisplayForm);
    this._OnformChange()
  }

  ngAfterViewInit(): void {

    this.stepper.next();
    this.stepper.next();

    this.cdr.detectChanges();

  }

  //#endregion lifecyclehooks

  //#region Getters

  // Document Type List
  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Motor))
  }

  // QNSelection FormArray
  get QNselection() {
    return this.MQSForm.get('QNDocuments') as FormArray;
  }

  // KYCDocuments FormArray
  get Documents() {
    return this.MQSForm.get('Documents') as FormArray;
  }

  // Get Health Policy KYC Document Type From Config file
  public get HealthPolicyKYCDocumentTypeEnum() {
    return HealthPolicyKYCDocumentType
  }


  //EndRegion Getters

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public stepOneValidation() {

  }


  // Reject Button 
  public RejectButton() {
    if (this.MQSForm.get('SendBackRejectDesc').value == "" || this.MQSForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.MQSForm.value.Id;
          SendBackRejectObj.Stage = this.MQSForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.MQSForm.value.SendBackRejectDesc;

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

    if (this.MQSForm.get('SendBackRejectDesc').value == "" || this.MQSForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.MQSForm.value.Id;
          SendBackRejectObj.Stage = this.MQSForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.MQSForm.value.SendBackRejectDesc;

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

  public SubmitFormButton() {

    if (this.QuotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAerts);
      return;
    }

    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
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

    let SubmitFormValue = JSON.parse(JSON.stringify(this.MQSForm.value))
    // if pan not attach then Field value is set null
    if (!SubmitFormValue.PANDetails.StorageFilePath) {
      SubmitFormValue.PANDetails = null
    }
    // if Aadhar not attach then Field value is set null
    if (!SubmitFormValue.AadharDetails.StorageFilePath) {
      SubmitFormValue.AadharDetails = null
    }
    
    // if GST not attach then Field value is set null
    if (!SubmitFormValue.GSTDetails.StorageFilePath) {
      SubmitFormValue.GSTDetails = null
    }

    this._RfqMotorService.SubmitMotorQuotationSelection(SubmitFormValue).subscribe(res => {
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
        if (this.MQSForm.get('PaymentMode').value == 'Cheque') {
          this.MQSForm.get('PaymentAccountName').patchValue(qn.value.InsuranceCompanyName)
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
      this._RfqMotorService.DownloadQnDocument(SelectedQuotation.Id).subscribe(blob => {
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

  public SelectKycDoc(event, DocumentType: string) {
    let file = event.target.files[0]

    if (file) {
          this._dataService
            .UploadFile(this.UploadFileAPI, file)
            .subscribe((res) => {
              if (res.Success) {

                if (DocumentType == 'UID') {
                  this.MQSForm.get('AadharDetails').patchValue({
                    FileName: res.Data.FileName,
                    StorageFileName: res.Data.StorageFileName,
                    StorageFilePath: res.Data.StorageFilePath,
                    Stage: this.DisplayForm.Stage,
                    DocumentType: DocumentType,
                  })
                }
                else if (DocumentType == 'PAN') {
                  this.MQSForm.get('PANDetails').patchValue({
                    FileName: res.Data.FileName,
                    StorageFileName: res.Data.StorageFileName,
                    StorageFilePath: res.Data.StorageFilePath,
                    Stage: this.DisplayForm.Stage,
                    DocumentType: DocumentType,
                  })
                }
                
                else if (DocumentType == 'GST') {
                  this.MQSForm.get('GSTDetails').patchValue({
                    FileName: res.Data.FileName,
                    StorageFileName: res.Data.StorageFileName,
                    StorageFilePath: res.Data.StorageFilePath,
                    Stage: this.DisplayForm.Stage,
                    DocumentType: 'OtherGSTDocument', // DOc Type Given By Backend Team
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

  public removeKycDoc(DocumentType: string) {

    if (DocumentType == 'UID') {
      this.MQSForm.get('AadharDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
    }
    else if (DocumentType == 'PAN') {
      this.MQSForm.get('PANDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
    }
    else if (DocumentType == 'GST') {
      this.MQSForm.get('GSTDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
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

  public ProductCategoryDetailsValidations() {
    this.ProductCategoryDetailsAlert = []

    // if (!this.MQSForm.get('VehicleDetail.EngineNumber').value) {
    //   this.ProductCategoryDetailsAlert.push({
    //     Message: 'Engine Number is required',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   })
    // }

    // if (!this.MQSForm.get('VehicleDetail.ChasisNumber').value) {
    //   this.ProductCategoryDetailsAlert.push({
    //     Message: 'Chasis Number is required',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   })
    // }

    if (this.DisplayForm.SubCategoryCode == this.SubCategoryCodeEnum.PrivateCar) {
      if (!this.MQSForm.get('VehicleDetail.VehicleClass').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Vehicle Class is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    /**
     * Remove Field In Enhancement TI-594 
     */
    // if (this.DisplayForm.SubCategoryCode == this.SubCategoryCodeEnum.PCV) {

    //   if (!this.MQSForm.get('VehicleDetail.TaxiAgency').value) {
    //     this.ProductCategoryDetailsAlert.push({
    //       Message: 'Taxi Agency is required',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     })
    //   }

    //   if (!this.MQSForm.get('VehicleDetail.RegistrationType').value) {
    //     this.ProductCategoryDetailsAlert.push({
    //       Message: 'Registration Type - Bus is required',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     })
    //   }

    //   if (!this.MQSForm.get('VehicleDetail.ContractPeriod').value) {
    //     this.ProductCategoryDetailsAlert.push({
    //       Message: 'Contract Period(Year) - Bus( is required',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     })
    //   }

      
    // }
    if (this.DisplayForm.SubCategoryCode == this.SubCategoryCodeEnum.PCV || this.DisplayForm.SubCategoryCode == this.SubCategoryCodeEnum.MiscellaneousD) {
      if (!this.MQSForm.get('VehicleDetail.Usage').value) {
        this.ProductCategoryDetailsAlert.push({
          Message: 'Usage is required',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }


    // if (this.MQSForm.get('VehicleDetail.IsFleetBusiness').value &&
    //   (this.DisplayForm.SubCategoryCode == this.SubCategoryCodeEnum.PrivateCar ||
    //     this.DisplayForm.SubCategoryCode == this.SubCategoryCodeEnum.TwoWheeler)){

    //   if (this.MQSForm.get('VehicleDetail.FleetBusinessId').value == 0 || this.MQSForm.get('VehicleDetail.FleetBusinessId').value == null ) {
    //     this.ProductCategoryDetailsAlert.push({
    //       Message: 'Fleet Code is required',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     })
    //   }

    //     }






    if (this.ProductCategoryDetailsAlert.length > 0) {
      this.ProductCategoryDetailsStepCtrl.setErrors({ required: true });
      return this.ProductCategoryDetailsStepCtrl;
    }
    else {
      this.ProductCategoryDetailsStepCtrl.reset();
      return this.ProductCategoryDetailsStepCtrl;
    }

  }


  public ProductCategoryDetailsError() {
    if (this.ProductCategoryDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this.ProductCategoryDetailsAlert);
      return;
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

  /**
* Check step four Invalid Formfield
*/
  public KYCDetailsValidationControl() {
    this.KYCDetailsAlerts = [];

    if (this.mode != "view") {

      if (!this.MQSForm.get('PANNo').value) {
        // this.KYCDetailsAlerts.push({
        //   Message: 'Enter  PAN',
        //   CanDismiss: false,
        //   AutoClose: false,
        // });
      } else if (!this.PANNumValidationReg.test(this.MQSForm.get('PANNo').value)) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter valid PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (!this.MQSForm.get('PANDetails.FileName').value) {
        this.KYCDetailsAlerts.push({
          Message: 'PAN Card Attchment is required.',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (!this.MQSForm.get('AadharNo').value) {
        // this.KYCDetailsAlerts.push({
        //   Message: 'Enter  Aadhar',
        //   CanDismiss: false,
        //   AutoClose: false,
        // });
      } else if (!this.UIDNumValidationReg.test(this.MQSForm.get('AadharNo').value)) {
        this.KYCDetailsAlerts.push({
          Message: 'Enter valid Aadhar',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (!this.MQSForm.get('AadharDetails.FileName').value) {
        this.KYCDetailsAlerts.push({
          Message: 'Aadhar Card Attchment is required.',
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
      if (this.MQSForm.get("PaymentMode").hasError("required")) {
        this.PaymentModeDetailsAlerts.push({
          Message: "Select any one PaymentMode",
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.MQSForm.get("PaymentMode").value == 'Cheque') {
        if (!this.MQSForm.get("PaymentAccountName").value) {
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


  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }

  public clearFleetBusiness() {
    this.MQSForm.get('VehicleDetail').patchValue({
      FleetBusinessName: "",
      FleetBusinessId: null,
    })
  }

  public AutocompleteSelectedEvent(event: MatAutocompleteSelectedEvent, SelectedFor: string): void {
    switch (SelectedFor) {
      case "FleetBusiness":
        this.MQSForm.get('VehicleDetail').patchValue({
          FleetBusinessId: event.option.value.Id,
          FleetBusinessName: event.option.value.FleetNo,
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
  public openDiolog(type: string, title: string, openFor: string) {
    let Rule: IFilterRule[] = [];
    let AdditionalFilters: IAdditionalFilterObject[] = []

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
      filterData: Rule,
      addFilterData: AdditionalFilters
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        switch (openFor) {
          case "FleetBusiness":
            this.MQSForm.get('VehicleDetail').patchValue({
              FleetBusinessId: result.Id,
              FleetBusinessName: result.FleetNo,
            })
            break;

          default:
            break;
        }
      }

    })
  }

  // PopUp to share policy details
  public openDiologShare() {

    if (this.QuotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationSelectionAerts);
      return;
    }

    let selectedQuotation = this.QNselection.controls.find(quotation => quotation.get('Buy').value == true)
    if (selectedQuotation && selectedQuotation.value) {
      this._RfqService.rfqShareDialog(selectedQuotation.value);
    } else {
      this._alertservice.raiseErrorAlert('Quotation not found.')
    }
  }

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  private _initForm(data: IMotorQNSelectionDTO) {

    let fg = this.fb.group({
      Id: [0],
      PaymentMode: ['', [Validators.required]],
      PaymentAccountName: [],
      Documents: this._buildDocumentsForm(data.Documents),
      QNDocuments: this._buildQNDocuments(data.QNDocuments),
      VehicleDetail: this._initVehicleDetails(data.VehicleDetail),
      PANNo: [],
      AadharNo: [],
      AadharDetails: this._initKYCDocuments(data.AadharDetails),
      PANDetails: this._initKYCDocuments(data.PANDetails),
      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
      BranchId: [null],
      GSTNo: [''],
      GSTDetails: this._initKYCDocuments(data.GSTDetails),
    })

    if (data != null) {
      fg.patchValue(data);
    }

    return fg;

  }

  //KYC Documents Form Group 
  private _initKYCDocuments(data: IKycDocumentsDTO) {

    let formGroup = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      DocumentNo: [''],
      Stage: [''],
      Description: [''],
      FileName: [''],
      StorageFileName: [''],
      StorageFilePath: [''],
      DocumentTypeName: [''],
      ImageUploadName: [''],
      ImageUploadPath: [''],
    })

    if (data != null) {
      formGroup.patchValue(data);
    }

    return formGroup;
  }

  // Build Quotation Note Document Formarray
  private _buildQNDocuments(items: IQNDocumentsDto[] = []): FormArray {
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
  private _initQNDocuments(item: IQNDocumentsDto): FormGroup {
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
        item = new QNDocumentsDto();
      }

      if (item) {
        dFQN.patchValue(item);
      }
    }
    return dFQN
  }

  // Init Vechicle Details Form
  private _initVehicleDetails(data: IVehicleDetail) {

    let VehicleDetails = this.fb.group({
      Id: [0],
      RFQId: [0],
      EngineNumber: [""],
      ChasisNumber: [""],
      FleetBusinessId: [],
      FleetBusinessName: [""],
      IsFleetBusiness : [false],
      VehicleClass: [""],
      TaxiAgency: [""],
      Usage: [""],
      RegistrationType: [""],
      ContractPeriod: [""],
      VehicleType: [""],
    });

    if (data) {
      VehicleDetails.patchValue(data)
    }

    return VehicleDetails;
  }


  // Documents FormArray
  private _buildDocumentsForm(items: IDocumentsDto[] = []): FormArray {
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
  private _initDocumentForm(data: IDocumentsDto): FormGroup {

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


  private _OnformChange() {
    this.MQSForm.get('PaymentMode').valueChanges.subscribe(val => {
      if (val == 'Cheque') {
        let selectedQn = this.QNselection.value.find(qn => qn.Buy == true)
        if (selectedQn) {
          this.MQSForm.get('PaymentAccountName').patchValue(selectedQn.InsuranceCompanyName)
        }
      } else {
        this.MQSForm.get('PaymentAccountName').patchValue(null)
      }
    })

    this.MQSForm.get('VehicleDetail.FleetBusinessName').valueChanges.subscribe((val) => {
      this.FleetCode$ = this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Fleet.List, 'FleetNo', val).pipe(
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

    this.MQSForm.get('VehicleDetail.IsFleetBusiness').valueChanges.subscribe(res=>{
      this.MQSForm.get('VehicleDetail').patchValue({
        FleetBusinessName: "",
        FleetBusinessId: null,
      },{emitEvent:false})
    })

  }
  //#endregion private-methods

}
