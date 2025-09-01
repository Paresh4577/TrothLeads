import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WcLoadingPaymentProofSpComponent } from './wc-loading-payment-proof-sp.component';

describe('WcLoadingPaymentProofSpComponent', () => {
  let component: WcLoadingPaymentProofSpComponent;
  let fixture: ComponentFixture<WcLoadingPaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WcLoadingPaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WcLoadingPaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
