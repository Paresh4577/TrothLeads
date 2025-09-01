import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndorsementTransactionListComponent } from './endorsement-transaction-list.component';

describe('EndorsementTransactionListComponent', () => {
  let component: EndorsementTransactionListComponent;
  let fixture: ComponentFixture<EndorsementTransactionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EndorsementTransactionListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndorsementTransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
