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

  title:string
  AddOnForm: FormGroup

  alerts:Alert[] = []
  SumInsuredAmount = [
    { name: '1 Lakh', value: 100000 },
    { name: '2 Lakh', value: 200000 },
  ];
  DriverCoverAmount = [
    { name: '1 Lakh', value: 100000 },
    { name: '2 Lakh', value: 200000 },
  ];

  // boolean 
  chkPersonalAccident :boolean = false;
  chkZeroDepreciation :boolean = false;
  chkNCBProtection :boolean = false;
  chkInvoiceCover :boolean = false;
  chkRoadAssistance :boolean = false;
  chkEngineProtector :boolean = false;
  chkConsumable :boolean = false;
  chkKeyandLockReplacement :boolean = false;
  chkRepairofGlass :boolean = false;
  chkAccessories :boolean = false;
  chkPassenger :boolean = false;
  chkDriverCover :boolean = false;
  chkTyreSecure :boolean = false;

  //#region constructor
  constructor(private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title:string,
      data?:any,
    },
    private _fb:FormBuilder,
    private _alertservice: AlertsService) {
      this.AddOnForm = this._buildAddOnDetailsForm(data.data)
      this.title=data.title
  }

  // #endregion constructor

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
  public cancle() {
    this.dialogRef.close()
  }

  // close the popUp with the change in values of AddOn after validating the form.
  public save() {
    this._formValidation()
    if(this.alerts.length>0) {
      this._alertservice.raiseErrors(this.alerts)
      return
    }

    this.dialogRef.close(this.AddOnForm.value)
  }

  //#endregion public-methods


  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Validating form
  private _formValidation() {

    this.alerts = []

    // Accessories
    if(this.AddOnForm.get('Accessories').value) {

      // ElectricalAccessories
      if(this.AddOnForm.get('ElectricalAccessories').invalid) {
        this.alerts.push({
          Message: 'Enter Electrical',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      // NonElectricalAccessories
      if(this.AddOnForm.get('NonElectricalAccessories').invalid) {
        this.alerts.push({
          Message: 'Enter Non-Electrical',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    // PersonAccident
    if(this.AddOnForm.get('PersonAccident').value) {

      // PersonSumInsured
      if(this.AddOnForm.get('PersonSumInsured').invalid) {
        this.alerts.push({
          Message: 'Enter Person Sum Insured',
          CanDismiss: false,
          AutoClose: false,
        })
      }
    }

    // // DriverCover
    // if(this.AddOnForm.get('DriverCover').value) {

    //   // DriverCoverSumInsured
    //   if(this.AddOnForm.get('DriverCoverSumInsured').invalid) {
    //     this.alerts.push({
    //       Message: 'Enter Driver Cover Sum Insured',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     })
    //   }

    // }
  }

  // identify change in value
  private _changeInData() {
   
    let MotorInsurance = JSON.parse(localStorage.getItem('MotorInsurance'));
    this.AddOnFliedDisabled(MotorInsurance)
    
    this.AddOnForm.get('DriverCover').valueChanges.subscribe((value) => {
      if (value==false) {
        this.AddOnForm.get('DriverCoverSumInsured').patchValue(null)
      }
    })

    this.AddOnForm.get('Accessories').valueChanges.subscribe((value) => {
      if (value==false) {
        this.AddOnForm.patchValue({
          ElectricalAccessories:null,
          NonElectricalAccessories:null,
        })
      }
    })

    this.AddOnForm.get('PersonAccident').valueChanges.subscribe((value) => {
      if (value==false) {
        this.AddOnForm.patchValue({
          // NoOfPerson:null,
          PersonSumInsured:null,
        })
      }
    })
  }

  /**
   * Policy Type, Proposal Type and Customer Type wise Add on fields disables or enabled 
   */
  private AddOnFliedDisabled(res) {
    if(res){
      
      let ProposalType =  res.BusinessType;
      let PolicyType = res.PolicyType;
      let CustomerType = res.CustomerDetail.CustomerType;
  
      if (ProposalType != "" && PolicyType != "" && CustomerType != "") {
  
        let PreviousPolicyType = res.PolicyDetail.PreviousPolicyType;
  
        if (CustomerType == MotorCustomerTypeEnum.Individual) {          
          
          if (ProposalType == MotorBusinessTypeEnum.New && PolicyType == MotorPolicyTypeEnum.Comprehensive) {
            this.chkPersonalAccident = false;
            this.chkZeroDepreciation = false;
            this.chkNCBProtection = false;
            this.chkInvoiceCover = false;
            this.chkRoadAssistance = false;
            this.chkEngineProtector = false;
            this.chkConsumable = false;
            this.chkKeyandLockReplacement = false;
            this.chkRepairofGlass = false;
            this.chkAccessories = false;
            this.chkPassenger = false;
            this.chkDriverCover = false;
            this.chkTyreSecure = false;
          }
          else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum.Comprehensive) {
            this.chkPersonalAccident = false;
            this.chkZeroDepreciation = false;
            this.chkNCBProtection = false;
            this.chkInvoiceCover = false;
            this.chkRoadAssistance = false;
            this.chkEngineProtector = false;
            this.chkConsumable = false;
            this.chkKeyandLockReplacement = false;
            this.chkRepairofGlass = false;
            this.chkAccessories = false;
            this.chkPassenger = false;
            this.chkDriverCover = false;
            this.chkTyreSecure = false;
          }
          else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Third Party Only']) {
  
            this.AddOnForm.get("PersonalAccident").enable();
            this.AddOnForm.get("PersonAccident").enable();
            this.AddOnForm.get("DriverCover").enable();
            
            this.AddOnForm.get('ZeroDepreciation').disable();
            this.AddOnForm.get('NCBProtection').disable();
            this.AddOnForm.get('InvoiceCover').disable();
            this.AddOnForm.get("TyreSecure").disable();
            this.AddOnForm.get('RoadsideAssistance').disable();
            this.AddOnForm.get('EngineProtector').disable();
            this.AddOnForm.get('Consumable').disable();
            this.AddOnForm.get('KeyandLockReplacement').disable();
            this.AddOnForm.get('RepairofGlass').disable();
            this.AddOnForm.get('Accessories').disable();

            this.chkPersonalAccident = false;
            this.chkPassenger = false;
            this.chkDriverCover = false;
            
            this.chkZeroDepreciation = true;
            this.chkNCBProtection = true;
            this.chkInvoiceCover = true;
            this.chkTyreSecure = true;
            this.chkRoadAssistance = true;
            this.chkEngineProtector = true;
            this.chkConsumable = true;
            this.chkKeyandLockReplacement = true;
            this.chkRepairofGlass = true;
            this.chkAccessories = true;
              
            this.AddOnForm.patchValue({
              ZeroDepreciation: false,
              NCBProtection: false,
              InvoiceCover: false,
              TyreSecure: false,
              RoadsideAssistance: false,
              EngineProtector: false,
              Consumable: false,
              KeyandLockReplacement: false,
              RepairofGlass: false,
              Accessories: false,
            });
  
          }
          else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Own Damage']) {
  
            this.AddOnForm.get('PersonalAccident').disable();
            this.AddOnForm.get('PersonAccident').disable();
            this.AddOnForm.get('DriverCover').disable();
            
            this.AddOnForm.patchValue({
              PersonalAccident: false,
              PersonAccident: false,
              DriverCover: false,
            });
            
            this.AddOnForm.get('ZeroDepreciation').enable();
            this.AddOnForm.get('NCBProtection').enable();
            this.AddOnForm.get('InvoiceCover').enable();
            this.AddOnForm.get('TyreSecure').enable();
            this.AddOnForm.get('RoadsideAssistance').enable();
            this.AddOnForm.get('EngineProtector').enable();
            this.AddOnForm.get('Consumable').enable();
            this.AddOnForm.get('KeyandLockReplacement').enable();
            this.AddOnForm.get('RepairofGlass').enable();
            this.AddOnForm.get('Accessories').enable();

            this.chkPersonalAccident = true;
            this.chkPassenger = true;
            this.chkDriverCover = true;
            
            this.chkZeroDepreciation = false;
            this.chkNCBProtection = false;
            this.chkInvoiceCover = false;
            this.chkTyreSecure = false;
            this.chkRoadAssistance = false;
            this.chkEngineProtector = false;
            this.chkConsumable = false;
            this.chkKeyandLockReplacement = false;
            this.chkRepairofGlass = false;
            this.chkAccessories = false;
          }
  
        }
        else if (CustomerType == MotorCustomerTypeEnum.Corporate) {
          
          this.AddOnForm.get('PersonalAccident').disable();
          this.AddOnForm.get('PersonalAccident').patchValue(false);
          this.chkPersonalAccident = true;
          if (ProposalType == MotorBusinessTypeEnum.New && PolicyType == MotorPolicyTypeEnum.Comprehensive) {
            this.chkPassenger = false;
            this.chkDriverCover = false;
            this.chkTyreSecure = false;
            this.chkZeroDepreciation = false;
            this.chkNCBProtection = false;
            this.chkInvoiceCover = false;
            this.chkRoadAssistance = false;
            this.chkEngineProtector = false;
            this.chkConsumable = false;
            this.chkKeyandLockReplacement = false;
            this.chkRepairofGlass = false;
            this.chkAccessories = false;
          }
          else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum.Comprehensive) {
            this.chkPassenger = false;
            this.chkDriverCover = false;
            this.chkTyreSecure = false;
            this.chkZeroDepreciation = false;
            this.chkNCBProtection = false;
            this.chkInvoiceCover = false;
            this.chkRoadAssistance = false;
            this.chkEngineProtector = false;
            this.chkConsumable = false;
            this.chkKeyandLockReplacement = false;
            this.chkRepairofGlass = false;
            this.chkAccessories = false;
          }
          else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Third Party Only']) {
  
            this.AddOnForm.get('ZeroDepreciation').disable();
            this.AddOnForm.get('NCBProtection').disable();
            this.AddOnForm.get('InvoiceCover').disable();
            this.AddOnForm.get("TyreSecure").disable();
            this.AddOnForm.get('RoadsideAssistance').disable();
            this.AddOnForm.get('EngineProtector').disable();
            this.AddOnForm.get('Consumable').disable();
            this.AddOnForm.get('KeyandLockReplacement').disable();
            this.AddOnForm.get('RepairofGlass').disable();
            this.AddOnForm.get('Accessories').disable();
  
            this.AddOnForm.patchValue({
              ZeroDepreciation:false,
              NCBProtection: false,
              InvoiceCover: false,
              TyreSecure: false,
              RoadsideAssistance: false,
              EngineProtector: false,
              Consumable: false,
              KeyandLockReplacement: false,
              RepairofGlass: false,
              Accessories: false,
            });

            this.AddOnForm.get("PersonAccident").enable();
            this.AddOnForm.get("DriverCover").enable();
            

            this.chkPassenger = false;
            this.chkDriverCover = false;
            this.chkZeroDepreciation = true;
            this.chkNCBProtection = true;
            this.chkInvoiceCover = true;
            this.chkTyreSecure = true;
            this.chkRoadAssistance = true;
            this.chkEngineProtector = true;
            this.chkConsumable = true;
            this.chkKeyandLockReplacement = true;
            this.chkRepairofGlass = true;
            this.chkAccessories = true;
  
          }
          else if (ProposalType == MotorBusinessTypeEnum['Roll Over'] && PolicyType == MotorPolicyTypeEnum['Own Damage']) {
           
            this.AddOnForm.get('PersonAccident').disable();
            this.AddOnForm.get('DriverCover').disable();
  
            this.AddOnForm.patchValue({
              PersonAccident: false,
              DriverCover: false,
            });

            this.AddOnForm.get("ZeroDepreciation").enable();
            this.AddOnForm.get("NCBProtection").enable();
            this.AddOnForm.get("InvoiceCover").enable();
            this.AddOnForm.get('TyreSecure').enable();
            this.AddOnForm.get("RoadsideAssistance").enable();
            this.AddOnForm.get("EngineProtector").enable();
            this.AddOnForm.get("Consumable").enable();
            this.AddOnForm.get("KeyandLockReplacement").enable();
            this.AddOnForm.get("RepairofGlass").enable();
            this.AddOnForm.get("Accessories").enable();
            this.AddOnForm.get("ElectricalAccessories").enable();
            this.AddOnForm.get("NonElectricalAccessories").enable();

            this.chkPassenger = true;
            this.chkDriverCover = true;
            
            this.chkZeroDepreciation = false;
            this.chkNCBProtection = false;
            this.chkInvoiceCover = false;
            this.chkTyreSecure = false;
            this.chkRoadAssistance = false;
            this.chkEngineProtector = false;
            this.chkConsumable = false;
            this.chkKeyandLockReplacement = false;
            this.chkRepairofGlass = false;
            this.chkAccessories = false;

          }
        }
      }
    }
  
  }

  // main form (AddOn form)
  private _buildAddOnDetailsForm(data) {
    let mQCD = this._fb.group({
      PersonalAccident: [false],
      DriverCover: [false],
      TyreSecure: [false],
      DriverCoverSumInsured: [null, [Validators.required]],
      ZeroDepreciation: [false],
      Accessories: [false],
      ElectricalAccessories: [null, [Validators.required, Validators.min(1)]],
      NonElectricalAccessories: [null, [Validators.required, Validators.min(1)]],
      NCBProtection: [false],
      PersonAccident: [false],
      PersonSumInsured: [null, [Validators.required, Validators.min(1)]],
      InvoiceCover: [false],
      RoadsideAssistance: [false],
      EngineProtector: [false],
      Consumable: [false],
      KeyandLockReplacement: [false],
      RepairofGlass: [false],
      PassengerCover: [],
      PassengerCoverSumInsured: [],
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
