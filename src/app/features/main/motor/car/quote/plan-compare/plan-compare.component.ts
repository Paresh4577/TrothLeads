import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTING_PATH } from '@config/routingPath.config';

@Component({
  selector: 'gnx-plan-compare',
  templateUrl: './plan-compare.component.html',
  styleUrls: ['./plan-compare.component.scss']
})
export class PlanCompareComponent {
  pagetitle = 'Compare'; // Page Title
  CompareList: any[]; // list of user selected company
  CompareListLength: number; // used for manage column in page


  //#region constructor
  constructor(private _router: Router) {


  }

  // #endregion constructor

  //#region lifecyclehooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this.CompareList = [];
    if (localStorage.getItem('MotorComparePlans')) {
      this.CompareList = JSON.parse(localStorage.getItem('MotorComparePlans'));
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

  //On Destroy
  ngOnDestroy(){
    //remove Motor Policy Plan list Array From Local Storage When Close Compare Page
    localStorage.removeItem('MotorComparePlans')
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public backClick() {
    this._router.navigate([ROUTING_PATH.MotorCarQuote.Plan]);
  }

  // passing the object of selected policy
  public buyNow(plan) {
    let temp = plan.Insurer.toLowerCase()
    localStorage.setItem('motorBuyPolicy',JSON.stringify(plan))
    this._router.navigate([ROUTING_PATH.MotorCarQuote.ProposalPage + temp])
  }

  //#endregion public-methods


  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------



  // #endregion Private methods
}