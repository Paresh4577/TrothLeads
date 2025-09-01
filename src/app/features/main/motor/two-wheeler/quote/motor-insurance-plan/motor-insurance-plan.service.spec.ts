import { TestBed } from '@angular/core/testing';

import { MotorInsurancePlanService } from './motor-insurance-plan..service';

describe('MotorInsurancePlanService', () => {
  let service: MotorInsurancePlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotorInsurancePlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
