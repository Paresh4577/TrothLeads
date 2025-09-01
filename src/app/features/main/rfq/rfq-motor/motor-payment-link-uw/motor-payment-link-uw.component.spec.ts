import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorPaymentLinkUwComponent } from './motor-payment-link-uw.component';

describe('MotorPaymentLinkUwComponent', () => {
  let component: MotorPaymentLinkUwComponent;
  let fixture: ComponentFixture<MotorPaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorPaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorPaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
