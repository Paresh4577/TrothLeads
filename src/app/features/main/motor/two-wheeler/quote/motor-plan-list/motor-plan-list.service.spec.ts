import { TestBed } from '@angular/core/testing';

import { MotorPlanListService } from './motor-plan-list.service';

describe('MotorPlanListService', () => {
  let service: MotorPlanListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotorPlanListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
