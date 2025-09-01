import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarineLoadingPaymentProofSpComponent } from './marine-loading-payment-proof-sp.component';

describe('MarineLoadingPaymentProofSpComponent', () => {
  let component: MarineLoadingPaymentProofSpComponent;
  let fixture: ComponentFixture<MarineLoadingPaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarineLoadingPaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarineLoadingPaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
