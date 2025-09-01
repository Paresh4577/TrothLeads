import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecalculateCommissionComponent } from './recalculate-commission.component';

describe('RecalculateCommissionComponent', () => {
  let component: RecalculateCommissionComponent;
  let fixture: ComponentFixture<RecalculateCommissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecalculateCommissionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecalculateCommissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
