import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { dropdown } from '@config/dropdown.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ValidationRegex } from '@config/validationRegex.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert } from '@models/common';
import { ITataDto, TATAPolicyMemberDetailsDto, TataDto } from '@models/dtos/config/TATA/tata-dto';

@Component({
  selector: 'gnx-tata-aig',
  templateUrl: './tata-aig.component.html',
  styleUrls: ['./tata-aig.component.scss'],
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
export class TATAAIGComponent {

  pagetitle: string = 'TATA-AIG Form';
  imgsrc = '/assets//images/avatars/upload.png';

  Policies: any;
  TataBuyNowForm: FormGroup;
  TataBuyNow: ITataDto;
  DropdownMaster: dropdown;
  cityAPI = API_ENDPOINTS.City.Base;
  displayedColumns: string[] = [
    'position',
    'Plan',
    'ProductCode',
    'SumInsured',
    'Premium',
    'Action',
  ];
  logo: string;
  isLinear = false;
  showStep: boolean;
  maxBirthDate: Date;
  member: any[];
  InsuredPeople: number;
  ReqSumInsured: number;
  PolicyType: string;
  PolicyPeriod: number;
  HealthQuateForm: any;
  ProductName: string;
  Productcode: string;
  SubProductCode: string;
  SumInsured: string;
  Insurer: string;
  SelectedMemberIndex: number;
  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;
  TotalPremium: number;

  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    public dialog: MatDialog,
  ) // number of people insured
  {
    this.DropdownMaster = new dropdown();
    this.SelectedMemberIndex = 0;
    if (localStorage.getItem('member')) {
      this.member = JSON.parse(localStorage.getItem('member'));
      this.InsuredPeople = this.member.length;
    }
    // Icon of the comany
    if (localStorage.getItem('buynow')) {
      this.Policies = JSON.parse(localStorage.getItem('buynow'));
      this.logo = this.Policies.IconURL;
      this.ProductName = this.Policies.ProductName;
      this.Productcode = this.Policies.ProductCode;
      if (this.Policies.PolicyType == 'MultiIndividual')
        this.PolicyType = 'Individual';
      else this.PolicyType = this.Policies.PolicyType;

      this.SubProductCode = this.Policies.SubProductCode;
      this.SumInsured = this.Policies.SumInsured;
      this.PolicyPeriod = this.Policies.PolicyPeriodName;
      this.Insurer = this.Policies.Insurer;
      this.TotalPremium = this.Policies.TotalPremium;
    }
  }

  ngOnInit(): void {
    this.TataBuyNow = new TataDto();

    this.TataBuyNowForm = this._buildBuyNowForm(this.TataBuyNow);
    this.TataBuyNow.PolicyMemberDetails = new Array<TATAPolicyMemberDetailsDto>();

    this.HealthQuateForm = JSON.parse(localStorage.getItem('HealthQuateForm'));
    this.setValue();
    this.onPolicy();
    for (let j = 0; j < this.member.length; j++) {
      this.addMemberDetails();
    }
  }
  get f() {
    return this.TataBuyNowForm.controls;
  }
  get inf() {
    return this.TataBuyNowForm.get('PolicyMemberDetails') as FormArray;
  }

  setValue() {
    if (this.HealthQuateForm) {
      this.ReqSumInsured = Number(this.HealthQuateForm.SumInsured);
    }
  }

  public onPolicy() {
    if (this.Policies != null) {
      this.TataBuyNowForm.get('PolicyDetail.ProductName').patchValue(
        this.ProductName
      );
      this.TataBuyNowForm.get('PolicyDetail.Productcode').patchValue(
        this.Productcode
      );
      this.TataBuyNowForm.get('PolicyDetail.PolicyType').patchValue(
        this.PolicyType
      );
      this.TataBuyNowForm.get('PolicyDetail.SubProductCode').patchValue(
        this.SubProductCode
      );
      this.TataBuyNowForm.get('PolicyDetail.SumInsured').patchValue(
        this.SumInsured
      );
      this.TataBuyNowForm.get('PolicyDetail.PolicyPeriod').patchValue(
        this.PolicyPeriod
      );
      this.TataBuyNowForm.get('Insurer').patchValue(this.Insurer);
    }
  }

  public openDiologPincode(type: string, title: string, MemberIndex: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '44vw';
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
          this.TataBuyNowForm.get('PolicyHolder').patchValue({
            PinCode: result.PinCode,
            city: result.CityName,
            StateName: result.StateName,
          });
        }

        if (type == 'PIN') {
          (
            this.TataBuyNowForm.get('PolicyMemberDetails') as FormArray
          ).controls.forEach((element, index) => {
            if (index == this.SelectedMemberIndex) {
              element.patchValue({
                PinCode: result.PinCode,
              });
            }
          });
        }
      }
    });
  }

  public addMemberDetails() {
    this.TataBuyNow = this.TataBuyNowForm.value;
    var row: TATAPolicyMemberDetailsDto = new TATAPolicyMemberDetailsDto();
    this.TataBuyNow.PolicyMemberDetails.push(row);
    this.inf.push(this._initPolicyMemberDetailsForm(row));
  }

  public submitStep(stepper: MatStepper, StepNo: number) {
    switch (StepNo) {
      case 1:
        this._StepOneSubmit(stepper);
        break;
      case 2:
        this._StepTwoSubmit(stepper);
        break;
      case 3:
        this._StepThreeSubmit(stepper);
        break;
      default:
        break;
    }
  }
  private _StepOneSubmit(stepper) {
    let alerts: Alert[] = [];

    if (this.TataBuyNowForm.get('PolicyHolder.FirstName').value == '') {
      alerts.push({
        Message: 'Select your First Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.TataBuyNowForm.get('PolicyHolder.MiddleName').value == '') {
      alerts.push({
        Message: 'Select your Middle Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.TataBuyNowForm.get('PolicyHolder.LastName').value == '') {
      alerts.push({
        Message: 'Select you Last Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.TataBuyNowForm.get('PolicyHolder.Mobile').value == '') {
      alerts.push({
        Message: 'Enter Mobile No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.TataBuyNowForm.get('PolicyHolder.Mobile').value != '') {
      if (
        this.TataBuyNowForm.get('PolicyHolder.Mobile').value.toString().length >
          10 ||
        this.TataBuyNowForm.get('PolicyHolder.Mobile').value.toString().length < 10
      ) {
        alerts.push({
          Message: 'Enter Valid Mobile No.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.TataBuyNowForm.get('PolicyHolder.TelephoneNo').value == '') {
      alerts.push({
        Message: 'Enter Emergency Contact No.',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.TataBuyNowForm.get('PolicyHolder.TelephoneNo').value != '') {
      if (
        this.TataBuyNowForm.get('PolicyHolder.TelephoneNo').value.toString()
          .length > 10 ||
        this.TataBuyNowForm.get('PolicyHolder.TelephoneNo').value.toString()
          .length < 10
      ) {
        alerts.push({
          Message: 'Enter Valid Emergency Contact No.',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.TataBuyNowForm.get('PolicyHolder.Email').value != '') {
      if (
        !this.emailValidationReg.test(
          this.TataBuyNowForm.get('PolicyHolder.Email').value
        )
      ) {
        alerts.push({
          Message: 'Enter Valid Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
    // gender required
    if (this.TataBuyNowForm.get('PolicyHolder.Gender').value == '') {
      alerts.push({
        Message: 'Select your Gender',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.TataBuyNowForm.get('PolicyHolder.DOB').value == '') {
      alerts.push({
        Message: 'Enter Your Date of Birth',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.TataBuyNowForm.get('PolicyHolder.PinCode').value == '') {
      alerts.push({
        Message: 'Enter PinCode',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.TataBuyNowForm.get('PolicyHolder.Address').value == '') {
      alerts.push({
        Message: 'Enter Flat/House No. Apartment',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.TataBuyNowForm.get('PolicyHolder.street').value == '') {
      alerts.push({
        Message: 'Enter Street or Colony',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.TataBuyNowForm.get('PolicyHolder.city').value == '') {
      alerts.push({
        Message: 'Enter City Name',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (alerts.length > 0) {
      this._alertservice.raiseErrors(alerts);
      stepper.previous();
    }
  }
  private _StepTwoSubmit(stepper) {}
  private _StepThreeSubmit(stepper) {
    let alerts: Alert[] = [];
    this.TataBuyNowForm.get('PolicyMemberDetails').value.forEach((i) => {
      if (i.FirstName == '') {
        alerts.push({
          Message: 'Enter First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.MiddleName == '') {
        alerts.push({
          Message: 'Enter Middle Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.LastName == '') {
        alerts.push({
          Message: 'Enter Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.Relation == '') {
        alerts.push({
          Message: 'Enter Relation',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.DOB == '') {
        alerts.push({
          Message: 'Enter DOB',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.Gender == '') {
        alerts.push({
          Message: 'Enter Gender',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.HeightCM == 0) {
        alerts.push({
          Message: 'Enter Height in CM',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.WeightKG == 0) {
        alerts.push({
          Message: 'Enter Weight in KG',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.Marital == '') {
        alerts.push({
          Message: 'Enter Marital Status',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.Occupation == '') {
        alerts.push({
          Message: 'Enter Occupation',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.Street == '') {
        alerts.push({
          Message: 'Enter Street',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.City == '') {
        alerts.push({
          Message: 'Enter City Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.PinCode == '') {
        alerts.push({
          Message: 'Enter Pin Code',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.GrossMonthlyIncome == 0) {
        alerts.push({
          Message: 'Enter Gross Monthly Income',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.BMI == '') {
        alerts.push({
          Message: 'Enter BMI',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.NomineeFirstName == '') {
        alerts.push({
          Message: 'Enter Nominee First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.NomineeMiddleName == '') {
        alerts.push({
          Message: 'Enter Nominee Middle Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.NomineeLastName == '') {
        alerts.push({
          Message: 'Enter Nominee Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.NomineeDOB == '') {
        alerts.push({
          Message: 'Enter Nominee DOB',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.NomineeGender == '') {
        alerts.push({
          Message: 'Enter Nominee Gender',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (i.NomineeRelation == '') {
        alerts.push({
          Message: 'Enter Nominee Relatione',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    });


    if (alerts.length > 0) {
      this._alertservice.raiseErrors(alerts);
      stepper.previous();
    }

  }

  private _buildBuyNowForm(data: TataDto) {
    let Buyform = this.fb.group({
      Insurer: [''],
      TransactionNo: [''],
      PolicyDetail: this._buildPolicyDetailForm(data.PolicyDetail),
      PolicyMemberDetails: this._buildPolicyMemberDetailsForm(
        data.PolicyMemberDetails
      ),
      PolicyHolder: this._buildPolicyHolderForm(data.PolicyHolder),
    });
    return Buyform;
  }

  private _buildPolicyDetailForm(data): FormGroup {
    let policyDetailsForm = this.fb.group({
      ProductName: [''],
      Productcode: [''],
      PolicyType: [''],
      SubProductCode: [''],
      SumInsured: [0],
      PolicyStartDate: [''],
      PolicyPeriod: [''],
      PaymentMode: [''],
      PaymentAmount: [0],
      PaymentDate: [''],
    });
    return policyDetailsForm;
  }

  private _buildPolicyHolderForm(data): FormGroup {
    let policyHolderForm = this.fb.group({
      FirstName: ['', [Validators.required]],
      MiddleName: [''],
      LastName: ['', [Validators.required]],
      Mobile: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(10),
        ],
      ],
      TelephoneNo: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(10),
        ],
      ],
      Email: ['', [Validators.email]],
      Gender: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      CountryCode: [0],
      StateCode: [1],
      StateName: [''],
      PinCode: ['', [Validators.required]],
      Address: ['', [Validators.required]],
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      Address1: [''],
      KYCId: [],
    });
    return policyHolderForm;
  }

  private _buildPolicyMemberDetailsForm(
    items: TATAPolicyMemberDetailsDto[] = []
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

  private _initPolicyMemberDetailsForm(
    item: TATAPolicyMemberDetailsDto
  ): FormGroup {
    let pDF = this.fb.group({
      FirstName: ['', [Validators.required]],
      MiddleName: ['', [Validators.required]],
      LastName: ['', [Validators.required]],
      Relation: ['', [Validators.required]],
      DOB: ['', [Validators.required]],
      Gender: ['', [Validators.required]],
      HeightCM: [0, [Validators.required, Validators.max(400)]],
      WeightKG: [0, [Validators.required, Validators.max(300)]],
      Marital: ['', [Validators.required]],
      Occupation: ['', [Validators.required]],
      Street: ['', [Validators.required]],
      City: ['', [Validators.required]],
      CountryCode: [],
      StateCode: [1],
      PinCode: ['', [Validators.required]],
      GrossMonthlyIncome: [0, [Validators.required, Validators.max(10000000)]],
      BMI: ['', [Validators.required]],
      NomineeFirstName: ['', [Validators.required]],
      NomineeMiddleName: ['', [Validators.required]],
      NomineeLastName: ['', [Validators.required]],
      NomineeDOB: ['', [Validators.required]],
      NomineeGender: ['', [Validators.required]],
      NomineeRelation: ['', [Validators.required]],
      PreExistDisease: [false],
      PreExistDiseaseDescription: [''],
      SmokerTibco: [false],
      SmokerTibcoRemark: [''],
      Thyroid: [false],
      ThyroidRemark: [''],
      Asthma: [false],
      AsthmaRemark: [''],
      CholesterolDisorDr: [false],
      CholesterolDisorDrRemark: [''],
      Heartdisease: [false],
      HeartdiseaseRemark: [''],
      Hypertension: [false],
      HypertensionRemark: [''],
      Diabetes: [false],
      DiabetesRemark: [''],
      Obesity: [false],
      ObesityRemark: [''],
    });
    if (item != null) {
      if (!item) {
        item = new TATAPolicyMemberDetailsDto();
      }

      if (item) {
        pDF.patchValue(item);
      }
    }
    return pDF;
  }

}
