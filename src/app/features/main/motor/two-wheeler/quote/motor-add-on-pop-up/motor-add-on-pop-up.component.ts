import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { Alert } from '@models/common';
import { MotorBusinessTypeEnum } from 'src/app/shared/enums/MotorBusinessType.enum';
import { MotorCustomerTypeEnum } from 'src/app/shared/enums/MotorCustomerType.enum';
import { MotorPolicyTypeEnum } from 'src/app/shared/enums/MotorPolicyType.enum';

@Component({
  selector: 'gnx-motor-add-on-pop-up',
  templateUrl: './motor-add-on-pop-up.component.html',
  styleUrls: ['./motor-add-on-pop-up.component.scss']
})
export class MotorAddOnPopUpComponent {

  //#region public properties

  public title: string
  public addOnForm: FormGroup

  // boolean variable
  public chkPersonalAccident :boolean = false;
  public chkZeroDepreciation: boolean = false;
  public chkNCBProtection: boolean = false;
  public chkInvoiceCover: boolean = false;
  public chkRoadAssistance: boolean = false;
  public chkEngineProtector: boolean = false;
  public chkAccessories: boolean = false;
  public chkDriverCover: boolean = false;

  //#endregion

  //#region private properties

  private _alerts: Alert[] = []

  //#endregion

  //#region constructor
  constructor(private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string,
      data?: any,
    },
    private _fb: FormBuilder,
    private _alertservice: AlertsService) {
    this.addOnForm = this._buildAddOnDetailsForm(data.data)
    this.title = data.title
  }

  // #endregion constructor

  //#region public-getters

  //#endregion

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this._changeInData()
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // close the popUp without saving the change in value
  public cancle(): void {
    this.dialogRef.close()
  }

  // close the popUp with the change in values of AddOn after validating the form.
  public save(): void {
    this._formValidation()
    if (this._alerts.length > 0) {
      this._alertservice.raiseErrors(this._alerts)
      return
    }

    this.dialogRef.close(this.addOnForm.value)
  }

  //#endregion public-methods

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Validating form
  private _formValidation(): void {

    this._alerts = []

    // Accessories
    if (this.addOnForm.get('Accessories').value) {

      // ElectricalAccessories
      if (this.addOnForm.get('ElectricalAccessories').invalid) {
        this._alerts.push({
          Message: 'Enter Electrical',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      // NonElectricalAccessories
      if (this.addOnForm.get('NonElectricalAccessories').invalid) {
        this._alerts.push({
          Message: 'Enter Non-Electrical',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    // // DriverCover
    // if(this.addOnForm.get('DriverCover').value) {

    //   // DriverCoverSumInsured
    //   if(this.addOnForm.get('DriverCoverSumInsured').invalid) {
    //     this._alerts.push({
    //       Message: 'Enter Driver Cover Sum Insured',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     })
    //   }

    // }
  }

  // identify change in value
  private _changeInData(): void {

    let MotorInsurance = JSON.parse(localStorage.getItem('TwoWheelerMotorInsurance'));
    this.AddOnFliedDisabled(MotorInsurance)

    // this.addOnForm.get('DriverCover').valueChanges.subscribe((value) => {
    //   if (value == false) {
    //     this.addOnForm.get('DriverCoverSumInsured').patchValue(null)
    //   }
    // })

    this.addOnForm.get('Accessories').valueChanges.subscribe((value) => {
      if (value == false) {
        this.addOnForm.patchValue({
          ElectricalAccessories: null,
          NonElectricalAccessories: null,
        })
      }
    })

    // this.addOnForm.get('PersonAccident').valueChanges.subscribe((value) => {
    //   if (value==false) {
    //     this.addOnForm.patchValue({
    //       // NoOfPerson:null,
    //       PersonSumInsured:null,
    //     })
    //   }
    // })
  }

  /**
   * Policy Type, Proposal Type and Customer Type wise Add on fields disables or enabled 
   */
  private AddOnFliedDisabled(res): void {
    if (res) {

      let ProposalType = res.BusinessType;
      let PolicyType = res.PolicyType;
      let CustomerType = res.CustomerDetail.CustomerType;

      if (ProposalType != "" && PolicyType != "" && CustomerType != "") {

        if (CustomerType == MotorCustomerTypeEnum.Individual) {

          if (ProposalType == MotorBusinessTypeEnum.New && PolicyType == MotorPolicyTypeEnum.Comprehensive) {
            this.chkZeroDepreciation = false;
            this.chkNCBProtection = false;
            this.chkInvoiceCover = false;
            this.chkRoadAssistance = false;
            this.chkEngineProtector = false;
            this.chkAccessories = false;
            this.chkDriverCover = false;
          }
          else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum.Comprehensive) {
            this.chkPersonalAccident = false;
            this.chkZeroDepreciation = false;
            this.chkNCBProtection = false;
            this.chkInvoiceCover = false;
            this.chkRoadAssistance = false;
            this.chkEngineProtector = false;
            this.chkAccessories = false;
            this.chkDriverCover = false;
          }
          else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Third Party Only']) {

            this.addOnForm.get("PersonalAccident").enable();
            this.addOnForm.get("DriverCover").enable();

            this.addOnForm.get('ZeroDepreciation').disable();
            this.addOnForm.get('NCBProtection').disable();
            this.addOnForm.get('InvoiceCover').disable();
            this.addOnForm.get('RoadsideAssistance').disable();
            this.addOnForm.get('EngineProtector').disable();
            this.addOnForm.get('Accessories').disable();

            this.chkDriverCover = false;

            this.chkZeroDepreciation = true;
            this.chkNCBProtection = true;
            this.chkInvoiceCover = true;
            this.chkRoadAssistance = true;
            this.chkEngineProtector = true;
            this.chkAccessories = true;

            this.addOnForm.patchValue({
              ZeroDepreciation: false,
              NCBProtection: false,
              InvoiceCover: false,
              RoadsideAssistance: false,
              EngineProtector: false,
              Accessories: false,
            });

          }
          else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Own Damage']) {

            this.addOnForm.get('PersonalAccident').disable();
            this.addOnForm.get('DriverCover').disable();

            this.addOnForm.patchValue({
              PersonalAccident: false,
              DriverCover: false,
            });

            this.addOnForm.get('ZeroDepreciation').enable();
            this.addOnForm.get('NCBProtection').enable();
            this.addOnForm.get('InvoiceCover').enable();
            this.addOnForm.get('RoadsideAssistance').enable();
            this.addOnForm.get('EngineProtector').enable();
            this.addOnForm.get('Accessories').enable();

            this.chkPersonalAccident = true;
            this.chkDriverCover = true;

            this.chkZeroDepreciation = false;
            this.chkNCBProtection = false;
            this.chkInvoiceCover = false;
            this.chkRoadAssistance = false;
            this.chkEngineProtector = false;
            this.chkAccessories = false;
          }

        }
        else if (CustomerType == MotorCustomerTypeEnum.Corporate) {

          this.addOnForm.get('PersonalAccident').disable();
          this.addOnForm.get('PersonalAccident').patchValue(false);
          if (ProposalType == MotorBusinessTypeEnum.New && PolicyType == MotorPolicyTypeEnum.Comprehensive) {
            this.chkDriverCover = false;
            this.chkZeroDepreciation = false;
            this.chkNCBProtection = false;
            this.chkInvoiceCover = false;
            this.chkRoadAssistance = false;
            this.chkEngineProtector = false;
            this.chkAccessories = false;
          }
          else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum.Comprehensive) {
            this.chkDriverCover = false;
            this.chkZeroDepreciation = false;
            this.chkNCBProtection = false;
            this.chkInvoiceCover = false;
            this.chkRoadAssistance = false;
            this.chkEngineProtector = false;
            this.chkAccessories = false;
          }
          else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Third Party Only']) {

            this.addOnForm.get('ZeroDepreciation').disable();
            this.addOnForm.get('NCBProtection').disable();
            this.addOnForm.get('InvoiceCover').disable();
            this.addOnForm.get('RoadsideAssistance').disable();
            this.addOnForm.get('EngineProtector').disable();
            this.addOnForm.get('Accessories').disable();

            this.addOnForm.patchValue({
              ZeroDepreciation: false,
              NCBProtection: false,
              InvoiceCover: false,
              RoadsideAssistance: false,
              EngineProtector: false,
              Accessories: false,
            });

            // this.addOnForm.get("PersonAccident").enable();
            this.addOnForm.get("DriverCover").enable();

            this.chkDriverCover = false;
            this.chkZeroDepreciation = true;
            this.chkNCBProtection = true;
            this.chkInvoiceCover = true;
            this.chkRoadAssistance = true;
            this.chkEngineProtector = true;
            this.chkAccessories = true;

          }
          else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Own Damage']) {

            // this.addOnForm.get('PersonAccident').disable();
            this.addOnForm.get('DriverCover').disable();

            this.addOnForm.patchValue({
              // PersonAccident: false,
              DriverCover: false,
            });

            this.addOnForm.get("ZeroDepreciation").enable();
            this.addOnForm.get("NCBProtection").enable();
            this.addOnForm.get("InvoiceCover").enable();
            // this.addOnForm.get('TyreSecure').enable();
            this.addOnForm.get("RoadsideAssistance").enable();
            this.addOnForm.get("EngineProtector").enable();
            // this.addOnForm.get("Consumable").enable();
            // this.addOnForm.get("KeyandLockReplacement").enable();
            // this.addOnForm.get("RepairofGlass").enable();
            this.addOnForm.get("Accessories").enable();
            this.addOnForm.get("ElectricalAccessories").enable();
            this.addOnForm.get("NonElectricalAccessories").enable();

            this.chkDriverCover = true;

            this.chkZeroDepreciation = false;
            this.chkNCBProtection = false;
            this.chkInvoiceCover = false;
            this.chkRoadAssistance = false;
            this.chkEngineProtector = false;
            this.chkAccessories = false;
          }
        }
      }
    }

  }

  // main form (AddOn form)
  private _buildAddOnDetailsForm(data): FormGroup {
    let mQCD = this._fb.group({
      PersonalAccident: [false],
      DriverCover: [false],
      // DriverCoverSumInsured: [null, [Validators.required]],
      ZeroDepreciation: [false],
      Accessories: [false],
      ElectricalAccessories: [null, [Validators.required, Validators.min(1)]],
      NonElectricalAccessories: [null, [Validators.required, Validators.min(1)]],
      NCBProtection: [false],
      InvoiceCover: [false],
      RoadsideAssistance: [false],
      EngineProtector: [false],
      PreviousPolicyZeroDepreciation: [false],
      PreviousPolicyConsumable: [false],
      PreviousPolicyEngineProtector: [false],
      PreviousPolicyInvoiceCover: [false],
    })

    if (data) {
      mQCD.patchValue(data)
    }

    return mQCD;
  }

  // #endregion Private methods
}
