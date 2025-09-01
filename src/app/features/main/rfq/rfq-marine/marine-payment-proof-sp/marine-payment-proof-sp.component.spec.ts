import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarinePaymentProofSpComponent } from './marine-payment-proof-sp.component';

describe('MarinePaymentProofSpComponent', () => {
  let component: MarinePaymentProofSpComponent;
  let fixture: ComponentFixture<MarinePaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarinePaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarinePaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
