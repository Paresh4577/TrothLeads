import { Component } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert } from '@models/common';
import { MasterListService } from '@lib/services/master-list.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ICityPincodeDto } from '@models/dtos/core/CityDto';
import { Observable } from 'rxjs/internal/Observable';
import { Subject, of, switchMap, takeUntil } from 'rxjs';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { BuyHdfcDto, IBuyHdfcDto } from '@models/dtos/config/Hdfc/BuyHdfcDto';
import { HdfcService } from './hdfc.service';
import { MatStepper } from '@angular/material/stepper';
import { HDFCKYCDto, IHDFCKYCDto } from '@models/dtos/config/Kyc/HDFC/hdfc-kyc-dto';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { QuoteService } from '../../quote.service';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';
import { ROUTING_PATH } from '@config/routingPath.config';
import { IHDFCQuestionDto, MemberLifeStyleDto, MemberPEDDto, PolicyMemberHdfcDto } from '@models/dtos/config/Hdfc';
import { UnitConversion } from '@config/UnitConversion';
import { ValidationRegex } from '@config/validationRegex.config';
import { DialogService } from '@lib/services/dialog.service';
import { HDFCCISDocumentPopupComponent } from '@lib/ui/components/hdfc-cis-document-popup/hdfc-cis-document-popup.component';

@Component({
  selector: 'gnx-hdfcergo',
  templateUrl: './hdfcergo.component.html',
  styleUrls: ['./hdfcergo.component.scss'],
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
export class HdfcergoComponent {
  // #region public variables

  //String
  pagetitle: string = 'HDFC Health';
  imgsrc = '/assets//images/avatars/upload.png';
  PolicyType: string
  HealthQuateForm: any;
  logo: string
  Insurer: string;
  maxBirthDate: Date;
  maxDateMedicalHistory: Date

  // for HDFC Payment Parameters
  PaymentTransactionNo: string;
  PaymentAmount: number;
  AppID: string;
  SubscriptionID: string;
  SuccessUrl: string;
  FailureUrl: string;
  Checksum: string;
  _ProposalNo: string;
  isCreatedProposal: boolean = false;
  //boolean
  IsKYC: boolean = false
  notAdult: boolean


  //Number
  InsuredPeople: number;
  ReqSumInsured: number;
  SelectedMemberIndex: number;
  flag: number = 0

  //Formgroup & DTO
  Policies: any;
  ProductName: string
  BuyHdfcForm: FormGroup;
  policyDetailsForm: FormGroup;
  BuyNow: IBuyHdfcDto;
  pincodes$: Observable<ICityPincodeDto[]>;
  IllnessList: IHDFCQuestionDto[];

  DropdownMaster: dropdown;
  Conversion: UnitConversion;
  cityAPI = API_ENDPOINTS.City.Base;

  //Array
  alerts: Alert[] = []
  GenderList: any[];
  RelationList: any[];
  NomineeRelationList: any[];
  OccupationList: any[];
  MaritalList: any[];
  PersonalHabitList
  CurrentStatusList
  LineOfManagementList
  PersonalHabitDataList
  member: any[];
  BankList: any[];

  destroy$: Subject<any>;
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  phoneNum: RegExp = ValidationRegex.phoneNumReg;
  memberDetailsAsArray;

  //FormControl
  step1 = new FormControl()
  firstFlag = 1  //check if data of buynow , member & health form is not empty
  insurerFlag = 1 //check if name of the insurer is hdfc or not
  // #endregion public variables

  /**
   * #region constructor
   * @param fb : Formbuilder
   * @param _router: module for routing
   * @param _route: used to get current route
   */

  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    private _HdfcService: HdfcService,
    public dialog: MatDialog,
    private _router: Router,
    private _quoteService: QuoteService,
    private _route: ActivatedRoute,
    private _datePipe: DatePipe,
    private _MasterListService: MasterListService,
    private _dialogService: DialogService,
  ) {
    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();
    this.Conversion = new UnitConversion();
    this.maxDateMedicalHistory = new Date(Date.now());
    this.maxBirthDate = new Date(Date.now());
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);
    this.SelectedMemberIndex = 0;

    /**
     * if any one of HealthQuateForm , buynow , member is not stored in localstorage than return back to Health form 
     */
    if (!localStorage.getItem('member') || !localStorage.getItem('buynow') || !localStorage.getItem('HealthQuateForm')) {
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.Health])
      this.firstFlag = 0
      return;
    } else {
      // if name of the insurer in buynow is not hdfc than return plan list to choose a plan
      let Insurer = JSON.parse(localStorage.getItem('buynow'))
      if (Insurer.Insurer.toLowerCase() != InsuranceCompanyName.HdfcErgo) {
        if (window.location.href.indexOf('mediclaim') != -1) {
          this._router.navigate([ROUTING_PATH.QuoteMediclaim.List]);
        }
        else {
          this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.List]);
        }
        this.insurerFlag = 0
        return
      }
    }

    if (localStorage.getItem('member')) {
      this.member = JSON.parse(localStorage.getItem('member'));
      this.InsuredPeople = this.member.length;
    }
    // Icon of the company and poilcy details
    if (localStorage.getItem('buynow')) {
      this.Policies = JSON.parse(localStorage.getItem('buynow'));
      this.logo = this.Policies.IconURL;
      this.Insurer = this.Policies.Insurer;
      if (this.Policies.PolicyType == 'MultiIndividual') {
        this.PolicyType = 'Individual';
      } else if (this.Policies.PolicyType == 'FamilyFloater') {
        this.PolicyType = 'Family Floater';
      } else {
        this.PolicyType = this.Policies.PolicyType;
      }
      this.ProductName = this.Policies.ProductName;

      // Illness list from service
      this.IllnessList = this._HdfcService.getIllness()

    }
  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this.BuyNow = new BuyHdfcDto();

    // this.onChange();
    this.BuyHdfcForm = this._buildBuyHdfcForm(this.BuyNow);
    this.BuyNow.PolicyMemberDetails = new Array<PolicyMemberHdfcDto>();

    if (this.firstFlag && this.insurerFlag) {

      this._fillMasterList();
      this._onFormChanges();
      this.memberDetailsAsArray = this.BuyHdfcForm.get(
        'PolicyMemberDetails'
      ) as FormArray;

      this.HealthQuateForm = JSON.parse(localStorage.getItem('HealthQuateForm'));
      this.setValue();
      this.onPolicy();
      this._addMemberDetails();
      this._membersDetails();
      this._isAdult();
      this._AddOns()
      this._changeValue();

      // when KYC is done via Redirect URL and kyc_id is obtained than fill the PolicyHolder details from data stored in loacl storage
      // let the user enter pan card number 
      let data = this._route.snapshot.queryParams;
      if (data && data['kyc_id']) {

        if (localStorage.getItem('HDFCpolicyHolder')) {
          this.BuyHdfcForm.get('PolicyHolder').patchValue(JSON.parse(localStorage.getItem('HDFCpolicyHolder')));
          this.BuyHdfcForm.get('PolicyHolder').patchValue({
            KYCId: data['kyc_id'],
            PANNo: ''
          })
          this.flag = 0
          // this.StepThreeError(MatStepper,this.flag)
        }
      }
    }

  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  //#endregion lifecyclehooks
  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------
  get f() {
    return this.BuyHdfcForm.controls;
  }
  get inf() {
    return this.BuyHdfcForm.get('PolicyMemberDetails') as FormArray;
  }
  get f1() {
    return this.policyDetailsForm.controls;
  }

  // Policy Details
  /**
   * patching values of Policy details from this.Policies
   */
  public onPolicy() {
    if (this.Policies != null) {
      this.BuyHdfcForm.get('PolicyDetail').patchValue({
        ProductName: this.Policies.ProductName,
        SubProductName: this.Policies.SubProductName,
        Productcode: this.Policies.ProductCode,
        SubProductCode: this.Policies.SubProductCode,
        SumInsured: this.Policies.SumInsured,
        PolicyPeriod: this.Policies.PolicyPeriod,
        PolicyType: this.Policies.PolicyType
      })
      this.BuyHdfcForm.patchValue({ TransactionNo: this.Policies.QuoteNo })
    }
  }

  // pop up for pincode
  public openDiologPincode(type: string, title: string, MemberIndex: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";
    this.SelectedMemberIndex = MemberIndex;
    dialogConfig.data = {
      type: type,
      title: title,
      MemberIndex: MemberIndex,
      ispopup: true,
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'Pincode') {
          this.BuyHdfcForm.get('PolicyHolder').patchValue({
            PinCode: result.PinCode,
          });
        }
      }
    });
  }

  // Pincode autocomplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.BuyHdfcForm.get('PolicyHolder').patchValue({
      City: event.option.value.CityName,
      PinCode: event.option.value.PinCode,
    });
    this.BuyHdfcForm.get('PolicyHolder.PinCode').patchValue(
      event.option.value.PinCode
    );
  }

  // back Button 
  public backClick() {
    if (window.location.href.indexOf('mediclaim') != -1) {
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.AddOns]);
    }
    else {
      this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.AddOns]);
    }
  }

  // clear pincode
  public clear(name: string): void {
    this.BuyHdfcForm.get(name).setValue("")
    if (name == 'PolicyHolder.PinCode') {
      // this.BuyHdfcForm.get('PolicyHolder.City').setValue("");
    }
  }

  // check step two for valid data
  public stepTwoValidate() {
    this.alerts = [];
    this.member.forEach((ele, index) => {

      let SelectMember = 0
      if (ele.title == 'Self' || ele.title == 'Spouse') {
        SelectMember = 1
      }
      else {
        SelectMember = 0
      }


      if (this.inf.controls[index].get('FirstName').invalid) {
        this.alerts.push({
          Message: `Enter ${ele.title} First Name`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].get('LastName').invalid) {
        this.alerts.push({
          Message: `Enter ${ele.title} Last Name`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.DOB == '' || this.inf.controls[index].value.DOB == null) {
        this.alerts.push({
          Message: `Enter ${ele.title} DOB`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.DOB != '') {
        if (this.inf.controls[index].value.DOB > this.maxBirthDate) {
          this.alerts.push({
            Message: `Enter valid ${ele.title} DOB`,
            CanDismiss: false,
            AutoClose: false,
          });
        }

      }

      if (this.inf.controls[index].value.Gender == '0') {
        this.alerts.push({
          Message: `Enter ${ele.title} Gender`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.inf.controls[index].value.HeightInFeet <= 0) {
        this.alerts.push({
          Message: `Enter ${ele.title} Height in Feet`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.inf.controls[index].value.HeightInInch < 0 || this.inf.controls[index].value.HeightInInch == null || this.inf.controls[index].value.HeightInInch == '') {
        this.alerts.push({
          Message: `Enter ${ele.title} Height in Inch`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.inf.controls[index].value.WeightKG == 0) {
        this.alerts.push({
          Message: `Enter ${ele.title} Weight in KG`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.inf.controls[index].value.Occupation == '' && SelectMember == 1) {
        this.alerts.push({
          Message: `Enter ${ele.title} Occupation`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.inf.controls[index].value.GrossMonthlyIncome == 0 && SelectMember == 1) {

        if (this.inf.controls[index].value.Occupation != 'Housewife' && SelectMember == 1) {
          this.alerts.push({
            Message: `Enter ${ele.title} Gross Monthly Income`,
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }

      if (this.inf.controls[index].value.Marital == 0) {
        this.alerts.push({
          Message: `Enter ${ele.title} Marital`,
          CanDismiss: false,
          AutoClose: false,
        });
      }

      ((this.inf.controls[index].get('MemberPED')) as FormArray).controls.forEach((element, ind) => {
        if (element.get('Boolean').value == null) {
          this.alerts.push({
            Message: `${ele.title} - Select option for Question ${ind + 1} (Medical History)`,
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (element.get('Boolean').value == true) {
          this.IllnessList[ind].QuestionArray.forEach((Question, eleIndix) => {
            if (element.get(Question.text).value == null) {
              if (Question.type == 'text' || Question.type == 'date') {
                this.alerts.push({
                  Message: `${ele.title} - Enter ${Question.label} for Question ${ind + 1}`,
                  CanDismiss: false,
                  AutoClose: false,
                });
              }

              if (Question.type == 'dropdown') {
                this.alerts.push({
                  Message: `${ele.title} - Select ${Question.label} for Question ${ind + 1}`,
                  CanDismiss: false,
                  AutoClose: false,
                });
              }
              if (Question.type == 'boolean') {
                this.alerts.push({
                  Message: `${ele.title} - Select ${Question.label} for Question ${ind + 1}`,
                  CanDismiss: false,
                  AutoClose: false,
                });
              }
            }
          })
        }
      });

      ((this.inf.controls[index].get('MemberLifeStyle')) as FormArray).controls.forEach((elem, inde) => {
        if (elem.get('Insured_LifeStyleHabit').value == null) {
          this.alerts.push({
            Message: `${ele.title} - Select option for Question ${inde + 1} (Life Style)`,
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (elem.get('Insured_LifeStyleHabit').value != null && elem.get('Insured_LifeStyleHabit').value != '') {
          this.PersonalHabitDataList.forEach((Quantity, QIndex) => {
            if (elem.get(Quantity.name).value == '') {
              this.alerts.push({
                Message: `${ele.title} - Enter ${Quantity.label} for Question ${inde + 1} (Life Style)`,
                CanDismiss: false,
                AutoClose: false,
              });
            }
          })
        }
      })

    });

  }

  public OpenDocumentConfirmDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.minWidth = "60vw";
    dialogConfig.minHeight = "55vh";
    dialogConfig.maxHeight = "75vh";

    dialogConfig.data = {
      Category: "Health",
      type: "CISDocument",
      title: "CIS Document",
      ispopup: true,
      Insurer: "HDFCErgo",
      TransactionNo: this.BuyHdfcForm.get('TransactionNo').value,
      Productcode: this.BuyHdfcForm.get('PolicyDetail.Productcode').value,
      ProposalNo: this._ProposalNo
    };

    const dialogRef = this.dialog.open(HDFCCISDocumentPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.ProceedToPay();
      }
    });
  }

  // create proposal
  public CreateProposal() {

    // check if the form is validated or not (If not return altert message .)
    this.stepTwoValidate()
    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
      return;
    }

    // after form is validated
    this._settingDefaultValueForMDEF();

    // in MemberPED array , data of the questions that are selected 'Yes' will be added for submission .
    // And similarly in MemberLifeStyle array, the habits that are selected 'Yes' will be added for submission.
    // Firstly the data of MemberPED & MemberLifeStyle array are stored in temperary array tempPED & tempLifeStyle respectively and than 
    // they are emptied . After that data of questions that are selected 'Yes' are pushed into MemberPED & MemberLifeStyle respectively.
    let formData = this.BuyHdfcForm.value
    formData.PolicyMemberDetails.forEach((ele, index) => {
      let tempPED = ele.MemberPED
      let tempLifeStyle = ele.MemberLifeStyle
      ele.MemberLifeStyle = []
      ele.MemberPED = []
      tempPED.forEach((sub) => {
        if (sub.Boolean) {
          ele.MemberPED.push(sub)
        }
      })

      tempLifeStyle.forEach((life) => {
        if (life.Insured_LifeStyleHabit) {
          ele.MemberLifeStyle.push(life)
        }
      })
    })

    // check duplicate create proposal or not
    if (!this.isCreatedProposal) {
      // after the proposal is created successfully , the payment portol is opened by posting the form data
      this._HdfcService.CreateProposal(formData).subscribe(res => {
        if (res.Success) {
          localStorage.removeItem('HDFCpolicyHolder')

          this._alertservice.raiseSuccessAlert(res.Message);
          this.isCreatedProposal = true;
          this._ProposalNo = res.Data.ProposalNumber;
          this.PaymentTransactionNo = res.Data.PaymentTransactionNo;
          this.PaymentAmount = res.Data.PaymentAmount;
          this.AppID = res.Data.AppID;
          this.SubscriptionID = res.Data.SubscriptionID;
          this.SuccessUrl = res.Data.SuccessUrl;
          this.FailureUrl = res.Data.FailureUrl;
          this.Checksum = res.Data.Checksum;
          this.OpenDocumentConfirmDialog();

        }
        else {
          if (res.Alerts && res.Alerts.length > 0) {
            this._alertservice.raiseErrors(res.Alerts);
          }
          else {
            this._alertservice.raiseErrorAlert(res.Message);
          }
        }

      })
    }
    else {
      if (this.isCreatedProposal) {
        this.OpenDocumentConfirmDialog();
      }
    }

  }

  // proceed to payment portol
  public ProceedToPay() {

    this._quoteService.openWindowWithPost(environment.hdfcPayment, {
      Trnsno: this.PaymentTransactionNo,
      Amt: this.PaymentAmount.toFixed(2),
      Appid: this.AppID,
      Subid: this.SubscriptionID,
      Surl: this.SuccessUrl,
      Furl: this.FailureUrl,
      Src: 'POST',
      Chksum: this.Checksum,
    })
  }

  // check step one for valid data
  public StepOneSubmit(stepper): any {
    this.alerts = [];

    if (this.BuyHdfcForm.get('PolicyHolder.FirstName').invalid) {
      this.alerts.push({
        Message: 'Enter your First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.LastName').invalid) {
      this.alerts.push({
        Message: 'Enter your Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }


    // gender required
    if (this.BuyHdfcForm.get('PolicyHolder.Gender').value == '' || this.BuyHdfcForm.get('PolicyHolder.Gender').value == '0') {
      this.alerts.push({
        Message: 'Select your Gender',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.Marital').value == '' || this.BuyHdfcForm.get('PolicyHolder.Marital').value == '0') {
      this.alerts.push({
        Message: 'Select Marital Status',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.DOB').value == '' || this.BuyHdfcForm.get('PolicyHolder.DOB').value == null) {
      this.alerts.push({
        Message: 'Enter Your Date of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.DOB').value != '') {
      if (this.BuyHdfcForm.get('PolicyHolder.DOB').value > this.maxBirthDate) {
        this.alerts.push({
          Message: 'Enter Valid Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }

    }

    if (this.BuyHdfcForm.get('PolicyHolder.NomineeFirstName').invalid) {
      this.alerts.push({
        Message: 'Enter Nominee First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.NomineeLastName').invalid) {
      this.alerts.push({
        Message: 'Enter Nominee Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.NomineeRelation').value == '' || this.BuyHdfcForm.get('PolicyHolder.NomineeRelation').value == '0') {
      this.alerts.push({
        Message: 'Select Nominee Relation',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.NomineeAddress').invalid) {
      this.alerts.push({
        Message: 'Enter Nominee Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.NomineeAge').value == null || this.BuyHdfcForm.get('PolicyHolder.NomineeAge').value == 0) {
      this.alerts.push({
        Message: 'Enter Nominee Age',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.NomineeAge').value < 18 && this.BuyHdfcForm.get('PolicyHolder.NomineeAge').value != null) {
      if (this.BuyHdfcForm.get('PolicyHolder.AppointeeFirstName').invalid) {
        this.alerts.push({
          Message: 'Enter Appointee First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.BuyHdfcForm.get('PolicyHolder.AppointeeLastName').invalid) {
        this.alerts.push({
          Message: 'Enter Appointee Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.BuyHdfcForm.get('PolicyHolder.AppointeeRelation').value == '' || this.BuyHdfcForm.get('PolicyHolder.AppointeeRelation').value == '0') {
        this.alerts.push({
          Message: 'Select Appointee Relation',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.BuyHdfcForm.get('PolicyHolder.AppointeAddress').invalid) {
        this.alerts.push({
          Message: 'Enter Appointee Address',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.BuyHdfcForm.get('PolicyHolder.PinCode').value == '') {
      this.alerts.push({
        Message: 'Enter PinCode',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.BuyHdfcForm.get('PolicyHolder.Address').invalid) {
      this.alerts.push({
        Message: 'Enter Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.Mobile').value == '' || this.BuyHdfcForm.get('PolicyHolder.Mobile').value == null) {
      this.alerts.push({
        Message: 'Enter Mobile Number',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.Mobile').value != '' && this.BuyHdfcForm.get('PolicyHolder.Mobile').value != null) {
      if (!this.phoneNum.test(this.BuyHdfcForm.get('PolicyHolder.Mobile').value)) {
        this.alerts.push({
          Message: 'Mobile Number must be of 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }


    if (this.BuyHdfcForm.get('PolicyHolder.Email').value == '') {
      this.alerts.push({
        Message: 'Enter your Email',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.Email').value != '') {
      if (!this.emailValidationReg.test(this.BuyHdfcForm.get('PolicyHolder.Email').value)) {
        this.alerts.push({
          Message: 'Enter Valid Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.BuyHdfcForm.get('PolicyHolder.BankAccountHolderName').value == '') {
      this.alerts.push({
        Message: 'Enter your Account Holder Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.BankAccountNo').value == '') {
      this.alerts.push({
        Message: 'Enter your Bank Account No',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.BankName').value == '') {
      this.alerts.push({
        Message: 'Enter your Bank Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.BankIFSCCode').value == '') {
      this.alerts.push({
        Message: 'Enter your IFSC Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.BuyHdfcForm.get('PolicyHolder.PANNo').value == '') {
      this.alerts.push({
        Message: 'Enter PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    }


    if (this.alerts.length > 0 || !this.IsKYC) {
      this.step1.setErrors({ required: true });
      return this.step1;
    } else {
      this.step1.reset();
      return this.step1;

    }


  }

  // alert message for step one
  public StepThreeError(stepper, num = this.flag) {
    // if policy holder details are not validated raise alert message
    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
    }
    // when details are validated , check KYC details   
    else {
      this._CheckKYC(stepper, num)
    }

  }

  // radio button
  /**
   * since we have used span tag instead of label tag , 'for' attribute cannot be used.
   * so in order to change the value of formcontrol in input type radio by clicking on label , this function is used.
   * @param index : to identify the member in member array
   * @param Q : to identify the question in question array
   * @param value : answer of the question.(Is it true or false?)
   * @param type : is it 1 or 0
   * if it is 1 than value will be patched to formcontrol Boolean
   * else value will be patched to formcontrol IsMedicalQuestionOpted
   */
  public radioLabel(index: number, Q: number, value: boolean, type: number = 1) {
    if (type) {
      this.memberDetailsAsArray.controls[index].get('MemberPED').controls[Q].patchValue({
        Boolean: value
      })
    }
    else {
      this.memberDetailsAsArray.controls[index].get('MemberPED').controls[Q].patchValue({
        IsMedicalQuestionOpted: value
      })
    }

  }

  // radio button for Habit
  /**
   * since we have used span tag instead of label tag , 'for' attribute cannot be used.
   * so in order to change the value of formcontrol in input type radio by clicking on label , this function is used.
   * @param index : to identify the member in member array
   * @param H : to identify the habbit from the MemberLifeStyle array
   * @param value : value of habbit (habbit_Name or '')
   */
  public radioLabelHabit(index: number, H: number, value: string) {

    this.memberDetailsAsArray.controls[index].get('MemberLifeStyle').controls[H].patchValue({
      Insured_LifeStyleHabit: value
    })

  }

  // to convert height from feet & inches into cm
  public SetCM(index: number) {
    this.inf.controls[index].patchValue({
      HeightCM: this.Conversion.GetCentimeters(this.inf.controls[index].value.HeightInFeet, this.inf.controls[index].value.HeightInInch)
    });
  }

  //#endregion public-methods
  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // AddOns details
  /**
   * the value of AddOn that are selected on Addon page will be patched here. 
   */
  private _AddOns() {
    let addOn
    if (localStorage.getItem('AddOns')) {
      addOn = JSON.parse(localStorage.getItem('AddOns'))
    }

    if (addOn.deductibleBoolean) {
      this.BuyHdfcForm.get('PolicyDetail.Deductible').patchValue(addOn.Deductible)
    }
  }

  // change the date to (DD-MM-YYYY) format
  /**
   * change the format of value of all the form fields that have date datatype.
   * formcontrols like DOB ,  DiagnosisDate etc.
   */
  private _dateformat() {
    this.BuyHdfcForm.get('PolicyHolder').patchValue({
      DOB: this._datePipe.transform(this.BuyHdfcForm.get('PolicyHolder.DOB').value, 'yyyy-MM-dd')
    })
    this.memberDetailsAsArray.controls.forEach((element, index) => {

      element.get('DOB').patchValue(this._datePipe.transform(element.get('DOB').value, 'yyyy-MM-dd'));

      ((element.get('MemberPED')) as FormArray).controls.forEach((mem, m) => {
        if (mem.get('Boolean').value) {
          if (mem.get('DiagnosisDate').value != 'NA') {
            mem.patchValue({
              DiagnosisDate: moment(mem.get('DiagnosisDate').value).format("DD-MM-YYYY")
            })
          }
          if (mem.get('LastConsultationDate').value != 'NA') {
            mem.patchValue({
              LastConsultationDate: moment(mem.get('LastConsultationDate').value).format("DD-MM-YYYY")
            })
          }
          if (mem.get('ExpectedDeliveryDate').value != 'NA') {
            mem.patchValue({
              ExpectedDeliveryDate: moment(mem.get('ExpectedDeliveryDate').value).format("DD-MM-YYYY")
            })
          }
          if (mem.get('SurgeryDate').value != 'NA') {
            mem.patchValue({
              SurgeryDate: moment(mem.get('SurgeryDate').value).format("DD-MM-YYYY")
            })
          }
          if (mem.get('TestDate').value != 'NA') {
            mem.patchValue({
              TestDate: moment(mem.get('TestDate').value).format("DD-MM-YYYY")
            })
          }
        }
      })
    })
  }

  // change in marital status in policy holder
  /**
   * detects change in value of Marital status in policy holder details (stepper 1) and 
   * updates value of Marital status in member details (stepper 2)  
   */
  private _changeValue() {
    this.BuyHdfcForm.get('PolicyHolder.Marital').valueChanges.subscribe(() => {
      this._changeInMarital()
    })

    this.BuyHdfcForm.get('PolicyHolder.FirstName').valueChanges.subscribe((value) => {
      this._changeInSelfName()
    })

    this.BuyHdfcForm.get('PolicyHolder.MiddleName').valueChanges.subscribe((value) => {
      this._changeInSelfName()
    })

    this.BuyHdfcForm.get('PolicyHolder.LastName').valueChanges.subscribe((value) => {
      this._changeInSelfName()
    })

  }

  /**
   * with change in name of Policy holder , change the name of the member if the title is self
   */
  private _changeInSelfName() {
    this.member.forEach((ele, index) => {
      if (ele.title == 'Self') {
        this.inf.controls[index].patchValue({
          FirstName: this.BuyHdfcForm.get('PolicyHolder.FirstName').value,
          MiddleName: this.BuyHdfcForm.get('PolicyHolder.MiddleName').value,
          LastName: this.BuyHdfcForm.get('PolicyHolder.LastName').value
        })
      }
    })
  }

  // change in marital status in Policy Holder will affect both Self and Spouse's marital status in Member details array 
  private _changeInMarital() {
    this.member.forEach((ele, index) => {
      if (ele.title == 'Self') {
        let i = index
        this.inf.controls[i].patchValue({
          Marital: this.BuyHdfcForm.get('PolicyHolder.Marital').value,
        })
      }

      if (ele.title == 'Spouse') {
        let i = index
        this.inf.controls[i].patchValue({
          Marital: this.BuyHdfcForm.get('PolicyHolder.Marital').value,
        })
      }

    })
  }

  // set value
  private setValue() {
    if (this.HealthQuateForm) {
      this.ReqSumInsured = Number(this.HealthQuateForm.SumInsured);
    }
  }

  // check if Nominee is Adult or Not
  /**
   * it detects change in the age of the Nominee
   * if nominee is not adult than Appointee Details are required . So in order to display the fields for Appointee Details 
   * and make sure that data is filled in those fields this function is used. 
   */
  private _isAdult() {
    this.BuyHdfcForm.get('PolicyHolder.NomineeAge').valueChanges.subscribe((res) => {
      if (res < 18) {
        this.notAdult = true
      } else {
        this.notAdult = false
      }
    })
  }

  // check KYC
  /**
   * if KYC is done by Redirect URL than let the user move to next stepper 
   * @param stepper : MatStepper
   * @param type : to identify if KYC is done from Redirect URL or not(if type==0 than KYC will be done by api 
   *                                                                   but if type==1 means KYC is done from Redirect URL)
   */
  private _CheckKYC(stepper: MatStepper, type: number) {
    if (type == 0) {

      let requiredId: boolean = true;
      if (this.BuyHdfcForm.get('PolicyHolder.PANNo').invalid) {
        this._alertservice.raiseErrorAlert('Enter Valid PAN');
        requiredId = false;
      }
      // Person details for KYC
      if (requiredId) {
        let PANKYC: IHDFCKYCDto = new HDFCKYCDto();
        PANKYC.DOB = this._datePipe.transform(this.BuyHdfcForm.get('PolicyHolder.DOB').value, "yyyy-MM-dd 00:00:00")
        PANKYC.DocNumber = this.BuyHdfcForm.get('PolicyHolder.PANNo').value;
        PANKYC.DocTypeCode = 'PAN';
        PANKYC.TransactionNo = this.Policies.QuoteNo;
        PANKYC.PanNUMBER = '';
        PANKYC.Name = this._fullName(this.BuyHdfcForm.get('PolicyHolder.FirstName').value, this.BuyHdfcForm.get('PolicyHolder.LastName').value, this.BuyHdfcForm.get('PolicyHolder.MiddleName').value);
        this._HdfcService.KYC(PANKYC).subscribe((res) => {

          if (res.Success) {
            // If IskycVerified is 1 , move to the next stepper
            if (res.Data.IskycVerified == 1) {
              this.BuyHdfcForm.get('PolicyHolder.KYCId').patchValue(res.Data.KycId)
              this.IsKYC = true;
              this._compareFullNameAndReturnName(res, stepper)
              this._alertservice.raiseSuccessAlert(res.Message);
              // this.step1.reset();
              // stepper.next();
            }
            // if IskycVerified is 0 then open the Redirect URL in order to finish KYC
            // Save the data of Policy holder in local storage and once the KYC is done the user will return back to HDFC form 
            // and the data of Policy holder will be retrive from the local storage and user will be moved to next stepper 
            else {
              localStorage.setItem('HDFCpolicyHolder', JSON.stringify(this.BuyHdfcForm.get('PolicyHolder').value));
              this.IsKYC = false;
              stepper.previous();
              window.open(res.Data.RedirectURL, '_self');
              this._alertservice.raiseErrors(res.Alerts);
            }
          }
          //  raise Alert message and do not let user to move on next stepper
          else {
            stepper.previous();
            this.IsKYC = false;
            this._alertservice.raiseErrorAlert(res.Message);
          }
        });
      } else {
        this.IsKYC = false;
        this._alertservice.raiseErrorAlert('Enter Valid PAN');
      }
    }
    // after KYC is done from the Redirect URL let the user move to next stepper
    else {
      this.IsKYC = true;
      this.step1.reset();
    }
  }

  // full name for KYC
  private _fullName(FName: string, LName: string, MName?: string) {
    let Name: string
    if (MName) {
      Name = FName.concat(' ', MName, ' ', LName)
    } else {
      Name = FName.concat(' ', LName)
    }

    return Name
  }

  private _compareFullNameAndReturnName(response, stepper?: MatStepper) {
    let fullName = this._fullName(this.BuyHdfcForm.get('PolicyHolder.FirstName').value, this.BuyHdfcForm.get('PolicyHolder.LastName').value, this.BuyHdfcForm.get('PolicyHolder.MiddleName').value)

    if (response.Data.Name != fullName.toUpperCase()) {
      this._dialogService.confirmDialog({
        title: 'Are You Sure?',
        message: `Replace Your Name with ${response.Data.Name}`,
        confirmText: 'Yes, Replace!',
        cancelText: 'No',
      })
        .subscribe((res) => {
          let Name = response.Data.Name.split(' ')
          if (res == true) {
            this.BuyHdfcForm.get('PolicyHolder').patchValue({
              FirstName: Name[0],
              MiddleName: Name.length > 2 ? Name[1] : '',
              LastName: Name.length > 2 ? Name[2] : Name[1],
            })
          }
          this.step1.reset();
          stepper.next();
        })
    }
    else {
      this.step1.reset();
      stepper.next();
    }
  }

  // policy holder details (name , dob , gender , emial , mobile no. , pincode etc) from health form
  private _membersDetails() {
    if (this.HealthQuateForm.SelfCoverRequired == true) {
      const names = this.HealthQuateForm.Name.trim().replace(/ +/g, ' ').split(' ');
      if (names.length > 0)
        this.BuyHdfcForm.get('PolicyHolder').patchValue({
          FirstName: names[0].trim(),
        });
      if (names.length > 1) {
        if (names.length > 2) {
          this.BuyHdfcForm.get('PolicyHolder').patchValue({
            MiddleName: names[1].trim(),
            LastName: names[2].trim(),
          });
        } else
          this.BuyHdfcForm.get('PolicyHolder').patchValue({
            LastName: names[1],
          });
      }

      this.BuyHdfcForm.get('PolicyHolder').patchValue({
        Gender: this.HealthQuateForm.SelfGender,
        DOB: this.HealthQuateForm.SelfDOB,

      });
    }

    this.BuyHdfcForm.get('PolicyHolder').patchValue({
      Mobile: this.HealthQuateForm.Mobile,
      Email: this.HealthQuateForm.EmailId,
      PinCode: this.HealthQuateForm.PinCode,
    })

  }

  // setting default for member PDE questions
  private _settingDefaultValueForMDEF() {
    this.memberDetailsAsArray.controls.forEach((element, index) => {
      ((element.get('MemberPED')) as FormArray).controls.forEach((mem, m) => {
        let tempArray = ['ExactDiagnosis', 'DiagnosisDate', 'LastConsultationDate', 'CurrentStatus', 'DetailsOfTreatment', 'ExpectedDeliveryDate',
          'LineOfManagement', 'ProposedSurgery', 'Remarks', 'SurgeryDate', 'TestDate', 'TestFindings', 'TestType']

        // for all the members that are to be insured , Medical history or MemberPED questions if it is selected yes than certain data is be provided 
        // (required data is different for each question) . other than the required data fields , all the other will have 'NA' value . So if
        // the value for any Field is null or blank , 'NA' will be patched with those fields since API throws invalid argument message if any of those
        // fields have null or blank value
        if (mem.get('Boolean').value) {
          tempArray.forEach((i) => {
            if (mem.get(i).value == '' || mem.get(i).value == null) {
              mem.get(i).patchValue('NA')
            }
          })
        }
        // if answer of any question is selected No than all the fields will have 'NA' value
        else {
          tempArray.forEach((i) => {
            mem.get(i).patchValue('NA')
          })
        }
      })
    })

    // change the date format to (DD-MM-YYYY) format
    this._dateformat()
  }

  // change in Pincode
  private _onFormChanges() {
    this.BuyHdfcForm.get('PolicyHolder.PinCode').valueChanges.subscribe(
      (val) => {
        this.pincodes$ = this._MasterListService
          .getFilteredPincodeList(val)
          .pipe(
            takeUntil(this.destroy$),
            switchMap((res) => {
              if (res.Success) {
                if (res.Data.Items.length) {
                  let result = Array.from(
                    res.Data.Items.reduce(
                      (m, t) => m.set(t.PinCode, t),
                      new Map()
                    ).values()
                  );
                  result = result.filter((el) => {
                    if (el.PinCode) {
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
      }
    );
  }

  // number of member from health form
  /**
   * Adding number of members and data from the health form.
   * number of members are determined by myMember array and so is the relation
   * while data like name , DOB etc are fetched from health form 
   */
  private _addMemberDetails() {
    let title: string
    var row: PolicyMemberHdfcDto = new PolicyMemberHdfcDto();
    for (let i = 0; i < this.member.length; i++) {
      if (this.member[i].title == 'Self') {
        title = 'Self'
      }
      switch (this.member[i].title) {
        case "Self":
          title = 'Self'
          const Names = this.HealthQuateForm.Name.trim().replace(/ + /g, ' ').split(' ');
          if (Names.length > 0)
            row.FirstName = Names[0].trim()
          if (Names.length > 1) {
            if (Names.length > 2) {
              row.MiddleName = Names[1].trim();
              row.LastName = Names[2].trim();
            }
            else row.LastName = Names[1].trim()
          }
          row.DOB = this.HealthQuateForm[`${title}DOB`]
          row.Gender = this.HealthQuateForm[`${title}Gender`]
          row.Relation = "Self";
          this.BuyNow.PolicyMemberDetails.push(row);
          this.inf.push(this._initPolicyMemberDetailsForm(row));
          break;
        case "Spouse":
          title = 'Spouse'
          row.Relation = "Spouse";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Daughter":
          title = 'Child1'
          row.Relation = "Daughter";
          this._SetPolicyMemberDetails(title, row)
          break;

        case "Daughter1":
          title = 'Child1'
          row.Relation = "Daughter";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Daughter2":
          title = 'Child2'
          row.Relation = "Daughter";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Daughter3":
          title = 'Child3'
          row.Relation = "Daughter";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Son":
          title = 'Child4'
          row.Relation = "Son";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Son1":
          title = 'Child4'
          row.Relation = "Son";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Son2":
          title = 'Child5'
          row.Relation = "Son";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Son3":
          title = 'Child6'
          row.Relation = "Son";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Mother":
          title = 'Mother'
          row.Relation = "Mother";
          this._SetPolicyMemberDetails(title, row)
          break;
        case "Father":
          title = 'Father'
          row.Relation = "Father";
          this._SetPolicyMemberDetails(title, row)
          break;

        default:
          break;
      }

    }
  }

  // member details (like name , gender , DOB etc) from Health form
  /**
   * data of all the members other than self are patched here.
   * data like relation , gender , first name etc are fetched from the health form
   * @param title : title of the member
   * @param row : PolicyMemberHdfcDto
   */
  private _SetPolicyMemberDetails(title, row: PolicyMemberHdfcDto) {
    this.BuyNow = this.BuyHdfcForm.value;
    const names = this.HealthQuateForm[`${title}Name`].trim().replace(/ + /g, ' ').split(' ');
    if (names.length > 0)
      row.FirstName = names[0].trim()
    if (names.length > 1) {
      if (names.length > 2) {
        row.MiddleName = names[1].trim();
        row.LastName = names[2].trim();
      }
      else row.LastName = names[1].trim()
    }

    row.DOB = this.HealthQuateForm[`${title}DOB`]
    row.Gender = this.HealthQuateForm[`${title}Gender`]
    switch (title) {
      case 'Child1':
        row.Gender = 'Female';
        break;
      case 'Child2':
        row.Gender = 'Female';
        break;
      case 'Child3':
        row.Gender = 'Female';
        break;
      case 'Child4':
        row.Gender = 'Male';
        break;
      case 'Child5':
        row.Gender = 'Male';
        break;
      case 'Child6':
        row.Gender = 'Male';
        break;
      case 'Father':
        row.Gender = 'Male';
        break;
      case 'Mother':
        row.Gender = 'Female';
        break;
    }
    this.BuyNow.PolicyMemberDetails.push(row);
    this.inf.push(this._initPolicyMemberDetailsForm(row));
  }

  // dropdown list
  private _fillMasterList() {
    this.GenderList = [];
    // fill gender list
    this._MasterListService.getCompanyWiseList('HDFCErgo', 'gender').subscribe((res) => {
      if (res.Success) {
        this.GenderList = res.Data.Items;
      }
    });
    this.RelationList = [];
    this._MasterListService.getCompanyWiseList('HDFCErgo', 'relation').subscribe((res) => {
      if (res.Success) {
        this.RelationList = res.Data.Items;
      }
    });

    this.NomineeRelationList = [];
    this._MasterListService.getCompanyWiseList('HDFCErgo', 'nomineerelation').subscribe((res) => {
      if (res.Success) {
        this.NomineeRelationList = res.Data.Items;
      }
    });

    this.MaritalList = [];
    this._MasterListService.getCompanyWiseList('HDFCErgo', 'marital').subscribe((res) => {
      if (res.Success) {
        this.MaritalList = res.Data.Items;
      }
    });
    //Occupation
    this.OccupationList = [];
    this._MasterListService.getCompanyWiseList('HDFCErgo', 'hdfcergooccupation').subscribe((res) => {
      if (res.Success) {
        this.OccupationList = res.Data.Items;
      }
    });

    //fill financier code list
    this.BankList = [];
    this._MasterListService
      .getCompanyWiseList('HDFCErgo', 'hdfcneftbank')
      .subscribe((res) => {
        if (res.Success) {
          this.BankList = res.Data.Items;
        }
      });

    // current Status
    this.CurrentStatusList = ['CURED', 'NOT TREATED', 'ONGOING']

    // Line Of Management
    this.LineOfManagementList = ['MEDICAL', 'SURGICAL']

    // Life Habit
    this.PersonalHabitList = ['Cigarette(s)', 'Bidi(s)', 'Tobacco Pouches', 'Alcohol(Quantity)', 'Gutka Pouches', 'Drugs(Quantity)']

    // Personal Habit Data List
    this.PersonalHabitDataList = [{ name: 'PerDay', label: 'Per Day' }, { name: 'PerWeek', label: 'Per Week' }, { name: 'PerMonth', label: 'Per Month' }, { name: 'PastYears', label: 'Per Years' }]
  }

  // validator for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  // main form
  private _buildBuyHdfcForm(data: BuyHdfcDto) {
    let Buyform = this.fb.group({
      TransactionNo: [''],
      PolicyDetail: this._buildPolicyDetailForm(data.PolicyDetail),
      PolicyMemberDetails: this._buildPolicyMemberDetailsForm(
        data.PolicyMemberDetails
      ),
      PolicyHolder: this._buildPolicyHolderForm(data.PolicyHolder),
    });
    if (data) {
      Buyform.patchValue(data);
    }
    return Buyform;
  }

  // policy details form
  private _buildPolicyDetailForm(data): FormGroup {
    this.policyDetailsForm = this.fb.group({
      Productcode: [''],
      SumInsured: [0],
      PolicyStartDate: [''],
      PolicyPeriod: [''],
      ProductName: [''],
      SubProductCode: [''],
      SubProductName: [''],
      PolicyType: [''],
      Deductible: [0],
    });
    return this.policyDetailsForm;
  }

  // policy holder details form
  private _buildPolicyHolderForm(data): FormGroup {
    let policyHolderForm = this.fb.group({
      FirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      MiddleName: [''],
      LastName: ['', [Validators.required, this.noWhitespaceValidator]],
      Mobile: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      Email: ['', [Validators.email, Validators.maxLength(60)]],
      Gender: [0, [Validators.required]],
      DOB: ['', [Validators.required]],
      PinCode: ['', [Validators.required]],
      Address: ['', [Validators.required, this.noWhitespaceValidator]],
      Address1: [''],
      KYCId: ['', [Validators.required]],
      Marital: ['', [Validators.required]],
      NomineeFirstName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeMiddleName: ['', [Validators.required]],
      NomineeLastName: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeRelation: ['', [Validators.required]],
      NomineeAddress: ['', [Validators.required, this.noWhitespaceValidator]],
      NomineeAge: [null, [Validators.required]],
      AppointeeFirstName: ['', [this.noWhitespaceValidator]],
      AppointeeMiddleName: [''],
      AppointeeLastName: ['', [this.noWhitespaceValidator]],
      AppointeeRelation: [''],
      AppointeAddress: ['', [this.noWhitespaceValidator]],
      PANNo: ['', [Validators.required, Validators.pattern('^([A-Z]|[a-z]){5}([0-9]){4}([A-Z]|[a-z]){1}$'), this.noWhitespaceValidator]],
      BankAccountHolderName: ['', [Validators.required, this.noWhitespaceValidator]],
      BankAccountNo: ['', [Validators.required, this.noWhitespaceValidator]],
      BankName: ['', [Validators.required, this.noWhitespaceValidator]],
      BankIFSCCode: ['', [Validators.required, this.noWhitespaceValidator]],
      PolicyHardCopyRequired: [false],

    });
    return policyHolderForm;
  }

  // member array
  private _buildPolicyMemberDetailsForm(
    items: PolicyMemberHdfcDto[] = []
  ): FormArray {
    let formArray: FormArray = new FormArray([]);
    if (items != null) {
      if (!(items && items.length > 0)) {
        return formArray;
      }
      if (items != null) {
        items.forEach((i) => {
          formArray.push(this._initPolicyMemberDetailsForm(i));
        });
      }
    }

    return formArray;
  }

  // member details form
  private _initPolicyMemberDetailsForm(item: PolicyMemberHdfcDto): FormGroup {
    let pDF = this.fb.group({
      FirstName: ['', [Validators.required, this.noWhitespaceValidator, Validators.maxLength(60)]],
      MiddleName: [''],
      LastName: ['', [Validators.required, this.noWhitespaceValidator, Validators.maxLength(60)]],
      Relation: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      Gender: ['0', [Validators.required]],
      HeightCM: [0, [Validators.required, Validators.max(400)]],
      HeightInFeet: [],
      HeightInInch: [],
      WeightKG: [0, [Validators.required, Validators.max(300)]],
      Occupation: ['', [Validators.required]],
      Marital: ['', [Validators.required]],
      GrossMonthlyIncome: [0, [Validators.required]],
      MemberPED: this._buildMemberPDEDetails(),
      MemberLifeStyle: this._buildMemberLifeStyleDetails(),
    });
    if (item != null) {
      if (!item) {
        item = new PolicyMemberHdfcDto();
      }

      if (item) {
        pDF.patchValue(item);
      }
    }
    return pDF;
  }

  // pdeDetails array
  private _buildMemberPDEDetails(): FormArray {
    let formArray: FormArray = new FormArray([]);
    this.IllnessList.forEach((Q) => {
      let item: MemberPEDDto = new MemberPEDDto();
      item.QuestionnaireId = Q.QuestionnaireId
      item.QuestionnaireDescription = Q.QuestionnaireDescription
      formArray.push(this._initMemberPDEForm(item));
    })

    return formArray

  }

  // pdeDetails form
  private _initMemberPDEForm(item: MemberPEDDto): FormGroup {
    let mPF = this.fb.group({
      Boolean: [],
      QuestionnaireDescription: [item.QuestionnaireDescription],
      QuestionnaireId: [item.QuestionnaireId],
      ExactDiagnosis: [],
      DiagnosisDate: [],
      LastConsultationDate: [],
      CurrentStatus: [],
      DetailsOfTreatment: [],
      ExpectedDeliveryDate: [],
      IsMedicalQuestionOpted: [false],
      LineOfManagement: [],
      ProposedSurgery: [],
      Remarks: [],
      SurgeryDate: [],
      TestDate: [],
      TestFindings: [],
      TestType: [],
    })
    return mPF
  }

  // life Style array
  private _buildMemberLifeStyleDetails(): FormArray {
    let formArray: FormArray = new FormArray([]);
    this.PersonalHabitList.forEach((H) => {
      let item: MemberLifeStyleDto = new MemberLifeStyleDto();
      formArray.push(this._initMemberLifeStyleForm(item));

    })
    return formArray
  }

  // life style form
  private _initMemberLifeStyleForm(item: MemberLifeStyleDto): FormGroup {
    let mLS = this.fb.group({
      Insured_LifeStyleHabit: [],
      PerDay: [0],
      PerWeek: [0],
      PerMonth: [0],
      PastYears: [0],
    })
    if (item != null) {
      if (!item) {
        item = new MemberLifeStyleDto();
      }

      if (item) {
        mLS.patchValue(item);
      }
    }
    return mLS
  }
  //#endregion Private methods
}
