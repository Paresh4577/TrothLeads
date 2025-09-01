import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WcLoadingPaymentLinkUwComponent } from './wc-loading-payment-link-uw.component';

describe('WcLoadingPaymentLinkUwComponent', () => {
  let component: WcLoadingPaymentLinkUwComponent;
  let fixture: ComponentFixture<WcLoadingPaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WcLoadingPaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WcLoadingPaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
