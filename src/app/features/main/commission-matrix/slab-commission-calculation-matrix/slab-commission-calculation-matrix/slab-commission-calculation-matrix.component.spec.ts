import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlabCommissionCalculationMatrixComponent } from './slab-commission-calculation-matrix.component';

describe('SlabCommissionCalculationMatrixComponent', () => {
  let component: SlabCommissionCalculationMatrixComponent;
  let fixture: ComponentFixture<SlabCommissionCalculationMatrixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlabCommissionCalculationMatrixComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlabCommissionCalculationMatrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
