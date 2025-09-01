import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { HealthQuateDto, IHealthQuateDto } from '@models/dtos/config';
import { IPolicy } from '@models/transactions/policy.dto';
import { MatStepper } from '@angular/material/stepper';
import { MY_DATE_FORMATS } from '@config/my-date-formats';
import { DatePipe } from '@angular/common';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import { Alert } from '@models/common';
import { ExistingIllnessDetailDto } from '@models/dtos/config/ExistingIllnessDetailDto';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ExistingIllnessDetailComponent } from '../existing-illness-detail/existing-illness-detail.component';
import { GenPopupComponent } from '@lib/ui/components/gen-popup/gen-popup.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ICityPincodeDto } from '@models/dtos/core';
import { Observable, Subject, of, switchMap, takeUntil } from 'rxjs';
import { MasterListService } from '@lib/services/master-list.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import * as moment from 'moment';
import { ROUTING_PATH } from '@config/routingPath.config';
import { dropdown } from '@config/dropdown.config';
import { ValidationRegex } from '@config/validationRegex.config';
import { DialogService } from '@lib/services/dialog.service';
import { SumInsuredEnum } from 'src/app/shared/enums/SumInsured.enum';

@Component({
  selector: 'gnx-health-insurance-plans',
  templateUrl: './health-insurance-plans.component.html',
  styleUrls: ['./health-insurance-plans.component.scss'],
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
export class HealthInsurancePlansComponent implements OnInit {
  // #region public variables

  expression: RegExp = ValidationRegex.emailValidationReg
  pagetitle: string = 'Find top health insurance plans';

  myMembers;
  DropdownMaster: dropdown;  // used for Sum Insured dropdown option
  mode: string = '';
  HealthQuateForm: FormGroup;
  HealthQuate: IHealthQuateDto;
  currentvalue: boolean = false;

  step2 = new FormControl();
  step1 = new FormControl();

  Policies: IPolicy[];

  PercentageList = [20, 30, 40];

  stepFinalAlerts: Alert[]
  stepThreealerts: Alert[] = [];
  alerts: Alert[] = [];
  pincodes$: Observable<ICityPincodeDto[]>;
  destroy$: Subject<any>;

  maxBirthDate: Date;
  SelfGender: string;
  isTopup: boolean = false;
  flag: boolean = false
  showFreshQuotebutton:boolean = false

  // #endregion public variables

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
    private _router: Router,
    private _MasterListService: MasterListService,
    private _route: ActivatedRoute,
    private _datePipe: DatePipe,
    private _dialogService: DialogService,
  ) {
    this.DropdownMaster = new dropdown();
    this.maxBirthDate = new Date(Date.now());
    this.maxBirthDate.setMonth(this.maxBirthDate.getMonth() - 3);
    this.SelfGender = 'Male';
    this.destroy$ = new Subject();
  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init
  ngOnInit(): void {
    let data = this._route.snapshot.data;

    this.myMembers = [];
    this.HealthQuate = new HealthQuateDto();

    if (localStorage.getItem('Policies')) {
      localStorage.removeItem('Policies');
    }

    if (localStorage.getItem('HealthQuateForm')) {
      this.showFreshQuotebutton=true
      let Data = JSON.parse(localStorage.getItem('HealthQuateForm'));
      if (Data) {
        this.HealthQuate = Data;
        this.SelfGender = Data.SelfGender
        // if (Data.SumInsuredOtherAmount != 0) {
        //   this.HealthQuate.SumInsured = SumInsuredEnum.Other
        // }
      }
    }

    this.HealthQuateForm = this._buildHealthQuateForm(this.HealthQuate);
    if (data['isTopup']) {
      this.isTopup = data['isTopup'];
    } else {
      this.HealthQuateForm.patchValue({
        Deductable: 0,
      });
    }

    this._ageMoreThan56();
    this._LoadStepper();
    this._valChange();
    this._onFormChanges();
  }

  //#endregion lifecyclehooks
  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  get f() {
    return this.HealthQuateForm.controls;
  }

  public get sumInsuredAmount() {
    return SumInsuredEnum
  }

  // gender of self
  public SetSelfGender(event, choice) {
    this.SelfGender = choice;
    this.HealthQuateForm.patchValue({
      SelfGender: this.SelfGender,
    });

    if (this.HealthQuateForm.get('SelfGender').value == 'Male') {
      this.HealthQuateForm.patchValue({
        SpouseGender: 'Female',
      });
    } else {
      this.HealthQuateForm.patchValue({
        SpouseGender: 'Male',
      });
    }
  }

  // select member that are to be insured
  public SetCover(member: string) {
    this.currentvalue = this.HealthQuateForm.get(
      member + 'CoverRequired'
    ).value;
    this.currentvalue = !this.currentvalue;
    this.HealthQuateForm.patchValue({
      [member + 'CoverRequired']: this.currentvalue,
    });
    if (this.HealthQuateForm.get(member + 'CoverRequired').value == false) {
      this._clearFunction(member)
    }
  }

  // reset function
  public clear(name: string): void {
    this.f[name].setValue('');
  }

  // number of children
  public onChildSelection(type: string, noOfChild: number) {
    this._clearChildData(type, noOfChild);
    if (type == 'Son')
      this.HealthQuateForm.get('noOfSon').patchValue(noOfChild);
    if (type == 'Daughter')
      this.HealthQuateForm.get('noOfDaughter').patchValue(noOfChild);
  }

  // reset stepper and form
  public ResetStepper(stepper: MatStepper) {
    if (localStorage.getItem('HealthQuateForm')) {
      this._dialogService
      .confirmDialog({
        title: 'Are You Sure?',
        message: "You want Fresh Quote",
        confirmText: 'Yes, Clear!',
        cancelText: 'No',
      })
      .subscribe((res) => {
        if(res==true) {
          this.showFreshQuotebutton=false
          localStorage.removeItem('HealthQuateForm');
          this.SelfGender = 'Male';
          this.HealthQuateForm.reset();
          stepper.reset();
          this._InitValueOfForm();
      
          this._LoadStepper();
        }
        
      })
      
    }
    
  }

  // submit stepper
  public submitStep(stepper: MatStepper, StepNo: number) {
    switch (StepNo) {
      case 1:
        this._StepOneSubmit(stepper);
        break;
      case 2:
        this._StepTwoSubmit();
        break;
      default:
        break;
    }
  }

  // selected members array
  public members() {
    this.myMembers = [];
    if (
      this.HealthQuateForm.get('SelfCoverRequired').value == true &&
      this.HealthQuateForm.get('SelfGender').value == 'Male'
    ) {
      this.myMembers.push({ member: '/assets/icons/male.png', title: 'Self' });
    }
    if (
      this.HealthQuateForm.get('SelfCoverRequired').value == true &&
      this.HealthQuateForm.get('SelfGender').value == 'Female'
    ) {
      this.myMembers.push({ member: '/assets/icons/woman.png', title: 'Self' });
    }
    if (
      this.HealthQuateForm.get('SpouseCoverRequired').value == true &&
      this.HealthQuateForm.get('SpouseGender').value == 'Male'
    ) {
      this.myMembers.push({
        member: '/assets/icons/male.png',
        title: 'Spouse',
      });
    }
    if (
      this.HealthQuateForm.get('SpouseCoverRequired').value == true &&
      this.HealthQuateForm.get('SpouseGender').value == 'Female'
    ) {
      this.myMembers.push({
        member: '/assets/icons/woman.png',
        title: 'Spouse',
      });
    }
    if (
      this.HealthQuateForm.get('daughterCoverRequired').value == true &&
      this.HealthQuateForm.get('noOfDaughter').value == 1
    ) {
      this.myMembers.push({
        member: '/assets/icons/girl.png',
        title: 'Daughter',
      });
    }
    if (
      this.HealthQuateForm.get('daughterCoverRequired').value == true &&
      this.HealthQuateForm.get('noOfDaughter').value == 2
    ) {
      this.myMembers.push({
        member: '/assets/icons/girl.png',
        title: 'Daughter1',
      });
      this.myMembers.push({
        member: '/assets/icons/girl.png',
        title: 'Daughter2',
      });
    }
    if (
      this.HealthQuateForm.get('daughterCoverRequired').value == true &&
      this.HealthQuateForm.get('noOfDaughter').value == 3
    ) {
      this.myMembers.push({
        member: '/assets/icons/girl.png',
        title: 'Daughter1',
      });
      this.myMembers.push({
        member: '/assets/icons/girl.png',
        title: 'Daughter2',
      });
      this.myMembers.push({
        member: '/assets/icons/girl.png',
        title: 'Daughter3',
      });
    }

    if (
      this.HealthQuateForm.get('sonCoverRequired').value == true &&
      this.HealthQuateForm.get('noOfSon').value == 1
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son' });
    }
    if (
      this.HealthQuateForm.get('sonCoverRequired').value == true &&
      this.HealthQuateForm.get('noOfSon').value == 2
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son1' });
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son2' });
    }
    if (
      this.HealthQuateForm.get('sonCoverRequired').value == true &&
      this.HealthQuateForm.get('noOfSon').value == 3
    ) {
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son1' });
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son2' });
      this.myMembers.push({ member: '/assets/icons/son.png', title: 'Son3' });
    }
    if (this.HealthQuateForm.get('MotherCoverRequired').value == true) {
      this.myMembers.push({
        member: '/assets/icons/mother.png',
        title: 'Mother',
      });
    }
    if (this.HealthQuateForm.get('FatherCoverRequired').value == true) {
      this.myMembers.push({
        member: '/assets/icons/father.png',
        title: 'Father',
      });
    }
    localStorage.setItem('member', JSON.stringify(this.myMembers));
    if (this.myMembers.length == 1) {
      this.HealthQuateForm.patchValue({ PolicyType: 'MultiIndividual' });
    }
    if (this.myMembers.length > 1) {
      this.HealthQuateForm.patchValue({ PolicyType: 'FamilyFloater' });
    }
  }

  public selectionChange(event: StepperSelectionEvent) {
    if (event.selectedIndex == 1 || event.selectedIndex == 2) {
      this.members();
    }
  }

  // max number of child can be selected is 3 (will disable other options once total children are 3)
  public isDisabled(type: number, number: number) {
    if (
      type == 0 &&
      parseInt(this.HealthQuateForm.get('noOfSon').value) + number > 3
    ) {
      return true;
    } else if (
      type == 1 &&
      parseInt(this.HealthQuateForm.get('noOfDaughter').value) + number > 3
    ) {
      return true;
    } else {
      return null;
    }
  }

  // validation for first stepper
  _StepOneSubmit(stepper): any {
    //validate member
    this.alerts = [];
    if (
      this.HealthQuateForm.get('SelfCoverRequired').value == false &&
      this.HealthQuateForm.get('SpouseCoverRequired').value == false &&
      this.HealthQuateForm.get('daughterCoverRequired').value == false &&
      this.HealthQuateForm.get('sonCoverRequired').value == false &&
      this.HealthQuateForm.get('MotherCoverRequired').value == false &&
      this.HealthQuateForm.get('FatherCoverRequired').value == false
    ) {
      this.alerts.push({
        Message: 'Select Who would you like to insure?',
        CanDismiss : false,
        AutoClose: false,
      })
    }
    if (this.alerts.length > 0) {
      this.step1.setErrors({ required: true });
      return this.step1;
    } else {
      this.step1.reset();
      return this.step1;
    }
  }

  // display alert message (first stepper)
  _StepOneError() {
    this.alerts = [];
    if (
      this.HealthQuateForm.get('SelfCoverRequired').value == false &&
      this.HealthQuateForm.get('SpouseCoverRequired').value == false &&
      this.HealthQuateForm.get('daughterCoverRequired').value == false &&
      this.HealthQuateForm.get('sonCoverRequired').value == false &&
      this.HealthQuateForm.get('MotherCoverRequired').value == false &&
      this.HealthQuateForm.get('FatherCoverRequired').value == false
    ) {
      this.alerts.push({
        Message: 'Select Who would you like to insure?',
        CanDismiss : false,
        AutoClose: false,
      })
    }
    if (this.alerts.length > 0) {
      this._alertservice.raiseErrors(this.alerts);
    }
  }

  // validation for second stepper
  _StepTwoSubmit() {
    this.stepThreealerts = [];
    // validate Gender
    if (
      this.HealthQuateForm.get('SelfCoverRequired').value == true &&
      this.HealthQuateForm.get('SpouseCoverRequired').value == true
    ) {
      if (
        this.HealthQuateForm.get('SelfGender').value ==
        this.HealthQuateForm.get('SpouseGender').value
      ) {
        this.stepThreealerts.push({
          Message: 'invalid self or spouse Gender',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    // self Validation
    if (this.HealthQuateForm.get('SelfCoverRequired').value == true) {
      if (this.HealthQuateForm.get('Name').invalid) {
        this.stepThreealerts.push({
          Message: 'Enter Full Name (self)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      else {
        let name = this.HealthQuateForm.get('Name').value.trim().replace(/ +/g, ' ').split(' ')
        if (name.length<2) {
          this.stepThreealerts.push({
            Message: 'Enter Full Name (self)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
      if (
        this.HealthQuateForm.get('SelfDOB').value == '' ||
        this.HealthQuateForm.get('SelfDOB').value == null
      ) {
        this.stepThreealerts.push({
          Message: 'Enter Date Of Birth (self)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.HealthQuateForm.get('SelfDOB').value != '' ||
        this.HealthQuateForm.get('SelfDOB').value != null
      ) {
        if (this.HealthQuateForm.get('SelfDOB').value > this.maxBirthDate) {
          this.stepThreealerts.push({
            Message: 'Enter Valid Date Of Birth (self)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

      }
      if (this.HealthQuateForm.get('SelfSmokerTibcoCheck').value == null) {
        this.stepThreealerts.push({
          Message: 'Select Habit of Smoking (self)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.HealthQuateForm.get('SelfExistingIllnessCheck').value == null) {
        this.stepThreealerts.push({
          Message: 'Select Existing Illness (self)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.HealthQuateForm.get('SelfExistingIllnessCheck').value == true) {
        let temp = this._countIllness('SelfExistingIllnessDetail')
        if (temp == 0) {
          this.stepThreealerts.push({
            Message: 'Select at least 1 Illness (self)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
    }

    // spouse Validation
    if (this.HealthQuateForm.get('SpouseCoverRequired').value == true) {
      if (this.HealthQuateForm.get('SpouseName').invalid) {
        this.stepThreealerts.push({
          Message: 'Enter Full Name (spouse)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      else {
        let name = this.HealthQuateForm.get('SpouseName').value.trim().replace(/ +/g, ' ').split(' ')
        if (name.length<2) {
          this.stepThreealerts.push({
            Message: 'Enter Full Name (spouse)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
      if (
        this.HealthQuateForm.get('SpouseDOB').value == '' ||
        this.HealthQuateForm.get('SpouseDOB').value == null
      ) {
        this.stepThreealerts.push({
          Message: 'Enter Date Of Birth (spouse)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.HealthQuateForm.get('SpouseDOB').value != '' ||
        this.HealthQuateForm.get('SpouseDOB').value != null
      ) {
        if (this.HealthQuateForm.get('SpouseDOB').value > this.maxBirthDate) {
          this.stepThreealerts.push({
            Message: 'Enter Valid Date Of Birth (spouse)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

      }
      if (this.HealthQuateForm.get('SpouseSmokerTibcoCheck').value == null) {
        this.stepThreealerts.push({
          Message: 'Select Habit of Smoking (spouse)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.HealthQuateForm.get('SpouseExistingIllnessCheck').value == null
      ) {
        this.stepThreealerts.push({
          Message: 'Select Existing Illness (spouse)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (this.HealthQuateForm.get('SpouseExistingIllnessCheck').value == true) {
        let temp = this._countIllness('SpouseExistingIllnessDetail')
        if (temp == 0) {
          this.stepThreealerts.push({
            Message: 'Select at least 1 Illness (spouse)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
    }

    // daughter Validation
    if (this.HealthQuateForm.get('daughterCoverRequired').value == true) {
      if (this.HealthQuateForm.get('noOfDaughter').value > 0) {
        if (this.HealthQuateForm.get('Child1Name').invalid) {
          this.stepThreealerts.push({
            Message: 'Enter Full Name (Daughter 1)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
        else {
          let name = this.HealthQuateForm.get('Child1Name').value.trim().replace(/ +/g, ' ').split(' ')
          if (name.length<2) {
            this.stepThreealerts.push({
              Message: 'Enter Full Name (Daughter 1)',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
        if (
          this.HealthQuateForm.get('Child1DOB').value == '' ||
          this.HealthQuateForm.get('Child1DOB').value == null
        ) {
          this.stepThreealerts.push({
            Message: 'Enter Date Of Birth (Daughter 1)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (
          this.HealthQuateForm.get('Child1DOB').value != '' ||
          this.HealthQuateForm.get('Child1DOB').value != null
        ) {
          if (this.HealthQuateForm.get('Child1DOB').value > this.maxBirthDate) {
            this.stepThreealerts.push({
              Message: 'Enter Valid Date Of Birth (Daughter 1)',
              CanDismiss: false,
              AutoClose: false,
            });
          }

        }
        if (this.HealthQuateForm.get('Child1SmokerTibcoCheck').value == null) {
          this.stepThreealerts.push({
            Message: ' Select Habit of Smoking (Daughter 1)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
        if (
          this.HealthQuateForm.get('Child1ExistingIllnessCheck').value == null
        ) {
          this.stepThreealerts.push({
            Message: ' Select Existing Illness (Daughter 1)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (this.HealthQuateForm.get('Child1ExistingIllnessCheck').value == true) {
          let temp = this._countIllness('Child1ExistingIllnessDetail')
          if (temp == 0) {
            this.stepThreealerts.push({
              Message: 'Select at least 1 Illness (Daughter 1)',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
      }

      if (this.HealthQuateForm.get('noOfDaughter').value > 1) {
        if (this.HealthQuateForm.get('Child2Name').invalid) {
          this.stepThreealerts.push({
            Message: ' Enter Full Name (Daughter 2)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
        else {
          let name = this.HealthQuateForm.get('Child2Name').value.trim().replace(/ +/g, ' ').split(' ')
          if (name.length<2) {
            this.stepThreealerts.push({
              Message: 'Enter Full Name (Daughter 2)',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
        if (
          this.HealthQuateForm.get('Child2DOB').value == '' ||
          this.HealthQuateForm.get('Child2DOB').value == null
        ) {
          this.stepThreealerts.push({
            Message: 'Enter Date Of Birth (Daughter 2)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (
          this.HealthQuateForm.get('Child2DOB').value != '' ||
          this.HealthQuateForm.get('Child2DOB').value != null
        ) {
          if (this.HealthQuateForm.get('Child2DOB').value > this.maxBirthDate) {
            this.stepThreealerts.push({
              Message: 'Enter Valid Date Of Birth (Daughter 2)',
              CanDismiss: false,
              AutoClose: false,
            });
          }

        }
        if (this.HealthQuateForm.get('Child2SmokerTibcoCheck').value == null) {
          this.stepThreealerts.push({
            Message: ' Select Habit of Smoking (Daughter 2)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
        if (
          this.HealthQuateForm.get('Child2ExistingIllnessCheck').value == null
        ) {
          this.stepThreealerts.push({
            Message: ' Select Existing Illness (Daughter 2)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (this.HealthQuateForm.get('Child2ExistingIllnessCheck').value == true) {
          let temp = this._countIllness('Child2ExistingIllnessDetail')
          if (temp == 0) {
            this.stepThreealerts.push({
              Message: 'Select at least 1 Illness (Daughter 2)',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
      }

      if (this.HealthQuateForm.get('noOfDaughter').value > 2) {
        if (this.HealthQuateForm.get('Child3Name').invalid) {
          this.stepThreealerts.push({
            Message: 'Enter Full Name (Daughter 3)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
        else {
          let name = this.HealthQuateForm.get('Child3Name').value.trim().replace(/ +/g, ' ').split(' ')
          if (name.length<2) {
            this.stepThreealerts.push({
              Message: 'Enter Full Name (Daughter 3)',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
        if (
          this.HealthQuateForm.get('Child3DOB').value == '' ||
          this.HealthQuateForm.get('Child3DOB').value == null
        ) {
          this.stepThreealerts.push({
            Message: 'Enter Date Of Birth (Daughter 3)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (
          this.HealthQuateForm.get('Child3DOB').value != '' ||
          this.HealthQuateForm.get('Child3DOB').value != null
        ) {
          if (this.HealthQuateForm.get('Child3DOB').value > this.maxBirthDate) {
            this.stepThreealerts.push({
              Message: 'Enter Valid Date Of Birth (Daughter 3)',
              CanDismiss: false,
              AutoClose: false,
            });
          }

        }
        if (this.HealthQuateForm.get('Child3SmokerTibcoCheck').value == null) {
          this.stepThreealerts.push({
            Message: 'Select Habit of Smoking (Daughter 3)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
        if (
          this.HealthQuateForm.get('Child3ExistingIllnessCheck').value == null
        ) {
          this.stepThreealerts.push({
            Message: ' Select Existing Illness (Daughter 3)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (this.HealthQuateForm.get('Child3ExistingIllnessCheck').value == true) {
          let temp = this._countIllness('Child3ExistingIllnessDetail')
          if (temp == 0) {
            this.stepThreealerts.push({
              Message: 'Select at least 1 Illness (Daughter 3)',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
      }
    }

    // son Validation
    if (this.HealthQuateForm.get('sonCoverRequired').value == true) {
      if (this.HealthQuateForm.get('noOfSon').value > 0) {
        if (this.HealthQuateForm.get('Child4Name').invalid) {
          this.stepThreealerts.push({
            Message: ' Enter Full Name (Son 1)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
        else {
          let name = this.HealthQuateForm.get('Child4Name').value.trim().replace(/ +/g, ' ').split(' ')
          if (name.length<2) {
            this.stepThreealerts.push({
              Message: 'Enter Full Name (Son 1)',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
        if (
          this.HealthQuateForm.get('Child4DOB').value == '' ||
          this.HealthQuateForm.get('Child4DOB').value == null
        ) {
          this.stepThreealerts.push({
            Message: 'Enter Date Of Birth (Son 1)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (
          this.HealthQuateForm.get('Child4DOB').value != '' ||
          this.HealthQuateForm.get('Child4DOB').value != null
        ) {
          if (this.HealthQuateForm.get('Child4DOB').value > this.maxBirthDate) {
            this.stepThreealerts.push({
              Message: 'Enter valid Date Of Birth (Son 1)',
              CanDismiss: false,
              AutoClose: false,
            });
          }

        }
        if (this.HealthQuateForm.get('Child4SmokerTibcoCheck').value == null) {
          this.stepThreealerts.push({
            Message: 'Select Habit of Smoking (Son 1)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
        if (
          this.HealthQuateForm.get('Child4ExistingIllnessCheck').value == null
        ) {
          this.stepThreealerts.push({
            Message: 'Select Existing Illness (Son 1)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (this.HealthQuateForm.get('Child4ExistingIllnessCheck').value == true) {
          let temp = this._countIllness('Child4ExistingIllnessDetail')
          if (temp == 0) {
            this.stepThreealerts.push({
              Message: 'Select at least 1 Illness (Son 1)',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
      }

      if (this.HealthQuateForm.get('noOfSon').value > 1) {
        if (this.HealthQuateForm.get('Child5Name').invalid) {
          this.stepThreealerts.push({
            Message: ' Enter Full Name (Son 2)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
        else {
          let name = this.HealthQuateForm.get('Child5Name').value.trim().replace(/ +/g, ' ').split(' ')
          if (name.length<2) {
            this.stepThreealerts.push({
              Message: 'Enter Full Name (Son 2)',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
        if (
          this.HealthQuateForm.get('Child5DOB').value == '' ||
          this.HealthQuateForm.get('Child5DOB').value == null
        ) {
          this.stepThreealerts.push({
            Message: ' Enter Date Of Birth (Son 2)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (
          this.HealthQuateForm.get('Child5DOB').value != '' ||
          this.HealthQuateForm.get('Child5DOB').value != null
        ) {
          if (this.HealthQuateForm.get('Child5DOB').value > this.maxBirthDate) {
            this.stepThreealerts.push({
              Message: 'Enter valid Date Of Birth (Son 2)',
              CanDismiss: false,
              AutoClose: false,
            });
          }

        }
        if (this.HealthQuateForm.get('Child5SmokerTibcoCheck').value == null) {
          this.stepThreealerts.push({
            Message: 'Select Habit of Smoking (Son 2)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
        if (
          this.HealthQuateForm.get('Child5ExistingIllnessCheck').value == null
        ) {
          this.stepThreealerts.push({
            Message: ' Select Existing Illness (Son 2)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (this.HealthQuateForm.get('Child5ExistingIllnessCheck').value == true) {
          let temp = this._countIllness('Child5ExistingIllnessDetail')
          if (temp == 0) {
            this.stepThreealerts.push({
              Message: 'Select at least 1 Illness (Son 2)',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
      }

      if (this.HealthQuateForm.get('noOfSon').value > 2) {
        if (this.HealthQuateForm.get('Child6Name').invalid) {
          this.stepThreealerts.push({
            Message: ' Enter Full Name (Son 3)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
        else {
          let name = this.HealthQuateForm.get('Child6Name').value.trim().replace(/ +/g, ' ').split(' ')
          if (name.length<2) {
            this.stepThreealerts.push({
              Message: 'Enter Full Name (Son 3)',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
        if (
          this.HealthQuateForm.get('Child6DOB').value == '' ||
          this.HealthQuateForm.get('Child6DOB').value == null
        ) {
          this.stepThreealerts.push({
            Message: ' Enter Date Of Birth (Son 3)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (
          this.HealthQuateForm.get('Child6DOB').value != '' ||
          this.HealthQuateForm.get('Child6DOB').value != null
        ) {
          if (this.HealthQuateForm.get('Child6DOB').value > this.maxBirthDate) {
            this.stepThreealerts.push({
              Message: ' Enter valid Date Of Birth (Son 3)',
              CanDismiss: false,
              AutoClose: false,
            });
          }

        }
        if (this.HealthQuateForm.get('Child6SmokerTibcoCheck').value == null) {
          this.stepThreealerts.push({
            Message: ' Select Habit of Smoking (Son 3)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
        if (
          this.HealthQuateForm.get('Child6ExistingIllnessCheck').value == null
        ) {
          this.stepThreealerts.push({
            Message: ' Select Existing Illness (Son 3)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

        if (this.HealthQuateForm.get('Child6ExistingIllnessCheck').value == true) {
          let temp = this._countIllness('Child6ExistingIllnessDetail')
          if (temp == 0) {
            this.stepThreealerts.push({
              Message: 'Select at least 1 Illness (Son 3)',
              CanDismiss: false,
              AutoClose: false,
            });
          }
        }
      }
    }

    // mother Validation
    if (this.HealthQuateForm.get('MotherCoverRequired').value == true) {
      if (this.HealthQuateForm.get('MotherName').invalid) {
        this.stepThreealerts.push({
          Message: ' Enter Full Name (Mother)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      else {
        let name = this.HealthQuateForm.get('MotherName').value.trim().replace(/ +/g, ' ').split(' ')
        if (name.length<2) {
          this.stepThreealerts.push({
            Message: 'Enter Full Name (Mother)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
      if (
        this.HealthQuateForm.get('MotherDOB').value == '' ||
        this.HealthQuateForm.get('MotherDOB').value == null
      ) {
        this.stepThreealerts.push({
          Message: ' Enter Date Of Birth (Mother)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.HealthQuateForm.get('MotherDOB').value != '' ||
        this.HealthQuateForm.get('MotherDOB').value != null
      ) {
        if (this.HealthQuateForm.get('MotherDOB').value > this.maxBirthDate) {
          this.stepThreealerts.push({
            Message: ' Enter valid Date Of Birth (Mother)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

      }
      if (this.HealthQuateForm.get('MotherSmokerTibcoCheck').value == null) {
        this.stepThreealerts.push({
          Message: ' Select Habit of Smoking (Mother)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.HealthQuateForm.get('MotherExistingIllnessCheck').value == null
      ) {
        this.stepThreealerts.push({
          Message: ' Select Existing Illness (Mother)',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.HealthQuateForm.get('MotherExistingIllnessCheck').value == true) {
        let temp = this._countIllness('MotherExistingIllnessDetail')
        if (temp == 0) {
          this.stepThreealerts.push({
            Message: 'Select at least 1 Illness (Mother)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
    }

    // father Validation
    if (this.HealthQuateForm.get('FatherCoverRequired').value == true) {
      if (this.HealthQuateForm.get('FatherName').invalid) {
        this.stepThreealerts.push({
          Message: 'Enter Full Name (Father)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      else {
        let name = this.HealthQuateForm.get('FatherName').value.trim().replace(/ +/g, ' ').split(' ')
        if (name.length<2) {
          this.stepThreealerts.push({
            Message: 'Enter Full Name (Father)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
      if (
        this.HealthQuateForm.get('FatherDOB').value == '' ||
        this.HealthQuateForm.get('FatherDOB').value == null
      ) {
        this.stepThreealerts.push({
          Message: 'Enter Date Of Birth (Father)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.HealthQuateForm.get('FatherDOB').value != '' ||
        this.HealthQuateForm.get('FatherDOB').value != null
      ) {
        if (this.HealthQuateForm.get('FatherDOB').value > this.maxBirthDate) {
          this.stepThreealerts.push({
            Message: 'Enter valid Date Of Birth (Father)',
            CanDismiss: false,
            AutoClose: false,
          });
        }

      }
      if (this.HealthQuateForm.get('FatherSmokerTibcoCheck').value == null) {
        this.stepThreealerts.push({
          Message: ' Select Habit of Smoking (Father)',
          CanDismiss: false,
          AutoClose: false,
        });
      }
      if (
        this.HealthQuateForm.get('FatherExistingIllnessCheck').value == null
      ) {
        this.stepThreealerts.push({
          Message: ' Select Existing Illness (Father)',
          CanDismiss: false,
          AutoClose: false,
        });
      }

      if (this.HealthQuateForm.get('FatherExistingIllnessCheck').value == true) {
        let temp = this._countIllness('FatherExistingIllnessDetail')
        if (temp == 0) {
          this.stepThreealerts.push({
            Message: 'Select at least 1 Illness (Father)',
            CanDismiss: false,
            AutoClose: false,
          });
        }
      }
    }

    if (this.stepThreealerts.length > 0) {
      this.step2.setErrors({ required: true });
      return this.step2;
    } else {
      this.step2.reset();
      return this.step2;
    }
  }

  // dispaly alert message (second stepper)
  _StepThreeError() {
    if (this.stepThreealerts.length > 0) {
      this._alertservice.raiseErrors(this.stepThreealerts);
    }
  }

  // get Quotation
  public GetQuote(stepper) {
    let totalChildren = this.HealthQuateForm.get('noOfDaughter').value + this.HealthQuateForm.get('noOfSon').value
    this.HealthQuateForm.patchValue({
      NoOfChildren: totalChildren
    })

    this._getFormError();

    if (this.stepFinalAlerts.length > 0) {
      this._alertservice.raiseErrors(this.stepFinalAlerts);
      return;
    }


    if (this.HealthQuateForm.get('SumInsured').value == SumInsuredEnum.Other) {
      this.HealthQuateForm.get('SumInsured').patchValue(
        this.HealthQuateForm.get('SumInsuredOtherAmount').value
      )
    } else {
      this.HealthQuateForm.get('SumInsuredOtherAmount').patchValue(0)
    }
    if (this.flag == false) {
      this.HealthQuateForm.get('CoPay').patchValue(0)
    }

    let HealthQuateFormData = this.HealthQuateForm.value

    this.myMembers.forEach((element) => {

      if (element.title == 'Daughter' || element.title == 'Daughter1') {
        HealthQuateFormData['Child1DOB'] =
          this._datePipe.transform(this.HealthQuateForm.get('Child1DOB').value, 'yyyy-MM-dd')
      }
      else if (element.title == 'Daughter2') {
        HealthQuateFormData['Child2DOB'] =
          this._datePipe.transform(this.HealthQuateForm.get('Child2DOB').value, 'yyyy-MM-dd')
      }
      else if (element.title == 'Daughter3') {
        HealthQuateFormData['Child3DOB'] =
          this._datePipe.transform(this.HealthQuateForm.get('Child3DOB').value, 'yyyy-MM-dd')
      }
      else if (element.title == 'Son' || element.title == 'Son1') {
        HealthQuateFormData['Child4DOB'] =
          this._datePipe.transform(this.HealthQuateForm.get('Child4DOB').value, 'yyyy-MM-dd')
      }
      else if (element.title == 'Son2') {
        HealthQuateFormData['Child5DOB'] =
          this._datePipe.transform(this.HealthQuateForm.get('Child5DOB').value, 'yyyy-MM-dd')
      }
      else if (element.title == 'Son3') {
        HealthQuateFormData['Child6DOB'] =
          this._datePipe.transform(this.HealthQuateForm.get('Child6DOB').value, 'yyyy-MM-dd')
      }
      else {
        HealthQuateFormData[`${element.title}DOB`] =
          this._datePipe.transform(this.HealthQuateForm.get(`${element.title}DOB`).value, 'yyyy-MM-dd')
      }

    })


    localStorage.setItem(
      'HealthQuateForm',
      JSON.stringify(HealthQuateFormData)
    );

    if (localStorage.getItem('Policies')) {
      localStorage.removeItem('Policies');
    }

    if(window.location.href.indexOf('mediclaim') != -1){
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.List],HealthQuateFormData);
    }
    else {
      this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.List],HealthQuateFormData);
    }
  }

  // auto complete for pincode
  public PinCodeSelected(event: MatAutocompleteSelectedEvent): void {
    this.HealthQuateForm.patchValue({
      PinCode: event.option.value.PinCode,
    });
  }

  // habit of smoking or chewing tabacco
  public SelectSmokingOrTobacco(memberType: string, option: boolean) {
    this.HealthQuateForm.get(memberType).patchValue(option);
    this.HealthQuateForm.get(`${memberType}Check`).patchValue(option);
  }

  // selecting Illness
  public SelectExistingIllness(
    memberType: string,
    detailkey: string,
    option: boolean,
    title: string
  ) {
    this.HealthQuateForm.get(memberType).patchValue(option);
    this.HealthQuateForm.get(`${memberType}Check`).patchValue(option);
    if (option == true) {
      this.openDiolog(memberType, detailkey, title);
    } else {
      this.HealthQuateForm.patchValue({ SelfExistingIllness: false });
      // clear form detailkey
      this.HealthQuateForm.controls[detailkey]
        .get('CholesterolDisorDr')
        .setValue(false);
      this.HealthQuateForm.controls[detailkey].get('Thyroid').setValue(false);
      this.HealthQuateForm.controls[detailkey]
        .get('Hypertension')
        .setValue(false);
      this.HealthQuateForm.controls[detailkey].get('Diabetes').setValue(false);
      this.HealthQuateForm.controls[detailkey].get('Asthma').setValue(false);
      this.HealthQuateForm.controls[detailkey].get('Obesity').setValue(false);
      this.HealthQuateForm.controls[detailkey]
        .get('Heartdisease')
        .setValue(false);
      this.HealthQuateForm.controls[detailkey]
        .get('PreExistDisease')
        .setValue(false);
    }
  }

  // PopUp for selecting Illness
  public openDiolog(type: string, detailkey: string, title: string) {
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
      ExistingIllness: this.HealthQuateForm.get(detailkey).value,
    };
    const dialogRef = this.dialog.open(
      ExistingIllnessDetailComponent,
      dialogConfig
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this._bindExistingIllnessDetail(detailkey, result);
      }
    });
  }

  // PopUp for Pincode
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
          this.HealthQuateForm.patchValue({
            PinCode: result.PinCode,
          });
        }
      }
    });
  }

  //#endregion public-methods
  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // Inital value of Form fields
  private _InitValueOfForm() {
    this.HealthQuateForm.get('SelfCoverRequired').setValue(true);
    this.HealthQuateForm.get('SelfGender').setValue('Male');
    this.HealthQuateForm.get('SpouseGender').setValue('Female');
    this.HealthQuateForm.get('Child1Gender').setValue('Female');
    this.HealthQuateForm.get('Child2Gender').setValue('Female');
    this.HealthQuateForm.get('Child3Gender').setValue('Female');
    this.HealthQuateForm.get('Child4Gender').setValue('Male');
    this.HealthQuateForm.get('Child5Gender').setValue('Male');
    this.HealthQuateForm.get('Child6Gender').setValue('Male');
    this.HealthQuateForm.get('SpouseCoverRequired').setValue(false);
    this.HealthQuateForm.get('ChildrenCoverRequired').setValue(false);
    this.HealthQuateForm.get('FatherCoverRequired').setValue(false);
    this.HealthQuateForm.get('MotherCoverRequired').setValue(false);
    this.HealthQuateForm.get('SelfExistingIllness').setValue(false);
    this.HealthQuateForm.get('SelfSmokerTibco').setValue(false);
    this.HealthQuateForm.get('SpouseExistingIllness').setValue(false);
    this.HealthQuateForm.get('SpouseSmokerTibco').setValue(false);
    this.HealthQuateForm.get('Child1ExistingIllness').setValue(false);
    this.HealthQuateForm.get('Child1SmokerTibco').setValue(false);
    this.HealthQuateForm.get('Child2ExistingIllness').setValue(false);
    this.HealthQuateForm.get('Child2SmokerTibco').setValue(false);
    this.HealthQuateForm.get('Child3ExistingIllness').setValue(false);
    this.HealthQuateForm.get('Child3SmokerTibco').setValue(false);
    this.HealthQuateForm.get('Child4ExistingIllness').setValue(false);
    this.HealthQuateForm.get('Child4SmokerTibco').setValue(false);
    this.HealthQuateForm.get('Child5ExistingIllness').setValue(false);
    this.HealthQuateForm.get('Child5SmokerTibco').setValue(false);
    this.HealthQuateForm.get('Child6ExistingIllness').setValue(false);
    this.HealthQuateForm.get('Child6SmokerTibco').setValue(false);
    this.HealthQuateForm.get('FatherExistingIllness').setValue(false);
    this.HealthQuateForm.get('FatherSmokerTibco').setValue(false);
    this.HealthQuateForm.get('MotherExistingIllness').setValue(false);
    this.HealthQuateForm.get('MotherSmokerTibco').setValue(false);
    this.HealthQuateForm.get('NoOfChildren').setValue(0);
    this.HealthQuateForm.get('monthlyIncome').setValue(0);
    this.HealthQuateForm.get('Deductable').setValue(0);
    this.HealthQuateForm.get('noOfSon').setValue(0);
    this.HealthQuateForm.get('CoPay').setValue(0);
    this.HealthQuateForm.get('noOfDaughter').setValue(0);
    this.HealthQuateForm.get('sonCoverRequired').setValue(false);
    this.HealthQuateForm.get('daughterCoverRequired').setValue(false);
    this.HealthQuateForm.get('SumInsuredOtherAmount').setValue(0);
    this.HealthQuateForm.get('PolicyPeriod').setValue(1);
    this.HealthQuateForm.get('PolicyType').setValue('MultiIndividual');
    this.HealthQuateForm.get('SumInsured').setValue('300000');
    this.HealthQuateForm.get('PinCode').setValue('');
    this.HealthQuateForm.get('SelfExistingIllnessDetail').patchValue({
      PreExistDisease: false,
      SmokerTibco: false,
      Thyroid: false,
      Asthma: false,
      CholesterolDisorDr: false,
      Heartdisease: false,
      Hypertension: false,
      Diabetes: false,
      Obesity: false,
    });
    this.HealthQuateForm.get('SpouseExistingIllnessDetail').patchValue({
      PreExistDisease: false,
      SmokerTibco: false,
      Thyroid: false,
      Asthma: false,
      CholesterolDisorDr: false,
      Heartdisease: false,
      Hypertension: false,
      Diabetes: false,
      Obesity: false,
    });
    this.HealthQuateForm.get('Child1ExistingIllnessDetail').patchValue({
      PreExistDisease: false,
      SmokerTibco: false,
      Thyroid: false,
      Asthma: false,
      CholesterolDisorDr: false,
      Heartdisease: false,
      Hypertension: false,
      Diabetes: false,
      Obesity: false,
    });
    this.HealthQuateForm.get('Child2ExistingIllnessDetail').patchValue({
      PreExistDisease: false,
      SmokerTibco: false,
      Thyroid: false,
      Asthma: false,
      CholesterolDisorDr: false,
      Heartdisease: false,
      Hypertension: false,
      Diabetes: false,
      Obesity: false,
    });
    this.HealthQuateForm.get('Child3ExistingIllnessDetail').patchValue({
      PreExistDisease: false,
      SmokerTibco: false,
      Thyroid: false,
      Asthma: false,
      CholesterolDisorDr: false,
      Heartdisease: false,
      Hypertension: false,
      Diabetes: false,
      Obesity: false,
    });
    this.HealthQuateForm.get('Child4ExistingIllnessDetail').patchValue({
      PreExistDisease: false,
      SmokerTibco: false,
      Thyroid: false,
      Asthma: false,
      CholesterolDisorDr: false,
      Heartdisease: false,
      Hypertension: false,
      Diabetes: false,
      Obesity: false,
    });
    this.HealthQuateForm.get('Child5ExistingIllnessDetail').patchValue({
      PreExistDisease: false,
      SmokerTibco: false,
      Thyroid: false,
      Asthma: false,
      CholesterolDisorDr: false,
      Heartdisease: false,
      Hypertension: false,
      Diabetes: false,
      Obesity: false,
    });
    this.HealthQuateForm.get('Child6ExistingIllnessDetail').patchValue({
      PreExistDisease: false,
      SmokerTibco: false,
      Thyroid: false,
      Asthma: false,
      CholesterolDisorDr: false,
      Heartdisease: false,
      Hypertension: false,
      Diabetes: false,
      Obesity: false,
    });
    this.HealthQuateForm.get('FatherExistingIllnessDetail').patchValue({
      PreExistDisease: false,
      SmokerTibco: false,
      Thyroid: false,
      Asthma: false,
      CholesterolDisorDr: false,
      Heartdisease: false,
      Hypertension: false,
      Diabetes: false,
      Obesity: false,
    });
    this.HealthQuateForm.get('MotherExistingIllnessDetail').patchValue({
      PreExistDisease: false,
      SmokerTibco: false,
      Thyroid: false,
      Asthma: false,
      CholesterolDisorDr: false,
      Heartdisease: false,
      Hypertension: false,
      Diabetes: false,
      Obesity: false,
    });
  }

  private _LoadStepper() {
    this.Policies = [];
  }

  // clear member details
  private _clearFunction(member: string) {
    if (member != 'son' && member != 'daughter') {
      if (member == 'Self') {
        this.HealthQuateForm.get('Name').reset('')
      } else {
        this.HealthQuateForm.get(member + 'Name').reset('')
      }
      this.HealthQuateForm.get(member + 'DOB').reset('')
      this.HealthQuateForm.get(member + 'ExistingIllnessCheck').reset()
      this.HealthQuateForm.get(member + 'ExistingIllness').reset(false)
      this.HealthQuateForm.get(member + 'SmokerTibco').reset(false)
      this.HealthQuateForm.get(member + 'SmokerTibcoCheck').reset()
      this._clearIllness(member + 'ExistingIllnessDetail')
    } else {
      if (member == 'daughter') {

        let tempArray = ['Child1', 'Child2', 'Child3']
        tempArray.forEach((element, index) => {
          member = element

          this.HealthQuateForm.get(member + 'Name').reset('')
          this.HealthQuateForm.get(member + 'DOB').reset('')
          this.HealthQuateForm.get(member + 'ExistingIllnessCheck').reset()
          this.HealthQuateForm.get(member + 'ExistingIllness').reset(false)
          this.HealthQuateForm.get(member + 'SmokerTibco').reset(false)
          this.HealthQuateForm.get(member + 'SmokerTibcoCheck').reset()
          this._clearIllness(member + 'ExistingIllnessDetail')

        })

      }
      if (member == 'son') {
        let tempArray = ['Child4', 'Child5', 'Child6']
        tempArray.forEach((element, index) => {
          member = element

          this.HealthQuateForm.get(member + 'Name').reset('')
          this.HealthQuateForm.get(member + 'DOB').reset('')
          this.HealthQuateForm.get(member + 'ExistingIllnessCheck').reset()
          this.HealthQuateForm.get(member + 'ExistingIllness').reset(false)
          this.HealthQuateForm.get(member + 'SmokerTibco').reset(false)
          this.HealthQuateForm.get(member + 'SmokerTibcoCheck').reset()
          this._clearIllness(member + 'ExistingIllnessDetail')
        })

      }
    }
  }

  // clear Illness of member
  private _clearIllness(member) {
    let Illness = ['PreExistDisease', 'Thyroid', 'Obesity', 'Hypertension', 'Heartdisease', 'Diabetes', 'CholesterolDisorDr', 'Asthma']

    Illness.forEach((element) => {
      this.HealthQuateForm.get(member).get(element).reset(false)
    })
  }

  // main form
  private _buildHealthQuateForm(data: HealthQuateDto) {
    let form = this.fb.group({
      SelfCoverRequired: [true],
      Name: ['', [Validators.required, this.noWhitespaceValidator]],

      SelfDOB: [''],
      SelfGender: ['Male'],
      SelfExistingIllnessCheck: [],
      SelfExistingIllness: [false],
      SelfSmokerTibcoCheck: [],
      SelfSmokerTibco: [false],
      SelfSmokerTibcoDescription: [''],
      SelfExistingIllnessDetail: this._buildExistingIllnessDetailForm(
        data.SelfExistingIllnessDetail
      ),

      SpouseCoverRequired: [false],
      SpouseName: ['', [Validators.required, this.noWhitespaceValidator]],
      SpouseDOB: [''],
      SpouseGender: ['Female'],
      SpouseExistingIllnessCheck: [],
      SpouseExistingIllness: [false],
      SpouseSmokerTibcoCheck: [],
      SpouseSmokerTibco: [false],
      SpouseSmokerTibcoDescription: [''],
      SpouseExistingIllnessDetail: this._buildExistingIllnessDetailForm(
        data.SpouseExistingIllnessDetail
      ),

      ChildrenCoverRequired: [false],
      NoOfChildren: [0],
      Child1Name: ['', [Validators.required, this.noWhitespaceValidator]],
      Child1DOB: [''],
      Child1Gender: ['Female'],
      Child1ExistingIllnessCheck: [],
      Child1ExistingIllness: [false],
      Child1SmokerTibcoCheck: [],
      Child1SmokerTibco: [false],
      Child1SmokerTibcoDescription: [''],
      Child1ExistingIllnessDetail: this._buildExistingIllnessDetailForm(
        data.Child1ExistingIllnessDetail
      ),
      Child2Name: ['', [Validators.required, this.noWhitespaceValidator]],
      Child2DOB: [''],
      Child2Gender: ['Female'],
      Child2ExistingIllnessCheck: [],
      Child2ExistingIllness: [false],
      Child2SmokerTibcoCheck: [],
      Child2SmokerTibco: [false],
      Child2SmokerTibcoDescription: [''],
      Child2ExistingIllnessDetail: this._buildExistingIllnessDetailForm(
        data.Child2ExistingIllnessDetail
      ),
      Child3Name: ['', [Validators.required, this.noWhitespaceValidator]],
      Child3DOB: [''],
      Child3Gender: ['Female'],
      Child3ExistingIllnessCheck: [],
      Child3ExistingIllness: [false],
      Child3SmokerTibcoCheck: [],
      Child3SmokerTibco: [false],
      Child3SmokerTibcoDescription: [''],
      Child3ExistingIllnessDetail: this._buildExistingIllnessDetailForm(
        data.Child3ExistingIllnessDetail
      ),

      Child4Name: ['', [Validators.required, this.noWhitespaceValidator]],
      Child4DOB: [''],
      Child4Gender: ['Male'],
      Child4ExistingIllnessCheck: [],
      Child4ExistingIllness: [false],
      Child4SmokerTibcoCheck: [],
      Child4SmokerTibco: [false],
      Child4SmokerTibcoDescription: [''],
      Child4ExistingIllnessDetail: this._buildExistingIllnessDetailForm(
        data.Child1ExistingIllnessDetail
      ),
      Child5Name: ['', [Validators.required, this.noWhitespaceValidator]],
      Child5DOB: [''],
      Child5Gender: ['Male'],
      Child5ExistingIllnessCheck: [],
      Child5ExistingIllness: [false],
      Child5SmokerTibcoCheck: [],
      Child5SmokerTibco: [false],
      Child5SmokerTibcoDescription: [''],
      Child5ExistingIllnessDetail: this._buildExistingIllnessDetailForm(
        data.Child2ExistingIllnessDetail
      ),
      Child6Name: ['', [Validators.required, this.noWhitespaceValidator]],
      Child6DOB: [''],
      Child6Gender: ['Male'],
      Child6ExistingIllnessCheck: [],
      Child6ExistingIllness: [false],
      Child6SmokerTibcoCheck: [],
      Child6SmokerTibco: [false],
      Child6SmokerTibcoDescription: [''],
      Child6ExistingIllnessDetail: this._buildExistingIllnessDetailForm(
        data.Child3ExistingIllnessDetail
      ),

      FatherCoverRequired: [false],
      FatherName: ['', [Validators.required, this.noWhitespaceValidator]],
      FatherGender: ['Male'],
      FatherDOB: [''],
      FatherExistingIllnessCheck: [],
      FatherExistingIllness: [false],
      FatherSmokerTibcoCheck: [],
      FatherSmokerTibco: [false],
      FatherSmokerTibcoDescription: [''],
      FatherExistingIllnessDetail: this._buildExistingIllnessDetailForm(
        data.FatherExistingIllnessDetail
      ),
      MotherCoverRequired: [false],
      MotherName: ['', [Validators.required, this.noWhitespaceValidator]],
      MotherDOB: [''],
      MotherGender: ['Female'],
      MotherExistingIllnessCheck: [],
      MotherExistingIllness: [false],
      MotherSmokerTibcoCheck: [],
      MotherSmokerTibco: [false],
      MotherSmokerTibcoDescription: [''],
      MotherExistingIllnessDetail: this._buildExistingIllnessDetailForm(
        data.MotherExistingIllnessDetail
      ),

      PinCode: [''],
      Mobile: [
        '',
        [
          Validators.maxLength(10),
          Validators.minLength(10),
          Validators.required,
        ],
      ],
      EmailId: ['', [Validators.email]],
      monthlyIncome: [0],
      Insurer: [null],
      PolicyType: ['MultiIndividual'],
      PolicyPeriod: [1],
      SumInsured: ['300000'],
      SumInsuredOtherAmount: [0],
      daughterCoverRequired: [false],
      sonCoverRequired: [false],
      noOfDaughter: [0],
      noOfSon: [0],
      Deductable: [0],
      CoPay: [0]
    });

    if (data) {
      form.patchValue(data);
    }

    return form;
  }

  // validation for blank space
  private noWhitespaceValidator(control: FormControl) {
    return (control.value || '').trim().length ? null : { 'whitespace': true };
  }

  // Illness form
  private _buildExistingIllnessDetailForm(data): FormGroup {
    let existingIllnessForm = this.fb.group({
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

    return existingIllnessForm;
  }

  // binding Illness details
  private _bindExistingIllnessDetail(
    key: string,
    result: ExistingIllnessDetailDto
  ) {
    this.HealthQuateForm.get(key).patchValue({
      PreExistDisease: result.PreExistDisease,
      PreExistDiseaseDescription: result.PreExistDiseaseDescription,
      SmokerTibco: result.SmokerTibco,
      SmokerTibcoRemark: result.SmokerTibcoRemark,
      Thyroid: result.Thyroid,
      ThyroidRemark: result.ThyroidRemark,
      Asthma: result.Asthma,
      AsthmaRemark: result.AsthmaRemark,
      CholesterolDisorDr: result.CholesterolDisorDr,
      CholesterolDisorDrRemark: result.CholesterolDisorDrRemark,
      Heartdisease: result.Heartdisease,
      HeartdiseaseRemark: result.HeartdiseaseRemark,
      Hypertension: result.Hypertension,
      HypertensionRemark: result.HypertensionRemark,
      Diabetes: result.Diabetes,
      DiabetesRemark: result.DiabetesRemark,
      Obesity: result.Obesity,
      ObesityRemark: result.ObesityRemark,
    });
  }

  // number of Illness
  private _countIllness(key: string) {
    let count: number = 0
    let Illness = ['PreExistDisease', 'Thyroid', 'Obesity', 'Hypertension', 'Heartdisease', 'Diabetes', 'CholesterolDisorDr', 'Asthma']
    Illness.forEach((element) => {
      if (this.HealthQuateForm.get(key).get(element).value) {
        count = count + 1
      }
    })
    return count
  }

  // change in form Values
  private _valChange() {
    this.HealthQuateForm.get('daughterCoverRequired').valueChanges.subscribe(
      (value) => {
        if (value == true) {
          this.HealthQuateForm.get('noOfDaughter').patchValue(1);
        } else {
          this.HealthQuateForm.get('noOfDaughter').patchValue(0);
        }
        if (
          this.HealthQuateForm.get('sonCoverRequired').value ||
          this.HealthQuateForm.get('daughterCoverRequired').value
        ) {
          this.HealthQuateForm.get('ChildrenCoverRequired').patchValue(true);
        } else {
          this.HealthQuateForm.get('ChildrenCoverRequired').patchValue(false);
        }
      }
    );

    this.HealthQuateForm.get('sonCoverRequired').valueChanges.subscribe(
      (value) => {
        if (value == true) {
          this.HealthQuateForm.get('noOfSon').patchValue(1);
        } else {
          this.HealthQuateForm.get('noOfSon').patchValue(0);
        }
        if (
          this.HealthQuateForm.get('sonCoverRequired').value ||
          this.HealthQuateForm.get('daughterCoverRequired').value
        ) {
          this.HealthQuateForm.get('ChildrenCoverRequired').patchValue(true);
        } else {
          this.HealthQuateForm.get('ChildrenCoverRequired').patchValue(false);
        }
      }
    );

    this.HealthQuateForm.get('noOfSon').valueChanges.subscribe((value) => {
      if (
        parseInt(value) +
        parseInt(this.HealthQuateForm.get('noOfDaughter').value) >
        3
      ) {
        this.HealthQuateForm.get('noOfDaughter').patchValue(
          3 - parseInt(value)
        );
      }
    });

    this.HealthQuateForm.get('noOfDaughter').valueChanges.subscribe((value) => {
      if (
        parseInt(value) + parseInt(this.HealthQuateForm.get('noOfSon').value) >
        3
      ) {
        this.HealthQuateForm.get('noOfSon').patchValue(3 - parseInt(value));
      }
    });

    this.HealthQuateForm.get('FatherDOB').valueChanges.subscribe(() => {
      this._ageMoreThan56()
    })
    this.HealthQuateForm.get('SelfDOB').valueChanges.subscribe(() => {
      this._ageMoreThan56()
    })
    this.HealthQuateForm.get('MotherDOB').valueChanges.subscribe(() => {
      this._ageMoreThan56()
    })
    this.HealthQuateForm.get('SpouseDOB').valueChanges.subscribe(() => {
      this._ageMoreThan56()
    })
    this.HealthQuateForm.get('Child1DOB').valueChanges.subscribe(() => {
      this._ageMoreThan56()
    })
    this.HealthQuateForm.get('Child2DOB').valueChanges.subscribe(() => {
      this._ageMoreThan56()
    })
    this.HealthQuateForm.get('Child3DOB').valueChanges.subscribe(() => {
      this._ageMoreThan56()
    })
    this.HealthQuateForm.get('Child4DOB').valueChanges.subscribe(() => {
      this._ageMoreThan56()
    })
    this.HealthQuateForm.get('Child5DOB').valueChanges.subscribe(() => {
      this._ageMoreThan56()
    })
    this.HealthQuateForm.get('Child6DOB').valueChanges.subscribe(() => {
      this._ageMoreThan56()
    })

  }

  // age more than 56
  private _ageMoreThan56() {
    let memberDOB = ['FatherDOB', 'MotherDOB', 'SpouseDOB', 'SelfDOB', 'Child1DOB', 'Child2DOB', 'Child3DOB', 'Child4DOB', 'Child5DOB', 'Child6DOB']
    let currentDate = new Date()
    let age
    this.flag = false
    for (let element of memberDOB) {

      if (this.HealthQuateForm.get(element).value != '' && this.HealthQuateForm.get(element).value != null) {
        age = moment(currentDate).diff(this.HealthQuateForm.get(element).value, 'year')
        if (age > 56) {
          this.flag = true
        }
      }
      if (this.flag) {
        break;
      }
    }
  }

  // clear child data
  private _clearChildData(type: string, number: number) {
    let data = new HealthQuateDto();
    if (type == 'Daughter' && number == 1) {
      this.HealthQuateForm.patchValue({
        Child2Name: '',
        Child2DOB: '',
        Child2ExistingIllness: false,
        Child2ExistingIllnessDetail: this._buildExistingIllnessDetailForm(
          data.Child2ExistingIllnessDetail
        ),
        Child3Name: '',
        Child3DOB: '',
        Child3ExistingIllness: false,
        Child3ExistingIllnessDetail: this._buildExistingIllnessDetailForm(
          data.Child3ExistingIllnessDetail
        ),
      });
    } else if (type == 'Daughter' && number == 2) {
      this.HealthQuateForm.patchValue({
        Child3Name: '',
        Child3DOB: '',
        Child3ExistingIllness: false,
        Child3ExistingIllnessDetail: this._buildExistingIllnessDetailForm(
          data.Child3ExistingIllnessDetail
        ),
      });
    }

    if (type == 'Son' && number == 1) {
      this.HealthQuateForm.patchValue({
        Child5Name: '',
        Child5DOB: '',
        Child5ExistingIllness: false,
        Child5ExistingIllnessDetail: this._buildExistingIllnessDetailForm(
          data.Child2ExistingIllnessDetail
        ),
        Child6Name: '',
        Child6DOB: '',
        Child6ExistingIllness: false,
        Child6ExistingIllnessDetail: this._buildExistingIllnessDetailForm(
          data.Child3ExistingIllnessDetail
        ),
      });
    } else if (type == 'Son' && number == 2) {
      this.HealthQuateForm.patchValue({
        Child6Name: '',
        Child6DOB: '',
        Child6ExistingIllness: false,
        Child6ExistingIllnessDetail: this._buildExistingIllnessDetailForm(
          data.Child3ExistingIllnessDetail
        ),
      });
    }
  }

  // change in Pincode
  private _onFormChanges() {
    this.HealthQuateForm.get('PinCode').valueChanges.subscribe((val) => {
      this.pincodes$ = this._MasterListService.getFilteredPincodeList(val).pipe(
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
    });
  }

  // Alert message on last stepper
  private _getFormError(): any {
    this.stepFinalAlerts = []
    if (this.HealthQuateForm.get('Mobile').value == null || this.HealthQuateForm.get('Mobile').value == '') {
      this.stepFinalAlerts.push({
        Message: 'Enter Your Mobile Number',
        CanDismiss: false,
        AutoClose: false,
      });
    } else {
      if (this.HealthQuateForm.get('Mobile').value.toString().length != 10) {
        this.stepFinalAlerts.push({
          Message: 'Mobile Number must be 10 digit',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.HealthQuateForm.get('EmailId').value == '' || this.HealthQuateForm.get('EmailId').value == null) {
      this.stepFinalAlerts.push({
        Message: 'Enter Email Address',
        CanDismiss: false,
        AutoClose: false,
      });
    }
    if (this.HealthQuateForm.get('EmailId').value != '') {
      if (!this.expression.test(this.HealthQuateForm.get('EmailId').value)) {
        this.stepFinalAlerts.push({
          Message: 'Enter Valid Email Address',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if(this.HealthQuateForm.get('SumInsured').value == SumInsuredEnum.Other && this.HealthQuateForm.get('SumInsuredOtherAmount').value == ''){
      this.stepFinalAlerts.push({
        Message: 'Enter Insured Amount',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.HealthQuateForm.get('PinCode').value == '') {
      this.stepFinalAlerts.push({
        Message: 'Select PIN Code',
        CanDismiss: false,
        AutoClose: false,
      });
    }

    if (this.HealthQuateForm.get('PinCode').value != '') {
      if (this.HealthQuateForm.get('PinCode').value.toString().length != 6) {
        this.stepFinalAlerts.push({
          Message: 'Enter Valid PIN Code',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }

    if (this.isTopup) {
      if (
        this.HealthQuateForm.get('Deductable').value == null ||
        this.HealthQuateForm.get('Deductable').value == 0
      ) {
        this.stepFinalAlerts.push({
          Message: 'Enter Deductable Amount',
          CanDismiss: false,
          AutoClose: false,
        });
      }
    }
  }

  //#endregion Private methods
}
