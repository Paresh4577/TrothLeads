import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirePaymentProofSpComponent } from './fire-payment-proof-sp.component';

describe('FirePaymentProofSpComponent', () => {
  let component: FirePaymentProofSpComponent;
  let fixture: ComponentFixture<FirePaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FirePaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirePaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
