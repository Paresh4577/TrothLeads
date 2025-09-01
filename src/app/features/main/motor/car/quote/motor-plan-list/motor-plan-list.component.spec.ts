import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorPlanListComponent } from './motor-plan-list.component';

describe('MotorPlanListComponent', () => {
  let component: MotorPlanListComponent;
  let fixture: ComponentFixture<MotorPlanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorPlanListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorPlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
