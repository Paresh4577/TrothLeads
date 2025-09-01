import { TestBed } from '@angular/core/testing';

import { RfqLiabilityService } from './rfq-liability.service';

describe('RfqLiabilityService', () => {
  let service: RfqLiabilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RfqLiabilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
