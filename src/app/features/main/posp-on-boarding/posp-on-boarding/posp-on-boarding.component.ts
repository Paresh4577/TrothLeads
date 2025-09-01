import { DatePipe, Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { DisplayedQualifications } from '@config/posp-on-boarding';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert } from '@models/common';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { ICityPincodeDto } from '@models/dtos/core';
import { IBankDto } from '@models/dtos/core/BankDto';
import { IDocumentAttachmentsDto, IPOSPOnBoardingDto } from '@models/dtos/posp-on-boarding';
import { AuthService } from '@services/auth/auth.service';
import { Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { ApplicationTypeEnum } from 'src/app/shared/enums';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'gnx-posp-on-boarding',
  templateUrl: './posp-on-boarding.component.html',
  styleUrls: ['./posp-on-boarding.component.scss'],
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
export class PospOnBoardingComponent {
  //#region decorator
  @ViewChild('tabGroup') tabGroup: MatTabGroup;
  //#endregion decorator

  // #region public variables
  public title: string = 'Create POSP OnBoarding';
  public pospOnBoardingForm: FormGroup;
  public pospOnBoardingDto: IPOSPOnBoardingDto;
  public isBankDetailsShow: boolean = false;
  public genderList: any[]; // to store Gender Dropdown list
  public pincodes$: Observable<ICityPincodeDto[]>; // observable of pincode list
  public Banks$: Observable<IBankDto[]>;
  public maxBirthDate: Date;
  // #endregion public-variables

  //#region private properties
  private _emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  private _phoneNum: RegExp = ValidationRegex.phoneNumReg;
  private _panNum: RegExp = ValidationRegex.PANNumValidationReg;
  private _aadharNum: RegExp = ValidationRegex.UIDNumValidationReg;
  private _destroy$: Subject<any>;
  private _basicInformationAlert: Alert[] = []; // Basic Information
  private _bankDetailsAlert: Alert[] = []; // Bank Details
  private _uploadDocumentDetails: Alert[] = []; // Upload Document Details
  private _loginForm: FormGroup;
  LoginUser: IMyProfile;

  //APIs
  private _uploadFileAPI = API_ENDPOINTS.Attachment.Upload;  // upload document API
  //#endregion private-properties

  //#region constructor
  // -----------------------------------------------------------------------------------------------------
  // @ Constructor
  // -----------------------------------------------------------------------------------------------------
  constructor(private _router: Router,
    private _fb: FormBuilder,
    private _dataService: HttpService,
    private _alertservice: AlertsService,
    private _masterListService: MasterListService,
    public _dialog: MatDialog,
    public _dialogService: DialogService,
    private _Location: Location,
    private _datePipe: DatePipe,
    private _authService: AuthService,
  ) {
    this._destroy$ = new Subject();
    this.maxBirthDate = new Date(Date.now());
    this.maxBirthDate.setFullYear(this.maxBirthDate.getFullYear() - 18);
    this._initLoginForm();
    this.staticLogin();
  }
  //#endregion constructor

  //#region public-getters
  // -----------------------------------------------------------------------------------------------------
  // @ Pubic Getters
  // -----------------------------------------------------------------------------------------------------

  get qualifications() {
    return DisplayedQualifications;
  }

  // routing
  public get Routing() {
    return ROUTING_PATH
  }

  public get ApplicationType() {
    return ApplicationTypeEnum
  }

  // getter method For Set Application logo as per Application
  get LogoURL() {
    let URL = 'assets/images/logos/Troth.png'
    if (this.LoginUser?.CompanyShortName == ApplicationTypeEnum.Troth) {
      URL = 'assets/images/logos/Troth.png'
    }
    else if (this.LoginUser?.CompanyShortName == ApplicationTypeEnum.Growmore) {
      URL = 'assets/images/logos/GROWMORE.png'
    }
    return URL;
  }

  //#endregion public-getters

  //#region life cycle hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init
  ngOnInit(): void {
    this.pospOnBoardingForm = this._initMainForm(this.pospOnBoardingDto);
    this._fillMasterList();
    this._onFormChange();
  }

  ngOnDestroy(): void {
    this._destroy$.next(null);
    this._destroy$.complete();
    localStorage.clear();
  }
  //#endregion life-cycle-hooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // validate basic information details
  public validateBasicInformation(): void {
    this._basicInformationAlert = [];

    if (this.pospOnBoardingForm.get("FirstName").value == "" || this.pospOnBoardingForm.get("FirstName").value == undefined || this.pospOnBoardingForm.get("FirstName").value == null) {
      this._basicInformationAlert.push({
        Message: 'Enter First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("LastName").value == "" || this.pospOnBoardingForm.get("LastName").value == undefined || this.pospOnBoardingForm.get("LastName").value == null) {
      this._basicInformationAlert.push({
        Message: 'Enter Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("EmailId").value == "" || this.pospOnBoardingForm.get("EmailId").value == undefined || this.pospOnBoardingForm.get("EmailId").value == null) {
      this._basicInformationAlert.push({
        Message: 'Enter Email ID',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    else {
      if (!this._emailValidationReg.test(this.pospOnBoardingForm.get("EmailId").value)) {
        this._basicInformationAlert.push({
          Message: 'Enter Valid Email ID',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.pospOnBoardingForm.get("MobileNo").value == "" || this.pospOnBoardingForm.get("MobileNo").value == undefined || this.pospOnBoardingForm.get("MobileNo").value == null) {
      this._basicInformationAlert.push({
        Message: 'Enter Mobile No',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    else {
      if (!this._phoneNum.test(this.pospOnBoardingForm.get("MobileNo").value)) {
        this._basicInformationAlert.push({
          Message: 'Mobile No must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.pospOnBoardingForm.get("DateOfBirth").value == "" || this.pospOnBoardingForm.get("DateOfBirth").value == undefined || this.pospOnBoardingForm.get("DateOfBirth").value == null) {
      this._basicInformationAlert.push({
        Message: 'Select Date Of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    else {
      let tempMaxBirthDate = moment(this._datePipe.transform(this.maxBirthDate, "yyyy-MM-dd"))
      let DateOfBirth = moment(this._datePipe.transform(this.pospOnBoardingForm.get("DateOfBirth").value, "yyyy-MM-dd"))
      if (tempMaxBirthDate < DateOfBirth) {
        this._basicInformationAlert.push({
          Message: 'User must be at least 18 years old to become a POSP.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.pospOnBoardingForm.get("Gender").value == "" || this.pospOnBoardingForm.get("Gender").value == undefined || this.pospOnBoardingForm.get("Gender").value == null) {
      this._basicInformationAlert.push({
        Message: 'Select Gender',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("PinCodeId").value == "0" || this.pospOnBoardingForm.get("PinCodeId").value == "" || this.pospOnBoardingForm.get("PinCodeId").value == undefined || this.pospOnBoardingForm.get("PinCodeId").value == null) {
      this._basicInformationAlert.push({
        Message: 'Select Pincode',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("Address").value == "" || this.pospOnBoardingForm.get("Address").value == undefined || this.pospOnBoardingForm.get("Address").value == null) {
      this._basicInformationAlert.push({
        Message: 'Enter Communication Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("AadharNumber").value == "" || this.pospOnBoardingForm.get("AadharNumber").value == undefined || this.pospOnBoardingForm.get("AadharNumber").value == null) {
      this._basicInformationAlert.push({
        Message: 'Enter Aadhar Card Number',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    else {
      if (!this._aadharNum.test(this.pospOnBoardingForm.get("AadharNumber").value)) {
        this._basicInformationAlert.push({
          Message: 'Enter Valid Aadhar Card Number',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.pospOnBoardingForm.get("PANNumber").value == "" || this.pospOnBoardingForm.get("PANNumber").value == undefined || this.pospOnBoardingForm.get("PANNumber").value == null) {
      this._basicInformationAlert.push({
        Message: 'Enter PAN Card Number',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    else {
      if (!this._panNum.test(this.pospOnBoardingForm.get("PANNumber").value)) {
        this._basicInformationAlert.push({
          Message: 'Enter Valid PAN Card Number',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.pospOnBoardingForm.get("Qualification").value == "" || this.pospOnBoardingForm.get("Qualification").value == undefined || this.pospOnBoardingForm.get("Qualification").value == null) {
      this._basicInformationAlert.push({
        Message: 'Select Latest Qualification',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("Qualification").value == "Other") {
      if (this.pospOnBoardingForm.get("SpecificEducation").value == "" || this.pospOnBoardingForm.get("SpecificEducation").value == undefined || this.pospOnBoardingForm.get("SpecificEducation").value == null) {
        this._basicInformationAlert.push({
          Message: 'Enter Specify Education',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this._basicInformationAlert.length > 0) {
      this._alertservice.raiseErrors(this._basicInformationAlert);
      return;
    }
    else {

      // open next mat tab
      this.nextTab();
    }
  }

  // validate Bank Details
  public validateBankDetails(): void {
    this._bankDetailsAlert = [];

    if (this.pospOnBoardingForm.get("NameAsPerBank").value == "" || this.pospOnBoardingForm.get("NameAsPerBank").value == undefined || this.pospOnBoardingForm.get("NameAsPerBank").value == null) {
      this._bankDetailsAlert.push({
        Message: 'Enter Account Holder Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("BankName").value == "" || this.pospOnBoardingForm.get("BankName").value == undefined || this.pospOnBoardingForm.get("BankName").value == null) {
      this._bankDetailsAlert.push({
        Message: 'Enter Bank Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("AccountNumber").value == "" || this.pospOnBoardingForm.get("AccountNumber").value == undefined || this.pospOnBoardingForm.get("AccountNumber").value == null) {
      this._bankDetailsAlert.push({
        Message: 'Enter Account Number',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("IFSCCode").value == "" || this.pospOnBoardingForm.get("IFSCCode").value == undefined || this.pospOnBoardingForm.get("IFSCCode").value == null) {
      this._bankDetailsAlert.push({
        Message: 'Enter IFSC',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this._bankDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this._bankDetailsAlert);
      return;
    }
    else {
      // open next mat tab
      this.nextTab();
    }
  }

  // validate Upload Document Details
  public validateUploadDocumentDetails(): void {
    this._uploadDocumentDetails = [];

    if (this.pospOnBoardingForm.get("EducationCertificateDocument.FileName").value == "" || this.pospOnBoardingForm.get("EducationCertificateDocument.FileName").value == undefined || this.pospOnBoardingForm.get("EducationCertificateDocument.FileName").value == null) {
      this._uploadDocumentDetails.push({
        Message: 'Attach Qualification Document',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("AadharCardFrontDocument.FileName").value == "" || this.pospOnBoardingForm.get("AadharCardFrontDocument.FileName").value == undefined || this.pospOnBoardingForm.get("AadharCardFrontDocument.FileName").value == null) {
      this._uploadDocumentDetails.push({
        Message: 'Attach Aadhaar Card Front Side',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("AadharCardBackDocument.FileName").value == "" || this.pospOnBoardingForm.get("AadharCardBackDocument.FileName").value == undefined || this.pospOnBoardingForm.get("AadharCardBackDocument.FileName").value == null) {
      this._uploadDocumentDetails.push({
        Message: 'Attach Aadhaar Card Back Side',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("PANDocument.FileName").value == "" || this.pospOnBoardingForm.get("PANDocument.FileName").value == undefined || this.pospOnBoardingForm.get("PANDocument.FileName").value == null) {
      this._uploadDocumentDetails.push({
        Message: 'Attach PAN Card',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("PhotoDocument.FileName").value == "" || this.pospOnBoardingForm.get("PhotoDocument.FileName").value == undefined || this.pospOnBoardingForm.get("PhotoDocument.FileName").value == null) {
      this._uploadDocumentDetails.push({
        Message: 'Attach Passport Size Photo',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.pospOnBoardingForm.get("CancelledChequeDocument.FileName").value == "" || this.pospOnBoardingForm.get("CancelledChequeDocument.FileName").value == undefined || this.pospOnBoardingForm.get("CancelledChequeDocument.FileName").value == null) {
      this._uploadDocumentDetails.push({
        Message: 'Attach Cancelled Cheque',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this._uploadDocumentDetails.length > 0) {
      this._alertservice.raiseErrors(this._uploadDocumentDetails);
      return;
    }
    else {

      // submit posp data
      this._submitBecomePOSP();
    }
  }

  // autocomplete for PinCode and also binding value of cityName & cityId
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.pospOnBoardingForm.patchValue({
      PinCodeId: event.option.value.Id,
      PinCodeNumber: event.option.value.PinCode,
      CityName: event.option.value.CityName,
      StateName: event.option.value.StateName,
    });
  }

  // PopUp for Pincode Selection
  public openDiologPincode(type: string, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '44vw';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      type: type,
      title: title,
      ispopup: true,
    };

    const dialogRef = this._dialog.open(GenPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'Pincode') {
          this.pospOnBoardingForm.patchValue({
            PinCodeNumber: result.PinCode,
            PinCodeId: result.Id,
            CityName: result.CityName,
            StateName: result.StateName,
          });
        }
      }
    });
  }

  public clear(name: string, id: string): void {
    this.pospOnBoardingForm.controls[name].setValue("")
    this.pospOnBoardingForm.controls[id].setValue(null)
  }

  // Select Documents
  public SelectDocument(event, DocumentType: string) {
    let file = event.target.files[0]

    if (file) {
      this._dataService.UploadFile(this._uploadFileAPI, file).subscribe((res) => {
        if (res.Success) {
          if (DocumentType == 'UIDFront') {
            this.pospOnBoardingForm.get('AadharCardFrontDocument').patchValue({
              DocumentType: "UIDFront",
              DocumentTypeName: "Aadhar Card",
              DocumentNo: this.pospOnBoardingForm.get('AadharNumber').value,
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
            });
          }
          else if (DocumentType == 'UIDBack') {
            this.pospOnBoardingForm.get('AadharCardBackDocument').patchValue({
              DocumentType: "UIDBack",
              DocumentTypeName: "Aadhar Card",
              DocumentNo: this.pospOnBoardingForm.get('AadharNumber').value,
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
            });
          }
          else if (DocumentType == 'PAN') {
            this.pospOnBoardingForm.get('PANDocument').patchValue({
              DocumentType: "PAN",
              DocumentTypeName: "PAN Card",
              DocumentNo: this.pospOnBoardingForm.get('PANNumber').value,
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath
            });
          }
          else if (DocumentType == 'Photo') {
            this.pospOnBoardingForm.get('PhotoDocument').patchValue({
              DocumentType: "PassportSizePhoto",
              DocumentTypeName: "Passport Size Photo",
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath
            });
          }
          else if (DocumentType == 'CancelledCheque') {
            this.pospOnBoardingForm.get('CancelledChequeDocument').patchValue({
              DocumentType: "CancelledCheque",
              DocumentTypeName: "Cancelled Cheque",
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath
            });
          }
          else if (DocumentType == 'EducationCertificate') {
            this.pospOnBoardingForm.get('EducationCertificateDocument').patchValue({
              DocumentType: "EducationCertificate",
              DocumentTypeName: "Education Certificate",
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath
            });
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
* View Uploaded Document
*/
  public ViewDocuments(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  // Remove Documents
  public removeDocument(DocumentType: string) {
    this._dialogService.confirmDialog({
      title: 'Are You Sure?',
      message: "You won't be able to revert this",
      confirmText: 'Yes, Delete!',
      cancelText: 'No',
    }).subscribe((res) => {
      if (res) {
        if (DocumentType == 'UIDFront') {
          this.pospOnBoardingForm.get('AadharCardFrontDocument').patchValue({
            FileName: null,
            StorageFileName: null,
            StorageFilePath: null
          });
        }
        else if (DocumentType == 'UIDBack') {
          this.pospOnBoardingForm.get('AadharCardBackDocument').patchValue({
            FileName: null,
            StorageFileName: null,
            StorageFilePath: null
          });
        }
        else if (DocumentType == 'PAN') {
          this.pospOnBoardingForm.get('PANDocument').patchValue({
            FileName: null,
            StorageFileName: null,
            StorageFilePath: null
          });
        }
        else if (DocumentType == 'Photo') {
          this.pospOnBoardingForm.get('PhotoDocument').patchValue({
            FileName: null,
            StorageFileName: null,
            StorageFilePath: null
          });
        }
        else if (DocumentType == 'CancelledCheque') {
          this.pospOnBoardingForm.get('CancelledChequeDocument').patchValue({
            FileName: null,
            StorageFileName: null,
            StorageFilePath: null
          });
        }
        else if (DocumentType == 'EducationCertificate') {
          this.pospOnBoardingForm.get('EducationCertificateDocument').patchValue({
            FileName: null,
            StorageFileName: null,
            StorageFilePath: null
          });
        }
      }
    });
  }

  // back button
  public backButton() {
    this._Location.back();
  }

  public bankSelected(event: MatAutocompleteSelectedEvent): void {
    this.pospOnBoardingForm.patchValue({
      BankId: event.option.value.Id,
      BankName: event.option.value.Name
    });
  }

  public openDiolog(type: string, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "51vw";
    dialogConfig.minWidth = "fit-content";
    dialogConfig.minHeight = "fit-content";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      type: type,
      title: title,
      ispopup: true

    };

    const dialogRef = this._dialog.open(GenPopupComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (type == 'Bank') {
          this.pospOnBoardingForm.patchValue({
            BankId: result.Id,
            BankName: result.Name
          });
        }
      }
    });
  }

  onTabChange(event: any) {
    let tabIndex = event.index; // Logic to handle tab change if needed }
  }

  nextTab() {
    let index = this.tabGroup.selectedIndex;
    if (index < this.tabGroup._tabs.length - 1) {
      this.tabGroup.selectedIndex = index + 1;
    }
  }

  prevTab() {
    let index = this.tabGroup.selectedIndex;
    if (index > 0) { this.tabGroup.selectedIndex = index - 1; }
  }


  //#endregion public-methods

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------
  // form to display data from Loading Payment Link form
  private _initMainForm(data: IPOSPOnBoardingDto): FormGroup {
    let ddF = this._fb.group({
      Id: [0],
      Code: [0],
      Title: [""],
      FirstName: [""],
      MiddleName: [""],
      LastName: [""],
      Gender: [""],
      DateOfBirth: [""],
      MobileNo: [""],
      WhatsAppNo: [""],
      EmailId: [""],
      Address: [""],
      PinCodeId: [0],
      PinCodeNumber: [""],
      CityName: [""],
      StateName: [""],
      CountryName: [""],
      PANNumber: [""],
      AadharNumber: [""],
      BankId: [0],
      BankName: [""],
      NameAsPerBank: [""],
      AccountNumber: [""],
      IFSCCode: [""],
      AccountType: [""],
      Qualification: [""],
      SpecificEducation: [""],
      Status: [""],
      EducationCertificateDocument: this._buildECDocument(data?.EducationCertificateDocument),
      AadharCardFrontDocument: this._buildAadharFrontDocument(data?.AadharCardFrontDocument),
      AadharCardBackDocument: this._buildAadharBackDocument(data?.AadharCardBackDocument),
      PANDocument: this._buildPANDocument(data?.PANDocument),
      PhotoDocument: this._buildPhotoDocument(data?.PhotoDocument),
      CancelledChequeDocument: this._buildCancelledChequeDocument(data?.CancelledChequeDocument),
    });

    if (data) {
      ddF.patchValue(data)
    }
    return ddF
  }

  // build Education Certificate Form
  private _buildECDocument(items: IDocumentAttachmentsDto): FormGroup {
    let edForm = this._fb.group({
      Id: [0],
      AgentOnBoardId: [0],
      DocumentType: [""],
      DocumentNo: [""],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: [""],
    });

    if (items) {
      edForm.patchValue(items)
    }
    return edForm
  }

  // build Aadhar Front Form
  private _buildAadharFrontDocument(items: IDocumentAttachmentsDto): FormGroup {
    let docFrom = this._fb.group({
      Id: [0],
      AgentOnBoardId: [0],
      DocumentType: [""],
      DocumentNo: [""],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: [""],
    });

    if (items) {
      docFrom.patchValue(items)
    }
    return docFrom
  }

  // build Aadhar Back Form
  private _buildAadharBackDocument(items: IDocumentAttachmentsDto): FormGroup {
    let docFrom = this._fb.group({
      Id: [0],
      AgentOnBoardId: [0],
      DocumentType: [""],
      DocumentNo: [""],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: [""],
    });

    if (items) {
      docFrom.patchValue(items)
    }
    return docFrom
  }

  // build PAN Form
  private _buildPANDocument(items: IDocumentAttachmentsDto): FormGroup {
    let docFrom = this._fb.group({
      Id: [0],
      AgentOnBoardId: [0],
      DocumentType: [""],
      DocumentNo: [""],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: [""],
    });

    if (items) {
      docFrom.patchValue(items)
    }
    return docFrom
  }

  // build Photo Form
  private _buildPhotoDocument(items: IDocumentAttachmentsDto): FormGroup {
    let docFrom = this._fb.group({
      Id: [0],
      AgentOnBoardId: [0],
      DocumentType: [""],
      DocumentNo: [""],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: [""],
    });

    if (items) {
      docFrom.patchValue(items)
    }
    return docFrom
  }

  // build Cancelled Cheque Form
  private _buildCancelledChequeDocument(items: IDocumentAttachmentsDto): FormGroup {
    let docFrom = this._fb.group({
      Id: [0],
      AgentOnBoardId: [0],
      DocumentType: [""],
      DocumentNo: [""],
      FileName: [""],
      StorageFileName: [""],
      StorageFilePath: [""],
    });

    if (items) {
      docFrom.patchValue(items)
    }
    return docFrom
  }

  // Get Insurance helper dropdown master data
  private _fillMasterList() {
    this.genderList = [];
    this.genderList.push({ Name: "Male", Code: "Male" });
    this.genderList.push({ Name: "Female", Code: "Female" });
  }

  // form changes 
  private _onFormChange() {

    // change pincode
    this.pospOnBoardingForm.get('PinCodeNumber').valueChanges.subscribe((val) => {
      this.pincodes$ = this._masterListService.getFilteredPincodeList(val).pipe(takeUntil(this._destroy$), switchMap((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            let result = Array.from(res.Data.Items.reduce((m, t) => m.set(t.PinCode, t), new Map()).values());
            result = result.filter((el) => { if (el.PinCode) { return el; } });
            return of(result);
          } else {
            return of([]);
          }
        } else {
          return of([]);
        }
      })
      );
    });

    // Gender Changes
    this.pospOnBoardingForm.get('Gender').valueChanges.subscribe((val) => {
      if (val == "Male") {
        this.pospOnBoardingForm.get('Title').patchValue("Mr");
      }
      else if (val == "Female") {
        this.pospOnBoardingForm.get('Title').patchValue("Mrs");
      }
    });

    //fill bank list
    this.pospOnBoardingForm.get('BankName').valueChanges.subscribe((val) => {
      this.Banks$ = this._masterListService.getFilteredBankList(val).pipe(
        takeUntil(this._destroy$),
        switchMap((res) => {
          if (res.Success) {
            if (res.Data.Items.length) {
              let result = Array.from(
                res.Data.Items.reduce(
                  (m, t) => m.set(t.Name, t),
                  new Map()
                ).values()
              );
              result = result.filter((el) => {
                if (el.Name) {
                  return el;
                }
              });
              return of(result);
            } else {
              return of([]);
            }
          } else {
            return of([]);
          }
        })
      );
    });

  }

  private _submitBecomePOSP(): void {

    // check basic information
    if (this._basicInformationAlert.length > 0) {
      this._alertservice.raiseErrors(this._basicInformationAlert);
      return;
    }

    // check bank details
    if (this._bankDetailsAlert.length > 0) {
      this._alertservice.raiseErrors(this._bankDetailsAlert);
      return;
    }

    // check upload document details
    if (this._uploadDocumentDetails.length > 0) {
      this._alertservice.raiseErrors(this._bankDetailsAlert);
      return;
    }

    // convert date formate
    this.pospOnBoardingForm.patchValue({
      DateOfBirth: this._datePipe.transform(this.pospOnBoardingForm.get('DateOfBirth').value, 'yyyy-MM-dd')
    });

    this._dataService.createData(this.pospOnBoardingForm.value, API_ENDPOINTS.PoSPOnBoarding.Base + "/true")
      .subscribe((res) => {
        if (res.Success) {

          // clear local storage 
          localStorage.clear();

          // redirect url 
          this._alertservice.raiseSuccessAlert(res.Message, 'true')
          window.open(environment.redirectBecomPOSPUrl, "_self");
        } else {
          this._alertservice.raiseErrors(res.Alerts);
        }
      });
  }

  public staticLogin() {
    this._authService.staticLogin(this._loginForm.value)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: any) => {
          this._authService.userProfile$
            .pipe(takeUntil(this._destroy$))
            .subscribe((user: IMyProfile) => {
              if (user) {
                this.LoginUser = user;
              }
            });
        },
        error: (error) => {
        }
      });
  }

  private _initLoginForm(): void {
    this._loginForm = this._fb.group({
      username: ['AgentOnBoard'],
      password: ['Agent@nBoard#$'],
    });
  }

  //#endregion private-methods
}
