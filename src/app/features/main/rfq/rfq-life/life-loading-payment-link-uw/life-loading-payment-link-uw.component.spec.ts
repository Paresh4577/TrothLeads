import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeLoadingPaymentLinkUwComponent } from './life-loading-payment-link-uw.component';

describe('LifeLoadingPaymentLinkUwComponent', () => {
  let component: LifeLoadingPaymentLinkUwComponent;
  let fixture: ComponentFixture<LifeLoadingPaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifeLoadingPaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeLoadingPaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
