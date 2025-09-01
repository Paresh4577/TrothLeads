import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { Alert, IFilterRule } from '@models/common';
import { DatePipe, Location } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { IPackagePrePolicyDTO, IPackageQNSelectionSPDto, IPackageSuminnsuredQuestionDTO, IRFQPackageDocumentsDto, IRFQPackageNomineeDetailDto, IRFQPackageQNDocumentsDto, PackagePrePolicyDTO, RFQPackageDocumentsDto, RFQPackageNomineeDetailDto } from '@models/dtos';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MatStepper } from '@angular/material/stepper';
import { ValidationRegex } from '@config/validationRegex.config';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '@lib/services/http/http.service';
import { DialogService } from '@lib/services/dialog.service';
import { RfqPackageService } from '../rfq-package.service';
import { RfqService } from '../../rfq.service';
import { RFQDocumentsDrpList } from '@config/rfq';
import { CategoryCodeEnum, SubCategoryCodeEnum } from 'src/app/shared/enums';
import { IRfqDoclistDTO, IRfqStaticDataListDTO, ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';
import { ROUTING_PATH } from '@config/routingPath.config';
import { DisplayedPackageMoninneRelation } from '@config/rfq';


@Component({
  selector: 'gnx-package-qn-selection-sp',
  templateUrl: './package-qn-selection-sp.component.html',
  styleUrls: ['./package-qn-selection-sp.component.scss'],
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
export class PackageQnSelectionSpComponent {


  //#region public properties

  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;

  // Variables
  public pagetitle: string = '';
  public mode: string = '';
  public isExpand: boolean = false;
  public maxBirthDate: Date; // Max birthdate validation
  public CurrentDate: Date; // Current Date
  public displayForm: any;
  public jewellersBlockPoliciesSumInsuredDetails: any;
  // FormGroup 
  qnSelectionForm: FormGroup;
//#endregion

 

//#region private properties
 
  // Alert Array List
 private _quotationSelectionAerts: Alert[] = []; // Step Invalid field error message
 private _productCategoryDetailsAlerts: Alert[] = [];
 private _nominneDetailsAlerts: Alert[] = [];
 private _kycDetailsAlerts: Alert[] = [];
 private _paymentModeDetailsAlerts: Alert[] = [];
 private _documentAttachmentAlert: Alert[] = [];

private _quotationSelectionStepctrl = new FormControl()
private _productCategoryDetailsStepCtrl = new FormControl();
private _kycDetailsStepCtrl = new FormControl()
private _paymentModeDetailsStepCtrl = new FormControl()
private _documentAttachmentStepCtrl = new FormControl()

 private _uploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API
 private _panNumValidationReg: RegExp = ValidationRegex.PANNumValidationReg; // PAN number Validation regex
 private _uidNumValidationReg: RegExp = ValidationRegex.UIDNumValidationReg; //Aadhar/UID number Validation regex

//#endregion

  //#region Constructor

  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    private _dialog: MatDialog,
    private _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _dialogService: DialogService,
    private _rfqPackageService: RfqPackageService,
    private _rfqService: RfqService,
    private _cdr: ChangeDetectorRef,
    private _location: Location,
    private _datePipe: DatePipe,
  ) {

    this.CurrentDate = new Date()
    this.maxBirthDate = new Date(this.CurrentDate.setFullYear(this.CurrentDate.getFullYear() - 18));
    this.jewellersBlockPoliciesSumInsuredDetails = this._rfqPackageService.DisplaySumInsuredDetailsJewellersBlockPolicies()
  }
  //#endregion constructor

  // #region Getters


  // QNDocuments Form array
  public get qnSelection():FormArray {
    return this.qnSelectionForm.get('QNDocuments') as FormArray;
  }

  // Documents Form array
  public get documents(): FormArray {
    return this.qnSelectionForm.get('Documents') as FormArray;
  }

  // Documents Form array
  public get nomineeDetails(): FormArray {
    return this.qnSelectionForm.get('NomineeDetails') as FormArray;
  }

  public get policyDocumentList(): IRfqDoclistDTO[] {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Package))
  }
  
  public get displayedPackageMoninneRelation(): IRfqStaticDataListDTO[] {
    return DisplayedPackageMoninneRelation
  }

  public get subCategoryCodeEnum():any {
    return SubCategoryCodeEnum
  }

  public get canDisplayContentDetail(): boolean {

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
      let row: IPackagePrePolicyDTO = new PackagePrePolicyDTO()
      row.RFQId = this.displayForm.Id
      this.displayForm.PrevPolicyDetail.push(row)
    }

    // build travel form
    this.qnSelectionForm = this._buildForm(this.displayForm);

    if (this.nomineeDetails.controls?.length == 0) {
      this.addNomeneeDetails()
    }

    this._onFormChange()
  }

  // After View Init
  ngAfterViewInit(): void {
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
  public backButton(): void {
    this._location.back();
  }


  // Reject Button
  public rejectButton(): void{
    if (this.qnSelectionForm.get('SendBackRejectDesc').value == "" || this.qnSelectionForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.qnSelectionForm.value.Id;
          SendBackRejectObj.Stage = this.qnSelectionForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.qnSelectionForm.value.SendBackRejectDesc;
          this._rfqService.Reject(SendBackRejectObj).subscribe((res) => {
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
    if (this.qnSelectionForm.get('SendBackRejectDesc').value == "" || this.qnSelectionForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.qnSelectionForm.value.Id;
          SendBackRejectObj.Stage = this.qnSelectionForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.qnSelectionForm.value.SendBackRejectDesc;

          this._rfqService.SendBack(SendBackRejectObj).subscribe((res) => {
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


    if (this._nominneDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this._nominneDetailsAlerts);
      return;
    }
    
    if (this._productCategoryDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this._productCategoryDetailsAlerts);
      return;
    }


    if (this._kycDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this._kycDetailsAlerts);
      return;
    }

    if (this._paymentModeDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this._paymentModeDetailsAlerts);
      return;
    }

    if (this._documentAttachmentAlert.length > 0) {
      this._alertservice.raiseErrors(this._documentAttachmentAlert);
      return;
    }

    this._dateFormat()

    let SubmitFormValue = JSON.parse(JSON.stringify(this.qnSelectionForm.value))

    // if pan not attach then Field value is set null
    if (!SubmitFormValue.PANDetails?.StorageFilePath) {
      SubmitFormValue.PANDetails = null
    }
    // if Aadhar not attach then Field value is set null
    if (!SubmitFormValue.AadharDetails?.StorageFilePath) {
      SubmitFormValue.AadharDetails = null
    }

    if (!SubmitFormValue.GSTDetails?.StorageFilePath) {
      SubmitFormValue.GSTDetails = null
    }

    this._rfqPackageService.submitQNSelectionSP(SubmitFormValue).subscribe((res) => {
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

  public expandCollaps(): void{
    this.isExpand = !this.isExpand;
  }

  /**
 * Set true Selected quotation
 * @param index "Selected Quotation index"
 */
  public selectBuy(index: number): void {

    if (this.qnSelection.controls[index].get('Buy').value) {
      this._alertservice.raiseErrorAlert('Quotation is already Selected.');
      return;
    }

    this.qnSelection.controls.forEach((qn, i) => {
      if (i == index) {
        qn.get('Buy').setValue(true)
        if (this.qnSelectionForm.get('PaymentMode').value == 'Cheque') {
          this.qnSelectionForm.get('PaymentAccountName').patchValue(qn.value.InsuranceCompanyName)
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
  public donloadQNdocument(): void {
    if (this._quotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this._quotationSelectionAerts);
      return;
    }

    //Find Selected QN Doc
    let SelectedQuotation = this.qnSelection.value.find(qn => qn.Buy == true)

    if (SelectedQuotation) {
      this._rfqPackageService.downloadQnDocument(SelectedQuotation.Id).subscribe(blob => {
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
* Check step two Invalid Formfield
*/
  public quotationSelectionValidationControl(): FormControl {
    this._quotationSelectionAerts = [];

    if (this.mode != "view") {
      if (!this.qnSelection.value.some(ele => ele.Buy == true)) {
        this._quotationSelectionAerts.push({
          Message: `Quotation Selection is Required`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    /**
    *  Step control Validate
    */
    if (this._quotationSelectionAerts.length > 0) {
      this._quotationSelectionStepctrl.setErrors({ required: true });
      return this._quotationSelectionStepctrl;
    } else {
      this._quotationSelectionStepctrl.reset();
      return this._quotationSelectionStepctrl;
    }
  }

  /**
    * Display Error message 
    */
  public quotationSelectionValidationError(): void {
    if (this._quotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this._quotationSelectionAerts);
    }
  }


  /**
* Check step four Invalid Formfield
*/
  public productCategoryValidationControl(): FormControl {
    this._productCategoryDetailsAlerts = [];
    this._nominneDetailsAlerts = [];

    if (this.mode != "view") {

      this.nomineeDetails.controls.forEach((nominee,n) => {

        

        // if (!nominee.get('Name').value) {
        //   this._nominneDetailsAlerts.push({
        //     Message: `${n + 1} - Nominee Name is required.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        if (!nominee.get('DOB').value) {
          // this._nominneDetailsAlerts.push({
          //   Message: `${n + 1} - Nominee Date of birth is required.`,
          //   CanDismiss: false,
          //   AutoClose: false,
          // })
        } else {
          /**
         * Nominne Age not Allow under 18 year 
         */
          if (nominee.get('DOB').value) {
            if (this._datePipe.transform(this.maxBirthDate, 'yyyy-MM-dd') < this._datePipe.transform(nominee.get('DOB').value, 'yyyy-MM-dd')) {
              this._nominneDetailsAlerts.push({
                Message: `${n + 1} - Nominees under 18 years of age are not allowed.`,
                CanDismiss: false,
                AutoClose: false,
              });
            }
          }

        }

        // if (!nominee.get('Relation').value) {
        //   this._nominneDetailsAlerts.push({
        //     Message: `${n + 1} - Nominee Relation with Proposer is required.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (!nominee.get('NomineePer').value) {
        //   this._nominneDetailsAlerts.push({
        //     Message: `${n + 1} - Nominee % is required.`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

      })


      let nomineePerSum:number;

      if (this.nomineeDetails.controls.length > 0) {
        this.nomineeDetails.controls.forEach(n => {
          if (n.get("NomineePer")?.value != null || n.get("NomineePer")?.toString() == "" ) {

            if(!nomineePerSum){
              nomineePerSum = 0;
            }

            nomineePerSum += parseFloat(n.get("NomineePer")?.value)
          }
        })
      }

      if (nomineePerSum == 0  || (nomineePerSum && nomineePerSum != 100)) {
        this._productCategoryDetailsAlerts.push({
          Message: "Sum of Nominee % Should be 100.",
          CanDismiss: false,
          AutoClose: false,
        })
      }


    }

    /**
    * Step control Validate
    */
    if (this._productCategoryDetailsAlerts.length > 0 || this._nominneDetailsAlerts.length > 0) {
      this._productCategoryDetailsStepCtrl.setErrors({ required: true });
      return this._productCategoryDetailsStepCtrl;
    } else {
      this._productCategoryDetailsStepCtrl.reset();
      return this._productCategoryDetailsStepCtrl;
    }
  }

  /**
   * Display Error message 
   */
  public productCategoryDetailsError(): void {
    if (this._nominneDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this._nominneDetailsAlerts);
      return;
    }

    if (this._productCategoryDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this._productCategoryDetailsAlerts);
    }
  }

  /**
* Check step four Invalid Formfield
*/
  public kycDetailsValidationControl(): FormControl{
    this._kycDetailsAlerts = [];

    if (this.mode != "view") {

      if (!this.qnSelectionForm.get('AadharNo').value) {
        // this._kycDetailsAlerts.push({
        //   Message: 'Enter  Aadhar',
        //   CanDismiss: false,
        //   AutoClose: false,
        // });
      } else if (!this._uidNumValidationReg.test(this.qnSelectionForm.get('AadharNo').value)) {
        this._kycDetailsAlerts.push({
          Message: 'Enter valid Aadhar',
          CanDismiss: false,
          AutoClose: false,
        });
      }


      if (!this.qnSelectionForm.get('PANNo').value) {
        // this._kycDetailsAlerts.push({
        //   Message: 'Enter  PAN',
        //   CanDismiss: false,
        //   AutoClose: false,
        // });
      } else if (!this._panNumValidationReg.test(this.qnSelectionForm.get('PANNo').value)) {
        this._kycDetailsAlerts.push({
          Message: 'Enter valid PAN',
          CanDismiss: false,
          AutoClose: false,
        });
      }

    }

    /**
    * Step control Validate
    */
    if (this._kycDetailsAlerts.length > 0) {
      this._kycDetailsStepCtrl.setErrors({ required: true });
      return this._kycDetailsStepCtrl;
    } else {
      this._kycDetailsStepCtrl.reset();
      return this._kycDetailsStepCtrl;
    }
  }

  /**
   * Display Error message 
   */
  public kycDetailsValidationError(): void {
    if (this._kycDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this._kycDetailsAlerts);
    }
  }

  public paymentModeDetailValidationControl(): FormControl {
    this._paymentModeDetailsAlerts = [];

    if (this.mode != "view") {
      if (!this.qnSelectionForm.get("PaymentMode").value) {
        this._paymentModeDetailsAlerts.push({
          Message: "Select any one PaymentMode",
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.qnSelectionForm.get("PaymentMode").value == 'Cheque') {
        if (!this.qnSelectionForm.get("PaymentAccountName").value) {
          this._paymentModeDetailsAlerts.push({
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
    if (this._paymentModeDetailsAlerts.length > 0) {
      this._paymentModeDetailsStepCtrl.setErrors({ required: true });
      return this._paymentModeDetailsStepCtrl;
    } else {
      this._paymentModeDetailsStepCtrl.reset();
      return this._paymentModeDetailsStepCtrl;
    }
  }

  /**
    * Display Error message 
    */
  public paymentModeDetailsValidationError(): void {
    if (this._paymentModeDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this._paymentModeDetailsAlerts);
    }
  }

  // Select KYC Documents
  public selectKycDoc(event, DocumentType: string): void{
    let file = event.target.files[0]

    if (file) {
      this._dataService.UploadFile(this._uploadFileAPI, file).subscribe((res) => {
        if (res.Success) {
          if (DocumentType == 'UID') {
            this.qnSelectionForm.get('AadharDetails').patchValue({
              RFQId: this.qnSelectionForm.value.Id,
              DocumentType: "UID",
              DocumentTypeName: "Aadhar Card",
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.qnSelectionForm.value.Stage
            })
          }
          else if (DocumentType == 'PAN') {
            this.qnSelectionForm.get('PANDetails').patchValue({
              RFQId: this.qnSelectionForm.value.Id,
              DocumentType: "PAN",
              DocumentTypeName: "PAN Card",
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.qnSelectionForm.value.Stage
            })
          } else if (DocumentType == 'GST') {
            this.qnSelectionForm.get('GSTDetails').patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.displayForm.Stage,
              DocumentType: 'OtherGSTDocument', // DOc Type Given By Backend Team
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

  // Remove KYC Documents
  public removeKycDoc(DocumentType: string): void {
    if (DocumentType == 'UID') {
      this.qnSelectionForm.get('AadharDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
    }
    else if (DocumentType == 'PAN') {
      this.qnSelectionForm.get('PANDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
    } else if (DocumentType == 'GST') {
      this.qnSelectionForm.get('GSTDetails').patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      })
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
  * Add new row in Document array
 */
  public addDocuments(selectedDocument?: string): void{
    const row: IRFQPackageDocumentsDto = new RFQPackageDocumentsDto();
    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.policyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.policyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.policyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = this.displayForm.Stage;
        this.documents.push(this._initDocumentForm(row));
      }
    }
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



  public addNomeneeDetails(): void {
    if (this._nominneDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this._nominneDetailsAlerts);
      return;
    }

    let Nominee: IRFQPackageNomineeDetailDto = new RFQPackageNomineeDetailDto()
    Nominee.RFQId = this.displayForm.Id
    this.nomineeDetails.push(this._initNomineeDetailsDetailsForm(Nominee))
  }


  /**
* Delete document With User Confirmation
*/
  public removeNomeneeDetails(index: number): void {
    this._dialogService.confirmDialog({
      title: 'Are You Sure?',
      message: "You won't be able to revert this",
      confirmText: 'Yes, Delete!',
      cancelText: 'No',
    })
      .subscribe((res) => {
        if (res) {
          this.nomineeDetails.removeAt(index)
        }
      });
  }


  public filterDisplaySumInsuredDetails(): IPackageSuminnsuredQuestionDTO[] {
    let SubCategoryWiseDisplaySumInsuredDetails = this._rfqPackageService.DisplaySumInsuredDetailsForSingleColumn(this.displayForm.SubCategoryCode)
    return SubCategoryWiseDisplaySumInsuredDetails
  }


  // PopUp to share policy details
  public openDiologShare() {

    if (this._quotationSelectionAerts.length > 0) {
      this._alertservice.raiseErrors(this._quotationSelectionAerts);
      return;
    }

    let selectedQuotation = this.qnSelection.controls.find(quotation => quotation.get('Buy').value == true)
    if (selectedQuotation && selectedQuotation.value) {
      this._rfqService.rfqShareDialog(selectedQuotation.value);
    } else {
      this._alertservice.raiseErrorAlert('Quotation not found.')
    }
  }
  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Build Main Form
  private _buildForm(data: any):FormGroup {

    let fg = this.fb.group({
      Id: [0],
      PaymentMode: [''],
      PaymentAccountName: [''],
      Documents: this._buildDocumentsForm(data.Documents),
      AadharNo: [''],
      AadharDetails: this._initDocumentForm(data.AadharDetails),
      PANNo: [''],
      PANDetails: this._initDocumentForm(data.PANDetails),
      GSTNo: [''],
      GSTDetails: this._initDocumentForm(data.GSTDetails),
      QNDocuments: this._buildQNDocuments(data.QNDocuments),
      AnySurgeryTaken: [false],
      SurgeryDesc: [''],
      NomineeDetails: this._buildNomineeDetailsDetailsFormArray(data.NomineeDetails),

      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
    })

    if (data != null) {
      fg.patchValue(data);
    }

    return fg;
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

  // Build Quotation Note Document Formarray
  private _buildQNDocuments(items: IRFQPackageQNDocumentsDto[] = []): FormArray {
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
  private _initQNDocuments(item: IRFQPackageQNDocumentsDto): FormGroup {
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
    }
    return dFQN
  }



  // Build Nominee Details Formarray
  private _buildNomineeDetailsDetailsFormArray(items: IRFQPackageNomineeDetailDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initNomineeDetailsDetailsForm(i));
        });
      }
    }

    return formArray;
  }

  // Init Nominee Details Formgroup
  private _initNomineeDetailsDetailsForm(item: IRFQPackageNomineeDetailDto): FormGroup {

    let NomineeDetails = this.fb.group({
      Id: [0],
      RFQId: [0],
      RFQMemberId: [],
      Name: [''],
      DOB: [''],
      Relation: [''],
      NomineePer: []
    })

    if (item) {
      NomineeDetails.patchValue(item)
    }

    return NomineeDetails
  }




  private _onFormChange():void {

    this.qnSelectionForm.get('PaymentMode').valueChanges.subscribe(val => {
      if (val == 'Cheque') {
        let selectedQn = this.qnSelection.value.find(qn => qn.Buy == true)
        if (selectedQn) {
          this.qnSelectionForm.get('PaymentAccountName').patchValue(selectedQn.InsuranceCompanyName)
        }
      } else {
        this.qnSelectionForm.get('PaymentAccountName').patchValue(null)
      }
    })

  }


  private _dateFormat(): void {

    this.nomineeDetails.controls.forEach(ele => {
      if (ele.get('DOB').value) {
        ele.patchValue({
          DOB: this._datePipe.transform(ele.get('DOB').value, 'yyyy-MM-dd')
        })
      }
    })

  }

  //#endregion private-methods

}