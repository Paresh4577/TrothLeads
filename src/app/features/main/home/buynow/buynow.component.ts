import { Component } from '@angular/core';
import { ROUTING_PATH } from '@config/routingPath.config';
import { LocalStorageService } from '@lib/services/local-storage.service';
import { AuthService } from '@services/auth/auth.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'gnx-buynow',
  templateUrl: './buynow.component.html',
  styleUrls: ['./buynow.component.scss'],
})
export class BuynowComponent {
  token:string;
  motorRoute:string
  constructor(private ls: LocalStorageService, private _authService: AuthService){
    this.token = this.ls.getItem("token");
    this.motorRoute = environment.MotorPage + 'dashboard'

  }
  
  // routing
  public get Routing() {
    return ROUTING_PATH
  }

  get canDisplayMotor(): boolean {
    if (this._authService._userProfile.value?.AuthKeys.includes("MotorProposal-create")) {
      return true;
    } else {
      return false;
    }
  }
  
  get canDisplayHealth(): boolean {
    if (this._authService._userProfile.value?.AuthKeys.includes("HealthProposal-create")) {
      return true;
    } else {
      return false;
    }
  }
}
