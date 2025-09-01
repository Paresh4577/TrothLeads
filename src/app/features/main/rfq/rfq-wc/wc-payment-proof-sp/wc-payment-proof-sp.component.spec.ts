import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WcPaymentProofSpComponent } from './wc-payment-proof-sp.component';

describe('WcPaymentProofSpComponent', () => {
  let component: WcPaymentProofSpComponent;
  let fixture: ComponentFixture<WcPaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WcPaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WcPaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
