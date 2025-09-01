import { Component } from '@angular/core';
import { API_ENDPOINTS } from '@config/api-endpoints.config';
import { ROUTING_PATH } from '@config/routingPath.config';
import { HttpService } from '@lib/services/http/http.service';
import { ScrollBarMessageDto } from '@models/dtos/core/scroll-bar-message-dto';
import { AuthService } from '@services/auth/auth.service';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { ApplicationTypeEnum } from 'src/app/shared/enums';
@Component({
  selector: 'gnx-app-home',
  templateUrl: './app-home.component.html',
  styleUrls: ['./app-home.component.scss']
})
export class AppHomeComponent {


  userName: string = "";
  events: BehaviorSubject<string>;
  events$: Observable<string>;
  eventArray: string[] = [];

  /**
   * constructor
   */
  constructor(private authService: AuthService,
    private httpService: HttpService
  ) {
    //configure no-data message
    this.events = new BehaviorSubject(null);
    this.events$ = this.events.asObservable();

    this.userName = this.authService._userProfile?.value?.FullName;
    this.getEvents();
  }

  // routing
  public get Routing() {
    return ROUTING_PATH
  }


  // getter method For Set Application logo as per Application
  get IsTrothApp() {
    if (this.authService._userProfile.value?.CompanyShortName == ApplicationTypeEnum.Troth) {
      return true;
    }
    else if (this.authService._userProfile.value?.CompanyShortName == ApplicationTypeEnum.Growmore) {
      return false;
    } else {
      return false;
    }
  }


  /***
   * Display Condition for Dashboard menu
   * If user have to access permission to display menu
   */

  get canDisplayBuyNow(): boolean {
    if (this.authService._userProfile.value?.AuthKeys.includes("HealthProposal-create") ||
      this.authService._userProfile.value?.AuthKeys.includes("MotorProposal-create")) {
      return true;
    } else {
      return false;
    }
  }

  get canDisplayQuotation(): boolean {
    if (this.authService._userProfile.value?.AuthKeys.includes("RFQ-list")) {
      return true;
    } else {
      return false;
    }
  }

  get canDisplayOfflineTransaction(): boolean {
    if (this.authService._userProfile.value?.AuthKeys.includes("OfflineTransaction-create")) {
      return true;
    } else {
      return false;
    }
  }
  
  get canDisplayRenewalOfflineTransaction(): boolean {
    if (this.authService._userProfile.value?.AuthKeys.includes("OfflineTransaction-create") ||
      this.authService._userProfile.value?.AuthKeys.includes("RFQ-create")) {
      return true;
    } else {
      return false;
    }
  }

  get getDayTime(): string {
    let currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 12) { return 'Good Morning'; }
    else if (currentHour >= 12 && currentHour < 16) { return 'Good Afternoon'; }
    else if (currentHour >= 16 && currentHour < 21) { return 'Good Evening'; }
    else if (currentHour >= 21 && currentHour < 24) { return 'Good Night'; }
    return 'Good Morning';
  }

  public getEvents() {
    this.httpService.getDataByAPI(API_ENDPOINTS.ScrollBarMessage.Base).subscribe((res) => {
      if (res.Success) {
        let event: ScrollBarMessageDto = res.Data;
        if (event) {
          if (event.Event1) {
            this.eventArray.push(event.Event1);
          }
          if (event.Event2) {
            this.eventArray.push(event.Event2);
          }
          if (event.Event3) {
            this.eventArray.push(event.Event3);
          }
          if (event.Event4) {
            this.eventArray.push(event.Event4);
          }
        }

        this._switchEvents(this.eventArray);
        setInterval(() => {
          this._switchEvents(this.eventArray);
        }, 2500 * this.eventArray.length);
      }
    });
  }

  private _switchEvents(event) {
    for (let i = 0; i <= event.length - 1; i++) {
      setTimeout(() => {
        let evnt = event[i];
        if (evnt) {
          this.events.next(evnt);
        }
      }, 2500 * i);
    }
  }

}