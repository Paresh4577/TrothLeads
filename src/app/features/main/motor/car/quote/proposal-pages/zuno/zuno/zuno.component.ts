import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { Router } from '@angular/router';
import { dropdown } from '@config/dropdown.config';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { ROUTING_PATH } from '@config/routingPath.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { MasterListService } from '@lib/services/master-list.service';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { Alert } from '@models/common';
import { ICityPincodeDto } from '@models/dtos/core/CityDto';
import { IZunoMotorKYCDto, ZunoMotorKYCDto } from '@models/dtos/motor-insurance/ZunoMotor/zuno-motor-kyc-dto';
import { IZunoCarDetailDto, IZunoCustomerDetailDto, IZunoPolicyDetailDto } from '@models/dtos/motor-insurance/ZunoMotor';
import { IZunoMotorDto, ZunoMotorDto } from '@models/dtos/motor-insurance/ZunoMotor/ZunoMotor-dto';
import * as moment from 'moment';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { QuoteService } from 'src/app/features/main/health/quote/quote.service';
import { MotorCustomerTypeEnum } from 'src/app/shared/enums/MotorCustomerType.enum';
import { ZunoService } from '../zuno.service';
import { MotorPolicyTypeEnum } from 'src/app/shared/enums/MotorPolicyType.enum';
import { DialogService } from '@lib/services/dialog.service';
import { MotorBusinessTypeEnum } from 'src/app/shared/enums/MotorBusinessType.enum';

@Component({
  selector: 'gnx-zuno',
  templateUrl: './zuno.component.html',
  styleUrls: ['./zuno.component.scss'],
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
export class ZunoComponent {

  // #region public variables

  //String
  pagetitle: string = 'Zuno Motor';
  Icon: string
  TransactionNo:string

  PANNum: RegExp = ValidationRegex.PANNumValidationReg;
  AadharNum: RegExp = ValidationRegex.UIDNumValidationReg;
  EmailValidateRegex: RegExp = ValidationRegex.emailValidationReg

  // chassis number : maximum and minimum length
  MinChassisNo: number = 10;
  MaxChassisNo: number = 17;

  //Formgroup & DTO
  ZunoProposal: IZunoMotorDto
  ZunoProposalForm: FormGroup

  // formControl
  step1 = new FormControl()

  //boolean
  IsKYC: boolean = false
  NomineeIsAdult = true

  // date
  maxDate:Date

  // alerts
  alerts:Alert[] = []

  // list
  VehicleDetails
  GenderList: any[];
  NomineeRelationList: any[];
  MaritalList: any[];
  FinancierNameList: any[];
  OccupationList: any[];
  InsurerList: any[];

  DropdownMaster: dropdown;

  pincodes$: Observable<ICityPincodeDto[]>;
  destroy$: Subject<any>;

  //#region constructor

  constructor(
    private fb: FormBuilder,
    private _alertservice: AlertsService,
    private _router: Router,
    private _MasterListService: MasterListService, //dropDown Value as per company name
    public dialog: MatDialog,
    private _datePipe: DatePipe, //to change the format of date
    private _quoteService: QuoteService,
    private _zunoService: ZunoService,
    private _dialogService: DialogService,
  ) {

    this.destroy$ = new Subject();
    this.DropdownMaster = new dropdown();
    this.ZunoProposal = new ZunoMotorDto()

    this.maxDate = new Date()




    if (localStorage.getItem('motorBuyPolicy')) {
      let motorBuyPolicyDetails = JSON.parse(localStorage.getItem('motorBuyPolicy'))
      this.Icon = motorBuyPolicyDetails.IconURL
      this.TransactionNo = motorBuyPolicyDetails.TransactionNo
    }
    this._SetCarAndPolicyDataFromProposalForm()// Call the function for bind data in form

  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {

    this._fillMasterList()

    // main form init
    this.ZunoProposalForm = this._buildZunoProposalForm(this.ZunoProposal)

    // this.ZunoProposalForm.get('CustomerDetail').patchValue({
    //   CustomerType:MotorCustomerTypeEnum.Individual
    // })

    if (this.VehicleDetails.Financed && this.VehicleDetails.Financer != '') {

      /**
       * This data come fron Vehicle details
       * Bind Data Of Vehicle  Financier Code
       */

        let Financer = this.FinancierNameList.find(Financer => Financer.Name == this.VehicleDetails.Financer)

        if (Financer) {
          this.ZunoProposalForm.get('CustomerDetail').patchValue(
            {
              FinancierName: Financer.Name,
              FinancierCode: Financer.Code,
            }, { emitEvent: false }
          );
        }
    }


    this._onFormChanges()
    this._changeInNomineeAge()
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
    return this.ZunoProposalForm.controls;
  }

  get MotorCustomerType() {
    return MotorCustomerTypeEnum
  }

  get MotorPolicyType() {
    return MotorPolicyTypeEnum;
  }

  public ProceedToPay() {
    let errorMessage:Alert[] = []
    errorMessage = this._stepTwoValidation()
    if (errorMessage.length>0) {
      this._alertservice.raiseErrors(errorMessage)
      return
    }
    this._zunoService.createProposal(this.ZunoProposalForm.value).subscribe((res) => {
      if (res.Success) {
        this._alertservice.raiseSuccessAlert(res.Message);
        this._quoteService.openWindowWithPost(res.Data.BillDeskURL, {
          msg: res.Data.Msg + "|" + res.Data.Checksum
        })
      } else {
        if (res.Alerts && res.Alerts?.length > 0) {
          this._alertservice.raiseErrors(res.Alerts)
        } else {
          this._alertservice.raiseErrorAlert(res.Message)
        }
      }
    })
  }

  // step 1 validation
  public stepOneValidation() {
    this.alerts = []
    if (this.ZunoProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate) {
      if (this.ZunoProposalForm.get('CustomerDetail.CompanyName').invalid) {
        this.alerts.push({
          Message: 'Enter Company Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.ZunoProposalForm.get('CustomerDetail.DOB').invalid) {
        this.alerts.push({
          Message: 'Enter Company Start Date',
          CanDismiss: false,
          AutoClose: false,
        });
      }

    }
    else if (this.ZunoProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Individual) {
      if (this.ZunoProposalForm.get('CustomerDetail.Salutation').invalid || this.ZunoProposalForm.get('CustomerDetail.Salutation').value==0) {
        this.alerts.push({
          Message: 'Select Title',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.ZunoProposalForm.get('CustomerDetail.FirstName').invalid) {
        this.alerts.push({
          Message: 'Enter First Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.ZunoProposalForm.get('CustomerDetail.LastName').invalid) {
        this.alerts.push({
          Message: 'Enter Last Name',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.ZunoProposalForm.get('CustomerDetail.Gender').invalid) {
        this.alerts.push({
          Message: 'Select Gender',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.ZunoProposalForm.get('CustomerDetail.DOB').invalid) {
        this.alerts.push({
          Message: 'Enter Date of Birth',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.ZunoProposalForm.get('CustomerDetail.Marital').invalid) {
        this.alerts.push({
          Message: 'Select Marital Status',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.ZunoProposalForm.get('CustomerDetail.Occupation').invalid) {
        this.alerts.push({
          Message: 'Select Occupation',
          CanDismiss: false,
          AutoClose: false,
        });
      }

    }

    // MobileNo
    if (this.ZunoProposalForm.get('CustomerDetail.MobileNo').invalid) {
      this.alerts.push({
        Message: 'Enter Mobile',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    // Email
    if (this.ZunoProposalForm.get('CustomerDetail.Email').invalid) {
      this.alerts.push({
        Message: 'Enter Email',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.ZunoProposalForm.get('CustomerDetail.Email').value != '') {
      if (!this.EmailValidateRegex.test(this.ZunoProposalForm.get('CustomerDetail.Email').value)) {
        this.alerts.push({
          Message: 'Enter Valid Email',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.ZunoProposalForm.get('CustomerDetail.PANNo').invalid) {
      this.alerts.push({
        Message: 'Enter PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    else if (!this.PANNum.test(this.ZunoProposalForm.get('CustomerDetail.PANNo').value)) {
      this.alerts.push({
        Message: 'Enter valid PAN',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.ZunoProposalForm.get('CustomerDetail.AadharNo').value !='' && !this.AadharNum.test(this.ZunoProposalForm.get('CustomerDetail.AadharNo').value)) {
      this.alerts.push({
        Message: 'Enter valid Aadhar',
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

  // step 1 error message
  public stepOneError(stepper) {
    if (this.alerts.length>0) {
      this._alertservice.raiseErrors(this.alerts)
      return
    }
    // after step 1 is validated KYC is done
    this._checkKYC(stepper)
  }

  // Pincode autocomplete
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.ZunoProposalForm.get('CustomerDetail').patchValue({
      PinCode: event.option.value.PinCode,
    });
  }

  // pop up for pincode
  public openDiologPincode(type: string, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '51vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";
    dialogConfig.data = {
      type: type,
      title: title,
      ispopup: true,
    };

    const dialogRef = this.dialog.open(GenPopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (type == 'Pincode') {
          this.ZunoProposalForm.get('CustomerDetail').patchValue({
            PinCode: result.PinCode,
          });
        }
      }
    });
  }

  // clear pincode
  public clear(name: string): void {
    this.ZunoProposalForm.get(name).setValue("")
  }

  //   /**
  //  * According to the change in value of mat-slide-toggle , value of CustomerType is updated
  //  * @param event : to identify change in the value of mat-slide-toggle
  //  */
  //   public changeInCustomerType(event) {
  //     if (event.checked) {
  //       this.ZunoProposalForm.get('CustomerDetail').patchValue({
  //         CustomerType:MotorCustomerTypeEnum.Corporate
  //       })
  //     }
  //     else {
  //       this.ZunoProposalForm.get('CustomerDetail').patchValue({
  //         CustomerType:MotorCustomerTypeEnum.Individual
  //       })
  //     }
  //   }


  // back Button
  public backClick() {
    this._router.navigate([ROUTING_PATH.MotorCarQuote.Plan]);
  }

  //#endregion public-methods
  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  private _checkKYC(stepper: MatStepper) {
    let requiredId: boolean = true;
    if (requiredId) {
      let KYCData: IZunoMotorKYCDto = new ZunoMotorKYCDto()
      KYCData = this._kycData()
      KYCData.DocTypeCode = 'PAN'
      KYCData.DocNumber = this.ZunoProposalForm.get('CustomerDetail.PANNo').value
      KYCData.MobileNo = this.ZunoProposalForm.get('CustomerDetail.MobileNo').value
      KYCData.EmailId = this.ZunoProposalForm.get('CustomerDetail.Email').value
      this._zunoService.KYC(KYCData).subscribe((res) => {
        if(res.Success) {
          if(res.Data.KYCStatus==1) {

            if (this.ZunoProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Individual ) 
            {

              let fullName = this._fullName(
                this.ZunoProposalForm.get('CustomerDetail.FirstName').value,
                this.ZunoProposalForm.get('CustomerDetail.LastName').value,
                this.ZunoProposalForm.get('CustomerDetail.MiddleName').value
              );

              let _FullName = this._fullName(
                res.Data.FirstName,
                res.Data.LastName,
                res.Data.MiddleName,
              );

              if (_FullName.toUpperCase() != fullName.toUpperCase()) {
                this._dialogService
                  .confirmDialog({
                    title: 'Are You Sure?',
                    message: `Replace Your Name with ${_FullName}`,
                    confirmText: 'Yes, Replace!',
                    cancelText: 'No',
                  })
                  .subscribe((response) => {
                    
                    if (response == true) {
                      this.ZunoProposalForm.get('CustomerDetail').patchValue({
                        FirstName:  res.Data.FirstName,
                        MiddleName: res.Data.MiddleName,
                        LastName: res.Data.LastName,
                      });
                    }

                    this.ZunoProposalForm.get('CustomerDetail').patchValue({
                      KYCId: res.Data.KycId,
                      KYCReqNo: res.Data.KYCReqNo
                    })

                    this.IsKYC = true
                    this.step1.reset();
                    stepper.next();
                    this._alertservice.raiseSuccessAlert(res.Message);

                  });
              }
              else
              {
                this.ZunoProposalForm.get('CustomerDetail').patchValue({
                  KYCId: res.Data.KycId,
                  KYCReqNo: res.Data.KYCReqNo
                })

                this.IsKYC = true
                this.step1.reset();
                stepper.next();
                this._alertservice.raiseSuccessAlert(res.Message);
              }
            }
            else if (this.ZunoProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate)
            {
              if (res.Data.CompanyName.toUpperCase() != this.ZunoProposalForm.get('CustomerDetail.CompanyName').value.toUpperCase()) {
                this._dialogService
                .confirmDialog({
                  title: 'Are You Sure?',
                  message: `Replace Company Name with ${res.Data.CompanyName}`,
                  confirmText: 'Yes, Replace!',
                  cancelText: 'No',
                })
                .subscribe((response) => {
                 
                  if (response == true) {
                    this.ZunoProposalForm.get('CustomerDetail').patchValue({
                      CompanyName: res.Data.CompanyName,
                    });
                  }

                  this.ZunoProposalForm.get('CustomerDetail').patchValue({
                    KYCId: res.Data.KycId,
                    KYCReqNo: res.Data.KYCReqNo
                  })

                  this.IsKYC = true
                  this.step1.reset();
                  stepper.next();
                  this._alertservice.raiseSuccessAlert(res.Message);

                });
              }
              else
              {
                this.ZunoProposalForm.get('CustomerDetail').patchValue({
                  KYCId: res.Data.KycId,
                  KYCReqNo: res.Data.KYCReqNo
                })

                this.IsKYC = true
                this.step1.reset();
                stepper.next();
                this._alertservice.raiseSuccessAlert(res.Message);
              }
            }

          }
          else {
            this.IsKYC = false;
            stepper.previous();
            if (res.Data.IC_KYC_REG_URL != null){
              // window.open(res.Data.IC_KYC_REG_URL, '_self');
              window.open(res.Data.IC_KYC_REG_URL.toString(), "_blank", "resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no, directories=no, location=no, width=1000, height=600, left=100, top=100 ");
            } else {
              if (res.Alerts && res.Alerts.length > 0) {
                this._alertservice.raiseErrors(res.Alerts);
              } else {
                this._alertservice.raiseErrorAlert(res.Message);
              }
            }
          }
        }
        else {
          this.IsKYC = false;
          stepper.previous();
          this._alertservice.raiseErrorAlert(res.Message);
        }
      })
    }
  }

  private _kycData() {
    let KYCdata: IZunoMotorKYCDto = new ZunoMotorKYCDto()
    if (this.ZunoProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Individual) {
      KYCdata.Name = this._fullName(this.ZunoProposalForm.get('CustomerDetail.FirstName').value,this.ZunoProposalForm.get('CustomerDetail.LastName').value,this.ZunoProposalForm.get('CustomerDetail.MiddleName').value)
      KYCdata.FirstName = this.ZunoProposalForm.get('CustomerDetail.FirstName').value
      KYCdata.LastName = this.ZunoProposalForm.get('CustomerDetail.LastName').value
      KYCdata.MiddleName = this.ZunoProposalForm.get('CustomerDetail.MiddleName').value
      KYCdata.isCorporate = false
    }
    else if (this.ZunoProposalForm.get('CustomerDetail.CustomerType').value == MotorCustomerTypeEnum.Corporate){
      KYCdata.Name = this.ZunoProposalForm.get('CustomerDetail.CompanyName').value
      KYCdata.isCorporate = true
    }
    KYCdata.TransactionNo = this.TransactionNo
    KYCdata.DOB = this._datePipe.transform(this.ZunoProposalForm.get('CustomerDetail.DOB').value, "yyyy-MM-dd")

    return KYCdata
  }

  // full name for KYC
  private _fullName(FName:string,LName:string,MName?:string) {
    let Name : string
    if (MName){
      Name = FName.concat(' ' , MName , ' ' , LName)
    } else {
      Name = FName.concat(' ',LName)
    }
    return Name
  }


  /**
   * Set Data in proposal create form From the Proposal quotation form & RTO data
   */
  private _SetCarAndPolicyDataFromProposalForm() {

    // To store Motor Quote Data
    let MotorQuotationData = JSON.parse(localStorage.getItem('MotorInsurance'))
    //To store Vehicle details from Quote Page
    this.VehicleDetails = JSON.parse(localStorage.getItem('VehicleDetails'))

    // to store selected policy detail
    let policyDetails = JSON.parse(localStorage.getItem('motorBuyPolicy'))

    //Set Car details Data In DTO
    this.ZunoProposal.CustomerDetail = MotorQuotationData.CustomerDetail
    
    this.ZunoProposal.CarDetail = MotorQuotationData.CarDetail
    this.ZunoProposal.PolicyDetail = MotorQuotationData.PolicyDetail
    this.ZunoProposal.BusinessType = MotorQuotationData.BusinessType
    this.ZunoProposal.PolicyType = MotorQuotationData.PolicyType
    this.ZunoProposal.RTOCode = MotorQuotationData.RTOCode
    this.ZunoProposal.TransactionNo = this.TransactionNo
    this.ZunoProposal.PolicyStartDate = MotorQuotationData.PolicyStartDate
    this.ZunoProposal.ProposalDate = MotorQuotationData.ProposalDate
    this.ZunoProposal.RegistrationDate = MotorQuotationData.RegistrationDate
    this.ZunoProposal.VehicleSubModelId = MotorQuotationData.VehicleSubModelId
    // this.ZunoProposal.ProductCode = '123'
    this.ZunoProposal.ProductCode = policyDetails.ProductCode
    this.ZunoProposal.CarDetail.EngineNo = this.VehicleDetails.EngineNo
    this.ZunoProposal.CarDetail.ChassisNo = this.VehicleDetails.ChassisNo
    this.ZunoProposal.CarDetail.VehicleIDV = policyDetails.CalIDVAmount
    this.ZunoProposal.Insurer = policyDetails.Insurer
    this.ZunoProposal.VehicleCode = policyDetails.VehicleCode

    this.ZunoProposal.PolicyDetail.ZunoDiscountOrLoadingPercentage = policyDetails.ZunoDiscountOrLoadingPercentage

    // for Get and Set Electrical SumInsure and Non Electrical SumInsure value from "policyDetails.CalcPremium.addonCovers"
    if (policyDetails.CalcPremium.addonCovers.length > 0) {

      let ElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "Electrical_Accessories_Premium" && x.Key == "Accessories");
      let NonElectricalPremium = policyDetails.CalcPremium.addonCovers.filter(x => x.Name == "NonElectrical_Accessories_Premium" && x.Key == "Accessories");

      if(ElectricalPremium.length > 0){
        this.ZunoProposal.CarDetail.ElectricalAccessories = ElectricalPremium[0].SumInsure;
      }

      if(NonElectricalPremium.length > 0){
        this.ZunoProposal.CarDetail.NonElectricalAccessories = NonElectricalPremium[0].SumInsure;
      }   
  }

    // let _proposalType = MotorQuotationData.BusinessType;
    // if (_proposalType == MotorBusinessTypeEnum['Roll Over']) {
    //   this.MinChassisNo = 10;
    //   this.MaxChassisNo = 17;
    // }
    // else {
    //   this.MinChassisNo = 10;
    //   this.MaxChassisNo = 10;
    // }
  }


  /**
   * step two validation
   * @returns : returns error
   */
  private _stepTwoValidation() {
    let error:Alert[] = []

    // // To store Motor Quote Data
    // let MotorQuotationData = JSON.parse(localStorage.getItem('MotorInsurance'))

    // if (MotorQuotationData.BusinessType == MotorBusinessTypeEnum['Roll Over']) {
    //   if (this.ZunoProposalForm.get('CarDetail.ChassisNo').value.length != this.MaxChassisNo && this.ZunoProposalForm.get('CarDetail.ChassisNo').value.length != this.MinChassisNo) {
    //     error.push({
    //       Message: 'Chassis No. must be either ' + this.MinChassisNo + ' or ' + this.MaxChassisNo + ' characters',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }
    // else{
    //   if (this.ZunoProposalForm.get('CarDetail.ChassisNo').value.length != this.MaxChassisNo) {
    //     error.push({
    //       Message: 'Chassis No. must be of ' + this.MaxChassisNo + ' characters',
    //       CanDismiss: false,
    //       AutoClose: false,
    //     });
    //   }
    // }

    if (this.ZunoProposalForm.get('CarDetail.ChassisNo').value.length > this.MaxChassisNo || this.ZunoProposalForm.get('CarDetail.ChassisNo').value.length < this.MinChassisNo) {
      error.push({
        Message: 'Chassis No. must be between of ' + this.MinChassisNo + ' to ' + this.MaxChassisNo + ' characters',
        CanDismiss: false,
        AutoClose: false,
      });
    }    

    // Finance Type
    if (this.ZunoProposalForm.get('CustomerDetail.FinancierName').value != "" && (this.ZunoProposalForm.get('CustomerDetail.FinanceType').value == "" || this.ZunoProposalForm.get('CustomerDetail.FinanceType').value == null)) {
      error.push({
        Message: 'Select Finance Type',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    // Financier Name
    if (this.ZunoProposalForm.get('CustomerDetail.FinanceType').value != "" && (this.ZunoProposalForm.get('CustomerDetail.FinancierName').value == "" || this.ZunoProposalForm.get('CustomerDetail.FinancierName').value == null)) {
      error.push({
        Message: 'Select Financier Name',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (this.f['BusinessType'].value == 'Rollover') {
      // Previous Policy No
      if (!this.ZunoProposalForm.get('PolicyDetail.PreviousPolicyNo').value) {
        error.push({
          Message: 'Enter Previous Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    if (!this.ZunoProposalForm.get('PolicyDetail.PreviousInsurer').value) {
      error.push({
        Message: 'Enter Previous Insurer',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (!this.ZunoProposalForm.get('PolicyDetail.PreviousInsurerAddress').value) {
      error.push({
        Message: 'Enter Previous Insurer Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }


    if (this.f['PolicyType'].value == this.MotorPolicyType['Own Damage']) {
      // Previous Policy No
      if (!this.ZunoProposalForm.get('PolicyDetail.CurrentTPPolicyNo').value) {
        error.push({
          Message: 'Enter Current TP Policy No',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (!this.ZunoProposalForm.get('PolicyDetail.CurrentTPName').value) {
        error.push({
          Message: 'Select Current TP Insurer',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
  }

    // Address
    if (this.ZunoProposalForm.get('CustomerDetail.Address').invalid) {
      error.push({
        Message: 'Enter Address',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    // PinCode
    if (this.ZunoProposalForm.get('CustomerDetail.PinCode').invalid) {
      error.push({
        Message: 'Enter PIN Code',
        CanDismiss: false,
        AutoClose: false,
      })
    }


    // NomineeFirstName
    if (this.ZunoProposalForm.get('CustomerDetail.NomineeFirstName').invalid && this.ZunoProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee First Name',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    // NomineeLastName
    if (this.ZunoProposalForm.get('CustomerDetail.NomineeLastName').invalid && this.ZunoProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Last Name',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    // NomineeRelation
    if (this.ZunoProposalForm.get('CustomerDetail.NomineeRelation').invalid && this.ZunoProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Select Nominee Relation',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    // NomineeDOB
    if (this.ZunoProposalForm.get('CustomerDetail.NomineeDOB').invalid && this.ZunoProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {
      error.push({
        Message: 'Enter Nominee Date Of Birth',
        CanDismiss: false,
        AutoClose: false,
      })
    }

    if (!this.NomineeIsAdult && this.ZunoProposalForm.get('CustomerDetail.CustomerType').value == this.MotorCustomerType.Individual) {

      // AppointeeFirstName
      if (this.ZunoProposalForm.get('CustomerDetail.AppointeeFirstName').invalid) {
        error.push({
          Message: 'Enter Appointee First Name',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      // AppointeeLastName
      if (this.ZunoProposalForm.get('CustomerDetail.AppointeeLastName').invalid) {
        error.push({
          Message: 'Enter Appointee Last Name',
          CanDismiss: false,
          AutoClose: false,
        })
      }

      // AppointeeRelation
      if (this.ZunoProposalForm.get('CustomerDetail.AppointeeRelation').invalid) {
        error.push({
          Message: 'Select Appointee Relation',
          CanDismiss: false,
          AutoClose: false,
        })
      }

    }
    return error
  }


  /**
   * to identify change in value of NomineeDOB and calculate age of Nominee . If Nominee is not an Adult than Appointee details are required
   */
  private _changeInNomineeAge() {
    this.ZunoProposalForm.get('CustomerDetail.NomineeDOB').valueChanges.subscribe((res) => {
      let ageOfNominee = moment(new Date()).diff(res, 'year')

      if (ageOfNominee<18) {
        this.NomineeIsAdult = false
      }
      else {
        this.NomineeIsAdult = true
      }
    })
  }


   // change in Pincode
   private _onFormChanges() {
    this.ZunoProposalForm.get('CustomerDetail.PinCode').valueChanges.subscribe(
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


  // dropdown list
  private _fillMasterList() {
    this.GenderList = [];
    // fill gender list
    this._MasterListService.getCompanyWiseList('Zuno', 'gender').subscribe((res) => {
      if (res.Success) {
        this.GenderList = res.Data.Items;
      }
    });

    this.InsurerList = [];
    // fill nominee relation list
    this._MasterListService
      .getCompanyWiseList('Zuno', 'zunopreinsurer')
      .subscribe((res) => {
        if (res.Success) {
          this.InsurerList = res.Data.Items;
        }
      });

    this.NomineeRelationList = [];
    // fill nominee relation list
    this._MasterListService.getCompanyWiseList('Zuno', 'nomineerelation').subscribe((res) => {
      if (res.Success) {
        this.NomineeRelationList = res.Data.Items;
      }
    });

    this.MaritalList = [];
    // fill marital list
    this._MasterListService.getCompanyWiseList('Zuno', 'marital').subscribe((res) => {
      if (res.Success) {
        this.MaritalList = res.Data.Items;
      }
    });

    this.FinancierNameList = [];
    this._MasterListService.getCompanyWiseList('Zuno', 'zunofinanciername').subscribe((res) => {
      if (res.Success) {
        this.FinancierNameList = res.Data.Items;
      }
    });

    this.OccupationList = [];
    // fill Occupation list
    this._MasterListService
      .getCompanyWiseList('Zuno', 'zunooccupation')
      .subscribe((res) => {
        if (res.Success) {
          this.OccupationList = res.Data.Items;
        }
      });
  }


   /**
   * Build Main Proposal Create Form
   * @param data
   * @returns
   */
   private _buildZunoProposalForm(data: IZunoMotorDto) {
    let proposalForm = this.fb.group({
      Insurer: [0],
      TransactionNo: [""],
      ProductCode: [""],
      ProposalDate: [""],
      BusinessType: [0],
      PolicyType: [0],
      VehicleSubModelId: [0],
      VehicleCode: [""],
      RTOCode: [""],
      PolicyStartDate: [""],
      RegistrationDate: [""],
      CarDetail: this._buildZunoCarDetailsForm(data.CarDetail),
      PolicyDetail: this._buildZunoPolicyDetailForm(data.PolicyDetail),
      CustomerDetail: this._buildZunoCustomerDetailForm(data.CustomerDetail)
    });
    if (data) {
      proposalForm.patchValue(data);
    }
    return proposalForm;
  }


  /**
   * Build Car Details Form
   * @param CustomerDetailData
   * @returns  CarDetailData Form
   */
  private _buildZunoCarDetailsForm(CarDetailsData: IZunoCarDetailDto) {
    let carDetailsForm = this.fb.group({
      EngineNo: [""],
      ChassisNo: [""],
      DateofFirstRegistration: [""],
      VehicleIDV: [0],
      YearOfManufacture: [0],
      BiFuelType: [0],
      BiFuelKitValue: [0],
      PersonalAccident: [],
      ZeroDepreciation: [],
      InvoiceCover: [],
      RoadsideAssistance: [],
      EngineProtector: [],
      NCBProtection: [],
      Consumable: [],
      KeyandLockReplacement: [],
      PersonAccident: [],
      NoOfPerson: [0],
      PersonSumInsured: [0],
      RepairofGlass: [],
      TyreSecure: [],
      DriverCover: [],
      DriverCoverSumInsured: [0],
      PassengerCover: [],
      PassengerCoverSumInsured: [0],
      Accessories: [],
      ElectricalAccessories: [0],
      NonElectricalAccessories: [0],
    })

    if (CarDetailsData) {
      carDetailsForm.patchValue(CarDetailsData)
    }

    return carDetailsForm;
  }


  /**
 * Build Policy Details Form
 * @param CustomerDetailData
 * @returns  PolicyDetailData Form
 */
  private _buildZunoPolicyDetailForm(PolicyDetailData: IZunoPolicyDetailDto) {
    let PolicyDetailForm = this.fb.group({
      PreviousPolicyNo: [""],
      PreviousIDV: [0],
      VehicleNo: [""],
      PolicyPeriod: [0],
      PreviousPolicyClaim: [],
      PreviousPolicyNCBPercentage: [0],
      PreviousPolicyType: [""],
      PreviousInsurer: [""],
      PreviousInsurerAddress:[""],
      // PreviousPolicyODEndDate: [""],
      PreviousPolicyStartDate: [''],
      PreviousPolicyEndDate: [''],
      PreviousPolicyTPStartDate: [""],
      PreviousPolicyTPEndDate: [""],
      CurrentTPPolicyNo: [""],
      CurrentTPName: [""],
      CurrentTPTenure: [""],
      
      PreviousPolicyBiFuel: [false],
      PreviousPolicyZeroDepreciation: [false],
      PreviousPolicyConsumable: [false],
      PreviousPolicyEngineProtector: [false],
      PreviousPolicyInvoiceCover: [false],
      PreviousPolicyTyreCover: [false],
      ZunoDiscountOrLoadingPercentage:[],
    })

    if (PolicyDetailData) {
      PolicyDetailForm.patchValue(PolicyDetailData)
    }

    return PolicyDetailForm;
  }


  /**
   * Build Customer Details Form
   * @param CustomerDetailData
   * @returns  CustomerDetailData Form
   */
  private _buildZunoCustomerDetailForm(CustomerDetailData: IZunoCustomerDetailDto) {
    let CustomerDetailForm = this.fb.group({
      CustomerType: [""],
      CompanyName: ["",[Validators.required]],
      Salutation: [0,[Validators.required]],
      FirstName: ["",[Validators.required]],
      MiddleName: [""],
      LastName: ["",[Validators.required]],
      DOB: ["",[Validators.required]],
      Email: ["",[Validators.required]],
      MobileNo: ["",[Validators.required]],
      Gender: ["",[Validators.required]],
      Address: ["",[Validators.required]],
      Address1: ["",[Validators.required]],
      Address2: ["",[Validators.required]],
      PinCode: ["",[Validators.required]],
      KYCId: [""],
      NomineeFirstName: ["",[Validators.required]],
      NomineeMiddleName: [""],
      NomineeLastName: ["",[Validators.required]],
      NomineeRelation: ["",[Validators.required]],
      NomineeDOB: ["",[Validators.required]],
      AppointeeFirstName: ["",[Validators.required]],
      AppointeeMiddleName: [""],
      AppointeeLastName: ["",[Validators.required]],
      AppointeeRelation: ["",[Validators.required]],
      KYCReqNo: [""],
      Marital: ["", [Validators.required]],
      Occupation: ["", [Validators.required]],
      FinanceType: ["",[Validators.required]],
      FinancierName: ["",[Validators.required]],
      GSTINNo:[""],
      AadharNo: [""],
      PANNo: [""],
    })

    if (CustomerDetailData) {
      CustomerDetailForm.patchValue(CustomerDetailData)
    }

    return CustomerDetailForm;
  }


  //#endregion Private methods
}
