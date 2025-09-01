import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewalTransactionListComponent } from './renewal-transaction-list.component';

describe('RenewalTransactionListComponent', () => {
  let component: RenewalTransactionListComponent;
  let fixture: ComponentFixture<RenewalTransactionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RenewalTransactionListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RenewalTransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
