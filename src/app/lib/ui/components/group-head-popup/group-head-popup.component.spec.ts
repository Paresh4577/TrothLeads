import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupHeadPopupComponent } from './group-head-popup.component';

describe('GroupHeadPopupComponent', () => {
  let component: GroupHeadPopupComponent;
  let fixture: ComponentFixture<GroupHeadPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupHeadPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupHeadPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
