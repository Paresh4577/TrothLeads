import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiabilityPaymentLinkUwComponent } from './liability-payment-link-uw.component';

describe('LiabilityPaymentLinkUwComponent', () => {
  let component: LiabilityPaymentLinkUwComponent;
  let fixture: ComponentFixture<LiabilityPaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiabilityPaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiabilityPaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
