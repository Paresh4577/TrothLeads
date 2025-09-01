import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirePaymentLinkUwComponent } from './fire-payment-link-uw.component';

describe('FirePaymentLinkUwComponent', () => {
  let component: FirePaymentLinkUwComponent;
  let fixture: ComponentFixture<FirePaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FirePaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirePaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
