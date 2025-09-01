import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LifePaymentProofSpComponent } from './life-payment-proof-sp.component';

describe('LifePaymentProofSpComponent', () => {
  let component: LifePaymentProofSpComponent;
  let fixture: ComponentFixture<LifePaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LifePaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LifePaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
