import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { dropdown } from '@config/dropdown.config';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';
import { MotorPlanListService } from './motor-plan-list.service';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthService } from '@services/auth/auth.service';
import { ROUTING_PATH } from '@config/routingPath.config';
import { Alert } from '@models/common';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { InsurerCompanyDto } from '@models/dtos/config/PolicyList.dto';
import { environment } from 'src/environments/environment';
import { MotorAddOnPopUpComponent } from '../motor-add-on-pop-up/motor-add-on-pop-up.component';

@Component({
  selector: 'gnx-motor-plan-list',
  templateUrl: './motor-plan-list.component.html',
  styleUrls: ['./motor-plan-list.component.scss']
})
export class MotorPlanListComponent {

  //#region decorator

  //#endregion

  //#region public properties

  public title: string;
  public vehicleDetails: any;
  public vehicleIDV = new FormControl(0);
  public isIDVStatus: number = 0;
  public sliderMinValue: number = 0;
  public sliderMaxValue: number = 0;
  public maxIDVAmount: number;
  public minIDVAmount: number;
  public backDisable: boolean = false;
  public dropdownMaster: dropdown;
  public policies: any;
  public insuranceCompany = InsuranceCompanyName; // Insurance Company Enum
  public selectedAddOns = [];
  public compareList: any[] = []; // To store Policy Object for compare

  //#endregion

  //#region private properties

  private _addOnData: any;
  private _motorInsuranceDetails: any;
  private _isClickOnGo: boolean = false
  private _requestTotal: number;
  private _filterPolicy: any;
  //#endregion

  //#region constructor
  constructor(
    private _router: Router,
    private _motorPlanListService: MotorPlanListService,
    private _alertservice: AlertsService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {
    this.dropdownMaster = new dropdown();
    this.policies = [];
    this._filterPolicy = [];

    if (localStorage.getItem('TwoWheelerMotorInsurance')) {
      this._motorInsuranceDetails = JSON.parse(localStorage.getItem('TwoWheelerMotorInsurance'));
      this._addOnData = this._motorInsuranceDetails.TwoWheelerDetail;
    }

    this.title = 'Plan List';
    if (localStorage.getItem('TwoWheelerVehicleDetails')) {
      this.vehicleDetails = JSON.parse(localStorage.getItem('TwoWheelerVehicleDetails'));
    }
  }

  // #endregion constructor

  //#region life cycle hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    this._selectedAddOnsByUser();
    this.getMotorPlans("");
    this.policies.forEach((p) => {
      p.isChecked = false;
    });
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // back to motor page
  public back(): void {
    this._router.navigate([ROUTING_PATH.MotorTwoWheelerQuote.TwoWheeler]);
  }

  // buy the plan (proceed to create proposal form of repective plan)
  public buyNow(plan): void {
    let temp = plan.Insurer.toLowerCase();
    localStorage.setItem('TwoWheeler_motorBuyPolicy', JSON.stringify(plan));
    this._router.navigate([ROUTING_PATH.MotorTwoWheelerQuote.ProposalPage + temp]);
  }

  /**
   * Make Checked Policy Array To complare Motor Policy
   * @param event Ckeck box Event
   * @param policy Checked Policy Obj
   */
  public AddOrRemoveInCompareList(event, policy, index: number): void {
    if (event.target.checked) {
      this.policies[index].isChecked = true;
      this.compareList.push(policy);
    } else {
      let i = this.compareList.findIndex(
        (f) =>
          f.ProductCode === policy.ProductCode &&
          f.TransactionNo === policy.TransactionNo
      );
      if (i != -1) {
        this.policies[index].isChecked = false;
        this.compareList.splice(i, 1);
      }
    }
  }

  // view details of the policy
  public ViewDetails(policyDetails): void {
    this.compareList = [];
    this.compareList.push(policyDetails);
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
  public getMotorPlans(type: string): void {

    let errorMessage: Alert[] = [];
    let MotorInsurance = JSON.parse(localStorage.getItem('TwoWheelerMotorInsurance'));

    // check 'GO button' validation 
    if (type == "Go") {
      errorMessage = this._IDVValidations();
      if (errorMessage.length > 0) {
        this._alertservice.raiseErrors(errorMessage);
        return;
      }
      else {
        this._isClickOnGo = true;
      }
    }

    // check 'GO button' validation 
    if (type == "AddOn") {

      if (this.vehicleIDV.value) {
        if (errorMessage.length > 0) {
          this._alertservice.raiseErrors(errorMessage);
          return;
        }
      }
      this._selectedAddOnsByUser();
    }

    let tempPolicies = []

    if (this.policies.length > 0) {
      tempPolicies = this.policies;
    }

    this.policies = [];
    this._filterPolicy = [];

    if (localStorage.getItem('TwoWheelerMotorInsurance')) {

      // get insurance company for motor integrated in user profile
      this.authService.userProfile$.subscribe((user: IMyProfile) => {
        if (user && user.InsuranceCompanyDetail) {
          user.InsuranceCompanyDetail.forEach((ele, i) => {
            if (ele.MotorTwoWheelerIntegrated) {
              let policyComp: InsurerCompanyDto = new InsurerCompanyDto();
              policyComp.Name = ele.InsuranceCompanyCode;
              policyComp.SortOrder = ele.SortOrder;

              this._filterPolicy.push(policyComp);
            }
          });
        }

        // if (user?.EmailId?.toLowerCase().indexOf('icici') != -1) {
        //   this._AddCompanyName('ICICI');
        // } else 
        if (user?.EmailId?.toLowerCase().indexOf('bajajallianz') != -1) {
          this._AddCompanyName('BajajAllianz');
        } else if (user?.EmailId?.toLowerCase().indexOf('hdfcergo') != -1) {
          this._AddCompanyName('HDFCErgo');
        }
        else if (user?.EmailId?.toLowerCase().indexOf('godigit') != -1) {
          this._AddCompanyName('GoDigit');
        }
        // else if (user?.EmailId?.toLowerCase().indexOf('care') != -1) {
        //   this._AddCompanyName('Care');
        // } else if (user?.EmailId?.toLowerCase().indexOf('adityabirla') != -1) {
        //   this._AddCompanyName('AdityaBirla');
        // } else if (user?.EmailId?.toLowerCase().indexOf('iffcotokio') != -1) {
        //   this._AddCompanyName('IFFCOTOKIO');
        // } else if (user?.EmailId?.toLowerCase().indexOf('zuno') != -1) {
        //   this._AddCompanyName('Zuno');
        // } else if (user?.EmailId?.toLowerCase().indexOf('tataaia') != -1) {
        //   this._AddCompanyName('TataAIA');
        // } else if (user?.EmailId?.toLowerCase().indexOf('tataaig') != -1) {
        //   this._AddCompanyName('TataAIA');
        // }
        else {
        }
      });

      this.backDisable = true;
      this._requestTotal = this._filterPolicy.length;
      this._filterPolicy.forEach((ele, i) => {
        MotorInsurance.Insurer = ele.Name;

        if (type == "AddOn" || type == "Go") {
          // check 'Set Your IDV' button status, Status is '1' then pass VehicleIDV, Min and Max IDV Amount other wise pass '0' value set in all fields
          if (this.isIDVStatus == 1) {

            MotorInsurance.TwoWheelerDetail.VehicleIDV = this.vehicleIDV.value;

            if (tempPolicies.length > 0) {
              let ObjPolicy = tempPolicies.find(x => x.Insurer == ele.Name);

              if (ObjPolicy) {
                MotorInsurance.TwoWheelerDetail.MinIDVAmount = ObjPolicy.MinIDVAmount;
                MotorInsurance.TwoWheelerDetail.MaxIDVAmount = ObjPolicy.MaxIDVAmount;
              }
              else {
                MotorInsurance.TwoWheelerDetail.MinIDVAmount = 0;
                MotorInsurance.TwoWheelerDetail.MaxIDVAmount = 0;
              }
            }
          }
          else {
            MotorInsurance.TwoWheelerDetail.VehicleIDV = 0;
            MotorInsurance.TwoWheelerDetail.MinIDVAmount = 0;
            MotorInsurance.TwoWheelerDetail.MaxIDVAmount = 0;
          }
        }

        // get policy information
        this._motorPlanListService.createMotorProposal(MotorInsurance).subscribe((res) => {

          this._requestTotal--;
          if (this._requestTotal == 0) {
            this.backDisable = false;
          }

          if (res.Data) {
            if (res.Data.length > 0) {
              res.Data.forEach((plan, list) => {
                plan.IconURL = environment.apiDomain + plan.IconURL;
                this.policies.push(plan);
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
  public openPopUpForAddOn(title: string, type: string): void {
    let dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '45vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";
    dialogConfig.data = {
      title: title,
      data: this._addOnData,
    };

    const dialogRef = this.dialog.open(MotorAddOnPopUpComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._motorInsuranceDetails.TwoWheelerDetail.PersonalAccident = result.PersonalAccident;
        this._motorInsuranceDetails.TwoWheelerDetail.DriverCover = result.DriverCover;
        this._motorInsuranceDetails.TwoWheelerDetail.DriverCoverSumInsured = result.DriverCoverSumInsured;
        this._motorInsuranceDetails.TwoWheelerDetail.ZeroDepreciation = result.ZeroDepreciation;
        this._motorInsuranceDetails.TwoWheelerDetail.Accessories = result.Accessories;
        this._motorInsuranceDetails.TwoWheelerDetail.ElectricalAccessories = result.ElectricalAccessories;
        this._motorInsuranceDetails.TwoWheelerDetail.NonElectricalAccessories = result.NonElectricalAccessories;
        this._motorInsuranceDetails.TwoWheelerDetail.NCBProtection = result.NCBProtection;
        this._motorInsuranceDetails.TwoWheelerDetail.NoOfPerson = result.NoOfPerson;
        this._motorInsuranceDetails.TwoWheelerDetail.InvoiceCover = result.InvoiceCover;
        this._motorInsuranceDetails.TwoWheelerDetail.RoadsideAssistance = result.RoadsideAssistance;
        this._motorInsuranceDetails.TwoWheelerDetail.EngineProtector = result.EngineProtector;
        this._motorInsuranceDetails.TwoWheelerDetail.MinIDVAmount = 0
        this._motorInsuranceDetails.TwoWheelerDetail.MaxIDVAmount = 0
        this._motorInsuranceDetails.TwoWheelerDetail.PreviousPolicyZeroDepreciation = result.PreviousPolicyZeroDepreciation;
        this._motorInsuranceDetails.TwoWheelerDetail.PreviousPolicyEngineProtector = result.PreviousPolicyEngineProtector;
        this._motorInsuranceDetails.TwoWheelerDetail.PreviousPolicyInvoiceCover = result.PreviousPolicyInvoiceCover;
        this._motorInsuranceDetails.TwoWheelerDetail.PreviousPolicyConsumable = result.PreviousPolicyConsumable;

        localStorage.setItem('TwoWheelerMotorInsurance', JSON.stringify(this._motorInsuranceDetails));

        this.getMotorPlans(type) // get plans
      }
    });
  }

  //Compare Selected Policy Details
  public CompareNow(): void {
    if (this.compareList.length > 0) {
      localStorage.setItem('TwoWheelerMotorComparePlans', JSON.stringify(this.compareList));
      this._router.navigate([ROUTING_PATH.MotorTwoWheelerQuote.Compare]);
    } else {
      this._alertservice.raiseErrorAlert('please select any plan');
    }
  }

  // clear the list of policies that are to be compared
  public CompareClear(): void {
    this.compareList = [];
    this.policies.forEach((p) => {
      p.isChecked = false;
    });
  }


  onChange(event, type: string): void {
    if (type == 'IDVStatus') {
      if (event.checked === true) {
        this.isIDVStatus = 1;
        this.sliderMinValue = this.minIDVAmount;
        this.sliderMaxValue = this.maxIDVAmount;
        this.vehicleIDV.patchValue(this.minIDVAmount);
        this._isClickOnGo = false;
      } else {
        this.isIDVStatus = 0;
        this.sliderMinValue = 0;
        this.sliderMaxValue = 0;
        this.vehicleIDV.patchValue(0);

        if (this._isClickOnGo == true) {
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

  private _selectedAddOnsByUser(): void {
    this.selectedAddOns = [];
    let arrayOfAddOn = [
      // { DisplayName: 'Personal Accident', Key: 'PersonalAccident' },
      { DisplayName: 'Driver Cover', Key: 'DriverCover' },
      { DisplayName: 'Zero Depreciation', Key: 'ZeroDepreciation' },
      { DisplayName: 'Electrical Accessories', Key: 'Accessories' },
      { DisplayName: 'NCB Protection', Key: 'NCBProtection' },
      { DisplayName: 'Invoice Cover', Key: 'InvoiceCover' },
      { DisplayName: '24x7 Roadside Assistance', Key: 'RoadsideAssistance' },
      { DisplayName: 'Engine Protector', Key: 'EngineProtector' },
    ];
    arrayOfAddOn.forEach((element, index) => {
      if (this._motorInsuranceDetails.TwoWheelerDetail[element.Key] == true) {
        this.selectedAddOns.push(element);
      }
    });
  }

  /**
   * validating the value of VehicleIDV (value of VehicleIDV must be between MaxIDVAmount & MinIDVAmount)
   * @returns : alert message
   */
  private _IDVValidations(): Alert[] {
    let alert: Alert[] = [];
    if (
      this.vehicleIDV.value < this.minIDVAmount ||
      this.vehicleIDV.value > this.maxIDVAmount
    ) {
      alert.push({
        Message: `IDV must be between ${this.minIDVAmount} and ${this.maxIDVAmount}`,
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
  private _minMaxIDV(): void {
    this._differenceInAddOn();
    if (
      (this.minIDVAmount == null || this.minIDVAmount == 0) &&
      (this.maxIDVAmount == null || this.maxIDVAmount == 0)
    ) {
      this.minIDVAmount = this.policies[0].MinIDVAmount;
      this.maxIDVAmount = this.policies[0].MaxIDVAmount;
      this.vehicleIDV.setValue(this.minIDVAmount)
    }
    this.policies.forEach((element, index) => {
      if (element.MinIDVAmount < this.minIDVAmount) {
        this.minIDVAmount = element.MinIDVAmount;
        this.vehicleIDV.setValue(this.minIDVAmount)
      }
      if (element.MaxIDVAmount > this.maxIDVAmount) {
        this.maxIDVAmount = element.MaxIDVAmount;
      }
    });

    if (this.isIDVStatus == 0) {
      this.vehicleIDV.setValue(0)
    }
  }

  /**
   * list of AddOn that are only in Plan
   * list of AddOn that are selected but are not in plan
   */
  private _differenceInAddOn(): void {
    this.policies.forEach((p) => {
      p.selectedAddOn = this.selectedAddOns;

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
  private _AddCompanyName(policyCompanyName): void {
    this._filterPolicy = [];
    let policyCompany: InsurerCompanyDto = new InsurerCompanyDto();
    policyCompany.Name = policyCompanyName;
    policyCompany.SortOrder = 10;
    this._filterPolicy.push(policyCompany);
  }

  //#endregion Private methods
}
