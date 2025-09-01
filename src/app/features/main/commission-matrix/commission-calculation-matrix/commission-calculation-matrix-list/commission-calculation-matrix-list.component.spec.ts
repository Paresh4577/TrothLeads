import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionCalculationMatrixListComponent } from './commission-calculation-matrix-list.component';

describe('CommissionCalculationMatrixListComponent', () => {
  let component: CommissionCalculationMatrixListComponent;
  let fixture: ComponentFixture<CommissionCalculationMatrixListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommissionCalculationMatrixListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommissionCalculationMatrixListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
