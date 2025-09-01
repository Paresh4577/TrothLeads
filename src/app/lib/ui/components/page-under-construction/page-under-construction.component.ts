import { Component } from '@angular/core';
import { ROUTING_PATH } from '@config/routingPath.config';

@Component({
  selector: 'gnx-page-under-construction',
  templateUrl: './page-under-construction.component.html',
  styleUrls: ['./page-under-construction.component.scss']
})
export class PageUnderConstructionComponent {


  // routing
  public get Routing() {
    return ROUTING_PATH
  }

}
