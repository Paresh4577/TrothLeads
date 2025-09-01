import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarinePaymentLinkUwComponent } from './marine-payment-link-uw.component';

describe('MarinePaymentLinkUwComponent', () => {
  let component: MarinePaymentLinkUwComponent;
  let fixture: ComponentFixture<MarinePaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarinePaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarinePaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
