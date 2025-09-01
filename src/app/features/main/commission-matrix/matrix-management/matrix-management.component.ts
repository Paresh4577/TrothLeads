import { Component } from '@angular/core';
import { MatrixManagementMenu, MatrixManagementType } from '../matrix-management';
import { AuthService } from '@services/auth/auth.service';

@Component({
  selector: 'gnx-matrix-management',
  templateUrl: './matrix-management.component.html',
  styleUrls: ['./matrix-management.component.scss']
})
export class MatrixManagementComponent {
  // #region public variables

  // imported Matrix Management Menu
  public MatrixManagementMenu: MatrixManagementType[] = MatrixManagementMenu;
  public currentActiveAccordionIndex = 0;

  // #endregion public variables
  constructor(
    private _authService: AuthService
  ) {

    /**
     * To Filter Matrix menu As per login user Access permission
     */
    this.MatrixManagementMenu.forEach(menu => {
      menu.items = menu.items.filter(ele => this._authService._userProfile.value?.AuthKeys.includes(ele.authkey))
    })
    // Filter item if have any sub item
    this.MatrixManagementMenu = this.MatrixManagementMenu.filter(ele => ele.items?.length > 0)
  }
  // #endregion constructor

  // #region Lifecycle hooks
  // ----------------------------------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // ----------------------------------------------------------------------------------------------------------------------------

  //endregion Lifecycle Hooks

  // get active accordion index from Accordion Component
  setActiveAccordionIndex = (index) => {
    this.currentActiveAccordionIndex = index;
  };
}
