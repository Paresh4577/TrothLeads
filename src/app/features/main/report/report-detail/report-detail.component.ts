import { Component } from '@angular/core';
import { reportMenu, ReportType } from '../report-routing.module';
import { AuthService } from '@services/auth/auth.service';

@Component({
  selector: 'gnx-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrls: ['./report-detail.component.scss']
})
export class ReportDetailComponent {
  pagetitle: string = 'Reports';
  public reports: ReportType[] = reportMenu;
  public currentActiveAccordionIndex = 0;

  setActiveAccordionIndex = (index) => {
    this.currentActiveAccordionIndex = index;
  };


  constructor(
    private _authService: AuthService
  ) {
    /**
     * To Filter Report menu As per login user Access permission
     */

    this.reports.forEach(menu => {
      menu.items = menu.items.filter(ele => this._authService._userProfile?.value?.AuthKeys.includes(ele.authkey))
    })
    // Filter item if have any sub item
    this.reports = this.reports.filter(ele => ele.items?.length > 0)
  }

}

