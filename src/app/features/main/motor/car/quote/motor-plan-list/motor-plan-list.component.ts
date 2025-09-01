import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTING_PATH } from '@config/routingPath.config';
import { MotorPlanListService } from './motor-plan-list.service';
import { dropdown } from '@config/dropdown.config';
import { environment } from 'src/environments/environment';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { FormControl } from '@angular/forms';
import { Alert } from '@models/common';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MotorAddOnPopUpComponent } from '../motor-add-on-pop-up/motor-add-on-pop-up.component';
import { AuthService } from '@services/auth/auth.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { InsurerCompanyDto } from '@models/dtos/config/PolicyList.dto';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';

@Component({
  selector: 'gnx-motor-plan-list',
  templateUrl: './motor-plan-list.component.html',
  styleUrls: ['./motor-plan-list.component.scss'],
})
export class MotorPlanListComponent {
  title: string;

  VehicleDetails: any;

  VehicleIDV = new FormControl(0);
  isIDVStatus: number = 0;
  SliderMinValue: number = 0;
  SliderMaxValue: number = 0;

  AddOnData: any;
  MotorInsuranceDetails: any;

  MaxIDVAmount: number;
  MinIDVAmount: number;

  // Boolean
  isClickOnGo: boolean = false
  backDisable: boolean = false;
  RequestTotal: number;


  DropdownMaster: dropdown;
  Policies;
  FilterPolicy
  InsuranceCompany = InsuranceCompanyName; // Insurance Company Enum

  SelectedAddOns = [];
  CompareList: any[] = []; // To store Policy Object for compare
  //#region constructor
  constructor(
    private _router: Router,
    private _motorPlanListService: MotorPlanListService,
    private _alertservice: AlertsService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {
    this.DropdownMaster = new dropdown();
    this.Policies = [];
    this.FilterPolicy = [];

    if (localStorage.getItem('MotorInsurance')) {
      this.MotorInsuranceDetails = JSON.parse(
        localStorage.getItem('MotorInsurance')
      );
      this.AddOnData = this.MotorInsuranceDetails.CarDetail;
    }

    this.title = 'Plan List';
    if (localStorage.getItem('VehicleDetails')) {
      this.VehicleDetails = JSON.parse(localStorage.getItem('VehicleDetails'));
    }
  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    this._selectedAddOnsByUser();
    this.getMotorPlans("");
    this.Policies.forEach((p) => {
      p.isChecked = false;
    });
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // back to motor page
  public back() {
    this._router.navigate([ROUTING_PATH.MotorCarQuote.Car]);
  }

  // buy the plan (proceed to create proposal form of repective plan)
  public buyNow(plan) {
    let temp = plan.Insurer.toLowerCase();
    localStorage.setItem('motorBuyPolicy', JSON.stringify(plan));
    this._router.navigate([ROUTING_PATH.MotorCarQuote.ProposalPage + temp]);
  }

  /**
   * Make Checked Policy Array To complare Motor Policy
   * @param event Ckeck box Event
   * @param policy Checked Policy Obj
   */
  public AddOrRemoveInCompareList(event, policy, index: number) {
    if (event.target.checked) {
      this.Policies[index].isChecked = true;
      this.CompareList.push(policy);
    } else {
      let i = this.CompareList.findIndex(
        (f) =>
          f.ProductCode === policy.ProductCode &&
          f.TransactionNo === policy.TransactionNo
      );
      if (i != -1) {
        this.Policies[index].isChecked = false;
        this.CompareList.splice(i, 1);
      }
    }
  }

  // view details of the policy
  public ViewDetails(policyDetails) {
    this.CompareList = [];
    this.CompareList.push(policyDetails);
    this.CompareNow();
  }


  /**
   * list of the plan -- Default
   ************************************************************************************************************************
   * //GO button
   * 
   * send the request for new plans after adding the value of VehicleIDV entered by user
   * 
   ************************************************************************************************************************
   * // Add On button 
   * 
   * reload plan list after changing the value of AddOns
   * if the value of VehicleIDV is valid and is between the MaxIDVAmount & MinIDVAmount than along with value of Addons ,
   * value of VehicleIDV will also be added before sending the request for new plans
   *
   ************************************************************************************************************************
   */
  public getMotorPlans(type: string) {

    let errorMessage: Alert[] = [];
    let MotorInsurance = JSON.parse(localStorage.getItem('MotorInsurance'));

    // check 'GO button' validation 
    if (type == "Go") {
      errorMessage = this._IDVValidations();
      if (errorMessage.length > 0) {
        this._alertservice.raiseErrors(errorMessage);
        return;
      }
      else {
        this.isClickOnGo = true;
      }
    }

    // check 'GO button' validation 
    if (type == "AddOn") {

      if (this.VehicleIDV.value) {
        if (errorMessage.length > 0) {
          this._alertservice.raiseErrors(errorMessage);
          return;
        }
      }
      this._selectedAddOnsByUser();
    }

    let tempPolicies = []

    if (this.Policies.length > 0) {
      tempPolicies = this.Policies;
    }

    this.Policies = [];
    this.FilterPolicy = [];

    if (localStorage.getItem('MotorInsurance')) {

      // get insurance company for motor integrated in user profile
      this.authService.userProfile$.subscribe((user: IMyProfile) => {
        if (user && user.InsuranceCompanyDetail) {
          user.InsuranceCompanyDetail.forEach((ele, i) => {
            if (ele.MotorPrivateCarIntegrated) {
              let policyComp: InsurerCompanyDto = new InsurerCompanyDto();
              policyComp.Name = ele.InsuranceCompanyCode;
              policyComp.SortOrder = ele.SortOrder;

              this.FilterPolicy.push(policyComp);

            }
          });
        }

        if (user?.EmailId?.toLowerCase().indexOf('icici') != -1) {
          this._AddCompanyName('ICICI');
        } else if (user?.EmailId?.toLowerCase().indexOf('bajajallianz') != -1) {
          this._AddCompanyName('BajajAllianz');
        } else if (user?.EmailId?.toLowerCase().indexOf('hdfcergo') != -1) {
          this._AddCompanyName('HDFCErgo');
        } else if (user?.EmailId?.toLowerCase().indexOf('godigit') != -1) {
          this._AddCompanyName('GoDigit');
        } else if (user?.EmailId?.toLowerCase().indexOf('care') != -1) {
          this._AddCompanyName('Care');
        } else if (user?.EmailId?.toLowerCase().indexOf('adityabirla') != -1) {
          this._AddCompanyName('AdityaBirla');
        } else if (user?.EmailId?.toLowerCase().indexOf('iffcotokio') != -1) {
          this._AddCompanyName('IFFCOTOKIO');
        } else if (user?.EmailId?.toLowerCase().indexOf('zuno') != -1) {
          this._AddCompanyName('Zuno');
        } else if (user?.EmailId?.toLowerCase().indexOf('tataaia') != -1) {
          this._AddCompanyName('TataAIA');
        } else if (user?.EmailId?.toLowerCase().indexOf('tataaig') != -1) {
          this._AddCompanyName('TataAIA');
        }
        else {
        }
      });

      this.backDisable = true;
      this.RequestTotal = this.FilterPolicy.length;
      this.FilterPolicy.forEach((ele, i) => {
        MotorInsurance.Insurer = ele.Name;

        if (type == "AddOn" || type == "Go") {
          // check 'Set Your IDV' button status, Status is '1' then pass VehicleIDV, Min and Max IDV Amount other wise pass '0' value set in all fields
          if (this.isIDVStatus == 1) {

            MotorInsurance.CarDetail.VehicleIDV = this.VehicleIDV.value;

            if (tempPolicies.length > 0) {
              let ObjPolicy = tempPolicies.find(x => x.Insurer == ele.Name);

              if (ObjPolicy) {
                MotorInsurance.CarDetail.MinIDVAmount = ObjPolicy.MinIDVAmount;
                MotorInsurance.CarDetail.MaxIDVAmount = ObjPolicy.MaxIDVAmount;
              }
              else {
                MotorInsurance.CarDetail.MinIDVAmount = 0;
                MotorInsurance.CarDetail.MaxIDVAmount = 0;
              }
            }
          }
          else {
            MotorInsurance.CarDetail.VehicleIDV = 0;
            MotorInsurance.CarDetail.MinIDVAmount = 0;
            MotorInsurance.CarDetail.MaxIDVAmount = 0;
          }
        }

        // get policy information
        this._motorPlanListService
          .createMotorProposal(MotorInsurance)
          .subscribe((res) => {

            this.RequestTotal--;
            if (this.RequestTotal == 0) {
              this.backDisable = false;
            }

            if (res.Data) {
              if (res.Data.length > 0) {
                res.Data.forEach((plan, list) => {
                  plan.IconURL = environment.apiDomain + plan.IconURL;
                  this.Policies.push(plan);
                });
                this._minMaxIDV();
              }
            }
          });

      });
    }

  }

  /**
   * PopUp to edit the value of AddOns
   */
  public openPopUpForAddOn(title: string, type: string) {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '45vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";
    dialogConfig.data = {
      title: title,
      data: this.AddOnData,
    };

    const dialogRef = this.dialog.open(MotorAddOnPopUpComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.MotorInsuranceDetails.CarDetail.PersonalAccident =
          result.PersonalAccident;
        this.MotorInsuranceDetails.CarDetail.DriverCover = result.DriverCover;
        this.MotorInsuranceDetails.CarDetail.TyreSecure = result.TyreSecure;
        this.MotorInsuranceDetails.CarDetail.DriverCoverSumInsured =
          result.DriverCoverSumInsured;
        this.MotorInsuranceDetails.CarDetail.ZeroDepreciation =
          result.ZeroDepreciation;
        this.MotorInsuranceDetails.CarDetail.Accessories = result.Accessories;
        this.MotorInsuranceDetails.CarDetail.ElectricalAccessories =
          result.ElectricalAccessories;
        this.MotorInsuranceDetails.CarDetail.NonElectricalAccessories =
          result.NonElectricalAccessories;
        this.MotorInsuranceDetails.CarDetail.NCBProtection =
          result.NCBProtection;
        this.MotorInsuranceDetails.CarDetail.PersonAccident =
          result.PersonAccident;
        this.MotorInsuranceDetails.CarDetail.NoOfPerson = result.NoOfPerson;
        this.MotorInsuranceDetails.CarDetail.PersonSumInsured =
          result.PersonSumInsured;
        this.MotorInsuranceDetails.CarDetail.InvoiceCover = result.InvoiceCover;
        this.MotorInsuranceDetails.CarDetail.RoadsideAssistance =
          result.RoadsideAssistance;
        this.MotorInsuranceDetails.CarDetail.EngineProtector =
          result.EngineProtector;
        this.MotorInsuranceDetails.CarDetail.Consumable = result.Consumable;
        this.MotorInsuranceDetails.CarDetail.KeyandLockReplacement =
          result.KeyandLockReplacement;
        this.MotorInsuranceDetails.CarDetail.RepairofGlass =
          result.RepairofGlass;
        this.MotorInsuranceDetails.CarDetail.PassengerCover =
          result.PassengerCover;
        this.MotorInsuranceDetails.CarDetail.PassengerCoverSumInsured =
          result.PassengerCoverSumInsured;
        this.MotorInsuranceDetails.CarDetail.MinIDVAmount = 0
        this.MotorInsuranceDetails.CarDetail.MaxIDVAmount = 0
        this.MotorInsuranceDetails.CarDetail.PreviousPolicyZeroDepreciation = result.PreviousPolicyZeroDepreciation;
        this.MotorInsuranceDetails.CarDetail.PreviousPolicyEngineProtector = result.PreviousPolicyEngineProtector;
        this.MotorInsuranceDetails.CarDetail.PreviousPolicyInvoiceCover = result.PreviousPolicyInvoiceCover;
        this.MotorInsuranceDetails.CarDetail.PreviousPolicyConsumable = result.PreviousPolicyConsumable;



        localStorage.setItem(
          'MotorInsurance',
          JSON.stringify(this.MotorInsuranceDetails)
        );

        this.getMotorPlans(type) // get plans
      }
    });
  }

  //Compare Selected Policy Details
  public CompareNow() {
    if (this.CompareList.length > 0) {
      localStorage.setItem(
        'MotorComparePlans',
        JSON.stringify(this.CompareList)
      );
      this._router.navigate([ROUTING_PATH.MotorCarQuote.Compare]);
    } else {
      this._alertservice.raiseErrorAlert('please select any plan');
    }
  }

  // clear the list of policies that are to be compared
  public CompareClear() {
    this.CompareList = [];
    this.Policies.forEach((p) => {
      p.isChecked = false;
    });
  }


  onChange(event, type: string) {
    if (type == 'IDVStatus') {
      if (event.checked === true) {
        this.isIDVStatus = 1;
        this.SliderMinValue = this.MinIDVAmount;
        this.SliderMaxValue = this.MaxIDVAmount;
        this.VehicleIDV.patchValue(this.MinIDVAmount);
        this.isClickOnGo = false;
      } else {
        this.isIDVStatus = 0;
        this.SliderMinValue = 0;
        this.SliderMaxValue = 0;
        this.VehicleIDV.patchValue(0);

        if (this.isClickOnGo == true) {
          this.getMotorPlans("");
        }
      }
    }
  }

  //#endregion public-methods

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _selectedAddOnsByUser() {
    this.SelectedAddOns = [];
    let arrayOfAddOn = [
      { DisplayName: 'Personal Accident', Key: 'PersonalAccident' },
      { DisplayName: 'Driver Cover', Key: 'DriverCover' },
      { DisplayName: 'Tyre Secure', Key: 'TyreSecure' },
      { DisplayName: 'Zero Depreciation', Key: 'ZeroDepreciation' },
      { DisplayName: 'Electrical Accessories', Key: 'Accessories' },
      { DisplayName: 'NCB Protection', Key: 'NCBProtection' },
      { DisplayName: 'Passenger', Key: 'PersonAccident' },
      { DisplayName: 'Invoice Cover', Key: 'InvoiceCover' },
      { DisplayName: '24x7 Roadside Assistance', Key: 'RoadsideAssistance' },
      { DisplayName: 'Engine Protector', Key: 'EngineProtector' },
      { DisplayName: 'Consumable', Key: 'Consumable' },
      { DisplayName: 'Key and Lock Replacement', Key: 'KeyandLockReplacement' },
      { DisplayName: 'Repair of Glass', Key: 'RepairofGlass' },
    ];
    arrayOfAddOn.forEach((element, index) => {
      if (this.MotorInsuranceDetails.CarDetail[element.Key] == true) {
        this.SelectedAddOns.push(element);
      }
    });
  }

  /**
   * validating the value of VehicleIDV (value of VehicleIDV must be between MaxIDVAmount & MinIDVAmount)
   * @returns : alert message
   */
  private _IDVValidations() {
    let alert: Alert[] = [];
    if (
      this.VehicleIDV.value < this.MinIDVAmount ||
      this.VehicleIDV.value > this.MaxIDVAmount
    ) {
      alert.push({
        Message: `IDV must be between ${this.MinIDVAmount} and ${this.MaxIDVAmount}`,
        CanDismiss: false,
        AutoClose: false,
      });
    }
    return alert;
  }

  /**
   * set the MinIDVAmount and MaxIDVAmount.
   * when value of MaxIDVAmount & MinIDVAmount is null or 0
   * than the value of MaxIDVAmount & MinIDVAmount of first plan in the list is given to MaxIDVAmount & MinIDVAmount repectively.
   * after that value of MaxIDVAmount & MinIDVAmount is compared to the value of MaxIDVAmount & MinIDVAmount of all the plans in the list.
   * if MaxIDVAmount of plan is greater than the current MaxIDVAmount than MaxIDVAmount will be value MaxIDVAmount of the plan
   * and similarly if MinIDVAmount of plan is less than current MinIDVAmount than MinIDVAmount will be value of MinIDVAmount of the plan
   */
  private _minMaxIDV() {
    this._differenceInAddOn();
    if (
      (this.MinIDVAmount == null || this.MinIDVAmount == 0) &&
      (this.MaxIDVAmount == null || this.MaxIDVAmount == 0)
    ) {
      this.MinIDVAmount = this.Policies[0].MinIDVAmount;
      this.MaxIDVAmount = this.Policies[0].MaxIDVAmount;
      this.VehicleIDV.setValue(this.MinIDVAmount)
    }
    this.Policies.forEach((element, index) => {
      if (element.MinIDVAmount < this.MinIDVAmount) {
        this.MinIDVAmount = element.MinIDVAmount;
        this.VehicleIDV.setValue(this.MinIDVAmount)
      }
      if (element.MaxIDVAmount > this.MaxIDVAmount) {
        this.MaxIDVAmount = element.MaxIDVAmount;
      }
    });

    if (this.isIDVStatus == 0) {
      this.VehicleIDV.setValue(0)
    }
  }

  /**
   * list of AddOn that are only in Plan
   * list of AddOn that are selected but are not in plan
   */
  private _differenceInAddOn() {
    this.Policies.forEach((p) => {
      p.selectedAddOn = this.SelectedAddOns;

      let onlyInPlan = [];
      let notInPlan = [];

      p.CalcPremium?.addonCovers.forEach((element, index) => {
        let count = 0;
        p.selectedAddOn.forEach((ele2, ind2) => {
          if (element.Key == ele2.Key) {
            count += 1;
          }
        });
        if (count == 0) {
          onlyInPlan.push(element);
        }
      });

      p.selectedAddOn.forEach((element, index) => {
        let count = 0;
        p.CalcPremium?.addonCovers.forEach((ele2, ind2) => {
          if (element.Key == ele2.Key) {
            count += 1;
          }
        });
        if (count == 0) {
          notInPlan.push(element);
        }
      });
      p.notInPlan = notInPlan;
      p.onlyInPlan = onlyInPlan;
    });
  }

  // sort company by sort Order in array
  private _AddCompanyName(policyCompanyName) {
    this.FilterPolicy = [];
    let policyCompany: InsurerCompanyDto = new InsurerCompanyDto();
    policyCompany.Name = policyCompanyName;
    policyCompany.SortOrder = 10;
    this.FilterPolicy.push(policyCompany);
  }

  //#endregion Private methods
}

