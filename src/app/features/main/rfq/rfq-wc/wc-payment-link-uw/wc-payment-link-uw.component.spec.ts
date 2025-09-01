import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WcPaymentLinkUwComponent } from './wc-payment-link-uw.component';

describe('WcPaymentLinkUwComponent', () => {
  let component: WcPaymentLinkUwComponent;
  let fixture: ComponentFixture<WcPaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WcPaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WcPaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
