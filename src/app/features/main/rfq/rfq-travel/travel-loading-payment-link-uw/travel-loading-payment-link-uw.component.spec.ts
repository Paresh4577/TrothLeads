import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelLoadingPaymentLinkUWComponent } from './travel-loading-payment-link-uw.component';

describe('TravelLoadingPaymentLinkUWComponent', () => {
  let component: TravelLoadingPaymentLinkUWComponent;
  let fixture: ComponentFixture<TravelLoadingPaymentLinkUWComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelLoadingPaymentLinkUWComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelLoadingPaymentLinkUWComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
