import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingPaymentProofComponent } from './loading-payment-proof.component';

describe('LoadingPaymentProofComponent', () => {
  let component: LoadingPaymentProofComponent;
  let fixture: ComponentFixture<LoadingPaymentProofComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingPaymentProofComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingPaymentProofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
