import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackagePaymentProofSpComponent } from './package-payment-proof-sp.component';

describe('PackagePaymentProofSpComponent', () => {
  let component: PackagePaymentProofSpComponent;
  let fixture: ComponentFixture<PackagePaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PackagePaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackagePaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
