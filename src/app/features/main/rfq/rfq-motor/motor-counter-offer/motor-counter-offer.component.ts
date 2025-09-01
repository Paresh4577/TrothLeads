import { DatePipe, Location } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { DialogService } from '@lib/services/dialog.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HttpService } from '@lib/services/http/http.service';
import { Alert } from '@models/common';
import { CounterOfferDto, ICounterOfferDto, IQueriesDto, QueriesDto } from '@models/dtos/config/RFQMotor';
import { environment } from 'src/environments/environment';
import { MotorSubCategoryCodeEnum } from 'src/app/shared/enums/rfq-motor';
import * as moment from 'moment';
import { AuthService } from '@services/auth/auth.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { RfqMotorService } from '../rfq-motor.service';
import { RfqService } from '../../rfq.service';
import { ISendBackRejectDTO, SendBackRejectDTO } from '@models/dtos/config/rfq-common';

@Component({
  selector: 'gnx-motor-counter-offer',
  templateUrl: './motor-counter-offer.component.html',
  styleUrls: ['./motor-counter-offer.component.scss'],
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
export class MotorCounterOfferComponent {

  @ViewChild('stepper') stepper: MatStepper;

  //APIs
  UploadFileAPI: string = API_ENDPOINTS.Attachment.Upload; // upload Doc. API

  //Variables
  pagetitle: string; // Page main header title
  GrossPremium: number = 0;
  mode: string;
  isExpand: boolean = false;

  currentDate = new Date()

  // Alert Array List
  InsurerQueryAlerts: Alert[] = []; // Insurer Query Details field error message
  CustomerQueryAlerts: Alert[] = []; // Customer Query Details field error message
  //ENUMs
  SubCategoryCodeEnum = MotorSubCategoryCodeEnum
  IsLoggedUserSameasRfqCreatedUser: boolean = false;
  IsAdmin: boolean = false;
  userProfileObj: IMyProfile // To store Logged User Details

  QueryDetailsValidationError: Alert[] = []
  QueryDetailsStepCtrl = new FormControl()

  //FormGroup 
  COForm !: FormGroup;
  DisplayForm: any;

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
    private cdr: ChangeDetectorRef,
    private _datePipe: DatePipe,
    private authService: AuthService,
    private _rfqLifeService: RfqService,
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
    this.mode = data['View'];

    this.COForm = this._initForm(this.DisplayForm);

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
            /**
             * if Login user is same as rfq created user then,
             * can not editable InsurerQueries && FinalStatus
             * only add or change CustomerQueries
             */
            this.IsLoggedUserSameasRfqCreatedUser = true;
            this.COForm.get('InsurerQueries').disable({ emitEvent: false })
            this.COForm.get('IsModify').disable({ emitEvent: false })
            this.COForm.get('IsReject').disable({ emitEvent: false })
            this.COForm.get('ModificationDetails').disable({ emitEvent: false })
          } else {
            /**
             * otherwise
              * if Login user is not a  created user then,
              * can not editable CustomerQueries
              */
            this.COForm.get('CustomerQueries').disable({ emitEvent: false });
            this.IsLoggedUserSameasRfqCreatedUser = false;
          }
        }
      }
    })

    this._onFormChange()
  }

  ngAfterViewInit(): void {

    this.stepper.next();
    this.stepper.next();

    this.cdr.detectChanges();

  }

  //#endregion lifecyclehooks

  //#region Getters
  get CustomerQueries() {
    return this.COForm.get('CustomerQueries') as FormArray
  }
  get InsurerQueries() {
    return this.COForm.get('InsurerQueries') as FormArray
  }

  //#endRegion Getters

  //#region Public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public stepOneValidation() {

  }

  public SubmitForm(IsSubmit: boolean) {

    // Check if Payment link is added or not (If not added raise Alert message)
    if (this.QueryDetailsValidationError.length > 0) {
      this._alertservice.raiseErrors(this.QueryDetailsValidationError)
      return
    }

    // date convert
    this._DateFormat();
    this.COForm.enable({ emitEvent: false })
    let COFormValue = this.COForm.value

    this._RfqMotorService.SubmitCounterOfferInfo(COFormValue, IsSubmit).subscribe((res) => {
      if (res.Success) {
        this._alertservice.raiseSuccessAlert(res.Message, "false")
        this._router.navigate([ROUTING_PATH.Basic.Dashboard])
      }
      else {

        //If Form Submit is fail Then APply Disable condition
        if (!this.IsAdmin) {
          if (this.userProfileObj.Id == this.DisplayForm.CreatedById) {
            this.COForm.get('InsurerQueries').disable({ emitEvent: false })
            this.COForm.get('FinalStatus').disable({ emitEvent: false })
            this.COForm.get('IsModify').disable({ emitEvent: false })
            this.COForm.get('IsReject').disable({ emitEvent: false })
            this.COForm.get('ModificationDetails').disable({ emitEvent: false })
          } else {
            this.COForm.get('CustomerQueries').disable({ emitEvent: false });
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


  // back button
  public backButton() {
    this._Location.back();
  }

  // Add new row in Insurer Query details array
  public addQueryDetails(QueryRaiseBy: string) {
    this.InsurerQueryAlerts = [];
    this.CustomerQueryAlerts = [];


    //#region Insurer
    if (QueryRaiseBy == "Insurer") {

      if (this.InsurerQueries.controls.length > 0) {
        this.InsurerQueries.controls.forEach((el, i) => {

          if (el.get('QueryDate').value === "" || el.get('QueryDate').value === null) {
            this.InsurerQueryAlerts.push({
              Message: `${i + 1}. Query Date is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          // if (el.get('Stage').value === "" || el.get('Stage').value === null) {
          //   this.InsurerQueryAlerts.push({
          //     Message: `${i + 1}. Stage is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('QueryDetails').value === "" || el.get('QueryDetails').value === null) {
          //   this.InsurerQueryAlerts.push({
          //     Message: `${i + 1}. Query Details is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('ModeOfCommunication').value === "" || el.get('ModeOfCommunication').value === null) {
          //   this.InsurerQueryAlerts.push({
          //     Message: `${i + 1}. Mode of Communication is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('NextFollowUpDate').value === "" || el.get('NextFollowUpDate').value === null) {
          //   this.InsurerQueryAlerts.push({
          //     Message: `${i + 1}. Next Follow up Date is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('FileName').value === "" || el.get('FileName').value === null) {
          //   this.InsurerQueryAlerts.push({
          //     Message: `${i + 1}. Attachment is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

        });
      }

      if (this.InsurerQueryAlerts.length > 0) {
        this._alertservice.raiseErrors(this.InsurerQueryAlerts);
        return;
      }
      else {
        var row: IQueriesDto = new QueriesDto()
        row.RFQId = this.COForm.get("Id").value;
        row.Stage = this.DisplayForm.Stage;
        row.QueryRaiseBy = "Insurer"
        this.InsurerQueries.insert(0, this._initQueriesForm(row));
      }
    }
    //#endregion Insurer

    //#region Customer
    if (QueryRaiseBy == "Customer") {


      if (this.CustomerQueries.controls != undefined) {
        this.CustomerQueries.controls.forEach((el, i) => {

          if (el.get('QueryDate').value === "" || el.get('QueryDate').value === null) {
            this.CustomerQueryAlerts.push({
              Message: `${i + 1}. Query Date is required.`,
              CanDismiss: false,
              AutoClose: false,
            })
          }

          // if (el.get('Stage').value === "" || el.get('Stage').value === null) {
          //   this.CustomerQueryAlerts.push({
          //     Message: `${i + 1}. Stage is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('QueryDetails').value === "" || el.get('QueryDetails').value === null) {
          //   this.CustomerQueryAlerts.push({
          //     Message: `${i + 1}. Query Details is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('ModeOfCommunication').value === "" || el.get('ModeOfCommunication').value === null) {
          //   this.CustomerQueryAlerts.push({
          //     Message: `${i + 1}. Mode of Communication is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('NextFollowUpDate').value === "" || el.get('NextFollowUpDate').value === null) {
          //   this.CustomerQueryAlerts.push({
          //     Message: `${i + 1}. Next Follow up Date is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

          // if (el.get('FileName').value === "" || el.get('FileName').value === null) {
          //   this.CustomerQueryAlerts.push({
          //     Message: `${i + 1}. Attachment is required.`,
          //     CanDismiss: false,
          //     AutoClose: false,
          //   })
          // }

        });
      }

      if (this.CustomerQueryAlerts.length > 0) {
        this._alertservice.raiseErrors(this.CustomerQueryAlerts);
        return;
      }
      else {
        var row: IQueriesDto = new QueriesDto()
        row.RFQId = this.COForm.get("Id").value;
        row.Stage = this.DisplayForm.Stage;
        row.QueryRaiseBy = "Customer"
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
            this.InsurerQueries.removeAt(index);
          }

          if (QueryRaiseBy == 'Customer') {
            this.CustomerQueries.removeAt(index);
          }

        }
      });

  }

  public QueryDetailsValidation() {
    this.QueryDetailsValidationError = []

    if (this.InsurerQueries.controls.length > 0) {
      this.InsurerQueries.controls.forEach((el, i) => {
        if (el.get('QueryDate').value === "" || el.get('QueryDate').value === null) {
          this.QueryDetailsValidationError.push({
            Message: `${i + 1}. Query Date is required (Insurance company).`,
            CanDismiss: false,
            AutoClose: false,
          })
        } else {
          if (this.currentDate < el.get('QueryDate').value) {
            this.QueryDetailsValidationError.push({
              Message: `${i + 1}. Query Date is not future Date (Insurance company).`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }

        // if (el.get('Stage').value === "" || el.get('Stage').value === null) {
        //   this.QueryDetailsValidationError.push({
        //     Message: `${i + 1}. Stage is required (Insurance company).`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (el.get('QueryDetails').value === "" || el.get('QueryDetails').value === null) {
        //   this.QueryDetailsValidationError.push({
        //     Message: `${i + 1}. Query Details is required (Insurance company).`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (el.get('ModeOfCommunication').value === "" || el.get('ModeOfCommunication').value === null) {
        //   this.QueryDetailsValidationError.push({
        //     Message: `${i + 1}. Mode of Communication is required (Insurance company).`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        if (el.get('NextFollowUpDate').value === "" || el.get('NextFollowUpDate').value === null) {
          // this.QueryDetailsValidationError.push({
          //   Message: `${i + 1}. Next Follow up Date is required (Insurance company).`,
          //   CanDismiss: false,
          //   AutoClose: false,
          // })
        } else {
          if (moment(el.get('NextFollowUpDate').value).isBefore(moment(el.get('QueryDate').value))) {
            this.QueryDetailsValidationError.push({
              Message: `${i + 1}. Next Follow up Date cannot be Before Query Date (Insurance company).`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }

        // if (el.get('FileName').value === "" || el.get('FileName').value === null) {
        //   this.QueryDetailsValidationError.push({
        //     Message: `${i + 1}. Attachment is required (Insurance company).`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

      });
    }

    if (this.CustomerQueries.controls != undefined) {
      this.CustomerQueries.controls.forEach((el, i) => {
        if (el.get('QueryDate').value === "" || el.get('QueryDate').value === null) {
          this.QueryDetailsValidationError.push({
            Message: `${i + 1}. Query Date is required (Customer's Response).`,
            CanDismiss: false,
            AutoClose: false,
          })
        } else {
          if (this.currentDate < el.get('QueryDate').value) {
            this.QueryDetailsValidationError.push({
              Message: `${i + 1}. Query Date is not future Date (Customer's Response).`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }

        // if (el.get('Stage').value === "" || el.get('Stage').value === null) {
        //   this.QueryDetailsValidationError.push({
        //     Message: `${i + 1}. Stage is required (Customer's Response).`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (el.get('QueryDetails').value === "" || el.get('QueryDetails').value === null) {
        //   this.QueryDetailsValidationError.push({
        //     Message: `${i + 1}. Query Details is required (Customer's Response).`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        // if (el.get('ModeOfCommunication').value === "" || el.get('ModeOfCommunication').value === null) {
        //   this.QueryDetailsValidationError.push({
        //     Message: `${i + 1}. Mode of Communication is required (Customer's Response).`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

        if (el.get('NextFollowUpDate').value === "" || el.get('NextFollowUpDate').value === null) {
          // this.QueryDetailsValidationError.push({
          //   Message: `${i + 1}. Next Follow up Date is required (Customer's Response).`,
          //   CanDismiss: false,
          //   AutoClose: false,
          // })
        } else {
          if (moment(el.get('NextFollowUpDate').value).isBefore(moment(el.get('QueryDate').value))) {
            this.QueryDetailsValidationError.push({
              Message: `${i + 1}. Next Follow up Date cannot be Before Query Date (Customer's Response).`,
              CanDismiss: false,
              AutoClose: false,
            })
          }
        }

        // if (el.get('FileName').value === "" || el.get('FileName').value === null) {
        //   this.QueryDetailsValidationError.push({
        //     Message: `${i + 1}. Attachment is required (Customer's Response).`,
        //     CanDismiss: false,
        //     AutoClose: false,
        //   })
        // }

      });
    }
    // if (this.COForm.get('FinalStatus').value != "Reject" && this.COForm.get('FinalStatus').value != "Modify") {
    //   this.QueryDetailsValidationError.push({
    //     Message: 'Select Final Status',
    //     CanDismiss: false,
    //     AutoClose: false,
    //   })
    // }

    if (this.COForm.get('LoadingPremium').value == 'true' || this.COForm.get('LoadingPremium').value == true) {
      if (!this.COForm.get('LoadingPremiumAmount').value) {
        this.QueryDetailsValidationError.push({
          Message: 'Enter Loading Premium Amount',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    if (this.QueryDetailsValidationError.length > 0) {
      this.QueryDetailsStepCtrl.setErrors({ required: true });
      return this.QueryDetailsStepCtrl;
    }
    else {
      this.QueryDetailsStepCtrl.reset();
      return this.QueryDetailsStepCtrl;
    }
  }


  public ExpandCollaps() {
    this.isExpand = !this.isExpand
  }

  // SendBack Button
  public SendBackButton() {
    if (this.COForm.get('SendBackRejectDesc').value == "" || this.COForm.get('SendBackRejectDesc').value == null) {
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
          let Id = this.COForm.get('Id').value
          let SendBackRejectObj: ISendBackRejectDTO = new SendBackRejectDTO()
          SendBackRejectObj.Id = this.COForm.value.Id;
          SendBackRejectObj.Stage = this.COForm.value.Stage;
          SendBackRejectObj.SendBackRejectDesc = this.COForm.value.SendBackRejectDesc;

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

  // date format
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

  private _initForm(data: ICounterOfferDto,) {

    let fg = this.fb.group({
      Id: [0],
      FinalStatus: [''],
      IsReject: [false],
      IsModify: [false],
      LoadingPremium: [true],
      ModificationDetails: [''],
      LoadingPremiumAmount: [0],
      InsurerQueries: this._buildQueriesForm(data?.InsurerQueries),
      CustomerQueries: this._buildQueriesForm(data?.CustomerQueries),
      Stage: [''],
      SendBackRejectDesc: [''],
    })

    if (data != null) {
      fg.patchValue(data);
    }

    return fg;
  }

  // Documents Formarray
  private _buildQueriesForm(items: IQueriesDto[] = []): FormArray {
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

  // Init Documents Formgroup
  private _initQueriesForm(item: IQueriesDto): FormGroup {

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
      ImageUploadPath: [''],
      Stage: [''],
    })

    if (item != null) {
      if (!item) {
        item = new QueriesDto();
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
    this.COForm.get('LoadingPremium').valueChanges.subscribe(val => {
      this.COForm.get('LoadingPremiumAmount').setValue(0)
    })


    this.COForm.get('IsModify').valueChanges.subscribe((val) => {
      if (val == 'false' || val == false) {
        this.COForm.get('ModificationDetails').setValue("")
      }
    });

    this.COForm.get('IsReject').valueChanges.subscribe((val) => {

      this.COForm.patchValue({
        IsModify: false,
        LoadingPremium: false

      })

    });

  }
  //#endregion private-methods
}
