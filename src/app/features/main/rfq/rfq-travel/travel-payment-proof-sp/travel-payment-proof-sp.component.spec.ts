import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelPaymentProofSPComponent } from './travel-payment-proof-sp.component';

describe('TravelPaymentProofSPComponent', () => {
  let component: TravelPaymentProofSPComponent;
  let fixture: ComponentFixture<TravelPaymentProofSPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelPaymentProofSPComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelPaymentProofSPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
