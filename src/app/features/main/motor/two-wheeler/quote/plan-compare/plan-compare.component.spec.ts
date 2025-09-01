import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanCompareComponent } from './plan-compare.component';

describe('PlanCompareComponent', () => {
  let component: PlanCompareComponent;
  let fixture: ComponentFixture<PlanCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanCompareComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
