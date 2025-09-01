import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTING_PATH } from '@config/routingPath.config';

@Component({
  selector: 'gnx-plan-compare',
  templateUrl: './plan-compare.component.html',
  styleUrls: ['./plan-compare.component.scss']
})
export class PlanCompareComponent {

  //#region decorator
  //#endregion

  //#region public properties

  public pagetitle = 'Compare'; // Page Title
  public compareList: any[]; // list of user selected company
  public compareListLength: number; // used for manage column in page

  //#endregion

  //#region private properties
  //#endregion

  //#region constructor
  constructor(private _router: Router) {
  }

  // #endregion constructor

  //#region life cycle hooks
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  //On Init

  ngOnInit(): void {
    this.compareList = [];
    if (localStorage.getItem('TwoWheelerMotorComparePlans')) {
      this.compareList = JSON.parse(localStorage.getItem('TwoWheelerMotorComparePlans'));
    } else {
      this.backClick();
    }

    if (this.compareList.length == 1) {
      this.pagetitle = 'Details';
    } else {
      this.pagetitle = 'Compare';
    }
    this.compareListLength = this.compareList.length + 1;
  }

  //On Destroy
  ngOnDestroy() {
    //remove Motor Policy Plan list Array From Local Storage When Close Compare Page
    localStorage.removeItem('TwoWheelerMotorComparePlans')
  }

  //#endregion lifecyclehooks

  //#region public-methods
  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  public backClick(): void {
    this._router.navigate([ROUTING_PATH.MotorTwoWheelerQuote.Plan]);
  }

  // passing the object of selected policy
  public buyNow(plan): void {
    let temp = plan.Insurer.toLowerCase()
    localStorage.setItem('TwoWheeler_motorBuyPolicy', JSON.stringify(plan))
    this._router.navigate([ROUTING_PATH.MotorTwoWheelerQuote.ProposalPage + temp])
  }

  //#endregion public-methods

  //#region Private methods
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------



  // #endregion Private methods
}