import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionCancelDialogComponent } from './transaction-cancel-dialog.component';

describe('TransactionCancelDialogComponent', () => {
  let component: TransactionCancelDialogComponent;
  let fixture: ComponentFixture<TransactionCancelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionCancelDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionCancelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
