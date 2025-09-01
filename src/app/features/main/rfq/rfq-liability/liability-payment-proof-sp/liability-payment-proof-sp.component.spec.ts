import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiabilityPaymentProofSpComponent } from './liability-payment-proof-sp.component';

describe('LiabilityPaymentProofSpComponent', () => {
  let component: LiabilityPaymentProofSpComponent;
  let fixture: ComponentFixture<LiabilityPaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiabilityPaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiabilityPaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
