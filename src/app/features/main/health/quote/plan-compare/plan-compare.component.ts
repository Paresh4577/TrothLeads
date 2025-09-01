import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { IPolicy } from '@models/transactions/policy.dto';
import { PopUpShareComponent } from '../pop-up-share/pop-up-share.component';
import { ROUTING_PATH } from '@config/routingPath.config';

@Component({
  selector: 'gnx-plan-compare',
  templateUrl: './plan-compare.component.html',
  styleUrls: ['./plan-compare.component.scss'],
})
export class PlanCompareComponent {
  pagetitle = 'Compare';
  CompareList: IPolicy[]; // list of user selected company
  HealthQuateForm: any; // to display user's input value in compare list
  CompareListLength: number; // used for manage column in page

  //#region constructor
  constructor(private _router: Router,
    public dialog: MatDialog,) {
    let HealthQuate = localStorage.getItem('HealthQuateForm');
    if (HealthQuate) {
      this.HealthQuateForm = JSON.parse(HealthQuate);
    }

  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this.CompareList = [];
    if (localStorage.getItem('ComparePlans')) {
      this.CompareList = JSON.parse(localStorage.getItem('ComparePlans'));
      this.CompareList.forEach((p) => {
        if (this.HealthQuateForm.PolicyType == 'FamilyFloater') {
          p.PolicyTypeName = 'Family Floater';
        } else {
          p.PolicyTypeName = 'Individual';
        }
      });
    } else {
      this.backClick();
    }
    if (this.CompareList.length == 1) {
      this.pagetitle = 'Details';
    } else {
      this.pagetitle = 'Compare';
    }
    this.CompareListLength = this.CompareList.length + 1;

  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public backClick() {
    if(window.location.href.indexOf('mediclaim') != -1){
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.List]);
    }
    else {
      this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.List]);
    }
  }

  // passing the object of selected policy
  public buyNow(plan) {
    if(localStorage.getItem('AddOns')) {
      localStorage.removeItem('AddOns')
    }
    if(localStorage.getItem('addOnsList')) {
      localStorage.removeItem('addOnsList')
    }
    localStorage.setItem('buynow', JSON.stringify(plan));

    if(window.location.href.indexOf('mediclaim') != -1){
      this._router.navigate([ROUTING_PATH.QuoteMediclaim.AddOns]);
    }
    else {
      this._router.navigate([ROUTING_PATH.QuoteTopUpPlan.AddOns]);
    }
  }

  // share the details of the poilcy
  public ShareNow() {
    if (this.CompareListLength > 0){
      this._openDiologMultiShare(this.CompareList,'Share')
    }

  }

  //#endregion public-methods


  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  // popUp for sharing Policy
  private _openDiologMultiShare(data: IPolicy[], title: string) {
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

  // #endregion Private methods
}
