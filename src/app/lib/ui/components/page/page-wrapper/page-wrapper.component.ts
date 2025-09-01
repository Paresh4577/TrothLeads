import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModeType } from '@models/common/mode.types';

export type RouteData = {
  title?: string,
  mode?: ModeType
}

@Component({
  selector: 'gnx-page-wrapper',
  templateUrl: './page-wrapper.component.html',
  styleUrls: ['./page-wrapper.component.scss']
})
export class PageWrapperComponent {

  @Input() SubmitDisabled : boolean;
  @Output() Submit = new EventEmitter<void>();

  public Mode: ModeType;
  public Title: string;

  constructor(
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    
    // Load Mode and Title from Route
    this._route.data.subscribe((data:RouteData) => {
      this.Mode = data.mode;
      this.Title = data.title
    });

  }

  // submit or save action
  public submit = () => {
    this.Submit.emit()
  }

  public backClicked() {
    if (this.Mode == 'View' || this.Mode == 'Edit') {
      this._router.navigate(['../../'], { relativeTo: this._route })
    } else {
      this._router.navigate(['../'], { relativeTo: this._route })
    }
  }

}
