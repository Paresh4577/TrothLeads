import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IPageAction } from '@models/common';
import { UserProfile } from '@models/dtos/auth';
import { Subject } from 'rxjs';

@Component({
  selector: 'gnx-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  bookmark = false;
  private destroy$: Subject<any> = new Subject();
  userProfile: UserProfile;
  bookmarkId: number = 0;
  constructor() {
    this.destroy$ = new Subject();
  }

  @Input()
  title: string;

  @Input()
  description: string;

  @Input()
  subtitle: string;

  @Input()
  pageActions: IPageAction[] = [];

  @Output()
  actionEvent = new EventEmitter<string>();

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  actionClick($event: any) {
    this.actionEvent.emit($event.currentTarget.id);
  }
}
