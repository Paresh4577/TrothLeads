import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { IPolicy } from '@models/transactions/policy.dto';
import { QuoteService } from '../quote.service';
import { ISharePlansDto, SharePlansDto } from '@models/dtos/config/SharePlans/PolicyPlans';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ValidationRegex } from '@config/validationRegex.config';

@Component({
  selector: 'gnx-pop-up-share',
  templateUrl: './pop-up-share.component.html',
  styleUrls: ['./pop-up-share.component.scss'],
})
export class PopUpShareComponent {
  title: string;
  SelectedPoliciesMul: IPolicy[];
  SelectedPolicies: IPolicy;

  sharePlansDto: ISharePlansDto;
  ShareForm: FormGroup;

  emailValidationReg: RegExp = ValidationRegex.emailValidationReg;//Email Field Validate value by MAthing this pattern

  //#region constructor

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      multiPolicies: IPolicy[]
      Policies: IPolicy;
      title: string;
      isMultiple: boolean;
      data?: any;
    },
    private _alertservice: AlertsService,
    private _QuoteService: QuoteService,
    private fb: FormBuilder
  ) {
    this.title = data.title;
    this.SelectedPolicies = data.Policies;
    this.SelectedPoliciesMul = data.multiPolicies;
    this.sharePlansDto = new SharePlansDto();

    if (localStorage.getItem('HealthQuateForm')) {
      let Data = JSON.parse(localStorage.getItem('HealthQuateForm'));
      let member = JSON.parse(localStorage.getItem('member'));
      let totalmember = member.length

      this.sharePlansDto.Child = Data.NoOfChildren
      this.sharePlansDto.Adults = totalmember - Data.NoOfChildren
      if (this.SelectedPolicies) {
        this.sharePlansDto.PolicyPeriodName = this.SelectedPolicies.PolicyPeriodName
        this.sharePlansDto.PolicyTypeName = this.SelectedPolicies.PolicyTypeName
        this.sharePlansDto.SumInsured = this.SelectedPolicies.SumInsured.toString()
        this.sharePlansDto.qQHealthResponseDtos = []

        this.patchValues();
      } else {
        this.sharePlansDto.PolicyPeriodName = this.SelectedPoliciesMul[0].PolicyPeriodName
        this.sharePlansDto.PolicyTypeName = this.SelectedPoliciesMul[0].PolicyTypeName
        this.sharePlansDto.SumInsured = this.SelectedPoliciesMul[0].SumInsured.toString()
        this.sharePlansDto.qQHealthResponseDtos = []

        this.patchMulValues()
      }
    }
  }

  // #endregion constructor

   //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this.ShareForm = this._buildShareForm();
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // share policy details on email
  public ShareOnEmail() {

    if (this.ShareForm.get('Email').valid && this.emailValidationReg.test(this.ShareForm.get('Email').value)) {
      this.sharePlansDto.Email = this.ShareForm.get('Email').value;
      this.sharePlansDto.IsSendWhatsApp = false
      this.sharePlansDto.WhatsAppMessage = ""

      this._QuoteService.SharePlans(this.sharePlansDto).subscribe((res) => {
        if (res.Success) {
          this._alertservice.raiseSuccessAlert(res.Message, 'true');
        } else {
          // handle page/form level alerts here
          this._alertservice.raiseErrors(res.Alerts, true);
        }
      });
      this.cancle()
    } else {
      if (this.ShareForm.get('Email').value == ''){
        this._alertservice.raiseErrorAlert('Please enter Email !', true);
      } else {
        this._alertservice.raiseErrorAlert('Please enter valid Email !', true);
      }
        
    }
  }

  // share policy deatils on whatsapp
  public ShareOnWhatsapp() {

    if (this.ShareForm.get('MobileNo').valid) {
      this.sharePlansDto.MobileNo = 91 + this.ShareForm.get('MobileNo').value;
      this.sharePlansDto.IsSendWhatsApp = true
      this.sharePlansDto.WhatsAppMessage = ""

      this._QuoteService.SharePlans(this.sharePlansDto).subscribe((res) => {
        if (res.Success) {
          this._alertservice.raiseSuccessAlert(res.Message, 'true');
        } else {
          // handle page/form level alerts here
          this._alertservice.raiseErrors(res.Alerts, true);
        }
      });
      this.cancle()
    } else {
      if (this.ShareForm.get('MobileNo').value == ''){
        this._alertservice.raiseErrorAlert('Please enter Mobile No. !', true);
      } else {
        this._alertservice.raiseErrorAlert('Please enter valid Mobile No. !', true);
      }
        
    }
  }

  // download policy details
  public DownloadSelectedPlans() {
    
    this.sharePlansDto.WhatsAppMessage =""
    this._QuoteService.DownloadPlans(this.sharePlansDto).subscribe((res) => {
      if (res) {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(res);
        a.href = objectUrl;
        a.download = 'Download.pdf';
        a.click();
        URL.revokeObjectURL(objectUrl);
      }
      this.cancle()
    });
  }

  // close PopUp
  public cancle() {
    this.dialogRef.close();
  }

  //#endregion public-methods

  
   //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // validation for space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  // form for email and mobile number
  private _buildShareForm() {
    let form = this.fb.group({
      Email: ['', [this.noWhitespaceValidator, Validators.email]],
      MobileNo: ['' , [this.noWhitespaceValidator,Validators.maxLength(10),Validators.minLength(10)]]
    });

    return form;
  }

  private patchValues() {
    let RoomLimitString: boolean = true
    let NoClaimBonusString: boolean = true
    let path: number = this.SelectedPolicies.IconURL.search('Insurer')
    if (this.SelectedPolicies.RoomLimit == null) {
      RoomLimitString = false
    }
    if (this.SelectedPolicies.NoClaimBonus == null) {
      NoClaimBonusString = false
    }

    this.sharePlansDto.qQHealthResponseDtos.push({
      Id: this.SelectedPolicies.Id,
      RoomLimit: (RoomLimitString ? this.SelectedPolicies.RoomLimit.toString() : null),
      NoClaimBonus: (NoClaimBonusString ? this.SelectedPolicies.NoClaimBonus.toString() : null),
      RestorationBenefit: this.SelectedPolicies.RestorationBenefit,
      Consumable: this.SelectedPolicies.Consumable,
      MaternityCover: this.SelectedPolicies.MaternityCover,
      PEDWaitingPeriod: this.SelectedPolicies.PEDWaitingPeriod,
      SpecificWaitingPeriod: this.SelectedPolicies.SpecificWaitingPeriod,
      PrePostHospitalization: this.SelectedPolicies.PrePostHospitalization,
      DayCareTreatments: this.SelectedPolicies.DayCareTreatments,
      OrganDonor: this.SelectedPolicies.OrganDonor,
      Cataract: this.SelectedPolicies.Cataract,
      AyushBenefit: this.SelectedPolicies.AyushBenefit,
      Bariatric: this.SelectedPolicies.Bariatric,
      HealthCheckup: this.SelectedPolicies.HealthCheckup,
      Insurer: this.SelectedPolicies.Insurer,
      InsurerName: this.SelectedPolicies.InsurerName,
      IconURL: this.SelectedPolicies.IconURL.slice(path),
      ProductName: this.SelectedPolicies.ProductName,
      ProductCode: this.SelectedPolicies.ProductCode,
      SubProductName: this.SelectedPolicies.SubProductName,
      SubProductCode: this.SelectedPolicies.SubProductCode,
      PolicyType: this.SelectedPolicies.PolicyType,
      PolicyTypeName: this.SelectedPolicies.PolicyTypeName,
      SumInsured: this.SelectedPolicies.SumInsured,
      PolicyPeriod: this.SelectedPolicies.PolicyPeriod,
      PolicyPeriodName: this.SelectedPolicies.PolicyPeriodName,
      BasePremium: this.SelectedPolicies.BasePremium,
      Discount: this.SelectedPolicies.Discount,
      NetPremium: this.SelectedPolicies.NetPremium,
      Tax: this.SelectedPolicies.Tax,
      TotalPremium: this.SelectedPolicies.TotalPremium,
      QuoteNo: this.SelectedPolicies.QuoteNo
    })

  }

  private patchMulValues() {
    this.SelectedPoliciesMul.forEach((element, index) => {
      let path: number = element.IconURL.search('Insurer')
      let RoomLimitString: boolean = true
      let NoClaimBonusString: boolean = true
      if (element.RoomLimit == null) {
        RoomLimitString = false
      }
      if (element.NoClaimBonus == null) {
        NoClaimBonusString = false
      }

      this.sharePlansDto.qQHealthResponseDtos.push({
        Id: element.Id,
        RoomLimit: (RoomLimitString ? element.RoomLimit.toString() : null),
        NoClaimBonus: (NoClaimBonusString ? element.NoClaimBonus.toString() : null),
        RestorationBenefit: element.RestorationBenefit,
        Consumable: element.Consumable,
        MaternityCover: element.MaternityCover,
        PEDWaitingPeriod: element.PEDWaitingPeriod,
        SpecificWaitingPeriod: element.SpecificWaitingPeriod,
        PrePostHospitalization: element.PrePostHospitalization,
        DayCareTreatments: element.DayCareTreatments,
        OrganDonor: element.OrganDonor,
        Cataract: element.Cataract,
        AyushBenefit: element.AyushBenefit,
        Bariatric: element.Bariatric,
        HealthCheckup: element.HealthCheckup,
        Insurer: element.Insurer,
        InsurerName: element.InsurerName,
        IconURL: element.IconURL.slice(path),
        ProductName: element.ProductName,
        ProductCode: element.ProductCode,
        SubProductName: element.SubProductName,
        SubProductCode: element.SubProductCode,
        PolicyType: element.PolicyType,
        PolicyTypeName: element.PolicyTypeName,
        SumInsured: element.SumInsured,
        PolicyPeriod: element.PolicyPeriod,
        PolicyPeriodName: element.PolicyPeriodName,
        BasePremium: element.BasePremium,
        Discount: element.Discount,
        NetPremium: element.NetPremium,
        Tax: element.Tax,
        TotalPremium: element.TotalPremium,
        QuoteNo: element.QuoteNo
      })

    })
  }

  //#endregion Private methods
}
