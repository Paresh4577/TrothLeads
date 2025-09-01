import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaPaymentProofSpComponent } from './pa-payment-proof-sp.component';

describe('PaPaymentProofSpComponent', () => {
  let component: PaPaymentProofSpComponent;
  let fixture: ComponentFixture<PaPaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaPaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaPaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
