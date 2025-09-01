import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentLinkComponent } from './payment-link.component';

describe('PaymentLinkComponent', () => {
  let component: PaymentLinkComponent;
  let fixture: ComponentFixture<PaymentLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentLinkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
