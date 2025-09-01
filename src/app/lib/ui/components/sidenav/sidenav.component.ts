import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { IAppUIState } from '@lib/ui/store/models/appUiState.interface';
import { uiStateSelector } from '@lib/ui/store/uiState/uiState.selector';
import { GnxMenuItem } from '@models/navigation/gnxMenutem.interface';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject, takeUntil, map } from 'rxjs';
import { SidenavMode, SidenavPosition, SidenavSize } from './sidenav.types';
import { AuthService } from '@services/auth/auth.service';
import { IMyProfile } from '@models/dtos/auth/MyProfile';
import { ROUTING_PATH } from '@config/routingPath.config';

@Component({
  selector: 'gnx-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,

  exportAs: 'gnxSidenav',
})
export class SidenavComponent implements OnInit, OnDestroy, OnChanges {
  menuItems$: Observable<GnxMenuItem[]>;
  autoCollapse: boolean;
  user: IMyProfile;
  private menuItems: BehaviorSubject<GnxMenuItem[]>;
  private mode: SidenavMode = 'side';
  private position: SidenavPosition = 'left';
  private size: SidenavSize = 'normal';
  private opened: boolean;

  private destroy$: Subject<any>;
  private uiState$: Observable<IAppUIState>;

  @HostBinding('class') get classList(): any {
    return {
      'mode-over': this.mode === 'over',
      'mode-side': this.mode === 'side',
      'position-left': this.position === 'left',
      'position-right': this.position === 'right',
      opened: this.opened,
      closed: !this.opened,
      compact: this.size === 'compact',
      'gnx-animations-enabled': true,
    };
  }

  constructor(
    private _store: Store,
    private _changeDetectorRef: ChangeDetectorRef,
    private _authService: AuthService
  ) {
    this.menuItems = new BehaviorSubject<GnxMenuItem[]>([]);
    this.menuItems$ = this.menuItems.asObservable();
    this.autoCollapse = true;
    this.destroy$ = new Subject<any>();
    this.uiState$ = this._store.pipe(select(uiStateSelector));
  }

  ngOnInit(): void {
    this.uiState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      this.mode = state.sidenavState.mode;
      this.opened = state.sidenavState.opened;
      this.position = state.sidenavState.position;
      this.size = state.sidenavState.size;
      // check profile
      let user = this._authService._userProfile.value;
      var UserList: Array<string> = ['CARE', 'ICICI', 'BAJAJALLIANZ','GODIGIT','HDFC','ADITYABIRLA','FFCOTOKIO'];
      let IsFound:boolean=false;
      UserList.forEach(element => {
        if(user.UserName.toUpperCase().indexOf(element) !== -1){
          IsFound=true;
        }
      });



      if(!IsFound){
        // if(user.IsAdmin){
        let leftmenu:any;

        // To store deep copy of sibar menu
          leftmenu = JSON.parse(JSON.stringify(state.sidenavState.menu))

        leftmenu.push({
          id: 'settings',
          title: 'Settings',
          type: 'basic',
          location: 'sidenav',
          icon: 'mat_outline:settings',
          path: ROUTING_PATH.Basic.setting,
          authKey:[
            "Country-list",
            "State-list",
            "City-list",
            "Branch-list",
            "Designation-list",
            "Role-list",
            "User-list",
            "Source-list",
            "SubSource-list",
            "Category-list",
            "SubCategory-list",
            "Agent-list",
            "Bank-list",
            "Language-list",
            "InsuranceCompany-list",
            "VehicleBrand-list",
            "RTO-list",
            "VehicleModel-list",
            "VehicleSubModel-list",
            "FinancialYear-list",
            "TPPremium-list",
            "Product-list",
            "GroupHead-list",
            "FleetBusiness-list",
            "TeamReference-list",
            "Customer-list",
            "Events-create"
          ]
        });

        /**
 * Display menu as per User role wise If in menu.ts Authkey is given then check user permisiion 
 * if Authkey is blank string then Default add Menu item
 */
       let filterdLeftmenu = leftmenu
          .filter((m) => m.location === 'sidenav' && (m.authKey.filter(element => user.AuthKeys.includes(element))?.length > 0 || m.authKey?.length == 0));

        this.menuItems.next(filterdLeftmenu); //only menu with location as sidenav will come here
      // } else
      // {
      //     /**
      //     * Display menu as per User role wise If in menu.ts Authkey is given then check user permisiion 
      //     * if Authkey is blank string then Default add Menu item
      //     */
      //     this.menuItems.next(state.sidenavState.menu.filter((m) => m.location === 'sidenav' && (user.AuthKeys.includes(m.authKey) || m.authKey == '' ))); //only menu with location as sidenav will come here
      // }

    }
      else
      {
        /**
        * Display menu as per User role wise If in menu.ts Authkey is given then check user permisiion 
        * if Authkey is blank string then Default add Menu item
        */
        this.menuItems.next(state.sidenavState.menu.filter((m) => m.location === 'sidenav' && ((m.authKey.filter(element => user.AuthKeys.includes(element))?.length > 0) || m.authKey?.length == 0) )); //only menu with location as sidenav will come here
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Navigation
    if ('navigation' in changes) {
      // Mark for check
      this._changeDetectorRef.markForCheck();
    }
    this._changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------
}
