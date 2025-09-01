import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AlertsService } from '@lib/services/error-handling/alerts.service';
import { IPolicy } from '@models/transactions/policy.dto';
import { environment } from 'src/environments/environment';
import { PopUpShareComponent } from '../pop-up-share/pop-up-share.component';
import { PopupComponent } from '../popup/popup.component';
import { QuoteService } from '../quote.service';
import { AuthService } from '@services/auth/auth.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { HelperService } from '@lib/services/helper.service';
import { HealthQuateDto } from '@models/dtos/config';
import {
  IinsurerCompanyDto,
  InsurerCompanyDto,
} from '@models/dtos/config/PolicyList.dto';
import { ROUTING_PATH } from '@config/routingPath.config';
import { InsuranceCompanyName } from 'src/app/shared/enums/insuranceCompanyName.enum';

@Component({
  selector: 'gnx-plan-listing',
  templateUrl: './plan-listing.component.html',
  styleUrls: ['./plan-listing.component.scss'],
})
export class PlanListingComponent implements OnInit {
  pagetitle: string = 'Health Insurance Plans';
  InsuredPeople: number;
  ReqSumInsured: number;
  PolicyType: string;
  PolicyPeriod: number;
  HealthQuateForm: HealthQuateDto;
  QuoteForm: any;
  RequestTotal: number;
  backDisable: boolean = false;
  totalChild: any[] = [];
  PoliciesList: IinsurerCompanyDto[];
  RequestId: string;

  member: any[];
  CompareList: IPolicy[];
  CompareListLength: number;


  InsuranceCompany = InsuranceCompanyName; // Insurance Company Enum

  //#region constructor

  constructor(
    private _alertservice: AlertsService,
    private _QuoteService: QuoteService,
    private _router: Router,
    public dialog: MatDialog,
    private authService: AuthService,
    private _helper: HelperService
  ) {
    localStorage.removeItem('AdityaBirlaPraposal');
    localStorage.removeItem('policyHolder');
    this.HealthQuateForm = new HealthQuateDto();
    this.PoliciesList = [];

    if (localStorage.getItem('member')) {
      this.member = JSON.parse(localStorage.getItem('member'));
      this.InsuredPeople = this.member.length;

      let HealthQuate = localStorage.getItem('HealthQuateForm');
      if (HealthQuate) {
        this.HealthQuateForm = JSON.parse(HealthQuate);
      } else {
        this._router.navigate([ROUTING_PATH.QuoteMediclaim.Health]);
      }
    }
    this.CompareList = [];
    this.CompareListLength = this.CompareList.length;
  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this.setchild();

    if (localStorage.getItem('Policies')) {
      this.PoliciesList = JSON.parse(localStorage.getItem('Policies'));
    } else {
      this.getPlanList();
    }
    this.setValue();
    this.PoliciesList.forEach((p) => {
      if (p.Polices) {
        p.Polices.forEach((element) => {
          element.isChecked = false;
        });
      }
    });
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public get InsurerNameList() {
    return InsuranceCompanyName;
  }

  // set values
  public setValue() {
    if (this.HealthQuateForm) {
      this.PolicyPeriod = this.HealthQuateForm.PolicyPeriod;
      this.ReqSumInsured = Number(this.HealthQuateForm.SumInsured);
      if (this.HealthQuateForm.PolicyType == 'FamilyFloater') {
        this.PolicyType = 'Family Floater';
      } else {
        this.PolicyType = 'Individual';
      }
    }
  }

  // list of plan
  public getPlanList() {
    this.authService.userProfile$.subscribe((user: IMyProfile) => {
      if (user && user.InsuranceCompanyDetail) {
        user.InsuranceCompanyDetail.forEach((ele, i) => {       
          if(ele.HealthMediclaimIntegrated) {
            let policyComp: InsurerCompanyDto = new InsurerCompanyDto();
            policyComp.Name = ele.InsuranceCompanyCode;
            policyComp.SortOrder = ele.SortOrder;
  
            //Aditya Birla Disabled if SI is less than 10 Lakh.
            if (ele.InsuranceCompanyCode == 'AdityaBirla') {
              if (this.QuoteForm.SumInsured >= 1000000)
                this.PoliciesList.push(policyComp);
            } else {
              this.PoliciesList.push(policyComp);
            }
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
      } else {
      }
    });
    // new Request
    this.backDisable = true;
    this.RequestId = this._helper.newGuid();
    this.RequestTotal = this.PoliciesList.length;

    this.PoliciesList.forEach((element, index) => {
      this.QuoteForm.Insurer = element.Name;
      this.QuoteForm.RequestId = this.RequestId;
      if (this.QuoteForm) {
        this._QuoteService.GetPlans(this.QuoteForm).subscribe((res) => {
          this.RequestTotal--;
          if (this.RequestTotal == 0) {
            this.backDisable = false;
          }
          if (res.Success) {
            res.Data.forEach((ele, ind) => {
              ele.IconURL = environment.apiDomain + ele.IconURL;
              this.PoliciesList.forEach((insc, i) => {
                if (insc.Name == ele.Insurer) {
                  if (!insc.Polices) insc.Polices = [];
                  insc.Polices.push(ele);
                }
              });
            });

            // temp save
            localStorage.setItem('Policies', JSON.stringify(this.PoliciesList));
          } else {
            if (res.ResCode != 400) {
              // handle page/form level alerts here
              this._alertservice.raiseErrors(res.Alerts, true);
            }
          }
        });
      }
    });
  }

  // set child details
  public setchild() {
    this.totalChild = [];
    let Data = JSON.parse(localStorage.getItem('HealthQuateForm'));
    if (Data) {
      this.QuoteForm = Data;
      let noOfChild: number;
      if (Data.daughterCoverRequired == false) {
        noOfChild = 4;
      } else {
        noOfChild = 1;
      }
      if (Data.sonCoverRequired == true) {
        for (let i = noOfChild; i <= 6; i++) {
          if (Data[`Child${i}Name`]) {
            let child = {
              ChildDOB: Data[`Child${i}DOB`],
              ChildExistingIllness: Data[`Child${i}ExistingIllness`],
              ChildExistingIllnessDetail:
                Data[`Child${i}ExistingIllnessDetail`],
              ChildGender: Data[`Child${i}Gender`],
              ChildName: Data[`Child${i}Name`],
            };
            this.totalChild.push(child);
          }
        }
      }

      if (this.totalChild.length > 0) {
        for (let j = 1; j <= this.totalChild.length; j++) {
          this.QuoteForm[`Child${j}Name`] = this.totalChild[j - 1].ChildName;
          this.QuoteForm[`Child${j}ExistingIllness`] =
            this.totalChild[j - 1].ChildExistingIllness;
          this.QuoteForm[`Child${j}ExistingIllnessDetail`] =
            this.totalChild[j - 1].ChildExistingIllnessDetail;
          this.QuoteForm[`Child${j}Gender`] =
            this.totalChild[j - 1].ChildGender;
          this.QuoteForm[`Child${j}DOB`] = this.totalChild[j - 1].ChildDOB;
        }
      }
    }
  }

  // back button
  public backClick() {
    if (this.backDisable) {
      this._alertservice.raiseErrorAlert(
        'Request in Progress. Wait for a moment',
        true
      );
    } else {
      if (
        this.HealthQuateForm.Deductable == 0 ||
        this.HealthQuateForm.Deductable == null
      ) {
        this._router.navigate([ROUTING_PATH.QuoteMediclaim.Health]);
      } else {
        this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.TopUp]);
      }
    }
  }

  // view details of the policy
  public ViewDetails(policyDetails: IPolicy) {
    this.CompareList = [];
    this._AddInList(policyDetails);
    localStorage.setItem('ComparePlans', JSON.stringify(this.CompareList));
    if(window.location.href.indexOf('mediclaim') != -1){
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.Compare]);
    }
    else {
      this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.Compare]);
    }

  }

  // add policies to compare list
  public AddInCompareList(event: MatCheckboxChange, policyDetails: IPolicy) {
    let isChecked: boolean;
    if (event.checked) {
      if (this.CompareList.length < 3) {
        this._AddInList(policyDetails);
        isChecked = true;
      } else {
        isChecked = false;
        this._alertservice.raiseErrorAlert(
          'only 3 plans can be compare at a time'
        );
      }
    } else {
      // remove from list
      this.CompareList = this.CompareList.filter(
        (item) =>
          item.ProductName !== policyDetails.ProductName &&
          item.TotalPremium !== policyDetails.TotalPremium
      );
      isChecked = false;
    }

    this.CompareListLength = this.CompareList.length;

    this.PoliciesList.forEach((p) => {
      if (p.Polices) {
        p.Polices.forEach((element) => {
          if (
            element.ProductName === policyDetails.ProductName &&
            element.TotalPremium === policyDetails.TotalPremium
          )
            element.isChecked = isChecked;
        });
      }
    });
  }

  // share policy details
  public ShareNow() {
    if (this.CompareListLength > 0) {
      this.openDiologMultiShare(this.CompareList, 'Share');
    }
  }

  public CompareNow() {
    if (this.CompareListLength > 0) {
      localStorage.setItem('ComparePlans', JSON.stringify(this.CompareList));
      
      if(window.location.href.indexOf('mediclaim') != -1){
        this._router.navigate([ROUTING_PATH.QuoteMediclaim.Compare]);
      }
      else {
        this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.Compare]);
      }
  
    } else {
      this._alertservice.raiseErrorAlert('please select any plan');
    }
  }

  // clear the list of policies that are to be compared
  public CompareClear() {
    localStorage.removeItem('ComparePlans');
    this.CompareList = [];
    this.CompareListLength = 0;

    this.PoliciesList.forEach((p) => {
      if (p.Polices) {
        p.Polices.forEach((element) => {
          element.isChecked = false;
        });
      }
    });
  }

  // passing the object of selected policy
  public buyNow(plan) {
    if (localStorage.getItem('AddOns')) {
      localStorage.removeItem('AddOns');
    }
    if (localStorage.getItem('addOnsList')) {
      localStorage.removeItem('addOnsList');
    }
    localStorage.setItem('buynow', JSON.stringify(plan));
  
    if(window.location.href.indexOf('mediclaim') != -1){
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.AddOns]);
    }
    else {
      this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.AddOns]);
    }

  }

  // PopUp for premium details
  public openDiolog(data: IPolicy, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '35vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      Policies: data,
      title: title,
      ispopup: true,
    };

    const dialogRef = this.dialog.open(PopupComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
      }
    });
  }

  // PopUp to share policy details
  public openDiologShare(data: IPolicy, title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '35vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      Policies: data,
      title: title,
      ispopup: true,
    };

    const dialogRef = this.dialog.open(PopUpShareComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
      }
    });
  }

  // PopUp for sharing details of multiple policies
  public openDiologMultiShare(data: IPolicy[], title: string) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '35vw';
    dialogConfig.minWidth = 'fit-content';
    dialogConfig.minHeight = "80vh";
    dialogConfig.maxHeight = "80vh";

    dialogConfig.data = {
      multiPolicies: data,
      title: title,
      ispopup: true,
    };

    const dialogRef = this.dialog.open(PopUpShareComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
      }
    });
  }

  //#endregion public-methods

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // policy details
  private _AddInList(policyDetails: IPolicy) {
    policyDetails.AdultsCount = this.InsuredPeople - this.totalChild.length;
    policyDetails.ChildCount = this.totalChild.length;
    this.CompareList.push(policyDetails);
  }

  // sort company by sort Order in array
  private _AddCompanyName(policyCompanyName) {
    this.PoliciesList = [];
    let policyCompany: InsurerCompanyDto = new InsurerCompanyDto();
    policyCompany.Name = policyCompanyName;
    policyCompany.SortOrder = 10;
    this.PoliciesList.push(policyCompany);
  }

  // #endregion Private methods
}
