import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTING_PATH } from '@config/routingPath.config';

@Component({
  selector: 'gnx-failed',
  templateUrl: './failed.component.html',
  styleUrls: ['./failed.component.scss'],
})
export class FailedComponent {
  constructor(private _router: Router) {}
  public TryAgain() {
    if(window.location.href.indexOf('mediclaim') != -1){
      this._router.navigate([ROUTING_PATH.QuoteMediclaim]);
    }
    else {
      this._router.navigate([ROUTING_PATH.QuoteTopUpPlan]);
    }
  }
}
