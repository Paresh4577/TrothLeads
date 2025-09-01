import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscellaneousPaymentProofSpComponent } from './miscellaneous-payment-proof-sp.component';

describe('MiscellaneousPaymentProofSpComponent', () => {
  let component: MiscellaneousPaymentProofSpComponent;
  let fixture: ComponentFixture<MiscellaneousPaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MiscellaneousPaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiscellaneousPaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
