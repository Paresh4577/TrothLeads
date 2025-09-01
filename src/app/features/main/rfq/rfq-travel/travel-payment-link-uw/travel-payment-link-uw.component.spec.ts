import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TravelPaymentLinkUWComponent } from './travel-payment-link-uw.component';

describe('TravelPaymentLinkUWComponent', () => {
  let component: TravelPaymentLinkUWComponent;
  let fixture: ComponentFixture<TravelPaymentLinkUWComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TravelPaymentLinkUWComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TravelPaymentLinkUWComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
