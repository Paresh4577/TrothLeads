import { TestBed } from '@angular/core/testing';

import { RfqMotorService } from './rfq-motor.service';

describe('RfqMotorService', () => {
  let service: RfqMotorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfqMotorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
