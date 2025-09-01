import { Component, OnDestroy, OnInit } from '@angular/core';
import { ROUTING_PATH } from '@config/routingPath.config';
import { sidenavClose, sidenavOpen } from "@lib/ui/store/uiState/ui.actions";
import { uiStateSelector } from "@lib/ui/store/uiState/uiState.selector";
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { Store, select } from "@ngrx/store";
import { AuthService } from '@services/auth/auth.service';
import { Subject, takeUntil } from "rxjs";
import { ApplicationTypeEnum } from 'src/app/shared/enums';

@Component({
  selector: 'gnx-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit, OnDestroy {

  private uiState$ = this.store.pipe(select(uiStateSelector));
  private destroy$: Subject<any> = new Subject();
  LoginUser: IMyProfile;

  sidenavOpened: boolean;

  /**
   * Constructor
   */
  constructor(private store: Store, private authService: AuthService,) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    //Get the initial sidenav state
    this.uiState$.pipe(takeUntil(this.destroy$))
      .subscribe((uiState) => {
        this.sidenavOpened = uiState.sidenavState.opened;
      });

    this.authService.userProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: IMyProfile) => {
        if(user){
          this.LoginUser = user;
        }
      });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    //Remove all subscriptions by setting destroy$ value to null
    this.destroy$.next(null);
    this.destroy$.complete();
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  // routing
  public get Routing() {
    return ROUTING_PATH
  }
 
  public get ApplicationType() {
    return ApplicationTypeEnum
  }

  // getter method For Set Application logo as per Application
  get LogoURL() {
    let URL = ''
    if (this.LoginUser?.CompanyShortName == ApplicationTypeEnum.Troth) {
      URL = 'assets/images/logos/Troth.png'
    }
    else if (this.LoginUser?.CompanyShortName == ApplicationTypeEnum.Growmore) {
      URL = 'assets/images/logos/GROWMORE.png'
    }else{
      URL = 'assets/images/logos/Troth.png'
    }

    return URL;
  }

  toggleSidenav(): void {
    if (this.sidenavOpened) {
      this.store.dispatch(sidenavClose());
    } else {
      this.store.dispatch(sidenavOpen());
    }
  }

}
