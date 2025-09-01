import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionHealthComponent } from './transaction-health.component';

describe('TransactionHealthComponent', () => {
  let component: TransactionHealthComponent;
  let fixture: ComponentFixture<TransactionHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionHealthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
