import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifePaymentLinkUwComponent } from './life-payment-link-uw.component';

describe('LifePaymentLinkUwComponent', () => {
  let component: LifePaymentLinkUwComponent;
  let fixture: ComponentFixture<LifePaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifePaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifePaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
