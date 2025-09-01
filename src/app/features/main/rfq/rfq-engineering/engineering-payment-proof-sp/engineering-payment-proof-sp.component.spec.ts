import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineeringPaymentProofSpComponent } from './engineering-payment-proof-sp.component';

describe('EngineeringPaymentProofSpComponent', () => {
  let component: EngineeringPaymentProofSpComponent;
  let fixture: ComponentFixture<EngineeringPaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngineeringPaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngineeringPaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
