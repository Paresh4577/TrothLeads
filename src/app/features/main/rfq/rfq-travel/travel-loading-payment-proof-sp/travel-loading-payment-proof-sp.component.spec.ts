import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelLoadingPaymentProofSPComponent } from './travel-loading-payment-proof-sp.component';

describe('TravelLoadingPaymentProofSPComponent', () => {
  let component: TravelLoadingPaymentProofSPComponent;
  let fixture: ComponentFixture<TravelLoadingPaymentProofSPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelLoadingPaymentProofSPComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelLoadingPaymentProofSPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
