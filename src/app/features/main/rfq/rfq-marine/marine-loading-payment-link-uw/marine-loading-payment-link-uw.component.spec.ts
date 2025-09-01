import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarineLoadingPaymentLinkUwComponent } from './marine-loading-payment-link-uw.component';

describe('MarineLoadingPaymentLinkUwComponent', () => {
  let component: MarineLoadingPaymentLinkUwComponent;
  let fixture: ComponentFixture<MarineLoadingPaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarineLoadingPaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarineLoadingPaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
