import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionCalculationMatrixComponent } from './commission-calculation-matrix.component';

describe('CommissionCalculationMatrixComponent', () => {
  let component: CommissionCalculationMatrixComponent;
  let fixture: ComponentFixture<CommissionCalculationMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommissionCalculationMatrixComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommissionCalculationMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
