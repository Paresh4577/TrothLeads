import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingPaymentLinkComponent } from './loading-payment-link.component';

describe('LoadingPaymentLinkComponent', () => {
  let component: LoadingPaymentLinkComponent;
  let fixture: ComponentFixture<LoadingPaymentLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingPaymentLinkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingPaymentLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
