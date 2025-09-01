import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router, ActivatedRoute } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { TravelCategoryType } from '@config/rfq';
import { ROUTING_PATH } from '@config/routingPath.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { MasterListService } from '@lib/services/master-list.service';
import { Alert } from '@models/common';
import { AuthService } from '@services/auth/auth.service';
import { RfqTravelService } from '../rfq-travel-service';
import { environment } from 'src/environments/environment';
import { dropdown } from '@config/dropdown.config';
import { ITravelQueriesDto, TravelQueriesDto, } from '@models/dtos';
import * as moment from 'moment';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { RFQRejectedByList } from '@config/rfq';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';

@Component({
  selector: 'gnx-travel-counter-offer',
  templateUrl: './travel-counter-offer.component.html',
  styleUrls: ['./travel-counter-offer.component.scss'],
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
export class TravelCounterOfferComponent {

  @ViewChild('stepper') stepper: MatStepper;

  // Variables
  pagetitle: string = '';
  mode: string = '';
  isExpand: boolean = false;
  IsPOSPUser: boolean = false;
  currentDate = new Date();
  GrossPremium: number = 0;
  IsAdmin: boolean = false;
  IsLoggedUserSameasRfqCreatedUser: boolean = false;
  userProfileObj: IMyProfile // To store Logged User Details
  ProposerName: string;
  SubCategoryList: any[] = [];
  DropdownMaster: dropdown;

  //APIs
  UploadFileAPI: string = API_ENDPOINTS.Attachment.Upload; // upload Doc. API

  QueryDetailsValidationError: Alert[] = []
  InsurerQueryAlerts: Alert[] = []; // Insurer Query Details field error message
  CustomerQueryAlerts: Alert[] = []; // Customer Query Details field error message

  QueryDetailsStepCtrl = new FormControl()

  DisplayForm: any;

  // FormGroup 
  CounterOfferForm: FormGroup;


  //#region Constructor
  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public dialog: MatDialog,
    public _router: Router,
    private _route: ActivatedRoute,
    private _dataService: HttpService,
    private _MasterListService: MasterListService,
    private _datePipe: DatePipe,
    private authService: AuthService,
    private _dialogService: DialogService,
    private _RFQTravelService: RfqTravelService,
    private _cdr: ChangeDetectorRef,
    private _Location: Location,
  ) {
    this.DropdownMaster = new dropdown();
  }
  //#endregion constructor

  // #region Getters

  // get travel category type
  get TravelCategoryType() {
    return TravelCategoryType;
  }

  // Customer Queries
  get CustomerQueries() {
    return this.CounterOfferForm.get('CustomerQueries') as FormArray;
  }

  // Insurer Queries
  get InsurerQueries() {
    return this.CounterOfferForm.get('InsurerQueries') as FormArray;
  }

  get RFQRejectedByList() {
    return RFQRejectedByList
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

    if (this.DisplayForm.QNDocuments.length > 0) {
      this.DisplayForm.QNDocuments.forEach((el) => {
        if (el.Buy == true) {
          this.GrossPremium = el.GrossPremium;
        }
      });
    }

    // build travel form
    this.CounterOfferForm = this._buildForm(this.DisplayForm);

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

    // get User type from user profile
    if (this.authService._userProfile.value?.UserType == "Agent") {
      this.IsPOSPUser = true;
    }
    else {
      this.IsPOSPUser = false;
    }


    this._onFormChange()
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
    if (this.CounterOfferForm.get('SendBackRejectDesc').value == "" || this.CounterOfferForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.CounterOfferForm.value.Id;
          SendBackRejectObj.Stage = this.CounterOfferForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.CounterOfferForm.value.SendBackRejectDesc;

          this._RFQTravelService.Reject(SendBackRejectObj).subscribe((res) => {
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
    if (this.CounterOfferForm.get('SendBackRejectDesc').value == "" || this.CounterOfferForm.get('SendBackRejectDesc').value == null) {
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
          SendBackRejectObj.Id = this.CounterOfferForm.value.Id;
          SendBackRejectObj.Stage = this.CounterOfferForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.CounterOfferForm.value.SendBackRejectDesc;

          this._RFQTravelService.SendBack(SendBackRejectObj).subscribe((res) => {
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
  public SubmitForm(IsSubmit: boolean) {

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

    this.CounterOfferForm.enable({ emitEvent: false })

    // date convert
    this._DateFormat();

    this._RFQTravelService.SubmitCounterOfferInfo(this.CounterOfferForm.value, IsSubmit).subscribe((res) => {
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

  public ExpandCollaps() {
    this.isExpand = !this.isExpand;
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
        var row: ITravelQueriesDto = new TravelQueriesDto()
        row.RFQId = this.CounterOfferForm.get("Id").value;
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
        var row: ITravelQueriesDto = new TravelQueriesDto()
        row.RFQId = this.CounterOfferForm.get("Id").value;
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
            this.InsurerQueries.controls.forEach(q => {
              if (SelectedQuery.value.SrNo < q.get('SrNo').value) {
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
            Message: `${el.value.SrNo}. Query Date is required (Customer's Response).`,
            CanDismiss: false,
            AutoClose: false,
          })
        } else {
          if (el.get('Id').value <= 0 || el.get('Id').value == null) {
            if (moment(this._datePipe.transform(el.get('QueryDate').value, 'yyyy-MM-dd')).isSame(moment(this._datePipe.transform(this.currentDate, 'yyyy-MM-dd'))) == false) {
              this.InsurerQueryAlerts.push({
                Message: `${el.get('SrNo').value}.Query Date is not future and past Date(Customer's Response).`,
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
              Message: `${el.value.SrNo}. Next Follow up Date cannot be Before Query Date (Customer's Response).`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }
      });
    }

    if (this.CounterOfferForm.get('LoadingPremium').value == 'true' || this.CounterOfferForm.get('LoadingPremium').value == true) {
      if (!this.CounterOfferForm.get('LoadingPremiumAmount').value) {
        this.QueryDetailsValidationError.push({
          Message: 'Enter Loading Premium Amount',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.CounterOfferForm.get('IsReject').value == 'true' || this.CounterOfferForm.get('IsReject').value == true) {
      if (!this.CounterOfferForm.get('Rejectedfrom').value) {
        this.QueryDetailsValidationError.push({
          Message: 'Rejected By is required.',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      if (this.CounterOfferForm.get('SendBackRejectDesc').value == "" || this.CounterOfferForm.get('SendBackRejectDesc').value == null) {
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
  private _buildQueriesForm(items: ITravelQueriesDto[] = []): FormArray {
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
  private _initQueriesForm(item: ITravelQueriesDto): FormGroup {

    let dF = this.fb.group({
      Id: [0],
      SrNo: [0],
      RFQId: [0],
      QueryRaiseBy: [''],
      QueryDate: [''],
      QueryDetails: [''],
      NextFollowUpDate: [''],
      ModeOfCommunication: [''],
      FileName: ['', [Validators.required]],
      StorageFileName: [''],
      StorageFilePath: ['', [Validators.required]],
      ImageUploadName: [''],
      ImageUploadPath: ['', [Validators.required]],
      Stage: [''],
    })

    if (item != null) {
      if (!item) {
        item = new TravelQueriesDto();
      }
      if (item) {
        dF.patchValue(item);
      }
    }

    return dF
  }

  private _onFormChange() {
    this.CounterOfferForm.get('LoadingPremium').valueChanges.subscribe((val) => {
      this.CounterOfferForm.get('LoadingPremiumAmount').setValue(0);
    })

    this.CounterOfferForm.get('IsModify').valueChanges.subscribe((val) => {
      if (val == 'false' || val == false) {
        this.CounterOfferForm.get('ModificationDetails').setValue("")
      }
    });

    this.CounterOfferForm.get('IsReject').valueChanges.subscribe((val) => {

      this.CounterOfferForm.patchValue({
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


  /**
   * if Login user is same as rfq created user then,
   * can not editable InsurerQueries && FinalStatus
   * only add or change CustomerQueries
   */
  private _DisableFieldForCreaterUser() {
    this.CounterOfferForm.get('InsurerQueries').disable({ emitEvent: false })
    this.CounterOfferForm.get('FinalStatus').disable({ emitEvent: false })
    this.CounterOfferForm.get('ModificationDetails').disable({ emitEvent: false })
    this.CounterOfferForm.get('IsReject').disable({ emitEvent: false })
    this.CounterOfferForm.get('Rejectedfrom').disable({ emitEvent: false })
    this.CounterOfferForm.get('IsModify').disable({ emitEvent: false })
    this.CounterOfferForm.get('LoadingPremium').disable({ emitEvent: false })
    this.CounterOfferForm.get('LoadingPremiumAmount').disable({ emitEvent: false })
  }

  /**
   * otherwise
    * if Login user is not a  created user then,
    * can not editable CustomerQueries
    */
  private _DisableFieldForUWUser() {
    this.CounterOfferForm.get('CustomerQueries').disable({ emitEvent: false });
  }

  //#endregion private-methods

}
