import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
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
import { MatStepper } from '@angular/material/stepper';
import { ILifeCounterOfferDto, ILifeQueriesDto, LifeQueriesDto } from '@models/dtos';
import { Alert } from '@models/common';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { SubCategoryCodeEnum } from 'src/app/shared/enums';
import { DisplayedLifePremiumInstallmentType } from '@config/rfq';
import { RFQRejectedByList } from '@config/rfq';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';

@Component({
  selector: 'gnx-life-counter-offer',
  templateUrl: './life-counter-offer.component.html',
  styleUrls: ['./life-counter-offer.component.scss'],
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
export class LifeCounterOfferComponent {

  @ViewChild('stepper') stepper: MatStepper;

  // Variables
  pagetitle: string = '';
  isExpand: boolean = false;
  mode: string = '';
  IsAdmin: boolean = false;
  IsLoggedUserSameasRfqCreatedUser: boolean = false;
  userProfileObj: IMyProfile // To store Logged User Details
  GrossPremium: number = 0;
  IsPOSPUser: boolean = false;
  ProposerName: string;

  currentDate = new Date();

  DisplayForm: any;

  //Form Group 
  LifeCOForm: FormGroup;

  //APIs
  UploadFileAPI: string = API_ENDPOINTS.Attachment.Upload; // upload Doc. API

  // Alert Array List
  detailsFieldsList: any[] // A list of Insured person Questionary

  QueryDetailsValidationError: Alert[] = []
  InsurerQueryAlerts: Alert[] = []; // Insurer Query Details field error message
  CustomerQueryAlerts: Alert[] = []; // Customer Query Details field error message

  QueryDetailsStepCtrl = new FormControl()

  //Enums
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
    private _datePipe: DatePipe,
    private _Location: Location,
  ) {
    // Get Inssuerd Person Questionary list
    this.detailsFieldsList = this._rfqLifeService.getdetailsFieldsList()

    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == "Agent") {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }
  }
  // #endregion constructor

  // #region Getters

  // Customer Queries
  get CustomerQueries() {
    return this.LifeCOForm.get('CustomerQueries') as FormArray;
  }

  // Insurer Queries
  get InsurerQueries() {
    return this.LifeCOForm.get('InsurerQueries') as FormArray;
  }

  get DisplayedLifePremiumInstallmentType() {
    return DisplayedLifePremiumInstallmentType
  }

  get RFQRejectedByList() {
    return RFQRejectedByList
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
    this.LifeCOForm = this._initForm(this.DisplayForm);

    if (this.DisplayForm.QNDocuments.length > 0) {
      this.DisplayForm.QNDocuments.forEach((el) => {
        if (el.Buy == true) {
          this.GrossPremium = el.GrossPremium;
        }
      });
    }

    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user) {
        this.userProfileObj = user
        this.IsAdmin = user.IsAdmin

        if (!this.IsAdmin) {
          if (user.Id == this.DisplayForm.CreatedById) {
            this._DisableFieldForCreaterUser()
            this.IsLoggedUserSameasRfqCreatedUser = true;
          } else {
            this._DisableFieldForUWUser()
            this.IsLoggedUserSameasRfqCreatedUser = false;
          }
        }
      }
    })

    // Form Changes
    this._onFormChange();
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

  public NomineeAge(nomineeDOB) {
    if (nomineeDOB) {
      let NomineeAge = moment.duration(moment().diff(nomineeDOB));
      return NomineeAge.years()
    } else {
      return 0;
    }
  }

  // view attached file 
  public ViewQnDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  // Submit Form Button
  public SubmitFormButton(IsSubmit: boolean) {

    if (this.InsurerQueryAlerts.length > 0) {
      this._alertservice.raiseErrors(this.InsurerQueryAlerts);
      return;
    }

    if (this.CustomerQueryAlerts.length > 0) {
      this._alertservice.raiseErrors(this.CustomerQueryAlerts);
      return;
    }

    // Check if Payment link is added or not (If not added raise Alert message)
    if (this.QueryDetailsValidationError.length > 0) {
      this._alertservice.raiseErrors(this.QueryDetailsValidationError)
      return
    }

    this.LifeCOForm.enable({ emitEvent: false })

    // date convert
    this._DateFormat();

    this._rfqLifeService.SubmitCounterOfferInfo(this.LifeCOForm.value, IsSubmit).subscribe((res) => {
      if (res.Success) {
        this._alertservice.raiseSuccessAlert(res.Message, "false")
        this._router.navigate([ROUTING_PATH.Basic.Dashboard])
      }
      else {
        //If form submission fails then apply disable condition
        if (!this.IsAdmin) {
          if (this.userProfileObj.Id == this.DisplayForm.CreatedById) {
            this._DisableFieldForCreaterUser()
          } else {
            this._DisableFieldForUWUser()
          }
        }

        if (res.Alerts && res.Alerts?.length > 0) {
          this._alertservice.raiseErrors(res.Alerts)
        }
        else {
          this._alertservice.raiseErrorAlert(res.Message)
        }
      }
    })

  }

  // Add new row in Insurer Query details array
  public addQueryDetails(QueryRaiseBy: string) {
    //#region Insurer
    if (QueryRaiseBy == "Insurer") {

      if (this.InsurerQueryAlerts.length > 0) {
        this._alertservice.raiseErrors(this.InsurerQueryAlerts);
        return;
      }
      else {
        var row: ILifeQueriesDto = new LifeQueriesDto()
        row.RFQId = this.LifeCOForm.get("Id").value;
        row.Stage = this.DisplayForm.Stage;
        row.QueryRaiseBy = "Insurer"
        row.SrNo = this.InsurerQueries.controls.length + 1
        this.InsurerQueries.insert(0, this._initQueriesForm(row));
      }
    }
    //#endregion Insurer

    //#region Customer
    if (QueryRaiseBy == "Customer") {

      if (this.CustomerQueryAlerts.length > 0) {
        this._alertservice.raiseErrors(this.CustomerQueryAlerts);
        return;
      }
      else {
        var row: ILifeQueriesDto = new LifeQueriesDto()
        row.RFQId = this.LifeCOForm.get("Id").value;
        row.Stage = this.DisplayForm.Stage;
        row.QueryRaiseBy = "Customer"
        row.SrNo = this.CustomerQueries.controls.length + 1
        this.CustomerQueries.insert(0, this._initQueriesForm(row));
      }
    }
    //#endregion Customer
  }

  // upload cheque details in attached payment proof
  public uploadQueryDocument(event: any, index: number, QueryRaiseBy: string) {

    let file = event.target.files[0]

    if (file) {
      let FileName = file.name.split('.')
      if (FileName && FileName.length >= 2) {
        this._dataService
          .UploadFile(this.UploadFileAPI, file)
          .subscribe((res) => {
            if (res.Success) {

              if (QueryRaiseBy == 'Insurer') {
                this.InsurerQueries.controls[index].patchValue({
                  FileName: res.Data.FileName,
                  StorageFileName: res.Data.StorageFileName,
                  StorageFilePath: res.Data.StorageFilePath
                })
              }

              if (QueryRaiseBy == 'Customer') {
                this.CustomerQueries.controls[index].patchValue({
                  FileName: res.Data.FileName,
                  StorageFileName: res.Data.StorageFileName,
                  StorageFilePath: res.Data.StorageFilePath
                })
              }



              this._alertservice.raiseSuccessAlert(res.Message);
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

      return
    }
  }

  // view attached file 
  public ViewAttachedDocument(fileName: string) {
    if (fileName) {
      window.open(environment.apiDomain + environment.Attachments_Middleware + "/" + fileName)
    }
  }

  // validate decimal point, minus and decimal number 
  public DecimalWithMinus(event) {

    if (typeof event.target.selectionStart == "number") {
      if (event.target.selectionStart == 0 && event.target.selectionEnd == event.target.value.length) {
        event.target.value = "";
      }
    }

    event.target.value.replace(/[^0-9\.]/g, '')
    var findsDot = new RegExp(/\./g)
    var containsDot = event.target.value.match(findsDot)
    if (containsDot != null && ([46, 110, 190].indexOf(event.which) > -1)) {
      event.preventDefault();
      return false;
    }

    // for 2 decimal point allow only 
    var DotArrValue = event.target.value.split(".");
    if (DotArrValue.length > 1 && [8, 9, 13, 27, 37, 38, 39, 40].indexOf(event.which) == -1) {
      if (DotArrValue[1].length > 1) {
        event.preventDefault();
        return false;
      }
    }

    if (event.which == 64 || event.which == 16) {
      // numbers
      return false;
    } if ([8, 9, 13, 27, 37, 38, 39, 40].indexOf(event.which) > -1) {
      // backspace, tab, enter, escape, arrows
      return true;
    } else if (event.which >= 48 && event.which <= 57) {
      // numbers
      return true;
    } else if (event.which >= 96 && event.which <= 105) {
      // numpad number
      return true;
    } else if ([46, 110, 190].indexOf(event.which) > -1 && event.target.value.length > 1) {
      // dot and numpad dot
      return true;
    } else if ([109, 189].indexOf(event.which) > -1 && event.target.value.length < 1) {
      // "-" and numpad "-"
      return true;
    }
    else {
      event.preventDefault();
      return false;
    }

  }

  // remove Query details 
  public removeQueryDetails(index: number, QueryRaiseBy: string) {

    this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You won't be able to revert this",
        confirmText: 'Yes, Delete!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if (res) {

          if (QueryRaiseBy == 'Insurer') {
            let SelectedQuery = this.InsurerQueries.controls[index]
            this.InsurerQueries.removeAt(index);

            //After Delete any query Update Srno
            this.InsurerQueries.controls.forEach(q=>{
              if (SelectedQuery.value.SrNo < q.get('SrNo').value){
                q.patchValue({
                  SrNo: q.value.SrNo - 1
                })
              }
            })
          }

          if (QueryRaiseBy == 'Customer') {
            let SelectedQuery = this.CustomerQueries.controls[index]
            this.CustomerQueries.removeAt(index);

            //After Delete any query Update Srno
            this.CustomerQueries.controls.forEach(q => {
              if (SelectedQuery.value.SrNo < q.get('SrNo').value) {
                q.patchValue({
                  SrNo: q.value.SrNo - 1
                })
              }
            })
          }

        }
      });

  }

  public QueryDetailsValidation() {
    this.QueryDetailsValidationError = []
    this.InsurerQueryAlerts = []
    this.CustomerQueryAlerts = []

    if (this.InsurerQueries.controls.length > 0) {
      this.InsurerQueries.controls.forEach((el, i) => {
        if (el.get('QueryDate').value === "" || el.get('QueryDate').value === null) {
          this.InsurerQueryAlerts.push({
            Message: `${el.value.SrNo}. Query Date is required (Insurance company).`,
            CanDismiss: false,
            AutoClose: false,
          })
        } else {
          if (el.get('Id').value <= 0 || el.get('Id').value == null) {
            if (moment(this._datePipe.transform(el.get('QueryDate').value, 'yyyy-MM-dd')).isSame(moment(this._datePipe.transform(this.currentDate, 'yyyy-MM-dd'))) == false) {
              this.InsurerQueryAlerts.push({
                Message: `${el.get('SrNo').value}.Query Date is not future and past Date(Insurance company).`,
                CanDismiss: false,
                AutoClose: false,
              })
            }
          }
        }


        if (el.get('NextFollowUpDate').value === "" || el.get('NextFollowUpDate').value === null) {
          // this.InsurerQueryAlerts.push({
          //   Message: `${el.value.SrNo}. Next Follow up Date is required (Insurance company).`,
          //   CanDismiss: false,
          //   AutoClose: false,
          // })
        } else {
          if (moment(el.get('NextFollowUpDate').value).isBefore(moment(el.get('QueryDate').value))) {
            this.InsurerQueryAlerts.push({
              Message: `${el.value.SrNo}. Next Follow up Date cannot be Before Query Date (Insurance company).`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }


      });
    }

    if (this.CustomerQueries.controls != undefined) {
      this.CustomerQueries.controls.forEach((el, i) => {
        if (el.get('QueryDate').value === "" || el.get('QueryDate').value === null) {
          this.CustomerQueryAlerts.push({
            Message: `${el.value.SrNo}. Reponse Date is required (Customer's Response).`,
            CanDismiss: false,
            AutoClose: false,
          })
        } else {

          if (el.get('Id').value <= 0 || el.get('Id').value == null) {
            if (moment(this._datePipe.transform(el.get('QueryDate').value, 'yyyy-MM-dd')).isSame(moment(this._datePipe.transform(this.currentDate, 'yyyy-MM-dd'))) == false) {
              this.InsurerQueryAlerts.push({
                Message: `${el.get('SrNo').value}.Reponse Date is not future and past Date(Customer's Response).`,
                CanDismiss: false,
                AutoClose: false,
              })
            }
          }
        }



        if (el.get('NextFollowUpDate').value === "" || el.get('NextFollowUpDate').value === null) {
          // this.CustomerQueryAlerts.push({
          //   Message: `${el.value.SrNo}. Next Follow up Date is required (Customer's Response).`,
          //   CanDismiss: false,
          //   AutoClose: false,
          // })
        } else {
          if (moment(el.get('NextFollowUpDate').value).isBefore(moment(el.get('QueryDate').value))) {
            this.CustomerQueryAlerts.push({
              Message: `${el.value.SrNo}. Next Follow up Date cannot be Before Reponse Date (Customer's Response).`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }
      });
    }

    if (this.LifeCOForm.get('LoadingPremium').value == 'true' || this.LifeCOForm.get('LoadingPremium').value == true) {
      if (!this.LifeCOForm.get('LoadingPremiumAmount').value) {
        this.QueryDetailsValidationError.push({
          Message: 'Enter Loading Premium Amount',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.LifeCOForm.get('IsReject').value == 'true' || this.LifeCOForm.get('IsReject').value == true) {
      if (!this.LifeCOForm.get('Rejectedfrom').value) {
        this.QueryDetailsValidationError.push({
          Message: 'Rejected By is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.LifeCOForm.get('SendBackRejectDesc').value == "" || this.LifeCOForm.get('SendBackRejectDesc').value == null) {
        this.QueryDetailsValidationError.push({
          Message: `Reject Reason is required.`,
          CanDismiss: false,
          AutoClose: false,
        })

      }
    }



    if (this.QueryDetailsValidationError.length > 0 || this.InsurerQueryAlerts.length > 0 || this.CustomerQueryAlerts.length > 0) {
      this.QueryDetailsStepCtrl.setErrors({ required: true });
      return this.QueryDetailsStepCtrl;
    }
    else {
      this.QueryDetailsStepCtrl.reset();
      return this.QueryDetailsStepCtrl;
    }
  }

  public RemoveQueryDetailsDocuments(index: number, QueryRaiseBy: string) {
    if (QueryRaiseBy == 'Insurer') {
      this.InsurerQueries.controls[index].patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      });
    }

    if (QueryRaiseBy == 'Customer') {
      this.CustomerQueries.controls[index].patchValue({
        FileName: null,
        StorageFileName: null,
        StorageFilePath: null
      });
    }
  }


  // Reject Button
  public RejectButton() {
    if (this.LifeCOForm.get('SendBackRejectDesc').value == "" || this.LifeCOForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.LifeCOForm.value.Id;
          SendBackRejectObj.Stage = this.LifeCOForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.LifeCOForm.value.SendBackRejectDesc;

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
    if (this.LifeCOForm.get('SendBackRejectDesc').value == "" || this.LifeCOForm.get('SendBackRejectDesc').value == null) {
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
          let Id = this.LifeCOForm.get('Id').value
          let SendBackRejectObj: ISendBackRejectDTO = new SendBackRejectDTO()
          SendBackRejectObj.Id = this.LifeCOForm.value.Id;
          SendBackRejectObj.Stage = this.LifeCOForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.LifeCOForm.value.SendBackRejectDesc;

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

  //#endregion public-methods

  //#region private-methods
  // -----------------------------------------------------------------------------------------------------
  // @ private methods
  // -----------------------------------------------------------------------------------------------------

  // Init Form
  private _initForm(data: ILifeCounterOfferDto) {
    let fg = this.fb.group({
      Id: [0],
      IsReject: [true],
      IsModify: [true],
      FinalStatus: [''],
      LoadingPremium: [true],
      ModificationDetails: [''],
      LoadingPremiumAmount: [0],
      InsurerQueries: this._buildQueriesForm(data.InsurerQueries),
      CustomerQueries: this._buildQueriesForm(data.CustomerQueries),
      Stage: [""],
      SendBackRejectDesc: [''],
      Additionalinformation: [''],
      Rejectedfrom: ['']
    })

    if (data) {
      fg.patchValue(data);
    }

    return fg;
  }

  // Queries Formarray
  private _buildQueriesForm(items: ILifeQueriesDto[] = []): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initQueriesForm(i));
        });
      }
    }
    return formArray;
  }

  // Init Queries Formgroup
  private _initQueriesForm(item: ILifeQueriesDto): FormGroup {

    let dF = this.fb.group({
      Id: [0],
      SrNo: [0],
      RFQId: [0],
      QueryRaiseBy: [''],
      QueryDate: [''],
      QueryDetails: [''],
      NextFollowUpDate: [''],
      ModeOfCommunication: [''],
      FileName: ['', [Validators.required, this.noWhitespaceValidator]],
      StorageFileName: [''],
      StorageFilePath: ['', [Validators.required, this.noWhitespaceValidator]],
      ImageUploadName: [''],
      ImageUploadPath: ['', [Validators.required, this.noWhitespaceValidator]],
      Stage: [''],
    })

    if (item != null) {
      if (!item) {
        item = new LifeQueriesDto();
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


  private _onFormChange() {
    this.LifeCOForm.get('LoadingPremium').valueChanges.subscribe((val) => {
      this.LifeCOForm.get('LoadingPremiumAmount').setValue(0);
    })

    this.LifeCOForm.get('IsModify').valueChanges.subscribe((val) => {
      if (val == 'false' || val == false) {
        this.LifeCOForm.get('ModificationDetails').setValue("")
      }
    });

    this.LifeCOForm.get('IsReject').valueChanges.subscribe((val) => {

      this.LifeCOForm.patchValue({
        IsModify: false,
        LoadingPremium: false,
        Rejectedfrom: ''

      })
    })
  }

  private _DateFormat() {
    this.InsurerQueries.controls.forEach((el) => {
      el.patchValue({
        QueryDate: this._datePipe.transform(el.value.QueryDate, 'yyyy-MM-dd'),
        NextFollowUpDate: this._datePipe.transform(el.value.NextFollowUpDate, 'yyyy-MM-dd')
      });
    });
    this.CustomerQueries.controls.forEach((el) => {
      el.patchValue({
        QueryDate: this._datePipe.transform(el.value.QueryDate, 'yyyy-MM-dd'),
        NextFollowUpDate: this._datePipe.transform(el.value.NextFollowUpDate, 'yyyy-MM-dd')
      });
    });
  }
  //#endregion private-methods


  /**
 * if Login user is same as rfq created user then,
 * can not editable InsurerQueries && FinalStatus
 * only add or change CustomerQueries
 */
  private _DisableFieldForCreaterUser() {
    this.LifeCOForm.get('InsurerQueries').disable({ emitEvent: false })
    this.LifeCOForm.get('FinalStatus').disable({ emitEvent: false })
    this.LifeCOForm.get('ModificationDetails').disable({ emitEvent: false })
    this.LifeCOForm.get('IsReject').disable({ emitEvent: false })
    this.LifeCOForm.get('Rejectedfrom').disable({ emitEvent: false })
    this.LifeCOForm.get('IsModify').disable({ emitEvent: false })
    this.LifeCOForm.get('LoadingPremium').disable({ emitEvent: false })
    this.LifeCOForm.get('LoadingPremiumAmount').disable({ emitEvent: false })
  }

  /**
   * otherwise
    * if Login user is not a  created user then,
    * can not editable CustomerQueries
    */
  private _DisableFieldForUWUser() {
    this.LifeCOForm.get('CustomerQueries').disable({ emitEvent: false });
  }

}
