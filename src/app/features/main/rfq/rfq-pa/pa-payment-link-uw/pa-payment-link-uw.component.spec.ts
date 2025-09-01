import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaPaymentLinkUwComponent } from './pa-payment-link-uw.component';

describe('PaPaymentLinkUwComponent', () => {
  let component: PaPaymentLinkUwComponent;
  let fixture: ComponentFixture<PaPaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaPaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaPaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
