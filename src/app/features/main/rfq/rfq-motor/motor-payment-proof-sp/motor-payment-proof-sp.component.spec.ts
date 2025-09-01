import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorPaymentProofSpComponent } from './motor-payment-proof-sp.component';

describe('MotorPaymentProofSpComponent', () => {
  let component: MotorPaymentProofSpComponent;
  let fixture: ComponentFixture<MotorPaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorPaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorPaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
