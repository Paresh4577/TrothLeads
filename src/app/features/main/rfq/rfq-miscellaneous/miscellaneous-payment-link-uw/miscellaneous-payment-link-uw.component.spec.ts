import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscellaneousPaymentLinkUwComponent } from './miscellaneous-payment-link-uw.component';

describe('MiscellaneousPaymentLinkUwComponent', () => {
  let component: MiscellaneousPaymentLinkUwComponent;
  let fixture: ComponentFixture<MiscellaneousPaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiscellaneousPaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiscellaneousPaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
