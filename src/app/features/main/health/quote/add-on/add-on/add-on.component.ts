import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AddOnService } from './add-on.service';
import { IAddOnsDto } from '@models/dtos/config/add-ons';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BuyGoDigitDto, IBuyGoDigitDto } from '@models/dtos/config/GoDigit/BuyDto';
import { BuyCareDto, IBuyCareDto } from '@models/dtos/config/Care/BuyCareDto';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { MasterListService } from '@lib/services/master-list.service';
import { Subject, takeUntil } from 'rxjs';
import { BuyCICIHeathDto, IBuyICICIHeathDto } from '@models/dtos/config/Icici/icicihealthDto';
import { BajajBuyNowDto, IBajajBuyNowDto } from '@models/dtos/config/Bajaj/buynow-dto';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';
import { ROUTING_PATH } from '@config/routingPath.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { AddOnDetailsPopUpComponent } from '../add-on-details-pop-up/add-on-details-pop-up.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddOnDataForChildComponent } from '../add-on-data-for-child/add-on-data-for-child.component';
import { PlanNameEnum } from 'src/app/shared/enums/PlanNames.enum';
import { Alert } from '@models/common';
import { BuyHdfcDto, IBuyHdfcDto } from '@models/dtos/config/Hdfc/BuyHdfcDto';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { IffcoTokioDto } from '@models/dtos/config/IffcoTokio/iffco-tokio-dto';

@Component({
  selector: 'gnx-add-on',
  templateUrl: './add-on.component.html',
  styleUrls: ['./add-on.component.scss'],
  providers: [
    DatePipe,
    {
      provide: DateAdapter, useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class AddOnComponent {
  pagetitle = 'Add-Ons';

  addOnList: IAddOnsDto[];
  displayAddOn: any[];
  AllMandatoryAddOn = []
  addOnLength: number;
  TotalPremium: number;
  // error array
  creticalIllnessErrorAlerts: Alert[] = []

  flag: boolean;
  requestInProcessFlag: boolean
  IsReadOnlyIffcoTokioPolicy: boolean = false

  InsuredPeople: number;
  member;
  Policies;
  PolicyType;
  submit: FormGroup;
  HealthQuateForm: any;
  PlanName: string
  FName: string
  LName: string
  PolicyNo: string;

  // companywise form submission
  Care: IBuyCareDto;
  ICICI: IBuyICICIHeathDto;
  Bajaj: IBajajBuyNowDto;
  GoDigit: IBuyGoDigitDto;
  Hdfc: IBuyHdfcDto;
  IffcoTokio: IffcoTokioDto;

  destroy$: Subject<any>;

  //#region constructor
  constructor(
    private _router: Router,
    private addOnService: AddOnService,
    private fb: FormBuilder,
    private _MasterListService: MasterListService,
    private _alertService: AlertsService,
    public dialog: MatDialog,
    private _datePipe: DatePipe,
  ) {
    this.destroy$ = new Subject();

    // Policy details
    if (localStorage.getItem('buynow')) {
      this.Policies = JSON.parse(localStorage.getItem('buynow'));
    }
    // member details
    if (localStorage.getItem('member')) {
      this.member = JSON.parse(localStorage.getItem('member'));
      this.InsuredPeople = this.member.length;
    }

    if (localStorage.getItem('HealthQuateForm')) {
      this.HealthQuateForm = JSON.parse(
        localStorage.getItem('HealthQuateForm')
      );
    }
    this.TotalPremium = this.Policies.TotalPremium;

    if (this.Policies.PolicyType != '') {
      if (this.Policies.PolicyType == 'MultiIndividual') {
        this.PolicyType = 'Individual';
      } else if (this.Policies.PolicyType == 'FamilyFloater') {
        this.PolicyType = 'Family Floater';
      } else {
        this.PolicyType = this.Policies.PolicyType;
      }
    } else {
      let HealthForm = JSON.parse(localStorage.getItem('HealthQuateForm'));
      if (HealthForm.PolicyType == 'MultiIndividual') {
        this.PolicyType = 'Individual';
      } else if (HealthForm.PolicyType == 'FamilyFloater') {
        this.PolicyType = 'Family Floater';
      } else {
        this.PolicyType = HealthForm.PolicyType;
      }
    }

    this.Care = new BuyCareDto();
    this.IffcoTokio = new IffcoTokioDto();
    this.ICICI = new BuyCICIHeathDto();
    this.Bajaj = new BajajBuyNowDto();
    this.GoDigit = new BuyGoDigitDto();
    this.Hdfc = new BuyHdfcDto();
    this.displayAddOn = [];
    this.flag = true;
    this.requestInProcessFlag = true
  }
  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    // addOn Data
    this.addOnList = [];
    if (this.Policies.Insurer.toLowerCase() == InsuranceCompanyName.ICICI) {
      this.PlanName = this.Policies.SubProductName
      this.addOnList = this.addOnService.getAddOns(
        this.Policies.Insurer.toLowerCase(),
        this.Policies.SubProductName
      );
      if (this.Policies.SubProductName == PlanNameEnum.icici_HAE_ApexPlus) {
        this._checkSpouseGenderForMaternity()
        this._checkNoOfChildren()
      }
    } else {
      this.PlanName = this.Policies.ProductName
      this.addOnList = this.addOnService.getAddOns(
        this.Policies.Insurer.toLowerCase(),
        this.Policies.ProductName
      );
      if (this.PlanName == PlanNameEnum.carePlusYouth) {
        this._removeMaternity()
      }
      else if (this.PlanName == PlanNameEnum.careSupreme) {
        this._removeReductionOptions()
      }
    }

    // addOn details from loacl storage
    this.submit = this._buildForm();
    if (localStorage.getItem('AddOns')) {
      let data = JSON.parse(localStorage.getItem('AddOns'));
      this.submit.patchValue(data);

      this._AddOnsWithDropDownValue(this.Policies.Insurer.toLowerCase())
      let dispalyAddList = JSON.parse(localStorage.getItem('addOnsList'));
      this.addOnList.forEach((ele, index) => {
        if (this.submit.get(ele.Value).value == true) {
          let index1;
          dispalyAddList.forEach((element, index2) => {
            if (element.name == ele.AddOn) {
              index1 = index2;
            }
          });
          this.displayAddOn.push(dispalyAddList[index1]);
          ele.Answer = true;
        }
      });
      this._disableMaternity()
      this.TotalPremium = this.Policies.AddOnvalue;
      this.addOnLength = this.displayAddOn.length;
      this.flag = false;
    }

    if (this.addOnList.length == 0) {
      if (this.flag) {
        this.buyNow(this.Policies);
      } else {
        this.backClick();
      }
    }

    this._bindPin(this.HealthQuateForm.PinCode);
    this._AddMandatoryAddonInCareSenior()
    setTimeout(() => {
      this._AddMandatoryAddon() // For mandatory addon add based on pin code
    }, 1000);

    if (this.Policies.Insurer == "IFFCOTOKIO") {
      const Names = this.HealthQuateForm.Name.trim().replace(/ +/g, ' ').split(' ') == "" ? this.HealthQuateForm.SpouseName.trim().replace(/ +/g, ' ').split(' ') : this.HealthQuateForm.Name.trim().replace(/ +/g, ' ').split(' ');
      this.FName = Names[0] == undefined ? "" : Names[0];
      this.LName = Names.length > 2 ? (Names[2] == undefined ? "" : Names[2]) : (Names[1] == undefined ? "" : Names[1])
      this.submit.get("FirstName").patchValue(this.FName)
      this.submit.get("LastName").patchValue(this.LName)
      this.PolicyNo = this.submit.get("IffcoTokioPolicyNo").value

      // In case of Sum Insured amount greater then "5 lakhs" than remove addon "Room rent waiver rider" 
      if (parseFloat(this.HealthQuateForm.SumInsured) >= 500000) {
        if (this.addOnList.length > 0) {
          this.addOnList.forEach((el, i) => {
            if (el.Value == "RoomRentWaiver") {
              this.addOnList.splice(i, 1);
            }
          });
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

  public backClick() {
    if (window.location.href.indexOf('mediclaim') != -1) {
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.List]);
    }
    else {
      this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.List]);
    }

  }

  // passing the object of selected policy along with addOns
  public buyNow(plan) {
    this._resetForm();
    plan.AddOnvalue = this.TotalPremium;
    localStorage.setItem('buynow', JSON.stringify(plan));
    localStorage.setItem('AddOns', JSON.stringify(this.submit.value));
    localStorage.setItem('addOnsList', JSON.stringify(this.displayAddOn));
    let temp = plan.Insurer.toLowerCase();
    if (plan.Insurer.toLowerCase()) {

      if (window.location.href.indexOf('mediclaim') != -1) {
        this._router.navigate([ROUTING_PATH.QuoteMediclaim.ProposalPage + temp]);
      }
      else {
        this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.ProposalPage + temp]);
      }

    }
  }

  get PlanNameEnum() {
    return PlanNameEnum
  }

  // function to add add-Ons
  /**
   * 
   * @param plan : name of the plan
   * @param key : formControlName in submit form
   * @param answer : to identify if AddOn is added or removed (true or false)
   * @param add : Name of the AddOn that will be displayed in the summary
   */
  public AddOns(plan, key, answer, add, CanUpdateDisplayAddOn = false) {

    /**
     * In case of Critical Illness then check mandatory fields validation
     * 
     */
    if (plan == 'ICICI' && add == 'Critical Illness') {
      this.validateCreticalIllness()

      if (this.creticalIllnessErrorAlerts.length > 0) {
        this._alertService.raiseErrors(this.creticalIllnessErrorAlerts);
        return;
      }
    }

    /**
     * if key is ICS1149 or PEDWP1Y1155 or PEDWP2Y1156 or PEDWP3Y1157
     * then check condition and if conditions are satisfied than requesting API 
     * else raise alert message
     *  if key are not as mentioned above than follow normal flow
     */

    if (plan == 'Care') {
      this.requestInProcessFlag = false
      this._careAddon(key, answer);
      if (key == 'ICS1149' || key == 'PEDWP1Y1155' || key == 'PEDWP2Y1156' || key == 'PEDWP3Y1157') {
        let error: Alert[] = []
        error = this._careSupremeAddOnCondition(key, add)
        if (error.length > 0) {
          this._alertService.raiseErrors(error)
          this.submit.get(key).patchValue(!this.submit.get(key).value);
          this.requestInProcessFlag = true
          return
        }        
        this.addOnService
          .createAddOn(this.Care, API_ENDPOINTS.Care.AddOns)
          .subscribe((res) => {
            if (res.Success) {
              this._displayAddonInList(add, answer, key, res);
            } else {
              this._alertService.raiseErrorAlert(res.Message)
              this.submit.get(key).patchValue(!this.submit.get(key).value);
            }
            this.requestInProcessFlag = true
          });
      }
      else {
        this.addOnService
          .createAddOn(this.Care, API_ENDPOINTS.Care.AddOns)
          .subscribe((res) => {
            if (res.Success) {
              this._displayAddonInList(add, answer, key, res, CanUpdateDisplayAddOn);
            } else {
              this._alertService.raiseErrorAlert(res.Message)
              this.submit.get(key).patchValue(!this.submit.get(key).value);
            }
            this.requestInProcessFlag = true
          });
      }

    }

    /**
     * then check condition and if conditions are satisfied than requesting API 
     * else raise alert message
     *  if key are not as mentioned above than follow normal flow
     */

    else if (plan == 'IffcoTokio') {
      let errorMessage: Alert[] = [];
      this.requestInProcessFlag = false
      this._iffcoTokioAddon(key, answer);

      // check 'IffcoTokioPolicy' validation
      if (key == 'IffcoTokioPolicy') {
        errorMessage = this._checkIffcoTokioPolicyValidation(add)
      }

      if (errorMessage.length > 0) {
        this._alertService.raiseErrors(errorMessage)
        this.submit.get(key).patchValue(!this.submit.get(key).value);
        this.requestInProcessFlag = true
        return
      }
      else {

        // In case of add on is "IffcoTokioPolicy" and Policy No is not null than Policy no field is 'ReadOnly' mode.
        if (key == 'IffcoTokioPolicy') {
          if (answer) {
            this.IsReadOnlyIffcoTokioPolicy = true;
          }
          else {
            this.IsReadOnlyIffcoTokioPolicy = false;
          }
        }

        this.addOnService
          .createAddOn(this.IffcoTokio, API_ENDPOINTS.IFFCO_TOKIO.AddOns)
          .subscribe((res) => {
            if (res.Success) {
              this._displayAddonInList(add, answer, key, res, CanUpdateDisplayAddOn);
            } else {
              this._alertService.raiseErrorAlert(res.Message)
              this.submit.get(key).patchValue(!this.submit.get(key).value);
              this.IsReadOnlyIffcoTokioPolicy = false;
            }
            this.requestInProcessFlag = true
          });
      }
    }

    /**
     * For ICICI AddOns
     * If value of add is 'PA' and answer is true than open a popUp to get the data of the occupation of children 
     * and monthly income of proposer.
     * if add is 'PA' but answer is false or if add is not 'PA' than it will send the request to the API to get the new Premium.
     * 
     * if add is 'New Born' or 'Vaccination' but 'Maternity' addOn is false than in that case error message will be raised
     */
    else if (plan == 'ICICI') {
      this.requestInProcessFlag = false
      this._iciciAddon(key, answer, add);
      if (this.HealthQuateForm.NoOfChildren > 0 && add == 'PA' && answer == true) {
        this.openDiolog(add, answer, key)
      }
      else if ((add == 'New Born' || add == 'Vaccination') && !this.submit.get('AddOn3').value) {
        let errorMessage: Alert[] = this._checkMaternity(add)
        if (errorMessage.length > 0) {
          this._alertService.raiseErrors(errorMessage)
          this.requestInProcessFlag = true
          this.submit.get(key).patchValue(!this.submit.get(key).value);
          return
        }
      }
      else {
        this.addOnService
          .createAddOn(this.ICICI, API_ENDPOINTS.ICICI.AddOns)
          .subscribe((res) => {
            if (res.Success) {
              this._displayAddonInList(add, answer, key, res);
            } else {
              this._alertService.raiseErrorAlert(res.Message)
              this.submit.get(key).patchValue(!this.submit.get(key).value);
            }
            this.requestInProcessFlag = true
          });
      }
    }

    else if (plan == 'GoDigit' && this.requestInProcessFlag) {
      // if (key=='RHIWP' && answer==true) {
      //   if (this.submit.get('RHIWPValue').invalid) {
      //     this._alertService.raiseErrorAlert('Initial Waiting Period must be between 7 to 30 Days')
      //     return
      //   }        
      // }
      this.requestInProcessFlag = false
      this._goDigitAddon(key, answer);
      this.addOnService
        .createAddOn(this.GoDigit, API_ENDPOINTS.Godigit.AddOns)
        .subscribe((res) => {
          if (res.Success) {
            this._displayAddonInList(add, answer, key, res);
          } else {
            this._alertService.raiseErrorAlert(res.Message)
            this.submit.get(key).patchValue(!this.submit.get(key).value);
          }
          this.requestInProcessFlag = true
        });
    }

    else if (plan == 'Bajaj' && this.requestInProcessFlag) {
      this.requestInProcessFlag = false
      this._bajajAddon(key, answer);
      this.addOnService
        .createAddOn(this.Bajaj, API_ENDPOINTS.BajajAllianzHealth.AddOns)
        .subscribe((res) => {
          if (res.Success) {
            this._displayAddonInList(add, answer, key, res);
          } else {
            this._alertService.raiseErrorAlert(res.Message)
            this.submit.get(key).patchValue(!this.submit.get(key).value);
          }
          this.requestInProcessFlag = true
        });
    }

    else if (plan == 'Hdfc' && this.requestInProcessFlag) {
      this.requestInProcessFlag = false
      this._hdfcAddon(key, answer);

      if (key == 'deductibleBoolean' && answer == true && this.submit.get('Deductible').value < 1) {
        this._alertService.raiseErrorAlert('Select Deductible amount.')
        this.requestInProcessFlag = true
        this.submit.get(key).patchValue(!this.submit.get(key).value);
        return
      }
      else {
        this.addOnService.createAddOn(this.Hdfc, API_ENDPOINTS.HDFC.AddOns).subscribe((res) => {
          if (res.Success) {
            this._displayAddonInList(add, answer, key, res);
          } else {
            this._alertService.raiseErrorAlert(res.Message)
            this.submit.get(key).patchValue(!this.submit.get(key).value);
          }
          this.requestInProcessFlag = true
        });
      }

    }
  }



  /**
   * This Function for Default Add Add-on as per Given API call
   */
  private _AddMandatoryAddonInCareSenior() {

    // Make list Of all member Birthdate
    if (this.PlanName == PlanNameEnum.careSenior) {
      let birthdateList = []
      this.member.forEach(member => {
        if (member.title) {
          birthdateList.push(this.HealthQuateForm[`${member.title}DOB`])
        }

      })

      // Find Max Birthdate all of Inssured Member
      let moments = birthdateList.map(d => moment(d)),
        maxDate = moment.min(moments)

      // Call API For Get CAre senior Mandatory Add on
      this.addOnService.GetCareMandatoryAddOns(this.Policies.ProductCode, this.HealthQuateForm.PinCode, moment(maxDate).format("YYYY-MM-DD")).subscribe(res => {
        if (res.Success && res.Data && res.Data.AddOns.length > 0) {
          this.AllMandatoryAddOn = res.Data.AddOns
          let MandatoryAddOn = this.addOnList.filter(addon => res.Data.AddOns.includes(addon.Value))

          // Add ALl Madarory Add-on
          MandatoryAddOn.forEach(async ele => {
            await this.AddOns(ele.Function, ele.Value, true, ele.AddOn)
          })

        }

      })
    }

  }

  /**
 * This Function for Default Add Add-on as per Given API call
 */
  private _AddMandatoryAddon() {

    if (this.PlanName == PlanNameEnum.icici_HAE_ApexPlus) {

      // Call API For Get Mandatory Add on
      this.addOnService.GetMandatoryAddOns(this.Policies.SubProductCode, this.HealthQuateForm.PinCode).subscribe(res => {
        if (res.Success && res.Data && res.Data.AddOns.length > 0) {
          let MandatoryAddOn = this.addOnList.filter(addon => res.Data.AddOns.includes(addon.Value))

          // Add ALl Madarory Add-on
          MandatoryAddOn.forEach(async ele => {
            this.AllMandatoryAddOn.push(ele.Value);

            // find the added addons
            let AddOnExits = this.displayAddOn.filter(addon => addon.name == ele.AddOn)
            // if already addons added then not addon in list otherwise addon add in list
            if (AddOnExits.length <= 0) {
              await this.AddOns(ele.Function, ele.Value, true, ele.AddOn)
            }
          })

        }

      })

      //#region 
      /**
       * In case of Sum Insured is 1 Crore and 1 Crore above then include below add on default in add on list
       * 1. Nursing at Home (ICICI >>> Apex_Plus_R Plan)
       * 2. Compassionate Visit (ICICI >>> Apex_Plus_R Plan)
       */
      if (this.Policies.SumInsured >= 10000000) {
        let MandatoryAddOn = this.addOnList.filter(addon => addon.Value == "AddOn86" || addon.Value == "AddOn85")

        // Add ALl Mandatory Add-on
        MandatoryAddOn.forEach(async ele => {
          this.AllMandatoryAddOn.push(ele.Value);

          // find the added addons
          let AddOnExits = this.displayAddOn.filter(addon => addon.name == ele.AddOn)
          // if already addons added then not addon in list otherwise addon add in list
          if (AddOnExits.length <= 0) {
            await this.AddOns(ele.Function, ele.Value, true, ele.AddOn)
          }
        });
      }
      //#endregion

    }

  }


  // Disable Dropdown Option As per Condition
  /**
   * If have MAndatory Add is dropdown then Change Call Premium Calculation API
   * else If Added addon manual affter disable all option
   * @param addOnValue 
   * @returns 
   */
  public CanDisableDrpListOption(addOnValue) {


    if (this.AllMandatoryAddOn.length > 0 && this.AllMandatoryAddOn.includes(addOnValue)) {
      return false
    } else {
      if (!this.requestInProcessFlag || this.submit.get(addOnValue).value) {
        return true
      } else {
        return false
      }
    }

  }


  /**
   * WHen Change Addon value option when it, included in mandatory Dropdown
  * @param plan : name of the plan
   * @param key : formControlName in submit form
   * @param answer : to identify if AddOn is added or removed (true or false)
   * @param add : Name of the AddOn that will be displayed in the summary
   */

  public ChangeDropDownValue(plan, key, answer, add) {
    if (this.AllMandatoryAddOn.includes(key)) {
      this.AddOns(plan, key, true, add, true)
    }
  }
  // change event for dropDown
  /**
   * CompanyName wise change in dropDown 
   */
  public dropDownChangeEvent(event, index: number, CompanyName: string) {

    let value = event.target.value
    if (CompanyName == 'Care') {
      if (this.addOnList[index].AddOn == 'Reduction in PDE') {
        this.addOnList[index].Value = value
      }

    }
    else if (CompanyName == 'Bajaj') {
      this.submit.get('CoPay').patchValue(value)
    }
    // else if (CompanyName == 'GoDigit') {
    //   if (this.addOnList[index].Value == 'RHPDW') {
    //     this.submit.get('RHPDWValue').patchValue(value)
    //   }
    //   else if (this.addOnList[index].Value == 'RHIWP') {
    //     this.submit.get('RHIWPValue').patchValue(value)
    //   }
    // }
  }

  /**
   * When this page is open in mobile screen the details of added Addons is shown in PopUp 
   */
  public AddOnDetailsPopUp() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '70vw';
    dialogConfig.minWidth = '60vw';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      data: this.displayAddOn,
      title: 'Add Ons',
      base: this.Policies.TotalPremium,
      total: this.TotalPremium,
      ispopup: true,
    };

    const dialogRef = this.dialog.open(AddOnDetailsPopUpComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
      }
    });
  }

  /**
   * Pop Up to add data of Occupaton of selected children for ICICI 'PA' Addon
   * 
   * @param add : Name of the AddOn that will be displayed in the summary  
   * @param answer : if addOn is added or removed (answer for addOn is true or false)
   * @param key : key of the respective AddOn in submit Form 
   */
  public openDiolog(add, answer, key) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '35vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      data: this._selectedChildernArray(),
      title: 'Occupation',
      ispopup: true,
    };

    const dialogRef = this.dialog.open(AddOnDataForChildComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((resChild) => {
      if (resChild) {
        this._childOccupationDetails(resChild)
        this.addOnService
          .createAddOn(this.ICICI, API_ENDPOINTS.ICICI.AddOns)
          .subscribe((res) => {
            if (res.Success) {
              this._displayAddonInList(add, answer, key, res);
            } else {
              this._alertService.raiseErrorAlert(res.Message)
              this.submit.get(key).patchValue(false);
            }
            this.requestInProcessFlag = true
          });
      }
      else {
        this.requestInProcessFlag = true
        this.submit.get(key).patchValue(false);
      }
    });
  }

  /**
   * Bind value of input in submit form using change event
   */

  public bindInputValueInSubmitForm(Type: string, event) {
    if (Type == "ProposalDOB") {
      this.submit.get("ProposalDOB").patchValue(event.target.value)
    }
    else if (Type == "ProposalIncome") {
      this.submit.get("ProposalIncome").patchValue(event.target.value)
    }
    else if (Type == "IffcoTokioPolicyNo") {
      this.submit.get("IffcoTokioPolicyNo").patchValue(event.target.value)
    }
    else if (Type == "IffcoTokioFirstName") {
      this.submit.get("FirstName").patchValue(event.target.value)
    }
    else if (Type == "IffcoTokioLastName") {
      this.submit.get("LastName").patchValue(event.target.value)
    }
  }

  //#endregion public-methods

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------


  /**
   * remove Maternity AddOn if Policy Type is Individual (for care Youth Plus plan)
   */
  private _removeMaternity() {
    if (this.PlanName == PlanNameEnum.carePlusYouth) {
      if (this.PolicyType == 'Individual') {
        for (let i = this.addOnList.length - 1; i >= 0; i--) {
          if (this.addOnList[i].Value == 'MCCP1111') {
            this.addOnList.splice(i, 1)
          }
        }
      }
    }
  }

  /**
   * remove 2 and 3 year option from dropdown for AddOn = 'Reduction in PDE' 
   * [condition : age of any member must be 97 or more than 97 ]
   */
  private _removeReductionOptions() {
    this.member.forEach((data, index) => {
      let title
      switch (data.title) {
        case 'Daughter':
          title = 'Child1';
          break;
        case 'Daughter1':
          title = 'Child1';
          break;
        case 'Daughter2':
          title = 'Child2';
          break;
        case 'Daughter3':
          title = 'Child3';
          break;
        case 'Son':
          title = 'Child4';
          break;
        case 'Son1':
          title = 'Child4';
          break;
        case 'Son2':
          title = 'Child5';
          break;
        case 'Son3':
          title = 'Child6';
          break;
        default:
          title = data.title
          break;
      }
      let currentDate = new Date()
      let Age = moment(currentDate).diff(this.HealthQuateForm[`${title}DOB`], 'year')
      if (Age >= 97) {
        let value = this.addOnList.findIndex(option => option.AddOn.includes('Reduction in PDE'))
        this.addOnList.at(value).OptionArray = [{ 'name': '1 Year', 'value': 'PEDWP1Y1155' }]
      }
    })
  }

  /**
   * if plan is care supreme that Instant Cover & Reduction in PDE cannot be selected simultaneously
   * @param addOnValue : Key of addOn
   * @param addOnName : Description of the plan that is displayed
   * @returns : error message
   */
  private _careSupremeAddOnCondition(addOnValue, addOnName) {
    let alert: Alert[] = []
    let ICDescription: string = 'Instant Cover'
    let PEDDescription: string = 'Reduction in PDE'

    if (this.PlanName == PlanNameEnum.careSupreme) {
      if (addOnValue == 'ICS1149' && (this.submit.get('PEDWP1Y1155').value || this.submit.get('PEDWP2Y1156').value || this.submit.get('PEDWP3Y1157').value)) {
        alert.push({
          Message: `${addOnName} and ${PEDDescription} cannot be selected together`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
      else if ((addOnValue == 'PEDWP1Y1155' || addOnValue == 'PEDWP2Y1156' || addOnValue == 'PEDWP3Y1157') && this.submit.get('ICS1149').value) {
        alert.push({
          Message: `${addOnName} and ${ICDescription} cannot be selected together`,
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    return alert
  }

  /**
 * 
 * @param AddOnName : Name of the AddOn 
 * (Iffco Tokio)
 */
  private _checkIffcoTokioPolicyValidation(AddOnName) {
    let alert: Alert[] = []
    if (this.submit.get('IffcoTokioPolicyNo').value.trim() == "" || this.submit.get('IffcoTokioPolicyNo').value == null) {
      alert.push({
        Message: `Policy No AddOn is mandatory for ${AddOnName} AddOn`,
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.submit.get('FirstName').value.trim() == "" || this.submit.get('FirstName').value == null) {
      alert.push({
        Message: `First Name AddOn is mandatory for ${AddOnName} AddOn`,
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.submit.get('LastName').value.trim() == "" || this.submit.get('LastName').value == null) {
      alert.push({
        Message: `Last Name AddOn is mandatory for ${AddOnName} AddOn`,
        CanDismiss: false,
        AutoClose: false,
      });
    }
    return alert
  }

  /**
   * 
   * @param AddOnName : Name of the AddOn 
   * @returns error message if Maternity AddOn is not selected
   * (icici)
   */
  private _checkMaternity(AddOnName) {
    let alert: Alert[] = []
    if (!this.submit.get('AddOn3').value) {
      alert.push({
        Message: `Maternity AddOn is mandatory for ${AddOnName} AddOn`,
        CanDismiss: false,
        AutoClose: false,
      });
    }
    return alert
  }


  // if 'Vaccination' or 'New Born' is added in displayAddOn maternity AddOn becomes disable
  // Maternity cover is required for 'Vaccination' or 'New Born'AddOn . So Maternity cover cannot be removed till 
  // 'Vaccination' or 'New Born'are selected
  // (icici)
  private _disableMaternity() {
    if (this.PlanName == PlanNameEnum.icici_HAE_ApexPlus) {
      this.displayAddOn.forEach((element, index) => {
        if (element.name == 'New Born' || element.name == 'Vaccination') {
          this.addOnList.forEach((element, index) => {
            if (element.AddOn == 'Maternity') {
              element.Dependable = true;
            }
          })
        }
      })
    }
  }

  /**
   * Check number of children that are to be insured 
   * If number of children is 0 than remove AddOn 'PA' from the AddOn List
   */
  private _checkNoOfChildren() {
    if (this.HealthQuateForm.NoOfChildren == 0) {
      for (let i = this.addOnList.length - 1; i >= 0; i--) {
        if (this.addOnList[i].AddOn == 'PA') {
          this.addOnList.splice(i, 1)
        }
      }
    }
  }

  /**
   * for Addon 'PA' in ICICI , Occupation of children is required along with the monthly income of proposer.
   * So the value of Occupation is taken from the Pop before the add is added .
   */
  private _childOccupationDetails(childOccupationData) {
    this.ICICI.PolicyMemberDetails.at(0).AddOn8SI = childOccupationData.SumInsured
    this.ICICI.PolicyHolder.GrossMonthlyIncome = childOccupationData.Income
    this.submit.get('Income').patchValue(childOccupationData.Income)
    this.member.forEach((element, index) => {
      switch (element.title) {
        case 'Daughter':
          this.ICICI.PolicyMemberDetails.at(index).Occupation = childOccupationData.Child1
          this.submit.get('Child1').patchValue(childOccupationData.Child1)
          break;
        case 'Daughter1':
          this.ICICI.PolicyMemberDetails.at(index).Occupation = childOccupationData.Child1
          this.submit.get('Child1').patchValue(childOccupationData.Child1)
          break;
        case 'Daughter2':
          this.ICICI.PolicyMemberDetails.at(index).Occupation = childOccupationData.Child2
          this.submit.get('Child2').patchValue(childOccupationData.Child2)
          break;
        case 'Daughter3':
          this.ICICI.PolicyMemberDetails.at(index).Occupation = childOccupationData.Child3
          this.submit.get('Child3').patchValue(childOccupationData.Child3)
          break;
        case 'Son':
          this.ICICI.PolicyMemberDetails.at(index).Occupation = childOccupationData.Child4
          this.submit.get('Child4').patchValue(childOccupationData.Child4)
          break;
        case 'Son1':
          this.ICICI.PolicyMemberDetails.at(index).Occupation = childOccupationData.Child4
          this.submit.get('Child4').patchValue(childOccupationData.Child4)
          break;
        case 'Son2':
          this.ICICI.PolicyMemberDetails.at(index).Occupation = childOccupationData.Child5
          this.submit.get('Child5').patchValue(childOccupationData.Child5)
          break;
        case 'Son3':
          this.ICICI.PolicyMemberDetails.at(index).Occupation = childOccupationData.Child6
          this.submit.get('Child6').patchValue(childOccupationData.Child6)
          break;
      }
    })

  }

  /**
   * to know the number of children selected . 
   * Fop ICICI addon 'PA' , Occupation of children is required . So to get the value of Occupation of respective child Pop up is opened .
   * Number of children selected is given by this funtion.
   */
  private _selectedChildernArray() {
    let selectedChildren = []
    let arrayOfChild = [{ name: 'Child1Name', formControl: 'Child1' }, { name: 'Child2Name', formControl: 'Child2' }, { name: 'Child3Name', formControl: 'Child3' }, { name: 'Child4Name', formControl: 'Child4' }, { name: 'Child5Name', formControl: 'Child5' }, { name: 'Child6Name', formControl: 'Child6' }]
    arrayOfChild.forEach((element, index) => {
      if (this.HealthQuateForm[`${element.name}`] != '') {
        selectedChildren.push({ label: element.formControl, name: this.HealthQuateForm[`${element.name}`] })
      }
    })
    return selectedChildren
  }

  // check if spouse is covered or not and if covered , check if the gender of spouse is Female and also check that policy Period is 3 years
  /**
   * AddOn : Maternity ,Vaccination, New Born will only be shown if above mention condition are satisfied 
   * If not than those three addOns will be removed from addOnList
   */
  private _checkSpouseGenderForMaternity() {
    /**
     * || this.HealthQuateForm.SpouseGender != 'Female' || this.HealthQuateForm.PolicyPeriod != '3'
     * Remove Condition by Samir Patel
     */
    if (!this.HealthQuateForm.SpouseCoverRequired) {
      for (let i = this.addOnList.length - 1; i >= 0; i--) {
        if (this.addOnList[i].AddOn == 'Maternity' || this.addOnList[i].AddOn == 'New Born' || this.addOnList[i].AddOn == 'Vaccination') {
          this.addOnList.splice(i, 1)
        }
      }
    }
  }

  /**
   * For AddOn 'Reduction in PDE' of care , there is a dropdown to select number of years 
   * as per the selected year formControlName of submit form PEDWP1Y1155 for 1 year , PEDWP2Y1156 for 2 year , PEDWP3Y1157 for 3 year
   * the value of selected year is true while other are false
   * When user returns to addOn page from Care Health Form , to know which year was selected the below function is called 
   * @param companyName : name of the Insurance Company 
   */
  private _AddOnsWithDropDownValue(companyName) {
    if (companyName == InsuranceCompanyName.Care) {
      this.addOnList.forEach((element, index) => {
        if (element.Dropdown) {
          element.OptionArray.forEach((dropDownvalue, index1) => {
            if (this.submit.get(dropDownvalue.value).value == true) {
              element.Value = dropDownvalue.value
            }
          })
        }
      })
    }

  }

  // Care Add-Ons
  private _careAddon(key, value) {
    this.submit.get(key).patchValue(value);

    this.Care = new BuyCareDto();
    const Names = this.HealthQuateForm.Name.trim()
      .replace(/ +/g, ' ')
      .split(' ');
    this.Care.TransactionNo = this.Policies.QuoteNo;
    this.Care.PolicyDetail = {
      PolicyStartDate: '',
      SubProductCode: this.Policies.SubProductCode,
      Productcode: this.Policies.ProductCode,
      SumInsured: this.Policies.SumInsured,
      PolicyPeriod: this.Policies.PolicyPeriod,
      ProductName: this.Policies.ProductName,
      PolicyType: this.Policies.PolicyType,
      SMARTCA: this.submit.get('SMARTCA').value,
      CAREADWITHNCB: false,
      RRMCA: this.submit.get('RRMCA').value,
      AACCA1090: this.submit.get('AACCA1090').value,
      COPAYWAIVER1103: this.submit.get('COPAYWAIVER1103').value,
      EXTOFGCEU: this.submit.get('EXTOFGCEU').value,
      EXTOFGIU: this.submit.get('EXTOFGIU').value,
      RIPEDCA1092: this.submit.get('RIPEDCA1092').value,
      CARESHILED1104: this.submit.get('CARESHILED1104').value,
      HCUPCA1093: this.submit.get('HCUPCA1093').value,
      CARESHILEDCF1209: this.submit.get('CARESHILEDCF1209').value,
      CFWHC: this.submit.get('CFWHC').value,
      SMART: this.submit.get('SMART').value,
      CAREWITHNCB: this.submit.get('CAREWITHNCB').value,
      OPDCARE: this.submit.get('OPDCARE').value,
      OPDCARESI: this.submit.get('OPDCARE').value ? this.submit.get('OPDCARESI').value : 0,
      CFHP: this.submit.get('CFHP').value,
      ISOCP1112: this.submit.get('ISOCP1112').value,
      MCCP1111: this.submit.get('MCCP1111').value,
      CAREFREEDOMDEDUCTIBLERIDER25000: this.submit.get('CAREFREEDOMDEDUCTIBLERIDER25000').value,
      AHCS1144: this.submit.get('AHCS1144').value,
      NCBS1145: this.submit.get('NCBS1145').value,
      ICS1149: this.submit.get('ICS1149').value,
      CS1154: this.submit.get('CS1154').value,
      PEDWP1Y1155: this.submit.get('PEDWP1Y1155').value,
      PEDWP2Y1156: this.submit.get('PEDWP2Y1156').value,
      PEDWP3Y1157: this.submit.get('PEDWP3Y1157').value,
      COPD1211: this.submit.get('COPD1211').value,
      BFS1148: this.submit.get('BFS1148').value,
      SSCP1113: this.submit.get('SSCP1113').value,
      COPAY1194: this.submit.get('COPAY1194').value,
    };
    this.Care.PolicyHolder = {
      FirstName: Names[0],
      MiddleName: Names.length > 2 ? Names[1] : '',
      LastName: Names.length > 2 ? Names[2] : Names[1],
      Mobile: this.HealthQuateForm.Mobile,
      Email: this.HealthQuateForm.EmailId,
      Gender: this.HealthQuateForm.SelfGender,
      DOB: this.HealthQuateForm.SelfDOB,
      CountryCode: this.submit.get('CountryCode').value,
      StateCode: this.submit.get('StateCode').value,
      PinCode: this.HealthQuateForm.PinCode,
      Address: '',
      Street: '',
      City: this.submit.get('City').value,
      Address1: '',
      KYCId: '',
      PANNo: '',
      NomineeFirstName: '',
      NomineeMiddleName: '',
      NomineeLastName: '',
      NomineeRelation: '',
    };
    this.Care.PolicyMemberDetails = [];
    this.member.forEach((data, index) => {
      let name;
      let title;
      let relation;
      if (data.title != 'Self') {
        if (
          data.title.indexOf('Daughter') < 0 &&
          data.title.indexOf('Son') < 0
        ) {
          title = data.title;
          relation = data.title;
        }
        if (
          data.title.indexOf('Daughter') == 0 ||
          data.title.indexOf('Son') == 0
        ) {
          switch (data.title) {
            case 'Daughter':
              title = 'Child1';
              relation = 'Daughter';
              break;
            case 'Daughter1':
              title = 'Child1';
              relation = 'Daughter';
              break;
            case 'Daughter2':
              title = 'Child2';
              relation = 'Daughter';
              break;
            case 'Daughter3':
              title = 'Child3';
              relation = 'Daughter';
              break;
            case 'Son':
              title = 'Child4';
              relation = 'Son';
              break;
            case 'Son1':
              title = 'Child4';
              relation = 'Son';
              break;
            case 'Son2':
              title = 'Child5';
              relation = 'Son';
              break;
            case 'Son3':
              title = 'Child6';
              relation = 'Son';
              break;
          }
        }
        name = this.HealthQuateForm[`${title}Name`]
          .trim()
          .replace(/ +/g, ' ')
          .split(' ');
      }

      let gender;
      if (data.title == 'Mother') {
        gender = 'Female';
      } else if (data.title == 'Father') {
        gender = 'Male';
      } else {
        gender = this.HealthQuateForm[`${title}Gender`];
      }

      this.Care.PolicyMemberDetails.push({
        FirstName: data.title == 'Self' ? Names[0] : name[0],
        MiddleName:
          data.title == 'Self'
            ? Names.length > 2
              ? Names[1]
              : ''
            : name.length > 2
              ? name[1]
              : '',
        LastName:
          data.title == 'Self'
            ? Names.length > 2
              ? Names[2]
              : Names[1]
            : name.length > 2
              ? name[2]
              : name[1],
        Relation: data.title == 'Self' ? data.title : relation,
        DOB:
          data.title == 'Self'
            ? this.HealthQuateForm[`${data.title}DOB`]
            : this.HealthQuateForm[`${title}DOB`],
        Gender:
          data.title == 'Self'
            ? this.HealthQuateForm[`${data.title}Gender`]
            : gender,
        HeightCM: 0,
        WeightKG: 0,
        Occupation: '',
        MemberPEDList: [],
      });
    });
  }

  // IffcoTokio Add-Ons
  private _iffcoTokioAddon(key, value) {
    this.submit.get(key).patchValue(value);

    this.IffcoTokio = new IffcoTokioDto();
    const Names = this.HealthQuateForm.Name.trim()
      .replace(/ +/g, ' ')
      .split(' ');
    this.IffcoTokio.TransactionNo = this.Policies.QuoteNo;

    this.IffcoTokio.PolicyDetail = {
      PolicyStartDate: '',
      Productcode: this.Policies.ProductCode,
      SumInsured: this.Policies.SumInsured,
      PolicyPeriod: this.Policies.PolicyPeriod,
      ProductName: this.Policies.ProductName,
      PolicyType: this.Policies.PolicyType,
      PolicyAmount: this.Policies.PolicyAmount,
    };

    this.IffcoTokio.PolicyHolder = {
      FirstName: key == 'IffcoTokioPolicy' ? this.submit.get('FirstName').value : Names[0],
      MiddleName: Names.length > 2 ? Names[1] : '',
      LastName: key == 'IffcoTokioPolicy' ? this.submit.get('LastName').value : (Names.length > 2 ? Names[2] : Names[1]),
      Mobile: this.HealthQuateForm.Mobile,
      Email: this.HealthQuateForm.EmailId,
      Gender: this.HealthQuateForm.SelfGender,
      DOB: this.HealthQuateForm.SelfDOB,
      PinCode: this.HealthQuateForm.PinCode,
      Address1: '',
      Address2: '',
      CKYCId: '',
      EmergencyContactName: '',
      EmergencyContactMobile: '',
      NomineeFirstName: '',
      NomineeMiddleName: '',
      NomineeLastName: '',
      NomineeRelation: '',
      NomineeAddress1: '',
      NomineeAddress2: '',
      NomineePinCode: '',
      KYCDocument: '',
      KYCDocumentNo: '',
      CriticalIllnessCovered: this.submit.get('CriticalIllnessCovered').value,
      RoomRentWaiver: this.submit.get('RoomRentWaiver').value,
      IffcoTokioPolicy: this.submit.get('IffcoTokioPolicy').value,
      IffcoTokioPolicyNo: this.submit.get('IffcoTokioPolicyNo').value,
    };

    this.IffcoTokio.PolicyMemberDetails = [];
    this.member.forEach((data, index) => {
      let name;
      let title;
      let relation;
      if (data.title != 'Self') {
        if (
          data.title.indexOf('Daughter') < 0 &&
          data.title.indexOf('Son') < 0
        ) {
          title = data.title;
          relation = data.title;
        }
        if (
          data.title.indexOf('Daughter') == 0 ||
          data.title.indexOf('Son') == 0
        ) {
          switch (data.title) {
            case 'Daughter':
              title = 'Child1';
              relation = 'Daughter';
              break;
            case 'Daughter1':
              title = 'Child1';
              relation = 'Daughter';
              break;
            case 'Daughter2':
              title = 'Child2';
              relation = 'Daughter';
              break;
            case 'Daughter3':
              title = 'Child3';
              relation = 'Daughter';
              break;
            case 'Son':
              title = 'Child4';
              relation = 'Son';
              break;
            case 'Son1':
              title = 'Child4';
              relation = 'Son';
              break;
            case 'Son2':
              title = 'Child5';
              relation = 'Son';
              break;
            case 'Son3':
              title = 'Child6';
              relation = 'Son';
              break;
          }
        }
        name = this.HealthQuateForm[`${title}Name`]
          .trim()
          .replace(/ +/g, ' ')
          .split(' ');
      }

      let gender;
      if (data.title == 'Mother') {
        gender = 'Female';
      } else if (data.title == 'Father') {
        gender = 'Male';
      } else {
        gender = this.HealthQuateForm[`${title}Gender`];
      }

      this.IffcoTokio.PolicyMemberDetails.push({
        FirstName: data.title == 'Self' ? Names[0] : name[0],
        MiddleName: data.title == 'Self' ? Names.length > 2 ? Names[1] : '' : name.length > 2 ? name[1] : '',
        LastName: data.title == 'Self' ? Names.length > 2 ? Names[2] : Names[1] : name.length > 2 ? name[2] : name[1],
        Relation: data.title == 'Self' ? data.title : relation,
        DOB: data.title == 'Self' ? this.HealthQuateForm[`${data.title}DOB`] : this.HealthQuateForm[`${title}DOB`],
        Gender: data.title == 'Self' ? this.HealthQuateForm[`${data.title}Gender`] : gender,
        HeightCM: 0,
        WeightKG: 0,
        Alcohol: false,
        AlcoholConsumptionPerWeek: "",
        Smoke: false,
        SmokeCigarettePerDay: "",
        Tobacco: false,
        TobaccoConsumptionPerWeek: "",
        MedicalHistoryQuestions: [],
      });
    });
  }

  // ICICI Add-Ons
  private _iciciAddon(key, value, type) {
    this.submit.get(key).patchValue(value);
    this.ICICI = new BuyCICIHeathDto();
    const Names = this.HealthQuateForm.Name.trim()
      .replace(/ +/g, ' ')
      .split(' ');
    this.ICICI.TransactionNo = this.Policies.QuoteNo;
    this.ICICI.PolicyDetail = {
      Productcode: this.Policies.ProductCode,
      SumInsured: this.Policies.SumInsured,
      PolicyStartDate: null,
      PolicyPeriod: this.Policies.PolicyPeriod,
      ProductName: this.Policies.ProductName,
      SubProductCode: this.Policies.SubProductCode,
      SubProductName: this.Policies.SubProductName,
      PaymentMode: 'Online',
      PolicyAmount: this.Policies.TotalPremium,
      CoPay: this.Policies.CoPay,
    };

    this.ICICI.PolicyHolder = {
      FirstName: Names[0],
      MiddleName: Names.length > 2 ? Names[1] : '',
      LastName: Names.length > 2 ? Names[2] : Names[1],
      DOB: this.HealthQuateForm.SelfDOB != "" ? this.HealthQuateForm.SelfDOB : "", //type == "Critical Illness" ? this._datePipe.transform(this.submit.get('ProposalDOB').value, 'yyyy-MM-dd') : this.HealthQuateForm.SelfDOB, // suggest to samirbhai
      Mobile: this.HealthQuateForm.Mobile,
      Email: this.HealthQuateForm.EmailId,
      NomineeFirstName: '',
      NomineeMiddleName: '',
      NomineeLastName: '',
      NomineeRelation: '',
      NomineeDOB: '',
      AppointeeFirstName: '',
      AppointeeMiddleName: '',
      AppointeeLastName: '',
      AppointeeRelation: '',
      AppointeeDOB: '',
      GrossMonthlyIncome: this.submit.get('ProposalIncome').value != 0 && this.submit.get('ProposalIncome').value != "" && this.submit.get('ProposalIncome').value != null ? this.submit.get('ProposalIncome').value : this.submit.get('Income').value, //type == "Critical Illness" ? this.submit.get('ProposalIncome').value : this.submit.get('Income').value, // suggest to samirbhai
      Gender: this.HealthQuateForm.SelfGender,
      Address: '',
      Address1: '',
      PinCode: this.HealthQuateForm.PinCode,
      CountryCode: this.submit.get('CountryCode').value,
      StateCode: this.submit.get('StateCode').value,
      StateName: this.submit.get('StateName').value,
      City: this.submit.get('City').value,
      CKYCId: '',
      EKYCId: '',
      PANNo: '',
      CorrelationId: '',
    };

    this.ICICI.PolicyMemberDetails = [];
    this.member.forEach((data, index) => {
      let name;
      let title;
      let relation;
      if (data.title != 'Self') {
        if (
          data.title.indexOf('Daughter') < 0 &&
          data.title.indexOf('Son') < 0
        ) {
          title = data.title;
          relation = data.title;
        }
        if (
          data.title.indexOf('Daughter') == 0 ||
          data.title.indexOf('Son') == 0
        ) {
          switch (data.title) {
            case 'Daughter':
              title = 'Child1';
              relation = 'Daughter';
              break;
            case 'Daughter1':
              title = 'Child1';
              relation = 'Daughter';
              break;
            case 'Daughter2':
              title = 'Child2';
              relation = 'Daughter';
              break;
            case 'Daughter3':
              title = 'Child3';
              relation = 'Daughter';
              break;
            case 'Son':
              title = 'Child4';
              relation = 'Son';
              break;
            case 'Son1':
              title = 'Child4';
              relation = 'Son';
              break;
            case 'Son2':
              title = 'Child5';
              relation = 'Son';
              break;
            case 'Son3':
              title = 'Child6';
              relation = 'Son';
              break;
          }
        }
        name = this.HealthQuateForm[`${title}Name`]
          .trim()
          .replace(/ +/g, ' ')
          .split(' ');
      }

      let gender;
      if (data.title == 'Mother') {
        gender = 'Female';
      } else if (data.title == 'Father') {
        gender = 'Male';
      } else {
        gender = this.HealthQuateForm[`${title}Gender`];
      }

      this.ICICI.PolicyMemberDetails.push({
        FirstName: data.title == 'Self' ? Names[0] : name[0],
        MiddleName: data.title == 'Self' ? Names.length > 2 ? Names[1] : '' : name.length > 2 ? name[1] : '',
        LastName:
          data.title == 'Self'
            ? Names.length > 2
              ? Names[2]
              : Names[1]
            : name.length > 2
              ? name[2]
              : name[1],
        Relation: data.title == 'Self' ? data.title : relation,
        DOB:
          data.title == 'Self'
            ? this.HealthQuateForm[`${data.title}DOB`]
            : this.HealthQuateForm[`${title}DOB`],
        Gender:
          data.title == 'Self'
            ? this.HealthQuateForm[`${data.title}Gender`]
            : gender,
        HeightCM: 0,
        WeightKG: 0,
        Occupation: (title == 'Child1' || title == 'Child2' || title == 'Child3' ||
          title == 'Child4' || title == 'Child5' || title == 'Child6') ?
          (this.submit.get('AddOn8').value ? this.submit.get(title).value : '') : '',
        IllnessCode13: null,
        IllnessCode14: null,
        IllnessCode15: null,
        IllnessCode16: null,
        IllnessCode17: null,
        IllnessCode18: null,
        IllnessCode19: null,
        IllnessCode20: null,
        IllnessCode21: null,
        IllnessCode22: null,
        IllnessCode23: null,
        IllnessCode24: null,
        IllnessCode25: null,
        IllnessCode26: null,
        IllnessCode27: null,
        IllnessCode28: null,
        IllnessCode29: null,
        IllnessCode30: null,
        IllnessCode31: null,
        IllnessCode32: null,
        IllnessCode33: null,
        AddOn1: this.submit.get('AddOn1').value,
        AddOn3: this.Policies.SubProductName == PlanNameEnum.icici_HAE_ApexPlus ? (data.title == 'Spouse' ? this.submit.get('AddOn3').value : false) : this.submit.get('AddOn3').value,
        AddOn9: false,
        AddOn10: false,
        AddOn11: false,
        AddOn12: this.submit.get('AddOn12').value,
        AddOn5: this.Policies.SubProductName == PlanNameEnum.icici_HAE_ApexPlus ? (data.title == 'Spouse' ? this.submit.get('AddOn5').value : false) : this.submit.get('AddOn5').value,
        AddOn6: false,
        AddOn7: false,
        AddOn8: data.title == 'Self' ? this.submit.get('AddOn8').value : false,
        AddOn4: data.title == 'Spouse' ? this.submit.get('AddOn4').value : false,
        AddOn2: this.submit.get('AddOn2').value,
        AddOn13: this.submit.get('AddOn13').value,
        AddOn1SI: 0,
        AddOn2SI: 0,
        AddOn3SI: 0,
        AddOn4SI: 0,
        AddOn5SI: 0,
        AddOn6SI: 0,
        AddOn7SI: 0,
        AddOn8SI: data.title == 'Self' ? (this.submit.get('AddOn8').value ? this.Policies.SumInsured : 0) : 0,
        AddOn9SI: 0,
        AddOn10SI: 0,
        AddOn11SI: 0,
        AddOn12SI: 0,
        AddOn13SI: 0,
        AddOn85: this.submit.get('AddOn85').value,
        AddOn86: this.submit.get('AddOn86').value,
        AddOn89: this.submit.get('AddOn89').value,
      });
    });
  }

  // Bajaj Add-Ons
  private _bajajAddon(key, value) {
    this.submit.get(key).patchValue(value);
    this.Bajaj = new BajajBuyNowDto();
    const Names = this.HealthQuateForm.Name.trim()
      .replace(/ +/g, ' ')
      .split(' ');
    this.Bajaj.TransactionNo = this.Policies.QuoteNo;

    this.Bajaj.PolicyDetail = {
      Productcode: this.Policies.ProductCode,
      SubProductName: this.Policies.SubProductName,
      ProductName: this.Policies.ProductName,
      SubProductCode: this.Policies.SubProductCode,
      SumInsured: this.Policies.SumInsured,
      PolicyStartDate: null,
      PolicyPeriod: this.Policies.PolicyPeriod,
      PaymentMode: 'Online',
      Polcov46: this.submit.get('Polcov46').value,
      Polcovvolntrycp: this.submit.get('Polcovvolntrycp').value ? this.submit.get('CoPay').value : '',
    };

    this.Bajaj.PolicyHolder = {
      FirstName: Names[0],
      MiddleName: Names.length > 2 ? Names[1] : '',
      LastName: Names.length > 2 ? Names[2] : Names[1],
      Mobile: this.HealthQuateForm.Mobile,
      TelephoneNo: '',
      Email: this.HealthQuateForm.EmailId,
      Gender: this.HealthQuateForm.SelfGender,
      DOB: this.HealthQuateForm.SelfDOB,
      CountryCode: this.submit.get('CountryCode').value,
      StateCode: this.submit.get('StateCode').value,
      PinCode: this.HealthQuateForm.PinCode,
      Address: '',
      Street: '',
      City: this.submit.get('City').value,
      Address1: '',
    };

    this.Bajaj.PolicyMemberDetails = [];
    this.member.forEach((data, index) => {
      let name;
      let title;
      let relation;
      if (data.title != 'Self') {
        if (
          data.title.indexOf('Daughter') < 0 &&
          data.title.indexOf('Son') < 0
        ) {
          title = data.title;
          relation = data.title;
        }
        if (
          data.title.indexOf('Daughter') == 0 ||
          data.title.indexOf('Son') == 0
        ) {
          switch (data.title) {
            case 'Daughter':
              title = 'Child1';
              relation = 'Daughter';
              break;
            case 'Daughter1':
              title = 'Child1';
              relation = 'Daughter';
              break;
            case 'Daughter2':
              title = 'Child2';
              relation = 'Daughter';
              break;
            case 'Daughter3':
              title = 'Child3';
              relation = 'Daughter';
              break;
            case 'Son':
              title = 'Child4';
              relation = 'Son';
              break;
            case 'Son1':
              title = 'Child4';
              relation = 'Son';
              break;
            case 'Son2':
              title = 'Child5';
              relation = 'Son';
              break;
            case 'Son3':
              title = 'Child6';
              relation = 'Son';
              break;
          }
        }
        name = this.HealthQuateForm[`${title}Name`]
          .trim()
          .replace(/ +/g, ' ')
          .split(' ');
      }

      let gender;
      if (data.title == 'Mother') {
        gender = 'Female';
      } else if (data.title == 'Father') {
        gender = 'Male';
      } else {
        gender = this.HealthQuateForm[`${title}Gender`];
      }

      this.Bajaj.PolicyMemberDetails.push({
        FirstName: data.title == 'Self' ? Names[0] : name[0],
        MiddleName:
          data.title == 'Self'
            ? Names.length > 2
              ? Names[1]
              : ''
            : name.length > 2
              ? name[1]
              : '',
        LastName:
          data.title == 'Self'
            ? Names.length > 2
              ? Names[2]
              : Names[1]
            : name.length > 2
              ? name[2]
              : name[1],
        Relation: data.title == 'Self' ? data.title : relation,
        DOB:
          data.title == 'Self'
            ? this.HealthQuateForm[`${data.title}DOB`]
            : this.HealthQuateForm[`${title}DOB`],
        Gender:
          data.title == 'Self'
            ? this.HealthQuateForm[`${data.title}Gender`]
            : gender,
        HeightCM: 0,
        HeightInFeet: 0,
        HeightInInch: 0,
        WeightKG: 0,
        Occupation: '',
        GrossMonthlyIncome: 0,
        NomineeFirstName: '',
        NomineeMiddleName: '',
        NomineeLastName: '',
        NomineeRelation: '',
        NomineeAge: 0,
        AppointeeFirstName: '',
        AppointeeMiddleName: '',
        AppointeeLastName: '',
        AppointeeRelation: '',
        PreExistDisease: null,
        PreExistDisease_Diabetes: null,
        PreExistDisease_DiabetesDescription: '',
        PreExistDisease_Hypertension: null,
        PreExistDisease_HypertensionDescription: '',
        PreExistDisease_CholesterolDisorder: null,
        PreExistDisease_CholesterolDisorderDescription: '',
        PreExistDisease_Obesity: null,
        PreExistDisease_ObesityDescription: '',
        PreExistDisease_CardiovascularDiseases: null,
        PreExistDisease_CardiovascularDiseasesDescription: '',
        PreExistDisease_Others: null,
        PreExistDisease_OthersDescription: '',
        Asthma: null,
        AsthmaDescription: '',
        SmokerTibco: null,
        SmokerTibcoDescription: '',
        CholesterolDisorDr: null,
        CholesterolDisorDrDescription: '',
        HeartDisease: null,
        HeartDiseaseDescription: '',
        Hypertension: null,
        HypertensionDescription: '',
        Diabetes: null,
        DiabetesDescription: '',
        Obesity: null,
        ObesityDescription: '',
        Addonnme: this.submit.get('Addonnme').value,
      });
    });
  }

  // GoDigit Add-Ons
  private _goDigitAddon(key, value) {
    this.submit.get(key).patchValue(value);
    this.GoDigit = new BuyGoDigitDto();
    const Names = this.HealthQuateForm.Name.trim()
      .replace(/ +/g, ' ')
      .split(' ');
    this.GoDigit.TransactionNo = this.Policies.QuoteNo;

    this.GoDigit.PolicyDetail = {
      Productcode: this.Policies.ProductCode,
      SumInsured: this.Policies.SumInsured,
      PolicyStartDate: '',
      PolicyPeriod: this.Policies.PolicyPeriod,
      PolicyType: this.Policies.PolicyType,
      PaymentMode: 'Online',
      PaymentDate: '',
      ProductName: this.Policies.ProductName,
      SubProductCode: this.Policies.SubProductCode,
      SubProductName: this.Policies.SubProductName,
    };

    this.GoDigit.PolicyHolder = {
      Mobile: this.HealthQuateForm.Mobile,
      Email: this.HealthQuateForm.EmailId,
      Gender: this.HealthQuateForm.SelfGender,
      DOB: this.HealthQuateForm.SelfDOB,
      FirstName: Names[0],
      MiddleName: Names.length > 2 ? Names[1] : '',
      LastName: Names.length > 2 ? Names[2] : Names[1],
      Address: '',
      City: this.submit.get('City').value,
      StateCode: this.submit.get('StateCode').value,
      PinCode: this.HealthQuateForm.PinCode,
      Marital: '',
    };

    this.GoDigit.KYC = {
      IsKYCDone: true,
      DocTypeCode: 'PAN',
      DocNumber: '',
      DOB: this.HealthQuateForm.SelfDOB,
      Photo: '',
      SuccessReturnURL: '',
      FailureReturnURL: '',
    };

    this.GoDigit.PolicyMemberDetails = [];
    this.member.forEach((data, index) => {
      let name;
      let title;
      let relation;
      if (data.title != 'Self') {
        if (
          data.title.indexOf('Daughter') < 0 &&
          data.title.indexOf('Son') < 0
        ) {
          title = data.title;
          relation = data.title;
        }
        if (
          data.title.indexOf('Daughter') == 0 ||
          data.title.indexOf('Son') == 0
        ) {
          switch (data.title) {
            case 'Daughter':
              title = 'Child1';
              relation = 'Daughter';
              break;
            case 'Daughter1':
              title = 'Child1';
              relation = 'Daughter';
              break;
            case 'Daughter2':
              title = 'Child2';
              relation = 'Daughter';
              break;
            case 'Daughter3':
              title = 'Child3';
              relation = 'Daughter';
              break;
            case 'Son':
              title = 'Child4';
              relation = 'Son';
              break;
            case 'Son1':
              title = 'Child4';
              relation = 'Son';
              break;
            case 'Son2':
              title = 'Child5';
              relation = 'Son';
              break;
            case 'Son3':
              title = 'Child6';
              relation = 'Son';
              break;
          }
        }
        name = this.HealthQuateForm[`${title}Name`]
          .trim()
          .replace(/ +/g, ' ')
          .split(' ');
      }

      let gender;
      if (data.title == 'Mother') {
        gender = 'Female';
      } else if (data.title == 'Father') {
        gender = 'Male';
      } else {
        gender = this.HealthQuateForm[`${title}Gender`];
      }

      this.GoDigit.PolicyMemberDetails.push({
        FirstName: data.title == 'Self' ? Names[0] : name[0],
        MiddleName:
          data.title == 'Self'
            ? Names.length > 2
              ? Names[1]
              : ''
            : name.length > 2
              ? name[1]
              : '',
        LastName:
          data.title == 'Self'
            ? Names.length > 2
              ? Names[2]
              : Names[1]
            : name.length > 2
              ? name[2]
              : name[1],
        Relation: data.title == 'Self' ? data.title : relation,
        DOB:
          data.title == 'Self'
            ? this.HealthQuateForm[`${data.title}DOB`]
            : this.HealthQuateForm[`${title}DOB`],
        Gender:
          data.title == 'Self'
            ? this.HealthQuateForm[`${data.title}Gender`]
            : gender,
        HeightCM: 0,
        WeightKG: 0,
        Occupation: '',
        Marital: '',
        Street: '',
        City: this.submit.get('City').value,
        CountryCode: this.submit.get('CountryCode').value,
        StateCode: this.submit.get('StateCode').value,
        PinCode: this.HealthQuateForm.PinCode,
        NomineeFirstName: '',
        NomineeMiddleName: '',
        NomineeLastName: '',
        NomineeDOB: '',
        NomineeGender: '',
        NomineeRelation: '',
        Medical: null,
        RHPNE: this.submit.get('RHPNE').value,
        RHPDW: this.submit.get('RHPDW').value,
        RHPDWValue: this.submit.get('RHPDW').value ? 2 : 3,
        RHNHC: this.submit.get('RHNHC').value,
        RHIWP: this.submit.get('RHIWP').value,
        RHIWPValue: this.submit.get('RHIWP').value ? this.submit.get('RHIWPValue').value : 0,
      });
    });
  }

  private _hdfcAddon(key, value) {
    this.submit.get(key).patchValue(value);
    this.Hdfc = new BuyHdfcDto();
    const Names = this.HealthQuateForm.Name.trim().replace(/ +/g, ' ').split(' ');
    this.Hdfc.TransactionNo = this.Policies.QuoteNo;

    this.Hdfc.PolicyDetail = {
      ProductName: this.Policies.ProductName,
      SubProductName: this.Policies.SubProductName,
      Productcode: this.Policies.ProductCode,
      SubProductCode: this.Policies.SubProductCode,
      SumInsured: this.Policies.SumInsured,
      PolicyPeriod: this.Policies.PolicyPeriod,
      PolicyType: this.Policies.PolicyType,
      PolicyStartDate: '',
      Deductible: this.submit.get('deductibleBoolean').value ? this.submit.get('Deductible').value : 0,
    }

    this.Hdfc.PolicyHolder = {
      FirstName: Names[0],
      MiddleName: Names.length > 2 ? Names[1] : '',
      LastName: Names.length > 2 ? Names[2] : Names[1],
      Mobile: this.HealthQuateForm.Mobile,
      Email: this.HealthQuateForm.EmailId,
      Gender: this.HealthQuateForm.SelfGender,
      DOB: this.HealthQuateForm.SelfDOB == "" ? null : this.HealthQuateForm.SelfDOB,
      PinCode: this.HealthQuateForm.PinCode,
      Marital: '',
      Address: '',
      Address1: '',
      KYCId: '',
      NomineeFirstName: '',
      NomineeMiddleName: '',
      NomineeLastName: '',
      NomineeRelation: '',
      NomineeAddress: '',
      NomineeAge: null,
      AppointeeFirstName: '',
      AppointeeMiddleName: '',
      AppointeeLastName: '',
      AppointeeRelation: '',
      AppointeAddress: '',
      PANNo: '',
      PolicyHardCopyRequired: false,
      BankAccountHolderName: '',
      BankAccountNo: '',
      BankName: '',
      BankIFSCCode: '',
    }

    this.Hdfc.PolicyMemberDetails = [];
    this.member.forEach((data, index) => {
      let name;
      let title;
      let relation;
      if (data.title != 'Self') {
        if (
          data.title.indexOf('Daughter') < 0 &&
          data.title.indexOf('Son') < 0
        ) {
          title = data.title;
          relation = data.title;
        }
        if (
          data.title.indexOf('Daughter') == 0 ||
          data.title.indexOf('Son') == 0
        ) {
          switch (data.title) {
            case 'Daughter':
              title = 'Child1';
              relation = 'Daughter';
              break;
            case 'Daughter1':
              title = 'Child1';
              relation = 'Daughter';
              break;
            case 'Daughter2':
              title = 'Child2';
              relation = 'Daughter';
              break;
            case 'Daughter3':
              title = 'Child3';
              relation = 'Daughter';
              break;
            case 'Son':
              title = 'Child4';
              relation = 'Son';
              break;
            case 'Son1':
              title = 'Child4';
              relation = 'Son';
              break;
            case 'Son2':
              title = 'Child5';
              relation = 'Son';
              break;
            case 'Son3':
              title = 'Child6';
              relation = 'Son';
              break;
          }
        }
        name = this.HealthQuateForm[`${title}Name`]
          .trim()
          .replace(/ +/g, ' ')
          .split(' ');
      }

      let gender;
      if (data.title == 'Mother') {
        gender = 'Female';
      } else if (data.title == 'Father') {
        gender = 'Male';
      } else {
        gender = this.HealthQuateForm[`${title}Gender`];
      }

      this.Hdfc.PolicyMemberDetails.push({
        FirstName: data.title == 'Self' ? Names[0] : name[0],
        MiddleName:
          data.title == 'Self'
            ? Names.length > 2
              ? Names[1]
              : ''
            : name.length > 2
              ? name[1]
              : '',
        LastName:
          data.title == 'Self'
            ? Names.length > 2
              ? Names[2]
              : Names[1]
            : name.length > 2
              ? name[2]
              : name[1],
        Relation: data.title == 'Self' ? data.title : relation,
        DOB:
          data.title == 'Self'
            ? this.HealthQuateForm[`${data.title}DOB`]
            : this.HealthQuateForm[`${title}DOB`],
        Gender:
          data.title == 'Self'
            ? this.HealthQuateForm[`${data.title}Gender`]
            : gender,
        HeightCM: 0,
        WeightKG: 0,
        Occupation: '',
        Marital: '',
        GrossMonthlyIncome: null,
        MemberPED: [],
        MemberLifeStyle: [],
      });
    });
  }

  // Binding PinCode , City , state & country
  private _bindPin(selectedPinCode: string) {
    this._MasterListService
      .getFilteredPincodeListWithDetails(selectedPinCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (res.Success) {
          if (res.Data.Items.length) {
            this.submit.patchValue({
              City: res.Data.Items[0].CityName,
              StateCode: res.Data.Items[0].StateCode,
              CountryCode: res.Data.Items[0].CountryCode,
              StateName: res.Data.Items[0].StateName,
            });
          }
        }
      });
  }

  // adding AddOns in array
  /**
   * it is to display Added addOns in the summary
   * @param item :Name of the AddOn (name that will be displayed in the summary)
   * @param type :is answer true or false (is addOn removed or added)
   * @param key :value in addOnList
   * @param res :response of API
   * @param CanUpdateDisplayAddOn : Added Mandatory & can note Remove then use "CanUpdateDisplayAddOn" Flag for update Value
   */
  private _displayAddonInList(item, type: boolean, key: any, res: any, CanUpdateDisplayAddOn = false) {

    this.addOnList.forEach((element, index) => {
      if (element.Value == key) {
        element.Answer = type;
      }
      if (element.AddOn == 'Maternity' && this.PlanName == PlanNameEnum.icici_HAE_ApexPlus) {
        element.Dependable = false;
      }
    });
    let diff = res.Data.TotalPremium - this.TotalPremium;

    // When Added Mandatory & can note Remove then use "CanUpdateDisplayAddOn" Flag
    if (!CanUpdateDisplayAddOn) {
      if (type) {
        this.displayAddOn.push({ name: item, amount: diff });
      } else {
        let index;
        this.displayAddOn.forEach((ele, ind) => {
          if (ele.name == item) {
            index = ind;
          }
        });
        this.displayAddOn.splice(index, 1);
        // reset last addon amount base on removed addon
        //Base Premium
        if (this.displayAddOn?.length > 0) {
          let tempTotalPremium = this.Policies.TotalPremium;
          this.displayAddOn.forEach((addon, index) => {
            tempTotalPremium += addon.amount;
          });
          // in case of API premium and calculated premium not match change last addon amount
          if (res.Data.TotalPremium != tempTotalPremium) {
            if (res.Data.TotalPremium < tempTotalPremium)
              this.displayAddOn[this.displayAddOn?.length - 1].amount -= res.Data.TotalPremium - tempTotalPremium;
            if (res.Data.TotalPremium > tempTotalPremium)
              this.displayAddOn[this.displayAddOn?.length - 1].amount += res.Data.TotalPremium - tempTotalPremium;
          }
        }
      }
    } else {

      let index = this.displayAddOn.findIndex(ele => ele.name == item);

      if (this.displayAddOn?.length > 0) {
        let tempTotalPremium = this.Policies.TotalPremium;
        this.displayAddOn.forEach((addon, index) => {
          if (addon.name != item) {
            tempTotalPremium += addon.amount;
          }
        });

        if (index != -1) {
          this.displayAddOn[index].amount = res.Data.TotalPremium - tempTotalPremium
        }
      }
    }
    // new premium
    this.TotalPremium = res.Data.TotalPremium;

    this.addOnLength = this.displayAddOn.length;

    this._disableMaternity()

  }

  private validateCreticalIllness() {
    this.creticalIllnessErrorAlerts = []
    if (this.submit.get('ProposalDOB').value == "" ||
      this.submit.get('ProposalDOB').value == null) {
      this.creticalIllnessErrorAlerts.push({
        Message: 'Select Proposal DOB',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.submit.get('ProposalIncome').value == "" ||
      this.submit.get('ProposalIncome').value == 0) {
      this.creticalIllnessErrorAlerts.push({
        Message: 'Enter Proposal Income',
        CanDismiss: false,
        AutoClose: false,
      })
    }
  }

  // reset form
  private _resetForm() {
    this.submit.patchValue({
      CARESHILEDCF1209: false,
      COPAYWAIVER1103: false,
      CARESHILED1104: false,
      CS1154: false,
      CFWHC: false,
      SMARTCA: false,
      RRMCA: false,
      AACCA1090: false,
      EXTOFGCEU: false,
      EXTOFGIU: false,
      RIPEDCA1092: false,
      HCUPCA1093: false,
      CFHP: false,
      OPDCARE: false,
      CAREWITHNCB: false,
      SMART: false,
      MCCP1111: false,
      ISOCP1112: false,
      ICS1149: false,
      COPD1211: false,
      BFS1148: false,
      PEDWP3Y1157: false,
      PEDWP2Y1156: false,
      PEDWP1Y1155: false,
      CAREFREEDOMDEDUCTIBLERIDER25000: false,
      NCBS1145: false,
      AHCS1144: false,
      SSCP1113: false,
      Addonnme: false,
      Polcov46: false,
      Polcovvolntrycp: false,
      RHPNE: false,
      RHPDW: false,
      AddOn3: false,
      AddOn1: false,
      AddOn2: false,
      AddOn8: false,
      AddOn12: false,
      AddOn4: false,
      AddOn5: false,
      AddOn13: false,
      RHNHC: false,
      RHIWP: false,
      deductibleBoolean: false,
      COPAY1194: false,
    });

    if (this.displayAddOn.length > 0) {
      this.displayAddOn.forEach((ele) => {
        this.addOnList.forEach((element) => {
          if (element.AddOn == ele.name) {
            this.submit.get(element.Value).patchValue(true);
          }
        });
      });
    }
    return this.submit.value;
  }

  // form
  private _buildForm() {
    let form = this.fb.group({
      City: [],
      StateCode: [],
      CountryCode: [],
      StateName: [],
      CoPay: ['5'],
      CARESHILEDCF1209: [false],
      COPAYWAIVER1103: [false],
      CARESHILED1104: [false],
      CS1154: [false],
      CFWHC: [false],
      SMARTCA: [false],
      RRMCA: [false],
      AACCA1090: [false],
      EXTOFGCEU: [false],
      EXTOFGIU: [false],
      RIPEDCA1092: [false],
      HCUPCA1093: [false],
      CFHP: [false],
      OPDCARE: [false],
      OPDCARESI: ['5000'],
      CAREWITHNCB: [false],
      SMART: [false],
      MCCP1111: [false],
      ISOCP1112: [false],
      ICS1149: [false],
      COPD1211: [false],
      BFS1148: [false],
      PEDWP3Y1157: [false],
      PEDWP2Y1156: [false],
      PEDWP1Y1155: [false],
      CAREFREEDOMDEDUCTIBLERIDER25000: [false],
      NCBS1145: [false],
      AHCS1144: [false],
      SSCP1113: [false],
      Addonnme: [false],
      Polcov46: [false],
      Polcovvolntrycp: [false],
      RHPNE: [false],
      RHPDW: [false],
      RHPDWValue: [3],
      RHNHC: [false],
      RHIWP: [false],
      RHIWPValue: [7, [Validators.max(30), Validators.min(7)]],
      AddOn3: [false],
      AddOn1: [false],
      AddOn2: [false],
      AddOn8: [false],
      AddOn12: [false],
      AddOn4: [false],
      AddOn5: [false],
      AddOn13: [false],
      Reduction: ['PEDWP1Y1155'],
      Child1: [''],
      Child2: [''],
      Child3: [''],
      Child4: [''],
      Child5: [''],
      Child6: [''],
      Income: [0],
      deductibleBoolean: [false],
      Deductible: [0],
      ProposalDOB: ['', Validators.required],
      ProposalIncome: [0, Validators.required],
      CriticalIllnessCovered: [false],
      RoomRentWaiver: [false],
      IffcoTokioPolicy: [false],
      IffcoTokioPolicyNo: [''],
      FirstName: [''],
      LastName: [''],
      AddOn85: [false],
      AddOn86: [false],
      AddOn89: [false],
      COPAY1194: [false],
    });
    return form;
  }
  // #endregion Private methods
}
