import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlabCommissionCalculationMatrixListComponent } from './slab-commission-calculation-matrix-list.component';

describe('SlabCommissionCalculationMatrixListComponent', () => {
  let component: SlabCommissionCalculationMatrixListComponent;
  let fixture: ComponentFixture<SlabCommissionCalculationMatrixListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlabCommissionCalculationMatrixListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlabCommissionCalculationMatrixListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
