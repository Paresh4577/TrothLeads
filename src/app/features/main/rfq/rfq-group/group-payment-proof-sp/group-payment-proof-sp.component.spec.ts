import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupPaymentProofSpComponent } from './group-payment-proof-sp.component';

describe('GroupPaymentProofSpComponent', () => {
  let component: GroupPaymentProofSpComponent;
  let fixture: ComponentFixture<GroupPaymentProofSpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupPaymentProofSpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupPaymentProofSpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
