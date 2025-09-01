import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineeringPaymentLinkUwComponent } from './engineering-payment-link-uw.component';

describe('EngineeringPaymentLinkUwComponent', () => {
  let component: EngineeringPaymentLinkUwComponent;
  let fixture: ComponentFixture<EngineeringPaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngineeringPaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngineeringPaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
