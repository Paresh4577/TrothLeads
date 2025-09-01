import { Component } from '@angular/core';
import { ROUTING_PATH } from '@config/routingPath.config';

@Component({
  selector: 'gnx-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.scss']
})
export class OptionComponent {

  constructor(
    
  ) {  }
  
  // routing
  public get Routing() {
    return ROUTING_PATH
  }
}
