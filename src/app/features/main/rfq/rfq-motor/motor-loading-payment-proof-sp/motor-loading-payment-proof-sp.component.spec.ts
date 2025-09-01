import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorLoadingPaymentProofSpComponent } from './motor-loading-payment-proof-sp.component';

describe('MotorLoadingPaymentProofSpComponent', () => {
  let component: MotorLoadingPaymentProofSpComponent;
  let fixture: ComponentFixture<MotorLoadingPaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorLoadingPaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorLoadingPaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
