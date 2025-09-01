import { DatePipe, Location } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { dropdown } from '@config/dropdown.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { Alert, IFilterRule, OrderBySpecs } from '@models/common';
import { IHealthQuateDto, HealthQuateDto } from '@models/dtos/config';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { DocumentsDto, PolicyPersonsDto } from '@models/dtos/config/RFQHealth/rfqhealth-dto';
import { RFQExistingIllnessDetailsComponent } from '../rfqexisting-illness-details/rfqexisting-illness-details.component';
import { RaiseDocumentsDto, IQNByUWDto, QNByUWDto, QNDocumentDto, IRaiseDocumentsDto } from '@models/dtos/config/RFQHealth/quotation-note';
import { HttpService } from '@lib/services/http/http.service';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { QuotationNoteService } from './quotation-note.service';
import { HealthPolicyQNDocumentType } from 'src/app/shared/enums/HealthPolicyQNDocumentType.enum';
import { ROUTING_PATH } from '@config/routingPath.config';
import { RFQHealthService } from '../rfq-health/rfqhealth.service';
import { SumInsuredEnum } from 'src/app/shared/enums/SumInsured.enum';
import { DialogService } from '@lib/services/dialog.service';
import { HealthPolicyTenure } from 'src/app/shared/enums/rfq-health/HealthPolicyTenure.enum';
import { IInsuranceCompanyDto } from '@models/dtos/core/insurance-company-dto';
import { IUserDto } from '@models/dtos/core/userDto';
import { IBranchDto } from '@models/dtos/core/BranchDto';
import { DisplayedPolicyType } from '@config/transaction-entry/transactionPolicyType.config';
import { MasterListService } from '@lib/services/master-list.service';
import { CategoryCodeEnum } from 'src/app/shared/enums/transaction-entry/category-code.enum';
import { IAdditionalFilterObject } from '@models/dtos/shared/querySpecs.model';
import { SubCategoryCodeEnum } from 'src/app/shared/enums/transaction-entry/subCategory-code.enum';
import { environment } from 'src/environments/environment';
import { CategoryTypeList, HealthPolicyDocumentsList, PolicyTenureList } from '@config/rfq';
import { HealthCategoryType, HealthPolicyType } from 'src/app/shared/enums/rfq-health';
import { MatStepper } from '@angular/material/stepper';
import { RFQDocumentsDrpList } from '@config/rfq';
import { RfqService } from '../../rfq.service';

const ActiveMasterDataRule: IFilterRule = { Field: 'Status', Operator: 'eq', Value: 1 }

@Component({
  selector: 'gnx-quotation-note',
  templateUrl: './quotation-note.component.html',
  styleUrls: ['./quotation-note.component.scss'],
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
export class QuotationNoteComponent implements OnInit, AfterViewInit {

  @ViewChild('DocumentDropdown') DocumentDropdown: ElementRef;
  @ViewChild('stepper') stepper: MatStepper;

  // #region public variables

  pagetitle: string // Page Main header Title
  mode: string; // for identify of Raise page is create or edit or view
  myMembers; // store selected member icon path
  allMemberCard; // to store display Member icon in card
  PolicyPersonsArray // store insured person details

  displayValuesOfForm // to store for display RFQ Details
  DropdownMaster: dropdown; // Dropdown Master Data
  HealthQuateForm: FormGroup; //Store displayValuesOfForm data in form group
  HealthQuate: IHealthQuateDto; // HealthQuateForm value

  QuotationNoteForm: FormGroup // Quotation note form group
  QuotationNote: IQNByUWDto // Quotation note form group value

  //List objects
  Branchs: IBranchDto[] = [];
  SubCategoryList = [];
  // Observable List
  TeamRefUser$: Observable<IUserDto[]>;
  InsuranceCompany$: Observable<IInsuranceCompanyDto[]>;

  // Alert Array List
  AttachDocumentAlerts: Alert[] = []; // Step Invalid field error message

  step1 = new FormControl(); // Step Control
  QuotationDetailsAlerts: Alert[] = []; // Step Invalid field error message
  QNDocAlerts: Alert[] = []; // Step Invalid field error message

  destroy$: Subject<any>;

  maxBirthDate: Date; // Max birthdate validation
  SelfGender: string; // store gender 
  ProposerName: string; //
  UploadFileAPI = API_ENDPOINTS.Attachment.Upload; // upload document API

  isExpand: boolean = false;

  // #endregion public variables

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
    private _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _QNService: QuotationNoteService,
    private _RFQService: RFQHealthService,
    private _dialogService: DialogService,
    private _MasterListService: MasterListService,
    private _Location: Location,
    private _cdr: ChangeDetectorRef,
    private _rfqService: RfqService,
  ) {
    this.DropdownMaster = new dropdown();
    // Set max birthdate is before three month of current date
    this.maxBirthDate = new Date(Date.now());
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);
    this.SelfGender = 'Male';
    this.destroy$ = new Subject();
    this._fillMasterList();
    this.allMemberCard = this._RFQService.memberCardArray()
  }

  // #endregion constructor



  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    // Route params data

    let data = this._route.snapshot.data;
    this.pagetitle = data['title']
    this.displayValuesOfForm = data['data']
    this.mode = data['mode'];

    this.myMembers = [];
    this.HealthQuate = new HealthQuateDto();
    this.QuotationNote = new QNByUWDto();

    // init health quoate form
    this.HealthQuateForm = this._buildHealthQuateForm(this.displayValuesOfForm);
    // this._customizedSumInsured()
    // init Quotation Note form
    this.QuotationNoteForm = this._buildQuotationNoteForm(this.displayValuesOfForm)
    this.QuotationNoteForm.get('SendBackRejectDesc').patchValue(this.displayValuesOfForm.SendBackRejectDesc);

    this.QuotationNote.Documents = new Array<RaiseDocumentsDto>()

    // Policy Person Form Array
    this.PolicyPersonsArray = this.HealthQuateForm.get('Members') as FormArray;

    //Remove All Existing QN Documents
    while (this.QNDocuments.controls.length !== 0) {
      this.QNDocuments.removeAt(0)
    }

    // Add By defualt two documet 
    for (let i = 1; i < 2; i++) {
      this.addQNDocuments()
    }
    this.memberDispalyDetails(this.HealthQuateForm.get('Members').value)
    this._genderOfSelfSpouseInArray()
    this._valChange();

    if (this.mode == "view") {
      this.HealthQuateForm.disable();
      this.QuotationNoteForm.disable();
    }

    this.ProposerName = this.PolicyPersonsArray?.value[0]?.Name;
  }

  ngAfterViewInit(): void {
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();
    this.stepper.next();

    // in case of policy type is "Rollover" then stepper next click one more add
    if (this.HealthQuateForm.get("PolicyType").value == "Rollover" || this.HealthQuateForm.get('PolicyType').value == 'Renewal-Change Company' || this.HealthQuateForm.get('PolicyType').value == 'Renewal-Same Company') {
      this.stepper.next();
    }

    this._cdr.detectChanges();
  }

  //#endregion lifecyclehooks
  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  get f() {
    return this.HealthQuateForm.controls;
  }

  // get Quotation Documents
  get QNDocuments() {
    return this.QuotationNoteForm.get('QNDocuments') as FormArray
  }

  // get Raise Documents
  get RaiseDocuments() {
    return this.HealthQuateForm.get('Documents') as FormArray
  }

  // get Documents
  get document() {
    return this.QuotationNoteForm.get('Documents') as FormArray
  }

  // get PolicyDocumentAttachment
  get PolicyDocumentAttachment() {
    return this.document.controls;
  }

  // Get Health SubCategory From Config file
  get SubCategoryCodeEnum() {
    return SubCategoryCodeEnum
  }

  // Get Health Policy From Config file
  public get HealthPolicyType() {
    return HealthPolicyType
  }

  // Get Health Category From Config file
  public get HealthCategoryType() {
    return HealthCategoryType
  }
  // Get sum Insured Amount From Config file
  public get sumInsuredAmount() {
    return SumInsuredEnum
  }

  // Get Health Policy Tenure From Config file
  public get HealthPolicyTenure() {
    return HealthPolicyTenure
  }

  // Get Policy Type
  get PolicyTypeList() {
    if (this.displayValuesOfForm?.TransactionId) {
      return DisplayedPolicyType.rfqHealthRenewalPolicyType
    }
    else {
      return DisplayedPolicyType.rfqHealthPolicyType
    }
  }

  // get Policy Document List
  get PolicyDocumentList() {
    return RFQDocumentsDrpList.filter(doc => doc.Category.includes(CategoryCodeEnum.Health))
  }

  // get Category Type List
  get CategoryTypeList() {
    return CategoryTypeList
  }

  // get Policy Tenure List
  get PolicyTenureList() {
    return PolicyTenureList
  }

  // insured members data from RFQ health form
  public SetCover(member: string, answer) {
    let Answer = answer
    this.HealthQuateForm.patchValue({
      [member + 'CoverRequired']: Answer,
    });
    this._countDaughterSon(member)
    this.members()
  }

  // Validating stepper three
  public QuotationDetailsVAlidation(): any {
    //validate member
    this.QuotationDetailsAlerts = [];

    if (this.mode != 'view') {
      this.QNDocuments.controls.forEach((ele, index) => {
        if (ele.get('FileName').value == '') {
          this.QuotationDetailsAlerts.push({
            Message: `Attach QN PDF ${index + 1} is required`,
            CanDismiss: false,
            AutoClose: false,
          })
        }
      })
    }

    if (this.QuotationDetailsAlerts.length > 0) {
      this.step1.setErrors({ required: true });
      return this.step1;
    } else {
      this.step1.reset();
      return this.step1;
    }
  }

  // alert message for stepper three
  public QuotationDetailsError() {
    if (this.QuotationDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationDetailsAlerts)
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
      this._alertservice.raiseErrors(this.QuotationDetailsAlerts);
      return;
    }
    else {
      var row: QNDocumentDto = new QNDocumentDto()
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

  // file data (QN document that is added)
  public UploadQNPDF(event, index) {

    if (event.target.files.length > 0) {

      let file = event.target.files[0]
      let reader = new FileReader();
      reader.onload = () => { };
      reader.readAsDataURL(file);

      if (file) {

        let FileName = file.name.split('.')
        if (FileName && FileName.length >= 2) {

          let fileExtension = FileName[FileName.length - 1]

          if ((fileExtension.toLowerCase() != 'pdf')) {
            this._alertservice.raiseErrorAlert("Please select a valid PDF File")
            return;
          }

          this._dataService
            .UploadFile(this.UploadFileAPI, file)
            .subscribe((res) => {
              if (res.Success) {
                this._alertservice.raiseSuccessAlert(res.Message);
                this.QNDocuments.controls[index].patchValue({
                  StorageFileName: res.Data.StorageFileName,
                  StorageFilePath: res.Data.StorageFilePath,
                  DocumentType: HealthPolicyQNDocumentType.Other,
                  FileName: event.target.files[0].name,
                  RFQId: this.HealthQuateForm.get('Id').value
                })

              }
              else {
                this._alertservice.raiseErrors(res.Alerts);
              }
            });

        }
        else {
          this._alertservice.raiseErrorAlert("Please select a valid  File")
          return;
        }



      }
    }
  }

  // adding members in myMember array
  public members() {

    this.myMembers = [];
    if (
      this.HealthQuateForm.get('SelfCoverRequired').value == true &&
      this.HealthQuateForm.get('SelfGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Self' });
    }
    if (
      this.HealthQuateForm.get('SelfCoverRequired').value == true &&
      this.HealthQuateForm.get('SelfGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Self' });
    }
    if (
      this.HealthQuateForm.get('SpouseCoverRequired').value == true &&
      this.HealthQuateForm.get('SpouseGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Spouse' });
    }
    if (
      this.HealthQuateForm.get('SpouseCoverRequired').value == true &&
      this.HealthQuateForm.get('SpouseGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Spouse' });
    }
    if (
      this.HealthQuateForm.get('DaughterCoverRequired').value == true &&
      this.HealthQuateForm.get('noOfDaughter').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter' });
    }
    if (
      this.HealthQuateForm.get('DaughterCoverRequired').value == true &&
      this.HealthQuateForm.get('noOfDaughter').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter1' });
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter2' });
    }
    if (
      this.HealthQuateForm.get('DaughterCoverRequired').value == true &&
      this.HealthQuateForm.get('noOfDaughter').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/girl.png', title: 'Daughter3' });
    }

    if (
      this.HealthQuateForm.get('SonCoverRequired').value == true &&
      this.HealthQuateForm.get('noOfSon').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son' });
    }
    if (
      this.HealthQuateForm.get('SonCoverRequired').value == true &&
      this.HealthQuateForm.get('noOfSon').value > 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son1' });
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son2' });
    }
    if (
      this.HealthQuateForm.get('SonCoverRequired').value == true &&
      this.HealthQuateForm.get('noOfSon').value > 2
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son3' });
    }
    if (this.HealthQuateForm.get('MotherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/mother.png', title: 'Mother' });
    }
    if (this.HealthQuateForm.get('FatherCoverRequired').value == true) {
      this.myMembers.push({ member: '/assets/icons/father.png', title: 'Father' });
    }

  }

  // popUp for Illness (cannot be modified. Selected Illness form RFQ health will be viewed.)
  public openDiolog(indexNumber: number, detailkey: string, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      title: title,
      ispopup: true,
      disable: true,
      ExistingIllness: this.PolicyPersonsArray.at(indexNumber).get(detailkey).value,
    };
    const dialogRef = this.dialog.open(
      RFQExistingIllnessDetailsComponent,
      dialogConfig
    );

  }

  public ViewQnDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  // submiting QN Form
  public SubmitQNForm() {

    if (this.QuotationDetailsAlerts.length > 0) {
      this._alertservice.raiseErrors(this.QuotationDetailsAlerts)
      return;
    }

    // Start of check validation of Attachment 
    this._validateAttachDocField()

    if (this.AttachDocumentAlerts.length > 0) {
      this._alertservice.raiseErrors(this.AttachDocumentAlerts)
      this.DocumentDropdown.nativeElement.value = ""
      return;
    }
    // End of check validation of Attachment 

    let Id = this.HealthQuateForm.get('Id').value
    this.QuotationNoteForm.get("Id").patchValue(Id);
    this._QNService.QNGenerate(this.QuotationNoteForm.value).subscribe((res) => {

      if (res.Success) {
        this._alertservice.raiseSuccessAlert(res.Message, "false")
        // this._router.navigate([ROUTING_PATH.RFQ.QNSelectionSPPending + Id])
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

  // Reject QN Form
  public RejectQNForm() {


    if (this.QuotationNoteForm.get('SendBackRejectDesc').value == "" || this.QuotationNoteForm.get('SendBackRejectDesc').value == null) {
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

          let Id = this.HealthQuateForm.get('Id').value;
          let CurrentStage = this.HealthQuateForm.get('Stage').value;

          this.QuotationNoteForm.get("Id").patchValue(Id);
          this.QuotationNoteForm.get("Stage").patchValue(CurrentStage);

          this._QNService.QNReject(this.QuotationNoteForm.value).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, "false")
              // this._router.navigate([ROUTING_PATH.RFQ.Raise + Id])
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

  // Send back QN Form
  public SendBackQNForm() {

    if (this.QuotationNoteForm.get('SendBackRejectDesc').value == "" || this.QuotationNoteForm.get('SendBackRejectDesc').value == null) {
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

          let Id = this.HealthQuateForm.get('Id').value;
          let CurrentStage = this.HealthQuateForm.get('Stage').value;

          this.QuotationNoteForm.get("Id").patchValue(Id);
          this.QuotationNoteForm.get("Stage").patchValue(CurrentStage);

          this._QNService.QNSendBack(this.QuotationNoteForm.value).subscribe((res) => {
            if (res.Success) {
              this._alertservice.raiseSuccessAlert(res.Message, "false")
              // this._router.navigate([ROUTING_PATH.RFQ.Raise + Id])
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

  // add new row in Document array
  public addDocuments(selectedDocument?: string) {

    const row: IRaiseDocumentsDto = new RaiseDocumentsDto();
    if (selectedDocument && selectedDocument != "") {
      let RowIndex = this.PolicyDocumentList.findIndex((doc) => doc.DocumentType == selectedDocument)

      if (RowIndex != -1) {
        row.DocumentType = this.PolicyDocumentList[RowIndex].DocumentType;
        row.DocumentTypeName = this.PolicyDocumentList[RowIndex].DocumentTypeName;
        row.Stage = "RFQQNUW";
        this.document.push(this._initRaiseDocuments(row));
      }
    }
  }

  // delete a row in document array With User Confirmation
  public RemoveDocuments(index: number) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {
          this.document.removeAt(index)
        }

      });


  }

  // file data (policy document that is added)
  public SelectRFQDocument(event, DocIndex: number) {
    let file = event.target.files[0]

    if (file) {
      this._dataService.UploadFile(this.UploadFileAPI, file).subscribe((res) => {
        if (res.Success) {
          if (DocIndex >= 0) {
            this.document.controls[DocIndex].patchValue({
              FileName: res.Data.FileName,
              StorageFileName: res.Data.StorageFileName,
              StorageFilePath: res.Data.StorageFilePath,
              Stage: this.displayValuesOfForm.Stage
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

  // click on "Back to List Page" button then redirect last page
  public BackToListPage() {
    this._Location.back();
  }

  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }

  public rfqUWassign(type: 'assign' | 'unassign' | 'reassign') {
    this._rfqService.rfqUWassign(this.displayValuesOfForm, type)
    this._rfqService.assignUnassignRes.subscribe(res => {
      if (res) {
        this.BackToListPage()
        this._rfqService.assignUnassignRes.unsubscribe()
      }
    })
  }
  //#endregion public-methods


  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // when sumInsured is customized 
  // private _customizedSumInsured () {
  //   let flag = 1
  //   this.DropdownMaster.RFQSumInsuredButtonOptions.forEach((element,index) => {
  //     if (element.value == this.HealthQuateForm.get('SumInsured').value) {
  //       flag = 0
  //     }
  //   })
  //   if(flag) {
  //     this.HealthQuateForm.get('SumInsuredOtherAmount').patchValue(this.HealthQuateForm.get('SumInsured').value)
  //     this.HealthQuateForm.get('SumInsured').patchValue(SumInsuredEnum.Other)
  //   }
  // }

  // update gender of self and spouse in allMemberCard array
  private _genderOfSelfSpouseInArray() {
    let female = '/assets/icons/woman.png'
    let male = '/assets/icons/male.png'
    if (this.HealthQuateForm.get('SelfGender').value == 'Male') {
      this.allMemberCard[0].member = male
      this.allMemberCard[0].gender = 'Male'
      this.allMemberCard[1].gender = 'Female'
      this.allMemberCard[1].member = female
    }
    else {
      this.allMemberCard[1].member = male
      this.allMemberCard[0].member = female
      this.allMemberCard[1].gender = 'Male'
      this.allMemberCard[0].gender = 'Female'
    }
  }

  // member deatils from RFQ Health form
  private memberDispalyDetails(member) {

    member.forEach((element, index) => {
      this.SetCover(element.Relation, true)
      if (element.Relation == 'Self') {
        this.SelfGender = element.Gender
        this._genderofSelfAndSpouse(element.Gender)
      }
    })
  }

  // counting number of Son and Daughter
  private _countDaughterSon(child) {
    if (child == 'Daughter') {
      this.HealthQuateForm.patchValue({
        noOfDaughter: this.HealthQuateForm.get('noOfDaughter').value + 1
      })
    }

    if (child == 'Son') {
      this.HealthQuateForm.patchValue({
        noOfSon: this.HealthQuateForm.get('noOfSon').value + 1
      })
    }
  }

  // update gender of Self and spouse in HealthQuateForm
  private _genderofSelfAndSpouse(choice) {
    this.SelfGender = choice;
    this.HealthQuateForm.patchValue({
      SelfGender: this.SelfGender,
    });

    if (this.HealthQuateForm.get('SelfGender').value == 'Male') {
      this.HealthQuateForm.patchValue({
        SpouseGender: 'Female',
      });
    } else {
      this.HealthQuateForm.patchValue({
        SpouseGender: 'Male',
      });
    }
    this._genderOfSelfSpouseInArray()
    this.members()
  }

  // Quotation Note Form (main form)
  private _buildQuotationNoteForm(data) {
    let qNF = this.fb.group({
      Id: [0],
      Deductible: [0],
      QNDocuments: this._buildQNDocuments(data.QNDocuments),
      Documents: this._buildRaiseDocuments(data.Documents),
      Stage: [''],
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
    })

    return qNF
  }

  // Build Quotation Note Raise Document Formarray
  private _buildRaiseDocuments(items: RaiseDocumentsDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initRaiseDocuments(i));
        });
      }
    }

    return formArray;
  }

  // Init Quotation Note Raise Document Form
  private _initRaiseDocuments(item: RaiseDocumentsDto): FormGroup {
    let dFQN = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      DocumentTypeName: [''],
      DocumentNo: [''],
      FileName: ['', [Validators.required, this.noWhitespaceValidator]],
      StorageFileName: [''],
      StorageFilePath: ['', [Validators.required, this.noWhitespaceValidator]],
      Description: [''], // remarks
      Stage: ['']
    })

    if (item != null) {
      if (!item) {
        item = new RaiseDocumentsDto();
      }

      if (item) {
        dFQN.patchValue(item);
      }
    }
    return dFQN
  }

  // Build Quotation Note Document Formarray
  private _buildQNDocuments(items: QNDocumentDto[] = []): FormArray {
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
  private _initQNDocuments(item: QNDocumentDto): FormGroup {
    let dFQN = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      InsuranceCompany: [''],
      SumInsured: [0],
      GrossPremium: [0],
      Buy: [false],
      FileName: [''],
      StorageFileName: [''],
      StorageFilePath: ['']
    })

    if (item != null) {
      if (!item) {
        item = new QNDocumentDto();
      }

      if (item) {
        dFQN.patchValue(item);
      }
    }
    return dFQN
  }

  // health details form (dispaly data from RFQ health form)
  private _buildHealthQuateForm(data) {
    let form = this.fb.group({
      Id: [0],
      RFQDate: [''],
      RFQNo: [''],

      // [1] Basic details
      SubCategoryId: [0],
      SubCategoryName: [''],
      SubCategoryCode: [''],
      PolicyType: [''],
      CategoryType: [''],
      PolicyPeriod: [0], // chetan add new field

      // [2] Product  Category details
      SumInsured: [0],
      OtherSumInsured: [0],
      Deductible: [0],
      PincodeId: [],
      Pincode: [''],
      ProposerMobileNo: [''], // chetan add new field
      ProposerEmail: [''], // chetan add new field

      // [2] Product  Category details >>> [2.1] >>> Details of Proposed Insured & Family (if applicable)
      Members: this._buildPolicyPersonForm(data.Members),
      SelfCoverRequired: [false],
      SpouseCoverRequired: [false],
      DaughterCoverRequired: [false],
      MotherCoverRequired: [false],
      FatherCoverRequired: [false],
      noOfDaughter: [],
      noOfSon: [],
      SelfGender: ['Male'],
      SpouseGender: ['Female'],
      SonCoverRequired: [false],

      // [3] Previous Policy Details (Only for Rollover)
      PrevPolicyInsurComp: [''],
      PrevPolicyType: [''],
      PreviousPolicyStartDate: [''],
      PreviousPolicyEndDate: [''],
      ClaimInPreviousYear: [false],
      PrevPolicySumInsured: [0],
      PreviousPolicyPremium: [0],

      // [4] Team Details
      BranchId: [0],
      BranchName: [''],
      SalesPersonType: [''],
      SalesPersonId: [],
      SalesPersonName: [''],
      TeamReferenceId: [],
      TeamReferenceName: [''],
      BDOName: [],
      BDMName: [],

      // 5. Attachment Details
      Documents: this._buildDocumentsForm(data.Documents),

      // get Current Stage
      Stage: [''],
    });

    if (data) {
      form.patchValue(data);
    }

    return form;
  }

  //Build Policy person  formarray
  private _buildPolicyPersonForm(items = []): FormArray {
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

  //Init Policy person  form
  private _initPolicyPersonForm(item, Relation = '', Gender = ''): FormGroup {
    let pPF = this.fb.group({
      Id: [0],
      RFQId: [0],
      Relation: [Relation],
      Name: ['',],
      DOB: ['',],
      Gender: [Gender],
      Remark: ['',],
      SmokerTibco: [null],
      SmokerTibcoDescription: [''],
      ExistingIllness: [null],
      ExistingIllnessDetail: this._buildExistingIllnessDetailForm(),
      SumInsured: [0],
      OtherSumInsured: [0],
      Deductible: [0],
    })
    if (item != null) {
      if (!item) {
        item = new PolicyPersonsDto();
      }

      if (item) {
        pPF.patchValue(item);
      }
    }
    return pPF;
  }

  // Init Attach document formarray
  private _buildDocumentsForm(items = []): FormArray {
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

  // Init Attach document formGroup
  private _initDocumentsForm(item): FormGroup {
    let dF = this.fb.group({
      Id: [0],
      RFQId: [0],
      DocumentType: [''],
      FileName: [''],
      StorageFileName: [''],
      StorageFilePath: [''],
      Description: [''], // remarks
      Stage: ['']
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

  //policy person Init Existing Illness Detail Form 
  private _buildExistingIllnessDetailForm(data?): FormGroup {
    let existingIllnessForm = this.fb.group({
      Id: [0],
      RFQMemberId: [0],
      Thyroid: [false],
      ThyroidSince: [''],
      ThyroidDescription: [''],
      Asthma: [false],
      AsthmaSince: [''],
      AsthmaDescription: [''],
      CholesterolDisorDr: [false],
      CholesterolDisorDrSince: [''],
      CholesterolDisorDrDescription: [''],
      Heartdisease: [false],
      HeartdiseaseSince: [''],
      HeartdiseaseDescription: [''],
      Hypertension: [false],
      HypertensionSince: [''],
      HypertensionDescription: [''],
      Diabetes: [false],
      DiabetesSince: [''],
      DiabetesDescription: [''],
      Obesity: [false],
      ObesitySince: [''],
      ObesityDescription: [''],
      OtherExistDisease: [false],
      OtherExistDiseaseDescription: [''],
    });

    return existingIllnessForm;
  }

  // change in number of members that are to be insured 
  private _valChange() {

    this.HealthQuateForm.get('SelfCoverRequired').valueChanges.subscribe((value) => {
      this.members()
    })

    this.HealthQuateForm.get('SpouseCoverRequired').valueChanges.subscribe((value) => {
      this.members()
    })

    this.HealthQuateForm.get('MotherCoverRequired').valueChanges.subscribe((value) => {
      this.members()
    })

    this.HealthQuateForm.get('FatherCoverRequired').valueChanges.subscribe((value) => {
      this.members()
    })

    this.HealthQuateForm.get('DaughterCoverRequired').valueChanges.subscribe(
      (value) => {
        if (value == true) {
          this.HealthQuateForm.get('noOfDaughter').patchValue(1);
        } else {
          this.HealthQuateForm.get('noOfDaughter').patchValue(0);
        }

        this.members()
      }
    );

    this.HealthQuateForm.get('SonCoverRequired').valueChanges.subscribe(
      (value) => {
        if (value == true) {
          this.HealthQuateForm.get('noOfSon').patchValue(1);
        } else {
          this.HealthQuateForm.get('noOfSon').patchValue(0);
        }
        this.members()
      }
    );

    this.HealthQuateForm.get('noOfSon').valueChanges.subscribe((value) => {
      if (
        parseInt(value) +
        parseInt(this.HealthQuateForm.get('noOfDaughter').value) >
        3
      ) {
        this.HealthQuateForm.get('noOfDaughter').patchValue(
          3 - parseInt(value)
        );
      }
      this.members()
    });

    this.HealthQuateForm.get('noOfDaughter').valueChanges.subscribe((value) => {
      if (
        parseInt(value) + parseInt(this.HealthQuateForm.get('noOfSon').value) >
        3
      ) {
        this.HealthQuateForm.get('noOfSon').patchValue(3 - parseInt(value));
      }
      this.members()
    });

  }

  // fill master data
  private _fillMasterList() {

    let ActiveDataRule: IFilterRule[] = [ActiveMasterDataRule]

    // fill Product Type
    let SubCategoryRule: IFilterRule[] = [ActiveMasterDataRule,
      {
        Field: "Category.Code",
        Operator: "eq",
        Value: CategoryCodeEnum.Health
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

    // fill Branch
    this._MasterListService.getFilteredMultiRulMasterDataList(API_ENDPOINTS.Branch.List + "/true", 'Name', "", ActiveDataRule)
      .subscribe(res => {
        if (res.Success) {
          this.Branchs = res.Data.Items
        }
      });

    // Fill Insurance Company
    let InsuranceCompanyRule: IFilterRule[] = [
      {
        Field: 'Status',
        Operator: 'eq',
        Value: 1,
      }
    ];

    let InsuranceCompanyAdditionalFilters: IAdditionalFilterObject[] = [
      { key: "CatagoryCode", filterValues: [CategoryCodeEnum.Health] }
    ]

    this.InsuranceCompany$ = this._MasterListService
      .getFilteredMultiRulMasterDataList(API_ENDPOINTS.InsuranceCompany.list, 'Name', "", InsuranceCompanyRule, InsuranceCompanyAdditionalFilters)
      .pipe(
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


  }

  private _validateAttachDocField() {

    this.AttachDocumentAlerts = []

    this.document.controls.forEach((element, index) => {
      if (element.get('StorageFilePath').hasError('required')) {

        this.AttachDocumentAlerts.push({
          Message: `${element.value.DocumentType} Attachment is required.`,
          CanDismiss: false,
          AutoClose: false,
        })
      }
    });

  }

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  //#endregion Private methods
}
