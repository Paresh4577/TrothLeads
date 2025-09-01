import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotorInsurancePlanComponent } from './motor-insurance-plan.component';

describe('MotorInsurancePlanComponent', () => {
  let component: MotorInsurancePlanComponent;
  let fixture: ComponentFixture<MotorInsurancePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MotorInsurancePlanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MotorInsurancePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
