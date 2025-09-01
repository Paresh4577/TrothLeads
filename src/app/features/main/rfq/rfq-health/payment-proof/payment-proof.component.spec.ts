import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentProofComponent } from './payment-proof.component';

describe('PaymentProofComponent', () => {
  let component: PaymentProofComponent;
  let fixture: ComponentFixture<PaymentProofComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentProofComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentProofComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
