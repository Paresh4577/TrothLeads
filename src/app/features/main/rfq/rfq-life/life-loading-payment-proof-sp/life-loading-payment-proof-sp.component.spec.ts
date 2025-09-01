import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifeLoadingPaymentProofSpComponent } from './life-loading-payment-proof-sp.component';

describe('LifeLoadingPaymentProofSpComponent', () => {
  let component: LifeLoadingPaymentProofSpComponent;
  let fixture: ComponentFixture<LifeLoadingPaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifeLoadingPaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifeLoadingPaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
