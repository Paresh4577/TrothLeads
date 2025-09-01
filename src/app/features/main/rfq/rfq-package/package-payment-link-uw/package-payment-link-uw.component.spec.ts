import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagePaymentLinkUwComponent } from './package-payment-link-uw.component';

describe('PackagePaymentLinkUwComponent', () => {
  let component: PackagePaymentLinkUwComponent;
  let fixture: ComponentFixture<PackagePaymentLinkUwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackagePaymentLinkUwComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackagePaymentLinkUwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
