import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupPaymentLinkUwComponent } from './group-payment-link-uw.component';

describe('GroupPaymentLinkUwComponent', () => {
  let component: GroupPaymentLinkUwComponent;
  let fixture: ComponentFixture<GroupPaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupPaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupPaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
