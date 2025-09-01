import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionEntryComponent } from './transaction-entry.component';

describe('TransactionEntryComponent', () => {
  let component: TransactionEntryComponent;
  let fixture: ComponentFixture<TransactionEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionEntryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
