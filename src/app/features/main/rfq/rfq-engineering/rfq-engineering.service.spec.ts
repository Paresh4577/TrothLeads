import { TestBed } from '@angular/core/testing';

import { RfqEngineeringService } from './rfq-engineering.service';

describe('RfqEngineeringService', () => {
  let service: RfqEngineeringService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfqEngineeringService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
