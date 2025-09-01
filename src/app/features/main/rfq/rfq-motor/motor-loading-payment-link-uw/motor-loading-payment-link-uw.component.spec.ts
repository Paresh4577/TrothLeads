import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorLoadingPaymentLinkUwComponent } from './motor-loading-payment-link-uw.component';

describe('MotorLoadingPaymentLinkUwComponent', () => {
  let component: MotorLoadingPaymentLinkUwComponent;
  let fixture: ComponentFixture<MotorLoadingPaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorLoadingPaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorLoadingPaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
